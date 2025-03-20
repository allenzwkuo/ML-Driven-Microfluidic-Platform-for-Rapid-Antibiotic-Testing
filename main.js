const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process'); 
const path = require('path');


function startFlask() {
    const flask = spawn('python', ['app.py'], { cwd: path.join(__dirname, 'backend') }); 

    flask.stdout.on('data', (data) => {
        console.log(`Flask Output: ${data}`);
    });

    flask.stderr.on('data', (data) => {
        console.error(`Flask Error: ${data}`);
    });

    flask.on('close', (code) => {
        console.log(`Flask process exited with code ${code}`);
    });
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: true,       
        resizable: false,       
        frame: false,           
        webPreferences: {
        nodeIntegration: true,
        webSecurity: false     
        },
    });

    
    mainWindow.loadURL('http://localhost:5173'); 

    
    mainWindow.setFullScreen(true);  
}

app.whenReady().then(() => {
    startFlask();  
    createWindow(); 

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
