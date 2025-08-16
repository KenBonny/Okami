import {GoogleOAuthProvider} from "@react-oauth/google";
import {FreezerManager} from "./freezerManager.tsx";
import React from "react";
import { PUBLIC_GOOGLE_CLIENT_ID } from "astro:env/client";


export default function FreezerApp() {

    console.log("Client ID:", PUBLIC_GOOGLE_CLIENT_ID);

    return (
        <GoogleOAuthProvider clientId={PUBLIC_GOOGLE_CLIENT_ID}>
            <FreezerManager />
        </GoogleOAuthProvider>
    )
}