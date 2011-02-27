﻿/**
 * Regular expression rules table for Probhat layout for Bengali script
 * @author Junaid P V ([[user:Junaidpv]])
 * @date 2010-12-23
 * License: GPLv3, CC-BY-SA 3.0
 */
// Normal rules
var rules = [
['q', '', 'দ'],
['Q', '', 'ধ'],
['w', '', 'ূ'],
['W', '', 'ঊ'],
['e', '', 'ী'],
['E', '', 'ঈ'],
['r', '', 'র'],
['R', '', 'ড়'],
['t', '', 'ট'],
['T', '', 'ঠ'],
['y', '', 'এ'],
['Y', '', 'ঐ'],
['u', '', 'ু'],
['U', '', 'উ'],
['i', '', 'ি'],
['I', '', 'ই'],
['o', '', 'ও'],
['O', '', 'ঔ'],
['p', '', 'প'],
['P', '', 'ফ'],
['\\[', '', 'ে'],
['\\{', '', 'ৈ'],
['\\]', '', 'ো'],
['\\}', '', 'ৌ'],

['\\|', '', '॥'],
['\\\\', '', '\u200C'],

['a', '', 'া'],
['A', '', 'অ'],
['s', '', 'স'],
['S', '', 'ষ'],
['d', '', 'ড'],
['D', '', 'ঢ'],
['f', '', 'ত'],
['F', '', 'থ'],
['g', '', 'গ'],
['G', '', 'ঘ'],
['h', '', 'হ'],
['H', '', 'ঃ'],
['j', '', 'জ'],
['J', '', 'ঝ'],
['k', '', 'ক'],
['K', '', 'খ'],
['l', '', 'ল'],
['L', '', 'ং'],
['z', '', 'য়'],
['Z', '', 'য'],
['x', '', 'শ'],
['X', '', 'ঢ়'],
['c', '', 'চ'],
['C', '', 'ছ'],
['v', '', 'আ'],
['V', '', 'ঋ'],
['b', '', 'ব'],
['B', '', 'ভ'],
['n', '', 'ন'],
['N', '', 'ণ'],
['m', '', 'ম'],
['M', '', 'ঙ'],
['\\<', '', 'ৃ'],
['\\>', '', 'ঁ'],
['\\.', '', '।'],
['/', '', '্'],

['`', '', '\u200D'],

['0', '', '০'],
['1', '', '১'],
['2', '', '২'],
['3', '', '৩'],
['4', '', '৪'],
['5', '', '৫'],
['6', '', '৬'],
['7', '', '৭'],
['8', '', '৮'],
['9', '', '৯'],

['\\$', '', '৳'],
['\\&', '', 'ঞ'],
['\\*', '', 'ৎ']
];

jQuery.narayam.addScheme( 'bn', {
    'namemsg': 'narayam-bn-probhat',
    'extended_keyboard': false,
    'lookbackLength': 0,
    'rules': rules
} ); 