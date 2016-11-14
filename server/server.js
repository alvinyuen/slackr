let slackClient = require('./slack.js');

const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const PORT = 3000;

const slackToken = 'xoxb-103936655043-6LPcSmUKC57lCfBbWBKeWJPo';
const slackLogLvl = 'debug';

var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;


// console.log(typeof slackClient);
const rtm = slackClient.connect(slackToken, slackLogLvl);


slackClient.addAuthenticatedHandler(rtm, () => listen);

rtm.start();


var listen = app.listen(PORT, () => {
	console.log(`server is listening on ${PORT}`);
});


server.on('listening', () => {
	console.log(server);
	console.log(`server is listening on ${server.address().port} in ${server.get('env')} mode`);
});


module.exports = app;