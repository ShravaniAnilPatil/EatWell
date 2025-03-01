import React, { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { motion } from "framer-motion"
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  IconButton,
  Chip,
  CircularProgress,
  Snackbar,
} from "@mui/material"
import { Add, Delete } from "@mui/icons-material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import NutrientSummary from "../components/NutrientSummary"
import ProductDataDisplay from "../components/ProductDataDisplay"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const theme = createTheme({
  palette: {
    primary: {
      main: "#00796b",
    },
    secondary: {
      main: "#004d40",
    },
  },
})

const styles = {
  container: {
    background: "linear-gradient(120deg, #e0f2f1 0%, #b2dfdb 100%)",
    minHeight: "100vh",
    padding: "40px 0",
  },
  title: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: "3rem",
    color: "#00796b",
    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "30px",
  },
  paper: {
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "15px",
    boxShadow: "0 8px 32px 0 rgba(0, 121, 107, 0.37)",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(178, 223, 219, 0.18)",
    padding: "30px",
    marginBottom: "30px",
  },
  addProductTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "1.5rem",
    color: "#00796b",
    marginBottom: "20px",
  },
  productInput: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  },
  textField: {
    marginRight: "15px",
    flex: 1,
  },
  deleteButton: {
    color: "#e57373",
  },
  addButton: {
    marginTop: "15px",
    background: "linear-gradient(45deg, #00796b 30%, #009688 90%)",
    border: 0,
    borderRadius: "3px",
    boxShadow: "0 3px 5px 2px rgba(0, 121, 107, .3)",
    color: "white",
    height: "48px",
    padding: "0 30px",
  },
  fetchButton: {
    background: "linear-gradient(45deg, #004d40 30%, #00695c 90%)",
    border: 0,
    borderRadius: "3px",
    boxShadow: "0 3px 5px 2px rgba(0, 77, 64, .3)",
    color: "white",
    height: "48px",
    padding: "0 30px",
  },
}

function MonthlyDiet() {
  const [products, setProducts] = useState([{ name: "", weight: "" }])
  const [productData, setProductData] = useState({})
  const { user } = useAuth()
  const [totals, setTotals] = useState({
    protein: 0,
    carbohydrates: 0,
    sodium: 0,
    sugars: 0,
  })
  const [optimalValues, setOptimalValues] = useState({
    protein: 0,
    carbohydrates: 0,
    sodium: 0,
    sugars: 0,
  })
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "" })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const url = `http://127.0.0.1:8000/api/user/profile/${user}`
      const response = await axios.get(url)
      const { weight, height } = response.data.data
      const bmi = weight / (height / 100) ** 2
      setOptimalValues(calculateOptimalNutrients(bmi, weight))
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setSnackbar({ open: true, message: "Error fetching user profile" })
    }
  }

  const handleAddProduct = () => {
    setProducts([...products, { name: "", weight: "" }])
  }

  const handleRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index)
    setProducts(updatedProducts)
  }

  const handleChange = (index, field, value) => {
    const updatedProducts = [...products]
    updatedProducts[index][field] = value
    setProducts(updatedProducts)
  }

  const calculateOptimalNutrients = (bmi, weight) => {
    let calories = 0
    if (bmi < 18.5) {
      calories = 2500
    } else if (bmi < 24.9) {
      calories = 2000
    } else if (bmi < 29.9) {
      calories = 1800
    } else {
      calories = 1500
    }

    const carbs = (calories * 0.55) / 4
    const protein = 0.8 * weight
    const sodium = 2300 / 1000
    const sugars = 25

    return {
      carbohydrates: carbs,
      protein: protein,
      sodium: sodium,
      sugars: sugars,
    }
  }

  const fetchProductData = async (productName) => {
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${productName}&search_simple=1&action=process&json=1`
      const response = await axios.get(url)
      if (response.status === 200) {
        const data = response.data
        return data.products || []
      } else {
        console.error("Error fetching data for:", productName)
        return []
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      return []
    }
  }

  const handleFetchData = async () => {
    setLoading(true)
    const fetchedData = {}
    let totalProtein = 0
    let totalCarbohydrates = 0
    let totalSodium = 0
    let totalSugars = 0

    for (const product of products) {
      if (product.name) {
        const data = await fetchProductData(product.name)
        fetchedData[product.name] = data

        data.forEach((item) => {
          if (item.nutriments) {
            const productWeight = Number.parseFloat(item.quantity) || 100
            const userWeight = Number.parseFloat(product.weight) || 0

            totalProtein += calculateNutrientWeight(item.nutriments.proteins, userWeight, productWeight)
            totalCarbohydrates += calculateNutrientWeight(item.nutriments.carbohydrates, userWeight, productWeight)
            totalSodium += calculateNutrientWeight(item.nutriments.sodium, userWeight, productWeight)
            totalSugars += calculateNutrientWeight(item.nutriments.sugars, userWeight, productWeight)
          }
        })
      }
    }

    setProductData(fetchedData)
    setTotals({
      protein: totalProtein,
      carbohydrates: totalCarbohydrates,
      sodium: totalSodium,
      sugars: totalSugars,
    })
    setLoading(false)
    setSnackbar({ open: true, message: "Product data fetched successfully" })
  }

  const calculateNutrientWeight = (nutrientValue = 0, userWeight = 0, productWeight = 100) => {
    return productWeight > 0 ? (nutrientValue * userWeight) / productWeight : 0
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={styles.container}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h2" align="center" gutterBottom style={styles.title}>
              Monthly Diet Plan
            </Typography>
          </motion.div>

          <Paper elevation={3} style={styles.paper}>
            <Typography variant="h5" gutterBottom style={styles.addProductTitle}>
              Add Products
            </Typography>
            {products.map((product, index) => (
              <Box key={index} style={styles.productInput}>
                <TextField
                  label="Product Name"
                  variant="outlined"
                  value={product.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  style={styles.textField}
                  color="primary"
                />
                <TextField
                  label="Weight (g)"
                  type="number"
                  variant="outlined"
                  value={product.weight}
                  onChange={(e) => handleChange(index, "weight", e.target.value)}
                  style={{ ...styles.textField, width: "150px" }}
                  color="primary"
                />
                <IconButton onClick={() => handleRemoveProduct(index)} style={styles.deleteButton}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button variant="contained" startIcon={<Add />} onClick={handleAddProduct} style={styles.addButton}>
              Add Product
            </Button>
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleFetchData}
              disabled={loading}
              size="large"
              style={styles.fetchButton}
            >
              {loading ? <CircularProgress size={24} /> : "Fetch Product Data"}
            </Button>
          </Box>

          {Object.keys(productData).length > 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ProductDataDisplay productData={productData} products={products} />
              </Grid>
              <Grid item xs={12} md={6}>
                <NutrientSummary totals={totals} optimalValues={optimalValues} />
              </Grid>
            </Grid>
          )}

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            message={snackbar.message}
          />
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default MonthlyDiet
