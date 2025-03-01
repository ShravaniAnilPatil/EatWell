
import React from 'react';
import './Footer.css';
import Aurora from './Aurora';
import TrueFocus from './TrueFocus';

function Footer() {
    return (
        <div className='footer'>
            <div className='footer_content'>
                {/* Left Section - TrueFocus with Info */}
                <div className='footer_left'>
                    <TrueFocus
                        sentence="True Ingredients"
                        manualMode={false}
                        blurAmount={5}
                        borderColor="rgba(0, 216, 255)"
                        animationDuration={2}
                        pauseBetweenAnimations={0.5}
                    />
                    <p className='footer_info'>
                        Discover the real truth behind ingredients, 
                        ensuring transparency and trust in your products.
                    </p>
                </div>

                {/* Middle Section - Quick Links */}
                <div className='footer_links'>
                    <h3>Quick Links</h3>
                    <div className='footer_link_list'>
                    <ul>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/services">Services</a></li>
                        <li><a href="/faq">FAQs</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                    </div>
                </div>

                {/* Right Section - Contact Info */}
                <div className='footer_contact'>
                    <h3>Contact Us</h3>
                    <p>Email: support@truefocus.com</p>
                    <p>Phone: +1 234 567 890</p>
                    <p>Address: 123 Tech Street, Innovation City</p>
                </div>
            </div>

            {/* Aurora Effect at Bottom */}
            <Aurora
                colorStops={["light-blue", "light-green", "light-blue"]}
                blend={0.5}
                amplitude={6}
                speed={2.0}
            />
        </div>
    );
}

export default Footer;
