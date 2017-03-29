'use strict';

const { app, ipcMain, dialog, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let window;

function createWindow() {
    window = new BrowserWindow({
        show: false,
        width: 200,
        height: 200,
        backgroundColor: '#f0e68c',
        frame: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        hasShadow: true
    });
    window.once('ready-to-show', () => {
        window.show();
    });
    window.loadURL(url.format({
        pathname: path.join(__dirname, '/app/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    window.webContents.on('did-finish-load', () => {
        window.webContents.send('content', 'content goes here');
    });
}

app.on('ready', createWindow);