import React, { useState } from "react"
import { Card, CardContent, Typography, Button, Zoom } from "@mui/material"
import { color, motion } from "framer-motion"

const NutritionalQualityCard = ({ nutriScore, getMessage }) => {
  const [showDetails, setShowDetails] = useState(false)

  const getColor = (score) => {
    switch (score) {
      case "A":
        return "#1a9641"
      case "B":
        return "#a6d96a"
      case "C":
        return "#fdae61"
      case "D":
      case "E":
        return "#d7191c"
      default:
        return "#767676"
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Nutritional Quality
        </Typography>
        
          <Typography
            variant="h3"
            style={{
              color: getColor(nutriScore),
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            {nutriScore}
          </Typography>
        
        
        <Typography variant="body1" style={{ textAlign: "center" ,color: "#767676" }}>
          {getMessage(nutriScore)}
        </Typography>

      </CardContent>
    </Card>
  )
}

export default NutritionalQualityCard

