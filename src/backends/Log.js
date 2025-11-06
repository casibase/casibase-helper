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

const fs = require("fs");
const path = require("path");
const {app} = require("electron");

const logDir = path.join(app.getPath("userData"), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, {recursive: true});
}
const logFile = path.join(logDir, "app.log");

let logs = [];
const MAX_LOGS = 1000;

function addLog(type, message) {
  const logEntry = {
    id: Date.now() + Math.random(),
    type,
    message,
    time: new Date().toISOString(),
  };

  logs.push(logEntry);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  const fileLine = `[${logEntry.time}] [${type.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(logFile, fileLine);

  return logEntry;
}

function getLogs() {
  return logs;
}

function clearLogs() {
  logs = [];
  fs.writeFileSync(logFile, "");
}

module.exports = {
  addLog,
  getLogs,
  clearLogs,
};
