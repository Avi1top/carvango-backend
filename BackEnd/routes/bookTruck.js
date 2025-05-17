// This file defines routes for booking catering services.
// The POST route handles booking submissions, inserts data into the database, generates a PDF, and sends confirmation emails.

const express = require("express");
const router = express.Router();
const doQuery = require("../database/query");
const { sendBookingEmail } = require("./mailer");
const generatePDFBooking = require("./helpFuncs/pdfBookTruck");

router.post("/", async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    dateOfEvent,
    additionalDateOfEvent,
    beginTime,
    endTime,
    addressOfEvent,
    cityState,
    additionalLocationInfo,
    descriptionOfEvent,
    numberOfGuests,
    cateringType,
    heardAboutUs,
  } = req.body;

  try {
    // Insert form data into the database
    const sql = `
      INSERT INTO CateringBookings (
        name, email, phone_number, date_of_event, additional_date_of_event,
        begin_time, end_time, address_of_event, city_state, additional_location_info,
        description_of_event, number_of_guests,  catering_type,
        heard_about_us
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      name,
      email,
      phoneNumber,
      dateOfEvent,
      additionalDateOfEvent,
      beginTime,
      endTime,
      addressOfEvent,
      cityState,
      additionalLocationInfo,
      descriptionOfEvent,
      numberOfGuests,
      cateringType,
      heardAboutUs,
    ];
    await doQuery(sql, params);

    // Fetch the newly inserted row
    const result = await doQuery(
      `SELECT * FROM CateringBookings WHERE id = LAST_INSERT_ID()`
    );
    console.log("Database result:", result); // Log the result

    // Generate PDF
    const pdfData = await generatePDFBooking(result[0]);

    // Send emails
    await sendBookingEmail("alwadiflafel@gmail.com", pdfData);
    await sendBookingEmail(email, pdfData);

    res.status(200).json({ message: "Booking submitted successfully" });
  } catch (error) {
    console.error("Error submitting booking:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
