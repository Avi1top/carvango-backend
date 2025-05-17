const express = require("express");
const router = express.Router();
const { sendContactEmail } = require("./mailer"); // Import your mailer function

// Route to handle contact form submission
router.post("/send-contact-email", async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: "alwadiflafel@gmail.com",
    to: "alwadiflafel@gmail.com", // Replace with your admin email
    subject: "New Contact Form Submission",
    text: `You have a new contact form submission from ${name} (${email}):\n\n${message}`,
  };

  try {
    await sendContactEmail(mailOptions);
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).send("Error sending email");
  }
});

module.exports = router;
