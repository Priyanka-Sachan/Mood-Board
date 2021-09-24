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

function addPinFromCM(image, tab, note) {
    const date = new Date();
    const pin = {
        'wImage': image,
        'wFavicon': tab.favIconUrl,
        'wProject': 'inbox',
        'wType': 'website',
        'wTitle': tab.title,
        'wUrl': tab.url,
        'wTags': [],
        'wDesc': '',
        'wNote': note,
        'wDate': date.toUTCString()
    };
    console.log('Pin created', pin);
    if (addPin(pin)) {
        console.log({ message: 'success' });
    } else {
        console.log({ message: 'fail' });
    }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if ('mb-pin' === info.menuItemId || 'mb-pin-n-note' === info.menuItemId) {
        const note = info.selectionText ? info.selectionText : '';
        chrome.tabs.captureVisibleTab(
            null, {},
            data => {
                if (chrome.runtime.lastError) {
                    addPinFromCM('', tab, note);
                }
                addPinFromCM(data, tab, note);
            });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'get_current_pin') {
        const site_to_pin = request.payload;
        const date = new Date();
        let pin = {
            'wImage': '',
            'wFavicon': site_to_pin[0].favIconUrl,
            'wProject': '',
            'wType': '',
            'wTitle': site_to_pin[0].title,
            'wUrl': site_to_pin[0].url,
            'wTags': [],
            'wDesc': '',
            'wNote': '',
            'wDate': date.toUTCString()
        };
        chrome.scripting.executeScript({
                target: { 'tabId': site_to_pin[0].id },
                files: ['tabDetails.js'],
            },
            (response) => {
                // If you try and inject into an extensions page or the webstore/NTP you'll get an error
                if (chrome.runtime.lastError) {
                    let message = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
                    console.log('Error:', message);
                } else {
                    pin['wImage'] = response[0].result.imageUrl;
                    pin['wDesc'] = response[0].result.description;
                    pin['wType'] = response[0].result.type;
                }
                console.log('Pin created:', pin);
                sendResponse({
                    message: 'success',
                    payload: pin
                });
            });
        return true;
    } else if (request.message === 'add_pin') {
        if (addPin(request.payload)) {
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
    } else if (request.message === 'delete_pin') {
        chrome.storage.local.set({
            pins: [...request.payload]
        }, () => {
            if (chrome.runtime.lastError) {
                sendResponse({ message: 'fail' });
                return;
            }
            sendResponse({ message: 'success' });
        });
        return true;
    } else if (request.message === 'add_project') {
        chrome.storage.local.get('projects', data => {
            if (chrome.runtime.lastError) {
                sendResponse({ message: 'fail' });
                return;
            }
            chrome.storage.local.set({
                projects: data.projects ? [...data.projects, request.payload] : [request.payload]
            }, () => {
                if (chrome.runtime.lastError) {
                    sendResponse({ message: 'fail' });
                    return;
                }
                sendResponse({ message: 'success' });
            });
        });
        return true;
    } else if (request.message === 'get_projects') {
        chrome.storage.local.get('projects', data => {
            if (chrome.runtime.lastError) {
                sendResponse({ message: 'fail' });
                return;
            }
            sendResponse({
                message: 'success',
                payload: data.projects ? data.projects : []
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