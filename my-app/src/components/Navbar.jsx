import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import Auth Context
import "../styles/Navbar.css";
import nutrilogo from "../images/eatwell.png";

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth(); // Get login state and logout function

  return (
    <div>
      <div className="navbar">
        <ul>
          <li>
            <Link to="/">
              <img src={nutrilogo} className="logo" alt="Logo" />
            </Link>
          </li>
          <li className="links">
            <Link to="/">Home</Link>
          </li>
          <li className="links">
            <Link to="/details">Scan</Link>
          </li>
          <li className="links">
            <Link to="/chat">Review Section</Link>
          </li>
          <li className="links">
            <Link to="/monthlydiet">Diet Assessment</Link>
          </li>
        </ul>
        <div className="Links">
          {isLoggedIn ? (
            <button className="btn" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/login">
              <button className="btn">Login</button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
