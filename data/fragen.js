// Übungsfragen im Stil der IHK-Abschlussprüfung (selbst erstellt, keine Original-IHK-Aufgaben).
// Aufbau einer Frage:
//   id:          eindeutige Kennung (nicht ändern, sonst geht der Lernfortschritt dieser Frage verloren)
//   teil:        'AP1' | 'AP2' | 'WiSo'
//   thema:       Themengebiet
//   frage:       Fragetext
//   antworten:   Liste der Antwortmöglichkeiten
//   richtig:     Liste der Indizes der richtigen Antworten (0 = erste Antwort). Mehrere = Mehrfachauswahl
//   erklaerung:  Begründung, die nach dem Beantworten angezeigt wird
const FRAGEN = [
  // ───────────── AP1: Einrichten eines IT-gestützten Arbeitsplatzes ─────────────
  {
    id: 'q001', teil: 'AP1', thema: 'Netzwerkgrundlagen',
    frage: 'Auf welcher Schicht des OSI-Modells arbeitet ein Router?',
    antworten: ['Schicht 2 – Sicherungsschicht', 'Schicht 3 – Vermittlungsschicht', 'Schicht 4 – Transportschicht', 'Schicht 7 – Anwendungsschicht'],
    richtig: [1],
    erklaerung: 'Router vermitteln Pakete anhand der IP-Adresse zwischen Netzen. Das ist Aufgabe der Vermittlungsschicht (Network Layer, Schicht 3). Switches arbeiten klassisch auf Schicht 2 mit MAC-Adressen.'
  },
  {
    id: 'q002', teil: 'AP1', thema: 'Netzwerkgrundlagen',
    frage: 'Welche der folgenden IPv4-Adressen sind private Adressen nach RFC 1918?',
    antworten: ['10.20.30.40', '172.32.1.1', '192.168.178.1', '172.20.5.4'],
    richtig: [0, 2, 3],
    erklaerung: 'Private Bereiche: 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0 – 172.31.255.255) und 192.168.0.0/16. 172.32.1.1 liegt außerhalb von 172.16.0.0/12 und ist daher öffentlich.'
  },
  {
    id: 'q003', teil: 'AP1', thema: 'Netzwerkgrundlagen',
    frage: 'Wie lang ist eine MAC-Adresse?',
    antworten: ['32 Bit', '48 Bit', '64 Bit', '128 Bit'],
    richtig: [1],
    erklaerung: 'Eine MAC-Adresse hat 48 Bit (6 Byte), z. B. 00:1A:2B:3C:4D:5E. Die ersten 24 Bit sind die Herstellerkennung (OUI). 32 Bit hat IPv4, 128 Bit IPv6.'
  },
  {
    id: 'q004', teil: 'AP1', thema: 'Netzwerkgrundlagen',
    frage: 'Wie viele nutzbare Host-Adressen hat ein Netz mit dem Präfix /27?',
    antworten: ['14', '30', '32', '62'],
    richtig: [1],
    erklaerung: '/27 → 32 − 27 = 5 Hostbits. 2⁵ = 32 Adressen, abzüglich Netzadresse und Broadcast = 30 Hosts.'
  },
  {
    id: 'q005', teil: 'AP1', thema: 'Hardware & Speicher',
    frage: 'Wie viele Byte sind 1 KiB (Kibibyte)?',
    antworten: ['1.000 Byte', '1.024 Byte', '8.192 Byte', '1.000.000 Byte'],
    richtig: [1],
    erklaerung: 'Binärpräfixe (IEC): 1 KiB = 2¹⁰ Byte = 1.024 Byte. Dezimalpräfixe (SI): 1 kB = 1.000 Byte.'
  },
  {
    id: 'q006', teil: 'AP1', thema: 'Hardware & Speicher',
    frage: 'Ein Kunde kauft eine SSD, die mit „2 TB“ beworben wird. Windows zeigt eine geringere Kapazität an. Welcher Wert ist richtig umgerechnet?',
    antworten: ['genau 2,00 TiB', 'ca. 1,82 TiB', 'ca. 1,95 TiB', 'ca. 1,60 TiB'],
    richtig: [1],
    erklaerung: 'Hersteller rechnen dezimal: 2 TB = 2 × 10¹² Byte. Windows rechnet binär: 2 × 10¹² ÷ 2⁴⁰ ≈ 1,82 TiB (Windows zeigt das als „1,81 TB“ an).'
  },
  {
    id: 'q007', teil: 'AP1', thema: 'Hardware & Speicher',
    frage: 'Welcher Speicher verliert seinen Inhalt, wenn die Stromversorgung unterbrochen wird?',
    antworten: ['SSD', 'RAM (Arbeitsspeicher)', 'UEFI-Flash', 'HDD'],
    richtig: [1],
    erklaerung: 'RAM (DRAM) ist flüchtig. SSD, HDD und der Flash-Speicher der Firmware sind nicht flüchtig.'
  },
  {
    id: 'q008', teil: 'AP1', thema: 'Wirtschaftlichkeit',
    frage: 'Ein PC hat eine Leistungsaufnahme von 250 W und läuft 8 Stunden pro Tag an 220 Arbeitstagen im Jahr. Wie hoch sind die jährlichen Stromkosten bei 0,30 € pro kWh?',
    antworten: ['13,20 €', '66,00 €', '132,00 €', '1.320,00 €'],
    richtig: [2],
    erklaerung: '250 W × 8 h × 220 Tage = 440.000 Wh = 440 kWh.\n440 kWh × 0,30 €/kWh = 132,00 €.'
  },
  {
    id: 'q009', teil: 'AP1', thema: 'Wirtschaftlichkeit',
    frage: 'Wofür setzt man eine Nutzwertanalyse ein?',
    antworten: [
      'Um die Abschreibung eines Wirtschaftsguts zu berechnen',
      'Um mehrere Angebote auch nach nicht in Geld messbaren Kriterien zu vergleichen',
      'Um den kritischen Pfad eines Projekts zu bestimmen',
      'Um den Break-even-Point zu ermitteln'
    ],
    richtig: [1],
    erklaerung: 'Bei der Nutzwertanalyse werden Kriterien gewichtet (Summe meist 100 %), jede Alternative bekommt Punkte je Kriterium. Punkte × Gewichtung ergibt den Nutzwert. So lassen sich auch „weiche“ Kriterien wie Service oder Bedienbarkeit vergleichen.'
  },
  {
    id: 'q010', teil: 'AP1', thema: 'IT-Sicherheit',
    frage: 'Welcher Begriff gehört NICHT zu den drei klassischen Schutzzielen der Informationssicherheit?',
    antworten: ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Wirtschaftlichkeit'],
    richtig: [3],
    erklaerung: 'Die drei Grundwerte (CIA-Triade) sind Vertraulichkeit (Confidentiality), Integrität (Integrity) und Verfügbarkeit (Availability). Häufig ergänzt werden Authentizität und Verbindlichkeit.'
  },
  {
    id: 'q011', teil: 'AP1', thema: 'IT-Sicherheit',
    frage: 'Was beschreibt die 3-2-1-Regel der Datensicherung?',
    antworten: [
      '3 Sicherungen pro Woche, 2 pro Monat, 1 pro Jahr',
      '3 Kopien der Daten, auf 2 verschiedenen Speichermedien, davon 1 Kopie außer Haus',
      '3 Festplatten im RAID, 2 davon als Spiegel, 1 Hot-Spare',
      '3 Tage Aufbewahrung, 2 Administratoren, 1 Prüfprotokoll'
    ],
    richtig: [1],
    erklaerung: 'Mindestens 3 Kopien (Original + 2 Backups), auf 2 unterschiedlichen Medientypen, 1 Kopie an einem anderen Ort (offsite), damit z. B. ein Brand nicht alle Daten zerstört.'
  },
  {
    id: 'q012', teil: 'AP1', thema: 'IT-Sicherheit',
    frage: 'Welche Schutzbedarfskategorien verwendet der BSI IT-Grundschutz?',
    antworten: ['niedrig, mittel, hoch', 'normal, hoch, sehr hoch', 'A, B, C', 'öffentlich, intern, geheim'],
    richtig: [1],
    erklaerung: 'Bei der Schutzbedarfsfeststellung nach BSI IT-Grundschutz werden die Kategorien „normal“, „hoch“ und „sehr hoch“ verwendet, jeweils für Vertraulichkeit, Integrität und Verfügbarkeit.'
  },
  {
    id: 'q013', teil: 'AP1', thema: 'Datenschutz',
    frage: 'Welche der folgenden Punkte sind Grundsätze für die Verarbeitung personenbezogener Daten nach Art. 5 DSGVO?',
    antworten: ['Datenminimierung', 'Zweckbindung', 'Speicherbegrenzung', 'Gewinnmaximierung'],
    richtig: [0, 1, 2],
    erklaerung: 'Art. 5 DSGVO: Rechtmäßigkeit, Treu und Glauben, Transparenz; Zweckbindung; Datenminimierung; Richtigkeit; Speicherbegrenzung; Integrität und Vertraulichkeit; Rechenschaftspflicht.'
  },
  {
    id: 'q014', teil: 'AP1', thema: 'Software & Lizenzen',
    frage: 'Was kennzeichnet eine OEM-Lizenz?',
    antworten: [
      'Sie darf beliebig oft auf verschiedenen Geräten installiert werden',
      'Sie wird zusammen mit neuer Hardware vertrieben und ist in der Regel an dieses Gerät gebunden',
      'Sie ist eine kostenlose Open-Source-Lizenz',
      'Sie gilt nur für einen begrenzten Testzeitraum'
    ],
    richtig: [1],
    erklaerung: 'OEM (Original Equipment Manufacturer)-Lizenzen werden mit einem Gerät verkauft (z. B. vorinstalliertes Windows) und sind meist günstiger, aber an die Hardware gebunden.'
  },
  {
    id: 'q015', teil: 'AP1', thema: 'Software & Lizenzen',
    frage: 'Was bedeutet „Copyleft“ bei der GNU GPL?',
    antworten: [
      'Die Software darf nicht verändert werden',
      'Veränderte Versionen müssen bei Weitergabe wieder unter derselben Lizenz stehen',
      'Die Software darf nur privat genutzt werden',
      'Der Quellcode muss geheim bleiben'
    ],
    richtig: [1],
    erklaerung: 'Copyleft sorgt dafür, dass abgeleitete Werke bei Weitergabe ebenfalls unter der GPL veröffentlicht werden müssen. Damit bleibt die Software frei. Permissive Lizenzen wie MIT oder BSD verlangen das nicht.'
  },
  {
    id: 'q016', teil: 'AP1', thema: 'Projektmanagement',
    frage: 'Was gilt für Vorgänge auf dem kritischen Pfad eines Netzplans?',
    antworten: [
      'Sie haben den größten Gesamtpuffer',
      'Sie haben keinen Puffer. Jede Verzögerung verschiebt das Projektende',
      'Sie können beliebig parallel ausgeführt werden',
      'Sie sind immer die teuersten Vorgänge'
    ],
    richtig: [1],
    erklaerung: 'Der kritische Pfad ist die längste Kette von Vorgängen ohne Puffer (Gesamtpuffer = 0). Verzögert sich ein Vorgang darauf, verzögert sich das gesamte Projekt.'
  },
  {
    id: 'q017', teil: 'AP1', thema: 'Projektmanagement',
    frage: 'Wer erstellt üblicherweise das Pflichtenheft?',
    antworten: ['Der Auftraggeber', 'Der Auftragnehmer', 'Die IHK', 'Der Datenschutzbeauftragte'],
    richtig: [1],
    erklaerung: 'Lastenheft = Auftraggeber („WAS und WOFÜR“ wird gebraucht). Pflichtenheft = Auftragnehmer („WIE und WOMIT“ wird es umgesetzt) auf Basis des Lastenhefts.'
  },
  {
    id: 'q018', teil: 'AP1', thema: 'Qualitätsmanagement',
    frage: 'Wofür stehen die vier Phasen des PDCA-Zyklus?',
    antworten: ['Plan – Do – Check – Act', 'Prepare – Deploy – Control – Archive', 'Plan – Design – Code – Analyse', 'Problem – Diagnose – Correct – Approve'],
    richtig: [0],
    erklaerung: 'Der PDCA- oder Deming-Kreis steht für kontinuierliche Verbesserung: planen, umsetzen, überprüfen, handeln/verbessern. Danach beginnt er von vorn.'
  },
  {
    id: 'q019', teil: 'AP1', thema: 'Arbeitsplatz & Ergonomie',
    frage: 'Welche Aussage zur ergonomischen Einrichtung eines Bildschirmarbeitsplatzes ist richtig?',
    antworten: [
      'Der Bildschirm sollte direkt vor einem Fenster stehen, damit viel Licht darauf fällt',
      'Die oberste Bildschirmzeile sollte etwa auf Augenhöhe oder leicht darunter liegen',
      'Der Sehabstand sollte möglichst unter 30 cm liegen',
      'Glänzende Bildschirme sind wegen des besseren Kontrasts vorgeschrieben'
    ],
    richtig: [1],
    erklaerung: 'Der Blick soll leicht nach unten gehen. Bildschirme stehen am besten seitlich zum Fenster (Blickrichtung parallel zur Fensterfront), um Blendung und Spiegelungen zu vermeiden. Entspiegelte Bildschirme sind vorzuziehen.'
  },

  // ───────────── AP2: Planen und Umsetzen von Netzwerken, Systemen und Diensten ─────────────
  {
    id: 'q101', teil: 'AP2', thema: 'Netzwerkdienste',
    frage: 'In welcher Reihenfolge laufen die Nachrichten bei der Adressvergabe per DHCP ab?',
    antworten: ['Request – Offer – Discover – Acknowledge', 'Discover – Offer – Request – Acknowledge', 'Offer – Discover – Acknowledge – Request', 'Discover – Request – Offer – Acknowledge'],
    richtig: [1],
    erklaerung: 'DORA: Der Client sucht per Broadcast (Discover), der Server bietet eine Adresse an (Offer), der Client fordert sie an (Request), der Server bestätigt (Acknowledge). DHCP nutzt UDP-Port 67 (Server) und 68 (Client).'
  },
  {
    id: 'q102', teil: 'AP2', thema: 'Netzwerkdienste',
    frage: 'Welcher DNS-Ressourceneintrag wird für die Rückwärtsauflösung (IP-Adresse → Name) verwendet?',
    antworten: ['A', 'MX', 'PTR', 'CNAME'],
    richtig: [2],
    erklaerung: 'PTR (Pointer) für Reverse Lookup. A = Name → IPv4, AAAA = Name → IPv6, MX = Mailserver der Domain, CNAME = Alias auf einen anderen Namen.'
  },
  {
    id: 'q103', teil: 'AP2', thema: 'Netzwerkdienste',
    frage: 'Welcher TCP-Port wird standardmäßig von SSH verwendet?',
    antworten: ['21', '22', '23', '3389'],
    richtig: [1],
    erklaerung: 'SSH = 22. FTP = 21 (Steuerung), Telnet = 23 (unverschlüsselt!), RDP = 3389.'
  },
  {
    id: 'q104', teil: 'AP2', thema: 'Netzwerkdienste',
    frage: 'Welches Protokoll wird typischerweise zur Überwachung von Switches, Routern und Druckern im Netzwerk-Monitoring eingesetzt?',
    antworten: ['SMTP', 'SNMP', 'NTP', 'LDAP'],
    richtig: [1],
    erklaerung: 'SNMP (Simple Network Management Protocol, UDP 161, Traps über UDP 162). Für die Sicherheit sollte SNMPv3 mit Authentifizierung und Verschlüsselung genutzt werden.'
  },
  {
    id: 'q105', teil: 'AP2', thema: 'Netzwerktechnik',
    frage: 'Welcher IEEE-Standard beschreibt das Tagging von Ethernet-Frames für VLANs?',
    antworten: ['IEEE 802.3af', 'IEEE 802.1Q', 'IEEE 802.11ax', 'IEEE 802.1X'],
    richtig: [1],
    erklaerung: '802.1Q fügt einen 4-Byte-Tag mit 12-Bit-VLAN-ID in den Frame ein (bis zu 4094 nutzbare VLANs). 802.3af = PoE, 802.11ax = WLAN (Wi-Fi 6), 802.1X = portbasierte Zugangskontrolle.'
  },
  {
    id: 'q106', teil: 'AP2', thema: 'Netzwerktechnik',
    frage: 'Welche Aufgabe hat das Spanning Tree Protocol (STP)?',
    antworten: [
      'Verschlüsselung des Datenverkehrs zwischen Switches',
      'Verhindern von Schleifen (Loops) in redundant verbundenen Layer-2-Netzen',
      'Automatische Vergabe von IP-Adressen',
      'Bündelung mehrerer Leitungen zu einer logischen Verbindung'
    ],
    richtig: [1],
    erklaerung: 'STP (IEEE 802.1D, schneller: RSTP 802.1w) blockiert redundante Pfade logisch, damit keine Broadcast-Stürme entstehen. Fällt ein Pfad aus, wird ein blockierter wieder aktiviert. Leitungsbündelung wäre Link Aggregation (LACP).'
  },
  {
    id: 'q107', teil: 'AP2', thema: 'Netzwerktechnik',
    frage: 'Welche Präfixe gehören zu welchem IPv6-Adresstyp? Wähle die richtigen Zuordnungen.',
    antworten: ['fe80::/10 – Link-Local', 'fc00::/7 – Unique Local Address (ULA)', '2000::/3 – Global Unicast', 'ff00::/8 – Loopback'],
    richtig: [0, 1, 2],
    erklaerung: 'ff00::/8 ist Multicast. Die Loopback-Adresse in IPv6 ist ::1. IPv6-Adressen haben 128 Bit.'
  },
  {
    id: 'q108', teil: 'AP2', thema: 'Netzwerktechnik',
    frage: 'Was ermöglicht PAT (Port Address Translation, auch NAT-Overload)?',
    antworten: [
      'Mehrere interne Geräte teilen sich eine öffentliche IPv4-Adresse, unterschieden über Portnummern',
      'Jedes interne Gerät bekommt eine eigene öffentliche IP-Adresse',
      'Die Übersetzung von Domainnamen in IP-Adressen',
      'Die Verschlüsselung von Ports'
    ],
    richtig: [0],
    erklaerung: 'Beim PAT merkt sich der Router für jede Verbindung die Kombination aus interner IP und Port und übersetzt sie auf seine öffentliche IP mit einem eigenen Port. Typisch für Router zu Hause und in kleinen Firmen.'
  },
  {
    id: 'q109', teil: 'AP2', thema: 'Server & Speicher',
    frage: 'Ein RAID 5 besteht aus 4 Festplatten mit je 2 TB. Wie groß ist die nutzbare Kapazität und wie viele Platten dürfen gleichzeitig ausfallen?',
    antworten: ['8 TB, 0 Platten', '6 TB, 1 Platte', '4 TB, 2 Platten', '6 TB, 2 Platten'],
    richtig: [1],
    erklaerung: 'RAID 5: Nutzkapazität = (n − 1) × Plattengröße = 3 × 2 TB = 6 TB. Die Parität ist auf alle Platten verteilt. Eine Platte darf ausfallen. Mindestens 3 Platten nötig.'
  },
  {
    id: 'q110', teil: 'AP2', thema: 'Server & Speicher',
    frage: 'Welches RAID-Level bietet KEINE Ausfallsicherheit?',
    antworten: ['RAID 0', 'RAID 1', 'RAID 6', 'RAID 10'],
    richtig: [0],
    erklaerung: 'RAID 0 (Striping) verteilt die Daten nur auf mehrere Platten, um schneller zu sein. Fällt eine Platte aus, sind alle Daten verloren. Ein RAID ersetzt außerdem nie ein Backup!'
  },
  {
    id: 'q111', teil: 'AP2', thema: 'Datensicherung',
    frage: 'Sonntag wird eine Vollsicherung gemacht, Montag bis Freitag jeweils eine differenzielle Sicherung. Am Freitagmittag fällt der Server aus. Welche Sicherungen braucht man zur Wiederherstellung?',
    antworten: [
      'Nur die Vollsicherung vom Sonntag',
      'Die Vollsicherung und alle differenziellen Sicherungen von Montag bis Donnerstag',
      'Die Vollsicherung und die differenzielle Sicherung von Donnerstag',
      'Nur die differenzielle Sicherung von Donnerstag'
    ],
    richtig: [2],
    erklaerung: 'Eine differenzielle Sicherung enthält alle Änderungen seit der letzten Vollsicherung. Also: Vollsicherung + letzte differenzielle Sicherung. Bei inkrementellen Sicherungen bräuchte man die Vollsicherung und ALLE inkrementellen in der richtigen Reihenfolge.'
  },
  {
    id: 'q112', teil: 'AP2', thema: 'Virtualisierung',
    frage: 'Welche Produkte sind Hypervisoren vom Typ 1 (Bare Metal)?',
    antworten: ['VMware ESXi', 'Oracle VirtualBox', 'Microsoft Hyper-V', 'Proxmox VE'],
    richtig: [0, 2, 3],
    erklaerung: 'Typ 1 läuft direkt auf der Hardware (ESXi, Hyper-V, Proxmox VE/KVM, Xen). Typ 2 läuft als Anwendung auf einem Betriebssystem (VirtualBox, VMware Workstation).'
  },
  {
    id: 'q113', teil: 'AP2', thema: 'IT-Sicherheit',
    frage: 'Alice möchte Bob eine Datei schicken, die nur Bob lesen kann. Mit welchem Schlüssel verschlüsselt sie die Datei bei asymmetrischer Verschlüsselung?',
    antworten: ['Mit ihrem eigenen privaten Schlüssel', 'Mit ihrem eigenen öffentlichen Schlüssel', 'Mit Bobs öffentlichem Schlüssel', 'Mit Bobs privatem Schlüssel'],
    richtig: [2],
    erklaerung: 'Verschlüsseln mit dem öffentlichen Schlüssel des Empfängers. Entschlüsseln kann nur er mit seinem privaten Schlüssel. Bei einer digitalen Signatur ist es umgekehrt: Der Absender signiert mit seinem privaten Schlüssel, geprüft wird mit seinem öffentlichen.'
  },
  {
    id: 'q114', teil: 'AP2', thema: 'IT-Sicherheit',
    frage: 'Was kann eine Stateful-Packet-Inspection-Firewall im Unterschied zu einem einfachen Paketfilter?',
    antworten: [
      'Sie prüft den Inhalt von E-Mails auf Viren',
      'Sie merkt sich den Zustand von Verbindungen und lässt Antwortpakete nur zu, wenn sie zu einer bestehenden Verbindung gehören',
      'Sie verschlüsselt den gesamten Datenverkehr',
      'Sie vergibt IP-Adressen an Clients'
    ],
    richtig: [1],
    erklaerung: 'SPI führt eine Zustandstabelle (State Table). Ein statischer Paketfilter prüft jedes Paket einzeln nur nach IP, Port und Protokoll, ohne den Zusammenhang zu kennen.'
  },
  {
    id: 'q115', teil: 'AP2', thema: 'IT-Sicherheit',
    frage: 'Wozu dient eine DMZ (demilitarisierte Zone)?',
    antworten: [
      'Für öffentlich erreichbare Server (z. B. Web- oder Mailserver), getrennt vom internen LAN',
      'Als besonders geschütztes Netz für die Geschäftsführung',
      'Als WLAN für Gäste ohne Firewall',
      'Zur Speicherung von Backups'
    ],
    richtig: [0],
    erklaerung: 'Die DMZ ist ein eigenes Netzsegment zwischen Internet und internem Netz, meist durch Firewalls abgegrenzt. Wird ein Server in der DMZ kompromittiert, ist das interne Netz trotzdem noch geschützt.'
  },
  {
    id: 'q116', teil: 'AP2', thema: 'Hochverfügbarkeit',
    frage: 'Ein Dienst soll eine Verfügbarkeit von 99,9 % pro Jahr haben (365 Tage, 24/7). Wie lange darf er höchstens ausfallen?',
    antworten: ['ca. 52,6 Minuten', 'ca. 8,76 Stunden', 'ca. 3,65 Tage', 'ca. 87,6 Stunden'],
    richtig: [1],
    erklaerung: '365 × 24 h = 8.760 h. 0,1 % davon = 8,76 h. Zum Vergleich: 99,99 % ≈ 52,6 Minuten, 99 % ≈ 87,6 Stunden.'
  },
  {
    id: 'q117', teil: 'AP2', thema: 'Hochverfügbarkeit',
    frage: 'Welche USV-Bauart versorgt die Verbraucher ständig über den Wechselrichter und schaltet daher ohne Umschaltzeit um?',
    antworten: ['Offline-USV (VFD)', 'Line-Interactive-USV (VI)', 'Online-USV / Doppelwandler (VFI)', 'Jede USV hat eine Umschaltzeit von mindestens 10 ms'],
    richtig: [2],
    erklaerung: 'Die Online-USV (VFI, Voltage and Frequency Independent) wandelt den Strom ständig doppelt um (AC → DC → AC). Sie ist teurer, schützt aber am besten und eignet sich für Serverräume.'
  },
  {
    id: 'q118', teil: 'AP2', thema: 'Skripting & Administration',
    frage: 'Mit welchem PowerShell-Cmdlet lässt du dir die Dienste eines Windows-Systems anzeigen?',
    antworten: ['Get-Process', 'Get-Service', 'Show-Services', 'List-Service'],
    richtig: [1],
    erklaerung: 'Get-Service zeigt Dienste mit Status an. Mit Start-Service, Stop-Service und Restart-Service steuert man sie. Get-Process zeigt laufende Prozesse an.'
  },

  // ───────────── WiSo: Wirtschafts- und Sozialkunde ─────────────
  {
    id: 'q201', teil: 'WiSo', thema: 'Berufsausbildung',
    frage: 'Wie lange darf die Probezeit in einem Ausbildungsverhältnis nach dem Berufsbildungsgesetz (BBiG) dauern?',
    antworten: ['mindestens 1 Woche, höchstens 1 Monat', 'mindestens 1 Monat, höchstens 4 Monate', 'genau 6 Monate', 'mindestens 3 Monate, höchstens 6 Monate'],
    richtig: [1],
    erklaerung: '§ 20 BBiG: Die Probezeit muss mindestens einen Monat und darf höchstens vier Monate betragen. In der Probezeit können beide Seiten jederzeit ohne Frist kündigen.'
  },
  {
    id: 'q202', teil: 'WiSo', thema: 'Berufsausbildung',
    frage: 'Ein Auszubildender möchte nach der Probezeit die Ausbildung aufgeben. Was gilt nach § 22 BBiG?',
    antworten: [
      'Er kann nicht kündigen',
      'Er kann mündlich ohne Frist kündigen',
      'Er kann schriftlich mit einer Frist von vier Wochen kündigen und muss den Grund angeben',
      'Er braucht die Zustimmung der IHK'
    ],
    richtig: [2],
    erklaerung: 'Nach der Probezeit kann der Azubi mit 4 Wochen Frist kündigen, wenn er die Berufsausbildung aufgeben oder sich für eine andere Berufstätigkeit ausbilden lassen will. Die Kündigung muss schriftlich und mit Angabe des Grundes erfolgen. Aus wichtigem Grund ist eine fristlose Kündigung möglich (für beide Seiten).'
  },
  {
    id: 'q203', teil: 'WiSo', thema: 'Sozialversicherung',
    frage: 'Welche Sozialversicherung wird allein vom Arbeitgeber finanziert?',
    antworten: ['Krankenversicherung', 'Rentenversicherung', 'Gesetzliche Unfallversicherung', 'Arbeitslosenversicherung'],
    richtig: [2],
    erklaerung: 'Die gesetzliche Unfallversicherung (Träger: Berufsgenossenschaften) zahlt allein der Arbeitgeber. Sie greift bei Arbeits- und Wegeunfällen sowie Berufskrankheiten. Die anderen Zweige werden grundsätzlich etwa je zur Hälfte von Arbeitgeber und Arbeitnehmer getragen.'
  },
  {
    id: 'q204', teil: 'WiSo', thema: 'Mitbestimmung',
    frage: 'Ab welcher Betriebsgröße kann nach dem Betriebsverfassungsgesetz ein Betriebsrat gewählt werden?',
    antworten: [
      'ab 5 ständigen wahlberechtigten Arbeitnehmern, von denen 3 wählbar sind',
      'ab 10 Arbeitnehmern',
      'ab 20 Arbeitnehmern',
      'ab 50 Arbeitnehmern'
    ],
    richtig: [0],
    erklaerung: '§ 1 BetrVG: in Betrieben mit in der Regel mindestens fünf ständigen wahlberechtigten Arbeitnehmern, von denen drei wählbar sind. Eine Jugend- und Auszubildendenvertretung (JAV) gibt es ab 5 Beschäftigten unter 18 oder Azubis unter 25, wenn ein Betriebsrat besteht.'
  },
  {
    id: 'q205', teil: 'WiSo', thema: 'Tarifrecht',
    frage: 'Was bedeutet die Friedenspflicht?',
    antworten: [
      'Arbeitnehmer dürfen nie streiken',
      'Während der Laufzeit eines Tarifvertrags sind Arbeitskampfmaßnahmen zu den darin geregelten Punkten verboten',
      'Der Arbeitgeber darf während eines Streiks niemanden aussperren',
      'Betriebsrat und Arbeitgeber müssen sich immer einigen'
    ],
    richtig: [1],
    erklaerung: 'Solange ein Tarifvertrag gilt, dürfen die Tarifparteien über die darin geregelten Inhalte nicht streiken oder aussperren. Erst nach Ablauf (und meist gescheiterten Verhandlungen) sind Warnstreiks und Streiks möglich.'
  },
  {
    id: 'q206', teil: 'WiSo', thema: 'Arbeitsschutz',
    frage: 'Wie lange dürfen Jugendliche nach dem Jugendarbeitsschutzgesetz grundsätzlich höchstens arbeiten?',
    antworten: ['6 Stunden täglich, 30 Stunden wöchentlich', '8 Stunden täglich, 40 Stunden wöchentlich', '10 Stunden täglich, 48 Stunden wöchentlich', '9 Stunden täglich, 45 Stunden wöchentlich'],
    richtig: [1],
    erklaerung: '§ 8 JArbSchG: max. 8 Stunden täglich und 40 Stunden wöchentlich (8,5 Stunden, wenn an anderen Tagen derselben Woche weniger gearbeitet wird). Für Erwachsene gilt das Arbeitszeitgesetz: werktäglich 8 Stunden, bis 10 Stunden mit Ausgleich.'
  },
  {
    id: 'q207', teil: 'WiSo', thema: 'Arbeitsrecht',
    frage: 'Wie viele Tage beträgt der gesetzliche Mindesturlaub für Erwachsene nach dem Bundesurlaubsgesetz bei einer 5-Tage-Woche?',
    antworten: ['18 Arbeitstage', '20 Arbeitstage', '24 Arbeitstage', '30 Arbeitstage'],
    richtig: [1],
    erklaerung: 'Das BUrlG nennt 24 Werktage. Gemeint ist eine 6-Tage-Woche (Mo–Sa). Bei einer 5-Tage-Woche sind das 24 ÷ 6 × 5 = 20 Arbeitstage. Für Jugendliche gelten nach JArbSchG mehr Tage.'
  },
  {
    id: 'q208', teil: 'WiSo', thema: 'Rechtsformen',
    frage: 'Wie hoch ist das Mindest-Stammkapital einer GmbH?',
    antworten: ['1 €', '12.500 €', '25.000 €', '50.000 €'],
    richtig: [2],
    erklaerung: 'Eine GmbH braucht 25.000 € Stammkapital, wovon bei Gründung mindestens 12.500 € eingezahlt sein müssen. Die UG (haftungsbeschränkt) kann ab 1 € gegründet werden. Eine AG braucht 50.000 € Grundkapital.'
  }
];
