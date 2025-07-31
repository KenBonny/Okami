import {useState} from "react";
import {type CredentialResponse, useGoogleOneTapLogin} from "@react-oauth/google";

export default function GoogleAuth() {
    const [loggedIn, setLoggedIn] = useState(false);

    useGoogleOneTapLogin({
        onSuccess: handleSuccessfulLogin,
        auto_select: true,
        cancel_on_tap_outside: false
        // use_fedcm_for_prompt: true //does not auto-login for some reason
    });

    async function handleSuccessfulLogin(credentialResponse: CredentialResponse) {
        console.log("Credential Response: ", credentialResponse);
        setLoggedIn(true);


    }

    return (loggedIn ?
            <p>Logged in</p>
            : <p>Please log in using the one-tap popup</p>
    );
}