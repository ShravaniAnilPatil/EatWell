import React, { useState, useContext } from 'react'
import '../styles/landing.css'
import landing from '../images/landingimg.png'
import { useAuth } from "../context/AuthContext";
const Landingpage = () => {
   const { user } = useAuth();
   console.log(user)
  return (
    <div >
        <div>
          
            <img src={landing} className="landing" alt="..." />
        </div>
        </div>
  )
}

export default Landingpage;