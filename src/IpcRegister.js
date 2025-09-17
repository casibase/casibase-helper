// Copyright 2025 The Casibase Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fetch = require("node-fetch");
const fs = require("fs-extra");
const unzipper = require("unzipper");
const {ipcMain} = require("electron");
const {HttpsProxyAgent} = require("https-proxy-agent");
const {SocksProxyAgent} = require("socks-proxy-agent");
const path = require("path")
const { addLog, getLogs, clearLogs } = require(path.join(__dirname, "backends/Log"));
const { app, BrowserWindow } = require("electron");
const url = require("url")

function registerHandlers(mainWindow, indexPath) {
  ipcMain.handle("download-update", async(event, assetUrl, dest, appConf) => {
    const INSTALL_DIR = "./userData";

    const agent = getAgent(appConf);

    try {
      const res = agent
      ? await fetch(assetUrl, {agent})
        : await fetch(assetUrl);
    if (!res.ok) {throw new Error(`${res.status}`);}

      const total = parseInt(res.headers.get("content-length"), 10);
      let received = 0;

      const fileStream = fs.createWriteStream(dest);
      await new Promise((resolve, reject) => {
        res.body.on("data", chunk => {
          received += chunk.length;
          const percent = ((received / total) * 100).toFixed(2);
          mainWindow.webContents.send("download-progress", percent);
        });
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", resolve);
      });

      await fs.createReadStream(dest)
      .pipe(unzipper.Extract({path: INSTALL_DIR}))
        .promise();
      mainWindow.webContents.send("update-done");
    }
    catch (error) {
      mainWindow.webContents.send("download-error", error.message);
      return Promise.reject(new Error(error.message));
    }
  });

  ipcMain.on("open-log-window", () => {
    let logWindow;
    if (logWindow) {
      logWindow.focus();
      return;
    }
    logWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    });
    logsPath = indexPath + "#/logs";
    logWindow.loadURL(logsPath);
    logWindow.on("closed", () => {
      logWindow = null;
    });
  });

  ipcMain.handle("get-logs", () => getLogs());
  ipcMain.handle("clear-logs", () => clearLogs());
  ipcMain.on("add-log", (event, type, message) => {
    addLog(type, message)
    BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send("new-log", {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date().toISOString()
    });
  });
  });
}

function getAgent(appConfig) {
  let agent = null;
  if (appConfig.proxyEnabled && appConfig.proxyUrl) {
    if (appConfig.proxyType === "http" || appConfig.proxyType === "https") {
      agent = new HttpsProxyAgent(appConfig.proxyUrl);
    } else if (appConfig.proxyType === "socks") {
      agent = new SocksProxyAgent(appConfig.proxyUrl);
    }
  }
  return agent;
}

module.exports = {registerHandlers};
