'use strict';

const { app, ipcMain, dialog, BrowserWindow } = require('electron')
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        backgroundColor: '#2e2c29',
        frame: false
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    });
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');
}

app.on('ready', createWindow);