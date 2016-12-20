var noLogin = ["landing", "contact", "calculations", "calculation", "backup"];

Template.mainLayout.helpers({
  isInsecurePage : (page) => {
    if(_.contains(noLogin, page)) {
      return true;
    } else {
      return false;
    }
  }
});
