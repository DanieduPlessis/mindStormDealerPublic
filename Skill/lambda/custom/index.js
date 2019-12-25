//
// Copyright 2019 Amazon.com, Inc. or its affiliates.  All Rights Reserved.
// These materials are licensed under the Amazon Software License in connection with the Alexa Gadgets Program.
// The Agreement is available at https://aws.amazon.com/asl/.
// See the Agreement for the specific terms and conditions of the Agreement.
// Capitalized terms not defined in this file have the meanings given to them in the Agreement.
//
'use strict';

const Alexa = require('ask-sdk-core');
const Common = require('./handlers/commonHandler');
const Launch = require('./handlers/launchRequestHandler');
const cardDeal = require('./handlers/cardDealHandler');
const pickup52 = require('./handlers/pickupFiftyTwoHandler');
const dealAgain = require('./handlers/dealAgainHandler');
const playerCard = require('./handlers/playerCardHandler');

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        Launch.LaunchRequestHandler,
        cardDeal.completeCardDealHandler,
        cardDeal.InProgressCardDealHandler,
        pickup52.pickupFiftyTwoHandler,
        dealAgain.dealAgainHandler,
        playerCard.playerCardHandler,
        Common.HelpIntentHandler,
        Common.CancelAndStopIntentHandler,
        Common.SessionEndedRequestHandler,
        Common.FallbackIntentHandler,
        Common.IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addRequestInterceptors(Common.RequestInterceptor)
    .addErrorHandlers(Common.ErrorHandler)
    .lambda();