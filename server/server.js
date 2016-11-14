const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const request = require('superagent');
const moment = require('moment');

const PORT = 3000;
const geoCodingApiKey = 'AIzaSyD-loFzQBvjYHTnqQzTcCYbrrFyNqJPLt0';
const timeZoneApiKey = 'AIzaSyBGAoCWdMlrdiDIG4gR3L7opbEFQdKe2SU';


const slackToken = 'xoxb-103936655043-6LPcSmUKC57lCfBbWBKeWJPo';
const slackLogLvl = 'debug';

const witToken = 'DOQURYFV3EWRBN3VYIBP2NB5UXFAEUFB';
let slackClient = require('./slack.js');
const witClient = require('./witClient.js').witClient(witToken);


const rtm = slackClient.connect(slackToken, slackLogLvl, witClient);


slackClient.addAuthenticatedHandler(rtm, () => listen);

rtm.start();

//https://maps.googleapis.com/maps/api/geocode/json?address=HongKong&key=YOUR_API_KEY
//https://maps.googleapis.com/maps/api/timezone/json?location=38.908133,-77.047119&timestamp=1458000000&key=YOUR_API_KEY

app.get('/service/:location', (req, res, next) => {
	request.get(`https://maps.googleapis.com/maps/api/geocode/json`)
		.query({address: req.params.location})
		.query({key: geoCodingApiKey})
		.end((err, response) => {
			if (err) {
				console.log(err);
				return res.sendStatus(500);
			}
			// res.json(response.body.results[0].geometry.location);
			const location = response.body.results[0].geometry.location;
			const timestamp = +moment().format('X');
			const latLng =  location.lat+','+location.lng;

			request.get(`https://maps.googleapis.com/maps/api/timezone/json`)
			.query({location: `${latLng}`})
			.query({timestamp: `${timestamp}`})
			.query({key: timeZoneApiKey})
			.end((err, response) => {
				if(err){
					console.log(err);
					return res.sendStatus(500);
				}
				const result = response.body;
				const timeString = moment.unix(timestamp + result.dstOffset + result.rawOffset).utc().format('dddd, MMMM Do YYYY, h:mm:ss a');
				res.json({result: timeString});
			});
		});
});


var listen = app.listen(PORT, () => {
	console.log(`server is listening on ${PORT}`);
});


app.on('listening', () => {
	console.log(`server is listening on ${server.address().port} in ${server.get('env')} mode`);
});


module.exports = app;