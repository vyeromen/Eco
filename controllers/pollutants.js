const readXlsxFile = require("read-excel-file/node");
const pollutantService = require("../services/pollutants");
const stringToNull = require("./stringToNull");

module.exports.index = async (req, res, next) => {
  const pollutantItems = await pollutantService.selectAll();
  res.render("pollutants/index", { pollutantItems });
};

module.exports.renderAddPollutantForm = (req, res, next) => {
  res.render("pollutants/add");
};

module.exports.renderEditPollutantForm = async (req, res, next) => {
  const { pollutantId } = req.params;

  if (isNaN(pollutantId)) {
    res.status(404).send("Забрудник із зазначеним ідентифікатором не знайдено.");
    res.redirect("/pollutants");
  } else {

    const pollutant = await pollutantService.getById(pollutantId);

    if (!pollutant) {
      res.status(404).send("Забрудник із зазначеним ідентифікатором не знайдено.");
      res.redirect("/pollutants");
    }
    else {
      const enumToNumber = {
        'I': 1,
        'II': 2,
        'III': 3,
        'IV': 4,
      };

      const dangerClassNumber = enumToNumber[pollutant.danger_class];

      res.render("pollutants/edit", { pollutant, dangerClassNumber });
    }
  }
};

module.exports.addPollutant = async (req, res, next) => {
  const { pollutant } = req.body;
  const modifiedPollutant = stringToNull(pollutant);

  try {
    await pollutantService.insertOne(modifiedPollutant);
  } catch (error) {
    return res.status(500).send("Помилка при додаванні забрудника: " + error.message);
  }
  res.redirect("/pollutants");
};

module.exports.loadFromExcel = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("Не обрано файл");
  }

  const excelFile = process.cwd() + "/uploads/" + req.file.filename;

  const rows = await readXlsxFile(excelFile);
  rows.shift();

  try {
    await pollutantService.insertFromExcel(rows);
  } catch (error) {
    return res.status(500).send("Помилка при завантаженні даних: " + error.message);
  }
  res.redirect("/pollutants");
};

module.exports.updatePollutant = async (req, res, next) => {
  const { pollutantId } = req.params;
  const { pollutant } = req.body;

  const modifiedPollutant = stringToNull(pollutant);

  const result = await pollutantService.updateById(pollutantId, modifiedPollutant);

  if (result !== 0) {
    res.redirect("/pollutants");
  } else {
    res.status(404).send("Забрудник із зазначеним ідентифікатором не знайдено.");
  }
};

module.exports.deletePollutant = async (req, res, next) => {
  const { pollutantId } = req.params;

  const result = await pollutantService.deleteById(pollutantId);

  if (result !== 0) {
    res.redirect("/pollutants");
  } else {
    res.status(404).send("Забрудник із зазначеним ідентифікатором не знайдено.");
  }
};