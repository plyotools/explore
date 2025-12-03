const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(process.cwd(), 'public', 'projects');
const INDEX_FILE = path.join(process.cwd(), 'public', 'instances.json');

// Client, Name, URL, Active flag from the latest pasted set
const rawRows = [
  ['Nåbo', 'Sandsli Stasjon T3', 'https://naabo.no/prosjekter/boliger-til-salgs/sandsli-stasjon/til-salgs/boligvelger', true],
  ['AF Eiendom', 'Fagerblom', 'https://fagerblom.no/prospekt/til-salgs', true],
  ['Nordfjordhus', 'Tonningskamben', 'http://kambenstryn.no/', true],
  ['Koteng', 'Grilstad Marina T4', 'https://grilstad-marina.plyo.cloud/?y=55&p=16', true],
  ['SPG', 'Slippen Drammen', 'https://scandinavianpropertygroup.com/no/vare-prosjekter/slippen-drammen/til-salgs/boligvelger', true],
  ['OSU', 'Maria', 'https://mariakvartalet.plyo.cloud/?y=330&p=19', true],
  ['Peab', 'Einerhagen', 'https://einerhagen.no', true],
  ['Marienlyst Eiendom AS', 'Mistel Park', 'https://mistel-park.plyo.cloud/standalone-aptcho', true],
  ['Barlindhaug Eiendom', 'Kanalparken', 'https://kanalparkenbolig.no/', true],
  ['Bakke', 'Steindansen', 'https://bakke-as.no/boliger-til-salgs/steindansen/prosjektside/boligvelger', true],
  ['A.Utvik', 'Lebakken Torg', 'https://lebakken.no/no/kommer-snart', true],
  ['Ferd', 'Kobberkvartalet', 'https://kobberkvartalet.no/prospekt/til-salgs', true],
  ['SOE', 'Timbre', 'https://soeiendom.no/prosjekter/timbre/til-salgs', true],
  ['Avantor', 'Kystbyen Slemmestad', 'https://kystbyen-slemmestad.no/nybygg/forhandssalg', true],
  ['Solon Eiendom', 'Madlalia', 'https://madlalia.plyo.cloud/', true],
  ['Nesfjellet', 'Trollsetutsikten', 'https://nesfjellet-alpinlandsby.no/no/vare-prosjekter/trollsetutsikten/til-salgs/tomtevelger', true],
  ['Thon Eiendom', 'Heggedal Hage', 'https://heggedalhage.plyo.cloud/', true],
  ['Avantor', 'Kystbyen Slemmestad', 'https://kystbyen-slemmestad.no/nybygg/til-salg/trinn-2/til-salgs/boligvelger?y=68&p=17', true],
  ['SOE', 'Linderudløkka', 'https://soeiendom.no/prosjekter/linderudlokka/til-salgs', true],
  ['SOE', 'Fryd Stabekk', 'https://soeiendom.no/prosjekter/fryd-stabekk/til-salgs', true],
  ['Koteng', 'Grilstad Marina T4', 'https://grilstad-marina.plyo.cloud/?y=55&p=16', true],
  ['SPG NO', 'Slippen T2', 'https://scandinavianpropertygroup.com/no/vare-prosjekter/slippen-drammen/til-salgs/forhandssalg-t2', true],
  ['GMC Eiendom', 'Byfjordparken', 'https://byfjordparken.plyo.cloud/', true],
  ['SPG', 'Slippen Drammen', 'https://scandinavianpropertygroup.com/no/vare-prosjekter/slippen-drammen/til-salgs/forhandssalg-t2', true],
  ['Koteng', 'Leangen BKB2 (Kolonialen)', 'https://kolonialen.plyo.cloud/standalone-aptcho?y=267&p=20', true],
  ['SPG NO', 'Hotvetalleen', 'https://bolig.scandinavianpropertygroup.com/no/vare-prosjekter/hotvetalleen/kommer-snart', true],
  ['Koteng', 'Leangenbukta', 'https://leangenbukta.plyo.cloud/standalone-aptcho?y=86&p=26', true],
  ['SPG NO', 'Ankerhagen', 'https://ankerhagen.plyo.cloud/', true],
  ['SOE', 'Linderuløkka Trinn 2', 'https://soeiendom.no/prosjekter/linderudlokka/til-salgs/finn-din-bolig?y=356&p=28', true],
  ['Nordr NO', 'Østraadt Havn', 'https://ostraadt-havn.plyo.cloud/boligvelger', true],
  ['SPG', 'Stovner Torg', 'https://scandinavianpropertygroup.com/no/vare-prosjekter/stovner-torg/til-salgs/boligvelger?y=30&p=26', true],
  ['Nobello AS', 'Strandhagen', 'https://strandhagenhorten.no/no/til-salgs/boligvelger', false],
  ['Lab Eiendom', 'Dyrhaugen', 'https://dyrhaugenbolig.no/no/til-salgs/boligvelger?y=55&p=17', true],
  ['Nåbo', 'Sandsli stasjon S4', 'https://naabo.no/prosjekter/boliger-til-salgs/sandsli-stasjon/til-salgs/boligvelger', true],
  ['SPG', 'Stovner Torg', 'https://scandinavianpropertygroup.com/no/vare-prosjekter/stovner-torg/til-salgs/boligvelger', true],
  ['Koteng', 'Byhagen', 'https://byhagen.plyo.cloud/?y=99&p=23', true],
  ['Peab', 'Borgundfjorden', 'https://borgundfjorden.no/no/til-salgs/boligvelger', true],
  ['Nordr SE', 'Bromma Canvas', 'https://www.nordr.com/se/hitta-din-bostad/bromma-canvas/till-salu', true],
];

function normalize(url) {
  try {
    if (!url.startsWith('http')) {
      url = 'https://' + url.replace(/^\/\//, '');
    }
    const u = new URL(url);
    u.hash = '';
    return u.toString().replace(/\/$/, '');
  } catch {
    return url.replace(/\/$/, '');
  }
}

// Map normalized URL -> row (last row wins for duplicates)
const rowMap = new Map();
for (const [client, name, url, active] of rawRows) {
  rowMap.set(normalize(url), { client, name, active });
}

function main() {
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  let updated = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const projectId = entry.name;
    const metadataPath = path.join(PROJECTS_DIR, projectId, 'metadata.json');
    if (!fs.existsSync(metadataPath)) continue;

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    if (!metadata.link) continue;

    const normalized = normalize(metadata.link);
    const row = rowMap.get(normalized);

    if (row) {
      metadata.client = row.client;
      metadata.name = row.name;
      metadata.active = !!row.active;
      console.log(
        `Set ${projectId} -> client="${row.client}", name="${row.name}", status=${
          row.active ? 'Active' : 'Inactive'
        }`,
      );
    } else {
      // Not in the pasted set => treat as not launched
      metadata.active = false;
      console.log(`Set ${projectId} (not in set) -> status=Inactive`);
    }
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
    updated++;
  }

  // Regenerate index so instances.json picks up active flag
  console.log(`\nUpdated ${updated} projects, regenerating index...`);
  const generateIndex = require('./generate-index.js');
}

main();

