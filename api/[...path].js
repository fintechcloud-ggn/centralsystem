const serverless = require("serverless-http");
const { app, bootstrap } = require("../Backend/server");

const handler = serverless(app);

module.exports = async (req, res) => {
  await bootstrap();
  return handler(req, res);
};
