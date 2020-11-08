import React, { createRef } from "react";
import "./styles.css";
import "./dragbox.css";
import "katex/dist/katex.min.css";

import { InlineMath, BlockMath } from "react-katex";

import Latex from "react-latex-next";
import "bootstrap/dist/css/bootstrap.min.css";

import { Dropdown, Button, ButtonGroup } from "react-bootstrap";

const { Storage } = require("@google-cloud/storage");

const storage = new Storage();
const bucketName = "Name of a bucket, e.g. my-bucket";
const filename = "Local file to upload, e.g. ./local/path/to/file.txt";
async function uploadFile() {
  // Uploads a local file to the bucket
  await storage.bucket(bucketName).upload(filename, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: true,
    // By setting the option `destination`, you can change the name of the
    // object you are uploading to a bucket.
    metadata: {
      // Enable long-lived HTTP caching headers
      // Use only if the contents of the file will never change
      // (If the contents will change, use cacheControl: 'no-cache')
      cacheControl: "public, max-age=31536000"
    }
  });

  console.log(`${filename} uploaded to ${bucketName}.`);
}

var finishedcontent = "";
export default class App extends React.Component {
  constructor(props) {
    super();
    this.f = this.finished.bind(this);
    this.state = {
      dragboxtop: 0,
      dragboxleft: 0,
      isDrawing: false,
      dragboxheight: 0,
      dragboxwidth: 0,
      draggingleft: 0,
      draggingtop: 0,
      latexgroup: [
        {
          id: 0,
          top: 50,
          left: 50,
          text: "$\\int_x^\\infty x^2 dx$",
          type: "latex"
        },
        {
          id: 1,
          top: 100,
          left: 50,
          text: '<div style="color:red">Hello world</div>',
          type: "latex"
        }
      ],
      focusonlatexobj: false,
      monitoredcontrol: [
        "latextbox",
        "Fullscreenbutton",
        "latexmode",
        "drawingline",
        "triangle",
        "circle",
        "stopcapture",
        "functionalmenu"
      ],
      currentinput: -1,
      input: "",
      isClicking: true,
      isdragging: false,
      latexmode: true,
      disabled: false,
      linemode: 0
    };
    /*this.smth = this.smth.bind(this); */
    this.md = this.mousedown.bind(this);
    this.mu = this.mouseup.bind(this);
    this.mm = this.mousemove.bind(this);
    this.kp = this.keypress.bind(this);
    this.kd = this.keydown.bind(this);
    this.oc = this.onclick.bind(this);
    this.rl = this.renderlatex.bind(this);
    this.textboxcg = this.textboxchange.bind(this);
    this.fullscreen = this.handlefullscreen.bind(this);
    this.ulm = this.updatelatexmode.bind(this);
    this.dc = this.drawcircle.bind(this);
    this.dt = this.drawtraingle.bind(this);
    this.clm = this.changelinemode.bind(this);

    this.handleFilepreview = this.handleFilepreview.bind(this);
    /* this.setState */
  }
  finished(e) {
    console.log(this.state.currentinput);
    var i = this.findindex(this.state.currentinput);
    if (i < 0) return;
    var stateCopy = Object.assign({}, this.state);
    stateCopy.latexgroup[i].text = finishedcontent;
    this.setState(stateCopy);
    console.log(finishedcontent);
  }
  handleFilepreview(e) {
    let file_as_base64 = URL.createObjectURL(e.target.files[0]);
    let filex = e.target.files[0];
    filex.text().then((x) => {
      finishedcontent = x;
      document.getElementById("finished").click();
    });
  }
  keydown(e) {
    if (e.key === "Delete") {
      if (Array.isArray(this.state.currentinput) === false)
        this.deleteelement(this.state.currentinput);
      else {
        var tmp = [...this.state.currentinput];
        for (var i = 0; i < tmp.length; ++i) this.deleteelement(tmp[i]);
      }
    }
  }
  deleteelement(x) {
    if (x === -1) return;
    var idex = this.findindex(x);
    var stateCopy = Object.assign({}, this.state);
    stateCopy.latexgroup.splice(idex, 1);
    this.setState(stateCopy);
  }
  findindex(x) {
    for (var i = 0; i < this.state.latexgroup.length; ++i) {
      if (this.state.latexgroup[i].id === x) return i;
    }
  }
  keypress(e) {}
  updatelatexmode(e) {
    var xx = this.state.latexmode;
    if (xx === false) xx = true;
    else xx = false;
    this.setState({ latexmode: xx });
  }
  changelinemode(e) {
    this.setState({ linemode: 2 });
  }
  handlefullscreen(e) {
    var elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen();
    }
  }
  drawcircle(e) {
    var re = "";
    re += '<svg height="20" width="20">';
    re += '<circle cx="10" cy="10" r="10" fill="red" />';
    re += "</svg>";
    this.setinput(this.state.currentinput, re);
  }
  drawtraingle(e) {
    var re = "";
    re += '<svg height="40" width="40">';
    re +=
      ' <polygon points="25,0 10,32 40,32" style="fill:lime;stroke:purple;stroke-width:1" />';
    re += "</svg>";
    this.setinput(this.state.currentinput, re);
  }
  textboxchange(e) {
    this.setinput(this.state.currentinput, e.target.value);
  }
  clear() {
    var filterlatexgroup = this.state.latexgroup.filter(
      (latext) => latext.text !== "" || latext.id === this.state.currentinput
    );
    this.setState({ latexgroup: filterlatexgroup });
  }
  mousedown(e) {
    var x = e.offsetX;
    var y = e.offsetY;
    var ex = e.clientX;
    var ey = e.clientY;
    if (
      this.findintersectionwith("equation", this.state.latexgroup, ex, ey) !==
      -1
    ) {
      this.setState({
        isdragging: true,
        draggingtop: ey,
        draggingleft: ex
      });
      return;
    }
    this.setState({
      isDrawing: true,
      dragboxtop: ey,
      dragboxleft: ex
    });
  }
  findintersectionwith(name, arr, ex, ey) {
    for (var i = 0; i < arr.length; ++i) {
      var ele = document.getElementById(name + arr[i].id);
      var y = ele.offsetTop;
      var x = ele.offsetLeft;
      var dx = ele.offsetWidth;
      var dy = ele.offsetHeight;
      if (x <= ex && ex <= x + dx && y <= ey && ey <= y + dy) {
        return i;
      }
    }
    return -1;
  }
  findifwithin(x, y, topx, topy, bottomx, bottomy) {
    return topx <= x && x <= bottomx && topy <= y && y <= bottomy;
  }
  findifintersect(elementid, topx, topy, bottomx, bottomy) {
    var ele = document.getElementById(elementid);
    var yt = ele.offsetTop;
    var xt = ele.offsetLeft;
    var xb = xt + ele.offsetWidth;
    var yb = yt + ele.offsetHeight;
    var res = false;
    res = res || this.findifwithin(xt, yt, topx, topy, bottomx, bottomy);
    res = res || this.findifwithin(xt, yb, topx, topy, bottomx, bottomy);
    res = res || this.findifwithin(xb, yt, topx, topy, bottomx, bottomy);
    res = res || this.findifwithin(xb, yb, topx, topy, bottomx, bottomy);
    return res;
  }
  mouseup(e) {
    if (this.state.isDrawing === true) {
      this.setState({
        isDrawing: false,
        dragboxwidth: 0,
        dragboxheight: 0,
        currentlatexX: 0,
        currentlatexY: 0
      });
    }
    if (this.state.isdragging === true) {
      this.setState({ isdragging: false });
    }
  }
  dragging(id, x, y) {
    if (id !== -1) {
      var stateCopy = Object.assign({}, this.state);
      for (var i = 0; i < stateCopy.latexgroup.length; ++i) {
        if (stateCopy.latexgroup[i].id === id) {
          stateCopy.latexgroup[i].top += y;
          stateCopy.latexgroup[i].left += x;
        }
      }
      this.setState(stateCopy);
    }
    return "";
  }
  mousemove(e) {
    if (this.state.isdragging === true) {
      var x = e.offsetX - this.state.draggingleft;
      var y = e.offsetY - this.state.draggingtop;
      if (Math.abs(x) >= 100 || Math.abs(y) >= 100) {
        return;
      }
      this.setState({ isClicking: false });
      if (Array.isArray(this.state.currentinput) === false)
        this.dragging(this.state.currentinput, x, y);
      else {
        var tmp = [...this.state.currentinput];
        for (var i = 0; i < tmp.length; ++i) this.dragging(tmp[i], x, y);
      }
      this.setState({
        isDrawing: true,
        draggingtop: e.offsetY,
        draggingleft: e.offsetX
      });
      return;
    }
    if (this.state.isDrawing === true) {
      var x = e.offsetX - this.state.dragboxleft;
      var y = e.offsetY - this.state.dragboxtop;
      var topy = this.state.dragboxtop;
      var topx = this.state.dragboxleft;
      var bottomx = e.offsetX;
      var bottomy = e.offsetY;
      var cinput = [];

      for (var i = 0; i < this.state.latexgroup.length; ++i) {
        var nameofequation = "equation" + this.state.latexgroup[i].id;
        if (this.findifintersect(nameofequation, topx, topy, bottomx, bottomy))
          cinput.push(this.state.latexgroup[i].id);
      }

      this.setState({ isClicking: false });
      this.setState({
        currentinput: cinput,
        dragboxwidth: x,
        dragboxheight: y
      });
    }
  }
  buildline(topx, topy, bottomx, bottomy, stx, sty, edx, edy) {
    var width = bottomx - topx;
    var height = bottomy - topy;
    var re = "";
    re += '<span style="z-index: -1;">';
    re +=
      '<svg height="' +
      height.toString() +
      '" width="' +
      width.toString() +
      '">';
    var x1 = stx - topx;
    var x2 = edx - topx;
    var y1 = sty - topy;
    var y2 = edy - topy;
    re +=
      '<line x1="' +
      x1.toString() +
      '" y1="' +
      y1.toString() +
      '" x2="' +
      x2.toString() +
      '" y2="' +
      y2.toString() +
      '" style="stroke:rgb(0,0,0);stroke-width:2" />';

    re += "</svg>";
    re += "</span>";
    return re;
  }
  onclick(e) {
    if (this.state.disabled === true) {
      return;
    }
    if (this.state.isClicking === false) {
      this.setState({ isClicking: true, isDrawing: false });
      return;
    }

    var currentinput = -1;
    var ex = e.clientX;
    var ey = e.clientY;
    for (var i = 0; i < this.state.monitoredcontrol.length; ++i) {
      var ele = document.getElementById(this.state.monitoredcontrol[i]);
      if (ele == null) continue;
      var y = ele.offsetTop;
      var x = ele.offsetLeft;
      var dx = ele.offsetWidth;
      var dy = ele.offsetHeight;
      if (x <= ex && ex <= x + dx && y <= ey && ey <= y + dy) {
        return;
      }
    }
    if (this.state.linemode > 0) {
      if (this.state.linemode === 2) {
        this.setState({ linemode: 1, startingx: ex, startingy: ey });
      } else if (this.state.linemode === 1) {
        var tail = this.state.latexgroup.length - 1;
        var newid = 1;
        if (tail !== -1) newid = this.state.latexgroup[tail].id + 1;
        currentinput = newid;
        var newtop = ey;
        var newleft = ex;
        var stateCopy = Object.assign({}, this.state);
        stateCopy.latexgroup.push({
          id: newid,
          top: Math.min(this.state.startingy, ey),
          left: Math.min(this.state.startingx, ex),
          text: this.buildline(
            Math.min(this.state.startingx, ex),
            Math.min(this.state.startingy, ey),
            Math.max(this.state.startingx, ex),
            Math.max(this.state.startingy, ey),
            this.state.startingx,
            this.state.startingy,
            ex,
            ey
          ),
          type: "latex"
        });
        this.setState(stateCopy);

        this.setState({ linemode: 0 });
      }
      return;
    }

    for (var i = 0; i < this.state.latexgroup.length; ++i) {
      var nameofequation = "equation" + this.state.latexgroup[i].id;
      var x = this.state.latexgroup[i].left;
      var y = this.state.latexgroup[i].top;
      var dx = document.getElementById(nameofequation).offsetWidth;
      var dy = document.getElementById(nameofequation).offsetHeight;
      if (x <= ex && ex <= x + dx && y <= ey && ey <= y + dy) {
        currentinput = this.state.latexgroup[i].id;
        this.setState({ input: this.state.latexgroup[i].text });
      }
    }

    if (currentinput === -1) {
      var tail = this.state.latexgroup.length - 1;
      var newid = 1;
      if (tail !== -1) newid = this.state.latexgroup[tail].id + 1;
      currentinput = newid;
      var newtop = ey;
      var newleft = ex;
      var stateCopy = Object.assign({}, this.state);
      stateCopy.latexgroup.push({
        id: newid,
        top: newtop,
        left: newleft,
        text: "",
        type: "latex"
      });
      this.setState(stateCopy);
    }

    this.setState({ currentinput: currentinput });
  }
  componentDidMount() {}
  inside(x, arr) {
    for (var i = 0; i < arr.length; ++i) if (arr[i] === x) return true;
    return false;
  }
  renderlatex() {
    if (this.state.latexgroup.length === 0) return null;
    let result = [];
    this.refs = [];
    this.state.latexgroup.forEach((latext) => {
      let bw = "0px";
      if (latext.id === this.state.currentinput) bw = "1px";
      if (this.inside(latext.id, this.state.currentinput)) bw = "1px";
      if (latext.type === "latex") {
        result.push(
          <span
            id={"equation" + latext.id.toString()}
            className="equation"
            style={{
              top: latext.top,
              left: latext.left,
              borderWidth: bw
            }}
          >
            <Latex>{latext.text}</Latex>
          </span>
        );
      } else {
        result.push(
          <span
            id={"equation" + latext.id.toString()}
            className="equation"
            style={{
              top: latext.top,
              left: latext.left,
              borderWidth: bw,
              display: "contents"
            }}
          >
            <Latex>{latext.text}</Latex>
          </span>
        );
      }
    });

    return result;
  }

  findinput(x) {
    if (x !== -1) {
      for (var i = 0; i < this.state.latexgroup.length; ++i) {
        if (this.state.latexgroup[i].id === x)
          return this.state.latexgroup[i].text;
      }
    }
    return "";
  }

  setinput(x, s) {
    if (x !== -1) {
      var stateCopy = Object.assign({}, this.state);
      for (var i = 0; i < stateCopy.latexgroup.length; ++i) {
        if (stateCopy.latexgroup[i].id === x) stateCopy.latexgroup[i].text = s;
      }
      this.setState(stateCopy);
    }
  }

  uploadsvg(e) {
    var ele = document.getElementById("inputfile");
    //this.fileSelector.click();
    ele.click();
  }
  flipdisabled(e) {
    var x = this.state.disabled;
    if (x === true) x = false;
    else x = true;
    this.setState({ disabled: x });
  }
  render() {
    document.onmousedown = this.md;
    document.onmouseup = this.mu;
    document.onmousemove = this.mm;
    document.onkeypress = this.kp;
    document.onkeydown = this.kd;
    document.onclick = this.oc;
    return (
      <div className="App">
        <span
          id="dragbox"
          className="dragbox"
          style={{
            top: this.state.dragboxtop.toString() + "px",
            left: this.state.dragboxleft.toString() + "px",
            width: this.state.dragboxwidth.toString() + "px",
            height: this.state.dragboxheight.toString() + "px"
          }}
        ></span>
        <span id="keyboardinput" className="">
          <input
            id="inputfile"
            type="file"
            style={{ visibility: "hidden", width: "0px" }}
            onChange={this.handleFilepreview}
          />
          <button
            id="finished"
            onClick={this.f}
            style={{ visibility: "hidden", width: "0px" }}
          ></button>
          <input
            id="latextbox"
            type="text"
            value={this.findinput(this.state.currentinput)}
            onChange={this.textboxcg}
          />

          <button id="circle" onClick={this.dc}>
            Circle
          </button>

          <button id="triangle" onClick={this.dt}>
            Triangle
          </button>
          <button id="drawingline" onClick={this.clm}>
            Line: {this.state.linemode > 0 ? "yes" : "no"}
          </button>
          <button id="stopcapture" onClick={this.flipdisabled.bind(this)}>
            {this.state.disabled === false ? "Stop" : "Resume"} Capture
          </button>
          <Dropdown id="functionalmenu" as={ButtonGroup}>
            <Button variant="success" onClick={this.flipdisabled.bind(this)}>
              More
            </Button>

            <Dropdown.Toggle
              split
              variant="success"
              id="dropdown-split-basic"
            />

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => this.ulm()}>
                Latex mode : {this.state.latexmode ? "yes" : "no"}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => this.fullscreen()}>
                Full Screen
              </Dropdown.Item>
              <Dropdown.Item onClick={() => this.uploadsvg()}>
                Upload SVG
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </span>
        {this.renderlatex()}
      </div>
    );
  }
}
