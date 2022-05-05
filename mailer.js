// Modulo para enviar paquetes
const nodemailer = require("nodemailer");


// Configracion del transporter (encargado de enviar emails)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'dispensadormascota2022@gmail.com', // generated ethereal user
        pass: 'majsylmgqdedyxoa' // generated ethereal password
    },
});

// Verificacion de conexion correcta
transporter.verify().then(() => {
    console.log('Listo para enviar correos');
})

// Exporta el m odulo
module.exports = transporter;