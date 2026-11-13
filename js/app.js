// Hauptprogramm: Seiten (Start, Quiz, Karteikarten, Subnetting, Eigene Aufgaben, Lernstand)
// Die Navigation läuft über den Teil der Adresse nach dem # (z. B. index.html#/quiz).

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const app = $('#app');

// Text sicher in HTML einsetzen (verhindert, dass eingegebener Text als HTML ausgeführt wird)
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function mischen(liste) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const zufallAus = liste => liste[Math.floor(Math.random() * liste.length)];
const themenVon = liste => [...new Set(liste.map(x => x.thema))].sort((a, b) => a.localeCompare(b, 'de'));
const optionen = (werte, gewaehlt) => werte.map(w => `<option ${w === gewaehlt ? 'selected' : ''}>${esc(w)}</option>`).join('');
const prozent = (a, b) => (b ? Math.round(a / b * 100) : 0);
const zahl = n => n.toLocaleString('de-DE');
const heute = () => Speicher.tagText(new Date());
const BUCHSTABEN = 'ABCDEFGH';

// Alle Multiple-Choice-Fragen: mitgelieferte + eigene
const alleMcFragen = () => [...FRAGEN, ...Speicher.daten.eigene.filter(a => a.typ === 'mc')];
const faelligeKarten = () => KARTEN.filter(k => !Speicher.daten.karten[k.id] || Speicher.daten.karten[k.id].faellig <= Date.now());

// IHK-Notenschlüssel
function ihkNote(pct) {
  if (pct >= 92) return { note: 1, text: 'sehr gut' };
  if (pct >= 81) return { note: 2, text: 'gut' };
  if (pct >= 67) return { note: 3, text: 'befriedigend' };
  if (pct >= 50) return { note: 4, text: 'ausreichend' };
  if (pct >= 30) return { note: 5, text: 'mangelhaft' };
  return { note: 6, text: 'ungenügend' };
}

function farbeFuer(pct) {
  if (pct >= 81) return 'var(--ok)';
  if (pct >= 50) return 'var(--gold)';
  return 'var(--nok)';
}

// Farbe je Karteikarten-Thema
const THEMA_FARBEN = {
  'Netzwerk': '#3b82f6',
  'Ports': '#0ea5a4',
  'Server & Backup': '#6366f1',
  'IT-Sicherheit': '#e5484d',
  'Datenschutz': '#ec4899',
  'Projekt & Wirtschaft': '#f59e0b',
  'WiSo': '#16a34a'
};
const themaFarbe = t => THEMA_FARBEN[t] || '#8b5cf6';

function seitenkopf(farbklasse, emoji, titel, untertitel, zurueck) {
  return `
    ${zurueck ? `<a class="zurueck-link" href="${zurueck[0]}">‹ ${zurueck[1]}</a>` : ''}
    <div class="seitenkopf ${farbklasse}">
      <span class="emoji">${emoji}</span>
      <div><h1>${titel}</h1>${untertitel ? `<p>${untertitel}</p>` : ''}</div>
    </div>`;
}

// Fortschrittsring als SVG
function ring(pct, farbe, groesse = 72, inhalt = '') {
  const r = 30;
  const umfang = 2 * Math.PI * r;
  const versatz = umfang * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return `
    <div class="ring-wrap" style="width:${groesse}px;height:${groesse}px">
      <svg class="ring" viewBox="0 0 72 72" width="${groesse}" height="${groesse}" aria-hidden="true">
        <circle class="ring-bg" cx="36" cy="36" r="${r}"/>
        <circle class="ring-fg" cx="36" cy="36" r="${r}" stroke="${farbe}" stroke-dasharray="${umfang}" stroke-dashoffset="${versatz}"/>
      </svg>
      <div class="ring-inhalt">${inhalt}</div>
    </div>`;
}

function download(dateiname, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function dateiWaehlen(weiter) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = () => input.files[0] && input.files[0].text().then(weiter);
  input.click();
}

// ═══════════════════════════ XP, Serie, Effekte ═══════════════════════════
function statsAktualisieren(hervorheben) {
  const serie = $('#statSerie');
  const xp = $('#statXp');
  serie.textContent = `🔥 ${Speicher.serie()}`;
  serie.classList.toggle('aus', !Speicher.heuteXp());
  xp.textContent = `⭐ ${zahl(Speicher.daten.xp)}`;
  if (hervorheben) {
    xp.classList.remove('pop');
    void xp.offsetWidth; // Animation neu starten
    xp.classList.add('pop');
  }
}

function xpGeben(n, quelle) {
  const ziel = Speicher.daten.ziel;
  const vorher = Speicher.heuteXp();
  Speicher.punkte(n);
  if (quelle) xpAnzeigen(n, quelle);
  statsAktualisieren(true);
  if (vorher < ziel && Speicher.heuteXp() >= ziel) {
    setTimeout(() => {
      konfetti();
      meldung(`🎯 Tagesziel erreicht! ${ziel} XP geschafft.`);
    }, 400);
  }
}

function xpAnzeigen(n, quelle) {
  const r = quelle.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'xp-pop';
  el.textContent = `+${n} XP`;
  el.style.left = `${r.left + r.width / 2}px`;
  el.style.top = `${Math.max(20, r.top - 10)}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function konfetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div');
  box.className = 'konfetti';
  const farben = ['#6c4cf5', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#ff7a1a'];
  for (let i = 0; i < 90; i++) {
    const s = document.createElement('i');
    s.style.left = `${Math.random() * 100}%`;
    s.style.background = farben[i % farben.length];
    s.style.animationDuration = `${1.6 + Math.random() * 1.6}s`;
    s.style.animationDelay = `${Math.random() * .4}s`;
    s.style.setProperty('--dx', `${Math.random() * 240 - 120}px`);
    s.style.setProperty('--rot', `${Math.random() * 1080 - 540}deg`);
    if (i % 3 === 0) s.style.borderRadius = '50%';
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3800);
}

function meldung(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('weg'), 2600);
  setTimeout(() => el.remove(), 3100);
}

// Tastatursteuerung: jede Lern-Ansicht kann eine eigene Funktion setzen
let tastenHandler = null;
document.addEventListener('keydown', e => {
  if (!tastenHandler || e.ctrlKey || e.metaKey || e.altKey) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) && e.target.type !== 'radio' && e.target.type !== 'checkbox') return;
  tastenHandler(e);
});

function fokusModus(an) {
  document.body.classList.toggle('fokus', an);
  if (!an) tastenHandler = null;
}

function lernkopf(farbklasse, anteil, rechts = '') {
  return `
    <div class="lernkopf ${farbklasse}">
      <button class="schliessen" id="schliessen" title="Beenden" aria-label="Beenden">✕</button>
      <div class="fortschrittbalken"><div style="width:${Math.max(0, anteil * 100)}%"></div></div>
      <span class="combo" id="combo">${rechts}</span>
    </div>`;
}

const LOB = ['Super!', 'Richtig!', 'Klasse!', 'Genau so!', 'Stark!', 'Perfekt!', 'Sehr gut!'];
const TROST = ['Nicht ganz.', 'Leider falsch.', 'Knapp daneben.', 'Fast!'];

// ═══════════════════════════ Startseite ═══════════════════════════
const TIPPS = [
  ['⏱️', 'Lieber jeden Tag 20 Minuten als einmal pro Woche 3 Stunden. Dein Gehirn speichert so viel mehr.'],
  ['🌐', 'Subnetting kommt in fast jeder Prüfung dran. Rechne, bis du es ohne Nachdenken kannst.'],
  ['📝', 'Die echten IHK-Prüfungen bestehen größtenteils aus offenen Fragen. Trag alte Aufgaben unter „Eigene“ ein und beantworte sie schriftlich.'],
  ['🔁', 'Fehler sind gut! Die Fragen, die du falsch hattest, kannst du im Quiz gezielt wiederholen.'],
  ['🧠', 'Erkläre ein Thema laut, als würdest du es jemandem beibringen. Wenn das klappt, hast du es verstanden.'],
  ['📊', 'Schau regelmäßig unter „Stand“ nach, welche Themen noch rot sind.'],
  ['☕', 'Mach nach 25 Minuten Lernen 5 Minuten Pause (Pomodoro-Technik).']
];

function begruessung() {
  const h = new Date().getHours();
  if (h < 11) return 'Guten Morgen! ☀️';
  if (h < 17) return 'Hallo! 👋';
  if (h < 22) return 'Guten Abend! 🌙';
  return 'Noch wach? 🦉';
}

// ─── Hilfen für Vorschläge und Schnellstarts ───
// Thema mit der schlechtesten Quote (mind. 2 Antworten, unter 70 %)
function schwaechstesThema() {
  const gruppen = {};
  for (const f of alleMcFragen()) {
    const e = Speicher.daten.quiz[f.id];
    if (!e) continue;
    const g = gruppen[f.thema] || (gruppen[f.thema] = { thema: f.thema, richtig: 0, versuche: 0 });
    g.richtig += e.richtig;
    g.versuche += e.richtig + e.falsch;
  }
  const kandidaten = Object.values(gruppen).filter(g => g.versuche >= 2).map(g => ({ ...g, pct: prozent(g.richtig, g.versuche) })).filter(g => g.pct < 70);
  return kandidaten.sort((a, b) => a.pct - b.pct)[0] || null;
}

// Neue und falsch beantwortete Fragen zuerst
function fragenMitVorrang(pool) {
  const q = Speicher.daten.quiz;
  const wichtig = pool.filter(f => !q[f.id] || q[f.id].letztesOk === false);
  return [...mischen(wichtig), ...mischen(pool.filter(f => !wichtig.includes(f)))];
}

const zufallsQuiz = () => quizDurchfuehren(fragenMitVorrang(alleMcFragen()).slice(0, 10));
const quizZuThema = thema => quizDurchfuehren(fragenMitVorrang(alleMcFragen().filter(f => f.thema === thema)).slice(0, 10));
const falscheFragen = () => alleMcFragen().filter(f => Speicher.daten.quiz[f.id]?.letztesOk === false);

// Was solltest du heute tun? Liste in sinnvoller Reihenfolge
function empfehlungen() {
  const liste = [];
  const l = aktuelleLektion();
  const s = l && Speicher.lektion(l.id);
  if (l && s.schritt > 0) {
    liste.push({ emoji: l.emoji, farbe: l.farbe, titel: `${l.titel} fortsetzen`, text: `Erklärung · Schritt ${s.schritt + 1} von ${l.schritte.length}`, aktion: () => lektionStarten(l) });
  }
  const faellig = faelligeKarten();
  if (faellig.length) {
    const n = Math.min(faellig.length, 15);
    liste.push({ emoji: '🗂️', farbe: 'f-karten', titel: `${n} Karteikarten wiederholen`, text: faellig.length > 15 ? `${faellig.length} sind fällig · 15 pro Runde` : 'heute fällig', aktion: () => kartenLernen(mischen(faellig).slice(0, 15)) });
  }
  const schwach = schwaechstesThema();
  if (schwach) {
    liste.push({ emoji: '🎯', farbe: 'f-quiz', titel: `Schwachstelle üben: ${schwach.thema}`, text: `bisher ${schwach.pct} % richtig`, aktion: () => quizZuThema(schwach.thema) });
  }
  if (l && !s.schritt) {
    liste.push({ emoji: l.emoji, farbe: l.farbe, titel: `Neue Erklärung: ${l.titel}`, text: `${l.schritte.length} Schritte · ${l.dauer}`, aktion: () => lektionStarten(l) });
  }
  liste.push({ emoji: '🎲', farbe: 'f-quiz', titel: '10 gemischte Quizfragen', text: 'neue und falsche Fragen zuerst', aktion: zufallsQuiz });
  return liste;
}

function seiteStart() {
  const d = Speicher.daten;
  const heuteXp = Speicher.heuteXp();
  const zielPct = prozent(heuteXp, d.ziel);
  const serie = Speicher.serie();
  const tipp = TIPPS[new Date().getDate() % TIPPS.length];
  const wochentage = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const vorschlaege = empfehlungen();
  const [erster, ...weitere] = vorschlaege;
  const lektionenFertig = LEKTIONEN_SORTIERT.filter(l => Speicher.lektion(l.id).fertig).length;
  const faellig = faelligeKarten().length;
  const fragen = alleMcFragen();
  const beantwortet = fragen.filter(f => d.quiz[f.id]).length;

  app.innerHTML = `
    <section class="held">
      <h1>${begruessung()}</h1>
      <p>${heuteXp >= d.ziel ? 'Tagesziel geschafft. Alles darüber ist Bonus! 🎉' : serie ? `Halte deine Serie von ${serie} ${serie === 1 ? 'Tag' : 'Tagen'} am Leben!` : 'Starte heute deine Lernserie.'}</p>
      <div class="held-zeile">
        ${ring(zielPct, '#fff', 84, `${heuteXp}<br><small style="font-weight:700;opacity:.85">/ ${d.ziel} XP</small>`)}
        <div class="held-info">
          <div class="held-serie">🔥 ${serie} <small>${serie === 1 ? 'Tag' : 'Tage'} in Folge</small></div>
          <div class="woche-mini">
            ${[6, 5, 4, 3, 2, 1, 0].map(n => {
              const tag = Speicher.tagVor(n);
              const an = d.tage[Speicher.tagText(tag)];
              return `<span class="${an ? 'an' : ''} ${n === 0 ? 'heute' : ''}" title="${wochentage[tag.getDay()]}"><i></i>${wochentage[tag.getDay()][0]}</span>`;
            }).join('')}
          </div>
        </div>
      </div>
      <button class="btn breit gross held-knopf" id="weiterlernen">
        <span>▶ Weiterlernen</span>
        <small>${erster.emoji} ${esc(erster.titel)}</small>
      </button>
    </section>

    ${weitere.length ? `
      <h2>Auch gut für heute</h2>
      <div class="empfehlungen">
        ${weitere.slice(0, 3).map((e, i) => `
          <button class="empf-zeile ${e.farbe}" data-empf="${i + 1}">
            <span class="emoji">${e.emoji}</span>
            <span class="text"><strong>${esc(e.titel)}</strong><small>${esc(e.text)}</small></span>
            <span class="lz-pfeil">›</span>
          </button>`).join('')}
      </div>` : ''}

    <h2>Deine Bereiche</h2>
    <div class="bereich-kacheln">
      <a class="kachel f-lernen" href="#/lernen">
        <span class="emoji">📖</span>
        <span class="titel">Lernen</span>
        <span class="unter">${lektionenFertig} von ${LEKTIONEN_SORTIERT.length} Erklärungen</span>
        <div class="mini-balken"><div style="width:${prozent(lektionenFertig, LEKTIONEN_SORTIERT.length)}%"></div></div>
      </a>
      <a class="kachel f-quiz" href="#/ueben">
        <span class="emoji">🎯</span>
        <span class="titel">Üben</span>
        <span class="unter">${faellig ? `${faellig} Karten fällig` : `${beantwortet} von ${fragen.length} Fragen`}</span>
        <div class="mini-balken"><div style="width:${prozent(beantwortet, fragen.length)}%"></div></div>
      </a>
    </div>

    <div class="karte tipp klein-tipp"><span class="emoji">${tipp[0]}</span><p><strong>Tipp:</strong> ${tipp[1]}</p></div>`;

  $('#weiterlernen').onclick = erster.aktion;
  $$('[data-empf]').forEach(b => b.onclick = () => vorschlaege[Number(b.dataset.empf)].aktion());
}

// ═══════════════════════════ Üben (Sammelpunkt) ═══════════════════════════
function seiteUeben() {
  const d = Speicher.daten;
  const faellig = faelligeKarten();
  const falsche = falscheFragen();
  const fragen = alleMcFragen();
  const beantwortet = fragen.filter(f => d.quiz[f.id]).length;
  const subnetz = Object.values(d.subnetting).reduce((s, x) => ({ r: s.r + x.richtig, g: s.g + x.gesamt }), { r: 0, g: 0 });
  const sicher = KARTEN.filter(k => (d.karten[k.id]?.fach || 0) >= 4).length;
  const offene = d.eigene.filter(a => a.typ === 'offen').length;

  const bereiche = [
    ['#/quiz', 'f-quiz', '❓', 'Quiz', 'Prüfungsfragen mit Erklärung und IHK-Note', `${beantwortet}/${fragen.length}`, 'beantwortet'],
    ['#/karten', 'f-karten', '🗂️', 'Karteikarten', 'Begriffe mit dem Karteikasten lernen', faellig.length ? String(faellig.length) : '✓', faellig.length ? 'fällig' : 'erledigt'],
    ['#/subnetting', 'f-subnetz', '🌐', 'Subnetting-Trainer', 'Unendlich viele Aufgaben mit Rechenweg', subnetz.g ? `${prozent(subnetz.r, subnetz.g)} %` : '–', subnetz.g ? 'richtig' : 'neu'],
    ['#/eigene', 'f-eigene', '✏️', 'Eigene Aufgaben', 'Alte Prüfungen selbst eintragen und üben', String(d.eigene.length), d.eigene.length === 1 ? 'Aufgabe' : 'Aufgaben']
  ];

  app.innerHTML = `
    ${seitenkopf('f-quiz', '🎯', 'Üben', 'Trainiere mit Fragen, Karten und Aufgaben')}

    <p class="feldtitel">⚡ Schnellstart</p>
    <div class="schnellstart">
      <button class="schnell-btn f-karten" id="schnellKarten" ${faellig.length ? '' : 'disabled'}>
        <span class="emoji">🗂️</span><strong>${faellig.length ? Math.min(faellig.length, 15) : 0} Karten</strong><small>${faellig.length ? 'fällig' : 'alles erledigt'}</small>
      </button>
      <button class="schnell-btn f-quiz" id="schnellQuiz">
        <span class="emoji">🎲</span><strong>10 Fragen</strong><small>gemischt</small>
      </button>
      <button class="schnell-btn f-eigene" id="schnellFehler" ${falsche.length ? '' : 'disabled'}>
        <span class="emoji">🔁</span><strong>${falsche.length} Fehler</strong><small>wiederholen</small>
      </button>
    </div>

    <p class="feldtitel" style="margin-top:22px">Alle Trainings</p>
    <div class="ueben-liste">
      ${bereiche.map(([link, farbe, emoji, titel, text, wert, einheit]) => `
        <a class="ueben-zeile ${farbe}" href="${link}">
          <span class="emoji">${emoji}</span>
          <span class="text"><strong>${titel}</strong><small>${text}</small></span>
          <span class="wert"><b>${wert}</b><small>${einheit}</small></span>
        </a>`).join('')}
    </div>
    <p class="hinweis" style="margin-top:12px">🗂️ ${sicher} von ${KARTEN.length} Karten sitzen sicher${offene ? ` · 📝 ${offene} offene eigene Aufgaben` : ''}</p>`;

  $('#schnellKarten').onclick = () => kartenLernen(mischen(faellig).slice(0, 15));
  $('#schnellQuiz').onclick = zufallsQuiz;
  $('#schnellFehler').onclick = () => quizDurchfuehren(mischen(falsche).slice(0, 10));
}

// ═══════════════════════════ Quiz ═══════════════════════════
function seiteQuiz() {
  const fragen = alleMcFragen();
  const pille = (name, wert, text, an) => `<label><input type="radio" name="${name}" value="${wert}" ${an ? 'checked' : ''}><span>${text}</span></label>`;

  app.innerHTML = `
    ${seitenkopf('f-quiz', '❓', 'Quiz', 'Prüfungsfragen mit Erklärung und IHK-Note', ['#/ueben', 'Üben'])}
    <form id="quizForm" class="karte f-quiz">
      <p class="feldtitel">Prüfungsteil</p>
      <div class="pillen">
        ${pille('teil', '', 'Alle', true)}${pille('teil', 'AP1', 'AP1')}${pille('teil', 'AP2', 'AP2')}${pille('teil', 'WiSo', 'WiSo')}
      </div>
      <label>Thema
        <select name="thema"></select>
      </label>
      <p class="feldtitel">Welche Fragen?</p>
      <div class="pillen">
        ${pille('filter', '', 'Alle', true)}${pille('filter', 'neu', '✨ Neue')}${pille('filter', 'falsch', '🔁 Zuletzt falsch')}
      </div>
      <p class="feldtitel">Anzahl</p>
      <div class="pillen">
        ${pille('anzahl', '5', '5')}${pille('anzahl', '10', '10', true)}${pille('anzahl', '20', '20')}${pille('anzahl', '9999', 'Alle')}
      </div>
      <button class="btn breit gross" id="quizStart">Los geht's</button>
      <p class="hinweis" id="quizInfo" style="text-align:center;margin-top:10px"></p>
    </form>`;

  const form = $('#quizForm');
  const themaSelect = form.elements.thema;

  function themenAktualisieren() {
    const teil = form.elements.teil.value;
    const alt = themaSelect.value;
    const themen = themenVon(fragen.filter(f => !teil || f.teil === teil));
    themaSelect.innerHTML = `<option value="">Alle Themen</option>${optionen(themen, alt)}`;
  }

  function auswahl() {
    const w = Object.fromEntries(new FormData(form));
    return fragen.filter(f =>
      (!w.teil || f.teil === w.teil) &&
      (!w.thema || f.thema === w.thema) &&
      (w.filter !== 'falsch' || Speicher.daten.quiz[f.id]?.letztesOk === false) &&
      (w.filter !== 'neu' || !Speicher.daten.quiz[f.id]));
  }

  function info() {
    const n = auswahl().length;
    $('#quizInfo').textContent = n === 0 ? 'Keine passenden Fragen. Ändere die Auswahl.' : n === 1 ? '1 passende Frage' : `${n} passende Fragen`;
    $('#quizStart').disabled = !n;
  }

  form.addEventListener('change', e => { if (e.target.name === 'teil') themenAktualisieren(); info(); });
  themenAktualisieren();
  info();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const pool = auswahl();
    if (pool.length) quizDurchfuehren(mischen(pool).slice(0, Number(form.elements.anzahl.value)));
  });
}

function quizDurchfuehren(liste) {
  let nr = 0;
  let punkte = 0;
  let combo = 0;
  let besteCombo = 0;
  let sitzungXp = 0;
  const falsche = [];
  fokusModus(true);
  frageZeigen();

  function frageZeigen() {
    const f = liste[nr];
    const reihenfolge = mischen(f.antworten.map((_, i) => i));
    const mehrfach = f.richtig.length > 1;
    let geprueft = false;

    app.innerHTML = `
      ${lernkopf('f-quiz', nr / liste.length, combo >= 2 ? `🔥 ${combo}` : '')}
      <div class="chips f-quiz">
        <span class="chip">${esc(f.teil)}</span><span class="chip">${esc(f.thema)}</span>${f.quelle ? `<span class="chip">${esc(f.quelle)}</span>` : ''}
      </div>
      <h2 class="frage">${esc(f.frage)}</h2>
      <p class="hinweis">${mehrfach ? '☑️ Mehrere Antworten sind richtig.' : 'Wähle die richtige Antwort.'}</p>
      <form id="antwortForm" class="antworten">
        ${reihenfolge.map((i, pos) => `
          <label class="antwort">
            <input type="${mehrfach ? 'checkbox' : 'radio'}" name="a" value="${i}">
            <span class="taste">${BUCHSTABEN[pos]}</span>
            <span>${esc(f.antworten[i])}</span>
          </label>`).join('')}
      </form>
      <div class="pruefleiste" id="leiste">
        <div class="innen"><button class="btn breit gross f-quiz" id="pruefen" disabled>Prüfen</button></div>
      </div>`;

    const form = $('#antwortForm');
    const eingaben = $$('input', form);
    form.addEventListener('change', () => { $('#pruefen').disabled = !$$('input:checked', form).length; });
    $('#pruefen').onclick = pruefen;
    $('#schliessen').onclick = () => (nr > 0 ? auswertung() : geheZu('quiz'));

    tastenHandler = e => {
      const pos = '1234567890'.indexOf(e.key) >= 0 ? '1234567890'.indexOf(e.key) : BUCHSTABEN.toLowerCase().indexOf(e.key.toLowerCase());
      if (!geprueft && pos >= 0 && pos < eingaben.length && e.key.length === 1) {
        e.preventDefault();
        const input = eingaben[pos];
        input.checked = mehrfach ? !input.checked : true;
        form.dispatchEvent(new Event('change'));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const knopf = $('#leiste .btn');
        if (knopf && !knopf.disabled) knopf.click();
      } else if (e.key === 'Escape') {
        $('#schliessen').click();
      }
    };

    function pruefen() {
      const gewaehlt = $$('input:checked', form).map(x => Number(x.value));
      if (!gewaehlt.length || geprueft) return;
      geprueft = true;
      const ok = gewaehlt.length === f.richtig.length && gewaehlt.every(i => f.richtig.includes(i));
      Speicher.quizErgebnis(f.id, ok);
      nr++;

      if (ok) { punkte++; combo++; besteCombo = Math.max(besteCombo, combo); }
      else { combo = 0; falsche.push(f); }

      $$('label.antwort', form).forEach(l => {
        const input = $('input', l);
        const i = Number(input.value);
        input.disabled = true;
        l.classList.add('gesperrt');
        if (f.richtig.includes(i)) l.classList.add('richtig');
        else if (gewaehlt.includes(i)) l.classList.add('falsch');
      });

      // Fortschrittsbalken und Combo sofort aktualisieren
      $('.fortschrittbalken > div').style.width = `${nr / liste.length * 100}%`;
      const comboEl = $('#combo');
      comboEl.textContent = combo >= 2 ? `🔥 ${combo}` : '';
      if (combo >= 2) comboEl.classList.add('pop');

      const leiste = $('#leiste');
      leiste.className = `pruefleiste ${ok ? 'ok' : 'nok'}`;
      const richtigeText = f.richtig.map(i => f.antworten[i]).join(' · ');
      leiste.innerHTML = `
        <div class="innen">
          <p class="titel"><span class="symbol">${ok ? '✔️' : '✖️'}</span>${ok ? zufallAus(LOB) : zufallAus(TROST)}${ok && combo >= 3 ? ` <small style="color:var(--feuer)">🔥 ${combo} in Folge!</small>` : ''}</p>
          <p class="text">${ok ? '' : `<strong>Richtig: ${esc(richtigeText)}</strong>\n`}${esc(f.erklaerung || '')}</p>
          <button class="btn breit gross ${ok ? 'ok' : 'nok'}" id="weiter">${nr < liste.length ? 'Weiter' : 'Zur Auswertung'}</button>
        </div>`;
      const xp = ok ? 10 + (combo >= 3 ? 5 : 0) : 2;
      sitzungXp += xp;
      xpGeben(xp, $('#weiter'));
      $('#weiter').onclick = () => (nr < liste.length ? frageZeigen() : auswertung());
      $('#weiter').focus({ preventScroll: true });
    }
  }

  function auswertung() {
    fokusModus(false);
    const pct = prozent(punkte, nr);
    const note = ihkNote(pct);
    const [emoji, titel] =
      pct >= 92 ? ['🏆', 'Überragend!'] :
      pct >= 81 ? ['🎉', 'Richtig gut!'] :
      pct >= 67 ? ['😊', 'Gut gemacht!'] :
      pct >= 50 ? ['💪', 'Bestanden, weiter so!'] :
                  ['📚', 'Dranbleiben, das wird!'];
    if (pct >= 67) setTimeout(konfetti, 200);

    app.innerHTML = `
      <div class="ergebnis">
        <span class="grosses-emoji">${emoji}</span>
        <h1>${titel}</h1>
        <p class="hinweis">${punkte} von ${nr} Fragen richtig${besteCombo >= 3 ? ` · beste Serie: ${besteCombo} 🔥` : ''}</p>
        <div class="ergebnis-kacheln">
          <div class="ergebnis-kachel" style="--k:var(--gold)"><div class="k-titel">XP</div><div class="k-wert">+${sitzungXp}</div></div>
          <div class="ergebnis-kachel" style="--k:var(--ok)"><div class="k-titel">Richtig</div><div class="k-wert">${pct} %</div></div>
          <div class="ergebnis-kachel" style="--k:var(--stand)"><div class="k-titel">IHK-Note</div><div class="k-wert">${note.note}</div></div>
        </div>
        <p class="hinweis">Note ${note.note} = ${note.text} (IHK-Notenschlüssel)</p>
      </div>
      ${falsche.length ? `
        <div class="wiederholen">
          <h2>Das solltest du wiederholen</h2>
          ${falsche.map(f => `
            <div class="karte klein">
              <p><strong>${esc(f.frage)}</strong></p>
              <p class="richtig-text">✔ ${f.richtig.map(i => esc(f.antworten[i])).join(' · ')}</p>
            </div>`).join('')}
        </div>` : ''}
      <div class="knoepfe f-quiz">
        ${falsche.length ? '<button class="btn" id="nochmal">🔁 Fehler wiederholen</button>' : ''}
        <button class="btn zweit" id="neu">Neues Quiz</button>
      </div>`;
    $('#neu').onclick = () => geheZu('quiz');
    if (falsche.length) $('#nochmal').onclick = () => quizDurchfuehren(mischen(falsche));
  }
}

// ═══════════════════════════ Karteikarten ═══════════════════════════
function seiteKarten() {
  const d = Speicher.daten.karten;
  const fach = k => d[k.id]?.fach || 0; // 0 = noch nie gelernt
  const proFach = [0, 1, 2, 3, 4, 5].map(f => KARTEN.filter(k => fach(k) === f).length);
  const maxFach = Math.max(1, ...proFach.slice(1));

  app.innerHTML = `
    ${seitenkopf('f-karten', '🗂️', 'Karteikarten', 'Begriffe lernen mit dem Karteikasten-Prinzip', ['#/ueben', 'Üben'])}
    <form id="kartenForm" class="karte f-karten">
      <label>Thema
        <select name="thema"><option value="">Alle Themen</option>${optionen(themenVon(KARTEN))}</select>
      </label>
      <label class="check"><input type="checkbox" name="alle"> Auch Karten üben, die noch nicht fällig sind</label>
      <button class="btn breit gross" id="kartenStart">Lernen starten</button>
      <p class="hinweis" id="kartenInfo" style="text-align:center;margin-top:10px"></p>
    </form>

    <h2>Dein Karteikasten</h2>
    <div class="faecher">
      ${[1, 2, 3, 4, 5].map(f => `
        <div class="fach">
          <span class="anzahl">${proFach[f]}</span>
          <span class="name">Fach ${f}</span>
          <div class="saeule" style="--o:${.25 + .75 * proFach[f] / maxFach}"></div>
        </div>`).join('')}
    </div>
    <p class="hinweis">✨ ${proFach[0]} neue Karten. Gewusste Karten rücken ein Fach weiter und kommen später wieder: Fach 2 nach 1 Tag, Fach 3 nach 3, Fach 4 nach 7, Fach 5 nach 30 Tagen. Nicht gewusste gehen zurück in Fach 1.</p>`;

  const form = $('#kartenForm');
  const faellig = new Set(faelligeKarten().map(k => k.id));
  const auswahl = () => {
    const w = Object.fromEntries(new FormData(form));
    return KARTEN.filter(k => (!w.thema || k.thema === w.thema) && (w.alle || faellig.has(k.id)));
  };
  const info = () => {
    const n = auswahl().length;
    $('#kartenInfo').textContent = n ? `${n} Karten bereit` : 'Für heute ist alles gelernt 🎉';
    $('#kartenStart').disabled = !n;
  };
  form.addEventListener('change', info);
  info();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const liste = auswahl();
    if (liste.length) kartenLernen(mischen(liste));
  });
}

function kartenLernen(stapel) {
  const gesamt = stapel.length;
  let gewusst = 0;
  let sitzungXp = 0;
  const schonFalsch = new Set();
  fokusModus(true);
  karteZeigen();

  function karteZeigen() {
    if (!stapel.length) return fertig();
    const k = stapel[0];
    let gedreht = false;

    app.innerHTML = `
      ${lernkopf('f-karten', (gesamt - stapel.length) / gesamt, `${stapel.length}`)}
      <div class="flipkarte" id="flip" tabindex="0" role="button" aria-label="Karte umdrehen" style="--k:${themaFarbe(k.thema)}">
        <div class="flip-innen">
          <div class="flip-seite vorne">
            <div class="k-thema">${esc(k.thema)}</div>
            <div class="k-text">${esc(k.vorne)}</div>
            <div class="k-tipp">👆 Tippen zum Umdrehen</div>
          </div>
          <div class="flip-seite hinten">
            <div class="k-frage">${esc(k.vorne)}</div>${esc(k.hinten)}
          </div>
        </div>
      </div>
      <div class="pruefleiste" id="leiste">
        <div class="innen"><button class="btn breit gross f-karten" id="umdrehen">Antwort zeigen</button></div>
      </div>`;

    $('#schliessen').onclick = fertig;
    $('#flip').onclick = umdrehen;
    $('#umdrehen').onclick = umdrehen;

    tastenHandler = e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!gedreht) umdrehen(); }
      else if (gedreht && (e.key === '1' || e.key === 'ArrowLeft')) bewerten(false);
      else if (gedreht && (e.key === '2' || e.key === 'ArrowRight')) bewerten(true);
      else if (e.key === 'Escape') fertig();
    };

    function umdrehen() {
      if (gedreht) return;
      gedreht = true;
      $('#flip').classList.add('gedreht');
      $('#leiste .innen').innerHTML = `
        <div class="knoepfe" style="margin:0">
          <button class="btn gross nok" id="nein">✖ Nicht gewusst</button>
          <button class="btn gross ok" id="ja">✔ Gewusst</button>
        </div>`;
      $('#ja').onclick = () => bewerten(true);
      $('#nein').onclick = () => bewerten(false);
    }

    function bewerten(ok) {
      if (!gedreht) return;
      gedreht = false;
      stapel.shift();
      if (ok) {
        // Karten, die in dieser Runde schon falsch waren, bleiben in Fach 1
        if (!schonFalsch.has(k.id)) Speicher.karteBewerten(k.id, true);
        gewusst++;
        sitzungXp += 5;
        xpGeben(5, $('#ja'));
      } else {
        Speicher.karteBewerten(k.id, false);
        schonFalsch.add(k.id);
        stapel.push(k); // kommt in dieser Runde noch mal dran
        sitzungXp += 1;
        Speicher.punkte(1);
        statsAktualisieren();
      }
      setTimeout(karteZeigen, ok ? 250 : 0);
    }
  }

  function fertig() {
    fokusModus(false);
    const pct = prozent(gesamt - schonFalsch.size, gesamt);
    if (gewusst && pct >= 70) setTimeout(konfetti, 200);
    app.innerHTML = `
      <div class="ergebnis">
        <span class="grosses-emoji">${gewusst === 0 ? '🗂️' : pct >= 90 ? '🧠' : '💪'}</span>
        <h1>${gewusst === 0 ? 'Runde beendet' : pct >= 90 ? 'Gedächtnis-Champion!' : 'Gut trainiert!'}</h1>
        <p class="hinweis">${schonFalsch.size ? `${schonFalsch.size} Karten kommen morgen wieder dran.` : gewusst ? 'Alles auf Anhieb gewusst!' : ''}</p>
        <div class="ergebnis-kacheln">
          <div class="ergebnis-kachel" style="--k:var(--gold)"><div class="k-titel">XP</div><div class="k-wert">+${sitzungXp}</div></div>
          <div class="ergebnis-kachel" style="--k:var(--karten)"><div class="k-titel">Gelernt</div><div class="k-wert">${gewusst}</div></div>
          <div class="ergebnis-kachel" style="--k:var(--ok)"><div class="k-titel">Auf Anhieb</div><div class="k-wert">${gewusst ? pct : 0} %</div></div>
        </div>
      </div>
      <div class="knoepfe f-karten"><button class="btn" id="zurueck">Zum Karteikasten</button></div>`;
    $('#zurueck').onclick = () => geheZu('karten');
  }
}

// ═══════════════════════════ Subnetting-Trainer ═══════════════════════════
let subnetModus = 'analyse';

function seiteSubnetting() {
  const modi = { analyse: '🔍 Netz berechnen', aufteilen: '✂️ Netz aufteilen', maske: '🎭 Maske ↔ CIDR' };
  app.innerHTML = `
    ${seitenkopf('f-subnetz', '🌐', 'Subnetting-Trainer', 'Zufällige Aufgaben mit Rechenweg', ['#/ueben', 'Üben'])}
    ${Speicher.lektion('subnetting').fertig ? '' : `
      <button class="lektion-banner f-lernen" id="subnetErklaerung" style="width:100%;text-align:left;font:inherit;cursor:pointer">
        <span class="emoji">📖</span>
        <span><strong>Noch unsicher?</strong><small>Die Erklärung zeigt dir Schritt für Schritt, wie du rechnest.</small></span>
        <span class="los">▶</span>
      </button>`}
    <div class="reiter">
      ${Object.entries(modi).map(([k, t]) => `<button data-modus="${k}" class="${k === subnetModus ? 'aktiv' : ''}">${t}</button>`).join('')}
    </div>
    <div id="subnetBereich"></div>`;
  $$('.reiter button').forEach(b => b.onclick = () => { subnetModus = b.dataset.modus; seiteSubnetting(); });
  if ($('#subnetErklaerung')) $('#subnetErklaerung').onclick = () => lektionStarten(LEKTIONEN.find(l => l.id === 'subnetting'));
  ({ analyse: subnetAnalyse, aufteilen: subnetAufteilen, maske: subnetMaske })[subnetModus]();
}

// Baut ein Formular mit Eingabefeldern, prüft die Eingaben und zeigt den Rechenweg
function subnetFormular({ kopf, felder, weg, modus }) {
  const bereich = $('#subnetBereich');
  bereich.innerHTML = `
    <form class="karte f-subnetz" id="subnetForm" autocomplete="off">
      <div class="aufgabe-box">${kopf}</div>
      <div class="felder">
        ${felder.map(f => `
          <label>${f.label}
            <input type="text" name="${f.name}" inputmode="${f.art === 'zahl' ? 'numeric' : 'decimal'}" placeholder="${f.platzhalter || ''}" spellcheck="false">
            <span class="loesung-hinweis" data-fuer="${f.name}"></span>
          </label>`).join('')}
      </div>
      <div class="knoepfe">
        <button class="btn gross" id="pruefen">Prüfen</button>
        <button class="btn zweit gross" type="button" id="neueAufgabe">Überspringen</button>
      </div>
      <div id="subnetErgebnis"></div>
    </form>`;

  const form = $('#subnetForm');
  $('#neueAufgabe').onclick = seiteSubnetting;
  form.elements[felder[0].name].focus({ preventScroll: true });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if ($('#pruefen').dataset.fertig) return seiteSubnetting();
    let alleRichtig = true;
    for (const f of felder) {
      const input = form.elements[f.name];
      const eingabe = f.art === 'zahl' ? Subnetting.zahlNormal(input.value) : Subnetting.ipNormal(input.value);
      const ok = eingabe === f.loesung;
      alleRichtig = alleRichtig && ok;
      input.classList.toggle('richtig', ok);
      input.classList.toggle('falsch', !ok);
      input.readOnly = true;
      $(`[data-fuer="${f.name}"]`, form).textContent = ok ? '' : `✔ ${f.anzeige ?? f.loesung}`;
    }
    Speicher.subnetErgebnis(modus, alleRichtig);
    $('#subnetErgebnis').innerHTML = `
      <p class="feedback ${alleRichtig ? 'ok' : 'nok'}">${alleRichtig ? `✔ ${zufallAus(LOB)} Alles richtig.` : '✖ Nicht ganz. So rechnest du es:'}</p>
      <div class="erklaerung"><strong>Rechenweg</strong><ol class="weg">${weg.map(s => `<li>${s}</li>`).join('')}</ol></div>`;
    const knopf = $('#pruefen');
    knopf.textContent = 'Nächste Aufgabe';
    knopf.dataset.fertig = '1';
    $('#neueAufgabe').remove();
    xpGeben(alleRichtig ? 15 : 3, knopf);
    if (alleRichtig && felder.length > 2) konfetti();
    knopf.focus({ preventScroll: true });
    $('#subnetErgebnis').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function subnetAnalyse() {
  const a = Subnetting.aufgabeAnalyse();
  const l = a.loesung;
  subnetFormular({
    modus: 'analyse',
    kopf: `<p class="hinweis">Berechne für diese Adresse:</p><div class="aufgabe-ip">${a.ip}/${a.praefix}</div>`,
    felder: [
      { name: 'maske', label: 'Subnetzmaske', loesung: l.maske, platzhalter: 'z. B. 255.255.255.0' },
      { name: 'netz', label: 'Netzadresse', loesung: l.netz },
      { name: 'broadcast', label: 'Broadcast-Adresse', loesung: l.broadcast },
      { name: 'erster', label: 'Erster nutzbarer Host', loesung: l.erster },
      { name: 'letzter', label: 'Letzter nutzbarer Host', loesung: l.letzter },
      { name: 'hosts', label: 'Anzahl nutzbarer Hosts', art: 'zahl', loesung: l.hosts, anzeige: zahl(l.hosts) }
    ],
    weg: a.weg
  });
}

function subnetAufteilen() {
  const a = Subnetting.aufgabeAufteilen();
  const l = a.loesung;
  subnetFormular({
    modus: 'aufteilen',
    kopf: `<p class="hinweis">Teile das Netz</p><div class="aufgabe-ip">${a.netz}/${a.praefix}</div>
           <p style="margin:6px 0 0">in <strong>${a.anzahl} gleich große Subnetze</strong> auf (so wenige Bits wie möglich leihen).</p>`,
    felder: [
      { name: 'praefix', label: 'Neues Präfix (CIDR)', art: 'zahl', loesung: l.praefix, anzeige: '/' + l.praefix, platzhalter: 'z. B. /26' },
      { name: 'maske', label: 'Neue Subnetzmaske', loesung: l.maske },
      { name: 'hosts', label: 'Hosts pro Subnetz', art: 'zahl', loesung: l.hosts, anzeige: zahl(l.hosts) },
      { name: 'netz', label: `Netzadresse von Subnetz Nr. ${a.nr}`, loesung: l.netz },
      { name: 'broadcast', label: `Broadcast von Subnetz Nr. ${a.nr}`, loesung: l.broadcast }
    ],
    weg: a.weg
  });
}

function subnetMaske() {
  const a = Subnetting.aufgabeMaske();
  const zuMaske = a.richtung === 'zuMaske';
  const bits = '1'.repeat(a.praefix).padEnd(32, '0').match(/.{8}/g).join('.');
  subnetFormular({
    modus: 'maske',
    kopf: zuMaske
      ? `<p class="hinweis">Wie lautet die Subnetzmaske zu</p><div class="aufgabe-ip">/${a.praefix}</div>`
      : `<p class="hinweis">Welches CIDR-Präfix gehört zur Maske</p><div class="aufgabe-ip">${a.maske}</div>`,
    felder: zuMaske
      ? [{ name: 'maske', label: 'Subnetzmaske', loesung: a.maske }]
      : [{ name: 'praefix', label: 'Präfix', art: 'zahl', loesung: a.praefix, anzeige: '/' + a.praefix, platzhalter: 'z. B. /24' }],
    weg: [
      `Binär: <code>${bits}</code>`,
      `Das sind ${a.praefix} Einsen → <strong>/${a.praefix}</strong> = <code>${a.maske}</code>.`,
      'Merkhilfe für ein Oktett: 128, 192, 224, 240, 248, 252, 254, 255 (1 bis 8 Einsen).'
    ]
  });
}

// ═══════════════════════════ Erklärungen / Lektionen ═══════════════════════════
// Begonnene Lektion, sonst die nächste noch nicht abgeschlossene (in Lernreihenfolge)
function aktuelleLektion() {
  const offen = LEKTIONEN_SORTIERT.filter(l => !Speicher.lektion(l.id).fertig);
  return offen.find(l => Speicher.lektion(l.id).schritt > 0) || offen[0] || null;
}

function lektionsZeile(l, nr) {
  const s = Speicher.lektion(l.id);
  const pct = s.fertig ? 100 : prozent(s.schritt, l.schritte.length);
  const status = s.fertig ? '<span class="lz-status fertig">✔</span>'
    : s.schritt ? `<span class="lz-status begonnen">${ring(pct, 'var(--farbe)', 34, '')}</span>`
    : `<span class="lz-status">${nr}</span>`;
  const info = s.fertig ? 'Abgeschlossen · nochmal ansehen'
    : s.schritt ? `Weiter bei Schritt ${s.schritt + 1} von ${l.schritte.length}`
    : `${l.schritte.length} Schritte · ${l.dauer.replace('ca. ', '')}`;
  return `
    <button class="lektion-zeile ${s.fertig ? 'ist-fertig' : ''}" data-lektion="${l.id}">
      ${status}
      <span class="lz-emoji">${l.emoji}</span>
      <span class="lz-text"><strong>${l.titel}</strong><small>${info}</small></span>
      <span class="lz-pfeil">›</span>
    </button>`;
}

function seiteLernen() {
  const alle = LEKTIONEN_SORTIERT;
  const fertig = alle.filter(l => Speicher.lektion(l.id).fertig).length;
  const aktuell = aktuelleLektion();
  const begonnen = aktuell && Speicher.lektion(aktuell.id).schritt > 0;

  app.innerHTML = `
    ${seitenkopf('f-lernen', '📖', 'Lernen', `${fertig} von ${alle.length} Erklärungen abgeschlossen`)}

    ${aktuell ? `
      <button class="lektion-banner ${aktuell.farbe}" id="aktuelleLektion" style="width:100%;text-align:left;font:inherit;cursor:pointer">
        <span class="emoji">${aktuell.emoji}</span>
        <span><strong>${begonnen ? 'Weitermachen' : 'Empfohlen als Nächstes'}: ${aktuell.titel}</strong>
        <small>${begonnen ? `Schritt ${Speicher.lektion(aktuell.id).schritt + 1} von ${aktuell.schritte.length}` : `${aktuell.schritte.length} Schritte · ${aktuell.dauer}`}</small></span>
        <span class="los">▶</span>
      </button>` : ''}

    ${LERN_BEREICHE.map(b => {
      const lektionen = b.lektionen.map(id => LEKTIONEN.find(l => l.id === id)).filter(Boolean);
      const bFertig = lektionen.filter(l => Speicher.lektion(l.id).fertig).length;
      return `
        <section class="bereich ${b.farbe}">
          <div class="bereich-kopf">
            <span class="emoji">${b.emoji}</span>
            <div><h2>${b.titel}</h2><small>${lektionen.length ? `${bFertig} von ${lektionen.length} abgeschlossen` : 'in Arbeit'}</small></div>
          </div>
          <div class="lektion-liste">
            ${lektionen.map((l, i) => lektionsZeile(l, i + 1)).join('')}
            ${b.geplant.map(g => `
              <div class="lektion-zeile bald">
                <span class="lz-status">🔒</span>
                <span class="lz-emoji">${g.emoji}</span>
                <span class="lz-text"><strong>${g.titel}</strong><small>kommt bald</small></span>
              </div>`).join('')}
          </div>
        </section>`;
    }).join('')}`;

  $$('[data-lektion]').forEach(b => b.onclick = () => lektionStarten(LEKTIONEN.find(l => l.id === b.dataset.lektion)));
  if (aktuell) $('#aktuelleLektion').onclick = () => lektionStarten(aktuell);
}

function lektionStarten(l) {
  const stand = Speicher.lektion(l.id);
  let nr = stand.fertig ? 0 : Math.min(stand.schritt, l.schritte.length - 1);
  const geloest = new Set(stand.geloest);
  let sitzungXp = 0;
  fokusModus(true);
  zeigen();

  function zeigen() {
    const schritt = l.schritte[nr];
    const letzter = nr === l.schritte.length - 1;
    let frei = !schritt.sperre || geloest.has(nr);
    Speicher.lektionSpeichern(l.id, { schritt: nr });

    app.innerHTML = `
      ${lernkopf(l.farbe, nr / (l.schritte.length - 1), `<span class="schritt-zaehler">${nr + 1}/${l.schritte.length}</span>`)}
      <article class="lektion ${l.farbe}">
        <p class="schritt-label">${l.emoji} ${l.titel} · Schritt ${nr + 1}</p>
        <h1 class="lektion-titel">${schritt.titel}</h1>
        <div id="schrittInhalt">${schritt.inhalt()}</div>
      </article>
      <div class="pruefleiste" id="leiste">
        <div class="innen">
          <div class="knoepfe" style="margin:0">
            ${nr > 0 ? '<button class="btn zweit gross zurueck-btn" id="zurueck" aria-label="Zurück">◀</button>' : ''}
            <button class="btn gross ${l.farbe}" id="weiter" ${frei ? '' : 'disabled'}>${letzter ? '🏆 Abschließen' : frei ? 'Weiter ▶' : '🔒 Löse erst die Aufgabe'}</button>
          </div>
        </div>
      </div>`;

    const api = {
      freigeben() {
        if (frei) return;
        frei = true;
        geloest.add(nr);
        Speicher.lektionSpeichern(l.id, { geloest: [...geloest] });
        const w = $('#weiter');
        w.disabled = false;
        w.textContent = letzter ? '🏆 Abschließen' : 'Weiter ▶';
        w.classList.add('freigegeben');
      },
      // XP nur beim ersten Lösen eines Schritts
      xp(n, el) {
        if (geloest.has(nr)) return;
        sitzungXp += n;
        xpGeben(n, el);
      }
    };
    if (schritt.init) schritt.init($('#schrittInhalt'), api);

    $('#weiter').onclick = () => (letzter ? abschluss() : (nr++, zeigen()));
    if (nr > 0) $('#zurueck').onclick = () => { nr--; zeigen(); };
    $('#schliessen').onclick = () => geheZu('lernen');

    tastenHandler = e => {
      if (e.key === 'ArrowRight' && !$('#weiter').disabled) $('#weiter').click();
      else if (e.key === 'ArrowLeft' && nr > 0) $('#zurueck').click();
      else if (e.key === 'Escape') $('#schliessen').click();
    };
  }

  function abschluss() {
    const ersteMal = !stand.fertig;
    Speicher.lektionSpeichern(l.id, { fertig: true, schritt: 0 });
    fokusModus(false);
    if (ersteMal) { sitzungXp += 30; xpGeben(30); }
    setTimeout(konfetti, 150);
    app.innerHTML = `
      <div class="ergebnis">
        <span class="grosses-emoji">🎓</span>
        <h1>Lektion abgeschlossen!</h1>
        <p class="hinweis">${l.titel}${ersteMal ? ' · +30 XP Abschlussbonus' : ''}</p>
        <div class="ergebnis-kacheln">
          <div class="ergebnis-kachel" style="--k:var(--gold)"><div class="k-titel">XP</div><div class="k-wert">+${sitzungXp}</div></div>
          <div class="ergebnis-kachel" style="--k:var(--lernen)"><div class="k-titel">Schritte</div><div class="k-wert">${l.schritte.length}</div></div>
          <div class="ergebnis-kachel" style="--k:var(--ok)"><div class="k-titel">Aufgaben</div><div class="k-wert">${geloest.size}</div></div>
        </div>
      </div>
      <div class="knoepfe ${l.farbe}">
        ${l.ueben ? `<a class="btn gross" href="${l.ueben.link}">${l.ueben.text}</a>` : ''}
        <button class="btn zweit gross" id="zurListe">Zu den Erklärungen</button>
      </div>`;
    $('#zurListe').onclick = () => geheZu('lernen');
  }
}

// ═══════════════════════════ Eigene Aufgaben ═══════════════════════════
function seiteEigene() {
  const eigene = Speicher.daten.eigene;
  const offene = eigene.filter(a => a.typ === 'offen');
  app.innerHTML = `
    ${seitenkopf('f-eigene', '✏️', 'Eigene Aufgaben', 'Alte Prüfungen und Schulaufgaben selbst eintragen', ['#/ueben', 'Üben'])}
    <p class="infobox f-eigene">📝 <strong>Offene Aufgaben</strong> beantwortest du wie in der echten Prüfung und vergleichst dann mit der Musterlösung.
      ☑️ <strong>Multiple-Choice-Aufgaben</strong> erscheinen automatisch im Quiz.</p>
    <div class="knoepfe f-eigene" style="margin-top:0">
      <button class="btn gross" id="neu">＋ Neue Aufgabe</button>
      <button class="btn zweit gross" id="ueben" ${offene.length ? '' : 'disabled'}>▶ Offene üben (${offene.length})</button>
    </div>
    <h2>Deine Aufgaben (${eigene.length})</h2>
    <div id="liste">
      ${eigene.length ? eigene.map(a => `
        <div class="karte klein liste-eintrag f-eigene">
          <div>
            <div class="chips" style="margin-bottom:4px">
              <span class="chip">${a.typ === 'mc' ? '☑️ Multiple Choice' : '📝 Offen'}</span>
              <span class="chip">${esc(a.teil)}</span>
              <span class="chip">${esc(a.thema)}</span>
              ${a.quelle ? `<span class="chip">${esc(a.quelle)}</span>` : ''}
            </div>
            <p style="margin:0">${esc(a.frage.length > 160 ? a.frage.slice(0, 160) + '…' : a.frage)}</p>
          </div>
          <div class="aktionen">
            <button class="icon-btn" data-bearbeiten="${a.id}" title="Bearbeiten" aria-label="Bearbeiten">✏️</button>
            <button class="icon-btn" data-loeschen="${a.id}" title="Löschen" aria-label="Löschen">🗑️</button>
          </div>
        </div>`).join('') : '<div class="karte leer"><span class="emoji">📭</span>Noch keine eigenen Aufgaben.<br>Leg mit „Neue Aufgabe“ los!</div>'}
    </div>
    <h2>Aufgaben teilen</h2>
    <p class="hinweis">Exportiere deine Aufgaben als Datei, um sie aufs Handy zu übertragen oder mit Mitschülern zu tauschen.</p>
    <div class="knoepfe f-eigene">
      <button class="btn zweit" id="export" ${eigene.length ? '' : 'disabled'}>⬇ Exportieren</button>
      <button class="btn zweit" id="import">⬆ Importieren</button>
    </div>`;

  $('#neu').onclick = () => eigeneBearbeiten();
  $('#ueben').onclick = () => offeneUeben(mischen(offene));
  $$('[data-bearbeiten]').forEach(b => b.onclick = () => eigeneBearbeiten(eigene.find(a => a.id === b.dataset.bearbeiten)));
  $$('[data-loeschen]').forEach(b => b.onclick = () => {
    if (confirm('Diese Aufgabe wirklich löschen?')) { Speicher.eigeneLoeschen(b.dataset.loeschen); seiteEigene(); }
  });
  $('#export').onclick = () => download(`fisi-aufgaben-${heute()}.json`, JSON.stringify(eigene, null, 2));
  $('#import').onclick = () => dateiWaehlen(text => {
    try {
      const n = Speicher.eigeneImportieren(JSON.parse(text));
      meldung(`✔ ${n} Aufgaben importiert`);
      seiteEigene();
    } catch (err) {
      alert('Import fehlgeschlagen: ' + err.message);
    }
  });
}

function eigeneBearbeiten(alt) {
  const a = alt || { typ: 'offen', teil: 'AP2', thema: '', frage: '', antworten: ['', '', '', ''], richtig: [], erklaerung: '', quelle: '' };
  const antworten = [...(a.antworten || []), '', '', '', ''].slice(0, Math.max(4, (a.antworten || []).length));
  const themen = themenVon([...FRAGEN, ...Speicher.daten.eigene]);
  const pille = (name, wert, text, an) => `<label><input type="radio" name="${name}" value="${wert}" ${an ? 'checked' : ''}><span>${text}</span></label>`;

  app.innerHTML = `
    ${seitenkopf('f-eigene', alt ? '✏️' : '＋', alt ? 'Aufgabe bearbeiten' : 'Neue Aufgabe', '', ['#/eigene', 'Eigene Aufgaben'])}
    <form id="eigeneForm" class="karte f-eigene">
      <p class="feldtitel">Art der Aufgabe</p>
      <div class="pillen">
        ${pille('typ', 'offen', '📝 Offen mit Musterlösung', a.typ === 'offen')}${pille('typ', 'mc', '☑️ Multiple Choice', a.typ === 'mc')}
      </div>
      <p class="feldtitel">Prüfungsteil</p>
      <div class="pillen">
        ${['AP1', 'AP2', 'WiSo'].map(t => pille('teil', t, t, t === a.teil)).join('')}
      </div>
      <label>Thema
        <input type="text" name="thema" list="themenListe" required value="${esc(a.thema)}" placeholder="z. B. Netzwerktechnik">
        <datalist id="themenListe">${themen.map(t => `<option value="${esc(t)}">`).join('')}</datalist>
      </label>
      <label>Quelle (optional)
        <input type="text" name="quelle" value="${esc(a.quelle)}" placeholder="z. B. AP2 Sommer 2024, Aufgabe 2b">
      </label>
      <label>Aufgabenstellung
        <textarea name="frage" required>${esc(a.frage)}</textarea>
      </label>
      <div id="mcBereich">
        <p class="feldtitel" style="margin-bottom:8px">Antworten <span class="hinweis">(Haken bei den richtigen)</span></p>
        <div id="mcAntworten">
          ${antworten.map((t, i) => mcZeile(t, (a.richtig || []).includes(i))).join('')}
        </div>
        <button type="button" class="btn zweit" id="mcPlus" style="margin-bottom:16px">＋ Antwort</button>
      </div>
      <label><span id="erklaerungLabel">Musterlösung</span>
        <textarea name="erklaerung">${esc(a.erklaerung)}</textarea>
      </label>
      <p class="hinweis" id="formFehler" style="color:var(--nok)"></p>
      <div class="knoepfe">
        <button class="btn gross">💾 Speichern</button>
        <button type="button" class="btn zweit gross" id="abbrechen">Abbrechen</button>
      </div>
    </form>`;

  const form = $('#eigeneForm');
  const typUmschalten = () => {
    const mc = form.elements.typ.value === 'mc';
    $('#mcBereich').style.display = mc ? '' : 'none';
    $('#erklaerungLabel').textContent = mc ? 'Erklärung (wird nach dem Beantworten gezeigt)' : 'Musterlösung';
  };
  form.addEventListener('change', e => { if (e.target.name === 'typ') typUmschalten(); });
  typUmschalten();
  $('#mcPlus').onclick = () => $('#mcAntworten').insertAdjacentHTML('beforeend', mcZeile('', false));
  $('#abbrechen').onclick = seiteEigene;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const w = form.elements;
    const neu = {
      id: alt?.id,
      typ: w.typ.value,
      teil: w.teil.value,
      thema: w.thema.value.trim(),
      quelle: w.quelle.value.trim(),
      frage: w.frage.value.trim(),
      erklaerung: w.erklaerung.value.trim()
    };
    if (neu.typ === 'mc') {
      const zeilen = $$('.mc-zeile', form)
        .map(z => ({ text: $('input[type=text]', z).value.trim(), richtig: $('input[type=checkbox]', z).checked }))
        .filter(z => z.text);
      neu.antworten = zeilen.map(z => z.text);
      neu.richtig = zeilen.map((z, i) => (z.richtig ? i : -1)).filter(i => i >= 0);
      if (neu.antworten.length < 2) return ($('#formFehler').textContent = 'Bitte mindestens zwei Antworten eingeben.');
      if (!neu.richtig.length) return ($('#formFehler').textContent = 'Bitte mindestens eine Antwort als richtig markieren.');
    }
    Speicher.eigeneSpeichern(neu);
    meldung('✔ Aufgabe gespeichert');
    seiteEigene();
  });
}

function mcZeile(text, richtig) {
  return `<div class="mc-zeile">
    <input type="text" value="${esc(text)}" placeholder="Antwort">
    <label><input type="checkbox" ${richtig ? 'checked' : ''}> richtig</label>
  </div>`;
}

function offeneUeben(liste) {
  let nr = 0;
  let gewusst = 0;
  let sitzungXp = 0;
  fokusModus(true);
  zeigen();

  function zeigen() {
    if (nr >= liste.length) return fertig();
    const a = liste[nr];
    app.innerHTML = `
      ${lernkopf('f-eigene', nr / liste.length)}
      <div class="chips f-eigene">
        <span class="chip">${esc(a.teil)}</span><span class="chip">${esc(a.thema)}</span>${a.quelle ? `<span class="chip">${esc(a.quelle)}</span>` : ''}
      </div>
      <h2 class="frage">${esc(a.frage)}</h2>
      <label class="f-eigene" style="margin-top:16px">Deine Antwort
        <textarea id="meineAntwort" placeholder="Schreib deine Antwort so auf, wie du es in der Prüfung tun würdest…"></textarea>
      </label>
      <div id="loesungBereich"></div>
      <div class="pruefleiste" id="leiste">
        <div class="innen"><button class="btn breit gross f-eigene" id="zeigen">Musterlösung zeigen</button></div>
      </div>`;
    $('#schliessen').onclick = fertig;
    $('#zeigen').onclick = () => {
      $('#loesungBereich').innerHTML = `<div class="erklaerung"><strong>Musterlösung</strong>\n${esc(a.erklaerung || '(keine Musterlösung eingetragen)')}</div>`;
      $('#loesungBereich').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      $('#leiste .innen').innerHTML = `
        <p class="hinweis" style="text-align:center;margin-top:0">Wie gut war deine Antwort?</p>
        <div class="knoepfe" style="margin:0">
          <button class="btn gross nok" id="nein">✖ Nicht gewusst</button>
          <button class="btn gross ok" id="ja">✔ Gewusst</button>
        </div>`;
      $('#ja').onclick = () => { Speicher.offenBewerten(a.id, true); gewusst++; sitzungXp += 10; xpGeben(10, $('#ja')); nr++; setTimeout(zeigen, 250); };
      $('#nein').onclick = () => { Speicher.offenBewerten(a.id, false); sitzungXp += 2; xpGeben(2); nr++; zeigen(); };
    };
  }

  function fertig() {
    fokusModus(false);
    if (gewusst && gewusst / Math.max(1, nr) >= .7) setTimeout(konfetti, 200);
    app.innerHTML = `
      <div class="ergebnis">
        <span class="grosses-emoji">📝</span>
        <h1>Fertig!</h1>
        <div class="ergebnis-kacheln">
          <div class="ergebnis-kachel" style="--k:var(--gold)"><div class="k-titel">XP</div><div class="k-wert">+${sitzungXp}</div></div>
          <div class="ergebnis-kachel" style="--k:var(--ok)"><div class="k-titel">Gewusst</div><div class="k-wert">${gewusst}</div></div>
          <div class="ergebnis-kachel" style="--k:var(--eigene)"><div class="k-titel">Bearbeitet</div><div class="k-wert">${nr}</div></div>
        </div>
      </div>
      <div class="knoepfe f-eigene"><button class="btn" id="zurueck">Zu den eigenen Aufgaben</button></div>`;
    $('#zurueck').onclick = () => geheZu('eigene');
  }
}

// ═══════════════════════════ Lernstand / Fortschritt ═══════════════════════════
const offeneAbschnitte = new Set();

function seiteFortschritt() {
  const d = Speicher.daten;
  const fragen = alleMcFragen();
  const lv = Speicher.level();

  // Quiz-Statistik je Prüfungsteil und Thema
  const gruppen = {};
  for (const f of fragen) {
    const schluessel = `${f.teil}|${f.thema}`;
    const g = gruppen[schluessel] || (gruppen[schluessel] = { teil: f.teil, thema: f.thema, gesamt: 0, gesehen: 0, richtig: 0, versuche: 0 });
    g.gesamt++;
    const e = d.quiz[f.id];
    if (e) { g.gesehen++; g.richtig += e.richtig; g.versuche += e.richtig + e.falsch; }
  }
  const liste = Object.values(gruppen);
  const balken = g => {
    const pct = prozent(g.richtig, g.versuche);
    return `
      <div class="balkenzeile">
        <div class="kopf"><span>${esc(g.thema)}</span><small>${g.gesehen}/${g.gesamt} · ${g.versuche ? pct + ' %' : 'neu'}</small></div>
        <div class="balken"><div style="width:${g.versuche ? Math.max(pct, 3) : 0}%;background:${farbeFuer(pct)}"></div></div>
      </div>`;
  };
  const geuebt = liste.filter(g => g.versuche);
  const schwach = geuebt.filter(g => prozent(g.richtig, g.versuche) < 80).sort((a, b) => a.richtig / a.versuche - b.richtig / b.versuche).slice(0, 3);

  // Letzte 7 Tage
  const wochentage = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const tage = [6, 5, 4, 3, 2, 1, 0].map(n => {
    const t = Speicher.tagVor(n);
    return { name: n === 0 ? 'Heute' : wochentage[t.getDay()], xp: d.tage[Speicher.tagText(t)] || 0 };
  });
  const maxXp = Math.max(d.ziel, ...tage.map(t => t.xp));

  const faecher = [0, 0, 0, 0, 0, 0];
  for (const k of KARTEN) faecher[d.karten[k.id]?.fach || 0]++;

  const modusNamen = { analyse: 'Netz berechnen', aufteilen: 'Netz aufteilen', maske: 'Maske ↔ CIDR' };
  const offen = Object.values(d.offen).reduce((s, o) => ({ g: s.g + o.gewusst, n: s.n + o.nicht }), { g: 0, n: 0 });
  const zielPille = xp => `<label><input type="radio" name="ziel" value="${xp}" ${d.ziel === xp ? 'checked' : ''}><span>${xp} XP</span></label>`;

  const quizGesamt = liste.reduce((s, g) => ({ r: s.r + g.richtig, v: s.v + g.versuche }), { r: 0, v: 0 });
  const lektionenFertig = LEKTIONEN_SORTIERT.filter(l => Speicher.lektion(l.id).fertig).length;
  const aufklapp = (id, titel, inhalt, offen) => `
    <details class="aufklapp" data-id="${id}" ${offen ? 'open' : ''}>
      <summary>${titel}</summary>
      <div class="aufklapp-inhalt">${inhalt}</div>
    </details>`;

  app.innerHTML = `
    ${seitenkopf('f-stand', '📊', 'Lernstand', 'Sieh, wo du stehst und was noch fehlt')}

    <div class="karte level-karte f-stand">
      ${ring(prozent(lv.rest, lv.bedarf), 'var(--stand)', 84, `<span><small style="font-size:.7rem;color:var(--leise)">LEVEL</small><br><span class="level-zahl">${lv.level}</span></span>`)}
      <div class="info">
        <div style="font-weight:900;font-size:1.15rem">⭐ ${zahl(d.xp)} XP gesamt</div>
        <div class="hinweis" style="margin:2px 0 0">Noch ${zahl(lv.bedarf - lv.rest)} XP bis Level ${lv.level + 1}</div>
        <div class="hinweis" style="margin:2px 0 0">🔥 ${Speicher.serie()} ${Speicher.serie() === 1 ? 'Tag' : 'Tage'} Lernserie</div>
      </div>
    </div>

    <div class="stat-kacheln">
      <a href="#/lernen" class="f-lernen"><span>📖</span><b>${lektionenFertig}/${LEKTIONEN_SORTIERT.length}</b><small>Erklärungen</small></a>
      <a href="#/quiz" class="f-quiz"><span>❓</span><b>${quizGesamt.v ? prozent(quizGesamt.r, quizGesamt.v) + ' %' : '–'}</b><small>Quiz richtig</small></a>
      <a href="#/karten" class="f-karten"><span>🗂️</span><b>${faecher[4] + faecher[5]}/${KARTEN.length}</b><small>Karten sicher</small></a>
    </div>

    <div class="karte f-stand">
      <p class="feldtitel">Letzte 7 Tage</p>
      <div class="wochen-diagramm">
        ${tage.map(t => `
          <div class="tag">
            <span class="wert">${t.xp || ''}</span>
            <div class="saeule ${!t.xp ? 'ohne' : t.xp >= d.ziel ? 'ziel' : ''}" style="height:${Math.round(Math.max(6, t.xp / maxXp * 100))}px"></div>
            <small>${t.name}</small>
          </div>`).join('')}
      </div>
    </div>

    ${schwach.length ? `
      <h2>🎯 Hier solltest du weiterüben</h2>
      <div class="schwach-liste">
        ${schwach.map(g => {
          const pct = prozent(g.richtig, g.versuche);
          return `
            <button class="schwach-zeile" data-thema="${esc(g.thema)}">
              <span class="text"><strong>${esc(g.thema)}</strong>
                <span class="balken"><span style="width:${Math.max(pct, 3)}%;background:${farbeFuer(pct)}"></span></span>
              </span>
              <span class="pct" style="color:${farbeFuer(pct)}">${pct} %</span>
              <span class="ueben-chip">Üben ›</span>
            </button>`;
        }).join('')}
      </div>` : geuebt.length
        ? '<p class="infobox f-subnetz">✅ Alle geübten Themen liegen bei 80 % oder mehr. Stark! Probier im Quiz neue Themen aus.</p>'
        : '<p class="infobox f-quiz">❓ Mach ein paar Quizrunden. Dann siehst du hier, welche Themen du schon kannst.</p>'}

    <h2>Details</h2>
    ${aufklapp('quiz', '❓ Quiz nach Themen', ['AP1', 'AP2', 'WiSo'].map(teil => {
      const gs = liste.filter(g => g.teil === teil).sort((a, b) => a.thema.localeCompare(b.thema, 'de'));
      return gs.length ? `<p class="feldtitel">${teil}</p>${gs.map(balken).join('')}` : '';
    }).join(''))}

    ${aufklapp('karten', '🗂️ Karteikasten', `
      <div class="faecher">
        ${[1, 2, 3, 4, 5].map(f => `<div class="fach"><span class="anzahl">${faecher[f]}</span><span class="name">Fach ${f}</span></div>`).join('')}
      </div>
      <p class="hinweis" style="margin-bottom:0">${faecher[0]} von ${KARTEN.length} Karten noch nie gelernt · ${faecher[5]} sitzen sicher (Fach 5)</p>`)}

    ${aufklapp('subnetz', '🌐 Subnetting & eigene Aufgaben', `
      ${Object.keys(modusNamen).map(m => {
        const s = d.subnetting[m];
        const pct = s ? prozent(s.richtig, s.gesamt) : 0;
        return `<div class="balkenzeile">
          <div class="kopf"><span>${modusNamen[m]}</span><small>${s ? `${s.richtig}/${s.gesamt} richtig` : 'neu'}</small></div>
          <div class="balken"><div style="width:${s ? Math.max(pct, 3) : 0}%;background:${farbeFuer(pct)}"></div></div>
        </div>`;
      }).join('')}
      <p class="hinweis" style="margin:12px 0 0">📝 Eigene offene Aufgaben: ${offen.g + offen.n ? `${offen.g}× gewusst, ${offen.n}× nicht gewusst (${prozent(offen.g, offen.g + offen.n)} %)` : 'noch nicht geübt'}</p>`)}

    ${aufklapp('einstellungen', '⚙️ Einstellungen & Daten', `
      <p class="feldtitel">Tagesziel</p>
      <div class="pillen" id="zielWahl">
        ${[20, 50, 100, 150].map(zielPille).join('')}
      </div>
      <p class="feldtitel">Daten sichern</p>
      <p class="hinweis" style="margin-top:0">Dein Lernstand wird nur in diesem Browser auf diesem Gerät gespeichert. Mit einer Sicherung kannst du ihn auf ein anderes Gerät übertragen oder vor dem Löschen der Browserdaten retten.</p>
      <div class="knoepfe">
        <button class="btn zweit" id="backup">⬇ Sicherung</button>
        <button class="btn zweit" id="restore">⬆ Laden</button>
        <button class="btn gefahr" id="reset">Zurücksetzen</button>
      </div>`)}`;

  // Merken, welche Abschnitte aufgeklappt sind (nur für diese Sitzung)
  $$('details.aufklapp').forEach(det => {
    if (offeneAbschnitte.has(det.dataset.id)) det.open = true;
    det.addEventListener('toggle', () => (det.open ? offeneAbschnitte.add(det.dataset.id) : offeneAbschnitte.delete(det.dataset.id)));
  });
  $$('[data-thema]').forEach(b => b.onclick = () => quizZuThema(b.dataset.thema));

  $('#zielWahl').addEventListener('change', e => {
    Speicher.zielSetzen(Number(e.target.value));
    meldung(`🎯 Neues Tagesziel: ${e.target.value} XP`);
    seiteFortschritt();
  });
  $('#backup').onclick = () => download(`fisi-lernapp-sicherung-${heute()}.json`, Speicher.backupText());
  $('#restore').onclick = () => dateiWaehlen(text => {
    if (!confirm('Der aktuelle Lernstand wird durch die Sicherung ersetzt. Fortfahren?')) return;
    try { Speicher.backupLaden(text); meldung('✔ Sicherung geladen'); statsAktualisieren(); seiteFortschritt(); }
    catch (err) { alert('Laden fehlgeschlagen: ' + err.message); }
  });
  $('#reset').onclick = () => {
    if (confirm('Wirklich den gesamten Lernstand, alle XP UND alle eigenen Aufgaben löschen? Das kann nicht rückgängig gemacht werden.')) {
      Speicher.zuruecksetzen();
      statsAktualisieren();
      seiteFortschritt();
    }
  };
}

// ═══════════════════════════ Navigation ═══════════════════════════
const seiten = {
  '': seiteStart,
  lernen: seiteLernen,
  ueben: seiteUeben,
  quiz: seiteQuiz,
  karten: seiteKarten,
  subnetting: seiteSubnetting,
  eigene: seiteEigene,
  fortschritt: seiteFortschritt
};

// Zu einer Seite wechseln. Ist sie schon in der Adresse, wird sie neu aufgebaut.
function geheZu(route) {
  const ziel = '#/' + route;
  if (location.hash === ziel || (!location.hash && !route)) navigieren();
  else location.hash = ziel;
}

// Unterseiten gehören zu einem Reiter in der Navigation
const REITER_VON = { quiz: 'ueben', karten: 'ueben', subnetting: 'ueben', eigene: 'ueben' };

function navigieren() {
  const route = location.hash.replace(/^#\/?/, '').split('/')[0];
  fokusModus(false);
  (seiten[route] || seiteStart)();
  const reiter = REITER_VON[route] ?? (seiten[route] ? route : '');
  $$('.tabbar a').forEach(a => a.classList.toggle('aktiv', a.dataset.route === reiter));
  statsAktualisieren();
}

// Klick auf den bereits aktiven Reiter lädt die Seite neu (z. B. um ein Quiz abzubrechen)
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#/"]');
  if (link && link.getAttribute('href') === (location.hash || '#/')) {
    e.preventDefault();
    navigieren();
  }
});

// Wenn eine Seite komplett neu aufgebaut wird (neue Frage, neue Karte …), nach oben scrollen
new MutationObserver(eintraege => {
  if (eintraege.some(m => m.addedNodes.length)) window.scrollTo(0, 0);
}).observe(app, { childList: true });

window.addEventListener('hashchange', navigieren);
navigieren();

// Offline-Unterstützung (funktioniert nur über http://localhost oder https://)
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
