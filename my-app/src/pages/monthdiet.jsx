import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/quiz.css';

const Home = () => {
  const [difficulty, setDifficulty] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (!difficulty) {
      alert('Please select a difficulty level!');
      return;
    }
    navigate('/quiz', { state: { difficulty } });
  };

  return (
    <div className="home-container">
        <div className='home-content'>
      <h1 style={{ fontSize: '3rem', backgroundColor: 'white', padding: '1rem', borderRadius: '10px', color: '#279213' }}>🍎<br></br> NutriQuiz</h1>
      <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: 'green'}}>Select Your Difficulty Level:</h3>
      <div className="difficulty-buttons">
        <button 
          className={`difficulty-button ${difficulty === 'easy' ? 'selected' : ''}`}
          onClick={() => setDifficulty('easy')}
         
        >
          Easy
        </button>
        <button
          className={`difficulty-button ${difficulty === 'medium' ? 'selected' : ''}`}
          onClick={() => setDifficulty('medium')}
        >
          Medium
        </button>
        <button
          className={`difficulty-button ${difficulty === 'hard' ? 'selected' : ''}`}
          onClick={() => setDifficulty('hard')}
        >
          Hard
        </button>
      </div>
      <button className="start-button" onClick={handleStart}>
        Start Quiz
      </button>
    </div></div>
  );
};

export default Home;
