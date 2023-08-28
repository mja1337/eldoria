var playerHealth = 100;
var playerY = 0;
var playerX = 0;

document.getElementById('loadGameBtn').addEventListener('click', function() {
    // Trigger the file input to load the saved game state.
    document.getElementById('loadGameFile').click();
});

document.getElementById('loadGameFile').addEventListener('change', function(event) {
    handleFileUpload(event); // You'll define this function based on previous discussions.
});

const raceAttributes = {
    human: { strength: 10, intelligence: 10, defense: 10, magicDefense: 10 },
    elf: { strength: 8, intelligence: 12, defense: 9, magicDefense: 11 },
    dwarf: { strength: 12, intelligence: 8, defense: 11, magicDefense: 9 },
    orc: { strength: 13, intelligence: 7, defense: 12, magicDefense: 8 }
};

document.getElementById('raceSelect').addEventListener('change', function() {
    const selectedRace = this.value;
    const attributes = raceAttributes[selectedRace];

    document.getElementById('strength').textContent = attributes.strength;
    document.getElementById('intelligence').textContent = attributes.intelligence;
    document.getElementById('defense').textContent = attributes.defense;
    document.getElementById('magicDefense').textContent = attributes.magicDefense;
});

document.getElementById('createCharacterBtn').addEventListener('click', function() {
    const playerName = document.getElementById('playerName').value;
    const playerRace = document.getElementById('raceSelect').value;
    const playerAttributes = raceAttributes[playerRace];

    if(!playerName) {
        alert('Please enter a character name!');
        return;
    }

    // Here, you'd initialize your game with the player's chosen name and attributes.
    // For demonstration, we'll just alert them.
    alert(`Welcome, ${playerName} the ${playerRace}!`);

    // Hide the player creation screen and show the game UI (to be implemented).
    document.querySelector('.player-creation').style.display = 'none';
    document.querySelector('.game-ui').style.display = 'block'; 

    // After creating the character, initialize the game
    initializeGame(playerName, playerRace);
});

document.getElementById('newGameBtn').addEventListener('click', function() {
    // Hide title container and show player creation screen
    document.querySelector('.title-container').style.display = 'none';
    document.querySelector('.player-creation').style.display = 'block';
});

function initializeGame(playerName, playerRace) {
    // Display player's name
    document.getElementById('playerDisplayName').textContent = `${playerName} the ${playerRace}`;
    console.log("Initializing game...");

    const tileSize = 32; // Size of each tile in pixels
    const gameGrid = 40;

    // Generate game grid
    const gameCanvas = document.getElementById('gameCanvas');
    for(let i = 0; i < 10; i++) {
        for(let j = 0; j < 10; j++) {
            let tile = document.createElement('div');
            tile.className = 'gameTile';
            tile.setAttribute('data-x', i);  // Set the data-x attribute
            tile.setAttribute('data-y', j);  // Set the data-y attribute
            tile.style.left = `${i * tileSize}px`;
            tile.style.top = `${j * tileSize}px`;
            gameCanvas.appendChild(tile);
        }
    }

    // Place the player character in the center of the grid
    let playerTile = document.createElement('div');
    playerTile.className = 'gameTile playerIcon';
    playerTile.style.left = '160px'; // Center of the grid
    playerTile.style.top = '160px'; // Center of the grid
    gameCanvas.appendChild(playerTile);

    // Generate game content
    generateGameContent();

    // Listen for arrow keys for movement
    document.addEventListener('keydown', handlePlayerMovement);
    
    // Show the game UI
    document.querySelector('.game-ui').style.display = 'block';

    // Hide the title container
    document.querySelector('.title-container').style.display = 'none';
}

function download(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function saveGameDataToFile() {
    const playerData = {
        playerName: document.getElementById('playerName').value,
        playerRace: document.getElementById('raceSelect').value,
        playerAttributes: raceAttributes[document.getElementById('raceSelect').value]
    };

    const dataString = JSON.stringify(playerData);
    const checksum = dataString.length; // Basic checksum for demonstration
    const obfuscatedData = obfuscate(dataString + '|' + checksum); // Use '|' as a separator between data and checksum

    download('gameSave.txt', obfuscatedData);
}

function obfuscate(data) {
    let result = [];
    for(let i = 0; i < data.length; i++) {
        result.push(String.fromCharCode(data.charCodeAt(i) + 1)); // Simple obfuscation by incrementing each char code
    }
    return result.join('');
}

function deobfuscate(data) {
    let result = [];
    for(let i = 0; i < data.length; i++) {
        result.push(String.fromCharCode(data.charCodeAt(i) - 1)); // Revert the obfuscation
    }
    const deobfuscatedString = result.join('');
    console.log("Deobfuscated data:", deobfuscatedString); // Logging here, after it's defined
    return deobfuscatedString;
}


document.getElementById('saveGameWithinBtn').addEventListener('click', saveGameDataToFile);

document.getElementById('optionsBtn').addEventListener('click', function() {
    const optionsMenu = document.querySelector('.options-menu');
    if (optionsMenu.style.display === 'none' || optionsMenu.style.display === '') {
        optionsMenu.style.display = 'block';
    } else {
        optionsMenu.style.display = 'none';
    }
});

function handleFileUpload(event) {
    console.log("handleFileUpload triggered"); // Logging
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const content = e.target.result;
            console.log("Read file content:", content); // Logging

            const deobfuscatedString = deobfuscate(content);
            console.log("Deobfuscated data:", deobfuscatedString); // Logging

            const [dataString, checksum] = deobfuscatedString.split('|');

            if (dataString.length !== parseInt(checksum, 10)) {
                alert('Save file is corrupted or invalid!');
                return;
            }

            const loadedData = JSON.parse(dataString);
            restoreGameState(loadedData);
        } catch (error) {
            console.error("Error in onload:", error);
        }
    };

    reader.readAsText(event.target.files[0]);
}

function restoreGameState(loadedData) {
    document.getElementById('playerName').value = loadedData.playerName;
    document.getElementById('raceSelect').value = loadedData.playerRace;

    const playerAttributes = raceAttributes[loadedData.playerRace];
    document.getElementById('strength').textContent = playerAttributes.strength;
    document.getElementById('intelligence').textContent = playerAttributes.intelligence;
    document.getElementById('defense').textContent = playerAttributes.defense;
    document.getElementById('magicDefense').textContent = playerAttributes.magicDefense;

    // Initialize the game with the loaded data
    initializeGame(loadedData.playerName, loadedData.playerRace);

    // After initializing, hide the title container
    document.querySelector('.title-container').style.display = 'none';
}


function toggleOptionsMenu() {
    const gameUI = document.querySelector('.game-ui');
    const optionsMenu = document.querySelector('.options-menu');
    
    if (optionsMenu.style.display === 'none' || optionsMenu.style.display === '') {
        gameUI.style.display = 'none';
        optionsMenu.style.display = 'block';
    } else {
        optionsMenu.style.display = 'none';
        gameUI.style.display = 'block';
    }
}

document.getElementById('closeOptionsBtn').addEventListener('click', toggleOptionsMenu);

let gameGrid = new Array(10).fill(0).map(row => new Array(10).fill(0));

function generateGameContent() {
    for(let i = 0; i < 10; i++) {
        for(let j = 0; j < 10; j++) {
            let tileType = 'grassTile';
            // Introducing some randomness. 20% chance for a tile to be a tree.
            if (Math.random() < 0.2) {
                tileType = 'treeTile';
                gameGrid[i][j] = 1;  // 1 represents an obstacle
            }
            let tile = document.querySelector(`.gameTile[data-x='${i}'][data-y='${j}']`);
            tile.classList.add(tileType);
        }
    }
}

function movePlayerTo(x, y) {
    const gameCanvas = document.getElementById('gameCanvas');
    const playerTile = document.querySelector('.playerIcon');

    playerTile.style.left = `${x * 32}px`;
    playerTile.style.top = `${y * 32}px`;
}

let playerPosition = { x: 5, y: 5 }; // Starting at the center of the grid

function handlePlayerMovement(event) {
    console.log("Key pressed:", event.keyCode); // logging
    switch(event.keyCode) {
        case 37:  // Left arrow
            if (playerPosition.x > 0 && gameGrid[playerPosition.x - 1][playerPosition.y] !== 1) {
                playerPosition.x--;
            }
            break;
        case 38:  // Up arrow
            if (playerPosition.y > 0 && gameGrid[playerPosition.x][playerPosition.y - 1] !== 1) {
                playerPosition.y--;
            }
            break;
        case 39:  // Right arrow
            if (playerPosition.x < 9 && gameGrid[playerPosition.x + 1][playerPosition.y] !== 1) {
                playerPosition.x++;
            }
            break;
        case 40:  // Down arrow
            if (playerPosition.y < 9 && gameGrid[playerPosition.x][playerPosition.y + 1] !== 1) {
                playerPosition.y++;
            }
            break;
    }
    movePlayerTo(playerPosition.x, playerPosition.y);

    randomEncounter();
}

// Player Definition
const player = {
    health: 100,
    strength: 15,
    defense: 10,
    inventory: [],
};

// 1. Define Enemies
const enemies = {
    'Goblin': {
        health: 50,
        strength: 10,
        defense: 5,
        loot: ['gold coin', 'rusty sword']
    },
    'Orc': {
        health: 100,
        strength: 20,
        defense: 10,
        loot: ['silver coin', 'iron shield']
    }
};

// 2. Combat Function
function combat(player, enemy) {
    while (player.health > 0 && enemy.health > 0) {
        const playerDamage = Math.max(player.strength - enemy.defense, 0); // Ensure damage isn't negative
        const enemyDamage = Math.max(enemy.strength - player.defense, 0); // Ensure damage isn't negative

        enemy.health -= playerDamage;
        player.health -= enemyDamage;

        updateUI(`You dealt ${playerDamage} damage to the ${enemy.name}!`);
        updateUI(`${enemy.name} dealt ${enemyDamage} damage to you!`);

        if (enemy.health <= 0) {
            updateUI(`Enemy ${enemy.name} defeated!`);
            collectLoot(enemy);
        } else if (player.health <= 0) {
            updateUI("Player defeated!");
    gameOver();
            // Handle player defeat, e.g., respawn or game over
            resetGame();
            break;
        }
    }
}

// 3. Loot Collection
function collectLoot(enemy) {
    const randomIndex = Math.floor(Math.random() * enemy.loot.length);
    const item = enemy.loot[randomIndex];
    updateUI(`You've found a ${item}!`);
    player.inventory.push(item);
}

// 4. Encounter Mechanism
function randomEncounter() {
    const chance = Math.random();
    if (chance > 0.7) {
        const enemyNames = Object.keys(enemies);
        const randomEnemyName = enemyNames[Math.floor(Math.random() * enemyNames.length)];
        const enemy = { ...enemies[randomEnemyName], name: randomEnemyName }; // Clone and add name for easy reference
        updateUI(`A wild ${randomEnemyName} appears!`);
        combat(player, enemy);
    }
}

// 5. User Interface (UI)
function updateUI(message) {
    const log = document.getElementById('game-log');
    const logMessage = document.createElement('div');
    logMessage.textContent = message;
    log.appendChild(logMessage);
}

function resetGame() {
    // This function can be expanded to handle player death (e.g., respawning, game over screen, etc.)
    updateUI("You have been defeated. Game over!");
    // Reset player stats, position, or other properties as needed.
    // Hide combat screen
    document.getElementById('combat-screen').style.display = 'none';
    
    // Show the title container
    document.querySelector('.title-container').style.display = 'block';
}

function showCombatScreen(enemy) {
    const combatScreen = document.getElementById('combat-screen');
    combatScreen.style.display = 'block';

    // Set enemy image based on the encountered enemy. Assuming you have images for each enemy type.
    document.getElementById('enemy-avatar').src = `path_to_${enemy.name.toLowerCase()}_image.png`;
}

function hideCombatScreen() {
    document.getElementById('combat-screen').style.display = 'none';
}

function updateHealthBars() {
    document.getElementById('player-health').style.width = `${(player.health / 100) * 100}%`;
    const enemyName = document.getElementById('enemy-avatar').alt.split(' ')[0];  // Assuming alt is like "EnemyName Avatar"
    const enemy = enemies[enemyName];
    document.getElementById('enemy-health').style.width = `${(enemy.health / enemy.maxHealth) * 100}%`;
}

function playerAttack() {
    const enemyName = document.getElementById('enemy-avatar').alt.split(' ')[0];
    const enemy = enemies[enemyName];

    // Calculate damages
    const playerDamage = Math.max(player.strength - enemy.defense, 0);
    const enemyDamage = Math.max(enemy.strength - player.defense, 0);

    enemy.health -= playerDamage;
    player.health -= enemyDamage;

    updateHealthBars();

    updateUI(`You dealt ${playerDamage} damage to the ${enemy.name}!`);
    updateUI(`${enemy.name} dealt ${enemyDamage} damage to you!`);

    if (enemy.health <= 0 || player.health <= 0) {
        endCombat(player.health > 0);
    }
}

function useItem() {
    // For simplicity: healing potion
    if (player.inventory.includes('healing potion')) {
        player.health += 20;
        if (player.health > 100) player.health = 100;

        const index = player.inventory.indexOf('healing potion');
        player.inventory.splice(index, 1);

        updateHealthBars();
        updateUI("You used a healing potion and restored 20 health!");
    } else {
        updateUI("You don't have any items to use!");
    }
}

function runAway() {
    updateUI("You successfully ran away!");
    hideCombatScreen();
}

function endCombat(playerWon) {
    if (playerWon) {
        const enemyName = document.getElementById('enemy-avatar').alt.split(' ')[0];
        const enemy = enemies[enemyName];
        collectLoot(enemy);
        updateUI(`Enemy ${enemy.name} defeated!`);
    } else {
        updateUI("Player defeated!");
    gameOver();
        resetGame();
    }

    hideCombatScreen();
}

function drawSkullAndCrossbones(x, y) {
    const tile = document.querySelector(`.grid-tile[data-x="${x}"][data-y="${y}"]`);
    if (!tile) {
        console.error("Tile not found for coordinates:", x, y); 
console.log("Attempting to draw skull and crossbones at:", x, y);
console.log("Game grid element:", document.getElementById("game-grid"));
console.log("All tiles:", document.querySelectorAll(".grid-tile"));

        return;
    }
    // Clear any existing children of the tile (e.g., the blue player)
    while (tile.firstChild) {
        tile.removeChild(tile.firstChild);
    }
    tile.style.backgroundColor = 'black'; // Set the tile's background to black

    const skullAndCrossbones = document.createElement('div');
    skullAndCrossbones.innerHTML = "☠️"; // This is the Unicode character for skull and crossbones.
    skullAndCrossbones.style.fontSize = '20px'; // Adjust this as needed.
    tile.appendChild(skullAndCrossbones);
}

function resetGame() {
    // Reset player stats, position, or any other necessary configurations
    // Draw the skull and crossbones on the defeated player's last position
    drawSkullAndCrossbones(playerX, playerY);
console.log("Player's last position before defeat:", playerX, playerY);

    playerHealth = 100; // This is just an example. You'd want to reset any other necessary stats or configurations.

    // Reset player stats, position, or any other necessary configurations
    playerHealth = 100; 
    playerX = 0; // Reset to starting X position (or wherever you want the player to start)
    playerY = 0; // Reset to starting Y position

    // Hide combat screen
    document.getElementById('combat-screen').style.display = 'none';
        
    // Hide the game grid
    document.getElementById('game-grid').style.display = 'none';
    
    // Show the title container
    //document.querySelector('.title-container').style.display = 'block';
    
    // Reset game grid or any other elements if necessary
}
function gameOver() {
    document.getElementById('game-over-overlay').style.display = 'block';
}

function startNewGame() {
    // 1. Reset Game Variables
    player.health = 100;
    player.strength = 15;
    player.defense = 10;
    player.inventory = [];
    
    playerPosition = { x: 5, y: 5 }; // Reset the player's position to the center

    // Clear the game log
    document.getElementById('game-log').innerHTML = '';

    // 2. Hide Active UI Elements
    document.querySelector('.game-ui').style.display = 'none';
    document.getElementById('combat-screen').style.display = 'none';
    document.querySelector('.options-menu').style.display = 'none';
    document.querySelector('.player-creation').style.display = 'none';

    // 3. Show the Title Screen
    document.querySelector('.title-container').style.display = 'block';
}

// Bind the function to the "New Game" button inside the options menu
document.getElementById('newGameWithinBtn').addEventListener('click', startNewGame);
