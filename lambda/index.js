/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require("ask-sdk-core");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Hallo, frage einfach nach einem Material und ich kann dir die Position verraten.";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const getCanonicalSlot = (slot) => {
    if (slot.resolutions && slot.resolutions.resolutionsPerAuthority.length) {
        for (let resolution of slot.resolutions.resolutionsPerAuthority) {
            if (resolution.status && resolution.status.code === 'ER_SUCCESS_MATCH') {
                return resolution.values[0].value.name;
            }
        }
    }
}

/* *
 *
 * */
const GetMaterialLocationIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "GetMaterialLocationIntent"
    );
  },
  handle(handlerInput) {
    var speakOutput = "";
    var result;

    var materialName = Alexa.getCanonicalSlot(Alexa.getSlot(handlerInput.requestEnvelope), "materialType");
      //handlerInput.requestEnvelope.request.intent.slots.material.value;
    var materialID =
      handlerInput.requestEnvelope.request.intent.slots.material.resolutions
        .resolutionsPerAuthority[0].values[0].value.id;

    speakOutput = `Das Material mit dem Namen ${materialName} hat die ID ${materialID}`;

    var locations = require("./documents/Material-config.json");
    console.log(locations);

    //Loop through all materials and check if any id equals the requested one
    for (var i = 0; i < locations.length; i++) {
      if (locations[i].id == materialID) {
        result = locations[i];
      }
    }

    //store data from requested material in these variables and print them to the console
    var box = result.box;
    var location = result.location;
    console.log("box:", box);
    console.log("location:", location);
    
    //check if the string "location" is not empty / not null
    if (location) {
        if (box >= 0) {
            speakOutput = `Das Material ${materialName} befindet sich, im ${location}, in Kiste Nummer ${box}`; //location and box number valid
        } else {
            speakOutput = `Das Material ${materialName} befindet sich, im ${location}. Ihm ist keine Kiste zugeordnet`; //location, but no valid box number
        }
    } else {
        if (box >= 0) {
            speakOutput = `Dam Material ${materialName} ist kein Raum zugewiesen, aber die Kiste Nummer ${box}`; //invalid locatino, but valid box number
        } else {
            speakOutput = `Das Material ${materialName} fliegt irgendwo rum. Es hat keine Kiste, keinen Raum, keine Freunde.`; //invalid location and invalid box number
        }
    }
    
    //Save speakOutput to Attributes to recall it later
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.lastResult = speakOutput;
    handlerInput.attributesManager.getSessionAttributes(attributes);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Kann ich dir sonst noch weiter helfen?")
      .getResponse();
  },
};

const RepeatIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.RepeatIntent"
    );
  },
  handle(handlerInput) {
    var speakOutput =
      "Oh nein. Ich kann mich nicht daran erinnern, was ich zuletzt gesagt habe.";
     
    //Recall from Attributes  
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    
    if (attributes.lastResult) {
        speakOutput = "Alles Klar hier die Wiederholung:" + attributes.lastResult;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const ThankYouIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" && Alexa.getIntentName(handlerInput.requestEnvelope) === "ThankYouIntent");
    },
    handle(handlerInput) {
        const speakOutput = "Ich helfe gerne."
        
        return handlerInput.responseBuilder.speak(speakOutput).reprompt(speakOutput).getResponse();
    }
}


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Hallo, frage einfach nach einem Material und ich kann dir die Position verraten.";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Auf Wiedersehen!";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = `Herzlichen Glückwunsch! Du hast es Geschaft etwas zu sagen, was dieser arme FallbackIntentHandler händeln muss.
        Da hat mein Erbauer wohl etwas nicht ganz durchdacht. Beschwer dich einfach bei ihm.
        Fallback.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log(
      `~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    //const speakOutput = `Oh nein! Du hast einen Error ausgelöst! Nicht nur eine Einfache Exception, sondern einen Error. Aktiviere Selbstzerstörung in 3, 2 - nein Spaß. Versuche es einfach noch einmal. Sollte der Fehler weiterhin auftreten, dann kontaktiere meinen Erbauer!`;
    //const speakOutput = `Hamm wir nicht Willst du noch einen Porsche, du Hu ren sohn?`;
    const speakOutput = `Hamm wir nicht, willst du stattdessen einen Porsche? Noch so eine Frage und du kriegst Tischdienst!`;
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetMaterialLocationIntentHandler,
    RepeatIntentHandler,
    ThankYouIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent("sample/hello-world/v1.2")
  .lambda();
