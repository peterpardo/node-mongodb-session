require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
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
  })
);

mongoose.connect(MONGO_STRING).then(() => console.log("DB connected"));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ session: req.session });
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
          res.json({ message: "Login success." });
        });
      } else {
        res.json({ message: "Invalid credentials" });
      }
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
  res.status(500).send("Error: ", err);
});

app.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}`);
});
