"""Stellt die 24 Sek-I-Quizze mit ihren öffentlichen Assets für Cloudflare zusammen."""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / '.local/seki-quiz/worker'


def prepare():
    TARGET.mkdir(parents=True, exist_ok=True)
    shutil.copytree(ROOT / 'werkzeuge/seki_quiz_backend', TARGET, dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns('node_modules', '.wrangler', '.deploy-check',
                                                 '__pycache__', 'public', '.dev.vars*', '.env*'))
    public = TARGET / 'public'
    public.mkdir(exist_ok=True)
    shared = Path('gemeinsam/quiz-seki/assets')
    shutil.copytree(ROOT / shared, public / shared, dirs_exist_ok=True)
    common = Path('gemeinsam/quiz/assets')
    shutil.copytree(ROOT / common, public / common, dirs_exist_ok=True)
    entries = json.loads((ROOT / 'dokumentation/QUIZ_SEKI_ZUORDNUNG.json').read_text(encoding='utf-8'))['quizze']
    for entry in entries:
        quiz = Path(entry['url']).parent
        if not (ROOT / quiz).resolve().is_relative_to(ROOT.resolve()):
            raise ValueError('Quizpfad außerhalb der Materialsammlung')
        shutil.copytree(ROOT / quiz, public / quiz, dirs_exist_ok=True)
        page = public / entry['url']
        local_link = f'../../../../index.html#/{entry["bereich"]}/{entry["inhaltsfeld"]}/quiz'
        remote_link = f'https://hardenacke.github.io/Material_Mathe/index.html#/{entry["bereich"]}/{entry["inhaltsfeld"]}/quiz'
        page.write_text(page.read_text(encoding='utf-8').replace(local_link, remote_link), encoding='utf-8')
    # The worker root opens the shared overview with all filters and local profiles.
    (public / 'index.html').write_text(
        '<!doctype html><html lang="de"><meta charset="utf-8">'
        '<meta http-equiv="refresh" content="0;url=gemeinsam/quiz-seki/assets/index.html">'
        '<title>Mathematik-Quizze</title>'
        '<a href="gemeinsam/quiz-seki/assets/index.html">Zu den 24 Mathematik-Quizzen</a></html>\n',
        encoding='utf-8')
    print(f'CLOUDFLARE VORBEREITET: {len(entries)} Quizze in {TARGET}')
    return TARGET


if __name__ == '__main__':
    prepare()
