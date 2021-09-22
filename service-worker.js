let recent_tab_id = null,
    new_pin_data = {};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'mb-pin',
        title: "Pin this page",
        contexts: ["page"]
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

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if ('mb-pin' === info.menuItemId) {
        // console.log('Info', info);
        // console.log('Tab', tab);
        const date = new Date();
        const pin = {
            'wImage': '',
            'wFavicon': tab.favIconUrl,
            'wProject': 'inbox',
            'wType': 'website',
            'wTitle': tab.title,
            'wUrl': tab.url,
            'wTags': [],
            'wDesc': '',
            'wNote': '',
            'wDate': date.toUTCString()
        };
        console.log('Pin created', pin);
        if (addPin(pin)) {
            console.log({ message: 'success' });
        } else {
            console.log({ message: 'fail' });
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'add_pin') {
        // chrome.storage.local.get('pins', data => {
        //     if (chrome.runtime.lastError) {
        //         sendResponse({ message: 'fail' });
        //         return;
        //     }
        //     chrome.storage.local.set({
        //         pins: data.pins ? [...data.pins, request.payload] : [request.payload]
        //     }, () => {
        //         if (chrome.runtime.lastError) {
        //             sendResponse({ message: 'fail' });
        //             return;
        //         }
        //         sendResponse({ message: 'success' });
        //     });
        // });
        // return true;
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
        console.log('INside delete pins');
        console.log(request.payload);
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