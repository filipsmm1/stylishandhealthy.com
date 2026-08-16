from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "assets" / "js" / "answers-data.js"
TARGET_COUNT = 600

GENERIC_HEADINGS = {
    "article summary",
    "bottom line",
    "conclusion",
    "faq",
    "faqs",
    "final thoughts",
    "references",
    "related reading",
    "sources",
    "table of contents",
}

DISPLAY_OVERRIDES = {
    (
        "salicylic-acid-2",
        "What does salicylic acid 2% do for skin?",
    ): {
        "question": "Can salicylic acid treat acne?",
        "answer": (
            "Yes. Salicylic acid can help mild clogged-pore acne, especially blackheads "
            "and whiteheads, because it loosens dead skin cells inside pores."
        ),
    },
    (
        "can-hair-products-cause-forehead-acne",
        "What should I know about repeated exposure can support comedone formation?",
    ): {
        "question": "What causes closed comedones?",
    },
    (
        "do-led-face-masks-work",
        "What Does the Research Actually Show?",
    ): {
        "question": "Do LED face masks work?",
        "answer": (
            "They can, but results are usually modest. Red and near-infrared light may "
            "slightly improve fine lines, texture, redness, and firmness with consistent use."
        ),
    },
}


def clean(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value or "")
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def walk_json(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk_json(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_json(child)


def article_title(raw: str, fallback: str) -> str:
    match = re.search(r"<title>(.*?)</title>", raw, re.IGNORECASE | re.DOTALL)
    title = clean(match.group(1)) if match else fallback.replace("-", " ").title()
    title = re.split(r"\s+[|–—-]\s+Stylishandhealthy", title, maxsplit=1, flags=re.IGNORECASE)[0]
    return title


def short_answer(value: str) -> str:
    text = clean(value)
    sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", text)
    answer = sentences[0] if sentences else text
    if len(answer) < 65 and len(sentences) > 1:
        answer = f"{answer} {sentences[1]}"
    if len(answer) > 260:
        clipped = answer[:250].rsplit(" ", 1)[0].rstrip(" ,;:")
        answer = f"{clipped}."
    return answer


def question_from_heading(value: str) -> str:
    heading = clean(value)
    heading = re.sub(r"^\d+[.)]\s*", "", heading).strip(" .:–—-")
    if not heading:
        return ""
    if heading.endswith("?"):
        return heading
    what_reorder = re.match(r"^What\s+(.+?)\s+(is|are)$", heading, re.IGNORECASE)
    if what_reorder:
        subject, verb = what_reorder.groups()
        return f"What {verb.casefold()} {subject}?"
    if re.match(
        r"^(can|could|do|does|how|is|are|should|what|when|where|which|who|why|will|would)\b",
        heading,
        re.IGNORECASE,
    ):
        return f"{heading}?"
    why_reorder = re.match(r"^(.+?)\s+(is|are)\s+(.+)$", heading, re.IGNORECASE)
    if why_reorder:
        subject, verb, detail = why_reorder.groups()
        return f"Why {verb.casefold()} {subject[0].lower()}{subject[1:]} {detail}?"
    return f"What should I know about {heading[0].lower()}{heading[1:]}?"


def extract_sections(raw: str) -> list[dict[str, str]]:
    sections: list[dict[str, str]] = []
    pattern = re.compile(
        r"<h([23])\b[^>]*>(.*?)</h\1>(.*?)(?:<p\b[^>]*>(.*?)</p>)",
        re.IGNORECASE | re.DOTALL,
    )
    for match in pattern.finditer(raw):
        heading = clean(match.group(2))
        paragraph = clean(match.group(4))
        heading_key = re.sub(r"[^a-z0-9]+", " ", heading.casefold()).strip()
        if (
            not heading
            or heading_key in GENERIC_HEADINGS
            or heading_key.startswith("table of contents")
            or heading_key in {"in this guide", "what you will learn"}
            or heading_key.endswith(" faq")
            or heading_key.endswith(" if you")
            or len(paragraph) < 80
            or "cookie" in heading.casefold()
        ):
            continue
        question = question_from_heading(heading)
        if not question or any(item["question"].casefold() == question.casefold() for item in sections):
            continue
        sections.append({"question": question, "answer": paragraph, "sourceKind": "section"})
    return sections


def topic_for(slug: str) -> str:
    if any(token in slug for token in ("sunscreen", "spf", "uv-index", "relief-sun")):
        return "Sun care"
    if any(token in slug for token in ("fibermaxxing", "fitness")):
        return "Wellness"
    if any(token in slug for token in ("hair", "cyperus")):
        return "Hair & body"
    if any(token in slug for token in ("acne", "salicylic", "benzoyl", "pih", "pie")):
        return "Acne"
    if any(token in slug for token in ("review", "joseon", "garnier", "eqqual", "biodance", "medicube")):
        return "Product reviews"
    return "Skin care"


def extract_article(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8")
    slug = path.stem
    questions: list[dict[str, str]] = []

    blocks = re.findall(
        r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        raw,
        re.IGNORECASE | re.DOTALL,
    )
    for block in blocks:
        try:
            value = json.loads(block.strip())
        except json.JSONDecodeError:
            continue
        for node in walk_json(value):
            if node.get("@type") != "Question":
                continue
            accepted = node.get("acceptedAnswer")
            if not isinstance(accepted, dict):
                continue
            question = clean(str(node.get("name", "")))
            answer = clean(str(accepted.get("text", "")))
            if not question or not answer or any(item["question"] == question for item in questions):
                continue
            questions.append({"question": question, "answer": answer, "sourceKind": "faq"})

    faq_questions = {item["question"].casefold() for item in questions}
    questions.extend(
        section for section in extract_sections(raw)
        if section["question"].casefold() not in faq_questions
    )

    return {
        "slug": slug,
        "article": article_title(raw, slug),
        "topic": topic_for(slug),
        "questions": questions,
    }


def build_entries() -> list[dict[str, str]]:
    articles = [
        article
        for article in (extract_article(path) for path in sorted((ROOT / "blog").glob("*.html")))
        if article["questions"]
    ]

    selected: list[tuple[dict, dict]] = []
    selected_questions: set[str] = set()
    question_index = 0
    while len(selected) < TARGET_COUNT:
        added = False
        for article in articles:
            if question_index >= len(article["questions"]):
                continue
            candidate = article["questions"][question_index]
            candidate_key = candidate["question"].casefold()
            if candidate_key in selected_questions:
                continue
            selected.append((article, candidate))
            selected_questions.add(candidate_key)
            added = True
            if len(selected) == TARGET_COUNT:
                break
        if not added:
            break
        question_index += 1

    if len(selected) != TARGET_COUNT:
        raise RuntimeError(f"Expected {TARGET_COUNT} grounded answers, found {len(selected)}")

    entries: list[dict[str, str]] = []
    seen_questions: set[str] = set()
    for index, (article, source) in enumerate(selected, start=1):
        override = DISPLAY_OVERRIDES.get((article["slug"], source["question"]), {})
        question = override.get("question", source["question"])
        answer = override.get("answer", short_answer(source["answer"]))
        if question.casefold() in seen_questions:
            raise RuntimeError(f"Duplicate quick-answer question: {question}")
        seen_questions.add(question.casefold())
        entries.append(
            {
                "id": f"qa-{index:03d}",
                "question": question,
                "answer": answer,
                "topic": article["topic"],
                "article": article["article"],
                "url": f"/blog/{article['slug']}",
                "sourceQuestion": source["question"],
                "sourceKind": source.get("sourceKind", "faq"),
            }
        )
    return entries


def render(entries: list[dict[str, str]]) -> str:
    payload = json.dumps(entries, ensure_ascii=False, indent=2)
    return (
        "/* Generated from FAQ answers already published in blog/*.html.\n"
        "   Run .github/scripts/generate_quick_answers.py after changing article FAQs. */\n"
        f"window.SH_QUICK_ANSWERS = Object.freeze({payload});\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if answers-data.js is stale")
    args = parser.parse_args()

    entries = build_entries()
    expected = render(entries)
    source_articles = len({entry["url"] for entry in entries})

    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != expected:
            print("Quick-answer data is stale. Run generate_quick_answers.py.")
            return 1
        print(f"Quick-answer data passed: {len(entries)} answers from {source_articles} articles")
        return 0

    OUTPUT.write_text(expected, encoding="utf-8")
    print(f"Generated {OUTPUT.relative_to(ROOT)} with {len(entries)} answers from {source_articles} articles")
    return 0


if __name__ == "__main__":
    sys.exit(main())
