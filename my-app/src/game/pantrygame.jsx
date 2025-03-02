import React, { useState } from "react"
import Pantry from "./Pantry";
import Timer from "./Timer";
import Pres from "./P-res";
import "../styles/pgame.css"


const Pantrygame = () => {
  const [gameState, setGameState] = useState("start")
  const [selectedProducts, setSelectedProducts] = useState([])
  const [timer, setTimer] = useState(10)

  const startGame = (selectedTime) => {
    setGameState("playing")
    setTimer(selectedTime)
    setSelectedProducts([])
  }

  const endGame = () => {
    setGameState("end")
  }

  return (
    <div className="pan">
      <h1 style={{color: 'white'}}>What's in My Pantry?</h1>
      {gameState === "start" && (
        <div>
          <p>Select items you commonly use or consume daily. Click to start!</p>
          <button onClick={() => startGame(5)}>5 seconds</button>
          <button onClick={() => startGame(10)}>10 seconds</button>
        </div>
      )}
      {gameState === "playing" && (
        <>
          <Timer timer={timer} setTimer={setTimer} endGame={endGame} />
          <Pantry selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} />
        </>
      )}
      {gameState === "end" && <Pres selectedProducts={selectedProducts} />}
    </div>
  )
}

export default Pantrygame

