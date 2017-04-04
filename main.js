'use strict';

const electron = require('electron');
const { app, ipcMain, BrowserWindow } = electron;
const path = require('path');
const url = require('url');
const fs = require('fs');

const dataPath = //path.join(app.getPath(documents), '/sticky_notes/');
    app.getAppPath();
const DATA_FILE_NAME = 'data.json';

let mainWindow;
let screenWidth;

app.on('ready', initialize);
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

    screenWidth = electron.screen.getPrimaryDisplay().workAreaSize.width;

    fs.readFile(DATA_FILE_NAME, (error, data) => {
        let noteArray;
        if (error) {
            noteArray = [{ id: 0, text: '' }];
            writeToFile(noteArray);
        }
        else
            noteArray = JSON.parse(data);

        noteArray.forEach(noteData => {
            const { id, text } = noteData;
            createWindow(id, text);
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

const notes = {};
let noteCount = 0;
function createWindow(id, text) {
    const numberOfNotesPerRow = ~~(screenWidth / 220);
    const y = 20 + 220 * ~~(noteCount / numberOfNotesPerRow),
        x = 20 + 220 * (noteCount % numberOfNotesPerRow);
    const window = new BrowserWindow({
        x, y,
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

    notes[id] = { text, window };
    noteCount++;

    window.once('ready-to-show', () => {
        window.show();
    });
    window.loadURL(url.format({
        pathname: path.join(__dirname, '/app/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    window.webContents.on('did-finish-load', () => {
        window.webContents.send('load-content', id, text);
    });

    return window;
}

let isClosing = false;
ipcMain.on('save-content', (event, id, text) => {
    const note = notes[id];
    note.text = text;
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

ipcMain.on('delete', (event, id) => {
    const window = notes[id].window;
    window.destroy();
    delete notes[id];
    noteCount--;

    // Race condition?
    if (noteCount === 0)
        saveNotesAndExit();
});

ipcMain.on('add', event => {
    createWindow(noteCount, '');
    // TODO: Randomize id.
});