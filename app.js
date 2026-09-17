const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const http = require('http');

const app = express();
const server = http.createServer(app);

let qrCodeData = '';
let clientStatus = 'Desconectado';

// Inicializa WhatsApp Web
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: process.env.CHROME_PATH || undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- Este argumento es clave en servidores compartidos con pocos recursos
            '--disable-gpu'
        ],
    }
});

client.on('qr', (qr) => {
    // Convierte el código QR en una imagen para mostrarla en la web
    qrcode.toDataURL(qr, (err, url) => {
        qrCodeData = url;
        clientStatus = 'Esperando escaneo de QR';
    });
});

client.on('ready', () => {
    clientStatus = '¡Conectado y listo!';
    qrCodeData = '';
});

client.initialize();

// Ruta web para ver el estado y el QR desde tu navegador
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Bot WhatsApp</title></head>
            <body style="font-family: Arial; text-align: center; margin-top: 50px;">
                <h1>Estado del Bot: ${clientStatus}</h1>
                ${qrCodeData ? `<img src="${qrCodeData}" alt="Escanea este QR"/>` : '<p>Si ya está conectado, verás el estado arriba.</p>'}
            </body>
        </html>
    `);
});

// Agregá esto antes de app.listen / server.listen
app.use(express.json());

app.post('/enviar-mensaje', async (req, res) => {
    const { numero, mensaje } = req.body;
    
    // El formato que exige whatsapp-web.js para los números con característica (ej: Argentina +54 9...)
    const chatId = numero.includes('@c.us') ? numero : `${numero}@c.us`;

    try {
        await client.sendMessage(chatId, mensaje);
        res.status(200).json({ status: 'success', message: 'Mensaje enviado correctamente' });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// El hosting asigna un puerto automático mediante process.env.PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});