import React, { useState, useEffect } from "react";
import axios from "axios";
import classes from "./bookTruck.module.css";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
const BookTruck = () => {
  // State to hold form data for booking
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    dateOfEvent: "",
    additionalDateOfEvent: "",
    beginTime: "",
    endTime: "",
    addressOfEvent: "",
    cityState: "",
    additionalLocationInfo: "",
    descriptionOfEvent: "",
    numberOfGuests: 1,
    cateringType: "Food Truck Catering",
    heardAboutUs: "Referral",
    otherSource: "",
  });

  // State to hold validation errors
  const [errors, setErrors] = useState({});

  // State to track the last submission time
  const [lastSubmitted, setLastSubmitted] = useState(0);

  // State to hold list of cities and streets
  const [cities, setCities] = useState([]);
  const [streets, setStreets] = useState([]);

  // State to manage loading status
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch cities from the API on component mount
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

  // Fetch streets based on selected city
  useEffect(() => {
    const fetchStreets = async () => {
      if (formData.cityState) {
        try {
          const response = await axios.get(
            "https://data.gov.il/api/3/action/datastore_search",
            {
              params: {
                resource_id: "a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3",
                limit: 32000,
                q: formData.cityState,
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
  }, [formData.cityState]);

  // Handle input changes and validate fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    const currentTime = today.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Update form data
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    console.log("current time:", currentTime);
    // Dynamically set the minimum time if the selected date is today
    if (name === "dateOfEvent" && value === todayString) {
      document
        .querySelector('input[name="beginTime"]')
        .setAttribute("min", currentTime);
      document
        .querySelector('input[name="endTime"]')
        .setAttribute("min", currentTime);
    } else if (name === "beginTime") {
      document
        .querySelector('input[name="endTime"]')
        .setAttribute("min", value); // Set end time to not be earlier than begin time
    }

    validateField(name, value);
  };

  // Validate individual form fields
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const validateField = (name, value) => {
    let errorMsg = "";

    // Get today's date and current time
    const currentTime = today.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    });

    // Get full current date and time for precise comparison
    const currentDateTime = today.getTime();

    // Helper function to get the full datetime for the selected time
    const getFullDateTime = (timeString, dateString) => {
      const [hours, minutes] = timeString.split(":");
      const selectedDate = new Date(dateString);
      selectedDate.setHours(hours, minutes, 0, 0);
      return selectedDate.getTime();
    };

    // Time range validation
    const validateTimeRange = (beginTime, endTime, eventDate) => {
      const beginTimeFull = getFullDateTime(beginTime, eventDate);
      const endTimeFull = getFullDateTime(endTime, eventDate);

      if (beginTimeFull >= endTimeFull) {
        return "End time must be after the start time.";
      }

      return "";
    };

    switch (name) {
      case "name":
        if (!/^[A-Za-z\s]+$/.test(value)) {
          errorMsg = "Name must contain only letters and spaces.";
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMsg = "Please enter a valid email address.";
        }
        break;
      case "phoneNumber":
        if (!/^\+?[0-9]{7,15}$/.test(value)) {
          errorMsg = "Please enter a valid phone number.";
        }
        break;
      case "numberOfGuests":
        if (value <= 0) {
          errorMsg = "Number of guests must be a positive number.";
        }
        break;
      case "beginTime":
      case "endTime":
        if (formData.dateOfEvent === todayString) {
          const selectedTime = getFullDateTime(value, todayString);

          if (selectedTime <= currentDateTime) {
            errorMsg =
              "Begin and End time cannot be the current time or earlier if the event is today.";
          }
        }
        if (formData.beginTime && formData.endTime) {
          errorMsg = validateTimeRange(
            formData.beginTime,
            formData.endTime,
            formData.dateOfEvent
          );
        }
        break;
      default:
        if (value === "") {
          errorMsg = "This field is required.";
        }
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMsg,
    }));

    setTimeout(() => {
      setErrors((prevErrors) => {
        const { [name]: _, ...rest } = prevErrors;
        return rest;
      });
    }, 1500); // Clear error after 1.5 seconds
  };

  // Validate the entire form before submission
  const validateForm = () => {
    const newErrors = {};

    // Validate each form field
    Object.keys(formData).forEach((key) => {
      if (formData[key] === "" && key !== "otherSource") {
        newErrors[key] = "This field is required.";
      }
    });

    // Conditionally validate 'otherSource' only if 'heardAboutUs' is 'Other'
    if (formData.heardAboutUs === "Other" && formData.otherSource === "") {
      newErrors.otherSource =
        "This field is required when 'Other' is selected.";
    }

    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission and send data to the server
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form data before validation:", formData);

    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    formData.heardAboutUs =
      formData.heardAboutUs === "Other"
        ? formData.otherSource
        : formData.heardAboutUs;
    formData.numberOfGuests =
      formData.numberOfGuests === 1 ? 1 : formData.numberOfGuests;
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitted;

    // Prevent submission if it's too soon
    if (timeSinceLastSubmit < 10000) {
      setErrors({ general: "Please wait before submitting again." });
      console.log("Too soon to submit again.");
      return;
    }

    setLoading(true); // Start loading
    try {
      const response = await axios.post("/bookTruck", formData);
      console.log("Form submitted successfully:", response.data);
      alert("Booking submitted successfully!");

      // Reset the form after successful submission
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        dateOfEvent: "",
        additionalDateOfEvent: "",
        beginTime: "",
        endTime: "",
        addressOfEvent: "",
        cityState: "",
        additionalLocationInfo: "",
        descriptionOfEvent: "",
        numberOfGuests: 1,
        cateringType: "Food Truck Catering",
        heardAboutUs: "Referral",
        otherSource: "",
      });
      setErrors({}); // Clear any errors
    } catch (error) {
      console.error("Error submitting booking:", error);
      setErrors({
        general: "Error submitting booking. Please try again later.",
      });
    } finally {
      setLoading(false); // Stop loading
    }

    setLastSubmitted(now);
  };

  // Get today's date for input validation
  const todayDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Get current time for time input validation
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom align="center" style={{ marginTop: "3rem" }}>
        Alwadi Falafel Catering
      </Typography>
      <form onSubmit={handleSubmit} className={classes.formContainer}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
          error={!!errors.name}
          helperText={errors.name}
        />

        <TextField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
          error={!!errors.email}
          helperText={errors.email}
        />

        <TextField
          label="Phone Number"
          type="number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber}
        />

        <TextField
          label="Date of Event"
          type="date"
          name="dateOfEvent"
          value={formData.dateOfEvent}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: todayDate }}
        />

        <TextField
          label="Additional Date of Event"
          type="date"
          name="additionalDateOfEvent"
          value={formData.additionalDateOfEvent}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: todayDate }}
        />

        <TextField
          label="Begin Time"
          type="time"
          name="beginTime"
          value={formData.beginTime}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
          inputProps={{
            min: formData.dateOfEvent === todayString ? currentTime : "00:00",
          }}
        />

        <TextField
          label="End Time"
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
          inputProps={{
            min:
              formData.dateOfEvent === todayString
                ? formData.beginTime || currentTime
                : "00:00",
          }}
        />

        <TextField
          label="Address of Event"
          name="addressOfEvent"
          value={formData.addressOfEvent}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
        />

        <FormControl variant="outlined" fullWidth margin="normal" required>
          <InputLabel>City</InputLabel>
          <Select
            name="cityState"
            value={formData.cityState}
            onChange={handleChange}
            label="City"
            error={!!errors.cityState}
          >
            <MenuItem value="">
              <em>Select a City</em>
            </MenuItem>
            {cities.map((city, index) => (
              <MenuItem key={`${city}-${index}`} value={city}>
                {city}
              </MenuItem>
            ))}
          </Select>
          {errors.cityState && (
            <FormHelperText error>{errors.cityState}</FormHelperText>
          )}
        </FormControl>

        <FormControl variant="outlined" fullWidth margin="normal" required>
          <InputLabel>Street</InputLabel>
          <Select
            name="street"
            value={formData.street}
            onChange={handleChange}
            label="Street"
          >
            <MenuItem value="">
              <em>Select a Street</em>
            </MenuItem>
            {streets.map((street, index) => (
              <MenuItem key={`${street}-${index}`} value={street}>
                {street}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Additional Location Info"
          name="additionalLocationInfo"
          value={formData.additionalLocationInfo}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          multiline
          rows={2}
        />

        <TextField
          label="Description of Event"
          name="descriptionOfEvent"
          value={formData.descriptionOfEvent}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
          multiline
          rows={3}
        />

        <TextField
          label="Number of Guests"
          type="number"
          name="numberOfGuests"
          value={Math.max(1, formData.numberOfGuests)}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          required
          error={!!errors.numberOfGuests}
          helperText={errors.numberOfGuests}
        />

        <FormControl variant="outlined" fullWidth margin="normal">
          <InputLabel>Catering Type</InputLabel>
          <Select
            name="cateringType"
            value={formData.cateringType}
            onChange={handleChange}
            label="Catering Type"
          >
            <MenuItem value="Food Truck Catering">Food Truck Catering</MenuItem>
            <MenuItem value="Catering Only">Catering Only</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" fullWidth margin="normal">
          <InputLabel>Heard About Us</InputLabel>
          <Select
            name="heardAboutUs"
            value={formData.heardAboutUs}
            onChange={handleChange}
            label="Heard About Us"
          >
            <MenuItem value="Referral">Referral</MenuItem>
            <MenuItem value="Social Media">Social Media</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>

        {formData.heardAboutUs === "Other" && (
          <TextField
            label="Please specify"
            name="otherSource"
            value={formData.otherSource}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        )}

        {errors.general && (
          <Typography color="error">{errors.general}</Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          className={classes.submitButton}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Submit Booking"}
        </Button>
      </form>
    </>
  );
};

export default BookTruck;
