﻿/**
 * IRewriter
 * Input field rewrioter tool for web pages
 * @author Junaid P V ([[user:Junaidpv]])(http://junaidpv.in)
 * @date 2010-12-18 (Based on naaraayam transliteration tool I first wrote on 2010-05-19)
 * @version 3.0
 * Last update: 2010-11-28
 * License: GPLv3, CC-BY-SA 3.0
 */

var IRewriter = {};

/**
 * from: http://stackoverflow.com/questions/3053542/how-to-get-the-start-and-end-points-of-selection-in-text-area/3053640#3053640
 */
function GetCaretPosition(el) {
    var start = 0, end = 0, normalizedValue, range,
    textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        range = document.selection.createRange();
        if (range && range.parentElement() == el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                } else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }
    return {
        start: start,
        end: end
    };
}

/**
 * from: http://stackoverflow.com/questions/3274843/get-caret-position-in-textarea-ie
 */
function offsetToRangeCharacterMove(el, offset) {
    return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
}
/**
 * IE part from: http://stackoverflow.com/questions/3274843/get-caret-position-in-textarea-ie
 */
function setCaretPosition (el, iCaretPos)
{
    if (document.selection) // IE
    {
        endOffset = startOffset=iCaretPos;
        var range = el.createTextRange();
        var startCharMove = offsetToRangeCharacterMove(el, startOffset);
        range.collapse(true);
        if (startOffset == endOffset) {
            range.move("character", startCharMove);
        } else {
            range.moveEnd("character", offsetToRangeCharacterMove(el, endOffset));
            range.moveStart("character", startCharMove);
        }
        range.select();
    }
    else if (el.selectionStart || el.selectionStart == '0') // Firefox
    {
        el.setSelectionRange(iCaretPos, iCaretPos)
    }
}

function getLastNChars(str, caretPosition, numberOfChars)
{
    if(caretPosition <= numberOfChars ) return str.substring(0,caretPosition);
    else return str.substring(caretPosition-numberOfChars,caretPosition);
}

function replaceTransStringAtCaret(control, oldStringLength, newString, selectionRange)
{
    var text = control.value;
    var newCaretPosition;
    // firefox always scrolls to topmost position,
    // to scroll manually we keep original scroll postion.
    if(control.scrollTop || control.scrollTop=='0') {
        var scrollTop = control.scrollTop;
    }
    if(text.length  >= 1) {
        var firstStr = text.substring(0, selectionRange['start'] - oldStringLength + 1);
        var lastStr = text.substring(selectionRange['end'], text.length);
        control.value = firstStr+newString+ lastStr;
        newCaretPosition = firstStr.length+newString.length;
        setCaretPosition(control,newCaretPosition);
    }
    else {
        control.value = newString;
        newCaretPosition = newString.length;
        setCaretPosition(control,newCaretPosition);
    }
    // Manually scrolling in firefox, few tweeks or re-writing may require
    if (navigator.userAgent.indexOf("Firefox")!=-1) {
        var textLength = control.value.length;
        var cols = control.cols;
        if(newCaretPosition > (textLength-cols)) {
            //var height = parseInt(window.getComputedStyle(control,null).getPropertyValue('height'));
            var fontsize = parseInt(window.getComputedStyle(control,null).getPropertyValue('font-size'));
            //var lineheight = height/fontsize;
            control.scrollTop = scrollTop+fontsize;
        } else control.scrollTop = scrollTop;
    }
}

/**
 * This function will take a string to check against regular expression rules in the rules array.
 * It will return a two memeber array, having given string as first member and replacement string as
 * second memeber. If corresponding replacement could not be found then second string will be too given string
*/
function transli(lastpart,e, tr_rules)
{
    var rulesCount = tr_rules.length;
    var part1 = lastpart;
    var part2 = lastpart;
    var triple;
    for(var i=0 ; i < rulesCount; i++)
    {
        triple = tr_rules[i];
        var previousKeysMatch = true;
        var presentSeq = '(.*)'+triple[0]+'$';
        var replaceSeq = '$1'+triple[2];
        if(triple[1].length > 0) {
            previousKeysMatch = (new RegExp('.*'+triple[1]+'$')).test(IRewriter.previous_sequence[(e.currentTarget || e.srcElement).id ]);
        }
        if((new RegExp(presentSeq)).test(lastpart) && previousKeysMatch)
        {
            part1 = lastpart;
            part2 = lastpart.replace(RegExp(presentSeq), replaceSeq);
            break;
        }
    }
    var pair = new Array(part1, part2);
    return pair;
}
/**
 * from: http://www.javascripter.net/faq/settinga.htm
 */
function setCookie(cookieName,cookieValue,nDays) {
    var today = new Date();
    var expire = new Date();
    if (nDays==null || nDays==0) nDays=1;
    expire.setTime(today.getTime() + 3600000*24*nDays);
    document.cookie = cookieName+"="+escape(cookieValue)+ ";expires="+expire.toGMTString();
}
/**
 * from: http://www.javascripter.net/faq/readinga.htm
 */
function readCookie(cookieName) {
	var theCookie=""+document.cookie;
	var ind=theCookie.indexOf(cookieName);
	if (ind==-1 || cookieName=="") return "";
	var ind1=theCookie.indexOf(';',ind);
	if (ind1==-1) ind1=theCookie.length;
	return unescape(theCookie.substring(ind+cookieName.length+1,ind1));
}

IRewriter.enableTrasliteration = function(enable) {
	if(enable==undefined) {
		enable = true;
	}
	var cookieValue;
        IRewriter.enabled  = enable;
	if(enable) {
		
		//IRewriter.temp_disable = false;
		cookieValue = 1;
	}
	else {
		cookieValue = 0;
	}
	if(IRewriter.checkbox.element) {
		IRewriter.checkbox.element.checked = enable;
	}
	setCookie("irewriter-enabled", cookieValue);
}

// stop propagation of given event
function stopPropagation(event) {
	event.cancelBubble = true;
	event.returnValue = false;
	//event.stopPropagation works in Firefox.
	if (event.stopPropagation) event.stopPropagation();
	if(event.preventDefault) event.preventDefault();
}

function shortKeyPressed(event) {
	var e = event || window.event;
	var targetElement;
	if(e.target) targetElement=e.target;
	else if(e.srcElement) targetElement=e.srcElement;
	var code;
	if (e.keyCode) code = e.keyCode;
	else if (e.which) code = e.which;

	var controlKey = false;
	var shiftKey = false;
	var altKey = false;
	var metaKey = false;
	if(e.ctrlKey)	controlKey = true;
	if(e.shiftKey)	shiftKey = true;
	if(e.altKey)	altKey = true;
	if(e.metaKey)   metaKey = true;
	var shortcut = IRewriter.shortcut;
	// If shortkey has been specified
	if((shortcut.controlkey || shortcut.shiftkey || shortcut.altkey || shortcut.metakey) &&
		(shortcut.controlkey==controlKey && shortcut.shiftkey==shiftKey && shortcut.altkey==altKey && shortcut.metakey==metaKey) &&
		String.fromCharCode(code).toLowerCase()==shortcut.key.toLowerCase())
		{
		IRewriter.enableTrasliteration(!IRewriter.enabled );
		stopPropagation(e);
		return false;
	}
	return true;
}
// event listener for trasliterattion textfield
// also listen for Ctrl+M combination to disable and enable trasliteration
function tiKeyPressed(event) {
	var e = event || window.event;
	var keyCode;
	if (e.keyCode) keyCode = e.keyCode;
	else if (e.which) keyCode = e.which;

	//var charCode = e.charCode || e.keyCode;
	var charCode;
	if (e.keyCode) charCode = e.keyCode;
	else if (e.which) charCode = e.which;

	var targetElement = (e.currentTarget || e.srcElement);

	if (keyCode == 8 ) {
		IRewriter.previous_sequence[targetElement.id] = '';
		return true;
	} // Backspace
	// If this keystroke is a function key of any kind, do not filter it
	if (e.charCode == 0 || e.which ==0 ) return true;       // Function key (Firefox and Opera), e.charCode for Firefox and e.which for Opera
	// If control or alt or meta key pressed
	if(e.ctrlKey || (e.altKey && !IRewriter.current_scheme.extended_keyboard) || e.metaKey) {
		//if (navigator.userAgent.indexOf("Firefox")!=-1) {
		//	return shortKeyPressed(event);
		//}
		return true;
	}
	if (charCode < 32) return true;             // ASCII control character
	if(IRewriter.enabled )
	{

		var c = String.fromCharCode(charCode);
		var selectionRange = GetCaretPosition(targetElement);
		var lastSevenChars = getLastNChars(targetElement.value, selectionRange['start'], IRewriter.check_str_length);
		var oldString;
		var newString;
		/*
		if(charCode ==62 && IRewriter.previous_sequence[targetElement.id ].substring(IRewriter.previous_sequence[targetElement.id ].length-1)=="<")
		{
			oldString = "<>";
			newString = "";
			IRewriter.temp_disable = !IRewriter.temp_disable;
		}*/
		//else {
			//if(!IRewriter.temp_disable)
			//{
				var transPair;
				if(IRewriter.current_scheme.extended_keyboard && e.altKey) {
					transPair = transli(lastSevenChars+c, e, IRewriter.current_scheme.rules_x);
				}
				else transPair = transli(lastSevenChars+c, e, IRewriter.current_scheme.rules);
				oldString = transPair[0];
				newString = transPair[1];
			//}
			/*
			else
			{
				oldString = c;
				newString = c;
			}*/
		//}
		replaceTransStringAtCaret(targetElement, oldString.length, newString , selectionRange);
		IRewriter.previous_sequence[targetElement.id ] += c;
		if(IRewriter.previous_sequence[targetElement.id ].length > IRewriter.check_str_length ) IRewriter.previous_sequence[targetElement.id ] = IRewriter.previous_sequence[targetElement.id ].substring(IRewriter.previous_sequence[targetElement.id ].length-IRewriter.check_str_length);
		stopPropagation(e);
		return false;
	}
	return true;
}

function tiKeyDown(event) {
	var e = event || window.event;
	var targetElement;
	if(e.target) targetElement=e.target;
	else if(e.srcElement) targetElement=e.srcElement;
	if(IRewriter.current_scheme.extended_keyboard && e.altKey && !e.ctrlKey && !e.metaKey /*&& IRewriter.temp_disable*/) stopPropagation(e);
	else if(e.ctrlKey || e.altKey || e.metaKey) {
		return shortKeyPressed(event);
	}
	return true;
}
/**
 * This is the function to which call during window load event for trasliterating textfields.
 * The funtion will accept any number of HTML tag IDs of textfields.
*/
function inputRewrite(tagName) {
	var elements = document.getElementsByTagName(tagName);
	var len = elements.length;
	for(var i=0;i<len; i++)
	{
		var element = elements[i];
		if(element.id ==undefined || element.id.length == 0) {
			element.id = 'irtempid-'+IRewriter.id;
			IRewriter.id = IRewriter.id + 1;
		}
		if(element)
		{
			//IRewriter.enabled  = IRewriter.default_state;
			IRewriter.previous_sequence[element.id] = '';
			if (element.addEventListener){
				element.addEventListener('keydown', tiKeyDown, false);
				element.addEventListener('keypress', tiKeyPressed, false);
			} else if (element.attachEvent){
				element.attachEvent('onkeydown', tiKeyDown);
				element.attachEvent("onkeypress", tiKeyPressed);
			}
		}
	}
}

function transOptionOnClick(event)
{
	var e = event || window.event;
	var checkbox =  (e.currentTarget || e.srcElement);
	if(checkbox.checked)
	{
		IRewriter.enableTrasliteration(checkbox.value,true);
	}
	else
	{
		IRewriter.enableTrasliteration(checkbox.value,false);
	}
}
/*
// call this function to add checkbox to enable/disable transliteration
function addTransliterationOption()
{
	var len = arguments.length;
	for(var i=0;i<len; i++)
	{
		var element = document.getElementById(arguments[i]);
		if(element)
		{
			var checkbox = document.createElement('input');
			checkbox.id = arguments[i]+'cb';
			checkbox.type = 'checkbox';
			checkbox.value = arguments[i];
			checkbox.onclick = transOptionOnClick;
			checkbox.checked = IRewriter.default_state;
			var para = document.createElement('p');
			para.appendChild(checkbox);
			var text = document.createTextNode(IRewriter.checkbox.text);
			para.appendChild(text);
			if(IRewriter.checkbox.position=="after") element.parentNode.insertBefore(para, element.nextSibling);
			else if(IRewriter.checkbox.position=="before") element.parentNode.insertBefore(para, element);
		}
	}
}*/



function writingStyleLBChanged(event) {
	var e = event || window.event;
	var listBox =  (e.currentTarget || e.srcElement);
	IRewriter.current_scheme = IRewriter.schemes[listBox.selectedIndex];
	setCookie("transToolIndex", listBox.selectedIndex);
}

// IRewriter setup and initialization code
IRewriter.shortcut = {};
IRewriter.checkbox = {};
// memory for previus key sequence
IRewriter.previous_sequence = {};

// To generate ids for elements that have no id assigned
IRewriter.id = 0;

// shortcut key settings
IRewriter.shortcut.toString = function() {
	var parts= [];
	if(this.controlkey) parts.push('Ctrl');
	if(this.shiftkey) parts.push('Shift');
	if(this.altkey) parts.push('Alt');
	if(this.metakey) parts.push('Meta');
	parts.push(this.key.toUpperCase());
	return parts.join('+');
}
/*
IRewriter.initMultiSchemeIndex = function() {
	IRewriter.current_scheme = IRewriter.schemes[IRewriter.default_scheme_index];
}*/

/**
 * This functions is to synchronize IRewriter state from cookie
 */
IRewriter.translitStateSynWithCookie = function() {
	var state = parseInt(readCookie(IRewriter.prefix ));
	var enable = IRewriter.enabled;
	if(state == 1)  enable=true;
	else if(state==0) enable =false;
	IRewriter.enableTrasliteration(enable);
}
/* Settings */
IRewriter.shortcut = {
	controlkey: false,
	altkey: false,
	shiftkey: false,
	metakey: false,
	key: '',	// eg: 'M'
        toString: function() {
            var parts= [];
            if(IRewriter.shortcut.controlkey) parts.push('Ctrl');
            if(IRewriter.shortcut.shiftkey) parts.push('Shift');
            if(IRewriter.shortcut.altkey) parts.push('Alt');
            if(IRewriter.shortcut.metakey) parts.push('Meta');
            parts.push(IRewriter.shortcut.key.toUpperCase());
            return parts.join('+');
        }
};
IRewriter.checkbox = {
	text: '', // eg: 'To toggle ('+ IRewriter.shortcut.toString()+ ')'
	href: '', // eg: 'http://ml.wikipedia.org/wiki/Help:Typing'
	tooltip: '' // eg: 'To write Malayalam use this tool, shortcut: ('+ IRewriter.shortcut.toString()+ ')'
};
//IRewriter.default_state = true;
IRewriter.schemes =  []; // eg: [tr_ml, tr_ml_inscript]
IRewriter.default_scheme_index = 0; // eg: 0
IRewriter.enabled = true;
IRewriter.prefix = 'irewriter-';
IRewriter.check_str_length = 6;
// temporary disabling of transliteration
//IRewriter.temp_disable = !IRewriter.enabled;

IRewriter.init = function(index) {
	IRewriter.current_scheme = IRewriter.schemes[index];
	this.translitStateSynWithCookie();
}

IRewriter.prepareMultiSchemeListBox = function() {
	this.listBox = document.createElement("select");
	if (this.listBox.addEventListener)
		this.listBox.addEventListener("change", writingStyleLBChanged, false);
	else if (this.listBox.attachEvent)
		this.listBox.attachEvent("onchange", writingStyleLBChanged);
	var numOfSchemes = IRewriter.schemes.length;
	for(var i=0; i < numOfSchemes; i++) {
		var schemeOption = document.createElement("option");
		schemeOption.appendChild( document.createTextNode(IRewriter.schemes[i].text) );
		schemeOption.value = IRewriter.schemes[i].text;
		if(IRewriter.default_scheme_index==i) schemeOption.selected=true;
		this.listBox.appendChild( schemeOption );
	}
}

IRewriter.prepareCheckBoxWithLabel = function() {
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.id = this.prefix+'cb';
	checkbox.value = 'searchInput'; // specifying curresponding input filed.
	checkbox.checked = IRewriter.enabled;

	if (checkbox.addEventListener)
		checkbox.addEventListener("click", transOptionOnClick, false);
	else if (checkbox.attachEvent)
		checkbox.attachEvent("onclick", transOptionOnClick);

	var label = document.createElement('label');
	var linktohelp = document.createElement ('a');
	linktohelp.href= this.checkbox.href;
	linktohelp.title= this.checkbox.tooltip;
	linktohelp.appendChild( document.createTextNode(this.checkbox.text) );
	label.appendChild(linktohelp);

	this.checkboxWL = document.createElement('span');
	this.checkboxWL.style.padding = 0;
        this.checkboxWL.id = this.prefix+'cbwl';
	this.checkboxWL.style.margin = 0;
	this.checkboxWL.appendChild(checkbox);
	this.checkboxWL.appendChild(label);
}

function setupIRewriterForvector() {
	IRewriter.prepareMultiSchemeListBox();
	IRewriter.prepareCheckBoxWithLabel();
        var span = document.createElement("span");
        span.style.position = 'absolute';
        span.style.marginTop = '-1em';
        span.appendChild(IRewriter.listBox);
        span.appendChild(IRewriter.checkboxWL);
	var container = document.getElementById('p-search');
	var searchform = document.getElementById('searchform');
	container.insertBefore(span,searchform);
        var searchInput = document.getElementById('searchInput');
        searchInput.style.width = '24em';
}

function setupIRewriterFormonobook() {
	IRewriter.prepareMultiSchemeListBox();
	IRewriter.prepareCheckBoxWithLabel();
	var searchform = document.getElementById('searchform');
        var searchInput = document.getElementById('searchInput');
        searchform.insertBefore(IRewriter.listBox, searchInput);
        searchform.insertBefore(IRewriter.checkbox, searchInput);
}