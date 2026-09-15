"""Gemeinsame Gestaltungselemente für die Wurzel-Videos.

Die Datei wird von den Manim-Szenen importiert. Sie enthält bewusst
keine inhaltliche Logik, damit die mathematischen Erklärungen in den Szenen
leicht angepasst werden können.
"""

from manim import *
from manimpango import list_fonts

FONT = next((font for font in ("DejaVu Sans", "Arial", "Liberation Sans")
             if font in list_fonts()), "sans-serif")


# Helle, iPad-freundliche Farbpalette
BG = "#F7FAFC"
INK = "#172B4D"
MUTED = "#52606D"
BLUE = "#2166F3"
TEAL = "#008B8B"
GREEN = "#1B9E5A"
ORANGE = "#E67E22"
RED = "#C0392B"
PURPLE = "#7048A8"
YELLOW = "#F2C94C"
LIGHT_BLUE = "#DCE9FF"
LIGHT_TEAL = "#D9F3F0"
LIGHT_ORANGE = "#FDE7D3"
LIGHT_GREEN = "#DFF5E8"


def prepare(scene):
    """Setzt den hellen Hintergrund für die aktuelle Szene."""
    scene.camera.background_color = BG
    MathTex.set_default(color=INK)


def make_title(text, subtitle=None):
    """Erzeugt einen einheitlichen Titelblock."""
    heading = Text(text, font=FONT, font_size=34, color=INK)
    if heading.width > config.frame_width - 0.7:
        heading.scale_to_fit_width(config.frame_width - 0.7)
    heading.to_edge(UP, buff=0.35)
    if subtitle is None:
        return heading
    sub = Text(subtitle, font=FONT, font_size=18, color=MUTED)
    if sub.width > config.frame_width - 0.7:
        sub.scale_to_fit_width(config.frame_width - 0.7)
    sub.next_to(heading, DOWN, buff=0.12)
    return VGroup(heading, sub)


def make_card(text, color=BLUE, fill_color=WHITE, font_size=22,
              width=4.4, height=0.8):
    """Kompakte farbige Textkarte für Merksätze und Begriffe."""
    label = Text(text, font=FONT, font_size=font_size, color=INK)
    if label.width > width - 0.35:
        label.scale_to_fit_width(width - 0.35)
    if label.height > height - 0.22:
        label.scale_to_fit_height(height - 0.22)
    box = RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.14,
        stroke_color=color,
        stroke_width=2.2,
        fill_color=fill_color,
        fill_opacity=1,
    )
    label.move_to(box.get_center())
    return VGroup(box, label)


def label_with_line(label_text, point, direction=DOWN, color=INK,
                    line_color=MUTED, font_size=21):
    """Beschriftung mit kurzer Verbindungslinie."""
    label = Text(label_text, font=FONT, font_size=font_size, color=color)
    label.next_to(point, direction, buff=0.18)
    line = Line(point, label.get_edge_center(-direction), color=line_color,
                stroke_width=2)
    return VGroup(line, label)


def wait_read(scene, seconds=1.0):
    """Lesepause mit zentraler Stelle für spätere Voiceover-Erweiterungen."""
    scene.wait(seconds)


def replace_scene(scene, old, new, read_time=1.5):
    """Blendeten einen Abschnitt aus und den nächsten mit kurzer Lesepause ein."""
    scene.play(FadeOut(old), run_time=0.6)
    scene.play(FadeIn(new, shift=DOWN * 0.12), run_time=0.8)
    wait_read(scene, read_time)
