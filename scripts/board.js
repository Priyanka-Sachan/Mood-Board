navbarOpenIcon.addEventListener(('click'), openNav);

navbarCloseIcon.addEventListener(('click'), closeNav);

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
                navbarAddProject.value = '';
                projects.push(project);
                addProjectToNavbar(project);
                addProjectToPinForm(project);
            }
        });
    }
}, false);

projectAll.addEventListener('click', (e) => {
    filter.project = '';
    filter.tag = '';
    projectDetail.style.display = 'none';
    filterPins();
}, false);

projectInbox.addEventListener('click', (e) => {
    filter.project = '0';
    filter.tag = '';
    projectDetail.style.display = 'none';
    filterPins();
}, false);

sidebar1OpenIcon.addEventListener(('click'), openSide);

sidebar1CloseIcon.addEventListener(('click'), closeSide);

updateProjectIcon.addEventListener('click', (e) => {
    const project = {
        'id': currentProject.id,
        'name': projectTitle.value,
        'description': projectDescription.value
    };
    chrome.runtime.sendMessage({
        message: 'update_project',
        payload: project
    }, response => {
        if (response.message === 'success') {
            const id = projects.findIndex((p) => p.id == currentProject.id);
            projects[id] = project;
            updateProjectInNavbar(project);
            updateProjectInPinForm(project);
        }
    });
}, false);

addPinIcon.addEventListener('click', function(event) {
    console.log('here!!');
    let isValid = pinForm.checkValidity();
    pinForm.classList.add('was-validated');
    if (isValid === true) {
        const pin = {
            'id': Date.now(),
            'image': pinFormImage.getAttribute('src'),
            'favicon': pinFormFavicon.getAttribute('src'),
            'images': Array.from(pinFormImages.children, i => i.children[0].src),
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
            chrome.runtime.sendMessage({
                message: 'add_pin',
                payload: pin
            }, response => {
                if (response.message === 'success') {
                    console.log('Pin saved:', pin);
                    pins.push(pin);
                    if (!filter.project || pin.project == filter.project)
                        addPinToBoard(pin);
                    mode = 1;
                }
            });
        } else {
            pin.id = currentPin.id;
            chrome.runtime.sendMessage({
                message: 'update_pin',
                payload: pin
            }, response => {
                if (response.message === 'success') {
                    console.log('Pin updated:', pin);
                    const id = pins.findIndex((p) => p.id == currentPin.id);
                    pins[id] = pin;
                    updatePinInBoard(pin);
                }
            });
        }
    }
    event.preventDefault();
    event.stopPropagation();
}, false);

pinFormUrlIcon.addEventListener('click', (e) => {
    fetchBookmark(pinFormUrl.value);
});

removePinIcon.addEventListener('click', (event) => {
    chrome.runtime.sendMessage({
        message: 'delete_pin',
        payload: currentPin.id
    }, response => {
        if (response.message === 'success') {
            console.log('Pin deleted:', currentPin.id);
            pins = pins.filter((p) => p.id != currentPin.id);
            const pinWidget = document.querySelector(`#project-board [id='${currentPin.id}']`).parentElement;
            pinWidget.remove();
            currentPin = null;
            mode = 0;
            updateProjectTags();
            masonry.layout();
        }
    });
    event.preventDefault();
    event.stopPropagation();
}, false);

sidebar2Max.addEventListener(('click'), maxSide);

sidebar2Min.addEventListener(('click'), minSide);

sidebarEditIcon.addEventListener('click', () => {
    editor.enable();
});

sidebarPreviewIcon.addEventListener('click', () => {
    editor.disable();
});

getProjects();
getPins();