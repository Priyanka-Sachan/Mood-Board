const form = document.getElementById('add-pin-form');
const wImage = document.getElementById('w_image');
const wTitle = document.getElementById('w_title');
const wType = document.getElementById('w_type');
const wUrl = document.getElementById('w_url');
const wDesc = document.getElementById('w_desc');
const wNote = document.getElementById('w_note');
let image, title, type, favicon, url, desc, note, domain, date;
let message;

chrome.windows.getCurrent({ populate: true }, window => {
    const site_to_pin = window.tabs.filter(tab => tab.active);

    const tabId = site_to_pin[0].id;
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

    title = site_to_pin[0].title;
    console.log('Title', title);
    wTitle.value = title;

    url = site_to_pin[0].url;
    console.log('Url', url);
    wUrl.value = url;

    favicon = site_to_pin[0].favIconUrl;
    console.log('Favicon', favicon);

    domain = (new URL(url));
    domain = domain.hostname;
    domain = domain.replace('www.', '');
    console.log('Domain', domain);

    date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();
    date = mm + '/' + dd + '/' + yyyy;
    console.log('Date', date);

});

form.addEventListener('submit', function(event) {
    let isValid = form.checkValidity();
    form.classList.add('was-validated');
    if (isValid === true) {
        const wTitleValue = wTitle.value;
        const wUrlValue = wUrl.value;
        const wNoteValue = wNote.value;
        const pin = {
            wTitle: wTitleValue,
            wUrl: wUrlValue,
            wNote: wNoteValue,
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
        console.log('Description', desc);
        if (desc)
            wDesc.value = desc;

        image = message.imageUrl;
        console.log('Image Url', image);
        if (image)
            wImage.setAttribute('src', image);
        else if (favicon)
            wImage.setAttribute('src', favicon);
        else
            wImage.remove();

        type = message.type;
        console.log('Type', type);
        if (type)
            wType.value = type;
        else
            wType.value = 'undefined';
    }
});