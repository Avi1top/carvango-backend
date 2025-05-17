import React, { useState, useEffect, useContext } from "react";
import classes from "./CheckoutModal.module.css"; // Ensure the case matches exactly
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import Paypal from "../../contexts/PayPal"; // Import the Paypal component
import { CartContext } from "../../contexts/CartContext"; // Import the CartContext
import { TruckLocationContext } from "../../contexts/TruckLocationContext"; // Import the TruckLocationContext
import io from "socket.io-client"; // Import socket.io-client

const socket = io("http://localhost:3001"); // Replace with your backend server's WebSocket URL

// Initializes the CheckoutModal component with necessary states and context.
const CheckoutModal = ({ onClose, cartItems }) => {
  console.log("Cart items in checkoutmodal:", cartItems);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [streetNumber, setStreetNumber] = useState("");
  const [streets, setStreets] = useState([]);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [oneTimeCode, setOneTimeCode] = useState("");
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between sign-up and sign-in
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState(""); // Add state for delivery method
  const { truckLocations } = useContext(TruckLocationContext); // Access the truck locations from context
  const [addresses, setAddresses] = useState([]); // State to store truck addresses
  const [selectedTruckLocation, setSelectedTruckLocation] = useState(""); // State to store selected truck location
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [sendCodeButton, setSendCodeButton] = useState(true);
  const [step, setStep] = useState(1); // Add state to track the current step
  const { dispatch } = useContext(CartContext); // Access the cart context
  const [phone, setPhone] = useState("");
  // Fetches city names from the API and updates the cities state on component mount.
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

  // Fetches street names based on the selected city and updates the streets state.
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

  // Fetches addresses for truck locations using Google Maps API or local storage as a fallback.
  useEffect(() => {
    const fetchAddresses = async () => {
      let fetchedAddresses = [];

      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();

        for (const location of truckLocations.filter(location => location.isActive)) {
          const { lat, lng } = location;
          try {
            const response = await geocoder.geocode({ location });
            if (response.results[0]) {
              fetchedAddresses.push({
                address: response.results[0].formatted_address,
                location,
              });
            }
          } catch (error) {
            console.error("Geocoder failed due to: ", error);
          }
        }
      } else {
        // Fallback to local storage if Google Maps API is not available
        const storedAddresses = localStorage.getItem("truckAddresses");
        if (storedAddresses) {
          fetchedAddresses = JSON.parse(storedAddresses).filter(address => address.location.active);
        }
      }

      setAddresses(fetchedAddresses);
    };

    fetchAddresses();
  }, [truckLocations]);

  // Checks if the provided email already exists in the system.
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

  // Sends a verification code to the user's email if it exists in the system.
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
      }
    } catch (error) {
      console.error("Error sending code:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Verifies the code entered by the user and updates the state with user details if successful.
  const handleVerifyCode = async () => {
    try {
      const response = await axios.post("/register/verifyCode", {
        email,
        oneTimeCode,
      });
      if (response.status === 200 && response.data.success) {
        setIsCodeVerified(true);
        // Pre-fill user details
        const userDetails = response.data.userDetails;
        setFirstName(userDetails.first_name);
        setLastName(userDetails.last_name);
        setCity(userDetails.city);
        setStreetNumber(userDetails.street_number);
        setPhoneNumber(userDetails.phone_number);
        console.log(userDetails);
        setStep(2); // Move to the next step after verifying code
      } else {
        alert("Invalid code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Handles form submission for sign-up or sign-in, adding a new user if signing up.
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isSignUp) {
        // Check if the email already exists
        const userExists = await checkEmail(email);
        if (userExists) {
          alert("User with this email already exists. Please sign in.");
          return;
        }

        // Proceed with sign-up if the email does not exist
        const response = await axios.post("/register/add-user", {
          email,
          firstName,
          lastName,
          city,
          street_number: streetNumber,
          phone_number: phoneNumber,
        });

        if (response.status === 200) {
          alert("Sign-up successful!");
          setIsSignUp(false); // Redirect to sign-in after successful sign-up
          setIsCodeSent(false); // Reset code sent status
        } else if (response.status === 500) {
          alert("An error occurred during sign-up. Please try again.");
        }
      } else if (isCodeVerified) {
        alert("Details verified!");
        setStep(2); // Move to the delivery method step
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Handles successful payment and emits an orderPlaced event to the backend.
  const handlePaymentSuccess = (orderDetails) => {
    dispatch({ type: "CLEAR_CART" }); // Clear the cart items
    alert(
      "You will receive the receipt in your email. Redirecting to home page..."
    );

    try {
      const response = axios.post("/receipt/send-receipt", orderDetails);

      if (response.status === 200) {
        console.log("Receipt sent successfully");
      } else if (response.status === 400) {
        const { items } = response.data; // Assuming the response contains an outOfStock array
        alert(`Sorry, but some Meals are out of stock: ${items.map(item => item.name).join(", ")}`);
      }
    } catch (error) {
      console.error("Error sending receipt:", error);
      alert("An error occurred. Please try again.");
    }
    // Emit the orderPlaced event with order details to the backend
    socket.emit("orderPlaced", orderDetails);

    navigate("/home"); // Redirect to the home page
  };

  // Updates the delivery method state and resets address fields if the method is pickup.
  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);
    if (method === "pickup") {
      setCity("");
      setStreetNumber("");
    }
  };

  // Fetches the user's phone number based on the provided email.
  const handlePhoneNumber = async () => {
    // Make the function async
    try {
      const response = await axios.get(`/customers/customer-phone/${email}`); // Use template literal for email
      console.log("phoneeee", response.data);
      setPhone(response.data.phone_number); // Set the phone number state
    } catch (error) {
      console.error("Error fetching phone number:", error); // Log the error
      alert("An error occurred while fetching the phone number."); // Alert the user
    }
  };

  // Proceeds to the payment section based on the selected delivery method and location.
  const handleProceedToPayment = () => {
    console.log("Delivery Method:", deliveryMethod);
    console.log("Selected Truck Location:", selectedTruckLocation);
    if (deliveryMethod === "pickup" && selectedTruckLocation) {
      setStep(4); // Move to payment section
    } else if (deliveryMethod === "delivery") {
      setStep(4); // Move to payment section
    } else {
      alert("Please select a location for self-pickup.");
    }
  };

  // Navigates back to the delivery options selection step.
  const handleBackToDeliveryOptions = () => {
    setStep(2); // Go back to delivery method selection
  };

  // Renders the modal with different steps based on the current state and user actions.
  return (
    <div className={classes.modal}>
      <div className={classes.modalContent}>
        {step === 1 && (!isCodeVerified || !isCodeSent) && (
          <>
            <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
            <form onSubmit={handleSubmit} className={classes.form}>
              {!isCodeVerified && (
                <>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    required
                  />
                  {isSignUp && !isCodeVerified && (
                    <>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      >
                        <option value="">Select City</option>
                        {cities.map((cityName, index) => (
                          <option key={index} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                      </select>
                      <select
                        value={streetNumber}
                        onChange={(e) => setStreetNumber(e.target.value)}
                        required
                      >
                        <option value="">Select Street</option>
                        {streets.map((streetName, index) => (
                          <option key={index} value={streetName}>
                            {streetName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </>
                  )}
                  {isCodeSent && (
                    <>
                      <input
                        type="text"
                        placeholder="Enter Code"
                        value={oneTimeCode}
                        onChange={(e) => setOneTimeCode(e.target.value)}
                        required
                      />
                      <button type="button" onClick={handleVerifyCode}>
                        Verify Code
                      </button>
                    </>
                  )}
                  {!isCodeSent && !isSignUp && sendCodeButton && (
                    <button type="button" onClick={handleSendCode}>
                      Send Code
                    </button>
                  )}
                </>
              )}
              {!isCodeSent && isSignUp && (
                <button type="submit">
                  {isSignUp ? "Sign Up" : "Sign In"}
                </button>
              )}
            </form>
          </>
        )}
        {step === 2 && (
          <>
            <div className={classes.deliveryMethod}>
              <h3>Select Delivery Method</h3>
              <div>
                <input
                  type="radio"
                  id="pickup"
                  name="deliveryMethod"
                  value="pickup"
                  onChange={() => handleDeliveryMethodChange("pickup")}
                />
                <label htmlFor="pickup">Self Pick-Up</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="delivery"
                  name="deliveryMethod"
                  value="delivery"
                  onChange={() => handleDeliveryMethodChange("delivery")}
                />
                <label htmlFor="delivery">Delivery</label>
              </div>
              <button
                onClick={() => {
                  setStep(3);
                  handlePhoneNumber();
                }}
              >
                Continue
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <button onClick={handleBackToDeliveryOptions}>Back</button>
            {deliveryMethod === "pickup" && (
              <div className={classes.truckLocations}>
                <h3>Select Pick-Up Location</h3>
                <select
                  value={
                    selectedTruckLocation
                      ? addresses.findIndex(
                          (a) => a.address === selectedTruckLocation.address
                        )
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedTruckLocation(addresses[e.target.value])
                  }
                  required
                >
                  <option value="">Select Location</option>
                  {addresses.map((item, index) => (
                    <option key={index} value={index}>
                      {item.address}
                    </option>
                  ))}
                </select>
                <button onClick={handleProceedToPayment}>
                  Continue to Payment
                </button>
              </div>
            )}
            {deliveryMethod === "delivery" && (
              <div>
                <h3>Delivery Information</h3>
                <p>
                  The address associated with your PayPal account will be used
                  for delivery.
                </p>
                <button onClick={handleProceedToPayment}>
                  Continue to Payment
                </button>
              </div>
            )}
          </>
        )}
        {step === 4 && (
          <>
            {/* {handlePhoneNumber()} */}
            <div className={classes.paypal}>
              <Paypal
                email={email}
                phoneNum={phone}
                cartItems={cartItems}
                onPaymentSuccess={handlePaymentSuccess}
                deliveryOption={
                  deliveryMethod === "pickup"
                    ? selectedTruckLocation.address
                    : "delivery"
                }
              />
            </div>
          </>
        )}
        <button onClick={onClose} className={classes.cancelButton}>
          Cancel
        </button>
        {step === 1 && !isCodeVerified && !isCodeSent && (
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className={classes.toggleButton}
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "New user? Sign Up"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
