

const express = require("express");
const app = express();
require("ejs");

const dotenv = require("dotenv");
dotenv.config();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const mongoose = require("mongoose");
const customerRouter = require("./routes/user.route");



const URI = process.env.URI;

mongoose
  .connect(URI)
  .then(() => {
    console.log("Connect to MongoDb");
  })
  .catch((err) => {
    console.log("MongoDb connection error:", err);
  });

// Define customerSchema and customerModel before using them
let customerSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: [true, "Email has been taken, Please choose another one"],
  },
  password: { type: String, required: true },
});

let customerModel = mongoose.model("User", customerSchema);

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
      res.redirect("/dashboard");
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
