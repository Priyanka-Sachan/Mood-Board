const form = document.getElementById('add-pin-form');
const wName = document.getElementById('w_name');
const wUrl = document.getElementById('w_url');
const note = document.getElementById('note');
let favicon, desc, domain, imageUrl, type, today;
let message;

chrome.windows.getCurrent({ populate: true }, window => {
    const site_to_pin = window.tabs.filter(tab => tab.active);

    const tabId = site_to_pin[0].id;
    console.log('TabiD', tabId);
    chrome.scripting.executeScript({
            target: { 'tabId': tabId },
            files: ['tabDetails.js'],
        },
        () => {
            // If you try and inject into an extensions page or the webstore/NTP you'll get an error
            if (chrome.runtime.lastError) {
                message = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
                console.log('Error:', message);
            }
        });

    wName.value = site_to_pin[0].title;
    wUrl.value = site_to_pin[0].url;
    favicon = site_to_pin[0].favIconUrl;
    // console.log(site_to_pin);

    console.log('Title', wName.value);
    console.log('Url', wUrl.value);
    domain = (new URL(wUrl.value));
    domain = domain.hostname;
    domain = domain.replace('www.', '');
    console.log('Domain', domain);
    console.log('Favicon Url', favicon);
    today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    console.log('Date Created', today);

});

form.addEventListener('submit', function(event) {
    let isValid = form.checkValidity();
    form.classList.add('was-validated');
    if (isValid === true) {
        const wNameValue = wName.value;
        const wUrlValue = wUrl.value;
        const noteValue = note.value;
        const pin = {
            wName: wNameValue,
            wUrl: wUrlValue,
            note: noteValue,
        };
        console.log('Pin created', pin);
        chrome.runtime.sendMessage({
            message: 'save_pin',
            payload: pin
        }, response => {
            if (response.message === 'success') {
                console.log('Pin saved', pin);
                window.close();
            }
        });
    }
    event.preventDefault();
    event.stopPropagation();
}, false);

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getTabDetails") {
        message = request.details;
        desc = message.description;
        imageUrl = message.imageUrl;
        type = message.type;
        console.log('Description', desc);
        console.log('Image Url', imageUrl);
        console.log('Type', type);
    }
});