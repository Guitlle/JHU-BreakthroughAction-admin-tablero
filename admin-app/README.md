# Administrador de Base de datos

Esta herramienta está construida sobre el framework FireCMS.

Para correr localmente:
```
yarn dev
```

Para compilar
```
yarn build
```

La configuración de firebase debe ir en `firebase.json`, y debe incluir la configuración de la base de datos (la base de datos es un archivo de Google Sheets). Para la base de datos es necesario crear un service account en google cloud, con permisos para acceder a la API de Google Sheets y con el permiso de edición en el archivo de Google Sheets. Este es un ejemplo de este archivo de configuración:

```
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "....",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const exportConfig = {
    "private_key": "...",
    "client_email": "...",
    "spreadsheetId": "...",
    "spreadsheetSheetName": "..."
};

export { firebaseConfig as default, exportConfig };

```

Para inicializar Firebase:

```
firebase init
```

Para hacer deploy:

```
firebase deploy
```
