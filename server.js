const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const app = express();

const WS_PORT = 65080;
const HTTP_PORT = 8080; //Para local
// const HTTP_PORT = 80; // Para remoto

// Email
// Para remoto 
const client_url = "34.125.169.64:80/client"
import { transporter } from './mailer'


const wsServer = new WebSocket.Server({ port: WS_PORT }, () => console.log(`WS Server is listening at ${WS_PORT}`));

let connectedClients = [];
wsServer.on('connection', (ws, req) => {
    console.log('Connected');
    connectedClients.push(ws);

    ws.on('message', data => {
        wsServer.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                if (data.length == 1) {
                    //boton de alimentar presionado
                    console.log("mandar mensaje a esp32");
                    client.send(1);
                } else if (data.length == 5) {
                    // TODO: enviar Email
                    await transporter.sendMail({
                        from: '"Nuevo movimiento detectado" <correo@gmail.com>', // sender address
                        to: "correo2@example.com", // list of receivers
                        subject: "Hello ✔", // Subject line
                        text: "Movimiento detectado en alimentador", // plain text body
                        html: `
                            <b>Movimiento detectado en el alimentador</b>
                            <p>Puedes monitorear el estado <a href="${client_url}">Aqui</a></p>
                        `
                    });
                } else {
                    client.send(data);
                }
            }
        });

    });
});

app.get('/client', (req, res) => res.sendFile(path.resolve(__dirname, './client.html')));
app.listen(HTTP_PORT, () => console.log(`HTTP server listening at ${HTTP_PORT}`));
