const modalContainer = document.querySelector('.modal-container');
const resetBtn = document.querySelectorAll('.reset');
const hardModeBtn = document.querySelector('#hardMode');

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let hardMode = false; // Abilita modo dificil
let stopGame = true; // Para a animação
const vX = 5; // velocidade x
const vY = 5; // velocidade y
let dirX = 0; // direção x
let dirY = 0; // direção y

// escala do canvas
let scale = window.innerHeight > window.innerWidth ? 0.5 : 1;

let gridSide = 5; // largura da grade
const blockSize = 100; // tamanho padrão

canvas.width = 500 * scale;
canvas.height = 500 * scale;

// escala do bloco de acordo com o tamanho da grade
let blockScale = (canvas.width / gridSide) / (blockSize * scale);
let gridBlock = blockScale * blockSize;

// Elemento Bloco
function Block(posX, posY, isSelected = false, scale = 1) {
  this.posX = posX;
  this.posY = posY;
  this.dirX = 0;
  this.dirY = 0;
  this.scale = scale;
  this.size = 100 * this.scale;
  this.isSelected = isSelected;
}

// Desenha o bloco
Block.prototype.draw = function () {
  const realX = this.posX / this.scale;
  const realY = this.posY / this.scale;

  ctx.save();
  ctx.scale(this.scale, this.scale);

  ctx.fillStyle = '#D08736';
  ctx.fillRect(realX, realY, 100, 100);

  ctx.fillStyle = '#DC8C39';
  ctx.fillRect(realX, realY, 20, 100);
  ctx.fillRect(realX + 80, realY, 20, 100);

  ctx.fillStyle = '#EA9B48';
  ctx.fillRect(realX, realY, 100, 20);
  ctx.fillRect(realX, realY + 40, 100, 20);
  ctx.fillRect(realX, realY + 80, 100, 20);
  
  ctx.strokeStyle = this.isSelected ? 'brown' : '#DC8C39';
  ctx.lineWidth = 2;
  ctx.strokeRect(realX + 1, realY + 1, 98, 98);
  
  ctx.restore();
};

// verifica colisão com a parede
Block.prototype.wallCollision = function() {
  if ((this.posX + this.size) >= 500) {
    dirX = 0;
    this.posX = 500 - this.size;
  } else if (this.posX <= 0) {
    dirX = 0;
    this.posX = 0;
  }

  if ((this.posY + this.size) >= 500) {
    dirY = 0;
    this.posY = 500 - this.size;
  } else if (this.posY <= 0) {
    dirY = 0;
    this.posY = 0;
  }
};

// Verifica colisão com outros blocos
Block.prototype.blockCollision = function() {
  let dx, dy, distance;
  blocks.forEach(block => {
    if (block !== this) {
      dx = (this.posX - block.posX);
      dy = (this.posY - block.posY);
      distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.size) {
        dirY = 0;
        dirX = 0;
        if (dx === 0) {
          this.posY = Math.round(this.posY / gridBlock) * gridBlock;
        } else if (dy === 0) {
          this.posX = Math.round(this.posX / gridBlock) * gridBlock;
        }
      }
    }
  });
};

// Instancia os blocos
let blocks = [
  new Block(0, 0, true, blockScale),
  new Block(0, gridBlock,false, blockScale),
  new Block(0, gridBlock * 2,false, blockScale)
];

ctx.scale(scale,scale);

draw();

// Animção
function animate() {
  if (stopGame) return;

  draw();

  requestAnimationFrame(animate);
}

// Desenha todos os objetos
function draw() {
  drawBackground();
  drawTarget();
  
  blocks.forEach(block => {
    block.draw();

    if (block.isSelected) {
      block.posX += vX * dirX;
      block.posY += vY * dirY;

      youWon(block);

      if (dirX || dirY) {
        block.wallCollision();
        block.blockCollision();
      }
    }
  });
}


// Desenha o fundo
function drawBackground() {
  ctx.fillStyle = '#60E0E9';
  ctx.fillRect(0, 0, 500, 500);

  ctx.save();
  ctx.rotate(40 * (Math.PI / 180));

  ctx.fillStyle = 'rgba(193,236,236,0.5)';
  ctx.fillRect(0, 100, 500 * 2, 20);
  ctx.fillRect(0, -10, 500 * 2, 30);

  ctx.restore();
}

// Desenha o alvo
function drawTarget() {
  let middle = Math.floor(gridSide / 2) * gridBlock;

  ctx.fillStyle = '#F16969';
  ctx.strokeStyle = '#ED1414';
  ctx.lineWidth = 3;

  ctx.fillRect(middle, middle, gridBlock, gridBlock);
  ctx.strokeRect(middle, middle, gridBlock, gridBlock);
}

// Verifica se o jogador ganhou
function youWon(selectedBlock) {
  if (dirY || dirX) return;

  const { posX, posY } = selectedBlock;
  let middle = Math.floor(gridSide / 2) * gridBlock;

  if (posX === middle && posY === middle) {
    modalContainer.style.display = 'flex';
    modalContainer.lastElementChild.style.display = 'block';
    stopGame = true;
  }
}

// Ativa o modo dificil
function hardModeFn() {
  gridSide = 7;
  blockScale = ((canvas.width / gridSide) / (blockSize * scale)).toFixed(4);
  gridBlock = blockScale * blockSize;
  hardMode = true;
  hardModeBtn.textContent = hardMode ? 'Modo Normal' : 'Modo Difícil';

  resetGame();
}

// Ativa o modo normal
function normalMode() {
  gridSide = 5;
  blockScale = (canvas.width / gridSide) / (blockSize * scale);
  gridBlock = blockScale * blockSize;
  hardMode = false;

  resetGame();
}

// Reseta as variaveis
function resetGame() {
  blocks = [
    new Block(0, 0, true, blockScale),
    new Block(0, gridBlock, false, blockScale),
    new Block(0, gridBlock * 2, false, blockScale)
  ];

  stopGame = false;

  modalContainer.style.display = 'none';
  modalContainer.firstElementChild.style.display = 'none';

  requestAnimationFrame(animate);
}

// Eventos
document.addEventListener('keydown', e => {
  if (dirY || dirX || stopGame) return;

  switch (e.key) {
    case "ArrowRight":
      dirX = 1;
      break;
    case "ArrowLeft":
      dirX = -1;
      break;
    case "ArrowDown":
      dirY = 1;
      break;
    case "ArrowUp":
      dirY = -1;
      break;
    default:
      return;
  }
});

document.addEventListener('click', e => {
  if (dirX || dirY) return;

  const selectedBlock = blocks.find(block => block.isSelected);
  let mouseX = e.clientX - canvas.offsetLeft;
  let mouseY = e.clientY - canvas.offsetTop;
  mouseX /= scale;
  mouseY /= scale;
  blocks.forEach(block => {
    if (mouseX >= block.posX && mouseX <= block.posX + gridBlock) {
      if (mouseY >= block.posY && mouseY <= block.posY + gridBlock) {
        selectedBlock.isSelected = false;
        block.isSelected = true;
      }
    }
  });
});

resetBtn.forEach(btn => {
  btn.addEventListener('click', () => {
    resetGame();
  });
});

hardModeBtn.addEventListener('click', () => {
  if (hardMode) {
    normalMode();
  } else {
    hardModeFn();
  }
});