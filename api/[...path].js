const serverless = require("serverless-http");
const { app, initializeApp } = require("../Backend/server");

let handlerPromise;

module.exports = async (req, res, context) => {
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  if (req.url && !req.url.startsWith("/api/")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }

  if (!handlerPromise) {
    handlerPromise = initializeApp().then(() => serverless(app));
  }

  const handler = await handlerPromise;
  return handler(req, res);
};
