import React from "react"
import { Bar } from "react-chartjs-2"
import { Paper, Typography, Box } from "@mui/material"

const styles = {
  paper: {
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "15px",
    boxShadow: "0 8px 32px 0 rgba(0, 121, 107, 0.37)",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(178, 223, 219, 0.18)",
    padding: "30px",
  },
  title: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "1.5rem",
    color: "#00796b",
    marginBottom: "20px",
  },
  subtitle: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    fontSize: "1.2rem",
    color: "#00695c",
    marginTop: "20px",
    marginBottom: "10px",
  },
  nutrientValue: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "1rem",
    color: "#004d40",
    marginBottom: "5px",
  },
}

const NutrientSummary = ({ totals, optimalValues }) => {
  const data = {
    labels: ["Protein", "Carbohydrates", "Sodium", "Sugars"],
    datasets: [
      {
        label: "Actual Intake",
        data: [totals.protein, totals.carbohydrates, totals.sodium, totals.sugars],
        backgroundColor: "rgba(0, 121, 107, 0.6)",
      },
      {
        label: "Optimal Intake",
        data: [optimalValues.protein, optimalValues.carbohydrates, optimalValues.sodium, optimalValues.sugars],
        backgroundColor: "rgba(0, 150, 136, 0.6)",
      },
    ],
  }

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Nutrient Comparison",
        font: {
          size: 18,
          family: "'Poppins', sans-serif",
          weight: 600,
        },
      },
    },
  }

  return (
    <Paper elevation={3} style={styles.paper}>
      <Typography variant="h5" gutterBottom style={styles.title}>
        Nutrient Summary
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Bar data={data} options={options} />
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom style={styles.subtitle}>
          Total Nutrients
        </Typography>
        <Typography style={styles.nutrientValue}>Protein: {totals.protein.toFixed(2)}g</Typography>
        <Typography style={styles.nutrientValue}>Carbohydrates: {totals.carbohydrates.toFixed(2)}g</Typography>
        <Typography style={styles.nutrientValue}>Sodium: {totals.sodium.toFixed(2)}g</Typography>
        <Typography style={styles.nutrientValue}>Sugars: {totals.sugars.toFixed(2)}g</Typography>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom style={styles.subtitle}>
          Optimal Nutrient Intake
        </Typography>
        <Typography style={styles.nutrientValue}>Protein: {optimalValues.protein.toFixed(2)}g</Typography>
        <Typography style={styles.nutrientValue}>Carbohydrates: {optimalValues.carbohydrates.toFixed(2)}g</Typography>
        <Typography style={styles.nutrientValue}>Sodium: {optimalValues.sodium.toFixed(2)}g</Typography>
        <Typography style={styles.nutrientValue}>Sugars: {optimalValues.sugars.toFixed(2)}g</Typography>
      </Box>
    </Paper>
  )
}

export default NutrientSummary

