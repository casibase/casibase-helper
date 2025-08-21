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

function registerHandlers(mainWindow) {
  ipcMain.handle("download-update", async(event, assetUrl, dest) => {
    const INSTALL_DIR = "./userData";

    const res = await fetch(assetUrl);
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
  });
}

module.exports = {registerHandlers};
