/*
 * Spørgsmålet Lini skal svare på, før hjertet dukker op
 * -----------------------------------------------------
 * spoergsmaal: det hun bliver spurgt om
 * svar:        alle de svar der skal godtages. Store/små bogstaver,
 *              mellemrum og punktum til sidst er ligegyldige.
 *              F.eks. ['14. august', '14 august', '14/8']
 * hint:        vises efter 3 forkerte forsøg ('' = intet hint)
 *
 * Sæt svar: [] for at slå spørgsmålet fra helt.
 */
const KODE = {
    spoergsmaal: 'Hvornår har jeg fødselsdag?',
    svar: [
        '21 juni', '21. juni', '21.juni', '21juni', '21 jun', '21. jun',
        'den 21 juni', 'den 21. juni', 'd. 21 juni', 'd. 21. juni', 'd 21 juni',
        'juni 21', 'enogtyvende juni', 'en og tyvende juni',
        '21/6', '21/06', '21.6', '21.06', '21-6', '21-06', '21 6', '21 06', '2106',
    ],
    hint: 'Det er årets længste dag ☀️',
};
