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
		$valid_page_templates = ["album", "contents", "favorites"];
		$valid_page = in_array(Koken::$location['template'],$valid_page_templates);

		if ($valid_page) {
			$css = "photoswipe.css";
			$skin_css = "default-skin/default-skin.css";
			$js = "photoswipe.min.js";
			$ui_js = "photoswipe-ui-default.min.js";
			$pswp_js = "pswp.min.js";

			$pswp[] = '<link rel="stylesheet" href="'.$this->get_url($css).'" />';
			$pswp[] = '<link rel="stylesheet" href="'.$this->get_url($skin_css).'" />';
			$pswp[] = '<script src="'.$this->get_url($js).'"></script>';
			$pswp[] = '<script src="'.$this->get_url($ui_js).'"></script>';
			$pswp[] = '<script src="'.$this->get_url($pswp_js).'"></script>';
			$pswp[] = '<style type="text/css">.pswp {text-align:left;}</style>';
			$pswp[] = '<script language="javascript">$(function(){initPhotoSwipeFromDOM();});</script>';

			if (is_file($this->get_file_path().DIRECTORY_SEPARATOR.$this->custom_folder.DIRECTORY_SEPARATOR."pswp.html")) {
				include $this->get_file_path().DIRECTORY_SEPARATOR.$this->custom_folder.DIRECTORY_SEPARATOR."pswp.html";
			} else {
				include $this->get_file_path().DIRECTORY_SEPARATOR.$this->pswp_folder.DIRECTORY_SEPARATOR."pswp.html";
			}
			print join("\n",$pswp);
		}
	}

	function get_url($file) {
		if (is_file($this->get_file_path().DIRECTORY_SEPARATOR.$this->custom_folder.DIRECTORY_SEPARATOR.$file)) {
			return Koken::$location['real_root_folder']."/storage/plugins/".$this->get_key()."/".$this->custom_folder."/".$file;
		}
		else {
			return Koken::$location['real_root_folder']."/storage/plugins/".$this->get_key()."/".$this->pswp_folder."/".$file;
		}
	}
}
