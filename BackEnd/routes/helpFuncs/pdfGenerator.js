const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const doQuery = require("../../database/query");

/**
 * Generates a PDF receipt based on the provided order details.
 * @param {Object} orderDetails - The details of the order to be included in the PDF.
 * @returns {Promise} - A promise that resolves when the PDF is generated.
 */
async function generatePDFReceipt(orderDetails) {
  console.log("Generating PDF...", orderDetails);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    let buffers = [];
    console.log("Generating PDF...");

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData); // Correct usage of resolve
    });

    try {
      // Wait for the tax value to be fetched
      (async () => {
        const taxDB = await doQuery(
          "SELECT value FROM others WHERE name = 'fees'"
        );

        if (!taxDB || taxDB.length === 0) {
          console.error("No tax data found.");
          reject(new Error("No tax data available."));
          return;
        }

        const taxToday = parseFloat(taxDB[0].value).toFixed(2); // Ensure it's a float and formatted
        console.log("taxtoday", taxToday);

        // Register font that supports Hebrew characters
        doc.registerFont(
          "NotoSansHebrew",
          path.join(__dirname, "NotoSansHebrew-VariableFont_wdth,wght.ttf")
        );

        // Header
        doc
          .font("Helvetica-Bold")
          .fontSize(20)
          .text("Order Receipt", { align: "center", underline: true })
          .moveDown(1);

        // Order details
        doc.fontSize(12).font("Helvetica");
        doc
          .text(`Order Number: ${orderDetails.orderNumber}`, {
            continued: true,
          })
          .text(`Date: ${orderDetails.date}`, { align: "right" })
          .moveDown(0.5);
        doc.font("NotoSansHebrew").text(`Name: ${orderDetails.customer.name}`).moveDown(0.5);
        doc.text(`Email: ${orderDetails.customer.email}`).moveDown(0.5);
        doc
          .text(`Phone: ${orderDetails.customer.phone || "N/A"}`)
          .moveDown(0.5);

        // Use NotoSansHebrew font for the address
        doc.font("NotoSansHebrew");
        doc
          .text(`Address: ${orderDetails.customer.address || "N/A"}`)
          .moveDown(1);

        // Items
        doc
          .font("Helvetica-Bold")
          .text("Items:", { underline: true })
          .moveDown(0.5);

        if (!orderDetails.items || !Array.isArray(orderDetails.items)) {
          throw new Error("Invalid order items data.");
        }

        orderDetails.items.forEach((item) => {
          const itemPrice = parseFloat(item.price);

          if (isNaN(itemPrice)) {
            console.warn(`Invalid price for item "${item.name}". Defaulting to $0.00.`);
          }
          const formattedItemPrice = isNaN(itemPrice)
            ? "0.00"
            : itemPrice.toFixed(2);

          doc.font("Helvetica").text(`- ${item.name}: ${item.quantity || 0} x $${formattedItemPrice}`);
          doc.moveDown(0.5);

          if (item.extras && Array.isArray(item.extras) && item.extras.length > 0) {
            item.extras.forEach((extra) => {
              const extraPrice = parseFloat(extra.price);

              if (isNaN(extraPrice)) {
                console.warn(`Invalid price for extra "${extra.name}". Defaulting to $0.00.`);
              }
              const formattedExtraPrice = isNaN(extraPrice)
                ? "0.00"
                : extraPrice.toFixed(2);

              doc.font("Helvetica").text(`   - ${extra.name}: ${extra.quantity} ${extra.unit} ($${formattedExtraPrice})`);
              doc.moveDown(0.3);
            });
          }
        });

        // Summary
        doc.moveDown(1);

        // Calculate original subtotal before discounts
        const originalSubtotal = orderDetails.subtotal

        // Validate and parse summary fields
        const discount = parseFloat(orderDetails.discounts);
        const tax = parseFloat(orderDetails.tax * 100);
        const total = parseFloat(orderDetails.total);

        const formattedOriginalSubtotal = isNaN(originalSubtotal)
          ? "0.00"
          : originalSubtotal.toFixed(2);
        const formattedDiscount = isNaN(discount)
          ? "0.00"
          : discount.toFixed(2);
        const formattedTax = isNaN(tax) ? "0.00" : tax.toFixed(2);
        const formattedTotal = isNaN(total) ? "0.00" : total.toFixed(2);

        const summaryOptions = { align: "right" };
        const boldSummaryOptions = {
          ...summaryOptions,
          font: "Helvetica-Bold",
        };

        doc
          .font("Helvetica-Bold")
          .text(`Original Subtotal: $${formattedOriginalSubtotal}`, summaryOptions)
          .moveDown(0.5);
        doc
          .font("Helvetica")
          .text(`Discount: -${formattedDiscount}%`, summaryOptions)
          .moveDown(0.5);
        doc
          .text(`Tax = ${taxToday*100}%  : $${formattedTax/100}`, summaryOptions)
          .moveDown(0.5);
        doc
          .font("Helvetica-Bold")
          .text(`Total: $${formattedTotal}`, boldSummaryOptions)
          .moveDown(1);

        // Payment details
        doc.text(`Payment Method: ${orderDetails.paymentMethod}`).moveDown(0.5);
        doc.text(`Transaction ID: ${orderDetails.transactionId}`).moveDown(0.5);
       
        // Business contact details
        doc.moveDown(1);
        doc
          .font("Helvetica-Bold")
          .text("Business Contact Details", { align: "center" })
          .moveDown(0.5);
        doc
          .font("Helvetica")
          .text("Business Name: Alwadi Falafel", { align: "center" })
          .moveDown(0.5);
        doc.text("Phone: 615-713-2888", { align: "center" }).moveDown(0.5);
        doc
          .text("Email: alwadiflafel@gmail.com", { align: "center" })
          .moveDown(1);
        // Footer
        doc
          .text("Thank you for your order!", {
            align: "center",
            font: "Helvetica-Bold",
          })
          .moveDown(0.5);

        doc.end();
      })(); // Immediately invoke the async function
    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
}

module.exports = generatePDFReceipt;