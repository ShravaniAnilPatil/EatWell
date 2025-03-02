import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/quiz.css';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, incorrectAnswers } = location.state;

  return (
    <div className="results-container">
      <div className='resultscont'>
      <h1 align="left" style={{ fontSize: '1.5em', marginBottom: '20px' }}>🎉 Quiz Results</h1>
      <p align="left" style={{color:'green'}}>You scored {score} / {total}.</p>
      <p align="left" style={{color:'green'}}>
        {score === total
          ? 'Amazing! You know your nutrition well!'
          : 'Keep learning and try again!'}
      </p>

      {incorrectAnswers.length > 0 && (
        <div className="incorrect-answers">
          <h2 align="left" style={{fontSize: '1.5rem'}}>Questions You Got Wrong:</h2>
          {incorrectAnswers.map((item, index) => (
            <div key={index} className="incorrect-answer-card" align="left">
              <p style={{fontSize: '1.2rem', color: 'Black'}}>Question:{item.question}</p>
              <p style={{fontSize: '1.2rem', color: 'Black'}}>Your Answer:{item.userAnswer}</p>
              <p style={{fontSize: '1.2rem', color: 'Black'}}>Correct Answer:{item.correctAnswer}</p>
              <p style={{fontSize: '1.2rem', color: 'orange'}}>Tip:{item.tip}</p>
            </div>
          ))}
        </div>
      )}

      <button className="play-again-button" onClick={() => navigate('/')}>
        Play Again
      </button>
    </div></div>
  );
};

export default Results;
