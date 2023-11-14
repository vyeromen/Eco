const connection = require("../models/db.js");

module.exports.selectAll = async () => {
  const [rows] = await connection.query("SELECT * FROM object;");
  return rows;
};

module.exports.insertOne = async (object) => {
  await connection.query(
    "INSERT INTO object (object_name, object_activity, object_address) VALUES (?, ?, ?);", 
    [object.object_name, object.object_activity, object.object_address]
  );
};

module.exports.insertFromExcel = async (rows) => {
  await connection.query("INSERT INTO object (object_name, object_activity, object_address) VALUES ?;", [rows]);
};

module.exports.updateById = async (id, object) => {
  const result = await connection.query(
    "UPDATE object SET object_name = ?, object_activity = ?, object_address = ? WHERE object_id = ?;",
    [object.object_name, object.object_activity, object.object_address, id]
  );
  return result[0].affectedRows;
};

module.exports.deleteById = async (id) => {
  const result = await connection.query("DELETE FROM object WHERE object_id = ?;", [id]);
  return result[0].affectedRows;
};

module.exports.getById = async (id) => {
  const [row] = await connection.query("SELECT * FROM object WHERE object_id = ?;", [id]);
  return row[0];
};

module.exports.getIdByName = async (name) => {
  const [row] = await connection.query("SELECT object_id FROM object WHERE object_name = ?;", [name]);
  const id = row[0].object_id;
  return id;
};