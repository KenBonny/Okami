import {useState} from "react";
import {googleLogout, type TokenResponse, useGoogleLogin} from "@react-oauth/google";
import {GoogleScopes, type User} from "./models.ts";

export interface GoogleAuthProps {
    onSuccess?: (user: User) => void;
    onLogout?: () => void;
}

export default function GoogleAuth({ onSuccess, onLogout }: GoogleAuthProps) {
    const [user, setUser] = useState<User | null>(null);

    const login = useGoogleLogin({
        flow: "implicit",
        onSuccess: handleSuccessfulLogin,
        scope: `${GoogleScopes.driveFilesForApp}`
    });

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
            token: tokenResponse,
        };
        setUser(user);
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