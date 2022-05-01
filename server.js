const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const app = express();

const WS_PORT = 65080;
const HTTP_PORT = 8080; //Para local
// const HTTP_PORT = 80; // Para remoto


const wsServer = new WebSocket.Server({ port: WS_PORT }, () => console.log(`WS Server is listening at ${WS_PORT}`));

let connectedClients = [];
wsServer.on('connection', (ws, req) => {
    console.log('Connected');
    connectedClients.push(ws);

    ws.on('message', data => {

        console.log("Data recibida : ")
        console.log(data)

        wsServer.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {

                console.log("longitud " + data.length)
                if (data.length == 1) {
                    //boton de alimentar presionado
                    console.log("mandar mensaje a esp32")
                    client.send('1')
                } else {
                    client.send(data);
                }
            }
        });

    });
});

app.get('/client', (req, res) => res.sendFile(path.resolve(__dirname, './client.html')));
app.listen(HTTP_PORT, () => console.log(`HTTP server listening at ${HTTP_PORT}`));
