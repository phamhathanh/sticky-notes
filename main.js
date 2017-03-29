'use strict';

const { app, ipcMain, dialog, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

const dataPath = //path.join(app.getPath(documents), '/sticky_notes/');
    app.getAppPath();

let mainWindow;

function initialize() {
    mainWindow = new BrowserWindow({
        show: true,
        width: 0,
        height: 0,
        frame: false,
        transparent: true
    });

    const DATA_FILE_NAME = 'data.json';
    fs.readFile(DATA_FILE_NAME, (error, data) => {
        let notes;
        if (error) {
            notes = [{ text: '' }];
            fs.writeFile(DATA_FILE_NAME, JSON.stringify(notes), function (error) {
                if (error)
                    console.log(error);
            });
        }
        else
            notes = JSON.parse(data);

        notes.forEach(note => {
            createWindow(note.text);
        });
        // TODO: Create a map with the objects.
    });
}

function createWindow(text) {
    // TODO: Position.
    const window = new BrowserWindow({
        show: false,
        width: 200,
        height: 200,
        backgroundColor: '#f0e68c',
        frame: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        hasShadow: true,
        skipTaskbar: true,
        parent: mainWindow
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
        window.webContents.send('content', text);
    });

    // TODO: Close one = close all.
    // Save content when close.
}

app.on('ready', initialize);