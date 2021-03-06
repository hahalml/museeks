'use strict';

const os = require('os');

const { Tray, Menu, app, ipcMain } = require('electron');

class IpcManager {

    constructor(win, icon) {

        this.tray = null;
        this.trayIcon = icon;
        this.win = win;
        this.contextMenu;

        this.songDetails = [
            {
                label: 'Not playing',
                enabled: false
            },
            {
                type: 'separator'
            }
        ];

        this.playToggle = [
            {
                label: 'Play',
                click: () => {
                    this.win.webContents.send('playerAction', 'play');
                }
            }
        ];

        this.pauseToggle = [
            {
                label: 'Pause',
                click: () => {
                    this.win.webContents.send('playerAction', 'pause');
                }
            }
        ];

        this.menu = [
            {
                label: 'Previous',
                click: () => {
                    this.win.webContents.send('playerAction', 'prev');
                }
            },
            {
                label: 'Next',
                click: () => {
                    this.win.webContents.send('playerAction', 'next');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Show',
                click: () => {
                    this.win.show();
                    this.win.focus();
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                click: () => {
                    this.win.destroy();
                    app.quit();
                }
            }
        ];
    }

    bindEvents() {

        ipcMain.on('showTray', () => {

            this.show();
        });

        ipcMain.on('hideTray', () => {

            this.hide();
        });

        ipcMain.on('playerAction', (event, reply, param1) => {

            switch(reply) {
                case 'play':
                    this.setContextMenu('play');
                    break;
                case 'pause':
                    this.setContextMenu('pause');
                    break;
                case 'trackStart': {
                    const trackMetadata = param1;
                    this.updateTrayMetadata(trackMetadata);
                    this.setContextMenu('play');
                    break;
                }
            }
        });
    }

    show() {

        this.tray = new Tray(this.trayIcon);

        this.tray.setToolTip('Museeks');

        if(os.platform() === 'win32') {
            this.tray.on('click', () => {
                this.win.show();
                this.win.focus();
                this.hide();
            });
        } else if(os.platform() === 'darwin') {
            this.tray.on('double-click', () => {
                this.win.show();
                this.win.focus();
                this.hide();
            });
        }

        this.setContextMenu('play');
    }

    hide() {

        this.tray.destroy();
    }

    setContextMenu(state) {
        const playPauseItem = state === 'pause' ? this.pauseToggle : this.playToggle;
        const menuTemplate = [...this.songDetails, ...playPauseItem, ...this.menu];
        this.tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
    }


    updateTrayMetadata(metadata) {
        this.songDetails = [
            {
                label: `${metadata.title}`,
                enabled: false
            },
            {
                label: `by ${metadata.artist}`,
                enabled: false
            },
            {
                label: `on ${metadata.album}`,
                enabled: false
            },
            {
                type: 'separator'
            }
        ];
    }
}

module.exports = IpcManager;
