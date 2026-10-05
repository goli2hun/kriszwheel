#!/usr/bin/env python3
"""KriszWheel feladvány-validátor.

Használat a repository gyökeréből:
    python tools/validate_puzzles.py

A script csak ellenőriz, nem módosít fájlokat.
"""

from __future__ import annotations

import csv
import sys
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path

BOARD_COLS = 15
BOARD_ROWS = 4
EXPECTED_COUNT = 100

DATASETS = {
    "Gyerek": "data/child.csv",
    "Könnyű": "data/low.csv",
    "Közepes": "data/med.csv",
    "Nehéz": "data/high.csv",
}

EXPECTED_HEADER = ["category", "puzzle"]
ALLOWED_PUNCTUATION = set(" -–—'’.,!?():;/&")


@dataclass(frozen=True)
class PuzzleEntry:
    level: str
    path: Path
    row_number: int
    category: str
    puzzle: str
    normalized: str


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFC", value or "")
    value = " ".join(value.split())
    return value.upper()


def is_letter(char: str) -> bool:
    return unicodedata.category(char).startswith("L")


def invalid_characters(text: str) -> list[str]:
    invalid = []
    for char in text:
        if is_letter(char) or char.isdigit() or char.isspace():
            continue
        if char in ALLOWED_PUNCTUATION:
            continue
        invalid.append(char)
    return sorted(set(invalid))


def layout_puzzle_rows(text: str) -> list[str] | None:
    """A játék layoutPuzzleRows() logikájával azonos szóalapú tördelés."""
    words = [word for word in text.split(" ") if word]
    candidates: list[list[str]] = []

    def search(word_index: int, rows: list[str]) -> None:
        if word_index >= len(words):
            candidates.append(rows)
            return

        if len(rows) >= BOARD_ROWS:
            return

        line = ""
        for index in range(word_index, len(words)):
            next_line = f"{line} {words[index]}" if line else words[index]
            if len(next_line) > BOARD_COLS:
                break
            line = next_line
            search(index + 1, [*rows, line])

    search(0, [])

    if not candidates:
        return None

    min_rows = min(len(rows) for rows in candidates)

    def score(rows: list[str]) -> float:
        lengths = [len(row) for row in rows]
        avg = sum(lengths) / len(lengths)
        variance = sum((length - avg) ** 2 for length in lengths)
        edge_penalty = sum((BOARD_COLS - length) * 0.08 for length in lengths)
        return variance + edge_penalty

    return min(
        (rows for rows in candidates if len(rows) == min_rows),
        key=score,
    )


def print_issue(kind: str, path: Path, row_number: int | None, message: str) -> None:
    location = str(path)
    if row_number is not None:
        location += f":{row_number}"
    print(f"  {kind} {location} – {message}")


def read_dataset(
    root: Path,
    level: str,
    relative_path: str,
    errors: list[str],
    warnings: list[str],
) -> list[PuzzleEntry]:
    path = root / relative_path

    print(f"\n{level} – {relative_path}")

    if not path.exists():
        message = f"Hiányzik a fájl: {relative_path}"
        errors.append(message)
        print_issue("[HIBA]", path, None, message)
        return []

    entries: list[PuzzleEntry] = []

    try:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)

            if reader.fieldnames != EXPECTED_HEADER:
                message = (
                    "Hibás CSV fejléc. Elvárt: "
                    + ",".join(EXPECTED_HEADER)
                    + f"; kapott: {reader.fieldnames!r}"
                )
                errors.append(message)
                print_issue("[HIBA]", path, 1, message)
                return []

            for row_number, row in enumerate(reader, start=2):
                category = (row.get("category") or "").strip()
                puzzle = (row.get("puzzle") or "").strip()
                normalized = normalize_text(puzzle)

                entry = PuzzleEntry(
                    level=level,
                    path=path,
                    row_number=row_number,
                    category=category,
                    puzzle=puzzle,
                    normalized=normalized,
                )
                entries.append(entry)

                if not category:
                    message = "Üres kategória."
                    errors.append(message)
                    print_issue("[HIBA]", path, row_number, message)

                if not puzzle:
                    message = "Üres feladvány."
                    errors.append(message)
                    print_issue("[HIBA]", path, row_number, message)
                    continue

                if puzzle != unicodedata.normalize("NFC", puzzle):
                    message = "A feladvány nem NFC Unicode-normalizált."
                    warnings.append(message)
                    print_issue("[FIGYELMEZTETÉS]", path, row_number, message)

                bad_chars = invalid_characters(puzzle)
                if bad_chars:
                    rendered = " ".join(repr(char) for char in bad_chars)
                    message = f"Szokatlan karakter(ek): {rendered}"
                    warnings.append(message)
                    print_issue("[FIGYELMEZTETÉS]", path, row_number, message)

                if not any(is_letter(char) for char in puzzle):
                    message = "A feladvány nem tartalmaz betűt."
                    errors.append(message)
                    print_issue("[HIBA]", path, row_number, message)

                too_long_words = [
                    word for word in puzzle.split() if len(word) > BOARD_COLS
                ]
                if too_long_words:
                    message = (
                        f"{BOARD_COLS} karakternél hosszabb szó: "
                        + ", ".join(repr(word) for word in too_long_words)
                    )
                    errors.append(message)
                    print_issue("[HIBA]", path, row_number, message)

                layout = layout_puzzle_rows(normalized)
                if layout is None:
                    message = (
                        f"A feladvány nem tördelhető a "
                        f"{BOARD_COLS}×{BOARD_ROWS}-es táblára."
                    )
                    errors.append(message)
                    print_issue("[HIBA]", path, row_number, message)

    except (csv.Error, UnicodeError, OSError) as exc:
        message = f"Nem olvasható szabályos UTF-8 CSV-ként: {exc}"
        errors.append(message)
        print_issue("[HIBA]", path, None, message)
        return []

    if len(entries) != EXPECTED_COUNT:
        message = (
            f"Az elemszám {len(entries)}, az elvárt pontosan {EXPECTED_COUNT}."
        )
        errors.append(message)
        print_issue("[HIBA]", path, None, message)

    normalized_counter = Counter(
        entry.normalized for entry in entries if entry.normalized
    )
    duplicates = {
        puzzle for puzzle, count in normalized_counter.items() if count > 1
    }

    for duplicate in sorted(duplicates):
        rows = [
            str(entry.row_number)
            for entry in entries
            if entry.normalized == duplicate
        ]
        message = (
            f"Duplikált feladvány: {duplicate!r} "
            f"(sorok: {', '.join(rows)})"
        )
        errors.append(message)
        print_issue("[HIBA]", path, None, message)

    category_counts = Counter(
        entry.category for entry in entries if entry.category
    )

    print(
        f"  {len(entries)} feladvány · "
        f"{len(category_counts)} kategória · "
        f"{len(duplicates)} belső duplikáció"
    )

    if category_counts:
        distribution = ", ".join(
            f"{category}: {count}"
            for category, count in sorted(category_counts.items())
        )
        print(f"  Kategóriák: {distribution}")

    return entries


def check_cross_dataset_duplicates(
    entries: list[PuzzleEntry],
    warnings: list[str],
) -> None:
    by_puzzle: dict[str, list[PuzzleEntry]] = defaultdict(list)

    for entry in entries:
        if entry.normalized:
            by_puzzle[entry.normalized].append(entry)

    duplicates = []
    for puzzle, matches in sorted(by_puzzle.items()):
        levels = {match.level for match in matches}
        if len(levels) > 1:
            duplicates.append((puzzle, matches))

    if not duplicates:
        print("\nSzintek közötti duplikáció: nincs.")
        return

    print("\nSzintek közötti duplikációk:")
    for puzzle, matches in duplicates:
        locations = ", ".join(
            f"{match.level} ({match.path.name}:{match.row_number})"
            for match in matches
        )
        message = f"{puzzle!r} több nehézségi szinten is szerepel: {locations}"
        warnings.append(message)
        print(f"  [FIGYELMEZTETÉS] {message}")


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    errors: list[str] = []
    warnings: list[str] = []
    all_entries: list[PuzzleEntry] = []

    print("KriszWheel – Feladvány-validátor")
    print("=" * 38)
    print(
        f"Tábla: {BOARD_COLS}×{BOARD_ROWS} · "
        f"Elvárt elemszám: {EXPECTED_COUNT} / nehézség"
    )

    for level, relative_path in DATASETS.items():
        all_entries.extend(
            read_dataset(root, level, relative_path, errors, warnings)
        )

    check_cross_dataset_duplicates(all_entries, warnings)

    print("\n" + "=" * 38)
    print(f"Összes ellenőrzött feladvány: {len(all_entries)}")
    print(f"Hibák: {len(errors)}")
    print(f"Figyelmeztetések: {len(warnings)}")

    if errors:
        print("\nEREDMÉNY: SIKERTELEN")
        print("Javítsd a [HIBA] jelölésű problémákat, majd futtasd újra a scriptet.")
        return 1

    print("\nEREDMÉNY: SIKERES")
    if warnings:
        print(
            "A feladványkészlet használható, de a figyelmeztetéseket "
            "érdemes átnézni."
        )
    else:
        print("A feladványkészlet minden ellenőrzésen átment.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
