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
                var precipProbability = resp['daily']['precipProbability'];
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