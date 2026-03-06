const serverless = require("serverless-http");
const { app, bootstrap } = require("../Backend/server");

const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    await bootstrap();
  } catch (error) {
    return res.status(500).json({
      error: "Backend bootstrap failed",
      details: error.message
    });
  }
  return handler(req, res);
};
