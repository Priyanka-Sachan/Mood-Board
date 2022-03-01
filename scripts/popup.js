let currentPin;

const pinForm = document.getElementById('pin-form');
const pinFormFavicon = document.getElementById('pin-form-favicon');
const pinFormImage = document.getElementById('pin-form-image');
const pinFormImages = document.getElementById('pin-form-images');
const pinFormProject = document.getElementById('pin-form-project');
const pinFormTitle = document.getElementById('pin-form-title');
const pinFormTags = document.getElementById('pin-form-tags');
new BulmaTagsInput(pinFormTags);
const pinFormTagsInput = pinFormTags.BulmaTagsInput();
const pinFormType = document.getElementById('pin-form-type');
const pinFormUrl = document.getElementById('pin-form-url');
const pinFormDescription = document.getElementById('pin-form-description');
const pinFormNote = document.getElementById('pin-form-note');
autosize(document.querySelectorAll('textarea'));

function addProjectToPinForm(project) {
    const p = document.createElement('option');
    p.innerHTML = project.name;
    p.value = project.id;
    pinFormProject.appendChild(p);
}

function getProjects() {
    chrome.runtime.sendMessage({
        message: 'get_projects'
    }, response => {
        if (response.message === 'success') {
            projects = response.payload;
            projects.forEach((project) => {
                //Add project to pinForm
                addProjectToPinForm(project);
            });
        }
    });
}

function getImagePreview() {
    chrome.runtime.sendMessage({
        message: 'capture_preview'
    }, response => {
        if (response.message === 'success')
            pinFormImage.setAttribute('src', response.payload);
        else
            pinFormImage.remove();
        pinFormImage.removeEventListener('error', getImagePreview);
    });
}

function populatePinForm(currentPin) {
    if (currentPin.favicon)
        pinFormFavicon.setAttribute('src', currentPin.favicon);
    const images = currentPin.images;
    images.forEach((i) => {
        const imagesItem = document.createElement('div');
        imagesItem.classList.add('pin-form-images-item');
        imagesItem.innerHTML = `<img src="${i}"><img class="x image is-16x16" src="./icons/x.svg">`;
        pinFormImages.appendChild(imagesItem);
        document.querySelectorAll('.pin-form-images-item .x').forEach((i) => {
            i.addEventListener('click', (e) => {
                i.parentElement.remove();
            }, false);
        });
    });
    pinFormImage.addEventListener('error', getImagePreview);
    if (currentPin.image)
        pinFormImage.setAttribute('src', currentPin.image);
    else if (images[0])
        pinFormImage.setAttribute('src', images[0]);
    else
        getImagePreview();
    if (currentPin.title)
        pinFormTitle.value = currentPin.title;
    if (currentPin.description)
        pinFormDescription.value = currentPin.description;
    if (currentPin.type && [...pinFormType.options].map(o => o.value).includes(currentPin.type))
        pinFormType.value = currentPin.type;
    else
        pinFormType.value = 'undefined';
    autosize.update(document.querySelectorAll('textarea'));
}

pinForm.addEventListener('submit', function(event) {
    let isValid = pinForm.checkValidity();
    pinForm.classList.add('was-validated');
    if (isValid === true) {
        const pin = {
            'id': Date.now(),
            'image': pinFormImage.getAttribute('src'),
            'images': Array.from(pinFormImages.children, i => i.children[0].src),
            'project': pinFormProject.value,
            'favicon': pinFormFavicon.getAttribute('src'),
            'type': pinFormType.value,
            'title': pinFormTitle.value,
            'url': pinFormUrl.value,
            'domain': (new URL(pinFormUrl.value)).hostname.replace('www.', ''),
            'tags': pinFormTagsInput.items,
            'description': pinFormDescription.value,
            'note': pinFormNote.value,
            'article': currentPin.article
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

getProjects();

chrome.windows.getCurrent({ populate: true }, window => {
    const site_to_pin = window.tabs.filter(tab => tab.active);
    pinFormUrl.value = site_to_pin[0].url;
    pinFormTitle.value = site_to_pin[0].title;
    chrome.runtime.sendMessage({
        message: 'get_current_document',
        payload: site_to_pin[0].id
    }, response => {
        if (response.message == 'success') {
            const data = '<!DOCTYPE html>' + response.payload[0].result;
            const result = parseDocument(data, site_to_pin[0].url);
            if (result.message == 'success') {
                currentPin = result.info;
                populatePinForm(result.info);
            } else {
                console.log('Failed..');
            }
        }
    });
});