const connection = require("../models/db.js");

module.exports.selectAll = async () => {
  const [rows] = await connection.query("SELECT * FROM pollutant;");
  return rows;
};

module.exports.insertOne = async (pollutant) => {
  await connection.query(
    "INSERT INTO pollutant (pollutant_name, min_mass_consumption, max_mass_consumption, gdv, gdk, rfc, sf, danger_class) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
    [pollutant.pollutant_name, pollutant.min_mass_consumption, pollutant.max_mass_consumption, pollutant.gdv, pollutant.gdk, pollutant.rfc, pollutant.sf, pollutant.danger_class]
  );
};

module.exports.insertFromExcel = async (rows) => {
  await connection.query("INSERT INTO pollutant (pollutant_name, min_mass_consumption, max_mass_consumption, gdv, gdk, rfc, sf, danger_class) VALUES ?;", [rows]);
};

module.exports.updateById = async (id, pollutant) => {
  const result = await connection.query(
    "UPDATE pollutant SET pollutant_name = ?, min_mass_consumption = ?, max_mass_consumption = ?, gdv = ?, gdk = ?, rfc = ?, sf = ?, danger_class = ? WHERE pollutant_id = ?;",
    [pollutant.pollutant_name, pollutant.min_mass_consumption, pollutant.max_mass_consumption, pollutant.gdv, pollutant.gdk, pollutant.rfc, pollutant.sf, pollutant.danger_class, id]
  );
  return result[0].affectedRows;
};

module.exports.deleteById = async (id) => {
  const result = await connection.query("DELETE FROM pollutant WHERE pollutant_id = ?;", [id]);
  return result[0].affectedRows;
};

module.exports.getById = async (id) => {
  const [row] = await connection.query("SELECT * FROM pollutant WHERE pollutant_id = ?;", [id]);
  return row[0];
};

module.exports.getIdByName = async (name) => {
  const [row] = await connection.query("SELECT pollutant_id FROM pollutant WHERE pollutant_name = ?;", [name]);
  const id = row[0].pollutant_id;
  return id;
};