const BASE_IMAGE_URL = "https://picsum.photos"
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Calculate optimal image size based on screen resolution
// Use device pixel ratio for retina displays, but cap at reasonable sizes
function getOptimalImageSize() {
  const width = window.screen.width || window.innerWidth || 1920;
  const height = window.screen.height || window.innerHeight || 1080;
  const dpr = window.devicePixelRatio || 1;
  
  // Calculate size with DPR, but cap at 1920x1080 for performance
  // Most displays don't need larger images, and this significantly reduces load time
  const optimalWidth = Math.min(Math.ceil(width * Math.min(dpr, 1.5)), 1920);
  const optimalHeight = Math.min(Math.ceil(height * Math.min(dpr, 1.5)), 1080);
  
  return { width: optimalWidth, height: optimalHeight };
}

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

function setBg(imageUrl, fadeIn = false) {
  waitForElement("cover").then(element => {
    if (fadeIn) {
      // Create a temporary image element for smooth transition
      const tempImg = new Image();
      tempImg.onload = () => {
        element.style.backgroundImage = "url('" + imageUrl + "')";
        element.style.opacity = "0";
        // Trigger fade-in animation
        requestAnimationFrame(() => {
          element.style.transition = "opacity 0.5s ease-in";
          element.style.opacity = "1";
        });
      };
      tempImg.src = imageUrl;
    } else {
      element.style.backgroundImage = "url('" + imageUrl + "')";
    }
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
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error(`Image load timeout: ${url}`));
    }, 15000); // 15 second timeout
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(url);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
}

function loadCurrentCover(applyBackground = true, retryCount = 0) {
  const { width, height } = getOptimalImageSize();
  // Use optimal size instead of fixed 2560x1600
  const imageUrl = `${BASE_IMAGE_URL}/${width}/${height}`;
  // Add a random seed to get a different image each time
  const url = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 'random=' + Date.now();
  
  preloadImage(url)
    .then(loadedUrl => {
      // Image is loaded, now set it as background with fade-in effect when requested
      if (applyBackground) {
        setBg(loadedUrl, true); // Use fade-in for smooth transition
      }
      // Store the URL and size for next time
      chrome.storage.local.set({ 
        currentCover: loadedUrl,
        coverSize: { width, height }
      });
    })
    .catch(err => {
      console.error("Failed to load cover image:", err);
      // Retry if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying image load (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => {
          loadCurrentCover(applyBackground, retryCount + 1);
        }, RETRY_DELAY * (retryCount + 1)); // Exponential backoff
      } else {
        console.error("Max retries reached. Using cached image if available.");
      }
    });
}

chrome.storage.local.get(['currentCover', 'initCover'], function (result) {
  const cachedUrl = result.currentCover || result.initCover;
  const hasCachedCover = Boolean(cachedUrl);

  // Decide whether the newly fetched image should immediately replace the current view
  // If we already have a cached cover, keep it on screen to avoid an A->B flash.
  let shouldApplyNewCover = !hasCachedCover;
  const startLoadingNewCover = () => loadCurrentCover(shouldApplyNewCover);

  // Show cached image first for instant display
  if (hasCachedCover) {
    // For base64 images (old format), use as is
    // For URLs (new format), preload first to ensure it's ready
    if (cachedUrl.startsWith('data:')) {
      setBg(cachedUrl);
      startLoadingNewCover();
      return;
    }

    // It's a URL, preload it to ensure it's ready
    preloadImage(cachedUrl)
      .then(() => setBg(cachedUrl))
      .catch(() => {
        // If cached image fails, allow the new image to replace it once ready
        setBg(cachedUrl);
        shouldApplyNewCover = true;
      })
      .finally(startLoadingNewCover);
    return;
  }

  // No cached cover, load and apply immediately
  startLoadingNewCover();
})
