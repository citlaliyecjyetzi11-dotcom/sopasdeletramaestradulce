import React, { useEffect, useMemo, useRef, useState } from "react";

// --- Utilidades --- //
const ABC = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"; // Incluye Ñ para español

function randomLetter() {
  const idx = Math.floor(Math.random() * ABC.length);
  return ABC[idx];
}

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Direcciones permitidas (8)
const DIRS = [
  { dr: 1, dc: 0 }, // ↓
  { dr: -1, dc: 0 }, // ↑
  { dr: 0, dc: 1 }, // →
  { dr: 0, dc: -1 }, // ←
  { dr: 1, dc: 1 }, // ↘
  { dr: -1, dc: -1 }, // ↖
  { dr: 1, dc: -1 }, // ↙
  { dr: -1, dc: 1 }, // ↗
];

// Normaliza palabras (mayúsculas, sin tildes)
function normalizeWord(w) {
  return w
    .toUpperCase()
    .replaceAll("Á", "A")
    .replaceAll("É", "E")
    .replaceAll("Í", "I")
    .replaceAll("Ó", "O")
    .replaceAll("Ú", "U");
}

// Generador de sopa de letras
function generateGrid(words, size) {
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const placed = [];
  const normalized = words.map((w) => normalizeWord(w));

  // Ordenar por longitud descendente para facilitar colocación
  const order = normalized
    .map((w, i) => ({ w, original: words[i] }))
    .sort((a, b) => b.w.length - a.w.length);

  const maxAttempts = 5000;

  function canPlace(word, r, c, dir) {
    const { dr, dc } = dir;
    const endR = r + dr * (word.length - 1);
    const endC = c + dc * (word.length - 1);
    if (endR < 0 || endR >= size || endC < 0 || endC >= size) return false;
    for (let k = 0; k < word.length; k++) {
      const rr = r + dr * k;
      const cc = c + dc * k;
      const ch = grid[rr][cc];
      if (ch !== null && ch !== word[k]) return false;
    }
    return true;
  }

  function place(word, label) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
      if (canPlace(word, r, c, dir)) {
        for (let k = 0; k < word.length; k++) {
          const rr = r + dir.dr * k;
          const cc = c + dir.dc * k;
          grid[rr][cc] = word[k];
        }
        placed.push({ word, label, r, c, dir });
        return true;
      }
    }
    return false;
  }

  for (const item of order) {
    if (!place(item.w, item.original)) {
      // Si no cabe, aumentar tamaño recursivamente
      return generateGrid(words, size + 2);
    }
  }

  // Rellenar huecos
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) grid[r][c] = randomLetter();
    }
  }

  return { grid, placed };
}

// Convierte una selección de celdas en una secuencia {r,c}
function pathFromTo(start, end) {
  const dr = Math.sign(end.r - start.r);
  const dc = Math.sign(end.c - start.c);
  const len = Math.max(Math.abs(end.r - start.r), Math.abs(end.c - start.c)) + 1;
  const path = [];
  for (let k = 0; k < len; k++) {
    path.push({ r: start.r + dr * k, c: start.c + dc * k });
  }
  return { path, dr, dc };
}

function coordsEqual(a, b) {
  return a.r === b.r && a.c === b.c;
}

// --- Datos de juegos --- //
const PUZZLES = [
  {
    id: "ia-tecnologia",
    title: "IA y Tecnología (Palabras clave)",
    words: [
      "Algoritmo",
      "Automatización",
      "Aprendizaje",
      "Datos",
      "Conocimiento",
      "Educación",
      "Eficiencia",
      "Inteligencia",
      "Innovación",
      "Interacción",
      "Procesamiento",
      "Programación",
      "Robot",
      "Redes",
      "Tecnología",
      "Computadora",
      "Internet",
    ],
    size: 16,
  },
  {
    id: "biologia-celula",
    title: "Biología: La Célula",
    words: [
      "Membrana",
      "Citoplasma",
      "Nucleo",
      "Ribosoma",
      "Mitocondria",
      "Cloroplasto",
      "Organelo",
      "ADN",
      "Proteina",
      "Homeostasis",
      "Division",
      "Transporte",
    ],
    size: 14,
  },
  {
    id: "matematicas-funciones",
    title: "Matemáticas: Funciones",
    words: [
      "Dominio",
      "Rango",
      "Par",
      "Impar",
      "Lineal",
      "Cuadratica",
      "Exponencial",
      "Logaritmica",
      "Inversa",
      "Pendiente",
      "Intercepto",
    ],
    size: 14,
  },
  {
    id: "historia-independencia",
    title: "Historia: Independencia de México",
    words: [
      "Hidalgo",
      "Morelos",
      "Guerrero",
      "Iturbide",
      "Insurgentes",
      "Virreinato",
      "Grito",
      "Dolores",
      "Conspiracion",
      "Constitucion",
      "Trigarante",
    ],
    size: 14,
  },
];

// --- Componentes --- //
function Header({ currentTitle }) {
  return (
    <header className="w-full sticky top-0 z-20 backdrop-blur bg-white/70 border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Sopa de Letras · Bachillerato</h1>
        <div className="text-sm md:text-base text-gray-600">{currentTitle}</div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t mt-6">
      <div className="max-w-6xl mx-auto px-4 py-4 text-xs md:text-sm text-gray-500 flex flex-col md:flex-row gap-2 items-center justify-between">
        <div>
          Hecho con ❤️ para reforzar aprendizajes. Selecciona y arrastra para marcar palabras.
        </div>
        <div className="opacity-80">Consejo: Puedes invertir la selección (↕↔↘↗) y también cuenta.</div>
      </div>
    </footer>
  );
}

function WordList({ words, foundSet }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">Palabras</h3>
      <ul className="grid grid-cols-2 md:grid-cols-1 gap-1 text-sm">
        {words.map((w) => {
          const ok = foundSet.has(normalizeWord(w));
          return (
            <li
              key={w}
              className={`px-2 py-1 rounded-lg border ${
                ok ? "bg-green-50 border-green-300 line-through text-gray-500" : "bg-white"
              }`}
            >
              {w}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Controls({ onNew, onReveal, onClear, time, foundCount, total, onCopy }) {
  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button onClick={onNew} className="px-3 py-2 rounded-2xl shadow border bg-white hover:bg-gray-50 active:scale-[.98]">
        Nueva cuadrícula
      </button>
      <button onClick={onClear} className="px-3 py-2 rounded-2xl shadow border bg-white hover:bg-gray-50 active:scale-[.98]">
        Limpiar selección
      </button>
      <button onClick={onReveal} className="px-3 py-2 rounded-2xl shadow border bg-white hover:bg-gray-50 active:scale-[.98]">
        Revelar palabras
      </button>
      <button onClick={onCopy} className="px-3 py-2 rounded-2xl shadow border bg-white hover:bg-gray-50 active:scale-[.98]">
        Copiar como imagen
      </button>
      <div className="ml-auto flex items-center gap-3 text-sm text-gray-600">
        <span>⏱️ {mm}:{ss}</span>
        <span>✅ {foundCount}/{total}</span>
      </div>
    </div>
  );
}

function Grid({ grid, cellSize = 40, onSelectWord, foundPaths, previewPath, setPreviewPath }) {
  const [isDown, setIsDown] = useState(false);
  const [start, setStart] = useState(null); // {r,c}
  const [current, setCurrent] = useState(null);

  function handleDown(r, c) {
    setIsDown(true);
    const s = { r, c };
    setStart(s);
    setCurrent(s);
    setPreviewPath(pathFromTo(s, s).path);
  }
  function handleEnter(r, c) {
    if (!isDown || !start) return;
    const p = pathFromTo(start, { r, c }).path;
    setCurrent({ r, c });
    setPreviewPath(p);
  }
  function handleUp(r, c) {
    if (!start) return;
    const { path } = pathFromTo(start, { r, c });
    onSelectWord(path);
    setIsDown(false);
    setStart(null);
    setCurrent(null);
    setPreviewPath([]);
  }

  useEffect(() => {
    const onLeave = () => {
      setIsDown(false);
      setStart(null);
      setCurrent(null);
      setPreviewPath([]);
    };
    window.addEventListener("mouseup", onLeave);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mouseup", onLeave);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [setPreviewPath]);

  const size = grid.length;

  return (
    <div className="inline-block select-none">
      <div
        className="grid bg-white rounded-2xl shadow border overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
      >
        {grid.map((row, r) =>
          row.map((ch, c) => {
            const inPreview = previewPath?.some((p) => p.r === r && p.c === c);
            const inFound = foundPaths.some((fp) => fp.some((p) => p.r === r && p.c === c));
            return (
              <div
                key={`${r}-${c}`}
                onMouseDown={() => handleDown(r, c)}
                onMouseEnter={() => handleEnter(r, c)}
                onMouseUp={() => handleUp(r, c)}
                className={`w-[${cellSize}px] h-[${cellSize}px] flex items-center justify-center border border-gray-200 font-semibold text-lg cursor-pointer ${
                  inFound ? "bg-green-200/70" : inPreview ? "bg-blue-200/50" : "bg-white"
                }`}
              >
                {ch}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function useTimer(isRunning) {
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRunning]);
  return [time, setTime];
}

// Exportar imagen (canvas)
async function gridToPng(gridRef, filename = "sopa.png") {
  const node = gridRef.current;
  if (!node) return;
  const dpi = 2; // escala simple
  const rect = node.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  canvas.width = rect.width * dpi;
  canvas.height = rect.height * dpi;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpi, dpi);

  // Fondo
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, rect.width, rect.height);

  // Dibuja tabla leyendo DOM (simple, letras centradas)
  const cells = Array.from(node.querySelectorAll("div > div"));
  // fallback: si estructura cambia, buscar por border cells; pero aquí usamos grid directo
  const letters = node.querySelectorAll("div[style]") ? [] : [];

  // Mejor: recorrer hijos directos que son celdas de la grid
  const gridCells = Array.from(node.children[0].children);
  const size = Math.sqrt(gridCells.length);
  const cellW = gridCells[0].getBoundingClientRect().width;
  const cellH = gridCells[0].getBoundingClientRect().height;

  ctx.font = `${Math.floor(cellH * 0.55)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;

  for (let i = 0; i < gridCells.length; i++) {
    const col = i % size;
    const row = Math.floor(i / size);
    const cell = gridCells[i];
    const ch = cell.textContent.trim();

    // Fondo por clase
    const cls = cell.className;
    if (cls.includes("bg-green-200")) {
      ctx.fillStyle = "#bbf7d0";
      ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
    } else if (cls.includes("bg-blue-200")) {
      ctx.fillStyle = "#bfdbfe";
      ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
    }

    // Borde
    ctx.strokeRect(col * cellW, row * cellH, cellW, cellH);

    // Letra
    ctx.fillStyle = "#111827";
    ctx.fillText(ch, col * cellW + cellW / 2, row * cellH + cellH / 2);
  }

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export default function App() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = PUZZLES[puzzleIndex];

  // Generar grid memoizado por puzzle+seed
  const [seed, setSeed] = useState(1);
  const { grid, placed } = useMemo(() => {
    const g = generateGrid(puzzle.words.map(normalizeWord), puzzle.size);
    // Ajustar etiquetas correctas
    const labeled = g.placed.map((p, i) => ({ ...p, label: puzzle.words.find((w) => normalizeWord(w) === p.word) || p.word }));
    return { grid: g.grid, placed: labeled };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleIndex, seed]);

  const [found, setFound] = useState(new Set()); // palabras normalizadas
  const [foundPaths, setFoundPaths] = useState([]); // arrays de {r,c}
  const [previewPath, setPreviewPath] = useState([]);
  const [time, setTime] = useTimer(true);
  const gridRef = useRef(null);

  useEffect(() => {
    // Reset al cambiar puzzle o seed
    setFound(new Set());
    setFoundPaths([]);
    setPreviewPath([]);
    setTime(0);
  }, [puzzleIndex, seed, setTime]);

  function onSelectWord(path) {
    // Obtener letras y normalizar
    const letters = path.map(({ r, c }) => grid[r][c]).join("");
    const rev = letters.split("").reverse().join("");

    // Buscar coincidencia exacta con colocaciones
    const match = placed.find((pl) => pl.word === letters || pl.word === rev);
    if (match) {
      const key = match.word; // ya normalizada
      if (!found.has(key)) {
        const newSet = new Set(found);
        newSet.add(key);
        setFound(newSet);
        setFoundPaths((fp) => [...fp, path]);
      }
    }
  }

  function handleReveal() {
    // Marcar todas como encontradas
    const all = new Set(placed.map((p) => p.word));
    setFound(all);
    // Generar paths exactos de cada palabra
    const allPaths = placed.map(({ r, c, dir, word }) => {
      const path = [];
      for (let k = 0; k < word.length; k++) {
        path.push({ r: r + dir.dr * k, c: c + dir.dc * k });
      }
      return path;
    });
    setFoundPaths(allPaths);
  }

  const foundCount = found.size;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <Header currentTitle={puzzle.title} />

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="text-sm text-gray-700">Selecciona el tema:</label>
            <select
              value={puzzleIndex}
              onChange={(e) => setPuzzleIndex(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border shadow-sm bg-white"
            >
              {PUZZLES.map((p, i) => (
                <option key={p.id} value={i}>
                  {p.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="px-3 py-2 rounded-2xl shadow border bg-white hover:bg-gray-50 active:scale-[.98]"
              title="Reordenar letras"
            >
              Reordenar
            </button>
          </div>

          <div ref={gridRef} className="overflow-auto p-2 rounded-2xl bg-white shadow border inline-block">
            <Grid
              grid={grid}
              foundPaths={foundPaths}
              previewPath={previewPath}
              setPreviewPath={setPreviewPath}
              onSelectWord={onSelectWord}
            />
          </div>

          <div className="mt-4">
            <Controls
              onNew={() => setSeed((s) => s + 1)}
              onReveal={handleReveal}
              onClear={() => setPreviewPath([])}
              onCopy={() => gridToPng(gridRef, `${PUZZLES[puzzleIndex].id}.png`)}
              time={time}
              foundCount={foundCount}
              total={puzzle.words.length}
            />
          </div>
        </div>

        {/* Panel derecho */}
        <aside className="lg:col-span-1">
          <div className="sticky top-[76px] space-y-4">
            <div className="p-4 rounded-2xl border bg-white shadow-sm">
              <WordList words={puzzle.words} foundSet={found} />
            </div>

            <div className="p-4 rounded-2xl border bg-white shadow-sm text-sm leading-relaxed">
              <h3 className="font-semibold text-lg mb-2">Instrucciones</h3>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Elige un tema en el selector.</li>
                <li>Haz clic y arrastra en la cuadrícula para seleccionar letras en línea recta.</li>
                <li>Si coincide con una palabra, quedará resaltada en verde y se tachará en la lista.</li>
                <li>Usa “Reordenar” o “Nueva cuadrícula” para generar otra versión del mismo tema.</li>
                <li>“Revelar palabras” muestra todas las soluciones.</li>
                <li>“Copiar como imagen” descarga la cuadrícula para imprimir.</li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl border bg-white shadow-sm text-sm">
              <h3 className="font-semibold text-lg mb-2">Sugerencias didácticas</h3>
              <ul className="list-disc ml-5 space-y-1">
                <li>Usa el cronómetro para trabajar por equipos y promover aprendizaje colaborativo.</li>
                <li>Solicita que definan cada término encontrado (glosario rápido).</li>
                <li>Integra un reto: encuentra primero las palabras más largas.</li>
              </ul>
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
