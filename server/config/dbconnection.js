'use strict';
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'mydb'
  });
  
  connection.connect(function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected!");
    }
    
    // con.query("CREATE DATABASE mydb", function (err, result) {
    //     if (err) throw err;
    //     console.log("Database created");
    //   });

    // var sql = "CREATE TABLE login_info (user VARCHAR(255), password VARCHAR(255), secret VARCHAR(255))";
    // connection.query(sql, function (err, result) {
    //   if (err) throw err;
    //   console.log("Table created");
    // });
  });

  module.exports = connection;