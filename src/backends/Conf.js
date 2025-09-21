// Copyright 2025 The Casibase Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License")
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

import {configPath} from './Deploy'
const fs = require('fs');
const fsPromises = fs.promises;

export async function readAppConf() {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(configPath)) return reject(new Error("Config file is not exist"));

    const txt = await fsPromises.readFile(configPath, 'utf-8')
    const lines = txt
      .split(/\r?\n/)
      .filter(line => line.trim() && !line.startsWith('#'))
      .filter(Boolean);
    const obj = {};
    lines.forEach(line => {
      const [k, v] = line.split('=').map(s => s.trim());
      obj[k] = v;
    });
    return resolve(obj);
  });
}

export function saveAppConf(content) {
  const Conf = Object.entries(content).map(([k, v]) => `${k} = ${v}`).join('\n');
  fs.writeFileSync(configPath, Conf, 'utf-8');
  return true;
}