const JsonGenerator = require('@/lib/xlsx-json-converter/json-generator');

module.exports = function (xlsxObj) {
  const jsonGenerator = new JsonGenerator({...xlsxObj});
  jsonGenerator.checkDuplicates();
  jsonGenerator.generate();
  if (jsonGenerator.nullKeys.length > 0) {
    throw {
      status: 429,
      body: jsonGenerator.nullKeys
    };
  } else if (jsonGenerator.duplicates.length > 0) {
    throw {
      status: 428,
      body: jsonGenerator.duplicates
    };
  }
  return jsonGenerator.json;
  // try {
  // } catch (err) {
  //   throw new Error(err);
  // }
};
