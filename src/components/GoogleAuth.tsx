import {useEffect, useState} from "react";
import {googleLogout, type TokenResponse, useGoogleLogin} from "@react-oauth/google";
import {type User} from "./models.ts";
import {Button} from "./tailwind/button.tsx";
import clsx from "clsx";
import {ArrowRightEndOnRectangleIcon} from "@heroicons/react/16/solid";

export interface GoogleAuthProps {
    className?: string | undefined;
    onSuccess?: (user: User) => void;
    onLogout?: () => void;
}

export default function GoogleAuth({className, onSuccess, onLogout }: GoogleAuthProps) {
    const [user, setUser] = useState<User | null>(null);
    const localUserStorage = "user";

    const login = useGoogleLogin({
        flow: "implicit",
        onSuccess: handleSuccessfulLogin,
        scope: `${GoogleScopes.driveFilesForApp}`
    });

    // try to log in when loading the page
    useEffect(() => {
        const userJson = localStorage.getItem(localUserStorage);
        if (!userJson) return;

        const user = JSON.parse(userJson, parseUser) as User;
        if (isExpired(user)) login()
        else onValidUser(user)
    }, []);

    async function handleSuccessfulLogin(tokenResponse: TokenResponse) {
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: new Headers({
                Authorization: `${tokenResponse.token_type} ${tokenResponse.access_token}`
            })
        });
        const googleUser = await userResponse.json();

        const user = {
            firstname: googleUser.given_name,
            lastname: googleUser.family_name,
            name: googleUser.name,
            image: googleUser.picture,
            tokenAcquired: new Date(),
            token: tokenResponse,
        };
        localStorage.setItem(localUserStorage, JSON.stringify(user));
        onValidUser(user);
    }

    function onValidUser(user: User) {
        setUser(user);
        const now = new Date();
        const tenSeconds = 10_000;const tokenLifetime = user.token.expires_in * 1000; // token lifetime in ms
        const elapsedTime = now.getTime() - user.tokenAcquired.getTime();
        const timeRemaining = tokenLifetime - elapsedTime;


        if (timeRemaining <= tenSeconds)
            login();
        else {
            onSuccess?.(user);
            setTimeout(login, timeRemaining - tenSeconds);
        }
    }

    function logout() {
        googleLogout();
        localStorage.removeItem(localUserStorage);
        setUser(null);
        onLogout?.();
    }

    return (user ?
            <div className={clsx(className, "flex flex-nowrap flex-auto lg:space-x-4")} >
                <p className="grow md:grow-0">
                    Hello <span className="font-semibold">{user.name}</span>
                </p>
                <Button plain onClick={logout}>
                    Logout
                    <ArrowRightEndOnRectangleIcon className="self-center text-amber-400" />
                </Button>
            </div>
            : <div className={clsx(className, "flex flex-nowrap flex-auto")}>
                <Button outline onClick={() => login()}>
                    {googleLogo}
                    Sign in with Google
                </Button>
            </div>
    );
}

function isExpired(user: User) : boolean {
    const now = new Date().getTime();
    const expiresAt = user.tokenAcquired.getTime() + (user.token.expires_in * 1000);
    return expiresAt <= now;
}

function parseUser(key: string, value: string) {
    const dateFields = ["tokenAcquired"];
    if (dateFields.includes(key)) {
        return new Date(value);
    }

    return value;
}

// for more scopes: https://developers.google.com/identity/protocols/oauth2/scopes
export class GoogleScopes {
    static readonly driveFilesForApp : string = "https://www.googleapis.com/auth/drive.file";
    static readonly userProfile: string = "profile"; // https://www.googleapis.com/auth/userinfo.profile
    static readonly userEmail: string = "email"; // https://www.googleapis.com/auth/userinfo.email
}

const googleLogo = <svg width="24px"
                        height="24px"
                        viewBox="0 0 256 262"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid"
                        className="self-center">
    <g>
        <path d="M255.878,133.451 C255.878,122.717 255.007,114.884 253.122,106.761 L130.55,106.761 L130.55,155.209 L202.497,155.209 C201.047,167.249 193.214,185.381 175.807,197.565 L175.563,199.187 L214.318,229.21 L217.003,229.478 C241.662,206.704 255.878,173.196 255.878,133.451"
              fill="#4285F4" />
        <path d="M130.55,261.1 C165.798,261.1 195.389,249.495 217.003,229.478 L175.807,197.565 C164.783,205.253 149.987,210.62 130.55,210.62 C96.027,210.62 66.726,187.847 56.281,156.37 L54.75,156.5 L14.452,187.687 L13.925,189.152 C35.393,231.798 79.49,261.1 130.55,261.1"
              fill="#34A853" />
        <path d="M56.281,156.37 C53.525,148.247 51.93,139.543 51.93,130.55 C51.93,121.556 53.525,112.853 56.136,104.73 L56.063,103 L15.26,71.312 L13.925,71.947 C5.077,89.644 0,109.517 0,130.55 C0,151.583 5.077,171.455 13.925,189.152 L56.281,156.37"
              fill="#FBBC05" />
        <path d="M130.55,50.479 C155.064,50.479 171.6,61.068 181.029,69.917 L217.873,33.943 C195.245,12.91 165.798,0 130.55,0 C79.49,0 35.393,29.301 13.925,71.947 L56.136,104.73 C66.726,73.253 96.027,50.479 130.55,50.479"
              fill="#EB4335" />
    </g>
</svg>