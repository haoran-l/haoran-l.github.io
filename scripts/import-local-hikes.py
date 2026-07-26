from pathlib import Path
import argparse

from PIL import Image, ImageOps


ALBUMS = {
    "Kai Kung Leng": "kai-kung-leng",
    "Luk Chau Stone Bushland": "luk-chau-stone-bushland",
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "assets" / "img" / "hikes",
    )
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)

    for folder_name, slug in ALBUMS.items():
        source_directory = args.source / folder_name
        source_images = sorted(
            path
            for path in source_directory.iterdir()
            if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png"}
        )
        if not source_images:
            raise RuntimeError(f"No images found in {source_directory}")

        for stale in args.output.glob(f"{slug}*.jpg"):
            stale.unlink()

        for index, source_image in enumerate(source_images):
            suffix = "" if index == 0 else f"-{index + 1:02d}"
            target = args.output / f"{slug}{suffix}.jpg"

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

        print(f"{slug}: imported {len(source_images)} photographs")


if __name__ == "__main__":
    main()
