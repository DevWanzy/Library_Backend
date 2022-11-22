var mysql = require("mysql");
require("dotenv").config();
var con = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBDATABASE,
});

con.connect(function (err) {
  if (err) console.log(err);
  console.log("Connected to DB!");
});

module.exports = con;
