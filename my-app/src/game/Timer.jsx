import React, { useEffect } from "react"
import "../styles/Game.css"

const Timer = ({ timer, setTimer, endGame }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval)
          endGame()
          return 0
        }
        return prevTimer - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [setTimer, endGame])

  return <div className="timer">Time left: {timer} seconds</div>
}

export default Timer

