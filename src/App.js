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

import React, {useState} from "react";
import {ConfigProvider, Layout} from "antd";
import {HashRouter, Route, Switch} from "react-router-dom";
import "./i18n";
import "./assets/App.css";
import Sidebar from "./components/Sidebar";
import * as Deploy from "./backends/Deploy";
import Titlebar from "./components/Titlebar";
import HomePage from "./components/HomePage";
import SettingPage from "./components/SettingPage";
import ConfigPage from "./components/ConfigPage";
import LogPage from "./components/LogPage";
import {readAppConf} from "./backends/appConf";
const fs = require("fs-extra");
const {ipcRenderer, app} = require("electron");

const USERDATADIR = await ipcRenderer.invoke("get-app-path");
const {Content, Sider} = Layout;

function App() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [appConfig, setAppConfig] = useState(() => readAppConf());
  const deploySteps = ["srcCheck", "confCheck", "deployApp"];
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsStatus, setStepsStatus] = useState(["wait", "wait", "wait"]);
  const [running, setRunning] = useState(false);
  const [errorInfo, setErrorInfo] = useState(["", "", ""]);
  const [backend, setBackend] = useState(null);
  const [frontend, setFrontend] = useState(null);

  fs.ensureDir(USERDATADIR);

  const runStep = async(index) => {
    setStepsStatus(prev => {
      const newStatus = [...prev];
      newStatus[index] = "process";
      return newStatus;
    });
    setErrorInfo(prev => {
      const newErrors = [...prev];
      newErrors[index] = "";
      return newErrors;
    });

    const processureName = deploySteps[index];

    try {
      let processureResult = false;

      switch (processureName) {
      case "srcCheck":
        processureResult = await Deploy.srcCheck();
        break;
      case "confCheck":
        processureResult = await Deploy.confCheck();
        break;
      case "deployApp":
        processureResult = await Deploy.deployApp();
        break;
      default: ;
      }

      if (processureResult) {
        setStepsStatus(prev => {
          const newStatus = [...prev];
          newStatus[index] = "finish";
          return newStatus;
        });

        if (index < deploySteps.length - 1) {
          setCurrentStep(index + 1);
          runStep(index + 1);
        } else {
          // final step, always be deploy app
          setBackend(processureResult.backend);
          setFrontend(processureResult.frontend);
          setRunning(false);
        }
      }
    } catch (err) {
      console.error(err);
      setStepsStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = "error";
        return newStatus;
      });
      setErrorInfo(prev => {
        const newErrors = [...prev];
        newErrors[index] = err.message;
        return newErrors;
      });
      setRunning(false);
    }
  };

  const stop = () => {
    backend?.kill();
    frontend?.close();
    setBackend(null);
    setFrontend(null);
  };

  const handleDeploy = () => {
    setRunning(true);
    setStepsStatus(["wait", "wait", "wait"]);
    setCurrentStep(0);
    runStep(0);
  };

  const handleStop = () => {
    setStepsStatus(["wait", "wait", "wait"]);
    setCurrentStep(0);
    stop();
    setRunning(false);
  };

  const handleRetry = () => {
    setRunning(true);
    stop();
    runStep(currentStep);
  };

  return (
    <ConfigProvider theme={"default"}>
      <HashRouter>
        <Switch>
          <Route path="/logs">
            <LogPage />
          </Route>
          <Route>
            <Layout>
              <Titlebar />
              <Layout>
                <Sider collapsible>
                  <Sidebar />
                </Sider>
                <Content>
                  <Switch>
                    <Route exact path="/">
                      <HomePage
                        setIsUpdating={setIsUpdating}
                        isUpdating={isUpdating}
                        appConfig={appConfig}
                        stepsStatus={stepsStatus}
                        currentStep={currentStep}
                        onDeploy={handleDeploy}
                        onStop={handleStop}
                        onRetry={handleRetry}
                        deploySteps={deploySteps}
                        running={running}
                        errorInfo={errorInfo}
                      />
                    </Route>
                    <Route path="/setting">
                      <SettingPage
                        setAppConfig={setAppConfig}
                        appConfig={appConfig}
                      />
                    </Route>
                    <Route path="/config">
                      <ConfigPage />
                    </Route>
                  </Switch>
                </Content>
              </Layout>
            </Layout>
          </Route>
        </Switch>
      </HashRouter>
    </ConfigProvider>
  );
}

export default App;
