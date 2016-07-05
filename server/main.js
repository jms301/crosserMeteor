import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

  WebApp.addHtmlAttributeHook( () => {
    return {lang : "en"};
  });

  // code to run on server at startup


});

