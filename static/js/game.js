function getOffset( element ) {
    let rect = element.getBoundingClientRect();
    return {
        left: rect.left + window.pageXOffset,
        top: rect.top + window.pageYOffset,
        width: rect.width || element.offsetWidth,
        height: rect.height || element.offsetHeight
    };
}

function getClosestConnectionPoints( element1, element2) {
    let offset1 = getOffset(element1);
    let offset2 = getOffset(element2);

    let points1 = getConnectionPoints(offset1);
    let points2 = getConnectionPoints(offset2);

    let minDistSide = getDistance(points1.sidePoints[0], points2.sidePoints[0]);
    let sidePoint1 = points1.sidePoints[0];
    let sidePoint2 = points2.sidePoints[0];
    for (point1 of points1.sidePoints) {
        for (point2 of points2.sidePoints){
            let distance = getDistance(point1, point2);
            if (distance < minDistSide) {
                minDistSide = distance;
                sidePoint1 = point1;
                sidePoint2 = point2;
            }
        }
    }

    let minDistCorner = getDistance(points1.cornerPoints[0], points2.cornerPoints[0]);
    let cornerPoint1 = points1.cornerPoints[0];
    let cornerPoint2 = points2.cornerPoints[0];
    for (point1 of points1.cornerPoints) {
        for (point2 of points2.cornerPoints){
            let distance = getDistance(point1, point2);
            if (distance < minDistCorner) {
                minDistCorner = distance;
                cornerPoint1 = point1;
                cornerPoint2 = point2;
            }
        }
    }
    if (minDistCorner*1.1 > minDistSide) {
        return {point1: sidePoint1, point2: sidePoint2}
    } else {
        return {point1: cornerPoint1, point2: cornerPoint2}
    }
}

function getConnectionPoints( offset ) {
    return {
        cornerPoints : [
        {x: offset.left, y: offset.top},
        {x: offset.left, y: offset.top+offset.height},
        {x: offset.left+offset.width, y: offset.top},
        {x: offset.left+offset.width, y: offset.top+offset.height}
        ],
        sidePoints : [
        {x: offset.left+offset.width/2, y: offset.top},
        {x: offset.left+offset.width/2, y: offset.top+offset.height},
        {x: offset.left, y: offset.top+offset.height/2},
        {x: offset.left+offset.width, y: offset.top+offset.height/2}
        ]
    }
}

function getDistance( point1, point2 ) {
    return Math.sqrt(((point2.x-point1.x) * (point2.x-point1.x)) + ((point2.y-point1.y) * (point2.y-point1.y)))
}

function connectPoints( point1, point2, color, thickness) {
    // distance
    let length = getDistance(point1, point2);
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

function createNode( posX, posY, width, height, parent, id) {
    let node = document.createElement('div');
    node.classList.add('game-node');
    node.id = id;
    node.style = `left: ${posX-width/2}px; top: ${posY-height}px; height:${height}px; width:${width}px;`;
    node.innerHTML = `<div class="node-drop-zone"><p>Drop Zone</p></div>`;
    parent.appendChild(node);
    nodesDragula.containers.push(node);
}

function makeNodeConnection( node1, node2 ) {
    let connectionPoints = getClosestConnectionPoints( node1, node2);
    connectPoints( connectionPoints.point1, connectionPoints.point2, "red", 2)
}

function createShip( nodeId, shipConfiguration, shipId) {
    let ship = document.createElement('div');
    ship.classList.add('game-ship');
    ship.id = shipId;
    ship.style = `border: red 1px solid`;
    ship.innerHTML = `<img src="${emblemsFolder + shipConfiguration.image}" />${shipConfiguration.name}`;
    let node = document.getElementById(nodeId);
    let dropZone = Array.from(node.childNodes).filter(node => node.classList.contains('node-drop-zone'))[0];
    dropZone.appendChild(ship);
    removeDropZoneText(dropZone);
}

function nodesDragulaDrop(el, target, source, sibling) {
    addDropZoneText(source);
    removeDropZoneText(target);
}

function addDropZoneText(dropZone) {
    if (Array.from(dropZone.childNodes).length == 0) {
        dropZone.innerHTML += `<p>Drop Zone</p>`;
    }
}

function removeDropZoneText(dropZone) {
    let dropZoneTextList = Array.from(dropZone.childNodes).filter(ship => ship.tagName.toLowerCase() == 'p');
    if (dropZoneTextList.length > 0){
        dropZoneTextList[0].remove();
    }
}


const emblemsFolder = document.getElementById('flask-info').dataset.emblemsFolder;
let nodesDragula = dragula(
    {
        isContainer: el => el.classList.contains('node-drop-zone'),
        moves: (el, source, handle, sibling) => el.tagName.toLowerCase() != 'p'
    }
    );
nodesDragula.on('drop', nodesDragulaDrop);
let gameBoard = document.getElementById('game-board');

// Test game setup

let node1 = createNode(600,400,200,200, gameBoard ,'game-node-1');
let node2 = createNode(500,900,200,200, gameBoard ,'game-node-2');
let node3 = createNode(0,1000,200,200, gameBoard ,'game-node-3');
let node4 = createNode(900,800,200,200, gameBoard ,'game-node-4');

createShip( 'game-node-1', {image: 'HULL_Bomber.png', name: 'bomber-001'}, 'ship-1');
createShip( 'game-node-1', {image: 'HULL_Bomber.png', name: 'bomber-002'}, 'ship-2');
createShip( 'game-node-1', {image: 'HULL_Bomber.png', name: 'bomber-003'}, 'ship-3');
createShip( 'game-node-1', {image: 'HULL_Bomber.png', name: 'bomber-004'}, 'ship-4');

makeNodeConnection(document.getElementById('game-node-1'),document.getElementById('game-node-2'));
makeNodeConnection(document.getElementById('game-node-1'),document.getElementById('game-node-3'));
makeNodeConnection(document.getElementById('game-node-1'),document.getElementById('game-node-4'));
makeNodeConnection(document.getElementById('game-node-2'),document.getElementById('game-node-4'));