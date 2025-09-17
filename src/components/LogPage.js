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


import React, { useEffect, useState } from 'react'
import { Button, Space, Tag } from 'antd'
import { useTranslation } from "react-i18next";

const LogPage = () => {
  const { t } = useTranslation();
  const { ipcRenderer } = require("electron");
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')
  useEffect(() => {
  const init = async () => {
    const logs = await ipcRenderer.invoke("get-logs");
    setLogs(logs);
  };
  init();

  const newLogHandler = (event, log) => {
    setLogs(prev => [...prev, log]);
  };
  ipcRenderer.on("new-log", newLogHandler);

  return () => {
    ipcRenderer.removeListener("new-log", newLogHandler);
  };
}, []);

  const refreshLogs = async () => {
    const logs = await ipcRenderer.invoke("get-logs");
    setLogs([...logs])
  }

  const clearLogs = async () => {
    await ipcRenderer.invoke("clear-logs");
    setLogs([])
  }

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    return log.type === filter
  })

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Space style={{ marginBottom: 12 }}>
        <Button type={filter === 'all' ? 'primary' : 'default'} onClick={() => setFilter('all')}>
          {t("logs.all")}
        </Button>
        <Button type={filter === 'info' ? 'primary' : 'default'} onClick={() => setFilter('info')}>
          {t("logs.normal")}
        </Button>
        <Button type={filter === 'error' ? 'primary' : 'default'} danger onClick={() => setFilter('error')}>
          {t("logs.error")}
        </Button>
        <Button onClick={clearLogs}>{t("logs.clear")}</Button>
        <Button onClick={refreshLogs}>{t("logs.refresh")}</Button>
      </Space>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #f0f0f0',
          borderRadius: 4,
          padding: 8,
          background: '#fafafa',
        }}
      >
        {filteredLogs.map(log => (
          <div key={log.id} style={{ marginBottom: 6 }}>
            {log.type === 'error' ? (
              <Tag color="red">ERROR</Tag>
            ) : (
              <Tag color="blue">INFO</Tag>
            )}
            <span style={{ whiteSpace: 'pre-wrap' }}>
              [{log.time}] {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LogPage
