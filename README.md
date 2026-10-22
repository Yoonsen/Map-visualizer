# Map Visualizer

En rask og brukervennlig PWA (Progressive Web App) for å visualisere og redigere stedsdata fra CSV- og Excel-filer (`.csv`, `.xls`, `.xlsx`) på et interaktivt kart.

## Funksjonalitet

- **Fleksibel kolonnemapping:** Automatisk gjetting og manuell kobling av kolonner for breddegrad, lengdegrad, stedsnavn, beskrivelse, kategori og størrelse/frekvens.
- **Høy ytelse:** Støtter opptil 10 000 punkter samtidig ved hjelp av Canvas-basert kartrendering i Leaflet.
- **Tilpassbare markører:**
  - Sirkler med skalerbar radius (justerbar min/maks-størrelse) basert på tallverdier/frekvens.
  - Fargekoding etter kategori med automatisk fargeforklaring (legend).
  - Standard kartmarkører (dråper).
- **Redigering og eksport av data:**
  - Søkbar tabellvisning der enkeltrader kan fjernes direkte fra datasettet og kartet.
  - Last ned det redigerte datasettet tilbake som **CSV** eller **Excel (.xlsx)** med alle originale kolonner intakt.
- **Bildeeksport:** Last ned nåværende kartutsnitt som et høyoppløselig **JPG**-bilde til bruk i presentasjoner og rapporter.

## Utvikling lokalt

```bash
# Installer avhengigheter
npm install

# Start utviklingsserver
npm run dev

# Bygg for produksjon
npm run build
```
