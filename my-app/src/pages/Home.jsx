import React from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom'; // Correctly import `useNavigate`
import "../styles/Home.css";
import Landing from '../components/Landing.jsx';
import Course from '../components/Course.jsx';
import a from '../images/prod_analysis.png';
import b from '../images/recommendation.png';
import c from '../images/recycle.png';
import d from '../images/review.png';
import e from '../images/risk.png';
import Aurora from './Aurora';
import SwipeCards from '../components/SwipeCards.jsx';
  

const Home = () => {
  const navigate = useNavigate(); // Move useNavigate here

  const handleNavigation = () => {
    navigate('/game'); // Replace "target-page" with the actual route
  };

  return (
    <div>
       
      <div className="container">
      <SwipeCards />
          
          {/* <Aurora
            colorStops={["#2f524d", "#2f524d", "#a0a09f"]}
            blend={0.5}
            amplitude={0.5}
            speed={0.5}
          /> */}
      </div>
     
      <section id="about">
        <div className='nutri' align='center'>
          <p style={{ fontSize: '2.2rem', color: '#2f524d', fontWeight: 'bolder' }}>About us</p>
          <p style={{ fontSize: '20px', margin: '20px', color: '#2f524d' }}>
            Welcome to NutriCheck, your ultimate destination for comprehensive nutrition and health information. Our mission is to empower individuals to make informed decisions about their diet and overall well-being by providing accurate, reliable, and up-to-date data on a wide range of products.
          </p>
        </div>
      </section>

      <section>
        <div className='game'>
          <h2 style={{ color: 'white' }}>Level Up Your Health: Gamify Your Nutrition Journey!</h2>
          <button onClick={handleNavigation}>Get Started</button>
        </div>
      </section>

      <section>
        <h1 style={{ fontSize: '2.2rem', color: '#2f524d' }}>Features</h1>
        <div className='featurescont'>
          <Course id="co1" imgSrc={a} description="Product Analysis" />
          <Course id="co2" imgSrc={b} description="Recommendations" />
          <Course id="co3" imgSrc={c} description="Sustainability Analysis" />
          <Course id="co4" imgSrc={d} description="Reviews" />
          <Course id="co5" imgSrc={e} description="Health Risk Assessment" />
        </div>
      </section>

      <section>
        <footer className="footer-container" id="contact">
          <div className="footer-content">
            <div className="footer-section">
              <h4>NutriCheck</h4>
              <p>Your trusted partner in nutrition and health.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <p><Link to="/">Home</Link></p>
              <p><Link to="/category">Nutrition</Link></p>
              <p><a href="#about">About</a></p>
              <p><a href="#faq">FAQs</a></p>
              <p><a href="#contact">Contact Us</a></p>
            </div>
            <div className="footer-section">
              <h4>Contact Us</h4>
              <p>Email: info@nutricheck.gmail.com</p>
              <p>Phone: +123 456 7890</p>
              <p>Address: 123 Kasabela Building, Mumbai</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 NutriCheck. All rights reserved.</p>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default Home;
