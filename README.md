# FISI Lernapp

Lern-App für die Abschlussprüfung Teil 1 und Teil 2 der Fachinformatiker/innen für Systemintegration.

## Starten

Doppelklick auf `start.bat`. Der Browser öffnet dann http://localhost:8080.

## Aufbau der App

- **🏠 Start**: Tagesziel, Lernserie und Vorschläge, was du heute machen solltest
- **📖 Lernen**: interaktive Erklärungen, sortiert nach Themenbereichen (`LERN_BEREICHE` in `js/lektionen.js`)
- **🎯 Üben**: Schnellstart und alle Trainings:
  - **Quiz**: Multiple-Choice-Fragen zu AP1, AP2 und WiSo mit Erklärung und Note nach IHK-Notenschlüssel
  - **Karteikarten**: Lernkartei mit 5 Fächern. Bekannte Karten kommen erst nach 1, 3, 7 bzw. 30 Tagen wieder
  - **Subnetting-Trainer**: Netz berechnen, Netz aufteilen, Maske ↔ CIDR, jeweils mit Rechenweg
  - **Eigene Aufgaben**: Aufgaben aus alten Prüfungen selbst eintragen (offen oder Multiple Choice), Export und Import als JSON
- **📊 Stand**: Level, Wochenübersicht, Schwachstellen, Details zum Aufklappen, Einstellungen und Datensicherung

Der Lernstand wird im Browser gespeichert (localStorage), also getrennt für jedes Gerät und jeden Browser.

## Inhalte erweitern

- Neue Quizfragen kommen in `data/fragen.js`, neue Karteikarten in `data/karten.js`.
- Jede Frage und jede Karte braucht eine eindeutige `id`.
- Die Fragen sind selbst geschrieben, es sind keine Original-IHK-Aufgaben.

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst und Navigation |
| `css/style.css` | Aussehen (hell und dunkel) |
| `js/app.js` | Alle Seiten der App |
| `js/speicher.js` | Speichern des Lernstands |
| `js/subnetting.js` | Subnetting-Berechnungen |
| `sw.js`, `manifest.webmanifest` | Offline-Nutzung und Installation als App (PWA) |
