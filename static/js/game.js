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

function connectPoints( point1, point2, thickness) {
    // distance
    let length = getDistance(point1, point2);
    // center
    let cx = ((point1.x + point2.x) / 2) - (length / 2);
    let cy = ((point1.y + point2.y) / 2) - (thickness / 2);
    // angle
    let angle = Math.atan2((point1.y-point2.y),(point1.x-point2.x))*(180/Math.PI);
    // make hr
    let connectionLine = document.createElement('div');
    connectionLine.classList.add('connection-line', 'selectable');
    connectionLine.style=
        `padding:0;
        margin:0; height:${thickness}px;
        line-height:1px;
        position:absolute;
        left:${cx}px;
        top:${cy}px;
        width: ${length}px;
        -moz-transform:rotate(${angle}deg);
        -webkit-transform:rotate(${angle}deg);
        -o-transform:rotate(${angle}deg);
        -ms-transform:rotate(${angle}deg);
        transform:rotate(${angle}deg);`;
    document.getElementById('connection-line-container').appendChild(connectionLine);
    return connectionLine
}

function createNode( posX, posY, width, height, parent, id) {
    let node = document.createElement('div');
    node.classList.add('game-node', 'selectable');
    node.id = id;
    node.style = `left: ${posX-width/2}px; top: ${posY-height}px; height:${height}px; width:${width}px;`;
    node.dataset.connections = JSON.stringify([]);
    parent.appendChild(node);
    return node
}

function makeNodeConnection( node1, node2) {
    let connectionPoints = getClosestConnectionPoints( node1, node2);
    let connectionLine = connectPoints( connectionPoints.point1, connectionPoints.point2, 2);
    let connections1 = JSON.parse(node1.dataset.connections);
    let connections2 = JSON.parse(node2.dataset.connections);
    connections1.push(node2.id);
    connections2.push(node1.id);
    node1.dataset.connections = JSON.stringify(connections1);
    node2.dataset.connections = JSON.stringify(connections2);
    connectionLine.dataset.nodes = JSON.stringify([node1.id, node2.id]);
    return connectionLine
}

function createShip( nodeId, shipConfiguration, shipId) {
    let ship = document.createElement('img');
    ship.classList.add('game-ship', 'selectable');
    ship.id = shipId;
    ship.src = emblemsFolder + shipConfiguration.image;
    ship.dataset.name = shipConfiguration.name;
    ship.dataset.owner = shipConfiguration.owner;
    document.getElementById(nodeId).appendChild(ship);
    return ship
}

function getAllConnectionsForNode( node ) {
    return Array.from(document.getElementsByClassName('connection-line')).filter(el => JSON.parse(el.dataset.nodes).includes(node.id));
}

function clickedGameBoardElement( event ) {
    let target = event.target;
    for (let selectable of document.getElementsByClassName('selectable')) {
        selectable.classList.remove('selected');
    }
    if ( isGameNode(target) ) {
        target.classList.add('selected');
        for (let connectionLine of getAllConnectionsForNode(event.target)){
            connectionLine.classList.add('selected');
        }
    }
    if ( isFriendlyShip(target) ) {
        target.classList.add('selected');
    }
    if ( isEnemyShip(target) ) {
        target.classList.add('selected', 'enemy');
    }
}

function startOfTurnCleanUp() {
    for (let ship of document.getElementsByClassName('game-ship')) {
        if (isEnemyShip(ship)) {
            ship.classList.add('enemy');
        } else {
            ship.classList.remove('enemy');
        }
    }
}

function isGameNode( element ) {
    return element.classList.contains('game-node');
}

function isFriendlyShip( element ) {
    return element.classList.contains('game-ship') && element.dataset.owner == currentPlayer;
}

function isEnemyShip( element ) {
    return element.classList.contains('game-ship') && element.dataset.owner != currentPlayer;
}


const emblemsFolder = document.getElementById('flask-info').dataset.emblemsFolder;
let gameBoard = document.getElementById('game-board');
gameBoard.addEventListener('click', clickedGameBoardElement);
let currentPlayer = 0;

// Test game setup

let node1 = createNode(600,400,200,200, gameBoard ,'game-node-1');
let node2 = createNode(500,900,200,200, gameBoard ,'game-node-2');
let node3 = createNode(300,500,200,200, gameBoard ,'game-node-3');
let node4 = createNode(900,800,200,200, gameBoard ,'game-node-4');

createShip( 'game-node-1', {image: 'HULL_Bomber.png', name: 'bomber-001', owner: 0}, 'ship-1');
createShip( 'game-node-1', {image: 'HULL_Bomber.png', name: 'bomber-002', owner: 0}, 'ship-2');
createShip( 'game-node-1', {image: 'HULL_Bomber.png', name: 'bomber-003', owner: 0}, 'ship-3');
createShip( 'game-node-2', {image: 'HULL_Bomber.png', name: 'bomber-004', owner: 1}, 'ship-4');
createShip( 'game-node-2', {image: 'HULL_Bomber.png', name: 'bomber-005', owner: 1}, 'ship-5');
createShip( 'game-node-2', {image: 'HULL_Bomber.png', name: 'bomber-006', owner: 1}, 'ship-6');

makeNodeConnection(document.getElementById('game-node-1'),document.getElementById('game-node-2'));
makeNodeConnection(document.getElementById('game-node-1'),document.getElementById('game-node-3'));
makeNodeConnection(document.getElementById('game-node-1'),document.getElementById('game-node-4'));
makeNodeConnection(document.getElementById('game-node-2'),document.getElementById('game-node-4'));

startOfTurnCleanUp();