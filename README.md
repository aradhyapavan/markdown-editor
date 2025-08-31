## 📝 Markdown Editor (Flask)

Free, online, no‑signup Markdown editor with live GitHub‑style preview, import/export (MD, raw HTML, styled HTML, PDF), KaTeX math, Mermaid diagrams, autosave, and dark/light themes.

### 🚀 Demo
- Hugging Face Space (Docker): https://huggingface.co/spaces/aradhyapavan/markdown-editor

### ✨ Features
- ✍️ EasyMDE toolbar with side‑by‑side editor and live preview
- 📥 Import Markdown or HTML files
- 📤 Export: Markdown (.md), HTML (raw), HTML (with styles), PDF (client‑side)
- 🧩 GitHub‑style rendering + 🔦 code highlighting (highlight.js)
- 🧮 KaTeX math and 🧜 Mermaid diagrams
- 🌗 Dark/Light themes, 📖 read mode, 💾 autosave, 🏷️ editable document title

### 🧰 Tech Stack
- 🐍 Backend: Flask (Python)
- 🎛️ Frontend: EasyMDE, marked, highlight.js, Bootstrap 5, Font Awesome, Primer CSS
- ➕ Extras: html2pdf.js, KaTeX, Mermaid, FileSaver

### 🗃️ Application File Structure
```text
📦 markdown-editor/
├─ 🐍 app.py                 # Flask app entrypoint (exposes `app`)
├─ 📜 requirements.txt       # Python dependencies
├─ 🐳 Dockerfile             # Container build for HF Spaces / local
├─ 🧩 templates/
│  └─ 📄 index.html          # Main HTML UI
├─ 🗂️ static/
│  ├─ 📜 main.js             # Editor, preview, export logic
│  ├─ 🎨 style.css           # Styles (dark/light, layout, theming)
│  └─ 🧷 favicon/
│     └─ 🧿 favicon.ico      # App favicon
└─ 📘 README.md              # Project README
```

### ⚙️ Clone & Run (Python)
Prereqs: Python 3.11+ recommended.

```bash
git clone https://github.com/aradhyapavan/markdown-editor.git
cd markdown-editor
python -m venv .venv
# Windows PowerShell
./.venv/Scripts/Activate.ps1
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

By default the app binds to 0.0.0.0 and uses PORT if provided, otherwise 7860.

- Local URL: http://127.0.0.1:7860
- Custom port: set `PORT=5000` (or any) before running.

### 🏭 Run with Gunicorn (production style)
```bash
pip install -r requirements.txt
gunicorn -w 2 -k gthread --threads 4 -b 0.0.0.0:${PORT:-7860} app:app
```

### 🐳 Docker (local)
```bash
docker build -t markdown-editor:latest .
docker run --rm -p 7860:7860 -e PORT=7860 markdown-editor:latest
```
Open http://127.0.0.1:7860

### ☁️ Deploy on Hugging Face Spaces (Docker runtime)
1. Ensure the repo includes `Dockerfile`, `app.py`, `requirements.txt`.
2. Create a new Space with Docker runtime.
3. Push this project to the Space. It will auto‑build and run on PORT (7860).
4. Live app will be available at your Space URL.

### 🔌 API Endpoints
- GET `/` → Index UI
- POST `/export/md` → Return Markdown file from JSON `{ markdown }`
- POST `/export/html?withStyles=1` → Return HTML (raw or wrapped)
- POST `/import/html` → Accept HTML file upload, return `{ html }`
- POST `/import/md` → Accept Markdown upload, return `{ markdown }`

### 📝 Notes
- PDF is generated client‑side with `html2pdf.js` for consistent rendering.
- Autosave uses the browser’s storage; works offline once loaded.

### 👤 Author
Built by Aradhya Pavan H S — https://github.com/aradhyapavan


