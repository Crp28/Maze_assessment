import React, { useEffect, useRef, useState } from "react";

// =============================================================
// Constants & Config
// =============================================================

const CELL_SIZE = 32; // visual cell size
const DIRECTIONS = [
  { dx: 0, dy: -1, dir: "N" as const },
  { dx: 1, dy: 0, dir: "E" as const },
  { dx: 0, dy: 1, dir: "S" as const },
  { dx: -1, dy: 0, dir: "W" as const },
];

// Pastel colors for A/B/C/D tokens
const TOKEN_COLORS = ["#f28b82", "#aecbfa", "#ccff90", "#fff475"];
const WALL_COLOR = "#555"; // medium grey
const TOKEN_SIZE = Math.floor(CELL_SIZE * 0.45); // smaller than player (~0.66*CELL_SIZE)

// ==== TIMER CONFIG (summative control) ====
// Change this to adjust per-question time (seconds). Requirement: 50s per question.
const QUESTION_TIME_LIMIT = 50;

// =============================================================
// UI Translations (non-question content only)
// =============================================================
const UI_STR: Record<string, Record<string, string>> = {
  en: {
    languageLabel: "Language",
    sizeLabel: "Size",
    speakAria: "Read question and answers",
    instruction:
      "Use W/A/S/D or arrows to move. Press F to choose an answer. Press F again to confirm.",
    timeLeft: "Time left:",
    finishedTitle: "All questions completed",
    restart: "Restart",
    answerWord: "Answer",
    confirmSuffix: " selected — press F again to confirm.",
  },
  "zh-CN": {
    languageLabel: "语言",
    sizeLabel: "大小",
    speakAria: "朗读题目与选项",
    instruction: "使用 W/A/S/D 或方向键移动。按 F 选择答案，再按一次 F 确认。",
    timeLeft: "剩余时间：",
    finishedTitle: "全部题目已完成",
    restart: "重新开始",
    answerWord: "答案",
    confirmSuffix: " 已选择——再次按 F 确认。",
  },
  "zh-TW": {
    languageLabel: "語言",
    sizeLabel: "大小",
    speakAria: "朗讀題目與選項",
    instruction: "使用 W/A/S/D 或方向鍵移動。按 F 選擇答案，再按一次 F 確認。",
    timeLeft: "剩餘時間：",
    finishedTitle: "全部題目已完成",
    restart: "重新開始",
    answerWord: "答案",
    confirmSuffix: " 已選擇——再次按 F 確認。",
  },
  es: {
    languageLabel: "Idioma",
    sizeLabel: "Tamaño",
    speakAria: "Leer pregunta y respuestas",
    instruction:
      "Usa W/A/S/D o flechas para moverte. Pulsa F para elegir; pulsa F otra vez para confirmar.",
    timeLeft: "Tiempo restante:",
    finishedTitle: "Todas las preguntas completadas",
    restart: "Reiniciar",
    answerWord: "Respuesta",
    confirmSuffix: " seleccionada — pulsa F otra vez para confirmar.",
  },
  fr: {
    languageLabel: "Langue",
    sizeLabel: "Taille",
    speakAria: "Lire la question et les réponses",
    instruction:
      "Utilisez W/A/S/D ou les flèches pour vous déplacer. Appuyez sur F pour choisir, puis encore F pour confirmer.",
    timeLeft: "Temps restant :",
    finishedTitle: "Toutes les questions terminées",
    restart: "Recommencer",
    answerWord: "Réponse",
    confirmSuffix: " sélectionnée — appuyez encore sur F pour confirmer.",
  },
};

// =============================================================
// Question Bank (no LaTeX backslashes)
// =============================================================
const sampleQuestions = [
  {
    text: "Solve for x: 2x^2 - 5x - 3 = 0",
    options: ["x = 3, x = -½", "x = -3, x = ½", "x = 1, x = -3", "x = -1, x = 3"],
    correctIndex: 0,
  },
  { text: "Simplify: (x^3)(x^4)", options: ["x^12", "x^7", "x^1", "x^8"], correctIndex: 1 },
  {
    text: "Factor completely: x^2 - 5x + 6",
    options: ["(x-2)(x-3)", "(x+2)(x+3)", "(x-1)(x-6)", "Prime"],
    correctIndex: 0,
  },
  { text: "Solve for x: 3^x = 27", options: ["x = 2", "x = 3", "x = 4", "x = 1"], correctIndex: 1 },
  {
    text: "Evaluate: f(g(x)) for f(x)=2x+1, g(x)=x^2 at x=3",
    options: ["19", "21", "25", "28"],
    correctIndex: 2,
  },
  { text: "Domain of f(x) = 1/(x-4)", options: ["x ≠ 4", "x > 4", "x < 4", "all real x"], correctIndex: 0 },
  {
    text: "Simplify: (2x^2 y) / (4x y^2)",
    options: ["x/(2y)", "x/(2y^2)", "x^2/(2y)", "y/(2x)"],
    correctIndex: 0,
  },
  { text: "Solve for x: log_2(x) = 5", options: ["x = 10", "x = 25", "x = 32", "x = 64"], correctIndex: 2 },
  { text: "Amplitude of y = 3 sin(x)", options: ["1", "3", "2", "6"], correctIndex: 1 },
  { text: "Period of y = cos(2x)", options: ["2π", "π", "π/2", "4π"], correctIndex: 1 },
  {
    text: "Vertical asymptote of y = 2/(x+1)",
    options: ["x = -2", "x = 2", "x = -1", "y = 2"],
    correctIndex: 2,
  },
  {
    text: "Solve for x: |2x - 5| = 7",
    options: ["x = 6, x = -1", "x = 1, x = -6", "x = -1, x = 6", "x = -6, x = 1"],
    correctIndex: 2,
  },
  {
    text: "Sum of first 4 terms of arithmetic seq. a1=4, d=3",
    options: ["34", "28", "40", "46"],
    correctIndex: 0,
  },
  { text: "Rewrite in exponential form: ln(x) = 2", options: ["x = e^2", "x = 2e", "x = 2^e", "x = e"], correctIndex: 0 },
  {
    text: "Solve for x: tan(x) = 0 on [0, 2π)",
    options: ["x = 0, π, 2π", "x = π/2, 3π/2", "x = π/4, 5π/4", "x = π/3, 4π/3"],
    correctIndex: 0,
  },
];

// =============================================================
// MazeGame Component
// =============================================================
const MazeGame: React.FC = () => {
  // Accessibility states
  const [language, setLanguage] = useState<string>("en");
  const [scale, setScale] = useState<number>(1);

  const t = (k: string) => (UI_STR[language] && UI_STR[language][k]) || UI_STR.en[k] || k;

  // Speech synthesis for questions/answers
  const speakQA = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Game state
  const [maze, setMaze] = useState<any[][]>([]);
  const [player, setPlayer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [config] = useState<{ size: number }>({ size: 15 });
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [pendingChoice, setPendingChoice] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<number>(QUESTION_TIME_LIMIT);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ------------------------------------------------------------
  // Maze generation: Prim-style
  // ------------------------------------------------------------
  const generateMazePrim = (width: number, height: number) => {
    const grid = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => ({
        walls: { N: true, E: true, S: true, W: true },
        visited: false,
        tokenIndex: null as number | null,
      }))
    );

    const inBounds = (x: number, y: number) => x >= 0 && x < width && y >= 0 && y < height;
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height / 2);

    const frontier: { x: number; y: number }[] = [{ x: startX, y: startY }];
    grid[startY][startX].visited = true;

    while (frontier.length > 0) {
      const idx = Math.floor(Math.random() * frontier.length);
      const { x, y } = frontier[idx];

      const neighbors: { x: number; y: number; dir: "N" | "E" | "S" | "W" }[] = [];
      for (const { dx, dy, dir } of DIRECTIONS) {
        const nx = x + dx,
          ny = y + dy;
        if (inBounds(nx, ny) && !grid[ny][nx].visited) {
          neighbors.push({ x: nx, y: ny, dir });
        }
      }

      if (neighbors.length > 0) {
        const n = neighbors[Math.floor(Math.random() * neighbors.length)];
        // Carve passage
        grid[y][x].walls[n.dir] = false;
        const opposite: Record<typeof n.dir, "N" | "E" | "S" | "W"> = { N: "S", E: "W", S: "N", W: "E" } as const;
        grid[n.y][n.x].walls[opposite[n.dir]] = false;
        grid[n.y][n.x].visited = true;
        frontier.push({ x: n.x, y: n.y });
      } else {
        frontier.splice(idx, 1);
      }
    }

    return grid;
  };

  // ------------------------------------------------------------
  // Fair token placement (equal-ish path length, early divergence, angular spread)
  // ------------------------------------------------------------
  const walkableNeighbors = (grid: any[][], x: number, y: number) => {
    const res: { x: number; y: number; dir: string }[] = [];
    const cell = grid[y][x];
    if (!cell) return res;
    if (!cell.walls.N) res.push({ x, y: y - 1, dir: "N" });
    if (!cell.walls.E) res.push({ x: x + 1, y, dir: "E" });
    if (!cell.walls.S) res.push({ x, y: y + 1, dir: "S" });
    if (!cell.walls.W) res.push({ x: x - 1, y, dir: "W" });
    return res;
  };

  const bfsFromStart = (grid: any[][], sx: number, sy: number) => {
    const h = grid.length,
      w = grid[0].length;
    const dist = Array.from({ length: h }, () => Array(w).fill(Infinity));
    const parent = Array.from({ length: h }, () => Array(w).fill(null));
    const q: { x: number; y: number }[] = [];
    dist[sy][sx] = 0;
    q.push({ x: sx, y: sy });
    while (q.length) {
      const { x, y } = q.shift()!;
      for (const nb of walkableNeighbors(grid, x, y)) {
        if (dist[nb.y][nb.x] === Infinity) {
          dist[nb.y][nb.x] = dist[y][x] + 1;
          parent[nb.y][nb.x] = { x, y };
          q.push({ x: nb.x, y: nb.y });
        }
      }
    }
    return { dist, parent } as const;
  };

  const reconstructPath = (parent: any[][], gx: number, gy: number) => {
    const path: { x: number; y: number }[] = [];
    let cur: { x: number; y: number } | null = { x: gx, y: gy };
    while (cur) {
      path.push(cur);
      const p: { x: number; y: number } | null = parent[cur.y][cur.x];
      cur = p;
    }
    path.reverse();
    return path;
  };

  const pathSignature = (parent: any[][], gx: number, gy: number, K = 2) => {
    const p = reconstructPath(parent, gx, gy);
    return p.slice(0, Math.min(p.length, K + 1)).map((n) => `${n.x},${n.y}`);
  };

  const angleFromCenter = (cx: number, cy: number, x: number, y: number) => Math.atan2(y - cy, x - cx);
  const prefixOverlap = (sigA: string[], sigB: string[]) => {
    const L = Math.min(sigA.length, sigB.length);
    let same = 0;
    for (let i = 0; i < L; i++) if (sigA[i] === sigB[i]) same++;
    return same;
  };

  const placeFairTokens = (
    grid: any[][],
    options: string[],
    sx: number,
    sy: number,
    {
      distanceBand = 2,
      prefixMaxOverlap = 2,
      minAngleSeparation = Math.PI / 8,
    }: { distanceBand?: number; prefixMaxOverlap?: number; minAngleSeparation?: number } = {}
  ) => {
    const h = grid.length,
      w = grid[0].length;
    const { dist, parent } = bfsFromStart(grid, sx, sy);

    const cells: { x: number; y: number; d: number; ang: number; sig?: string[] }[] = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (dist[y][x] !== Infinity) {
          cells.push({ x, y, d: dist[y][x], ang: angleFromCenter(sx, sy, x, y) });
        }
      }
    }
    if (!cells.length) return null;

    const ds = cells.map((c) => c.d).sort((a, b) => a - b);
    const target = ds[Math.floor(ds.length * 0.8)] || ds[ds.length - 1];
    const band = cells.filter((c) => Math.abs(c.d - target) <= 1);

    // shuffle
    for (let i = band.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [band[i], band[j]] = [band[j], band[i]];
    }

    const picks: { x: number; y: number; d: number; ang: number; sig: string[] }[] = [];
    const angleTooClose = (a: number, b: number) => {
      let diff = Math.abs(a - b);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      return diff < minAngleSeparation;
    };

    for (const c of band) {
      if (picks.length === options.length) break;
      const distances = picks.map((p) => p.d).concat(c.d);
      const maxD = Math.max(...distances);
      const minD = Math.min(...distances);
      if (maxD - minD > distanceBand) continue;
      const sigC = pathSignature(parent, c.x, c.y, 2);
      const diverges = picks.every((p) => prefixOverlap(sigC, p.sig) <= prefixMaxOverlap);
      if (!diverges) continue;
      const angleOk = picks.every((p) => !angleTooClose(c.ang, p.ang));
      if (!angleOk) continue;
      picks.push({ ...c, sig: sigC });
    }

    if (picks.length < options.length) return null;
    picks.forEach((p, idx) => {
      grid[p.y][p.x].tokenIndex = idx; // 0..n-1 ⇒ A,B,C,D
    });
    return picks;
  };

  // ------------------------------------------------------------
  // Drawing (canvas)
  // ------------------------------------------------------------
  const drawMaze = () => {
    const ctx = canvasRef.current!.getContext("2d")!;
    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, config.size * CELL_SIZE, config.size * CELL_SIZE);

    // Walls as pixel-aligned strokes for crisp corners
    ctx.lineWidth = 3;
    ctx.strokeStyle = WALL_COLOR;
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.beginPath();
      ctx.moveTo(x1 + 0.5, y1 + 0.5);
      ctx.lineTo(x2 + 0.5, y2 + 0.5);
      ctx.stroke();
    };

    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;
        if (cell.walls.N) drawLine(px, py, px + CELL_SIZE, py);
        if (cell.walls.E) drawLine(px + CELL_SIZE, py, px + CELL_SIZE, py + CELL_SIZE);
        if (cell.walls.S) drawLine(px, py + CELL_SIZE, px + CELL_SIZE, py + CELL_SIZE);
        if (cell.walls.W) drawLine(px, py, px, py + CELL_SIZE);
      });
    });

    // Tokens under player
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.tokenIndex !== null) {
          const px = x * CELL_SIZE;
          const py = y * CELL_SIZE;
          const size = TOKEN_SIZE;
          const pad = (CELL_SIZE - size) / 2;
          ctx.fillStyle = TOKEN_COLORS[cell.tokenIndex % TOKEN_COLORS.length];
          ctx.fillRect(px + pad, py + pad, size, size);
          const label = String.fromCharCode(65 + cell.tokenIndex);
          ctx.font = "bold 12px sans-serif";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#202124";
          const tw = ctx.measureText(label).width;
          const tx = px + pad + (size - tw) / 2;
          const ty = py + pad + (size - 12) / 2; // approx vertical centering for 12px font
          ctx.fillText(label, tx, ty);
        }
      });
    });

    // Player
    ctx.fillStyle = "#34a853";
    ctx.beginPath();
    ctx.arc(
      player.x * CELL_SIZE + CELL_SIZE / 2,
      player.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Overlay token on top of player if overlapping (same tile, not pushed away)
    const over = maze[player.y]?.[player.x];
    if (over && over.tokenIndex !== null) {
      const px = player.x * CELL_SIZE;
      const py = player.y * CELL_SIZE;
      const size = TOKEN_SIZE;
      const pad = (CELL_SIZE - size) / 2;
      ctx.fillStyle = TOKEN_COLORS[over.tokenIndex % TOKEN_COLORS.length];
      ctx.fillRect(px + pad, py + pad, size, size);
      const label = String.fromCharCode(65 + over.tokenIndex);
      ctx.font = "bold 12px sans-serif";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#202124";
      const tw = ctx.measureText(label).width;
      const tx = px + pad + (size - tw) / 2;
      const ty = py + pad + (size - 12) / 2;
      ctx.fillText(label, tx, ty);
    }
  };

  // ------------------------------------------------------------
  // Movement & Input
  // ------------------------------------------------------------
  const movePlayer = (dx: number, dy: number) => {
    if (finished) return;
    const { x, y } = player;
    const cell = maze[y][x];
    const dir = DIRECTIONS.find((d) => d.dx === dx && d.dy === dy)?.dir;
    if (!dir || cell.walls[dir!]) return;
    const nx = x + dx;
    const ny = y + dy;
    if (ny >= 0 && ny < maze.length && nx >= 0 && nx < maze[0].length) {
      setPlayer({ x: nx, y: ny });
      // Cancel pending confirmation when leaving the chosen token tile
      if (pendingChoice !== null) {
        const stillOnSameToken = maze[ny][nx]?.tokenIndex === pendingChoice;
        if (!stillOnSameToken) setPendingChoice(null);
      }
    }
  };

  const submitIfOnToken = () => {
    if (finished) return;
    const { x, y } = player;
    const cell = maze[y][x];
    if (!cell) return;
    const tokenHere = cell.tokenIndex as number | null;
    if (tokenHere === null || tokenHere === undefined) return;

    // Two-step confirm: first F selects, second F confirms
    if (pendingChoice === tokenHere) {
      const chosen = tokenHere;
      const q = sampleQuestions[qIndex];
      if (chosen === q.correctIndex) setScore((s) => s + 1);
      setPendingChoice(null);
      // clear timer for this question
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const nextIndex = qIndex + 1;
      if (nextIndex >= sampleQuestions.length) {
        setFinished(true);
      } else {
        setQIndex(nextIndex);
      }
    } else {
      setPendingChoice(tokenHere);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          movePlayer(0, -1);
          break;
        case "arrowdown":
        case "s":
          movePlayer(0, 1);
          break;
        case "arrowleft":
        case "a":
          movePlayer(-1, 0);
          break;
        case "arrowright":
        case "d":
          movePlayer(1, 0);
          break;
        case "f":
          submitIfOnToken();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [maze, player, qIndex, finished, pendingChoice]);

  // ------------------------------------------------------------
  // Generation per question + redraw
  // ------------------------------------------------------------
  useEffect(() => {
    if (finished) return;
    const mid = Math.floor(config.size / 2);

    let grid: any[][] | null = null;
    for (let attempts = 0; attempts < 25; attempts++) {
      const m = generateMazePrim(config.size, config.size);
      for (let yy = 0; yy < m.length; yy++) {
        for (let xx = 0; xx < m[0].length; xx++) m[yy][xx].tokenIndex = null;
      }
      const placed = placeFairTokens(m, sampleQuestions[qIndex].options, mid, mid, {
        distanceBand: 2,
        prefixMaxOverlap: 2,
        minAngleSeparation: Math.PI / 8,
      });
      if (placed) {
        grid = m;
        break;
      }
    }
    if (!grid) grid = generateMazePrim(config.size, config.size);

    setMaze(grid);
    setPlayer({ x: mid, y: mid });
    setPendingChoice(null);
    setTimerRemaining(QUESTION_TIME_LIMIT); // reset timer visual
  }, [config, qIndex, finished]);

  useEffect(() => {
    if (maze.length) drawMaze();
  }, [maze, player]);

  // Timer effect: counts down; timeout advances as incorrect
  useEffect(() => {
    if (finished) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRemaining(QUESTION_TIME_LIMIT);
    timerRef.current = window.setInterval(() => {
      setTimerRemaining((t) => {
        if (t <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setPendingChoice(null);
          const next = qIndex + 1;
          if (next >= sampleQuestions.length) setFinished(true);
          else setQIndex(next);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [qIndex, finished]);

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  const q = sampleQuestions[qIndex] || sampleQuestions[sampleQuestions.length - 1];

  return (
    <div
      className="min-h-screen bg-white text-gray-900 p-6"
      style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
    >
      {/* Fixed-width content row to keep sidebar tight to maze */}
      <div className="flex items-start gap-6">
        {/* LEFT COLUMN: fixed to canvas width so sidebar stays adjacent */}
        <div style={{ width: `${config.size * CELL_SIZE}px` }} className="space-y-3">
          {/* Question row with speaker to its right */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{finished ? t("finishedTitle") : q.text}</h2>
            {!finished && (
              <button
                aria-label={t("speakAria")}
                title={t("speakAria")}
                className="text-2xl leading-none"
                onClick={() =>
                  speakQA(
                    `${q.text}. ${q.options
                      .map((opt, i) => `${String.fromCharCode(65 + i)}: ${opt}`)
                      .join(". ")}`
                  )
                }
              >
                🔊
              </button>
            )}
          </div>

          {/* Answers list under the question, limited to canvas width */}
          {!finished && (
            <div
              className="inline-grid grid-cols-2 gap-x-8 gap-y-2 text-sm"
              style={{ maxWidth: `${config.size * CELL_SIZE}px` }}
            >
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded font-bold"
                    style={{
                      background: TOKEN_COLORS[i % TOKEN_COLORS.length],
                      color: "#202124",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-gray-900">{opt}</span>
                </div>
              ))}
            </div>
          )}

          <div className="inline-block rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white">
            <canvas ref={canvasRef} width={config.size * CELL_SIZE} height={config.size * CELL_SIZE} />
          </div>
          <div className="text-sm text-gray-700">{t("instruction")}</div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-4" style={{ width: 320 }}>
          {/* Controls panel above timer */}
          <div className="flex items-center flex-wrap gap-3">
            <label className="text-sm text-gray-700">
              {t("languageLabel")}:
              <select
                className="ml-2 border px-2 py-1 rounded text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="zh-CN">中文 (简体)</option>
                <option value="zh-TW">中文 (繁體)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </label>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">{t("sizeLabel")}:</span>
              <button className="px-2 border rounded" onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}>
                -
              </button>
              <span className="min-w-12 text-center">{Math.round(scale * 100)}%</span>
              <button className="px-2 border rounded" onClick={() => setScale((s) => Math.min(2, s + 0.1))}>
                +
              </button>
            </div>
          </div>

          {/* Timer & confirmation */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-black">
              <span>{t("timeLeft")} </span>
              <span className="inline-block min-w-10 px-2 py-1 rounded border border-gray-300 text-center">
                {timerRemaining}s
              </span>
            </div>
            {pendingChoice !== null && (
              <div className="text-sm font-semibold text-black">
                <span>{t("answerWord")} </span>
                <span
                  className="inline-flex items-center justify-center px-2 rounded border border-black"
                  style={{ color: TOKEN_COLORS[pendingChoice] }}
                >
                  {String.fromCharCode(65 + pendingChoice)}
                </span>
                <span>{t("confirmSuffix")}</span>
              </div>
            )}
          </div>

          {finished && (
            <div className="space-y-2">
              <p className="text-green-700 font-semibold">
                {t("finishedTitle")} — {score} / {sampleQuestions.length}
              </p>
              <button
                className="px-3 py-1 border rounded"
                onClick={() => {
                  setQIndex(0);
                  setScore(0);
                  setFinished(false);
                }}
              >
                {t("restart")}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default MazeGame;

// =============================================================
// Lightweight runtime checks (dev-only) — not unit tests but sanity checks
// =============================================================
if (typeof window !== "undefined") {
  // "Test cases" to ensure critical assumptions
  console.assert(
    Array.isArray(sampleQuestions) && sampleQuestions.length === 15,
    "Question bank should have 15 items"
  );
  console.assert(TOKEN_COLORS.length === 4, "There should be 4 token colors for A/B/C/D");
  console.assert(
    Number.isInteger(QUESTION_TIME_LIMIT) && QUESTION_TIME_LIMIT > 0,
    "Timer must be a positive integer in seconds"
  );
}
