// ================= CANVAS =================
const canvas = document.getElementById("GAME");
const ctx = canvas.getContext("2d");
ctx.scale(20, 20);

const nextCanvas = document.getElementById("NEXT");
const nextCtx = nextCanvas.getContext("2d");
nextCtx.scale(20, 20);

let gameRunning = false;
let glitchEnabled = true;
let flashRows = [];
let flashTimer = 0;


// ================= COMMENTARY =================
const commentaryEl = document.getElementById("commentary");

let commentaryTimeout = null;

function setCommentary(text) {
    if (!commentaryEl) return;

    commentaryEl.textContent = text;
    commentaryEl.style.opacity = "1";

    // reset fade timer
    if (commentaryTimeout) clearTimeout(commentaryTimeout);

    commentaryTimeout = setTimeout(() => {
        commentaryEl.style.opacity = "0.6";
    }, 2500);
}

function aiCommentary(rows, score) { //Pura- pura ada sistem AI disini :v
    const pool = [
        `Calculated move `,
        `Score is now ${score} `,
        `That placement was clean `,
        `You're getting dangerous...`,
        `AI approves this move `,
        `Human skill detected `
    ];

    if (rows === 4) return "PERFECT TETRIS!!!";
    if (rows >= 2) return pool[Math.random() * pool.length | 0];
    return "Steady play...";
}

// ================= SCORE UI =================
function updateScoreUI() {
    const el = document.getElementById("score-value");
    if (!el) return;
    el.textContent = player.score;
    el.classList.add("bump");
    setTimeout(() => el.classList.remove("bump"), 150);
}

// ================= MENU ================= ////pliss jangan di hapus seluruh bagian ini, nangis gw kalo rusak 😭////
function startGame() {
    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";
    document.getElementById("NEXT").style.display = "block";
    document.getElementById("logo-left").style.display = "block";
    document.getElementById("logo-right").style.display = "block";
    document.getElementById("score-panel").style.display = "block";

    arena.forEach(r => r.fill(0));
    player.score = 0;
    updateScoreUI();

    gameRunning = true;
    reset();

    player.matrix = nextPiece;
nextPiece = randomPiece();
drawNext();

}


function toggleMenu() {
    document.querySelector(".dropdown").classList.toggle("open");
}

function openSettings() {
    document.getElementById("settings-panel").style.display = "flex";
}
function closeSettings() {
    document.getElementById("settings-panel").style.display = "none";
}

function applySettings() {
    interval = Number(document.getElementById("speed-select").value);
    glitchEnabled = document.getElementById("glitch-toggle").checked; // for epileptic safety
    closeSettings();
}


function showCredits() {
    document.getElementById("credits-panel").style.display = "flex";
}
function closeCredits() {
    document.getElementById("credits-panel").style.display = "none";
}

function exitGame() {
    document.getElementById("exit-overlay").style.display = "flex";
}
function confirmExit() {
    window.location.href = "https://youtu.be/xvFZjo5PgG0"; // Rickroll link
}
function cancelExit() {
    document.getElementById("exit-overlay").style.display = "none";
}

function restartGame() {
    document.getElementById("gameover-panel").style.display = "none";
    arena.forEach(r => r.fill(0));
    player.score = 0;
    updateScoreUI();
    gameRunning = true;
    reset();
} //tokai teio cry

function backToMenu() {
    document.getElementById("gameover-panel").style.display = "none";
    document.getElementById("menu").style.display = "block";
    canvas.style.display = "none";
    document.getElementById("score-panel").style.display = "none";
    document.getElementById("logo-left").style.display = "none";
    document.getElementById("logo-right").style.display = "none";
    document.getElementById("NEXT").style.display = "none";
    gameRunning = false;
}

// ================= AUDIO =================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, dur) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur);
}

// ================= GAME DATA =================
const W = 10, H = 20;
const arena = Array.from({ length: H }, () => Array(W).fill(0));

const SHAPES = {
    I: [[1,1,1,1]],
    O: [[2,2],[2,2]],
    T: [[0,3,0],[3,3,3]],
    L: [[4,0,0],[4,4,4]],
    J: [[0,0,5],[5,5,5]]
};

const COLORS = [null,"cyan","yellow","purple","orange","blue"];

const player = {
    pos:{x:0,y:0},
    matrix:null,
    score:0,
    hold:null,
    canHold:true
};

let nextPiece = randomPiece();

// ================= HELPERS =================
function randomPiece(){
    const keys="IOTLJ";
    return SHAPES[keys[Math.random()*keys.length|0]];
}

function collide(arena,p){
    for(let y=0;y<p.matrix.length;y++)
        for(let x=0;x<p.matrix[y].length;x++)
            if(p.matrix[y][x] && arena[y+p.pos.y]?.[x+p.pos.x]!==0)
                return true;
    return false;
}

function merge(arena,p){
    p.matrix.forEach((r,y)=>r.forEach((v,x)=>{
        if(v) arena[y+p.pos.y][x+p.pos.x]=v;
    }));
}

function rotate(m){
    return m[0].map((_,i)=>m.map(r=>r[i]).reverse());
}

function getDangerLevel(){
    for(let y=0;y<H;y++)
        if(arena[y].some(v=>v!==0)) return y;
    return H;
}

// ================= DRAW =================
function drawBackground(){
    for(let y=0;y<H;y++)
        for(let x=0;x<W;x++){
            ctx.fillStyle=((x*y+Date.now()/500)%10>5)?"#222":"#111";
            ctx.fillRect(x,y,1,1);
        }
}

function drawMatrix(m, o, context = ctx) {
    m.forEach((r, y) => r.forEach((v, x) => {
        if (!v) return;
        context.fillStyle = COLORS[v];
        context.fillRect(x + o.x, y + o.y, 1, 1);
    }));
}

function drawLineFlash() {
    if (!flashTimer) return;

    ctx.save();
    ctx.globalAlpha = flashTimer / 10;
    ctx.fillStyle = "white";

    flashRows.forEach(y => {
        ctx.fillRect(0, y, W, 1);
    });

    ctx.restore();
    flashTimer--;
}


function drawNext() {
    nextCtx.clearRect(0, 0, 4, 4);
    drawMatrix(nextPiece, { x: 1, y: 1 }, nextCtx);
}

function draw(){
    drawBackground();
    drawMatrix(arena,{x:0,y:0});
    drawMatrix(player.matrix,player.pos);

    // 🔥 danger + glitch + glow logic
    const container = document.getElementById("game-container");
    const danger = getDangerLevel();

    container.classList.remove(
        "glitch","medium","high",
        "safe","warning","danger"
    );

    if (glitchEnabled) {
        if (danger < 6) {
            container.classList.add("glitch","high","danger");
        } else if (danger < 10) {
            container.classList.add("glitch","medium","warning");
        } else if (danger < 14) {
            container.classList.add("glitch","safe");
        } else {
            container.classList.add("safe");
        }
    }

    drawLineFlash(); // ← line clear effect
}

    // ===== GLITCH EFFECT ===== ///ini juga jangan di ubah, ntar rusak efek glitchnya😭/// ///chatgpt gw kena limit jadi gw dari jam 8-10 malem ngebenerin ini doang 😭////
    const container=document.getElementById("game-container");
    const danger=getDangerLevel();

    container.classList.remove("glitch","medium","high");

if (glitchEnabled) {
    if (danger < 6) container.classList.add("glitch","high");
    else if (danger < 10) container.classList.add("glitch","medium");
    else if (danger < 14) container.classList.add("glitch");
}


// ================= GAME LOGIC =================
function sweep() {
    let rows = 0;

    for (let y = H - 1; y >= 0; y--) {
        if (arena[y].every(v => v !== 0)) {
            arena.splice(y, 1);
            arena.unshift(Array(W).fill(0));
            rows++;
            y++;
        }
    }

    if (rows) {
        flashTimer = 10;
        player.score += rows * 100;
        updateScoreUI();
        playSound(400, 0.1);

        // 🎤 COMMENTARY LOGIC
        const comments = {
            1: "Nice! +100 🔹",
            2: "DOUBLE LINE! 🔥",
            3: "TRIPLE CLEAR!! 💥",
            4: "TETRIS!!! 👑🔥"
        };

        setCommentary(aiCommentary(rows, player.score));
    }
}


function reset(){
    player.matrix = nextPiece;
    nextPiece = randomPiece();
    drawNext();
    player.pos.y=0;
    player.pos.x=(W/2|0)-(player.matrix[0].length/2|0);
    player.canHold=true;

    if(collide(arena,player)){
        gameRunning=false;
        document.getElementById("final-score").textContent=player.score;
        document.getElementById("gameover-panel").style.display="flex";
        playSound(100,0.5);
    }
}

function drop(){
    player.pos.y++;
    if(collide(arena,player)){
        player.pos.y--;
        merge(arena,player);
        sweep();
        reset();
    }
}

function hold(){
    if(!player.canHold) return;
    const t=player.hold;
    player.hold=player.matrix;
    player.matrix=t||nextPiece;
    if(!t) nextPiece=randomPiece();
    player.pos.y=0;
    player.pos.x=3;
    player.canHold=false;
}

// ================= INPUT =================
document.addEventListener("keydown",e=>{
    if(!gameRunning) return;
    if(e.key==="ArrowLeft"){player.pos.x--;if(collide(arena,player))player.pos.x++;}
    if(e.key==="ArrowRight"){player.pos.x++;if(collide(arena,player))player.pos.x--;}
    if(e.key==="ArrowDown"){drop();playSound(200,0.05);}
    if(e.key==="ArrowUp"){
        const o=player.matrix;
        player.matrix=rotate(player.matrix);
        if(collide(arena,player)) player.matrix=o;
    }
    if(e.key==="c"||e.key==="C") hold();
});

// ================= LOOP =================
let last=0,acc=0,interval=500;
function update(t=0){
    if(!gameRunning){
        requestAnimationFrame(update);
        return;
    }
    acc+=t-last;
    last=t;
    if(acc>interval){
        drop();
        acc=0;
    }
    draw();
    requestAnimationFrame(update);
}

update();
drawLineFlash();
