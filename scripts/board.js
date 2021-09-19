const board = document.getElementById('board');
const moodNav = document.getElementById('mood-nav');

let params = {},
    pins, filteredPins, projects;
var msnry = new Masonry('#board', { "percentPosition": true });

function getFullDate(date) {
    const months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
    // return `${date.getFullYear()}, ${months[date.getMonth()]} ${date.getDate()}`;
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

function createPin(pin) {
    const { wImage, wFavicon, wProject, wType, wTitle, wUrl, wTags, wDesc, wNote, wDate } = pin;

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
        <p class="card-text text-muted">${wDesc}</p>
        <p class="card-text small text-muted"> ${wProject.toUpperCase()} &bull; ${wType.toUpperCase()} &bull; ${getFullDate(new Date(wDate))}</p>
    </div>`;
    board.appendChild(card);

    tags = document.querySelectorAll('li');
    tags.forEach((tag) => {
        tag.addEventListener('click', () => {
            console.log('Before', params);
            params = {};
            params['t'] = tag.innerHTML;
            console.log('After', params);
            filterPins();
        });
    });

    msnry.appended(card);
    msnry.layout();
}

function deletePin(pin) {
    let i = pin.children[2].children[0].href;
    pins = pins.filter(pin => pin.wUrl != i);
    filteredPins = filteredPins.filter(pin => pin.wUrl != i);
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
    console.log('Params', params);
    board.innerHTML = '';
    if (params) {
        filteredPins = pins.filter((pin) => {
            if ((params['p'] && pin['wProject'] != params['p']) ||
                (params['t'] && !pin['wTags'].includes(params['t'])))
                return false;
            return true;
        });
    }
    console.log('Filtered Pins', filteredPins);
    filteredPins.forEach(pin_data => {
        createPin(pin_data);
    });
    document.querySelectorAll('.close-icon').forEach(item => {
        item.addEventListener('click', event => {
            deletePin(event.currentTarget.parentNode);
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

function getProjects() {
    chrome.runtime.sendMessage({
        message: 'get_projects'
    }, response => {
        if (response.message === 'success') {
            projects = response.payload;
            projects.forEach((project) => {
                const p = document.createElement('a');
                p.classList.add('project-link');
                p.innerHTML = project.replace(
                    /\w\S*/g,
                    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                moodNav.appendChild(p);
            });
            let projectsDOM = document.querySelectorAll('.project-link');
            projectsDOM.forEach((p) => {
                p.addEventListener('click', () => {
                    params = {};
                    params['p'] = p.innerHTML.toLowerCase();
                    filterPins();
                });
            });

        }
    });
}

getPins();
getProjects();

const openNav = document.getElementById('open-nav');
const closeNav = document.getElementById('close-nav');

openNav.addEventListener('click', () => {
    document.getElementById("mood-nav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    openNav.style.display = 'none';
    setTimeout(function() { msnry.layout(); }, 500);

});
closeNav.addEventListener('click', () => {
    document.getElementById("mood-nav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    openNav.style.display = 'inline';
    setTimeout(function() { msnry.layout(); }, 500);
});