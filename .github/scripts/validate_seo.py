from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[2]
SITE_URL = "https://stylishandhealthy.com"
PRIORITY_TITLES = {
    "beauty-of-joseon-relief-sun": "Beauty of Joseon Relief Sun Ingredients: Full INCI + UV Filters",
    "cyperus-rotundus-oil-hair-removal": "Does Cyperus Rotundus Oil Reduce Hair Growth? Human Evidence & Safety",
    "best-moisturizers-oily-acne-prone-skin": "7 Best Moisturizers for Oily, Acne-Prone Skin (2026)",
    "what-uv-index-can-you-tan-in": "Can You Tan at UV Index 1-5? What Each Level Means",
    "the-ordinary-glycolic-acid-7-review": "Is The Ordinary Glycolic Acid 7% Strong? Review & Safe Use",
    "biodance-bio-collagen-real-deep-mask-review": "Biodance Bio-Collagen Mask Review: Claims, Ingredients & Verdict",
    "medicube-pdrn-pink-peptide-serum-review": "Medicube PDRN Pink Peptide Serum Review: Evidence & Ingredients",
    "eqqual-berry-serum": "Eqqual Berry Vitamin Illuminating Serum Review: Ingredients & Verdict",
}
EVIDENCE_ONLY_SLUGS = {
    "medicube-pdrn-pink-peptide-serum-review",
    "do-shower-filters-help-acne-eczema-hair-qure-review",
}


def expected_url(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    if relative == "index.html":
        return f"{SITE_URL}/"
    if relative == "introduction.html":
        return f"{SITE_URL}/blog/introduction"
    return f"{SITE_URL}/{relative.removesuffix('.html')}"


def schema_types(value) -> set[str]:
    found: set[str] = set()
    if isinstance(value, dict):
        current = value.get("@type")
        if isinstance(current, list):
            found.update(str(item) for item in current)
        elif current:
            found.add(str(current))
        for item in value.values():
            found.update(schema_types(item))
    elif isinstance(value, list):
        for item in value:
            found.update(schema_types(item))
    return found


def internal_target_exists(href: str) -> bool:
    clean = href.split("#", 1)[0].split("?", 1)[0]
    if not clean or clean == "/":
        return (ROOT / "index.html").exists()
    candidate = ROOT / f"{clean.lstrip('/')}.html"
    if candidate.exists():
        return True
    return (ROOT / clean.lstrip("/") / "index.html").exists()


def main() -> int:
    errors: list[str] = []
    html_files = [
        path for path in sorted(ROOT.rglob("*.html"))
        if ".git" not in path.parts and not path.relative_to(ROOT).as_posix().startswith("assets/")
    ]

    for path in html_files:
        relative = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8")
        if "https://www.stylishandhealthy.com" in text:
            errors.append(f"{relative}: contains a www site URL")

        canonical_matches = re.findall(
            r'<link\b(?=[^>]*\brel=["\']canonical["\'])[^>]*\bhref=["\']([^"\']+)',
            text,
            re.IGNORECASE,
        )
        if len(canonical_matches) != 1:
            errors.append(f"{relative}: expected exactly one canonical, found {len(canonical_matches)}")
        elif canonical_matches[0] != expected_url(path):
            errors.append(f"{relative}: canonical is {canonical_matches[0]}, expected {expected_url(path)}")

        parsed_schema = []
        for index, raw in enumerate(
            re.findall(
                r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
                text,
                re.IGNORECASE | re.DOTALL,
            ),
            start=1,
        ):
            try:
                parsed_schema.append(json.loads(raw.strip()))
            except json.JSONDecodeError as exc:
                errors.append(f"{relative}: JSON-LD block {index} is invalid: {exc}")

        all_types: set[str] = set()
        for value in parsed_schema:
            all_types.update(schema_types(value))

        if relative.startswith("blog/"):
            if not ({"Article", "BlogPosting"} & all_types):
                errors.append(f"{relative}: missing Article or BlogPosting schema")
            if "BreadcrumbList" not in all_types:
                errors.append(f"{relative}: missing BreadcrumbList schema")
            if "faq-item" in text and "FAQPage" not in all_types:
                errors.append(f"{relative}: visible FAQ is missing matching FAQPage schema")

        slug = path.stem
        if slug in EVIDENCE_ONLY_SLUGS and ({"Product", "Review"} & all_types):
            errors.append(f"{relative}: evidence-only page must not use Product or Review schema")
        if slug in EVIDENCE_ONLY_SLUGS and any("#product" in json.dumps(value) for value in parsed_schema):
            errors.append(f"{relative}: evidence-only schema still references a removed Product entity")

        article_match = re.search(r"<article\b[^>]*>(.*?)</article>", text, re.IGNORECASE | re.DOTALL)
        if slug in PRIORITY_TITLES:
            title_match = re.search(r"<title>(.*?)</title>", text, re.IGNORECASE | re.DOTALL)
            title = re.sub(r"<[^>]+>", "", title_match.group(1)).replace("&amp;", "&").strip() if title_match else ""
            if title != PRIORITY_TITLES[slug]:
                errors.append(f"{relative}: priority title is {title!r}, expected {PRIORITY_TITLES[slug]!r}")
            if "Updated August 9, 2026" not in text:
                errors.append(f"{relative}: missing visible updated date")
            if not article_match:
                errors.append(f"{relative}: priority page has no article element")
            else:
                links = set(re.findall(r'href="(/blog/[^"#?]+)', article_match.group(1)))
                if not 3 <= len(links) <= 6:
                    errors.append(f"{relative}: priority page has {len(links)} contextual article links; expected 3-6")

        if slug == "the-ordinary-glycolic-acid-7-review" and 'id="is-glycolic-7-strong"' not in text:
            errors.append(f"{relative}: missing the direct glycolic-acid strength answer")

        for href in set(re.findall(r'href="(/[^"]*)"', text)):
            if href.startswith("//") or href.startswith("/assets/"):
                continue
            if not internal_target_exists(href):
                errors.append(f"{relative}: broken internal link {href}")

    obsolete_sitemap = ROOT / "sitemap(1).xml"
    if obsolete_sitemap.exists():
        errors.append("sitemap(1).xml: obsolete sitemap must be removed")

    redirect = ROOT / "introduction.html"
    if not redirect.exists():
        errors.append("introduction.html: missing redirect to /blog/introduction")
    else:
        redirect_text = redirect.read_text(encoding="utf-8")
        if "noindex" not in redirect_text or "/blog/introduction" not in redirect_text:
            errors.append("introduction.html: redirect must be noindex and point to /blog/introduction")

    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    if "www.stylishandhealthy.com" in sitemap:
        errors.append("sitemap.xml: contains www URLs")
    if "/subscribe" in sitemap or "/introduction</loc>" in sitemap:
        errors.append("sitemap.xml: contains an obsolete subscribe or redirect URL")

    if errors:
        print("SEO validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"SEO validation passed for {len(html_files)} indexable or redirect HTML files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
