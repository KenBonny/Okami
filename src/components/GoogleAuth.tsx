import {useEffect, useState} from "react";
import {googleLogout, type TokenResponse, useGoogleLogin} from "@react-oauth/google";
import {type User} from "./models.ts";
import {Button} from "./tailwind/button.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGoogle} from "@fortawesome/free-brands-svg-icons";
import {faRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

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
                    <FontAwesomeIcon icon={faRightFromBracket} className="self-center text-amber-400 text-xl" />
                </Button>
            </div>
            : <div className={clsx(className, "flex flex-nowrap flex-auto")}>
                <Button outline onClick={() => login()}>
                    <FontAwesomeIcon icon={faGoogle} className="self-center text-blue-500 text-xl" />
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