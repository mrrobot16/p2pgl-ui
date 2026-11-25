import type { AppEnvironment } from "@/lib/environment/app-environment";
import { ALL_DEFAULT_NODES, type DefaultNode } from "@/lib/environment/default-nodes";

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
  development: { defaultNodes: ALL_DEFAULT_NODES },
  // No nodes chosen for these yet: they show the plain Node URL field.
  preview: { defaultNodes: [] },
  staging: { defaultNodes: [] },
  production: { defaultNodes: [] }
};
