const PDFDocument = require("pdfkit");
const path = require("path");

/**
 * Generates a PDF document for booking a truck.
 * @param {Object} bookingDetails - The details of the booking to be included in the PDF.
 * @returns {Promise} - A promise that resolves when the PDF is generated.
 */
const generatePDFBooking = async (bookingDetails) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    let buffers = [];
    console.log("Generating PDF...", bookingDetails);

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Register font that supports Hebrew characters
    doc.registerFont(
      "NotoSansHebrew",
      path.join(__dirname, "NotoSansHebrew-VariableFont_wdth,wght.ttf")
    );

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("Catering Booking Receipt", { align: "center", underline: true })
      .moveDown(1);

    // Booking details
    doc.fontSize(12).font("Helvetica");
    doc
      .text(`Booking ID: ${bookingDetails.id || "N/A"}`, { continued: true })
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" })
      .moveDown(2);
    doc.font("NotoSansHebrew").text(`Name: ${bookingDetails.name}`).moveDown(0.5);
    doc.text(`Email: ${bookingDetails.email}`).moveDown(0.5);
    doc.text(`Phone: ${bookingDetails.phone_number}`).moveDown(2);
    doc
      .text(
        `Date of Event: ${new Date(
          bookingDetails.date_of_event
        ).toLocaleDateString()}`,
        { continued: true }
      )
      .text(
        `End Date of Event: ${
          bookingDetails.additional_date_of_event
            ? new Date(
                bookingDetails.additional_date_of_event
              ).toLocaleDateString()
            : "N/A"
        }`,
        { align: "right" }
      )
      .moveDown(0.5);
    doc
      .text(`Begin Time: ${bookingDetails.begin_time}`, { continued: true })
      .text(`End Time: ${bookingDetails.end_time}`, { align: "right" })
      .moveDown(2);

    // Use NotoSansHebrew font for the address
    doc.font("NotoSansHebrew");
    const reversedAddress = bookingDetails.address_of_event
      .split(" ")
      .reverse()
      .join("  ");
    doc.text(`Address: ${reversedAddress}`).moveDown(0.5);

    const reversedCityState = bookingDetails.city_state
      .split(" ")
      .reverse()
      .join("  ");
    doc.text(`City/State: ${reversedCityState}`).moveDown(0.5);
    doc
      .text(
        `Additional Location Info: ${
          bookingDetails.additional_location_info || "N/A"
        }`
      )
      .moveDown(1);

    // Event Description
    doc
      .font("Helvetica-Bold")
      .text("Event Description:", { underline: true })
      .moveDown(0.5);
    doc.font("Helvetica").text(bookingDetails.description_of_event).moveDown(1);

    // Number of Guests
    doc
      .font("Helvetica-Bold")
      .text(`Number of Guests: ${bookingDetails.number_of_guests}`)
      .moveDown(1);

    // Payment and Catering Details
    doc
      .font("Helvetica-Bold")
      .text("Catering Details:", { underline: true })
      .moveDown(0.5);
   
    doc.text(`Catering Type: ${bookingDetails.catering_type}`).moveDown(0.5);
    doc.text(`Heard About Us: ${bookingDetails.heard_about_us}`).moveDown(1);

    // Footer
    doc
      .font("Helvetica-Bold")
      .text("Thank you for your booking!", { align: "center" })
      .moveDown(0.5);

    doc.end();
  });
};

module.exports = generatePDFBooking;
