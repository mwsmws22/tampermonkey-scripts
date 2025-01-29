# Tampermonkey Scripts Collection

This repository is a collection of Tampermonkey scripts for my personal use. Each script is a JavaScript file located in the root of this repository. Below is the documentation for each script.

## Scripts

### google-interface-cleanup-fixed.js

**Original Source**  
All credit goes to the original author, antics1. See [Google interface cleanup](https://greasyfork.org/en/scripts/504171-google-interface-cleanup).

Unfortunately, the original script no longer works in its current state. I fixed it and also added a bunch of personal preferences tweaks.

**Tweaks:**

- Move uBlacklist `uBlacklist has blocked X sites Show` banner to top of search results container
- Removed `waitForKeyElements("#media_result_group", undesiredElement);`
- Add values to annoyances list
- Pretty formatting and random optimization from Copilot

**Description:**  
This script removes various unwanted elements from Google search results to provide a cleaner interface. It targets and hides elements such as "People also ask", "Videos", "Related searches", and many more. The script uses XPath to identify and remove these elements. It also includes functionality to hide or remove specific elements, traverse ancestor nodes to find and hide parent elements, and remove search suggestions.
