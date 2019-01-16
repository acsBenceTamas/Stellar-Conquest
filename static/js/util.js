function getOffset( element ) {
    let rect = element.getBoundingClientRect();
    return {
        left: rect.left + window.pageXOffset,
        top: rect.top + window.pageYOffset,
        width: rect.width || element.offsetWidth,
        height: rect.height || element.offsetHeight
    };
}

function connectDivs(div1, div2, color, thickness) { // draw a line connecting elements
    let off1 = getOffset(div1);
    let off2 = getOffset(div2);
    // bottom right
    let x1 = off1.left + off1.width;
    let y1 = off1.top + off1.height;
    // top right
    let x2 = off2.left + off2.width;
    let y2 = off2.top;
    // distance
    let length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
    // center
    let cx = ((x1 + x2) / 2) - (length / 2);
    let cy = ((y1 + y2) / 2) - (thickness / 2);
    // angle
    let angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);
    // make hr
    let htmlLine =
        "<div style='" +
        "padding:0px;" +
        "margin:0px; height:" + thickness + "px; " +
        "background-color:" + color + ";" +
        "line-height:1px; " +
        "position:absolute; " +
        "left:" + cx + "px; " +
        "top:" + cy + "px; " +
        "width:" + length + "px; " +
        "-moz-transform:rotate(" + angle + "deg); " +
        "-webkit-transform:rotate(" + angle + "deg); " +
        "-o-transform:rotate(" + angle + "deg); " +
        "-ms-transform:rotate(" + angle + "deg); " +
        "transform:rotate(" + angle + "deg);" +
        "' />";
    //
    // alert(htmlLine);
    document.body.innerHTML += htmlLine;
}

function connectPoints(point1, point2, color, thickness) {
    let x1 = point1.x;
    let y1 = point1.y;
    let x2 = point2.x;
    let y2 = point2.y;
    // distance
    let length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
    // center
    let cx = ((x1 + x2) / 2) - (length / 2);
    let cy = ((y1 + y2) / 2) - (thickness / 2);
    // angle
    let angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);
    // make hr
    let htmlLine =
        "<div style='" +
        "padding:0px;" +
        "margin:0px; height:" + thickness + "px; " +
        "background-color:" + color + ";" +
        "line-height:1px; " +
        "position:absolute; " +
        "left:" + cx + "px; " +
        "top:" + cy + "px; " +
        "width:" + length + "px; " +
        "-moz-transform:rotate(" + angle + "deg); " +
        "-webkit-transform:rotate(" + angle + "deg); " +
        "-o-transform:rotate(" + angle + "deg); " +
        "-ms-transform:rotate(" + angle + "deg); " +
        "transform:rotate(" + angle + "deg);" +
        "' />";
    //
    // alert(htmlLine);
    document.body.innerHTML += htmlLine;
}