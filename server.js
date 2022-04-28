// Usando paquetes externos
const path = require("path");
const express = require("express");
const WebSocket = require("ws");
const app = express();

// Declaracion de puertos
const WS_PORT = 8888;
const HTTP_PORT = 8000;

// Inicializando un objeto de web server
const wsServer = new WebSocket.Server({port: WS_PORT}, ()=> console.log(`WS Server esta listo ${WS_PORT}`));

// Declarando un arreglo de los dispositivos conectados
let connectedClients = [];

// Funcion para cuando se active el sevidor
wsServer.on('connection', (ws, req)=>{
    console.log('CONECTADO');
    connectedClients.push(ws);

    ws.on('message', data => {
        connectedClients.forEach((ws,i)=>{
            if(ws.readyState === ws.OPEN){
                ws.send(data);
            }else{
                connectedClients.splice(i ,1);
            }
        })
    });
});


app.get('/client',(req,res)=>res.sendFile(path.resolve(__dirname, './client.html')));
app.listen(HTTP_PORT, ()=> console.log(`HTTP ESTA LISTO at ${HTTP_PORT}`));