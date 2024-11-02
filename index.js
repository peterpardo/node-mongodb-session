require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const app = express();

const MONGO_STRING = process.env.DATABASE_URL;
const PORT = process.env.PORT;

mongoose.connect(MONGO_STRING).then(() => console.log("DB connected"));

app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}`);
});
