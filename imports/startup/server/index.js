import { Meteor } from 'meteor/meteor';



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

Meteor.publish('running_calculations', function () {
    //TODO limit fields for this publication
    //TODO limit this to runing calculations!
    return Calculations.find({});
});

Meteor.publish('scheme', function (id) {
    return Schemes.find({_id: id, userId: this.userId});
});

Meteor.publish('schemes', function () {
    //TODO limit fields for this publication
    return Schemes.find({userId: this.userId});
});
