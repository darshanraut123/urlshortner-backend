const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const port = process.env.port || 4000;
const cors = require("cors");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// routes
app.use("/api", require("./routes.js"));

mongoose
  .connect(
    "mongodb+srv://darshanraut123:6aLRevjFyaijBfCA@cluster0.wg7kk.mongodb.net/url-shortner?authSource=admin&replicaSet=atlas-11nl1e-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true"
  )
  .then(() => {
    console.log("Connected to the database...");
  })
  .catch((error) => console.log("Error connecting", error));

app.listen(port, function () {
  console.log("Server is up at port: " + port);
});
