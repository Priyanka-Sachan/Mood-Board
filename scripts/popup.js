const form = document.getElementById('add-pin-form');
const wImage = document.getElementById('w_image');
const wTitle = document.getElementById('w_title');
const wProject = document.getElementById('w_project');
const wType = document.getElementById('w_type');
const wUrl = document.getElementById('w_url');
const wDesc = document.getElementById('w_desc');
const wNote = document.getElementById('w_note');
let image, title, type, favicon, url, desc, note, date;
let message, projects;

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

    date = new Date();
    console.log('Date', date);

});

form.addEventListener('submit', function(event) {
    let isValid = form.checkValidity();
    form.classList.add('was-validated');
    if (isValid === true) {

        const pin = {
            wImage: image,
            wFavicon: favicon,
            wProject: wProject.value,
            wType: wType.value,
            wTitle: wTitle.value,
            wUrl: wUrl.value,
            wTags: tags,
            wDesc: wDesc.value,
            wNote: wNote.value,
            wDate: date.toUTCString()
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
        if (type && type in [...wType.options].map(o => o.value))
            wType.value = type;
        else
            wType.value = 'undefined';
    }
});

const txt = document.getElementById('tag_input');
const tagList = document.getElementById('tag_list');
let tags = [];

txt.addEventListener('keypress', function(e) {
    if (e.key === ' ') {
        let tag = txt.value;
        tag = tag.trim();
        if (tag !== '') {
            if (tags.indexOf(tag) >= 0) {
                alert('Tag name is a duplicate');
            } else {
                tags.push(tag);
                tagList.innerHTML += `<li><span>${tag}</span><a class="close-tag" id="tag-${tag}">X</a></li>`;
                document.querySelectorAll('.close-tag').forEach(item => {
                    item.addEventListener('click', event => {
                        console.log(event.currentTarget.parentNode.children[0].innerHTML);
                        let i = event.currentTarget.parentNode.children[0].innerHTML;
                        tags = tags.filter(item => item != i);
                        event.currentTarget.parentNode.remove();
                    }, false);
                });
                txt.value = '';
                txt.focus();
            }
        } else {
            alert('Please type a tag Name');
        }
    }
});

function addProject(project) {
    chrome.runtime.sendMessage({
        message: 'add_project',
        payload: project
    }, response => {
        if (response.message === 'success') {
            console.log('Project saved', project);
            window.close();
        }
    });
}

chrome.runtime.sendMessage({
    message: 'get_projects'
}, response => {
    if (response.message === 'success') {
        projects = response.payload;
        console.log(projects);
        projects.forEach(project => {
            const op = document.createElement('option');
            op.value = project;
            op.innerHTML = project;
            console.log(op);
            wProject.appendChild(op);
        });
    }
});