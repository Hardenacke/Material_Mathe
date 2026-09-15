"""Manim Community Edition: Heron-Verfahren für √20 in Klasse 9.

Render im Ordner dieser Datei:
    python -m manim -ql --fps 15 video_heron.py HeronVerfahren
    python -m manim -qh --fps 30 -o heron_sqrt20 video_heron.py HeronVerfahren

Bei jeder animierten Rechteckform gilt EXAKT: Breite · Höhe = 20.
Nur die angezeigten Seitenlängen und Näherungswerte werden gerundet.
"""

from manim import *
import re

from shared import (
    FONT, BLUE, GREEN, INK, LIGHT_BLUE, LIGHT_GREEN, LIGHT_ORANGE,
    LIGHT_TEAL, MUTED, ORANGE, PURPLE, TEAL,
    make_card, make_title, prepare, wait_read,
)


RADIKAND = 20.0
RECHTECK_SKALA = 0.69
RECHTECK_MITTE = LEFT * 3.25 + DOWN * 0.38


def heron_schritt(x, a=RADIKAND):
    """Mittelwert der beiden Seiten eines Rechtecks der Fläche a."""
    if x <= 0 or a <= 0:
        raise ValueError("Heron braucht einen positiven Startwert und Radikanden.")
    return (x + a / x) / 2


def de_tex(zahl, stellen):
    """Dezimalwert für MathTex mit korrekt gesetztem Dezimalkomma."""
    return f"{zahl:.{stellen}f}".replace(".", "{,}")


def seiten_labels(rechteck, x_tex, y_tex):
    """Beschriftungen außerhalb des Rechtecks; gerundete Werte sind Näherungen."""
    laenge = MathTex(x_tex, font_size=36, color=TEAL)
    variable, wert = re.split(r"(?==|\\approx)", y_tex, maxsplit=1)
    breite = VGroup(
        MathTex(variable, font_size=30, color=ORANGE),
        MathTex(wert, font_size=30, color=ORANGE),
    ).arrange(DOWN, buff=0.12)
    if breite.width > 1.65:
        breite.scale_to_fit_width(1.65)
    laenge.next_to(rechteck, DOWN, buff=0.27)
    breite.next_to(rechteck, LEFT, buff=0.20)
    return VGroup(laenge, breite)


def grenzenbild(unten, oben, sichtbereich, schritt, unten_text, oben_text,
                karten_text):
    """Eine Zahlengerade mit den beiden exakten Rechteckseiten als Grenzen."""
    linie = NumberLine(
        x_range=[sichtbereich[0], sichtbereich[1], schritt],
        length=9.3, include_numbers=False, include_tip=False,
        color=INK, stroke_width=3,
    ).move_to(DOWN * 0.15)
    p_unten = linie.n2p(unten)
    p_oben = linie.n2p(oben)
    balken = Line(p_unten + UP * 0.28, p_oben + UP * 0.28,
                  stroke_width=12, color=BLUE)
    linkspunkt = Dot(p_unten, radius=0.12, color=ORANGE)
    rechtspunkt = Dot(p_oben, radius=0.12, color=TEAL)
    unten_label = Text(unten_text, font=FONT, font_size=25,
                       color=ORANGE).next_to(linkspunkt, DOWN, buff=0.30)
    oben_label = Text(oben_text, font=FONT, font_size=25,
                      color=TEAL).next_to(rechtspunkt, DOWN, buff=0.30)
    erklaerung = Text("Die gesuchte Wurzel liegt zwischen den Seiten.",
                      font=FONT, font_size=24, color=BLUE)
    erklaerung.next_to(balken, UP, buff=0.30)
    info = make_card(karten_text, color=BLUE, fill_color=LIGHT_BLUE,
                     width=7.8, height=0.84, font_size=25)
    info.move_to(DOWN * 2.0)
    return VGroup(linie, balken, linkspunkt, rechtspunkt,
                  unten_label, oben_label, erklaerung, info)


class HeronVerfahren(Scene):
    """Rechtecke mit Fläche 20, Iteration ab 5 und sichere Grenzen."""

    def construct(self):
        prepare(self)
        a = RADIKAND
        x0 = 5.0
        x1 = heron_schritt(x0, a)
        x2 = heron_schritt(x1, a)
        x3 = heron_schritt(x2, a)

        titel = make_title("Das Heron-Verfahren", "Wie finden wir √20 ohne fertige Quadratzahl?")
        frage = MathTex(r"\sqrt{20}=\,?", font_size=77, color=INK).move_to(UP * 0.55)
        start = make_card("Aus dem letzten Video: 4 < √20 < 5",
                          color=BLUE, fill_color=LIGHT_BLUE,
                          width=8.0, height=0.95, font_size=27)
        start.move_to(DOWN * 1.13)
        self.play(FadeIn(titel), Write(frage), run_time=1.3)
        self.play(FadeIn(start, shift=UP * 0.13), run_time=0.8)
        wait_read(self, 2.2)
        self.play(FadeOut(VGroup(titel, frage, start)), run_time=0.65)

        titel_geo = make_title("Vom Rechteck zum Quadrat", "Alle Rechtecke behalten die Fläche 20.")
        wert = ValueTracker(x0)
        # Im Gegensatz zu einem Transform zweier Rechtecke stimmt die Fläche
        # auch WÄHREND der Animation: x(t) · (20/x(t)) = 20.
        rechteck = always_redraw(
            lambda: Rectangle(
                width=RECHTECK_SKALA * wert.get_value(),
                height=RECHTECK_SKALA * a / wert.get_value(),
                color=TEAL, stroke_width=3,
                fill_color=LIGHT_TEAL, fill_opacity=0.84,
            ).move_to(RECHTECK_MITTE)
        )
        flaeche = MathTex(r"A=20", font_size=50, color=INK).move_to(RECHTECK_MITTE)
        labels = seiten_labels(rechteck, r"x_0=5", r"y_0=4")
        rechts_titel = Text("1. Seite wählen, 2. Seite berechnen",
                             font=FONT, font_size=24,
                             color=MUTED).move_to(RIGHT * 2.85 + UP * 1.55)
        formel_0 = MathTex(r"y_0=\frac{20}{x_0}=\frac{20}{5}=4",
                            font_size=42, color=ORANGE)
        formel_0.move_to(RIGHT * 2.85 + UP * 0.6)
        probe_0 = make_card("5 · 4 = 20: Die Fläche stimmt.",
                            color=TEAL, fill_color=LIGHT_TEAL,
                            width=5.75, height=0.83, font_size=25)
        probe_0.move_to(RIGHT * 2.85 + DOWN * 0.65)
        startrechteck = Rectangle(
            width=RECHTECK_SKALA * x0,
            height=RECHTECK_SKALA * a / x0,
            color=TEAL, stroke_width=3,
            fill_color=LIGHT_TEAL, fill_opacity=0.84,
        ).move_to(RECHTECK_MITTE)
        self.play(FadeIn(titel_geo), Create(startrechteck), run_time=1.25)
        self.remove(startrechteck)
        self.add(rechteck)
        self.play(Write(flaeche), FadeIn(labels), run_time=0.9)
        self.play(FadeIn(rechts_titel), Write(formel_0), run_time=1.15)
        self.play(FadeIn(probe_0), run_time=0.7)
        wait_read(self, 2.2)

        self.play(FadeOut(VGroup(rechts_titel, formel_0, probe_0)), run_time=0.5)
        rechts_titel = Text("Nun den Mittelwert bilden:", font=FONT,
                             font_size=26, color=BLUE).move_to(RIGHT * 2.85 + UP * 1.45)
        schritt_1 = MathTex(
            r"x_1=\frac{x_0+y_0}{2}",
            r"=\frac{5+4}{2}=4{,}5",
            font_size=40, color=BLUE,
        ).arrange(DOWN, buff=0.27).move_to(RIGHT * 2.85 + UP * 0.37)
        note_1 = make_card("Neue 2. Seite: 20 / 4,5 ≈ 4,4444",
                           color=ORANGE, fill_color=LIGHT_ORANGE,
                           width=5.8, height=0.85, font_size=24)
        note_1.move_to(RIGHT * 2.85 + DOWN * 1.35)
        self.play(FadeIn(rechts_titel), Write(schritt_1), run_time=1.4)
        wait_read(self, 1.7)
        self.play(FadeOut(labels), wert.animate.set_value(x1), run_time=1.35)
        labels = seiten_labels(rechteck, r"x_1=4{,}5",
                               r"y_1\approx4{,}4444")
        self.play(FadeIn(labels), FadeIn(note_1), run_time=0.75)
        wait_read(self, 2.3)

        self.play(FadeOut(VGroup(rechts_titel, schritt_1, note_1)), run_time=0.5)
        rechts_titel = Text("Noch einmal dasselbe Verfahren:",
                             font=FONT, font_size=26,
                             color=BLUE).move_to(RIGHT * 2.85 + UP * 1.44)
        schritt_2 = MathTex(
            r"x_2=\frac{x_1+20/x_1}{2}",
            r"=\frac{4{,}5+20/4{,}5}{2}",
            r"\approx4{,}47222",
            font_size=37, color=BLUE,
        ).arrange(DOWN, buff=0.24).move_to(RIGHT * 2.85 + DOWN * 0.02)
        note_2 = make_card("",
                           color=ORANGE, fill_color=LIGHT_ORANGE,
                           width=5.8, height=0.85, font_size=24)
        note_2.move_to(RIGHT * 2.85 + DOWN * 1.80)
        note_2_text = MathTex(r"\text{Neue 2. Seite: }20/x_2\approx4{,}47205",
                              font_size=30, color=INK).move_to(note_2)
        note_2.add(note_2_text)
        self.play(FadeIn(rechts_titel), Write(schritt_2), run_time=1.45)
        wait_read(self, 2.1)
        self.play(FadeOut(labels), wert.animate.set_value(x2), run_time=1.35)
        labels = seiten_labels(rechteck, rf"x_2\approx{de_tex(x2, 5)}",
                               rf"y_2\approx{de_tex(a/x2, 5)}")
        self.play(FadeIn(labels), FadeIn(note_2), run_time=0.75)
        wait_read(self, 2.3)

        rechteck.clear_updaters()
        self.play(FadeOut(VGroup(titel_geo, rechteck, flaeche, labels,
                                  rechts_titel, schritt_2, note_2)),
                  run_time=0.75)
        # Der Tracker allein wird nicht gerendert, sein Wert bleibt erhalten.

        titel_warum = make_title("Warum wird die Näherung besser?",
                                 "Beide Seiten liegen auf unterschiedlichen Seiten von √20.")
        bild_0 = grenzenbild(
            a / x0, x0, [3.8, 5.2], 0.2, "4", "5",
            "4 < √20 < 5       Abstand der Seiten: 1",
        )
        self.play(FadeIn(titel_warum), Create(bild_0[0]),
                  Create(bild_0[1]), FadeIn(bild_0[2:]),
                  run_time=1.35)
        wait_read(self, 2.3)
        bild_1 = grenzenbild(
            a / x1, x1, [4.43, 4.52], 0.01, "4,4444...", "4,5",
            "4,4444... < √20 < 4,5       Abstand ≈ 0,0556",
        )
        self.play(FadeOut(bild_0), FadeIn(bild_1), run_time=1.1)
        wait_read(self, 2.4)
        erklaerung = make_card(
            "Mittelwert bilden → andere Seite anpassen → Grenzen enger",
            color=PURPLE, fill_color="#EEE7FA", width=11.0,
            height=0.88, font_size=24,
        ).move_to(UP * 1.38)
        self.play(FadeIn(erklaerung), run_time=0.6)
        wait_read(self, 1.8)
        self.play(FadeOut(VGroup(titel_warum, bild_1, erklaerung)),
                  run_time=0.65)

        titel_letzte = make_title("Fast ein Quadrat", "Die beiden Seiten rücken immer näher zusammen.")
        x_3_formel = MathTex(
            r"x_3=\frac{x_2+20/x_2}{2}\approx4{,}47214",
            font_size=44, color=BLUE,
        ).move_to(UP * 0.88)
        probe = MathTex(r"(4{,}47214)^2\approx20{,}00004\approx20",
                         font_size=38, color=ORANGE).move_to(DOWN * 0.35)
        merksatz = make_card(
            "Sind die Seiten gleich groß, gilt x · x = 20: x = √20.",
            color=GREEN, fill_color=LIGHT_GREEN, width=10.3,
            height=0.94, font_size=25,
        ).move_to(DOWN * 1.67)
        self.play(FadeIn(titel_letzte), Write(x_3_formel), run_time=1.1)
        self.play(Write(probe), FadeIn(merksatz), run_time=1.2)
        wait_read(self, 3.0)
        self.play(FadeOut(VGroup(titel_letzte, x_3_formel, probe, merksatz)),
                  run_time=0.65)

        titel_merke = make_title("Das Verfahren in einem Satz",
                                  "Mit einem positiven Startwert wiederholen wir denselben Schritt.")
        regel = MathTex(
            r"x_{n+1}=\frac{1}{2}\left(x_n+\frac{a}{x_n}\right),"
            r"\qquad a>0,\quad x_0>0",
            font_size=47, color=BLUE,
        ).move_to(UP * 0.55)
        ergebnis = make_card("Für a = 20: √20 ≈ 4,47214",
                             color=GREEN, fill_color=LIGHT_GREEN,
                             width=7.7, height=0.93, font_size=29)
        ergebnis.move_to(DOWN * 0.86)
        transfer = Text("Dein Start für √50 mit 8: Wie groß ist die zweite Seite?",
                        font=FONT, font_size=22,
                        color=MUTED).move_to(DOWN * 2.03)
        self.play(FadeIn(titel_merke), Write(regel), run_time=1.2)
        self.play(FadeIn(ergebnis), FadeIn(transfer), run_time=0.8)
        wait_read(self, 3.2)
