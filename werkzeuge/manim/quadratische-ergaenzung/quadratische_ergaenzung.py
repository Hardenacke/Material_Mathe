from manim import *


BG = "#0B1020"
INK = "#F5F7FF"
BLUE = "#6EA8FE"
BLUE_DARK = "#263C69"
GOLD = "#FFC857"
GREEN = "#64D6A5"
MUTED = "#B9C4D8"


class SquareAreaIdea(Scene):
    """Geometric meaning of completing x^2 + 4x with four unit squares."""

    def construct(self):
        self.camera.background_color = BG
        title = MathTex(
            r"\text{Wie wird }x^2+4x\text{ ein Quadrat?}",
            font_size=39,
            color=INK,
        ).to_edge(UP, buff=0.34)
        self.play(Write(title), run_time=0.9)

        u = 0.62
        core = 3 * u
        outer = 5 * u
        cx, cy = -4.55, -0.30
        c = np.array([cx, cy, 0.0])
        schematic = MathTex(
            r"\text{Fl\"achenbild (f\"ur }x\ge0\text{)}",
            font_size=26,
            color=MUTED,
        ).move_to([cx, 1.95, 0])
        self.play(Write(schematic), run_time=0.55)

        center = Square(side_length=core)
        center.move_to(c)
        center.set_fill(BLUE_DARK, opacity=1)
        center.set_stroke(BLUE, width=2.5)

        strip_positions = [
            [cx, cy + core / 2 + u / 2, 0],
            [cx, cy - core / 2 - u / 2, 0],
            [cx - core / 2 - u / 2, cy, 0],
            [cx + core / 2 + u / 2, cy, 0],
        ]
        strips = VGroup()
        for i, pos in enumerate(strip_positions):
            if i < 2:
                rect = Rectangle(width=core, height=u)
            else:
                rect = Rectangle(width=u, height=core)
            rect.move_to(pos).set_fill("#315B96", opacity=1).set_stroke(BLUE, width=2.2)
            strips.add(rect)

        corner_positions = [
            [cx - core / 2 - u / 2, cy + core / 2 + u / 2, 0],
            [cx + core / 2 + u / 2, cy + core / 2 + u / 2, 0],
            [cx - core / 2 - u / 2, cy - core / 2 - u / 2, 0],
            [cx + core / 2 + u / 2, cy - core / 2 - u / 2, 0],
        ]
        corners = VGroup(*[
            Square(side_length=u)
            .move_to(pos)
            .set_fill(GOLD, opacity=0.88)
            .set_stroke("#FFE7A8", width=2)
            for pos in corner_positions
        ])

        outline = Square(side_length=outer).move_to(c)
        outline.set_fill(opacity=0).set_stroke(INK, width=3)
        center_label = MathTex(r"x^2", font_size=32, color=INK).move_to(c)
        strip_labels = VGroup(*[
            MathTex(r"x", font_size=26, color=INK).move_to(pos)
            for pos in strip_positions
        ])
        corner_labels = VGroup(*[
            MathTex(r"1", font_size=19, color="#192033").move_to(pos)
            for pos in corner_positions
        ])

        self.play(Create(center), Write(center_label), run_time=1.0)
        self.play(FadeIn(strips), Write(strip_labels), run_time=0.9)
        self.play(Create(outline), run_time=0.6)
        total_side = MathTex(r"x+2", font_size=24, color=INK).move_to([cx, -2.35, 0])
        self.play(Write(total_side), run_time=0.45)

        start_sum = MathTex(
            r"\text{Bisher: }x^2+4x",
            font_size=31,
            color=BLUE,
        ).move_to([1.75, 2.15, 0])
        self.play(Write(start_sum), run_time=0.6)
        self.wait(1.2)
        question = MathTex(
            r"\text{Was fehlt in den vier Ecken?}",
            font_size=31,
            color=INK,
        ).move_to([1.75, 1.35, 0])
        self.play(Write(question), run_time=0.6)
        self.wait(3.2)

        self.play(FadeIn(corners), Write(corner_labels), run_time=0.9)
        corner_sum = MathTex(
            r"\text{Vier Ecken: }4\cdot1=4",
            font_size=30,
            color=GOLD,
        ).move_to([1.75, 0.45, 0])
        self.play(Write(corner_sum), run_time=0.7)

        identity = MathTex(
            r"x^2+4x+4=(x+2)^2",
            font_size=39,
            color=INK,
        ).move_to([1.72, -0.75, 0])
        identity.set_color_by_tex("4", GOLD)
        self.play(Write(identity), run_time=0.9)
        half_rule = MathTex(
            r"\frac{4}{2}=2,\qquad 2^2=4",
            font_size=31,
            color=BLUE,
        ).move_to([1.75, -1.75, 0])
        self.play(Write(half_rule), run_time=0.65)

        final_box = SurroundingRectangle(identity, color=GREEN, buff=0.2, stroke_width=3)
        self.play(Create(final_box), run_time=0.5)
        self.wait(4.0)


class WorkedExample(Scene):
    """Complete the square in the lesson's example and identify the vertex."""

    def construct(self):
        self.camera.background_color = BG
        title = MathTex(
            r"\text{Beispiel: }f(x)=x^2+4x+3",
            font_size=39,
            color=INK,
        ).to_edge(UP, buff=0.34)
        goal = MathTex(
            r"\text{Ziel: Scheitelpunktform bei gleichem Termwert}",
            font_size=27,
            color=MUTED,
        ).next_to(title, DOWN, buff=0.28)
        self.play(Write(title), run_time=0.8)
        self.play(FadeIn(goal), run_time=0.45)

        start = MathTex(r"f(x)=x^2+4x+3", font_size=37, color=INK).move_to([0, 1.70, 0])
        self.play(Write(start), run_time=0.55)
        self.wait(0.9)

        step_label = MathTex(
            r"\text{Schritt 1: Koeffizient vor }x\text{ halbieren}",
            font_size=29,
            color=BLUE,
        ).move_to([0, 0.95, 0])
        self.play(Write(step_label), run_time=0.6)
        self.wait(3.0)

        half = MathTex(r"\frac{4}{2}=2", font_size=35, color=BLUE).move_to([0, 0.20, 0])
        self.play(Write(half), run_time=0.65)
        self.wait(1.1)

        square_label = MathTex(
            r"\text{Schritt 2: Die H\"alfte quadrieren}",
            font_size=29,
            color=BLUE,
        ).move_to([0, -0.45, 0])
        self.play(Transform(step_label, square_label), run_time=0.45)
        self.wait(2.5)

        square_half = MathTex(r"2^2=4", font_size=35, color=BLUE).move_to([0, -1.05, 0])
        self.play(Write(square_half), run_time=0.65)
        self.wait(1.1)

        add_subtract = MathTex(
            r"=x^2+4x+4-4+3",
            font_size=34,
            color=INK,
        ).move_to([0, -1.60, 0])
        add_subtract.set_color_by_tex("4", GOLD)
        self.play(Write(add_subtract), run_time=0.75)
        neutral = MathTex(r"+4-4=0", font_size=25, color=GOLD).move_to([4.15, -1.60, 0])
        self.play(FadeIn(neutral), run_time=0.4)
        self.wait(1.8)

        grouped = MathTex(
            r"=(x^2+4x+4)-1",
            font_size=35,
            color=INK,
        ).move_to([0, -2.10, 0])
        grouped.set_color_by_tex("4", GOLD)
        self.play(Write(grouped), run_time=0.75)
        self.wait(1.0)

        result = MathTex(
            r"f(x)=(x+2)^2-1",
            font_size=39,
            color=INK,
        ).move_to([0, -2.70, 0])
        result.set_color_by_tex("(x+2)^2", GREEN)
        self.play(Write(result), run_time=0.8)
        result_box = SurroundingRectangle(result, color=GREEN, buff=0.18, stroke_width=3)
        self.play(Create(result_box), run_time=0.45)
        self.wait(1.4)

        vertex = MathTex(
            r"\text{Scheitelpunkt: }S(-2\mid-1)",
            font_size=26,
            color=BLUE,
        ).move_to([0, -3.58, 0])
        self.play(Write(vertex), run_time=0.55)
        self.wait(2.8)


class PracticeAndRule(Scene):
    """Short prediction pause, then a fresh example with an expansion check."""

    def construct(self):
        self.camera.background_color = BG
        title = MathTex(
            r"\text{Jetzt selbst: }x^2+8x+5",
            font_size=40,
            color=INK,
        ).to_edge(UP, buff=0.4)
        prompt = MathTex(
            r"\text{Welche Zahl addierst und subtrahierst du?}",
            font_size=32,
            color=GOLD,
        ).move_to([0, 1.55, 0])
        cue = MathTex(
            r"\text{Halbiere den Koeffizienten von }x\text{ und quadriere.}",
            font_size=28,
            color=MUTED,
        ).move_to([0, 0.65, 0])
        self.play(Write(title), run_time=0.8)
        self.play(Write(prompt), run_time=0.7)
        self.play(FadeIn(cue), run_time=0.5)
        self.wait(4.0)

        half = MathTex(
            r"\frac{8}{2}=4,\qquad4^2=16",
            font_size=38,
            color=BLUE,
        ).move_to([0, -0.2, 0])
        self.play(Write(half), run_time=0.65)
        self.wait(1.0)
        first = MathTex(
            r"x^2+8x+5=x^2+8x+16-16+5",
            font_size=31,
            color=INK,
        ).move_to([0, -1.15, 0])
        first.set_color_by_tex("16", GOLD)
        self.play(Write(first), run_time=0.85)
        self.wait(1.1)
        result = MathTex(
            r"=(x+4)^2-11",
            font_size=43,
            color=INK,
        ).move_to([0, -2.05, 0])
        result.set_color_by_tex("(x+4)^2", GREEN)
        self.play(Write(result), run_time=0.7)
        result_box = SurroundingRectangle(result, color=GREEN, buff=0.18, stroke_width=3)
        self.play(Create(result_box), run_time=0.45)
        self.wait(1.2)

        check = MathTex(
            r"\text{Kontrolle: }(x+4)^2-11=x^2+8x+5",
            font_size=29,
            color=BLUE,
        ).move_to([0, -2.9, 0])
        self.play(Write(check), run_time=0.65)
        rule = MathTex(
            r"\text{Merke: halbieren, quadrieren, ausgleichen.}",
            font_size=29,
            color=GOLD,
        ).to_edge(DOWN, buff=0.25)
        self.play(FadeIn(rule), run_time=0.5)
        self.wait(3.0)
