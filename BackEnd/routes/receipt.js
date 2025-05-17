// Import necessary modules and initialize the router for receipt handling.
const express = require("express");
const router = express.Router();
const { sendPurchaseReceiptEmail } = require("./mailer"); // Function to send the purchase receipt email.
const generatePDFReceipt = require("./helpFuncs/pdfGenerator"); // Function to generate a PDF receipt from details.

router.post("/send-receipt", async (req, res) => {
  console.log("receipt req body", req.body);
  const receiptDetails = req.body;
  const email = receiptDetails.customer.email;
  console.log("Received request to send receipt:", receiptDetails);

  try {
    // Generate PDF receipt
    const pdfData = await generatePDFReceipt(receiptDetails); // Creates a PDF receipt based on the provided details.

    // Send receipt email
    sendPurchaseReceiptEmail(email, pdfData); // Sends the generated PDF receipt to the customer's email.

    res.status(200).send("Receipt sent");
  } catch (error) {
    console.error("Error processing receipt:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router; // Exports the router for use in other parts of the application.
