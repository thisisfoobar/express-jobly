"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseName } = require("./config");
const password = require("./secretpassword");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseName(),
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Client({
    user: "thisisfoobar",
    host: "localhost",
    database: getDatabaseName(),
    password: password,
    port: 5432,
  });
}

db.connect();

module.exports = db;
