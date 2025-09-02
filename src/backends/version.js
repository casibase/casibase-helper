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

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const {ipcRenderer} = window.require("electron");

const REPO = "casibase/casibase";
const VERSION_FILE = "./userData/version.json";
const DOWNLOADS_DIR = "./userData/downloads";

export function getLocalVersion() {
  if (!fs.existsSync(VERSION_FILE)) {return null;}
  return JSON.parse(fs.readFileSync(VERSION_FILE, "utf-8")).version;
}

function saveLocalVersion(version) {
  fs.writeFileSync(VERSION_FILE, JSON.stringify({
    version,
    downloadedAt: new Date().toISOString(),
  }, null, 2));
}

export async function getLatestVersion() {
  const release = await getLatestRelease();
  return release.tag_name;
}

export async function getLatestRelease() {
  const url = `https://api.github.com/repos/${REPO}/releases/latest`;
  const res = await axios.get(url);
  return res.data;
}

function getAssetName() {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === "win32") {
    if (arch === "x64") {return "casibase_Windows_x86_64.zip";}
    if (arch === "ia32") {return "casibase_Windows_i386.zip";}
    if (arch === "arm64") {return "casibase_Windows_arm64.zip";}
  } else if (platform === "linux") {
    if (arch === "x64") {return "casibase_Linux_x86_64.tar.gz";}
    if (arch === "ia32") {return "casibase_Linux_i386.tar.gz";}
    if (arch === "arm64") {return "casibase_Linux_arm64.tar.gz";}
  } else if (platform === "darwin") {
    if (arch === "x64") {return "casibase_Darwin_x86_64.tar.gz";}
    if (arch === "arm64") {return "casibase_Darwin_arm64.tar.gz";}
  }
}

export async function update(appConfig) {
  const localVersion = getLocalVersion();
  const release = await getLatestRelease();
  const latestVersion = release.tag_name;

  if (localVersion === latestVersion) {
    return;
  }

  const assetName = getAssetName();
  const asset = release.assets.find(a => a.name === assetName);

  const zipPath = path.join(DOWNLOADS_DIR, asset.name);
  await fs.ensureDir(DOWNLOADS_DIR);

  await ipcRenderer.invoke(
    "download-update",
    asset.browser_download_url,
    zipPath,
    appConfig
  );

  saveLocalVersion(latestVersion);
  return latestVersion;
}
