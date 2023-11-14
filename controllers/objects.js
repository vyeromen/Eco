const readXlsxFile = require("read-excel-file/node");
const objectService = require("../services/objects");
const stringToNull = require("./stringToNull");

module.exports.index = async (req, res, next) => {
  const objectItems = await objectService.selectAll();
  res.render("objects/index", { objectItems });
};

module.exports.renderAddObjectForm = (req, res, next) => {
  res.render("objects/add");
};

module.exports.renderEditObjectForm = async (req, res, next) => {
  const { objectId } = req.params;

  if (isNaN(objectId)) {
    res.status(404).send("Об'єкт із зазначеним ідентифікатором не знайдено.");
    res.redirect("/objects");
  } else {

    const object = await objectService.getById(objectId);

    if (!object) {
      res.status(404).send("Об'єкт із зазначеним ідентифікатором не знайдено.");
      res.redirect("/objects");
    }
    else {
      res.render("objects/edit", { object });
    }
  }
};

module.exports.addObject = async (req, res, next) => {
  const { object } = req.body;
  const modifiedObject = stringToNull(object);

  try {
    await objectService.insertOne(modifiedObject);
  } catch (error) {
    return res.status(500).send("Помилка при додаванні підприємства: " + error.message);
  }
  res.redirect("/objects");
};

module.exports.loadFromExcel = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("Не обрано файл");
  }

  const excelFile = process.cwd() + "/uploads/" + req.file.filename;

  const rows = await readXlsxFile(excelFile);
  rows.shift();

  try {
    await objectService.insertFromExcel(rows);
  } catch (error) {
    return res.status(500).send("Помилка при завантаженні даних: " + error.message);
  }
  res.redirect("/objects");
};

module.exports.updateObject = async (req, res, next) => {
  const { objectId } = req.params;
  const { object } = req.body;

  const modifiedObject = stringToNull(object);

  const result = await objectService.updateById(objectId, modifiedObject);

  if (result !== 0) {
    res.redirect("/objects");
  } else {
    res.status(404).send("Об'єкт із зазначеним ідентифікатором не знайдено.");
  }
};

module.exports.deleteObject = async (req, res, next) => {
  const { objectId } = req.params;

  const result = await objectService.deleteById(objectId);

  if (result !== 0) {
    res.redirect("/objects");
  } else {
    res.status(404).send("Об'єкт із зазначеним ідентифікатором не знайдено.");
  }
};