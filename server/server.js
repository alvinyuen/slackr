const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const PORT = 1337;

//services
const timeServiceRouter = require('../route/timeService.js');
const slackClient = require('./slack.js');

//models
const apiKeyModel = require('../model/api.js');


const slackLogLvl = 'debug';



//init
apiKeyModel.sync({})
	.then(function() {
		//sync other models
	})
	.then(function() {
		slackClient.connect(slackLogLvl);
	})
	.then(listen)
	.catch(console.error);


app.use('/timeService', timeServiceRouter);



var listen = app.listen(PORT, () => {
	console.log(`server is listening on ${PORT}`);
});

app.on('listening', () => {
	console.log(`server is listening on ${server.address().port} in ${server.get('env')} mode`);
});


module.exports = app;