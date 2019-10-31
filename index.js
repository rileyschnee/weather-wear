const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello! Welcome to weather wear!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            // .reprompt(speakOutput)
            .getResponse();
    }
};
