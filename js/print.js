function promptAndHide(selector, shortName){
  let hideChar = window.prompt(`Do you want to (s)how the ${shortName}, or (h)ide it?`, "h");
  hideChar = hideChar.trim().substring(0,1).toLowerCase();
  if (hideChar==="h") document.querySelector(selector).outerHTML = "";
}

document.querySelector('.print-pager').onclick = () => {

  promptAndHide(".info", "info container containing abstract, date, and authors");
  promptAndHide("#table-of-contents", "table of contents");

  document.querySelectorAll('.footnote-inline').forEach((item, i) => {
    let bottomFootnote = document.querySelector("#"+item.href.split("#")[1]);
    let footnoteWithContent = `<span id="${bottomFootnote.id}" class="${bottomFootnote.classList.value}">${bottomFootnote.innerHTML}</span>`;
    if (item.closest("p")
    && (
      item.closest("p").lastChild === item
      || (
        item.closest("p").lastChild.textContent.trim()===""
        && item.closest("p").childNodes[item.closest("p").childNodes.length-2] === item
        )
      )
    ){
      console.log("paragraph-final footnote");
      item.closest("p").outerHTML += footnoteWithContent;
    } else {
      item.outerHTML += footnoteWithContent;
    }
  });
  document.querySelector('.footnote-container').outerHTML = "";
  document.querySelector('body').classList.add("page-view");
  window.PagedPolyfill.preview();
  Paged.registerHandlers(class extends Paged.Handler {
    constructor(chunker, polisher, caller) {
      super(chunker, polisher, caller);

    }

    afterRendered(pages) {

      setTimeout(function(){ // for bugtesting purposes
        for (var page of pages) {
          if(page.element){
            let toclist = page.element.querySelector('#table-of-contents .toc-list');
            let toc = page.element.querySelector('#table-of-contents');
            if( toc && toclist ){
              toclist.querySelectorAll('ol').forEach((orderedListItem, i) => {
                orderedListItem.style.counterIncrement = "none";
                orderedListItem.style.counterReset = "section-counter 0";
                console.log(orderedListItem);
              });
              toc.querySelectorAll('li').forEach((listItem, i) => {
                listItem.style.counterIncrement = "section-counter";
                console.log(listItem);
              });
            }
          }


          var footnotes = page.element.querySelectorAll('.footnote-bottom');
          console.log(page);
          if (footnotes.length === 0) {
            continue;
          }

          var pageContent = page.element.querySelector('.pagedjs_page_content');
          var hr = document.createElement('hr');
          var footnoteArea = document.createElement('div');

          pageContent.style.display = 'flex';
          pageContent.style.flexDirection = 'column';

          hr.className = 'footnote-break';
          hr.style.marginTop = 'auto';
          hr.style.paddingTop = "0.5em";
          hr.style.marginBottom = "1em";
          hr.style.marginLeft = 0;
          hr.style.marginRight = 'auto';
          hr.style.width = "20%";
          pageContent.appendChild(hr);

          footnoteArea.className = 'footnote-area';
          pageContent.appendChild(footnoteArea);

          for (var footnote of footnotes) {

            footnoteArea.appendChild(footnote);

          }
        }
    }, 0);
    }
  });
}
