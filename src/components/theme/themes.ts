export type ThemeName = "light" | "dark";

export type ThemeOption = { value: ThemeName; label: string };

/** The app's two themes (src/styles/tokens.css: `:root` and `.dark`). */
export const THEMES: readonly ThemeOption[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" }
];

export const THEME_NAMES: ThemeName[] = THEMES.map((theme) => theme.value);

/** next-themes stores "system" for "follow the operating system", the default. */
export const SYSTEM_THEME = "system";
