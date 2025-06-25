let board = null;
let game = null;
let engine = null;
let engineReady = false;
let playerColor = 'white';
let stockfishLevel = 8;
let waitingForEngine = false;
let moveHistory = [];

const statusEl = document.getElementById('status');
const colorSelect = document.getElementById('color-select');
const levelSlider = document.getElementById('stockfish-level');
const levelValue = document.getElementById('level-value');
const newGameBtn = document.getElementById('new-game');

function setStatus(msg) {
  statusEl.textContent = msg;
}

function setEngineLevel(level) {
  // Skill Level va de 0 a 20
  sendToEngine('setoption name Skill Level value ' + (level - 1));
}

function sendToEngine(cmd) {
  if (engine) engine.postMessage(cmd);
}

function uciCmd(cmd) {
  sendToEngine(cmd);
}

function initEngine() {
  if (engine) {
    engine.terminate();
    engine = null;
  }
  engine = STOCKFISH();
  engineReady = false;
  waitingForEngine = false;
  engine.onmessage = function(event) {
    let line = event && typeof event === "object" && event.data ? event.data : event;
    if (typeof line !== "string") return;
    if (line === 'uciok') { engineReady = true; }
    if (line.startsWith('bestmove')) {
      let move = line.split(' ')[1];
      if (move === '(none)') {
        updateStatus();
        return;
      }
      game.move({ from: move.slice(0,2), to: move.slice(2,4), promotion: move.slice(4,5) });
      board.position(game.fen(), true);
      moveHistory.push(move);
      updateStatus();
      waitingForEngine = false;
    }
  };
  uciCmd('uci');
  setTimeout(() => setEngineLevel(stockfishLevel), 500);
}

function startNewGame() {
  game = new Chess();
  moveHistory = [];
  board.orientation(playerColor);
  board.position(game.fen(), false);
  setStatus('Turno de ' + (playerColor === 'white' ? 'Blancas (Tú)' : 'Negras (Tú)'));
  initEngine();
  setTimeout(() => setEngineLevel(stockfishLevel), 500);
  if (playerColor === 'black') {
    setTimeout(engineMove, 700);
  }
}

function onDragStart(source, piece, position, orientation) {
  if (game.game_over() || waitingForEngine) return false;
  if ((game.turn() === 'w' && playerColor !== 'white') ||
      (game.turn() === 'b' && playerColor !== 'black')) return false;
  if ((playerColor === 'white' && piece.search(/^b/) !== -1) ||
      (playerColor === 'black' && piece.search(/^w/) !== -1)) return false;
  return true;
}

function onDrop(source, target) {
  let move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  moveHistory.push(source + target + (move.promotion ? move.promotion : ''));
  board.position(game.fen(), true);
  updateStatus();

  if (!game.game_over()) {
    waitingForEngine = true;
    setTimeout(engineMove, 400);
  }
}

function engineMove() {
  if (game.game_over()) return;
  uciCmd('position fen ' + game.fen());
  let movetime = 600 + (20 - stockfishLevel) * 70;
  uciCmd('go movetime ' + movetime);
}

function onSnapEnd() {
  board.position(game.fen());
}

function updateStatus() {
  let status = '';
  let moveColor = game.turn() === 'w' ? 'Blancas' : 'Negras';

  if (game.in_checkmate()) {
    status = 'Fin de la partida: Jaque mate. ' +
             (game.turn() === playerColor[0] ? '¡Pierdes!' : '¡Ganaste!');
  }
  else if (game.in_draw()) {
    status = 'Fin de la partida: Tablas.';
  }
  else {
    status = 'Turno de ' + moveColor + (game.in_check() ? ' (¡Jaque!)' : '');
    if ((game.turn() === 'w' && playerColor === 'white') ||
        (game.turn() === 'b' && playerColor === 'black')) {
      status += ' (Tu turno)';
    } else {
      status += ' (Stockfish pensando...)';
    }
  }
  setStatus(status);
}

// --- UI Event Listeners ---
colorSelect.addEventListener('change', function() {
  playerColor = this.value;
  startNewGame();
});
levelSlider.addEventListener('input', function() {
  stockfishLevel = parseInt(this.value);
  levelValue.textContent = stockfishLevel;
  setEngineLevel(stockfishLevel);
});
newGameBtn.addEventListener('click', function() {
  startNewGame();
});

// --- Init Board ---
document.addEventListener('DOMContentLoaded', function() {
  board = Chessboard('board', {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    orientation: playerColor
  });
  startNewGame();
});
