import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Import CSS

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <button className="dining-button hub-button" onClick={() => navigate('/thehub')}>
        🍔 The Hub Dining Hall
      </button>
      <button className="dining-button jp-button" onClick={() => navigate('/jp')}>
        🍜 Juniper Hall Dining
      </button>
    </div>
  );
}

export default Home;
