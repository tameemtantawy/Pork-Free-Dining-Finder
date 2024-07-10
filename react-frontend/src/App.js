import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import TheHub from './TheHub';  // Ensure this path is correct

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/thehub" element={<TheHub />} />
      </Routes>
    </Router>
  );
}

export default App;
