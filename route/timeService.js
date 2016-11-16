const express = require('express');
const timeServiceRouter = express.Router();
const apiKeyModel = require('../model/api.js');
const request = require('superagent');
const moment = require('moment');


timeServiceRouter.get('/:location', (req, res, next) => {

	apiKeyModel.getGoogleGeo()
		.then(function(googleGeoKey) {

			return googleGeoKey.key;
		})
		.then(function(googleGeoKey) {

			request.get(`https://maps.googleapis.com/maps/api/geocode/json`)
				.query({
					address: req.params.location
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
									res.json({
										result: timeString
									});
								});
						});

				});

		});

});

module.exports = timeServiceRouter;