const form = document.getElementById('add-bookmark-form');
const wName = document.getElementById('w_name');
const wUrl = document.getElementById('w_url');
const note = document.getElementById('note');

form.addEventListener('submit', function(event) {
    let isValid = form.checkValidity();
    form.classList.add('was-validated');
    if (isValid === false) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        const wNameValue = wName.value;
        const wUrlValue = wUrl.value;
        const noteValue = note.value;
        const bookmark = {
            wName: wNameValue,
            wUrl: wUrlValue,
            note: noteValue,
        };
        event.preventDefault();
        event.stopPropagation();
    }
}, false);