import { app } from "../../scripts/app.js";

const BRAND_NAME = "Frizm AI";
const LEGACY_NAME = /ComfyUI/g;
const SKIPPED_TEXT_PARENTS = new Set(["CODE", "PRE", "SCRIPT", "STYLE", "TEXTAREA"]);
const BRANDABLE_ATTRIBUTES = ["aria-label", "alt", "placeholder", "title"];

function replaceLegacyName(value) {
  return value?.includes("ComfyUI") ? value.replace(LEGACY_NAME, BRAND_NAME) : value;
}

function brandText(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;

  while ((node = walker.nextNode())) {
    if (SKIPPED_TEXT_PARENTS.has(node.parentElement?.tagName)) continue;

    const brandedValue = replaceLegacyName(node.nodeValue);
    if (brandedValue !== node.nodeValue) node.nodeValue = brandedValue;
  }
}

function brandElement(element) {
  for (const attribute of BRANDABLE_ATTRIBUTES) {
    const value = element.getAttribute(attribute);
    const brandedValue = replaceLegacyName(value);
    if (brandedValue !== value) element.setAttribute(attribute, brandedValue);
  }
}

function brandAttributes(root) {
  if (root.nodeType === Node.ELEMENT_NODE) brandElement(root);
  for (const element of root.querySelectorAll?.("*") ?? []) brandElement(element);
}

function applyIdentity(root = document) {
  document.title = BRAND_NAME;
  brandText(root);
  brandAttributes(root);
}

app.registerExtension({
  name: "FrizmAI.Identity",
  setup() {
    applyIdentity();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            const brandedValue = replaceLegacyName(node.nodeValue);
            if (brandedValue !== node.nodeValue) node.nodeValue = brandedValue;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            applyIdentity(node);
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
});
