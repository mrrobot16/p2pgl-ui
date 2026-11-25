// Which environment a build is for. One variable decides it: APP_ENV, with
// NEXT_PUBLIC_APP_ENV as its copy for the browser (this is a static export,
// so only NEXT_PUBLIC_ variables reach the page, fixed at build time). Each
// environment's behaviour lives in ENVIRONMENT_SETTINGS
// (src/lib/environment/environment-settings.ts), never in scattered checks;
// code reads the current one from src/lib/environment/current-environment.ts.

export const APP_ENVIRONMENTS = ["development", "preview", "staging", "production"] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

export type EnvironmentVariables = {
  APP_ENV?: string;
  NEXT_PUBLIC_APP_ENV?: string;
};

const ALLOWED = APP_ENVIRONMENTS.join(", ");

export function isAppEnvironment(value: string): value is AppEnvironment {
  return (APP_ENVIRONMENTS as readonly string[]).includes(value);
}

/** One variable's value as an environment; throws, naming the variable, if it is missing or unknown. */
export function parseAppEnvironment(value: string | undefined, variableName: string): AppEnvironment {
  const trimmed = value?.trim() ?? "";
  if (trimmed === "") {
    throw new Error(`${variableName} is not set. Set it to one of: ${ALLOWED} (in .env locally, in the Vercel project's settings for a deploy).`);
  }
  if (!isAppEnvironment(trimmed)) {
    throw new Error(`${variableName} is "${trimmed}", which is not an environment. Use one of: ${ALLOWED}.`);
  }
  return trimmed;
}

/**
 * The build-time check (next.config.ts): both variables are set, known, and
 * the same. A build never goes ahead on a guess, so a typo can't ship one
 * environment's settings to another.
 */
export function readAppEnvironment(variables: EnvironmentVariables): AppEnvironment {
  const serverSide = parseAppEnvironment(variables.APP_ENV, "APP_ENV");
  const browserSide = parseAppEnvironment(variables.NEXT_PUBLIC_APP_ENV, "NEXT_PUBLIC_APP_ENV");
  if (serverSide !== browserSide) {
    throw new Error(`APP_ENV is "${serverSide}" but NEXT_PUBLIC_APP_ENV is "${browserSide}". Set both to the same environment.`);
  }
  return serverSide;
}
