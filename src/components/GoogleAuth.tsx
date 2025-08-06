import {useEffect, useState} from "react";
import {googleLogout, type TokenResponse, useGoogleLogin} from "@react-oauth/google";
import {GoogleScopes, type User} from "./models.ts";

export interface GoogleAuthProps {
    onSuccess?: (user: User) => void;
    onLogout?: () => void;
}

export default function GoogleAuth({ onSuccess, onLogout }: GoogleAuthProps) {
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
        console.log(user);
        if (isExpired(user.tokenAcquired, user.token)) login();
        else onValidUser(user)
    }, []);

    async function handleSuccessfulLogin(tokenResponse: TokenResponse) {
        console.log(tokenResponse);
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
        onSuccess?.(user);
        const now = new Date();
        const tenSeconds = 10_000;
        const tenSecondsBeforeExpiration = (user.token.expires_in * 1000) - (now.getTime() - user.tokenAcquired.getTime()) - tenSeconds;

        if (tenSecondsBeforeExpiration < 0) login();
        else setTimeout(login, tenSecondsBeforeExpiration);
    }

    function logout() {
        googleLogout();
        localStorage.removeItem(localUserStorage);
        setUser(null);
        onLogout?.();
    }

    return (user ?
            <a onClick={logout}>Hello, {user.name}</a>
            : <button onClick={() => login()}>Sign in with Google</button>
    );
}

function isExpired(acquired: Date, token: TokenResponse) : boolean {
    const now = new Date().getTime();
    const expiresAt = acquired.getTime() + (token.expires_in * 1000);
    return expiresAt <= now;
}

function parseUser(key: string, value: string) {
    const dateFields = ["tokenAcquired"];
    if (dateFields.includes(key)) {
        return new Date(value);
    }

    return value;
}