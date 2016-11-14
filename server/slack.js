'use strict'

var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
let rtm = null;

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
	console.log('message received:' + message);
	rtm.sendMessage(`Hi there, welcome to channel: ${message.channel}`, message.channel);
};

let addWelcomeMsgHandler = (rtm, handleOnMessage) => {
	rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);
};


module.exports.connect = (bot_token, debugLvl) => {
	rtm = new RtmClient(bot_token, {logLevel: debugLvl});

	addAuthenticatedHandler(rtm, handleOnAuthenticated);
	addWelcomeMsgHandler(rtm, handleOnMessage);

	return rtm;
};

module.exports.addAuthenticatedHandler = addAuthenticatedHandler;