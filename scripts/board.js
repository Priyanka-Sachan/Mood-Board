const openNavbar = document.getElementById('open_navbar');
const closeNavbar = document.getElementById('close_navbar');
const openSidebar = document.getElementById('open_sidebar');
const closeSidebar = document.getElementById('close_sidebar');
const minSidebar = document.getElementById('min_sidebar');
const maxSidebar = document.getElementById('max_sidebar');

const board = document.getElementById('board');
const form = document.getElementById('add-pin-form');
const wFavicon = document.getElementById('w_favicon');
const wImage = document.getElementById('w_image');
const wTitle = document.getElementById('w_title');
const wType = document.getElementById('w_type');
const wUrl = document.getElementById('w_url');
const wDesc = document.getElementById('w_desc');
const wNote = document.getElementById('w_note');
const fetchUrl = document.getElementById('fetch_url');
const editArticle = document.getElementById('edit_article');
const previewArticle = document.getElementById('preview_article');

let pinInfo;

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
            'wDesc': wDesc.value,
            'wNote': wNote.value,
            'wArticle': editor.txt.html()
        };
        console.log('Pin created:', pin);
        chrome.runtime.sendMessage({
            message: 'add_pin',
            payload: pin
        }, response => {
            if (response.message === 'success') {
                console.log('Pin saved:', pin);
            }
        });
    }
    event.preventDefault();
    event.stopPropagation();
}, false);

fetchUrl.addEventListener('click', (e) => {
    fetchAsync(wUrl.value);
});

function populatePinForm() {
    if (pinInfo.favicon)
        wFavicon.setAttribute('src', pinInfo.favicon);
    const images = pinInfo.images;
    if (pinInfo.coverImage)
        wImage.setAttribute('src', pinInfo.coverImage);
    else if (images[0])
        wImage.setAttribute('src', images[0]);
    if (pinInfo.title)
        wTitle.value = pinInfo.title;
    if (pinInfo.description)
        wDesc.value = pinInfo.description;
    if (pinInfo.type && [...wType.options].map(o => o.value).includes(pinInfo.type))
        wType.value = pinInfo.type;
    else
        wType.value = 'undefined';
    if (pinInfo.preview)
        editor.txt.html(pinInfo.preview);
    autosize.update(document.querySelectorAll('textarea'));
}

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
// Disabled editor by disable API
editArticle.addEventListener('click', () => {
    editor.enable();
});

// Cancel disabled by enable API
previewArticle.addEventListener('click', () => {
    editor.disable();
});

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
});
closeNavbar.addEventListener(('click'), (e) => {
    closeNav();
    openNavbar.style.display = 'inline';
});

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
});
closeSidebar.addEventListener(('click'), (e) => {
    closeSide();
    openSidebar.style.display = 'inline';
    closeSidebar.style.display = 'none';
});


function maxSide() {
    document.getElementById("sidebar-1").style.width = "40%";
    document.getElementById("sidebar-1").style.marginRight = "60%";
    document.getElementById("sidebar-1").style.paddingLeft = "16px";
    document.getElementById("sidebar-1").style.paddingRight = "16px";
    document.getElementById("sidebar-2").style.width = "60%";
    document.getElementById("sidebar-2").style.paddingLeft = "16px";
    document.getElementById("sidebar-2").style.paddingRight = "16px";
    document.getElementById("command_space").style.display = "none";
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
    document.getElementById("command_space").style.display = "flex";
    document.getElementById("main").style.marginRight = "40%";
}

maxSidebar.addEventListener(('click'), (e) => {
    maxSide();
    maxSidebar.style.display = 'none';
    minSidebar.style.display = 'inline';
});
minSidebar.addEventListener(('click'), (e) => {
    minSide();
    maxSidebar.style.display = 'inline';
    minSidebar.style.display = 'none';
});

autosize(document.querySelectorAll('textarea'));

function createPin(pin) {
    const { wImage, wFavicon, wType, wTitle, wUrl, wDesc, wNote } = pin;

    const domain = (new URL(wUrl)).hostname.replace('www.', '');

    const card = document.createElement('div');
    card.innerHTML = `<div class="card">
    <div class="card-image">
      <figure class="image is-4by3">
        <img src="${wImage?wImage:wFavicon}">
      </figure>
    </div>
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <img src="${wFavicon}">
          </figure>
        </div>
        <div class="media-content">
          <p class="title is-4">${wTitle}</p>
          <p class="subtitle is-6">${domain}</p>
        </div>
      </div>
      <div class="content">${wDesc}</div>
    </div>
  </div>`;
    board.appendChild(card);
}

function filterPins() {
    board.innerHTML = '';
    filteredPins = pins;
    filteredPins.forEach(pin_data => {
        createPin(pin_data);
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