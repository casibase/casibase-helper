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

import React, { useEffect, useState } from "react";
import { Button, Card, Space, Spin, Tag, Typography, Steps, Progress, message } from "antd";
import PropTypes from "prop-types";
import { CheckCircleTwoTone, CloseCircleTwoTone, SyncOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
const { ipcRenderer } = window.require("electron");
import { getLatestVersion, getLocalVersion, update } from "../backends/version";

const { Title } = Typography;
const { Step } = Steps;

const HomePage = (
  {
    setIsUpdating,
    isUpdating,
    appConfig,
    stepsStatus,
    currentStep,
    onDeploy,
    onStop,
    onRetry,
    deploySteps,
    running,
    errorInfo,
  }) => {

  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [localVersion, setLocalVersion] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [checkingVersion, setCheckingVersion] = useState(true);

  useEffect(async () => {
    ipcRenderer.on("download-error", (event, errorMessage) => {
      setIsUpdating(false);
      message.error(errorMessage)
    });
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
    <div style={{ padding: 24, height: "100vh" }}>
      <Card style={{ marginBottom: 24 }}>
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>{t("version.casibaseVersion")}</Title>
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

      <Card style={{ marginBottom: 24 }}>
        <Steps direction="vertical" current={currentStep}>
          {deploySteps.map((title, idx) => (
            <Step
              key={idx}
              icon={
                stepsStatus[idx] === "process" ? <SyncOutlined spin /> :
                  stepsStatus[idx] === "finish" ? <CheckCircleTwoTone style={{ color: "green" }} /> :
                    stepsStatus[idx] === "error" ? <CloseCircleTwoTone style={{ color: "red" }} /> : null
              }
              title={
                <Space>
                  {t("steps." + title)}
                </Space>
              }
              description={
                stepsStatus[idx] === "error" ? (
                  <Typography.Text type="danger">{errorInfo[idx]}</Typography.Text>
                ) : null
              }
              status={stepsStatus[idx]}
            />
          ))}
        </Steps>
      </Card>

      <Card>
        {!running && stepsStatus.includes("error") ? (
          <Button type="primary" danger block onClick={onRetry}>{t("deploy.retry")}</Button>
        ) : !running && stepsStatus.every(s => s === "finish") ? (
          <Button type="default" danger block onClick={onStop}>{t("deploy.stop")}</Button>
        ) : !running ? (
          <Button type="primary" block onClick={onDeploy}>{t("deploy.deploy")}</Button>
        ) : (
          <Button type="dashed" danger block onClick={onStop}>{t("deploy.stop")}</Button>
        )}
      </Card>
    </div>
  );
};

HomePage.propTypes = {
  setIsUpdating: PropTypes.func,
  isUpdating: PropTypes.bool,
  appConfig: PropTypes.object,
  stepsStatus: PropTypes.array,
  currentStep: PropTypes.number,
  onDeploy: PropTypes.func,
  onStop: PropTypes.func,
  onRetry: PropTypes.func,
  deploySteps: PropTypes.array,
  running: PropTypes.bool,
  errorInfo: PropTypes.array,
};

HomePage.defaultProps = {
  setIsUpdating: () => { },
  isUpdating: false,
  appConfig: {},
  stepsStatus: ["wait", "wait", "wait"],
  currentStep: 0,
  onDeploy: () => { },
  onStop: () => { },
  onRetry: () => { },
  deploySteps: [],
  running: false,
  errorInfo: ["", "", ""],
};

export default HomePage;
