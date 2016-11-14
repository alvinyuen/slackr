'use strict'

const request = require('superagent');


var handleWitResponse = (res) => {
	return res.entities;
};


module.exports.witClient = function (token){

	const ask = function ask(message, cb){

		request.get('https://api.wit.ai/message')
			.set('Authorization', ' Bearer '+ token)
			.query({v: '20161113'})
			.query({q: message})
			.end((err, res) => {
				if(err) return cb(err);
				if(res.statusCode != 200) return cb('Expected status 200 but got' + res.statusCode);

				console.log('status:'+res.statusCode);
				const witResponse = handleWitResponse(res.body);

				cb(null, witResponse);
			});

		console.log('ask:'+ message);
		console.log('token:'+ token);
	};

	return {
		ask:ask
	};

}