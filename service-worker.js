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
    }
});