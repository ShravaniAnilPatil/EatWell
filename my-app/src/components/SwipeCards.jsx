import React, { useState } from "react";
import { color, motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 
import "./SwipeCards.css"; // Importing external CSS

import scanhome from '../images/scanhome.png';
import diet from '../images/diet.png';
import rating from '../images/rating.png';
import analysis from '../images/analysis.png';

const cardData = [
    {
      title: "Scan a Product",
      description: "Analyze food labels and detect misleading claims.",
      buttonText: "Scan Now",
      color: "#2c485c",
      image: scanhome,
      path: "./details" 
    },
    {
      title: "Check Monthly Diet",
      description: "Get insights on your diet and track nutritional intake.",
      buttonText: "Check Now",
      color: "#fbbc22",
      image: diet,
      path: "./monthlydiet"
    },
    {
      title: "Peer Reviews",
      description: "Get peer reviews about the products you consume.",
      buttonText: "Review Now",
      color: "#ab2459",
      image: rating,
      path: "./chat"
    },
  ];

const SwipeCards = () => {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  return (
    <div className="containerswipe">
      <div className="card-rows">

         {cardData.map((card, index) => (
          <motion.div
            key={index}
            className="card-swipe"
            style={{ backgroundColor: card.color }}
            initial={{ width: 500 }}
            animate={{
              width: selected === index ? 600 : selected === null ? 500 : 440,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onMouseEnter={() => setSelected(index)}
            onMouseLeave={() => setSelected(null)}
            onClick={() => setSelected(index)}
          >
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <button style={{ width: 140, height: 40, margin: 20 , borderRadius: 10,  backgroundColor: "#fff", color: "#000", fontSize: 14, fontWeight: "bold" }} onClick={(e) => {
                e.stopPropagation(); // Prevent parent div click event
                navigate(card.path); // Navigate to the specified path
              }}>{card.buttonText}</button>
            <img style={{ width: 200, height: 200, margin: 20 }} src={card.image} alt="card" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SwipeCards;
