from __future__ import annotations

import io
import os
from flask import Flask, render_template, request, send_file, jsonify

app = Flask(__name__)


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/export/md")
def export_md():
    content = request.json.get("markdown", "")
    buf = io.BytesIO(content.encode("utf-8"))
    return send_file(buf, as_attachment=True, download_name="document.md", mimetype="text/markdown")


@app.post("/export/html")
def export_html():
    html = request.json.get("html", "")
    with_styles = bool(request.args.get("withStyles", "1") not in ("0", "false", "False"))
    if with_styles:
        wrapped = f"""<!DOCTYPE html><html><head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css' rel='stylesheet'>
            <link href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' rel='stylesheet'>
            <link href='https://unpkg.com/@primer/css@21.0.7/dist/primer.css' rel='stylesheet'>
            <style> body{{padding:2rem}} </style>
            </head><body class='markdown-body'>{html}</body></html>"""
    else:
        wrapped = html

    buf = io.BytesIO(wrapped.encode("utf-8"))
    return send_file(buf, as_attachment=True, download_name="document.html", mimetype="text/html")


@app.post("/import/html")
def import_html():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file"}), 400
    text = file.read().decode("utf-8", errors="ignore")
    return jsonify({"html": text})


@app.post("/import/md")
def import_md():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file"}), 400
    text = file.read().decode("utf-8", errors="ignore")
    return jsonify({"markdown": text})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "7860"))
    host = os.environ.get("HOST", "0.0.0.0")
    app.run(host=host, port=port)
