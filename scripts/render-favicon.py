"""Render the simple vector favicon into transparent PNG and ICO fallbacks."""

from pathlib import Path
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "assets" / "img" / "favicon.svg"


def render(size):
    scale = size * 4 / 64
    image = Image.new("RGBA", (size * 4, size * 4), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for shape in ET.parse(SVG).getroot():
        tag = shape.tag.rsplit("}", 1)[-1]
        fill = shape.attrib["fill"]
        if tag == "circle":
            x, y, radius = (float(shape.attrib[key]) for key in ("cx", "cy", "r"))
            draw.ellipse(
                ((x - radius) * scale, (y - radius) * scale,
                 (x + radius) * scale, (y + radius) * scale),
                fill=fill,
            )
        elif tag == "polygon":
            points = [tuple(float(n) * scale for n in pair.split(","))
                      for pair in shape.attrib["points"].split()]
            draw.polygon(points, fill=fill)
        else:
            raise ValueError(f"Unsupported SVG shape: {tag}")
    return image.resize((size, size), Image.Resampling.LANCZOS)


if __name__ == "__main__":
    for size in (96, 192):
        render(size).save(ROOT / "assets" / "img" / f"favicon-{size}.png")
    render(256).save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
