# Image Resizer

Applicazione React per ridimensionare immagini con bordi bianchi e dimensioni personalizzabili.

## Caratteristiche

- Supporta JPEG, PNG, WebP, GIF, BMP e altri formati comuni
- Dimensioni output completamente personalizzabili
- Mantiene aspect ratio originale con bordi bianchi
- Compressione automatica per mantenere il peso sotto i 500KB
- Download singolo o multiplo

## Installazione e Avvio

### Requisiti
- Node.js (versione 14 o superiore)
- npm o yarn

### Passaggi

1. Clona il repository:
```bash
git clone https://github.com/TUO-USERNAME/image-resizer.git
cd image-resizer
```

2. Installa le dipendenze:
```bash
npm install
```

3. Installa Tailwind CSS:
```bash
npm install -D tailwindcss postcss autoprefixer
```

4. Avvia l'app in modalità sviluppo:
```bash
npm start
```

L'app si aprirà automaticamente su [http://localhost:3000](http://localhost:3000)

## Build per Produzione

Per creare una versione ottimizzata per la produzione:

```bash
npm run build
```

I file pronti per il deploy saranno nella cartella `build/`.

## Deploy

Puoi deployare l'app gratuitamente su:
- **Netlify**: trascina la cartella `build/` su netlify.com/drop
- **Vercel**: `npm i -g vercel` poi `vercel`
- **GitHub Pages**: segui la guida di create-react-app

## Utilizzo

1. Configura le dimensioni desiderate (larghezza x altezza)
2. Aggiungi o rimuovi dimensioni con i pulsanti + e X
3. Carica un'immagine
4. Scarica le immagini ridimensionate singolarmente o tutte insieme
5. Modifica le dimensioni e clicca "Rielabora" per rigenerare

## Tecnologie

- React 18
- Tailwind CSS
- Lucide React (icone)
- HTML5 Canvas API

## Licenza

MIT
