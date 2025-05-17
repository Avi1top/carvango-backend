// // database/queries/get-orders.js
// const doQuery = require("../query");

// async function getOrders() {
//   const sql = `
//     SELECT 
//       orders.ID AS orderNumber,
//       orders.date,
//       people.first_name AS customerFirstName,
//       people.last_name AS customerLastName,
//       orders.channel,
//       orders.detailed_price AS total,
//       orders.payment_status AS paymentStatus,
//       orders.order_status AS fulfillmentStatus
//     FROM 
//       orders
//     JOIN 
//       people_orders ON orders.ID = people_orders.order_id
//     JOIN 
//       people ON people_orders.email = people.email
//     ORDER BY 
//       orders.date DESC
//   `;

//   try {
//     const results = await doQuery(sql);
//     return results;
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     throw error;
//   }
// }

// module.exports = { getOrders };
