const form = document.getElementById('add-pin-form');
const wName = document.getElementById('w_name');
const wUrl = document.getElementById('w_url');
const note = document.getElementById('note');

chrome.windows.getCurrent({ populate: true }, window => {
    const site_to_pin = window.tabs.filter(tab => tab.active);
    wName.value = site_to_pin[0].title;
    wUrl.value = site_to_pin[0].url;

});

form.addEventListener('submit', function(event) {
    let isValid = form.checkValidity();
    form.classList.add('was-validated');
    if (isValid === true) {
        const wNameValue = wName.value;
        const wUrlValue = wUrl.value;
        const noteValue = note.value;
        const pin = {
            wName: wNameValue,
            wUrl: wUrlValue,
            note: noteValue,
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