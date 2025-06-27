
import bingoListOriginal from './super_mario_64_generator.js';

const socket = io();
let roomId = prompt('Enter room ID to join (must be a number):');
socket.emit('join-room', roomId);

// Listen for updates from other clients
socket.on('update-tile', ({ tileId }) => {
  const tile = document.getElementById(`bingo-tile-${tileId}`);
  if (tile) {
    if (tile.style.border === '2px solid red'){
        tile.style.border = tileBorder;
        
    }
    else{
        tile.style.border = '2px solid red';
    }      
  }
});

let tiles = [];

function createSeededRandom(seed) {
  let currentSeed = seed;
  const a = 1103515245;
  const c = 12345;
  const m = 2**31; // A large prime number or power of 2

  return function() {
    currentSeed = (a * currentSeed + c) % m;
    return currentSeed / m; // Return a value between 0 and 1
  };
}

function revealOrthogonalTiles(tile) {
    
    let tileId = parseInt(tile.id.split('-')[2]);
    let tileRight;
    let tileLeft;

    if (borderRightTilesId.includes(tileId)) {
        tileRight = document.getElementById(`bingo-tile-${tileId - 6}`);
    }
    else {
        tileRight = document.getElementById(`bingo-tile-${tileId + 1}`);
    }

    if (borderLeftTilesId.includes(tileId)) {
        tileLeft =  document.getElementById(`bingo-tile-${tileId + 6}`);
    }
    else {
        tileLeft = document.getElementById(`bingo-tile-${tileId - 1}`);
    }
    let tileUp = document.getElementById(`bingo-tile-${tileId - 7}`);
    const tiles = [tileRight, tileLeft, tileUp];
    tiles.forEach(tile => {
        if (tile && tile.childNodes[0].classList.contains('hidden')) {
            tile.childNodes[0].classList.remove('hidden');
        }
    })
}

function generateBingoCard(seedFunction) {

    const tileCount = 49; // 7x7 grid
    const tileSize = 100;
    let bingoTiles;

    for (let i = 0; i < tileCount; i++) {


        let randNum1 = Math.floor(seedFunction() * bingoList.length);
        while (!bingoList[randNum1] || bingoList[randNum1].length === 0) {
            randNum1 = Math.floor(seedFunction() * bingoList.length);
        }

        let randNum2 = Math.floor(seedFunction() * bingoList[randNum1].length);

        const tileText = bingoList[randNum1][randNum2].name;
        const tileTextElement = document.createElement('p');
        const tile = document.createElement('div');
        tiles.push(tile);

        bingoList[randNum1].splice(randNum2, 1); 

        tileTextElement.classList.add('hidden');
        tileTextElement.textContent = tileText;

        tile.classList.add('bingo-tile');
        tile.style.width = `${tileSize - 1}px`;

        tile.style.height = `${tileSize - 1}px`; 
        tile.id = `bingo-tile-${i}`;

        if (i > -1 && i < 7) {
            tile.style.backgroundColor = endBackground;
            tile.style.border = endBorder;
        }
        else {
            tile.style.backgroundColor = defaultTileBackground;
            tile.style.border = tileBorder;
        }

        tile.appendChild(tileTextElement);
        bingoCard.appendChild(tile);
    }
    bingoTiles = document.querySelectorAll('.bingo-tile');

    bingoTiles.forEach(tile => {
        let tileId = tile.id.split('-')[2];
        tile.addEventListener('click', () => {
            
            

            if (!tile.childNodes[0].classList.contains('hidden')) {
                
                if (tile.style.backgroundColor === clickedTileBackground) {
                    if (endTilesId.includes(parseInt(tileId))) {
                        tile.style.backgroundColor = endBackground;
                    }
                    else {
                        tile.style.backgroundColor = defaultTileBackground;
                    }
                }
                else {
                    tile.style.backgroundColor = clickedTileBackground
                    revealOrthogonalTiles(tile);
                    
                }

                socket.emit('tile-clicked', { roomId, tileId: parseInt(tileId) });
            }
        });
        if (startTilesId.includes(parseInt(tileId))) {
                tile.childNodes[0].classList.remove('hidden');
        }
    });
}



const endBorder = '1px solid rgba(0, 255, 0, 0.5)'
const endBackground = 'rgba(0, 255, 0, 0.1)'
const tileBorder = '1px solid rgba(255, 255, 255, 0.5)';
const defaultTileBackground = 'rgba(0, 0, 0, 0.1)';
const borderLeftTilesId = [0, 7, 14, 21, 28, 35, 42]
const borderRightTilesId = [6, 13, 20, 27, 34, 41, 48];
const startTilesId = [42, 43, 44, 45, 46, 47, 48];
const endTilesId = [0, 1, 2, 3, 4, 5, 6];
const colorPicker = document.getElementById('colorPicker');
const setSeedButton = document.getElementById('setSeedButton');

let bingoList = bingoListOriginal
let bingoCard = document.querySelector('.bingo-card');
let defaultSeedFunction = createSeededRandom(roomId); 
let clickedTileBackground = 'black';

colorPicker.addEventListener('change', (event) => {
    clickedTileBackground = event.target.value;
    for (let i = 0; i < tiles.length; i++){
        if (!tiles[i].childNodes[0].classList.contains('hidden')){
            if (tiles[i].style.backgroundColor != defaultTileBackground){
                tiles[i].style.backgroundColor = clickedTileBackground
            }
        }
    }
});



setSeedButton.addEventListener('click', () => {
    const seedInput = document.getElementById('seedInput').value;
    if (seedInput) {
        let seed = parseInt(seedInput, 10);
        
        if (!isNaN(seed)) {
            bingoList = bingoListOriginal; // Reset bingoList to original state
            let newSeedFunction = createSeededRandom(seed);
            bingoCard.innerHTML = ''; // Clear the existing bingo card
            generateBingoCard(newSeedFunction); // Regenerate the card with the new seed
        } else {
            alert('Please enter a valid number for the seed.');
        }
    } else {
        alert('Please enter a seed value.');
    }
});

generateBingoCard(defaultSeedFunction);




