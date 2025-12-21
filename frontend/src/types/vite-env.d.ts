/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DISABLE_AUTH?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_API_TIMEOUT?: string;
  // more VITE_ vars can be added here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
