import React, { useState } from "react"
import { Card, CardContent, Typography, Button, Zoom } from "@mui/material"
import { motion } from "framer-motion"

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
        <Typography variant="h5" gutterBottom>
          Nutritional Quality
        </Typography>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
          <Typography
            variant="h1"
            style={{
              color: getColor(nutriScore),
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            {nutriScore}
          </Typography>
        </motion.div>
        
        <Typography variant="body1" style={{ marginTop: "20px", textAlign: "center" }}>
          {getMessage(nutriScore)}
        </Typography>

      </CardContent>
    </Card>
  )
}

export default NutritionalQualityCard

