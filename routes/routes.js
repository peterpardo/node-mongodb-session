const express = require("express");
const bcrypt = require("bcrypt");
const UserModel = require("../User");
const router = express.Router();

router.get("/users", (req, res) => {
  res.json({ users: [] });
});

router.post("/users", async (req, res) => {
  try {
    const { email, password } = req.body;
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new UserModel({
      email,
      password: hashedPassword,
    });

    await user.save();

    res.json({ message: "User created.", data: user });
  } catch (err) {
    console.error("Error creating user: ", err.message);
    res.json({ message: "Error creating user..." });
  }
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
