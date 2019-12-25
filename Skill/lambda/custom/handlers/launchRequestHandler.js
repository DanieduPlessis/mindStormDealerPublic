'use strict';

const Alexa = require('ask-sdk-core');
const Util = require('../util');
const dbHelper = require('../helpers/dbHelper');

const NAMESPACE = 'Custom.Card.Dealer.Gadget';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {

        let request = handlerInput.requestEnvelope;
        let {
            apiEndpoint,
            apiAccessToken
        } = request.context.System;
        try {
            let apiResponse = await Util.getConnectedEndpoints(apiEndpoint, apiAccessToken);
            if ((apiResponse.endpoints || []).length === 0) {
                return handlerInput.responseBuilder
                    .speak(`<speak><say-as interpret-as="interjection">ouch!</say-as>I couldn't find an EV3 Brick connected to this Echo device. Please check to make sure your EV3 Brick is connected, and try again.</speak>`)
                    .getResponse();
            }

            // Store the gadget endpointId to be used in this skill session
            let endpointId = apiResponse.endpoints[0].endpointId || [];
            Util.putSessionAttribute(handlerInput, 'endpointId', endpointId);
            Util.putSessionAttribute(handlerInput, 'namespace', NAMESPACE);

            let directive = Util.build(endpointId, NAMESPACE, 'reset', {});


            return handlerInput.responseBuilder
                .speak(`<speak><audio src="soundbank://soundlibrary/toys_games/board_games/board_games_01"/>Welcome, I will be your dealer today, how many players are there?</speak>`)
                .addDirective(directive)
                .reprompt("Awaiting deal command")
                .withShouldEndSession(false)
                .getResponse();
        } catch (err) {
            return handlerInput.responseBuilder
                .speak(`<speak><say-as interpret-as="interjection">ouch!</say-as>I couldn't find an EV3 Brick connected to this Echo device. Please check to make sure your EV3 Brick is connected, and try again.</speak>`)
                .withShouldEndSession(true)
                .getResponse();
        }

    }
};

module.exports = {
    LaunchRequestHandler
};