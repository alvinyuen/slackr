const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const PORT = 1337;

const timeServiceRouter = require('../route/timeService.js');

const slackToken = 'xoxb-103936655043-6LPcSmUKC57lCfBbWBKeWJPo';
const slackLogLvl = 'debug';
const slackClient = require('./slack.js');
const witClient = require('./witClient.js').witClient();
const apiKeyModel = require('../model/api.js');


const rtm = slackClient.connect(slackToken, slackLogLvl, witClient);

apiKeyModel.sync({})
	.then(function() {
		//sync other models
	})
	.then(function() {
		slackClient.addAuthenticatedHandler(rtm, () => listen);
	})
	.catch(console.error);


rtm.start();


app.use('/timeService', timeServiceRouter);



var listen = app.listen(PORT, () => {
	console.log(`server is listening on ${PORT}`);
});

app.on('listening', () => {
	console.log(`server is listening on ${server.address().port} in ${server.get('env')} mode`);
});


module.exports = app;