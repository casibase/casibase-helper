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
import {Menu} from "antd";
import {HomeOutlined, SettingOutlined} from "@ant-design/icons";
import {Link, useLocation} from "react-router-dom";
import {useTranslation} from "react-i18next";

const Sidebar = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const selectedKey = location.pathname === "/index.html" ? "/" : location.pathname;

  const items = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link to="/">{t("sidebar.Home")}</Link>,
    },
    {
      key: "/setting",
      icon: <SettingOutlined />,
      label: <Link to="/setting">{t("sidebar.Setting")}</Link>,
    },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items}
      style={{height: "100vh", borderRight: 0}}
    />
  );
};

export default Sidebar;
