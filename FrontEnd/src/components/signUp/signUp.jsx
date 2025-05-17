import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./signUp.modules.css";

function SignUp() {
  const navigate = useNavigate();
  // State variables
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [streetNumber, setStreetNumber] = useState("");
  const [streets, setStreets] = useState([]);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // State variables for validation
  const [emailValidation, setEmailValidation] = useState({});
  const [passwordValidation, setPasswordValidation] = useState({});
  const [retypePasswordValidation, setRetypePasswordValidation] = useState({});

  // Regular expressions for validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;

  // Validate email format and return validation status and message.
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

  // Validate password strength and return validation status and message.
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

  // Check if the retyped password matches the original password and return validation status.
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

  // Fetch cities data from the API when the component mounts.
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          "https://data.gov.il/api/3/action/datastore_search",
          {
            params: {
              resource_id: "5c78e9fa-c2e2-4771-93ff-7f400a12f7ba",
              limit: 32000,
            },
          }
        );
        const cityNames = response.data.result.records.map((record) =>
          record["שם_ישוב"].trim()
        );
        setCities(cityNames);
      } catch (error) {
        console.error("Error fetching cities data:", error);
      }
    };
    fetchCities();
  }, []);

  // Fetch streets data based on the selected city.
  useEffect(() => {
    const fetchStreets = async () => {
      if (city) {
        try {
          const response = await axios.get(
            "https://data.gov.il/api/3/action/datastore_search",
            {
              params: {
                resource_id: "a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3",
                limit: 32000,
                q: city,
              },
            }
          );
          const streetNames = response.data.result.records.map((record) =>
            record["שם_רחוב"].trim()
          );
          setStreets(streetNames);
        } catch (error) {
          console.error("Error fetching streets data:", error);
        }
      }
    };
    fetchStreets();
  }, [city]);

  // Handle changes to the email input and validate the email.
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailValidation(validateEmail(e.target.value));
  };

  // Handle changes to the password input and validate the password.
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordValidation(validatePassword(e.target.value));
    setRetypePasswordValidation(
      validateRetypePassword(e.target.value, retypePassword)
    );
  };

  // Handle changes to the retype password input and validate it against the original password.
  const handleRetypePasswordChange = (e) => {
    setRetypePassword(e.target.value);
    setRetypePasswordValidation(
      validateRetypePassword(password, e.target.value)
    );
  };

  // Handle changes to the city selection and fetch corresponding streets.
  const handleCityChange = async (e) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
    setStreets([]); // Clear streets when a new city is selected

    try {
      const response = await axios.get(
        "https://data.gov.il/api/3/action/datastore_search",
        {
          params: {
            resource_id: "a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3",
            limit: 32000,
            q: selectedCity,
          },
        }
      );
      const streetNames = response.data.result.records.map((record) =>
        record["שם_רחוב"].trim()
      );
      setStreets(streetNames);
    } catch (error) {
      console.error("Error fetching streets data:", error);
    }
  };

  // Handle changes to the street number input.
  const handleStreetNumberChange = (e) => {
    setStreetNumber(e.target.value);
  };

  // Handle changes to the last name input.
  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };

  // Handle changes to the first name input.
  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  // Handle changes to the phone number input.
  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  // Handle form submission, validate data, and register the user.
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
      city,
      street_number: streetNumber,
      lastName: lastName,
      firstName: firstName,
      phone_number: phoneNumber,
    };
console.log("userData", userData);
    try {
      // First, check if the email already exists
      const checkResponse = await axios.post(
        "http://localhost:3001/register/checkSignup",
        { email, phoneNumber }
      );

      if (checkResponse.status !== 200 || !checkResponse.data.success) {
        setErrorMessage(
          checkResponse.data.message ||
            "An account with this email already exists!!!"
        );
        setTimeout(() => {
          setErrorMessage("");
        }, 3500);
        return;
      }

      // If the email check is successful, proceed to register the user
      const registerResponse = await axios.post(
        "http://localhost:3001/register/add-user",
        userData
      );

      if (registerResponse.status === 200) {
        setSuccessMessage("You have successfully signed up.");
        setTimeout(() => {
          navigate("/logIn");
        }, 1500);
      } else {
        throw new Error("Failed to register the user");
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.status === 409) {
        setErrorMessage("An account with this email already exists!!!");
      } else {
        setErrorMessage(
          "An error occurred during registration. Please try again."
        );
      }
      setTimeout(() => {
        setErrorMessage("");
      }, 3500);
    }
  };

  return (
    <div className="sign-up-container">
      <h2 className="text-center">Sign Up</h2>
      <form onSubmit={handleSubmit} className="sign-up-form">
        <div className="sign-up-form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            required
            name="email"
            className="sign-up-form-control"
          />
          {!emailValidation.status && (
            <span className="sign-up-error-message">
              {emailValidation.text}
            </span>
          )}
        </div>
        <div className="sign-up-form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
            name="password"
            className="sign-up-form-control"
          />
          {!passwordValidation.status && (
            <span className="sign-up-error-message">
              {passwordValidation.text}
            </span>
          )}
        </div>
        <div className="sign-up-form-group">
          <input
            type="password"
            placeholder="Retype Password"
            value={retypePassword}
            onChange={handleRetypePasswordChange}
            required
            name="retype_password"
            className="sign-up-form-control"
          />
          {!retypePasswordValidation.status && (
            <span className="sign-up-error-message">
              {retypePasswordValidation.text}
            </span>
          )}
        </div>
        <div className="sign-up-form-group">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={handleFirstNameChange}
            required
            name="first_name"
            className="sign-up-form-control"
          />
        </div>
        <div className="sign-up-form-group">
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={handleLastNameChange}
            required
            name="last_name"
            className="sign-up-form-control"
          />
        </div>
        <div className="sign-up-form-group">
          <input
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            required
            name="phone_number"
            className="sign-up-form-control"
          />
        </div>
        <div className="sign-up-form-group">
          <select
            value={city}
            onChange={handleCityChange}
            required
            name="city"
            className="sign-up-form-control"
          >
            <option value="">Select City</option>
            {cities.map((cityName, index) => (
              <option key={index} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>
        </div>
        <div className="sign-up-form-group">
          <select
            value={streetNumber}
            onChange={handleStreetNumberChange}
            required
            name="street_number"
            className="sign-up-form-control"
          >
            <option value="">Select Street</option>
            {streets.map((street, index) => (
              <option key={index} value={street}>
                {street}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="sign-up-btn">
          Sign Up
        </button>
        {errorMessage && (
          <p className="sign-up-error-message">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="sign-up-success-message">{successMessage}</p>
        )}
      </form>
    </div>
  );
}

export default SignUp;
