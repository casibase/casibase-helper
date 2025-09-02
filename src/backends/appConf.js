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

const fs = require("fs-extra");
const path = require("path");

const CONFIG_PATH = path.join("./userData/config.json");

export function readAppConf() {
  if (!fs.existsSync(CONFIG_PATH)) {
    const appConf = initAppConfig();
    return appConf;
  }
  const appConf = fs.readJsonSync(CONFIG_PATH, {throws: false});
  return appConf;
}

export function persistAppConf(configToSave) {
  fs.writeJsonSync(CONFIG_PATH, configToSave);
}

function initAppConfig() {
  return {
    proxyEnabled: false,
  };
}
