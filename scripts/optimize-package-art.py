from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "public" / "packages" / "hand-painted"
MAX_EDGE = 640


for source in sorted(ROOT.rglob("*.png")):
    with Image.open(source) as image:
        image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        image.convert("RGB").save(
            source.with_suffix(".webp"),
            "WEBP",
            quality=82,
            method=6,
        )
