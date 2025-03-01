import React, { useState } from "react";
import { color, motion } from "framer-motion";
import "./SwipeCards.css"; // Importing external CSS

import scanhome from '../images/scanhome.png';
import play from '../images/play.png';
import analysis from '../images/analysis.png';

const cardData = [
    {
      title: "Scan a Product",
      description: "Analyze food labels and detect misleading claims.",
      buttonText: "Scan Now",
      color: "#2c485c",
      image: scanhome
    },
    {
      title: "Check Monthly Diet",
      description: "Get insights on your diet and track nutritional intake.",
      buttonText: "Check Now",
      color: "#fbbc22",
      image: analysis
    },
    {
      title: "Play a Game",
      description: "Engage in fun activities to learn about healthy eating.",
      buttonText: "Play Now",
      color: "#ab2459",
      image: play
    },
  ];

const SwipeCards = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="container">
      <div className="card-row">

         {cardData.map((card, index) => (
          <motion.div
            key={index}
            className="card"
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
            <button style={{ width: 120, height: 40, margin: 20 , borderRadius: 10,  backgroundColor: "#fff", color: "#000", fontSize: 16, fontWeight: "bold" }}>{card.buttonText}</button>
            <img style={{ width: 200, height: 200, margin: 20 }} src={card.image} alt="card" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SwipeCards;
