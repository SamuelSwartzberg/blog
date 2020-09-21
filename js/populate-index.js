/* Select the DOM Nodes */

let documentTitle = document.querySelector('title');
let metaDescription = document.querySelector('meta[name=description]');
let profileImage = document.querySelector('.profile-image');
let nameHeader = document.querySelector(".name-header");
let contactLinkList = document.querySelector(".contact-link-list");
let personDescription = document.querySelector(".person-description");

/* Populate the <head> */

documentTitle.innerHTML= `${firstName} ${lastName}'s Papers`;
metaDescription.content= description;

/* Populate the index.html header
Find the values in config.js */

nameHeader.innerHTML = `<span class='name first-name'>${firstName}</span><span class='name last-name'>${lastName}</span>`;
profileImage.alt= `A picture of ${firstName} ${lastName}.`;

/* Populate the list of links in the index.html header */

let linkListInnerHTML = "";
for (var [text, href] of links) {
  linkListInnerHTML += `<li><a href='${href}'>${text}</a></li>`
}
contactLinkList.innerHTML = linkListInnerHTML;

/* Populate the description in the index.html header */

let descriptionLineArray = description.split('\n');
let descriptionInnerHTML = "";
for (var line of descriptionLineArray) {
  descriptionInnerHTML += `<p>${line}</p>`;
}
personDescription.innerHTML = descriptionInnerHTML;
