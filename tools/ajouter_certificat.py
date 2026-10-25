"""
Ajoute un ou plusieurs certificats au portfolio.

1. Dépose l'image du certificat (PNG, JPG ou WebP) dans le dossier « nouveaux-certificats ».
2. Double-clique sur « Ajouter un certificat.bat » (ou lance : python tools/ajouter_certificat.py).
3. Réponds aux questions. Le script :
   - convertit l'image en WebP net dans images/certs/,
   - ajoute la certification dans data/certificates.js,
   - range l'image d'origine dans images/,
   - reconstruit le site et la base de l'assistant (node tools/build.mjs),
   - propose de publier sur GitHub (commit + push).
"""
import datetime
import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = os.path.join(ROOT, "nouveaux-certificats")
DATA = os.path.join(ROOT, "data", "certificates.js")
PROJECTS = os.path.join(ROOT, "data", "projects.js")
CERTS_DIR = os.path.join(ROOT, "images", "certs")
IMAGES = (".png", ".jpg", ".jpeg", ".webp")
MIN_WIDTH = 700  # en dessous, le site affiche une fiche générée plutôt que l'image

CATEGORIES = [("data", "Data & SQL"), ("ai", "IA & Machine Learning"), ("cloud", "Cloud"), ("dev", "Développement")]
MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}


def ask(question, default=""):
    suffix = f" [{default}]" if default else ""
    answer = input(f"  {question}{suffix} : ").strip()
    return answer or default


def slugify(text):
    text = unicodedata.normalize("NFD", text.lower()).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:60] or "certificat"


def parse_date(text):
    """Accepte 2026-10-25, 25/10/2026 ou Oct 25, 2026. Renvoie AAAA-MM-JJ ou une chaîne vide."""
    text = text.strip()
    if not text:
        return ""
    m = re.fullmatch(r"(\d{4})-(\d{1,2})-(\d{1,2})", text)
    if m:
        y, mo, d = map(int, m.groups())
    else:
        m = re.fullmatch(r"(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})", text)
        if m:
            d, mo, y = map(int, m.groups())
        else:
            m = re.fullmatch(r"([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})", text)
            if not m or m.group(1).lower() not in MONTHS:
                return None
            mo, d, y = MONTHS[m.group(1).lower()], int(m.group(2)), int(m.group(3))
    try:
        return datetime.date(y, mo, d).isoformat()
    except ValueError:
        return None


def existing_ids():
    return set(re.findall(r'\{ id: "([^"]+)"', open(DATA, encoding="utf-8").read()))


def project_list():
    text = open(PROJECTS, encoding="utf-8").read()
    ids = re.findall(r'^\s{8}id: "([^"]+)",', text, flags=re.M)
    titles = re.findall(r'^\s{8}title: "([^"]+)",', text, flags=re.M)
    return list(zip(ids, titles))


def js(value):
    return json.dumps(value, ensure_ascii=False)


def convert(source, cert_id):
    from PIL import Image  # Pillow, déjà utilisé pour les autres images du site
    os.makedirs(CERTS_DIR, exist_ok=True)
    image = Image.open(source)
    image.load()
    image = image.convert("RGB")
    target = os.path.join(CERTS_DIR, f"{cert_id}.webp")
    image.save(target, "WEBP", quality=92, method=6)
    return target, image.size


def add_entry(entry_line):
    text = open(DATA, encoding="utf-8").read()
    marker = "window.PORTFOLIO_CERTIFICATES = [\n"
    if marker not in text:
        raise SystemExit("Format inattendu de data/certificates.js : ajout annulé.")
    text = text.replace(marker, marker + entry_line + "\n", 1)
    open(DATA, "w", encoding="utf-8").write(text)


def process(filename, projects):
    path = os.path.join(INBOX, filename)
    print(f"\n=== {filename} ===")
    base = os.path.splitext(filename)[0]
    title = ask("Titre exact du certificat", base)
    issuer = ask("Émetteur (DataCamp, IBM · Coursera, Microsoft…)", "DataCamp")
    while True:
        date = parse_date(ask("Date d'obtention (2026-10-25, 25/10/2026 ou Oct 25, 2026 ; vide si inconnue)"))
        if date is not None:
            break
        print("  Date non reconnue, réessaie.")
    hours = ask("Durée en heures (vide si inconnue)")
    print("  Domaine : " + ", ".join(f"{i + 1}. {label}" for i, (_, label) in enumerate(CATEGORIES)))
    while True:
        choice = ask("Numéro du domaine", "1")
        if choice.isdigit() and 1 <= int(choice) <= len(CATEGORIES):
            category = CATEGORIES[int(choice) - 1][0]
            break
    skills = [s.strip() for s in ask("Compétences, séparées par des virgules").split(",") if s.strip()]
    print("  Projets où tu l'as mis en pratique (facultatif) :")
    for i, (_, project_title) in enumerate(projects, 1):
        print(f"    {i:>2}. {project_title}")
    picked = []
    for part in ask("Numéros séparés par des virgules (vide = aucun)").split(","):
        part = part.strip()
        if part.isdigit() and 1 <= int(part) <= len(projects):
            picked.append(projects[int(part) - 1][0])

    cert_id = slugify(title)
    taken = existing_ids()
    suffix = 2
    while cert_id in taken:
        cert_id = f"{slugify(title)}-{suffix}"
        suffix += 1

    target, (width, height) = convert(path, cert_id)
    if width < MIN_WIDTH:
        print(f"  Attention : l'image ne fait que {width} px de large ; le site affichera une fiche générée à la place.")

    fields = [f"id: {js(cert_id)}", f"title: {js(title)}", f"issuer: {js(issuer)}"]
    if date:
        fields.append(f"date: {js(date)}")
    if hours.isdigit():
        fields.append(f"hours: {int(hours)}")
    fields += [f"category: {js(category)}", f'file: "certs/{cert_id}.webp"', f"width: {width}", f"height: {height}",
               f"skills: {js(skills or [title])}"]
    if picked:
        fields.append(f"projects: {js(picked)}")
    add_entry("    { " + ", ".join(fields) + " },")

    archived = os.path.join(ROOT, "images", filename)
    if os.path.exists(archived):
        archived = os.path.join(ROOT, "images", f"{cert_id}{os.path.splitext(filename)[1]}")
    shutil.move(path, archived)
    print(f"  Ajouté : {title} ({width}×{height}) → images/certs/{cert_id}.webp")
    return [os.path.relpath(target, ROOT), os.path.relpath(archived, ROOT)], title


def run(command):
    return subprocess.run(command, cwd=ROOT, text=True, encoding="utf-8", errors="replace", capture_output=True)


def main():
    os.makedirs(INBOX, exist_ok=True)
    files = sorted(f for f in os.listdir(INBOX) if f.lower().endswith(IMAGES))
    pdfs = [f for f in os.listdir(INBOX) if f.lower().endswith(".pdf")]
    if pdfs:
        print("Les PDF ne sont pas pris en charge : exporte-les en PNG ou JPG (capture ou « Enregistrer en tant qu'image »).")
    if not files:
        print(f"Aucune image dans {INBOX}.\nDépose l'image du certificat dans ce dossier, puis relance.")
        return

    print(f"{len(files)} certificat(s) à ajouter.")
    projects = project_list()
    changed, titles = ["data/certificates.js"], []
    for filename in files:
        paths, title = process(filename, projects)
        changed += paths
        titles.append(title)

    print("\nReconstruction du site et de l'assistant…")
    build = run(["node", "tools/build.mjs"])
    print(build.stdout.strip() or build.stderr.strip())
    if build.returncode != 0:
        print("La reconstruction a échoué : les certificats sont ajoutés, mais vérifie le message ci-dessus.")
        return

    if ask("\nPublier sur GitHub maintenant ? (o/n)", "o").lower().startswith("o"):
        changed += ["netlify/functions/ask/knowledge.mjs"]
        run(["git", "add", "--", *changed])
        message = "Ajoute " + ("la certification " + titles[0] if len(titles) == 1 else f"{len(titles)} certifications : " + ", ".join(titles))
        commit = run(["git", "commit", "-m", message])
        if commit.returncode != 0:
            print(commit.stdout + commit.stderr)
            return
        push = run(["git", "push"])
        print("Publié : Netlify mettra le site à jour dans une minute." if push.returncode == 0 else push.stderr)
    else:
        print("Rien n'est publié. Tu pourras le faire plus tard depuis GitHub Desktop.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nAnnulé.")
