import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

    WebApp.addHtmlAttributeHook( () => {
          return {lang : "en"};
            });

      // code to run on server at startup


});

Meteor.publish('calculation', function (id) {
    return Calculations.find({_id: id, userId: this.userId});
});

Meteor.publish('calculations', function () {
    //TODO limit fields for this publication
    return Calculations.find({userId: this.userId});
});

Meteor.publish('scheme', function (id) {
    return Schemes.find({_id: id, userId: this.userId});
});

Meteor.publish('schemes', function () {
    //TODO limit fields for this publication
    return Schemes.find({userId: this.userId});
});
