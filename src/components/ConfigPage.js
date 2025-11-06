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

import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {Button, Card, Input, Segmented, Space, Table, Typography, message} from "antd";
import {ReloadOutlined, SaveOutlined} from "@ant-design/icons";
import {readAppConf, saveAppConf} from "../backends/Conf";

const ConfigPage = () => {
  const {t} = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [config, setConfig] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbType, setDbType] = useState("sqlite");
  const [filteredConfig, setFilteredConfig] = useState([]);
  const hiddenKeys = ["driverName", "dataSourceName", "dbName"];
  const priorityKeys = ["driverName", "dataSourceName", "dbName"];

  const fetchConfig = async() => {
    setLoading(true);
    try {
      const conf = await readAppConf();
      setConfig(conf);
      setDbType(conf.driverName === "sqlite" ? "sqlite" : "custom");
      const filtered = getFilteredConfig(conf.driverName, conf);
      setFilteredConfig(filtered);
    } catch (err) {
      messageApi.error(`${t("config.Failed To Load Config")}:${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const getFilteredConfig = (DbType, conf) => {
    if (!conf) {
      conf = config;
    }
    let filtered = [];
    if (DbType === "sqlite") {
      filtered = Object.entries(conf)
        .filter(([k]) => !hiddenKeys.includes(k))
        .map(([key, value]) => ({key, value}));
    } else {
      filtered = Object.entries(conf)
        .map(([key, value]) => ({key, value}))
        // sort priorityKeys
        .sort((a, b) => {
          const ai = priorityKeys.indexOf(a.key);
          const bi = priorityKeys.indexOf(b.key);
          if (ai === -1 && bi === -1) {return 0;}
          if (ai === -1) {return 1;}
          if (bi === -1) {return -1;}
          return ai - bi;
        });
    }
    return filtered;
  };

  const handleSave = async() => {
    setLoading(true);
    try {
      if (dbType === "sqlite") {
        changeConfigValue("driverName", "sqlite");
        changeConfigValue("dataSourceName", "./database.sqlite");
        changeConfigValue("dbName", "casibase");
      }
      await saveAppConf(filteredConfig);
      messageApi.success(t("config.Config Saved"));
    } catch (err) {
      messageApi.error(`${t("config.Failed To Save")}:${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const changeConfigValue = (targetKey, newValue) => {
    const targetItem = filteredConfig.find(item => item.key === targetKey);
    if (targetItem) {
      targetItem.value = newValue;
    }
  };

  const changeDbType = (newDbType) => {
    setDbType(newDbType);
    const filtered = getFilteredConfig(newDbType);
    setFilteredConfig(filtered);
  };

  const getTableData = () => {
    const data = [
      {
        key: "dbType",
        value: dbType,
      },
    ];

    data.push(...filteredConfig);
    return data;
  };

  const columns = [
    {
      dataIndex: "key",
      key: "key",
      width: "40%",
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      dataIndex: "value",
      key: "value",
      width: "60%",
      render: (text, record, index) => {
        if (record.key === "dbType") {
          return (
            <Segmented
              options={[
                {label: t("config.Custom"), value: "custom"},
                {label: "SQLite", value: "sqlite"},
              ]}
              value={dbType}
              onChange={changeDbType}
            />
          );
        } else {
          return (
            <Input
              value={text}
              onChange={(e) => {
                const newData = [...filteredConfig];
                newData[index - 1].value = e.target.value;
                setFilteredConfig(newData);
              }}
            />
          );
        }
      },
    },
  ];

  const dataSource = getTableData().map((item, i) => ({
    ...item,
    id: item.key + "-" + i,
  }));

  return (
    <div>
      {contextHolder}
      <Card
        style={{height: "100vh", padding: 0, boxSizing: "border-box", margin: 0}}
        styles={{body: {display: "flex", flexDirection: "column", height: "100%"}}}
        title={t("config.Casibase Config")}
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchConfig}
              loading={loading}
            >
              {t("config.Reload config")}
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              {t("config.Save")}
            </Button>
          </Space>
        }
      >
        <div
          style={{flex: 1, overflow: "auto", bottom: "30px", padding: 0, marginBottom: 36}}
          styles={{body: {dpadding: 0, height: "100%"}}}
        >
          <Table
            dataSource={dataSource}
            columns={columns}
            showHeader={false}
            pagination={false}
            rowKey="id"
          />
        </div>
      </Card>
    </div>
  );
};

export default ConfigPage;
