function mousedown(e) {
  x = e.offsetX;
  y = e.offsetY;
  stx = x;
  sty = y;
  isDrawing = true;
  document.getElementById("dragbox").style.top = sty.toString() + "px";
  document.getElementById("dragbox").style.left = stx.toString() + "px";
}

function mouseup(e) {
  if (isDrawing === true) {
    x = e.offsetX;
    y = e.offsetY;
    document.getElementById("dragbox").style.height = "0px";
    document.getElementById("dragbox").style.width = "0px";

    x = 0;
    y = 0;
    isDrawing = false;
  }
}

function mousemove(e) {
  if (isDrawing === true) {
    x = e.offsetX - stx;
    y = e.offsetY - sty;
    document.getElementById("dragbox").style.height = y.toString() + "px";
    document.getElementById("dragbox").style.width = x.toString() + "px";
  }
}

keydown(e) {
  if (e.key === "Backspace")
    this.setState({ input: this.state.input.slice(0, -1) });
  if (this.state.currentinput !== -1) {
    var stateCopy = Object.assign({}, this.state);
    for (var i = 0; i < stateCopy.latexgroup.length; ++i) {
      if (stateCopy.latexgroup[i].id === this.state.currentinput)
        stateCopy.latexgroup[i].text = this.state.input;
    }

    this.setState(stateCopy);
  }
}
keypress(e) {
  var updatedstr = this.state.input + e.key;
  this.setState({ input: updatedstr });
  if (this.state.currentinput !== -1) {
    var stateCopy = Object.assign({}, this.state);
    for (var i = 0; i < stateCopy.latexgroup.length; ++i) {
      if (stateCopy.latexgroup[i].id === this.state.currentinput)
        stateCopy.latexgroup[i].text = updatedstr;
    }
    this.setState(stateCopy);
  }
}