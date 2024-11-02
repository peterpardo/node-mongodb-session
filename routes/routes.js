const express = require("express");
const UserModel = require("../User");
const router = express.Router();

router.get("/users", (req, res) => {
  res.json({ users: [] });
});

router.post("/users", (req, res) => {
  res.json({ message: "User created." });
});

router.patch("/users/:id", (req, res) => {
  const id = req.params.id;
  res.json({ message: `User updated, id: ${id}` });
});

router.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  res.json({ message: `User deleted, id: ${id}` });
});

module.exports = router;
