"""Manim Community Edition: Intervallschachtelung bei √20 (Klasse 9).

Aufruf im Ordner dieser Datei:
    manim -ql --fps 15 video_intervallschachtelung.py Intervallschachtelung
    manim -qh --fps 30 video_intervallschachtelung.py Intervallschachtelung

Die Intervalle werden auf vergrößerten Zahlengeraden gezeigt; ein Punkt in
der Mitte wäre irreführend, denn √20 ist nicht der Intervallmittelpunkt.
"""

from math import sqrt

from manim import *

from shared import (
    FONT, BLUE, GREEN, INK, LIGHT_BLUE, LIGHT_GREEN, LIGHT_ORANGE,
    MUTED, ORANGE, PURPLE, TEAL, YELLOW,
    make_card, make_title, prepare, wait_read,
)


def intervall_bild(anfang, ende, sichtbarer_bereich, schritt, breite,
                   linkes_label, rechtes_label, hinweis):
    """Visualisiert ein Intervall ohne den unbekannten Wert vorzutäuschen.

    Die Zahlengerade wird in jedem Näherungsschritt gezoomt. Somit bleibt
    das neue, zehnfach engere Intervall auf dem iPad gut sichtbar.
    """
    zahlenstrahl = NumberLine(
        x_range=[sichtbarer_bereich[0], sichtbarer_bereich[1], schritt],
        length=9.3, include_numbers=False, include_tip=False,
        color=INK, stroke_width=3,
    ).move_to(DOWN * 0.35)
    links = zahlenstrahl.n2p(anfang)
    rechts = zahlenstrahl.n2p(ende)
    balken = Line(links + UP * 0.31, rechts + UP * 0.31,
                  color=BLUE, stroke_width=13)
    punkt_links = Dot(links, radius=0.115, color=TEAL)
    punkt_rechts = Dot(rechts, radius=0.115, color=ORANGE)
    name_links = Text(linkes_label, font=FONT, font_size=25,
                      color=TEAL).next_to(punkt_links, DOWN, buff=0.26)
    name_rechts = Text(rechtes_label, font=FONT, font_size=25,
                       color=ORANGE).next_to(punkt_rechts, DOWN, buff=0.26)
    erklaerung = Text(hinweis, font=FONT, font_size=22,
                      color=BLUE).next_to(balken, UP, buff=0.29)
    fehler = make_card("Intervallbreite: " + breite, color=BLUE,
                       fill_color=LIGHT_BLUE, width=5.3, height=0.81,
                       font_size=25).move_to(DOWN * 2.2)
    return VGroup(zahlenstrahl, balken, punkt_links, punkt_rechts,
                  name_links, name_rechts, erklaerung, fehler)


class Intervallschachtelung(Scene):
    """√20: [4; 5] → [4,4; 4,5] → [4,47; 4,48]."""

    def construct(self):
        prepare(self)
        titel = make_title("Intervallschachtelung", "Wie bestimmen wir √20 näherungsweise?")
        frage = MathTex(r"\sqrt{20}=\,?", font_size=77, color=INK).move_to(UP * 0.57)
        untertitel = Text(
            "20 ist keine Quadratzahl. Wir suchen zunächst zwei bekannte Grenzen.",
            font=FONT, font_size=22, color=MUTED,
        ).next_to(frage, DOWN, buff=0.35)
        self.play(FadeIn(titel, shift=DOWN * 0.12), run_time=0.8)
        self.play(Write(frage), FadeIn(untertitel), run_time=1.2)
        wait_read(self, 2.0)
        karten = VGroup(
            make_card("4² = 16 < 20", color=TEAL, fill_color="#E3F6F3",
                      width=3.9, height=0.9, font_size=28),
            make_card("20 < 25 = 5²", color=ORANGE, fill_color=LIGHT_ORANGE,
                      width=3.9, height=0.9, font_size=28),
        ).arrange(RIGHT, buff=0.7).move_to(DOWN * 1.22)
        grenzt = MathTex(r"4<\sqrt{20}<5", font_size=47, color=BLUE)
        grenzt.next_to(karten, DOWN, buff=0.36)
        self.play(FadeIn(karten, shift=UP * 0.1), run_time=1.0)
        self.play(Write(grenzt), run_time=0.9)
        wait_read(self, 2.3)
        self.play(FadeOut(VGroup(titel, frage, untertitel, karten, grenzt)), run_time=0.7)

        # Das Quadrat wächst auf der positiven Seite streng mit der Seitenlänge.
        # Die Waagerechte y=20 trifft die Parabel bei x=√20.
        graf_titel = make_title("Warum helfen die Quadratzahlen?", "Im Graphen y = x² suchen wir y = 20.")
        achsen = Axes(
            x_range=[0, 5.3, 1], y_range=[0, 29, 5],
            x_length=5.4, y_length=3.5,
            axis_config={"color": INK, "include_tip": False, "font_size": 22},
        ).move_to(LEFT * 2.7 + DOWN * 0.29)
        kurve = achsen.plot(lambda x: x * x, x_range=[0, 5.15],
                            color=PURPLE, stroke_width=4)
        y20 = Line(achsen.c2p(0, 20), achsen.c2p(5.15, 20), color=ORANGE, stroke_width=3)
        start_y = achsen.c2p(sqrt(20), 0)
        treffer = Dot(achsen.c2p(sqrt(20), 20), color=GREEN, radius=0.11)
        lot = DashedLine(start_y, treffer.get_center(), color=GREEN, stroke_width=3)
        waagrecht = Text("20", font=FONT, font_size=23,
                         color=ORANGE).next_to(achsen.c2p(0, 20), LEFT, buff=0.18)
        unter_punkt = MathTex(r"\sqrt{20}", font_size=27, color=GREEN)
        unter_punkt.next_to(start_y, DOWN, buff=0.13)
        hinweise = VGroup(
            make_card("4² = 16 < 20", color=TEAL, fill_color="#E3F6F3",
                      width=3.85, height=0.8, font_size=24),
            make_card("5² = 25 > 20", color=ORANGE, fill_color=LIGHT_ORANGE,
                      width=3.85, height=0.8, font_size=24),
            make_card("Also: 4 < √20 < 5", color=BLUE, fill_color=LIGHT_BLUE,
                      width=4.75, height=0.8, font_size=24),
        ).arrange(DOWN, buff=0.2).move_to(RIGHT * 3.1 + DOWN * 0.22)
        self.play(FadeIn(graf_titel), Create(achsen), run_time=1.3)
        self.play(Create(kurve), run_time=1.5)
        self.play(Create(y20), FadeIn(waagrecht), run_time=0.75)
        self.play(FadeIn(treffer), Create(lot), FadeIn(unter_punkt), run_time=0.9)
        self.play(LaggedStart(*[FadeIn(karte) for karte in hinweise], lag_ratio=0.2), run_time=1.2)
        wait_read(self, 2.6)
        self.play(FadeOut(VGroup(graf_titel, achsen, kurve, y20, waagrecht,
                                 treffer, lot, unter_punkt, hinweise)), run_time=0.7)

        titel_1 = make_title("1. Schritt: Ganzzahlige Grenzen", "Wir kennen √20 noch nicht, aber seinen Bereich.")
        interval_1 = intervall_bild(
            4, 5, [3.8, 5.2], 0.2, "1", "4", "5",
            "√20 liegt irgendwo im blauen Abschnitt",
        )
        begrenzung_1 = MathTex(r"4^2<20<5^2\quad\Rightarrow\quad4<\sqrt{20}<5",
                                font_size=35, color=INK).move_to(UP * 1.55)
        self.play(FadeIn(titel_1), Write(begrenzung_1), run_time=1.1)
        self.play(Create(interval_1[0]), Create(interval_1[1]),
                  FadeIn(interval_1[2:]), run_time=1.5)
        wait_read(self, 2.8)
        self.play(FadeOut(VGroup(titel_1, interval_1, begrenzung_1)), run_time=0.7)

        # Klammern sind wichtig: (4,4)² statt 4,4², denn nur die ganze Zahl
        # wird quadriert. {,} setzt im MathTex ein Dezimalkomma.
        titel_2 = make_title("2. Schritt: Zehntel vergleichen", "Wir testen wieder durch Quadrieren.")
        test_2 = VGroup(
            MathTex(r"(4{,}4)^2=19{,}36<20", font_size=34, color=TEAL),
            MathTex(r"20<20{,}25=(4{,}5)^2", font_size=34, color=ORANGE),
        ).arrange(RIGHT, buff=0.7).move_to(UP * 1.35)
        interval_2 = intervall_bild(
            4.4, 4.5, [4.38, 4.52], 0.02, "0,1", "4,4", "4,5",
            "4,4 < √20 < 4,5",
        )
        self.play(FadeIn(titel_2), run_time=0.8)
        self.play(Write(test_2), run_time=1.3)
        wait_read(self, 1.2)
        self.play(Create(interval_2[0]), Create(interval_2[1]),
                  FadeIn(interval_2[2:]), run_time=1.5)
        wait_read(self, 2.8)
        self.play(FadeOut(VGroup(titel_2, test_2, interval_2)), run_time=0.7)

        titel_3 = make_title("3. Schritt: Hundertstel vergleichen", "Dasselbe Verfahren verengt den Bereich weiter.")
        test_3 = VGroup(
            MathTex(r"(4{,}47)^2=19{,}9809<20", font_size=31, color=TEAL),
            MathTex(r"20<20{,}0704=(4{,}48)^2", font_size=31, color=ORANGE),
        ).arrange(RIGHT, buff=0.48).move_to(UP * 1.35)
        interval_3 = intervall_bild(
            4.47, 4.48, [4.468, 4.482], 0.002, "0,01", "4,47", "4,48",
            "4,47 < √20 < 4,48",
        )
        self.play(FadeIn(titel_3), run_time=0.8)
        self.play(Write(test_3), run_time=1.3)
        wait_read(self, 1.2)
        self.play(Create(interval_3[0]), Create(interval_3[1]),
                  FadeIn(interval_3[2:]), run_time=1.5)
        wait_read(self, 2.8)
        self.play(FadeOut(VGroup(titel_3, test_3, interval_3)), run_time=0.7)

        praezise_titel = make_title("Warum wird die Näherung besser?", "Jede Zoomstufe hat engere sichere Grenzen.")
        intervalle = VGroup(
            make_card("[4; 5]   Breite 1", color=BLUE, fill_color=LIGHT_BLUE,
                      width=5.35, height=0.82, font_size=25),
            make_card("[4,4; 4,5]   Breite 0,1", color=BLUE, fill_color=LIGHT_BLUE,
                      width=5.35, height=0.82, font_size=25),
            make_card("[4,47; 4,48]   Breite 0,01", color=BLUE, fill_color=LIGHT_BLUE,
                      width=5.35, height=0.82, font_size=25),
        ).arrange(DOWN, buff=0.2).move_to(LEFT * 2.9 + DOWN * 0.48)
        wert = make_card("√20 ≈ 4,47", color=GREEN, fill_color=LIGHT_GREEN,
                         width=4.15, height=1.0, font_size=31).move_to(RIGHT * 3.0)
        fehler = Text(
            "Der Fehler ist kleiner als 0,01.",
            font=FONT, font_size=22, color=GREEN,
        ).next_to(wert, DOWN, buff=0.34)
        self.play(FadeIn(praezise_titel), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(karte, shift=UP * 0.1) for karte in intervalle],
                              lag_ratio=0.27), run_time=1.5)
        self.play(FadeIn(wert), FadeIn(fehler), run_time=0.8)
        wait_read(self, 2.8)
        self.play(FadeOut(VGroup(praezise_titel, intervalle, wert, fehler)), run_time=0.7)

        merksatz_titel = make_title(
            "Merke: Schachteln statt Raten", "Quadrieren prüft die Grenzen des Intervalls."
        )
        regel = make_card(
            "Radikand einordnen → Intervall weiter verengen",
            color=BLUE, fill_color=LIGHT_BLUE, width=10.1, height=1.0,
            font_size=26,
        ).move_to(UP * 0.5)
        transfer = make_card(
            "Start für √50: 7² < 50 < 8²",
            color=YELLOW, fill_color="#FFF8D9", width=7.5,
            height=0.92, font_size=26,
        ).move_to(DOWN * 1.0)
        self.play(FadeIn(merksatz_titel), FadeIn(regel), run_time=1.1)
        wait_read(self, 1.1)
        self.play(FadeIn(transfer, shift=UP * 0.1), run_time=0.7)
        wait_read(self, 3.0)
