// controllers/auth.controller.js
require("dotenv").config();
const customerModel = require("../models/user.model");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// ===== Email Transporter =====
function createTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

// ===== Signup Page (optional for SSR) =====
const getSignup = (req, res) => {
  res.render("signup");
};

// ===== Register New User =====
const postRegister = async (req, res) => {
  try {
    const payload = { ...req.body, email: (req.body.email || "").toLowerCase() };

    const salt = await bcrypt.genSalt(10);
    payload.password = await bcrypt.hash(payload.password, salt);

    const newCustomer = new customerModel(payload);
    await newCustomer.save();
    console.log("✅ Customer registered successfully:", newCustomer.email);

    // Send welcome email
    const transporter = createTransporter();
    if (transporter) {
      const mailOptions = {
        from: EMAIL_USER,
        to: payload.email,
        subject: "Welcome to Our Application",
        html: `
          <div style="font-family:Arial; padding:20px;">
            <h2>🎉 Welcome!</h2>
            <p>Your account has been created successfully.</p>
            <p>We're excited to have you onboard 🚀</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error("❌ Email error:", err.message);
        else console.log("📩 Welcome email sent:", info.response);
      });
    }

    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("❌ Error registering user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ===== Sign-in Page (optional) =====
const getSignIn = (req, res) => {
  res.render("signin");
};

// ===== Login User =====
const postLogin = async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase();
    const { password } = req.body;

    const foundCustomer = await customerModel.findOne({ email });
    if (!foundCustomer) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, foundCustomer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Sign JWT (1 hour expiry)
    const token = jwt.sign(
      { id: foundCustomer._id, email: foundCustomer.email },
      JWT_SECRET,
      { expiresIn: "5m" }
    );

    console.log("✅ Login successful:", foundCustomer.email);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: foundCustomer._id,
        firstName: foundCustomer.firstName,
        email: foundCustomer.email,
      },
    });
  } catch (err) {
    console.error("❌ Error logging in:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ===== Protected Dashboard =====
const getDashboard = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ status: false, message: "No token provided" });
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ status: false, message: "Invalid authorization header" });
    }

    try {
      // ✅ Verify token synchronously
      const decoded = jwt.verify(token, JWT_SECRET);

      const foundCustomer = await customerModel.findOne({ email: decoded.email });
      if (!foundCustomer) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      return res.json({ status: true, message: "Token is valid ✅", foundCustomer });
    } catch (verifyErr) {
      if (verifyErr.name === "TokenExpiredError") {
        return res.status(401).json({ status: false, message: "Token expired ⏱" });
      }
      return res.status(401).json({ status: false, message: "Invalid token" });
    }
  } catch (err) {
    console.error("❌ getDashboard error:", err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports = {
  getSignup,
  postRegister,
  getSignIn,
  postLogin,
  getDashboard,
};
