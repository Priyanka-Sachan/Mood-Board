function openNav() {
    navbar.style.width = "200px";
    main.style.marginLeft = "200px";
}

function closeNav() {
    navbar.style.width = "0";
    main.style.marginLeft = "0";
}

navbarOpenIcon.addEventListener(('click'), (e) => {
    openNav();
    navbarOpenIcon.style.display = 'none';
    setTimeout(function() { masonry.layout(); }, 500);
});

navbarCloseIcon.addEventListener(('click'), (e) => {
    closeNav();
    navbarOpenIcon.style.display = 'inline';
    setTimeout(function() { masonry.layout(); }, 500);
});

navbarAddProjectIcon.addEventListener('click', (e) => {
    const name = navbarAddProject.value;
    if (name) {
        const project = {
            'id': Date.now(),
            'name': name,
            'description': ''
        }
        chrome.runtime.sendMessage({
            message: 'add_project',
            payload: project
        }, response => {
            if (response.message === 'success') {
                console.log('Project added', project);
                addProjectToNavbar(project);
                addProjectToPinForm(project);
                navbarAddProject.value = '';
            }
        });
    }
}, false);

function addProjectToNavbar(project) {
    const p = document.createElement('a');
    p.innerHTML = project.name;
    p.addEventListener('click', (e) => {
        filter.project = project.name;
        filter.tag = '';
        filterPins();
        updateAllTags();
    }, false);
    navbarProjects.appendChild(p);
}

function addProjectToPinForm(project) {
    const p = document.createElement('option');
    p.innerHTML = project.name;
    p.value = project.name;
    pinFormProject.appendChild(p);
}

function getProjects() {
    chrome.runtime.sendMessage({
        message: 'get_projects'
    }, response => {
        if (response.message === 'success') {
            projects = response.payload;
            projects.forEach((project) => {
                //Add project to navbar
                addProjectToNavbar(project);
                //Add project to pinForm
                addProjectToPinForm(project);
            });
        }
    });
}

getProjects();

function getPinData(pin) {
    const { id, image, images, favicon, type, title, url, domain, tags, description, note } = pin;
    let tagsList = '';
    tags.forEach((tag) => {
        tagsList = tagsList.concat(`<span class="tag">${tag}</span>`);
    });
    const pinData = `
    <div class="card pin" id="${id}">
        ${image ? `<div class="card-image">
            <figure class="image">
                <img class="pin-image" src="${image}">
            </figure>
        </div>`: ''}
        <div class="card-content">
            <div class="media">
                ${image ? '' : `<div class="media-left">
                    <figure class="image is-48x48">
                        <img class="card-favicon" src="${favicon}">
                    </figure>
                </div>`}
                <div class="media-content">
                <p class="subtitle is-6 pin-domain">${domain}</p>
                <p class="title is-4 pin-title">${title}</p>
                <div class="tags pin-tags">
                    ${tagsList}
                </div>
            </div>
        </div>
        <div class="content pin-description">${description}</div>
        </div >
        <figure class="image is-24x24 pin-edit-icon">
                <img src="./icons/edit.svg">
        </figure>
        <figure class="image is-24x24 pin-delete-icon">
                <img src="./icons/delete.svg">
        </figure>
    </div > `;
    return pinData;
}

function addPin(pin) {
    const card = document.createElement('div');
    card.classList.add('grid-item', 'column');
    card.innerHTML = getPinData(pin);
    projectBoard.appendChild(card);
    masonry.appended(card);
    masonry.layout();
}

function updateAllTags() {
    projectTags.innerHTML = '';
    let allUniqueTags = [];
    filteredPins.forEach((pin) => {
        pin.tags.forEach((tag) => {
            allUniqueTags.push(tag);
        });
    });
    allUniqueTags = new Set([...allUniqueTags]);
    allUniqueTags.forEach((tag) => {
        const tagWidget = document.createElement('span');
        tagWidget.classList.add('tag');
        tagWidget.innerHTML = tag;
        tagWidget.addEventListener('click', (e) => {
            filter.tag = tag;
            filterPins();
        }, false);
        projectTags.appendChild(tagWidget);
    });
}

function filterPins() {
    projectBoard.innerHTML = '';
    filteredPins = pins.filter((p) => {
        if (filter.project) {
            if (filter.tag) {
                return (p.project == filter.project && p.tags.includes(filter.tag));
            }
            return p.project == filter.project;
        }
        return true;
    });
    filteredPins.forEach(pin_data => {
        addPin(pin_data);
    });
    imagesLoaded(projectBoard, function () {
        // init Masonry after all images have loaded
        masonry.layout();
    });
    document.querySelectorAll('.pin-edit-icon').forEach(item => {
        item.addEventListener('click', event => {
            const id = parseInt(event.currentTarget.parentNode.id);
            pinInfo = pins.find((p) => p.id == id);
            if (pinInfo) {
                mode = 1;
                populatePinForm(pinInfo);
                openSide();
            } else {
                //...Toast cannot open bookmark
            }
        }, false);
    });
    document.querySelectorAll('.pin-delete-icon').forEach(item => {
        item.addEventListener('click', event => {
            const id = parseInt(event.currentTarget.parentNode.id);
            const target = event.currentTarget.parentNode.parentNode;
            chrome.runtime.sendMessage({
                message: 'delete_pin',
                payload: id
            }, response => {
                if (response.message === 'success') {
                    console.log('Pin deleted:', id);
                    target.remove();
                    masonry.layout();
                }
            });
        }, false);
    });
}

function getPins() {
    chrome.runtime.sendMessage({
        message: 'get_pins'
    }, response => {
        if (response.message === 'success') {
            pins = response.payload;
            filterPins();
        }
    });
}

getPins();

function openSide() {
    sidebar1.style.width = "40%";
    main.style.marginRight = "40%";
    sidebar1OpenIcon.style.display = 'none';
    sidebar1CloseIcon.style.display = 'inline';
    window.cqApi.reevaluate(false, function () {
        masonry.layout();
    });
}

function closeSide() {
    mode = 0;
    sidebar1.style.width = "0";
    main.style.marginRight = "0";
    sidebar1OpenIcon.style.display = 'inline';
    sidebar1CloseIcon.style.display = 'none';
    window.cqApi.reevaluate(false, function () {
        masonry.layout();
    });
    clearPinForm();
}

sidebar1OpenIcon.addEventListener(('click'), (e) => {
    openSide();
});

sidebar1CloseIcon.addEventListener(('click'), (e) => {
    closeSide();
});

async function fetchAsync(url) {
    await fetch(url)
        .then(response => response.text())
        .then(data => {
            //...parse the document and populate
            const result = parseDocument(data, url);
            if (result.message == 'success') {
                pinInfo = result.info;
                mode = 0;
                populatePinForm(pinInfo);
            } else {
                //...Show a toast message
            }
        });
}
function clearPinForm() {
    pinFormUrl.value = '';
    pinFormFavicon.setAttribute('src', './icons/web.svg');
    pinFormImages.innerHTML = '';
    pinFormImage.setAttribute('src', '');
    pinFormTitle.value = '';
    pinFormTagsInput.removeAll();
    pinFormDescription.value = '';
    pinFormType.value = 'undefined';
    pinFormProject.value = 'inbox';
    editor.txt.html('');
    autosize.update(document.querySelectorAll('textarea'));
}

function populatePinForm(pinInfo) {
    console.log(pinInfo);
    clearPinForm();
    if (pinInfo.url)
        pinFormUrl.value = pinInfo.url;
    if (pinInfo.favicon)
        pinFormFavicon.setAttribute('src', pinInfo.favicon);
    const images = pinInfo.images;
    images.forEach((i) => {
        const img = document.createElement('img');
        img.src = i;
        img.classList.add('item');
        pinFormImages.appendChild(img);
    });
    // console.log(pinInfo.image);
    if (pinInfo.image)
        pinFormImage.setAttribute('src', pinInfo.image);
    else if (images[0])
        pinFormImage.setAttribute('src', images[0]);
    if (pinInfo.title)
        pinFormTitle.value = pinInfo.title;
    if (pinInfo.tags) {
        pinInfo.tags.forEach((tag) => {
            pinFormTagsInput.add(tag);
        });
    }
    if (pinInfo.description)
        pinFormDescription.value = pinInfo.description;
    if (pinInfo.type && [...pinFormType.options].map(o => o.value).includes(pinInfo.type))
        pinFormType.value = pinInfo.type;
    else
        pinFormType.value = 'undefined';
    if (pinInfo.project && [...pinFormProject.options].map(o => o.value).includes(pinInfo.project))
        pinFormProject.value = pinInfo.project;
    else
        pinFormProject.value = 'inbox';
    if (pinInfo.article)
        editor.txt.html(pinInfo.article);
    setTimeout(function () { autosize.update(document.querySelectorAll('textarea')); }, 500);
}

pinForm.addEventListener('submit', function (event) {
    let isValid = pinForm.checkValidity();
    pinForm.classList.add('was-validated');
    if (isValid === true) {
        const pin = {
            'id': Date.now(),
            'image': pinFormImage.getAttribute('src'),
            'favicon': pinFormFavicon.getAttribute('src'),
            'images': Array.from(pinFormImages.childNodes, i => i.src),
            'project': pinFormProject.value,
            'type': pinFormType.value,
            'title': pinFormTitle.value,
            'url': pinFormUrl.value,
            'domain': (new URL(pinFormUrl.value)).hostname.replace('www.', ''),
            'tags': pinFormTagsInput.items,
            'description': pinFormDescription.value,
            'note': pinFormNote.value,
            'article': editor.txt.html()
        };
        if (mode == 0) {
            console.log('Pin created:', pin);
            chrome.runtime.sendMessage({
                message: 'add_pin',
                payload: pin
            }, response => {
                if (response.message === 'success') {
                    console.log('Pin saved:', pin);
                    addPin(pin);
                }
            });
        } else {
            pin.id = pinInfo.id;
            console.log('Pin updated:', pin);
            chrome.runtime.sendMessage({
                message: 'update_pin',
                payload: pin
            }, response => {
                if (response.message === 'success') {
                    console.log('Pin updated:', pin);
                    const pinWidget = document.getElementById(String(pin.id));
                    pinWidget.innerHTML = getPinData(pin);
                    updateAllTags();
                    masonry.layout();
                }
            });
        }
    }
    event.preventDefault();
    event.stopPropagation();
}, false);

pinFormUrlIcon.addEventListener('click', (e) => {
    fetchAsync(pinFormUrl.value);
});


function maxSide() {
    sidebar1.style.width = "40%";
    sidebar1.style.marginRight = "60%";
    sidebar1.style.paddingLeft = "16px";
    sidebar1.style.paddingRight = "16px";
    sidebar2.style.width = "60%";
    sidebar2.style.paddingLeft = "16px";
    sidebar2.style.paddingRight = "16px";
    main.style.display = "none";
    main.style.marginRight = "100%";
}

function minSide() {
    sidebar1.style.width = "40%";
    sidebar1.style.marginRight = "0";
    sidebar1.style.paddingLeft = "0";
    sidebar1.style.paddingRight = "0";
    sidebar2.style.width = "0";
    sidebar2.style.paddingLeft = "0";
    sidebar2.style.paddingRight = "0";
    main.style.display = "block";
    main.style.marginRight = "40%";
}

sidebar2Max.addEventListener(('click'), (e) => {
    maxSide();
    sidebar2Max.style.display = 'none';
    sidebar2Min.style.display = 'inline';
    setTimeout(function () { masonry.layout(); }, 500);
});

sidebar2Min.addEventListener(('click'), (e) => {
    minSide();
    sidebar2Max.style.display = 'inline';
    sidebar2Min.style.display = 'none';
    setTimeout(function () { masonry.layout(); }, 500);
});

const E = window.wangEditor;
const editor = new E('#editor');
editor.config.height = window.innerHeight - 100;
editor.config.fontNames = [
    'Arial',
    'Tahoma',
    'Verdana',
    'Times New Roman',
    'Courier New',
];
editor.config.excludeMenus = [
    'redo',
    'undo'
]
editor.config.lang = 'en';
editor.i18next = window.i18next;
editor.create();

sidebarEditIcon.addEventListener('click', () => {
    editor.enable();
});

sidebarPreviewIcon.addEventListener('click', () => {
    editor.disable();
});