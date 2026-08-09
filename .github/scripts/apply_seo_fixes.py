from __future__ import annotations

import html
import json
import re
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[2]
SITE_URL = "https://stylishandhealthy.com"
MODIFIED_ISO = "2026-08-09"
MODIFIED_HUMAN = "August 9, 2026"


PRIORITY_PAGES = {
    "blog/beauty-of-joseon-relief-sun.html": {
        "title": "Beauty of Joseon Relief Sun Ingredients: Full INCI + UV Filters",
        "description": "Full INCI breakdown of Beauty of Joseon Relief Sun, including four UV filters, niacinamide, fragrance status, alcohol context, and skin-type fit.",
        "links": [
            ("/blog/spf-guide", "evidence-based SPF guide"),
            ("/blog/what-uv-index-can-you-tan-in", "UV Index 1-5 guide"),
            ("/blog/biodance-bio-collagen-real-deep-mask-review", "Biodance mask evidence review"),
            ("/blog/medicube-pdrn-pink-peptide-serum-review", "Medicube PDRN serum evidence review"),
        ],
    },
    "blog/cyperus-rotundus-oil-hair-removal.html": {
        "title": "Does Cyperus Rotundus Oil Reduce Hair Growth? Human Evidence & Safety",
        "description": "Does Cyperus rotundus oil reduce hair growth? Review the human evidence, major limitations, safety, realistic use, and comparison with laser.",
        "links": [
            ("/blog/do-shower-filters-help-acne-eczema-hair-qure-review", "evidence review of shower-filter hair claims"),
            ("/blog/damaged-skin-barrier", "damaged skin-barrier guide"),
            ("/blog/why-does-my-moisturizer-burn", "guide to burning and irritation"),
            ("/blog/beef-tallow-skin-health", "review of natural-ingredient evidence"),
        ],
    },
    "blog/best-moisturizers-oily-acne-prone-skin.html": {
        "title": "7 Best Moisturizers for Oily, Acne-Prone Skin (2026)",
        "description": "Seven lightweight moisturizers for oily, acne-prone skin, compared by formula, texture, fragrance, barrier support, availability, and practical fit.",
        "links": [
            ("/blog/acne-treatment-guide", "step-by-step acne treatment guide"),
            ("/blog/why-does-my-moisturizer-burn", "guide to why moisturizer burns"),
            ("/blog/salicylic-acid-vs-benzoyl-peroxide", "salicylic acid versus benzoyl peroxide comparison"),
        ],
    },
    "blog/what-uv-index-can-you-tan-in.html": {
        "title": "Can You Tan at UV Index 1-5? What Each Level Means",
        "description": "Can you tan at UV Index 1, 2, 3, 4 or 5? See what each level means, why tanning times vary, and why no intentional UV tan is damage-free.",
        "links": [
            ("/blog/sunscreen-or-bug-spray-first", "sunscreen and insect-repellent order guide"),
            ("/blog/do-neck-creams-work-better-than-moisturizer", "evidence-based neck-care guide"),
        ],
    },
    "blog/the-ordinary-glycolic-acid-7-review.html": {
        "title": "Is The Ordinary Glycolic Acid 7% Strong? Review & Safe Use",
        "description": "Is The Ordinary Glycolic Acid 7% strong? An evidence-based review of results, irritation risk, safe frequency, and who should avoid it.",
        "links": [
            ("/blog/salicylic-acid-2", "safe salicylic acid 2% guide"),
            ("/blog/azelaic-acid-for-dark-spots", "azelaic acid guide for dark spots"),
            ("/blog/damaged-skin-barrier", "damaged skin-barrier guide"),
            ("/blog/why-does-my-moisturizer-burn", "guide to skincare burning and stinging"),
            ("/blog/how-to-fade-post-acne-dark-spots", "post-acne dark-spot guide"),
        ],
    },
    "blog/biodance-bio-collagen-real-deep-mask-review.html": {
        "title": "Biodance Bio-Collagen Mask Review: Claims, Ingredients & Verdict",
        "description": "Biodance Bio-Collagen Mask claims, ingredients, hydration evidence, testing limits, and verdict—without pretending collagen penetrates deeply.",
        "links": [
            ("/blog/beauty-of-joseon-relief-sun", "Beauty of Joseon ingredient guide"),
            ("/blog/medicube-pdrn-pink-peptide-serum-review", "Medicube PDRN serum evidence review"),
            ("/blog/anua-pdrn-hyaluronic-acid-capsule-serum-review", "Anua PDRN serum evidence review"),
            ("/blog/best-moisturizers-oily-acne-prone-skin", "lightweight moisturizer guide"),
            ("/blog/damaged-skin-barrier", "damaged skin-barrier guide"),
        ],
    },
    "blog/medicube-pdrn-pink-peptide-serum-review.html": {
        "title": "Medicube PDRN Pink Peptide Serum Review: Evidence & Ingredients",
        "description": "Medicube PDRN Pink Peptide Serum ingredients and evidence reviewed, including topical PDRN limits, peptides, niacinamide, fragrance, and verdict.",
        "links": [
            ("/blog/anua-pdrn-hyaluronic-acid-capsule-serum-review", "Anua PDRN serum review"),
            ("/blog/biodance-bio-collagen-real-deep-mask-review", "Biodance collagen-mask evidence review"),
            ("/blog/eqqual-berry-serum", "Eqqual illuminating-serum review"),
            ("/blog/garnier-vitamin-c-sorbet-cream", "Garnier vitamin C review"),
            ("/blog/beauty-of-joseon-relief-sun", "Beauty of Joseon ingredient guide"),
        ],
    },
    "blog/eqqual-berry-serum.html": {
        "title": "Eqqual Berry Vitamin Illuminating Serum Review: Ingredients & Verdict",
        "description": "Eqqual Berry Vitamin Illuminating Serum ingredients reviewed, including niacinamide, arbutin, vitamin C derivatives, fragrance, claims, and verdict.",
        "links": [
            ("/blog/garnier-vitamin-c-sorbet-cream", "Garnier vitamin C review"),
            ("/blog/medicube-pdrn-pink-peptide-serum-review", "Medicube PDRN serum evidence review"),
            ("/blog/anua-pdrn-hyaluronic-acid-capsule-serum-review", "Anua PDRN serum review"),
            ("/blog/biodance-bio-collagen-real-deep-mask-review", "Biodance mask evidence review"),
            ("/blog/beauty-of-joseon-relief-sun", "Beauty of Joseon ingredient guide"),
        ],
    },
}


SUPPORTING_LINKS = {
    "blog/oily-but-dehydrated-skin.html": [
        ("/blog/best-moisturizers-oily-acne-prone-skin", "moisturizers for oily, acne-prone skin"),
        ("/blog/beauty-of-joseon-relief-sun", "Beauty of Joseon sunscreen ingredient guide"),
    ],
    "blog/skin-barrier-damaged-or-acne.html": [
        ("/blog/best-moisturizers-oily-acne-prone-skin", "lightweight moisturizer guide"),
        ("/blog/the-ordinary-glycolic-acid-7-review", "safe glycolic acid review"),
    ],
    "blog/why-acne-keeps-returning-same-spot.html": [
        ("/blog/best-moisturizers-oily-acne-prone-skin", "moisturizer guide for acne-prone skin"),
        ("/blog/acne-treatment-guide", "evidence-based acne treatment guide"),
    ],
    "blog/spf-guide.html": [
        ("/blog/what-uv-index-can-you-tan-in", "UV Index 1-5 guide"),
        ("/blog/beauty-of-joseon-relief-sun", "Beauty of Joseon ingredient guide"),
    ],
    "blog/sunscreen-or-bug-spray-first.html": [
        ("/blog/beauty-of-joseon-relief-sun", "Beauty of Joseon sunscreen ingredient guide"),
    ],
    "blog/salicylic-acid-2.html": [
        ("/blog/the-ordinary-glycolic-acid-7-review", "The Ordinary Glycolic Acid 7% safe-use review"),
        ("/blog/best-moisturizers-oily-acne-prone-skin", "moisturizers for oily, acne-prone skin"),
    ],
    "blog/salicylic-acid-vs-benzoyl-peroxide.html": [
        ("/blog/the-ordinary-glycolic-acid-7-review", "glycolic acid strength and safe-use review"),
        ("/blog/best-moisturizers-oily-acne-prone-skin", "lightweight moisturizer guide"),
    ],
    "blog/anua-pdrn-hyaluronic-acid-capsule-serum-review.html": [
        ("/blog/medicube-pdrn-pink-peptide-serum-review", "Medicube PDRN serum evidence review"),
        ("/blog/biodance-bio-collagen-real-deep-mask-review", "Biodance mask evidence review"),
    ],
    "blog/garnier-vitamin-c-sorbet-cream.html": [
        ("/blog/eqqual-berry-serum", "Eqqual illuminating-serum review"),
    ],
    "blog/slow-growth-hair-growth-oil.html": [
        ("/blog/cyperus-rotundus-oil-hair-removal", "Cyperus rotundus human-evidence review"),
    ],
}


# These pages openly state that no hands-on product test was performed. Keep their
# evidence analysis as Article markup, but do not imply a first-hand Product review.
EVIDENCE_ONLY_PAGES = {
    "blog/medicube-pdrn-pink-peptide-serum-review.html",
    "blog/do-shower-filters-help-acne-eczema-hair-qure-review.html",
}


def pretty_url(relative_path: str) -> str:
    if relative_path == "index.html":
        return f"{SITE_URL}/"
    if relative_path == "introduction.html":
        return f"{SITE_URL}/blog/introduction"
    return f"{SITE_URL}/{relative_path.removesuffix('.html')}"


def strip_markup(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value)
    return html.unescape(value).strip()


def replace_meta(text: str, attribute: str, key: str, content: str, *, create: bool = False) -> str:
    pattern = re.compile(
        rf"<meta\b(?=[^>]*\b{re.escape(attribute)}=[\"']{re.escape(key)}[\"'])[^>]*>",
        re.IGNORECASE,
    )
    tag = f'<meta content="{html.escape(content, quote=True)}" {attribute}="{key}"/>'
    if pattern.search(text):
        return pattern.sub(tag, text, count=1)
    if create:
        return text.replace("</head>", f"{tag}\n</head>", 1)
    return text


def set_canonical(text: str, canonical: str) -> str:
    pattern = re.compile(
        r"<link\b(?=[^>]*\brel=[\"']canonical[\"'])[^>]*>",
        re.IGNORECASE,
    )
    tag = f'<link href="{canonical}" rel="canonical"/>'
    matches = list(pattern.finditer(text))
    if not matches:
        marker = re.search(r"<meta\b[^>]*\bname=[\"']robots[\"'][^>]*>", text, re.IGNORECASE)
        if marker:
            return text[: marker.end()] + "\n" + tag + text[marker.end() :]
        return text.replace("</head>", f"{tag}\n</head>", 1)

    output = []
    cursor = 0
    for index, match in enumerate(matches):
        output.append(text[cursor : match.start()])
        if index == 0:
            output.append(tag)
        cursor = match.end()
    output.append(text[cursor:])
    return "".join(output)


def update_article_meta(text: str) -> str:
    pattern = re.compile(r'(<div\s+class="article-meta"[^>]*>)(.*?)(</div>)', re.IGNORECASE | re.DOTALL)

    def replacement(match: re.Match[str]) -> str:
        body = match.group(2)
        updated_pattern = re.compile(r"Updated\s+[A-Z][a-z]+\s+\d{1,2},\s+\d{4}")
        if updated_pattern.search(body):
            body = updated_pattern.sub(f"Updated {MODIFIED_HUMAN}", body, count=1)
        else:
            body += f'<span class="meta-dot"></span><span>Updated {MODIFIED_HUMAN}</span>'
        return match.group(1) + body + match.group(3)

    text = pattern.sub(replacement, text, count=1)
    last_updated_pattern = re.compile(
        r'(<strong>Last updated:</strong>\s*<time\b[^>]*datetime=")[^"]+("[^>]*>).*?(</time>)',
        re.IGNORECASE | re.DOTALL,
    )
    return last_updated_pattern.sub(
        lambda match: match.group(1) + MODIFIED_ISO + match.group(2) + MODIFIED_HUMAN + match.group(3),
        text,
        count=1,
    )


def walk_schema(node, callback) -> None:
    if isinstance(node, dict):
        callback(node)
        for value in list(node.values()):
            walk_schema(value, callback)
    elif isinstance(node, list):
        for value in node:
            walk_schema(value, callback)


def schema_type(node: dict) -> set[str]:
    value = node.get("@type")
    if isinstance(value, list):
        return {str(item) for item in value}
    return {str(value)} if value else set()


def transform_schema_scripts(text: str, relative_path: str, canonical: str, page_config: dict | None) -> str:
    script_pattern = re.compile(
        r'(<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)',
        re.IGNORECASE | re.DOTALL,
    )

    def transform(match: re.Match[str]) -> str:
        raw = match.group(2).strip()
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return match.group(0)

        if relative_path in EVIDENCE_ONLY_PAGES:
            if isinstance(data, list):
                data = [
                    node for node in data
                    if not (isinstance(node, dict) and schema_type(node) & {"Product", "Review"})
                ]
                if not data:
                    return ""
            elif isinstance(data, dict) and schema_type(data) & {"Product", "Review"}:
                return ""

        def update_node(node: dict) -> None:
            types = schema_type(node)
            if types & {"Article", "BlogPosting"} and page_config:
                node["headline"] = page_config["title"]
                node["description"] = page_config["description"]
                node["dateModified"] = MODIFIED_ISO
                node["url"] = canonical
                main_entity = node.get("mainEntityOfPage")
                if isinstance(main_entity, dict):
                    main_entity["@id"] = canonical
            if types & {"Article", "BlogPosting"} and relative_path in EVIDENCE_ONLY_PAGES:
                node.pop("about", None)

            if "BreadcrumbList" in types:
                items = node.get("itemListElement")
                if isinstance(items, list):
                    for item in items:
                        if not isinstance(item, dict):
                            continue
                        position = item.get("position")
                        if position == 1:
                            item["item"] = SITE_URL
                        elif position == 2:
                            item["item"] = f"{SITE_URL}/blog"
                        elif position == 3:
                            item["item"] = canonical
                            if page_config:
                                item["name"] = page_config["title"]

            if relative_path == "blog.html" and types & {"BlogPosting"}:
                url = node.get("url", "")
                slug = urlparse(url).path.rsplit("/", 1)[-1]
                config = next(
                    (value for path, value in PRIORITY_PAGES.items() if path == f"blog/{slug}.html"),
                    None,
                )
                if config:
                    node["headline"] = config["title"]
                    node["description"] = config["description"]
                    node["dateModified"] = MODIFIED_ISO

        walk_schema(data, update_node)
        serialized = json.dumps(data, ensure_ascii=False, indent=2)
        return f"{match.group(1)}\n{serialized}\n{match.group(3)}"

    return script_pattern.sub(transform, text)


def breadcrumb_schema(canonical: str, title: str) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{SITE_URL}/blog"},
            {"@type": "ListItem", "position": 3, "name": title, "item": canonical},
        ],
    }


def visible_faq_schema(text: str) -> dict | None:
    if '"@type": "FAQPage"' in text or '"@type":"FAQPage"' in text:
        return None
    items = []
    item_pattern = re.compile(
        r'<div\b[^>]*class="[^"]*faq-item[^"]*"[^>]*>(.*?)</div>',
        re.IGNORECASE | re.DOTALL,
    )
    for match in item_pattern.finditer(text):
        body = match.group(1)
        question_match = re.search(
            r'<(?:h3|p)\b[^>]*(?:class="[^"]*faq-q[^"]*")?[^>]*>(.*?)</(?:h3|p)>',
            body,
            re.IGNORECASE | re.DOTALL,
        )
        answer_match = re.search(
            r'<p\b[^>]*class="[^"]*faq-a[^"]*"[^>]*>(.*?)</p>',
            body,
            re.IGNORECASE | re.DOTALL,
        )
        if question_match and not answer_match:
            remaining = body[question_match.end() :]
            answer_match = re.search(r'<p\b[^>]*>(.*?)</p>', remaining, re.IGNORECASE | re.DOTALL)
        if not question_match or not answer_match:
            continue
        question = strip_markup(question_match.group(1))
        answer = strip_markup(answer_match.group(1))
        if question and answer:
            items.append(
                {
                    "@type": "Question",
                    "name": question,
                    "acceptedAnswer": {"@type": "Answer", "text": answer},
                }
            )
    if len(items) < 2:
        return None
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": items}


def append_head_schema(text: str, data: dict) -> str:
    script = '<script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=2) + "\n</script>"
    return text.replace("</head>", f"{script}\n</head>", 1)


def join_link_phrases(links: list[tuple[str, str]]) -> str:
    phrases = [f'<a href="{href}">{html.escape(label)}</a>' for href, label in links]
    if len(phrases) == 1:
        return phrases[0]
    if len(phrases) == 2:
        return f"{phrases[0]} and {phrases[1]}"
    return ", ".join(phrases[:-1]) + f", and {phrases[-1]}"


def insert_article_block(text: str, links: list[tuple[str, str]], marker: str, *, max_total: int | None = None) -> str:
    marker_pattern = re.compile(
        rf"\n?<!-- {re.escape(marker)}:START -->.*?<!-- {re.escape(marker)}:END -->\n?",
        re.DOTALL,
    )
    text = marker_pattern.sub("\n", text)
    article_match = re.search(r"<article\b[^>]*>(.*?)</article>", text, re.IGNORECASE | re.DOTALL)
    if not article_match:
        return text

    existing = list(dict.fromkeys(re.findall(r'href="(/blog/[^"#?]+)', article_match.group(1))))
    missing = [(href, label) for href, label in links if href not in existing]
    if max_total is not None:
        missing = missing[: max(0, max_total - len(existing))]
    if not missing:
        return text

    block = (
        f"<!-- {marker}:START -->\n"
        f'<aside class="article-internal-links seo-context-links" aria-label="Related evidence guides">\n'
        f"<p><strong>Continue reading:</strong> {join_link_phrases(missing)}.</p>\n"
        f"</aside>\n"
        f"<!-- {marker}:END -->\n"
    )

    insert_at = article_match.end(1)
    article_body = article_match.group(1)
    for pattern in (
        r'<section\b[^>]*class="[^"]*faq-section',
        r'<section\b[^>]*class="[^"]*references',
        r'<p\b[^>]*class="[^"]*disclaimer',
    ):
        anchor = re.search(pattern, article_body, re.IGNORECASE)
        if anchor:
            insert_at = article_match.start(1) + anchor.start()
            break
    return text[:insert_at] + block + text[insert_at:]


def update_blog_card(text: str, relative_path: str, config: dict) -> str:
    slug = Path(relative_path).stem
    pattern = re.compile(
        rf'(<a\b[^>]*class="[^"]*\bbc\b[^"]*"[^>]*href="/blog/{re.escape(slug)}"[^>]*>)(.*?)(</a>)',
        re.IGNORECASE | re.DOTALL,
    )

    def replacement(match: re.Match[str]) -> str:
        opener = re.sub(
            r'data-title="[^"]*"',
            f'data-title="{html.escape(config["title"], quote=True)}"',
            match.group(1),
            count=1,
        )
        body = re.sub(
            r'(<h[23]\b[^>]*>).*?(</h[23]>)',
            lambda heading: heading.group(1) + html.escape(config["title"]) + heading.group(2),
            match.group(2),
            count=1,
            flags=re.IGNORECASE | re.DOTALL,
        )
        return opener + body + match.group(3)

    return pattern.sub(replacement, text, count=1)


def process_html(path: Path) -> bool:
    relative_path = path.relative_to(ROOT).as_posix()
    original = path.read_text(encoding="utf-8")
    text = original.replace("https://www.stylishandhealthy.com", SITE_URL)
    text = text.replace('href="/subscribe"', 'href="/#newsletter"')

    if relative_path == "index.html" and 'id="newsletter"' not in text:
        text = text.replace('<section class="nw-strip">', '<section class="nw-strip" id="newsletter">', 1)

    if relative_path.startswith("assets/"):
        if text != original:
            path.write_text(text, encoding="utf-8")
            return True
        return False

    canonical = pretty_url(relative_path)
    text = set_canonical(text, canonical)
    text = replace_meta(text, "property", "og:url", canonical, create=True)

    config = PRIORITY_PAGES.get(relative_path)
    if config:
        escaped_title = html.escape(config["title"])
        text = re.sub(r"<title>.*?</title>", f"<title>{escaped_title}</title>", text, count=1, flags=re.DOTALL)
        text = re.sub(
            r"(<h1\b[^>]*>).*?(</h1>)",
            lambda match: match.group(1) + escaped_title + match.group(2),
            text,
            count=1,
            flags=re.IGNORECASE | re.DOTALL,
        )
        text = replace_meta(text, "property", "og:title", config["title"])
        text = replace_meta(text, "name", "twitter:title", config["title"])
        text = replace_meta(text, "property", "og:description", config["description"])
        text = replace_meta(text, "name", "twitter:description", config["description"])
        text = replace_meta(text, "name", "description", config["description"])
        text = replace_meta(text, "property", "article:modified_time", MODIFIED_ISO, create=True)
        text = update_article_meta(text)

    text = transform_schema_scripts(text, relative_path, canonical, config)

    if relative_path.startswith("blog/"):
        title_match = re.search(r"<h1\b[^>]*>(.*?)</h1>", text, re.IGNORECASE | re.DOTALL)
        breadcrumb_title = config["title"] if config else strip_markup(title_match.group(1)) if title_match else Path(relative_path).stem.replace("-", " ").title()
        if "BreadcrumbList" not in text:
            text = append_head_schema(text, breadcrumb_schema(canonical, breadcrumb_title))
        faq = visible_faq_schema(text)
        if faq:
            text = append_head_schema(text, faq)

    if config:
        text = insert_article_block(text, config["links"], "SEO-CONTEXT-LINKS", max_total=6)
    elif relative_path in SUPPORTING_LINKS:
        text = insert_article_block(text, SUPPORTING_LINKS[relative_path], "SEO-INBOUND-LINKS")

    if relative_path == "blog.html":
        for page_path, page_config in PRIORITY_PAGES.items():
            text = update_blog_card(text, page_path, page_config)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        if ".git" in path.parts:
            continue
        if process_html(path):
            changed.append(path.relative_to(ROOT).as_posix())

    for pattern in ("*.xml",):
        for path in sorted(ROOT.rglob(pattern)):
            if ".git" in path.parts or path == Path(__file__).resolve():
                continue
            original = path.read_text(encoding="utf-8")
            text = original.replace("https://www.stylishandhealthy.com", SITE_URL)
            if text != original:
                path.write_text(text, encoding="utf-8")
                changed.append(path.relative_to(ROOT).as_posix())

    print(f"Applied SEO normalization to {len(changed)} files")
    for path in changed:
        print(f"- {path}")


if __name__ == "__main__":
    main()
