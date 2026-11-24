import { startGlNode } from "@tests/e2e/gl-node-harness";
import { APP_ORIGIN } from "@tests/e2e/settings";

// One gl-node for the whole run. Its URL and operator key reach the test
// workers through the environment, which they inherit from this process.
export default async function globalSetup(): Promise<() => Promise<void>> {
  const node = await startGlNode({ allowedOrigins: [APP_ORIGIN] });
  process.env.E2E_GL_NODE_URL = node.url;
  process.env.E2E_GL_NODE_OPERATOR_KEY = node.operatorKey;
  return node.stop;
}
