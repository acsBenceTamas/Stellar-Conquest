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
    connectionLine.classList.add('connection-line', 'selectable', 'game-piece');
    connectionLine.style=
        `padding:0;
        margin:0;
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
    node.classList.add('game-node', 'selectable', 'game-piece');
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
    ship.classList.add('game-ship', 'selectable', 'game-piece');
    ship.id = shipId;
    ship.src = emblemsFolder + shipConfiguration.image;
    ship.dataset.name = shipConfiguration.name;
    ship.dataset.owner = shipConfiguration.owner;
    document.getElementById(nodeId).appendChild(ship);
    return ship
}

function clickUpdate() {
    for (let selectable of document.getElementsByClassName('selectable')) {
        selectable.classList.remove('selected');
        if (selectable.classList.contains('connection-line') || selectable.classList.contains('game-node')) {
            selectable.classList.remove('travelled', 'enemy');
        }
    }
}

function updateGameInfo() {
    let gameInfo = document.getElementById('game-info');
    gameInfo.textContent = `Current player: ${currentPlayer} | Available ships: ${countFriendlyShips()} | Ships without order: ${countFriendlyShipsWithoutOrder()}`
}

function countFriendlyShips() {
    return Array.from(document.getElementsByClassName('game-ship')).filter(
        ship => ship.dataset.owner == currentPlayer
    ).length
}

function countFriendlyShipsOnNode( node ) {
    return Array.from(node.getElementsByClassName('game-ship')).filter(
        ship => ship.dataset.owner == currentPlayer
    ).length
}

function countEnemyShipsOnNode(node) {
    return Array.from(node.getElementsByClassName('game-ship')).filter(
        ship => ship.dataset.owner != currentPlayer
    ).length
}

function countFriendlyShipsWithoutOrder() {
    return Array.from(document.getElementsByClassName('game-ship')).filter(
        ship => ship.dataset.owner == currentPlayer && !ship.classList.contains('travelled') && ship.dataset.type != "station"
    ).length
}

function countFriendlyShipsWithoutOrderOnNode( node ) {
    return Array.from(document.getElementsByClassName('game-ship')).filter(
        ship => ship.dataset.owner == currentPlayer && !ship.classList.contains('travelled') &&
            ship.dataset.type != "station" && ship.parentNode.id == node.id
    ).length
}

function countEnemiesInvadingFromNode( sourceNode, targetNode ) {
    return Array.from(document.getElementsByClassName('game-ship')).filter(
        ship => ship.dataset.owner != currentPlayer &&
            ship.parentNode.id == sourceNode.id && ship.dataset.moveTarget == targetNode.id
    ).length
}

function checkInvasionRules( sourceNode, targetNode ) {
    const enemiesInvadingFromNode = countEnemiesInvadingFromNode(targetNode, sourceNode);
    if ( enemiesInvadingFromNode == 0 || enemiesInvadingFromNode < countFriendlyShipsWithoutOrderOnNode(sourceNode)) {
        return true
    } else {
        alert("Number of attacking ships from selected node exceeds defending ships in the current node.")
        return false
    }
}

function clickedGameBoardElement( event ) {
    clickUpdate();
    let clickTarget = event.target;
    console.log(event.currentTarget.id);
    if ( clickTarget == event.currentTarget) {
        selectGameBoard();
        deselectShip()
    } else if ( isShip(clickTarget) ) {
        if (currentShip == clickTarget) {
            deselectShip()
        } else {
            selectShip(clickTarget);
        }
    } else if ( isGameNode(clickTarget) ) {
        if (shipIsSelected()) {
            if (isFriendlyShip(currentShip) && canMoveTo(currentShip, clickTarget)) {
                if (currentShip.parentNode.id == clickTarget.id || currentShip.dataset.moveTarget == clickTarget.id) {
                    cancelMoveOrder(currentShip);
                } else {
                    issueMoveOrder(currentShip, clickTarget);
                }
                selectShip(currentShip);
            } else {
                selectNode( clickTarget );
                deselectShip();
            }
        } else {
            selectNode( clickTarget );
        }
    }
    updateGameInfo()
}

function deselectShip() {
    currentShip = null;
    for (let node of document.getElementsByClassName('game-node travelled')) {
        node.classList.remove('travelled');
    }
}

function canMoveTo( ship, targetNode ) {
     return (Array.from(document.getElementsByClassName('connection-line')).filter(
        line => {
            let nodes = JSON.parse(line.dataset.nodes);
            return nodes.includes(ship.parentNode.id) && nodes.includes(targetNode.id)
        }
     ).length > 0
     && checkInvasionRules( ship.parentNode, targetNode));
}

function issueMoveOrder( ship, targetNode ) {
    ship.dataset.moveTarget = targetNode.id;
    ship.classList.add('travelled');
}

function cancelMoveOrder( ship ) {
    ship.dataset.moveTarget = null;
    ship.classList.remove('travelled');
}

function getAllConnectionsForNode( node ) {
    return Array.from(document.getElementsByClassName('connection-line')).filter(el => JSON.parse(el.dataset.nodes).includes(node.id));
}

function getAllNodesAttackingNodeWithAttackers( node ) {
    let attackingNodes = Array.from(document.getElementsByClassName('game-node')).filter(sourceNode => {
        for (let ship of sourceNode.getElementsByClassName('game-ship')) {
            if (ship.dataset.moveTarget == node.id) {
                return true
            }
        }
        return false
    });
    let detailedAttacks = [];
    for (let attackingNode of attackingNodes) {
        let enemy = false;
        let ally = false;
        for (let ship of Array.from(attackingNode.getElementsByClassName('game-ship')).filter(ship => ship.dataset.moveTarget == node.id)) {
            if (ship.dataset.owner == currentPlayer) {
                ally = true;
            } else {
                enemy = true;
            }
        }
        let attackType;
        if (enemy && ally) {attackType = "both"} else if (enemy) {attackType = "enemy"} else {attackType = "ally"}
        detailedAttacks.push({attackingNode: attackingNode, attackType: attackType})
    }
    return detailedAttacks
}

function selectGameBoard() {
    document.getElementById("info-items").innerHTML =
    `<tr><th class="info-name">Selected:</th><td class="info-value">NONE</td></tr>`;
}

function selectNode( node ) {
    node.classList.add('selected');
    attackingNodes = getAllNodesAttackingNodeWithAttackers(node);
    for (let connectionLine of getAllConnectionsForNode(node)){
        connectionLine.classList.add('selected');
        for (let attack of attackingNodes.filter(
            attack => JSON.parse(connectionLine.dataset.nodes).includes(attack.attackingNode.id))) {
            switch (attack.attackType) {
                case "both":
                    connectionLine.classList.add('conflicted');
                    break;
                case "enemy":
                    connectionLine.classList.add('enemy');
                    break;
                case "ally":
                    connectionLine.classList.add('travelled');
            }
        }
    }
    document.getElementById("info-items").innerHTML = `
        <tr><th class="info-name">Selected:</th><td class="info-value">${node.id}</td></tr>
        <tr><th class="info-name">Friendly Ships:</th><td class="info-value">${countFriendlyShipsOnNode(node)}</td></tr>
        <tr><th class="info-name">Enemy Ships:</th><td class="info-value">${countEnemyShipsOnNode(node)}</td></tr>
    `;
}

function selectShip( ship ) {
    deselectShip();
    ship.classList.add('selected');
    currentShip = ship;
    if (ship.dataset.moveTarget) {
        for (let line of document.getElementsByClassName('connection-line')) {
            let nodes = JSON.parse(line.dataset.nodes);
            if (nodes.includes(ship.dataset.moveTarget) && nodes.includes(ship.parentNode.id)) {
                line.classList.add('travelled');
                if (ship.dataset.owner != currentPlayer) {
                    line.classList.add('enemy');
                }
            }
        }
        for (let node of document.getElementsByClassName('game-node')) {
            if (node.id == ship.dataset.moveTarget) {
                node.classList.add('travelled');
                if (ship.dataset.owner != currentPlayer) {
                    node.classList.add('enemy');
                }
            }
        }
    }
}

function shipIsSelected() {
    return currentShip != null;
}

function isGameNode( element ) {
    return element.classList.contains('game-node');
}

function isShip( element ) {
    return element.classList.contains('game-ship');
}

function isFriendlyShip( element ) {
    return element.classList.contains('game-ship') && element.dataset.owner == currentPlayer;
}

function isEnemyShip( element ) {
    return element.classList.contains('game-ship') && element.dataset.owner != currentPlayer;
}

function startOfTurnCleanUp() {
    updateGameInfo();
    for (let ship of document.getElementsByClassName('game-ship')) {
        if (isEnemyShip(ship)) {
            ship.classList.add('enemy');
        } else {
            ship.classList.remove('enemy');
        }
    }
}

function removeAllGamePieces() {
    let gamePieces = document.getElementsByClassName('game-piece');
    for (let i = gamePieces.length; i > 0; i--) {
        gamePieces[i-1].remove();
    }
}

function startNewGame() {
    removeAllGamePieces();
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
}

function endMovePhase() {
    currentPlayer = (currentPlayer + 1)%playerCount;
    if (currentPlayer == firstPlayer) {
        moveShips();
    }
    startOfTurnCleanUp();
    clickUpdate();
    updateGameInfo();
}
function moveShips() {
    for (let ship of document.getElementsByClassName('game-ship')) {
        if (ship.dataset.moveTarget) {
            document.getElementById(ship.dataset.moveTarget).appendChild(ship);
            ship.removeAttribute('data-move-target');
            ship.classList.remove('travelled');
        }
    }
}

const emblemsFolder = document.getElementById('flask-info').dataset.emblemsFolder;
let gameBoard = document.getElementById('game-board');
gameBoard.addEventListener('click', clickedGameBoardElement);
let currentPlayer = 0;
let firstPlayer = 0;
let currentShip = null;
let playerCount = 2;

startNewGame();