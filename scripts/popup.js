const form = document.getElementById('add-pin-form');
const iFavicon = document.getElementById('i-favicon');
const iImage = document.getElementById('i-image');
const iTitle = document.getElementById('i-title');
const iTags = document.getElementById('i-tags');
new BulmaTagsInput(iTags);
const iTagsInput = iTags.BulmaTagsInput();
const iType = document.getElementById('i-type');
const iUrl = document.getElementById('i-url');
const iDescription = document.getElementById('i-description');
const iNote = document.getElementById('i-note');

let pinInfo;
autosize(document.querySelectorAll('textarea'));

function getImagePreview() {
    chrome.runtime.sendMessage({
        message: 'capture_preview'
    }, response => {
        if (response.message === 'success')
            iImage.setAttribute('src', response.payload);
        else
            iImage.remove();
        iImage.removeEventListener('error', getImagePreview);
    });
}

function populatePinForm() {
    if (pinInfo.favicon)
        iFavicon.setAttribute('src', pinInfo.favicon);
    const images = pinInfo.images;
    iImage.addEventListener('error', getImagePreview);
    if (pinInfo.coverImage)
        iImage.setAttribute('src', pinInfo.coverImage);
    else if (images[0])
        iImage.setAttribute('src', images[0]);
    else
        getImagePreview();
    if (pinInfo.title)
        iTitle.value = pinInfo.title;
    if (pinInfo.description)
        iDescription.value = pinInfo.description;
    if (pinInfo.type && [...iType.options].map(o => o.value).includes(pinInfo.type))
        iType.value = pinInfo.type;
    else
        iType.value = 'undefined';
    autosize.update(document.querySelectorAll('textarea'));
}

form.addEventListener('submit', function(event) {
    let isValid = form.checkValidity();
    form.classList.add('was-validated');
    if (isValid === true) {
        const pin = {
            'image': iImage.getAttribute('src'),
            'images': pinInfo.images,
            'favicon': iFavicon.getAttribute('src'),
            'type': iType.value,
            'title': iTitle.value,
            'url': iUrl.value,
            'tags': iTagsInput.items,
            'description': iDescription.value,
            'note': iNote.value,
            'article': pinInfo.preview
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
    iUrl.value = site_to_pin[0].url;
    iTitle.value = site_to_pin[0].title;
    chrome.runtime.sendMessage({
        message: 'get_current_document',
        payload: site_to_pin[0].id
    }, response => {
        if (response.message == 'success') {
            const data = '<!DOCTYPE html>' + response.payload[0].result;
            const result = parseDocument(data, site_to_pin[0].url);
            if (result.message == 'success') {
                pinInfo = result.info;
                populatePinForm();
            } else {
                console.log('Failed..');
            }
        }
    });
});