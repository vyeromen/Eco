const express = require("express");
const router = express.Router();
const objectControllers = require("../controllers/objects");
const uploadFile = require("../config/multer");

router.route("/").get(objectControllers.index).post(objectControllers.addObject);

router.route("/add").get(objectControllers.renderAddObjectForm);

router.route("/load-excel").post(uploadFile.single("load-excel"), objectControllers.loadFromExcel);

router.route("/:objectId").put(objectControllers.updateObject).delete(objectControllers.deleteObject);

router.route("/:objectId/edit").get(objectControllers.renderEditObjectForm);

module.exports = router;