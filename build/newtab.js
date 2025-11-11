const imageUrl = "https://picsum.photos/2560/1600"

chrome.storage.local.get(['currentCover', 'initCover'], function (result) {
  // Show cached image first for instant display
  if (result.currentCover || result.initCover) {
    if (result.currentCover) {
      setBg(result.currentCover)
    } else if (result.initCover) {
      setBg(result.initCover)
    }
  }
  // Always fetch new image for next load
  fetchCurrentCover(false)
})

function fetchCurrentCover(setImage) {
  fetch(imageUrl)
    .then(response => response.blob())
    .then(blob => {
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        var base64img = reader.result;
        if (setImage) {
          setBg(base64img);
        }
        chrome.storage.local.set({ currentCover: base64img });
      }
    }).catch(err => console.error(err))
}
function setBg(base64img) {
  document.getElementById("cover").style.backgroundImage = "url('" + base64img + "')"
}