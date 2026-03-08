import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { initDatabase } from './database/db'
import {
  getProjects, createProject, updateProject, deleteProject
} from './database/queries/projects'
import {
  getColumns, createColumn, updateColumn, deleteColumn, reorderColumns
} from './database/queries/columns'
import {
  getCards, createCard, updateCard, deleteCard, moveCard
} from './database/queries/cards'

const isDev = !app.isPackaged

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0d1117',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#161b22',
      symbolColor: '#8b949e',
      height: 36,
    },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  initDatabase()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── Projects ──────────────────────────────────────────────────────────────────
ipcMain.handle('projects:getAll', () => getProjects())
ipcMain.handle('projects:create', (_, data) => createProject(data))
ipcMain.handle('projects:update', (_, id, data) => updateProject(id, data))
ipcMain.handle('projects:delete', (_, id) => deleteProject(id))

// ── Columns ───────────────────────────────────────────────────────────────────
ipcMain.handle('columns:getByProject', (_, projectId) => getColumns(projectId))
ipcMain.handle('columns:create', (_, data) => createColumn(data))
ipcMain.handle('columns:update', (_, id, data) => updateColumn(id, data))
ipcMain.handle('columns:delete', (_, id) => deleteColumn(id))
ipcMain.handle('columns:reorder', (_, projectId, ids) => reorderColumns(projectId, ids))

// ── Cards ─────────────────────────────────────────────────────────────────────
ipcMain.handle('cards:getByProject', (_, projectId) => getCards(projectId))
ipcMain.handle('cards:create', (_, data) => createCard(data))
ipcMain.handle('cards:update', (_, id, data) => updateCard(id, data))
ipcMain.handle('cards:delete', (_, id) => deleteCard(id))
ipcMain.handle('cards:move', (_, id, columnId, position) => moveCard(id, columnId, position))
