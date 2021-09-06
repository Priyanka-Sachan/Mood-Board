const board = document.getElementById('board');
var msnry = new Masonry('#board', { "percentPosition": true });

function createPin(pin) {
    const { wName, wUrl, note } = pin;
    const card = document.createElement('div');
    card.classList.add('card', 'pin', 'col-4', 'col-sm-3', 'col-md-3', 'col-lg-2');

    // Link to license for close.svg: https://fontawesome.com/license
    card.innerHTML = `<img src="./icons/close.svg" class="close-icon">
    <div class="card-body">
    <a href="${wUrl}" target="_blank">
    <img src="http://s2.googleusercontent.com/s2/favicons?domain_url=${wUrl}">
    <h5 class="card-title">${wName}</h5>
    </a><h6 class="card-subtitle mb-2 text-muted">${wUrl}</h6>
    <p class="card-text">${note}</p></div>`;

    board.appendChild(card);
    msnry.appended(card);
    msnry.layout();
}

chrome.runtime.sendMessage({
    message: 'get_pins'
}, response => {
    if (response.message === 'success') {
        response.payload.forEach(pin_data => {
            createPin(pin_data);
        });
    }
});