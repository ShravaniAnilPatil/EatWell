import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/login.module.css";
import Loginimg from "../images/Loginimg.png";
import { useAuth } from "../context/AuthContext";
const Login = () => {
  const { login,user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
     console.log("reacheddd")
    if (!email || !password) {
      setErrorMessage("Both email and password are required.");
      return;
    }

    
    const endpoint =  "http://127.0.0.1:8000/api/user/login"
    

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      console.log(response)
      const data = await response.json();
      console.log("data:", data);

      if (response.ok) {
        localStorage.setItem("authToken", data.authToken); 
        console.log("&&&")
        console.log(data.email)
        console.log("***")
        
        login(data.email);
         
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate("/"); 
        }, 3000);
      } else {
        setErrorMessage(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred. Please try again later.");
    }
  };
  return (
    <div className={styles.login}>
      <div className={styles["login-box"]}>
        <div className={styles["left-side"]}>
          <h2>Welcome Back!</h2>
          <p>Log in to continue accessing your account and Schemes.</p>
          <img src={Loginimg} alt="Login" style={{ maxWidth: "300px", marginBottom: "20px" }} />
        </div>
        <div className={styles["right-side"]}>
          <h2>Sign In</h2>
          <form onSubmit={handleLogin}>
            <div className={styles["input-group"]}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles["input-group"]}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className={styles["login-button"]}>
              Sign In
            </button>
          </form>
          {errorMessage && <p className={styles["error-message"]}>{errorMessage}</p>}
          <div className={styles["signup-link"]}>
            <p>
              New user? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className={styles["popup"]}>
          <h2>Login Successful!</h2>
          <p>Redirecting...</p>
        </div>
      )}
    </div>
  );
};

export default Login;