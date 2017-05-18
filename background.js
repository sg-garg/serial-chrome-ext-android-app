var connectionId = -1;
//Initial extension launch window
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('alert.html', {
    'id': "jewel-time-device-setting",
    'outerBounds': {
      'width': 580,
      'height': 700
    }
  });
});



chrome.runtime.onSuspend.addListener(function() {
  // Do some simple clean-up tasks.
});

chrome.runtime.onInstalled.addListener(function() {
  // chrome.storage.local.set(object items, function callback);
});
