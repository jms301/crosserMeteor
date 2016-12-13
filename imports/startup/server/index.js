import { Meteor } from 'meteor/meteor';



DDPRateLimiter.addRule({type: 'method'}, 10, 1000);
DDPRateLimiter.addRule({type: 'subscription'}, 10, 1000);
DDPRateLimiter.addRule({type: 'subscription', name: "working_tasks"}, 1, 5000);
DDPRateLimiter.addRule({type: 'subscription', name: "queued_tasks"}, 1, 5000);


Meteor.startup(() => {

    WebApp.addHtmlAttributeHook( () => {
          return {lang : "en"};
            });

      // code to run on server at startup


});

Meteor.publish('calculation', function (id) {
    return Calculations.find({_id: id});
});


//All calculations
Meteor.publish('calculations', function () {
  return Calculations.find({}, {fields: {name: 1, schemeId: 1}});
});

Meteor.publish('scheme', function (id) {
    //Only show details of a users own schemes
    return Schemes.find({_id: id, userId: this.userId});
});

Meteor.publish('schemes', function () {
    //Users can see all schemes names/versions/latest calculations
    return Schemes.find({}, {fields: {name: 1, version: 1, last_calc_id: 1}});
});

Meteor.publish('historic_schemes', function (id) {
  return SchemeHistory.find({schemeId: id }, {fields: {schemeId: 1, name: 1, version: 1, _id: 1}});

});

Meteor.publish('historic_scheme', function (id, ver) {
  return SchemeHistory.find({schemeId: id, version: parseInt(ver)});
});

Meteor.publish('historic_scheme_id', function (id) {
  return SchemeHistory.find({_id: id});
});
