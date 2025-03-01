import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/signup.module.css";
import signup from "../images/signup.png";

const UserSignUp = () => {
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    allergies: "",
    diseases: "",
    city: "",
    
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    setErrorMessage("");
    if (step < 3) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMessage("");
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(true);
        setTimeout(() => {
          navigate("/login"); 
        }, 3000);
      } else {
        setErrorMessage(data.errors || "Sign-up failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      setErrorMessage("An error occurred during sign-up. Please try again.");
    }
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.signupCard}>
        {/* Left Section */}
        <div className={styles.signupLeft}>
          <h2>Welcome!</h2>
          <p>Join us and explore amazing opportunities.</p>
          <img src={signup} alt="Sign-Up" style={{ maxWidth: "300px", marginBottom: "20px" }} />
        </div>
        {/* Right Section */}
        <div className={styles.signupRight}>
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit}>
            {/* Step 1 */}
            {step === 1 && (
              <div className={styles.formColumn}>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="phone_number">Phone</label>
                <input
                  type="text"
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="email">City</label>
                <input
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (

                
                <div className={styles.formColumn}>
                <label htmlFor="city">Diseases (If any)</label>
                <input
                  type="text"
                  id="diseases"
                  value={formData.diseases}
                  onChange={handleChange}
                  
                />
                <label htmlFor="district">Allergies (If any)</label>
                <input
                  type="text"
                  id="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  
                />
                
              </div>
              
            )}

            {/* Step 4 */}
            {step === 3 && (
                            <div className={styles.formColumn}>
                            <label htmlFor="age">Age</label>
                            <input
                              type="number"
                              id="age"
                              value={formData.age}
                              onChange={handleChange}
                              required
                            />
                            <label htmlFor="gender">Gender</label>
                            <select
                              id="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              required
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          
                       
            
                        
                          
                            <label htmlFor="age">Height (cm)</label>
                            <input
                              type="number"
                              id="height"
                              value={formData.height}
                              onChange={handleChange}
                              required
                            />
                            
                            <label htmlFor="age">Weight (kg)</label>
                            <input
                              type="number"
                              id="weight"
                              value={formData.weight}
                              onChange={handleChange}
                              required
                            />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className={styles.buttonGroup}>
              {step > 1 && (
                <button type="button" onClick={handleBack} className={styles.backButton}>
                  Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={handleNext} className={styles.nextButton}>
                  Next
                </button>
              ) : (
                <button type="submit" className={styles.nextButton}>
                  Submit
                </button>
              )}
            </div>
          </form>
          {successMessage && <p className={styles.successMessage}>Sign-up Successful!</p>}
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default UserSignUp;