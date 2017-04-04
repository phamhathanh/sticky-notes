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
        transparent: true,
        title: 'Sticky Notes'
    });

    mainWindow.on('close', event => {
        event.preventDefault();
        closeAll();
    });

    fs.readFile(DATA_FILE_NAME, (error, data) => {
        let noteArray;
        if (error) {
            noteArray = [{ id: 0, text: '' }];
            writeToFile(noteArray);
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

function closeAll() {
    Object.values(notes)
        .filter(note => !note.closed)
        .forEach(note => {
            note.window.webContents.send('save-content');
        });
}

function writeToFile(content, onComplete) {
    fs.writeFile(DATA_FILE_NAME, JSON.stringify(content), function (error) {
        if (error)
            console.log(error);
        else if (onComplete) onComplete();
    });
}

let noteCount = 0;
function createWindow(note) {
    const window = new BrowserWindow({
        show: false,
        x: 20 + noteCount * 220,
        y: 20,
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
    noteCount++;
    // TODO: Wrap new line, using screen resolution.

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

    return window;
}

let isClosing = false;
ipcMain.on('save-content', (event, message) => {
    const note = notes[message.id];
    note.text = message.text;
    note.window.destroy();
    note.closed = true;
    noteCount--;

    if (!isClosing) {
        isClosing = true;
        closeAll();
    }

    // Race condition?
    if (noteCount === 0)
        saveNotesAndExit();
});

function saveNotesAndExit() {
    const noteArray = Object.keys(notes).map(key => ({
        id: key,
        text: notes[key].text
    }));
    writeToFile(noteArray, () => mainWindow.destroy());
}

ipcMain.on('delete', (event, message) => {
    const window = notes[message.id].window;
    window.destroy();
    delete notes[message.id];
    noteCount--;

    // Race condition?
    if (noteCount === 0)
        saveNotesAndExit();
});

ipcMain.on('add', (event, message) => {
    notes[noteCount] = {
        text: '',
        window: createWindow({
            id: noteCount,
            text: ''
        })
    };
    // TODO: Randomize id.
});

app.on('ready', initialize);