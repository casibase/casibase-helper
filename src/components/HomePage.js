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

import React, {useEffect, useState} from "react";
import {Button, Card, Space, Spin, Tag, Typography} from "antd";
import {Progress} from "antd";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";
const {ipcRenderer} = window.require("electron");
import {getLatestVersion, getLocalVersion, update} from "../backends/version";

const {Title} = Typography;

const HomePage = (
  {
    setIsUpdating,
    isUpdating,
    appConfig,
  }) => {

  const {t} = useTranslation();
  const [progress, setProgress] = useState(0);
  const [localVersion, setLocalVersion] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [checkingVersion, setCheckingVersion] = useState(true);

  useEffect(async() => {
    ipcRenderer.on("download-progress", (_, percent) => {
      setProgress(percent);
    });
    await checkUpdate();
    return () => {
      ipcRenderer.removeAllListeners("download-progress");
    };
  }, []);

  async function checkUpdate() {
    setCheckingVersion(true);
    const localVersion = getLocalVersion();
    setLocalVersion(localVersion);
    const latestVersion = await getLatestVersion();
    setLatestVersion(latestVersion);
    setCheckingVersion(false);
  }

  async function handleUpdate() {
    setIsUpdating(true);
    try {
      const localVersion = await update(appConfig);
      setLocalVersion(localVersion);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div style={{padding: 24, height: "100vh"}}>
      <Card style={{marginBottom: 24}}>
        <Space align="center">
          <Title level={4} style={{margin: 0}}>{t("version.casibaseVersion")}</Title>
          {checkingVersion ? (
            <Spin size="small" />
          ) : localVersion ? (
            <>
              <Tag color="blue">{t("version.currentVersion")}:{localVersion}</Tag>
              {latestVersion && latestVersion !== localVersion && (
                <>
                  <Tag color="orange">{t("version.latestVersion")}:{latestVersion}</Tag>
                  <Button size="small" type="primary" onClick={handleUpdate}>
                    {t("version.update")}
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Tag color="red">{t("version.notDownloaded")}</Tag>
              {!isUpdating && (
                <Button size="small" type="primary" onClick={handleUpdate}>
                  {t("version.download")}
                </Button>
              )}
            </>
          )}
        </Space>
        {isUpdating && (
          <Progress percent={progress} status={"active"} />
        )}
      </Card>
    </div>
  );
};

HomePage.propTypes = {
  setIsUpdating: PropTypes.func,
  isUpdating: PropTypes.bool,
  appConfig: PropTypes.object,
};

HomePage.defaultProps = {
  setIsUpdating: () => { },
  isUpdating: false,
  appConfig: {},
};

export default HomePage;
