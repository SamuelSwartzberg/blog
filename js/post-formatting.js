let docLang = document.querySelector('html').lang;

/* Helper Methods */

function formatCSLLocale(twoLetterSpecifier) {
  let region = twoLetterSpecifier ==="en" ? "US" : twoLetterSpecifier.toUpperCase();
  return `${twoLetterSpecifier}-${region}`;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/* from https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro */
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

/* TOC */

if(!document.querySelector('html.notoc')){
  tocbot.init({
    // Where to render the table of contents.
    tocSelector: '#table-of-contents',
    // Where to grab the headings to build the table of contents.
    contentSelector: '#main-article',
    // Which headings to grab inside of the contentSelector element.
    headingSelector: 'h2, h3, h4, h5, h6',
    // For headings inside relative or absolute positioned containers within content.
    hasInnerContainers: true,
    // How many heading levels should not be collapsed.
  // For example, number 6 will show everything since
  // there are only 6 heading levels and number 0 will collapse them all.
  // The sections that are hidden will open
  // and close as you scroll to headings within them.
    collapseDepth: 6,
    scrollSmooth: false
  });
}

// Including authors both in document <head> as well as in the header of the post

let authorArray = document.querySelector('#author-array').content.split(',');
let documentHeaderAuthors = document.querySelector('#authors');
let head = document.querySelector('head');
let sortedAuthors = [];
let authors = [];
documentHeaderAuthors.innerHTML="";

for (let author of authorArray) {
  if (author==="site" || !author) author = firstName + " " + lastName; // The user can just enter 'site' as the author in their post, if they don't want to type their own name
  author = author.trim(); // Remove unneccesary whitespace
  head.appendChild(htmlToElement(`<meta name="author" content="${author}">`)); // append the author to the <head>. As far as the <head> is concerned, we're now done

  let authorNameArray = author.split(" ");
  sortedAuthors.push(authorNameArray[authorNameArray.length-1]); // We assume that the last name specified is the Authors last name, by which we will later sort
  authors.push(authorNameArray); // to be able to retrieve the author by name later, we store all the authors names as an array within a container array
}

sortedAuthors = sortedAuthors.sort();
for (var sortedAuthor of sortedAuthors) {// for each of the alphabetically sorted last names
  let authorEle = authors.find(element => element[element.length-1]===sortedAuthor); // get the authors full name from their last name
  documentHeaderAuthors.appendChild(htmlToElement(`<span class="author">${authorEle.join(" ")}</span>`)); // add the author as the last child of the list of authors
}
document.querySelector('#author-array').outerHTML=""; // Since everything has gone well, we can now delete the author array that originally contained the names unsorted

// Fix the problem of overly big headers and overflowing words
let h1 = document.querySelector('h1');
if (h1.innerHTML.length>85) {h1.classList.add("shrink-header")};
for (var word of h1.innerHTML.split(" ")) {
  if (word.length>12) h1.innerHTML = h1.innerHTML.replace(word, word.substring(0,6)+"&shy;"+word.substring(6,word.length-1));
}
document.querySelector('.site-name').innerHTML = `<span class='name first-name'>${firstName}</span><span class='name last-name'>${lastName}</span>`;

// Citations

let localCitationMap = new Map();
let cslLocale = formatCSLLocale(docLang);


/* handle c::something;; style citations */

document.querySelectorAll('body').forEach((item, i) => { // handles the unlikely case that there are two or more <body>s ;)
  let htmlContent = item.innerHTML; // get the entire html of the body
  if(htmlContent.includes("c::")){ // It's trying to cite via the global citation store - if not, we can save all this effort
    let citations=htmlContent.split("c::");
    htmlContent = citations[0]; // this is everything before the first citations
    for (let citation of citations.slice(1)) { //citations.slice(1) since the first element of citations does not actually contain a citation
      if (!citation){continue;} // this handles the case of c::c::
      let citationString = citation.split(";;")[0]; //;; delimits the end of a citation
      if (citationString.includes(" ")){
        console.log(citationString);
        throw new Error("Citation string includes a space. Perhaps you forgot to terminate the citation with ';;'?");}
      // Handle page number:
      let pageNumber = citationString.includes(":") ? citationString.split(":")[1] : false;
      citationString=citationString.split(":")[0];
      localCitationMap.set(citationString, citationMap.get(citationString));
      let formattedCitation = `<span class="citation"><span class="citation-inner">${citationString}</span></span>${pageNumber ? "<span class='page-number'>"+pageNumber+"</span>" : ""}`; //format it as as an APA citation
      htmlContent = htmlContent.concat(formattedCitation,...citation.split(";;").slice(1)); //rejoin everything we sliced off
    }
  }
  item.innerHTML = htmlContent; // finally, make the site html the html we modified
});

/* Deal with multiple of the same Author (year) */

for (var citationObject of localCitationMap.values()) {
  if (!citationObject["note"]){
    let isNonUnique = false; // In theory, every work is the (YYYYa) version by default, but of course we only want to show it as that if there are multiple author(year)
    let counter = 1;
    localCitationMap.forEach((filteredCiteObj, key) => {
      if (citationObject !== filteredCiteObj){ // prevent false positives from self-identity
        if (citationObject.author && filteredCiteObj.author && citationObject.issued && filteredCiteObj.issued){ // if the relevant properties even exist
          if ((citationObject.author[0].family === filteredCiteObj.author[0].family)
          && (citationObject.issued["date-parts"][0][0] === filteredCiteObj.issued["date-parts"][0][0])){ //author (year) is the same
            isNonUnique = true; // there was a b (at least)
            filteredCiteObj["note"]=String.fromCharCode(97 + counter); //will start at b and cout up
            counter++;
          }
        }
      }
    });
    if (isNonUnique) citationObject["note"]=String.fromCharCode(97); // if there was a b, we need an a
  }
}

document.querySelectorAll('.citation-inner').forEach((item, i) => {
  let citation = new Cite(citationMap.get(item.innerHTML));
  item.innerHTML = citation.format('citation', {format: 'html', template: 'apa-modified-year', lang: cslLocale});

});


/* get the boolean attributes that tell us we should skip generating footnotes or figures */

let noFootnotes = document.querySelector('html').classList.contains('nofootnotes');
let noFigures = document.querySelector('html').classList.contains('nofigures');

/* Footnotes */

var footnoteCounter = 0;
if (!noFootnotes){
  let selector = 'p, ul, ol, table';
  document.querySelectorAll('p, ul, ol, table').forEach((item, i) => {
    if (!item.querySelector(selector)){ //This one will come later, we need to avoid duplicate
      // create the footnotes both in the text and in the footnote container
      item.innerHTML = item.innerHTML.replace(/ ?fnv?:\{([^\}]+)\}/g, (match, footnoteContent) => {
        footnoteCounter++;
        footnoteContent = capitalizeFirstLetter(footnoteContent);
        let footnoteClasslist = ""
        if (match.includes("fnv:{")) footnoteClasslist+="cf";
        match.includes("school") ? console.log(match) : "";
        let bottomFootnote = htmlToElement(`<li id="fn-${footnoteCounter}-content" class="footnote-bottom ${footnoteClasslist}"><a class="footnote" href="#fn-${footnoteCounter}">${footnoteCounter}</a><span class="footnote-content">${footnoteContent}</span></li>`);
        document.querySelector('.footnote-container ol').appendChild(bottomFootnote);
        return `<a class="footnote footnote-inline" id="fn-${footnoteCounter}" href="#fn-${footnoteCounter}-content">${footnoteCounter}</a> `
        });
      }
    //Fix weird interaction between blockquotes and footnotes
    document.querySelectorAll('blockquote p a.footnote').forEach((footnote, i) => {
      let parent = footnote.parentNode;
      while (parent.nodeName !== "BLOCKQUOTE"){
        parent = parent.parentNode;
      }
      let newFootnote = footnote.cloneNode(true);
      parent.appendChild(newFootnote);
      footnote.remove();
    });

  });
}

let previousCitation = "";

// Replace subsequent entries of the same author in footnotes with ibid/ebd.

document.querySelectorAll('.footnote-container li > span').forEach((item, i) => {
    item.querySelectorAll('.citation').forEach((item, i) => {
      let currentCitation = item.innerHTML;
      if (previousCitation === currentCitation ){
        item.classList.add("ibid");
      }
      previousCitation = currentCitation;
    });
    if (!item.querySelector('.citation')) previousCitation = ""; //if there is a footnote with something else inbetween, don't use ibid

});


if(footnoteCounter===0){
  document.querySelector('.footnote-container').style.display = "none";
}

//Figures
if (!noFigures){
  document.querySelectorAll('p, ul, ol, table').forEach((item, i) => {
    let fileLocation = document.location.href.split('.html')[0];
    item.innerHTML = item.innerHTML.replace(
      /fig:\{([^:]*):([^:]+):([^:]+):([^:]+?)(:[^\}\{]*?)?\}/g, // Ugly regex matches figure syntax
      (match, captionText, side, size, url, moreUrls) => {
        var urlString = "";
        if(moreUrls){
          moreUrls = moreUrls.slice(1);
          let urlArray = moreUrls.split(":");
          for (let urlElement of urlArray) {
            if(urlElement){
              urlString += `<img src="${fileLocation}/${urlElement}" alt="${captionText}">`;
            }

          }
        }
        let figureText =
        `<figure class="${side}" style="--size: ${size}%">
          <div class="image-container">
            <img src="${fileLocation}/${url}" alt="${captionText}">
            ${urlString}
          </div>
          ${captionText!==""?("<figcaption>" + captionText +"</figcaption>"):""}
        </figure>`
        return figureText;
      }
    );
  });

  // Move the figures out of containers into the main article container to prevent figures being stuck in elements that only permit phrasing content.
  document.querySelectorAll('figure').forEach((item, i) => {
    let newItem = item.cloneNode(true);
    if(!item.parentNode.matches("#main-article")){
      item.parentNode.before(newItem);
      item.remove()};

  });
}

// bibliography

let sortCitations = function (a, b) {
  let citationObjectA = a[1];
  let citationObjectB = b[1];
  let citObjAFamily = citationObjectA.author[0].family || citationObjectA.author[0].literal;
  let citObjBFamily = citationObjectB.author[0].family || citationObjectB.author[0].literal;
  if (citObjAFamily > citObjBFamily){
    return 1; // b is earlier in the alphabet and comes first
  } else if (citObjAFamily === citObjBFamily){
    if (Number(citationObjectA.issued["date-parts"][0]) > Number(citationObjectB.issued["date-parts"][0])){
      return 1;
    } else if (Number(citationObjectA.issued["date-parts"][0]) === Number(citationObjectB.issued["date-parts"][0])){
      if (citationObjectA.note && citationObjectB.note
      && citationObjectA.note > citationObjectB.note){
        return 1;
      } else if (citationObjectA.note < citationObjectB.note){
        return -1;
      } else {
        return 0;
      }
    } else {
      return -1;
    }
  } else {
    return -1;
  }
}

let bibliographyContainerList = document.querySelector('#bibliography-container ol');
let citationMapEntriesArray = Array.from(localCitationMap.entries());
let sortedCitedKeys = citationMapEntriesArray.sort(sortCitations).map(keyValArr => keyValArr[0]);
for (let citedWork of sortedCitedKeys) {
  if (!citedWork){continue;} //we don't care about empty strings / undefined / whatever
  let citedWorkObject = new Cite(localCitationMap.get(citedWork));
  bibliographyContainerList.appendChild(
    htmlToElement(`<li> ${
      citedWorkObject.format(
        'bibliography',
        {format: 'html', template: 'apa-modified-year', lang: cslLocale}
      )} </li>`
    )
  );
}

//Capitalize .ebd
document.querySelectorAll('.footnote-bottom:not(.cf) .footnote-content').forEach((item, i) => {
  if (item.childNodes&&item.childNodes[0]&&item.childNodes[0].classList && item.childNodes[0].classList.contains("ibid")){
    item.childNodes[0].classList.add("capitalize");
  }
});

//Remove the dot from ibid if it is the last item, since it will already recieve the footnote-ending dot
document.querySelectorAll('.footnote-bottom .footnote-content').forEach((item, i) => {
  if (item.childNodes&&item.childNodes[item.childNodes.length-1]&&item.childNodes[item.childNodes.length-1].classList&&item.childNodes[item.childNodes.length-1].classList.contains("ibid")){
    item.childNodes[item.childNodes.length-1].classList.add("nodot");
  }
});

// Highlight things

function highlightThingsMatchingSelector(selector){
  document.querySelectorAll(selector).forEach((item, i) => {
    item.classList.toggle("highlight");
  });
}
function toggleActive(element){
  element = element.matches("a") ? element : element.closest("a");
  element.classList.toggle("active");
}


// Highlight Programmatic Quotes

document.querySelector('.quote-highlighter').onclick = (event) => {
  highlightThingsMatchingSelector("blockquote,q")
  toggleActive(event.target);
  };

// Highlight footnotes

document.querySelector('.footnote-highlighter').onclick = (event) => {
  highlightThingsMatchingSelector(".footnote")
  toggleActive(event.target);
};


// Allow Spellcheck

document.querySelector('.spellcheck').onclick = (event) => {
  let mainArticle = document.querySelector('#main-article');
  mainArticle.toggleAttribute("contenteditable");
  mainArticle.spellcheck = mainArticle.spellcheck ? "false" : "true"; // spellcheck is enumerated
  toggleActive(event.target);
}

document.querySelector('.font-selector').onchange = (event) => {
  let siteContainer = document.querySelector('.site-container');
  for (let option of event.target.children) {
    siteContainer.classList.remove(option.value);
  }
  siteContainer.classList.add(event.target.value);
}

// Hide elements

document.querySelector('.hide-selector').onclick = () => {
  let selector = window.prompt("Enter a selector to delete these Elements from the DOM", "<selector>");
  try {
    document.querySelectorAll(selector).forEach((item, i) => {
      item.outerHTML="";
    });
  } catch (e) {
    console.log(e);
  }
}

// delete bibliography container

if(bibliographyContainerList.children.length === 0){
  document.querySelector('#bibliography-container').outerHTML = "";
}

// cleanup: If paragraphs only contain whitespace or <br>s, delete theme
document.querySelectorAll('p').forEach((item, i) => {
  let trimmedInnerHTML = item.innerHTML.trim();
  if (trimmedInnerHTML==="") // was only whitespace
    item.outerHTML = "";
  else if (trimmedInnerHTML.match(/^(<br>)+$/))
    item.outerHTML = "";
});
