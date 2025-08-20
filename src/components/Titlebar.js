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
