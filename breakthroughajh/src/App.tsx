// @ts-ignore
import firebaseConfig from "./firebaseConfig";

import { useCallback, useEffect } from "react";

import { sendEmailVerification, User as FirebaseUser } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

import {
    Authenticator,
    FirebaseCMSApp,
    useCollectionFetch,
    CMSView
// @ts-ignore
} from "firecms";



import editsCollection from "./collections/edits";
import userCollection from "./collections/users";
import GSheetEmbed from "./views/sheet_view";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
import GetAccessTokenFromServiceAccount from  "./utils/auth";


const views: CMSView[] = [
    {
        path: "db",
        name: "Database",
        description: "Database view",
        view: <GSheetEmbed/>,
        icon: "Dataset"
    }
];


export default function App() {
    const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
                                                                    user,
                                                                    authController,
                                                                    dataSource
                                                                }: {
                                                                    user: any,
                                                                    authController: any,
                                                                    dataSource: any
                                                                }) => {
        if (!user.emailVerified) {
            if (window.localStorage.getItem("verification_sent") != "done") {
                await sendEmailVerification(user);
                alert("Confirme su email. Se le ha enviado un correo para verificarlo.");
                window.localStorage.setItem("verification_sent", "done");
            }
            return false
        }
        window.localStorage.removeItem("verification_sent");
        var userData = await dataSource.fetchEntity({collection: userCollection,path: "/users", entityId: user.email});
        authController.setExtra(userData.values);
        if (userData.values.active)
            return true;

        alert("Usuario inactivo. Contacte al administrador para habilitar su usuario.");
        return false;
    }, []);

    return <FirebaseCMSApp
        logo="/logo.png"
        name={"Administración del Tablero"}
        authentication={myAuthenticator}
        collections={[editsCollection, userCollection]}
        views={views}
        firebaseConfig={firebaseConfig}
        signInOptions = {[
            GoogleAuthProvider.PROVIDER_ID,
            { "provider": "password" }
        ]}
    />;
}
