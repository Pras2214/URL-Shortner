const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();
const ShortUrl = require("./models/shortUrl");
const app = express();

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const dbUrl = process.env.MONGODB_URI || "mongodb://0.0.0.0:27017/urlShortner";
  return mongoose.connect(dbUrl);
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).send("Database connection error");
  }
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", { shortUrls: shortUrls });
});

app.post("/shortUrls", async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl });
  res.redirect("/");
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

module.exports = app;
