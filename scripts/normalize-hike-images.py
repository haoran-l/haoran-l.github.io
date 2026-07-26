from pathlib import Path
import sys

from PIL import Image


def main() -> None:
    root = Path(sys.argv[1]).resolve()

    for path in sorted(root.glob("*.jpg")):
        with Image.open(path) as image:
            image.load()
            if image.format == "JPEG":
                continue

            rgb = image.convert("RGB")
            temporary = path.with_suffix(".normalized.jpg")
            rgb.save(
                temporary,
                "JPEG",
                quality=90,
                optimize=True,
                progressive=True,
            )
            temporary.replace(path)


if __name__ == "__main__":
    main()
