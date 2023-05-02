async function init(PRIVATE_KEY, EMAIL) {
    const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
    const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
    return new Promise((resolve, reject ) {
        window.gapi.load('client', async () => {
            gapi.auth.setToken(await GetAccessTokenFromServiceAccount.do({
                "private_key": PRIVATE_KEY,
                "client_email": EMAIL,
                "scopes": [SCOPES]
            }));
            await gapi.client.init({
                discoveryDocs: [DISCOVERY_DOC],
            });
            resolve(true);
        });
    });
}

export default { init, };
