<?php
/**
 * NAME
 * 	IRewriter
 * 
 * SYNOPSIS
 * 	
 * INSTALL
 * 	Put this file to your Mediawiki extensions directory
 * 
 *	Then add this line to LocalSettings.php
 *
 *		require_once("$IP/extensions/AccountManager.php");
 * AUTHR
 * 	Junaid P V <junu.pv@gmail.com>
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
 * 
 * @authorJunaid P V
 * @since 0.1
 */
class IRewriter {
    public function __construct() {
        
    }

    /**
     *
     * @param OutputPage $out
     * @param Skin $sk 
     */
    public function onBeforePageDisplay(&$out, &$sk) {
        $scriptTag = '<script type="text/javascript">';
        
        $scriptTag += '</script>';
        $out->addScript($scriptTag);
    }
}

// register hook function
$wgHooks['BeforePageDisplay'][] = new IRewriter();
