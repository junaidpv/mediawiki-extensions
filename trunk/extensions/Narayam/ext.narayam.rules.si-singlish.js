/**
 * Transliteration regular expression rules table for Sinhala (Singlish)
 * @author Junaid P V ([[user:Junaidpv]])
 * @date 2011-02-23
 * @credits With help from Nishantha Anuruddha (si.wikipedia.org/wiki/user:බිඟුවා)
 * License: GPLv3
 */
 
 // Normal rules
var rules = [
['අa', '', 'ආ'],
['ඇa', '', 'ඈ'],
['ඉi', '', 'ඊ'],
['එa', '', 'ඒ'],
['ඔe', '', 'ඕ'],
['උu', '', 'ඌ'],
['අu', '', 'ඖ'],

['a', '', 'අ'],
['A', '', 'ඇ'],
['i', '', 'ඉ'],
['e', '', 'එ'],
['o', '', 'ඔ'],
['u', '', 'උ'],
['i', '', 'ඉ'],
['i', '', 'ඉ'],
['i', '', 'ඉ'],
['i', '', 'ඉ'],
['i', '', 'ඉ'],
['i', '', 'ඉ'],
['i', '', 'ඉ'],
['i', '', 'ඉ'],
['i', '', 'ඉ'],
['i', '', 'ඉ'],
['i', '', 'ඉ'],
];

jQuery.narayam.addScheme( 'si', {
    'namemsg': 'narayam-si-singlish',
    'extended_keyboard': false,
    'lookbackLength': 2,
    'rules': rules
} ); 