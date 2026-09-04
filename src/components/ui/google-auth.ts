import { createTokenClient, onGisReady, revokeToken, type TokenResponse } from "../../google/auth.ts";
import { config } from "../../config.ts";
import type { User } from "../Models.ts";

const localUserStorage = "user";
const tenSeconds = 10_000;

interface GoogleAuthOptions {
  className?: string;
  onSuccess?: (user: User) => void;
  onLogout?: () => void;
}

interface GoogleAuthElement {
  root: HTMLElement;
  cleanup: () => void;
}

let tokenClientInstance: ReturnType<typeof createTokenClient> | null = null;
let silentRefreshTimeout: NodeJS.Timeout | null = null;

function parseUser(key: string, value: string): any {
  if (key === "tokenAcquired") return new Date(value);
  return value;
}

function isExpired(user: User): boolean {
  const now = new Date().getTime();
  const expiresAt = user.tokenAcquired.getTime() + (user.token.expires_in * 1000);
  return expiresAt <= now;
}

function handleSuccessfulLogin(
  tokenResponse: TokenResponse,
  onSuccess?: (user: User) => void,
  onCurrentUserChange?: (user: User) => void,
  updateUI?: () => void
): void {
  console.log("handleSuccessfulLogin called with token:", tokenResponse);

  fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: new Headers({
      Authorization: `${tokenResponse.token_type} ${tokenResponse.access_token}`
    })
  })
    .then(res => res.json())
    .then(googleUser => {
      const user: User = {
        firstname: googleUser.given_name,
        lastname: googleUser.family_name,
        name: googleUser.name,
        image: googleUser.picture,
        tokenAcquired: new Date(),
        token: tokenResponse,
      };

      localStorage.setItem(localUserStorage, JSON.stringify(user));
      onCurrentUserChange?.(user);
      onValidUser(user, onSuccess, updateUI);
    })
    .catch(error => console.error("Error handling successful login:", error));
}

function onValidUser(user: User, onSuccess?: (user: User) => void, updateUI?: () => void): void {
  console.log("onValidUser called with user:", user.name);
  const now = new Date();
  const tokenLifetime = user.token.expires_in * 1000;
  const elapsedTime = now.getTime() - user.tokenAcquired.getTime();
  const timeRemaining = tokenLifetime - elapsedTime;

  console.log("Token lifetime:", tokenLifetime, "Elapsed:", elapsedTime, "Remaining:", timeRemaining);

  // Clear any existing refresh timeout
  if (silentRefreshTimeout) {
    clearTimeout(silentRefreshTimeout);
  }

  if (timeRemaining <= tenSeconds) {
    requestAccessToken();
  } else {
    onSuccess?.(user);
    silentRefreshTimeout = setTimeout(requestAccessToken, timeRemaining - tenSeconds);
  }

  updateUI?.();
}

function requestAccessToken(): void {
  if (tokenClientInstance) {
    tokenClientInstance.requestAccessToken();
  }
}

function createLoginButton(): HTMLElement {
  const container = document.createElement("div");
  container.className = "flex flex-nowrap flex-auto";

  const button = document.createElement("button");
  button.className = "inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";
  button.disabled = true;
  button.id = "google-login-btn";

  button.innerHTML = `
    <svg width="24px" height="24px" viewBox="0 0 256 262" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" style="display: inline-block; vertical-align: middle;">
      <g>
        <path d="M255.878,133.451 C255.878,122.717 255.007,114.884 253.122,106.761 L130.55,106.761 L130.55,155.209 L202.497,155.209 C201.047,167.249 193.214,185.381 175.807,197.565 L175.563,199.187 L214.318,229.21 L217.003,229.478 C241.662,206.704 255.878,173.196 255.878,133.451" fill="#4285F4" />
        <path d="M130.55,261.1 C165.798,261.1 195.389,249.495 217.003,229.478 L175.807,197.565 C164.783,205.253 149.987,210.62 130.55,210.62 C96.027,210.62 66.726,187.847 56.281,156.37 L54.75,156.5 L14.452,187.687 L13.925,189.152 C35.393,231.798 79.49,261.1 130.55,261.1" fill="#34A853" />
        <path d="M56.281,156.37 C53.525,148.247 51.93,139.543 51.93,130.55 C51.93,121.556 53.525,112.853 56.136,104.73 L56.063,103 L15.26,71.312 L13.925,71.947 C5.077,89.644 0,109.517 0,130.55 C0,151.583 5.077,171.455 13.925,189.152 L56.281,156.37" fill="#FBBC05" />
        <path d="M130.55,50.479 C155.064,50.479 171.6,61.068 181.029,69.917 L217.873,33.943 C195.245,12.91 165.798,0 130.55,0 C79.49,0 35.393,29.301 13.925,71.947 L56.136,104.73 C66.726,73.253 96.027,50.479 130.55,50.479" fill="#EB4335" />
      </g>
    </svg>
    <span>Sign in with Google</span>
  `;

  container.appendChild(button);
  return container;
}

function createLoggedInUI(user: User): HTMLElement {
  const container = document.createElement("div");
  container.className = "flex flex-nowrap flex-auto lg:space-x-4";

  const userInfo = document.createElement("p");
  userInfo.className = "grow md:grow-0";
  userInfo.innerHTML = `Hello <span class="font-semibold">${user.name}</span>`;

  const logoutButton = document.createElement("button");
  logoutButton.className = "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100";
  logoutButton.id = "google-logout-btn";
  logoutButton.innerHTML = `
    Logout
    <svg class="self-center text-amber-400" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 6L14 10M14 10L10 14M14 10H6C3.79086 10 2 8.20914 2 6V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  container.appendChild(userInfo);
  container.appendChild(logoutButton);
  return container;
}

export function createGoogleAuth(options: GoogleAuthOptions): GoogleAuthElement {
  const { className = "", onSuccess, onLogout } = options;

  const root = document.createElement("div");
  if (className) {
    root.className = className;
  }

  let currentUser: User | null = null;

  function updateUI(): void {
    root.innerHTML = "";

    if (currentUser) {
      root.appendChild(createLoggedInUI(currentUser));
      const logoutBtn = root.querySelector("#google-logout-btn") as HTMLButtonElement;
      if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
      }
    } else {
      root.appendChild(createLoginButton());
      const loginBtn = root.querySelector("#google-login-btn") as HTMLButtonElement;
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.addEventListener("click", requestAccessToken);
      }
    }
  }

  function handleLogout(): void {
    if (currentUser) {
      revokeToken(currentUser.token.access_token);
    }
    localStorage.removeItem(localUserStorage);
    currentUser = null;
    if (silentRefreshTimeout) {
      clearTimeout(silentRefreshTimeout);
      silentRefreshTimeout = null;
    }
    updateUI();
    onLogout?.();
  }

  
  // Initialize
  onGisReady(() => {
    const scope = `openid profile email https://www.googleapis.com/auth/drive.file`;
    tokenClientInstance = createTokenClient(config.googleClientId, scope, (response) => {
      handleSuccessfulLogin(response, onSuccess, (user) => {
        currentUser = user;
      }, updateUI);
    });

    // Try to restore session on page load
    const userJson = localStorage.getItem(localUserStorage);
    if (userJson) {
      const user = JSON.parse(userJson, parseUser) as User;
      if (!isExpired(user)) {
        currentUser = user;
        onValidUser(user, onSuccess, updateUI);
      } else {
        // Token expired, request new one
        requestAccessToken();
      }
    }

    updateUI();
  });

  return {
    root,
    cleanup: () => {
      if (silentRefreshTimeout) {
        clearTimeout(silentRefreshTimeout);
      }
    }
  };
}
