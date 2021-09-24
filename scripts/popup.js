const form = document.getElementById('add-pin-form');
const wImage = document.getElementById('w_image');
const wTitle = document.getElementById('w_title');
const wProject = document.getElementById('w_project');
const wType = document.getElementById('w_type');
const wUrl = document.getElementById('w_url');
const wDesc = document.getElementById('w_desc');
const wNote = document.getElementById('w_note');
const tagInput = document.getElementById('tag_input');
const tagList = document.getElementById('tag_list');
let tags = [],
    favicon, date, projects;

function addProject(project) {
    chrome.runtime.sendMessage({
        message: 'add_project',
        payload: project
    }, response => {
        if (response.message === 'success') {
            console.log('Project saved:', project);
        }
    });
}

form.addEventListener('submit', function(event) {
    let isValid = form.checkValidity();
    form.classList.add('was-validated');
    if (isValid === true) {

        const pin = {
            'wImage': wImage.getAttribute('src'),
            'wFavicon': favicon,
            'wProject': wProject.value.trim().toLowerCase(),
            'wType': wType.value,
            'wTitle': wTitle.value,
            'wUrl': wUrl.value,
            'wTags': tags,
            'wDesc': wDesc.value,
            'wNote': wNote.value,
            'wDate': date
        };
        console.log('Pin created:', pin);

        if (!(projects.includes(wProject.value.toLowerCase())))
            addProject(wProject.value.toLowerCase());
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

tagInput.addEventListener('keypress', function(e) {
    if (e.key === ' ') {
        let tag = tagInput.value;
        tag = tag.trim().toLowerCase();
        if (tag !== '') {
            if (tags.indexOf(tag) >= 0) {
                alert('Tag name is a duplicate');
            } else {
                tags.push(tag);
                tagList.innerHTML += `<li><span>${tag}</span><a class="close-tag" id="tag-${tag}">X</a></li>`;
                document.querySelectorAll('.close-tag').forEach(item => {
                    item.addEventListener('click', event => {
                        let i = event.currentTarget.parentNode.children[0].innerHTML;
                        tags = tags.filter(item => item != i);
                        event.currentTarget.parentNode.remove();
                    }, false);
                });
                tagInput.value = '';
                tagInput.focus();
            }
        } else {
            alert('Please type a tag Name');
        }
    }
});

function getImagePreview() {
    chrome.runtime.sendMessage({
        message: 'capture_preview'
    }, response => {
        if (response.message === 'success') {
            wImage.setAttribute('src', response.payload);
            wImage.removeEventListener('error', getImagePreview);
        } else {
            wImage.remove();
        }
    });
}

function populatePinForm(pin) {
    wTitle.value = pin.wTitle;
    wUrl.value = pin.wUrl;
    if (pin.wDesc)
        wDesc.value = pin.wDesc;
    favicon = pin.wFavicon;
    date = pin.wDate;
    if (pin.wImage)
        wImage.setAttribute('src', pin.wImage);
    else
        getImagePreview();
    wImage.addEventListener('error', getImagePreview);
    if (pin.wType && [...wType.options].map(o => o.value).includes(pin.wType)) {
        console.log('here!!!!!!');
        wType.value = pin.wType;
    } else
        wType.value = 'undefined';
}
let a;
let b;
chrome.runtime.sendMessage({
    message: 'get_projects'
}, response => {
    if (response.message === 'success') {
        projects = response.payload;
    }
});

chrome.windows.getCurrent({ populate: true }, window => {
    const site_to_pin = window.tabs.filter(tab => tab.active);
    chrome.runtime.sendMessage({
        message: 'get_current_pin',
        payload: site_to_pin
    }, response => {
        console.log('Pin received from service worker:', response.payload);
        populatePinForm(response.payload);
    });
});