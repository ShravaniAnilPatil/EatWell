import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Navbar.css'
import nutrilogo from '../images/eatwell.png'

const Navbar = () => {
  return (
    <div>
        <div className="navbar">

           <ul>
            <li ><img src={nutrilogo} className="logo"></img></li>
            <li className="links"><Link to="/">Home</Link></li>
            <li className="links"><Link to="/details">Scan</Link></li>
            <li className="links"><Link to="/chat">Community</Link></li>
            <li className="links"><Link to="/monthlydiet">Diet Assessment</Link></li>
            
            </ul> 
            <div className="Links"><Link to="/login"><button className="btn">Login</button></Link></div>
        </div>
    </div>
  )
}

export default Navbar