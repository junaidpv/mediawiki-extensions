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
    private $_schemes=array();
    private $_shortcutKey = 'M';
    private $_controlKey = true;
    private $_altKey = false;
    private $_shiftKey = false;
    private $_metaKey = false;

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
    public function addScheme($scheme) {
        $this->_schemes[] = $scheme;
    }

    /**
     * Hook function for the event 'BeforePageDisplay'
     * @param OutputPage $out
     * @param Skin $sk 
     */
    public function onBeforePageDisplay(&$out, &$sk) {
        global $wgStylePath;
        // add script tag for each scheme
        foreach ($this->_schemes as $scheme) {
            $out->addScript("<script type=\"{$wgJsMimeType}\" src=\"".dirname(__FILE__)."/{$scheme}_rules.js\"></script>\n");
        }

        # Register tool js file for IRewriter
        $out->addScript("<script type=\"{$wgJsMimeType}\" src=\"".dirname(__FILE__)."/IRewriter.js\"></script>\n");
        return true;
    }

    /**
     * Support for vector skin
     */
    private function addScriptTagForVectorSkin(){
        $scriptTag = '<script type="text/javascript">';
        $scriptTag += 'function transetup(event) {';
        foreach ($this->_schemes as $scheme) {
            $scriptTag += 'transettings.push(tr_'.$scheme.');';
        }
        $scriptTag += 'transettings.shortcut.key = "'.$this->_shortcutKey.'";';
        $scriptTag += 'transettings.shortcut.controlkey = "'.$this->_controlKey.'";';
        $scriptTag += 'transettings.shortcut.shiftkey = "'.$this->_shiftKey.'";';
        $scriptTag += 'transettings.shortcut.altkey = "'.$this->_altKey.'";';
        $scriptTag += 'transettings.shortcut.metakey = "'.$this->_metaKey.'";';
        $scriptTag += 'transettings.shortcut.checkbox = "'.$this->_metaKey.'";';
        
    }
}

// register hook function
$wgHooks['BeforePageDisplay'][] = IRewriter::getInstance();
