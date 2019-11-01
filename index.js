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

function httpGet(query, callback) {
    var options = {
        host: 'numbersapi.com',
        path: '/' + encodeURIComponent(query),
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