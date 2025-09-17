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

const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const serveHandler = require('serve-handler');
const { ipcRenderer } = require("electron");

export const configPath = './userData/conf/app.conf';
const binaryPath = './userData/casibase.exe';
const dataPath = './userData/data';
const staticPath = './userData/web/build';

export function srcCheck() {
  return new Promise(async (resolve, reject) => {
    try {
      const binaryExists = fs.existsSync(binaryPath);
      const staticExists = fs.existsSync(staticPath);
      const dataExists = fs.existsSync(dataPath);

      if (binaryExists && staticExists & dataExists) {
        return resolve(true);
      } else {
        return reject(new Error("resources not found"))
      }
    } catch (err) {
      reject(err);
    }
  });
}

export function confCheck() {
  return new Promise(async (resolve, reject) => {
    try {
      if (!fs.existsSync(configPath)) return reject(new Error('config file not found'));

      const lines = (await fsPromises.readFile(configPath, 'utf-8')).split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        if (line.trim() && !line.includes('=')) {
          return reject(new Error(`${line}`));
        }
        const confItem = line.split('=');
        if (!checkConfItem(confItem[0].trim(), confItem[1].trim())) {
          return reject(new Error(`${confItem[0]}`));
        }
      }
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

export function deployApp() {
  return new Promise((resolve, reject) => {
    let backend, frontend;
    let backendReady = false;
    let frontendReady = false;

    try {
      const backendDir = path.join(binaryPath, '..');

      backend = spawn('./casibase.exe', {
        cwd: backendDir,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      backend.stdout.on('data', (data) => {
        const msg = data.toString();
        // record log 
        ipcRenderer.send("add-log", 'info', msg.trim());

        if (!backendReady && msg.includes('http server Running on')) {
          backendReady = true;
          checkReady();
        }
      });

      backend.stderr.on('data', (data) => {
        ipcRenderer.send("add-log", 'error', data.toString().trim());
        cleanup();
        return reject(new Error(data.toString().trim().split("\n")[0] || ""))
      });

      frontend = http.createServer((req, res) => {
        return serveHandler(req, res, { public: path.join(process.cwd(), staticPath) });
      });

      frontend.listen(3000, () => {
        frontendReady = true;
        ipcRenderer.send("add-log", 'info', "front end started.");
        checkReady();
      });

      frontend.on('error', (err) => {
        ipcRenderer.send("add-log", 'error', err);
        cleanup();
        return reject(new Error(err))
      });

      function checkReady() {
        if (backendReady && frontendReady) {
          resolve({
            backend,
            frontend
          });
        }
      }

      function cleanup() {
        if (backend && !backend.killed) backend.kill();
        if (frontend && frontend.listening) frontend.close();
      }

    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}

function checkConfItem(confItemName, confItemValue) {
  // check confItem by rule here
  switch (confItemName) {
    case 'dbName':
      if (confItemValue === '') {
        // dbName cannot be empty
        return false;
      }
      break;
  }
  return true;
}