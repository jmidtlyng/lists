import { Meteor } from 'meteor/meteor';
import AWS from 'aws-sdk';
//import { Accounts } from 'meteor/accounts-base';


/*Accounts.config({
    forbidClientAccountCreation: true,
});*/

Meteor.startup(function() {
    //process.env.MAIL_URL = Meteor.settings.sendgrid_smtp;

    AWS.config.update({
        accessKeyId: Meteor.settings.AWSAccessKeyId,
        secretAccessKey: Meteor.settings.AWSSecretAccessKey,
        region: Meteor.settings.Region,
    });
});
