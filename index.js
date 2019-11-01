const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello! Welcome to weather wear!';
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
        return handlerInput.responseBuilder
            .speak(speakOutput)
            // .reprompt(speakOutput)
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

function getRecommendation(precipProb, windSpeed, tempLow, 
                            tempHigh, humidity, cloudCover) {
    var recommend = '';
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
        if(tempHigh < 55){
            recommend += 'It is going to be chilly. ';
            recommend += 'You should wear a medium-weight jacket and a scarf. ';
        }
        else { // if(tempHigh > 55){
            recommend += 'The weather is going to vary. ';
            recommend += 'You should wear layers. ';
        }
    }
    if(tempLow >= 55 && tempHigh < 70){
        if(tempHigh < 70){
            recommend += 'The weather will be nice! Wear what you would wear inside.';
        }
        else {
            recommend += 'The weather is going to vary. ';
            recommend += 'You should wear layers. ';
        }
    }
    if(tempHigh >= 80){
        if(windSpeed < 0.3){
            recommend += 'It will be brutally hot. Wear as little clothes as is socially acceptable. ';
        }
        else {
            recommend += 'It will be very hot, but there will be a breeze. Time for shorts. ';
        }
    }
    return recommend;
}




