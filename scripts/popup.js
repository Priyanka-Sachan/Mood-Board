const form = document.getElementById('add-pin-form');
const wFavicon = document.getElementById('w_favicon');
const wImage = document.getElementById('w_image');
const wTitle = document.getElementById('w_title');
const wType = document.getElementById('w_type');
const wUrl = document.getElementById('w_url');
const wTags = document.getElementById('w_tags');
const wDesc = document.getElementById('w_desc');
const wNote = document.getElementById('w_note');
new BulmaTagsInput(wTags);
const wTagsInput = wTags.BulmaTagsInput();

let pinInfo;

function getImagePreview() {
    chrome.runtime.sendMessage({
        message: 'capture_preview'
    }, response => {
        if (response.message === 'success')
            wImage.setAttribute('src', response.payload);
        else
            wImage.remove();
        wImage.removeEventListener('error', getImagePreview);
    });
}

function populatePinForm() {
    wUrl.value = pinInfo.url;
    if (pinInfo.favicon)
        wFavicon.setAttribute('src', pinInfo.favicon);
    const images = pinInfo.images;
    wImage.addEventListener('error', getImagePreview);
    if (pinInfo.coverImage)
        wImage.setAttribute('src', pinInfo.coverImage);
    else if (images[0])
        wImage.setAttribute('src', images[0]);
    else
        getImagePreview();
    if (pinInfo.title)
        wTitle.value = pinInfo.title;
    if (pinInfo.description)
        wDesc.value = pinInfo.description;
    if (pinInfo.type && [...wType.options].map(o => o.value).includes(pinInfo.type))
        wType.value = pinInfo.type;
    else
        wType.value = 'undefined';
}

form.addEventListener('submit', function(event) {
    let isValid = form.checkValidity();
    form.classList.add('was-validated');
    if (isValid === true) {
        const pin = {
            'wImage': wImage.getAttribute('src'),
            'wFavicon': wFavicon.getAttribute('src'),
            'wType': wType.value,
            'wTitle': wTitle.value,
            'wUrl': wUrl.value,
            'wTags': wTagsInput.items,
            'wDesc': wDesc.value,
            'wNote': wNote.value,
            'wArticle': pinInfo.preview
        };
        console.log('Pin created:', pin);
        chrome.runtime.sendMessage({
            message: 'add_pin',
            payload: pin
        }, response => {
            if (response.message === 'success') {
                console.log('Pin saved:', pin);
                window.close();
            }
        });
    }
    event.preventDefault();
    event.stopPropagation();
}, false);

chrome.windows.getCurrent({ populate: true }, window => {
    const site_to_pin = window.tabs.filter(tab => tab.active);
    chrome.runtime.sendMessage({
        message: 'get_current_document',
        payload: site_to_pin[0].id
    }, response => {
        if (response.message == 'success') {
            const data = '<!DOCTYPE html>' + response.payload[0].result;
            //...parse the document and populate
            const result = parseDocument(data, site_to_pin[0].url);
            if (result.message == 'success') {
                pinInfo = result.info;
                populatePinForm();
            } else {
                //...Show a toast message
                console.log('Failed..');
            }
        }
    });
});