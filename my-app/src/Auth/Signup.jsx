import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/signup.module.css";
import signup from "../images/signup.png";

const UserSignUp = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordHint, setPasswordHint] = useState(false);

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

  const handleNext = (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (step < 3) setStep((prev) => prev + 1);
  };

  const handleBack = (e) => {
    e.preventDefault();
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
      console.log("Response data:", data); // For debugging

      if (response.ok) {
        setSuccessMessage(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        // IMPROVED ERROR HANDLING FOR EMAIL EXISTS
        // Check all possible formats the backend might return for email exists error
        if (
          // Check if data.email is an array with "already exists" message
          (Array.isArray(data.email) && data.email.some(msg => msg.includes("already exists"))) ||
          // Check if data.email is a string with "already exists" message
          (typeof data.email === "string" && data.email.includes("already exists")) ||
          // Check if data has a message field containing "email already exists"
          (data.message && data.message.toLowerCase().includes("email already exists")) ||
          // Check if data has a detail field containing "email already exists"
          (data.detail && data.detail.toLowerCase().includes("email already exists")) ||
          // Check if data has an error field containing "email already exists"
          (data.error && data.error.toLowerCase().includes("email already exists"))
        ) {
          // Custom UI for email already exists
          return setErrorMessage(
            <div className={styles.emailExistsError}>
              <strong>Email Already Registered!</strong>
              <p>This email address is already in use. Please try logging in instead.</p>
              <button 
                onClick={() => navigate("/login")} 
                className={styles.loginRedirectBtn}
              >
                Go to Login
              </button>
            </div>
          );
        }
        
        // Handle other specific error cases
        if (data.email && typeof data.email === "object") {
          // If email error is an object with keys
          const emailErrors = Object.values(data.email).flat();
          if (emailErrors.some(err => err.toLowerCase().includes("already exists"))) {
            return setErrorMessage(
              <div className={styles.emailExistsError}>
                <strong>Email Already Registered!</strong>
                <p>This email address is already in use. Please try logging in instead.</p>
                <button 
                  onClick={() => navigate("/login")} 
                  className={styles.loginRedirectBtn}
                >
                  Go to Login
                </button>
              </div>
            );
          }
        }
        
        // Other validation errors
        if (typeof data === "object") {
          if (data.email?.includes("Enter a valid email address")) {
            setErrorMessage("Please enter a valid email (e.g. user@gmail.com).");
          } else if (data.password?.includes("This password is too short")) {
            setErrorMessage("Password must be at least 8 characters long.");
          } else if (data.password?.includes("must contain at least")) {
            setErrorMessage("Password must contain uppercase, lowercase, number, and special character.");
          } else if (data.age && +formData.age < 18) {
            setErrorMessage("You must be at least 18 years old to register.");
          } else if (data.age && +formData.age > 75) {
            setErrorMessage("Age must be under 75.");
          } else if (data.height && (+formData.height < 50 || +formData.height > 250)) {
            setErrorMessage("Height should be between 100cm and 250cm.");
          } else if (data.weight && (+formData.weight < 30 || +formData.weight > 250)) {
            setErrorMessage("Weight should be between 30kg and 250kg.");
          } else {
            // Check if any field contains "already exists" message
            const allErrorMessages = Object.values(data).flat().join(" ").toLowerCase();
            if (allErrorMessages.includes("already exists") || allErrorMessages.includes("already registered")) {
              setErrorMessage(
                <div className={styles.emailExistsError}>
                  <strong>Account Already Exists</strong>
                  <p>An account with these details already exists. Please try logging in instead.</p>
                  <button 
                    onClick={() => navigate("/login")} 
                    className={styles.loginRedirectBtn}
                  >
                    Go to Login
                  </button>
                </div>
              );
            } else {
              setErrorMessage("Please check your inputs. Some fields may be invalid.");
            }
          }
        } else {
          setErrorMessage(data.message || "Signup failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      setErrorMessage("A network error occurred. Please try again later.");
    }
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.signupCard}>
        {/* Left Section */}
        <div className={styles.signupLeft}>
          <h2 style={{ color: "white" }}>Welcome!</h2>
          <p>Join us and explore amazing opportunities.</p>
          <img src={signup || "/placeholder.svg"} alt="Sign-Up" style={{ maxWidth: "300px", marginBottom: "20px" }} />
        </div>
        {/* Right Section */}
        <div className={styles.signupRight}>
          <h2>Create Account</h2>
          <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
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
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setPasswordHint(true)}
                    onBlur={() => setPasswordHint(false)}
                    required
                    placeholder="At least 8 chars, mix of A-Z, a-z, 0-9, symbols"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#666"
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </div>
                {passwordHint && (
                  <p className={styles.passwordHint}>
                    Use at least 8 characters including uppercase, lowercase, a number, and a special character.
                  </p>
                )}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className={styles.formColumn}>
                <label htmlFor="diseases">Diseases (If any)</label>
                <input
                  type="text"
                  id="diseases"
                  value={formData.diseases}
                  onChange={handleChange}
                />
                <label htmlFor="allergies">Allergies (If any)</label>
                <input
                  type="text"
                  id="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Step 3 */}
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
                <label htmlFor="height">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="weight">Weight (kg)</label>
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
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
};

export default UserSignUp;