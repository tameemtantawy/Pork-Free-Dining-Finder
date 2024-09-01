import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <button onClick={() => navigate('/thehub')}>Go to The Hub</button>
      <button onClick={() => navigate('/jp')}>Go to Juniper Hall</button>
    </div>
  );
}

export default Home;
