require('dotenv').config();
const cors = require('cors')
const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const app = express();

const WS_PORT = process.env.WS_PORT;
const HTTP_PORT = process.env.PORT;

const wsServer = new WebSocket.Server({ port: WS_PORT }, () => console.log(`WS Server en el puerto ${WS_PORT}`));

let connectedClients = [];
wsServer.on('connection', (ws, req) => {
    console.log('Connected');
    connectedClients.push(ws);

    ws.on('message', data => {
        connectedClients.forEach((ws, i) => {
            if (ws.readyState === ws.OPEN) {
                ws.send(data);
            } else {
                connectedClients.splice(i, 1);
            }
        })
    });
});

wsServer.on('error', (error) => {
    console.log(error);
  })
app.get('/client', (req, res) => res.sendFile(path.resolve(__dirname, './index.html')));
app.listen(HTTP_PORT, () => console.log(`HTTP server en el puerto ${HTTP_PORT}`));

