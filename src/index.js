import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import katex from "katex";
import "@google-cloud/promisify";

const Compute = require("@google-cloud/compute");

var isDrawing = false;
var x = 0;
var y = 0;
var stx = 0;
var sty = 0;

//document.onclick = reportClick;

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);
