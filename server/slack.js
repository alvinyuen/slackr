'use strict'

const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
const nlp = require('./witClient.js').witClient;
const apiKeyModel = require('../model/api.js');
let rtm = null;

let retSlackToken = function() {
	return apiKeyModel.getSlackToken();
};

//authentication handler
let handleOnAuthenticated = (rtmStartData) => {
	// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
	console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
};

let addAuthenticatedHandler = (rtm, handler) => {
	rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler);
};

let handleOnMessage = (message) => {
	if (message.text.toLowerCase().includes('lazybot')) {

		nlp.ask(message.text, (err, res) => {
			if (err) {
				console.log(err);
				return;
			}
			try {
				if (!res.intent || !res.intent[0] || !res.intent[0].value) {
					throw new Error('Could not extract intent');
				}
				//only require according to intent response
				const intent = require('./intents/' + res.intent[0].value + 'Intent');
				intent.process(res, function(err, res) {
					if (err) {
						console.log(err.message);
						return rtm.sendMessage(err.message, message.channel);
					}
					return rtm.sendMessage(res, message.channel);
				});

			} catch (err) {
				console.log('error:', err);
				console.log('response:', res);
				rtm.sendMessage(`Sorry, I don't understand what you are talking about`, message.channel);
			}

		});
	}
};


let addIntentHandler = (rtm, handleOnMessage) => {
	rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);
};


module.exports.connect = (debugLvl) => {
	retSlackToken()
		.then(function(slackToken){
			rtm = new RtmClient(slackToken.key, {
				logLevel: debugLvl
			});
			addAuthenticatedHandler(rtm, handleOnAuthenticated);
			addIntentHandler(rtm, handleOnMessage);
			//start rtm
			return rtm;
		}).then(function(rtm){
			rtm.start();
		});
};

