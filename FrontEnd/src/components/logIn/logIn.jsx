import React, { useState, useContext } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../contexts/session/AuthContext ";
import classes from "./logIn.module.css";

function LogIn() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [emailValidation, setEmailValidation] = useState({});
  const [passwordValidation, setPasswordValidation] = useState({});

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * validateEmail checks if the provided email matches the defined pattern
   * and returns an object indicating the validation status and message.
   */
  const validateEmail = (email) => {
    const validationAnswer = {};
    if (!emailPattern.test(email)) {
      validationAnswer.status = false;
      validationAnswer.text = "Invalid email address";
    } else {
      validationAnswer.status = true;
      validationAnswer.text = "Validation successful";
    }
    return validationAnswer;
  };

  /**
   * handleEmailChange updates the email state and performs validation
   * whenever the email input changes.
   */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailValidation(validateEmail(e.target.value));
  };

  /**
   * handlePasswordChange updates the password state and validates
   * the password length whenever the password input changes.
   */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value.length < 6) {
      setPasswordValidation({
        status: false,
        text: "Password must be at least 6 characters",
      });
    } else {
      setPasswordValidation({ status: true, text: "Validation successful" });
    }
  };

  /**
   * handleSubmit processes the login form submission, sending the email
   * and password to the server and handling the response accordingly.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const toSend = { email, password };

    try {
      const res = await axios.post("http://localhost:3001/logIn", toSend, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setIsAuthenticated(true);
        navigate("/dashboard"); // Navigate to dashboard after successful login
      } else {
        setLoginError(true);
        setTimeout(() => {
          setLoginError(false);
        }, 4000);
      }
    } catch (err) {
      setLoginError(true);
      setTimeout(() => {
        setLoginError(false);
      }, 4000);
    }
    setEmail("");
    setPassword("");
  };

  return (
    <div className={classes.loginContainer}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className={classes.loginForm}>
        <div className={classes.formGroup}>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            required
            placeholder="Email"
            className={classes.formInput}
          />
          {!emailValidation.status && (
            <span className={classes.errorMessage}>{emailValidation.text}</span>
          )}
        </div>
        <div className={classes.formGroup}>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            required
            placeholder="Password"
            className={classes.formInput}
          />
          <Link to="/forgotPassword">Forgot your password?</Link>
          {!passwordValidation.status && (
            <span className={classes.errorMessage}>
              {passwordValidation.text}
            </span>
          )}
        </div>
        <button type="submit" className={classes.submitButton}>
          Login
        </button>
        {loginError && (
          <p className={classes.errorMessage}>
            Error logging in: password or email is incorrect
          </p>
        )}
        <p>
          Don't have an account? <Link to="/signUp">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

export default LogIn;
