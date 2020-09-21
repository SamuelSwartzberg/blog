function testFootnoteCountMatch() {
  let bottomFootnoteAmount = document.querySelectorAll('.footnote-bottom').length;
  let inlineFootnoteAmount = document.querySelectorAll('.footnote-inline').length;
  if (bottomFootnoteAmount !== inlineFootnoteAmount){
    throw new Error(`There are ${bottomFootnoteAmount} bottom footnotes, but ${inlineFootnoteAmount} inline footnotes.`)
  }
}

function testDoubleSpace(){
  let counter = 0;
  document.querySelectorAll('p, ul, ol, figcaption, h1, h2, h3, h4, h5, h6, blockquote').forEach((item, i) => {
    if (item.innerText.includes("  ")){
      console.log(`Found double whitespace in ${item.innerText}`);
      counter++;
    }
  });
  console.log("Found " + counter + " double spaces.");
  return counter;
}

testFootnoteCountMatch();
testDoubleSpace();
