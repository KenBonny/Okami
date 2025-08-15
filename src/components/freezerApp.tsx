import {GoogleOAuthProvider} from "@react-oauth/google";
import {FreezerManager} from "./freezerManager.tsx";
import React from "react";

export default function FreezerApp() {

    console.log("Client ID:", import.meta.env.PUBLIC_GOOGLE_CLIENT_ID);

    return (
        <GoogleOAuthProvider clientId={import.meta.env.PUBLIC_GOOGLE_CLIENT_ID}>
            <FreezerManager />
        </GoogleOAuthProvider>
    )
}