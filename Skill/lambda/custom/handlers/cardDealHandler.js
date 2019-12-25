'use strict';
const Alexa = require('ask-sdk-core');
const Util = require('../util');
const dbHelper = require('../helpers/dbHelper');

const completeCardDealHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' &&
            request.intent.name === 'cardDealIntent' &&
            request.dialogState === 'COMPLETED';
    },
    async handle(handlerInput) {


        let cardCount = Alexa.getSlotValue(handlerInput.requestEnvelope, 'cardCount');
        let gameType = Alexa.getSlotValue(handlerInput.requestEnvelope, 'gameType');
        let count = Alexa.getSlotValue(handlerInput.requestEnvelope, 'count');
        let userID = handlerInput.requestEnvelope.context.System.user.userId;

        const speakOutput = `Ok, I will deal ${cardCount} cards for ${count} players`;

        // Get data from session attribute
        const attributesManager = handlerInput.attributesManager;
        const endpointId = attributesManager.getSessionAttributes().endpointId || [];
        const namespace = attributesManager.getSessionAttributes().namespace;

        return dbHelper.addDealDetails(cardCount, count, gameType, userID)
            .then((data) => {
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .addDirective(Util.build(endpointId, namespace, 'deal', {
                        'cardCount': cardCount,
                        'gameType': gameType,
                        'count': count
                    }))
                    .getResponse();
            })
            .catch((err) => {
                console.log("Error occurred while saving data", err);
                const speechText = "we cannot save your data right now. Try again!";
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .getResponse();
            });


    }
};

const InProgressCardDealHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' &&
            request.intent.name === 'cardDealIntent' &&
            request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        let prompt = '';

        for (const slotName in currentIntent.slots) {
            if (Object.prototype.hasOwnProperty.call(currentIntent.slots, slotName)) {
                const currentSlot = currentIntent.slots[slotName];
                if (currentSlot.confirmationStatus !== 'CONFIRMED' &&
                    currentSlot.resolutions &&
                    currentSlot.resolutions.resolutionsPerAuthority[0]) {
                    if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
                        if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 0) {
                            if (currentSlot.name === 'gameType') {
                                currentIntent.slots.cardCount.value = 5;
                            }


                            return handlerInput.responseBuilder
                                .addDelegateDirective(currentIntent)
                                .getResponse();
                        }
                    } else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {

                        return handlerInput.responseBuilder
                            .speak(prompt)
                            .reprompt(prompt)
                            .addElicitSlotDirective(currentSlot.name)
                            .getResponse();

                    }
                } else {
                    if (currentIntent.slots.cardCount.value) {
                        currentIntent.slots.gameType.value = 'custom hand';
                        return handlerInput.responseBuilder
                            .addDelegateDirective(currentIntent)
                            .getResponse();
                    }
                }
            }
        }

        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    },
};

module.exports = {
    completeCardDealHandler,
    InProgressCardDealHandler
};