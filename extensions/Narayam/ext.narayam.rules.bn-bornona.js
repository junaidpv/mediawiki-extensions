﻿/**
 * Regular expression rules table for Bornona layout for Bengali script
 * @author Junaid P V ([[user:Junaidpv]])
 * @date 2010-12-22
 * License: GPLv3, CC-BY-SA 3.0
 */
// Normal rules
var rules = [
['q', '', 'ং'],
['Q', '', 'ঙ'],
['w', '', 'ঢ'],
['W', '', 'ঠ'],
['e', '', 'ে'],
['E', '', 'ৈ'],
['r', '', 'র'],
['R', '', 'ৃ'],
['t', '', 'ত'],
['T', '', 'ট'],
['y', '', 'ধ'],
['Y', '', 'থ'],
['u', '', 'ু'],
['U', '', 'ূ'],
['i', '', 'ি'],
['I', '', 'ী'],
['o', '', 'ো'],
['O', '', 'ৌ'],
['p', '', 'প'],
['P', '', '্র'],
['\\|', '', 'ৰ'],
['\\\\', '', 'ৱ'],
['a', '', 'া'],
['A', '', 'অ'],
['s', '', 'স'],
['S', '', 'শ'],
['d', '', 'দ'],
['D', '', 'ড'],
['f', '', 'ফ'],
['F', '', 'র্ফ'],
['g', '', 'গ'],
['G', '', 'ঘ'],
['h', '', '্'],
['H', '', 'হ'],
['j', '', 'জ'],
['J', '', 'ঝ'],
['k', '', 'ক'],
['K', '', 'খ'],
['l', '', 'ল'],
['L', '', '।'],
['z', '', 'য'],
['Z', '', 'ড়'],
['x', '', 'ষ'],
['X', '', 'ঢ়'],
['c', '', 'চ'],
['C', '', 'ছ'],
['v', '', 'ভ'],
['V', '', '্য'],
['b', '', 'ব'],
['B', '', 'য়'],
['n', '', 'ন'],
['N', '', 'ণ'],
['m', '', 'ম'],
['M', '', 'ঞ'],
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
['\\`', '', '\u200C']
];

jQuery.narayam.addScheme( 'bn-bornona', {
    'namemsg': 'narayam-bn-bornona',
    'extended_keyboard': false,
    'lookbackLength': 0,
    'rules': rules
} ); 