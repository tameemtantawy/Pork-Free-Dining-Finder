import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Jp.css'; // Make sure you create this CSS file


function Jp() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/api/foodsJP`)
      .then(response => {
        setFoods(response.data.foods);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching the foods:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const groupedFoods = foods.reduce((acc, food) => {
    if (!acc[food.restaurant_name]) {
      acc[food.restaurant_name] = [];
    }
    acc[food.restaurant_name].push(food);
    return acc;
  }, {});

  const scrape = () => {
    axios.post(`${apiUrl}/api/scrapeJP`, {})
      .then(response => {
        console.log('Scraping initiated successfully:', response.data);
      })
      .catch(error => {
        console.error('Error initiating scraping:', error);
      });
  };


  return (
    <div className="App">
      <h1>Juniper Dining Hall</h1>
      <button className="scrape-button" onClick={scrape}>Start Scraping</button>
      {Object.keys(groupedFoods).map((restaurant, index) => (
        <div key={index} className="restaurant-section">
          <h2 className="restaurant-name">{restaurant}</h2>
          <div className="foods-container">
            <div className="foods-section green-section">
              <h3>Does Not Contain Pork</h3>
              <ul>
                {groupedFoods[restaurant].filter(food => !food.contains_pork).map((food, idx) => (
                  <li key={idx}>
                    {food.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="foods-section red-section">
              <h3>Contains Pork</h3>
              <ul>
                {groupedFoods[restaurant].filter(food => food.contains_pork).map((food, idx) => (
                  <li key={idx}>
                    {food.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Jp;
