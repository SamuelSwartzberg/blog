#!/usr/bin/env bash
POSTS=(posts/*.md)
echo "<!-- This is the generated index.html. Any edits here will be overwritten! -->" > index.html #add a warning to the generated index.html
cat templates/_index.html >> index.html # add the content of the master index.html file to the generated one
echo "" > sitemap.txt
for (( i = 0; i < ${#POSTS[@]}; i++ )); do
  HEADER=$(head -n 6 ${POSTS[i]}) # Get the first three lines, which are header lines
  IFS=$'\n' # Make the field separator a newline
  read -rd '' -a headerLineArray <<<"$HEADER"  # Split them into an array
  postTemplate=$(cat templates/post-item-template.html) # get the html post template
  cat templates/markdown-template.html > "${POSTS[i]%.md}temp.html" # Add the content of the template for the markdown post to a temp file , which will now be filled
  noPreview=false # By default, items have previews (the snippets in index.html)
  for (( j = 0; j < ${#headerLineArray[@]}; j++ )); do # go through all the header lines
    key=$(echo ${headerLineArray[j]} | cut -d "|" -f1) # The part in the header before | is the key
    value=$(echo ${headerLineArray[j]} | cut -d "|" -f2) # The part in the header after | is the value
    postTemplate=${postTemplate/"{$key}"/"$value"} # Replace the {key} instances in postTemplate by their values, filling the template
    if [[ "$key" == "arguments" && "$value" == *nopreview* ]]; then
      noPreview=true
    fi
    sed -i'.original' -e "s|{$key}|${value}|g" "${POSTS[i]%.md}temp.html" # In the temp post item we created above, replace all instances of key with value, filling the template with the headers
    if [[ "$key" == "arguments" && "$value" == *norobots* ]]; then
      sed -i'.original2' -e "s|<!--norobotshead-->|<meta name='robots' content='noindex'>|" "${POSTS[i]%.md}temp.html"
    fi
  done
  postTemplate=${postTemplate/"{url}"/"${POSTS[i]%.md}.html"} # Replace the {key} instances in postTemplate by their values, filling the template
  tail -n +7 "${POSTS[i]}" > tempMDpost.md # add everything except the six header lines to a temporary markdown post
  markdown tempMDpost.md --template "${POSTS[i]%.md}temp.html" > "${POSTS[i]%.md}.html" #create the article html file from the temporary markdown post
  perl -pi -e 's| &lt;([^&]*?)&gt; |<\1>|g' "${POSTS[i]%.md}.html" # Since the markdown shell command has a bug where it does not parse but instead escapes html tags (in violation of the markdown spec), we need to do it manually. In our case, we only parse out tags that have a space on both sides, to prevent accidental parsing
  echo $postTemplate > tempPostItem.html # create a temporary post item
  echo "https://samswartzberg.com/paper/${POSTS[i]%.md}.html" >> sitemap.txt # Add the post url to the sitemap, so google can index it easily
  if [ "$noPreview" = true ] ; then
    continue
  fi
  sed -i'.original' '/INSERT HERE-->/r tempPostItem.html' index.html # add the contents of the post item to the generated index.html
done
# Do some cleanup
rm *.original
rm posts/*.original
rm temp* # will not remove templates/, since it is a directory (which is good, since that's what we want, but it will display an alert in the console)
rm posts/*temp.*
