'use strict';

const { app, ipcMain, dialog, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

const dataPath = //path.join(app.getPath(documents), '/sticky_notes/');
    app.getAppPath();
const DATA_FILE_NAME = 'data.json';

let mainWindow;
const notes = {};
function initialize() {
    mainWindow = new BrowserWindow({
        show: true,
        width: 0,
        height: 0,
        frame: false,
        transparent: true
    });

    fs.readFile(DATA_FILE_NAME, (error, data) => {
        let noteArray;
        if (error) {
            noteArray = [{ id: 0, text: '' }];
            fs.writeFile(DATA_FILE_NAME, JSON.stringify(noteArray), function (error) {
                if (error)
                    console.log(error);
            });
        }
        else
            noteArray = JSON.parse(data);

        noteArray.forEach(note => {
            notes[note.id] = {
                text: note.text,
                window: createWindow(note)
            };
        });
    });
}

function createWindow(note) {
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
        window.webContents.send('load-content', note);
    });

    window.on('closed', () => {
        closeAll();
    });

    return window;
}

function closeAll() {
    Object.values(notes)
        .filter(note => !note.saved)
        .forEach(note => {
            note.window.hide();
            note.window.webContents.send('save-content');
        });
}

ipcMain.on('save-content', function (event, message) {
    const note = notes[message.id];
    note.text = message.text;
    note.saved = true;

    // Race condition?
    const notesLeft = Object.values(notes).filter(note => !note.saved).length;
    if (notesLeft === 0)
        saveNotes();
});

function saveNotes() {
    const noteArray = Object.keys(notes).map(key => ({
        id: key,
        text: notes[key].text
    }));
    fs.writeFile(DATA_FILE_NAME, JSON.stringify(noteArray), function (error) {
        if (error)
            console.log(error);
        mainWindow.close();
    });
}

app.on('ready', initialize);