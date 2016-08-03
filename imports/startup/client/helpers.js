Template.registerHelper("isSelected", (val, val2) => {
    if (val == val2)
          return "selected"
            return ""
});

//helper to simply use FlowRouter.path
Template.registerHelper("flowPath", (name, id) => {

    return FlowRouter.path(name, {id: id}, {});

});


Template.registerHelper("$eq", (a, b) => {

    return (a == b);
});

