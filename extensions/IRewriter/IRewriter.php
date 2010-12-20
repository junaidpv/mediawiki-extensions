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

$wgIRewriterConfig['shortcut_controlkey'] = false;
$wgIRewriterConfig['shortcut_altkey'] = false;
$wgIRewriterConfig['shortcut_shiftkey'] = false;
$wgIRewriterConfig['shortcut_metakey'] = false;
$wgIRewriterConfig['shortcut_key'] = 'M';
$wgIRewriterConfig['default_state'] = true;
$wgIRewriterConfig['schemes'] = array('ml', 'ta99', 'ml_inscript');
$wgIRewriterConfig['default_scheme_index'] = 0;
$wgIRewriterConfig['enabled'] = true;

// localization
$wgExtensionMessagesFiles['IRewriter'] = dirname(__FILE__). '/IRewriter.i18n.php';


/**
 * IRewriter class
 *
 * (implements singleten pattern)
 * 
 * @authorJunaid P V
 * @since 0.1
 */
class IRewriter {
    /**
     * One and only one instance of this class
     * @var IRewriter
     */
    private static $_instance;
    /**
     *
     * @var OutputPage
     */
    private $_out;
    /**
     *
     * @var Skin
     */
    private $_sk;

    /**
     * Only skins listed here are supported
     * @var array
     */
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
     * Hook function for the event 'BeforePageDisplay'
     * @param OutputPage $out
     * @param Skin $sk 
     */
    public function onBeforePageDisplay(&$out, &$sk) {
        // If current skin is not supported do nothing
        if(!in_array($sk->getSkinName(), $this->_supportedSkins)) {
            return true;
        }
        global $wgStylePath, $wgJsMimeType, $wgScriptPath, $wgIRewriterConfig;
        $this->_out = $out;
        $this->_sk = $sk;
        // add script tag for each scheme
        foreach ($wgIRewriterConfig['schemes'] as $scheme) {
            $out->addScript("<script type=\"{$wgJsMimeType}\" src=\"".$wgScriptPath."/extensions/IRewriter/{$scheme}_rules.js\"></script>\n");
        }

        // Load IRewriter.js file
        $out->addScript("<script type=\"{$wgJsMimeType}\" src=\"".$wgScriptPath."/extensions/IRewriter/IRewriter.js\"></script>\n");

        // Place generated JS code according to configuration settings
        $scriptTag = '<script type="'.$wgJsMimeType.'">'.$this->getInitJSCode().'</script>';
        $out->addScript($scriptTag);
        return true;
    }

    /**
     * Generate JavaScript code according to configuration settings
     *
     * @global array $wgIRewriterConfig
     * @param Skin $skinName
     * @return string Generated JS code
     */
    private function getInitJSCode() {
        global $wgIRewriterConfig;
        $str = "IRewriter.shortcut.controlkey= ".IRewriter::boolToString($wgIRewriterConfig['shortcut_controlkey']).";\n";
	$str .= "IRewriter.shortcut.altkey= ".IRewriter::boolToString($wgIRewriterConfig['shortcut_altkey']).";\n";
	$str .= "IRewriter.shortcut.shiftkey= ".IRewriter::boolToString($wgIRewriterConfig['shortcut_shiftkey']).";\n";
	$str .= "IRewriter.shortcut.metakey= ".IRewriter::boolToString($wgIRewriterConfig['shortcut_metakey']).";\n";
	$str .= sprintf("IRewriter.shortcut.key= '%s';\n", $wgIRewriterConfig['shortcut_key']);
	$str .= sprintf("IRewriter.checkbox.text= '%s ('+IRewriter.shortcut.toString()+')';\n", wfMsgForContent('irewriter-toggle-ime') /*$wgIRewriterConfig['checkbox']['text']*/);
        $title = Title::newFromText( wfMsgForContent( 'irewriter-help-page' ) );
        $str .= sprintf("IRewriter.checkbox.href= '%s';\n", $title->getFullURL() );
	$str .= sprintf("IRewriter.checkbox.tooltip= '%s';\n", wfMsgForContent('irewriter-checkbox-tooltip'));
	$str .=    'IRewriter.default_state = '.IRewriter::boolToString($wgIRewriterConfig['default_state']).";\n";
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
        
	$str .= 'IRewriter.enabled = '.IRewriter::boolToString($wgIRewriterConfig['enabled']).";\n";

        $str .= "function irSetup() {\n";
	$str .= "inputRewrite('input');\n";
	$str .= "inputRewrite('textarea');\n";
        $str .= sprintf("IRewriter.init(%d);\n", $wgIRewriterConfig['default_scheme_index']);
        if(in_array($this->_sk->getSkinName(), $this->_supportedSkins)) {
            $str .= 'setupIRewriterFor'.$this->_sk->getSkinName()."();\n";
        }
        $str .= "}\n";
        $str .= "if (window.addEventListener){\n";
	$str .= "window.addEventListener('load', irSetup, false);\n";
        $str .= "} else if (window.attachEvent){\n";
	$str .= "window.attachEvent('onload', irSetup);\n";
        $str .= "}";
        return $str;
    }

    /**
     * Convert return string representation of give bool value
     * @param bool $value
     * @return string
     */
    public static function  boolToString($value) {
        return ($value) ? 'true' : 'false';
    }
}

// register hook function
$wgHooks['BeforePageDisplay'][] = IRewriter::getInstance();
