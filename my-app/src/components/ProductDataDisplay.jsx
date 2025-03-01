import React from "react"
import { Paper, Typography, Accordion, AccordionSummary, AccordionDetails, Box, Chip } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

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
  accordion: {
    background: "rgba(224, 242, 241, 0.7)",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  accordionSummary: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    fontSize: "1.1rem",
    color: "#00695c",
  },
  productDetails: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "1rem",
    color: "#004d40",
    marginBottom: "10px",
  },
  nutrientChip: {
    margin: "5px",
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 500,
    backgroundColor: "#e0f2f1",
    color: "#00796b",
  },
}

const ProductDataDisplay = ({ productData, products }) => {
  const calculateNutrientWeight = (nutrientValue = 0, userWeight = 0, productWeight = 100) => {
    return productWeight > 0 ? (nutrientValue * userWeight) / productWeight : 0
  }

  return (
    <Paper elevation={3} style={styles.paper}>
      <Typography variant="h5" gutterBottom style={styles.title}>
        Product Data
      </Typography>
      {Object.entries(productData).map(([name, data]) => (
        <Accordion key={name} style={styles.accordion}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={styles.accordionSummary}>{name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {data.length > 0 ? (
              data.slice(0, 1).map((item, index) => (
                <Box key={index}>
                  <Typography variant="h6" gutterBottom style={styles.productDetails}>
                    Product Details
                  </Typography>
                  <Typography style={styles.productDetails}>
                    Quantity: {item.quantity || "No Quantity Available"}
                  </Typography>
                  <Typography variant="h6" gutterBottom style={styles.productDetails}>
                    Nutriments
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {["carbohydrates", "proteins", "sodium", "sugars"].map((key) => {
                      const nutrientValue = item.nutriments[key] || 0
                      const productWeight = Number.parseFloat(item.quantity) || 100
                      const userWeight = Number.parseFloat(products.find((p) => p.name === name)?.weight || 0)
                      const calculatedValue = calculateNutrientWeight(nutrientValue, userWeight, productWeight)

                      return (
                        <Chip
                          key={key}
                          label={`${key.charAt(0).toUpperCase() + key.slice(1)}: ${calculatedValue.toFixed(2)}g`}
                          style={styles.nutrientChip}
                        />
                      )
                    })}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography style={styles.productDetails}>No data available for this product.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  )
}

export default ProductDataDisplay

