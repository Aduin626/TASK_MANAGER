import express from "express";
import pool from "../db.js";

class Controller {
  async getTasks(req, res) {
    try {
      const userId = req.user.id;
      console.log(req.user);

      const tasksList = await pool.query(
        "SELECT * FROM task WHERE user_id = $1",
        [userId]
      );
      return res.json(tasksList.rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async AddTasks(req, res) {
    try {
      const { title, description, deadline } = req.body;
      const userId = req.user.id;

      const splitDate = deadline.split("-");
      const convertedDeadline = `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;
      

      console.log(req.user);
      const tasksAdd = await pool.query(
        "INSERT INTO task (title, description, deadline, date_create, status, user_id) VALUES ($1, $2, $3, CURRENT_DATE, false, $4)",
        [title, description, convertedDeadline, userId]
      );
      return res.json(tasksAdd.rows[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async DeleteTasks(req, res) {
    try {
      const taskId  = req.params.id;
      const userId = req.user.id;

      const tasksDel = await pool.query(
        "DELETE FROM task WHERE id=$1 AND user_id=$2",
        [taskId, userId]
      );
      console.log(req.user);
      console.log(taskId);

      if (tasksDel.rowCount === 0) {
        return res.status(404).json({
          message: `Task with id ${taskId} not found or not associated with user ${userId}`,
        });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async EditTasks(req, res) {
    if (!req.body || !req.user) {
      return res.status(400).json({ message: "Invalid request" });
    }
    try {
      const taskId= req.params.id
      const {title, description, deadline } = req.body;
      const userId = req.user.id;

      const tasksEdit = await pool.query(
        "UPDATE task SET title=$1, description=$2, deadline=$3 WHERE id=$4 AND user_id=$5 RETURNING *",
        [title, description, deadline, taskId, userId]
      );

      if (tasksEdit.rowCount === 0) {
        return res.status(404).json({
          message: `Task with id ${taskId} not found or not associated with user ${userId}`,
        });
      }
      res.json({
        message: `Task with id ${taskId} was updated`,
        task: tasksEdit.rows[0],
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
}

export default new Controller();
