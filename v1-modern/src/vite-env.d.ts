/// <reference types="vite/client" />

/**
 * Strongly-type the env vars we read. Vite inlines any `VITE_*` key at
 * build time (see https://vitejs.dev/guide/env-and-mode.html).
 */
interface ImportMetaEnv {
  /** OpenRouter API key for the AI NPC plugin. Gitignored via .env.local. */
  readonly VITE_OPENROUTER_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
