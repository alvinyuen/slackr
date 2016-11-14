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
	nlp.ask(message.text, (err, res) => {
		if(err){
			console.log(err);
			return;
		}
		if(!res.intent) {
			return rtm.sendMessage('Sorry I don\'t undertand what you are talking about.', message.channel);
		}
		else if(res.intent[0].value =='time' && res.location){
			return rtm.sendMessage(`I don't yet know the time in ${res.location[0].value}`, message.channel);
		}
		else {
			console.log('err response: ',res);
			return rtm.sendMessage('Sorry I don\'t undertand what you are talking about.', message.channel);
		}
	});
};


let addWelcomeMsgHandler = (rtm, handleOnMessage) => {
	rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);
};


module.exports.connect = (bot_token, debugLvl, nlpClient) => {
	rtm = new RtmClient(bot_token, {logLevel: debugLvl});
	nlp = nlpClient;
	addAuthenticatedHandler(rtm, handleOnAuthenticated);
	addWelcomeMsgHandler(rtm, handleOnMessage);

	return rtm;
};

module.exports.addAuthenticatedHandler = addAuthenticatedHandler;