const express = require("express");
const bcrypt = require("bcrypt");
const UserModel = require("../User");
const router = express.Router();

function checkIsLoggedIn(req, res, next) {
  if (req.session.email) {
    return next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function checkAdminRole(req, res, next) {
  if (req.session.role === "admin") {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied: Admins only." });
  }
}

router.use(checkIsLoggedIn);

router.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find({});
    res.json({ users });
  } catch (err) {
    res.json({ message: "Error in getting users." });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(id);
    res.json({ user });
  } catch (err) {
    res.json({ message: `Error finding user id: ${id}` });
  }
});

router.post("/users", checkAdminRole, async (req, res) => {
  try {
    const { email, password } = req.body;
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.json({ message: "Email already exists." });
    }

    const user = new UserModel({
      email,
      password: hashedPassword,
      role: "user",
    });

    await user.save();

    res.json({ message: "User created.", data: user });
  } catch (err) {
    res.json({ message: "Error creating user..." });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const { email } = req.body;
    const id = req.params.id;
    await UserModel.findByIdAndUpdate(id, { email });
    res.json({ message: "User updated." });
  } catch (err) {
    res.json({ message: "Error finding user" });
  }
});

router.delete("/users/:id", checkAdminRole, async (req, res) => {
  try {
    const id = req.params.id;
    await UserModel.findByIdAndDelete(id);
    res.json({ message: `User deleted, id: ${id}` });
  } catch (err) {
    res.json({ message: "Error in deleting user..." });
  }
});

module.exports = router;
