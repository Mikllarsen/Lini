/*
 * Billeder og videoer i brevet
 * ----------------------------
 * 1. Læg dine filer i mappen "media" (f.eks. media/foerste-date.jpg).
 * 2. Tilføj en linje herunder for hver fil, i den rækkefølge de skal vises.
 *
 *    type:  'billede' eller 'video'
 *    fil:   stien til filen
 *    tekst: en lille tekst under billedet (kan være tom: '')
 *
 * Tips:
 * - Billeder skal være .jpg eller .png. iPhone gemmer som .heic, som ikke
 *   virker i alle browsere. Vælg "Mest kompatibel" under Indstillinger →
 *   Kamera → Formater, eller send billedet til dig selv som JPG.
 * - Videoer skal helst være .mp4 og under 50 MB (GitHub tillader maks 100 MB).
 * - Fjern linjer med "eksempel" når du har lagt dine egne ind.
 */
const MINDER = [
    { type: 'billede', fil: 'media/lini-1.jpg',     tekst: 'husk at skrive her' },
    { type: 'billede', fil: 'media/eksempel-2.jpg', tekst: 'husk at skrive her' },
    { type: 'video',   fil: 'media/eksempel-3.mp4', tekst: 'husk at skrive her' },
    { type: 'billede', fil: 'media/eksempel-4.jpg', tekst: 'husk at skrive her' },
];
