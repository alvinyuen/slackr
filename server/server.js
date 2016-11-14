let slackClient = require('./slack.js');

const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const PORT = 3000;

const slackToken = 'xoxb-103936655043-6LPcSmUKC57lCfBbWBKeWJPo';
const slackLogLvl = 'debug';

const witToken = 'DOQURYFV3EWRBN3VYIBP2NB5UXFAEUFB';
const witClient = require('./witClient.js').witClient(witToken);


const rtm = slackClient.connect(slackToken, slackLogLvl, witClient);


slackClient.addAuthenticatedHandler(rtm, () => listen);

rtm.start();


var listen = app.listen(PORT, () => {
	console.log(`server is listening on ${PORT}`);
});


server.on('listening', () => {
	console.log(`server is listening on ${server.address().port} in ${server.get('env')} mode`);
});


module.exports = app;