'use strict';
const Alexa = require('ask-sdk-core');
const Util = require('../util');

const pickupFiftyTwoHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' &&
            request.intent.name === 'pickupFiftyTwoIntent';
    },
    handle(handlerInput) {

        const speakOutput = `<speak><audio src="soundbank://soundlibrary/explosions/fireworks/fireworks_02"/></speak>`;

        // Get data from session attribute
        const attributesManager = handlerInput.attributesManager;
        const endpointId = attributesManager.getSessionAttributes().endpointId || [];
        const namespace = attributesManager.getSessionAttributes().namespace;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective(Util.build(endpointId, namespace, 'pickup52', {}))
            .getResponse();
    }
};



module.exports = {
    pickupFiftyTwoHandler,

};