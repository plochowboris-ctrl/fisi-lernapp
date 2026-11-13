// Speichert Lernfortschritt und eigene Aufgaben im Browser (localStorage).
// Die Daten bleiben auf dem jeweiligen Gerät. Zum Übertragen gibt es Export/Import.
const Speicher = (() => {
  const KEY = 'fisi-lernapp-v1';
  const TAG = 24 * 60 * 60 * 1000;
  // Wartezeit in Tagen je Karteikasten-Fach (Index = Fach 1–5)
  const FACH_TAGE = [0, 0, 1, 3, 7, 30];

  const leer = () => ({
    quiz: {},          // { frageId: { richtig, falsch, letztesOk, zuletzt } }
    karten: {},        // { kartenId: { fach, faellig } }
    subnetting: {},    // { modus: { richtig, gesamt } }
    eigene: [],        // eigene Aufgaben (Multiple Choice oder offen)
    offen: {},         // { aufgabenId: { gewusst, nicht, letztesOk } }
    xp: 0,             // gesammelte Erfahrungspunkte
    tage: {},          // { 'JJJJ-MM-TT': xp an diesem Tag } → für Lernserie und Wochenübersicht
    ziel: 50,          // Tagesziel in XP
    lektionen: {}      // { lektionId: { schritt, fertig, geloest: [schrittIndex, …] } }
  });

  // Datum als 'JJJJ-MM-TT' in lokaler Zeit (nicht UTC, sonst wechselt der Tag um 1 bzw. 2 Uhr nachts)
  const tagText = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const tagVor = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

  let daten = laden();

  function laden() {
    try {
      const roh = JSON.parse(localStorage.getItem(KEY));
      return Object.assign(leer(), roh || {});
    } catch (e) {
      return leer();
    }
  }

  function sichern() {
    try {
      localStorage.setItem(KEY, JSON.stringify(daten));
    } catch (e) {
      console.warn('Speichern nicht möglich', e);
    }
  }

  function neueId() {
    return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  return {
    get daten() { return daten; },
    FACH_TAGE,
    tagText,
    tagVor,

    // XP gutschreiben, gibt die neue Gesamtzahl zurück
    punkte(n) {
      daten.xp += n;
      const t = tagText(new Date());
      daten.tage[t] = (daten.tage[t] || 0) + n;
      sichern();
      return daten.xp;
    },

    heuteXp() {
      return daten.tage[tagText(new Date())] || 0;
    },

    // Anzahl aufeinanderfolgender Lerntage. Heute zählt mit, wenn schon gelernt wurde.
    // Wurde heute noch nicht gelernt, bleibt die Serie von gestern bestehen.
    serie() {
      let n = 0;
      let start = daten.tage[tagText(new Date())] ? 0 : 1;
      while (daten.tage[tagText(tagVor(start + n))]) n++;
      return n;
    },

    level() {
      // Level 1 ab 0 XP, jedes weitere Level braucht 100 XP mehr als das vorige
      let level = 1, bedarf = 200, rest = daten.xp;
      while (rest >= bedarf) { rest -= bedarf; level++; bedarf += 100; }
      return { level, rest, bedarf };
    },

    lektion(id) {
      return daten.lektionen[id] || (daten.lektionen[id] = { schritt: 0, fertig: false, geloest: [] });
    },

    lektionSpeichern(id, aenderung) {
      Object.assign(this.lektion(id), aenderung);
      sichern();
    },

    zielSetzen(xp) {
      daten.ziel = xp;
      sichern();
    },

    quizErgebnis(id, ok) {
      const e = daten.quiz[id] || (daten.quiz[id] = { richtig: 0, falsch: 0 });
      ok ? e.richtig++ : e.falsch++;
      e.letztesOk = ok;
      e.zuletzt = Date.now();
      sichern();
    },

    karteBewerten(id, gewusst) {
      const k = daten.karten[id] || (daten.karten[id] = { fach: 1, faellig: 0 });
      k.fach = gewusst ? Math.min(5, k.fach + 1) : 1;
      k.faellig = Date.now() + FACH_TAGE[k.fach] * TAG;
      sichern();
    },

    subnetErgebnis(modus, ok) {
      const s = daten.subnetting[modus] || (daten.subnetting[modus] = { richtig: 0, gesamt: 0 });
      s.gesamt++;
      if (ok) s.richtig++;
      sichern();
    },

    offenBewerten(id, gewusst) {
      const o = daten.offen[id] || (daten.offen[id] = { gewusst: 0, nicht: 0 });
      gewusst ? o.gewusst++ : o.nicht++;
      o.letztesOk = gewusst;
      sichern();
    },

    eigeneSpeichern(aufgabe) {
      if (!aufgabe.id) aufgabe.id = neueId();
      const i = daten.eigene.findIndex(a => a.id === aufgabe.id);
      if (i >= 0) daten.eigene[i] = aufgabe; else daten.eigene.push(aufgabe);
      sichern();
      return aufgabe;
    },

    eigeneLoeschen(id) {
      daten.eigene = daten.eigene.filter(a => a.id !== id);
      delete daten.quiz[id];
      delete daten.offen[id];
      sichern();
    },

    // Eigene Aufgaben aus einer Datei hinzufügen (gleiche ID wird überschrieben)
    eigeneImportieren(liste) {
      if (!Array.isArray(liste)) throw new Error('Datei enthält keine Aufgabenliste.');
      let anzahl = 0;
      for (const a of liste) {
        if (!a || !a.frage || !a.typ) continue;
        this.eigeneSpeichern(a);
        anzahl++;
      }
      return anzahl;
    },

    backupText() {
      return JSON.stringify({ app: 'fisi-lernapp', version: 1, datum: new Date().toISOString(), daten }, null, 2);
    },

    backupLaden(text) {
      const obj = JSON.parse(text);
      if (!obj || obj.app !== 'fisi-lernapp' || !obj.daten) throw new Error('Das ist keine Sicherung der FISI Lernapp.');
      daten = Object.assign(leer(), obj.daten);
      sichern();
    },

    zuruecksetzen() {
      daten = leer();
      sichern();
    }
  };
})();
