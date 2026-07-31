import {GoogleOAuthProvider} from "@react-oauth/google";
import {FreezerManager} from "./FreezerManager.tsx";
import React from "react";
import {config} from "../config.ts";


export default function FreezerApp() {
    return (
        <GoogleOAuthProvider clientId={config.googleClientId}>
            <FreezerManager />
        </GoogleOAuthProvider>
    )
}