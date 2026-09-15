"""Manim Community Edition: Quadratwurzeln von Quadratzahlen (Klasse 9).

Aufruf im Ordner dieser Datei:
    manim -ql --fps 15 video_quadratzahlen.py WurzelQuadratzahlen
    manim -qh --fps 30 video_quadratzahlen.py WurzelQuadratzahlen

Keine Audiodatei notwendig. Die Bildschirmtexte tragen die ganze Erklärung.
"""

from manim import *

from shared import (
    FONT, BLUE, GREEN, INK, LIGHT_BLUE, LIGHT_GREEN, LIGHT_ORANGE,
    LIGHT_TEAL, MUTED, ORANGE, PURPLE, TEAL, YELLOW,
    make_card, make_title, prepare, wait_read,
)


def wurzel_mit_getrennten_begriffen():
    """Die Ziffern sind eigenständige Mobjects unter dem Wurzelbalken.

    Das Phantombild hält für den Radikanden Platz frei. Anders als bei
    `substrings_to_isolate=["25", "5"]` entstehen keine unvollständigen
    LaTeX-Bruchstücke und die Ergebnis-5 kann nicht mit der 5 in 25
    verwechselt werden.
    """
    symbol = MathTex(r"\sqrt{\phantom{25}}", font_size=88, color=BLUE)
    radikand = MathTex("25", font_size=88, color=ORANGE)
    gleich = MathTex("=", font_size=88, color=INK)
    wert = MathTex("5", font_size=88, color=GREEN)
    VGroup(symbol, gleich, wert).arrange(RIGHT, buff=0.24)
    radikand.align_to(symbol, RIGHT).shift(LEFT * 0.09 + DOWN * 0.04)
    gruppe = VGroup(symbol, radikand, gleich, wert)
    gruppe.move_to(UP * 0.45)
    return gruppe, symbol, radikand, wert


class WurzelQuadratzahlen(Scene):
    """Flächenmodell → Gegenaufgabe → Begriff-Check → Probe."""

    def construct(self):
        prepare(self)

        titel = make_title("Wurzelziehen bei Quadratzahlen", "Warum gilt √25 = 5?")
        frage = MathTex(r"\sqrt{25}=\,?", font_size=76, color=INK).move_to(UP * 0.35)
        leitfrage = Text(
            "Welche nichtnegative Zahl ergibt mit sich selbst multipliziert 25?",
            font=FONT, font_size=23, color=MUTED,
        ).next_to(frage, DOWN, buff=0.38)
        self.play(FadeIn(titel, shift=DOWN * 0.15), run_time=0.8)
        self.play(Write(frage), run_time=1.2)
        self.play(FadeIn(leitfrage, shift=UP * 0.12), run_time=0.8)
        wait_read(self, 2.4)
        self.play(FadeOut(titel), FadeOut(frage), FadeOut(leitfrage), run_time=0.6)

        flaeche_titel = make_title(
            "Vom Quadrat zur Gegenaufgabe", "25 Einheitsfelder: Wie lang ist eine Seite?"
        )
        self.play(FadeIn(flaeche_titel, shift=DOWN * 0.12), run_time=0.8)
        seite = 3.0 / 5
        mitte = LEFT * 2.45 + DOWN * 0.1
        felder = VGroup(*[
            Square(
                side_length=seite, stroke_color=TEAL, stroke_width=1.5,
                fill_color=LIGHT_TEAL, fill_opacity=0.8,
            ).move_to(mitte + RIGHT * (spalte - 2) * seite + UP * (2 - zeile) * seite)
            for zeile in range(5) for spalte in range(5)
        ])
        rahmen = Square(side_length=3.0, color=INK, stroke_width=3).move_to(mitte)
        self.play(LaggedStart(*[FadeIn(feld, scale=0.9) for feld in felder], lag_ratio=0.04), run_time=2.1)
        self.play(Create(rahmen), run_time=0.55)
        unten = MathTex("5", color=ORANGE, font_size=34).next_to(rahmen, DOWN, buff=0.17)
        links = MathTex("5", color=ORANGE, font_size=34).next_to(rahmen, LEFT, buff=0.17)
        rechnung = MathTex("5", r"\cdot", "5", "=", "25", font_size=50)
        rechnung[0].set_color(GREEN)
        rechnung[2].set_color(GREEN)
        rechnung[4].set_color(ORANGE)
        rechnung.move_to(RIGHT * 2.7 + UP * 0.35)
        ergebnis = make_card(
            "5 Reihen mit je 5 Feldern: 25", color=TEAL,
            fill_color=LIGHT_TEAL, width=5.5, height=0.9, font_size=25,
        ).next_to(rechnung, DOWN, buff=0.42)
        self.play(Write(unten), Write(links), run_time=0.8)
        self.play(Write(rechnung), run_time=1.2)
        self.play(FadeIn(ergebnis, shift=UP * 0.1), run_time=0.6)
        wait_read(self, 2.4)
        self.play(
            FadeOut(VGroup(flaeche_titel, felder, rahmen, unten, links, rechnung, ergebnis)),
            run_time=0.7,
        )

        gegen_titel = make_title(
            "Quadrieren und Radizieren sind Gegenaufgaben",
            "Mit der Wurzel fragen wir nach der Seitenlänge zurück.",
        )
        z5 = MathTex("5", font_size=67, color=GREEN).move_to(LEFT * 3.6)
        z25 = MathTex("25", font_size=67, color=ORANGE).move_to(RIGHT * 3.6)
        oben = Arrow(z5.get_right() + UP * 0.26, z25.get_left() + UP * 0.26,
                     color=BLUE, buff=0.1)
        unten_pfeil = Arrow(z25.get_left() + DOWN * 0.32, z5.get_right() + DOWN * 0.32,
                            color=PURPLE, buff=0.1)
        q_text = make_card("5 · 5 = 25", color=BLUE, fill_color=LIGHT_BLUE,
                           width=3.9, height=0.77, font_size=25)
        q_text.next_to(oben, UP, buff=0.16)
        r_text = make_card("√25 = 5", color=PURPLE, fill_color="#EEE7FA",
                           width=3.9, height=0.77, font_size=25)
        r_text.next_to(unten_pfeil, DOWN, buff=0.16)
        self.play(FadeIn(gegen_titel), Write(z5), Write(z25), run_time=1.0)
        self.play(GrowArrow(oben), FadeIn(q_text), run_time=1.0)
        wait_read(self, 1.0)
        self.play(GrowArrow(unten_pfeil), FadeIn(r_text), run_time=1.0)
        wait_read(self, 2.3)
        self.play(FadeOut(VGroup(gegen_titel, z5, z25, oben, unten_pfeil, q_text, r_text)), run_time=0.7)

        begriff_titel = make_title(
            "Fachbegriffe", "Ordne die drei Begriffe selbst dem Ausdruck zu."
        )
        ausdruck, symbol, radikand, wert = wurzel_mit_getrennten_begriffen()
        fragen = VGroup(*[
            make_card(text, color=farbe, fill_color=hintergrund,
                      width=3.55, height=0.75, font_size=22)
            for text, farbe, hintergrund in [
                ("Radikand = ?", ORANGE, LIGHT_ORANGE),
                ("Wurzelzeichen = ?", BLUE, LIGHT_BLUE),
                ("Wurzelwert = ?", GREEN, LIGHT_GREEN),
            ]
        ]).arrange(RIGHT, buff=0.23).move_to(DOWN * 1.45)
        self.play(FadeIn(begriff_titel), Write(ausdruck), run_time=1.5)
        self.play(LaggedStart(*[FadeIn(karte) for karte in fragen], lag_ratio=0.18), run_time=1.2)
        wait_read(self, 2.6)
        self.play(FadeOut(fragen), run_time=0.5)

        # Die Pfeile treffen eindeutige Manim-Objekte: Zeichen, Ziffern, Ergebnis.
        antworten = VGroup(
            make_card("√ : Wurzelzeichen", color=BLUE, fill_color=LIGHT_BLUE,
                      width=3.55, height=0.8, font_size=22).move_to(LEFT * 4 + UP * 1.42),
            make_card("25 : Radikand", color=ORANGE, fill_color=LIGHT_ORANGE,
                      width=3.1, height=0.8, font_size=22).move_to(LEFT * 3.35 + DOWN * 1.43),
            make_card("5 : Wurzelwert", color=GREEN, fill_color=LIGHT_GREEN,
                      width=3.1, height=0.8, font_size=22).move_to(RIGHT * 3.35 + DOWN * 1.43),
        )
        pfeile = VGroup(
            Arrow(antworten[0].get_right(), symbol.get_left() + UP * 0.18,
                  buff=0.09, color=BLUE, stroke_width=3, max_tip_length_to_length_ratio=0.08),
            Arrow(antworten[1].get_top(), radikand.get_bottom(),
                  buff=0.08, color=ORANGE, stroke_width=3, max_tip_length_to_length_ratio=0.08),
            Arrow(antworten[2].get_top(), wert.get_bottom(),
                  buff=0.08, color=GREEN, stroke_width=3, max_tip_length_to_length_ratio=0.08),
        )
        self.play(
            LaggedStart(*[FadeIn(karte) for karte in antworten], lag_ratio=0.17),
            LaggedStart(*[GrowArrow(pfeil) for pfeil in pfeile], lag_ratio=0.17),
            run_time=1.7,
        )
        wait_read(self, 2.6)
        self.play(FadeOut(VGroup(begriff_titel, ausdruck, antworten, pfeile)), run_time=0.7)

        probe_titel = make_title(
            "Probe: Wir quadrieren den Wurzelwert", "Die Gegenaufgabe muss wieder 25 ergeben."
        )
        probe = MathTex("5", r"\cdot", "5", "=", "25", font_size=66)
        probe[0].set_color(GREEN)
        probe[2].set_color(GREEN)
        probe[4].set_color(ORANGE)
        probe.move_to(UP * 0.76)
        note = make_card("25 ist wieder der Radikand.", color=ORANGE,
                         fill_color=LIGHT_ORANGE, width=5.4, height=0.82,
                         font_size=24).next_to(probe, DOWN, buff=0.34)
        self.play(FadeIn(probe_titel), Write(probe), run_time=1.3)
        self.play(FadeIn(note, shift=UP * 0.12), run_time=0.7)
        wait_read(self, 2.2)
        vergleich = VGroup(
            MathTex(r"\sqrt{25}=5", font_size=40, color=GREEN),
            MathTex(r"x^2=25\quad\Rightarrow\quad x=-5\;\text{oder}\;x=5",
                    font_size=37, color=PURPLE),
        ).arrange(DOWN, buff=0.22).move_to(DOWN * 1.28)
        warnung = Text(
            "Die Quadratwurzel bezeichnet immer den nichtnegativen Wert.",
            font=FONT, font_size=21, color=PURPLE,
        ).next_to(vergleich, DOWN, buff=0.24)
        self.play(FadeIn(vergleich, shift=UP * 0.1), run_time=0.8)
        self.play(FadeIn(warnung, shift=UP * 0.1), run_time=0.7)
        wait_read(self, 2.6)
        self.play(FadeOut(VGroup(probe_titel, probe, note, vergleich, warnung)), run_time=0.7)

        merksatz_titel = make_title("Merke", "Quadrieren prüft das Ergebnis des Wurzelziehens.")
        regel = MathTex(
            r"\sqrt a=b\;\Longleftrightarrow\;b^2=a\;\text{und}\;b\ge0",
            font_size=46, color=BLUE,
        ).move_to(UP * 0.55)
        aufgabe = make_card(
            "Übung: √81 = ? Welche Probe gehört dazu?",
            color=YELLOW, fill_color="#FFF8D9", width=8.7,
            height=0.96, font_size=27,
        ).move_to(DOWN * 0.95)
        self.play(FadeIn(merksatz_titel), Write(regel), run_time=1.3)
        wait_read(self, 1.2)
        self.play(FadeIn(aufgabe, shift=UP * 0.1), run_time=0.7)
        wait_read(self, 3.0)
