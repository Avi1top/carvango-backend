const nodemailer = require("nodemailer");

// Configure your email service and credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "alwadiflafel@gmail.com",
    pass: "rzvn tbml dqpk fhbf",
  },
});



// Sends a purchase receipt email with a PDF attachment to the specified email address.
const sendPurchaseReceiptEmail = (email, pdfData) => {
  console.log({ email }, "senddddddddd");

  const mailOptions = {
    from: "alwadiflafel@gmail.com",
    to: email, // This should be a string, not an object
    subject: "Your Purchase Receipt",
    text: "Please find attached your purchase receipt.",
    attachments: [
      {
        filename: "receipt.pdf",
        content: pdfData,
        contentType: "application/pdf",
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

// Sends a catering booking email with a PDF attachment to the specified email address.
const sendBookingEmail = (email, pdfData) => {
  console.log({ email }, "send booking email");

  const mailOptions = {
    from: "alwadiflafel@gmail.com",
    to: email, // This should be a string, not an object
    subject: "Your Catering Booking",
    text: "Please find attached your catering booking details.",
    attachments: [
      {
        filename: "booking.pdf",
        content: pdfData,
        contentType: "application/pdf",
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
// Function to send a contact email
const sendContactEmail = (mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(error);
      } else {
        console.log("Email sent:", info.response);
        resolve(info);
      }
    });
  });
};

module.exports = {
  sendContactEmail,
  sendPurchaseReceiptEmail,
  sendBookingEmail,
};