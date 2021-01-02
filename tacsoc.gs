/*
 * Google script to send Google Form responses to Discord via webhook
 * Modified from https://github.com/Iku/Google-Forms-to-Discord for TACSoc
 */

/*************************** CONFIGURATION OPTIONS ***************************/

/* Webhook URL */
var POST_URL = "";

/* Specify the colour of the embed as 0xHEXCODE */
var COLOUR = 0x71FAD3;

/* Add the IDs of any roles you wish to mention */
var MENTION_ROLES = [
    "",
];

/* The following message will be sent along with the mentions */
var MESSAGE = "";


/* Discord question in form */
var discord = "What is your discord username? e.g. tacsoc#0001";

/* 
 * For any questions in the form you wish to display differently in the message,
 * please add in the below format:
 * 
 * "Question in form": "Question in message",
 */
var questions = {
    "What is your full name?": "Name",
    "What's your zID? (If not applicable, please write N/A)": "zID",
    "What is the name of your educational institution or workplace?": "Institution",
    "What degree are you studying?": "Degree",
    "What is your e-mail?": "E-mail",
    "What is your phone number? Don't worry, we won't spam you, we just need it for verification purposes.": "Phone",
};

/*****************************************************************************/

function onSubmit(e) {
    var form = FormApp.getActiveForm();
    var allResponses = form.getResponses();
    var latestResponse = allResponses[allResponses.length - 1];
    var response = latestResponse.getItemResponses();
    var items = [];
    var user = "";

    for (var i = 0; i < response.length; i++) {
        var question = response[i].getItem().getTitle().trim();
        if (question === discord) {
            user = response[i].getResponse();
            continue;
        }
        if (questions[question]) {
            question = questions[question]
        };

        var answer = response[i].getResponse();
        try {
            var parts = answer.match(/[\s\S]{1,1024}/g) || [];
        } catch (e) {
            var parts = answer;
        }

        if (answer === "") {
            continue;
        }
        for (var j = 0; j < parts.length; j++) {
            if (j === 0) {
                items.push({
                    "name": question,
                    "value": parts[j],
                    "inline": false
                });
            } else {
                items.push({
                    "name": question.concat(" (cont.)"),
                    "value": parts[j],
                    "inline": false
                });
            }
        }
    }

    var mentions = "<@&" + MENTION_ROLES.join("> <@&") + "> "

    var options = {
        "method": "post",
        "headers": {
            "Content-Type": "application/json",
        },
        "payload": JSON.stringify({
            "content": mentions + MESSAGE,
            "embeds": [{
                "title": user,
                "color": COLOUR,
                "fields": items
            }]
        })
    };

    UrlFetchApp.fetch(POST_URL, options);
};
