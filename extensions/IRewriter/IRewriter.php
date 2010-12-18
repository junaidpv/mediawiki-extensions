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
	'author' =>'Junaid P V',
	'url' => 'http://www.mediawiki.org/wiki/Extension:IRewriter',
	'description' => 'Allow to implement custom input methods for input fields.'
);

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

    private $_supportedSkins = array('Vector', 'Monobook');

    /**
     * implemtns singleten pattern so direct object creation is prevented.
     */
    private function __construct() {
        
    }

    public function setSettings($settings) {
        $this->_settings = array_merge_recursive($this->_settings, $settings);
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
        global $wgStylePath, $wgJsMimeType, $wgScriptPath;
        // add script tag for each scheme
        foreach ($this->_settings['schemes'] as $scheme) {
            $out->addScript("<script type=\"{$wgJsMimeType}\" src=\"".$wgScriptPath."/extensions/IRewriter/{$scheme}_rules.js\"></script>\n");
        }

        # Register tool js file for IRewriter
        $out->addScript("<script type=\"{$wgJsMimeType}\" src=\"".$wgScriptPath."/extensions/IRewriter/IRewriter.js\"></script>\n");

        $scriptTag = '<script type="'.$wgJsMimeType.'">'.$this->getInitJSCode($sk->getSkinName()).'</script>';
        $out->addScript($scriptTag);
        return true;
    }

    private function getInitJSCode($skinName) {
        
	$settings =    "IRewriter.shortcut = {\n";
        $settings .=        "controlkey: ".  IRewriter::boolToString($this->_settings['shortcut']['controlkey']).",\n";
	$settings .=        "altkey: ".IRewriter::boolToString($this->_settings['shortcut']['altkey']).",\n";
	$settings .=        "shiftkey: ".IRewriter::boolToString($this->_settings['shortcut']['shiftkey']).",\n";
	$settings .=        "metakey: ".IRewriter::boolToString($this->_settings['shortcut']['metakey']).",\n";
	$settings .=        "key: ".$this->_settings['shortcut']['key'].",\n";
	$settings .=    "};\n";
	$settings .=    "IRewriter.checkbox = {\n";
	$settings .=        "text: '".$this->_settings['checkbox']['text']." ('+IRewriter.shortcut.toString()+')',\n";
	$settings .=        "href: '".$this->_settings['checkbox']['href']."',\n";
	$settings .=        "tooltip: '".$this->_settings['checkbox']['tooltip']."',\n";
	$settings .=    "};\n";
	$settings .=    'IRewriter.default_state = '.IRewriter::boolToString($this->_settings['default_state']).";\n";
	$settings .=    "IRewriter.schemes = [\n";
        $schemeCount = count($this->_settings['schemes']);
        for($i =0; $i < $schemeCount; $i++) {
            $settings .= 'tr_'.$this->_settings['schemes'][$i];
            if($i < ($schemeCount-1)) {
                $settings .= ', ';
            }
        }
        $settings .= "];\n";
	$settings .= "IRewriter.default_scheme_index = ".$this->_settings['default_scheme_index'].";\n";
	$settings .= 'IRewriter.enabled = '.IRewriter::boolToString($this->_settings['enabled']).";\n";

        $settings .= "function irSetup() {\n";
	$settings .= "inputRewrite('input');\n";
	$settings .= "inputRewrite('textarea');\n";
        $settings .= "IRewriter.init();\n";
        if(in_array($skinName, $this->_supportedSkins)) {
            $settings .= 'setupIRewriterFor'.$skinName."();\n";
        }
        $settings .= "}\n";
        $settings .= "if (window.addEventListener){\n";
	$settings .= "window.addEventListener('load', irSetup, false);\n";
        $settings .= "} else if (window.attachEvent){\n";
	$settings .= "window.attachEvent('onload', irSetup);\n";
        $settings .= "}";
        return $settings;
    }

    public static function  boolToString($value) {
        return ($value) ? 'true' : 'false';
    }
}

// register hook function
$wgHooks['BeforePageDisplay'][] = IRewriter::getInstance();
