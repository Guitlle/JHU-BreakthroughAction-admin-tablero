import GetAccessTokenFromServiceAccount from "./auth"

async function init(PRIVATE_KEY, EMAIL) {
    const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
    const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
    return new Promise((resolve, reject ) => {
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

async function GSReadRange(spreadsheetId, range) {
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
    })
}

async function GSAppendToRange(spreadsheetId, range, data) {
    return gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS'
    }, {
      values: data,
      range: range
    })
}

async function GSBatchUpdate(spreadsheetId, range, data) {
    return gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: spreadsheetId
    }, {
        data: data,
        valueInputOption: 'RAW'
    })
}

export { init, GSAppendToRange, GSBatchUpdate, GSReadRange };
