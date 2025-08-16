import {GoogleOAuthProvider} from "@react-oauth/google";
import {FreezerManager} from "./freezerManager.tsx";
import React from "react";
import {config} from "../config.ts";


export default function FreezerApp() {

    console.log("Client ID:", config.googleClientId);

    return (
        <GoogleOAuthProvider clientId={config.googleClientId}>
            <FreezerManager />
        </GoogleOAuthProvider>
    )
}