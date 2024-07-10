import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from database import SessionLocal, init_db
from models import Food
from allowed_food import scrape_foods
import asyncio
import pytz
from mangum import Mangum
from sqlalchemy.exc import IntegrityError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
handler = Mangum(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_db():
    async with SessionLocal() as session:
        yield session

@app.get("/api/foods")
async def get_foods(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Food))
    foods = result.scalars().all()
    logger.info(f"Retrieved foods: {foods}")
    return {"foods": foods}

@app.post("/api/scrape")
async def scrape_and_save_foods_endpoint(db: AsyncSession = Depends(get_db)):
    await scrape_and_save_foods(db)
    return {"message": "Foods scraped and saved successfully"}

async def scrape_and_save_foods(db: AsyncSession):
    scraped_foods = scrape_foods()
    logger.info(f"Scraped foods: {scraped_foods}")

    # Clear existing foods
    await db.execute(delete(Food))

    # Use a set to keep track of unique food names
    seen_food_names = set()

    # Add new foods
    for restaurant in scraped_foods:
        for food in restaurant['foods']:
            if food['food'] not in seen_food_names:
                seen_food_names.add(food['food'])
                db.add(Food(
                    restaurant_name=restaurant['restaurant'],
                    name=food['food'],
                    contains_pork=food['contains_pork']
                ))

    try:
        await db.commit()
        logger.info("Foods saved successfully")
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"Failed to commit changes to the database: {e}")

async def scrape_and_save_foods_internal():
    async with SessionLocal() as session:
        await scrape_and_save_foods(session)

def scrape_and_save_foods_sync():
    asyncio.run(scrape_and_save_foods_internal())

@app.on_event("startup")
async def on_startup():
    await init_db()
    scheduler = BackgroundScheduler()

    eastern = pytz.timezone('US/Eastern')

    # Schedule the scraper to run at the specified times (Eastern Time)
    scheduler.add_job(scrape_and_save_foods_sync, CronTrigger(day_of_week='mon-fri', hour=7, minute=31, timezone=eastern))
    scheduler.add_job(scrape_and_save_foods_sync, CronTrigger(day_of_week='mon-fri', hour=10, minute=31, timezone=eastern))
    scheduler.add_job(scrape_and_save_foods_sync, CronTrigger(day_of_week='mon-fri', hour=16, minute=31, timezone=eastern))
    scheduler.add_job(scrape_and_save_foods_sync, CronTrigger(day_of_week='sat-sun', hour=10, minute=1, timezone=eastern))
    scheduler.add_job(scrape_and_save_foods_sync, CronTrigger(day_of_week='sat-sun', hour=16, minute=31, timezone=eastern))

    # Start the scheduler
    scheduler.start()
    logger.info("Scheduler started")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
