// Erklärungen / Lektionen
// Eine Lektion besteht aus Schritten. Jeder Schritt hat:
//   titel:  Überschrift
//   inhalt: Funktion, die das HTML des Schritts liefert
//   init:   (optional) Funktion(box, api) für Interaktionen. api.freigeben() schaltet „Weiter“ frei,
//           api.xp(n, element) gibt XP (nur beim ersten Lösen)
//   sperre: true = „Weiter“ erst nach api.freigeben() möglich (Mitmach-Aufgabe)

// ───────────── Bausteine, die alle Lektionen nutzen können ─────────────
const Baustein = {
  // Sprechblase des Lern-Roboters „Bit“
  bot(text, stimmung = '🤖') {
    return `<div class="sprechblase"><span class="maskottchen">${stimmung}</span><div class="blase">${text}</div></div>`;
  },

  // Kleine Quizfrage mitten in der Erklärung. Falsche Antworten dürfen nochmal versucht werden.
  miniQuiz(box, { frage, antworten, richtig, erklaerung }, api) {
    const bereich = box.querySelector('[data-miniquiz]');
    bereich.innerHTML = `
      <div class="miniquiz">
        <p class="miniquiz-frage">🎯 ${frage}</p>
        <div class="miniquiz-antworten">
          ${antworten.map((a, i) => `<button type="button" class="miniquiz-btn" data-i="${i}">${a}</button>`).join('')}
        </div>
        <div class="miniquiz-feedback"></div>
      </div>`;
    const feedback = bereich.querySelector('.miniquiz-feedback');
    bereich.querySelectorAll('.miniquiz-btn').forEach(btn => {
      btn.onclick = () => {
        if (Number(btn.dataset.i) === richtig) {
          btn.classList.add('richtig');
          bereich.querySelectorAll('.miniquiz-btn').forEach(b => (b.disabled = true));
          feedback.innerHTML = Baustein.bot(`<strong>Richtig! 🎉</strong> ${erklaerung}`, '🤩');
          api.xp(5, btn);
          api.freigeben();
        } else {
          btn.classList.add('falsch');
          btn.disabled = true;
          feedback.innerHTML = Baustein.bot('Hmm, das ist es nicht. Versuch’s nochmal! 💪', '🤔');
        }
      };
    });
  },

  // Schlüssel-Spiel: In jeder Runde den richtigen von vier Schlüsseln (Alice/Bob, privat/öffentlich) wählen
  schluesselSpiel(box, runden, api, schlussText) {
    const bereich = box.querySelector('[data-schluessel]');
    const SCHLUESSEL = [
      ['alice-oeff', '👩', 'Alice', 'öffentlich', 'oeff'],
      ['alice-priv', '👩', 'Alice', 'privat', 'priv'],
      ['bob-oeff', '👨', 'Bob', 'öffentlich', 'oeff'],
      ['bob-priv', '👨', 'Bob', 'privat', 'priv']
    ];
    let runde = 0;
    const zeigen = () => {
      const r = runden[runde];
      bereich.innerHTML = `
        <div class="miniquiz">
          <p class="hinweis" style="margin:0">Runde ${runde + 1} von ${runden.length}</p>
          <p class="miniquiz-frage">🔑 ${r.frage}</p>
          <div class="schluessel-wahl">
            ${SCHLUESSEL.map(([id, emoji, name, art, klasse]) => `
              <button type="button" class="schluessel ${klasse}" data-id="${id}">
                <span class="s-person">${emoji}</span>
                <span class="s-name">${name}</span>
                <span class="s-art">${klasse === 'priv' ? '🔒' : '🔓'} ${art}</span>
              </button>`).join('')}
          </div>
          <div class="miniquiz-feedback"></div>
        </div>`;
      const feedback = bereich.querySelector('.miniquiz-feedback');
      bereich.querySelectorAll('.schluessel').forEach(b => b.onclick = () => {
        if (b.dataset.id === r.richtig) {
          b.classList.add('richtig');
          bereich.querySelectorAll('.schluessel').forEach(x => (x.disabled = true));
          feedback.innerHTML = Baustein.bot(`<strong>Richtig!</strong> ${r.erklaerung}`, '🤩');
          runde++;
          if (runde < runden.length) {
            feedback.insertAdjacentHTML('beforeend', '<button type="button" class="btn breit zweit" data-naechste style="margin-top:10px">Nächste Runde ▶</button>');
            feedback.querySelector('[data-naechste]').onclick = zeigen;
          } else {
            if (schlussText) feedback.insertAdjacentHTML('beforeend', Baustein.bot(schlussText, '🥳'));
            api.xp(10, b);
            api.freigeben();
          }
        } else {
          b.classList.add('falsch');
          b.disabled = true;
          feedback.innerHTML = Baustein.bot(r.tipp || 'Nicht ganz. Überleg nochmal, wer welchen Schlüssel hat! 🤔', '🤔');
        }
      });
    };
    zeigen();
  },

  // 8 Bits eines Oktetts als Kästchen. farbeBis = Anzahl der ersten Bits, die als „Netz“ eingefärbt werden
  oktettBits(wert, { netzBits = -1, klasse = '' } = {}) {
    return `<div class="bitzeile ${klasse}">${wert.toString(2).padStart(8, '0').split('').map((b, i) =>
      `<span class="bitzelle ${netzBits >= 0 ? (i < netzBits ? 'netz' : 'host') : ''} ${b === '1' ? 'eins' : ''}">${b}</span>`).join('')}</div>`;
  }
};

// ───────────── Lektion: Subnetting ─────────────
const LEKTIONEN = [
  {
    id: 'subnetting',
    titel: 'Subnetting verstehen',
    emoji: '🌐',
    farbe: 'f-subnetz',
    dauer: 'ca. 15 Minuten',
    ueben: { link: '#/subnetting', text: '🌐 Jetzt im Trainer üben' },
    beschreibung: 'Von Bits über die Subnetzmaske bis zum Aufteilen von Netzen. Mit zwei Rechenwegen und Mitmach-Aufgaben.',
    schritte: [
      // 1 ─ Begrüßung
      {
        titel: 'Hallo, ich bin Bit! 👋',
        inhalt: () => `
          ${Baustein.bot('Ich bin <strong>Bit</strong>, dein Lern-Roboter. Zusammen knacken wir heute das Thema <strong>Subnetting</strong>. Versprochen: Am Ende ist es gar nicht schwer!')}
          <div class="karte">
            <p class="feldtitel">Worum geht’s?</p>
            <p>Stell dir eine Firma mit 200 Computern vor. Wären alle in einem einzigen großen Netz, würde jeder jeden „hören“. Das ist unübersichtlich, langsam und unsicher.</p>
            <p>Beim <strong>Subnetting</strong> teilen wir ein großes Netz in kleinere Netze auf, zum Beispiel eins für die Buchhaltung, eins für die Entwicklung und eins fürs Gäste-WLAN.</p>
            <div class="vergleich">
              <div><span class="gross-emoji">🏙️</span><strong>Ein großes Netz</strong><small>alle durcheinander</small></div>
              <div class="pfeil">➜</div>
              <div><span class="gross-emoji">🏘️🏘️🏘️</span><strong>Mehrere Subnetze</strong><small>ordentlich getrennt</small></div>
            </div>
          </div>
          <div class="karte">
            <p class="feldtitel">Das lernst du:</p>
            <ul class="haken-liste">
              <li>wie eine IP-Adresse aufgebaut ist</li>
              <li>was Netzteil, Hostteil und Subnetzmaske sind</li>
              <li><strong>zwei Rechenwege</strong>: die schnelle Blockgrößen-Methode und die Binär-Methode</li>
              <li>wie du ein Netz in mehrere Subnetze aufteilst</li>
            </ul>
          </div>`
      },

      // 2 ─ IP-Adresse und Bits
      {
        titel: 'Eine IP-Adresse von innen',
        sperre: true,
        inhalt: () => `
          <p>Eine IPv4-Adresse besteht aus <strong>4 Zahlen</strong>, getrennt durch Punkte. Jede Zahl heißt <strong>Oktett</strong>, weil sie aus <strong>8 Bits</strong> besteht.</p>
          <div class="ip-oktette">
            <span>192</span><b>.</b><span>168</span><b>.</b><span>10</span><b>.</b><span>77</span>
          </div>
          <p class="hinweis" style="text-align:center">4 Oktette × 8 Bit = <strong>32 Bit</strong></p>
          ${Baustein.bot('Jedes Bit hat einen festen Wert. Von links nach rechts halbiert er sich: <strong>128, 64, 32, 16, 8, 4, 2, 1</strong>. Ist ein Bit an (1), zählt sein Wert mit.')}
          <div class="karte">
            <p class="feldtitel">🎮 Mitmachen: Stell die Zahl <span class="ziel-zahl">192</span> ein!</p>
            <p class="hinweis">Tippe auf die Bits, um sie an- oder auszuschalten.</p>
            <div class="bitschalter">
              ${[128, 64, 32, 16, 8, 4, 2, 1].map(w => `<button type="button" class="bit" data-wert="${w}"><small>${w}</small><span>0</span></button>`).join('')}
            </div>
            <div class="bit-summe">= <span id="bitSumme">0</span></div>
            <div data-erfolg></div>
          </div>`,
        init(box, api) {
          const ziel = 192;
          let fertig = false;
          box.querySelectorAll('.bit').forEach(b => b.onclick = () => {
            b.classList.toggle('an');
            $('span', b).textContent = b.classList.contains('an') ? '1' : '0';
            const summe = [...box.querySelectorAll('.bit.an')].reduce((s, x) => s + Number(x.dataset.wert), 0);
            const anzeige = box.querySelector('#bitSumme');
            anzeige.textContent = summe;
            anzeige.parentElement.classList.toggle('treffer', summe === ziel);
            if (summe === ziel && !fertig) {
              fertig = true;
              box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Perfekt!</strong> 192 = 128 + 64, also binär <code>11000000</code>. Diese Zahl siehst du gleich ganz oft wieder 😉', '🤩');
              api.xp(5, anzeige);
              api.freigeben();
            }
          });
        }
      },

      // 3 ─ Netzteil / Hostteil
      {
        titel: 'Netzteil und Hostteil',
        sperre: true,
        inhalt: () => `
          <p>Eine IP-Adresse ist wie eine <strong>Postadresse</strong>:</p>
          <div class="vergleich">
            <div class="netz-box"><span class="gross-emoji">🛣️</span><strong>Netzteil</strong><small>= die Straße<br>gleich für alle im Netz</small></div>
            <div class="pfeil">+</div>
            <div class="host-box"><span class="gross-emoji">🏠</span><strong>Hostteil</strong><small>= die Hausnummer<br>für jedes Gerät anders</small></div>
          </div>
          <p>Die Zahl hinter dem Schrägstrich, das <strong>Präfix</strong> (z. B. <code>/24</code>), sagt, wie viele Bits von links zum <span class="netz-text">Netzteil</span> gehören. Der Rest ist der <span class="host-text">Hostteil</span>.</p>
          <div class="karte">
            <p class="feldtitel">🎮 Spiel mit dem Regler</p>
            <div class="regler-zeile">
              <input type="range" min="8" max="30" value="24" id="praefixRegler" aria-label="Präfix">
              <span class="regler-wert" id="praefixWert">/24</span>
            </div>
            <div class="bits32" id="bits32"></div>
            <div class="info-kacheln">
              <div><small>Netzbits</small><strong id="infoNetz">24</strong></div>
              <div><small>Hostbits</small><strong id="infoHost">8</strong></div>
              <div><small>Hosts möglich</small><strong id="infoHosts">254</strong></div>
            </div>
            <p class="feldtitel" style="margin-top:16px">Aufgabe: Stell den Regler so ein, dass genau <span class="ziel-zahl">62 Hosts</span> ins Netz passen.</p>
            <div data-erfolg></div>
          </div>`,
        init(box, api) {
          const regler = box.querySelector('#praefixRegler');
          let fertig = false;
          const zeichnen = () => {
            const p = Number(regler.value);
            box.querySelector('#praefixWert').textContent = '/' + p;
            box.querySelector('#bits32').innerHTML = [0, 1, 2, 3].map(o =>
              `<div class="oktett">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<span class="${o * 8 + i < p ? 'netz' : 'host'}"></span>`).join('')}</div>`).join('');
            box.querySelector('#infoNetz').textContent = p;
            box.querySelector('#infoHost').textContent = 32 - p;
            const hosts = 2 ** (32 - p) - 2;
            box.querySelector('#infoHosts').textContent = hosts.toLocaleString('de-DE');
            if (p === 26 && !fertig) {
              fertig = true;
              box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Genau, /26!</strong> Dann bleiben 6 Hostbits: 2⁶ = 64 Adressen, minus 2 = 62 Hosts. Warum minus 2? Das verrate ich dir gleich! 🤫', '🤩');
              api.xp(5, box.querySelector('#praefixWert'));
              api.freigeben();
            }
          };
          regler.addEventListener('input', zeichnen);
          zeichnen();
        }
      },

      // 4 ─ Subnetzmaske
      {
        titel: 'Die Subnetzmaske',
        sperre: true,
        inhalt: () => `
          <p>Die <strong>Subnetzmaske</strong> ist nur eine andere Schreibweise für das Präfix: Alle Netzbits sind <strong>1</strong>, alle Hostbits <strong>0</strong>. Danach rechnet man jedes Oktett in eine Dezimalzahl um.</p>
          <div class="karte">
            <p class="feldtitel">Beispiel /26</p>
            <div class="masken-beispiel">
              <code>11111111.11111111.11111111.11<span class="host-text">000000</span></code>
              <span class="pfeil-unten">⬇</span>
              <code><strong>255.255.255.192</strong></code>
            </div>
          </div>
          ${Baustein.bot('Der Trick: Du musst nur diese <strong>Merkreihe</strong> kennen. Sie zeigt, was herauskommt, wenn in einem Oktett 1, 2, 3 … Bits von links an sind:')}
          <div class="merkreihe">
            ${[[1, 128], [2, 192], [3, 224], [4, 240], [5, 248], [6, 252], [7, 254], [8, 255]].map(([n, w], i) =>
              `<div style="animation-delay:${i * 80}ms"><small>${n} Bit${n > 1 ? 's' : ''}</small><strong>${w}</strong></div>`).join('')}
          </div>
          <p class="hinweis" style="text-align:center">Eselsbrücke: Man addiert immer das nächste Bit dazu: 128 + 64 = 192, + 32 = 224, + 16 = 240 …</p>
          <div data-miniquiz></div>`,
        init(box, api) {
          Baustein.miniQuiz(box, {
            frage: 'Welche Subnetzmaske gehört zu <strong>/27</strong>?',
            antworten: ['255.255.255.192', '255.255.255.224', '255.255.255.240', '255.255.224.0'],
            richtig: 1,
            erklaerung: '/27 = 24 + 3. Die ersten drei Oktette sind voll (255), im vierten sind 3 Bits an. Laut Merkreihe sind das <strong>224</strong>.'
          }, api);
        }
      },

      // 5 ─ Weg 1: Blockgröße
      {
        titel: 'Weg 1: Die Blockgrößen-Methode ⚡',
        sperre: true,
        inhalt: () => `
          ${Baustein.bot('Das ist mein Lieblingsweg, weil man ihn <strong>ohne Binärzahlen</strong> im Kopf rechnen kann. Perfekt für die Prüfung! Wir rechnen zusammen:')}
          <div class="aufgabe-box f-subnetz"><p class="hinweis">Beispiel</p><div class="aufgabe-ip">192.168.10.77/26</div></div>
          <div class="unterschritte" id="unterschritte">
            <div class="unterschritt">
              <span class="nr">1</span>
              <div><strong>Maske bestimmen und das „interessante Oktett“ finden.</strong><br>
              /26 → <code>255.255.255.<mark>192</mark></code>. Interessant ist das Oktett, das <em>nicht</em> 255 und nicht 0 ist. Hier ist das das <strong>4. Oktett</strong>.</div>
            </div>
            <div class="unterschritt">
              <span class="nr">2</span>
              <div><strong>Blockgröße ausrechnen.</strong><br>
              <span class="formel">256 − 192 = <mark>64</mark></span>
              Die Netze gehen also in <strong>64er-Schritten</strong>.</div>
            </div>
            <div class="unterschritt">
              <span class="nr">3</span>
              <div><strong>Die Netze aufzählen und schauen, wo die 77 liegt.</strong>
              <div class="zahlenstrahl">
                ${[0, 64, 128, 192].map((s, i) => `<div class="block ${s === 64 ? 'treffer' : ''}" style="--i:${i}"><span>${s}</span></div>`).join('')}
                <div class="marker" style="left:${77 / 256 * 100}%"><span>📍 77</span></div>
                <span class="ende">256</span>
              </div>
              77 liegt zwischen 64 und 127, also im Block, der bei <strong>64</strong> beginnt.</div>
            </div>
            <div class="unterschritt">
              <span class="nr">4</span>
              <div><strong>Ergebnis ablesen.</strong>
              <table class="ergebnis-tabelle">
                <tr><td>Netzadresse</td><td><code>192.168.10.<mark>64</mark></code></td><td class="hinweis">Blockanfang</td></tr>
                <tr><td>Broadcast</td><td><code>192.168.10.<mark>127</mark></code></td><td class="hinweis">nächster Block − 1</td></tr>
                <tr><td>Erster Host</td><td><code>192.168.10.65</code></td><td class="hinweis">Netz + 1</td></tr>
                <tr><td>Letzter Host</td><td><code>192.168.10.126</code></td><td class="hinweis">Broadcast − 1</td></tr>
              </table></div>
            </div>
          </div>
          <button type="button" class="btn breit f-subnetz" id="naechsterTeil">Schritt 1 zeigen ▶</button>
          <div data-erfolg></div>`,
        init(box, api) {
          const teile = [...box.querySelectorAll('.unterschritt')];
          const knopf = box.querySelector('#naechsterTeil');
          let n = 0;
          knopf.onclick = () => {
            teile[n].classList.add('sichtbar');
            teile[n].scrollIntoView({ behavior: 'smooth', block: 'center' });
            n++;
            if (n < teile.length) {
              knopf.textContent = `Schritt ${n + 1} zeigen ▶`;
            } else {
              knopf.remove();
              box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Das war’s schon!</strong> Merk dir: <em>256 minus Maskenwert = Blockgröße</em>. Damit löst du fast jede Prüfungsaufgabe. 🚀', '😎');
              api.xp(5, box.querySelector('[data-erfolg]'));
              api.freigeben();
            }
          };
        }
      },

      // 6 ─ Weg 2: Binär
      {
        titel: 'Weg 2: Die Binär-Methode 🔢',
        sperre: true,
        inhalt: () => `
          ${Baustein.bot('So rechnet der Computer selbst: mit einer <strong>UND-Verknüpfung</strong> von IP-Adresse und Maske. Das dauert länger, aber so siehst du, <em>warum</em> Weg 1 funktioniert.')}
          <div class="karte">
            <p class="feldtitel">Die UND-Regel</p>
            <div class="und-regeln">
              <span>1 UND 1 = <b class="eins">1</b></span><span>1 UND 0 = <b>0</b></span><span>0 UND 1 = <b>0</b></span><span>0 UND 0 = <b>0</b></span>
            </div>
            <p class="hinweis" style="margin-bottom:0">Nur wenn <strong>beide</strong> Bits 1 sind, kommt 1 heraus.</p>
          </div>
          <div class="karte">
            <p class="hinweis" style="margin-top:0">Die ersten drei Oktette der Maske sind 255 (alles 1). Dort wird die IP einfach übernommen: <code>192.168.10</code>. Spannend ist nur das 4. Oktett:</p>
            <div class="binaer-rechnung">
              <span class="beschriftung">IP-Adresse <code>77</code></span>${Baustein.oktettBits(77, { netzBits: 2 })}
              <span class="beschriftung">Maske <code>192</code></span>${Baustein.oktettBits(192, { netzBits: 2 })}
              <span class="beschriftung trenner">UND</span><div class="trennlinie"></div>
              <span class="beschriftung">Netzadresse</span><div id="ergebnisNetz">${Baustein.oktettBits(0, { klasse: 'leer-bits' })}</div>
              <span class="beschriftung">Broadcast</span><div id="ergebnisBc">${Baustein.oktettBits(0, { klasse: 'leer-bits' })}</div>
            </div>
            <div class="knoepfe">
              <button type="button" class="btn f-subnetz" id="undRechnen">① UND rechnen ▶</button>
              <button type="button" class="btn zweit f-subnetz" id="bcRechnen" disabled>② Hostbits auf 1 ▶</button>
            </div>
            <div data-erfolg></div>
          </div>`,
        init(box, api) {
          const animieren = (ziel, wert, fertig) => {
            ziel.innerHTML = Baustein.oktettBits(wert, { netzBits: 2, klasse: 'animiert' });
            [...ziel.querySelectorAll('.bitzelle')].forEach((z, i) => (z.style.animationDelay = `${i * 90}ms`));
            setTimeout(fertig, 8 * 90 + 300);
          };
          box.querySelector('#undRechnen').onclick = e => {
            e.target.disabled = true;
            animieren(box.querySelector('#ergebnisNetz'), 77 & 192, () => {
              box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<code>01000000</code> = <strong>64</strong> → Netzadresse <code>192.168.10.64</code>. Dasselbe Ergebnis wie bei Weg 1! 🎯');
              box.querySelector('#bcRechnen').disabled = false;
            });
          };
          box.querySelector('#bcRechnen').onclick = e => {
            e.target.disabled = true;
            animieren(box.querySelector('#ergebnisBc'), (77 & 192) | 63, () => {
              box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('Für den Broadcast setzt man alle <span class="host-text">Hostbits</span> auf 1: <code>01111111</code> = <strong>127</strong> → <code>192.168.10.127</code>. Auch das passt! ✅', '🤩');
              api.xp(5, e.target);
              api.freigeben();
            });
          };
        }
      },

      // 7 ─ Hosts zählen
      {
        titel: 'Wie viele Hosts passen rein?',
        sperre: true,
        inhalt: () => `
          <div class="formel-gross">Hosts = 2<sup>Hostbits</sup> − 2</div>
          <p>Warum <strong>minus 2</strong>? Zwei Adressen in jedem Netz sind reserviert:</p>
          <div class="vergleich">
            <div class="netz-box"><span class="gross-emoji">🪧</span><strong>Netzadresse</strong><small>die erste Adresse<br>= das Straßenschild</small></div>
            <div class="host-box"><span class="gross-emoji">📢</span><strong>Broadcast</strong><small>die letzte Adresse<br>= Durchsage an alle</small></div>
          </div>
          <div class="karte">
            <p class="feldtitel">Spickzettel</p>
            <table class="ergebnis-tabelle kompakt">
              <tr><th>Präfix</th><th>Maske</th><th>Block</th><th>Hosts</th></tr>
              ${[24, 25, 26, 27, 28, 29, 30].map(p => `<tr><td>/${p}</td><td><code>…${Subnetting.maske(p).split('.')[3]}</code></td><td>${2 ** (32 - p)}</td><td><strong>${2 ** (32 - p) - 2}</strong></td></tr>`).join('')}
            </table>
            <p class="hinweis" style="margin-bottom:0">Jedes Bit mehr im Präfix halbiert das Netz.</p>
          </div>
          <div data-miniquiz></div>`,
        init(box, api) {
          Baustein.miniQuiz(box, {
            frage: 'Wie viele Hosts passen in ein <strong>/28</strong>-Netz?',
            antworten: ['16', '14', '30', '12'],
            richtig: 1,
            erklaerung: '32 − 28 = 4 Hostbits. 2⁴ = 16 Adressen, minus Netzadresse und Broadcast = <strong>14 Hosts</strong>.'
          }, api);
        }
      },

      // 8 ─ Netze aufteilen
      {
        titel: 'Ein Netz aufteilen ✂️',
        sperre: true,
        inhalt: () => `
          <p>Jetzt der Profi-Teil: Du hast das Netz <code>192.168.1.0/24</code> und brauchst mehrere gleich große Subnetze. Dafür <strong>leihst du dir Bits</strong> vom Hostteil.</p>
          <div class="formel-gross">2<sup>geliehene Bits</sup> ≥ Anzahl Subnetze</div>
          <div class="karte">
            <p class="feldtitel">🎮 Wie viele Subnetze brauchst du?</p>
            <div class="regler-zeile">
              <input type="range" min="2" max="16" value="4" id="anzahlRegler" aria-label="Anzahl Subnetze">
              <span class="regler-wert" id="anzahlWert">4</span>
            </div>
            <div id="aufteilung"></div>
          </div>
          <div data-miniquiz></div>`,
        init(box, api) {
          const regler = box.querySelector('#anzahlRegler');
          const zeichnen = () => {
            const n = Number(regler.value);
            const bits = Math.ceil(Math.log2(n));
            const praefix = 24 + bits;
            const block = 2 ** (32 - praefix);
            const anzahl = 2 ** bits;
            box.querySelector('#anzahlWert').textContent = n;
            box.querySelector('#aufteilung').innerHTML = `
              <ol class="weg">
                <li>2<sup>${bits}</sup> = ${anzahl} ≥ ${n} → <strong>${bits} Bit${bits > 1 ? 's' : ''}</strong> leihen</li>
                <li>Neues Präfix: 24 + ${bits} = <strong>/${praefix}</strong> (Maske <code>${Subnetting.maske(praefix)}</code>)</li>
                <li>Blockgröße: 256 ÷ ${anzahl} = <strong>${block}</strong> → ${block - 2} Hosts pro Subnetz</li>
              </ol>
              <div class="aufteil-balken">
                ${Array.from({ length: anzahl }, (_, i) => `<div class="${i < n ? 'genutzt' : 'frei'}" title=".${i * block} – .${(i + 1) * block - 1}">${anzahl <= 8 ? `.${i * block}` : ''}</div>`).join('')}
              </div>
              ${anzahl > n ? `<p class="hinweis">Grau = ${anzahl - n} Subnetz${anzahl - n > 1 ? 'e' : ''} übrig (Reserve)</p>` : ''}
              <table class="ergebnis-tabelle kompakt">
                <tr><th>Nr.</th><th>Netzadresse</th><th>Broadcast</th></tr>
                ${Array.from({ length: Math.min(n, 4) }, (_, i) => `<tr><td>${i + 1}</td><td><code>192.168.1.${i * block}</code></td><td><code>192.168.1.${(i + 1) * block - 1}</code></td></tr>`).join('')}
                ${n > 4 ? `<tr><td colspan="3" class="hinweis">… und so weiter in ${block}er-Schritten</td></tr>` : ''}
              </table>`;
          };
          regler.addEventListener('input', zeichnen);
          zeichnen();
          Baustein.miniQuiz(box, {
            frage: 'Du brauchst <strong>5 Subnetze</strong> aus <code>192.168.1.0/24</code>. Welches Präfix bekommen sie?',
            antworten: ['/25', '/26', '/27', '/29'],
            richtig: 2,
            erklaerung: '2² = 4 reicht nicht, 2³ = 8 ≥ 5. Also 3 Bits leihen: 24 + 3 = <strong>/27</strong> (Blockgröße 32, 30 Hosts pro Netz).'
          }, api);
        }
      },

      // 9 ─ Abschluss
      {
        titel: 'Geschafft! 🏆',
        inhalt: () => `
          ${Baustein.bot('Wow, du hast die ganze Lektion durchgezogen! Hier ist dein <strong>Spickzettel</strong> für die Prüfung:', '🥳')}
          <div class="karte spickzettel">
            <ol class="weg">
              <li><strong>Präfix → Maske</strong> mit der Merkreihe 128 · 192 · 224 · 240 · 248 · 252 · 254 · 255</li>
              <li><strong>Blockgröße</strong> = 256 − Maskenwert im interessanten Oktett</li>
              <li><strong>Netzadresse</strong> = das Vielfache der Blockgröße, das direkt unter (oder auf) der IP liegt</li>
              <li><strong>Broadcast</strong> = nächstes Netz − 1</li>
              <li><strong>Hosts</strong> = 2<sup>Hostbits</sup> − 2</li>
              <li><strong>Aufteilen</strong>: 2<sup>n</sup> ≥ Anzahl Subnetze → n Bits ans Präfix hängen</li>
            </ol>
          </div>
          ${Baustein.bot('Jetzt heißt es: <strong>üben, üben, üben!</strong> Im Subnetting-Trainer bekommst du unendlich viele Aufgaben, jeweils mit Rechenweg. 💪', '🤖')}`
      }
    ]
  }
];

// ───────────── Lektion: OSI-Modell ─────────────
const OSI = [
  { nr: 1, name: 'Bitübertragungsschicht', en: 'Physical Layer', farbe: '#64748b', emoji: '🔌', pdu: 'Bits',
    aufgabe: 'Überträgt die einzelnen Bits als elektrische, optische oder Funksignale.',
    beispiele: 'Kabel, Stecker, Glasfaser, Hub, Repeater',
    post: 'Der LKW und die Straße, auf der er fährt.' },
  { nr: 2, name: 'Sicherungsschicht', en: 'Data Link Layer', farbe: '#0ea5c6', emoji: '🔀', pdu: 'Frame',
    aufgabe: 'Sorgt für eine fehlerfreie Übertragung zwischen direkt verbundenen Geräten im selben Netz. Adressiert wird mit MAC-Adressen.',
    beispiele: 'Switch, Bridge, Ethernet, WLAN (IEEE 802.11), MAC-Adresse',
    post: 'Der Fahrer, der das Paket bis zur nächsten Station bringt und prüft, ob es heil angekommen ist.' },
  { nr: 3, name: 'Vermittlungsschicht', en: 'Network Layer', farbe: '#10b981', emoji: '🧭', pdu: 'Paket',
    aufgabe: 'Findet den Weg über mehrere Netze hinweg (Routing). Adressiert wird mit IP-Adressen.',
    beispiele: 'Router, IPv4, IPv6, ICMP (ping)',
    post: 'Postleitzahl und Verteilzentren, die den Weg durchs Land festlegen.' },
  { nr: 4, name: 'Transportschicht', en: 'Transport Layer', farbe: '#84cc16', emoji: '🚚', pdu: 'Segment',
    aufgabe: 'Zerlegt die Daten in Segmente und adressiert die richtige Anwendung über Portnummern. TCP sorgt dabei für Zuverlässigkeit und die richtige Reihenfolge.',
    beispiele: 'TCP, UDP, Portnummern',
    post: 'Einschreiben mit Sendungsverfolgung (TCP) oder einfache Postkarte (UDP).' },
  { nr: 5, name: 'Sitzungsschicht', en: 'Session Layer', farbe: '#f59e0b', emoji: '🤝', pdu: 'Daten',
    aufgabe: 'Baut Sitzungen zwischen Anwendungen auf, hält sie aufrecht und beendet sie wieder.',
    beispiele: 'Sitzungsaufbau und -abbau, RPC, NetBIOS',
    post: 'Eine Brieffreundschaft beginnen, Kontakt halten und wieder beenden.' },
  { nr: 6, name: 'Darstellungsschicht', en: 'Presentation Layer', farbe: '#f97316', emoji: '🎨', pdu: 'Daten',
    aufgabe: 'Bringt die Daten in ein einheitliches Format: Zeichenkodierung, Komprimierung, Verschlüsselung.',
    beispiele: 'ASCII, UTF-8, JPEG, Komprimierung, Verschlüsselung',
    post: 'Den Brief in eine Sprache übersetzen, die der Empfänger versteht.' },
  { nr: 7, name: 'Anwendungsschicht', en: 'Application Layer', farbe: '#ec4899', emoji: '💻', pdu: 'Daten',
    aufgabe: 'Die Schnittstelle zu den Programmen des Benutzers. Hier arbeiten die Netzwerkdienste.',
    beispiele: 'HTTP(S), DNS, SMTP, FTP, SSH, DHCP',
    post: 'Du schreibst den Brief.' }
];

LEKTIONEN.push({
  id: 'osi',
  titel: 'Das OSI-Modell',
  emoji: '🧅',
  farbe: 'f-lernen',
  dauer: 'ca. 15 Minuten',
  ueben: { link: '#/karten', text: '🗂️ Jetzt mit Karteikarten festigen' },
  beschreibung: 'Die 7 Schichten mit Merksätzen, Geräten und Protokollen, der Kapselung und der Fehlersuche nach OSI.',
  schritte: [
    // 1 ─ Einstieg
    {
      titel: 'Warum Schichten? 🧅',
      inhalt: () => `
        ${Baustein.bot('Willkommen zurück! Heute geht es um das <strong>OSI-Modell</strong>. Das ist <em>der</em> Klassiker in jeder IT-Prüfung.')}
        <div class="karte">
          <p>Wenn du eine Webseite aufrufst, passiert unglaublich viel: Kabel, Funk, Adressen, Wege, Verschlüsselung … Damit niemand alles auf einmal verstehen muss, teilt man die Kommunikation in <strong>7 Schichten</strong> auf.</p>
          <p>Jede Schicht hat <strong>genau eine Aufgabe</strong> und arbeitet nur mit der Schicht direkt darüber und darunter zusammen. Wie bei einer Zwiebel 🧅 liegt eine Schicht um die andere.</p>
        </div>
        ${Baustein.bot('Stell es dir wie die <strong>Post</strong> vor: Du schreibst einen Brief, jemand verpackt ihn, schreibt die Adresse drauf, ein LKW fährt ihn … Jeder macht nur seinen Teil, und am Ende kommt der Brief an. 📬')}
        <div class="karte">
          <p class="feldtitel">Vorteile des Schichtenmodells</p>
          <ul class="haken-liste">
            <li>Hersteller können Geräte und Software bauen, die zusammenpassen</li>
            <li>Eine Schicht kann ausgetauscht werden, ohne die anderen zu ändern (z. B. WLAN statt Kabel)</li>
            <li>Fehler lassen sich Schicht für Schicht systematisch eingrenzen</li>
          </ul>
        </div>`
    },

    // 2 ─ Die 7 Schichten entdecken
    {
      titel: 'Die 7 Schichten',
      sperre: true,
      inhalt: () => `
        <p>Unten ist die Hardware, oben das Programm. 🎮 <strong>Tippe jede Schicht an</strong>, um herauszufinden, was sie macht.</p>
        <div class="osi-turm">
          ${OSI.slice().reverse().map(s => `
            <div class="osi-stufe" style="--s:${s.farbe}">
              <button type="button" class="osi-schicht" data-nr="${s.nr}">
                <span class="osi-nr">${s.nr}</span>
                <span class="osi-name">${s.name}<small>${s.en}</small></span>
                <span class="osi-emoji">${s.emoji}</span>
              </button>
              <div class="osi-details">
                <p><strong>Aufgabe:</strong> ${s.aufgabe}</p>
                <p><strong>Beispiele:</strong> ${s.beispiele}</p>
                <p><strong>Bei der Post:</strong> ${s.post}</p>
              </div>
            </div>`).join('')}
        </div>
        <p class="hinweis" style="text-align:center" id="osiZaehler">0 von 7 entdeckt</p>
        <div data-erfolg></div>`,
      init(box, api) {
        const entdeckt = new Set();
        box.querySelectorAll('.osi-schicht').forEach(b => b.onclick = () => {
          const stufe = b.parentElement;
          stufe.classList.toggle('offen');
          stufe.classList.add('entdeckt');
          entdeckt.add(b.dataset.nr);
          box.querySelector('#osiZaehler').textContent = `${entdeckt.size} von 7 entdeckt`;
          if (entdeckt.size === 7 && !box.dataset.fertig) {
            box.dataset.fertig = '1';
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Alle 7 entdeckt!</strong> 🔍 Die unteren Schichten (1–4) kümmern sich um den <em>Transport</em>, die oberen (5–7) um die <em>Anwendung</em>.', '🤩');
            api.xp(5, box.querySelector('#osiZaehler'));
            api.freigeben();
          }
        });
      }
    },

    // 3 ─ Merksätze + Sortierspiel
    {
      titel: 'Merksätze und Sortierspiel',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('Die Reihenfolge musst du in der Prüfung auswendig können. Dafür gibt es Merksätze, die Anfangsbuchstaben sind die Schichten:')}
        <div class="merksaetze">
          <div class="karte klein">
            <p class="feldtitel">Von unten nach oben (englisch) ⬆</p>
            <p class="merksatz">${['Please', 'Do', 'Not', 'Throw', 'Salami', 'Pizza', 'Away'].map((w, i) => `<span style="--s:${OSI[i].farbe}"><b>${w[0]}</b>${w.slice(1)}</span>`).join(' ')}</p>
            <p class="hinweis">Physical · Data Link · Network · Transport · Session · Presentation · Application</p>
          </div>
          <div class="karte klein">
            <p class="feldtitel">Von oben nach unten (deutsch) ⬇</p>
            <p class="merksatz">${['Alle', 'deutschen', 'Studenten', 'trinken', 'verschiedene', 'Sorten', 'Bier'].map((w, i) => `<span style="--s:${OSI[6 - i].farbe}"><b>${w[0]}</b>${w.slice(1)}</span>`).join(' ')}</p>
            <p class="hinweis">Anwendung · Darstellung · Sitzung · Transport · Vermittlung · Sicherung · Bitübertragung</p>
          </div>
        </div>
        <div class="karte">
          <p class="feldtitel">🎮 Bau den Turm! Tippe die Schichten in der richtigen Reihenfolge an, <span class="ziel-zahl">von 1 nach 7</span>.</p>
          <div class="sortier-turm" id="sortierTurm">
            ${[7, 6, 5, 4, 3, 2, 1].map(n => `<div class="sortier-platz" data-platz="${n}"><span class="osi-nr">${n}</span><span class="platz-name">?</span></div>`).join('')}
          </div>
          <div class="sortier-auswahl" id="sortierAuswahl"></div>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        let naechste = 1;
        let fehler = 0;
        const auswahl = box.querySelector('#sortierAuswahl');
        auswahl.innerHTML = mischen(OSI).map(s => `<button type="button" class="sortier-btn" data-nr="${s.nr}">${s.emoji} ${s.name}</button>`).join('');
        auswahl.querySelectorAll('.sortier-btn').forEach(b => b.onclick = () => {
          const nr = Number(b.dataset.nr);
          if (nr === naechste) {
            const s = OSI[nr - 1];
            const platz = box.querySelector(`[data-platz="${nr}"]`);
            platz.classList.add('belegt');
            platz.style.setProperty('--s', s.farbe);
            platz.querySelector('.platz-name').textContent = s.name;
            b.remove();
            naechste++;
            if (naechste > 7) {
              box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(fehler === 0
                ? '<strong>Fehlerfrei! 🏆</strong> Du kennst die Reihenfolge schon perfekt.'
                : `<strong>Turm steht! 🏗️</strong> Mit ${fehler} ${fehler === 1 ? 'Fehlversuch' : 'Fehlversuchen'}. Merk dir: <em>Please Do Not Throw Salami Pizza Away</em>.`, '🤩');
              api.xp(fehler === 0 ? 10 : 5, box.querySelector('#sortierTurm'));
              api.freigeben();
            }
          } else {
            fehler++;
            b.classList.remove('wackeln');
            void b.offsetWidth;
            b.classList.add('wackeln');
          }
        });
      }
    },

    // 4 ─ Zuordnen
    {
      titel: 'Wer arbeitet wo? 🕵️',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('In der Prüfung kommt oft die Frage: <em>„Auf welcher Schicht arbeitet …?“</em> Lass uns das trainieren! Ordne jedes Gerät bzw. Protokoll der richtigen Schicht zu.')}
        <div class="karte zuordnen">
          <div class="zuordnen-kopf"><span class="hinweis" id="zuordnenStand"></span></div>
          <div class="zuordnen-begriff" id="zuordnenBegriff"></div>
          <div class="zuordnen-schichten">
            ${OSI.map((s, i) => `<button type="button" class="zuordnen-btn" data-nr="${s.nr}" style="--s:${s.farbe}" title="${s.name}"><b>${s.nr}</b><small>${['Bits', 'Sich.', 'Verm.', 'Transp.', 'Sitz.', 'Darst.', 'Anw.'][i]}</small></button>`).join('')}
          </div>
          <div id="zuordnenFeedback"></div>
        </div>`,
      init(box, api) {
        const BEGRIFFE = [
          { text: '🔀 Switch', nr: 2, tipp: 'Ein Switch leitet Frames anhand der <strong>MAC-Adresse</strong> weiter → Schicht 2.' },
          { text: '🧭 Router', nr: 3, tipp: 'Ein Router verbindet Netze anhand der <strong>IP-Adresse</strong> → Schicht 3.' },
          { text: '🌍 HTTP', nr: 7, tipp: 'HTTP ist ein Protokoll, das Anwendungen (Browser, Webserver) direkt nutzen → Schicht 7.' },
          { text: '🚚 TCP', nr: 4, tipp: 'TCP arbeitet mit Ports und Segmenten → Schicht 4.' },
          { text: '🔌 Netzwerkkabel', nr: 1, tipp: 'Kabel übertragen nur Signale bzw. Bits → Schicht 1.' },
          { text: '📮 IP-Adresse', nr: 3, tipp: 'IP-Adressen sind logische Adressen für das Routing → Schicht 3.' },
          { text: '🏷️ MAC-Adresse', nr: 2, tipp: 'MAC-Adressen sind Hardware-Adressen im lokalen Netz → Schicht 2.' },
          { text: '📖 DNS', nr: 7, tipp: 'DNS ist ein Dienst für Anwendungen (Namensauflösung) → Schicht 7.' },
          { text: '📡 Hub', nr: 1, tipp: 'Ein Hub verteilt nur Signale an alle Ports, ohne Adressen zu lesen → Schicht 1.' },
          { text: '🎯 Portnummer', nr: 4, tipp: 'Ports adressieren Anwendungen auf einem Rechner → Schicht 4.' }
        ];
        const runde = mischen(BEGRIFFE).slice(0, 6);
        let i = 0;
        let fehler = 0;
        const zeigen = () => {
          box.querySelector('#zuordnenStand').textContent = `Begriff ${i + 1} von ${runde.length}`;
          const begriff = box.querySelector('#zuordnenBegriff');
          begriff.textContent = runde[i].text;
          begriff.classList.remove('neu');
          void begriff.offsetWidth;
          begriff.classList.add('neu');
          box.querySelectorAll('.zuordnen-btn').forEach(b => { b.disabled = false; b.classList.remove('richtig', 'falsch'); });
        };
        box.querySelectorAll('.zuordnen-btn').forEach(b => b.onclick = () => {
          const aktuell = runde[i];
          if (Number(b.dataset.nr) === aktuell.nr) {
            b.classList.add('richtig');
            box.querySelectorAll('.zuordnen-btn').forEach(x => (x.disabled = true));
            box.querySelector('#zuordnenFeedback').innerHTML = Baustein.bot(`✔ ${aktuell.tipp}`, '🤩');
            i++;
            setTimeout(() => {
              if (i < runde.length) return zeigen();
              box.querySelector('#zuordnenBegriff').textContent = '🎉 Alle zugeordnet!';
              box.querySelector('#zuordnenStand').textContent = `${runde.length} von ${runde.length}`;
              box.querySelector('#zuordnenFeedback').innerHTML = Baustein.bot(fehler === 0
                ? '<strong>Alles auf Anhieb richtig!</strong> Du bist bereit für die Prüfungsfragen. 💪'
                : `<strong>Geschafft!</strong> ${fehler} ${fehler === 1 ? 'Fehlversuch' : 'Fehlversuche'}. Das übst du noch ein bisschen, dann sitzt es.`, '🥳');
              api.xp(fehler === 0 ? 10 : 5, box.querySelector('#zuordnenBegriff'));
              api.freigeben();
            }, 1400);
          } else {
            fehler++;
            b.classList.add('falsch');
            b.disabled = true;
            box.querySelector('#zuordnenFeedback').innerHTML = Baustein.bot('Nicht ganz. Überleg mal: Arbeitet das mit <em>Signalen</em>, <em>MAC-Adressen</em>, <em>IP-Adressen</em>, <em>Ports</em> oder ist es ein <em>Dienst für Programme</em>?', '🤔');
          }
        });
        zeigen();
      }
    },

    // 5 ─ Kapselung
    {
      titel: 'Kapselung: Pakete einpacken 📦',
      sperre: true,
      inhalt: () => `
        <p>Beim Senden wandern die Daten von <strong>oben nach unten</strong> durch die Schichten. Jede Schicht packt ihre eigenen Infos (einen <strong>Header</strong>) davor, wie ein Paket in einem Paket. Das heißt <strong>Kapselung</strong> (Encapsulation).</p>
        ${Baustein.bot('Beim Empfänger läuft es genau umgekehrt: Von unten nach oben packt jede Schicht ihren Header wieder aus. Das ist die <strong>Entkapselung</strong>.')}
        <div class="karte">
          <p class="feldtitel">🎮 Pack die Anfrage an eine Webseite ein!</p>
          <div class="kapsel-bereich">
            <div class="kapsel-zeile" id="kapselZeile"></div>
            <div class="kapsel-info" id="kapselInfo"></div>
          </div>
          <button type="button" class="btn breit f-lernen" id="kapselWeiter">⬇ Schicht 4: Transport</button>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        const STUFEN = [
          { teile: [['daten', 'Daten', 'GET /index.html']], pdu: 'Daten', schicht: '7–5', text: 'Der Browser erzeugt die eigentlichen <strong>Nutzdaten</strong>: die HTTP-Anfrage.' },
          { teile: [['tcp', 'TCP', 'Port 51000 → 443']], pdu: 'Segment', schicht: '4', text: 'Die Transportschicht setzt den <strong>TCP-Header</strong> mit Quell- und Zielport davor → ein <strong>Segment</strong>.' },
          { teile: [['ip', 'IP', '192.168.1.10 → 93.184.216.34']], pdu: 'Paket', schicht: '3', text: 'Die Vermittlungsschicht setzt den <strong>IP-Header</strong> mit Quell- und Ziel-IP davor → ein <strong>Paket</strong>.' },
          { teile: [['eth', 'Ethernet', 'MAC → MAC']], trailer: ['fcs', 'FCS', 'Prüfsumme'], pdu: 'Frame', schicht: '2', text: 'Die Sicherungsschicht setzt den <strong>Ethernet-Header</strong> mit den MAC-Adressen davor und hängt hinten eine Prüfsumme (<strong>FCS</strong>) an → ein <strong>Frame</strong>.' },
          { bits: true, pdu: 'Bits', schicht: '1', text: 'Die Bitübertragungsschicht schickt alles als <strong>Bits</strong> über das Kabel oder per Funk. 01001011…' }
        ];
        const BUTTONS = ['⬇ Schicht 4: Transport', '⬇ Schicht 3: Vermittlung', '⬇ Schicht 2: Sicherung', '⬇ Schicht 1: Bitübertragung'];
        let stufe = 0;
        // Verschachtelt darstellen: jede Schicht ist eine Hülle um den Inhalt der Schicht darüber
        const zeichnen = () => {
          const s = STUFEN[stufe];
          const zeile = box.querySelector('#kapselZeile');
          if (s.bits) {
            zeile.innerHTML = `<div class="kapsel-bits">${Array.from({ length: 48 }, () => `<span>${Math.round(Math.random())}</span>`).join('')}</div>`;
          } else {
            let html = '';
            STUFEN.slice(0, stufe + 1).forEach((st, i) => {
              const [klasse, titel, info] = st.teile[0];
              const neu = i === stufe ? 'neu' : '';
              html = i === 0
                ? `<div class="huelle daten ${neu}"><b>${titel}</b><small>${info}</small></div>`
                : `<div class="huelle ${klasse} ${neu}">
                     <div class="huelle-kopf"><b>${titel}-Header</b><small>${info}</small></div>
                     ${html}
                     ${st.trailer ? `<div class="huelle-kopf fuss"><b>${st.trailer[1]}</b><small>${st.trailer[2]}</small></div>` : ''}
                   </div>`;
            });
            zeile.innerHTML = html;
          }
          box.querySelector('#kapselInfo').innerHTML = `<span class="chip" style="background:var(--farbe);color:#fff">Schicht ${s.schicht}</span> <span class="chip">PDU: ${s.pdu}</span><p style="margin:8px 0 0">${s.text}</p>`;
        };
        zeichnen();
        box.querySelector('#kapselWeiter').onclick = e => {
          stufe++;
          zeichnen();
          if (stufe < STUFEN.length - 1) {
            e.target.textContent = BUTTONS[stufe];
          } else {
            e.target.remove();
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Eingepackt und verschickt! 📦</strong> Merk dir die Namen der Pakete (PDUs) von oben nach unten: <em>Daten → Segment → Paket → Frame → Bits</em>.', '😎');
            api.xp(5, box.querySelector('[data-erfolg]'));
            api.freigeben();
          }
        };
      }
    },

    // 6 ─ OSI vs. TCP/IP
    {
      titel: 'OSI-Modell vs. TCP/IP-Modell',
      sperre: true,
      inhalt: () => `
        <p>Das OSI-Modell ist ein <strong>Referenzmodell</strong> zum Erklären. Im echten Internet wird das einfachere <strong>TCP/IP-Modell</strong> (DoD-Modell) mit nur <strong>4 Schichten</strong> verwendet.</p>
        <div class="modell-vergleich">
          <div class="spalte-kopf">OSI</div><div class="spalte-kopf">TCP/IP</div>
          ${[[7, 'Anwendung'], [6, 'Darstellung'], [5, 'Sitzung']].map(([n, t], i) => `<div class="osi-zelle" style="--s:${OSI[n - 1].farbe}">${n} ${t}</div>${i === 0 ? '<div class="tcpip-zelle" style="grid-row:span 3">Anwendung<small>HTTP, DNS, SMTP …</small></div>' : ''}`).join('')}
          <div class="osi-zelle" style="--s:${OSI[3].farbe}">4 Transport</div><div class="tcpip-zelle">Transport<small>TCP, UDP</small></div>
          <div class="osi-zelle" style="--s:${OSI[2].farbe}">3 Vermittlung</div><div class="tcpip-zelle">Internet<small>IP, ICMP</small></div>
          ${[[2, 'Sicherung'], [1, 'Bitübertragung']].map(([n, t], i) => `<div class="osi-zelle" style="--s:${OSI[n - 1].farbe}">${n} ${t}</div>${i === 0 ? '<div class="tcpip-zelle" style="grid-row:span 2">Netzzugang<small>Ethernet, WLAN</small></div>' : ''}`).join('')}
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Welche OSI-Schichten fasst die <strong>Anwendungsschicht</strong> des TCP/IP-Modells zusammen?',
          antworten: ['nur 7', '5, 6 und 7', '4 bis 7', '6 und 7'],
          richtig: 1,
          erklaerung: 'Anwendung, Darstellung und Sitzung (5–7) werden im TCP/IP-Modell zu <strong>einer</strong> Anwendungsschicht zusammengefasst. Schicht 1 und 2 werden zur Netzzugangsschicht.'
        }, api);
      }
    },

    // 7 ─ Fehlersuche
    {
      titel: 'Fehlersuche nach OSI 🔧',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('Jetzt wird’s praktisch! Bei Netzwerkproblemen gehen Profis die Schichten <strong>von unten nach oben</strong> durch („Bottom-up“). So findest du jeden Fehler systematisch.')}
        <div class="fehlersuche">
          ${[
            [1, 'Steckt das Kabel? Leuchtet die Link-LED? WLAN an?'],
            [2, 'Ist der Switch-Port aktiv? Stimmt das VLAN?'],
            [3, 'Hat der PC eine IP-Adresse (ipconfig)? Klappt <code>ping</code> zum Gateway?'],
            [4, 'Ist der Port offen oder blockiert eine Firewall?'],
            [7, 'Läuft der Dienst? Funktioniert die Namensauflösung (DNS)?']
          ].map(([n, t]) => `<div class="fehler-stufe" style="--s:${OSI[n - 1].farbe}"><span class="osi-nr">${n}</span><span>${t}</span></div>`).join('')}
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Ein Kunde sagt: „<code>ping 8.8.8.8</code> funktioniert, aber <code>www.google.de</code> geht im Browser nicht.“ Wo liegt das Problem am wahrscheinlichsten?',
          antworten: ['Kabel defekt (Schicht 1)', 'Keine IP-Adresse (Schicht 3)', 'DNS-Problem (Schicht 7)', 'Switch kaputt (Schicht 2)'],
          richtig: 2,
          erklaerung: 'Der Ping auf eine IP-Adresse klappt, also funktionieren die Schichten 1–3. Nur der <strong>Name</strong> wird nicht aufgelöst → typischer <strong>DNS-Fehler</strong>. Prüfen z. B. mit <code>nslookup</code>.'
        }, api);
      }
    },

    // 8 ─ Spickzettel
    {
      titel: 'Geschafft! 🏆',
      inhalt: () => `
        ${Baustein.bot('Super, du hast das OSI-Modell gemeistert! Hier dein <strong>Spickzettel</strong>:', '🥳')}
        <div class="karte spickzettel" style="padding:10px">
          <table class="ergebnis-tabelle osi-tabelle">
            <tr><th>Nr.</th><th>Schicht</th><th>PDU</th><th>Beispiele</th></tr>
            ${OSI.slice().reverse().map(s => `<tr><td><span class="osi-nr klein" style="--s:${s.farbe}">${s.nr}</span></td><td><strong>${s.name.replace(/s?schicht$/, '')}</strong></td><td>${s.pdu}</td><td><small>${s.beispiele}</small></td></tr>`).join('')}
          </table>
        </div>
        ${Baustein.bot('Tipp: Die Karteikarte „Die 7 Schichten des OSI-Modells“ und die Quizfrage zum Router helfen dir, das Wissen zu festigen. 💪')}`
    }
  ]
});

// ───────────── Lektion: RAID & Datensicherung ─────────────
LEKTIONEN.push({
  id: 'raid-backup',
  titel: 'RAID & Datensicherung',
  emoji: '💽',
  farbe: 'f-stand',
  dauer: 'ca. 15 Minuten',
  ueben: { link: '#/quiz', text: '❓ Jetzt im Quiz testen' },
  beschreibung: 'RAID-Level im Simulator ausprobieren, Parität verstehen und die richtige Backup-Strategie finden.',
  schritte: [
    // 1 ─ Einstieg
    {
      titel: 'Festplatten sterben. Immer. 💀',
      inhalt: () => `
        ${Baustein.bot('Eine unangenehme Wahrheit: <strong>Jede Festplatte fällt irgendwann aus.</strong> Die Frage ist nur, wann. Und dann zählt nur eins: Sind die Daten noch da?', '😱')}
        <div class="karte">
          <p>Gegen Datenverlust gibt es zwei Werkzeuge, die oft verwechselt werden:</p>
          <div class="vergleich">
            <div class="netz-box"><span class="gross-emoji">💽💽</span><strong>RAID</strong><small>schützt vor dem Ausfall<br>einer <em>Festplatte</em><br>→ <strong>Verfügbarkeit</strong></small></div>
            <div class="host-box"><span class="gross-emoji">🗄️</span><strong>Backup</strong><small>schützt vor dem Verlust<br>der <em>Daten</em><br>→ <strong>Wiederherstellung</strong></small></div>
          </div>
        </div>
        ${Baustein.bot('Merk dir schon jetzt den wichtigsten Satz dieser Lektion: <strong>„RAID ersetzt kein Backup!“</strong> Warum, findest du gleich selbst heraus. 🕵️')}`
    },

    // 2 ─ RAID-Simulator
    {
      titel: 'Der RAID-Simulator 🎮',
      sperre: true,
      inhalt: () => `
        <p>RAID verbindet mehrere Festplatten zu einem Verbund. Je nach <strong>RAID-Level</strong> werden die Daten anders verteilt. Jede Platte hat hier <strong>2 TB</strong>.</p>
        ${Baustein.bot('<strong>Tippe auf eine Platte, um sie crashen zu lassen!</strong> 💥 Nochmal tippen = Platte getauscht. Erfülle alle drei Missionen:')}
        <div class="missionen" id="missionen"></div>
        <div class="karte raid-sim">
          <div class="raid-level" id="raidLevel"></div>
          <p class="raid-beschreibung" id="raidText"></p>
          <div class="raid-anzahl">
            <button type="button" class="icon-btn" id="weniger" aria-label="Weniger Platten">−</button>
            <span id="anzahlText"></span>
            <button type="button" class="icon-btn" id="mehr" aria-label="Mehr Platten">＋</button>
          </div>
          <div class="platten" id="platten"></div>
          <div class="raid-status" id="raidStatus"></div>
        </div>
        <div data-erfolg></div>`,
      init(box, api) {
        const MIN = { 0: 2, 1: 2, 5: 3, 6: 4, 10: 4 };
        const INFO = {
          0: ['Striping', 'Die Daten werden in Blöcken auf alle Platten verteilt. Sehr schnell, aber <strong>keine Ausfallsicherheit</strong>.'],
          1: ['Spiegelung (Mirroring)', 'Alle Daten liegen doppelt vor. Die zweite Platte ist ein exakter Spiegel der ersten.'],
          5: ['Striping mit Parität', 'Daten und eine Paritätsinformation (p) werden auf alle Platten verteilt. <strong>Eine</strong> Platte darf ausfallen.'],
          6: ['doppelte Parität', 'Wie RAID 5, aber mit zwei Paritäten (p und q). <strong>Zwei</strong> Platten dürfen ausfallen.'],
          10: ['Spiegel + Striping', 'Je zwei Platten bilden einen Spiegel, über alle Spiegel wird gestript. Pro Spiegelpaar darf eine Platte ausfallen.']
        };
        const MISSIONEN = [
          ['raid0', '💀 Zerstöre ein RAID 0 mit nur einem Plattenausfall'],
          ['raid5', '🛟 Überlebe einen Plattenausfall mit RAID 5'],
          ['zwei', '🦸 Überlebe zwei Plattenausfälle gleichzeitig']
        ];
        const erledigt = new Set();
        let level = 5;
        let n = 4;
        const kaputt = new Set();

        const block = (i, r) => {
          const L = 'ABC'[r];
          if (level === 0) return [L + (i + 1), 'daten'];
          if (level === 1) return [L, 'daten'];
          if (level === 10) return [L + (Math.floor(i / 2) + 1), 'daten'];
          const p = (n - 1 - r + n) % n;
          if (level === 5) {
            if (i === p) return [L + 'p', 'paritaet'];
            return [L + ((i < p ? i : i - 1) + 1), 'daten'];
          }
          const q = (p + 1) % n;
          if (i === p) return [L + 'p', 'paritaet'];
          if (i === q) return [L + 'q', 'paritaet2'];
          const daten = [...Array(n).keys()].filter(x => x !== p && x !== q);
          return [L + (daten.indexOf(i) + 1), 'daten'];
        };

        const ueberlebt = () => {
          const k = kaputt.size;
          if (level === 0) return k === 0;
          if (level === 1) return k < n;
          if (level === 5) return k <= 1;
          if (level === 6) return k <= 2;
          for (let p = 0; p < n / 2; p++) if (kaputt.has(2 * p) && kaputt.has(2 * p + 1)) return false;
          return true;
        };
        const nutzbar = () => ({ 0: n, 1: 1, 5: n - 1, 6: n - 2, 10: n / 2 }[level]) * 2;
        const toleranz = () => ({ 0: 'keine', 1: `${n - 1} Platte${n > 2 ? 'n' : ''}`, 5: '1 Platte', 6: '2 Platten', 10: '1 Platte pro Spiegelpaar' }[level]);

        const zeichnen = () => {
          box.querySelector('#raidLevel').innerHTML = [0, 1, 5, 6, 10].map(l =>
            `<button type="button" data-level="${l}" class="${l === level ? 'aktiv' : ''}">RAID ${l}</button>`).join('');
          box.querySelector('#raidText').innerHTML = `<strong>RAID ${level}: ${INFO[level][0]}.</strong> ${INFO[level][1]}`;
          box.querySelector('#anzahlText').textContent = `${n} Platten`;
          box.querySelector('#weniger').disabled = level === 1 || n <= MIN[level];
          box.querySelector('#mehr').disabled = level === 1 || n >= 8;

          const ok = ueberlebt();
          box.querySelector('#platten').innerHTML = Array.from({ length: n }, (_, i) => `
            <button type="button" class="platte ${kaputt.has(i) ? 'kaputt' : ''} ${!ok && !kaputt.has(i) ? 'verloren' : ''} ${level === 10 ? 'paar' + (Math.floor(i / 2) % 2) : ''}" data-i="${i}">
              <span class="platte-kopf">${kaputt.has(i) ? '💥' : '💽'} ${i + 1}</span>
              ${[0, 1, 2].map(r => { const [t, k] = block(i, r); return `<span class="block ${k}">${t}</span>`; }).join('')}
            </button>`).join('');

          const pct = Math.round(nutzbar() / (n * 2) * 100);
          const status = !ok ? ['💀', 'Datenverlust! Die Daten sind nicht mehr vollständig.', 'tot']
            : kaputt.size ? ['⚠️', 'Degraded: Die Daten sind noch da, aber die kaputte Platte muss schnell getauscht werden!', 'warn']
            : ['✅', 'Alle Platten laufen, die Daten sind sicher.', 'gut'];
          box.querySelector('#raidStatus').innerHTML = `
            <div class="status-zeile ${status[2]}"><span>${status[0]}</span>${status[1]}</div>
            <div class="info-kacheln">
              <div><small>Nutzbar</small><strong>${nutzbar()} TB</strong></div>
              <div><small>Effizienz</small><strong>${pct} %</strong></div>
              <div><small>Darf ausfallen</small><strong style="font-size:.9rem">${toleranz()}</strong></div>
            </div>
            <p class="hinweis" style="margin:8px 0 0">Mindestens ${MIN[level]} Platten · Gesamt ${n * 2} TB</p>`;

          box.querySelector('#missionen').innerHTML = MISSIONEN.map(([id, text]) =>
            `<div class="mission ${erledigt.has(id) ? 'erledigt' : ''}"><span>${erledigt.has(id) ? '✅' : '⬜'}</span>${text}</div>`).join('');

          box.querySelectorAll('[data-level]').forEach(b => b.onclick = () => {
            level = Number(b.dataset.level);
            n = level === 1 ? 2 : Math.max(MIN[level], level === 10 ? n + (n % 2) : n);
            kaputt.clear();
            zeichnen();
          });
          box.querySelectorAll('.platte').forEach(b => b.onclick = () => {
            const i = Number(b.dataset.i);
            kaputt.has(i) ? kaputt.delete(i) : kaputt.add(i);
            pruefen();
            zeichnen();
          });
        };

        const pruefen = () => {
          const vorher = erledigt.size;
          if (level === 0 && kaputt.size === 1) erledigt.add('raid0');
          if (level === 5 && kaputt.size === 1) erledigt.add('raid5');
          if (kaputt.size >= 2 && ueberlebt()) erledigt.add('zwei');
          if (erledigt.size > vorher) {
            const meldungen = {
              raid0: 'RAID 0 ist weg! 💀 Weil jede Datei über alle Platten verteilt ist, reicht <strong>ein</strong> Ausfall für den Totalverlust.',
              raid5: 'RAID 5 hält! 🛟 Die fehlenden Blöcke lassen sich aus den anderen Daten und der <strong>Parität</strong> zurückrechnen.',
              zwei: 'Zwei Ausfälle überlebt! 🦸 Das schaffen <strong>RAID 6</strong> immer und RAID 10, wenn nicht beide Platten eines Spiegels kaputt sind.'
            };
            const neu = [...erledigt].pop();
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(meldungen[neu] + (erledigt.size === 3 ? '<br><strong>Alle Missionen erfüllt! 🏆</strong>' : ''), erledigt.size === 3 ? '🥳' : '🤖');
            if (erledigt.size === 3) {
              api.xp(10, box.querySelector('#missionen'));
              api.freigeben();
            }
          }
        };

        box.querySelector('#weniger').onclick = () => { n -= level === 10 ? 2 : 1; kaputt.clear(); zeichnen(); };
        box.querySelector('#mehr').onclick = () => { n += level === 10 ? 2 : 1; kaputt.clear(); zeichnen(); };
        zeichnen();
      }
    },

    // 3 ─ Parität
    {
      titel: 'Parität: Daten zurückrechnen 🧙',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('Wie kann RAID 5 eine kaputte Platte „zurückzaubern“? Mit der <strong>XOR-Parität</strong>. Die Regel ist super einfach:')}
        <div class="karte">
          <div class="und-regeln">
            <span>0 XOR 0 = <b>0</b></span><span>1 XOR 1 = <b>0</b></span><span>0 XOR 1 = <b class="eins">1</b></span><span>1 XOR 0 = <b class="eins">1</b></span>
          </div>
          <p class="hinweis" style="margin-bottom:0"><strong>Gleich → 0, ungleich → 1.</strong> Die Paritätsplatte P speichert A XOR B.</p>
        </div>
        <div class="karte">
          <p class="feldtitel">🎮 Platte B ist gecrasht! Tippe auf die Bits und stell ihren Inhalt wieder her.</p>
          <div class="xor-rechnung">
            <span class="beschriftung">💽 Platte A</span><div class="bitzeile vier">${[1, 0, 1, 1].map(b => `<span class="bitzelle eins-${b}">${b}</span>`).join('')}</div>
            <span class="beschriftung">💥 Platte B</span><div class="bitzeile vier" id="bBits">${[0, 0, 0, 0].map((b, i) => `<button type="button" class="bitzelle tippbar" data-i="${i}">?</button>`).join('')}</div>
            <span class="beschriftung">🧮 Parität P</span><div class="bitzeile vier">${[1, 1, 0, 1].map(b => `<span class="bitzelle paritaet">${b}</span>`).join('')}</div>
          </div>
          <button type="button" class="btn breit f-stand" id="xorPruefen" style="margin-top:14px">Wiederherstellen ✨</button>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        const B = [0, 1, 1, 0];
        const werte = [null, null, null, null];
        box.querySelectorAll('#bBits .tippbar').forEach(z => z.onclick = () => {
          const i = Number(z.dataset.i);
          werte[i] = werte[i] === 1 ? 0 : 1;
          z.textContent = werte[i];
          z.classList.toggle('eins', werte[i] === 1);
          z.classList.add('gesetzt');
        });
        box.querySelector('#xorPruefen').onclick = e => {
          if (werte.some(w => w === null)) {
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('Setz erst alle 4 Bits von Platte B. Tippen wechselt zwischen 1 und 0.', '🤔');
            return;
          }
          if (werte.every((w, i) => w === B[i])) {
            e.target.remove();
            box.querySelectorAll('#bBits .tippbar').forEach(z => { z.disabled = true; z.classList.add('repariert'); });
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Daten gerettet! ✨</strong> Der Trick: A XOR P = B. Genauso rechnet der RAID-Controller beim <strong>Rebuild</strong> nach dem Plattentausch, nur mit Milliarden Bits.', '🧙');
            api.xp(10, box.querySelector('#bBits'));
            api.freigeben();
          } else {
            box.querySelector('#bBits').classList.remove('wackeln');
            void box.querySelector('#bBits').offsetWidth;
            box.querySelector('#bBits').classList.add('wackeln');
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('Noch nicht ganz. Tipp: Vergleiche <strong>A</strong> und <strong>P</strong> Spalte für Spalte. Sind sie gleich, ist B = 0. Sind sie ungleich, ist B = 1.', '🤔');
          }
        };
      }
    },

    // 4 ─ RAID ist kein Backup
    {
      titel: 'RAID ist kein Backup! ⚠️',
      sperre: true,
      inhalt: () => `
        <p>Ein RAID spiegelt <strong>alles</strong> sofort auf alle Platten, auch Fehler. Gegen diese Gefahren hilft RAID überhaupt nicht:</p>
        <div class="gefahren">
          ${[['🗑️', 'Versehentlich gelöscht', 'wird sofort auf allen Platten gelöscht'],
             ['🦠', 'Ransomware', 'verschlüsselt die Daten auf allen Platten'],
             ['🔥', 'Brand oder Wasser', 'zerstört den ganzen Server'],
             ['🥷', 'Diebstahl', 'der ganze Server ist weg'],
             ['⚡', 'Defekter Controller', 'kann alle Platten gleichzeitig beschädigen']]
            .map(([e, t, s]) => `<div class="gefahr"><span>${e}</span><div><strong>${t}</strong><small>${s}</small></div><b>❌</b></div>`).join('')}
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Ein Mitarbeiter löscht versehentlich einen wichtigen Ordner auf dem Dateiserver (RAID 1). Was hilft jetzt?',
          antworten: ['Die Spiegelplatte ausbauen', 'Ein Rebuild des RAID', 'Die letzte Datensicherung', 'Auf RAID 5 umstellen'],
          richtig: 2,
          erklaerung: 'Die Löschung wurde sofort auf <strong>beide</strong> Platten gespiegelt. Nur ein <strong>Backup</strong> (eine Kopie von einem früheren Zeitpunkt) bringt den Ordner zurück.'
        }, api);
      }
    },

    // 5 ─ Backup-Arten
    {
      titel: 'Voll, differenziell, inkrementell 🗓️',
      sperre: true,
      inhalt: () => `
        <div class="backup-arten">
          <div class="karte klein"><strong>🟣 Vollsicherung</strong><br><small>sichert <em>alles</em>. Braucht viel Platz und Zeit, ist aber am einfachsten wiederherzustellen.</small></div>
          <div class="karte klein"><strong>🔵 Differenziell</strong><br><small>sichert alles, was sich seit der letzten <em>Vollsicherung</em> geändert hat. Wird jeden Tag größer.</small></div>
          <div class="karte klein"><strong>🟢 Inkrementell</strong><br><small>sichert nur, was sich seit der letzten <em>Sicherung</em> (egal welcher) geändert hat. Klein und schnell.</small></div>
        </div>
        ${Baustein.bot('Jeden Tag ändert sich eine Datei: Montag 📄A, Dienstag 📄B, Mittwoch 📄C, Donnerstag 📄D. Am <strong>Freitag crasht der Server</strong> 💥. Welche Sicherungen brauchst du zum Wiederherstellen?')}
        <div class="karte">
          <p class="feldtitel" id="backupAufgabe"></p>
          <p class="hinweis">Tippe die benötigten Sicherungen an.</p>
          <div class="backup-woche" id="backupWoche"></div>
          <button type="button" class="btn breit f-stand" id="backupPruefen" style="margin-top:12px">Prüfen</button>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        const TAGE = ['So', 'Mo', 'Di', 'Mi', 'Do'];
        const DATEIEN = ['A', 'B', 'C', 'D'];
        const RUNDEN = [
          { art: 'diff', titel: '🔵 Runde 1: Differenzielle Sicherung', loesung: [0, 4],
            text: '<strong>Richtig!</strong> Die differenzielle Sicherung vom Donnerstag enthält <em>alle</em> Änderungen seit Sonntag. Also: <strong>Vollsicherung + letzte differenzielle</strong>. Nur 2 Sicherungen!' },
          { art: 'inkr', titel: '🟢 Runde 2: Inkrementelle Sicherung', loesung: [0, 1, 2, 3, 4],
            text: '<strong>Perfekt!</strong> Jede inkrementelle Sicherung enthält nur die Änderung eines Tages. Du brauchst also <strong>die Vollsicherung + alle inkrementellen</strong>, und zwar in der richtigen Reihenfolge.' }
        ];
        let runde = 0;
        let auswahl = new Set();
        const zeichnen = () => {
          const r = RUNDEN[runde];
          box.querySelector('#backupAufgabe').textContent = r.titel;
          box.querySelector('#backupWoche').innerHTML = TAGE.map((t, i) => {
            const inhalt = i === 0 ? ['alles'] : r.art === 'diff' ? DATEIEN.slice(0, i) : [DATEIEN[i - 1]];
            return `<button type="button" class="backup-tag ${i === 0 ? 'voll' : r.art} ${auswahl.has(i) ? 'gewaehlt' : ''}" data-i="${i}">
              <span class="tag-name">${t}</span>
              <span class="tag-art">${i === 0 ? 'Voll' : r.art === 'diff' ? 'Diff' : 'Inkr'}</span>
              <span class="tag-inhalt">${inhalt.map(d => `<i>${d === 'alles' ? '📦 alles' : '📄' + d}</i>`).join('')}</span>
            </button>`;
          }).join('') + '<div class="backup-tag crash"><span class="tag-name">Fr</span><span class="tag-art">💥</span><span class="tag-inhalt"><i>Crash!</i></span></div>';
          box.querySelectorAll('.backup-tag[data-i]').forEach(b => b.onclick = () => {
            const i = Number(b.dataset.i);
            auswahl.has(i) ? auswahl.delete(i) : auswahl.add(i);
            b.classList.toggle('gewaehlt');
          });
        };
        box.querySelector('#backupPruefen').onclick = () => {
          const r = RUNDEN[runde];
          const richtig = auswahl.size === r.loesung.length && r.loesung.every(i => auswahl.has(i));
          if (!richtig) {
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(r.art === 'diff'
              ? 'Hmm, nicht ganz. Schau dir an, was in der Sicherung vom <strong>Donnerstag</strong> schon alles drin ist. 👀'
              : 'Nicht ganz. Jede inkrementelle Sicherung hat nur <strong>eine</strong> Datei. Welche brauchst du, damit A, B, C und D wieder da sind?', '🤔');
            return;
          }
          box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(r.text, '🤩');
          if (runde === 0) {
            runde = 1;
            auswahl = new Set();
            setTimeout(() => {
              zeichnen();
              box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('Gleiche Woche, aber jetzt mit <strong>inkrementellen</strong> Sicherungen. Was brauchst du diesmal? 🤔');
              box.querySelector('#backupAufgabe').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 2200);
          } else {
            box.querySelector('#backupPruefen').remove();
            api.xp(10, box.querySelector('#backupWoche'));
            api.freigeben();
          }
        };
        zeichnen();
      }
    },

    // 6 ─ 3-2-1-Regel
    {
      titel: 'Die 3-2-1-Regel 🥇',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('Profis halten sich an eine einfache Regel. Wenn du die in der Prüfung erklären kannst, hast du schon gewonnen:')}
        <div class="regel-321">
          <div><span class="zahl">3</span><strong>Kopien</strong><small>Original + 2 Backups</small></div>
          <div><span class="zahl">2</span><strong>Medien</strong><small>z. B. NAS und Band oder Cloud</small></div>
          <div><span class="zahl">1</span><strong>außer Haus</strong><small>gegen Brand und Diebstahl</small></div>
        </div>
        <div class="karte">
          <p class="feldtitel">Noch zwei Begriffe für die Prüfung</p>
          <p><strong>👴👨👦 Generationenprinzip (Großvater-Vater-Sohn):</strong> Tägliche (Sohn), wöchentliche (Vater) und monatliche (Großvater) Sicherungen werden rotiert. So kommst du auch an ältere Stände.</p>
          <p><strong>⏪ RPO</strong> (Recovery Point Objective): Wie viel Datenverlust ist maximal okay? → bestimmt, <em>wie oft</em> gesichert wird.<br>
          <strong>⏱️ RTO</strong> (Recovery Time Objective): Wie lange darf die Wiederherstellung dauern?</p>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Welche Lösung erfüllt die 3-2-1-Regel?',
          antworten: [
            'Original + 2 Kopien auf demselben NAS',
            'Original auf dem Server, Kopie auf dem NAS, Kopie in der Cloud',
            'Original auf einem RAID-1-Verbund',
            'Original + 1 Kopie auf einer USB-Platte im Büro'
          ],
          richtig: 1,
          erklaerung: '3 Kopien ✔, 2 verschiedene Speicher (NAS + Cloud) ✔, 1 Kopie außer Haus (Cloud) ✔. Ein RAID zählt übrigens nicht als Kopie!'
        }, api);
      }
    },

    // 7 ─ Spickzettel
    {
      titel: 'Geschafft! 🏆',
      inhalt: () => `
        ${Baustein.bot('Stark! Jetzt kennst du dich mit RAID und Backups aus wie ein Admin. Hier ist dein <strong>Spickzettel</strong>:', '🥳')}
        <div class="karte spickzettel" style="padding:10px">
          <table class="ergebnis-tabelle kompakt">
            <tr><th>RAID</th><th>Prinzip</th><th>Min.</th><th>Nutzbar</th><th>Ausfall</th></tr>
            <tr><td><strong>0</strong></td><td>Striping</td><td>2</td><td>n</td><td>0</td></tr>
            <tr><td><strong>1</strong></td><td>Spiegel</td><td>2</td><td>1 Platte</td><td>n − 1</td></tr>
            <tr><td><strong>5</strong></td><td>Parität</td><td>3</td><td>n − 1</td><td>1</td></tr>
            <tr><td><strong>6</strong></td><td>2× Parität</td><td>4</td><td>n − 2</td><td>2</td></tr>
            <tr><td><strong>10</strong></td><td>Spiegel + Stripe</td><td>4</td><td>n ÷ 2</td><td>1 pro Paar</td></tr>
          </table>
        </div>
        <div class="karte spickzettel">
          <ul class="haken-liste">
            <li><strong>RAID ersetzt kein Backup!</strong></li>
            <li>Differenziell: Voll + <em>letzte</em> Diff</li>
            <li>Inkrementell: Voll + <em>alle</em> Inkremente in Reihenfolge</li>
            <li>3-2-1: 3 Kopien, 2 Medien, 1 außer Haus</li>
            <li>Backups regelmäßig <strong>testen</strong>, denn ein Backup, das sich nicht wiederherstellen lässt, ist keins!</li>
          </ul>
        </div>`
    }
  ]
});

// ───────────── Lektion: Verschlüsselung ─────────────
const caesar = (text, verschiebung) => text.toUpperCase().replace(/[A-Z]/g, c =>
  String.fromCharCode((c.charCodeAt(0) - 65 + verschiebung + 26) % 26 + 65));

// SHA-256 über die Web Crypto API, mit einfachem Ersatz-Hash, falls die API nicht verfügbar ist
async function hashText(text) {
  if (window.crypto && crypto.subtle) {
    const puffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return { name: 'SHA-256', wert: [...new Uint8Array(puffer)].map(b => b.toString(16).padStart(2, '0')).join('') };
  }
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (const ch of text) {
    const c = ch.charCodeAt(0);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return { name: 'Demo-Hash', wert: (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0') };
}

LEKTIONEN.push({
  id: 'verschluesselung',
  titel: 'Verschlüsselung',
  emoji: '🔐',
  farbe: 'f-eigene',
  dauer: 'ca. 15 Minuten',
  ueben: { link: '#/karten', text: '🗂️ Jetzt mit Karteikarten festigen' },
  beschreibung: 'Symmetrisch, asymmetrisch und hybrid, dazu Hashwerte und digitale Signaturen. Mit Geheimbotschaft zum Knacken!',
  schritte: [
    // 1 ─ Einstieg
    {
      titel: 'Psst … Geheimnisse! 🤫',
      inhalt: () => `
        ${Baustein.bot('Jedes Mal, wenn du online einkaufst, eine Nachricht schickst oder dich einloggst, wird verschlüsselt. Heute schauen wir uns an, <strong>wie</strong> das funktioniert. 🕵️')}
        <div class="karte">
          <p class="feldtitel">Die drei wichtigsten Begriffe</p>
          <div class="krypto-fluss">
            <div><span class="gross-emoji">📄</span><strong>Klartext</strong><small>lesbare Nachricht</small></div>
            <div class="pfeil">🔑➜</div>
            <div><span class="gross-emoji">🔣</span><strong>Geheimtext</strong><small>unlesbar ohne Schlüssel</small></div>
          </div>
          <p class="hinweis" style="text-align:center">Der <strong>Schlüssel</strong> ist das Geheimnis, nicht das Verfahren. Gute Verfahren wie AES sind sogar öffentlich bekannt.</p>
        </div>
        <div class="karte">
          <p class="feldtitel">Was Kryptografie schützt</p>
          <ul class="haken-liste">
            <li><strong>Vertraulichkeit</strong>: Nur Berechtigte können die Nachricht lesen</li>
            <li><strong>Integrität</strong>: Die Nachricht wurde nicht verändert</li>
            <li><strong>Authentizität</strong>: Die Nachricht kommt wirklich vom Absender</li>
          </ul>
        </div>`
    },

    // 2 ─ Caesar knacken
    {
      titel: 'Knack den Code! 🕵️',
      sperre: true,
      inhalt: () => `
        <p>Schon Julius Caesar hat Nachrichten verschlüsselt: Jeder Buchstabe wird um eine feste Zahl im Alphabet verschoben. Diese Zahl ist der <strong>Schlüssel</strong>.</p>
        ${Baustein.bot('Ich habe dir eine geheime Nachricht geschickt! Aber ich verrate den Schlüssel nicht. 😏 <strong>Dreh am Regler, bis du die Nachricht lesen kannst!</strong>')}
        <div class="karte">
          <p class="hinweis" style="margin:0">Geheimtext</p>
          <div class="geheimtext">${caesar('PRUEFUNG BESTANDEN', 3)}</div>
          <div class="regler-zeile">
            <span class="hinweis" style="margin:0">Schlüssel</span>
            <input type="range" min="0" max="25" value="0" id="caesarRegler" aria-label="Schlüssel">
            <span class="regler-wert" id="caesarWert">0</span>
          </div>
          <div class="alphabet" id="alphabet"></div>
          <p class="hinweis" style="margin:10px 0 0">Entschlüsselt</p>
          <div class="klartext" id="caesarKlar"></div>
          <div data-erfolg></div>
        </div>
        <div class="karte">
          <p class="feldtitel">✏️ Probier es selbst</p>
          <input type="text" id="eigenerText" maxlength="40" placeholder="Schreib etwas …" value="FISI">
          <p class="hinweis" style="margin:8px 0 0">Mit Schlüssel <span id="eigenerSchluessel">0</span> verschlüsselt:</p>
          <div class="geheimtext klein" id="eigenerGeheim"></div>
        </div>`,
      init(box, api) {
        const regler = box.querySelector('#caesarRegler');
        const geheim = caesar('PRUEFUNG BESTANDEN', 3);
        let fertig = false;
        const zeichnen = () => {
          const k = Number(regler.value);
          box.querySelector('#caesarWert').textContent = k;
          box.querySelector('#alphabet').innerHTML = 'ABCDEFGHIJKLM'.split('').map(c => `<span><b>${c}</b>${caesar(c, k)}</span>`).join('');
          box.querySelector('#caesarKlar').textContent = caesar(geheim, -k);
          box.querySelector('#caesarKlar').classList.toggle('geknackt', k === 3);
          box.querySelector('#eigenerSchluessel').textContent = k;
          box.querySelector('#eigenerGeheim').textContent = caesar(box.querySelector('#eigenerText').value, k) || '…';
          if (k === 3 && !fertig) {
            fertig = true;
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Geknackt! 🎉</strong> Der Schlüssel war 3. Siehst du das Problem? Es gibt nur 25 mögliche Schlüssel, die probiert ein Computer in Millisekunden durch (<strong>Brute Force</strong>). Moderne Verfahren wie AES-256 haben 2<sup>256</sup> Schlüssel. Das schafft kein Computer der Welt.', '🤩');
            api.xp(10, box.querySelector('#caesarKlar'));
            api.freigeben();
          }
        };
        regler.addEventListener('input', zeichnen);
        box.querySelector('#eigenerText').addEventListener('input', zeichnen);
        zeichnen();
      }
    },

    // 3 ─ Symmetrisch
    {
      titel: 'Symmetrische Verschlüsselung 🔑',
      sperre: true,
      inhalt: () => `
        <p>Caesar ist ein <strong>symmetrisches</strong> Verfahren: Zum Verschlüsseln und Entschlüsseln wird <strong>derselbe Schlüssel</strong> verwendet.</p>
        <div class="szene">
          <div class="person"><span>👩</span><strong>Alice</strong><small>🔑 Schlüssel K</small></div>
          <div class="leitung"><span>🔣 Geheimtext</span></div>
          <div class="person"><span>👨</span><strong>Bob</strong><small>🔑 Schlüssel K</small></div>
        </div>
        <div class="vor-nachteile">
          <div class="vorteil"><strong>👍 Vorteil</strong><small>sehr schnell, auch für große Datenmengen</small></div>
          <div class="nachteil"><strong>👎 Nachteil</strong><small>der Schlüssel muss sicher ausgetauscht werden</small></div>
        </div>
        <p class="hinweis">Beispiele: <strong>AES</strong> (Standard heute), 3DES (veraltet), ChaCha20</p>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Alice und Bob haben sich nie getroffen. Was ist bei symmetrischer Verschlüsselung ihr größtes Problem?',
          antworten: ['Das Verfahren ist zu langsam', 'Der sichere Austausch des Schlüssels', 'Die Nachricht wird zu groß', 'Man kann nur Text verschlüsseln'],
          richtig: 1,
          erklaerung: 'Schickt Alice den Schlüssel einfach mit, kann ein Angreifer ihn abfangen. Das ist das <strong>Schlüsselaustauschproblem</strong>. Die Lösung kommt im nächsten Schritt! 👀'
        }, api);
      }
    },

    // 4 ─ Asymmetrisch
    {
      titel: 'Asymmetrische Verschlüsselung 🔓🔒',
      sperre: true,
      inhalt: () => `
        <p>Bei der <strong>asymmetrischen</strong> Verschlüsselung hat jeder ein <strong>Schlüsselpaar</strong>:</p>
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">🔓</span><strong>Öffentlicher Schlüssel</strong><small>darf jeder kennen<br>→ zum <strong>Verschlüsseln</strong></small></div>
          <div class="host-box"><span class="gross-emoji">🔒</span><strong>Privater Schlüssel</strong><small>bleibt geheim<br>→ zum <strong>Entschlüsseln</strong></small></div>
        </div>
        ${Baustein.bot('Stell dir einen <strong>Briefkasten</strong> 📮 vor: Jeder kann einen Brief einwerfen (öffentlicher Schlüssel). Aber nur der Besitzer hat den Schlüssel, um ihn zu öffnen (privater Schlüssel)!')}
        <p class="hinweis">Beispiele: <strong>RSA</strong>, ECC (elliptische Kurven), Diffie-Hellman (Schlüsselaustausch)</p>
        <div data-schluessel></div>`,
      init(box, api) {
        Baustein.schluesselSpiel(box, [
          { frage: 'Alice will Bob eine geheime Nachricht schicken. <strong>Womit verschlüsselt Alice?</strong>', richtig: 'bob-oeff',
            erklaerung: 'Alice nimmt <strong>Bobs öffentlichen Schlüssel</strong>. Sie wirft den Brief quasi in Bobs Briefkasten. 📮',
            tipp: 'Denk an den Briefkasten: In <em>wessen</em> Briefkasten soll die Nachricht? Und welchen Schlüssel darf jeder benutzen?' },
          { frage: 'Bob hat die Nachricht bekommen. <strong>Womit entschlüsselt Bob?</strong>', richtig: 'bob-priv',
            erklaerung: 'Nur Bobs <strong>privater Schlüssel</strong> passt zu seinem öffentlichen. Selbst Alice kann die Nachricht jetzt nicht mehr entschlüsseln! 🔒',
            tipp: 'Wer hat den Schlüssel, um Bobs Briefkasten zu öffnen?' }
        ], api, 'Merksatz: <strong>Verschlüsselt wird mit dem öffentlichen Schlüssel des Empfängers.</strong>');
      }
    },

    // 5 ─ Hybrid / HTTPS
    {
      titel: 'Hybrid: das Beste aus beiden Welten 🤝',
      sperre: true,
      inhalt: () => `
        <div class="vor-nachteile">
          <div class="vorteil"><strong>Symmetrisch</strong><small>⚡ schnell<br>😬 Schlüsselaustausch schwierig</small></div>
          <div class="nachteil" style="border-color:var(--quiz);background:var(--quiz-hell)"><strong>Asymmetrisch</strong><small>🐢 langsam<br>😎 kein Schlüsselaustausch nötig</small></div>
        </div>
        ${Baustein.bot('Die Lösung ist genial: Man nutzt <strong>beide</strong>! Asymmetrisch wird nur ein kleiner Sitzungsschlüssel ausgetauscht, danach geht es symmetrisch und schnell weiter. Genau so funktioniert <strong>HTTPS (TLS)</strong>. Schau zu:')}
        <div class="unterschritte">
          <div class="unterschritt"><span class="nr">1</span><div>🌐 Der <strong>Browser</strong> meldet sich beim Webserver: „Hallo, ich möchte sicher reden!“</div></div>
          <div class="unterschritt"><span class="nr">2</span><div>📜 Der <strong>Server</strong> schickt sein <strong>Zertifikat</strong> mit seinem öffentlichen Schlüssel. Der Browser prüft, ob eine vertrauenswürdige Zertifizierungsstelle (<strong>CA</strong>) es signiert hat.</div></div>
          <div class="unterschritt"><span class="nr">3</span><div>🎲 Beide vereinbaren einen zufälligen <strong>Sitzungsschlüssel</strong>. Der Austausch ist asymmetrisch geschützt, in modernem TLS meist per Diffie-Hellman.</div></div>
          <div class="unterschritt"><span class="nr">4</span><div>⚡ Ab jetzt wird alles <strong>symmetrisch</strong> (z. B. mit AES) mit dem Sitzungsschlüssel verschlüsselt. Schnell und sicher! 🔒</div></div>
        </div>
        <button type="button" class="btn breit f-eigene" id="naechsterTeil">Schritt 1 zeigen ▶</button>
        <div data-erfolg></div>`,
      init(box, api) {
        const teile = [...box.querySelectorAll('.unterschritt')];
        const knopf = box.querySelector('#naechsterTeil');
        let n = 0;
        knopf.onclick = () => {
          teile[n].classList.add('sichtbar');
          teile[n].scrollIntoView({ behavior: 'smooth', block: 'center' });
          n++;
          if (n < teile.length) {
            knopf.textContent = `Schritt ${n + 1} zeigen ▶`;
          } else {
            knopf.remove();
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Das ist hybride Verschlüsselung!</strong> Das 🔒 im Browser bedeutet genau diesen Ablauf. Prüfungs-Tipp: Bei der Frage „Warum hybrid?“ antwortest du: <em>sicherer Schlüsselaustausch (asymmetrisch) + schnelle Datenübertragung (symmetrisch)</em>.', '😎');
            api.xp(5, box.querySelector('[data-erfolg]'));
            api.freigeben();
          }
        };
      }
    },

    // 6 ─ Hash
    {
      titel: 'Hashwerte: der digitale Fingerabdruck 🔏',
      sperre: true,
      inhalt: () => `
        <p>Eine <strong>Hashfunktion</strong> macht aus beliebig vielen Daten einen kurzen Wert mit fester Länge. Das ist <strong>keine</strong> Verschlüsselung, denn man kann es nicht zurückrechnen!</p>
        <div class="karte">
          <p class="feldtitel">🎮 Hash-Labor</p>
          <label>Dein Text
            <input type="text" id="hashEingabe" value="Ich bestehe die Prüfung!" maxlength="200" spellcheck="false">
          </label>
          <p class="hinweis" style="margin:0" id="hashName">SHA-256</p>
          <div class="hashwert" id="hashWert">…</div>
          <p class="hinweis" id="hashVergleich" style="margin:8px 0 0"></p>
          <p class="feldtitel" style="margin-top:12px">Aufgabe: Ändere nur <span class="ziel-zahl">einen einzigen Buchstaben</span> und schau, was mit dem Hash passiert!</p>
          <div data-erfolg></div>
        </div>
        <div class="karte">
          <p class="feldtitel">Eigenschaften eines guten Hashes</p>
          <ul class="haken-liste">
            <li><strong>Einwegfunktion</strong>: nicht umkehrbar</li>
            <li><strong>Feste Länge</strong>, egal wie lang die Eingabe ist</li>
            <li><strong>Lawineneffekt</strong>: kleine Änderung → völlig anderer Hash</li>
            <li><strong>Kollisionsresistent</strong>: zwei verschiedene Eingaben sollen nie denselben Hash haben</li>
          </ul>
          <p class="hinweis" style="margin-bottom:0">Einsatz: Integrität prüfen (Downloads), Passwörter speichern (mit <strong>Salt</strong>!), digitale Signaturen. Unsicher: MD5, SHA-1. Empfohlen: SHA-256 und höher.</p>
        </div>`,
      init(box, api) {
        const eingabe = box.querySelector('#hashEingabe');
        const start = eingabe.value;
        let startHash = null;
        let fertig = false;
        const rechnen = async () => {
          const text = eingabe.value;
          const h = await hashText(text);
          if (startHash === null) startHash = h.wert;
          box.querySelector('#hashName').textContent = `${h.name} (${h.wert.length * 4} Bit)`;
          box.querySelector('#hashWert').innerHTML = [...h.wert].map((c, i) =>
            `<span class="${startHash && c !== startHash[i] ? 'anders' : ''}">${c}</span>`).join('');
          const anders = [...h.wert].filter((c, i) => c !== startHash[i]).length;
          box.querySelector('#hashVergleich').textContent = text === start ? 'Das ist der Hash des Ausgangstextes.' : `${anders} von ${h.wert.length} Zeichen haben sich geändert!`;
          // Genau ein Zeichen geändert (gleiche Länge, eine Abweichung)?
          const eineAenderung = text.length === start.length && [...text].filter((c, i) => c !== start[i]).length === 1;
          if (eineAenderung && !fertig) {
            fertig = true;
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(`<strong>Lawineneffekt! 🌊</strong> Ein einziger Buchstabe, und ${anders} von ${h.wert.length} Zeichen im Hash sind anders. Deshalb erkennt man jede noch so kleine Manipulation.`, '🤯');
            api.xp(10, box.querySelector('#hashWert'));
            api.freigeben();
          }
        };
        eingabe.addEventListener('input', rechnen);
        rechnen();
      }
    },

    // 7 ─ Digitale Signatur
    {
      titel: 'Die digitale Signatur ✍️',
      sperre: true,
      inhalt: () => `
        <p>Mit einer <strong>digitalen Signatur</strong> beweist Alice, dass eine Nachricht <strong>von ihr</strong> kommt (Authentizität) und <strong>nicht verändert</strong> wurde (Integrität). Dafür werden Hash und asymmetrische Schlüssel kombiniert:</p>
        <div class="signatur-ablauf">
          <div><span class="nr">1</span><span>👩 Alice bildet den <strong>Hash</strong> der Nachricht</span></div>
          <div><span class="nr">2</span><span>🔒 Sie verschlüsselt den Hash mit ihrem <strong>privaten</strong> Schlüssel → das ist die <strong>Signatur</strong></span></div>
          <div><span class="nr">3</span><span>📨 Nachricht + Signatur gehen an Bob</span></div>
          <div><span class="nr">4</span><span>🔓 Bob entschlüsselt die Signatur mit Alices <strong>öffentlichem</strong> Schlüssel und vergleicht mit dem selbst berechneten Hash</span></div>
          <div><span class="nr">5</span><span>✅ Gleich? Dann ist die Nachricht echt und unverändert!</span></div>
        </div>
        ${Baustein.bot('Achtung, Prüfungsfalle! 🪤 Bei der Signatur ist es <strong>genau andersherum</strong> als beim Verschlüsseln. Teste dich:')}
        <div data-schluessel></div>`,
      init(box, api) {
        Baustein.schluesselSpiel(box, [
          { frage: 'Alice will eine Nachricht <strong>signieren</strong>. Welchen Schlüssel nutzt sie?', richtig: 'alice-priv',
            erklaerung: 'Mit ihrem <strong>privaten</strong> Schlüssel. Nur Alice hat ihn, also kann nur sie diese Signatur erzeugen. ✍️',
            tipp: 'Die Signatur soll beweisen, dass nur <em>Alice</em> sie erstellt haben kann. Welchen Schlüssel hat nur Alice?' },
          { frage: 'Bob will die Signatur <strong>prüfen</strong>. Welchen Schlüssel nutzt er?', richtig: 'alice-oeff',
            erklaerung: 'Mit <strong>Alices öffentlichem</strong> Schlüssel. Den darf jeder haben, also kann jeder die Signatur prüfen. ✅',
            tipp: 'Bob muss prüfen, ob die Signatur von <em>Alice</em> stammt. Welchen Schlüssel von Alice kann Bob haben?' }
        ], api, 'Merksatz: <strong>Signiert wird mit dem privaten Schlüssel des Absenders.</strong>');
      }
    },

    // 8 ─ Spickzettel
    {
      titel: 'Geschafft! 🏆',
      inhalt: () => `
        ${Baustein.bot('Du bist jetzt offiziell Krypto-Profi! 🔐 Hier dein <strong>Spickzettel</strong>:', '🥳')}
        <div class="karte spickzettel" style="padding:10px">
          <table class="ergebnis-tabelle">
            <tr><th></th><th>Symmetrisch</th><th>Asymmetrisch</th></tr>
            <tr><td><strong>Schlüssel</strong></td><td>1 gemeinsamer</td><td>Paar: öffentlich + privat</td></tr>
            <tr><td><strong>Tempo</strong></td><td>⚡ schnell</td><td>🐢 langsam</td></tr>
            <tr><td><strong>Problem</strong></td><td>Schlüsselaustausch</td><td>Rechenaufwand</td></tr>
            <tr><td><strong>Beispiele</strong></td><td>AES, ChaCha20</td><td>RSA, ECC</td></tr>
          </table>
        </div>
        <div class="karte spickzettel">
          <ul class="haken-liste">
            <li><strong>Verschlüsseln:</strong> öffentlicher Schlüssel des <em>Empfängers</em></li>
            <li><strong>Signieren:</strong> privater Schlüssel des <em>Absenders</em></li>
            <li><strong>Hybrid (TLS/HTTPS):</strong> asymmetrisch Schlüssel austauschen, symmetrisch Daten übertragen</li>
            <li><strong>Hash:</strong> Einwegfunktion, feste Länge, Lawineneffekt → Integrität</li>
            <li><strong>Zertifikat:</strong> bestätigt, dass ein öffentlicher Schlüssel wirklich zum Besitzer gehört (CA)</li>
          </ul>
        </div>`
    }
  ]
});

// ───────────── Lektion: DNS & DHCP ─────────────
LEKTIONEN.push({
  id: 'dns-dhcp',
  titel: 'DNS & DHCP',
  emoji: '📖',
  farbe: 'f-quiz',
  dauer: 'ca. 15 Minuten',
  ueben: { link: '#/quiz', text: '❓ Jetzt im Quiz testen' },
  beschreibung: 'Wie ein PC automatisch seine IP-Adresse bekommt und wie aus www.example.de eine IP-Adresse wird. Du spielst selbst den Resolver!',
  schritte: [
    // 1 ─ Einstieg
    {
      titel: 'Die zwei heimlichen Helfer 🦸🦸',
      inhalt: () => `
        ${Baustein.bot('Stell dir vor, du müsstest an jedem PC die IP-Adresse von Hand eintragen und dir für jede Webseite eine Zahl wie <code>142.250.185.67</code> merken. Ein Albtraum! 😵 Zum Glück gibt es zwei Dienste, die das übernehmen:')}
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">🏨</span><strong>DHCP</strong><small>wie eine <strong>Hotelrezeption</strong>: vergibt jedem Gast (PC) automatisch ein Zimmer (IP-Adresse), auf Zeit</small></div>
          <div class="host-box"><span class="gross-emoji">📒</span><strong>DNS</strong><small>wie das <strong>Telefonbuch</strong>: übersetzt Namen wie <code>example.de</code> in IP-Adressen</small></div>
        </div>
        <div class="karte">
          <p class="feldtitel">Steckbriefe</p>
          <table class="ergebnis-tabelle">
            <tr><th></th><th>DHCP</th><th>DNS</th></tr>
            <tr><td><strong>Name</strong></td><td>Dynamic Host Configuration Protocol</td><td>Domain Name System</td></tr>
            <tr><td><strong>Ports</strong></td><td>UDP 67 (Server), 68 (Client)</td><td>53 (UDP, bei Bedarf TCP)</td></tr>
            <tr><td><strong>OSI</strong></td><td colspan="2" style="text-align:center">beide Schicht 7 (Anwendung)</td></tr>
          </table>
        </div>`
    },

    // 2 ─ DORA
    {
      titel: 'DHCP: das DORA-Prinzip 🗣️',
      sperre: true,
      inhalt: () => `
        <p>Ein neuer PC kommt ins Netz und hat noch <strong>keine IP-Adresse</strong>. Er kennt nicht einmal den DHCP-Server. Wie bekommt er trotzdem eine Adresse? Mit vier Nachrichten!</p>
        <div class="szene">
          <div class="person"><span>💻</span><strong>Client</strong><small id="clientIp">IP: keine</small></div>
          <div class="leitung" id="doraLeitung"></div>
          <div class="person"><span>🖥️</span><strong>DHCP-Server</strong><small>192.168.1.1</small></div>
        </div>
        <div class="karte">
          <p class="feldtitel">🎮 Bring die Nachrichten in die richtige Reihenfolge!</p>
          <div class="dora-log" id="doraLog"></div>
          <div class="sortier-auswahl" id="doraAuswahl"></div>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        const NACHRICHTEN = [
          { id: 'D', name: 'DISCOVER', von: '💻', an: '📢 alle', text: '„Hallo? Gibt es hier einen DHCP-Server?“', info: 'Broadcast an 255.255.255.255, weil der Client den Server noch nicht kennt. Absender 0.0.0.0, er hat ja noch keine IP!' },
          { id: 'O', name: 'OFFER', von: '🖥️', an: '💻', text: '„Hier! Du kannst 192.168.1.42 haben.“', info: 'Der Server bietet eine freie Adresse aus seinem Adressbereich (Scope) an.' },
          { id: 'R', name: 'REQUEST', von: '💻', an: '📢 alle', text: '„Super, ich nehme 192.168.1.42!“', info: 'Wieder als Broadcast. So erfahren auch andere DHCP-Server, dass ihr Angebot abgelehnt wurde.' },
          { id: 'A', name: 'ACKNOWLEDGE', von: '🖥️', an: '💻', text: '„Bestätigt! Sie gehört dir für 8 Stunden.“', info: 'Der Server bestätigt und schickt alle Einstellungen mit. Die Leihzeit heißt Lease.' }
        ];
        let naechste = 0;
        let fehler = 0;
        const auswahl = box.querySelector('#doraAuswahl');
        auswahl.innerHTML = mischen(NACHRICHTEN).map(n => `<button type="button" class="sortier-btn" data-id="${n.id}">DHCP ${n.name}</button>`).join('');
        auswahl.querySelectorAll('.sortier-btn').forEach(b => b.onclick = () => {
          const n = NACHRICHTEN[naechste];
          if (b.dataset.id !== n.id) {
            fehler++;
            b.classList.remove('wackeln'); void b.offsetWidth; b.classList.add('wackeln');
            return;
          }
          b.remove();
          box.querySelector('#doraLeitung').innerHTML = `<span class="${n.von === '💻' ? 'nach-rechts' : 'nach-links'}">${n.id} ${n.von === '💻' ? '➜' : '⬅'}</span>`;
          box.querySelector('#doraLog').insertAdjacentHTML('beforeend', `
            <div class="dora-zeile ${n.von === '💻' ? 'client' : 'server'}">
              <span class="dora-buchstabe">${n.id}</span>
              <div><strong>${n.von} → ${n.an}: DHCP ${n.name}</strong><br>${n.text}<small>${n.info}</small></div>
            </div>`);
          naechste++;
          if (naechste === 4) {
            box.querySelector('#clientIp').textContent = 'IP: 192.168.1.42 ✅';
            box.querySelector('#clientIp').classList.add('neu-ip');
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(`<strong>${fehler === 0 ? 'Fehlerfrei! 🏆' : 'Geschafft! 🎉'}</strong> Merk dir <strong>D-O-R-A</strong>: Discover, Offer, Request, Acknowledge. Kommt in fast jeder Prüfung dran!`, '🤩');
            api.xp(fehler === 0 ? 10 : 5, box.querySelector('#clientIp'));
            api.freigeben();
          }
        });
      }
    },

    // 3 ─ Was DHCP mitliefert
    {
      titel: 'Was DHCP alles mitliefert 🎁',
      sperre: true,
      inhalt: () => `
        <p>DHCP vergibt nicht nur die IP-Adresse. So sieht das Ergebnis bei <code>ipconfig /all</code> aus:</p>
        <div class="konsole">
          <div><span>IPv4-Adresse</span><b>192.168.1.42</b></div>
          <div><span>Subnetzmaske</span><b>255.255.255.0</b></div>
          <div><span>Standardgateway</span><b>192.168.1.1</b></div>
          <div><span>DNS-Server</span><b>192.168.1.1</b></div>
          <div><span>DHCP-Server</span><b>192.168.1.1</b></div>
          <div><span>Lease erhalten</span><b>Freitag, 08:00</b></div>
          <div><span>Lease läuft ab</span><b>Freitag, 16:00</b></div>
        </div>
        <div class="karte">
          <p class="feldtitel">Wichtige Begriffe</p>
          <p><strong>📦 Scope (Bereich):</strong> der Adressbereich, aus dem der Server verteilt, z. B. .100 bis .200</p>
          <p><strong>⏳ Lease:</strong> Die Adresse ist nur geliehen. Nach der Hälfte der Zeit fragt der Client nach Verlängerung.</p>
          <p><strong>📌 Reservierung:</strong> Ein Gerät (z. B. ein Drucker) bekommt anhand seiner <strong>MAC-Adresse</strong> immer dieselbe IP.</p>
          <p><strong>🔁 DHCP-Relay:</strong> Broadcasts gehen nicht über Router. Ein Relay-Agent leitet die Anfragen deshalb an einen DHCP-Server in einem anderen Netz weiter.</p>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Ein Kunde ruft an: „Mein PC hat die IP-Adresse <code>169.254.17.3</code> und kommt nicht ins Internet.“ Was ist los?',
          antworten: ['Der DNS-Server ist ausgefallen', 'Der PC hat keinen DHCP-Server erreicht', 'Die IP-Adresse ist doppelt vergeben', 'Der PC hat eine öffentliche IP'],
          richtig: 1,
          erklaerung: '<code>169.254.x.x</code> ist eine <strong>APIPA</strong>-Adresse. Die gibt sich Windows selbst, wenn kein DHCP-Server antwortet. Prüfe Kabel, Switch-Port und DHCP-Server!'
        }, api);
      }
    },

    // 4 ─ DNS-Auflösung als Spiel
    {
      titel: 'DNS: Du bist der Resolver! 🔎',
      sperre: true,
      inhalt: () => `
        <p>DNS ist wie ein riesiger <strong>Baum</strong> 🌳 aufgebaut. Ganz oben steht die Wurzel (Root), darunter die Top-Level-Domains wie <code>.de</code> oder <code>.com</code>, darunter die einzelnen Domains.</p>
        <div class="dns-baum">
          <div class="ebene"><span class="knoten root">. (Root)</span></div>
          <div class="ebene"><span class="knoten">.com</span><span class="knoten aktiv">.de</span><span class="knoten">.org</span></div>
          <div class="ebene"><span class="knoten">google.de</span><span class="knoten aktiv">example.de</span></div>
          <div class="ebene"><span class="knoten aktiv">www.example.de</span></div>
        </div>
        ${Baustein.bot('Jetzt bist <strong>du</strong> der DNS-Resolver deines Providers! Ein Kunde will <code>www.example.de</code> aufrufen, und du hast nichts im Cache. <strong>Wen fragst du?</strong> 🤔')}
        <div class="karte">
          <div class="dns-chat" id="dnsChat">
            <div class="chat-zeile links"><span>💻</span><div>Hey Resolver, welche IP hat <strong>www.example.de</strong>?</div></div>
          </div>
          <p class="feldtitel" id="dnsFrage" style="margin-top:12px">Wen fragst du zuerst?</p>
          <div class="dns-wahl" id="dnsWahl">
            <button type="button" data-ziel="root">🌍 Root-Server</button>
            <button type="button" data-ziel="tld">🏛️ .de-Server (DENIC)</button>
            <button type="button" data-ziel="ns">🏢 Nameserver von example.de</button>
            <button type="button" data-ziel="client">💻 Antwort an den Client</button>
          </div>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        const SCHRITTE = [
          { ziel: 'root', frage: 'Wen fragst du zuerst?', antwort: ['🌍', 'Root-Server', 'Kenne ich nicht genau, aber für <strong>.de</strong> ist <code>a.nic.de</code> zuständig. Frag dort!'] },
          { ziel: 'tld', frage: 'Und jetzt?', antwort: ['🏛️', '.de-Server', '<strong>example.de</strong>? Dafür ist <code>ns1.example.de</code> zuständig. Frag dort!'] },
          { ziel: 'ns', frage: 'Fast geschafft! Wen fragst du jetzt?', antwort: ['🏢', 'ns1.example.de', 'Ich bin autoritativ für example.de: <strong>www.example.de = 93.184.216.34</strong> ✅'] },
          { ziel: 'client', frage: 'Du hast die Antwort! Was jetzt?', antwort: ['💻', 'Client', 'Danke! Dann verbinde ich mich mit 93.184.216.34. 🚀'] }
        ];
        const TIPPS = {
          root: 'Die Root-Server kennen nur die Top-Level-Domains.',
          tld: 'Der .de-Server weiß, welcher Nameserver für example.de zuständig ist, aber er kennt nicht selbst die IP von www.',
          ns: 'Woher weißt du überhaupt, welcher Nameserver für example.de zuständig ist?',
          client: 'Du hast doch noch gar keine Antwort! 😉'
        };
        let i = 0;
        const chat = box.querySelector('#dnsChat');
        box.querySelectorAll('#dnsWahl button').forEach(b => b.onclick = () => {
          const s = SCHRITTE[i];
          if (b.dataset.ziel !== s.ziel) {
            b.classList.remove('wackeln'); void b.offsetWidth; b.classList.add('wackeln');
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(`Hmm, nicht ganz. ${TIPPS[b.dataset.ziel]}`, '🤔');
            return;
          }
          box.querySelector('[data-erfolg]').innerHTML = '';
          const [emoji, name, text] = s.antwort;
          if (s.ziel !== 'client') chat.insertAdjacentHTML('beforeend', `<div class="chat-zeile rechts ich"><div>🔎 Ich frage <strong>${name}</strong>: www.example.de?</div></div>`);
          else chat.insertAdjacentHTML('beforeend', `<div class="chat-zeile rechts ich"><div>🔎 An Client: <strong>93.184.216.34</strong></div></div>`);
          chat.insertAdjacentHTML('beforeend', `<div class="chat-zeile links"><span>${emoji}</span><div><small>${name}</small>${text}</div></div>`);
          i++;
          if (i < SCHRITTE.length) {
            box.querySelector('#dnsFrage').textContent = SCHRITTE[i].frage;
          } else {
            box.querySelector('#dnsFrage').remove();
            box.querySelector('#dnsWahl').remove();
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Perfekt aufgelöst! 🎉</strong> Der Client fragt <em>rekursiv</em> („Gib mir die fertige Antwort!“), du als Resolver fragst <em>iterativ</em> die Server nacheinander. Die Antwort speicherst du im <strong>Cache</strong>, damit die nächste Anfrage blitzschnell geht. ⚡', '😎');
            api.xp(10, chat);
            api.freigeben();
          }
        });
      }
    },

    // 5 ─ Records
    {
      titel: 'DNS-Einträge (Resource Records) 📇',
      sperre: true,
      inhalt: () => `
        <p>Im „Telefonbuch“ einer Domain (der <strong>Zone</strong>) stehen verschiedene Arten von Einträgen:</p>
        <div class="record-liste">
          ${[['A', 'Name → IPv4-Adresse', 'www → 93.184.216.34'],
             ['AAAA', 'Name → IPv6-Adresse', 'www → 2606:2800::1'],
             ['MX', 'Mailserver der Domain', 'example.de → mail.example.de'],
             ['CNAME', 'Alias auf einen anderen Namen', 'shop → www.example.de'],
             ['PTR', 'IP → Name (Reverse Lookup)', '34.216.184.93 → www'],
             ['NS', 'Zuständiger Nameserver', 'example.de → ns1.example.de']]
            .map(([t, b, bsp]) => `<div class="record"><span class="record-typ">${t}</span><div><strong>${b}</strong><small>${bsp}</small></div></div>`).join('')}
        </div>
        <div class="karte zuordnen">
          <p class="feldtitel">🎮 Welcher Eintrag passt?</p>
          <div class="zuordnen-kopf"><span class="hinweis" id="recordStand"></span></div>
          <div class="zuordnen-begriff" id="recordAufgabe" style="font-size:1.15rem"></div>
          <div class="record-knoepfe">
            ${['A', 'AAAA', 'MX', 'CNAME', 'PTR', 'NS'].map(t => `<button type="button" class="miniquiz-btn" data-typ="${t}">${t}</button>`).join('')}
          </div>
          <div id="recordFeedback"></div>
        </div>`,
      init(box, api) {
        const AUFGABEN = mischen([
          { text: '📧 Wohin sollen E-Mails an @example.de geliefert werden?', typ: 'MX' },
          { text: '🔁 Welcher Name gehört zur IP 93.184.216.34?', typ: 'PTR' },
          { text: '🌐 Welche IPv4-Adresse hat www.example.de?', typ: 'A' },
          { text: '🏷️ shop.example.de soll auf dasselbe Ziel zeigen wie www.example.de', typ: 'CNAME' },
          { text: '🆕 Welche IPv6-Adresse hat www.example.de?', typ: 'AAAA' },
          { text: '🏢 Welcher Server ist für die Zone example.de zuständig?', typ: 'NS' }
        ]).slice(0, 5);
        let i = 0;
        let fehler = 0;
        const zeigen = () => {
          box.querySelector('#recordStand').textContent = `Aufgabe ${i + 1} von ${AUFGABEN.length}`;
          const a = box.querySelector('#recordAufgabe');
          a.textContent = AUFGABEN[i].text;
          a.classList.remove('neu'); void a.offsetWidth; a.classList.add('neu');
          box.querySelectorAll('[data-typ]').forEach(b => { b.disabled = false; b.classList.remove('richtig', 'falsch'); });
        };
        box.querySelectorAll('[data-typ]').forEach(b => b.onclick = () => {
          if (b.dataset.typ === AUFGABEN[i].typ) {
            b.classList.add('richtig');
            box.querySelectorAll('[data-typ]').forEach(x => (x.disabled = true));
            box.querySelector('#recordFeedback').innerHTML = Baustein.bot(`✔ Genau, ein <strong>${b.dataset.typ}</strong>-Record!`, '🤩');
            i++;
            setTimeout(() => {
              if (i < AUFGABEN.length) return zeigen();
              box.querySelector('#recordAufgabe').textContent = '🎉 Alle richtig zugeordnet!';
              box.querySelector('#recordStand').textContent = '';
              box.querySelector('#recordFeedback').innerHTML = Baustein.bot(fehler === 0
                ? '<strong>Fehlerfrei!</strong> Du kennst die DNS-Records wie ein Admin. 💪'
                : `<strong>Geschafft!</strong> ${fehler} ${fehler === 1 ? 'Fehlversuch' : 'Fehlversuche'}. Schau dir die Liste oben nochmal an.`, '🥳');
              api.xp(fehler === 0 ? 10 : 5, box.querySelector('#recordAufgabe'));
              api.freigeben();
            }, 1100);
          } else {
            fehler++;
            b.classList.add('falsch');
            b.disabled = true;
          }
        });
        zeigen();
      }
    },

    // 6 ─ Werkzeuge & Fehlersuche
    {
      titel: 'Werkzeuge für die Fehlersuche 🧰',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('Diese Befehle solltest du für die Prüfung (und den Arbeitsalltag!) drauf haben:')}
        <div class="befehle">
          ${[['ipconfig /all', 'zeigt IP, Maske, Gateway, DNS- und DHCP-Server'],
             ['ipconfig /release', 'gibt die DHCP-Adresse zurück'],
             ['ipconfig /renew', 'fordert eine neue DHCP-Adresse an'],
             ['ipconfig /flushdns', 'leert den DNS-Cache des PCs'],
             ['nslookup example.de', 'fragt den DNS-Server direkt nach einem Namen'],
             ['ping example.de', 'testet die Erreichbarkeit (und zeigt die aufgelöste IP)']]
            .map(([b, t]) => `<div class="befehl"><code>${b}</code><small>${t}</small></div>`).join('')}
        </div>
        <p class="hinweis">💡 Bevor Windows einen DNS-Server fragt, schaut es in den eigenen Cache und in die <strong>hosts-Datei</strong> (<code>C:\\Windows\\System32\\drivers\\etc\\hosts</code>).</p>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Die Firmen-Webseite ist auf einen neuen Server mit neuer IP umgezogen. Der DNS-Eintrag ist schon geändert, aber dein PC landet immer noch auf dem alten Server. Was hilft am schnellsten?',
          antworten: ['ipconfig /release', 'ipconfig /flushdns', 'ping 127.0.0.1', 'Den Router neu starten'],
          richtig: 1,
          erklaerung: 'Der PC hat die alte IP noch im <strong>DNS-Cache</strong>. Mit <code>ipconfig /flushdns</code> wird er geleert, und die nächste Anfrage holt die neue Adresse.'
        }, api);
      }
    },

    // 7 ─ Spickzettel
    {
      titel: 'Geschafft! 🏆',
      inhalt: () => `
        ${Baustein.bot('Klasse! Jetzt weißt du, was im Hintergrund passiert, wenn ein PC ins Netz kommt und eine Webseite aufruft. Dein <strong>Spickzettel</strong>:', '🥳')}
        <div class="karte spickzettel">
          <p class="feldtitel">🏨 DHCP</p>
          <ul class="haken-liste">
            <li><strong>D</strong>iscover → <strong>O</strong>ffer → <strong>R</strong>equest → <strong>A</strong>cknowledge</li>
            <li>UDP 67 (Server) / 68 (Client), Discover per Broadcast</li>
            <li>liefert IP, Maske, Gateway, DNS-Server und Lease-Zeit</li>
            <li>Reservierung per MAC, Relay für andere Netze</li>
            <li>169.254.x.x (APIPA) = kein DHCP-Server erreichbar</li>
          </ul>
        </div>
        <div class="karte spickzettel">
          <p class="feldtitel">📒 DNS</p>
          <ul class="haken-liste">
            <li>Port 53, hierarchisch: Root → TLD → Domain</li>
            <li>Client fragt <em>rekursiv</em>, Resolver fragt <em>iterativ</em></li>
            <li>A (IPv4), AAAA (IPv6), MX (Mail), CNAME (Alias), PTR (Reverse), NS (Nameserver)</li>
            <li>Werkzeuge: <code>nslookup</code>, <code>ipconfig /flushdns</code></li>
          </ul>
        </div>`
    }
  ]
});

// ───────────── Lektion: IPv6 ─────────────
const IPv6 = {
  // Text → 8 Zahlen (0–65535), oder null bei ungültiger Eingabe
  zerlegen(text) {
    const t = String(text || '').trim().toLowerCase();
    if (!/^[0-9a-f:]+$/.test(t) || (t.match(/::/g) || []).length > 1) return null;
    const teil = s => (s === '' ? [] : s.split(':'));
    let gruppen;
    if (t.includes('::')) {
      const [links, rechts] = t.split('::');
      const l = teil(links), r = teil(rechts);
      if (l.length + r.length > 7) return null;
      gruppen = [...l, ...Array(8 - l.length - r.length).fill('0'), ...r];
    } else {
      gruppen = t.split(':');
    }
    if (gruppen.length !== 8 || gruppen.some(g => !/^[0-9a-f]{1,4}$/.test(g))) return null;
    return gruppen.map(g => parseInt(g, 16));
  },
  voll: gruppen => gruppen.map(g => g.toString(16).padStart(4, '0')).join(':'),
  // Maximal gekürzte Schreibweise (RFC 5952): längste Nullfolge (mind. 2 Blöcke) wird zu ::
  kurz(gruppen) {
    let besterStart = -1, besteLaenge = 0;
    for (let i = 0; i < 8; i++) {
      if (gruppen[i] !== 0) continue;
      let j = i;
      while (j < 8 && gruppen[j] === 0) j++;
      if (j - i > besteLaenge) { besterStart = i; besteLaenge = j - i; }
      i = j;
    }
    const hex = gruppen.map(g => g.toString(16));
    if (besteLaenge < 2) return hex.join(':');
    return hex.slice(0, besterStart).join(':') + '::' + hex.slice(besterStart + besteLaenge).join(':');
  },
  // Zufallsadresse mit genau einer Nullfolge (2–4 Blöcke) und führenden Nullen in anderen Blöcken
  zufall() {
    const laenge = 2 + Math.floor(Math.random() * 3);
    const start = 1 + Math.floor(Math.random() * (7 - laenge));
    const werte = [0x1, 0xa, 0x12, 0xab, 0x123, 0xdb8, 0x1f4, 0x8, 0x80, 0x800, 0xc0a8, 0xfe, 0x2a];
    return Array.from({ length: 8 }, (_, i) => {
      if (i === 0) return [0x2001, 0x2a02, 0x2003, 0xfd00][Math.floor(Math.random() * 4)];
      if (i >= start && i < start + laenge) return 0;
      return werte[Math.floor(Math.random() * werte.length)];
    });
  }
};

LEKTIONEN.push({
  id: 'ipv6',
  titel: 'IPv6-Adressen',
  emoji: '🧮',
  farbe: 'f-subnetz',
  dauer: 'ca. 15 Minuten',
  ueben: { link: '#/karten', text: '🗂️ Jetzt mit Karteikarten festigen' },
  beschreibung: 'Aufbau, Hexadezimal, Kürzen wie ein Profi, Adresstypen erkennen und wie Geräte ohne DHCP an ihre Adresse kommen.',
  schritte: [
    // 1 ─ Warum IPv6
    {
      titel: 'Die Adressen gehen aus! 😱',
      inhalt: () => `
        ${Baustein.bot('IPv4 hat 32 Bit. Das sind nur rund <strong>4,3 Milliarden</strong> Adressen, weniger als Menschen auf der Erde! Und jeder hat heute Handy, Laptop, Smart-TV … Die freien IPv4-Adressen sind längst <strong>aufgebraucht</strong>.', '😱')}
        <div class="karte">
          <p class="feldtitel">Der Größenvergleich</p>
          <div class="groessen-vergleich">
            <div><span class="label">IPv4</span><span class="formel-klein">2<sup>32</sup></span><b>4.294.967.296</b></div>
            <div class="riesig"><span class="label">IPv6</span><span class="formel-klein">2<sup>128</sup></span><b>340.282.366.920.938.463.463.374.607.431.768.211.456</b><small>≈ 340 Sextillionen (3,4 × 10<sup>38</sup>)</small></div>
          </div>
        </div>
        ${Baustein.bot('Mit IPv6 könnte man jedem Gerät auf der Erde eine eigene öffentliche Adresse geben, milliardenfach! Damit wird <strong>NAT</strong> eigentlich überflüssig. 🎉')}
        <div class="karte">
          <p class="feldtitel">Was sich noch ändert</p>
          <ul class="haken-liste">
            <li>Kein <strong>Broadcast</strong> mehr, stattdessen <strong>Multicast</strong></li>
            <li>Geräte können sich ihre Adresse <strong>selbst konfigurieren</strong> (SLAAC)</li>
            <li>Ein Gerät hat meist <strong>mehrere</strong> IPv6-Adressen gleichzeitig</li>
            <li>Ein vereinfachter Header macht das Routing schneller</li>
          </ul>
        </div>`
    },

    // 2 ─ Aufbau & Hex
    {
      titel: 'Aufbau: 8 Blöcke in Hex 🔢',
      sperre: true,
      inhalt: () => `
        <p>Eine IPv6-Adresse hat <strong>128 Bit</strong>. Sie wird in <strong>8 Blöcke</strong> zu je <strong>16 Bit</strong> geteilt und <strong>hexadezimal</strong> geschrieben, getrennt durch Doppelpunkte:</p>
        <div class="ipv6-bloecke">
          ${['2001', '0db8', '0000', '0000', '0000', 'ff00', '0042', '8329'].map((b, i) => `<span style="--i:${i}">${b}</span>`).join('<b>:</b>')}
        </div>
        <p class="hinweis" style="text-align:center">8 Blöcke × 16 Bit = 128 Bit · 1 Hex-Zeichen = 4 Bit</p>
        ${Baustein.bot('Hexadezimal heißt: 16 Ziffern statt 10. Nach der 9 kommen <strong>a, b, c, d, e, f</strong> für 10 bis 15. Ein Hex-Zeichen steht immer für genau <strong>4 Bit</strong>.')}
        <div class="hex-tabelle">
          ${Array.from({ length: 16 }, (_, i) => `<div><b>${i.toString(16)}</b><small>${i}</small></div>`).join('')}
        </div>
        <div class="karte">
          <p class="feldtitel">🎮 Stell das Hex-Zeichen <span class="ziel-zahl">a</span> mit 4 Bits ein!</p>
          <div class="bitschalter vier">
            ${[8, 4, 2, 1].map(w => `<button type="button" class="bit" data-wert="${w}"><small>${w}</small><span>0</span></button>`).join('')}
          </div>
          <div class="bit-summe">= <span id="hexDez">0</span> → <span class="hex-ergebnis" id="hexZeichen">0</span></div>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        let fertig = false;
        box.querySelectorAll('.bit').forEach(b => b.onclick = () => {
          b.classList.toggle('an');
          b.querySelector('span').textContent = b.classList.contains('an') ? '1' : '0';
          const wert = [...box.querySelectorAll('.bit.an')].reduce((s, x) => s + Number(x.dataset.wert), 0);
          box.querySelector('#hexDez').textContent = wert;
          box.querySelector('#hexZeichen').textContent = wert.toString(16);
          box.querySelector('.bit-summe').classList.toggle('treffer', wert === 10);
          if (wert === 10 && !fertig) {
            fertig = true;
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Richtig!</strong> a = 10 = 8 + 2 = <code>1010</code>. Ein ganzer Block wie <code>0db8</code> sind also 4 × 4 = 16 Bit. 🤓', '🤩');
            api.xp(5, box.querySelector('#hexZeichen'));
            api.freigeben();
          }
        });
      }
    },

    // 3 ─ Kürzen
    {
      titel: 'Kürzen wie ein Profi ✂️',
      sperre: true,
      inhalt: () => `
        <p>Weil IPv6-Adressen so lang sind, darf man sie mit zwei Regeln <strong>kürzen</strong>:</p>
        <div class="regel-karte">
          <span class="nr">1</span>
          <div><strong>Führende Nullen in einem Block weglassen</strong>
          <div class="kuerz-bsp"><code>0db8</code> → <code>db8</code> · <code>0042</code> → <code>42</code> · <code>0000</code> → <code>0</code></div></div>
        </div>
        <div class="regel-karte">
          <span class="nr">2</span>
          <div><strong>Eine Folge von Null-Blöcken durch <code>::</code> ersetzen, aber nur EINMAL!</strong>
          <div class="kuerz-bsp"><code>2001:db8:0:0:0:ff00:42:8329</code><br>→ <code>2001:db8::ff00:42:8329</code></div></div>
        </div>
        ${Baustein.bot('⚠️ <strong>Prüfungsfalle:</strong> <code>::</code> darf nur <em>einmal</em> vorkommen, sonst weiß niemand, wie viele Nullblöcke wo fehlen. Gibt es mehrere Nullfolgen, kürzt man die <strong>längste</strong>. Nullen am Ende eines Blocks (<code>ff00</code>) bleiben natürlich stehen!')}
        <div class="karte">
          <p class="feldtitel">🎮 Kürz-Trainer: Kürze die Adresse maximal!</p>
          <p class="hinweis" id="kuerzStand"></p>
          <div class="ipv6-aufgabe" id="kuerzAufgabe"></div>
          <input type="text" id="kuerzEingabe" placeholder="z. B. 2001:db8::1" spellcheck="false" autocomplete="off" autocapitalize="off" style="font-family:var(--mono)">
          <div class="knoepfe">
            <button type="button" class="btn f-subnetz" id="kuerzPruefen">Prüfen</button>
            <button type="button" class="btn zweit f-subnetz" id="kuerzTipp">💡 Tipp</button>
          </div>
          <div id="kuerzFeedback"></div>
        </div>`,
      init(box, api) {
        const ZIEL = 2;
        let geschafft = 0;
        let gruppen;
        const eingabe = box.querySelector('#kuerzEingabe');
        const neu = () => {
          gruppen = IPv6.zufall();
          box.querySelector('#kuerzStand').textContent = `Aufgabe ${geschafft + 1} von ${ZIEL}`;
          box.querySelector('#kuerzAufgabe').textContent = IPv6.voll(gruppen);
          eingabe.value = '';
          eingabe.classList.remove('richtig', 'falsch');
          eingabe.readOnly = false;
        };
        const pruefen = () => {
          const loesung = IPv6.kurz(gruppen);
          const versuch = eingabe.value.trim().toLowerCase();
          const zerlegt = IPv6.zerlegen(versuch);
          const fb = box.querySelector('#kuerzFeedback');
          if (versuch === loesung) {
            eingabe.classList.add('richtig');
            eingabe.readOnly = true;
            geschafft++;
            fb.innerHTML = Baustein.bot(`<strong>Perfekt gekürzt! ✂️</strong> <code>${loesung}</code>`, '🤩');
            if (geschafft < ZIEL) {
              setTimeout(neu, 1500);
            } else {
              box.querySelector('#kuerzPruefen').remove();
              box.querySelector('#kuerzTipp').remove();
              fb.innerHTML = Baustein.bot('<strong>Zwei von zwei! 🏆</strong> Du kannst IPv6-Adressen kürzen. Das kommt in der Prüfung garantiert dran!', '🥳');
              api.xp(10, eingabe);
              api.freigeben();
            }
            return;
          }
          eingabe.classList.add('falsch');
          setTimeout(() => eingabe.classList.remove('falsch'), 500);
          if (!zerlegt) {
            fb.innerHTML = Baustein.bot('Das ist keine gültige IPv6-Adresse. Hast du vielleicht <code>::</code> zweimal benutzt oder einen Block zu viel? 🤔', '🤔');
          } else if (zerlegt.some((g, i) => g !== gruppen[i])) {
            fb.innerHTML = Baustein.bot('Hoppla, das ist eine <strong>andere</strong> Adresse! Pass auf, dass du keine Ziffern verlierst, besonders Nullen am <em>Ende</em> eines Blocks.', '🤔');
          } else {
            fb.innerHTML = Baustein.bot('Die Adresse stimmt, aber sie ist noch <strong>nicht maximal</strong> gekürzt. Sind alle führenden Nullen weg? Hast du die Nullfolge durch <code>::</code> ersetzt?', '🤏');
          }
        };
        box.querySelector('#kuerzPruefen').onclick = pruefen;
        eingabe.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); pruefen(); } });
        box.querySelector('#kuerzTipp').onclick = () => {
          const ohneNullen = gruppen.map(g => g.toString(16)).join(':');
          box.querySelector('#kuerzFeedback').innerHTML = Baustein.bot(`Nach Regel 1 sieht sie so aus:<br><code>${ohneNullen}</code><br>Jetzt nur noch die Nullfolge durch <code>::</code> ersetzen!`, '💡');
        };
        neu();
      }
    },

    // 4 ─ Adresstypen
    {
      titel: 'Adresstypen erkennen 🔍',
      sperre: true,
      inhalt: () => `
        <p>Am <strong>Anfang</strong> einer IPv6-Adresse (dem Präfix) erkennst du sofort, was für eine Adresse es ist:</p>
        <div class="record-liste">
          ${[['2000::/3', 'Global Unicast', 'weltweit eindeutig, wie öffentliche IPv4-Adressen. Beginnt mit 2 oder 3'],
             ['fe80::/10', 'Link-Local', 'nur im eigenen Netzsegment gültig, hat jedes Interface automatisch'],
             ['fc00::/7', 'Unique Local (ULA)', 'privat, wie 192.168.x.x. In der Praxis fd…'],
             ['ff00::/8', 'Multicast', 'an eine Gruppe, z. B. ff02::1 = alle Knoten'],
             ['::1', 'Loopback', 'der eigene Rechner, wie 127.0.0.1']]
            .map(([p, n, b]) => `<div class="record"><span class="record-typ breit">${p}</span><div><strong>${n}</strong><small style="font-family:var(--schrift)">${b}</small></div></div>`).join('')}
        </div>
        <div class="karte zuordnen">
          <p class="feldtitel">🎮 Was für eine Adresse ist das?</p>
          <div class="zuordnen-kopf"><span class="hinweis" id="typStand"></span></div>
          <div class="zuordnen-begriff mono" id="typAufgabe" style="font-size:1.1rem;font-family:var(--mono)"></div>
          <div class="record-knoepfe zwei">
            ${[['global', '🌍 Global Unicast'], ['link', '🔗 Link-Local'], ['ula', '🏠 Unique Local'], ['multi', '📢 Multicast'], ['loop', '🔁 Loopback']]
              .map(([id, t]) => `<button type="button" class="miniquiz-btn" data-typ="${id}" style="font-family:var(--schrift)">${t}</button>`).join('')}
          </div>
          <div id="typFeedback"></div>
        </div>`,
      init(box, api) {
        const AUFGABEN = mischen([
          ['fe80::1c2b:3aff:fe4d:5e6f', 'link', 'beginnt mit <code>fe80</code> → Link-Local'],
          ['2a02:810d:4b3f::17', 'global', 'beginnt mit <code>2</code> → Global Unicast'],
          ['fd12:3456:789a::1', 'ula', 'beginnt mit <code>fd</code> → Unique Local'],
          ['ff02::1', 'multi', 'beginnt mit <code>ff</code> → Multicast (alle Knoten im Link)'],
          ['::1', 'loop', '<code>::1</code> ist die Loopback-Adresse'],
          ['2001:db8:acad::42', 'global', 'beginnt mit <code>2</code> → Global Unicast (2001:db8 ist übrigens das Dokumentations-Präfix)'],
          ['ff02::2', 'multi', 'beginnt mit <code>ff</code> → Multicast (alle Router)']
        ]).slice(0, 5);
        let i = 0;
        let fehler = 0;
        const zeigen = () => {
          box.querySelector('#typStand').textContent = `Adresse ${i + 1} von ${AUFGABEN.length}`;
          const a = box.querySelector('#typAufgabe');
          a.textContent = AUFGABEN[i][0];
          a.classList.remove('neu'); void a.offsetWidth; a.classList.add('neu');
          box.querySelectorAll('[data-typ]').forEach(b => { b.disabled = false; b.classList.remove('richtig', 'falsch'); });
        };
        box.querySelectorAll('[data-typ]').forEach(b => b.onclick = () => {
          const [, typ, erkl] = AUFGABEN[i];
          if (b.dataset.typ === typ) {
            b.classList.add('richtig');
            box.querySelectorAll('[data-typ]').forEach(x => (x.disabled = true));
            box.querySelector('#typFeedback').innerHTML = Baustein.bot(`✔ Genau: ${erkl}`, '🤩');
            i++;
            setTimeout(() => {
              if (i < AUFGABEN.length) return zeigen();
              box.querySelector('#typAufgabe').textContent = '🎉 Alle erkannt!';
              box.querySelector('#typStand').textContent = '';
              box.querySelector('#typFeedback').innerHTML = Baustein.bot(fehler === 0 ? '<strong>Fehlerfrei!</strong> Du hast einen Adress-Röntgenblick. 🔍' : `<strong>Geschafft!</strong> ${fehler} ${fehler === 1 ? 'Fehlversuch' : 'Fehlversuche'}. Merk dir: 2/3 = global, fe80 = link, fd = ULA, ff = multicast.`, '🥳');
              api.xp(fehler === 0 ? 10 : 5, box.querySelector('#typAufgabe'));
              api.freigeben();
            }, 1300);
          } else {
            fehler++;
            b.classList.add('falsch');
            b.disabled = true;
          }
        });
        zeigen();
      }
    },

    // 5 ─ Präfix / Interface-ID
    {
      titel: 'Netzteil und Interface-ID 🧩',
      sperre: true,
      inhalt: () => `
        <p>Auch bei IPv6 gibt es einen Netzteil und einen Hostteil. Fast immer gilt: <strong>/64</strong> für ein Subnetz, also <strong>64 Bit Netz + 64 Bit Interface-ID</strong>.</p>
        <div class="ipv6-aufteilung">
          <div class="teil provider" style="flex:48"><b>Global Routing Prefix</b><small>48 Bit · vom Provider</small></div>
          <div class="teil subnetz" style="flex:16"><b>Subnetz</b><small>16 Bit</small></div>
          <div class="teil iid" style="flex:64"><b>Interface-ID</b><small>64 Bit · das Gerät</small></div>
        </div>
        <div class="ipv6-beispiel mono">
          <span class="provider">2001:0db8:acad</span>:<span class="subnetz">0001</span>:<span class="iid">0000:0000:0000:0042</span>
        </div>
        ${Baustein.bot('Eine Firma bekommt vom Provider oft ein <strong>/48</strong>. Die 16 Bit dazwischen kann sie frei für eigene Subnetze nutzen, ganz ohne komplizierte Subnetting-Rechnerei! 😌')}
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Eine Firma erhält das Präfix <code>2001:db8:acad::/48</code>. Wie viele <strong>/64</strong>-Subnetze kann sie daraus bilden?',
          antworten: ['256', '4.096', '65.536', '16'],
          richtig: 2,
          erklaerung: '64 − 48 = 16 Bit für Subnetze. 2<sup>16</sup> = <strong>65.536</strong> Subnetze, jedes mit 2<sup>64</sup> Adressen. Platz genug! 😄'
        }, api);
      }
    },

    // 6 ─ SLAAC / NDP
    {
      titel: 'Wie kommt ein Gerät an seine Adresse? 🤖',
      sperre: true,
      inhalt: () => `
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">🪄</span><strong>SLAAC</strong><small>Stateless Address Autoconfiguration: Der Router verkündet das Präfix, das Gerät bastelt sich die Interface-ID selbst</small></div>
          <div class="host-box"><span class="gross-emoji">🏨</span><strong>DHCPv6</strong><small>wie bei IPv4: Ein Server vergibt die Adressen und behält den Überblick</small></div>
        </div>
        <div class="karte">
          <p class="feldtitel">So läuft SLAAC ab</p>
          <div class="signatur-ablauf">
            <div><span class="nr">1</span><span>🔗 Das Gerät erzeugt sich eine <strong>Link-Local-Adresse</strong> (fe80::…)</span></div>
            <div><span class="nr">2</span><span>📢 Es fragt per Multicast: „Gibt es hier einen Router?“ (<strong>Router Solicitation</strong>)</span></div>
            <div><span class="nr">3</span><span>📡 Der Router antwortet mit dem Präfix, z. B. <code>2001:db8:acad:1::/64</code> (<strong>Router Advertisement</strong>)</span></div>
            <div><span class="nr">4</span><span>🧩 Das Gerät hängt seine Interface-ID an: zufällig (Privacy Extensions) oder aus der MAC-Adresse (<strong>EUI-64</strong>)</span></div>
          </div>
        </div>
        ${Baustein.bot('Diese Nachrichten gehören zum <strong>Neighbor Discovery Protocol (NDP)</strong>, das auf ICMPv6 aufbaut. NDP ersetzt bei IPv6 übrigens auch ARP!')}
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Welches Protokoll übernimmt bei IPv6 die Aufgabe von <strong>ARP</strong> (IP-Adresse → MAC-Adresse)?',
          antworten: ['DHCPv6', 'NDP (Neighbor Discovery)', 'DNS', 'SLAAC'],
          richtig: 1,
          erklaerung: 'Mit <strong>Neighbor Solicitation</strong> und <strong>Neighbor Advertisement</strong> (Teil von NDP) findet ein Gerät die MAC-Adresse seines Nachbarn, per Multicast statt Broadcast.'
        }, api);
      }
    },

    // 7 ─ Spickzettel
    {
      titel: 'Geschafft! 🏆',
      inhalt: () => `
        ${Baustein.bot('IPv6 ist jetzt kein Rätsel mehr für dich! Hier ist dein <strong>Spickzettel</strong>:', '🥳')}
        <div class="karte spickzettel">
          <ul class="haken-liste">
            <li><strong>128 Bit</strong> = 8 Blöcke × 16 Bit, hexadezimal</li>
            <li><strong>Kürzen:</strong> führende Nullen weg, <em>einmal</em> <code>::</code> für die längste Nullfolge</li>
            <li><strong>/64</strong> = Standardgröße für ein Subnetz (64 Bit Interface-ID)</li>
            <li><strong>SLAAC</strong> (Router Advertisement) oder <strong>DHCPv6</strong></li>
            <li><strong>NDP</strong> ersetzt ARP, Multicast ersetzt Broadcast</li>
          </ul>
        </div>
        <div class="karte spickzettel" style="padding:10px">
          <table class="ergebnis-tabelle">
            <tr><th>Präfix</th><th>Typ</th><th>IPv4-Gegenstück</th></tr>
            <tr><td><code>2000::/3</code></td><td>Global Unicast</td><td>öffentliche IP</td></tr>
            <tr><td><code>fe80::/10</code></td><td>Link-Local</td><td>≈ 169.254.x.x</td></tr>
            <tr><td><code>fc00::/7</code></td><td>Unique Local</td><td>≈ 192.168.x.x</td></tr>
            <tr><td><code>ff00::/8</code></td><td>Multicast</td><td>224.0.0.0/4</td></tr>
            <tr><td><code>::1</code></td><td>Loopback</td><td>127.0.0.1</td></tr>
          </table>
        </div>`
    }
  ]
});

// ───────────── Lektion: VLAN & Switching ─────────────
LEKTIONEN.push({
  id: 'vlan',
  titel: 'VLAN & Switching',
  emoji: '🏷️',
  farbe: 'f-karten',
  dauer: 'ca. 15 Minuten',
  ueben: { link: '#/quiz', text: '❓ Jetzt im Quiz testen' },
  beschreibung: 'Wie ein Switch lernt, wohin Frames gehören, wie VLANs Netze trennen und was Trunks, Tags und STP sind. Du spielst selbst den Switch!',
  schritte: [
    // 1 ─ Hub vs Switch
    {
      titel: 'Hub oder Switch? 📡🔀',
      inhalt: () => `
        ${Baustein.bot('Früher hat man Rechner mit einem <strong>Hub</strong> verbunden. Der ist ziemlich dumm: Er schickt <em>alles an alle</em>. Ein <strong>Switch</strong> ist schlauer, er merkt sich, wer wo hängt! 🧠')}
        <div class="vergleich">
          <div class="host-box"><span class="gross-emoji">📡</span><strong>Hub (Schicht 1)</strong><small>verteilt jedes Signal an <em>alle</em> Ports<br>→ Kollisionen, langsam, unsicher</small></div>
          <div class="netz-box"><span class="gross-emoji">🔀</span><strong>Switch (Schicht 2)</strong><small>liest die <strong>Ziel-MAC</strong> und schickt den Frame nur an den richtigen Port</small></div>
        </div>
        <div class="karte">
          <p class="feldtitel">Wie der Switch das macht</p>
          <p>Der Switch führt eine <strong>MAC-Adresstabelle</strong> (auch CAM-Tabelle genannt): <em>„MAC-Adresse X hängt an Port Y“</em>. Er lernt sie ganz automatisch, indem er sich bei jedem eingehenden Frame die <strong>Quell-MAC</strong> merkt.</p>
          <p style="margin:0">Kennt er die Ziel-MAC noch nicht, schickt er den Frame an alle Ports außer dem Eingangsport. Das heißt <strong>Flooding</strong> 🌊.</p>
        </div>`
    },

    // 2 ─ Switch-Simulator
    {
      titel: 'Du bist der Switch! 🎮',
      sperre: true,
      inhalt: () => `
        <p>Vier PCs hängen an deinem Switch. Für jeden Frame entscheidest <strong>du</strong>, wohin er geht. Achte auf deine MAC-Tabelle!</p>
        <div class="switch-sim">
          <div class="switch-pcs">
            ${[['A', 1, 'aa'], ['B', 2, 'bb'], ['C', 3, 'cc'], ['D', 4, 'dd']].map(([n, p, m]) =>
              `<div class="sw-pc" data-port="${p}"><span>💻</span><b>PC ${n}</b><small>…:${m}</small><i>Port ${p}</i></div>`).join('')}
          </div>
          <div class="switch-box">🔀 Switch</div>
          <div class="mac-tabelle">
            <p class="feldtitel">MAC-Tabelle</p>
            <table class="ergebnis-tabelle kompakt"><tr><th>MAC</th><th>Port</th></tr><tbody id="macTabelle"><tr><td colspan="2" class="hinweis">(leer)</td></tr></tbody></table>
          </div>
        </div>
        <div class="karte">
          <p class="hinweis" id="frameStand" style="margin:0"></p>
          <div class="frame-anzeige" id="frameAnzeige"></div>
          <p class="feldtitel">Wohin leitest du den Frame?</p>
          <div class="sw-wahl">
            ${[1, 2, 3, 4].map(p => `<button type="button" data-ziel="${p}">➜ Nur Port ${p}</button>`).join('')}
            <button type="button" data-ziel="flood" class="flood">🌊 Flooding (an alle außer Eingang)</button>
          </div>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        const PC = { A: { port: 1, mac: 'aa' }, B: { port: 2, mac: 'bb' }, C: { port: 3, mac: 'cc' }, D: { port: 4, mac: 'dd' } };
        const FRAMES = [
          { von: 'A', an: 'C', tipp: 'Die Tabelle ist noch leer. Kennt der Switch PC C schon?' },
          { von: 'C', an: 'A', tipp: 'Schau in die Tabelle: PC A hat sich beim ersten Frame „verraten“!' },
          { von: 'B', an: 'alle', tipp: 'Ziel ist ff:ff:ff:ff:ff:ff, ein Broadcast. Der geht immer an alle!' },
          { von: 'A', an: 'C', tipp: 'Inzwischen hat sich PC C auch gemeldet. Schau in die Tabelle!' }
        ];
        const tabelle = new Map();
        let i = 0;
        let fehler = 0;
        const tabelleZeichnen = (neu) => {
          box.querySelector('#macTabelle').innerHTML = tabelle.size
            ? [...tabelle].map(([mac, port]) => `<tr class="${mac === neu ? 'neu-zeile' : ''}"><td><code>…:${mac}</code></td><td><strong>${port}</strong></td></tr>`).join('')
            : '<tr><td colspan="2" class="hinweis">(leer)</td></tr>';
        };
        const zeigen = () => {
          const f = FRAMES[i];
          box.querySelector('#frameStand').textContent = `Frame ${i + 1} von ${FRAMES.length}`;
          const ziel = f.an === 'alle' ? 'ff:ff:ff:ff:ff:ff (Broadcast)' : `…:${PC[f.an].mac} (PC ${f.an})`;
          box.querySelector('#frameAnzeige').innerHTML = `
            <div class="frame-zeile"><span>📥 kommt an Port</span><b>${PC[f.von].port}</b></div>
            <div class="frame-zeile"><span>Quell-MAC</span><b>…:${PC[f.von].mac} (PC ${f.von})</b></div>
            <div class="frame-zeile"><span>Ziel-MAC</span><b>${ziel}</b></div>`;
          box.querySelectorAll('.sw-pc').forEach(p => p.classList.remove('sendet', 'empfaengt'));
          box.querySelector(`.sw-pc[data-port="${PC[f.von].port}"]`).classList.add('sendet');
          box.querySelectorAll('.sw-wahl button').forEach(b => { b.disabled = false; b.classList.remove('falsch'); });
          // Lernen: Quell-MAC eintragen
          const neu = !tabelle.has(PC[f.von].mac);
          tabelle.set(PC[f.von].mac, PC[f.von].port);
          tabelleZeichnen(neu ? PC[f.von].mac : null);
        };
        box.querySelectorAll('.sw-wahl button').forEach(b => b.onclick = () => {
          const f = FRAMES[i];
          const zielPort = f.an !== 'alle' && tabelle.has(PC[f.an].mac) ? tabelle.get(PC[f.an].mac) : 'flood';
          if (String(zielPort) !== b.dataset.ziel) {
            fehler++;
            b.classList.add('falsch');
            b.disabled = true;
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(`Nicht ganz! ${f.tipp}`, '🤔');
            return;
          }
          box.querySelectorAll('.sw-wahl button').forEach(x => (x.disabled = true));
          box.querySelectorAll('.sw-pc').forEach(p => {
            const port = Number(p.dataset.port);
            if (zielPort === 'flood' ? port !== PC[f.von].port : port === zielPort) p.classList.add('empfaengt');
          });
          const erkl = zielPort === 'flood'
            ? (f.an === 'alle' ? 'Broadcasts gehen immer an alle Ports, außer den, von dem sie kamen.' : `PC ${f.an} steht noch nicht in der Tabelle, also <strong>Flooding</strong>. Aber der Switch hat gelernt: <code>…:${PC[f.von].mac}</code> hängt an Port ${PC[f.von].port}!`)
            : `PC ${f.an} steht in der Tabelle an Port ${zielPort}, also geht der Frame <strong>nur</strong> dorthin. Die anderen PCs bekommen nichts mit. 🤫`;
          box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(`✔ ${erkl}`, '🤩');
          i++;
          setTimeout(() => {
            if (i < FRAMES.length) return zeigen();
            box.querySelector('#frameStand').textContent = 'Alle Frames zugestellt!';
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(`<strong>${fehler === 0 ? 'Fehlerfrei geswitcht! 🏆' : 'Alle Frames zugestellt! 🎉'}</strong> So lernt ein Switch: Quell-MAC merken, bekannte Ziele gezielt zustellen, unbekannte und Broadcasts fluten.`, '🥳');
            api.xp(fehler === 0 ? 10 : 5, box.querySelector('.switch-box'));
            api.freigeben();
          }, 1800);
        });
        zeigen();
      }
    },

    // 3 ─ Domänen
    {
      titel: 'Kollisions- und Broadcast-Domänen 💥📢',
      sperre: true,
      inhalt: () => `
        <div class="karte">
          <p><strong>💥 Kollisionsdomäne:</strong> Bereich, in dem sich gleichzeitig gesendete Signale stören können.<br>
          → Beim <strong>Hub</strong> ist alles <em>eine</em> Kollisionsdomäne. Beim <strong>Switch</strong> ist <em>jeder Port</em> eine eigene.</p>
          <p style="margin:0"><strong>📢 Broadcast-Domäne:</strong> Bereich, den ein Broadcast erreicht.<br>
          → Ein Switch leitet Broadcasts überall hin, ist also <em>eine</em> Broadcast-Domäne. Erst ein <strong>Router</strong> (oder ein <strong>VLAN</strong>!) trennt sie.</p>
        </div>
        <table class="ergebnis-tabelle kompakt karte" style="padding:6px">
          <tr><th>Gerät</th><th>trennt Kollisions­domänen?</th><th>trennt Broadcast­domänen?</th></tr>
          <tr><td>📡 Hub</td><td>❌</td><td>❌</td></tr>
          <tr><td>🔀 Switch</td><td>✅</td><td>❌ (nur mit VLANs)</td></tr>
          <tr><td>🧭 Router</td><td>✅</td><td>✅</td></tr>
        </table>
        ${Baustein.bot('Warum ist das wichtig? In einem großen Netz mit hunderten Geräten erzeugen Broadcasts (ARP, DHCP …) viel Lärm. 📢 Deshalb teilt man große Netze auf, und dafür gibt es VLANs!')}
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Ein Switch mit 24 Ports, keine VLANs. Wie viele Kollisions- und Broadcast-Domänen gibt es?',
          antworten: ['1 und 1', '24 und 24', '24 und 1', '1 und 24'],
          richtig: 2,
          erklaerung: 'Jeder Switch-Port ist eine eigene <strong>Kollisionsdomäne (24)</strong>, aber ohne VLANs bilden alle zusammen <strong>eine Broadcast-Domäne</strong>.'
        }, api);
      }
    },

    // 4 ─ VLANs
    {
      titel: 'VLANs: virtuelle Netze 🏷️',
      sperre: true,
      inhalt: () => `
        <p>Ein <strong>VLAN</strong> (Virtual LAN) teilt einen physischen Switch in mehrere <strong>logische Netze</strong>. Geräte in verschiedenen VLANs können sich nicht direkt erreichen, als hingen sie an getrennten Switches.</p>
        <div class="vlan-legende">
          <span class="vlan10">VLAN 10 · Verwaltung</span><span class="vlan20">VLAN 20 · Produktion</span>
        </div>
        <div class="karte">
          <p class="feldtitel">🎮 PC an <span class="ziel-zahl">Port 2</span> sendet einen Broadcast. Tippe alle Ports an, die ihn empfangen!</p>
          <div class="vlan-switch" id="vlanSwitch">
            ${[10, 10, 20, 20, 10, 20, 10, 20].map((v, i) => `
              <button type="button" class="vlan-port vlan${v} ${i === 1 ? 'quelle' : ''}" data-port="${i + 1}" ${i === 1 ? 'disabled' : ''}>
                <span class="port-nr">${i + 1}</span><small>${i === 1 ? '📢' : 'VLAN ' + v}</small>
              </button>`).join('')}
          </div>
          <button type="button" class="btn breit f-karten" id="vlanPruefen" style="margin-top:12px">Prüfen</button>
          <div data-erfolg></div>
        </div>
        <div class="karte">
          <p class="feldtitel">Vorteile von VLANs</p>
          <ul class="haken-liste">
            <li><strong>Sicherheit:</strong> Abteilungen oder das Gäste-WLAN sind voneinander getrennt</li>
            <li><strong>Weniger Broadcast-Last:</strong> kleinere Broadcast-Domänen</li>
            <li><strong>Flexibel:</strong> Die Zuordnung hängt nicht davon ab, wo jemand sitzt</li>
            <li><strong>Kosten:</strong> Ein Switch statt mehrerer Switches</li>
          </ul>
        </div>`,
      init(box, api) {
        const RICHTIG = [1, 5, 7];
        const gewaehlt = new Set();
        box.querySelectorAll('.vlan-port:not(.quelle)').forEach(b => b.onclick = () => {
          const p = Number(b.dataset.port);
          gewaehlt.has(p) ? gewaehlt.delete(p) : gewaehlt.add(p);
          b.classList.toggle('gewaehlt');
        });
        box.querySelector('#vlanPruefen').onclick = e => {
          const ok = gewaehlt.size === RICHTIG.length && RICHTIG.every(p => gewaehlt.has(p));
          if (!ok) {
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('Noch nicht ganz! Port 2 gehört zu <strong>VLAN 10</strong>. Ein Broadcast bleibt immer in seinem VLAN. 🤔', '🤔');
            return;
          }
          e.target.remove();
          box.querySelectorAll('.vlan-port').forEach(b => { b.disabled = true; if (RICHTIG.includes(Number(b.dataset.port))) b.classList.add('empfaengt'); });
          box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Genau! 🎯</strong> Ports 1, 5 und 7 sind in VLAN 10. Die Produktion (VLAN 20) bekommt vom Broadcast nichts mit, obwohl alles am selben Switch hängt.', '🤩');
          api.xp(10, box.querySelector('#vlanSwitch'));
          api.freigeben();
        };
      }
    },

    // 5 ─ Access, Trunk, Tagging
    {
      titel: 'Access, Trunk und das 802.1Q-Tag 🏷️',
      sperre: true,
      inhalt: () => `
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">💻</span><strong>Access-Port</strong><small>gehört zu <strong>einem</strong> VLAN, Frames sind <strong>untagged</strong>. Hier hängen PCs und Drucker.</small></div>
          <div class="host-box"><span class="gross-emoji">🔗</span><strong>Trunk-Port</strong><small>transportiert <strong>mehrere</strong> VLANs, Frames sind <strong>tagged</strong>. Für Switch ↔ Switch oder Switch ↔ Router.</small></div>
        </div>
        ${Baustein.bot('Wenn mehrere VLANs über <em>eine</em> Leitung laufen, woher weiß der andere Switch, zu welchem VLAN ein Frame gehört? Ganz einfach: Er bekommt ein <strong>Etikett</strong> 🏷️, den VLAN-Tag nach <strong>IEEE 802.1Q</strong>!')}
        <div class="karte">
          <p class="feldtitel">🎮 Schick einen Frame aus VLAN 20 über den Trunk!</p>
          <div class="trunk-szene">
            <div class="trunk-sw">🔀<small>Switch 1</small></div>
            <div class="trunk-leitung"><span>Trunk</span></div>
            <div class="trunk-sw">🔀<small>Switch 2</small></div>
          </div>
          <div class="frame-aufbau" id="frameAufbau"></div>
          <p class="hinweis" id="trunkText" style="text-align:center"></p>
          <button type="button" class="btn breit f-karten" id="trunkWeiter">② Über den Trunk schicken ▶</button>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        const teil = (k, t, s = '') => `<span class="fteil ${k}">${t}${s ? `<small>${s}</small>` : ''}</span>`;
        const OHNE = teil('mac', 'Ziel-MAC') + teil('mac', 'Quell-MAC') + teil('typ', 'Typ') + teil('daten', 'Daten') + teil('fcs', 'FCS');
        const MIT = teil('mac', 'Ziel-MAC') + teil('mac', 'Quell-MAC') + teil('tag neu', '🏷️ 802.1Q', 'VLAN 20') + teil('typ', 'Typ') + teil('daten', 'Daten') + teil('fcs', 'FCS');
        const STUFEN = [
          [OHNE, '① Ein PC in VLAN 20 schickt einen ganz normalen Ethernet-Frame (untagged) an den Access-Port.', '② Über den Trunk schicken ▶'],
          [MIT, 'Switch 1 fügt den <strong>4-Byte-Tag</strong> mit der <strong>VLAN-ID 20</strong> ein (12 Bit → bis zu 4094 VLANs).', '③ Bei Switch 2 ankommen ▶'],
          [OHNE, 'Switch 2 liest den Tag, entfernt ihn und gibt den Frame nur an Access-Ports von <strong>VLAN 20</strong> weiter. ✅', null]
        ];
        let n = 0;
        const zeichnen = () => {
          box.querySelector('#frameAufbau').innerHTML = STUFEN[n][0];
          box.querySelector('#trunkText').innerHTML = STUFEN[n][1];
          box.querySelector('.trunk-leitung').classList.toggle('aktiv', n === 1);
        };
        zeichnen();
        box.querySelector('#trunkWeiter').onclick = e => {
          n++;
          zeichnen();
          if (STUFEN[n][2]) {
            e.target.textContent = STUFEN[n][2];
          } else {
            e.target.remove();
            Baustein.miniQuiz(box, {
              frage: 'Wie muss der Port konfiguriert werden, der Switch 1 mit Switch 2 verbindet, wenn VLAN 10 <em>und</em> VLAN 20 darüber laufen?',
              antworten: ['Access-Port in VLAN 10', 'Trunk-Port (tagged)', 'Access-Port in VLAN 20', 'Gar nicht, das geht nicht'],
              richtig: 1,
              erklaerung: 'Mehrere VLANs über eine Leitung → <strong>Trunk</strong> mit 802.1Q-Tags. Ein VLAN kann als <em>Native VLAN</em> untagged laufen.'
            }, api);
          }
        };
      }
    },

    // 6 ─ Inter-VLAN-Routing
    {
      titel: 'Wenn VLANs miteinander reden müssen 🧭',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('VLANs sind getrennt, aber was, wenn die Verwaltung doch auf den Drucker der Produktion zugreifen muss? 🖨️ Dann braucht es ein Gerät auf <strong>Schicht 3</strong>, das zwischen den VLANs <strong>routet</strong>.')}
        <div class="karte">
          <p class="feldtitel">Jedes VLAN = eigenes IP-Subnetz</p>
          <table class="ergebnis-tabelle kompakt">
            <tr><th>VLAN</th><th>Netz</th><th>Gateway</th></tr>
            <tr><td><span class="vlan-chip vlan10">10</span></td><td><code>192.168.10.0/24</code></td><td><code>.10.1</code></td></tr>
            <tr><td><span class="vlan-chip vlan20">20</span></td><td><code>192.168.20.0/24</code></td><td><code>.20.1</code></td></tr>
          </table>
        </div>
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">🧭</span><strong>Router-on-a-Stick</strong><small>ein Router mit <strong>einem</strong> Trunk-Kabel und einem <strong>Subinterface</strong> pro VLAN</small></div>
          <div class="host-box"><span class="gross-emoji">🔀</span><strong>Layer-3-Switch</strong><small>Switch mit eingebautem Routing über virtuelle Interfaces (<strong>SVI</strong>), sehr schnell</small></div>
        </div>
        <p class="hinweis">💡 Auf dem Router bzw. Layer-3-Switch kann man mit <strong>ACLs</strong> genau festlegen, wer welches VLAN erreichen darf.</p>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'PC 1 (VLAN 10, 192.168.10.5) kann PC 2 (VLAN 20, 192.168.20.5) nicht anpingen. Beide Kabel sind in Ordnung. Was fehlt?',
          antworten: ['Ein zweiter Switch', 'Ein Hub zwischen den VLANs', 'Routing zwischen den VLANs', 'Ein DNS-Server'],
          richtig: 2,
          erklaerung: 'Verschiedene VLANs sind verschiedene IP-Netze. Ohne <strong>Inter-VLAN-Routing</strong> (Router oder Layer-3-Switch) gibt es keine Verbindung, und das ist ja auch so gewollt! 😉'
        }, api);
      }
    },

    // 7 ─ STP & mehr
    {
      titel: 'Schleifen, STP und Co. 🔁',
      sperre: true,
      inhalt: () => `
        <p>Für Ausfallsicherheit verbindet man Switches oft <strong>redundant</strong>, also mit mehreren Wegen. Aber Vorsicht: Auf Schicht 2 entsteht dadurch eine <strong>Schleife</strong>!</p>
        <svg class="schleife-svg" viewBox="0 0 300 160" role="img" aria-label="Drei Switches im Dreieck verbunden, ein Broadcast kreist endlos">
          <path id="schleifenPfad" d="M150 28 L45 128 L255 128 Z" class="sl-linie"/>
          <text font-size="20" text-anchor="middle" dominant-baseline="central">📢
            <animateMotion dur="2.4s" repeatCount="indefinite"><mpath href="#schleifenPfad"/></animateMotion>
          </text>
          <text font-size="20" text-anchor="middle" dominant-baseline="central">📢
            <animateMotion dur="2.4s" begin="-1.2s" repeatCount="indefinite"><mpath href="#schleifenPfad"/></animateMotion>
          </text>
          ${[[150, 28, 'SW1'], [45, 128, 'SW2'], [255, 128, 'SW3']].map(([x, y, t]) => `
            <g transform="translate(${x} ${y})"><rect x="-34" y="-15" width="68" height="30" rx="9" class="sl-box"/><text text-anchor="middle" dominant-baseline="central" class="sl-text">🔀 ${t}</text></g>`).join('')}
          <text x="150" y="95" text-anchor="middle" class="sl-warnung">♾️ Schleife!</text>
        </svg>
        ${Baustein.bot('Ein Broadcast würde endlos im Kreis laufen und sich dabei vervielfachen. Das ist ein <strong>Broadcast-Sturm</strong> 🌪️, der das Netz in Sekunden lahmlegt!', '😱')}
        <div class="karte">
          <p><strong>🌳 Spanning Tree Protocol (STP, IEEE 802.1D / RSTP 802.1w):</strong> Die Switches einigen sich auf eine baumförmige Struktur und <strong>blockieren</strong> redundante Ports. Fällt eine Leitung aus, wird der blockierte Port automatisch wieder aktiviert.</p>
          <p class="feldtitel">Weitere Begriffe für die Prüfung</p>
          <ul class="haken-liste">
            <li><strong>Link Aggregation (LACP):</strong> mehrere Kabel zu einer schnelleren, logischen Verbindung bündeln</li>
            <li><strong>PoE (802.3af/at/bt):</strong> Strom über das Netzwerkkabel, z. B. für Telefone, Access Points, Kameras</li>
            <li><strong>Port Security:</strong> nur bestimmte MAC-Adressen an einem Port erlauben</li>
            <li><strong>802.1X:</strong> Zugang erst nach Anmeldung (z. B. über RADIUS)</li>
          </ul>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Ein Kollege hat zwei Switches „zur Sicherheit“ mit zwei Kabeln verbunden. STP ist deaktiviert. Was passiert?',
          antworten: ['Doppelte Geschwindigkeit', 'Nichts, das ist nur Redundanz', 'Ein Broadcast-Sturm legt das Netz lahm', 'Die VLANs werden getrennt'],
          richtig: 2,
          erklaerung: 'Ohne STP entsteht eine Schleife und damit ein <strong>Broadcast-Sturm</strong>. Für mehr Geschwindigkeit müsste man die Kabel per <strong>LACP</strong> bündeln.'
        }, api);
      }
    },

    // 8 ─ Spickzettel
    {
      titel: 'Geschafft! 🏆',
      inhalt: () => `
        ${Baustein.bot('Du switchst jetzt wie ein Profi! 🔀 Dein <strong>Spickzettel</strong>:', '🥳')}
        <div class="karte spickzettel">
          <ul class="haken-liste">
            <li><strong>Switch</strong> = Schicht 2, lernt <strong>Quell-MACs</strong> in die MAC-Tabelle</li>
            <li>Unbekanntes Ziel oder Broadcast → <strong>Flooding</strong></li>
            <li>Switch: jeder Port eigene <strong>Kollisionsdomäne</strong>, aber eine <strong>Broadcastdomäne</strong></li>
            <li><strong>VLAN</strong> = logische Trennung, eigene Broadcastdomäne, eigenes IP-Subnetz</li>
            <li><strong>Access-Port</strong>: 1 VLAN, untagged · <strong>Trunk</strong>: mehrere VLANs, tagged</li>
            <li><strong>IEEE 802.1Q</strong>: 4-Byte-Tag, 12-Bit-VLAN-ID (1–4094)</li>
            <li>Zwischen VLANs: <strong>Router-on-a-Stick</strong> oder <strong>Layer-3-Switch</strong></li>
            <li><strong>STP</strong> verhindert Schleifen, <strong>LACP</strong> bündelt Leitungen</li>
          </ul>
        </div>`
    }
  ]
});

// ───────────── Lektion: Firewall & VPN ─────────────
LEKTIONEN.push({
  id: 'firewall-vpn',
  titel: 'Firewall & VPN',
  emoji: '🛡️',
  farbe: 'f-quiz',
  dauer: 'ca. 15 Minuten',
  ueben: { link: '#/quiz', text: '❓ Jetzt im Quiz testen' },
  beschreibung: 'Firewall-Regeln wie ein Türsteher prüfen, eine DMZ planen und verstehen, wie ein VPN-Tunnel funktioniert.',
  schritte: [
    // 1 ─ Einstieg
    {
      titel: 'Die Firewall: der Türsteher 🕴️',
      inhalt: () => `
        ${Baustein.bot('Eine <strong>Firewall</strong> ist wie ein Türsteher vor einem Club: Sie prüft jedes Paket und entscheidet nach festen <strong>Regeln</strong>, wer rein darf und wer draußen bleibt. 🚪')}
        <div class="karte">
          <p class="feldtitel">Firewall-Arten (von einfach bis schlau)</p>
          <div class="fw-arten">
            <div><span class="fw-stufe">L3/4</span><div><strong>Paketfilter</strong><small>prüft jedes Paket einzeln nach IP, Port und Protokoll, ohne Zusammenhang</small></div></div>
            <div><span class="fw-stufe">L3/4</span><div><strong>Stateful Packet Inspection (SPI)</strong><small>merkt sich Verbindungen in einer Zustandstabelle und lässt passende Antworten automatisch durch</small></div></div>
            <div><span class="fw-stufe">L7</span><div><strong>Application Level Gateway / Proxy</strong><small>versteht das Protokoll (z. B. HTTP) und prüft auch den Inhalt</small></div></div>
            <div><span class="fw-stufe">L3–7</span><div><strong>Next-Generation Firewall (NGFW)</strong><small>alles davon + Erkennung von Anwendungen, IDS/IPS, Virenscan</small></div></div>
          </div>
        </div>
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">👀</span><strong>IDS</strong><small>Intrusion <strong>Detection</strong>: erkennt Angriffe und <em>meldet</em> sie</small></div>
          <div class="host-box"><span class="gross-emoji">🛑</span><strong>IPS</strong><small>Intrusion <strong>Prevention</strong>: erkennt Angriffe und <em>blockiert</em> sie</small></div>
        </div>`
    },

    // 2 ─ Regel-Spiel
    {
      titel: 'Du bist die Firewall! 🎮',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('Die Regeln werden <strong>von oben nach unten</strong> geprüft. Die <strong>erste passende Regel</strong> gewinnt (First Match). Und ganz unten steht immer: <em>Alles andere verboten</em> (Default Deny). 🔒')}
        <div class="fw-regeln" id="fwRegeln">
          ${[['1', '🌍 Internet', '🌐 Webserver', 'TCP 443', '✅'],
             ['2', '🌍 Internet', '📧 Mailserver', 'TCP 25', '✅'],
             ['3', '👩‍💻 Admin-PC 192.168.1.10', 'alle', 'TCP 22', '✅'],
             ['4', 'alle', 'alle', 'alle', '❌']]
            .map(([n, q, z, p, a]) => `<div class="fw-regel" data-regel="${n}"><span class="nr">${n}</span><span>${q}</span><span>→ ${z}</span><span class="mono">${p}</span><span class="aktion">${a}</span></div>`).join('')}
        </div>
        <div class="karte">
          <p class="hinweis" id="fwStand" style="margin:0"></p>
          <div class="fw-paket" id="fwPaket"></div>
          <div class="knoepfe">
            <button type="button" class="btn ok gross" data-entscheidung="ja">✅ Erlauben</button>
            <button type="button" class="btn nok gross" data-entscheidung="nein">❌ Blockieren</button>
          </div>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        const PAKETE = [
          { q: '🌍 Internet', z: '🌐 Webserver', p: 'TCP 443', regel: 1, erlaubt: true, text: 'HTTPS zum Webserver passt auf Regel 1.' },
          { q: '🌍 Internet', z: '🌐 Webserver', p: 'TCP 22', regel: 4, erlaubt: false, text: 'SSH aus dem Internet? Regel 3 gilt nur für den Admin-PC, also greift Regel 4: blockiert! 🛑' },
          { q: '👩‍💻 192.168.1.10', z: '🌐 Webserver', p: 'TCP 22', regel: 3, erlaubt: true, text: 'Das ist der Admin-PC mit SSH, also passt Regel 3.' },
          { q: '🌍 Internet', z: '📧 Mailserver', p: 'TCP 25', regel: 2, erlaubt: true, text: 'SMTP zum Mailserver passt auf Regel 2.' },
          { q: '💻 192.168.1.55', z: '📧 Mailserver', p: 'TCP 22', regel: 4, erlaubt: false, text: 'SSH, aber nicht vom Admin-PC (.10)! Also greift Regel 4.' },
          { q: '🌍 Internet', z: '🗄️ Datenbank', p: 'TCP 3306', regel: 4, erlaubt: false, text: 'MySQL aus dem Internet? Auf keinen Fall! Default Deny (Regel 4).' }
        ];
        let i = 0;
        let fehler = 0;
        const zeigen = () => {
          const p = PAKETE[i];
          box.querySelector('#fwStand').textContent = `Paket ${i + 1} von ${PAKETE.length}`;
          box.querySelector('#fwPaket').innerHTML = `
            <div class="paket-karte neu"><span class="paket-icon">📦</span>
              <div><div><small>von</small> <b>${p.q}</b></div><div><small>an</small> <b>${p.z}</b></div><div><small>Port</small> <b class="mono">${p.p}</b></div></div>
            </div>`;
          box.querySelectorAll('.fw-regel').forEach(r => r.classList.remove('treffer', 'geprueft'));
          box.querySelectorAll('[data-entscheidung]').forEach(b => (b.disabled = false));
        };
        box.querySelectorAll('[data-entscheidung]').forEach(b => b.onclick = () => {
          const p = PAKETE[i];
          const ok = (b.dataset.entscheidung === 'ja') === p.erlaubt;
          if (!ok) {
            fehler++;
            b.classList.remove('wackeln'); void b.offsetWidth; b.classList.add('wackeln');
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('Nicht ganz! Geh die Regeln nochmal <strong>von oben nach unten</strong> durch. Passen Quelle, Ziel <em>und</em> Port? 🤔', '🤔');
            return;
          }
          box.querySelectorAll('[data-entscheidung]').forEach(x => (x.disabled = true));
          box.querySelectorAll('.fw-regel').forEach(r => {
            const n = Number(r.dataset.regel);
            if (n < p.regel) r.classList.add('geprueft');
            if (n === p.regel) r.classList.add('treffer');
          });
          box.querySelector('#fwPaket .paket-karte').classList.add(p.erlaubt ? 'durch' : 'geblockt');
          box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(`✔ ${p.text}`, p.erlaubt ? '🤩' : '😎');
          i++;
          setTimeout(() => {
            if (i < PAKETE.length) return zeigen();
            box.querySelector('#fwStand').textContent = 'Alle Pakete geprüft!';
            box.querySelector('#fwPaket').innerHTML = '';
            box.querySelectorAll('[data-entscheidung]').forEach(x => x.remove());
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(`<strong>${fehler === 0 ? 'Perfekter Türsteher! 🏆' : 'Schicht beendet! 🎉'}</strong> Merk dir: <strong>First Match</strong> und <strong>Default Deny</strong>. Und die Reihenfolge der Regeln ist entscheidend!`, '🥳');
            api.xp(fehler === 0 ? 10 : 5, box.querySelector('#fwRegeln'));
            api.freigeben();
          }, 1900);
        });
        zeigen();
      }
    },

    // 3 ─ Stateful
    {
      titel: 'Stateful: die Firewall mit Gedächtnis 🧠',
      sperre: true,
      inhalt: () => `
        <p>Wenn du eine Webseite aufrufst, gehst du <strong>raus</strong> (zu Port 443), und die <strong>Antwort</strong> kommt von außen zurück. Muss man dafür eine extra Regel „von außen rein“ erlauben?</p>
        <div class="vergleich">
          <div class="host-box"><span class="gross-emoji">🐟</span><strong>Paketfilter (stateless)</strong><small>vergisst sofort alles, braucht eine Regel für <em>beide</em> Richtungen. Das ist unsicher, weil die Tür dann ständig offen steht.</small></div>
          <div class="netz-box"><span class="gross-emoji">🐘</span><strong>Stateful (SPI)</strong><small>merkt sich die Verbindung in der <strong>Zustandstabelle</strong> und lässt nur die <em>passende</em> Antwort rein</small></div>
        </div>
        <div class="karte">
          <p class="feldtitel">Zustandstabelle (State Table)</p>
          <table class="ergebnis-tabelle kompakt">
            <tr><th>Quelle</th><th>Ziel</th><th>Status</th></tr>
            <tr><td><code>192.168.1.20:51515</code></td><td><code>93.184.216.34:443</code></td><td>✅ ESTABLISHED</td></tr>
          </table>
          <p class="hinweis" style="margin:8px 0 0">Kommt ein Paket von <code>93.184.216.34:443</code> an <code>192.168.1.20:51515</code> zurück, passt es zu diesem Eintrag und darf rein.</p>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Ein Angreifer schickt ein Paket von außen an <code>192.168.1.20:51515</code>, aber es gibt keinen passenden Eintrag in der Zustandstabelle. Was macht die SPI-Firewall?',
          antworten: ['Sie lässt es durch, der Port ist ja offen', 'Sie verwirft es', 'Sie leitet es an den Admin weiter', 'Sie fragt den Benutzer'],
          richtig: 1,
          erklaerung: 'Ohne passende, von innen aufgebaute Verbindung ist das Paket „unerwartet“ und wird <strong>verworfen</strong>. Genau das macht SPI so viel sicherer als einen einfachen Paketfilter.'
        }, api);
      }
    },

    // 4 ─ DMZ
    {
      titel: 'Die DMZ: der Pufferbereich 🏰',
      sperre: true,
      inhalt: () => `
        <p>Server, die aus dem Internet erreichbar sein müssen, stellt man <strong>nicht</strong> ins interne Netz. Sie kommen in eine <strong>DMZ</strong> (Demilitarisierte Zone), einen eigenen Bereich zwischen Internet und LAN.</p>
        <div class="dmz-diagramm">
          <div class="zone internet">🌍 Internet</div>
          <div class="fw-symbol">🧱</div>
          <div class="zone dmz">🏰 DMZ</div>
          <div class="fw-symbol">🧱</div>
          <div class="zone lan">🏠 LAN</div>
        </div>
        ${Baustein.bot('Wird ein Server in der DMZ gehackt, steht der Angreifer immer noch vor der <strong>zweiten</strong> Firewall. Das interne Netz bleibt geschützt! 🛡️')}
        <div class="karte zuordnen">
          <p class="feldtitel">🎮 Wo gehört das hin?</p>
          <div class="zuordnen-kopf"><span class="hinweis" id="dmzStand"></span></div>
          <div class="zuordnen-begriff" id="dmzAufgabe" style="font-size:1.25rem"></div>
          <div class="dmz-wahl">
            <button type="button" class="miniquiz-btn zone-btn dmz" data-zone="dmz">🏰 DMZ</button>
            <button type="button" class="miniquiz-btn zone-btn lan" data-zone="lan">🏠 LAN</button>
          </div>
          <div id="dmzFeedback"></div>
        </div>`,
      init(box, api) {
        const AUFGABEN = mischen([
          ['🌐 Öffentlicher Webserver', 'dmz', 'Er muss aus dem Internet erreichbar sein → DMZ.'],
          ['🗄️ Datenbank mit Kundendaten', 'lan', 'Hochsensibel, nie direkt ans Internet! → LAN (der Webserver greift über eine streng gefilterte Regel darauf zu).'],
          ['📧 Mail-Relay (empfängt Mails von außen)', 'dmz', 'Muss Mails aus dem Internet annehmen → DMZ.'],
          ['📁 Dateiserver der Buchhaltung', 'lan', 'Nur intern genutzt → LAN.'],
          ['💻 PCs der Mitarbeiter', 'lan', 'Klar, die gehören ins interne Netz → LAN.'],
          ['🔁 Reverse Proxy', 'dmz', 'Er nimmt Anfragen aus dem Internet an und leitet sie weiter → DMZ.']
        ]).slice(0, 5);
        let i = 0;
        let fehler = 0;
        const zeigen = () => {
          box.querySelector('#dmzStand').textContent = `${i + 1} von ${AUFGABEN.length}`;
          const a = box.querySelector('#dmzAufgabe');
          a.textContent = AUFGABEN[i][0];
          a.classList.remove('neu'); void a.offsetWidth; a.classList.add('neu');
          box.querySelectorAll('[data-zone]').forEach(b => { b.disabled = false; b.classList.remove('richtig', 'falsch'); });
        };
        box.querySelectorAll('[data-zone]').forEach(b => b.onclick = () => {
          const [, zone, erkl] = AUFGABEN[i];
          if (b.dataset.zone === zone) {
            b.classList.add('richtig');
            box.querySelectorAll('[data-zone]').forEach(x => (x.disabled = true));
            box.querySelector('#dmzFeedback').innerHTML = Baustein.bot(`✔ ${erkl}`, '🤩');
            i++;
            setTimeout(() => {
              if (i < AUFGABEN.length) return zeigen();
              box.querySelector('#dmzAufgabe').textContent = '🏰 DMZ fertig geplant!';
              box.querySelector('#dmzStand').textContent = '';
              box.querySelector('#dmzFeedback').innerHTML = Baustein.bot(fehler === 0 ? '<strong>Fehlerfrei!</strong> Faustregel: Was aus dem Internet erreichbar sein muss → DMZ. Alles Sensible → LAN. 💪' : `<strong>Geschafft!</strong> ${fehler} ${fehler === 1 ? 'Fehlversuch' : 'Fehlversuche'}. Faustregel: Erreichbar aus dem Internet → DMZ, sensibel → LAN.`, '🥳');
              api.xp(fehler === 0 ? 10 : 5, box.querySelector('#dmzAufgabe'));
              api.freigeben();
            }, 1700);
          } else {
            fehler++;
            b.classList.add('falsch');
            b.disabled = true;
          }
        });
        zeigen();
      }
    },

    // 5 ─ VPN Grundlagen
    {
      titel: 'VPN: der geheime Tunnel 🚇',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('Ein <strong>VPN</strong> (Virtual Private Network) baut einen <strong>verschlüsselten Tunnel</strong> durch das unsichere Internet. Von außen sieht man nur, dass da ein Tunnel ist, aber nicht, was drin passiert. 🕶️')}
        <div class="tunnel-bild">
          <span class="ende">🏠</span>
          <div class="tunnel"><span class="paket">📦🔒</span><small>verschlüsselter Tunnel durchs Internet 🌍</small></div>
          <span class="ende">🏢</span>
        </div>
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">🏢↔🏢</span><strong>Site-to-Site</strong><small>verbindet zwei <strong>Standorte</strong> dauerhaft, z. B. Filiale und Zentrale. Die VPN-Gateways (Router/Firewalls) machen das.</small></div>
          <div class="host-box"><span class="gross-emoji">🏠↔🏢</span><strong>Remote Access (End-to-Site)</strong><small>ein <strong>einzelner Client</strong> wählt sich ins Firmennetz ein, z. B. im Homeoffice mit VPN-Software</small></div>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Eine Firma eröffnet eine Filiale in Hamburg. Alle 20 PCs dort sollen ständig auf die Server in der Zentrale in München zugreifen. Welche VPN-Art passt?',
          antworten: ['Remote-Access-VPN auf jedem PC', 'Site-to-Site-VPN', 'Gar kein VPN, einfach Ports öffnen', 'Ein Proxy-Server'],
          richtig: 1,
          erklaerung: 'Zwei <strong>Standorte</strong> dauerhaft verbinden → <strong>Site-to-Site</strong>. Die Router bzw. Firewalls bauen den Tunnel auf, und die PCs merken davon gar nichts.'
        }, api);
      }
    },

    // 6 ─ IPsec Modi
    {
      titel: 'IPsec: Tunnel- und Transportmodus 🔐',
      sperre: true,
      inhalt: () => `
        <p><strong>IPsec</strong> ist der Klassiker für VPNs (Schicht 3). Wichtige Bausteine:</p>
        <div class="record-liste">
          ${[['ESP', 'Encapsulating Security Payload', 'Verschlüsselung + Integrität'],
             ['AH', 'Authentication Header', 'nur Integrität/Authentizität, keine Verschlüsselung!'],
             ['IKE', 'Internet Key Exchange', 'handelt die Schlüssel aus (UDP 500/4500)']]
            .map(([t, n, b]) => `<div class="record"><span class="record-typ">${t}</span><div><strong>${n}</strong><small style="font-family:var(--schrift)">${b}</small></div></div>`).join('')}
        </div>
        <div class="karte">
          <p class="feldtitel">🎮 Vergleiche die beiden Modi</p>
          <div class="reiter" id="modusReiter">
            <button type="button" data-modus="transport">🚗 Transport</button>
            <button type="button" data-modus="tunnel">🚇 Tunnel</button>
          </div>
          <div class="frame-aufbau" id="ipsecPaket"></div>
          <p class="hinweis" id="ipsecText" style="text-align:center"></p>
        </div>
        <div class="karte">
          <p class="feldtitel">Andere VPN-Protokolle</p>
          <p style="margin:0"><strong>OpenVPN / SSL-VPN:</strong> basiert auf TLS, läuft oft über Port 443 und kommt deshalb durch fast jede Firewall.<br>
          <strong>WireGuard:</strong> modern, schlank und sehr schnell (UDP).</p>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        const teil = (k, t, s = '') => `<span class="fteil ${k}">${t}${s ? `<small>${s}</small>` : ''}</span>`;
        const MODI = {
          transport: [
            teil('ip', 'IP-Header', 'original') + teil('esp', 'ESP') + teil('verschl', '🔒 Daten', 'verschlüsselt'),
            'Nur die <strong>Nutzdaten</strong> werden verschlüsselt, der originale IP-Header bleibt sichtbar. Typisch für Verbindungen <strong>von Host zu Host</strong>.'
          ],
          tunnel: [
            teil('aussen-ip', 'Neuer IP-Header', 'Gateway → Gateway') + teil('esp', 'ESP') + teil('verschl', '🔒 IP-Header + Daten', 'original, verschlüsselt'),
            'Das <strong>komplette Original-Paket</strong> wird verschlüsselt und in ein neues Paket verpackt. Niemand sieht, wer intern mit wem redet. Typisch für <strong>Site-to-Site</strong> zwischen Gateways.'
          ]
        };
        const zeigen = m => {
          box.querySelectorAll('#modusReiter button').forEach(b => b.classList.toggle('aktiv', b.dataset.modus === m));
          box.querySelector('#ipsecPaket').innerHTML = MODI[m][0];
          box.querySelector('#ipsecText').innerHTML = MODI[m][1];
        };
        box.querySelectorAll('#modusReiter button').forEach(b => b.onclick = () => zeigen(b.dataset.modus));
        zeigen('transport');
        Baustein.miniQuiz(box, {
          frage: 'Bei welchem IPsec-Modus ist auch der <strong>originale IP-Header</strong> verschlüsselt?',
          antworten: ['Transportmodus', 'Tunnelmodus', 'Bei beiden', 'Bei keinem'],
          richtig: 1,
          erklaerung: 'Im <strong>Tunnelmodus</strong> wird das ganze Originalpaket inklusive IP-Header verschlüsselt und bekommt einen neuen äußeren IP-Header.'
        }, api);
      }
    },

    // 7 ─ Spickzettel
    {
      titel: 'Geschafft! 🏆',
      inhalt: () => `
        ${Baustein.bot('Super! Jetzt kannst du Netze absichern wie ein Profi. 🛡️ Dein <strong>Spickzettel</strong>:', '🥳')}
        <div class="karte spickzettel">
          <p class="feldtitel">🧱 Firewall</p>
          <ul class="haken-liste">
            <li>Paketfilter (stateless) → SPI (Zustandstabelle) → Proxy/ALG (L7) → NGFW</li>
            <li>Regeln von oben nach unten, <strong>First Match</strong>, am Ende <strong>Default Deny</strong></li>
            <li><strong>DMZ</strong>: öffentlich erreichbare Server getrennt vom LAN</li>
            <li><strong>IDS</strong> meldet, <strong>IPS</strong> blockiert</li>
          </ul>
        </div>
        <div class="karte spickzettel">
          <p class="feldtitel">🚇 VPN</p>
          <ul class="haken-liste">
            <li><strong>Site-to-Site</strong> (Standorte) vs. <strong>Remote Access</strong> (einzelner Client)</li>
            <li><strong>IPsec</strong>: ESP (verschlüsselt), AH (nur Integrität), IKE (Schlüssel)</li>
            <li><strong>Tunnelmodus</strong>: ganzes Paket verschlüsselt · <strong>Transportmodus</strong>: nur Nutzdaten</li>
            <li>Weitere: OpenVPN/SSL-VPN, WireGuard</li>
          </ul>
        </div>`
    }
  ]
});

// ───────────── Lektion: Virtualisierung ─────────────
const schichtStapel = (schichten) => `
  <div class="stapel">${schichten.map(([text, klasse]) => `<div class="schicht ${klasse}">${text}</div>`).join('')}</div>`;

LEKTIONEN.push({
  id: 'virtualisierung',
  titel: 'Virtualisierung',
  emoji: '☁️',
  farbe: 'f-stand',
  dauer: 'ca. 15 Minuten',
  ueben: { link: '#/quiz', text: '❓ Jetzt im Quiz testen' },
  beschreibung: 'Hypervisoren, Snapshots, Hochverfügbarkeit, Container und Cloud-Modelle. Mit Cluster-Simulator!',
  schritte: [
    // 1 ─ Warum
    {
      titel: 'Viele Server in einem 🪄',
      inhalt: () => `
        ${Baustein.bot('Früher bekam jeder Dienst einen eigenen physischen Server. Das Problem: Die meisten langweilen sich die ganze Zeit! 😴 Typisch sind gerade mal <strong>10–15 % Auslastung</strong>.')}
        <div class="karte">
          <p class="feldtitel">Vorher: 5 Server, kaum ausgelastet</p>
          <div class="server-reihe">
            ${['🌐 Web', '📧 Mail', '🗄️ DB', '📁 Files', '🔑 AD'].map((n, i) => `
              <div class="server-kiste"><small>${n}</small><div class="auslast"><div style="height:${[12, 8, 15, 10, 6][i]}%"></div></div></div>`).join('')}
          </div>
          <p class="feldtitel" style="margin-top:16px">Nachher: 1 Host mit 5 virtuellen Maschinen (VMs)</p>
          <div class="host-kiste">
            <div class="vm-reihe">${['🌐', '📧', '🗄️', '📁', '🔑'].map(e => `<span class="vm-chip">${e} VM</span>`).join('')}</div>
            <div class="auslast quer"><div style="width:55%"></div><span>55 % Auslastung</span></div>
          </div>
        </div>
        <div class="karte">
          <p class="feldtitel">Vorteile der Virtualisierung</p>
          <ul class="haken-liste">
            <li><strong>Konsolidierung:</strong> weniger Hardware, Strom, Kühlung und Platz</li>
            <li><strong>Schnell bereitgestellt:</strong> eine neue VM steht in Minuten statt Wochen</li>
            <li><strong>Snapshots und Klone:</strong> den Zustand sichern, VMs kopieren</li>
            <li><strong>Hochverfügbarkeit:</strong> VMs können zwischen Hosts umziehen</li>
            <li><strong>Isolation:</strong> stürzt eine VM ab, laufen die anderen weiter</li>
          </ul>
          <p class="hinweis" style="margin-bottom:0">⚠️ Nachteil: Fällt der Host aus, sind <em>alle</em> VMs betroffen (Single Point of Failure). Dafür gibt es Cluster, dazu gleich mehr!</p>
        </div>`
    },

    // 2 ─ Hypervisor-Typen
    {
      titel: 'Hypervisor Typ 1 und Typ 2 🧱',
      sperre: true,
      inhalt: () => `
        <p>Der <strong>Hypervisor</strong> (auch VMM, Virtual Machine Monitor) verteilt die echte Hardware auf die VMs. Es gibt zwei Bauarten:</p>
        <div class="stapel-vergleich">
          <div>
            <p class="feldtitel">Typ 1: Bare Metal</p>
            ${schichtStapel([['VM 1 · VM 2 · VM 3', 'vm'], ['Hypervisor', 'hv'], ['Hardware', 'hw']])}
            <small>läuft <strong>direkt auf der Hardware</strong>, schnell und für Server gedacht</small>
          </div>
          <div>
            <p class="feldtitel">Typ 2: Hosted</p>
            ${schichtStapel([['VM 1 · VM 2', 'vm'], ['Hypervisor (Programm)', 'hv'], ['Betriebssystem', 'os'], ['Hardware', 'hw']])}
            <small>läuft als <strong>Programm auf einem Betriebssystem</strong>, für Tests und Arbeitsplätze</small>
          </div>
        </div>
        <div class="karte zuordnen">
          <p class="feldtitel">🎮 Typ 1 oder Typ 2?</p>
          <div class="zuordnen-kopf"><span class="hinweis" id="hvStand"></span></div>
          <div class="zuordnen-begriff" id="hvAufgabe" style="font-size:1.2rem"></div>
          <div class="dmz-wahl">
            <button type="button" class="miniquiz-btn zone-btn" data-typ="1">🧱 Typ 1</button>
            <button type="button" class="miniquiz-btn zone-btn" data-typ="2">💻 Typ 2</button>
          </div>
          <div id="hvFeedback"></div>
        </div>`,
      init(box, api) {
        const AUFGABEN = mischen([
          ['VMware ESXi', 1, 'ESXi wird direkt auf dem Server installiert → Typ 1.'],
          ['Oracle VirtualBox', 2, 'VirtualBox installierst du wie ein Programm unter Windows/Linux → Typ 2.'],
          ['Microsoft Hyper-V', 1, 'Hyper-V schiebt sich unter Windows direkt auf die Hardware → Typ 1.'],
          ['VMware Workstation', 2, 'Workstation läuft als Anwendung auf einem Desktop-Betriebssystem → Typ 2.'],
          ['Proxmox VE', 1, 'Proxmox ist ein eigenes Server-System mit KVM → Typ 1.'],
          ['Parallels Desktop', 2, 'Parallels läuft als Programm auf macOS → Typ 2.']
        ]).slice(0, 5);
        let i = 0;
        let fehler = 0;
        const zeigen = () => {
          box.querySelector('#hvStand').textContent = `${i + 1} von ${AUFGABEN.length}`;
          const a = box.querySelector('#hvAufgabe');
          a.textContent = AUFGABEN[i][0];
          a.classList.remove('neu'); void a.offsetWidth; a.classList.add('neu');
          box.querySelectorAll('[data-typ]').forEach(b => { b.disabled = false; b.classList.remove('richtig', 'falsch'); });
        };
        box.querySelectorAll('[data-typ]').forEach(b => b.onclick = () => {
          const [, typ, erkl] = AUFGABEN[i];
          if (Number(b.dataset.typ) === typ) {
            b.classList.add('richtig');
            box.querySelectorAll('[data-typ]').forEach(x => (x.disabled = true));
            box.querySelector('#hvFeedback').innerHTML = Baustein.bot(`✔ ${erkl}`, '🤩');
            i++;
            setTimeout(() => {
              if (i < AUFGABEN.length) return zeigen();
              box.querySelector('#hvAufgabe').textContent = '🎉 Alle richtig sortiert!';
              box.querySelector('#hvStand').textContent = '';
              box.querySelector('#hvFeedback').innerHTML = Baustein.bot(fehler === 0 ? '<strong>Fehlerfrei!</strong> Merk dir: Server → Typ 1, eigener PC → Typ 2.' : `<strong>Geschafft!</strong> ${fehler} ${fehler === 1 ? 'Fehlversuch' : 'Fehlversuche'}. Merk dir: Server → Typ 1, eigener PC → Typ 2.`, '🥳');
              api.xp(fehler === 0 ? 10 : 5, box.querySelector('#hvAufgabe'));
              api.freigeben();
            }, 1600);
          } else {
            fehler++;
            b.classList.add('falsch');
            b.disabled = true;
          }
        });
        zeigen();
      }
    },

    // 3 ─ Ressourcen
    {
      titel: 'Virtuelle Ressourcen ⚙️',
      sperre: true,
      inhalt: () => `
        <p>Jede VM bekommt vom Host einen Teil der Hardware zugeteilt:</p>
        <div class="record-liste">
          ${[['vCPU', 'virtuelle Prozessorkerne', 'werden auf die echten Kerne verteilt'],
             ['vRAM', 'Arbeitsspeicher', 'meist der knappste Faktor beim Planen!'],
             ['vDisk', 'virtuelle Festplatte', 'eine Datei, z. B. .vmdk oder .vhdx'],
             ['vSwitch', 'virtueller Switch', 'verbindet VMs untereinander und mit dem echten Netz']]
            .map(([t, n, b]) => `<div class="record"><span class="record-typ">${t}</span><div><strong>${n}</strong><small style="font-family:var(--schrift)">${b}</small></div></div>`).join('')}
        </div>
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">🎈</span><strong>Thin Provisioning</strong><small>Die virtuelle Disk wächst erst bei Bedarf. Spart Platz, aber Achtung: Der Speicher kann überbucht werden!</small></div>
          <div class="host-box"><span class="gross-emoji">🧱</span><strong>Thick Provisioning</strong><small>Der volle Platz wird sofort reserviert. Sicher planbar und etwas schneller.</small></div>
        </div>
        ${Baustein.bot('Teilt man mehr virtuelle Ressourcen zu, als physisch vorhanden sind, nennt man das <strong>Overcommitment</strong>. Bei CPUs ist das üblich, beim RAM gefährlich! 😬')}
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Ein Host hat <strong>128 GB RAM</strong>. Der Hypervisor braucht 8 GB. Wie viele VMs mit je <strong>16 GB RAM</strong> passen ohne Overcommitment drauf?',
          antworten: ['6', '7', '8', '16'],
          richtig: 1,
          erklaerung: '128 GB − 8 GB = 120 GB für VMs. 120 ÷ 16 = 7,5 → <strong>7 VMs</strong> (eine halbe VM gibt es nicht 😉).'
        }, api);
      }
    },

    // 4 ─ Snapshot-Spiel
    {
      titel: 'Snapshots: die Zeitmaschine ⏪',
      sperre: true,
      inhalt: () => `
        <p>Ein <strong>Snapshot</strong> friert den Zustand einer VM zu einem Zeitpunkt ein. Geht danach etwas schief, springst du einfach zurück.</p>
        <div class="karte">
          <p class="feldtitel">🎮 Du sollst ein riskantes Update auf dem Webserver installieren. Mach es wie ein Profi!</p>
          <div class="vm-bildschirm" id="vmBild">
            <div class="vm-titel">🖥️ VM „Webserver“</div>
            <div class="vm-inhalt" id="vmInhalt"></div>
          </div>
          <div class="snap-leiste" id="snapLeiste"></div>
          <div class="snap-knoepfe">
            <button type="button" class="btn f-stand" id="snapErstellen">📸 Snapshot</button>
            <button type="button" class="btn f-karten" id="snapUpdate">⬆️ Update</button>
            <button type="button" class="btn zweit f-stand" id="snapZurueck" disabled>⏪ Zurücksetzen</button>
          </div>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        let zustand = 'ok';
        let snapshot = null;
        let fertig = false;
        const zeichnen = () => {
          box.querySelector('#vmInhalt').innerHTML = {
            ok: '<span class="vm-status gut">✅ Webseite läuft</span><small>Version 1.0</small>',
            kaputt: '<span class="vm-status tot">💥 Fehler 500!</span><small>Das Update hat alles kaputt gemacht</small>',
            neu: '<span class="vm-status gut">✅ Webseite läuft wieder</span><small>Version 1.0 · zurückgesetzt</small>'
          }[zustand];
          box.querySelector('#vmBild').classList.toggle('kaputt', zustand === 'kaputt');
          box.querySelector('#snapLeiste').innerHTML = snapshot
            ? `<span class="snap-punkt">📸 Snapshot „vor Update“ · Version 1.0</span>`
            : '<span class="hinweis" style="margin:0">Noch kein Snapshot vorhanden</span>';
          box.querySelector('#snapZurueck').disabled = !(snapshot && zustand === 'kaputt');
        };
        box.querySelector('#snapErstellen').onclick = () => {
          if (zustand === 'kaputt') {
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('Ein Snapshot vom <em>kaputten</em> Zustand hilft dir jetzt nicht weiter. 😅', '🤔');
            return;
          }
          snapshot = true;
          zeichnen();
          box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('📸 Klick! Der Zustand ist gesichert. Jetzt kannst du das Update gefahrlos testen.', '🤖');
        };
        box.querySelector('#snapUpdate').onclick = () => {
          if (zustand === 'kaputt') return;
          zustand = 'kaputt';
          zeichnen();
          box.querySelector('[data-erfolg]').innerHTML = snapshot
            ? Baustein.bot('Oh nein, das Update ist schiefgegangen! 😱 Aber du hast ja einen Snapshot …', '😱')
            : Baustein.bot('Autsch! Das Update hat den Server zerschossen, und du hattest <strong>keinen Snapshot</strong>! 😵 Zum Glück ist das nur eine Übung. Ich stelle die VM wieder her. Versuch es nochmal, diesmal <em>mit</em> Snapshot.', '😵');
          if (!snapshot) setTimeout(() => { zustand = 'ok'; zeichnen(); }, 2600);
        };
        box.querySelector('#snapZurueck').onclick = () => {
          zustand = 'neu';
          zeichnen();
          if (!fertig) {
            fertig = true;
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Gerettet! ⏪</strong> In Sekunden ist alles wieder wie vorher.<br>⚠️ Aber merk dir: <strong>Ein Snapshot ist kein Backup!</strong> Er liegt auf demselben Speicher wie die VM. Ist der Speicher kaputt, ist auch der Snapshot weg. Und alte Snapshots bremsen die VM, also wieder löschen!', '😎');
            api.xp(10, box.querySelector('#vmBild'));
            api.freigeben();
          }
        };
        zeichnen();
      }
    },

    // 5 ─ HA-Cluster
    {
      titel: 'Hochverfügbarkeit im Cluster 🛟',
      sperre: true,
      inhalt: () => `
        <p>Damit ein Host-Ausfall nicht alle VMs mitreißt, verbindet man mehrere Hosts zu einem <strong>Cluster</strong> mit gemeinsamem Speicher (SAN/NAS).</p>
        <div class="karte">
          <p><strong>🚚 Live-Migration</strong> (z. B. vMotion): Eine laufende VM zieht <em>ohne Unterbrechung</em> auf einen anderen Host um, z. B. für Wartungsarbeiten.</p>
          <p style="margin:0"><strong>🛟 HA (High Availability):</strong> Fällt ein Host aus, werden seine VMs automatisch auf den anderen Hosts <em>neu gestartet</em>. Das gibt nur eine kurze Unterbrechung.</p>
        </div>
        <div class="karte">
          <p class="feldtitel">🎮 Cluster-Simulator: Tippe auf einen Host, um ihn ausfallen zu lassen!</p>
          <label class="check"><input type="checkbox" id="haSchalter"> 🛟 HA aktiviert</label>
          <div class="cluster" id="cluster"></div>
          <div class="missionen" id="haMissionen" style="margin-top:12px"></div>
          <button type="button" class="btn zweit breit f-stand" id="haReparieren">🔧 Alle Hosts reparieren</button>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        const START = { 1: ['🌐 Web', '📧 Mail'], 2: ['🗄️ DB', '📁 Files'], 3: ['🔑 AD', '🖨️ Print'] };
        let hosts, aus, offline;
        const erledigt = new Set();
        const zuruecksetzen = () => {
          hosts = JSON.parse(JSON.stringify(START));
          aus = new Set();
          offline = [];
        };
        const zeichnen = () => {
          box.querySelector('#cluster').innerHTML = [1, 2, 3].map(h => `
            <button type="button" class="host ${aus.has(h) ? 'aus' : ''}" data-host="${h}">
              <span class="host-name">${aus.has(h) ? '💥' : '🖥️'} Host ${h}</span>
              ${hosts[h].map(v => `<span class="vm-chip ${v.startsWith('🔄') ? 'neustart' : ''}">${v.replace('🔄', '')}</span>`).join('') || '<small>keine VMs</small>'}
            </button>`).join('') +
            (offline.length ? `<div class="offline">❌ Offline: ${offline.join(', ')}</div>` : '');
          box.querySelector('#haMissionen').innerHTML = [
            ['ohne', '💀 Lass einen Host <strong>ohne HA</strong> ausfallen'],
            ['mit', '🛟 Lass einen Host <strong>mit HA</strong> ausfallen']
          ].map(([id, t]) => `<div class="mission ${erledigt.has(id) ? 'erledigt' : ''}"><span>${erledigt.has(id) ? '✅' : '⬜'}</span><span>${t}</span></div>`).join('');
          box.querySelectorAll('.host').forEach(b => b.onclick = () => ausfall(Number(b.dataset.host)));
        };
        const ausfall = h => {
          if (aus.has(h)) return;
          if (aus.size === 2) {
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('Einen Host lassen wir lieber am Leben. 😅 Repariere den Cluster und probier es nochmal.', '🤔');
            return;
          }
          const ha = box.querySelector('#haSchalter').checked;
          const vms = hosts[h];
          hosts[h] = [];
          aus.add(h);
          if (ha) {
            const lebend = [1, 2, 3].filter(x => !aus.has(x));
            vms.forEach((v, i) => hosts[lebend[i % lebend.length]].push('🔄' + v));
            erledigt.add('mit');
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(`<strong>HA greift! 🛟</strong> ${vms.join(' und ')} werden auf den anderen Hosts neu gestartet. Nach einer kurzen Unterbrechung läuft alles wieder.`, '🤩');
          } else {
            offline.push(...vms);
            erledigt.add('ohne');
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(`<strong>Autsch!</strong> ${vms.join(' und ')} sind offline, bis jemand den Host repariert. 😱 Aktiviere HA und versuch es nochmal!`, '😱');
          }
          zeichnen();
          if (erledigt.size === 2 && !box.dataset.fertig) {
            box.dataset.fertig = '1';
            setTimeout(() => {
              box.querySelector('[data-erfolg]').insertAdjacentHTML('beforeend', Baustein.bot('<strong>Beide Missionen geschafft! 🏆</strong> Für HA brauchst du: mindestens 2 Hosts, <strong>gemeinsamen Speicher</strong> und genug freie Ressourcen, um die VMs eines ausgefallenen Hosts aufzunehmen.', '🥳'));
              api.xp(10, box.querySelector('#cluster'));
              api.freigeben();
            }, 600);
          }
        };
        box.querySelector('#haReparieren').onclick = () => { zuruecksetzen(); zeichnen(); box.querySelector('[data-erfolg]').innerHTML = ''; };
        zuruecksetzen();
        zeichnen();
      }
    },

    // 6 ─ Container
    {
      titel: 'Container: die leichten Brüder 📦',
      sperre: true,
      inhalt: () => `
        <p><strong>Container</strong> (z. B. <strong>Docker</strong>) sind eine leichtere Form der Virtualisierung. Sie haben <strong>kein eigenes Betriebssystem</strong>, sondern teilen sich den Kernel des Hosts.</p>
        <div class="stapel-vergleich">
          <div>
            <p class="feldtitel">Virtuelle Maschinen</p>
            ${schichtStapel([['App · App', 'app'], ['Gast-OS · Gast-OS', 'os'], ['Hypervisor', 'hv'], ['Hardware', 'hw']])}
            <small>jede VM bringt ein komplettes Betriebssystem mit</small>
          </div>
          <div>
            <p class="feldtitel">Container</p>
            ${schichtStapel([['App · App · App', 'app'], ['Container-Engine', 'hv'], ['Betriebssystem', 'os'], ['Hardware', 'hw']])}
            <small>Apps teilen sich das Host-Betriebssystem</small>
          </div>
        </div>
        <table class="ergebnis-tabelle kompakt karte" style="padding:6px">
          <tr><th></th><th>VM</th><th>Container</th></tr>
          <tr><td><strong>Start</strong></td><td>Minuten</td><td>Sekunden ⚡</td></tr>
          <tr><td><strong>Größe</strong></td><td>GB</td><td>MB</td></tr>
          <tr><td><strong>Isolation</strong></td><td>sehr stark 🔒</td><td>schwächer</td></tr>
          <tr><td><strong>Anderes OS?</strong></td><td>✅ z. B. Linux auf Windows</td><td>❌ gleicher Kernel</td></tr>
        </table>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Warum starten Container viel schneller als virtuelle Maschinen?',
          antworten: ['Sie haben mehr RAM', 'Sie müssen kein eigenes Betriebssystem booten', 'Sie laufen nur im Internet', 'Sie haben keinen Netzwerkzugang'],
          richtig: 1,
          erklaerung: 'Container nutzen den <strong>Kernel des Host-Betriebssystems</strong> mit. Es muss kein Gast-OS hochfahren, die App startet direkt.'
        }, api);
      }
    },

    // 7 ─ Cloud-Modelle
    {
      titel: 'Cloud: IaaS, PaaS, SaaS 🍕',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('Die Cloud-Modelle erklärt man am besten mit <strong>Pizza</strong>! 🍕 Je weiter rechts, desto mehr macht der Anbieter für dich.')}
        <div class="pizza-tabelle">
          <div class="pizza-kopf"><span></span><b>🏠 On-Premises</b><b>🧊 IaaS</b><b>🛵 PaaS</b><b>🍽️ SaaS</b></div>
          ${[['Anwendung', [1, 1, 1, 0]], ['Daten', [1, 1, 1, 0]], ['Laufzeit', [1, 1, 0, 0]], ['Betriebssystem', [1, 1, 0, 0]], ['Virtualisierung', [1, 0, 0, 0]], ['Server & Speicher', [1, 0, 0, 0]], ['Netzwerk', [1, 0, 0, 0]]]
            .map(([n, w]) => `<div class="pizza-zeile"><span>${n}</span>${w.map(x => `<i class="${x ? 'du' : 'anbieter'}">${x ? 'Du' : 'Anbieter'}</i>`).join('')}</div>`).join('')}
        </div>
        <div class="record-liste">
          ${[['IaaS', 'Infrastructure as a Service', 'virtuelle Server mieten, z. B. AWS EC2, Azure VMs · 🧊 Tiefkühlpizza: du backst selbst'],
             ['PaaS', 'Platform as a Service', 'fertige Plattform für eigene Apps, z. B. Azure App Service · 🛵 Lieferdienst'],
             ['SaaS', 'Software as a Service', 'fertige Software im Browser, z. B. Microsoft 365, Gmail · 🍽️ Restaurant']]
            .map(([t, n, b]) => `<div class="record"><span class="record-typ">${t}</span><div><strong>${n}</strong><small style="font-family:var(--schrift)">${b}</small></div></div>`).join('')}
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Eine Firma nutzt <strong>Microsoft 365</strong> für E-Mail und Office im Browser. Welches Cloud-Modell ist das?',
          antworten: ['IaaS', 'PaaS', 'SaaS', 'On-Premises'],
          richtig: 2,
          erklaerung: 'Fertige Software, die man einfach nutzt, ohne sich um Server, OS oder Updates zu kümmern → <strong>SaaS</strong>.'
        }, api);
      }
    },

    // 8 ─ Spickzettel
    {
      titel: 'Geschafft! 🏆',
      inhalt: () => `
        ${Baustein.bot('Du bist jetzt bereit fürs Rechenzentrum! 🏢 Hier ist dein <strong>Spickzettel</strong>:', '🥳')}
        <div class="karte spickzettel">
          <ul class="haken-liste">
            <li><strong>Typ 1</strong> (Bare Metal): ESXi, Hyper-V, Proxmox · <strong>Typ 2</strong> (Hosted): VirtualBox, VMware Workstation</li>
            <li><strong>Vorteile:</strong> Konsolidierung, schnelle Bereitstellung, Snapshots, HA</li>
            <li><strong>Thin</strong> (wächst bei Bedarf) vs. <strong>Thick</strong> Provisioning (sofort reserviert)</li>
            <li><strong>Snapshot ≠ Backup!</strong> Liegt auf demselben Speicher</li>
            <li><strong>Live-Migration:</strong> ohne Unterbrechung · <strong>HA:</strong> Neustart auf anderem Host</li>
            <li>HA braucht <strong>Cluster + gemeinsamen Speicher</strong> (SAN/NAS)</li>
            <li><strong>Container</strong> teilen den Host-Kernel: schnell und klein, aber weniger isoliert</li>
            <li><strong>IaaS</strong> (Server) → <strong>PaaS</strong> (Plattform) → <strong>SaaS</strong> (fertige Software)</li>
          </ul>
        </div>`
    }
  ]
});

// ───────────── Lektion: Routing ─────────────
// Kleine Runden-Engine: zeigt nacheinander Aufgaben, die per Knopf beantwortet werden
function rundenSpiel(box, { aufgaben, zeigen, pruefen, fertigText, api, verzoegerung = 1500 }) {
  let i = 0;
  let fehler = 0;
  const weiter = () => {
    if (i < aufgaben.length) return zeigen(aufgaben[i], i);
    fertigText(fehler);
    api.xp(fehler === 0 ? 10 : 5, box.querySelector('[data-spiel]') || box);
    api.freigeben();
  };
  const antwort = (wahl, knopf) => {
    const ok = pruefen(aufgaben[i], wahl);
    if (ok) { i++; setTimeout(weiter, verzoegerung); }
    else { fehler++; if (knopf) { knopf.classList.add('falsch'); knopf.disabled = true; } }
    return ok;
  };
  weiter();
  return antwort;
}

LEKTIONEN.push({
  id: 'routing',
  titel: 'Routing',
  emoji: '🧭',
  farbe: 'f-subnetz',
  dauer: 'ca. 15 Minuten',
  ueben: { link: '#/subnetting', text: '🌐 Subnetting trainieren' },
  beschreibung: 'Standardgateway, Routing-Tabelle, Longest Prefix Match und Routing-Protokolle. Du entscheidest wie ein Router!',
  schritte: [
    // 1 ─ Einstieg
    {
      titel: 'Der Router: das Navi der Pakete 🧭',
      inhalt: () => `
        ${Baustein.bot('Ein Switch verbindet Geräte <em>innerhalb</em> eines Netzes. Aber wie kommt ein Paket von deinem PC zu einem Server am anderen Ende der Welt? Dafür gibt es <strong>Router</strong>! 🌍')}
        <div class="karte">
          <ul class="haken-liste">
            <li>Ein Router <strong>verbindet verschiedene Netze</strong> miteinander</li>
            <li>Er arbeitet auf <strong>Schicht 3</strong> und entscheidet anhand der <strong>Ziel-IP-Adresse</strong></li>
            <li>Dafür schaut er in seine <strong>Routing-Tabelle</strong>: „Für dieses Ziel geht es da lang!“</li>
            <li>Jeder Router auf dem Weg ist ein <strong>Hop</strong>. Ins Internet sind es oft 10–20 Hops</li>
          </ul>
        </div>
        <div class="hop-kette">
          <span>💻</span><b>→</b><span>🧭</span><b>→</b><span>🧭</span><b>→</b><span>🧭</span><b>→</b><span>🖥️</span>
        </div>
        <p class="hinweis" style="text-align:center">Jeder Router kennt nur den <strong>nächsten Schritt</strong> (Next Hop), nicht den ganzen Weg. Wie bei Wegweisern an der Straße! 🪧</p>`
    },

    // 2 ─ Standardgateway
    {
      titel: 'Direkt oder übers Gateway? 🚪',
      sperre: true,
      inhalt: () => `
        <p>Bevor ein PC ein Paket losschickt, stellt er sich eine Frage: <strong>„Ist das Ziel in meinem eigenen Netz?“</strong></p>
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">🏠</span><strong>Ja → direkt</strong><small>Er holt sich per ARP die MAC-Adresse des Ziels und schickt den Frame direkt</small></div>
          <div class="host-box"><span class="gross-emoji">🚪</span><strong>Nein → Gateway</strong><small>Er schickt das Paket an sein <strong>Standardgateway</strong> (den Router), der kümmert sich um den Rest</small></div>
        </div>
        ${Baustein.bot('Dafür vergleicht der PC den <strong>Netzanteil</strong> seiner eigenen IP mit dem der Ziel-IP. Hier hilft dir dein Subnetting-Wissen! 🧠')}
        <div class="karte" data-spiel>
          <p class="feldtitel">🎮 Du bist der PC! Wohin schickst du das Paket?</p>
          <div class="pc-info" id="pcInfo"></div>
          <p class="hinweis" id="gwStand" style="margin:8px 0 0"></p>
          <div class="ziel-ip" id="gwZiel"></div>
          <div class="dmz-wahl">
            <button type="button" class="miniquiz-btn zone-btn" data-wahl="direkt">🏠 Direkt</button>
            <button type="button" class="miniquiz-btn zone-btn" data-wahl="gateway">🚪 Ans Gateway</button>
          </div>
          <div id="gwFeedback"></div>
        </div>`,
      init(box, api) {
        const AUFGABEN = [
          { pc: '192.168.1.10/24', gw: '192.168.1.1', ziel: '192.168.1.50', wahl: 'direkt', erkl: 'Bei /24 zählen die ersten 3 Oktette. 192.168.1 = 192.168.1 → gleiches Netz!' },
          { pc: '192.168.1.10/24', gw: '192.168.1.1', ziel: '192.168.2.5', wahl: 'gateway', erkl: '192.168.<strong>2</strong> ist ein anderes Netz → ab zum Gateway.' },
          { pc: '192.168.1.10/24', gw: '192.168.1.1', ziel: '8.8.8.8', wahl: 'gateway', erkl: 'Das ist im Internet, also auf jeden Fall übers Gateway.' },
          { pc: '10.0.0.70/26', gw: '10.0.0.65', ziel: '10.0.0.100', wahl: 'direkt', erkl: '/26 → Blockgröße 64. Netz .64 bis .127, und .100 liegt drin → direkt!' },
          { pc: '10.0.0.70/26', gw: '10.0.0.65', ziel: '10.0.0.130', wahl: 'gateway', erkl: '/26 → Blöcke .64–.127 und .128–.191. Die .130 liegt im <em>nächsten</em> Block → Gateway! Fies, oder? 😏' }
        ];
        const knoepfe = box.querySelectorAll('[data-wahl]');
        const antwort = rundenSpiel(box, {
          api, aufgaben: AUFGABEN,
          zeigen: (a, i) => {
            box.querySelector('#pcInfo').innerHTML = `<span>💻 Meine IP: <b>${a.pc}</b></span><span>🚪 Gateway: <b>${a.gw}</b></span>`;
            box.querySelector('#gwStand').textContent = `Paket ${i + 1} von ${AUFGABEN.length}`;
            const z = box.querySelector('#gwZiel');
            z.innerHTML = `📦 Ziel: <b>${a.ziel}</b>`;
            z.classList.remove('neu'); void z.offsetWidth; z.classList.add('neu');
            knoepfe.forEach(b => { b.disabled = false; b.classList.remove('richtig', 'falsch'); });
          },
          pruefen: (a, wahl) => {
            if (wahl !== a.wahl) {
              box.querySelector('#gwFeedback').innerHTML = Baustein.bot('Nicht ganz! Vergleiche den <strong>Netzanteil</strong> der beiden Adressen. Was sagt das Präfix? 🤔', '🤔');
              return false;
            }
            box.querySelector(`[data-wahl="${wahl}"]`).classList.add('richtig');
            knoepfe.forEach(b => (b.disabled = true));
            box.querySelector('#gwFeedback').innerHTML = Baustein.bot(`✔ ${a.erkl}`, '🤩');
            return true;
          },
          fertigText: fehler => {
            box.querySelector('#gwZiel').innerHTML = '🎉 Alle Pakete unterwegs!';
            box.querySelector('#gwStand').textContent = '';
            knoepfe.forEach(b => (b.disabled = true));
            box.querySelector('#gwFeedback').innerHTML = Baustein.bot(fehler === 0 ? '<strong>Fehlerfrei!</strong> Du denkst schon wie ein Netzwerk-Stack. 🧠' : `<strong>Geschafft!</strong> ${fehler} ${fehler === 1 ? 'Fehlversuch' : 'Fehlversuche'}. Bei ungeraden Präfixen wie /26 immer die Blockgröße ausrechnen!`, '🥳');
          }
        });
        knoepfe.forEach(b => b.onclick = () => antwort(b.dataset.wahl, b));
      }
    },

    // 3 ─ Routing-Tabelle
    {
      titel: 'Die Routing-Tabelle 📋',
      sperre: true,
      inhalt: () => `
        <p>Jeder Router hat eine <strong>Routing-Tabelle</strong>. Jede Zeile sagt: <em>„Pakete an dieses Netz schicke ich dorthin.“</em></p>
        ${Baustein.bot('Die wichtigste Regel: <strong>Longest Prefix Match</strong>! Passen mehrere Einträge, gewinnt der <strong>genaueste</strong>, also der mit dem längsten Präfix. Und <code>0.0.0.0/0</code> ist die <strong>Default-Route</strong>: Sie passt immer, aber nur als letzte Wahl.')}
        <div class="karte" data-spiel>
          <p class="feldtitel">🎮 Du bist der Router! Welche Route nimmst du?</p>
          <div class="route-tabelle" id="routeTabelle">
            <div class="route-kopf"><span>Zielnetz</span><span>Next Hop</span></div>
            ${[['192.168.1.0/24', 'direkt (eth0)'], ['192.168.2.0/24', 'direkt (eth1)'], ['10.0.0.0/8', '192.168.2.254'], ['10.20.0.0/16', '192.168.1.253'], ['0.0.0.0/0', '80.1.1.1 (Internet)']]
              .map(([n, h], i) => `<button type="button" class="route" data-route="${i}"><code>${n}</code><span>${h}</span></button>`).join('')}
          </div>
          <p class="hinweis" id="rtStand" style="margin:10px 0 0"></p>
          <div class="ziel-ip" id="rtZiel"></div>
          <div id="rtFeedback"></div>
        </div>`,
      init(box, api) {
        const AUFGABEN = [
          { ziel: '192.168.2.77', route: 1, passend: [1, 4], erkl: 'Liegt in 192.168.2.0/24 → direkt raus über eth1.' },
          { ziel: '10.20.5.5', route: 3, passend: [2, 3, 4], erkl: 'Passt auf /8, /16 <em>und</em> /0. Der längste Präfix gewinnt: <strong>/16</strong> → 192.168.1.253!' },
          { ziel: '10.99.1.1', route: 2, passend: [2, 4], erkl: '10.99 passt nicht auf 10.20.0.0/16, aber auf 10.0.0.0/8 → 192.168.2.254.' },
          { ziel: '8.8.8.8', route: 4, passend: [4], erkl: 'Kein spezieller Eintrag passt → <strong>Default-Route</strong> ins Internet.' },
          { ziel: '192.168.1.9', route: 0, passend: [0, 4], erkl: 'Direkt angeschlossenes Netz an eth0.' }
        ];
        const routen = box.querySelectorAll('.route');
        const antwort = rundenSpiel(box, {
          api, aufgaben: AUFGABEN, verzoegerung: 2200,
          zeigen: (a, i) => {
            box.querySelector('#rtStand').textContent = `Paket ${i + 1} von ${AUFGABEN.length}`;
            const z = box.querySelector('#rtZiel');
            z.innerHTML = `📦 Ziel-IP: <b>${a.ziel}</b>`;
            z.classList.remove('neu'); void z.offsetWidth; z.classList.add('neu');
            routen.forEach(r => { r.disabled = false; r.classList.remove('richtig', 'falsch', 'passt'); });
          },
          pruefen: (a, wahl) => {
            if (wahl !== a.route) {
              box.querySelector('#rtFeedback').innerHTML = Baustein.bot('Nicht ganz! Welche Einträge <em>passen</em> überhaupt auf die Ziel-IP? Und welcher davon hat das <strong>längste Präfix</strong>? 🔍', '🤔');
              return false;
            }
            routen.forEach(r => {
              const n = Number(r.dataset.route);
              r.disabled = true;
              if (n === a.route) r.classList.add('richtig');
              else if (a.passend.includes(n)) r.classList.add('passt');
            });
            box.querySelector('#rtFeedback').innerHTML = Baustein.bot(`✔ ${a.erkl}`, '🤩');
            return true;
          },
          fertigText: fehler => {
            box.querySelector('#rtZiel').innerHTML = '🎉 Alle Pakete geroutet!';
            box.querySelector('#rtStand').textContent = '';
            routen.forEach(r => (r.disabled = true));
            box.querySelector('#rtFeedback').innerHTML = Baustein.bot(fehler === 0 ? '<strong>Perfekt geroutet! 🏆</strong> Longest Prefix Match sitzt.' : `<strong>Geschafft!</strong> ${fehler} ${fehler === 1 ? 'Fehlversuch' : 'Fehlversuche'}. Merk dir: genauester Eintrag gewinnt, Default-Route zuletzt.`, '🥳');
          }
        });
        routen.forEach(r => r.onclick = () => antwort(Number(r.dataset.route), r));
      }
    },

    // 4 ─ Statisch vs dynamisch
    {
      titel: 'Statisch oder dynamisch? ⚙️',
      sperre: true,
      inhalt: () => `
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">✍️</span><strong>Statisches Routing</strong><small>Der Admin trägt die Routen von Hand ein. Einfach und sicher, aber unflexibel. Für kleine Netze.</small></div>
          <div class="host-box"><span class="gross-emoji">🤖</span><strong>Dynamisches Routing</strong><small>Router tauschen ihre Routen automatisch aus und reagieren selbst auf Ausfälle. Für große Netze.</small></div>
        </div>
        <p class="feldtitel">Die wichtigsten Routing-Protokolle</p>
        <div class="record-liste">
          ${[['RIP', 'Distanzvektor', 'zählt nur die Hops (max. 15), alt und langsam'],
             ['OSPF', 'Link-State', 'berechnet Kosten nach Bandbreite (Dijkstra), Standard in Firmennetzen'],
             ['BGP', 'Pfadvektor', 'verbindet die Netze der Provider (Autonome Systeme), das „Protokoll des Internets“']]
            .map(([t, n, b]) => `<div class="record"><span class="record-typ">${t}</span><div><strong>${n}</strong><small style="font-family:var(--schrift)">${b}</small></div></div>`).join('')}
        </div>
        <p class="hinweis">💡 RIP und OSPF sind <strong>IGPs</strong> (innerhalb einer Organisation), BGP ist ein <strong>EGP</strong> (zwischen Organisationen).</p>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Welches Routing-Protokoll tauschen die großen Internetprovider untereinander aus?',
          antworten: ['RIP', 'OSPF', 'BGP', 'DHCP'],
          richtig: 2,
          erklaerung: '<strong>BGP</strong> (Border Gateway Protocol) verbindet die Autonomen Systeme der Provider. Ohne BGP gäbe es kein Internet!'
        }, api);
      }
    },

    // 5 ─ RIP vs OSPF
    {
      titel: 'RIP gegen OSPF: Wer nimmt welchen Weg? 🏁',
      sperre: true,
      inhalt: () => `
        <p>Ein Paket soll von Router <strong>A</strong> zu Router <strong>E</strong>. Es gibt zwei Wege:</p>
        <svg class="netzplan" viewBox="0 0 320 190" role="img" aria-label="Netzplan mit zwei Wegen von A nach E">
          <g class="np-linien">
            <line x1="40" y1="95" x2="160" y2="30" data-weg="kurz"/><line x1="160" y1="30" x2="280" y2="95" data-weg="kurz"/>
            <line x1="40" y1="95" x2="110" y2="160" data-weg="schnell"/><line x1="110" y1="160" x2="210" y2="160" data-weg="schnell"/><line x1="210" y1="160" x2="280" y2="95" data-weg="schnell"/>
          </g>
          <g class="np-label">
            <text x="88" y="52">10 Mbit/s</text><text x="232" y="52">10 Mbit/s</text>
            <text x="58" y="140">1 Gbit/s</text><text x="160" y="180">1 Gbit/s</text><text x="262" y="140">1 Gbit/s</text>
          </g>
          ${[['A', 40, 95], ['B', 160, 30], ['C', 110, 160], ['D', 210, 160], ['E', 280, 95]].map(([n, x, y]) => `
            <g transform="translate(${x} ${y})"><circle r="17" class="np-knoten"/><text class="np-name" text-anchor="middle" dominant-baseline="central">${n}</text></g>`).join('')}
        </svg>
        <div class="weg-legende">
          <span>🔵 Weg 1: A → B → E · <b>2 Hops</b>, langsame Leitungen</span>
          <span>🟢 Weg 2: A → C → D → E · <b>3 Hops</b>, schnelle Leitungen</span>
        </div>
        <div class="karte" data-spiel>
          <p class="feldtitel" id="wegFrage"></p>
          <div class="dmz-wahl">
            <button type="button" class="miniquiz-btn zone-btn" data-weg-wahl="kurz">🔵 A → B → E</button>
            <button type="button" class="miniquiz-btn zone-btn" data-weg-wahl="schnell">🟢 A → C → D → E</button>
          </div>
          <div id="wegFeedback"></div>
        </div>`,
      init(box, api) {
        const AUFGABEN = [
          { frage: '🎮 Welchen Weg wählt <strong>RIP</strong>?', weg: 'kurz', erkl: 'RIP zählt nur die <strong>Hops</strong>: 2 sind weniger als 3. Dass die Leitungen langsam sind, ist RIP egal! 🐌' },
          { frage: '🎮 Und welchen Weg wählt <strong>OSPF</strong>?', weg: 'schnell', erkl: 'OSPF rechnet mit <strong>Kosten</strong> (Referenz ÷ Bandbreite). 3 schnelle Gigabit-Leitungen sind viel „billiger“ als 2 lahme 10-Mbit-Leitungen! 🚀' }
        ];
        const knoepfe = box.querySelectorAll('[data-weg-wahl]');
        const antwort = rundenSpiel(box, {
          api, aufgaben: AUFGABEN, verzoegerung: 2600,
          zeigen: a => {
            box.querySelector('#wegFrage').innerHTML = a.frage;
            knoepfe.forEach(b => { b.disabled = false; b.classList.remove('richtig', 'falsch'); });
            box.querySelectorAll('.np-linien line').forEach(l => l.classList.remove('aktiv'));
          },
          pruefen: (a, wahl) => {
            if (wahl !== a.weg) {
              box.querySelector('#wegFeedback').innerHTML = Baustein.bot(a.weg === 'kurz' ? 'Hmm! Woran misst RIP die Entfernung? Nur an der Zahl der Router … 🤔' : 'Hmm! OSPF schaut nicht auf die Anzahl der Hops, sondern auf die <strong>Bandbreite</strong> … 🤔', '🤔');
              return false;
            }
            box.querySelector(`[data-weg-wahl="${wahl}"]`).classList.add('richtig');
            knoepfe.forEach(b => (b.disabled = true));
            box.querySelectorAll(`.np-linien line[data-weg="${wahl}"]`).forEach(l => l.classList.add('aktiv'));
            box.querySelector('#wegFeedback').innerHTML = Baustein.bot(`✔ ${a.erkl}`, '🤩');
            return true;
          },
          fertigText: () => {
            box.querySelector('#wegFrage').innerHTML = '🏁 Rennen entschieden!';
            box.querySelector('#wegFeedback').innerHTML = Baustein.bot('Deshalb nutzt man in Firmennetzen <strong>OSPF</strong>: Es wählt den <em>schnellsten</em> Weg, nicht den mit den wenigsten Stationen. 💡', '😎');
          }
        });
        knoepfe.forEach(b => b.onclick = () => antwort(b.dataset.wegWahl, b));
      }
    },

    // 6 ─ TTL & tracert
    {
      titel: 'TTL und tracert 🔍',
      sperre: true,
      inhalt: () => `
        <p>Was passiert, wenn sich Router irren und ein Paket im Kreis schicken? Damit es nicht ewig kreist, hat jedes IP-Paket eine <strong>TTL</strong> (Time to Live).</p>
        <div class="ttl-kette">
          ${[64, 63, 62, 61].map((t, i) => `<div><span>${i === 0 ? '💻' : '🧭'}</span><b>TTL ${t}</b></div>`).join('<i>→</i>')}<i>→ …</i>
        </div>
        <p class="hinweis" style="text-align:center">Jeder Router zieht 1 ab. Bei <strong>0</strong> wird das Paket verworfen, und der Absender bekommt eine ICMP-Meldung „Time Exceeded“.</p>
        ${Baustein.bot('Genau diesen Trick nutzt <code>tracert</code> (Windows) bzw. <code>traceroute</code> (Linux): Es schickt Pakete mit TTL 1, 2, 3 … So antwortet jeder Router auf dem Weg einmal, und du siehst die komplette Route! 🕵️')}
        <div class="konsole">
          <div><span>C:\\&gt; tracert example.de</span><b></b></div>
          <div><span>  1    1 ms</span><b>192.168.1.1 (Router)</b></div>
          <div><span>  2    8 ms</span><b>80.1.1.1 (Provider)</b></div>
          <div><span>  3   12 ms</span><b>…</b></div>
          <div><span>  7   18 ms</span><b>93.184.216.34 ✅</b></div>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Ein Paket startet mit TTL 3. Was passiert beim dritten Router?',
          antworten: ['Es wird normal weitergeleitet', 'Die TTL wird 0, das Paket wird verworfen', 'Die TTL wird wieder auf 64 gesetzt', 'Der Router schickt es zurück zum Absender'],
          richtig: 1,
          erklaerung: '3 → 2 → 1 → <strong>0</strong>: Der dritte Router verwirft das Paket und meldet per ICMP „Time Exceeded“ zurück. Genau so findet tracert Hop Nr. 3!'
        }, api);
      }
    },

    // 7 ─ Spickzettel
    {
      titel: 'Geschafft! 🏆',
      inhalt: () => `
        ${Baustein.bot('Du findest jetzt jeden Weg durchs Netz! 🧭 Dein <strong>Spickzettel</strong>:', '🥳')}
        <div class="karte spickzettel">
          <ul class="haken-liste">
            <li><strong>Router</strong> = Schicht 3, verbindet Netze anhand der Ziel-IP</li>
            <li>Ziel im eigenen Netz → <strong>direkt</strong>, sonst → <strong>Standardgateway</strong></li>
            <li><strong>Routing-Tabelle:</strong> Zielnetz + Next Hop/Interface</li>
            <li><strong>Longest Prefix Match:</strong> der genaueste Eintrag gewinnt</li>
            <li><strong>Default-Route</strong> <code>0.0.0.0/0</code> = „alles andere“</li>
            <li><strong>Statisch</strong> (von Hand) vs. <strong>dynamisch</strong> (RIP, OSPF, BGP)</li>
            <li><strong>RIP:</strong> Hops (max. 15) · <strong>OSPF:</strong> Kosten/Bandbreite · <strong>BGP:</strong> Internet</li>
            <li><strong>TTL</strong> verhindert Endlosschleifen, <strong>tracert</strong> zeigt die Route</li>
          </ul>
        </div>`
    }
  ]
});

// ───────────── Lektion: Projektmanagement ─────────────
// Beispielprojekt für Netzplan und Gantt: Dauer in Tagen, Vorgänger, berechnete Werte
const PM_VORGAENGE = [
  { id: 'A', name: 'Bedarf analysieren', dauer: 2, vor: [], faz: 0, fez: 2, saz: 0, sez: 2 },
  { id: 'B', name: 'Hardware bestellen', dauer: 3, vor: ['A'], faz: 2, fez: 5, saz: 3, sez: 6 },
  { id: 'C', name: 'Software vorbereiten', dauer: 4, vor: ['A'], faz: 2, fez: 6, saz: 2, sez: 6 },
  { id: 'D', name: 'Installieren & testen', dauer: 2, vor: ['B', 'C'], faz: 6, fez: 8, saz: 6, sez: 8 }
];

function netzplanKnoten(v, zeigen) {
  const w = x => (zeigen ? x : '?');
  const gp = v.saz - v.faz;
  return `
    <div class="np-vorgang ${zeigen && gp === 0 ? 'kritisch' : ''}" data-v="${v.id}">
      <div class="np-zeile"><span title="FAZ">${w(v.faz)}</span><span title="Dauer">${v.dauer} T</span><span title="FEZ">${w(v.fez)}</span></div>
      <div class="np-titel"><b>${v.id}</b> ${v.name}</div>
      <div class="np-zeile"><span title="SAZ">${w(v.saz)}</span><span title="Gesamtpuffer">GP ${w(gp)}</span><span title="SEZ">${w(v.sez)}</span></div>
    </div>`;
}

LEKTIONEN.push({
  id: 'projektmanagement',
  titel: 'Projektmanagement',
  emoji: '📋',
  farbe: 'f-quiz',
  dauer: 'ca. 20 Minuten',
  ueben: { link: '#/quiz', text: '❓ Jetzt im Quiz testen' },
  beschreibung: 'Projektphasen, Lasten- und Pflichtenheft, Netzplan mit kritischem Pfad, Gantt, Nutzwertanalyse und Scrum.',
  schritte: [
    // 1 ─ Was ist ein Projekt?
    {
      titel: 'Was ist überhaupt ein Projekt? 🤔',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('Nicht jede Aufgabe ist ein Projekt! Laut <strong>DIN 69901</strong> ist ein Projekt ein Vorhaben, das im Wesentlichen durch die <strong>Einmaligkeit</strong> seiner Bedingungen gekennzeichnet ist.')}
        <div class="karte">
          <p class="feldtitel">Merkmale eines Projekts</p>
          <ul class="haken-liste">
            <li><strong>einmalig</strong> und neuartig, also keine Routine</li>
            <li><strong>zeitlich begrenzt</strong> mit festem Start und Ende</li>
            <li>klares <strong>Ziel</strong></li>
            <li><strong>begrenzte Ressourcen</strong> (Geld, Personal, Material)</li>
            <li>oft <strong>komplex</strong> und mit einer eigenen Projektorganisation</li>
          </ul>
        </div>
        <div class="dreieck">
          <svg viewBox="0 0 240 170" role="img" aria-label="Magisches Dreieck aus Zeit, Kosten und Qualität">
            <polygon points="120,20 30,150 210,150" class="dreieck-flaeche"/>
            <text x="120" y="12" text-anchor="middle">⏱️ Zeit</text>
            <text x="30" y="168" text-anchor="middle">💶 Kosten</text>
            <text x="210" y="168" text-anchor="middle">⭐ Qualität</text>
            <text x="120" y="110" text-anchor="middle" class="dreieck-mitte">Projekt</text>
          </svg>
          <p class="hinweis" style="text-align:center">Das <strong>magische Dreieck</strong>: Ändert sich eine Ecke, wirkt sich das auf die anderen aus. Mehr Qualität in kürzerer Zeit kostet mehr Geld!</p>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Welche dieser Aufgaben ist <strong>kein</strong> Projekt?',
          antworten: ['Umstellung von 50 PCs auf Windows 11', 'Tägliche Kontrolle der Datensicherung', 'Aufbau eines neuen Firmen-WLANs', 'Einführung eines Ticketsystems'],
          richtig: 1,
          erklaerung: 'Die tägliche Backup-Kontrolle ist <strong>Routine</strong>: Sie wiederholt sich immer wieder und hat kein Ende. Die anderen sind einmalig, zeitlich begrenzt und haben ein klares Ziel.'
        }, api);
      }
    },

    // 2 ─ Phasen
    {
      titel: 'Die Projektphasen 🪜',
      sperre: true,
      inhalt: () => `
        <p>Nach <strong>DIN 69901</strong> läuft ein Projekt in fünf Phasen ab. 🎮 <strong>Bring sie in die richtige Reihenfolge!</strong></p>
        <div class="karte">
          <div class="dora-log" id="phasenLog"></div>
          <div class="sortier-auswahl" id="phasenAuswahl"></div>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        const PHASEN = [
          ['Initialisierung', '💡', 'Die Idee entsteht, der Auftrag wird erteilt, und der Projektleiter wird benannt.'],
          ['Definition', '📝', 'Ziele festlegen (SMART!), Lastenheft und Pflichtenheft, Machbarkeit prüfen.'],
          ['Planung', '🗓️', 'Projektstrukturplan, Termine (Netzplan, Gantt), Ressourcen und Kosten planen.'],
          ['Steuerung', '🎛️', 'Das Projekt wird umgesetzt, der Fortschritt überwacht und bei Abweichungen gegengesteuert.'],
          ['Abschluss', '🏁', 'Abnahme durch den Kunden, Dokumentation, Lessons Learned, Projekt auflösen.']
        ];
        let naechste = 0;
        let fehler = 0;
        const auswahl = box.querySelector('#phasenAuswahl');
        auswahl.innerHTML = mischen(PHASEN.map((p, i) => [i, ...p])).map(([i, n, e]) => `<button type="button" class="sortier-btn" data-i="${i}">${e} ${n}</button>`).join('');
        auswahl.querySelectorAll('.sortier-btn').forEach(b => b.onclick = () => {
          if (Number(b.dataset.i) !== naechste) {
            fehler++;
            b.classList.remove('wackeln'); void b.offsetWidth; b.classList.add('wackeln');
            return;
          }
          b.remove();
          const [n, e, t] = PHASEN[naechste];
          box.querySelector('#phasenLog').insertAdjacentHTML('beforeend', `
            <div class="dora-zeile client"><span class="dora-buchstabe">${naechste + 1}</span><div><strong>${e} ${n}</strong><small>${t}</small></div></div>`);
          naechste++;
          if (naechste === PHASEN.length) {
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot(`<strong>${fehler === 0 ? 'Fehlerfrei! 🏆' : 'Richtig sortiert! 🎉'}</strong> Eselsbrücke: <em>„<b>I</b>ch <b>d</b>enke, <b>p</b>lane, <b>s</b>teuere, <b>a</b>bschließen!“</em>`, '🤩');
            api.xp(fehler === 0 ? 10 : 5, box.querySelector('#phasenLog'));
            api.freigeben();
          }
        });
      }
    },

    // 3 ─ Lastenheft / Pflichtenheft / SMART
    {
      titel: 'Lastenheft, Pflichtenheft und SMART 📝',
      sperre: true,
      inhalt: () => `
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">🏢</span><strong>Lastenheft</strong><small>vom <strong>Auftraggeber</strong><br>WAS soll erreicht werden und WOFÜR?</small></div>
          <div class="host-box"><span class="gross-emoji">👷</span><strong>Pflichtenheft</strong><small>vom <strong>Auftragnehmer</strong><br>WIE und WOMIT wird es umgesetzt?</small></div>
        </div>
        <div class="karte">
          <p class="feldtitel">Gute Ziele sind SMART 🎯</p>
          <div class="smart">
            ${[['S', 'Spezifisch', 'eindeutig beschrieben'], ['M', 'Messbar', 'man kann prüfen, ob es erreicht ist'], ['A', 'Attraktiv / Akzeptiert', 'alle tragen es mit'], ['R', 'Realistisch', 'mit den Mitteln erreichbar'], ['T', 'Terminiert', 'mit festem Termin']]
              .map(([b, n, t]) => `<div><b>${b}</b><span><strong>${n}</strong><small>${t}</small></span></div>`).join('')}
          </div>
          <p class="hinweis" style="margin-bottom:0">❌ „Das WLAN soll besser werden.“<br>✅ „Bis 30.06. haben alle 4 Büroetagen WLAN mit mind. 300 Mbit/s.“</p>
        </div>
        <div class="karte zuordnen" data-spiel>
          <p class="feldtitel">🎮 Lastenheft oder Pflichtenheft?</p>
          <div class="zuordnen-kopf"><span class="hinweis" id="lpStand"></span></div>
          <div class="zuordnen-begriff" id="lpAufgabe" style="font-size:1.05rem"></div>
          <div class="dmz-wahl">
            <button type="button" class="miniquiz-btn zone-btn" data-lp="lasten">🏢 Lastenheft</button>
            <button type="button" class="miniquiz-btn zone-btn" data-lp="pflicht">👷 Pflichtenheft</button>
          </div>
          <div id="lpFeedback"></div>
        </div>`,
      init(box, api) {
        const AUFGABEN = mischen([
          ['„Alle Mitarbeiter sollen von zu Hause sicher auf das Firmennetz zugreifen können.“', 'lasten', 'Das ist eine <strong>Anforderung</strong> des Kunden (WAS), also Lastenheft.'],
          ['„Wir setzen eine Sophos-Firewall mit WireGuard-VPN ein.“', 'pflicht', 'Hier steht, <strong>WIE und WOMIT</strong> es umgesetzt wird, also Pflichtenheft.'],
          ['„Das Budget beträgt maximal 15.000 €.“', 'lasten', 'Rahmenbedingungen des Auftraggebers stehen im Lastenheft.'],
          ['„Die Clients werden per Intune mit Windows 11 Pro ausgerollt.“', 'pflicht', 'Konkrete technische Umsetzung, also Pflichtenheft.'],
          ['„Das neue System muss bis zum 1. Juli laufen.“', 'lasten', 'Der Wunschtermin des Kunden ist eine Anforderung, also Lastenheft.'],
          ['„Die Server werden in einem Cluster aus 3 Proxmox-Hosts betrieben.“', 'pflicht', 'Technische Lösung des Dienstleisters, also Pflichtenheft.']
        ]).slice(0, 5);
        const knoepfe = box.querySelectorAll('[data-lp]');
        const antwort = rundenSpiel(box, {
          api, aufgaben: AUFGABEN,
          zeigen: (a, i) => {
            box.querySelector('#lpStand').textContent = `${i + 1} von ${AUFGABEN.length}`;
            const el = box.querySelector('#lpAufgabe');
            el.textContent = a[0];
            el.classList.remove('neu'); void el.offsetWidth; el.classList.add('neu');
            knoepfe.forEach(b => { b.disabled = false; b.classList.remove('richtig', 'falsch'); });
          },
          pruefen: (a, wahl) => {
            if (wahl !== a[1]) {
              box.querySelector('#lpFeedback').innerHTML = Baustein.bot('Überleg mal: Beschreibt der Satz, <strong>WAS</strong> gebraucht wird, oder <strong>WIE</strong> es technisch gelöst wird? 🤔', '🤔');
              return false;
            }
            box.querySelector(`[data-lp="${wahl}"]`).classList.add('richtig');
            knoepfe.forEach(b => (b.disabled = true));
            box.querySelector('#lpFeedback').innerHTML = Baustein.bot(`✔ ${a[2]}`, '🤩');
            return true;
          },
          fertigText: fehler => {
            box.querySelector('#lpAufgabe').textContent = '🎉 Alles richtig zugeordnet!';
            box.querySelector('#lpStand').textContent = '';
            knoepfe.forEach(b => (b.disabled = true));
            box.querySelector('#lpFeedback').innerHTML = Baustein.bot(fehler === 0 ? '<strong>Fehlerfrei!</strong> Lastenheft = WAS, Pflichtenheft = WIE. 💪' : `<strong>Geschafft!</strong> ${fehler} ${fehler === 1 ? 'Fehlversuch' : 'Fehlversuche'}. Merk dir: Lastenheft = WAS, Pflichtenheft = WIE.`, '🥳');
          }
        });
        knoepfe.forEach(b => b.onclick = () => antwort(b.dataset.lp, b));
      }
    },

    // 4 ─ Netzplan
    {
      titel: 'Der Netzplan: kritischer Pfad 🕸️',
      sperre: true,
      inhalt: () => `
        <p>Ein <strong>Netzplan</strong> zeigt, welche Vorgänge voneinander abhängen und wie lange das Projekt dauert. Unser Beispiel: neue Arbeitsplätze einrichten.</p>
        <div class="np-legende">
          <div class="np-vorgang muster">
            <div class="np-zeile"><span>FAZ</span><span>Dauer</span><span>FEZ</span></div>
            <div class="np-titel">Vorgang</div>
            <div class="np-zeile"><span>SAZ</span><span>GP</span><span>SEZ</span></div>
          </div>
          <small><b>FAZ/FEZ</b> = frühester Anfang/frühestes Ende (vorwärts rechnen)<br><b>SAZ/SEZ</b> = spätester Anfang/spätestes Ende (rückwärts rechnen)<br><b>GP</b> = Gesamtpuffer = SAZ − FAZ</small>
        </div>
        <div class="netzplan-diagramm" id="npDiagramm"></div>
        ${Baustein.bot('Vorwärts: Der FAZ eines Vorgangs ist der <strong>größte</strong> FEZ seiner Vorgänger. D muss also warten, bis B <em>und</em> C fertig sind!')}
        <div class="karte" data-spiel>
          <p class="hinweis" id="npStand" style="margin:0"></p>
          <p class="feldtitel" id="npFrage"></p>
          <div class="np-wahl" id="npWahl"></div>
          <div id="npFeedback"></div>
        </div>`,
      init(box, api) {
        const zeichnen = zeigen => {
          const v = id => netzplanKnoten(PM_VORGAENGE.find(x => x.id === id), zeigen);
          box.querySelector('#npDiagramm').innerHTML = `
            <div class="np-spalte">${v('A')}</div>
            <div class="np-pfeile">➜</div>
            <div class="np-spalte zwei">${v('B')}${v('C')}</div>
            <div class="np-pfeile">➜</div>
            <div class="np-spalte">${v('D')}</div>`;
        };
        zeichnen(false);
        const AUFGABEN = [
          { frage: 'Wann kann <strong>D</strong> frühestens anfangen (FAZ)?', optionen: ['Tag 5', 'Tag 6', 'Tag 7'], loesung: 'Tag 6', erkl: 'B endet an Tag 5, C an Tag 6. D braucht beide, also wird der <strong>größere</strong> Wert genommen → Tag 6.' },
          { frage: 'Wie lange dauert das ganze Projekt?', optionen: ['7 Tage', '8 Tage', '11 Tage'], loesung: '8 Tage', erkl: 'FEZ von D = 6 + 2 = <strong>8 Tage</strong>. (11 wäre falsch, weil B und C parallel laufen!)' },
          { frage: 'Wie viel Gesamtpuffer hat <strong>B</strong>?', optionen: ['0 Tage', '1 Tag', '3 Tage'], loesung: '1 Tag', erkl: 'Rückwärts: B muss spätestens an Tag 6 fertig sein (SEZ 6) → SAZ = 6 − 3 = 3. GP = SAZ − FAZ = 3 − 2 = <strong>1 Tag</strong>.' },
          { frage: 'Welcher Weg ist der <strong>kritische Pfad</strong>?', optionen: ['A → B → D', 'A → C → D'], loesung: 'A → C → D', erkl: 'Alle Vorgänge mit <strong>Puffer 0</strong> liegen auf dem kritischen Pfad: A, C und D. Verzögert sich einer davon, verzögert sich das ganze Projekt! 🚨' }
        ];
        const antwort = rundenSpiel(box, {
          api, aufgaben: AUFGABEN, verzoegerung: 2400,
          zeigen: (a, i) => {
            box.querySelector('#npStand').textContent = `Frage ${i + 1} von ${AUFGABEN.length}`;
            box.querySelector('#npFrage').innerHTML = `🎮 ${a.frage}`;
            box.querySelector('#npWahl').innerHTML = a.optionen.map(o => `<button type="button" class="miniquiz-btn" data-np="${o}">${o}</button>`).join('');
            box.querySelectorAll('[data-np]').forEach(b => b.onclick = () => antwort(b.dataset.np, b));
          },
          pruefen: (a, wahl) => {
            if (wahl !== a.loesung) {
              box.querySelector('#npFeedback').innerHTML = Baustein.bot('Nicht ganz! Schau dir die Dauer und die Abhängigkeiten nochmal genau an. 🔍', '🤔');
              return false;
            }
            box.querySelector(`[data-np="${wahl}"]`).classList.add('richtig');
            box.querySelectorAll('[data-np]').forEach(b => (b.disabled = true));
            box.querySelector('#npFeedback').innerHTML = Baustein.bot(`✔ ${a.erkl}`, '🤩');
            return true;
          },
          fertigText: () => {
            zeichnen(true);
            box.querySelector('#npStand').textContent = '';
            box.querySelector('#npFrage').innerHTML = '🎉 Netzplan komplett!';
            box.querySelector('#npWahl').innerHTML = '';
            box.querySelector('#npFeedback').innerHTML = Baustein.bot('Oben siehst du jetzt alle Werte. Der <strong>kritische Pfad</strong> (rot) ist A → C → D. Netzpläne kommen in der Prüfung sehr oft dran. 💪', '😎');
          }
        });
      }
    },

    // 5 ─ Gantt & Meilensteine
    {
      titel: 'Gantt-Diagramm und Meilensteine 📊',
      sperre: true,
      inhalt: () => `
        <p>Das gleiche Projekt als <strong>Gantt-Diagramm</strong> (Balkenplan): Man sieht auf einen Blick, <em>wann</em> was passiert.</p>
        <div class="gantt">
          <div class="gantt-kopf"><span></span>${Array.from({ length: 8 }, (_, i) => `<i>${i + 1}</i>`).join('')}</div>
          ${PM_VORGAENGE.map(v => `
            <div class="gantt-zeile">
              <span><b>${v.id}</b> ${v.name}</span>
              <div class="gantt-spur">
                <div class="gantt-balken ${v.saz - v.faz === 0 ? 'kritisch' : ''}" style="left:${v.faz / 8 * 100}%;width:${v.dauer / 8 * 100}%"></div>
                ${v.saz > v.faz ? `<div class="gantt-puffer" style="left:${v.fez / 8 * 100}%;width:${(v.saz - v.faz) / 8 * 100}%"></div>` : ''}
              </div>
            </div>`).join('')}
          <div class="gantt-zeile">
            <span>🏁 Go-Live</span>
            <div class="gantt-spur"><div class="meilenstein" style="left:100%">◆</div></div>
          </div>
        </div>
        <p class="hinweis">🟥 kritischer Pfad · 🟦 Vorgang · ▒ Puffer · ◆ Meilenstein</p>
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">📊</span><strong>Gantt</strong><small>zeigt Zeiträume übersichtlich, gut für Kunden und das Team</small></div>
          <div class="host-box"><span class="gross-emoji">🕸️</span><strong>Netzplan</strong><small>zeigt Abhängigkeiten, Puffer und den kritischen Pfad genau</small></div>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Was ist ein <strong>Meilenstein</strong>?',
          antworten: ['Der längste Vorgang im Projekt', 'Ein wichtiges Ereignis ohne Dauer, z. B. eine Abnahme', 'Ein Vorgang mit viel Puffer', 'Das Budget des Projekts'],
          richtig: 1,
          erklaerung: 'Ein Meilenstein ist ein <strong>Zeitpunkt</strong> (Dauer 0), an dem etwas Wichtiges erreicht oder geprüft wird, z. B. „Hardware geliefert“ oder „Go-Live“.'
        }, api);
      }
    },

    // 6 ─ Nutzwertanalyse
    {
      titel: 'Entscheiden mit der Nutzwertanalyse ⚖️',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('Der Kunde braucht neue Notebooks. Zwei Angebote, aber welches ist besser? Der Preis allein reicht nicht! Mit der <strong>Nutzwertanalyse</strong> bewertest du auch „weiche“ Kriterien.')}
        <div class="karte">
          <table class="ergebnis-tabelle nutzwert">
            <tr><th>Kriterium</th><th>Gewicht</th><th>💻 A</th><th>💻 B</th></tr>
            <tr><td>💶 Preis</td><td>40 %</td><td>8</td><td>5</td></tr>
            <tr><td>⚡ Leistung</td><td>30 %</td><td>6</td><td>9</td></tr>
            <tr><td>🛠️ Service</td><td>30 %</td><td>5</td><td>8</td></tr>
            <tr class="summe" id="nwSumme"><td><strong>Nutzwert</strong></td><td>100 %</td><td>?</td><td>?</td></tr>
          </table>
          <p class="hinweis" style="margin-bottom:0">Punkte von 1 (schlecht) bis 10 (super). Rechnung: Punkte × Gewicht, dann alles zusammenzählen.</p>
        </div>
        <div class="karte" data-spiel>
          <p class="feldtitel">🎮 Rechne nach: Welches Angebot gewinnt?</p>
          <div class="dmz-wahl">
            <button type="button" class="miniquiz-btn zone-btn" data-nw="A">💻 Angebot A</button>
            <button type="button" class="miniquiz-btn zone-btn" data-nw="B">💻 Angebot B</button>
          </div>
          <div data-erfolg></div>
        </div>`,
      init(box, api) {
        box.querySelectorAll('[data-nw]').forEach(b => b.onclick = () => {
          if (b.dataset.nw !== 'B') {
            b.classList.add('falsch');
            b.disabled = true;
            box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('A ist zwar günstiger, aber rechne mal alle Kriterien durch! 🧮 Tipp: 8 × 0,4 = 3,2 …', '🤔');
            return;
          }
          b.classList.add('richtig');
          box.querySelectorAll('[data-nw]').forEach(x => (x.disabled = true));
          box.querySelector('#nwSumme').innerHTML = '<td><strong>Nutzwert</strong></td><td>100 %</td><td>6,5</td><td class="gewinner">7,1 🏆</td>';
          box.querySelector('[data-erfolg]').innerHTML = Baustein.bot('<strong>Richtig, B gewinnt!</strong><br>A: 8×0,4 + 6×0,3 + 5×0,3 = 3,2 + 1,8 + 1,5 = <strong>6,5</strong><br>B: 5×0,4 + 9×0,3 + 8×0,3 = 2,0 + 2,7 + 2,4 = <strong>7,1</strong><br>Obwohl A billiger ist, ist B insgesamt die bessere Wahl. 🎯', '🤩');
          api.xp(10, b);
          api.freigeben();
        });
      }
    },

    // 7 ─ Agil
    {
      titel: 'Wasserfall oder agil? 🌊🔄',
      sperre: true,
      inhalt: () => `
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">🌊</span><strong>Wasserfall</strong><small>Phasen laufen nacheinander ab, alles wird am Anfang geplant. Gut, wenn die Anforderungen klar sind.</small></div>
          <div class="host-box"><span class="gross-emoji">🔄</span><strong>Agil (Scrum)</strong><small>Es wird in kurzen Zyklen gearbeitet und regelmäßig angepasst. Gut, wenn sich Anforderungen ändern.</small></div>
        </div>
        <div class="karte">
          <p class="feldtitel">Scrum in 30 Sekunden</p>
          <div class="scrum-kreis">
            <div><b>📋 Product Backlog</b><small>alle Anforderungen, priorisiert</small></div>
            <i>➜</i>
            <div><b>🗓️ Sprint Planning</b><small>Was schaffen wir im Sprint?</small></div>
            <i>➜</i>
            <div class="sprint"><b>🏃 Sprint (1–4 Wochen)</b><small>mit kurzem <strong>Daily Scrum</strong> jeden Tag</small></div>
            <i>➜</i>
            <div><b>🎁 Review &amp; Retrospektive</b><small>Ergebnis zeigen, Zusammenarbeit verbessern</small></div>
          </div>
          <p class="hinweis" style="margin-bottom:0"><strong>Rollen:</strong> Product Owner (WAS wird gebaut), Scrum Master (sorgt für den Prozess), Developers (das Team)</p>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Wer ist in Scrum dafür verantwortlich, das <strong>Product Backlog</strong> zu priorisieren?',
          antworten: ['Der Scrum Master', 'Der Product Owner', 'Der Geschäftsführer', 'Das ganze Team per Abstimmung'],
          richtig: 1,
          erklaerung: 'Der <strong>Product Owner</strong> vertritt die Kundensicht und entscheidet, was als Nächstes umgesetzt wird. Der Scrum Master kümmert sich um den Prozess.'
        }, api);
      }
    },

    // 8 ─ Abschluss & Spickzettel
    {
      titel: 'Geschafft! 🏆',
      inhalt: () => `
        ${Baustein.bot('Projektmanagement kommt in AP1 <em>und</em> AP2 dran, und du bist jetzt bestens vorbereitet! 📋 Dein <strong>Spickzettel</strong>:', '🥳')}
        <div class="karte spickzettel">
          <ul class="haken-liste">
            <li><strong>Projekt:</strong> einmalig, zeitlich begrenzt, Ziel, begrenzte Ressourcen</li>
            <li><strong>Magisches Dreieck:</strong> Zeit · Kosten · Qualität</li>
            <li><strong>Phasen:</strong> Initialisierung → Definition → Planung → Steuerung → Abschluss</li>
            <li><strong>Lastenheft</strong> (Auftraggeber, WAS) · <strong>Pflichtenheft</strong> (Auftragnehmer, WIE)</li>
            <li><strong>SMART:</strong> spezifisch, messbar, attraktiv, realistisch, terminiert</li>
            <li><strong>Netzplan:</strong> FAZ/FEZ vorwärts, SAZ/SEZ rückwärts, GP = SAZ − FAZ, kritischer Pfad = GP 0</li>
            <li><strong>Gantt</strong> = Balkenplan · <strong>Meilenstein</strong> = Ereignis ohne Dauer</li>
            <li><strong>Nutzwertanalyse:</strong> Punkte × Gewichtung, summieren</li>
            <li><strong>Abschluss:</strong> Abnahmeprotokoll, Dokumentation, Lessons Learned</li>
            <li><strong>Scrum:</strong> Sprints, Daily, Product Owner, Scrum Master</li>
          </ul>
        </div>`
    }
  ]
});

// ───────────── Lektion: Ausbildung & Arbeitsrecht (WiSo) ─────────────
// Spiel mit zwei Antwortknöpfen und mehreren Fällen (z. B. „erlaubt / nicht erlaubt“)
function zweiWahlSpiel(box, api, { titel, optionen, aufgaben, tipp, fertig }) {
  const bereich = box.querySelector('[data-zweiwahl]');
  bereich.innerHTML = `
    <div class="karte zuordnen" data-spiel>
      <p class="feldtitel">🎮 ${titel}</p>
      <div class="zuordnen-kopf"><span class="hinweis" data-stand></span></div>
      <div class="zuordnen-begriff fall" data-fall></div>
      <div class="dmz-wahl">
        ${optionen.map(([id, label]) => `<button type="button" class="miniquiz-btn zone-btn" data-opt="${id}">${label}</button>`).join('')}
      </div>
      <div data-fb></div>
    </div>`;
  const knoepfe = bereich.querySelectorAll('[data-opt]');
  const antwort = rundenSpiel(bereich, {
    api, aufgaben, verzoegerung: 2200,
    zeigen: (a, i) => {
      bereich.querySelector('[data-stand]').textContent = `Fall ${i + 1} von ${aufgaben.length}`;
      const f = bereich.querySelector('[data-fall]');
      f.innerHTML = a.text;
      f.classList.remove('neu'); void f.offsetWidth; f.classList.add('neu');
      knoepfe.forEach(b => { b.disabled = false; b.classList.remove('richtig', 'falsch'); });
    },
    pruefen: (a, wahl) => {
      if (wahl !== a.loesung) {
        bereich.querySelector('[data-fb]').innerHTML = Baustein.bot(a.tipp || tipp, '🤔');
        return false;
      }
      bereich.querySelector(`[data-opt="${wahl}"]`).classList.add('richtig');
      knoepfe.forEach(b => (b.disabled = true));
      bereich.querySelector('[data-fb]').innerHTML = Baustein.bot(`✔ ${a.erkl}`, '🤩');
      return true;
    },
    fertigText: fehler => {
      bereich.querySelector('[data-fall]').innerHTML = '🎉 Alle Fälle gelöst!';
      bereich.querySelector('[data-stand]').textContent = '';
      knoepfe.forEach(b => (b.disabled = true));
      bereich.querySelector('[data-fb]').innerHTML = Baustein.bot(fehler === 0 ? `<strong>Fehlerfrei! 🏆</strong> ${fertig}` : `<strong>Geschafft!</strong> ${fehler} ${fehler === 1 ? 'Fehlversuch' : 'Fehlversuche'}. ${fertig}`, '🥳');
    }
  });
  knoepfe.forEach(b => b.onclick = () => antwort(b.dataset.opt, b));
}

LEKTIONEN.push({
  id: 'wiso-ausbildung',
  titel: 'Ausbildung & Arbeitsrecht',
  emoji: '📜',
  farbe: 'f-karten',
  dauer: 'ca. 15 Minuten',
  ueben: { link: '#/quiz', text: '❓ WiSo-Fragen im Quiz üben' },
  beschreibung: 'Duales System, Rechte und Pflichten, Kündigung, Jugendarbeitsschutz, Sozialversicherung und Mitbestimmung. Mit echten Fällen!',
  schritte: [
    // 1 ─ Duales System
    {
      titel: 'Das duale System 🏫🏢',
      sperre: true,
      inhalt: () => `
        ${Baustein.bot('Auch wenn WiSo nicht nach IT klingt: Es ist ein eigener Prüfungsteil und zählt für dein Ergebnis! Und das Wissen hilft dir, deine eigenen Rechte zu kennen. 💪')}
        <p>„Dual“ heißt: Du lernst an <strong>zwei Lernorten</strong>. Dazu kommt die IHK, die alles überwacht.</p>
        <div class="dual-system">
          <div><span class="gross-emoji">🏢</span><strong>Ausbildungsbetrieb</strong><small>Praxis<br>Grundlage: <b>BBiG</b> + <b>Ausbildungsordnung</b></small></div>
          <div><span class="gross-emoji">🏫</span><strong>Berufsschule</strong><small>Theorie<br>Grundlage: <b>Rahmenlehrplan</b> + Schulgesetze der Länder</small></div>
          <div class="ihk"><span class="gross-emoji">🏛️</span><strong>IHK (zuständige Stelle)</strong><small>überwacht die Ausbildung, trägt den Vertrag ins Verzeichnis ein, berät und nimmt die <b>Prüfungen</b> ab</small></div>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Wer regelt bundesweit einheitlich, <strong>was</strong> im Betrieb für den Beruf Fachinformatiker/in gelernt werden muss?',
          antworten: ['Der Rahmenlehrplan', 'Die Ausbildungsordnung', 'Der Ausbildungsvertrag', 'Die Berufsschule'],
          richtig: 1,
          erklaerung: 'Die <strong>Ausbildungsordnung</strong> legt Berufsbild, Ausbildungsrahmenplan und Prüfungsanforderungen für den <em>Betrieb</em> fest. Der Rahmenlehrplan gilt für die <em>Berufsschule</em>.'
        }, api);
      }
    },

    // 2 ─ Vertrag, Rechte und Pflichten
    {
      titel: 'Ausbildungsvertrag: Rechte und Pflichten 🤝',
      sperre: true,
      inhalt: () => `
        <div class="karte">
          <p class="feldtitel">Was in den Ausbildungsvertrag muss (§ 11 BBiG)</p>
          <div class="vertrag-liste">
            ${['🎯 Art und Ziel der Ausbildung', '📅 Beginn und Dauer', '📍 Ausbildungsstätte', '⏱️ tägliche Ausbildungszeit', '🧪 Dauer der Probezeit (1–4 Monate)', '💶 Vergütung', '🏖️ Urlaub', '✂️ Voraussetzungen der Kündigung', '📎 Hinweis auf Tarifverträge']
              .map(t => `<span>${t}</span>`).join('')}
          </div>
          <p class="hinweis" style="margin-bottom:0">Der Vertrag wird bei der IHK ins <strong>Verzeichnis der Berufsausbildungsverhältnisse</strong> eingetragen. Seit 2020 gibt es eine gesetzliche <strong>Mindestausbildungsvergütung</strong>.</p>
        </div>
        <div data-zweiwahl></div>`,
      init(box, api) {
        zweiWahlSpiel(box, api, {
          titel: 'Wessen Pflicht ist das?',
          optionen: [['azubi', '🎒 Azubi'], ['betrieb', '🏢 Betrieb']],
          tipp: 'Überleg mal: Wer <em>bietet</em> die Ausbildung an, und wer <em>macht</em> sie? 🤔',
          fertig: 'Rechte und Pflichten stehen in §§ 13–16 BBiG.',
          aufgaben: mischen([
            { text: '📚 Ausbildungsmittel (z. B. Laptop, Fachbücher) kostenlos stellen', loesung: 'betrieb', erkl: 'Der Betrieb muss alle Ausbildungsmittel <strong>kostenlos</strong> stellen.' },
            { text: '📝 Den Ausbildungsnachweis (Berichtsheft) führen', loesung: 'azubi', erkl: 'Das macht der Azubi, und der Betrieb muss ihm die Zeit dafür geben. Ohne Nachweis keine Zulassung zur Prüfung!' },
            { text: '🏫 Für den Berufsschulunterricht freistellen', loesung: 'betrieb', erkl: 'Der Betrieb muss für Berufsschule und Prüfungen <strong>freistellen</strong>.' },
            { text: '🤐 Über Betriebs- und Geschäftsgeheimnisse schweigen', loesung: 'azubi', erkl: 'Die <strong>Schweigepflicht</strong> gehört zu den Pflichten des Azubis.' },
            { text: '📄 Am Ende ein Zeugnis ausstellen', loesung: 'betrieb', erkl: 'Der Betrieb muss ein <strong>schriftliches Zeugnis</strong> ausstellen.' },
            { text: '👂 Weisungen des Ausbilders befolgen', loesung: 'azubi', erkl: 'Der Azubi muss Weisungen im Rahmen der Ausbildung befolgen.' },
            { text: '🚫 Nur Aufgaben geben, die dem Ausbildungszweck dienen', loesung: 'betrieb', erkl: 'Dauerhaft Kaffee kochen oder Auto waschen? Nicht erlaubt! Der Betrieb darf nur <strong>ausbildungsbezogene</strong> Aufgaben übertragen.' }
          ]).slice(0, 5)
        });
      }
    },

    // 3 ─ Kündigung
    {
      titel: 'Kündigung in der Ausbildung ✂️',
      sperre: true,
      inhalt: () => `
        <div class="zeitstrahl-kuendigung">
          <div class="phase probe"><b>🧪 Probezeit</b><small>1–4 Monate</small><p>Beide Seiten können <strong>jederzeit ohne Frist</strong> und ohne Grund kündigen.</p></div>
          <div class="phase danach"><b>📆 Nach der Probezeit</b><small>bis zum Ende</small>
            <p><strong>Betrieb:</strong> nur noch fristlos aus <em>wichtigem Grund</em>.<br>
            <strong>Azubi:</strong> aus wichtigem Grund <em>oder</em> mit <strong>4 Wochen Frist</strong>, wenn er die Ausbildung aufgibt oder einen anderen Beruf lernen will.</p></div>
        </div>
        ${Baustein.bot('⚠️ Wichtig: Eine Kündigung muss immer <strong>schriftlich</strong> sein, nach der Probezeit mit Angabe der Gründe. Und bei „wichtigem Grund“ muss innerhalb von <strong>2 Wochen</strong> gekündigt werden, nachdem man davon erfahren hat (§ 22 BBiG).')}
        <div data-zweiwahl></div>`,
      init(box, api) {
        zweiWahlSpiel(box, api, {
          titel: 'Ist die Kündigung wirksam?',
          optionen: [['ja', '✅ Wirksam'], ['nein', '❌ Unwirksam']],
          tipp: 'Prüfe: Probezeit oder danach? Wer kündigt? Gibt es einen wichtigen Grund? Ist sie schriftlich? 🔍',
          fertig: 'Merk dir: In der Probezeit ist fast alles erlaubt, danach wird es streng!',
          aufgaben: [
            { text: 'Im 2. Monat der Probezeit kündigt der Betrieb schriftlich, ohne Grund und ohne Frist.', loesung: 'ja', erkl: 'In der Probezeit darf jede Seite jederzeit ohne Frist und ohne Grund kündigen. Schriftlich muss es trotzdem sein, und das ist es.' },
            { text: 'Nach der Probezeit kündigt der Betrieb dem Azubi, weil die Auftragslage schlecht ist.', loesung: 'nein', erkl: 'Nach der Probezeit kann der Betrieb nur aus <strong>wichtigem Grund</strong> kündigen. Wirtschaftliche Probleme zählen in der Regel nicht dazu.' },
            { text: 'Lena (2. Lehrjahr) will Erzieherin werden. Sie kündigt schriftlich mit Begründung und 4 Wochen Frist.', loesung: 'ja', erkl: 'Berufswechsel ist genau der Fall, in dem der Azubi mit <strong>4 Wochen Frist</strong> kündigen darf. Schriftlich und mit Grund: alles korrekt!' },
            { text: 'Max kündigt nach der Probezeit per WhatsApp: „Hab keinen Bock mehr 👋“', loesung: 'nein', erkl: 'Eine WhatsApp ist nicht <strong>schriftlich</strong>. Die Kündigung ist unwirksam! (Und ein Grund fehlt auch.)' },
            { text: 'Ein Azubi stiehlt nachweislich Firmen-Laptops. Der Betrieb erfährt es und kündigt 3 Tage später fristlos und schriftlich.', loesung: 'ja', erkl: 'Diebstahl ist ein <strong>wichtiger Grund</strong>, und die 2-Wochen-Frist wurde eingehalten → fristlose Kündigung wirksam.' }
          ]
        });
      }
    },

    // 4 ─ Ende der Ausbildung
    {
      titel: 'Ende der Ausbildung 🎓',
      sperre: true,
      inhalt: () => `
        <div class="ende-faelle">
          <div class="karte klein"><b>✅ Prüfung bestanden</b><p>Die Ausbildung endet mit der <strong>Bekanntgabe des Ergebnisses</strong> durch den Prüfungsausschuss, auch wenn die Vertragszeit noch läuft.</p></div>
          <div class="karte klein"><b>❌ Prüfung nicht bestanden</b><p>Auf Verlangen des Azubis wird die Ausbildung bis zur nächsten Wiederholungsprüfung verlängert, <strong>höchstens um 1 Jahr</strong>. Die Prüfung kann <strong>zweimal</strong> wiederholt werden.</p></div>
          <div class="karte klein"><b>⏰ Vertragszeit abgelaufen</b><p>Ohne Prüfung endet die Ausbildung mit dem Ablauf der vereinbarten Ausbildungszeit.</p></div>
        </div>
        ${Baustein.bot('Eine wichtige Falle: Wer nach der Ausbildung einfach weiterarbeitet, ohne dass etwas vereinbart wurde, hat automatisch ein <strong>unbefristetes Arbeitsverhältnis</strong> (§ 24 BBiG)! 😮')}
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Tom besteht am 20. Juni die Abschlussprüfung, sein Vertrag läuft bis 31. Juli. Am 21. Juni arbeitet er einfach weiter, ohne dass etwas besprochen wurde. Was gilt?',
          antworten: ['Er ist bis 31. Juli noch Azubi', 'Er hat ein unbefristetes Arbeitsverhältnis', 'Er hat einen befristeten Vertrag für 1 Jahr', 'Er muss sofort aufhören zu arbeiten'],
          richtig: 1,
          erklaerung: 'Mit dem Bestehen am 20. Juni endete die Ausbildung. Weil er ohne Vereinbarung weiterbeschäftigt wird, entsteht ein <strong>Arbeitsverhältnis auf unbestimmte Zeit</strong> (§ 24 BBiG).'
        }, api);
      }
    },

    // 5 ─ Arbeitszeit & Jugendschutz
    {
      titel: 'Arbeitszeit, Pausen, Urlaub ⏱️',
      sperre: true,
      inhalt: () => `
        <table class="ergebnis-tabelle karte" style="padding:8px">
          <tr><th></th><th>👦 Unter 18<br><small>JArbSchG</small></th><th>🧑 Ab 18<br><small>ArbZG / BUrlG</small></th></tr>
          <tr><td><strong>Arbeitszeit</strong></td><td>max. 8 h/Tag, 40 h/Woche, 5-Tage-Woche</td><td>8 h/Werktag, bis 10 h mit Ausgleich</td></tr>
          <tr><td><strong>Pausen</strong></td><td>30 min ab 4,5 h<br>60 min ab 6 h</td><td>30 min ab 6 h<br>45 min ab 9 h</td></tr>
          <tr><td><strong>Ruhezeit</strong></td><td>12 Stunden</td><td>11 Stunden</td></tr>
          <tr><td><strong>Urlaub</strong></td><td>30 / 27 / 25 Werktage<br><small>unter 16 / 17 / 18 zu Jahresbeginn</small></td><td>24 Werktage<br><small>(= 20 Tage bei 5-Tage-Woche)</small></td></tr>
        </table>
        <p class="hinweis">🏫 Berufsschule für Jugendliche: Ein Schultag mit <strong>mehr als 5 Unterrichtsstunden</strong> (à 45 min) zählt einmal pro Woche als voller Arbeitstag. Danach darf nicht mehr im Betrieb gearbeitet werden.</p>
        <div data-zweiwahl></div>`,
      init(box, api) {
        zweiWahlSpiel(box, api, {
          titel: 'Erlaubt oder nicht?',
          optionen: [['ja', '✅ Erlaubt'], ['nein', '❌ Verboten']],
          tipp: 'Erst klären: Ist die Person unter oder über 18? Dann in der Tabelle oben nachschauen! 👆',
          fertig: 'Jugendliche sind besonders geschützt. Das ist eine typische Prüfungsfrage!',
          aufgaben: [
            { text: 'Azubi Mia (17) soll im Projekt eine Woche lang täglich 9 Stunden arbeiten.', loesung: 'nein', erkl: 'Unter 18 gilt das <strong>JArbSchG</strong>: maximal 8 Stunden täglich (8,5 nur, wenn andere Tage kürzer sind).' },
            { text: 'Azubi Ben (22) arbeitet 7 Stunden am Stück ohne Pause.', loesung: 'nein', erkl: 'Bei mehr als 6 Stunden sind mindestens <strong>30 Minuten Pause</strong> Pflicht (ArbZG).' },
            { text: 'Azubi Lea ist zu Jahresbeginn 16 Jahre alt und bekommt 25 Werktage Urlaub.', loesung: 'nein', erkl: 'Mit 16 zu Jahresbeginn ist sie noch nicht 17 → mindestens <strong>27 Werktage</strong>.' },
            { text: 'Azubi Kai (20) arbeitet wegen einer Server-Migration einmal 10 Stunden und bekommt dafür später Freizeitausgleich.', loesung: 'ja', erkl: 'Für Erwachsene sind bis zu <strong>10 Stunden</strong> erlaubt, wenn der Durchschnitt von 8 Stunden ausgeglichen wird.' },
            { text: 'Tim (17) hat 6 Stunden Berufsschule und soll danach noch für 2 Stunden in den Betrieb.', loesung: 'nein', erkl: 'Mehr als 5 Unterrichtsstunden → einmal pro Woche zählt das als ganzer Arbeitstag. Tim darf danach <strong>nicht mehr</strong> beschäftigt werden.' }
          ]
        });
      }
    },

    // 6 ─ Sozialversicherung
    {
      titel: 'Vom Brutto zum Netto 💶',
      sperre: true,
      inhalt: () => `
        <p>Von deiner Ausbildungsvergütung (brutto) gehen Abzüge weg. Was übrig bleibt, landet auf deinem Konto (netto).</p>
        <div class="saeulen">
          ${[['🏥', 'Kranken­versicherung', 'AG + AN'], ['🧓', 'Pflege­versicherung', 'AG + AN'], ['👵', 'Renten­versicherung', 'AG + AN'], ['💼', 'Arbeitslosen­versicherung', 'AG + AN'], ['🦺', 'Unfall­versicherung', 'nur AG']]
            .map(([e, n, w]) => `<div class="${w === 'nur AG' ? 'nur-ag' : ''}"><span>${e}</span><b>${n}</b><small>${w}</small></div>`).join('')}
        </div>
        <div class="karte">
          <p class="feldtitel">Abzüge vom Bruttolohn</p>
          <ul class="haken-liste">
            <li><strong>Sozialversicherung</strong> (Arbeitnehmeranteil): KV, PV, RV, AV</li>
            <li><strong>Lohnsteuer</strong> und ggf. <strong>Kirchensteuer</strong> (bei Azubi-Vergütungen oft 0 €)</li>
          </ul>
          <p class="hinweis" style="margin-bottom:0">💡 Die Beiträge teilen sich Arbeitgeber und Arbeitnehmer grundsätzlich je zur Hälfte (Ausnahme: den Kinderlosenzuschlag in der Pflegeversicherung zahlt nur der AN). Bei sehr kleinen Ausbildungsvergütungen (bis 325 € im Monat) zahlt der Arbeitgeber alles allein.</p>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'Was wird <strong>nicht</strong> von deinem Bruttolohn abgezogen?',
          antworten: ['Rentenversicherung', 'Krankenversicherung', 'Unfallversicherung', 'Lohnsteuer'],
          richtig: 2,
          erklaerung: 'Die gesetzliche <strong>Unfallversicherung</strong> (Berufsgenossenschaft) zahlt der Arbeitgeber <strong>allein</strong>. Sie taucht auf deiner Abrechnung gar nicht auf.'
        }, api);
      }
    },

    // 7 ─ Mitbestimmung & Tarif
    {
      titel: 'Mitbestimmung und Tarifvertrag 🗳️',
      sperre: true,
      inhalt: () => `
        <div class="vergleich">
          <div class="netz-box"><span class="gross-emoji">👥</span><strong>Betriebsrat</strong><small>vertritt alle Arbeitnehmer<br>ab <strong>5</strong> wahlberechtigten AN<br>(BetrVG)</small></div>
          <div class="host-box"><span class="gross-emoji">🎒</span><strong>JAV</strong><small>Jugend- und Auszubildenden­vertretung<br>ab <strong>5</strong> AN unter 18 oder Azubis unter 25<br>(nur wenn es einen Betriebsrat gibt)</small></div>
        </div>
        <div class="karte">
          <p class="feldtitel">Stufen der Beteiligung des Betriebsrats</p>
          <div class="treppe">
            ${['Information', 'Anhörung', 'Beratung', 'Widerspruch', 'Mitbestimmung'].map((s, i) => `<div style="--h:${30 + i * 16}px"><span>${s}</span></div>`).join('')}
          </div>
          <p class="hinweis" style="margin-bottom:0">Bei der <strong>echten Mitbestimmung</strong> (z. B. Arbeitszeitregelung, Einführung von Überwachungstechnik, § 87 BetrVG) geht nichts ohne Zustimmung des Betriebsrats.</p>
        </div>
        <div class="karte">
          <p class="feldtitel">📑 Tarifvertrag</p>
          <p style="margin:0">Wird zwischen <strong>Gewerkschaft</strong> und <strong>Arbeitgeberverband</strong> (oder einem einzelnen Arbeitgeber) ausgehandelt, ohne den Staat (<strong>Tarifautonomie</strong>). Während der Laufzeit gilt die <strong>Friedenspflicht</strong>: keine Streiks zu den geregelten Themen.</p>
        </div>
        <div data-miniquiz></div>`,
      init(box, api) {
        Baustein.miniQuiz(box, {
          frage: 'In einem Betrieb mit Betriebsrat arbeiten 4 Azubis zwischen 19 und 24 Jahren und ein 17-jähriger Praktikant. Kann eine JAV gewählt werden?',
          antworten: ['Nein, man braucht mindestens 10', 'Ja, es sind 5 Personen, die dafür zählen', 'Nein, alle müssen unter 18 sein', 'Ja, aber nur ohne Betriebsrat'],
          richtig: 1,
          erklaerung: 'Es zählen Arbeitnehmer <strong>unter 18</strong> und <strong>Azubis unter 25</strong>: 4 Azubis + 1 Jugendlicher = 5. Da es einen Betriebsrat gibt, kann eine JAV gewählt werden.'
        }, api);
      }
    },

    // 8 ─ Spickzettel
    {
      titel: 'Geschafft! 🏆',
      inhalt: () => `
        ${Baustein.bot('Super! Damit hast du alle Erklärungen der App durch! 🎉 Hier ist dein WiSo-<strong>Spickzettel</strong>:', '🥳')}
        <div class="karte spickzettel">
          <ul class="haken-liste">
            <li><strong>Duales System:</strong> Betrieb (Ausbildungsordnung) + Berufsschule (Rahmenlehrplan), die IHK überwacht und prüft</li>
            <li><strong>Probezeit:</strong> 1–4 Monate, Kündigung jederzeit ohne Frist</li>
            <li><strong>Danach:</strong> Betrieb nur aus wichtigem Grund, Azubi auch mit 4 Wochen Frist (Berufsaufgabe/-wechsel). Immer <strong>schriftlich</strong></li>
            <li><strong>Ende:</strong> mit Bekanntgabe des Prüfungsergebnisses · Weiterarbeit ohne Absprache = unbefristet</li>
            <li><strong>Unter 18:</strong> 8 h/Tag, 40 h/Woche, Pausen 30/60 min, Urlaub 30/27/25 Werktage</li>
            <li><strong>Ab 18:</strong> 8 h (max. 10 h), Pausen 30/45 min, 11 h Ruhezeit, 24 Werktage Urlaub</li>
            <li><strong>Sozialversicherung:</strong> 5 Säulen, Unfallversicherung zahlt nur der AG</li>
            <li><strong>Betriebsrat</strong> ab 5 AN · <strong>JAV</strong> ab 5 Jugendlichen/Azubis unter 25</li>
            <li><strong>Tarifautonomie</strong> und <strong>Friedenspflicht</strong></li>
          </ul>
        </div>
        <p class="hinweis">ℹ️ Stand der Regelungen: 2026. Gesetze ändern sich manchmal. Im Zweifel gilt immer der aktuelle Gesetzestext bzw. dein Ausbildungsvertrag.</p>`
    }
  ]
});

// ───────────── Themenbereiche: Reihenfolge und Gruppierung auf der Lernen-Seite ─────────────
// lektionen: IDs in empfohlener Lernreihenfolge · geplant: Themen, die als „kommt bald“ angezeigt werden
const LERN_BEREICHE = [
  { id: 'grundlagen', titel: 'Netzwerk-Grundlagen', emoji: '🌐', farbe: 'f-subnetz',
    lektionen: ['osi', 'subnetting', 'routing', 'ipv6'], geplant: [] },
  { id: 'technik', titel: 'Netzwerktechnik & Dienste', emoji: '🔀', farbe: 'f-karten',
    lektionen: ['vlan', 'dns-dhcp'], geplant: [] },
  { id: 'sicherheit', titel: 'IT-Sicherheit', emoji: '🔐', farbe: 'f-eigene',
    lektionen: ['verschluesselung', 'firewall-vpn'], geplant: [] },
  { id: 'server', titel: 'Server & Daten', emoji: '🖥️', farbe: 'f-stand',
    lektionen: ['raid-backup', 'virtualisierung'], geplant: [] },
  { id: 'wirtschaft', titel: 'Projekt & WiSo', emoji: '📋', farbe: 'f-quiz',
    lektionen: ['projektmanagement', 'wiso-ausbildung'], geplant: [] }
];

// Lektionen in der Reihenfolge der Themenbereiche (für „nächste Lektion“-Vorschläge)
const LEKTIONEN_SORTIERT = LERN_BEREICHE.flatMap(b => b.lektionen.map(id => LEKTIONEN.find(l => l.id === id))).filter(Boolean);
