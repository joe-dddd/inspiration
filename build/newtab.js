const imageUrl = "https://picsum.photos/2560/1600"
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Wait for DOM to be ready
function waitForElement(selector, maxAttempts = 50) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const checkElement = () => {
      const element = document.getElementById(selector);
      if (element) {
        resolve(element);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkElement, 100);
      } else {
        reject(new Error(`Element ${selector} not found after ${maxAttempts} attempts`));
      }
    };
    checkElement();
  });
}

function setBg(imageUrl) {
  waitForElement("cover").then(element => {
    element.style.backgroundImage = "url('" + imageUrl + "')";
  }).catch(err => {
    console.error("Failed to set background:", err);
    // Retry setting background after a short delay
    setTimeout(() => {
      const coverElement = document.getElementById("cover");
      if (coverElement) {
        coverElement.style.backgroundImage = "url('" + imageUrl + "')";
      }
    }, 500);
  });
}

// Preload image using Image object to ensure it's loaded before setting background
function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

function loadCurrentCover(setImage, retryCount = 0) {
  // Add a random seed to get a different image each time
  const url = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 'random=' + Date.now();
  
  preloadImage(url)
    .then(loadedUrl => {
      // Image is loaded, now set it as background
      if (setImage || !retryCount) {
        setBg(loadedUrl);
      }
      // Store the URL for next time (though picsum.photos URLs are unique)
      chrome.storage.local.set({ currentCover: loadedUrl });
    })
    .catch(err => {
      console.error("Failed to load cover image:", err);
      // Retry if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying image load (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => {
          loadCurrentCover(setImage, retryCount + 1);
        }, RETRY_DELAY * (retryCount + 1)); // Exponential backoff
      } else {
        console.error("Max retries reached. Using cached image if available.");
      }
    });
}

chrome.storage.local.get(['currentCover', 'initCover'], function (result) {
  // Show cached image first for instant display
  if (result.currentCover || result.initCover) {
    const cachedUrl = result.currentCover || result.initCover;
    // For base64 images (old format), use as is
    // For URLs (new format), preload first to ensure it's ready
    if (cachedUrl.startsWith('data:')) {
      setBg(cachedUrl);
    } else {
      // It's a URL, preload it to ensure it's ready
      preloadImage(cachedUrl)
        .then(() => setBg(cachedUrl))
        .catch(() => {
          // If cached image fails, just set it anyway (browser will handle loading)
          setBg(cachedUrl);
        });
    }
  }
  // Always load new image and set it when loaded (even if we have cache)
  loadCurrentCover(true);
})