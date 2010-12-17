/**
 * Trasliteration Tool
 * @author Junaid P V ([[user:Junaidpv]])
 * @date 2010-05-19 (2010-12-10)
 * @version 2.0
 * Last update: 2010-11-28
 * License: GPLv3, CC-BY-SA 3.0
 */

/** Settings */
var transettings = {};
// shortcut key settings
transettings.shortcut = {
    controlkey: false,
    shiftkey: false,
    altkey: false,
    metakey: false,
    key: '',
    toString:function() {
        var parts= [];
        if(this.controlkey) parts.push('Ctrl');
        if(this.shiftkey) parts.push('Shift');
        if(this.altkey) parts.push('Alt');
        if(this.metakey) parts.push('Meta');
        parts.push(this.key.toUpperCase());
        return parts.join('+');
    }
};
transettings.checkbox = {};
// change this value to "after" or "before" to position transliteration option check box
transettings.checkbox.position = 'after';
// checkbox text
transettings.checkbox.text = '';
// checkbox simple test
transettings.checkbox.simple_text = '';
transettings.checkbox.link = {};
transettings.checkbox.link.href = '';
transettings.checkbox.link.text = '';
transettings.checkbox.link.tooltip = '';
// Default tranliteration state
transettings.default_state = true;
// set this property 
// transettings.current_scheme
// For multi scheme environment
transettings.schemes = new Array();
transettings.default_scheme_index = 0;
transettings.check_str_length = 6;
// defining to store state info
var trasliteration_fields = {};
// memory for previus key sequence
var previous_sequence = {};
// temporary disabling of transliteration
var temp_disable = {};

function setDefaultSchmeIndex(index) {
    if(isNaN(index)) index = parseInt(index);
    if(index==null || index==undefined || index=='' || index < 0) transettings.default_scheme_index = 0;
    else transettings.default_scheme_index = index;
}

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
            previousKeysMatch = (new RegExp('.*'+triple[1]+'$')).test(previous_sequence[(e.currentTarget || e.srcElement).id ]);
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

function enableTrasliteration(controlID, enable) {
    if(enable==undefined) {
        enable = true;
    }
    var cookieValue;
    if(enable) {
        trasliteration_fields[controlID] = true;
        temp_disable[controlID] = false;
        cookieValue = 1;
    }
    else {
        trasliteration_fields[controlID] = false;
        cookieValue = 0;
    }
    var checkbox = document.getElementById(controlID+'cb');
    if(checkbox) {
        checkbox.checked = enable;
    }
    setCookie("tr"+controlID, cookieValue);
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
    var shortcut = transettings.shortcut;
    // If shortkey has been specified
    if((shortcut.controlkey || shortcut.shiftkey || shortcut.altkey || shortcut.metakey) &&
        (shortcut.controlkey==controlKey && shortcut.shiftkey==shiftKey && shortcut.altkey==altKey && shortcut.metakey==metaKey) &&
        String.fromCharCode(code).toLowerCase()==shortcut.key.toLowerCase())
        {
        enableTrasliteration(targetElement.id, !trasliteration_fields[targetElement.id]);
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
        previous_sequence[targetElement.id] = '';
        return true;
    } // Backspace
    // If this keystroke is a function key of any kind, do not filter it
    if (e.charCode == 0 || e.which ==0 ) return true;       // Function key (Firefox and Opera), e.charCode for Firefox and e.which for Opera
    // If control or alt or meta key pressed
    if(e.ctrlKey || (e.altKey && !transettings.current_scheme.extended_keyboard) || e.metaKey) {
        //if (navigator.userAgent.indexOf("Firefox")!=-1) {
        //	return shortKeyPressed(event);
        //}
        return true;
    }
    if (charCode < 32) return true;             // ASCII control character
    if(trasliteration_fields[targetElement.id])
    {

        var c = String.fromCharCode(charCode);
        var selectionRange = GetCaretPosition(targetElement);
        var lastSevenChars = getLastNChars(targetElement.value, selectionRange['start'], transettings.check_str_length);
        var oldString;
        var newString;

        if(charCode ==62 && previous_sequence[targetElement.id ].substring(previous_sequence[targetElement.id ].length-1)=="<")
        {
            oldString = "<>";
            newString = "";
            temp_disable[targetElement.id] = !temp_disable[targetElement.id];
        }
        else {
            if(!temp_disable[targetElement.id])
            {
                var transPair;
                if(transettings.current_scheme.extended_keyboard && e.altKey) {
                    transPair = transli(lastSevenChars+c, e, transettings.current_scheme.rules_x);
                }
                else transPair = transli(lastSevenChars+c, e, transettings.current_scheme.rules);
                oldString = transPair[0];
                newString = transPair[1];
            }
            else
            {
                oldString = c;
                newString = c;
            }
        }
        replaceTransStringAtCaret(targetElement, oldString.length, newString , selectionRange);
        previous_sequence[targetElement.id ] += c;
        if(previous_sequence[targetElement.id ].length > 6 ) previous_sequence[targetElement.id ] = previous_sequence[targetElement.id ].substring(previous_sequence[targetElement.id ].length-6);
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
    if(transettings.current_scheme.extended_keyboard && e.altKey && !e.ctrlKey && !e.metaKey && temp_disable[targetElement.id]) stopPropagation(e);
    else if(e.ctrlKey || e.altKey || e.metaKey) {
        return shortKeyPressed(event);
    }
    return true;
}
/**
 * This is the function to which call during window load event for trasliterating textfields.
 * The funtion will accept any number of HTML tag IDs of textfields.
*/
function transliterate() {
    var len = arguments.length;
    for(var i=0;i<len; i++)
    {
        var element = document.getElementById(arguments[i]);
        if(element)
        {
            trasliteration_fields[arguments[i]] = transettings.default_state;
            previous_sequence[arguments[i]] = '';
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
        enableTrasliteration(checkbox.value,true);
    }
    else
    {
        enableTrasliteration(checkbox.value,false);
    }
}
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
            checkbox.checked = transettings.default_state;
            var para = document.createElement('p');
            para.appendChild(checkbox);
            var text = document.createTextNode(transettings.checkbox.text);
            para.appendChild(text);
            if(transettings.checkbox.position=="after") element.parentNode.insertBefore(para, element.nextSibling);
            else if(transettings.checkbox.position=="before") element.parentNode.insertBefore(para, element);
        }
    }
}

/**
 * This functions is to synchronize state transliteration state to fields from cookies
 */
function translitStateSynWithCookie() {
    var len = arguments.length;
    for(var i=0;i<len; i++)
    {
        var element = document.getElementById(arguments[i]);
        if(element)
        {
            var state = parseInt(readCookie("tr"+arguments[i]));
            var enable = transettings.default_state;
            if(state == 1)  enable=true;
            else if(state==0) enable =false;
            enableTrasliteration(arguments[i],enable);
        }
    }
}

function writingStyleLBChanged(event) {
    var e = event || window.event;
    var listBox =  (e.currentTarget || e.srcElement);
    transettings.current_scheme = transettings.schemes[listBox.selectedIndex];
    setCookie("transToolIndex", listBox.selectedIndex);
}

function initMultiScheme() {
    transettings.current_scheme = transettings.schemes[transettings.default_scheme_index];
}
