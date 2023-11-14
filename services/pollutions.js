const connection = require("../models/db.js");
const objectsService = require("./objects");
const pollutantsService = require("./pollutants");


module.exports.selectAll = async () => {
    const [rows] = await connection.query(`
    SELECT 
        pollution.pollution_id, 
        object.object_name, 
        pollutant.pollutant_name, 
        pollution.pollution_year, 
        pollution.pollution_value 
    FROM pollution 
    INNER JOIN object ON pollution.object_id = object.object_id 
    INNER JOIN pollutant ON pollution.pollutant_id = pollutant.pollutant_id 
    ORDER BY pollution_id;
  `);
    return rows;
};

module.exports.insertOne = async (pollution) => {
    const objectId = await objectsService.getIdByName(pollution.object_name);
    const pollutantId = await pollutantsService.getIdByName(pollution.pollutant_name);

    await connection.query(
        "INSERT INTO pollution (object_id, pollutant_id, pollution_year, pollution_value) VALUES (?, ?, ?, ?);",
        [objectId, pollutantId, pollution.pollution_year, pollution.pollution_value]
    );
};

module.exports.insertFromExcel = async (rows) => {
    await connection.query("INSERT INTO pollution (object_id, pollutant_id, pollution_year, pollution_value) VALUES ?;", [rows]);
};

module.exports.updateById = async (id, pollution) => {
    const objectId = await objectsService.getIdByName(pollution.object_name);
    const pollutantId = await pollutantsService.getIdByName(pollution.pollutant_name);

    const result = await connection.query(
        "UPDATE pollution SET  object_id = ?, pollutant_id = ?, pollution_year = ?, pollution_value = ? WHERE pollution_id = ?;",
        [objectId, pollutantId, pollution.pollution_year, pollution.pollution_value, id]
    );
    return result[0].affectedRows;
};

module.exports.deleteById = async (id) => {
    const result = await connection.query("DELETE FROM pollution WHERE pollution_id = ?;", [id]);
    return result[0].affectedRows;
};

module.exports.getById = async (id) => {
    const [row] = await connection.query(
        `
  SELECT 
      pollution.pollution_id, 
      object.object_name, 
      pollutant.pollutant_name, 
      pollution.pollution_year, 
      pollution.pollution_value 
  FROM pollution 
  INNER JOIN object ON pollution.object_id = object.object_id 
  INNER JOIN pollutant ON pollution.pollutant_id = pollutant.pollutant_id 
  WHERE pollution_id = ?;
`, [id]);

    return row[0];
};

module.exports.selectObjectNames = async () => {
    const [rows] = await connection.query("SELECT object_name FROM object;");
    return rows;
};

module.exports.selectPollutantNames = async () => {
    const [rows] = await connection.query("SELECT pollutant_name FROM pollutant;");
    return rows;
};