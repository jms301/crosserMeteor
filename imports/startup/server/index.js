import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

    WebApp.addHtmlAttributeHook( () => {
          return {lang : "en"};
            });

      // code to run on server at startup


});

Meteor.publish('scheme', function (id) {
    return Schemes.find({_id: id, user_id: this.userId});
});

Meteor.publish('schemes', function (id) {
    //TODO limit fields for this publication
    return Schemes.find({user_id: this.userId});
});
