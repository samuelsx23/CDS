declare module "cloudflare:workers" {
  export const env: {
    DB?: any;
    ADMIN_EMAILS?: string;
    ADMIN_PASSWORD?: string;
    ADMIN_SESSION_SECRET?: string;
  };
}

interface Fetcher {
  fetch(input: Request | string, init?: RequestInit): Promise<Response>;
}

type D1Database = any;
