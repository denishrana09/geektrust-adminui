import React from "react";
import { Row } from "antd";
import "antd/dist/antd.css";
import "./App.css";
import AdminUI from "./adminui/index";

function App() {
  return (
    <div className="admin-wrp">
      <Row justify="center" align="middle">
        <AdminUI />
      </Row>
    </div>
  );
}

export default App;
