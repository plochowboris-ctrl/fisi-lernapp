// Rechenfunktionen und Aufgabengenerator für IPv4-Subnetting.
// Gerechnet wird mit normalen Zahlen (nicht mit Bit-Operatoren), damit es bei 32 Bit keine Vorzeichenfehler gibt.
const Subnetting = (() => {
  const zufall = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const waehle = arr => arr[Math.floor(Math.random() * arr.length)];

  const ipZuZahl = ip => ip.split('.').reduce((summe, oktett) => summe * 256 + Number(oktett), 0);
  const zahlZuIp = n => [3, 2, 1, 0].map(i => Math.floor(n / 256 ** i) % 256).join('.');
  const maskeZahl = praefix => 2 ** 32 - 2 ** (32 - praefix);
  const maske = praefix => zahlZuIp(maskeZahl(praefix));
  const hostsFuer = praefix => 2 ** (32 - praefix) - 2;

  // Eingabe vereinheitlichen: Leerzeichen weg, führende Nullen weg ("192.168.001.010" -> "192.168.1.10")
  function ipNormal(text) {
    const t = String(text || '').trim().replace(/\s+/g, '').replace(/,/g, '.');
    const teile = t.split('.');
    if (teile.length !== 4 || teile.some(x => !/^\d{1,3}$/.test(x) || Number(x) > 255)) return null;
    return teile.map(Number).join('.');
  }

  function zahlNormal(text) {
    const t = String(text || '').trim().replace(/[\s.']/g, '').replace(/^\//, '');
    return /^\d+$/.test(t) ? Number(t) : null;
  }

  function maskeZuPraefix(m) {
    const n = ipZuZahl(m);
    for (let p = 0; p <= 32; p++) if (maskeZahl(p) === n) return p;
    return null;
  }

  function analysiere(ip, praefix) {
    const n = ipZuZahl(ip);
    const block = 2 ** (32 - praefix);
    const netz = Math.floor(n / block) * block;
    const bc = netz + block - 1;
    return {
      maske: maske(praefix),
      netz: zahlZuIp(netz),
      broadcast: zahlZuIp(bc),
      erster: zahlZuIp(netz + 1),
      letzter: zahlZuIp(bc - 1),
      hosts: hostsFuer(praefix)
    };
  }

  // Erklärt den Rechenweg über das "interessante Oktett" (so wie man es in der Prüfung ohne Taschenrechner macht)
  function rechenweg(ip, praefix) {
    const l = analysiere(ip, praefix);
    const index = praefix % 8 === 0 ? praefix / 8 - 1 : Math.floor(praefix / 8);
    const maskenwert = Number(l.maske.split('.')[index]);
    const block = 256 - maskenwert;
    const wert = Number(ip.split('.')[index]);
    const start = Math.floor(wert / block) * block;
    const name = ['1.', '2.', '3.', '4.'][index];
    return [
      `/${praefix} bedeutet ${praefix} Einsen in der Maske → Subnetzmaske <code>${l.maske}</code>.`,
      `Interessantes Oktett ist das ${name} Oktett (Maskenwert ${maskenwert}). Blockgröße = 256 − ${maskenwert} = <strong>${block}</strong>.`,
      `Die IP hat im ${name} Oktett den Wert ${wert}. Das passende Vielfache von ${block} darunter ist ${start} → Netzadresse <code>${l.netz}</code>.`,
      `Das nächste Netz beginnt bei ${start + block}. Eine Adresse davor ist der Broadcast → <code>${l.broadcast}</code>.`,
      `Erster Host = Netzadresse + 1 (<code>${l.erster}</code>), letzter Host = Broadcast − 1 (<code>${l.letzter}</code>).`,
      `Hosts = 2<sup>${32 - praefix}</sup> − 2 = <strong>${l.hosts.toLocaleString('de-DE')}</strong> (Netzadresse und Broadcast sind nicht nutzbar).`
    ];
  }

  // Zufällige IP aus privaten Bereichen, Präfix passend zum Bereich
  function zufallsIp() {
    const art = waehle(['192', '192', '172', '10']);
    if (art === '192') return { ip: `192.168.${zufall(0, 255)}.${zufall(1, 254)}`, praefix: zufall(24, 30) };
    if (art === '172') return { ip: `172.${zufall(16, 31)}.${zufall(0, 255)}.${zufall(1, 254)}`, praefix: zufall(16, 30) };
    return { ip: `10.${zufall(0, 255)}.${zufall(0, 255)}.${zufall(1, 254)}`, praefix: zufall(12, 30) };
  }

  function aufgabeAnalyse() {
    const { ip, praefix } = zufallsIp();
    return { ip, praefix, loesung: analysiere(ip, praefix), weg: rechenweg(ip, praefix) };
  }

  function aufgabeMaske() {
    const praefix = zufall(8, 30);
    return { richtung: waehle(['zuMaske', 'zuPraefix']), praefix, maske: maske(praefix) };
  }

  // Ein Netz in N gleich große Subnetze aufteilen
  function aufgabeAufteilen() {
    const anzahl = waehle([2, 3, 4, 5, 6, 8, 10, 12, 16]);
    const bits = Math.ceil(Math.log2(anzahl));
    const basis = zufallsIp();
    const praefix = Math.min(basis.praefix, 28 - bits);
    const netz = analysiere(basis.ip, praefix).netz;
    const neuesPraefix = praefix + bits;
    const nr = zufall(2, anzahl);
    const block = 2 ** (32 - neuesPraefix);
    const subnetzStart = ipZuZahl(netz) + (nr - 1) * block;
    const sub = analysiere(zahlZuIp(subnetzStart), neuesPraefix);
    return {
      netz, praefix, anzahl, nr, bits, neuesPraefix,
      loesung: { praefix: neuesPraefix, maske: maske(neuesPraefix), hosts: hostsFuer(neuesPraefix), netz: sub.netz, broadcast: sub.broadcast },
      weg: [
        `${anzahl} Subnetze werden benötigt. 2<sup>${bits}</sup> = ${2 ** bits} ≥ ${anzahl} → es werden <strong>${bits} Bit</strong> vom Hostteil geliehen.`,
        `Neues Präfix = ${praefix} + ${bits} = <strong>/${neuesPraefix}</strong> → Maske <code>${maske(neuesPraefix)}</code>.`,
        `Hosts pro Subnetz = 2<sup>${32 - neuesPraefix}</sup> − 2 = <strong>${hostsFuer(neuesPraefix).toLocaleString('de-DE')}</strong>.`,
        `Jedes Subnetz umfasst ${block.toLocaleString('de-DE')} Adressen. Subnetz Nr. ${nr} beginnt (${nr} − 1) × ${block.toLocaleString('de-DE')} Adressen nach <code>${netz}</code> → <code>${sub.netz}</code>.`,
        `Broadcast von Subnetz ${nr} = Beginn des nächsten Subnetzes − 1 → <code>${sub.broadcast}</code>.`
      ]
    };
  }

  return { ipNormal, zahlNormal, maskeZuPraefix, maske, analysiere, aufgabeAnalyse, aufgabeMaske, aufgabeAufteilen };
})();
