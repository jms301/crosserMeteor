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

//All Calculations for a scheme
Meteor.publish('schemes_calc_list', function (_id) {
    //TODO limit fields for this publication
    return Calculations.find({schemeId: _id});
});

Meteor.publish('top_calc_list', function () {

	var self = this;
  //TODO limit fields for this publication
  var published = [];


  const handle = Schemes.find().observeChanges({
		added: function (id, fields) {
			if(fields.last_calc_id) {
				doc = Calculations.findOne({_id: fields.last_calc_id});
				self.added("calculations", doc._id, doc);
			}
		},
		changed: function (id, fields) {
			if(fields.last_calc_id) {
				doc = Calculations.findOne({_id: fields.last_calc_id});
				self.added("calculations", doc._id, doc);
			}
		}
	});

	self.ready();

	self.onStop( () => { handle.stop(); });

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
