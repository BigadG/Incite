chrome.runtime.onInstalled.addListener(() => {
    // Initialize extension state
    chrome.storage.local.set({ selections: [] });
  });
  