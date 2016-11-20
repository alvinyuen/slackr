'use strict'

const request = require('superagent');
const moment = require('moment');
const apiKeyModel = require('../../model/api.js');

const Promise = this.Promise || require('bluebird');
const agent = require('superagent-promise')(require('superagent'), Promise);



module.exports.process = function process(intentData, cb) {

	console.log('parse wit res:', JSON.parse(JSON.stringify(intentData)));

	if (intentData.intent[0].value !== 'time')
		return cb(new Error(`Expected time intent, got ${intentData.intent[0].value}`));
	if (!intentData.location) 
		return cb(new Error('Can you provide me with a location?'));

	const locationName = intentData.location[0].value;

	let googleGeoKey, location, timestamp, latLng, googleTimeZoneKey;

	apiKeyModel.getGoogleGeo()

	.then(function(geoKey) {
		googleGeoKey = geoKey.key;
	})

	.then(function() {

		agent.get(`https://maps.googleapis.com/maps/api/geocode/json`)
			.query({
				address: locationName
			})
			.query({
				key: googleGeoKey
			})
			.end((err, response) => {
				if (err) {
					console.log(err);
					cb(true, 'error retrieving geo code');
				}
				// res.json(response.body.results[0].geometry.location);
				location = response.body.results[0].geometry.location;
				timestamp = +moment().format('X');
				latLng = location.lat + ',' + location.lng;
			})

		.then(function() {
			return apiKeyModel.getGoogleTimeZone()
		})

		.then(function(googleTzKey) {

			googleTimeZoneKey = googleTzKey.key;

			agent.get(`https://maps.googleapis.com/maps/api/timezone/json`)
				.query({
					location: `${latLng}`
				})
				.query({
					timestamp: `${timestamp}`
				})
				.query({
					key: googleTimeZoneKey
				})
				.end((err, response) => {
					if (err) {
						console.log(err);
						cb(true, 'error retrieving time zone');
					}
					const result = response.body;
					const timeString = moment.unix(timestamp + result.dstOffset + result.rawOffset).utc().format('dddd, MMMM Do YYYY, h:mm:ss a');
					cb(false, `The current time in ${locationName} is ${timeString}`);
				});
		});

	});

}