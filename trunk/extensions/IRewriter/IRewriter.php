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
    private $_settings = array();

    private $_supportedSkins = array('Vector', 'Monobook');

    /**
     * implemtns singleten pattern so direct object creation is prevented.
     */
    private function __construct() {
        
    }

    public function setSettings($settings) {
        $this->_settings = $settings;
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

        $scriptTag = '<script type="'.$wgJsMimeType.'">'.$this->getInitJSCode($sk->getSkinName()).'</script>';
        return true;
    }

    private function getInitJSCode($skinName) {
        
	$settings =    'IRewriter.shortcut = {';
        $settings +=        'controlkey: '.$this->_settings['shortcut']['controlkey'].',';
	$settings +=        'altkey: '.$this->_settings['shortcut']['altkey'].',';
	$settings +=        'shiftkey: '.$this->_settings['shortcut']['shiftkey'].',';
	$settings +=        'metakey: '.$this->_settings['shortcut']['metakey'].',';
	$settings +=        'key: '.$this->_settings['shortcut']['key'].',';
	$settings +=    '};\n';
	$settings +=    'IRewriter.checkbox = {';
	$settings +=        'text: \'To toggle (\'+ IRewriter.shortcut.toString()+ \')\' \''.$this->_settings['checkbox']['text'].'\' ,';
	$settings +=        'link: {';
	$settings +=            'href: \'http://ml.wikipedia.org/wiki/Help:Typing\',';
	$settings +=            'tooltip = \'To write Malayalam use this tool, shortcut: (\'+ IRewriter.shortcut.toString()+ \')\',';
	$settings +=        '},';
	$settings +=    '};\n';
	$settings +=    'IRewriter.default_state = true;\n';
	$settings +=    'IRewriter.schemes = [';
        $schemeCount = count($this->_settings);
        for($i =0; $i < $schemeCount; $i++) {
            $settings += $this->_settings['schemes'];
            if($i < ($schemeCount-1)) {
                $settings += ', ';
            }
        }
        $settings += '];\n';
	$settings += 'IRewriter.default_scheme_index= '.$this->_settings['default_scheme_index'].',';
	$settings +=    'IRewriter.enabled = '.$this->_settings['enabled'].'\n';
        if(in_array($skinName, $this->_supportedSkins)) {
            $settings += 'setupIRewriterFor'.$skinName.'();\n';
        }
    }
}

// register hook function
$wgHooks['BeforePageDisplay'][] = IRewriter::getInstance();
