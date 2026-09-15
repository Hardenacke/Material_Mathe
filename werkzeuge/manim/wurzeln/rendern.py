"""Rendert die drei Manim-Szenen und bereitet MP4s für GitHub Pages vor."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

import av
import imageio_ffmpeg
import manim

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
MEDIA = ROOT / ".local" / "manim-media"
OUTPUT = ROOT / "klasse-9" / "unterstuetzung" / "assets" / "wurzeln"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", choices=["quadratzahlen", "intervallschachtelung", "heron"])
    parser.add_argument("--package-only", action="store_true", help="Vorhandene Manim-Render übernehmen")
    args = parser.parse_args()
    manifest = json.loads((HERE / "video_manifest.json").read_text(encoding="utf-8"))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    report_path = HERE / "render-info.json"
    report = json.loads(report_path.read_text(encoding="utf-8")) if report_path.exists() else {}
    for video in manifest["videos"]:
        name = Path(video["source"]).stem.removeprefix("video_")
        if args.only and args.only != name:
            continue
        media_dir = MEDIA / name
        if not args.package_only:
            log = ROOT / ".local" / f"{name}-render.log"
            print(f"Manim: {video['scene']} (1080p, 30 fps) – {log.name}", flush=True)
            with log.open("w", encoding="utf-8") as output:
                subprocess.run([
                    sys.executable, "-m", "manim", "-qh", "--fps", "30",
                    "--progress_bar", "none", "--media_dir", str(media_dir),
                    "-o", Path(video["output"]).stem, video["source"], video["scene"],
                ], cwd=HERE, stdout=output, stderr=subprocess.STDOUT, check=True)
        rendered = media_dir / "videos" / Path(video["source"]).stem / "1080p30" / video["output"]
        target = OUTPUT / video["output"]
        # Einheitliche Zeitstempel trotz Rundungen beim Zusammenfügen der Manim-Abschnitte.
        subprocess.run([ffmpeg, "-v", "error", "-y", "-i", str(rendered),
                        "-vf", "fps=30", "-c:v", "libx264", "-preset", "medium",
                        "-crf", "18", "-pix_fmt", "yuv420p",
                        "-movflags", "+faststart", str(target)], check=True)
        subprocess.run([ffmpeg, "-v", "error", "-y", "-ss", "3", "-i", str(target),
                        "-frames:v", "1", "-q:v", "2", str(target.with_suffix(".jpg"))], check=True)
        with av.open(str(target)) as container:
            stream = container.streams.video[0]
            # Vollständiges Decodieren erkennt auch beschädigte spätere Abschnitte.
            count = sum(1 for _ in container.decode(video=0))
            assert stream.width == 1920 and stream.height == 1080
            assert stream.average_rate == 30 and count > 30
            assert stream.codec_context.name == "h264"
            assert stream.codec_context.format.name == "yuv420p"
        report[video["output"]] = {
            "renderer": f"Manim Community {manim.__version__}",
            "scene": video["scene"], "width": 1920, "height": 1080, "fps": 30,
            "frames": count, "duration_seconds": round(count / 30, 3),
            "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
            "source_sha256": hashlib.sha256((HERE / video["source"]).read_text(encoding="utf-8").encode("utf-8")).hexdigest(),
            "shared_sha256": hashlib.sha256((HERE / "shared.py").read_text(encoding="utf-8").encode("utf-8")).hexdigest(),
        }
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Fertig: {target.name}, {count / 30:.1f} s, {target.stat().st_size / 1e6:.1f} MB", flush=True)


if __name__ == "__main__":
    main()
