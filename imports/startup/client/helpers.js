Template.registerHelper("isSelected", (val, val2) => {
  if (val == val2)
    return "selected";
  return "";
});

Template.registerHelper("isSelectedSet", (collection, val) => {
  if(_.contains(collection, val))
    return "selected";
  return ""
});

//helper to simply use FlowRouter.path
Template.registerHelper("flowPath", (name, id) => {
    return FlowRouter.path(name, {id: id}, {});
});


Template.registerHelper("$eq", (a, b) => {
    return (a == b);
});

Template.registerHelper("isAdmin", () => {

  return (Meteor.user() && Meteor.user().profile.admin == 1);

});
