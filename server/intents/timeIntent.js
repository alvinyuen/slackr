'use strict'

const request = require('superagent');
const moment = require('moment');
const apiKeyModel = require('../../model/api.js')


module.exports.process = function process(intentData, cb) {

	console.log('parse wit res:', JSON.parse(JSON.stringify(intentData)));

	if (intentData.intent[0].value !== 'time')
		return cb(new Error(`Expected time intent, got ${intentData.intent[0].value}`));

	if (!intentData.location) return cb(new Error('Missing location in time intent'));
		// return cb(false, `I don't yet know the time in ${intentData.location[0].value}`);

	const locationName = intentData.location[0].value;

	apiKeyModel.getGoogleGeo()
		.then(function(googleGeoKey) {

			return googleGeoKey.key;
		})
		.then(function(googleGeoKey) {

			request.get(`https://maps.googleapis.com/maps/api/geocode/json`)
				.query({
					address: locationName
				})
				.query({
					key: googleGeoKey
				})
				.end((err, response) => {
					if (err) {
						console.log(err);
						return res.sendStatus(500);
					}
					// res.json(response.body.results[0].geometry.location);
					const location = response.body.results[0].geometry.location;
					const timestamp = +moment().format('X');
					const latLng = location.lat + ',' + location.lng;

					apiKeyModel.getGoogleTimeZone()
						.then(function(googleTimeZoneKey) {

							googleTimeZoneKey = googleTimeZoneKey.key;

							request.get(`https://maps.googleapis.com/maps/api/timezone/json`)
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
										return res.sendStatus(500);
									}
									const result = response.body;
									const timeString = moment.unix(timestamp + result.dstOffset + result.rawOffset).utc().format('dddd, MMMM Do YYYY, h:mm:ss a');
									cb(false, `The current time in ${locationName} is ${timeString}`);
								});
						});

				});

		});
}