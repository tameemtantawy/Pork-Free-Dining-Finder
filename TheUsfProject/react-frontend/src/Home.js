import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <button onClick={() => navigate('/thehub')}>Go to The Hub</button>
    </div>
  );
}

export default Home;
