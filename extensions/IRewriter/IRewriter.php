<?php
/**
 * NAME
 * 	IRewriter
 * 
 * SYNOPSIS
 * 	
 * INSTALL
 * 	Put this file to your Mediawiki extensions directory
 *	Then add this line to LocalSettings.php
 *
 *		require_once("$IP/extensions/IRewriter.php");
 * 
 * AUTHOR
 * 	Junaid P V <http://junaidpv.in>
 * 
 * @package extensions
 * @version 0.1
 * @copyright Copyright 2010 Junaid P V
 * @license GPLv3
 */
if(!defined('MEDIAWIKI')) {
    exit (1);
}

// register extension credits
$wgExtensionCredits['other'][] = array(
	'name' => 'IRewriter',
	'version' => 0.1,
	'author' =>'Junaid P V (http://junaidpv.in)',
	'url' => 'http://www.mediawiki.org/wiki/Extension:IRewriter',
	'description' => 'Allows to add custom input methods for input fields.'
);

$wgIRewriterConfig = array(
    'shortcut' => array(
        'controlkey' => false,
        'altkey' => false,
        'shiftkey' => false,
        'metakey' => false,
        'key' => 'M'
    ),
    'checkbox' => array(
        'text' => '',
        'link' => array(
            'href' => '',
            'tooltip' => ''
        ),
    ),
    'default_state' => true,
    'schemes' => array(),
    'default_scheme_index' => 0,
    'enabled' => true
);

$wgExtensionMessagesFiles['IRewriter'] = dirname(__FILE__). '/IRewriter.i18n.php';


/**
 * IRewriter class
 *
 * implements singleten pattern
 * 
 * @authorJunaid P V
 * @since 0.1
 */
class IRewriter {
    private static $_instance;
    /*
    private $_schemes=array();
    private $_shortcutKey = 'M';
    private $_controlKey = true;
    private $_altKey = false;
    private $_shiftKey = false;
    private $_metaKey = false;*/
    private $_settings = array(
        'shortcut' => array(
            'controlkey' => false,
            'altkey' => false,
            'shiftkey' => false,
            'metakey' => false,
            'key' => 'M'
        ),
        'checkbox' => array(
            'text' => '',
            'link' => array(
                'href' => '',
                'tooltip' => ''
            ),
        ),
        'default_state' => true,
        'schemes' => array(),
        'default_scheme_index' => 0,
        'enabled' => true
    );

    private $_out;

    private $_supportedSkins = array('vector', 'monobook');

    /**
     * implemtns singleten pattern so direct object creation is prevented.
     */
    private function __construct() {
        
    }

    /**
     * Returns one and only object of the class
     * @return IRewriter
     */
    public static  function getInstance() {
        if(!(self::$_instance instanceof  self)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Add scheme to the list for loading.
     * The object will add scripts tags to load specified scheme.
     * The schemes should be defined in seperated javascript files
     * under $IP/skins/commin directory.
     * File name should in the form <scheme>_rules.js
     *
     * @param string $scheme
     */
    /*
    public function addScheme($scheme) {
        $this->_schemes[] = $scheme;
    }*/

    /**
     * Hook function for the event 'BeforePageDisplay'
     * @param OutputPage $out
     * @param Skin $sk 
     */
    public function onBeforePageDisplay(&$out, &$sk) {
        global $wgStylePath, $wgJsMimeType, $wgScriptPath, $wgIRewriterConfig;
        $this->_out = $out;
        // add script tag for each scheme
        foreach ($wgIRewriterConfig['schemes'] as $scheme) {
            $out->addScript("<script type=\"{$wgJsMimeType}\" src=\"".$wgScriptPath."/extensions/IRewriter/{$scheme}_rules.js\"></script>\n");
        }

        # Register tool js file for IRewriter
        $out->addScript("<script type=\"{$wgJsMimeType}\" src=\"".$wgScriptPath."/extensions/IRewriter/IRewriter.js\"></script>\n");

        $scriptTag = '<script type="'.$wgJsMimeType.'">'.$this->getInitJSCode($sk->getSkinName()).'</script>';
        $out->addScript($scriptTag);
        return true;
    }

    private function getInitJSCode($skinName) {
        global $wgIRewriterConfig;
        $shortcut = $wgIRewriterConfig['shortcut'];
        $str = "IRewriter.shortcut.controlkey= ".IRewriter::boolToString($shortcut['controlkey']).";\n";
	$str .= "IRewriter.shortcut.altkey= ".IRewriter::boolToString($shortcut['altkey']).";\n";
	$str .= "IRewriter.shortcut.shiftkey= ".IRewriter::boolToString($shortcut['shiftkey']).";\n";
	$str .= "IRewriter.shortcut.metakey= ".IRewriter::boolToString($shortcut['metakey']).";\n";
	$str .= sprintf("IRewriter.shortcut.key= '%s';\n", $shortcut['key']);
	$str .= sprintf("IRewriter.checkbox.text= '%s ('+IRewriter.shortcut.toString()+')';\n", wfMsg('irewriter-toggle-ime') /*$wgIRewriterConfig['checkbox']['text']*/);
	$str .= sprintf("IRewriter.checkbox.href= '%s';\n", $wgIRewriterConfig['checkbox']['href']);
	$str .= sprintf("IRewriter.checkbox.tooltip= '%s';\n", $wgIRewriterConfig['checkbox']['tooltip']);
	//$str .=    'IRewriter.default_state = '.IRewriter::boolToString($wgIRewriterConfig['default_state']).";\n";
	$str .=    "IRewriter.schemes = [\n";
        $schemeCount = count($wgIRewriterConfig['schemes']);
        for($i =0; $i < $schemeCount; $i++) {
            $str .= sprintf('tr_%s', $wgIRewriterConfig['schemes'][$i]);
            if($i < ($schemeCount-1)) {
                $str .= ', ';
            }
        }
        $str .= "];\n";
        for($i =0; $i < $schemeCount; $i++) {
            $str .= sprintf("tr_%s.text = '%s';\n", $wgIRewriterConfig['schemes'][$i], wfMsg('irewriter-'.str_replace('_', '-', $wgIRewriterConfig['schemes'][$i])) );
        }


        $temp = $wgIRewriterConfig['default_scheme_index'];
	//$str .= sprintf("IRewriter.default_scheme_index = %d;\n",$temp);
	$str .= 'IRewriter.enabled = '.IRewriter::boolToString($wgIRewriterConfig['enabled']).";\n";

        $str .= "function irSetup() {\n";
	$str .= "inputRewrite('input');\n";
	$str .= "inputRewrite('textarea');\n";
        $str .= sprintf("IRewriter.init(%d);\n", $wgIRewriterConfig['default_scheme_index']);
        if(in_array($skinName, $this->_supportedSkins)) {
            $str .= 'setupIRewriterFor'.$skinName."();\n";
        }
        $str .= "}\n";
        $str .= "if (window.addEventListener){\n";
	$str .= "window.addEventListener('load', irSetup, false);\n";
        $str .= "} else if (window.attachEvent){\n";
	$str .= "window.attachEvent('onload', irSetup);\n";
        $str .= "}";
        return $str;
    }

    public static function  boolToString($value) {
        return ($value) ? 'true' : 'false';
    }
}

// register hook function
$wgHooks['BeforePageDisplay'][] = IRewriter::getInstance();
