import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TheHub.css'; // Make sure you create this CSS file


function TheHub() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/foods')
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

  return (
    <div className="App">
      <h1>Foods List by Restaurant</h1>
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

export default TheHub;
