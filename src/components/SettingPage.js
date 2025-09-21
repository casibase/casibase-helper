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
import PropTypes from "prop-types";
import {Button, Card, Form, Input, Select, Switch} from "antd";
import {persistAppConf} from "../backends/appConf";
import {useTranslation} from "react-i18next";

const SettingPage = ({
  setAppConfig,
  appConfig,
}) => {
  const {t} = useTranslation();

  const [proxyForm] = Form.useForm();
  const [proxyEnabled, setProxyEnabled] = useState(appConfig?.proxyEnabled || false);

  useEffect(() => {
    if (appConfig) {
      proxyForm.setFieldsValue({
        proxyType: appConfig.proxyType || "http",
        proxyUrl: appConfig.proxyUrl || "",
      });
    }
  }, [appConfig, proxyForm]);

  const save = async() => {
    let values = {};
    values = proxyForm.getFieldsValue();
    values = modifyValues(values);
    const configToSave = {...values, proxyEnabled: proxyEnabled};
    persistAppConf(configToSave);
    setAppConfig(configToSave);
  };

  const modifyValues = (values) => {
    if (proxyEnabled) {
      values.proxyUrl = values.proxyUrl.trim();
      if (values.proxyType === "http" && !values.proxyUrl.startsWith("http://")) {
        values.proxyUrl = "http://" + values.proxyUrl;
      } else if (proxyType === "https" && !values.proxyUrl.startsWith("https://")) {
        values.proxyUrl = "https://" + values.proxyUrl;
      } else if (proxyType === "socks5" && !values.proxyUrl.startsWith("socks5://")) {
        values.proxyUrl = "socks5://" + values.proxyUrl;
      }
    }
    return values;
  };

  return (
    <div>
      <Card
        title={
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <span>{t("appConfig.enableProxy")}</span>
            <Switch checked={proxyEnabled} onChange={setProxyEnabled} />
          </div>
        }
      >
        {proxyEnabled && (
          <Form
            form={proxyForm}
            layout="vertical"
            initialValues={{proxyType: appConfig.proxyType || "http", proxyUrl: appConfig.proxyUrl || "http://"}}
          >
            <Form.Item
              label={t("appConfig.proxyType")}
              name="proxyType"
              rules={[{required: true}]}
            >
              <Select>
                <Select.Option value="http">HTTP</Select.Option>
                <Select.Option value="https">HTTPS</Select.Option>
                <Select.Option value="socks5">SOCKS5</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={t("appConfig.proxyAddr")}
              name="proxyUrl"
              rules={[{required: true}]}
            >
              <Input />
            </Form.Item>
          </Form>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Button
            type="primary"
            onClick={save}
          >
            {t("appConfig.save")}
          </Button>
        </div>
      </Card>
    </div>

  );
};

SettingPage.propTypes = {
  setAppConfig: PropTypes.func,
  appConfig: PropTypes.object,
};

SettingPage.defaultProps = {
  setAppConfig: () => { },
  appConfig: {},
};

export default SettingPage;
