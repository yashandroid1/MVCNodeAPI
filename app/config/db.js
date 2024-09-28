const mysql = require("mysql");


const { promisify } = require("util");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});    

connection.connect((err) => {
  if (err) {
    console.log(err.message)
    throw err;
  } else {
    console.log("MySQL Connected");
  }

});
// db.js - Placeholder for your database connection
module.exports = {
    connect: function(){
      console.log("Database connection logic here");
    }
  };
  

// Promisify the query function for async/await usage
connection.query = promisify(connection.query);

module.exports = connection;  