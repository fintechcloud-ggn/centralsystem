const { spawn } = require("child_process");
const net = require("net");
const path = require("path");

const preferredPort = Number(process.env.PORT) || 3000;
const maxAttempts = 100;

function isPortFree(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE" || error.code === "EACCES") {
        resolve(false);
        return;
      }

      reject(error);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });
}

async function findFreePort(startPort) {
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const port = startPort + offset;

    if (await isPortFree(port)) {
      return port;
    }
  }

  throw new Error(
    `Could not find a free frontend port from ${startPort} to ${
      startPort + maxAttempts - 1
    }.`
  );
}

async function main() {
  const port = await findFreePort(preferredPort);
  const reactScriptsEntry = require.resolve("react-scripts/scripts/start", {
    paths: [path.join(__dirname, "..")],
  });

  if (port !== preferredPort) {
    console.log(
      `Frontend port ${preferredPort} is busy. Starting on port ${port} instead.`
    );
  }

  const child = spawn(process.execPath, [reactScriptsEntry], {
    env: {
      ...process.env,
      PORT: String(port),
    },
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code || 0);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
