var requestDetails = {};
var requestStartTimes = {};

chrome.webRequest.onSendHeaders.addListener(
    function(details) {
        requestStartTimes[details.requestId] = details.timeStamp;
    },
    { urls: ["<all_urls>"] }
);

chrome.webRequest.onCompleted.addListener(
    function(details) {
        var url = details.url;
        var startTime = requestStartTimes[details.requestId];
        if (!startTime) return;

        var duration = details.timeStamp - startTime;
        if (!requestDetails[url]) {
            requestDetails[url] = { count: 0, totalTime: 0 };
        }
        requestDetails[url].count++;
        requestDetails[url].totalTime += duration;

        chrome.runtime.sendMessage({ requestDetails: requestDetails });
    },
    { urls: ["<all_urls>"] }
);

chrome.webRequest.onErrorOccurred.addListener(
    function(details) {
        var url = details.url;
        var startTime = requestStartTimes[details.requestId];
        if (!startTime) return;

        var duration = details.timeStamp - startTime;
        if (!requestDetails[url]) {
            requestDetails[url] = { count: 0, totalTime: 0 };
        }
        requestDetails[url].count++;
        requestDetails[url].totalTime += duration;

        chrome.runtime.sendMessage({ requestDetails: requestDetails });
    },
    { urls: ["<all_urls>"] }
);

// Open popup.html in a new tab when the extension icon is clicked
chrome.action.onClicked.addListener(function(tab) {
    chrome.tabs.create({url: 'popup.html'});
});
