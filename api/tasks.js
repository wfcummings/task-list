import express from "express";
const router = express.Router();
export default router;

import { createTask, deleteTaskById, updateTaskById } from "#db/queries/tasks";
import { getTasksByUserId, getTaskById } from "#db/queries/tasks";

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

router.use(requireUser);

//Get all tasks by user id
router.get("/", async (req, res) => {
  const tasks = await getTasksByUserId(req.user.id);
  res.send(tasks);
});

router.post("/", requireBody(["title", "done"]), async (req, res) => {
  const { title, done } = req.body;
  const task = await createTask(title, done, req.user.id);
  res.status(201).send(task);
});

router.param("id", async (req, res, next, id) => {
  const task = await getTaskById(id);
  if (!task) return res.status(404).send("Task not found.");

  if (task.user_id !== req.user.id)
    return res
      .status(403)
      .send("You do not have permission to access this task.");

  req.task = task;
  next();
});

router.put("/:id", requireBody(["title", "done"]), async (req, res) => {
  const { title, done } = req.body;
  const task = await updateTaskById(req.task.id, title, done);
  res.send(task);
});

router.delete("/:id", async (req, res) => {
  const task = await deleteTaskById(req.task.id);
  res.status(204).send(task);
});
