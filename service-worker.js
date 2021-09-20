let recent_tab_id = null,
    new_pin_data = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'save_pin') {
        chrome.storage.local.get('pins', data => {
            if (chrome.runtime.lastError) {
                sendResponse({ message: 'fail' });
                return;
            }
            chrome.storage.local.set({
                pins: data.pins ? [...data.pins, request.payload] : [request.payload]
            }, () => {
                if (chrome.runtime.lastError) {
                    sendResponse({ message: 'fail' });
                    return;
                }
                sendResponse({ message: 'success' });
            });
        });
        return true;
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