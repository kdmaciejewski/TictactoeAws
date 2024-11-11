import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Buffer } from 'buffer';
window.Buffer = Buffer;
import process from 'process';
window.process = process;


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);


