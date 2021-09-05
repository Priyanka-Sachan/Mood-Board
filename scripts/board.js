const board = document.getElementById('board');

function createPin(pin) {
    const { wName, wUrl, note } = pin;
    const card = document.createElement('div');
    card.classList.add('card');
    card.classList.add('pin');
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const cardLink = document.createElement('a');
    cardLink.setAttribute('href', wUrl);
    cardLink.setAttribute('target', '_blank');
    const icon = document.createElement('img');
    icon.setAttribute('src', `http://s2.googleusercontent.com/s2/favicons?domain_url=${wUrl}`);
    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.innerText = wName;
    cardLink.append(icon, cardTitle);
    const cardSubtitle = document.createElement('h6');
    cardSubtitle.classList.add('card-subtitle');
    cardSubtitle.classList.add('mb-2');
    cardSubtitle.classList.add('text-muted');
    cardSubtitle.innerText = wUrl;
    const cardText = document.createElement('p');
    cardText.classList.add('card-text');
    cardText.innerText = note;
    // Link to license for close.svg: https://fontawesome.com/license
    const closeIcon = document.createElement('img');
    closeIcon.setAttribute('src', './icons/close.svg');
    closeIcon.classList.add('close-icon');
    // closeIcon.setAttribute('onClick', `deleteBookmark('${wUrl}')`);
    cardBody.append(cardLink, cardSubtitle, cardText);
    card.append(closeIcon, cardBody);
    board.append(card);
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