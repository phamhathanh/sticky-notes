'use strict';

const { app, ipcMain, dialog, BrowserWindow } = require('electron')
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 200,
        height: 200,
        backgroundColor: '#2e2c29',
        frame: false
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    });
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');
}

app.on('ready', createWindow);