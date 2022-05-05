
// Importaciones

const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const app = express();
const transporter = require('./mailer');

const WS_PORT = 65080;
const HTTP_PORT = 80;
// const HTTP_PORT = 8080; //Para local

// URL para el cliente
const client_url = "34.125.169.64:80/client"

// Inicializando el servidor de webSockets
const wsServer = new WebSocket.Server({ port: WS_PORT }, () => console.log(`WS Server is listening at ${WS_PORT}`));

// Lista de clientes conectados
let connectedClients = [];

// Al recibir una conexion
wsServer.on('connection', (ws, req) => {

    // Lo agrega a la lista de clientes
    console.log('Connected');
    connectedClients.push(ws);

    // Al recibir un mensaje
    ws.on('message', data => {
        wsServer.clients.forEach(async function each(client) {
            // Retransmite el mensaje para el resto de clientes

            if (client !== ws && client.readyState === WebSocket.OPEN) {


                //Boton para alimentar presionado
                if (data.length == 1) {
                    console.log("mandar mensaje a esp32");
                    client.send(1);
                } else if (data.length == 5) {

                    // Envia Email
                    await transporter.sendMail({
                        from: '"Nuevo movimiento detectado" <dispensadormascota2022@gmail.com>', // sender address
                        to: "fi94457@gmail.com", // list of receivers
                        subject: "Hey !!! - Notificacion ChuchoEat ", // Subject line
                        text: "Movimiento detectado en alimentador", // plain text body
                        html: `
                            <b>Movimiento detectado en el alimentador</b>
                            <p>Puedes monitorear el estado <a href="${client_url}">Aqui</a></p>
                        `
                    });
                } else {
                    // Retransmite el video
                    client.send(data);
                }
            }
        });

    });
});


// Endpoints para el cliente web
app.get('/client', (req, res) => res.sendFile(path.resolve(__dirname, './client.html')));
app.get('/demo', (req, res) => res.sendFile(path.resolve(__dirname, './demo.html')));

// Inicializando servidor HTTP
app.listen(HTTP_PORT, () => console.log(`HTTP server listening at ${HTTP_PORT}`));
