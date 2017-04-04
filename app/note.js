'use strict';

const { ipcRenderer } = require('electron');

let id;
ipcRenderer.on('load-content', function (event, message) {
    const note = message;
    $('#content').val(note.text);
    id = note.id;
});

function saveContent() {
    ipcRenderer.send('save-content', { id: id, text: $('#content').val() });
}

ipcRenderer.on('save-content', saveContent);
window.onbeforeunload = saveContent;