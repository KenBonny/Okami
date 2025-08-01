import {useState} from "react";
import {googleLogout, type TokenResponse, useGoogleLogin} from "@react-oauth/google";
import type {User} from "./models.ts";

export interface GoogleAuthProps {
    onSuccess?: (user: User) => void;
    onLogout?: () => void;
}

export default function GoogleAuth({ onSuccess, onLogout }: GoogleAuthProps) {
    const [user, setUser] = useState<User | null>(null);

    const login = useGoogleLogin({
        flow: "implicit",
        onSuccess: handleSuccessfulLogin
    })

    async function handleSuccessfulLogin(tokenResponse: TokenResponse) {
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: new Headers({
                Authorization: `${tokenResponse.token_type} ${tokenResponse.access_token}`
            })
        });
        const user = await userResponse.json();

        setUser({
            firstname: user.given_name,
            lastname: user.family_name,
            name: user.name,
            image: user.picture,
            token: tokenResponse,
        });
        onSuccess?.(user);
    }

    function logout() {
        googleLogout();
        setUser(null);
        onLogout?.();
    }

    return (user ?
            <a onClick={logout}>Hello, {user.name}</a>
            : <button onClick={() => login()}>Sign in with Google</button>
    );
}