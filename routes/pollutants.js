const express = require("express");
const router = express.Router();
const pollutantControllers = require("../controllers/pollutants");
const uploadFile = require("../config/multer");

router.route("/").get(pollutantControllers.index).post(pollutantControllers.addPollutant);

router.route("/add").get(pollutantControllers.renderAddPollutantForm);

router.route("/load-excel").post(uploadFile.single("load-excel"), pollutantControllers.loadFromExcel);

router.route("/:pollutantId").put(pollutantControllers.updatePollutant).delete(pollutantControllers.deletePollutant);

router.route("/:pollutantId/edit").get(pollutantControllers.renderEditPollutantForm);

module.exports = router;