import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtTokens } from "../utils/jwt.helpers.js";
const router = express.Router();

router.post("/registration", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userAlreadExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userAlreadExists.rows.length > 0)
      return res.status(400).json({ error: "Такой email уже зарегистрирован" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]

    );
    return res.json({ users: newUser.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (users.rows.length === 0)
      return res.status(401).json({ error: "Email is required" });

    //PASSWORD CHECK
    const validPassword = await bcrypt.compare(
      password,
      users.rows[0].password
    );
    if (!validPassword)
      return res.status(401).json({ error: "Incorrect password" });

    //jwtTokens
    let tokens = jwtTokens(users.rows[0]);
    res.cookie("refresh_token", tokens.refreshToken, { httpOnly: true });
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.get("/refresh_token", (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken === null)
      return res.status(401).json({ error: "Null refresh token" });
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (error, user) => {
        if (error) return res.status(403).json({ error: error.message });
        let tokens = jwtTokens(user);
        res.cookie("refresh_token", tokens.refreshToken, { httpOnly: true });
        res.json(tokens);
      }
    );
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.delete("/refresh_token", (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({ message: "refresh tokem deleted" });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});
export default router;
