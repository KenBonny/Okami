export interface TokenResponse {
    access_token: string;
    expires_in: number;
    hd?: string;
    prompt: string;
    token_type: string;
    scope: string;
    state?: string;
    error?: string;
    error_description?: string;
    error_uri?: string;
}

interface TokenClient {
    requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface TokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: TokenClientConfig) => TokenClient;
                    revoke: (accessToken: string, done?: () => void) => void;
                };
            };
        };
    }
}

const scriptUrl = "https://accounts.google.com/gsi/client";
let gisReadyPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
    if (!gisReadyPromise) {
        gisReadyPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = scriptUrl;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Google Identity Services script"));
            document.head.appendChild(script);
        });
    }
    return gisReadyPromise;
}

export function onGisReady(callback: () => void): void {
    loadGisScript().then(callback);
}

export function createTokenClient(clientId: string, scope: string, callback: (response: TokenResponse) => void): TokenClient {
    if (!window.google) throw new Error("Google Identity Services script has not loaded yet");
    return window.google.accounts.oauth2.initTokenClient({client_id: clientId, scope, callback});
}

export function revokeToken(accessToken: string): void {
    window.google?.accounts.oauth2.revoke(accessToken);
}
