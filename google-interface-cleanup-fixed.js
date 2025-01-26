// ==UserScript==
// @name         Google interface cleanup (Fixed Version)
// @description  Remove junk from Google search results like "People also ask", etc. 
//               Fixed version of https://greasyfork.org/en/scripts/504171-google-interface-cleanup. 
//               All credit goes to the original author, antics1. Minor edits added for my personal preference.
// @license      MIT
// ==/UserScript==

const annoyances = [
  "People also ask",
  "People also search for",
  "People also search",
  "Videos",
  "Short videos",
  "Refine this search",
  "Search a song",
  "Related searches",
  "Hum to search",
  "Trending videos",
  "Related videos",
  "For context",
  "Also searched for",
  "Often searched together",
  "Others searched",
  "Local news",
  "Popular on X",
  "People also watch",
  "Events",
  "Profiles",
  "Perspectives",
  "What to watch",
  "Posts on X",
  "Nearby stores",
  "People also buy from",
  "Trending movies",
  "Ticket prices",
  "Mentioned in the news",
  "Visual stories",
  "Latest posts from",
  "Twitter Results",
  "Images",
  "Related topics",
  "Context",
  "For reference",
  "Helpful context",
  "Recipes",
  "Things to know",
];

function waitForKeyElements(
  selectorOrFunction,
  callback,
  waitOnce = true,
  interval = 300,
  maxIntervals = -1
) {
  const targetNodes =
    typeof selectorOrFunction === "function"
      ? selectorOrFunction()
      : document.querySelectorAll(selectorOrFunction);
  let targetsFound = targetNodes && targetNodes.length > 0;

  if (targetsFound) {
    targetNodes.forEach((targetNode) => {
      const attrAlreadyFound = "data-userscript-alreadyFound";
      const alreadyFound = targetNode.getAttribute(attrAlreadyFound) || false;
      if (!alreadyFound) {
        const cancelFound = callback(targetNode);
        if (cancelFound) {
          targetsFound = false;
        } else {
          targetNode.setAttribute(attrAlreadyFound, true);
        }
      }
    });
  }

  if (maxIntervals !== 0 && !(targetsFound && waitOnce)) {
    maxIntervals -= 1;
    setTimeout(() => {
      waitForKeyElements(
        selectorOrFunction,
        callback,
        waitOnce,
        interval,
        maxIntervals
      );
    }, interval);
  }
}

function isHidden(el) {
  return el === null || el.offsetParent === null;
}

function getbyXpath(xpath, contextNode) {
  const results = [];
  const query = document.evaluate(
    xpath,
    contextNode || document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  for (let i = 0, length = query.snapshotLength; i < length; ++i) {
    results.push(query.snapshotItem(i));
  }
  return results;
}

function removeJunk(jNode) {
  const div = jNode;
  const matchingAnnoyances = annoyances
    .filter((a) => div.innerHTML.includes(a))
    .flatMap((a) =>
      getbyXpath(
        `.//div[starts-with(text(), '${a}')]|//span[starts-with(text(), '${a}')]|//h2[starts-with(text(), '${a}')]`,
        div
      )
    )
    .filter((node) => !isHidden(node));

  matchingAnnoyances.forEach((matchingAnnoyance) => {
    if (matchingAnnoyance && !isHidden(matchingAnnoyance)) {
      traverseAncestors(matchingAnnoyance);
    }
  });
}

function undesiredElement(jNode) {
  jNode.style.display = "none";
}

function destroyElement(jNode) {
  jNode.remove();
}

function undesiredElementParent(jNode) {
  const parent = jNode.parentElement;
  if (parent !== null) {
    parent.style.display = "none";
  }
}

function traverseAncestors(node) {
  if (node) {
    if (node.tagName === "DIV") {
      const parentElement = node.parentElement;
      const childDivs = [...parentElement.children].filter(
        (c) => c.tagName === "DIV"
      );
      const hasInfoSection = node.querySelector(".kp-wholepage");

      if (
        node.hasAttribute("jsdata") ||
        node.hasAttribute("jsname") ||
        node.className === "MjjYud" ||
        (childDivs.length === 1 && parentElement.id === "bres")
      ) {
        if (hasInfoSection === null) {
          node.style.display = "none";
        }
      } else {
        traverseAncestors(node.parentNode);
      }
    } else {
      traverseAncestors(node.parentNode);
    }
  }
}

function removeSearchSuggestions(jNode) {
  jNode.removeAttribute("jscontroller");
}

function visualDigest(jNode) {
  jNode.closest("div.ycw3p").style.display = "none";
}

function appendAsTopChild(targetNode) {
  if (targetNode.textContent.trim() === "") {
    return;
  }
  const predefinedDiv = document.querySelector("#center_col");
  if (predefinedDiv) {
    predefinedDiv.insertBefore(targetNode, predefinedDiv.firstChild);
    targetNode.style.paddingBottom = "20px";
  }
}

waitForKeyElements("#rso div.MjjYud", removeJunk);
waitForKeyElements("#botstuff div.MjjYud", removeJunk, false);
waitForKeyElements("#botstuff #bres div[id*=dub_]", undesiredElement);
waitForKeyElements('g-card:has(> div[class="mnr-c"])', undesiredElement, false);
waitForKeyElements(
  'div[data-attrid="VisualDigestFullBleedVideoResult"]',
  undesiredElement
);
waitForKeyElements("inline-video", undesiredElement);
waitForKeyElements("product-viewer-group", undesiredElement, false);
waitForKeyElements("block-component", undesiredElement, false); // featured snippets at top
waitForKeyElements(
  'form[action="/search"] > div > div[jscontroller]',
  removeSearchSuggestions
);
waitForKeyElements(
  'div[data-attrid="VisualDigestNewsArticleResult"]',
  visualDigest
);
waitForKeyElements(
  'div[data-attrid="VisualDigestSocialMediaResult"]',
  visualDigest
);
waitForKeyElements('div[data-attrid="VisualDigestWebResult"]', visualDigest);

// Append Blacklist to search top
waitForKeyElements('div[id="tU52Vb"]', appendAsTopChild);

// DISABLED
// waitForKeyElements('#media_result_group', undesiredElement);
