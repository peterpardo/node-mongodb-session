require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const UserModel = require("./User");

const app = express();
const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/mydb",
  collection: "mySessions",
});

const MONGO_STRING = process.env.DATABASE_URL;
const PORT = process.env.PORT;

store.on("error", (error) => {
  console.log(error);
});

app.use(
  session({
    name: "test_cookie_name",
    secret: "secret_key",
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

mongoose.connect(MONGO_STRING).then(() => console.log("DB connected"));

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ session: req.session });
});

app.get("/check-session", async (req, res) => {
  if (req.session && req.session.email) {
    res.json({
      isLoggedIn: true,
      email: req.session.email,
      role: req.session.role,
    });
  } else {
    res.status(409).json({ message: "Unauthorized" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (user) {
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        req.session.regenerate((err) => {
          if (err) {
            throw new Error(err);
          }
          req.session.email = user.email;
          req.session.role = user.role;
          req.session.isLoggedIn = true;
          res.json({
            message: "Login success.",
            user: {
              email: user.email,
              role: user.role,
              isLoggedIn: true,
            },
          });
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ message: "User does not exist" });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

app.get("/logout", (req, res) => {
  try {
    req.session.destroy((err) => {
      const message = err ?? "Session destroyed.";
      res.json({ message });
    });
  } catch (err) {
    console.log(err);
    res.json({ message: "Somthing went wrong" });
  }
});

app.use("/api", routes);

// Error handler
app.use((err, req, res, next) => {
  console.log(err);
});

app.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}`);
});
