import { parseAppEnvironment, type AppEnvironment } from "@/lib/environment/app-environment";
import { ENVIRONMENT_SETTINGS, type EnvironmentSettings } from "@/lib/environment/environment-settings";

// The environment this build is for, and its settings. Next writes
// NEXT_PUBLIC_APP_ENV's value in when the app is built, after next.config.ts
// has checked it matches APP_ENV. Kept apart from the settings table so tests
// can read the table without depending on .env.

export const appEnvironment: AppEnvironment = parseAppEnvironment(process.env.NEXT_PUBLIC_APP_ENV, "NEXT_PUBLIC_APP_ENV");

export const environmentSettings: EnvironmentSettings = ENVIRONMENT_SETTINGS[appEnvironment];
