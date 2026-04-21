const { app, initializeApp } = require("../Backend/server");

let initializedPromise;

module.exports = async (req, res) => {
  if (req.url && !req.url.startsWith("/api/")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }

  if (!initializedPromise) {
    initializedPromise = initializeApp();
  }

  await initializedPromise;

  return new Promise((resolve, reject) => {
    res.on("finish", resolve);
    res.on("error", reject);
    app(req, res);
  });
};
