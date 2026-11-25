// Types for scripts/require-bun.mjs, which stays plain JavaScript so Node can
// run it during `npm install` (to refuse it).
export declare const BUN_ONLY_MESSAGE: string;
export declare function startedByBun(userAgent?: string): boolean;
