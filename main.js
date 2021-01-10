const electron = require('electron');
const {app, BrowserWindow, Menu, ipcMain} = electron;
const path = require('path');
const url = require('url');

//윈도우 객체의 전역으로 선언합니다. 그렇지 않으면 윈도우가 자동으로 닫는다.
//자바 스크립트 객체가 가비지 수집 될 때 자동으로 닫는다.
let mainWindow;
let subWindow;

//사용 준비가 완료되면 윈도우를 연다.
app.on('ready', createWindow)

// 모든 창이 닫히면 종료한다.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // macOS에서 독 아이콘이 클릭되고 다른 창은 열리지 않는다.
  if (mainWindow === null) {
    createWindow()
  }
})

function createWindow () {
  // 브라우저 창을 만듭니다.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  //index.html를 로드합니다.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // subWindow
  let displays = electron.screen.getAllDisplays();
  let externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })

  if (externalDisplay) {
    createSubWindow(externalDisplay.bounds.x, externalDisplay.bounds.y);
  }else{
      createSubWindow(0, 0)
  }

  // 개발툴을 사용하기 위해 오픈한다.
  mainWindow.webContents.openDevTools()

  // 윈도우가 닫힐 때 발생되는 이벤트다.
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createSubWindow() {
  subWindow = new BrowserWindow({
      width: 400,
      height: 300,
      useContentSize: true,
      frame: false,
      movable: false,
      resizable: false,
      show: false,
      hasShadow: false
  });

  subWindow.setFullScreen(true);

  subWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'subWindow.html'),
      protocol: 'file:',
      slashes: true
  }));
}

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: '실행취소',
        role: 'undo'
      },
      {
        label: '재실행',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: '잘라내기',
        role: 'cut'
      },
      {
        label: '복사',
        role: 'copy'
      },
      {
        label: '붙여넣기',
        role: 'paste'
      },
      {
        role: 'pasteandmatchstyle'
      },
      {
        abel: '삭제',
        role: 'delete'
      },
      {
        abel: '전체선택',
        role: 'selectall'
      },
      {
        type: 'separator'
      },
      {
        label: '설정',
        accelerator: 'CmdOrCtrl+K',
        click (item, focusedWindow) {
          console.log("설정메뉴 클릭")
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('http://electron.atom.io') }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

ipcMain.on('show', (event, arg) => {
    subWindow.showInactive();
});

ipcMain.on('hide', (event, arg) => {
    subWindow.hide();
});