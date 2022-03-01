function openNav() {
    navbar.style.width = '200px';
    main.style.marginLeft = '200px';
    navbarOpenIcon.style.display = 'none';
    setTimeout(function() { masonry.layout(); }, 500);
}

function closeNav() {
    navbar.style.width = '0';
    main.style.marginLeft = '0';
    navbarOpenIcon.style.display = 'inline';
    setTimeout(function() { masonry.layout(); }, 500);
}

function populateProject() {
    console.log(currentProject);
    projectTitle.value = currentProject.name;
    projectDescription.value = currentProject.description;
    autosize.update(document.querySelectorAll('textarea'));
    updateProjectTags();
}

function addProjectToNavbar(project) {
    const projectWidget = document.createElement('a');
    projectWidget.id = project.id;
    projectWidget.innerHTML = project.name;
    projectWidget.addEventListener('click', (e) => {
        currentProject = projects.find((p) => p.id == project.id);
        filter.project = currentProject.id;
        filter.tag = '';
        filterPins();
        projectDetail.style.display = 'block';
        populateProject();
    }, false);
    navbarProjects.appendChild(projectWidget);
}

function addProjectToPinForm(project) {
    const projectWidget = document.createElement('option');
    projectWidget.innerHTML = project.name;
    projectWidget.value = project.id;
    pinFormProject.appendChild(projectWidget);
}

function updateProjectInNavbar(project) {
    const projectWidget = document.querySelector(`#navbar-projects [id='${project.id}'] `);
    projectWidget.innerHTML = project.name;
}

function updateProjectInPinForm(project) {
    const projectWidget = document.querySelector(`#pin-form-project option[value='${project.id}'] `);
    projectWidget.innerHTML = project.name;
}

function getProjects() {
    chrome.runtime.sendMessage({
        message: 'get_projects'
    }, response => {
        if (response.message === 'success') {
            projects = response.payload;
            projects.forEach((project) => {
                addProjectToNavbar(project);
                addProjectToPinForm(project);
            });
        }
    });
}

function createPinCard(pin) {
    const { id, image, images, favicon, type, title, url, domain, tags, description, note } = pin;
    let tagsList = '';
    tags.forEach((tag) => {
        tagsList = tagsList.concat(`<span class='tag'>${tag}</span>`);
    });
    const card = document.createElement('div');
    card.classList.add('grid-item', 'column');
    card.innerHTML = `
    <div class='card pin' id='${id}'>
        ${image ? `<div class='card-image'>
            <figure class='image'>
                <img class='pin-image' src='${image}'>
            </figure>
        </div>`: ''}
        <div class='card-content'>
            <div class='media'>
                ${image ? '' : `<div class='media-left'>
                    <figure class='image is-48x48'>
                        <img class='card-favicon' src='${favicon}'>
                    </figure>
                </div>`}
                <div class='media-content'>
                <p class='subtitle is-6 pin-domain'>${domain}</p>
                <p class='title is-4 pin-title'>${title}</p>
                <div class='tags pin-tags'>
                    ${tagsList}
                </div>
            </div>
        </div>
        <div class='content pin-description'>${description}</div>
        </div >
        <figure class='image is-24x24 pin-edit-icon'>
                <img src='./icons/edit.svg'>
        </figure>
        <figure class='image is-24x24 pin-delete-icon'>
                <img src='./icons/delete.svg'>
        </figure>
    </div > `;
    return card;
}

function addPinToBoard(pin) {
    const card = createPinCard(pin);
    projectBoard.appendChild(card);
    document.querySelector(`[id='${pin.id}'] .pin-edit-icon`).addEventListener('click', event => {
        currentPin = pins.find((p) => p.id == pin.id);
        if (currentPin) {
            mode = 1;
            populatePinForm();
            openSide();
        } else {
            //...Toast cannot open bookmark
        }
    }, false);
    document.querySelector(`[id='${pin.id}'] .pin-delete-icon`).addEventListener('click', event => {
        chrome.runtime.sendMessage({
            message: 'delete_pin',
            payload: pin.id
        }, response => {
            if (response.message === 'success') {
                console.log('Pin deleted:', pin.id);
                pins = pins.filter((p) => p.id != pin.id);
                const pinWidget = document.querySelector(`#project-board [id='${pin.id}']`).parentElement;
                pinWidget.remove();
                updateProjectTags();
                masonry.layout();
            }
        });
    }, false);
    updateProjectTags();
    masonry.appended(card);
    masonry.layout();
}

function updatePinInBoard(pin) {
    const pinWidget = document.querySelector(`#project-board [id='${pin.id}']`);
    const card = createPinCard(pin);
    pinWidget.replaceWith(card.children[0]);
    document.querySelector(`[id='${pin.id}'] .pin-edit-icon`).addEventListener('click', event => {
        currentPin = pins.find((p) => p.id == pin.id);
        if (currentPin) {
            mode = 1;
            populatePinForm();
            openSide();
        } else {
            //...Toast cannot open bookmark
        }
    }, false);
    document.querySelector(`[id='${pin.id}'] .pin-delete-icon`).addEventListener('click', event => {
        chrome.runtime.sendMessage({
            message: 'delete_pin',
            payload: pin.id
        }, response => {
            if (response.message === 'success') {
                console.log('Pin deleted:', pin.id);
                pins = pins.filter((p) => p.id != pin.id);
                const pinWidget = document.querySelector(`#project-board [id='${pin.id}']`).parentElement;
                pinWidget.remove();
                masonry.layout();
            }
        });
    }, false);
    updateProjectTags();
    masonry.layout();
}

function updateProjectTags() {
    projectTags.innerHTML = '';
    let uniqueTags = [];
    pins.filter((p) => {
        if (filter.project)
            return p.project == filter.project;
        return true;
    }).forEach((pin) => {
        pin.tags.forEach((tag) => {
            uniqueTags.push(tag);
        });
    });
    uniqueTags = new Set([...uniqueTags]);
    uniqueTags.forEach((tag) => {
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
    filteredPins.forEach((p) => {
        addPinToBoard(p);
    });
    imagesLoaded(projectBoard, function () {
        masonry.layout();
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

function openSide() {
    sidebar1.style.width = '40%';
    main.style.marginRight = '40%';
    sidebar1OpenIcon.style.display = 'none';
    sidebar1CloseIcon.style.display = 'inline';
    window.cqApi.reevaluate(false, function () {
        masonry.layout();
    });
}

function closeSide() {
    mode = 0;
    sidebar1.style.width = '0';
    main.style.marginRight = '0';
    sidebar1OpenIcon.style.display = 'inline';
    sidebar1CloseIcon.style.display = 'none';
    window.cqApi.reevaluate(false, function () {
        masonry.layout();
    });
    clearPinForm();
    currentPin = null;
}

async function fetchBookmark(url) {
    await fetch(url)
        .then(response => response.text())
        .then(data => {
            //...parse the document and populate
            const result = parseDocument(data, url);
            if (result.message == 'success') {
                currentPin = result.info;
                mode = 0;
                populatePinForm();
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
    pinFormProject.value = '0';
    editor.txt.html('');
    autosize.update(document.querySelectorAll('textarea'));
}

function populatePinForm() {
    clearPinForm();
    console.log(currentPin);
    if (currentPin.url)
        pinFormUrl.value = currentPin.url;
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
    if (currentPin.image)
        pinFormImage.setAttribute('src', currentPin.image);
    else if (images[0])
        pinFormImage.setAttribute('src', images[0]);
    if (currentPin.title)
        pinFormTitle.value = currentPin.title;
    if (currentPin.tags) {
        currentPin.tags.forEach((tag) => {
            pinFormTagsInput.add(tag);
        });
    }
    if (currentPin.description)
        pinFormDescription.value = currentPin.description;
    if (currentPin.type && [...pinFormType.options].map(o => o.value).includes(currentPin.type))
        pinFormType.value = currentPin.type;
    else
        pinFormType.value = 'undefined';
    if (currentPin.project && [...pinFormProject.options].map(o => o.value).includes(currentPin.project))
        pinFormProject.value = currentPin.project;
    else
        pinFormProject.value = 'inbox';
    if (currentPin.article)
        editor.txt.html(currentPin.article);
    setTimeout(function () { autosize.update(document.querySelectorAll('textarea')); }, 500);
}

function maxSide() {
    sidebar1.style.width = '40%';
    sidebar1.style.marginRight = '60%';
    sidebar1.style.paddingLeft = '16px';
    sidebar1.style.paddingRight = '16px';
    sidebar2.style.width = '60%';
    sidebar2.style.paddingLeft = '16px';
    sidebar2.style.paddingRight = '16px';
    main.style.display = 'none';
    main.style.marginRight = '100%';
    sidebar2Max.style.display = 'none';
    sidebar2Min.style.display = 'inline';
    setTimeout(function () { masonry.layout(); }, 500);
}

function minSide() {
    sidebar1.style.width = '40%';
    sidebar1.style.marginRight = '0';
    sidebar1.style.paddingLeft = '0';
    sidebar1.style.paddingRight = '0';
    sidebar2.style.width = '0';
    sidebar2.style.paddingLeft = '0';
    sidebar2.style.paddingRight = '0';
    main.style.display = 'block';
    main.style.marginRight = '40%';
    sidebar2Max.style.display = 'inline';
    sidebar2Min.style.display = 'none';
    setTimeout(function () { masonry.layout(); }, 500);
}