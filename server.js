const express = require("express");
const path = require("path");
const { promisify } = require("util");
const dotenv = require("dotenv");
require('dotenv').config();
const db = require('./app/config/db');  // Ensure that the path matches your directory structure.
const app = express();

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

app.get('/' , (req ,res) =>{
    res.send("App Good");
});


// Middleware
app.use(express.json()); // Ensure this middleware is before route definitions
// Routes
const users = require("./app/routes/UsersRoutes");
app.use("/api/battle/", users);


// Start the Server
const PORT = process.env.PORT || 8091;
app.listen(PORT, function () {
    console.log(`Server is Listening on Port ${PORT}`);
});
