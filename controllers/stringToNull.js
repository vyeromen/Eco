const stringToNull = (object) => {
  for (const key in object) {
    if (object.hasOwnProperty(key) && object[key] === "") {
      object[key] = null;
    }
  }
  return object;
};

module.exports = stringToNull;