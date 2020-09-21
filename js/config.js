 console.log(window.origin);
/*
Specify your data here!
*/

var firstName = "Sam";
var lastName = "Swartzberg";
var description =
`The spooky place where I write about gender, the meaning of life, and whatever else needs to be said. BA Culture and Technology student, translator, and Japanese student by day.`;
var links = /* [text, href] */[
  ["Home page", "https://samswartzberg.com"],
  ["My papers", "https://samswartzberg.com/paper/"],
  ["me@samswartzberg.com", "mailto:me@samswartzberg.com"]];
var fullLegalName = "David Samuel Swartzberg";
var legalEmail = "me@samswartzberg.com";
var legalPhone = "+49 173 35 72";
var legalAdress = {
  street: "Bogenstraße 10",
  postalCode: "14169",
  city: "Berlin"
}
var logfileStorageDurationDays = 7;

/*
END
*/

/* Global Helpers /*/

function massReplaceInnerHTMLWithArgument(...args) {
  // requires arguments [selector, replacement]
  for (var [selector, replacement] of args) {
    document.querySelector(selector).innerHTML = replacement;
  }
}
