'use strict'

const request = require('superagent');
const apiKeyModel = require('../model/api.js');


let handleWitResponse = (res) => {
	return res.entities;
};


let getWitResponse = (token, message, cb) => {
	request.get('https://api.wit.ai/message')
		.set('Authorization', ' Bearer ' + token)
		.query({
			v: '20161115'
		})
		.query({
			q: message
		})
		.end((err, res) => {
			if (err) return cb(err);
			if (res.statusCode != 200) return cb('Expected status 200 but got' + res.statusCode);
			console.log('status:' + res.statusCode);
			const witResponse = handleWitResponse(res.body);

			cb(null, witResponse);
		});
};


module.exports.witClient = function() {

	const ask = function ask(message, cb) {
		apiKeyModel.getWitAi()
			.then(function(apiKey) {
				getWitResponse(apiKey.key, message, cb);
			});
	};

	return {
		ask: ask
	};
};