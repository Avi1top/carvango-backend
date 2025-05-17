import React, { useState , useEffect} from "react";
import axios from "axios";
import classes from "./ForgotPassword.module.css"; // Adjust path as needed
import { useNavigate } from "react-router-dom";
const ForgotPassword = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [oneTimeCode, setOneTimeCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sendCodeButton, setSendCodeButton] = useState(true);
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setTimeout(() => setErrors({}), 2000);
    }
  }, [errors]);

  // Regular expressions for validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;

  // validateEmail: Checks if the provided email matches the required format and returns validation status.
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

  // validatePassword: Validates the new password against a defined pattern for strength.
  const validatePassword = (password) => {
    const validationAnswer = {};
    if (!passwordPattern.test(password)) {
      validationAnswer.status = false;
      validationAnswer.text =
        "Password must contain at least 8 characters, including uppercase, lowercase, and a number";
    } else {
      validationAnswer.status = true;
      validationAnswer.text = "Validation successful";
    }
    return validationAnswer;
  };

  // validateRetypePassword: Compares the new password and retyped password to ensure they match.
  const validateRetypePassword = (password, retypePassword) => {
    const validationAnswer = {};
    if (password !== retypePassword) {
      validationAnswer.status = false;
      validationAnswer.text = "Passwords do not match";
    } else {
      validationAnswer.status = true;
      validationAnswer.text = "Passwords match";
    }
    return validationAnswer;
  };

  // handleForgotPassword: Handles the submission of the forgot password form and sends a code to the user's email.
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.status) {
      setErrors({ email: emailValidation.text });
      return;
    }

    setIsLoading(true); // Disable button while loading

    try {
      const userExists = await checkEmail(email);
      if (!userExists) {
        setErrors({ email: "Email is not registered." });
        setIsLoading(false);
        return;
      }

      // Send the one-time code
      const response = await handleSendCode();
      if (response.status === 200) {
        setIsCodeSent(true);
        setSuccessMessage("A one-time code has been sent to your email.");
        setTimeout(() => setSuccessMessage(""), 2000); // Clear success message after 2 seconds
      }
    } catch (error) {
      console.error("Error sending code:", error);
      setErrors({ general: "Error sending code. Please try again." });
    } finally {
      setIsLoading(false); // Re-enable button after loading
    }
  };

  // checkEmail: Verifies if the provided email is registered in the system.
  const checkEmail = async (email) => {
    try {
      const response = await axios.post("/register/checkSignup", { email });
      return response.data.userExists;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        return true; // Email already exists
      } else {
        console.error("Error checking email:", error);
        throw error;
      }
    }
  };

  // handleVerifyCode: Sends the one-time code for verification and updates the state based on the response.
  const handleVerifyCode = async () => {
    setIsLoading(true); // Disable button while loading
    try {
      const response = await axios.post("/register/verifyCode", {
        email,
        oneTimeCode,
      });
      if (response.status === 200 && response.data.success) {
        setIsCodeVerified(true);
        setSuccessMessage(
          "Code verified successfully. You can now reset your password."
        );
        setTimeout(() => setSuccessMessage(""), 2000); // Clear success message after 2 seconds
      } else {
        setErrors({ general: "Invalid code. Please try again." });
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setErrors({
        general:
          "An error occurred while verifying the code. Please try again.",
      });
    } finally {
      setIsLoading(false); // Re-enable button after loading
    }
  };

  // handleResetPassword: Validates and submits the new password to reset the user's password.
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    const passwordValidation = validatePassword(newPassword);
    const retypePasswordValidation = validateRetypePassword(
      newPassword,
      retypePassword
    );

    if (!passwordValidation.status) {
      setErrors({ general: passwordValidation.text });
      return;
    }

    if (!retypePasswordValidation.status) {
      setErrors({ general: retypePasswordValidation.text });
      return;
    }

    setIsLoading(true); // Disable button while loading

    try {
      const response = await axios.put("/forgotPassword/update", {
        email,
        newPassword,
      });
      if (response.status === 200) {
        setSuccessMessage("Password reset successfully!");
        setTimeout(() => setSuccessMessage(""), 2000); // Clear success message after 2 seconds
        navigate("/home")
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrors({ general: "Error resetting password. Please try again." });
    } finally {
      setIsLoading(false); // Re-enable button after loading
    }
  };

  // handleSendCode: Sends a one-time code to the user's email for verification.
  const handleSendCode = async () => {
    setSendCodeButton(false);
    try {
      const userExists = await checkEmail(email);
      if (!userExists) {
        alert("Email is not registered. Please sign up first.");
        return;
      }
      const response = await axios.post("/register/sendCode", { email });
      if (response.status === 200) {
        setIsCodeSent(true);
        return response.data;
      }
    } catch (error) {
      console.error("Error sending code:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className={classes.container}>
      <h2>Forgot Password</h2>
      {!isCodeSent ? (
        <form onSubmit={handleForgotPassword} className={classes.form}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={classes.inputField}
          />
          {errors.email && <p className={classes.error}>{errors.email}</p>}
          <button
            type="submit"
            className={classes.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Code"}
          </button>
        </form>
      ) : !isCodeVerified ? (
        <div>
          <input
            type="text"
            placeholder="Enter Code"
            value={oneTimeCode}
            onChange={(e) => setOneTimeCode(e.target.value)}
            className={classes.inputField}
          />
          {errors.general && <p className={classes.error}>{errors.general}</p>}
          <button
            onClick={handleVerifyCode}
            className={classes.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className={classes.form}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={classes.inputField}
          />
          <input
            type="password"
            placeholder="Retype Password"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            className={classes.inputField}
          />
          {errors.general && <p className={classes.error}>{errors.general}</p>}
          <button
            type="submit"
            className={classes.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
      {successMessage && <p className={classes.success}>{successMessage}</p>}
    </div>
  );
};

export default ForgotPassword;
