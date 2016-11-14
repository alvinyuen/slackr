'use strict'

var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
let rtm = null;
let nlp = null;


var channel = '#general';

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

			try{
				if(!res.intent || !res.intent[0] || !res.intent[0].value){
					throw new Error('Could not extract intent');
				}
				//only require according to intent response
				const intent = require('./intents/'+res.intent[0].value+'Intent');
				intent.process(res, function(err, res){
					if(err){
						console.log(err.message);
						return;
					}
					return rtm.sendMessage(res, message.channel);
				});

			}
			catch(err){
				console.log('error:',err);
				console.log('response:',res);
				rtm.sendMessage(`Sorry, I don't understand what you are talking about`, message.channel);
			}

		});
	}
};


let addWelcomeMsgHandler = (rtm, handleOnMessage) => {
	rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);
};


module.exports.connect = (bot_token, debugLvl, nlpClient) => {
	rtm = new RtmClient(bot_token, {
		logLevel: debugLvl
	});
	nlp = nlpClient;
	addAuthenticatedHandler(rtm, handleOnAuthenticated);
	addWelcomeMsgHandler(rtm, handleOnMessage);

	return rtm;
};

module.exports.addAuthenticatedHandler = addAuthenticatedHandler;