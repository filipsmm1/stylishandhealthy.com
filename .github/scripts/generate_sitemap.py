from pathlib import Path
from datetime import datetime, timezone
from xml.sax.saxutils import escape
from xml.etree import ElementTree
import subprocess

SITE_URL = "https://stylishandhealthy.com"
STRIP_HTML = True  # change to False if your real URLs use .html

ROOT = Path(".")
EXCLUDE_DIRS = {
    ".git", ".github", "node_modules", "assets", "images", "img",
    "css", "js", "fonts"
}
EXCLUDE_FILES = {
    # Compatibility redirect; the canonical article lives at /blog/introduction.
    "introduction.html",
}

def committed_sitemap_lastmods() -> dict[str, str]:
    """Keep reliable existing dates when a shallow checkout lacks file history."""
    try:
        raw = subprocess.check_output(
            ["git", "show", "HEAD:sitemap.xml"],
            text=True,
            encoding="utf-8",
        )
    except Exception:
        sitemap = ROOT / "sitemap.xml"
        raw = sitemap.read_text(encoding="utf-8") if sitemap.exists() else ""

    if not raw.strip():
        return {}

    try:
        document = ElementTree.fromstring(raw)
    except ElementTree.ParseError:
        return {}

    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    dates: dict[str, str] = {}
    for item in document.findall("sm:url", namespace):
        location = item.findtext("sm:loc", default="", namespaces=namespace).strip()
        lastmod = item.findtext("sm:lastmod", default="", namespaces=namespace).strip()
        if location and lastmod:
            dates[location] = lastmod
    return dates


def git_lastmod(path: Path, fallback: str = "") -> str:
    try:
        status = subprocess.check_output(
            ["git", "status", "--porcelain", "--", str(path)],
            text=True
        ).strip()
        if status:
            return datetime.now(timezone.utc).date().isoformat()
        is_shallow = subprocess.check_output(
            ["git", "rev-parse", "--is-shallow-repository"],
            text=True,
        ).strip() == "true"
        if is_shallow and fallback:
            return fallback
        out = subprocess.check_output(
            ["git", "log", "-1", "--format=%cI", "--", str(path)],
            text=True
        ).strip()
        return out[:10] if out else fallback or datetime.now(timezone.utc).date().isoformat()
    except Exception:
        return fallback or datetime.now(timezone.utc).date().isoformat()

def should_skip(path: Path) -> bool:
    parts = set(path.parts)
    if parts & EXCLUDE_DIRS:
        return True
    name = path.name.lower()
    return (
        path.as_posix() in EXCLUDE_FILES
        or name in EXCLUDE_FILES
        or name.startswith("404")
        or name in {"sitemap.xml", "robots.txt"}
        or "draft" in parts
        or "backup" in parts
    )

def url_for(path: Path) -> str:
    rel = path.as_posix()

    if rel == "index.html":
        return SITE_URL + "/"

    if rel.endswith("/index.html"):
        rel = rel[:-len("index.html")]
        return SITE_URL + "/" + rel

    if STRIP_HTML and rel.endswith(".html"):
        rel = rel[:-5]

    return SITE_URL + "/" + rel

html_files = sorted(
    p for p in ROOT.rglob("*.html")
    if not should_skip(p)
)

previous_lastmods = committed_sitemap_lastmods()
urls = []
for path in html_files:
    location = url_for(path)
    urls.append({
        "loc": location,
        "lastmod": git_lastmod(path, previous_lastmods.get(location, ""))
    })

xml = ['<?xml version="1.0" encoding="UTF-8"?>']
xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

for item in urls:
    xml.append("  <url>")
    xml.append(f"    <loc>{escape(item['loc'])}</loc>")
    xml.append(f"    <lastmod>{item['lastmod']}</lastmod>")
    xml.append("  </url>")

xml.append("</urlset>")

Path("sitemap.xml").write_text("\n".join(xml) + "\n", encoding="utf-8")

robots = Path("robots.txt")
robots_text = robots.read_text(encoding="utf-8") if robots.exists() else ""
sitemap_line = f"Sitemap: {SITE_URL}/sitemap.xml"

if sitemap_line not in robots_text:
    if robots_text and not robots_text.endswith("\n"):
        robots_text += "\n"
    robots_text += sitemap_line + "\n"
    robots.write_text(robots_text, encoding="utf-8")

print(f"Generated sitemap.xml with {len(urls)} URLs")
