const express = require('express');
const bodyParser = require('body-parser');
const { WebPubSubServiceClient } = require('@azure/web-pubsub');
const { OpenApiValidator } = require('express-openapi-validator');
const yaml = require('yamljs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const config = yaml.load(path.join(__dirname, 'openapi.yaml'));

const webPubSubClient = new WebPubSubServiceClient(process.env.AzureWebPubSubConnectionString, 'chat-app-webpubsub');

app.use('/api', new OpenApiValidator({ apiSpec: config }).middleware());

app.post('/api/sendMessage', async (req, res) => {
    const { room, message, user } = req.body;
    await webPubSubClient.sendToAll(room, {
        from: user,
        content: message
    });
    res.sendStatus(200);
});

app.get('/api/negotiate', async (req, res) => {
    const token = await webPubSubClient.getClientAccessToken();
    res.json({ url: token.url });
});

app.listen(3000, () => {
    console.log('Chat API is running on http://localhost:3000');
});
