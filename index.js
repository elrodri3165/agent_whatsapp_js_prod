const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializa el cliente usando una sesión local para no escanear el QR cada vez
const client = new Client({
    authStrategy: new LocalAuth()
});

// Genera el código QR en la terminal para vincular el celular
client.on('qr', (qr) => {
    console.log('Escanea este código QR con tu celular:');
    qrcode.generate(qr, { small: true });
});

// Evento cuando se conecta correctamente
client.on('ready', () => {
    console.log('¡El bot de WhatsApp está conectado y listo!');
});

// Escuchar mensajes entrantes y responder automáticamente
client.on('message', async msg => {
    if (msg.body.toLowerCase() === 'hola') {
        await msg.reply('¡Hola! Soy tu bot personalizado corriendo en Node.js.');
    }
});

client.initialize();