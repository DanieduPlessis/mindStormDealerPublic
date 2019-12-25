'use strict';
const Alexa = require('ask-sdk-core');
const Util = require('../util');
const dbHelper = require('../helpers/dbHelper');
const NAMESPACE = 'Custom.Card.Dealer.Gadget';

const playerCardHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' &&
            request.intent.name === 'playerCardIntent';
    },
    async handle(handlerInput) {

        let request = handlerInput.requestEnvelope;
        let {
            apiEndpoint,
            apiAccessToken
        } = request.context.System;

        try {
            let speakOutput = "";
            let degreeMove = 0;
            let playerCount = Alexa.getSlotValue(handlerInput.requestEnvelope, 'playerCount');
            let playerCardCount = Alexa.getSlotValue(handlerInput.requestEnvelope, 'playerCardCount');

            let apiResponse = await Util.getConnectedEndpoints(apiEndpoint, apiAccessToken);
            if ((apiResponse.endpoints || []).length === 0) {
                return handlerInput.responseBuilder
                    .speak(`<speak><say-as interpret-as="interjection">ouch!</say-as>I couldn't find an EV3 Brick connected to this Echo device. Please check to make sure your EV3 Brick is connected, and try again.</speak>`)
                    .getResponse();
            }

            let endpointId = apiResponse.endpoints[0].endpointId || [];

            return dbHelper.getDealDetails(handlerInput.requestEnvelope.context.System.user.userId)
                .then((data) => {
                    if (data.length == 0) {
                        speakOutput = `<speak>I haven't dealt for you before, what do you want me to deal?</speak>`;
                    } else if (data[0].playerCount < playerCount) {
                        speakOutput = `<speak>You are only ${data[0].playerCount} players?</speak>`;
                    } else {
                        degreeMove = (360 / data[0].playerCount) * (playerCount - 1);
                        speakOutput = `Ok, I will deal ${playerCardCount} cards for player ${playerCount}`;
                    }
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .addDirective(Util.build(endpointId, NAMESPACE, 'playerCard', {
                            'cardCount': playerCardCount,
                            'degreeMove': degreeMove
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
    playerCardHandler
};