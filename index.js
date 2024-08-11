const cors = require("cors");
const express = require("express");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:8888"],
  })
);
app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

const port = 8000;
const secret = "mysecret";

let conn = null;

const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "tutorial",
  });
};

const SALT = 16;

app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await conn.query(
      "SELECT * FROM users WHERE email = ?",
      email
    );
    if (rows.length) {
      return res.status(400).send({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, SALT);
    const userData = {
      email,
      password: passwordHash,
    };

    const [result] = await conn.query("INSERT INTO users SET ?", userData);
    res.json({
      message: "insert ok",
      result,
    });
  } catch (err) {
    console.log({ err });
    res.json({
      message: "insert error",
      error: err,
    });
  }
});

app.listen(port, async () => {
  await initMySQL();
  console.log("Server started at port 8000");
});
