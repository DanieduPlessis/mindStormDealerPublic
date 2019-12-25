'use strict';
const Alexa = require('ask-sdk-core');
const Util = require('../util');
const dbHelper = require('../helpers/dbHelper');

const NAMESPACE = 'Custom.Card.Dealer.Gadget';

const dealAgainHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' &&
            request.intent.name === 'dealAgainIntent';
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
            let speakOutput = "";

            let endpointId = apiResponse.endpoints[0].endpointId || [];

            return dbHelper.getDealDetails(handlerInput.requestEnvelope.context.System.user.userId)
                .then((data) => {
                    if (data.length == 0) {
                        speakOutput = `<speak>I haven't dealt for you before, what do you want me to deal?</speak>`;
                    } else {
                        if (data[0].gameType != 'custom hand') {
                            speakOutput = `Ok, I will deal a ${data[0].gameType} hand for ${data[0].playerCount} players`;
                        } else {
                            speakOutput = `Ok, I will deal ${data[0].cardCount} cards for ${data[0].playerCount} players`;
                        }

                    }
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .addDirective(Util.build(endpointId, NAMESPACE, 'deal', {
                            'cardCount': data[0].cardCount,
                            'gameType': data[0].gameType,
                            'count': data[0].playerCount
                        }))
                        .getResponse();
                });
        } catch (err) {
            return handlerInput.responseBuilder
                .speak(`<speak><say-as interpret-as="interjection">ouch!</say-as>I couldn't find an EV3 Brick connected to this Echo device. Please check to make sure your EV3 Brick is connected, and try again.</speak>`)
                .withShouldEndSession(true)
                .getResponse();
        }
    }
};

module.exports = {
    dealAgainHandler
};