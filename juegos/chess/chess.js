// Unicode piezas: ♔♕♖♗♘♙ (blancas) y ♚♛♜♝♞♟ (negras)
const initialBoard = [
  ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
  ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
  [ "",  "",  "",  "",  "",  "",  "",  ""],
  [ "",  "",  "",  "",  "",  "",  "",  ""],
  [ "",  "",  "",  "",  "",  "",  "",  ""],
  [ "",  "",  "",  "",  "",  "",  "",  ""],
  ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
  ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]
];

const pieceUnicode = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟"
};

let board = [];
let selected = null;
let validMoves = [];
let turn = "w";
let statusDiv = document.getElementById("status");

function cloneBoard(b) {
    return b.map(row => row.slice());
}

function renderBoard() {
    const chessboard = document.getElementById("chessboard");
    chessboard.innerHTML = "";
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const sq = document.createElement("div");
            sq.className = "square " + ((r + c) % 2 === 0 ? "white" : "black");
            sq.dataset.row = r;
            sq.dataset.col = c;
            if (selected && selected[0] === r && selected[1] === c) {
                sq.classList.add("selected");
            }
            if (validMoves.some(([mr, mc]) => mr === r && mc === c)) {
                sq.classList.add("move");
            }
            const piece = board[r][c];
            if (piece) {
                sq.textContent = pieceUnicode[piece];
            }
            sq.addEventListener("click", squareClick);
            chessboard.appendChild(sq);
        }
    }
    statusDiv.textContent = (turn === "w" ? "Blancas" : "Negras") + " mueven";
}

function inBounds(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function isOwnPiece(piece) {
    return piece && piece[0] === turn;
}

function isEnemyPiece(piece) {
    return piece && piece[0] !== turn;
}

function getMoves([row, col], b = board) {
    const moves = [];
    const piece = b[row][col];
    if (!piece) return moves;
    const color = piece[0];
    const type = piece[1];

    // Peón
    if (type === "P") {
        const dir = color === "w" ? -1 : 1;
        // Adelante
        if (inBounds(row + dir, col) && !b[row + dir][col]) {
            moves.push([row + dir, col]);
            // Doble movimiento inicial
            if (
                (color === "w" && row === 6) ||
                (color === "b" && row === 1)
            ) {
                if (!b[row + dir * 2][col]) moves.push([row + dir * 2, col]);
            }
        }
        // Capturas
        for (let dc of [-1, 1]) {
            let nr = row + dir, nc = col + dc;
            if (inBounds(nr, nc) && isEnemyPiece(b[nr][nc])) {
                moves.push([nr, nc]);
            }
        }
    }
    // Torre
    if (type === "R" || type === "Q") {
        for (let [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            for (let i = 1; i < 8; i++) {
                let nr = row + dr * i, nc = col + dc * i;
                if (!inBounds(nr, nc)) break;
                if (!b[nr][nc]) moves.push([nr, nc]);
                else {
                    if (isEnemyPiece(b[nr][nc])) moves.push([nr, nc]);
                    break;
                }
            }
        }
    }
    // Alfil
    if (type === "B" || type === "Q") {
        for (let [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
            for (let i = 1; i < 8; i++) {
                let nr = row + dr * i, nc = col + dc * i;
                if (!inBounds(nr, nc)) break;
                if (!b[nr][nc]) moves.push([nr, nc]);
                else {
                    if (isEnemyPiece(b[nr][nc])) moves.push([nr, nc]);
                    break;
                }
            }
        }
    }
    // Caballo
    if (type === "N") {
        for (let [dr, dc] of [
            [2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]
        ]) {
            let nr = row + dr, nc = col + dc;
            if (inBounds(nr, nc) && (!b[nr][nc] || isEnemyPiece(b[nr][nc])))
                moves.push([nr, nc]);
        }
    }
    // Rey
    if (type === "K") {
        for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                let nr = row + dr, nc = col + dc;
                if (inBounds(nr, nc) && (!b[nr][nc] || isEnemyPiece(b[nr][nc])))
                    moves.push([nr, nc]);
            }
    }
    return moves;
}

function squareClick(e) {
    const r = parseInt(this.dataset.row);
    const c = parseInt(this.dataset.col);
    const clickedPiece = board[r][c];

    if (selected) {
        // Mover si es válido
        if (validMoves.some(([mr, mc]) => mr === r && mc === c)) {
            movePiece(selected, [r, c]);
            selected = null;
            validMoves = [];
            renderBoard();
            return;
        }
        // Seleccionar otra propia
        if (isOwnPiece(clickedPiece)) {
            selected = [r, c];
            validMoves = getMoves(selected);
            renderBoard();
            return;
        }
        // Deseleccionar
        selected = null;
        validMoves = [];
        renderBoard();
    } else {
        // Seleccionar propia
        if (isOwnPiece(clickedPiece)) {
            selected = [r, c];
            validMoves = getMoves(selected);
            renderBoard();
        }
    }
}

function movePiece(from, to) {
    const [fr, fc] = from, [tr, tc] = to;
    // Promoción de peón simple (si llega al final)
    if (
        board[fr][fc][1] === "P" &&
        ((turn === "w" && tr === 0) || (turn === "b" && tr === 7))
    ) {
        board[tr][tc] = turn + "Q"; // Siempre promociona a dama
    } else {
        board[tr][tc] = board[fr][fc];
    }
    board[fr][fc] = "";
    turn = turn === "w" ? "b" : "w";
}

function resetGame() {
    board = cloneBoard(initialBoard);
    selected = null;
    validMoves = [];
    turn = "w";
    renderBoard();
}

resetGame();
