import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

/**
 * Starts a real gl-node for the end-to-end tests: loopback only, a fresh
 * temporary data folder, a generated operator key, P2P off, and CORS open
 * to the app's origin. This repo never builds gl-node: it runs the binary
 * at GL_NODE_BINARY, by default openledger-v2's release build beside this
 * repo (`cargo build --release` there).
 */

export type RunningGlNode = {
  url: string;
  operatorKey: string;
  dataDirectory: string;
  stop: () => Promise<void>;
};

const DEFAULT_BINARY = resolve(process.cwd(), "../openledger-v2/target/release/gl-node");
const STARTUP_TIMEOUT_MILLISECONDS = 30_000;

export function glNodeBinaryPath(): string {
  return process.env.GL_NODE_BINARY ?? DEFAULT_BINARY;
}

async function freeLoopbackPort(): Promise<number> {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();
    server.unref();
    server.on("error", rejectPort);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") {
        server.close();
        rejectPort(new Error("No port was assigned."));
        return;
      }
      const { port } = address;
      server.close(() => resolvePort(port));
    });
  });
}

async function waitForHealth(url: string, child: ChildProcess, output: () => string): Promise<void> {
  const deadline = Date.now() + STARTUP_TIMEOUT_MILLISECONDS;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`gl-node exited with code ${child.exitCode} before it was ready.\n${output()}`);
    }
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 200));
  }
  throw new Error(`gl-node was not ready within ${STARTUP_TIMEOUT_MILLISECONDS} ms.\n${output()}`);
}

export async function startGlNode(options: { allowedOrigins: string[] }): Promise<RunningGlNode> {
  const binary = glNodeBinaryPath();
  if (!existsSync(binary)) {
    throw new Error(`No gl-node binary at ${binary}. Build it in openledger-v2 (cargo build --release) or set GL_NODE_BINARY.`);
  }

  const dataDirectory = await mkdtemp(join(tmpdir(), "openledger-ui-e2e-"));
  const port = await freeLoopbackPort();
  const operatorKey = randomBytes(32).toString("hex");
  const configuration = {
    ledgerPath: "./default.bean",
    ledgersDir: "./ledgers",
    bindAddress: "127.0.0.1",
    port,
    graphiql: false,
    cors: { allowedOrigins: options.allowedOrigins },
    auth: { enabled: true, apiKey: operatorKey },
    p2p: { enabled: false }
  };
  const configurationPath = join(dataDirectory, "gl-node.config.json");
  await writeFile(configurationPath, JSON.stringify(configuration, null, 2));

  // The key comes from the config file only: an operator key in the
  // caller's environment would override it.
  const environment: NodeJS.ProcessEnv = { ...process.env, GL_NODE_CONFIG: configurationPath };
  delete environment.GL_NODE_API_KEY;

  let collectedOutput = "";
  const child = spawn(binary, [], {
    cwd: dataDirectory,
    env: environment,
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stdout?.on("data", (chunk: Buffer) => {
    collectedOutput += chunk.toString();
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    collectedOutput += chunk.toString();
  });

  const url = `http://127.0.0.1:${port}`;

  async function stop(): Promise<void> {
    if (child.exitCode === null) {
      const exited = new Promise<void>((resolveExit) => child.once("exit", () => resolveExit()));
      child.kill("SIGTERM");
      const forced = setTimeout(() => child.kill("SIGKILL"), 10_000);
      await exited;
      clearTimeout(forced);
    }
    await rm(dataDirectory, { recursive: true, force: true });
  }

  try {
    await waitForHealth(url, child, () => collectedOutput);
  } catch (error) {
    await stop();
    throw error;
  }

  return { url, operatorKey, dataDirectory, stop };
}
