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
import {Route, BrowserRouter as Router, Switch} from "react-router-dom";
import "./i18n";
import "./assets/App.css";
import Sidebar from "./components/Sidebar";
import Titlebar from "./components/Titlebar";
import HomePage from "./components/HomePage";

const {Content, Sider} = Layout;

function App() {
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <ConfigProvider theme={"default"}>
      <Router>
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
                  />
                </Route>
              </Switch>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
