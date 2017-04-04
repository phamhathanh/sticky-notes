'use strict';

const { ipcRenderer } = require('electron');

let id;
ipcRenderer.on('load-content', (event, _id, text) => {
    $('#content').val(text);
    id = _id;
});

ipcRenderer.on('save-content', saveContent);
function saveContent() {
    const text = $('#content').val();
    ipcRenderer.send('save-content', id, text);
}

window.onbeforeunload = event => {
    saveContent();
    event.returnValue = false;
};

function deleteNote() {
    const isConfirmed = confirm('Are you sure?');
    // TODO: Use another form of confirmation.
    // TODO: Do not prompt when empty.
    if (!isConfirmed)
        return;
    ipcRenderer.send('delete', id);
}

function addNote() {
    ipcRenderer.send('add');
}