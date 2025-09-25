

const express = require("express");
const app = express();
require("ejs");

const dotenv = require("dotenv");
dotenv.config();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const mongoose = require("mongoose");
const customerRouter = require("./routes/user.route");
const customerModel = require("./models/user.model");
const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const URI = process.env.URI;

mongoose
  .connect(URI)
  .then(() => {
    console.log("Connect to MongoDb");
  })
  .catch((err) => {
    console.log("MongoDb connection error:", err);
  });



let allCustomers = [];
app.use("/user", customerRouter);

// Home route redirects to signup
app.get("/", (req, res) => {
  res.redirect("/signup");
});

// Render signup page
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Render login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Register route (not used in forms, but kept for completeness)
app.post("/register", (req, res) => {
  res.send("Confirmed");
});

// Dashboard route
app.get("/dashboard", (req, res) => {
  customerModel
    .find()
    .then((data) => {
      allCustomers = data;
      res.render("index", { allCustomers });
    })
    .catch((err) => {
      console.error("Error fetching customers:", err);
      res.status(500).send("Internal Server Error");
    });
});

// Signup POST route
app.post("/signup", (req, res) => {
  let newCustomer = new customerModel(req.body);
  newCustomer
    .save()
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.error("Error saving customer:", err);
      res.status(500).send("Error saving customer");
    });
});
const port = process.env.PORT || 5101;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
