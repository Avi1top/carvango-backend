// index.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http"); // Import http module
const initWebSocket = require("./webSocket/webSocket"); // Import WebSocket initialization

const app = express();

// Create an HTTP server and pass the Express app to it
const server = http.createServer(app);

// Define routes for the application
const cateringRoutes = require("./routes/catering");
const extrasRoutes = require("./routes/extras");
const menuRoutes = require("./routes/menu");
const registerRoutes = require("./routes/register");
const logInRoutes = require("./routes/login");
const dashboardRoutes = require("./routes/dashboard");
const ordersRoutes = require("./routes/orders");
const dishesRoutes = require("./routes/dishes");
const receiptRoutes = require("./routes/receipt");
const ingredientsRoutes = require("./routes/ingredients");
const bookTruckRoutes = require("./routes/bookTruck");
const workHoursRoutes = require("./routes/workHours");
const checkWorkHoursRouter = require("./routes/checkWorkHours");
const customersRoutes = require("./routes/customers");
const settingsRouter = require("./routes/settings");
const tax = require("./routes/tax");
const forgotPassword = require("./routes/forgotPassword");
const editProfile = require("./routes/editProfile");
const contactUs = require("./routes/contact");
const reviews = require("./routes/reviews");
const main = require("./routes/main");
const maps = require("./routes/findTruck");
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3002",
    credentials: true,
  })
);

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, "../fe/build")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware to log the requested URL
app.use((req, res, next) => {
  console.log(req.url + " url");
  next();
});

// Define application routes
app.use("/catering", cateringRoutes);
app.use("/menu", menuRoutes);
app.use("/register", registerRoutes);
app.use("/extras", extrasRoutes);
app.use("/logIn", logInRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/receipt", receiptRoutes);
app.use("/orders", ordersRoutes);
app.use("/dishes", dishesRoutes);
app.use("/ingredients", ingredientsRoutes);
app.use("/bookTruck", bookTruckRoutes);
app.use("/api", workHoursRoutes);
app.use("/api/checkWorkHours", checkWorkHoursRouter);
app.use("/customers", customersRoutes);
app.use("/settings", settingsRouter);
app.use("/tax", tax);
app.use("/forgotPassword", forgotPassword);
app.use("/editProfile", editProfile);
app.use("/contact", contactUs);
app.use("/reviews", reviews);
app.use("/main", main);
app.use("/maps", maps);
// Fallback route to serve the main HTML file
app.get("*", (req, res) => {
  res.status(404).send("404 Not Found");
});

// Initialize WebSocket by passing the server instance to the function from websocket.js
initWebSocket(server);

// Start the server using the HTTP server instance
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
