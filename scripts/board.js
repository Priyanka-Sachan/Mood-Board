const board = document.getElementById('board');
let pins, projects;
var msnry = new Masonry('#board', { "percentPosition": true });

const address = window.location.search;
const params = new URLSearchParams(address);
getPins();

function getFullDate(date) {
    const months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
    // return `${date.getFullYear()}, ${months[date.getMonth()]} ${date.getDate()}`;
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

function createPin(pin) {
    const { wImage, wFavicon, wProject, wType, wTitle, wUrl, wTags, wDesc, wNote, wDate } = pin;
    console.log('Pin', pin);

    const domain = (new URL(wUrl)).hostname.replace('www.', '');

    let tags = '';
    wTags.forEach((tag) => {
        tags = tags.concat(`<li>${tag}</li>`);
    });

    const card = document.createElement('div');
    card.classList.add('card', 'pin');

    // Link to license for close.svg: https://fontawesome.com/license
    card.innerHTML =
        `<img src="./icons/close.svg" class="close-icon">
    <img src="${wImage?wImage:wFavicon}" class="card-img-top" >
    <div class="card-body">
        <a href="${wUrl}" target = "_blank">
            <img class = "favicon" src = "${wFavicon}">
            <h5 class = "card-title">${wTitle}</h5>
        </a>
        <h6 class="card-subtitle mb-2 text-muted">${domain}</h6><ul>` +
        tags +
        `</ul><p class="card-text">${wNote}</p>
        <p class="card-text small text-muted"> ${wProject.toUpperCase()} &bull; ${wType.toUpperCase()} &bull; ${getFullDate(new Date(wDate))}</p>
    </div>`;

    board.appendChild(card);
    msnry.appended(card);
    msnry.layout();
}

function deletePin(pin) {
    let i = pin.children[2].children[0].href;
    pins = pins.filter(pin => pin.wUrl != i);
    pin.remove();
    msnry.layout();
    chrome.runtime.sendMessage({
        message: 'delete_pin',
        payload: pins
    }, response => {
        if (response.message === 'success') {
            console.log('Pin deletion succesful.', i);
        }
    });
}

function filterPins() {
    console.log(params);
    if (params) {
        pins = pins.filter((pin) => {
            if ((params.get('p') && pin['wProject'] != params.get('p')))
                return false;
            return true;
        });
    }
}

function getPins() {
    chrome.runtime.sendMessage({
        message: 'get_pins'
    }, response => {
        if (response.message === 'success') {
            pins = response.payload;
            filterPins();
            pins.forEach(pin_data => {
                createPin(pin_data);
            });
            document.querySelectorAll('.close-icon').forEach(item => {
                item.addEventListener('click', event => {
                    deletePin(event.currentTarget.parentNode);
                }, false);
            });
        }
    });
}

const openNav = document.getElementById('open-nav');
const closeNav = document.getElementById('close-nav');
const moodNav = document.getElementById('mood-nav');

openNav.addEventListener('click', () => {
    document.getElementById("mood-nav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    setTimeout(function() { msnry.layout(); }, 500);

});
closeNav.addEventListener('click', () => {
    document.getElementById("mood-nav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    setTimeout(function() { msnry.layout(); }, 500);
});

chrome.runtime.sendMessage({
    message: 'get_projects'
}, response => {
    if (response.message === 'success') {
        projects = response.payload;
        projects.forEach((project) => {
            const p = document.createElement('a');
            p.setAttribute('href', `?p=${project}`);
            p.innerHTML = project.replace(
                /\w\S*/g,
                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            moodNav.appendChild(p);
        });
    }
});