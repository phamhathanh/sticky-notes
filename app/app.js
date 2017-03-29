'use strict';

const { ipcRenderer } = require('electron');

ipcRenderer.on('content', function (event, message) {
    $('#content').text(message);
});