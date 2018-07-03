const ngrok = require('ngrok');
const http = require('http');
const opn = require('opn');
const fs = require('fs');
const config = require('../../config.json').services.find(service => service.name === 'spotify');

let credentials;
// eslint-disable-next-line global-require
if (fs.existsSync(`./${config.clientSecretFileName}`)) credentials = require('./client_secret.json');
else credentials = {};

const port = process.env.PORT || 5000;

function setupServerForResponse() {
    return new Promise((resolve) => {
        const server = http
            .createServer((req, res) => {
                if (req.url === '/spotify') {
                    res.write('<script>location.href = location.href.replace("#","?"); </script>');
                    res.end();
                } else {
                    res.write('<script>window.close();</script>');
                    resolve(req.url.replace('/spotify?access_token=', '').split('&')[0]);
                    res.end();
                    server.close();
                }
            })
            .listen(port);
    });
}

function promptUserWithUrl(cliSession) {
    return new Promise((resolve) => {
        ngrok.connect(port).then((url) => {
            cliSession.prompt(
                {
                    type: 'confirm',
                    name: 'continue',
                    default: true,
                    message: `use this redirect uri in your spotify application ${url}/spotify and hit return when set`,
                },
                () => {
                    resolve(url);
                },
            );
        });
    });
}

function openWebBrowser(url) {
    opn(
        `https://accounts.spotify.com/authorize?client_id=${
            credentials.client_id
        }&redirect_uri=${encodeURIComponent(
            `${url}/spotify`,
        )}&scope=playlist-read-private%20user-read-email&response_type=token&state=123`,
    );
}
async function init(cliSession) {
    const url = await promptUserWithUrl(cliSession);
    openWebBrowser(url);
    return setupServerForResponse();
}
module.exports = {
    init,
};
