const express = require("express");
const checkUser = require("../database/queries/checkUserLogIn");
const router = express.Router();
const session = require("express-session");
const cors = require("cors");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Apply CORS specifically for this router
router.use(
  cors({
    origin: "http://localhost:3002",
    credentials: true,
  })
);

// Apply session middleware specifically for this router
router.use(
  session({
    secret: "12345667",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: false,
    },
  })
);

// Handles user login by checking credentials and establishing a session.
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const exists = await checkUser(email, password);

    if (exists) {
      console.log("hereeeeeeeeeeeeeeeee")
      req.session.user = { email }; // Store user session
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Fetches the user profile if the user is logged in.
router.get("/profile", (req, res) => {
  try {
    console.log("Fetching user profile");
    if (req.session.user) {
      // Assuming user data is stored in session
      const userEmail = req.session.user.email;
      // Fetch other user data from the database if needed
      res.json({ email: userEmail /* other user data */ });
    } else {
      console.log("User not logged in");
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Logs out the user by destroying the session.
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out");
    }
    res.status(200).send("Logout successful");
  });
});

// Checks if the user is authenticated based on the session.
router.get("/session", (req, res) => {
  if (req.session.user) {
    res.status(200).json({ isAuthenticated: true, user: req.session.user });
  } else {
    res
      .status(401)
      .json({ isAuthenticated: false, message: "Not authenticated" });
  }
});

module.exports = router;
