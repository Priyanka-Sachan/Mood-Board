// Navbar
const openNavbar = document.getElementById('open_navbar');
const closeNavbar = document.getElementById('close_navbar');

function openNav() {
    document.getElementById("navbar").style.width = "200px";
    document.getElementById("main").style.marginLeft = "200px";
}

function closeNav() {
    document.getElementById("navbar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

openNavbar.addEventListener(('click'), (e) => {
    openNav();
    openNavbar.style.display = 'none';
    setTimeout(function() { masonry.layout(); }, 500);
});

closeNavbar.addEventListener(('click'), (e) => {
    closeNav();
    openNavbar.style.display = 'inline';
    setTimeout(function() { masonry.layout(); }, 500);
});

// Main
const board = document.getElementById('board');
const masonry = new Masonry(board, {
    columnWidth: '.grid-sizer',
    itemSelector: '.grid-item',
});
let pins, filteredPins;

function createPin(pin) {
    const { image, images, favicon, type, title, url, tags, description, note } = pin;
    const domain = (new URL(url)).hostname.replace('www.', '');
    let tagsList = '';
    tags.forEach((tag) => {
        tagsList = tagsList.concat(`<span class="tag">${tag}</span>`);
    });
    const card = document.createElement('div');
    card.classList.add('grid-item', 'column', 'is-half-tablet', 'is-one-third-desktop', 'is-one-quarter-widescreen', 'is-one-fifth-fullhd');
    card.innerHTML = `
    <div class="card">
        ${image ? `<div class="card-image">
            <figure class="image">
                <img src="${image}">
            </figure>
        </div>`: ''}
        <div class="card-content">
            <div class="media">
                ${image ? '' : `<div class="media-left">
                    <figure class="image is-48x48">
                        <img src="${favicon}">
                    </figure>
                </div>`}
                <div class="media-content">
                <p class="subtitle is-6">${domain}</p>
                <p class="title is-4">${title}</p>
                <div class="tags">
                    ${tagsList}
                </div>
            </div>
        </div>
        <div class="content">${description}</div>
        </div >
    </div > `;
    board.appendChild(card);
    masonry.appended(card);
    masonry.layout();
}

function filterPins() {
    board.innerHTML = '<div class="grid-sizer"></div>';
    filteredPins = pins;
    filteredPins.forEach(pin_data => {
        createPin(pin_data);
    });
    imagesLoaded(board, function () {
        // init Masonry after all images have loaded
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

getPins();

// Details Sidebar
const openSidebar = document.getElementById('open_sidebar');
const closeSidebar = document.getElementById('close_sidebar');
const fetchUrl = document.getElementById('fetch_url');
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

function openSide() {
    document.getElementById("sidebar-1").style.width = "40%";
    document.getElementById("main").style.marginRight = "40%";
}

function closeSide() {
    document.getElementById("sidebar-1").style.width = "0";
    document.getElementById("main").style.marginRight = "0";
}

openSidebar.addEventListener(('click'), (e) => {
    openSide();
    openSidebar.style.display = 'none';
    closeSidebar.style.display = 'inline';
    setTimeout(function () { masonry.layout(); }, 500);
});

closeSidebar.addEventListener(('click'), (e) => {
    closeSide();
    openSidebar.style.display = 'inline';
    closeSidebar.style.display = 'none';
    setTimeout(function () { masonry.layout(); }, 500);
});

let pinInfo;
autosize(document.querySelectorAll('textarea'));

async function fetchAsync(url) {
    await fetch(url)
        .then(response => response.text())
        .then(data => {
            //...parse the document and populate
            const result = parseDocument(data, url);
            if (result.message == 'success') {
                pinInfo = result.info;
                populatePinForm();
            } else {
                //...Show a toast message
            }
        });
}

function populatePinForm() {
    if (pinInfo.favicon)
        iFavicon.setAttribute('src', pinInfo.favicon);
    const images = pinInfo.images;
    if (pinInfo.coverImage)
        iImage.setAttribute('src', pinInfo.coverImage);
    else if (images[0])
        iImage.setAttribute('src', images[0]);
    if (pinInfo.title)
        iTitle.value = pinInfo.title;
    if (pinInfo.description)
        iDescription.value = pinInfo.description;
    if (pinInfo.type && [...iType.options].map(o => o.value).includes(pinInfo.type))
        iType.value = pinInfo.type;
    else
        iType.value = 'undefined';
    if (pinInfo.preview)
        editor.txt.html(pinInfo.preview);
    autosize.update(document.querySelectorAll('textarea'));
}

form.addEventListener('submit', function (event) {
    let isValid = form.checkValidity();
    form.classList.add('was-validated');
    if (isValid === true) {
        const pin = {
            'image': iImage.getAttribute('src'),
            'favicon': iFavicon.getAttribute('src'),
            'type': iType.value,
            'title': iTitle.value,
            'url': iUrl.value,
            'tags': iTagsInput.items,
            'description': iDescription.value,
            'note': iNote.value,
            'article': editor.txt.html()
        };
        console.log('Pin created:', pin);
        chrome.runtime.sendMessage({
            message: 'add_pin',
            payload: pin
        }, response => {
            if (response.message === 'success') {
                console.log('Pin saved:', pin);
                createPin(pin);
            }
        });
    }
    event.preventDefault();
    event.stopPropagation();
}, false);

fetchUrl.addEventListener('click', (e) => {
    fetchAsync(iUrl.value);
});

// Article Sidebar
const minSidebar = document.getElementById('min_sidebar');
const maxSidebar = document.getElementById('max_sidebar');
const editArticle = document.getElementById('edit_article');
const previewArticle = document.getElementById('preview_article');

function maxSide() {
    document.getElementById("sidebar-1").style.width = "40%";
    document.getElementById("sidebar-1").style.marginRight = "60%";
    document.getElementById("sidebar-1").style.paddingLeft = "16px";
    document.getElementById("sidebar-1").style.paddingRight = "16px";
    document.getElementById("sidebar-2").style.width = "60%";
    document.getElementById("sidebar-2").style.paddingLeft = "16px";
    document.getElementById("sidebar-2").style.paddingRight = "16px";
    document.getElementById("main").style.display = "none";
    document.getElementById("main").style.marginRight = "100%";
}

function minSide() {
    document.getElementById("sidebar-1").style.width = "40%";
    document.getElementById("sidebar-1").style.marginRight = "0";
    document.getElementById("sidebar-1").style.paddingLeft = "0";
    document.getElementById("sidebar-1").style.paddingRight = "0";
    document.getElementById("sidebar-2").style.width = "0";
    document.getElementById("sidebar-2").style.paddingLeft = "0";
    document.getElementById("sidebar-2").style.paddingRight = "0";
    document.getElementById("main").style.display = "block";
    document.getElementById("main").style.marginRight = "40%";
}

maxSidebar.addEventListener(('click'), (e) => {
    maxSide();
    maxSidebar.style.display = 'none';
    minSidebar.style.display = 'inline';
    setTimeout(function () { masonry.layout(); }, 500);
});

minSidebar.addEventListener(('click'), (e) => {
    minSide();
    maxSidebar.style.display = 'inline';
    minSidebar.style.display = 'none';
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

editArticle.addEventListener('click', () => {
    editor.enable();
});

previewArticle.addEventListener('click', () => {
    editor.disable();
});