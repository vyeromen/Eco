const readXlsxFile = require("read-excel-file/node");
const pollutionService = require("../services/pollutions");
const stringToNull = require("./stringToNull");

module.exports.index = async (req, res, next) => {
  const pollutionItems = await pollutionService.selectAll();
  const calculatedRisks = await pollutionService.calculateRisks();
  const calculatedLoss = await pollutionService.calculateLoss();
  res.render("pollutions/index", { pollutionItems, calculatedRisks, calculatedLoss });
};

module.exports.renderAddPollutionForm = async (req, res, next) => {
  const objects = await pollutionService.selectObjectNames();
  const pollutants = await pollutionService.selectPollutantNames();
  res.render("pollutions/add", { objects, pollutants });
};

module.exports.renderEditPollutionForm = async (req, res, next) => {
  const { pollutionId } = req.params;

  if (isNaN(pollutionId)) {
    res.status(404).send("Забруднення із зазначеним ідентифікатором не знайдено.");
    res.redirect("/pollutions");
  } else {

    const pollution = await pollutionService.getById(pollutionId);
    const objects = await pollutionService.selectObjectNames();
    const pollutants = await pollutionService.selectPollutantNames();

    if (!pollution) {
      res.status(404).send("Забруднення із зазначеним ідентифікатором не знайдено.");
      res.redirect("/pollutions");
    }
    else {
      res.render("pollutions/edit", { pollution, objects, pollutants });
    }
  }
};

module.exports.addPollution = async (req, res, next) => {
  const { pollution } = req.body;
  const modifiedPollution = stringToNull(pollution);

  try {
    await pollutionService.insertOne(modifiedPollution);
  } catch (error) {
    return res.status(500).send("Помилка при додаванні забруднення: " + error.message);
  }
  res.redirect("/pollutions");
};

module.exports.loadFromExcel = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("Не обрано файл");
  }
  const excelFile = process.cwd() + "/uploads/" + req.file.filename;

  const rows = await readXlsxFile(excelFile);
  rows.shift();

  try {
    await pollutionService.insertFromExcel(rows);
  } catch (error) {
    return res.status(500).send("Помилка при завантаженні даних: " + error.message);
  }
  res.redirect("/pollutions");
};

module.exports.updatePollution = async (req, res, next) => {
  const { pollutionId } = req.params;
  const { pollution } = req.body;

  const modifiedPollution = stringToNull(pollution);

  const result = await pollutionService.updateById(pollutionId, modifiedPollution);

  if (result !== 0) {
    res.redirect("/pollutions");
  } else {
    res.status(404).send("Забруднення із зазначеним ідентифікатором не знайдено.");
  }
};

module.exports.deletePollution = async (req, res, next) => {
  const { pollutionId } = req.params;

  const result = await pollutionService.deleteById(pollutionId);

  if (result !== 0) {
    res.redirect("/pollutions");
  } else {
    res.status(404).send("Забруднення із зазначеним ідентифікатором не знайдено.");
  }
};