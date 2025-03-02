import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/quiz.css';

const questions = {
  easy: [
    {
      question: 'Which vitamin is most abundant in oranges?',
      options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin B12'],
      answer: 'Vitamin C',
      tip: 'Oranges are rich in Vitamin C, boosting immunity.',
    },
    {
      question: 'Which food is known as a good source of dietary fiber?',
      options: ['Bananas', 'White Bread', 'Broccoli', 'Butter'],
      answer: 'Broccoli',
      tip: 'Broccoli is rich in dietary fiber, promoting digestion.',
    },
    {
      question: 'Which nutrient helps build and repair body tissues?',
      options: ['Carbohydrates', 'Fats', 'Proteins', 'Vitamins'],
      answer: 'Proteins',
      tip: 'Proteins are the building blocks of muscles and tissues.',
    },
    {
      question: 'What is the main source of energy for the body?',
      options: ['Carbohydrates', 'Fats', 'Vitamins', 'Minerals'],
      answer: 'Carbohydrates',
      tip: 'Carbohydrates are the body’s primary energy source.',
    },
    {
      question: 'Which fruit is high in potassium?',
      options: ['Apple', 'Banana', 'Grapes', 'Strawberries'],
      answer: 'Banana',
      tip: 'Bananas are packed with potassium, supporting heart health.',
    },
  ],
  medium: [
    {
      question: 'Which food is a good source of healthy fats?',
      options: ['Avocado', 'White Bread', 'Sugar', 'Ice Cream'],
      answer: 'Avocado',
      tip: 'Avocados are rich in heart-healthy monounsaturated fats.',
    },
    {
      question: 'Which vitamin is essential for good eyesight?',
      options: ['Vitamin A', 'Vitamin B12', 'Vitamin D', 'Vitamin E'],
      answer: 'Vitamin A',
      tip: 'Vitamin A supports healthy vision and immune function.',
    },
    {
      question: 'Which mineral helps prevent anemia?',
      options: ['Calcium', 'Iron', 'Zinc', 'Magnesium'],
      answer: 'Iron',
      tip: 'Iron is essential for making red blood cells and preventing anemia.',
    },
    {
      question: 'Which food is a rich source of Omega-3 fatty acids?',
      options: ['Salmon', 'Chicken', 'Cheese', 'Potatoes'],
      answer: 'Salmon',
      tip: 'Salmon is high in Omega-3 fatty acids, supporting brain health.',
    },
    {
      question: 'What type of carbohydrate is found in whole grains?',
      options: ['Simple', 'Complex', 'Refined', 'Sugars'],
      answer: 'Complex',
      tip: 'Whole grains contain complex carbohydrates, providing sustained energy.',
    },
  ],
  hard: [
    {
      question: 'Which mineral is essential for bone health?',
      options: ['Calcium', 'Potassium', 'Iron', 'Zinc'],
      answer: 'Calcium',
      tip: 'Calcium is crucial for strong bones and teeth.',
    },
    {
      question: 'Which vitamin helps with blood clotting?',
      options: ['Vitamin C', 'Vitamin K', 'Vitamin D', 'Vitamin A'],
      answer: 'Vitamin K',
      tip: 'Vitamin K plays a key role in blood clotting and bone health.',
    },
    {
      question: 'Which food is a natural probiotic?',
      options: ['Yogurt', 'Rice', 'Chicken', 'Honey'],
      answer: 'Yogurt',
      tip: 'Yogurt contains probiotics, which support gut health.',
    },
    {
      question: 'Which vitamin is synthesized by the body when exposed to sunlight?',
      options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
      answer: 'Vitamin D',
      tip: 'Vitamin D is known as the "sunshine vitamin" and supports bone health.',
    },
    {
      question: 'Which nutrient is important for maintaining healthy skin?',
      options: ['Vitamin E', 'Vitamin B12', 'Magnesium', 'Zinc'],
      answer: 'Vitamin E',
      tip: 'Vitamin E is a powerful antioxidant that nourishes the skin.',
    },
    {
      question: 'Which food contains high levels of antioxidants?',
      options: ['Blueberries', 'Cheese', 'Bread', 'Eggs'],
      answer: 'Blueberries',
      tip: 'Blueberries are rich in antioxidants, protecting against free radicals.',
    },
    {
      question: 'Which vitamin deficiency causes scurvy?',
      options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
      answer: 'Vitamin C',
      tip: 'Vitamin C deficiency leads to scurvy, causing weakness and bleeding gums.',
    },
    {
      question: 'Which mineral is essential for thyroid function?',
      options: ['Iodine', 'Calcium', 'Magnesium', 'Iron'],
      answer: 'Iodine',
      tip: 'Iodine is vital for the production of thyroid hormones.',
    },
    {
      question: 'Which food is a rich source of folic acid?',
      options: ['Spinach', 'White Bread', 'Fish', 'Chicken'],
      answer: 'Spinach',
      tip: 'Spinach is high in folic acid, important for cell growth and development.',
    },
    {
      question: 'Which type of fat is considered the healthiest?',
      options: ['Trans fat', 'Saturated fat', 'Monounsaturated fat', 'Hydrogenated fat'],
      answer: 'Monounsaturated fat',
      tip: 'Monounsaturated fats, found in avocados and olive oil, are heart-healthy.',
    },
  ],
};

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { difficulty } = location.state;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]); // Track incorrect answers

  const current = questions[difficulty][currentQuestion];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleNext();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleNext = () => {
    if (currentQuestion < questions[difficulty].length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(15);
    } else {
      navigate('/results', {
        state: { 
          score,
          total: questions[difficulty].length,
          incorrectAnswers, // Pass incorrect answers to Results
        },
      });
    }
  };

  const handleAnswer = (option) => {
    if (option === current.answer) {
      setScore((prev) => prev + 1);
    } else {
      setIncorrectAnswers((prev) => [
        ...prev,
        {
          question: current.question,
          userAnswer: option,
          correctAnswer: current.answer,
          tip: current.tip,
        },
      ]);
    }
    handleNext();
  };

  return (
    <div className="quiz-container">
      <h2>Question {currentQuestion + 1}</h2>
      <p className="quiz-question">{current.question}</p>
      <div className="quiz-options">
        {current.options.map((option, index) => (
          <button key={index} className="quiz-option" onClick={() => handleAnswer(option)}>
            {option}
          </button>
        ))}
      </div>
      <p className="quiz-timer">⏳ Time Left: {timeLeft} seconds</p>
    </div>
  );
};

export default Quiz;
