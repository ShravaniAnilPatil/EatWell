import React, { useState, useEffect } from "react"
import "../styles/Results.css"

const evaluateProteinIntake = (totalProtein) => {
  if (totalProtein < 50) {
    return "Your daily protein intake seems low. Consider adding more protein-rich foods to your diet."
  } else if (totalProtein >= 50 && totalProtein < 100) {
    return "Your daily protein intake is moderate. This might be sufficient depending on your body weight and activity level."
  } else {
    return "Your daily protein intake seems high. This might be good if you're very active or building muscle, but consider consulting a nutritionist for personalized advice."
  }
}

const Results = ({ selectedProducts }) => {
  const [proteinScores, setProteinScores] = useState({})

  useEffect(() => {
    const fetchProteinContent = async (product) => {
      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${product}&search_simple=1&action=process&json=1`,
        )
        const data = await response.json()
        if (data.products && data.products.length > 0) {
          const proteinContent = data.products[0].nutriments.proteins_100g || 0
          setProteinScores((prevScores) => ({
            ...prevScores,
            [product]: proteinContent,
          }))
        }
      } catch (error) {
        console.error(`Error fetching protein content for ${product}:`, error)
      }
    }

    selectedProducts.forEach(fetchProteinContent)
  }, [selectedProducts])

  const totalProteinScore = Object.values(proteinScores).reduce((sum, score) => sum + score, 0)

  return (
    <div className="results">
      <h2>Your Pantry Items:</h2>
      <ul>
        {selectedProducts.map((product) => (
          <li key={product}>
            {product.replace("_", " ")} - Protein: {proteinScores[product]?.toFixed(2) || "Loading..."} g
          </li>
        ))}
      </ul>
      <p>Total Protein Score: {totalProteinScore.toFixed(2)} g</p>
      <p className="evaluation">{evaluateProteinIntake(totalProteinScore)}</p>
    </div>
  )
}

export default Results

