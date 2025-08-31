
let easyMDE;
const previewEl = document.getElementById('preview');
const hljsTheme = document.getElementById('hljs-theme');
const docTitlePill = document.getElementById('doc-title-pill');


marked.setOptions({
  breaks: true,
  highlight: (code, lang) => {
    try { return hljs.highlight(code, {language: lang}).value; }
    catch { return hljs.highlightAuto(code).value; }
  }
});

function renderPreview(md) {
  const html = marked.parse(md || '');
  previewEl.innerHTML = `<div class="markdown-body container">${html}</div>`;
  
  try { if (window.renderMathInElement) renderMathInElement(previewEl, { delimiters: [
    {left: '$$', right: '$$', display: true},
    {left: '$', right: '$', display: false},
    {left: '\\(', right: '\\)', display: false},
    {left: '\\[', right: '\\]', display: true}
  ]}); } catch {}
  
  try {
    if (window.mermaid && !window.__MERMAID_INIT__) {
      window.__MERMAID_INIT__ = true;
      mermaid.initialize({ startOnLoad: false, theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default' });
    }
    const blocks = previewEl.querySelectorAll('pre code.language-mermaid, code.language-mermaid');
    blocks.forEach((node, i) => {
      const src = node.textContent.trim();
      const container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = src;
      const pre = node.closest('pre');
      if (pre) pre.replaceWith(container); else node.replaceWith(container);
    });
    if (window.mermaid && previewEl.querySelector('.mermaid')) mermaid.run({ querySelector: '.mermaid' });
  } catch {}
}

function getMarkdown() { return easyMDE ? easyMDE.value() : ''; }

function setupEditor() {
  easyMDE = new EasyMDE({
    element: document.getElementById('editor'),
    spellChecker: false,
  autosave: { enabled: true, uniqueId: 'md-editor-autosave', delay: 1000 },
    previewRender: (plainText) => marked.parse(plainText),
    toolbar: [
      { name: 'open', action: () => document.getElementById('btn-import-md').click(), className: 'fa fa-folder-open', title: 'Open Markdown file' },
      'undo', 'redo', '|',
      'bold', 'italic', 'heading-1', 'heading-2', 'heading-3', 'table', '|',
      { name: 'indent', action: (ed) => ed.codemirror.execCommand('indentMore'), className: 'fa fa-indent', title: 'Indent' },
      { name: 'outdent', action: (ed) => ed.codemirror.execCommand('indentLess'), className: 'fa fa-outdent', title: 'Outdent' },
      '|', 'unordered-list', 'ordered-list', '|', 'quote', 'code', 'horizontal-rule', '|', 'link', 'image', '|',
      'preview', 'side-by-side', 'fullscreen', '|',
      { name: 'clear', action: () => { easyMDE.value(''); renderPreview(''); }, className: 'fa fa-eraser', title: 'Clear' }
    ],
  });
  easyMDE.codemirror.on('change', () => renderPreview(getMarkdown()));

  
  const initial = getMarkdown();
  if (!initial || initial.trim() === '') {
    const sample = `# Welcome to Markdown Editor!\n\nThis page works like **StackEdit**. Edit on the left, preview on the right.\nIf you want to learn Markdown quickly, read and modify this document.\n\n# Files\n\nYour content is autosaved in your browser and works **offline**.\n\n## Create files and folders\nUse the Samples menu for starters or begin typing.\n\n## Switch to another file\nYou can paste any Markdown content here and it will render instantly.\n\n## Export a file\nUse the Export menu to save as Markdown, raw HTML, styled HTML, or PDF.\n\n# Synchronization\n\nThis demo does not connect to cloud storage, but you can copy/paste to any service.\n\n# Markdown extensions\n\n## Code blocks\n\n\`\`\`python\nprint('Hello, Markdown!')\n\`\`\`\n\n## Tables\n\n| Feature | Status |\n|---|---|\n| Autosave | ✅ |\n| Dark Mode | ✅ |\n| Export | ✅ |\n\n## Blockquotes\n\n> Tips: Use the toolbar to format text, add lists, tables, and more.\n\n## Mermaid diagrams\n\n\`\`\`mermaid\ngraph LR\nA[Write] --> B[Preview]\nB --> C{Export}\nC -->|PDF| D[Share]\nC -->|HTML| E[Publish]\n\`\`\`\n\n---\n\nHappy writing!`;
    easyMDE.value(sample);
  }
  renderPreview(getMarkdown());
}

function setupSplit() {
  if (window.Split) {
    Split(['#leftPane', '#rightPane'], { sizes: [50, 50], minSize: 280, gutterSize: 8, cursor: 'col-resize' });
  }
}


function pickFile(inputEl, cb) {
  inputEl.onchange = (e) => { const f = e.target.files[0]; if (f) cb(f); inputEl.value = ''; };
  inputEl.click();
}

function readFileText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsText(file);
  });
}


function bindActions() {
  // Theme toggle
  const themeBtn = document.getElementById('btn-theme');
  const setDark = (on) => {
    document.documentElement.classList.toggle('light', !on);
    document.documentElement.classList.toggle('dark', !!on);
    
    if (hljsTheme) {
      hljsTheme.href = on
        ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
        : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
    }
    try { localStorage.setItem('md-theme-dark', on ? '1' : '0'); } catch {}
  };
  try {
    const saved = localStorage.getItem('md-theme-dark');
    const initialDark = saved === null ? true : saved === '1';
    setDark(initialDark);
    const icon = themeBtn.querySelector('i');
    if (icon) icon.className = initialDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  } catch { setDark(true); }
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    const nowDark = !isDark;
    setDark(nowDark);
    const icon = themeBtn.querySelector('i');
    if (icon) icon.className = nowDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  });

  
  document.getElementById('btn-import-md').addEventListener('click', () => {
    pickFile(document.getElementById('file-md'), async (file) => {
      const text = await readFileText(file);
      easyMDE.value(text);
      renderPreview(text);
    });
  });

  
  document.getElementById('btn-import-html').addEventListener('click', () => {
    pickFile(document.getElementById('file-html'), async (file) => {
      const text = await readFileText(file);
      easyMDE.value(text);
      renderPreview(text);
    });
  });

  
  const samplesBtn = document.getElementById('btn-samples');
  const samplesModal = new bootstrap.Modal(document.getElementById('samplesModal'));
  samplesBtn.addEventListener('click', () => samplesModal.show());

  const samples = {
    cheatsheet: `# Markdown Cheat Sheet\n\n## Headings\n# H1\n## H2\n### H3\n\n## Emphasis\n*italic*  **bold**  ~~strike~~  \`code\`\n\n## Lists\n- unordered\n- list\n  - nested\n1. ordered\n2. list\n\n## Links & Images\n[OpenAI](https://openai.com)  \\n![Image](https://via.placeholder.com/200x80.png?text=Image)\n\n## Blockquote\n> A wise quote.\n\n## Table\n| Name | Role |\n|---|---|\n| Alice | Developer |\n| Bob | Designer |\n\n## Task List\n- [x] design\n- [ ] implement\n- [ ] test\n\n## Code Block\n\`\`\`python\nfrom math import sqrt\nprint(sqrt(9))\n\`\`\`\n\n---\n\n### Horizontal rule above`,
    email: `**Subject:** Request to Schedule Project Kickoff Meeting\n\nDear [Recipient Name],\n\nI hope you're doing well. I'd like to schedule a 30‑minute kickoff meeting to align on [Project/Topic].\n\n**Proposed agenda:**\n- Objectives and success criteria\n- Scope, timeline, and roles\n- Risks and dependencies\n- Next steps\n\n**Suggested times (IST):**\n- [Option 1, e.g., Tue 3:00–3:30 PM]\n- [Option 2, e.g., Wed 11:00–11:30 AM]\n\nIf these don't work, please share alternative slots and your preferred meeting platform.\n\nThanks in advance, and I look forward to our discussion.\n\nBest regards,\n\n[Your Full Name]\n[Your Role], [Your Company]\nPhone: [Your Phone]\nEmail: you@example.com\n\n---`,
    readme: `# Project Title\n\n[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)  ![Built with](https://img.shields.io/badge/Built%20with-Bootstrap%205-blue)\n\nA short description of your project.\n\n## Features\n- Awesome feature\n- Fast and reliable\n\n## Installation\n\`\`\`bash\npip install -r requirements.txt\npython app.py\n\`\`\`\n\n## Usage\nDescribe how to use it.\n\n## License\nMIT © You`,
    github_readme_pro: `# Awesome App\n\n[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)\n\n> One‑liner that explains what this project does.\n\n## Table of Contents\n- [Demo](#demo)\n- [Stack](#stack)\n- [Install](#install)\n- [Project Structure](#project-structure)\n- [CLI](#cli)\n- [Docs](#docs)\n\n## Demo\n![screenshot](https://via.placeholder.com/960x320.png?text=Screenshot)\n\n## Stack\n| Layer | Tech |\n|---|---|\n| Frontend | React / Vite |\n| Backend | FastAPI |\n| DB | PostgreSQL |\n| Infra | Docker / GH Actions |\n\n## Install\n\`\`\`bash\n git clone https://github.com/OWNER/REPO && cd REPO\n cp .env.example .env\n docker compose up -d --build\n\`\`\`\n\n## Project Structure\n\`\`\`text\nREPO/\n ├─ apps/\n │  ├─ api/\n │  └─ web/\n ├─ packages/\n │  ├─ ui/\n │  └─ config/\n └─ tools/\n    └─ scripts/\n\`\`\`\n\n## Docs\n### Data Flow (Mermaid)\n\`\`\`mermaid\ngraph TD\nA[Browser] --> B(Edge API)\nB --> C{Auth}\nC -->|pass| D[Service] --> E[(DB)]\nC -->|fail| F[401]\n\`\`\`\n\n## License\nMIT`,
    math_notes: `# KaTeX Quick Examples\n\nInline: $E=mc^2$, $\\int_0^1 x^2\\,dx = \\tfrac{1}{3}$.\n\nBlock:\n\n$$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$\n\nEuler integral for the gamma function:\n\n$$\\Gamma(z)=\\int_0^\\infty t^{z-1}e^{-t}\\,dt$$\n\n> Tip: See more syntax in the MathJax guide.`,
    api_docs: `# HTTP API\n\n> Version 1\n\n## Authentication\nUse a Bearer token in the Authorization header.\n\n## Endpoints\n### GET /v1/users\nReturns a paginated list of users.\n\n\`\`\`http\nGET /v1/users?page=1&pageSize=20\nAuthorization: Bearer <token>\n\`\`\`\n\nResponse:\n\`\`\`json\n{\n  "items": [{"id": 1, "name": "Ada"}],\n  "nextPage": 2\n}\n\`\`\`\n\n### Errors\n| Code | Meaning |\n|---|---|\n| 400 | Bad request |\n| 401 | Unauthorized |\n| 404 | Not found |`,
    meeting_notes: `# Meeting Notes\n\n**When**: 2025-08-28 14:00–14:45 IST  \n**Where**: Zoom  \n**Attendees**: Alex, Priya, Sam\n\n## Agenda\n1. Status updates\n2. Release checklist\n3. Risks\n\n## Decisions\n- Ship v1.2 on Monday\n- Freeze new features until post‑release\n\n## Action Items\n- [ ] Alex: finalize docs\n- [ ] Priya: run load tests\n- [ ] Sam: prepare rollout plan\n\n## Timeline\n\`\`\`mermaid\ngantt\n  title Release plan\n  dateFormat  YYYY-MM-DD\n  section Prep\n  Docs        :a1, 2025-08-28, 2d\n  Load tests  :a2, 2025-08-28, 2d\n  section Ship\n  Release     :milestone, 2025-08-30, 1d\n\`\`\``
  };

  document.querySelectorAll('[data-sample]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-sample');
      easyMDE.value(samples[key] || '');
      renderPreview(getMarkdown());
      samplesModal.hide();
    });
  });
  document.querySelectorAll('[data-sample-append]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-sample-append');
      const text = samples[key] || '';
      easyMDE.value((getMarkdown() + '\n\n' + text).trim());
      renderPreview(getMarkdown());
      samplesModal.hide();
    });
  });

  
  document.getElementById('btn-export-md').addEventListener('click', () => {
    const content = easyMDE.value();
    const filename = document.getElementById('doc-title-pill').textContent || 'document';
    const blob = new Blob([content], { type: 'text/markdown' });
    saveAs(blob, `${filename}.md`);
  });

  document.getElementById('btn-export-html').addEventListener('click', () => {
    const content = easyMDE.value();
    const html = marked.parse(content);
    const filename = document.getElementById('doc-title-pill').textContent || 'document';
    const blob = new Blob([html], { type: 'text/html' });
    saveAs(blob, `${filename}.html`);
  });

  document.getElementById('btn-export-html-styled').addEventListener('click', () => {
    const content = easyMDE.value();
    const html = marked.parse(content);
    const styledHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.getElementById('doc-title-pill').textContent || 'Document'}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@primer/css@21.0.7/dist/primer.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
    .markdown-body { color: #24292f; }
    .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { color: #24292f; margin-top: 1.5rem; }
    .markdown-body table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    .markdown-body th, .markdown-body td { border: 1px solid #d0d7de; padding: 0.5rem; text-align: left; }
    .markdown-body th { background-color: #f6f8fa; font-weight: 600; }
    .markdown-body tr:nth-child(even) td { background-color: #fafbfc; }
    .markdown-body pre { background-color: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 1rem; overflow-x: auto; }
    .markdown-body code { background-color: #f6f8fa; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
    .markdown-body blockquote { border-left: 4px solid #d0d7de; margin: 1rem 0; padding: 0 1rem; color: #6a737d; }
  </style>
</head>
<body>
  <div class="markdown-body">
    ${html}
  </div>
</body>
</html>`;
    const filename = document.getElementById('doc-title-pill').textContent || 'document';
    const blob = new Blob([styledHtml], { type: 'text/html' });
    saveAs(blob, `${filename}-styled.html`);
  });

  
  document.getElementById('btn-export-pdf').addEventListener('click', () => {
    const pdfOptionsModal = new bootstrap.Modal(document.getElementById('pdfOptionsModal'));
    pdfOptionsModal.show();
  });

  
  document.getElementById('btn-generate-pdf').addEventListener('click', () => {
    const orientation = document.querySelector('input[name="orientation"]:checked').value;
    const paperSize = document.getElementById('paperSize').value;
    
    
    const pdfOptionsModal = bootstrap.Modal.getInstance(document.getElementById('pdfOptionsModal'));
    pdfOptionsModal.hide();
    
    
    generatePDF(orientation, paperSize);
  });

  function generatePDF(orientation, paperSize, fullPage) {
    const content = easyMDE.value();
    const html = marked.parse(content);
    
    
    const pageBreakStyles = fullPage ? '' : `
      .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { 
        page-break-after: avoid; 
      }
      .markdown-body table { 
        page-break-inside: avoid; 
      }
      .markdown-body pre { 
        page-break-inside: avoid; 
      }
      .markdown-body hr { 
        page-break-after: avoid; 
      }`;
    
    
    const styledHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.getElementById('doc-title-pill').textContent || 'Document'}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@primer/css@21.0.7/dist/primer.css">
  <style>
    /* Force light theme for PDF */
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; 
      line-height: 1.6; 
      margin: 0; 
      padding: 1rem; 
      color: #24292f !important;
      background: #ffffff !important;
    }
    .markdown-body { 
      color: #24292f !important; 
      background: #ffffff !important;
    }
    .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { 
      color: #24292f !important; 
      margin-top: 1.5rem; 
      margin-bottom: 1rem;
    }
    .markdown-body p { 
      color: #24292f !important; 
      margin-bottom: 1rem;
    }
    .markdown-body ul, .markdown-body ol { 
      color: #24292f !important; 
      margin-bottom: 1rem;
    }
    .markdown-body li { 
      color: #24292f !important; 
      margin-bottom: 0.5rem;
    }
    .markdown-body table { 
      border-collapse: collapse; 
      width: 100%; 
      margin: 1rem 0; 
      background: #ffffff !important;
    }
    .markdown-body th, .markdown-body td { 
      border: 1px solid #d0d7de; 
      padding: 0.5rem; 
      text-align: left; 
      color: #24292f !important;
      background: #ffffff !important;
    }
    .markdown-body th { 
      background-color: #f6f8fa !important; 
      color: #24292f !important;
      font-weight: 600; 
    }
    .markdown-body tr:nth-child(even) td { 
      background-color: #fafbfc !important; 
      color: #24292f !important;
    }
    .markdown-body pre { 
      background-color: #f6f8fa !important; 
      border: 1px solid #d0d7de; 
      border-radius: 6px; 
      padding: 1rem; 
      overflow-x: auto; 
      color: #24292f !important;
    }
    .markdown-body code { 
      background-color: #f6f8fa !important; 
      padding: 0.2rem 0.4rem; 
      border-radius: 3px; 
      font-size: 0.9em; 
      color: #24292f !important;
    }
    .markdown-body blockquote { 
      border-left: 4px solid #d0d7de; 
      margin: 1rem 0; 
      padding: 0 1rem; 
      color: #6a737d !important; 
      background-color: #f6f8fa !important;
    }
    .markdown-body img { 
      max-width: 100%; 
      height: auto; 
      border: 1px solid #d0d7de;
    }
    .markdown-body a { 
      color: #0969da !important; 
      text-decoration: none;
    }
    .markdown-body a:hover { 
      text-decoration: underline; 
    }
    .markdown-body hr { 
      border: 0; 
      border-top: 1px solid #d0d7de; 
      margin: 1.5rem 0; 
    }
    /* Override any dark theme styles */
    * { color: inherit !important; }
    ${pageBreakStyles}
  </style>
</head>
<body>
  <div class="markdown-body">
    ${html}
  </div>
</body>
</html>`;

    const filename = document.getElementById('doc-title-pill').textContent || 'document';
    
    if (fullPage) {
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = styledHtml;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.background = '#ffffff';
      tempDiv.style.padding = '20px';
      tempDiv.style.overflow = 'visible';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      document.body.appendChild(tempDiv);
      
      
      setTimeout(() => {
        const contentHeight = Math.max(tempDiv.scrollHeight, tempDiv.offsetHeight);
        console.log('Content height:', contentHeight); 
        
        
        document.body.removeChild(tempDiv);
        
        
        const opt = {
          margin: [0, 0, 0, 0], 
          filename: `${filename}-fullpage.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 1, 
            useCORS: true,
            letterRendering: true,
            backgroundColor: '#ffffff',
            width: 800,
            height: contentHeight,
            scrollY: 0,
            scrollX: 0,
            allowTaint: true,
            foreignObjectRendering: true
          },
          jsPDF: { 
            unit: 'px', 
            format: [800, contentHeight + 40], 
            orientation: 'portrait',
            compress: true
          }
        };
        
        
        html2pdf().from(styledHtml).set(opt).save();
      }, 300); 
    } else {
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: paperSize, 
          orientation: orientation 
        }
      };

      html2pdf().from(styledHtml).set(opt).save();
    }
  }

  
  const readBtn = document.getElementById('btn-readmode');
  if (readBtn) {
    let readMode = false;
    readBtn.addEventListener('click', () => {
      readMode = !readMode;
      document.body.classList.toggle('read-mode', readMode);
      const icon = readBtn.querySelector('i');
      if (icon) icon.className = readMode ? 'fa-solid fa-book' : 'fa-solid fa-book-open';
      readBtn.textContent = readMode ? ' Exit read mode' : ' Read mode';
      readBtn.prepend(icon);
    });
  }

  
  if (docTitlePill) {
    const savedTitle = localStorage.getItem('md-doc-title') || 'Welcome file';
    docTitlePill.textContent = savedTitle;
    docTitlePill.addEventListener('input', () => {
      const v = (docTitlePill.textContent || '').trim() || 'Untitled';
      localStorage.setItem('md-doc-title', v);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  
  const ensureCss = (href) => { if (!document.querySelector(`link[href="${href}"]`)) { const l=document.createElement('link'); l.rel='stylesheet'; l.href=href; document.head.appendChild(l);} };
  const ensureScript = (src, cb) => { if (document.querySelector(`script[src="${src}"]`)) { cb && cb(); return; } const s=document.createElement('script'); s.src=src; s.defer=true; s.onload=() => cb && cb(); document.body.appendChild(s); };
  
  ensureCss('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css');
  ensureScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js', () => {
    ensureScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js', () => {
      try { renderPreview(getMarkdown()); } catch {}
    });
  });
  
  ensureScript('https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js', () => { try { renderPreview(getMarkdown()); } catch {} });
  setupEditor();
  setupSplit();
  bindActions();
  
  const aboutBtn = document.getElementById('btn-about');
  if (aboutBtn) {
    const aboutEl = document.getElementById('aboutModal');
    const aboutModal = new bootstrap.Modal(aboutEl);
    aboutBtn.addEventListener('click', () => aboutModal.show());
    
    aboutEl.addEventListener('hidden.bs.modal', () => {
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
      
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    });
  }
});
