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

import React from "react";
import {Layout} from "antd";
const {Header} = Layout;
import {CloseOutlined, MinusOutlined} from "@ant-design/icons";
const {ipcRenderer} = require("electron");
import "../assets/TitleBar.css";

const TitleBar = () => {
  const minimizeWindow = () => {
    ipcRenderer.send("window-minimize");
  };
  const closeWindow = () => {
    ipcRenderer.send("window-close");
  };

  return (
    <Header className="titlebar">
      <div className="title">
        <img
          src="https://cdn.casibase.org/img/casibase.png"
          alt="Casibase"
          className="logo"
        />
        <span className="titleText">Casibase Helper</span>
      </div>
      <div className="window-controls">
        <div
          className="control-btn"
          onClick={minimizeWindow}
          role="button"
          tabIndex={0}
        >
          <MinusOutlined />
        </div>
        <div
          className="control-btn close-btn"
          onClick={closeWindow}
          role="button"
          tabIndex={0}
        >
          <CloseOutlined />
        </div>
      </div>
    </Header>
  );
};

export default TitleBar;
