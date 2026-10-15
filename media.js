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
 */
const MINDER = [
    { type: 'billede', fil: 'media/lini-1.jpg',   tekst: 'Meget sødt og flot billed' },
    { type: 'billede', fil: 'media/lini-2.jpg',   tekst: 'Første måneds dag sammen' },
    { type: 'video',   fil: 'media/video-1.mp4',  tekst: 'så blir jeg sku slået :(' },
    { type: 'billede', fil: 'media/lini-3.jpg',   tekst: 'et goated billed af ogs' },
];
