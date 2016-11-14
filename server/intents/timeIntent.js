'use strict'

const request = require('superagent');
const moment = require('moment');
const geoCodingApiKey = 'AIzaSyD-loFzQBvjYHTnqQzTcCYbrrFyNqJPLt0';
const timeZoneApiKey = 'AIzaSyBGAoCWdMlrdiDIG4gR3L7opbEFQdKe2SU';

module.exports.process = function process(intentData, cb) {

	console.log('parse wit res:', JSON.parse(JSON.stringify(intentData)));

	if (intentData.intent[0].value !== 'time')
		return cb(new Error(`Expected time intent, got ${intentData.intent[0].value}`));

	if (!intentData.location) return cb(new Error('Missing location in time intent'));
		// return cb(false, `I don't yet know the time in ${intentData.location[0].value}`);

	const locationName = intentData.location[0].value;

	request.get(`https://maps.googleapis.com/maps/api/geocode/json`)
		.query({address: locationName})
		.query({key: geoCodingApiKey})
		.end((err, response) => {
			if (err) {
				console.log(err);
				return cb(false, `I had a problem finding the geocode for location ${location}`);
			}
			const geolocation = response.body.results[0].geometry.location;
			const timestamp = +moment().format('X');
			const latLng =  geolocation.lat+','+geolocation.lng;

			request.get(`https://maps.googleapis.com/maps/api/timezone/json`)
			.query({location: `${latLng}`})
			.query({timestamp: `${timestamp}`})
			.query({key: timeZoneApiKey})
			.end((err, response) => {
				if(err){
					console.log(err);
					return cb(false, `I had a problem finding the timezone for location ${location}`);
				}
				const result = response.body;
				const timeString = moment.unix(timestamp + result.dstOffset + result.rawOffset).utc().format('dddd, MMMM Do YYYY, h:mm:ss a');
				return cb(false, `It is now ${timeString} in ${locationName}`);
			});
		});
}