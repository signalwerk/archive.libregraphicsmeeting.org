#!/usr/bin/env bash
set -euo pipefail

# Find all modified JSON files and add to git if they have date/expires changes

# Loop through modified JSON files
git ls-files --modified "*.json" | while read -r file; do
  # Skip files that don't exist (deleted files)
  if [[ ! -f "$file" ]]; then
    echo "Skipping deleted file: $file"
    continue
  fi


  # Get only the added lines from the diff (lines starting with +)
  # Exclude the +++ line which is just the file header
  added_lines=$(git diff -- "$file" | grep "^+" | grep -v "^+++" || true)
  
  # Count the number of added/modified lines
  line_count=$(echo "$added_lines" | grep -v "^$" | wc -l | tr -d ' ')
  
  echo "File: $file"
  echo "Modified lines: $line_count"
  echo "Added content: $added_lines"
  
  # Check if ALL modified lines contain either "date" or "expires"
  all_lines_match=true
  while IFS= read -r line; do
    # Skip empty lines
    if [[ -z "$line" ]]; then
      continue
    fi
    
    # Check if this line contains date or expires
    if [[ "$line" != *"date"* ]] && [[ "$line" != *"expires"* ]]; then
      all_lines_match=false
      break
    fi
  done <<< "$added_lines"
  
  if [[ "$all_lines_match" == true ]] && [[ -n "$added_lines" ]]; then
    git add "$file"
    echo "Added to git: $file (only date/expires changes)"
    echo "-------------------"
  else
    echo "Skipped: $file (contains other changes)"
    echo "-------------------"
  fi
done

echo "Done processing modified JSON files." 