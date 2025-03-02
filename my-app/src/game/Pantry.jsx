import React, { useState } from "react"
import "../styles/Game.css"

// Import images
import milkImg from "../images/milk.png"
import breadImg from "../images/bread.png"
import eggsImg from "../images/eggs.png"
import cheeseImg from "../images/cheese.png"
import yoghurtImg from "../images/yoghurt.png"
import cerealImg from "../images/cereal.png"
import pastaImg from "../images/pasta.png"
import riceImg from "../images/rice.png"
import chickenImg from "../images/chicken.png"
import jamImg from "../images/jam.png"
import butterImg from "../images/butter.png"
import flourImg from "../images/flour.png"
import sugarImg from "../images/sugar.png"

const products = [
  { name: "milk", image: milkImg },
  { name: "bread", image: breadImg },
  { name: "eggs", image: eggsImg },
  { name: "cheese", image: cheeseImg },
  { name: "yoghurt", image: yoghurtImg },
  { name: "cereal", image: cerealImg },
  { name: "pasta", image: pastaImg },
  { name: "rice", image: riceImg },
  { name: "chicken", image: chickenImg },
  { name: "jam", image: jamImg },
  { name: "butter", image: butterImg },
  { name: "flour", image: flourImg },
  { name: "sugar", image: sugarImg },
]

const PantryGame = ({ selectedProducts, setSelectedProducts }) => {
  const [availableProducts, setAvailableProducts] = useState(products)

  const handleProductClick = (product) => {
    setSelectedProducts([...selectedProducts, product.name])
    setAvailableProducts(availableProducts.filter((p) => p.name !== product.name))
  }

  return (
    <div className="game-container">
      {availableProducts.map((product) => (
        <div key={product.name} className="product-item" onClick={() => handleProductClick(product)}>
          <img src={product.image || "/placeholder.svg"} alt={product.name} />
          <p>{product.name.replace("_", " ")}</p>
        </div>
      ))}
    </div>
  )
}

export default PantryGame

