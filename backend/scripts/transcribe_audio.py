#!/usr/bin/env python3
"""
Ses dosyasını metne çevirir (stdout: JSON, UTF-8).
Öncelik: mlx_whisper (Apple Silicon + MLX). Yoksa: faster-whisper (CPU).

Kurulum (birini veya ikisini):
  pip install mlx-whisper
  pip install faster-whisper

ffmpeg sistemde olmalı (çoğu format için faster-whisper ihtiyaç duyar).

Varsayılanlar Türkçe konuşma için: WHISPER_LANGUAGE=tr, küçük model yerine small.
MLX (M serisi): mlx-community/whisper-small-mlx
faster-whisper: CTranslate2 MPS desteklemez; Mac'te hız için öncelikle MLX yolu.
"""

from __future__ import annotations

import json
import os
import sys
from typing import Optional


def whisper_language() -> Optional[str]:
    """Whisper dil kodu (örn. tr) veya otomatik algılama için None."""
    raw = os.environ.get("WHISPER_LANGUAGE", "tr").strip().lower()
    if raw in ("", "auto", "detect"):
        return None
    return raw


def transcribe_mlx(path: str, language: Optional[str]) -> str:
    import mlx_whisper

    repo = os.environ.get("MLX_WHISPER_MODEL", "mlx-community/whisper-small-mlx")
    kwargs: dict = {"path_or_hf_repo": repo}
    if language:
        kwargs["language"] = language
    result = mlx_whisper.transcribe(path, **kwargs)
    if isinstance(result, dict) and "text" in result:
        return str(result["text"] or "").strip()
    if isinstance(result, str):
        return result.strip()
    return str(result).strip()


def transcribe_faster(path: str, language: Optional[str]) -> str:
    from faster_whisper import WhisperModel

    model_name = os.environ.get("FASTER_WHISPER_MODEL", "small")
    device = os.environ.get("FASTER_WHISPER_DEVICE", "cpu")
    compute = os.environ.get("FASTER_WHISPER_COMPUTE", "int8")
    model = WhisperModel(model_name, device=device, compute_type=compute)
    kw: dict = {}
    if language:
        kw["language"] = language
    segments, _info = model.transcribe(path, **kw)
    parts: list[str] = []
    for seg in segments:
        parts.append(seg.text)
    return "".join(parts).strip()


def main() -> None:
    if len(sys.argv) < 2:
        print(
            json.dumps(
                {"ok": False, "error": "Kullanım: transcribe_audio.py <ses_dosyası>"},
                ensure_ascii=False,
            )
        )
        sys.exit(2)

    path = sys.argv[1]
    if not os.path.isfile(path):
        print(
            json.dumps({"ok": False, "error": f"Dosya yok: {path}"}, ensure_ascii=False)
        )
        sys.exit(2)

    prefer = os.environ.get("WHISPER_BACKEND", "auto").lower().strip()
    lang = whisper_language()

    def try_mlx() -> tuple[str, str]:
        return transcribe_mlx(path, lang), "mlx_whisper"

    def try_faster() -> tuple[str, str]:
        return transcribe_faster(path, lang), "faster_whisper"

    text = ""
    engine = ""

    try:
        if prefer == "mlx":
            text, engine = try_mlx()
        elif prefer == "faster":
            text, engine = try_faster()
        else:
            # auto
            try:
                text, engine = try_mlx()
            except Exception:
                text, engine = try_faster()

        print(
            json.dumps(
                {"ok": True, "text": text, "engine": engine},
                ensure_ascii=False,
            )
        )
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
