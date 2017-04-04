'use strict';

const { ipcRenderer } = require('electron');

let id;
ipcRenderer.on('load-content', function (event, message) {
    const note = message;
    $('#content').val(note.text);
    id = note.id;
});

ipcRenderer.on('save-content', (event, message) => {
    ipcRenderer.send('save-content', { id: id, text: $('#content').val() });
});

window.onbeforeunload = event => {
    ipcRenderer.send('save-content', { id: id, text: $('#content').val() });
};