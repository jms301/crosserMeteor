var noLogin = ["landing", "contact", "calculations"];

Template.mainLayout.helpers({
  isInsecurePage : (page) => {
    if(_.contains(noLogin, page)) {
      return true;
    } else {
      return false;
    }
  }
});
