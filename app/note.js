'use strict';

const { ipcRenderer } = require('electron');

let id;
ipcRenderer.on('load-content', (event, _id, text) => {
    $('#content').val(text);
    id = _id;
});

ipcRenderer.on('save-content', saveContent);
function saveContent() {
    const text = getContent();
    ipcRenderer.send('save-content', id, text);
}

window.onbeforeunload = event => {
    saveContent();
    event.returnValue = false;
};

function getContent() {
    return $('#content').val();
}

function deleteNote() {
    const text = getContent();
    if (text !== '') {
        const isConfirmed = confirm('Are you sure?');
        // TODO: Use another form of confirmation.
        if (!isConfirmed)
            return;
    }
    ipcRenderer.send('delete', id);
}

function addNote() {
    ipcRenderer.send('add');
}