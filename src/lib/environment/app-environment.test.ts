import { describe, expect, test } from "bun:test";

import { APP_ENVIRONMENTS, isAppEnvironment, parseAppEnvironment, readAppEnvironment } from "@/lib/environment/app-environment";
import { ALL_DEFAULT_NODES, LEDGER_LOCAL_NODE, LEDGER_ONE_NODE, LEDGER_ROGUEONE_NODE, LEDGER_TWO_NODE } from "@/lib/environment/default-nodes";
import { ENVIRONMENT_SETTINGS } from "@/lib/environment/environment-settings";
import { normalizeNodeUrl } from "@/lib/gl-node/client";

describe("the environments", () => {
  test("are development, preview, staging and production", () => {
    expect([...APP_ENVIRONMENTS]).toEqual(["development", "preview", "staging", "production"]);
  });

  test("each has its settings", () => {
    expect(Object.keys(ENVIRONMENT_SETTINGS).sort()).toEqual([...APP_ENVIRONMENTS].sort());
  });

  test("development offers every known node, local first", () => {
    expect(ENVIRONMENT_SETTINGS.development.defaultNodes).toEqual([LEDGER_LOCAL_NODE, LEDGER_ONE_NODE, LEDGER_TWO_NODE, LEDGER_ROGUEONE_NODE]);
  });

  test("preview, staging and production offer the three deployed nodes, never this machine's", () => {
    for (const environment of ["preview", "staging", "production"] as const) {
      expect(ENVIRONMENT_SETTINGS[environment].defaultNodes).toEqual([LEDGER_ONE_NODE, LEDGER_TWO_NODE, LEDGER_ROGUEONE_NODE]);
      expect(ENVIRONMENT_SETTINGS[environment].defaultNodes).not.toContain(LEDGER_LOCAL_NODE);
    }
  });

  test("every known node has a name and an http(s) address, stored as the app stores addresses", () => {
    for (const node of ALL_DEFAULT_NODES) {
      expect(node.label.trim()).not.toBe("");
      expect(new URL(node.url).protocol).toMatch(/^https?:$/);
      expect(normalizeNodeUrl(node.url)).toBe(node.url);
    }
  });

  test("known nodes have distinct names and addresses", () => {
    expect(new Set(ALL_DEFAULT_NODES.map((node) => node.label)).size).toBe(ALL_DEFAULT_NODES.length);
    expect(new Set(ALL_DEFAULT_NODES.map((node) => node.url)).size).toBe(ALL_DEFAULT_NODES.length);
  });

  test("every environment offers only known nodes", () => {
    for (const settings of Object.values(ENVIRONMENT_SETTINGS)) {
      for (const node of settings.defaultNodes) {
        expect(ALL_DEFAULT_NODES).toContain(node);
      }
    }
  });

  test("only known names count", () => {
    expect(isAppEnvironment("staging")).toBe(true);
    expect(isAppEnvironment("prod")).toBe(false);
    expect(isAppEnvironment("Production")).toBe(false);
  });
});

describe("parseAppEnvironment", () => {
  test("accepts a known environment, ignoring surrounding spaces", () => {
    expect(parseAppEnvironment("preview", "APP_ENV")).toBe("preview");
    expect(parseAppEnvironment(" production ", "APP_ENV")).toBe("production");
  });

  test("refuses a missing or empty value, naming the variable", () => {
    expect(() => parseAppEnvironment(undefined, "APP_ENV")).toThrow("APP_ENV is not set");
    expect(() => parseAppEnvironment("  ", "NEXT_PUBLIC_APP_ENV")).toThrow("NEXT_PUBLIC_APP_ENV is not set");
  });

  test("refuses an unknown value and lists the allowed ones", () => {
    expect(() => parseAppEnvironment("prod", "APP_ENV")).toThrow('APP_ENV is "prod", which is not an environment. Use one of: development, preview, staging, production.');
  });
});

describe("readAppEnvironment (the build-time check)", () => {
  test("goes ahead when both variables name the same environment", () => {
    expect(readAppEnvironment({ APP_ENV: "staging", NEXT_PUBLIC_APP_ENV: "staging" })).toBe("staging");
  });

  test("stops when either variable is missing", () => {
    expect(() => readAppEnvironment({ NEXT_PUBLIC_APP_ENV: "production" })).toThrow("APP_ENV is not set");
    expect(() => readAppEnvironment({ APP_ENV: "production" })).toThrow("NEXT_PUBLIC_APP_ENV is not set");
  });

  test("stops when the two disagree", () => {
    expect(() => readAppEnvironment({ APP_ENV: "production", NEXT_PUBLIC_APP_ENV: "development" })).toThrow(
      'APP_ENV is "production" but NEXT_PUBLIC_APP_ENV is "development". Set both to the same environment.'
    );
  });
});
