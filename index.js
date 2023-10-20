import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.routes.js";
import taskRouter from "./routes/task.routes.js";
import fs from "fs";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 8080;
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
const access_token_secret = generateRandomToken();
const refresh_token_secret = generateRandomToken();
const corsOption = { credential: true, origin: process.env.URL || "*" };

fs.writeFileSync(
  ".env",
  `ACCESS_TOKEN_SECRET=${access_token_secret}\nREFRESH_TOKEN_SECRET=${refresh_token_secret}`
);

const app = express();

app.use(cors(corsOption));
// app.use(json());
app.use(express.json());
app.use(cookieParser());


app.use("/", express.static(join(__dirname, "public")));
app.use("/api/auth", authRouter);
app.use("/api", taskRouter);

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
