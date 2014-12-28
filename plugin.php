<?php

class MesphotosPhotoswipe extends KokenPlugin {

	function __construct()
	{
		$this->pswp_folder = "pswp";
		$this->custom_folder = "custom";

		$this->register_hook('before_closing_body', 'foot');
	}

	function foot($data)
	{

		$sharing = [];
		foreach ($this->data as $key => $val) {
			$matches = null;
			preg_match("/^share_(.+)$/",$key,$matches);
			if ($matches[1] && $val == 1) {
				$sharing[] = $matches[1];
			}
		}

		$scrollEl = $this->get_scrollEl();
		$css = "photoswipe.css";
		$skin_css = "default-skin/default-skin.css";
		$js = "photoswipe.min.js";
		$ui_js = "photoswipe-ui-default.min.js";
		$pswp_js = "pswp.min.js";
		$plugin_css = "default-skin/plugin.css";

		$pswp[] = '<link rel="stylesheet" href="'.$this->get_url($css).'" />';
		$pswp[] = '<link rel="stylesheet" href="'.$this->get_url($skin_css).'" />';
		$pswp[] = '<link rel="stylesheet" href="'.$this->get_url($plugin_css).'" />';
		$pswp[] = '<script src="'.$this->get_url($js).'"></script>';
		$pswp[] = '<script src="'.$this->get_url($ui_js).'"></script>';
		$pswp[] = '<script src="'.$this->get_url($pswp_js).'"></script>';
		$pswp[] = '<script language="javascript">$(function(){options = {"sharing":'.json_encode($sharing).',"triggerEl":"'.$this->get_triggerEl().'"};initPhotoSwipeFromDOM(options);});</script>';

		if ($scrollEl) {
			$pswp[] = '<script language="javascript">$(function(){$("'.$scrollEl[0].'").removeClass("'.$scrollEl[1].'");});</script>';
		}

		if (is_file($this->get_file_path().DIRECTORY_SEPARATOR.$this->custom_folder.DIRECTORY_SEPARATOR."pswp.html")) {
			include $this->get_file_path().DIRECTORY_SEPARATOR.$this->custom_folder.DIRECTORY_SEPARATOR."pswp.html";
		} else {
			include $this->get_file_path().DIRECTORY_SEPARATOR.$this->pswp_folder.DIRECTORY_SEPARATOR."pswp.html";
		}
		print join("\n",$pswp);
	}

	function get_url($file) {
		if (is_file($this->get_file_path().DIRECTORY_SEPARATOR.$this->custom_folder.DIRECTORY_SEPARATOR.$file)) {
			return Koken::$location['real_root_folder']."/storage/plugins/".$this->get_key()."/".$this->custom_folder."/".$file;
		}
		else {
			return Koken::$location['real_root_folder']."/storage/plugins/".$this->get_key()."/".$this->pswp_folder."/".$file;
		}
	}

	function get_triggerEl() {
		if (trim($this->data->trigger_el)!="") {
			return trim($this->data->trigger_el);
		}

		$triggerEls = Array(
			'axis' => 'a.k-link-lightbox',
			'axis2' => 'a.k-link-lightbox',
			'boulevard' => 'div.content',
			'chastain' => 'span.img-wrap a',
			'elementary' => 'a.thumb',
			'ensemble' => 'div.list-image a',
			'madison' => 'a.k-link-lightbox',
			'madison2' => 'a.k-link-lightbox',
			'regale' => 'a.k-link-lightbox',
			'regale2' => 'a.k-link-lightbox',
			'repertoire' => 'div.img-wrap a'
		);
		$myTheme = strtolower(Koken::$site['theme']['name']);
		return $triggerEls[$myTheme];
	}

	function get_scrollEl() {
		if (trim($this->data->scroll_el)!="") {
			$element = trim($this->data->scroll_el);
			$info = pathinfo($element);
			return Array($element, $info['extension']);
		}

		$scrollEls = Array(
			'ensemble' => 'div.list-image',
			'repertoire' => '.scroll-me',
			'chastain' => '.content-list'
		);
		$myTheme = strtolower(Koken::$site['theme']['name']);

		$scrollEl = null;
		if (array_key_exists($myTheme,$scrollEls)) {
			$element = $scrollEls[$myTheme];
			$info = pathinfo($element);
			$scrollEl = Array($element, $info['extension']);
		}
		return $scrollEl;
	}
}
