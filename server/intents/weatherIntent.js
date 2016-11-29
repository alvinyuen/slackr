'use strict'

const request = require('superagent');
const moment = require('moment');
const apiKeyModel = require('../../model/api.js');

const Promise = this.Promise || require('bluebird');
const agent = require('superagent-promise')(require('superagent'), Promise);


module.exports.process = function process(intentData, cb){


    console.log('parse wit weather res:', JSON.parse(JSON.stringify(intentData)));

    if (intentData.intent[0].value !== 'weather')
		return cb(new Error(`Expected time intent, got ${intentData.intent[0].value}`));
	if (!intentData.location)
		return cb(new Error('I know you want the weather, can you provide me with a location?'));

	const locationName = intentData.location[0].value;

	let googleGeoKey, location, darkSkyKey, latLng, googleTimeZoneKey;

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
				location = response.body.results[0].geometry.location;
				latLng = location.lat + ',' + location.lng;
			})

		.then(function() {
			return apiKeyModel.getDarkSkyToken();
		})

		.then(function(dsKey) {
			darkSkyKey = dsKey.key;
             // https://api.darksky.net/forecast/{token}/37.8267,-122.4233

			agent.get(`https://api.darksky.net/forecast/${darkSkyKey}/${latLng}`)
				.end((err, response) => {
					if (err) {
						console.log(err);
						cb(true, 'error retrieving weather');
					}
					const result = response.body;
                    const temp = result.currently.temperature;
                    let status = result.currently.summary;
                    cb(false, `It is currently ${temp}F and currently '${status}'`);
				});
		});

	});

};

