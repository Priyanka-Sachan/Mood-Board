chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'mb-pin',
        title: "Pin this page",
        contexts: ["page"]
    });
    chrome.contextMenus.create({
        id: 'mb-pin-n-note',
        title: "Pin this page and note",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if ('mb-pin' === info.menuItemId || 'mb-pin-n-note' === info.menuItemId) {
        const note = info.selectionText ? info.selectionText : '';
        // How to get sendResponse function here and how to open popup from here..
        // getTabDetails(tab.id);
    }
});

const sendDocument = () => {
    return document.documentElement.outerHTML;
}

const getTabDetails = (tabId, sendResponse) => {
    chrome.scripting.executeScript({
            target: { 'tabId': tabId },
            func: sendDocument
        },
        (response) => {
            // If you try and inject into an extensions page or the webstore/NTP you'll get an error
            if (chrome.runtime.lastError) {
                let message = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
                console.log('Error:', message);
                sendResponse({ message: 'fail' });
            } else {
                sendResponse({
                    message: 'success',
                    payload: response
                });
            }
        });
}

function addPin(pin) {
    chrome.storage.local.get('pins', data => {
        if (chrome.runtime.lastError) {
            return false;
        }
        chrome.storage.local.set({
            pins: data.pins ? [...data.pins, pin] : [pin]
        }, () => {
            if (chrome.runtime.lastError) {
                return false;
            }
            return true;
        });
    });
    return true;
}

function updatePin(pin) {
    chrome.storage.local.get('pins', data => {
        if (chrome.runtime.lastError) {
            return false;
        }
        pins = data.pins;
        const index = pins.findIndex((p) => p.id == pin.id);
        if (index !== -1)
            pins[index] = pin;
        chrome.storage.local.set({
            pins: pins
        }, () => {
            if (chrome.runtime.lastError) {
                return false;
            }
            return true;
        });
    });
    return true;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'get_current_document') {
        const site_to_pin = request.payload;
        getTabDetails(site_to_pin, sendResponse);
        return true;
    } else if (request.message === 'add_pin') {
        if (addPin(request.payload)) {
            sendResponse({ message: 'success' });
        } else {
            sendResponse({ message: 'fail' });
        }
    } else if (request.message === 'update_pin') {
        if (updatePin(request.payload)) {
            sendResponse({ message: 'success' });
        } else {
            sendResponse({ message: 'fail' });
        }
    } else if (request.message === 'get_pins') {
        chrome.storage.local.get('pins', data => {
            if (chrome.runtime.lastError) {
                sendResponse({ message: 'fail' });
                return;
            }
            sendResponse({
                message: 'success',
                payload: data.pins ? data.pins : []
            });
        });
        return true;
    } else if (request.message === 'capture_preview') {
        chrome.tabs.captureVisibleTab(
            null, {},
            data => {
                if (chrome.runtime.lastError) {
                    sendResponse({ message: 'fail' });
                    return;
                }
                sendResponse({
                    message: 'success',
                    payload: data
                });
            });
        return true;
    }
});