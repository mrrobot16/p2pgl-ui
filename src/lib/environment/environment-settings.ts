import type { AppEnvironment } from "@/lib/environment/app-environment";
import { ALL_DEFAULT_NODES, DEPLOYED_NODES, type DefaultNode } from "@/lib/environment/default-nodes";

export type EnvironmentSettings = {
  /** Offered first on sign-in and create company. Empty: the plain Node URL field. */
  defaultNodes: readonly DefaultNode[];
};

/**
 * Everything that differs between environments, in one place. Code asks for
 * a setting (`environmentSettings.defaultNodes`), never for the environment's
 * name. The nodes themselves are in src/lib/environment/default-nodes.ts.
 */
export const ENVIRONMENT_SETTINGS: Record<AppEnvironment, EnvironmentSettings> = {
  // This machine's node only makes sense in development.
  development: { defaultNodes: ALL_DEFAULT_NODES },
  preview: { defaultNodes: DEPLOYED_NODES },
  staging: { defaultNodes: DEPLOYED_NODES },
  production: { defaultNodes: DEPLOYED_NODES }
};
