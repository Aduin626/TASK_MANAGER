import express from "express";
import pool from "../db.js";
import Controller from "../controller/task.controller.js";
import { authenticateToken } from "../middleware/authorization.js";

const router = express.Router();

router.get("/task", authenticateToken, Controller.getTasks);
router.post("/task-add", authenticateToken, Controller.AddTasks);
router.delete("/task/:id", authenticateToken, Controller.DeleteTasks);
router.put("/task/:id", authenticateToken, Controller.EditTasks);

export default router;
