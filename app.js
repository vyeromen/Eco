const express = require("express");
const hbs = require("hbs");
const hbsHelpers = require("handlebars-helpers")();
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

const app = express();

app.use(methodOverride("_method"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

Object.keys(hbsHelpers).forEach(helperName => {
  hbs.registerHelper(helperName, hbsHelpers[helperName]);
});

const objectsRoutes = require("./routes/objects");
const pollutantsRoutes = require("./routes/pollutants");
const pollutionRoutes = require("./routes/pollutions");

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views/partials"));

app.use("/objects", objectsRoutes);
app.use("/pollutants", pollutantsRoutes);
app.use("/pollutions", pollutionRoutes);

const port = 3000;

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});