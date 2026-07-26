from pathlib import Path
import argparse

from PIL import Image, ImageOps


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("slug")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "assets" / "img" / "hikes",
    )
    args = parser.parse_args()

    source_images = sorted(
        path
        for path in args.source.iterdir()
        if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png"}
    )
    if not source_images:
        raise RuntimeError(f"No images found in {args.source}")

    args.output.mkdir(parents=True, exist_ok=True)
    for source_image in source_images:
        target = args.output / f"{args.slug}-{source_image.stem}.jpg"
        with Image.open(source_image) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            image.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
            image.save(
                target,
                "JPEG",
                quality=90,
                optimize=True,
                progressive=True,
            )

    print(f"{args.slug}: appended {len(source_images)} local photographs")


if __name__ == "__main__":
    main()
