var initPhotoSwipeFromDOM = function(options) {

	var parseThumbnailElements = function(el) {

		var items = []

		el.children("img").each(function(){
			if (typeof($(this).attr('data-base')) != "undefined" && typeof($(this).attr('data-extension')) != "undefined" && typeof($(this).attr('data-presets')) != "undefined") {
				var item = {};
				var base = $(this).attr('data-base');
				var ext = $(this).attr('data-extension');
				item['_common'] = {
					"msrc": $(this).attr('data-src') || $(this).attr('src')
				};
				item['title'] = $(this).attr('data-alt') || $(this).attr('alt');
				item['caption'] = $(this).nextAll('.item-caption:first').html();
				item.pid = base.split('/').slice(-3).join("-").slice(0,-1).toLowerCase();

				jQuery.each($(this).attr('data-presets').split(" "), function(i,val) {
					var preset_info = val.split(",");
					var name = preset_info[0];
					var size_factor = isHighDensity() ? 2 : 1;
					var retina = isHighDensity() ? '.2x.' : '.';
					var w = parseInt(preset_info[1]);
					var h = parseInt(preset_info[2]);
					var src = base+name+retina+ext;

					item[name] = {
						"src": src,
						"w": size_factor*w,
						"h": size_factor*h
					};
					if (name=='huge') {
						item['huge.2x'] = {
							"src": base+name+'.2x.'+ext,
							"w": 2*w,
							"h": 2*h
						};
					}
				});
				itemExists = false;
				$.each(items,function(index, value){
					if (value.pid == item.pid) {
						itemExists = true;
						return false;
					}
				});
				if (!itemExists) {
					items.push(item);
				}
			}
		});
		return items;
	};

	// parse picture index and gallery index from URL (#&pid=1&gid=2)
	var photoswipeParseHash = function() {
		var hash = window.location.hash.substring(1),
		params = {};

		if(hash.length < 5) {
			return params;
		}

		var vars = hash.split('&');
		for (var i = 0; i < vars.length; i++) {
			if(!vars[i]) {
				continue;
			}
			var pair = vars[i].split('=');
			if(pair.length < 2) {
				continue;
			}
			params[pair[0]] = pair[1];
		}

		if(params.gid) {
			params.gid = parseInt(params.gid, 10);
		}

		return params;
	};

	var openPhotoSwipe = function(index, disableAnimation, fromURL) {
		var pswpElement = $('.pswp')[0],
			gallery,
			options,
			items;

		if (pswp_open) {
			return true;
		}
		items = parseThumbnailElements(galleryElements);

		availableShareButtons = {
			facebook:{ id:'facebook', label:'Share on Facebook', url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
			twitter:{id:'twitter', label:'Tweet', url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
			pinterest:{id:'pinterest', label:'Pin it', url:'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}'},
			gplus:{id:'gplus', label:'Google+', url:'https://plus.google.com/share?url={{url}}'},
			tumblr:{id:'tumblr', label:'Tumblr', url:'http://www.tumblr.com/share/photo?caption={{text}}&click_thru={{url}}&source={{image_url}}'},
			download:{id:'download', label:'Download Image', url:'{{raw_image_url}}',download:true}
		};
		var shareButtons = Array();
		$.each(koken_options.sharing, function(index,value) {
			shareButtons.push(eval('availableShareButtons.'+value));
		});

		// define options (if needed)
		options = {
			preload: [5,10],

			getThumbBoundsFn: function(index) {
				el=$("[data-pswp-uid='"+index+"']").children("img[data-presets]");
				if (typeof(el.offset())=="undefined") {
					return {x:0,y:0,w:200};
				}
				return {x:el.offset().left, y:el.offset().top, w:el.width()};
			},

			shareButtons: shareButtons,
			getImageURLForShare: function( shareButtonData ) {
				if (shareButtonData.download && koken_options.download_full) {
					download_version = 'huge';
					if (koken_options.hidpi===true) {download_version = 'huge.2x'}
					return gallery.currItem[download_version].src;
				}
				return gallery.currItem.src || '';
			},
			shareEl: (shareButtons.length>0),
			// prevent zooming to 200x on retina devices (eg retina macbook pro, ipads)
			getDoubleTapZoom: function(){
				if (window.devicePixelRatio > 1) {
					return 0.5;
				} else {
					return 1;
				}
			},
			galleryPIDs: true,
			addCaptionHTMLFn: function(item, captionEl, isFake) {
				if(!koken_options.showTitle || !item.title) {
					captionEl.children[0].innerHTML = '';
					return false;
				}
				captionEl.children[0].innerHTML = item.title + (item.caption ? '<br/><small>' + item.caption + '</small>' : '');
				return true;
			}
		};

		if (fromURL) {
			if (options.galleryPIDs) {
				for (var j = 0;j < items.length; j++) {
					if(items[j].pid == index) {
						options.index = j;
						break;
					}
				}
			} else {
				options.index = parseInt(index,10) -1;
			}
		} else {
			options.index = parseInt(index,10);
		}

		if (isNaN(options.index)) {
			return;
		}

		if(disableAnimation) {
			options.showAnimationDuration = 0;
		}

		// Pass data to PhotoSwipe and initialize it
		gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);

		// create variable that will store real size of viewport
		var realViewportWidth,
			useImageSize = 'medium_large',
			firstResize = true,
			imageSrcWillChange;

		// beforeResize event fires each time size of gallery viewport updates
		gallery.listen('beforeResize', function() {
			// calculate real pixels when size changes
			max_size = koken_options.max_size;
			size_factor = isHighDensity() ? 2 : 1;
			realViewportWidth = gallery.viewportSize.x * size_factor;

			// Code below is needed if you want image to switch dynamically on window.resize

			// Find out if current images need to be changed
			if(realViewportWidth >=1600 && max_size >= 1600 && 'huge' in items[0]) {
				neededSize = 'huge';
				if(realViewportWidth >=2048 && max_size >= 2048 && koken_options.hidpi===true && size_factor==1) {
					neededSize = 'huge.2x';
				}
			} else if(realViewportWidth >= 1024 && max_size >= 1024 && 'xlarge' in items[0]) {
				neededSize = 'xlarge';
			} else if(realViewportWidth >= 800 && max_size >= 800 && 'large' in items[0]) {
				neededSize = 'large';
			} else {
				neededSize = 'medium_large';
			}

			// Invalidate items only when source is changed and when it's not the first update
			if (useImageSize != neededSize) {
				useImageSize = neededSize;
				if (!firstResize) {
					// invalidateCurrItems sets a flag on slides that are in DOM,
					// which will force update of content (image) on window.resize.
					gallery.invalidateCurrItems();
				}
			}

			firstResize = false;
		});

		// gettingData event fires each time PhotoSwipe retrieves image source & size

		gallery.listen('gettingData', function(index, item) {

			// Set image source & size based on real viewport width
			item.src = item[useImageSize].src;
			item.msrc = item['_common'].msrc.replace(".crop.",".");
			item.w = item[useImageSize].w;
			item.h = item[useImageSize].h;

			// It doesn't really matter what will you do here,
			// as long as item.src, item.w and item.h have valid values.
			//
			// Just avoid http requests in this listener, as it fires quite often

		});

		/*
		gallery.listen('imageLoadComplete', function(index, item) {
			console.log(index);
			console.dir(item);
		});
		*/

		var scroll_move = null;
		var bind_move = false;
		if (typeof $K == 'object') {
			if (typeof $K.keyboard == 'object') {
				if (typeof $K.keyboard.scroll == 'object') {
					if (typeof $K.keyboard.scroll.move == "function") {
						scroll_move = $K.keyboard.scroll.move;
						$K.keyboard.scroll.move = function(){return true;};
					}
				}
                $("[data-bind-to-key]").each(function() {
					bind_move = true;
                    var t = $(this), e = t.attr("data-bind-to-key");
                    key.unbind(e);
                });
			}
		}
		gallery.listen('destroy',function(){
			if (bind_move === true){
				$K.keyboard.bind();
			}
			if (scroll_move) {
				$K.keyboard.scroll.move = scroll_move;
				scroll_move = null;
			}
			pswp_open = false;
			$('.pswp')[0].className = "pswp";
			if (pswp_open_orientation!=window.orientation) {
				initPS();
			}
			if (pswp_open_width!=$(window).width() || pswp_open_height!=$(window).height()) {
				initPS();
			}
		});
		gallery.init();
		pswp_open = true;
		pswp_open_orientation = window.orientation;
		pswp_open_width = $(window).width();
		pswp_open_height = $(window).height();
	};

	var isHighDensity = function(){
		if (koken_options.hidpi===false) {
			return false;
		}
		return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 144dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
	};

	var initPS = function() {
		if (koken_options.usingPillar || koken_options.usingPjaxWithoutPillar) {
			setTimeout(runInitPS,500);
		} else {
			runInitPS();
		}
	};
	var runInitPS = function(){

		if (!pswp_open) {
			$('.pswp')[0].className = "pswp";
			$("a[data-pswp-uid]").removeAttr("data-pswp-upid");
		}

		var i = 0;
		if (koken_options.usingPillar && !koken_options.usingPjaxWithoutPillar) {
			if (size_group == "size_0" && typeof(start_size_group)=="undefined") {
				old_size_group = size_group;
				class_attr = $('div.pillar').attr('class');
				if (class_attr) {
					start_size_group = $.grep(class_attr.split(' '),function(v){return v!='pillar';})[0];
				}
			}
			if (orientation_changed) {
				if (size_group == "size_0") {
					size_group = start_size_group;
				}
				old_size_group = size_group;
				class_attr = $('div.pillar:not(.'+old_size_group+')').attr('class');
				if (class_attr) {
					size_group = $.grep(class_attr.split(' '),function(v){return v!='pillar';})[0];
				}
				orientation_changed = false;
			}
			galleryElements = $('div.pillar:not(.'+old_size_group+') '+koken_options.triggerEl);
		}
		else {
			galleryElements = $(koken_options.triggerEl);
		}
		if (!pswp_open) {
			galleryElements.each(function(){
				if ($(this).children("img").length > 0) {
					set_link($(this),i);
					i++;
				}
			});
			galleryElements.each(function(){
				if ($(this).attr("title")==koken_options.view_in_lightbox) {
					lb_url = $(this).attr("href");
					if (typeof lb_url != "undefined" && lb_url.length > 0 ) {
						lb_element = $(this);
						$('a[href="'+lb_url+'"]').each(function(){
							if ($(this).attr('data-pswp-uid') && $(this).children("img").length > 0 ) {
								set_link(lb_element,$(this).attr('data-pswp-uid'));
							}
						});
					}
				}
			});
		}
	};
	var set_link = function(el,i) {
		if (!el.parent().hasClass('type_video')) {
			el.click(function(e) {
				openPhotoSwipe(el.first().attr('data-pswp-uid'));
				return false;
			});
		}
		el.attr('data-pswp-uid', i);
	};
	var koken_options = options;
	var pswp_open = false;
	var pswp_open_orientation;
	var orientation_changed = false;
	var orientation = window.orientation;
	var size_group = "size_0", old_size_group, start_size_group;

	var galleryElements = $(koken_options.triggerEl);

	var last_resize = 0;
	$(window).on('k-resize',function(){
		if ((Date.now()-last_resize>1000)) {
			last_resize = Date.now();
			initPS();
		}
	});

	if (koken_options.usingPillar || koken_options.usingPjaxWithoutPillar) {
		$(document).on('pjax:end', function(){
			initPS();
		});
		$(window).on('orientationchange', function(){
			if (window.orientation != orientation) {
				orientation_changed = true;
				orientation = window.orientation;
				initPS();
			}
			else {
				orientation_changed = false;
			}
		});
		$(window).on('k-infinite-loaded',function(){
			initPS();
		});
		initPS();
	}
	else {
		initPS();
	}

	// Parse URL and open gallery if it contains #&pid=3&gid=1
	var hashData = photoswipeParseHash();
	if(hashData.pid && hashData.gid) {
		openPhotoSwipe( hashData.pid, true, true );
	}

};
