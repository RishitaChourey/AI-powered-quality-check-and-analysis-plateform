import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";

export default function RootApp() {
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    );
}
