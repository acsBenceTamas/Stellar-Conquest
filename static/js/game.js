function getOffset( element ) {
    let rect = element.getBoundingClientRect();
    return {
        left: rect.left + window.pageXOffset,
        top: rect.top + window.pageYOffset,
        width: rect.width || element.offsetWidth,
        height: rect.height || element.offsetHeight
    };
}

function connectPoints(point1, point2, color, thickness) {
    // distance
    let length = Math.sqrt(((point2.x-point1.x) * (point2.x-point1.x)) + ((point2.y-point1.y) * (point2.y-point1.y)));
    // center
    let cx = ((point1.x + point2.x) / 2) - (length / 2);
    let cy = ((point1.y + point2.y) / 2) - (thickness / 2);
    // angle
    let angle = Math.atan2((point1.y-point2.y),(point1.x-point2.x))*(180/Math.PI);
    // make hr
    let htmlLine =
        `<div class='connection-line' style='
        padding:0;
        margin:0; height:${thickness}px;
        background-color:${color};
        line-height:1px;
        position:absolute;
        left:${cx}px;
        top:${cy}px;
        width: ${length}px;
        -moz-transform:rotate(${angle}deg);
        -webkit-transform:rotate(${angle}deg);
        -o-transform:rotate(${angle}deg);
        -ms-transform:rotate(${angle}deg);
        transform:rotate(${angle}deg);
        ' />`;
    document.body.innerHTML += htmlLine;
}

function createNode(posX, posY, width, height, parent, id, dragula=null) {
    let node = document.createElement('div');
    node.classList.add('game-node');
    node.id = id;
    node.style = `left: ${posX-width/2}px; top: ${posY-height}px; height:${height}px; width:${width}px;`;
    console.log(node.tag);
    parent.appendChild(node);
    if (dragula) {
        dragula.containers.push(node)
    }
}

let nodesDragula = dragula();
let gameBoard = document.getElementById('game-board');
createNode(400,400,300,300, gameBoard ,'game-node-1', nodesDragula);
createNode(400,1200,300,300, gameBoard ,'game-node-2', nodesDragula);

// Test game setup

