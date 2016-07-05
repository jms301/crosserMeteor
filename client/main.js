//import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import {default_resolution} from './imports/default.js';
import {default_species} from './imports/default.js';

Template.registerHelper("isSelected", (val, val2) => {
  if (val == val2)
    return "selected"
  return ""
});


Template.scheme.onCreated(function () {
  var self = this;

  self.autorun(function () {
    var schemeId = FlowRouter.getParam('schemeId');
    //TODO add subscription here!
  });
});

Template.scheme.helpers({
  scheme: () => {
    var schemeId = FlowRouter.getParam('schemeId');
    var scheme = Schemes.findOne({_id: schemeId}) || {};
    return scheme;
  },
  selectedSpecies: (species, currSpecies) => {
    return species.name == currSpecies ? "selected" : "";
    //console.log(species.name);

  },
  speciesList: () => {
    return _.map(default_species , (val, key, list) => {
      return {name: val.name, value: key};
    });
  }
});


//Helper function to update the simulation resolution drop down & custom boxes
var resetSimulationRes = function () {

  tolerance = $('input#tolerance').val();
  minPlants = $('input#min-plants').val();
  chunkSize = $('input#chunk-size').val();

  for (res in default_resolution) {
    if(chunkSize == default_resolution[res].convergence_chunk_size &&
       minPlants == default_resolution[res].convergence_fewest_plants &&
       tolerance == default_resolution[res].convergence_tolerance) {


      $('select#resolution').val(res);
      return
    }

  }
  //else
  $('select#resolution').val('custom');

};

Template.scheme.onRendered(() => {
  /*self.autorun(() => {
    resetSimulationRes();
    TODO this will not work till you remvoe auto-publish since otherwise
    no way to tell when the data is good
  });*/
});

Template.scheme.events({
  //Config:
  "change select#species" : (evt, inst) => {

    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : {species : default_species[evt.target.value]}});

    //TODO refresh loci settings

  },
  "change input#chunk-size" : (evt, inst) => {
    toSet = {};
    toSet['system.convergence_chunk_size'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet});
    resetSimulationRes();
  },
  "change input#tolerance" : (evt, inst) => {
    toSet = {};
    toSet['system.convergence_tolerance'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet});
    resetSimulationRes();
  },
  "change input#min-plants" : (evt, inst) => {
    toSet = {};
    toSet['system.convergence_fewest_plants'] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet});
    resetSimulationRes();
  },
  //Plants:
  "click button#add-parent" : () => {
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$push : {'plants': {'name':'', 'loci' : []}}});
  }
});

Template.simulationResolution.onRendered(() => {


});

Template.simulationResolution.events({
  "change select#resolution" : (evt, inst) => {
    if(evt.target.value == 'custom') {


    } else {
      values = default_resolution[evt.target.value];

      Schemes.update({_id: FlowRouter.getParam('schemeId')},
        {$set : {
          "system.convergence_chunk_size" : values.convergence_chunk_size,
          "system.convergence_tolerance"  : values.convergence_tolerance,
          "system.convergence_fewest_plants"  : values.convergence_fewest_plants
        }
      });
    }
  }
});

Template.cross.helpers({
  optionsForSelect: (cross) => {

  },


});


Template.plant.events({

  "click button.delete-parent" : (evt, inst) => {

    toDel = {};
    toDel["plants."+inst.data.pi] = "";
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$unset: toDel});
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$pull: {"plants" : null }});

  },
  "click button.add-locus" : (evt, inst) => {
    toAdd = {};
    toAdd["plants."+inst.data.pi + ".loci"] = {
        "name" : "",
        "type" : "Marker",
        "location" : null,
        "linkage_group" : null};
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$push : toAdd});
  },
  "change input.parent-name" : (evt, inst) => {
    toSet = {};
    toSet["plants."+inst.data.pi + ".name"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$set : toSet});
    //TODO Update the lists of plants in crosses & Charts

  }
});

Template.loci.events({
  "click button.delete-loci" : (evt, inst) => {
    toDel = {};

    toDel["plants."+inst.data.pi + ".loci."+inst.data.li] = "";
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$unset: toDel});

    toDel = {};
    toDel["plants."+inst.data.pi + ".loci"] = null;

    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$pull: toDel});

  },
  "change input.loci-name" : (evt, inst) => {
    toSet = {};
    toSet["plants."+inst.data.pi + ".loci."+inst.data.li +
      ".name"] = evt.target.value;
    Schemes.update({_id: FlowRouter.getParam('schemeId')},
      {$set : toSet});
    //TODO Update the lists of Loci in crosses & Charts
  },
  "change select.loci-type" : (evt, inst) => {
    toSet = {};
    toSet["plants."+inst.data.pi + ".loci."+inst.data.li +
      '.type'] = evt.target.value;

    Schemes.update({_id: FlowRouter.getParam('schemeId')},
     {$set : toSet });

  }

});

Template.loci.helpers({
  "linkageGroupMax" : function () {
    var schemeId = FlowRouter.getParam('schemeId');
    var scheme = Schemes.findOne({_id: schemeId}) || false;

    if(scheme)
      return scheme.species.chromosome_lengths.length;
    else
      return "?";
  },
  "positionMax" : function (group) {
    var schemeId = FlowRouter.getParam('schemeId');
    var scheme = Schemes.findOne({_id: schemeId}) || false;
    console.log(group);

    if(scheme && group)
      return scheme.species.chromosome_lengths[group];
    else
      return "?"

  }

});
