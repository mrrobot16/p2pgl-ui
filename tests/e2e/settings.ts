/** Where the exported app is served during the end-to-end tests. */
export const APP_PORT = 3000;
export const APP_ORIGIN = `http://localhost:${APP_PORT}`;

/** Where `next dev` serves the development-only UI kit page during the tests. */
export const KIT_PORT = 3101;
export const KIT_ORIGIN = `http://localhost:${KIT_PORT}`;

/** The gl-node the global setup started, as the test workers see it. */
export function runningGlNode(): { url: string; operatorKey: string } {
  const url = process.env.E2E_GL_NODE_URL;
  const operatorKey = process.env.E2E_GL_NODE_OPERATOR_KEY;
  if (!url || !operatorKey) {
    throw new Error("No gl-node is running: the end-to-end tests start one in their global setup.");
  }
  return { url, operatorKey };
}
