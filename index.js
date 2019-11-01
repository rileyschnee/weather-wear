const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello! Welcome to weather wear. Ask me for outfit suggestions based on the weather!';
        var isGeoSupported = context.System.device.supportedInterfaces.Geolocation;
        var geoObject = context.Geolocation;
        if (isGeoSupported) {
            var ACCURACY_THRESHOLD = 100; // accuracy of 100 meters required
            if (geoObject && geoObject.coordinate && 
                geoObject.coordinate.accuracyInMeters < ACCURACY_THRESHOLD ) { 
                // TODO: get the weather
                var resp = httpGet(geoObject['coordinate']['latitudeInDegrees'], 
                                   geoObject['coordinate']['longitudeInDegrees']);
                var precipProb = resp['daily']['precipProbability'];
                var windSpeed = resp['daily']['windSpeed'];
                var tempLow = resp['daily']['temperatureLow'];
                var tempHigh = resp['daily']['temperatureHigh'];
                var humidity = resp['daily']['humidity']
                var cloudCover = resp['daily']['cloudCover']
                console.log(geoObject);  // Print the geo-coordinates object if accuracy is within 100 meters
            }
        } else {
            speakOutput = 'I am experiencing issues connecting to your location.';
        }
	const repromptText = 'I prefer to wear scarves when it is windy. Would you like an outfit recommendation?'
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .getResponse();
    }
};
//Error Handler
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

function httpGetDS(lat, lon, callback) {
    var options = {
        host: 'https://api.darksky.net',
        path: '/forecast/' + encodeURIComponent(DARK_SKY) + '/' + encodeURIComponent(lat) + ',' + encodeURIComponent(lon),
        method: 'GET',
    };

    var req = http.request(options, res => {
        res.setEncoding('utf8');
        var responseString = "";
        
        //accept incoming data asynchronously
        res.on('data', chunk => {
            responseString = responseString + chunk;
        });
        
        //return the data when streaming is complete
        res.on('end', () => {
            console.log(responseString);
            callback(responseString);
        });

    });
    req.end();
}

// Recommendations
function getRecommendation(precipProb, windSpeed, tempLow, 
                            tempHigh, humidity, cloudCover) {
    var recommend = '';

    if(cloudCover < 0.2){
	recommend += 'Bring sunglasses'
    }

    if(precipProb >= 0.25 && tempLow >= 50){
        recommend += 'Bring an umbrella. ';
    } 

    if(precipProb >= 0.5 && tempLow >= 50){
        recommend += 'Wear a raincoat. ';
    }

    if(precipProb >= 0.75 && tempLow >= 50){
        recommend += 'Wear rainboots. ';
    }

    if(windSpeed >= 0.7){
        recommend += 'It is going to be windy. ';
    }

    if(tempLow <= 32){
        recommend += 'It is below freezing. Wear a heavy coat. ';
        if(windSpeed >= 0.7){
            recommend += 'Wear a scarf. ';
        }
        if(precipProb >= 0.5){
            recommend += 'Wear a fluffy hat. ';
        }
        if(precipProb >= 0.75){
            recommend += 'Wear snowboots. ';
        }
    }

    if(tempLow > 32){
        if(tempHigh < 55 && cloudCover > 0.4){
            recommend += 'It is going to be chilly. ';
            recommend += 'You should wear a medium-weight jacket and a scarf. ';
        }
        else { // if(tempHigh > 55){
            recommend += 'The weather is going to vary. ';
            recommend += 'You should wear layers. ';
        }
    }

    if(tempLow >= 55 && tempHigh < 70){
        if(tempHigh < 70 && cloudCover > 0.4){
            recommend += 'The weather will be nice! Wear what you would wear inside.';
        }
        else {
            recommend += 'The weather is going to vary. ';
            recommend += 'You should wear layers. ';
        }
    }

    if(tempHigh >= 80){
        if(windSpeed < 0.3 && cloudCover < 0.2){
            recommend += 'It will be brutally hot. Wear as little clothes as is socially acceptable. ';
        }
        else {
            recommend += 'It will be very hot, but there will be a breeze. Time for shorts. ';
        }
    }

    return recommend;
}


// Exit handler
const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};
// Session Ended Request Handler
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
}
//FallbackHandler
const FallbackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};
// Other
const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    ExitHandler,
    SessionEndedRequestHandler,
    FallbackHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
