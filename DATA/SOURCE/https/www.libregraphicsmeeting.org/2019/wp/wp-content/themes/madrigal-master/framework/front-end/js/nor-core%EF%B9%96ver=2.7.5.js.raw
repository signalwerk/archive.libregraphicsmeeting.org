
	var inlines = '';

	// Scroll via mouse move
	function viamouseScroll() {

	}

	function msieversion() {

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer, return version number
            return true;
        else                 // If another browser, return 0
            return false;

	}


	function showLoader(w) {

		//var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
		//var is_safari = navigator.userAgent.indexOf("Safari") > -1;
		//if ((is_chrome)&&(is_safari)) {is_safari=false;}

		//if(norvars.disableloadingbar!=1 && !is_safari && !Modernizr.touch) {
		if(norvars.disableloadingbar!=1) {
			if(w==1) {
				NProgress.start();
			}else{
				NProgress.done();
			}
		}
	}

	function activateSticky() {

		jQuery(".northeme-sticky").unstick();

		if(jQuery(window).width() < 770) {
			return false;
		}

		jQuery('.northeme-sticky').each(function() {
			if(jQuery(this).parent().hasClass('sticky-wrapper')) {
				return true;
			}
			var topspacing = jQuery(this).data('sticky-spacing');
			var bottomspacing = jQuery(this).data('sticky-footer');
			var active = jQuery(this).data('sticky-on');

			if(active=='always' || jQuery('body').hasClass(active)) {
				active = 1;
			}else if(!jQuery('body').hasClass(active)) {
				active = 0;
			}

			if(
				active==1 &&
				bottomspacing.length > 0 &&
				(jQuery(document).height() - (jQuery(window).height() > 240))
			) {

				/* Reframe Left menu */
				if(
					jQuery(this).hasClass('leftmenu') &&
					(jQuery('.leftmenu').height() > jQuery('#loadintothis').height()-100)
				)
				{
					return true;
				}

				/* Reframe Right Sidebar */

				if(
					jQuery(this).parent().hasClass('rightside') &&
					(jQuery('.rightside').height() > (jQuery('.single-cpt-content.leftside').height()-100))
				)
				{
					return true;
				}

				var geth = (jQuery(document).height() - jQuery(bottomspacing).offset().top) + 140;

				jQuery(this).sticky({
					topSpacing:topspacing,
					itemID:'leftmenu',
					bottomSpacing: geth
				});
			}
		});
	}



	function sliderAlign(slider) {

			if(slider) {
				var dthis = slider;
			}else{
				var dthis = '.workslider [data-shortcode=gallery]';
			}


		jQuery(dthis).imagesLoaded( function() {

			jQuery(dthis).each(function() {

				var height;


				jQuery('ul.slides li',this).each( function() {
					//if(jQuery(this).find('.video-js').length < 1) {
						var imgtype=0;
						height = jQuery(this).parent().height();
						if(jQuery(this).find('iframe').length > 0) {

							var imageHeight = jQuery(this).find('iframe').height();

						}else if(jQuery(this).find('.video-js').length > 0) {

							var imageHeight = jQuery(this).find('video').height();

						}else if(jQuery(this).find('div.textarea').length > 0) {
							var imageHeight = jQuery(this).find('div.textarea').height();
						}else{
							var imageHeight = jQuery(this).find('img').height();
							imgtype = 1;
						}

						if(imageHeight < height && (height - imageHeight > 10)) {
							var offset = (height - imageHeight) / 2;
							jQuery(this).children(':first').css('margin-top', offset + 'px');
						}else{
							jQuery(this).children(':first').css('margin-top','');
						}
					//}
				});

				jQuery('.flex-direction-nav a',this).css('top',height / 2);

				jQuery(this).fadeTo(500,1);

			});

		});

	}



	function extractDomain(url) {
		var domain;
		//find & remove protocol (http, ftp, etc.) and get domain
		if (url.indexOf("://") > -1) {
			domain = url.split('/')[2];
		}
		else {
			domain = url.split('/')[0];
		}

		//find & remove port number
		domain = domain.split(':')[0];

		return domain;
	}




jQuery( document ).ready(function($) {

	jQuery('#loadintothis').fadeIn();


	$(window).bind("pageshow", function(event) {
		var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
		var is_safari = navigator.userAgent.indexOf("Safari") > -1;
		if ((is_chrome)&&(is_safari)) {is_safari=false;}

		if(is_safari) {
			if (event.originalEvent.persisted) {
				window.location.reload();
			}
		}
	});


	/// VARS
	var loaded = true;

	var last_url = document.URL;

	if(history.replaceState) {
		history.replaceState({"id":1}, document.title, document.location.href);
	}

	/// BACK BUTTONS ACTIVE
	$(window).on("popstate", function(e) {
	  var dlink = document.URL;
		dlink = dlink.split('#');
		dlink_last = last_url.split('#');

		if (typeof dlink[1] == 'undefined' || typeof dlink[1] == '') {

			if(!e.originalEvent.state) {
				return;
			}

			window.location =document.URL;
		}

		if(typeof dlink_last[0] !== 'undefined' && (dlink_last[0] != dlink[0])) {
			$(window).unbind('popstate');
			window.location.href = dlink;
			location.reload();
		}

		loaded = true;
	});


	/*
	jQuery('body').on('click','[data-overlay-ajax="true"]',function(e) {

		showLoader(1);

		jQuery.post(jQuery(this).attr('href'),{ajax:1},function(data, status) {
			jQuery('#single-post-overlay .single-post-overlay-container').html('').hide();
			var div = jQuery('#loadintothis', data).html();

			jQuery('#single-post-overlay').fadeIn(function() {
				jQuery('#single-post-overlay .single-post-overlay-container').html(div).fadeIn();
			});

			showLoader(0);

			loadProject('','');

		});
		e.preventDefault();

	});
	*/


	if(norvars.enableajaxnav==1) {


		/* AJAX NAV */
		var ajaxnavlinks = 'a[data-ajax=true], [data-ajax=true] a, .woocommerce.widget a, .woocommerce-breadcrumb a, .main-nav a, .left-main-nav li:not(.menu-item-type-taxonomy) a';

		$('body').on('click',ajaxnavlinks,function(e) {

			if($(this).data('nav') && $('.post-list.mainpostcontainer.unlimited-posts').length > 0) {
				e.preventDefault();
				return;
			}

			var thiswindow = window.location.hostname;
			var thisurl = '';

			if($(this).attr('href') && $(this).attr('href')!='#') {
				thisurl = extractDomain($(this).attr('href'));
			}

			if($(this).parent('li.qtranxs-lang-menu-item').length > 0) {
				return true;
			}

			if($(this).attr('target')=='_blank' || thisurl=='#' || $(this).parent().hasClass('noajax') || $(this).hasClass('noajax') || thiswindow!=thisurl || $(this).attr('href').indexOf(window.location.protocol)== -1) {
				return true;
			}

			if (!(e.which > 1 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)) {

				var murl = $(this).attr('href');
				var appends = $(this).data('append');
				var containerdiv = $(this).data('replace');

				var ptype = $(this).parent().parent().parent().data('post-type');


				if(ptype && (ptype.indexOf('nor-') > -1)) {
					var catnav = '#loadintothis';
				}


				if(murl.indexOf("http") < 0 || $(this).attr('target')=='_blank'){
					return true;
				}

				ajaxNav(murl,appends,containerdiv,catnav);

				if($(this).hasClass('main-logo')) {
					$('ul.main-nav li').removeClass('current-menu current-menu-item current_page_item');
				}

				if($(this).closest('.main-nav').length > 0) {
					$('ul.main-nav li').not($(this).parents()).removeClass('current-menu current-menu-item current_page_item');
					$(this).closest('li.menu-item-has-children, .sub-menu').addClass('current-menu current-menu-item current_page_item');
				}

				if($(this).closest('.main-nav').length > 0 || $(this).closest('.left-main-nav').length > 0) {
					$(this).parent().addClass('current-menu current-menu-item current_page_item');
				}else{
					if($('.left-main-nav').length > 0) {
						$('.left-main-nav li a:first-child').each(function() {
							if($(this).attr('href')==murl) {
								$(this).parent('li').addClass('current-menu current-menu-item current_page_item');
							}
						});
					}

					if($('header .main-nav').length > 0) {
						$('header .main-nav li a:first-child').each(function() {
							if($(this).attr('href')==murl) {
								$(this).parent('li').addClass('current-menu current-menu-item current_page_item');
							}
						});
					}
				}

				e.preventDefault();
			}

		});


		function getStyles(data) {

			var escript = [];
			var newdata = $('<div/>').html(data);


			// Change Title
			var ttext = (data.match("<title>(.*?)</title>")[1]);
			document.title = $('<div/>').html(ttext).text();

			var cclass = data.match(/body\sclass=['|"]([^'|"]*)['|"]/)[1];

			$('body').attr('class',cclass);

			// Copy styles

			if(data.match('<style type="text/css" id="custom-css">(.*?)</style>')) {
				var custom_style = data.match('<style type="text/css" id="custom-css">(.*?)</style>')[1];

				if($('#custom-css').length > 0) {
					$('#custom-css').text(custom_style);
				}else{
					$('body').append('<style type="text/css" id="custom-css"></style>');
					$('#custom-css').text(custom_style);
				}
			}

			if(data.match('<style type="text/css" id="custom-css-full>(.*?)</style>')) {
				var custom_style = data.match('<style type="text/css" id="custom-css-full">(.*?)</style>')[1];

				if($('#custom-css').length > 0) {
					$('#custom-css').text(custom_style);
				}else{
					$('body').append('<style type="text/css" id="custom-css-full"></style>');
					$('#custom-css').text(custom_style);
				}
			}

			if(data.match('<style type="text/css" data-type="vc_shortcodes-custom-css">(.*?)</style>')) {
				var custom_style = data.match('<style type="text/css" data-type="vc_shortcodes-custom-css">(.*?)</style>')[1];

				if($('[data-type=vc_shortcodes-custom-css]').length > 0) {
					$('[data-type=vc_shortcodes-custom-css]').text(custom_style);
				}else{
					$('body').append('<style type="text/css" data-type="vc_shortcodes-custom-css"></style>');
					$('[data-type=vc_shortcodes-custom-css]').text(custom_style);
				}
			}

			if(data.match('<style type="text/css" id="custom-css-theme">(.*?)</style>')) {
				var custom_style_theme = data.match('<style type="text/css" id="custom-css-theme">(.*?)</style>')[1];

				if($('#custom-css-theme').length > 0) {
					$('#custom-css-theme').text(custom_style_theme);
				}else{
					$('body').append('<style type="text/css" id="custom-css-theme"></style>');
					$('#custom-css-theme').text(custom_style_theme);
				}
			}

			if(data.match('<style type="text/css" id="bg-slider-css">(.*?)</style>')) {
				var custom_style_woo = data.match('<style type="text/css" id="bg-slider-css">(.*?)</style>')[1];

				if($('#bg-slider-css').length > 0) {
					$('#bg-slider-css').text(custom_style_woo);
				}else{
					$('body').append('<style type="text/css" id="bg-slider-css"></style>');
					$('#bg-slider-css').text(custom_style_woo);
				}

			}else{
				if($('.vegas-slide').length > 0 && jQuery.isFunction($.fn.vegas)) {
					$('body').vegas('destroy');
				}

				if( $.fn.fullpage && jQuery.isFunction($.fn.fullpage.destroy)) {
					$.fn.fullpage.destroy('all');
				}

				$('#bg-slider-css').remove();
			}

			if(data.match('<style type="text/css" id="custom-css-woo">(.*?)</style>')) {
				var custom_style_woo = data.match('<style type="text/css" id="custom-css-woo">(.*?)</style>')[1];

				if($('#custom-css-woo').length > 0) {
					$('#custom-css-woo').text(custom_style_woo);
				}else{
					$('body').append('<style type="text/css" id="custom-css-woo"></style>');
					$('#custom-css-woo').text(custom_style_woo);
				}
			}else{
				$('#custom-css-woo').remove();
			}

			$('.logo-wrapper').html($('.logo-wrapper',data).html());

		}


		function getScripts(data) {

			var escript = [];
			var newdata = $('<div/>').html(data);

			$('script',newdata).each(function() {
				var str = $(this).attr('src');
				str = String(str);
				if(str!=='undefined' && str.indexOf('themepunch') < 1 &&
						(str.indexOf('plugins/') > 0 || str.indexOf('ui/') > 0 || str.indexOf('mediaelement/') > 0)
				 ) {
					escript.push(str);

				}
			});


			$('link',newdata).each(function() {
				var str = $(this).attr('href');
				str = String(str);
				if(str!=='undefined' && $('link[href="'+str+'"]').length < 1 &&
				(str.indexOf('font') > 0 || str.indexOf('.css') > 0)
				) {
					$('body').append("<link rel='stylesheet' href='"+str+"' type='text/css' media='all' />");

				}
			});

			return escript;
		}



		function ajaxNav(murl,appends,containerdiv, catnav) {

				showLoader(1);

				if(typeof appends == 'undefined' && !catnav && norvars.disableajax==1) {
					document.location = murl;
					return false;
				}

				if(typeof containerdiv == 'undefined' && typeof appends == 'undefined') {
					containerdiv = '#loadintothis';
					$(containerdiv).addClass('load-movement');
				}

				$.post(murl,{ajax:1},function(data, status) {

					var elements = $(data);
					var found = $('#loadintothis', data).length;

					if(found < 1) {
						document.location = murl;
						return false;
					}

					var escript = getScripts(data);

					// Get & replace content
					if(typeof appends != 'undefined' && appends != '') {

						$('.pagination').remove();
						var div = $('.'+appends, data).html();
						$(div).css('opacity',0).appendTo('.'+appends);
						loadProject('','', escript,1);
						$('.'+appends).children().fadeTo(500,1);

						if($('.pagination', $(data)).length > 0 && appends=='post-list') {
							$('.pagination', $(data)).insertAfter(".post-list");
						}

					}else{

						$(containerdiv).fadeOut('fast',function() {

							if(containerdiv!='#reviews' && containerdiv!='section.commentform' ) {
								$('html, body').animate({scrollTop:0}, 0, "easeInOutExpo");
							}

							getStyles(data);

							var div = $(containerdiv, data).html();

							if($('.rev_slider',div).length > 0) {
								$(containerdiv).show().removeClass('load-movement').html(div).fadeTo(1000,1);

							}else{
								$(containerdiv).hide().removeClass('load-movement').html(div).fadeTo(1000,1);
							}

							$('.rev_slider_wrapper',containerdiv).css('width','99.9%');


							var div2 = $('.main-website-header', data).html();
							$('.main-website-header').html(div2);

							if($('#leftmenu-wrap').length > 0) {
								var div2 = $('#leftmenu-wrap', data).html();
								$('#leftmenu-wrap').html(div2);
							}


							if(typeof replaceheader!=='undefined') {

								if(jQuery('.page-overlay-menu-wrapper').length > 0) {
									jQuery('.page-overlay-menu-wrapper').fadeOut('normal',function() {

										var div2 = $('header.main-header', data).html();
										$('header.main-header').html(div2);

										var div2 = $('footer', data).html();
										$('footer').html(div2);

									});
								}else{

									var div2 = $('header.main-header', data).html();
									$('header.main-header').html(div2);

									var div2 = $('footer', data).html();
									$('footer').html(div2);

								}

							}else if(norvars.wpmlon==1) {

								var div2 = $('footer', data).html();
								$('footer').html(div2);
							}

							loadProject(data,murl, escript);


						});

					}


				}).fail(function() {
						document.location = murl;
						return false;
				  });

		}

	}



	/* ACCORDION */
	$('body').on('click','.nor-accordion a.accordion-title',function(e) {
		if($(this).closest('.nor-accordion').hasClass('expanded')) {
			$(this).next('.accordion-content').slideUp();
			$(this).closest('.nor-accordion').removeClass('expanded');
		}else{
			$(this).next('.accordion-content').slideDown();
			$(this).closest('.nor-accordion').addClass('expanded');
		}
		e.preventDefault();
	});



	/* AJAX NAV */
	var ajaxnavlinks = 'a[data-ajax=true], [data-ajax=true] a, .woocommerce.widget a, .woocommerce-breadcrumb a, .main-nav a, .left-main-nav a';

	if(typeof ajaxNav != 'function') {
		$('body').on('click',ajaxnavlinks,function(e) {
			if (!(e.which > 1 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)) {
				if($(this).attr('target')!='_blank' && $(this).attr('href').indexOf('#') < 0 && !$(this).data('nav')) {
					if($(this).parents('.show-unlimited').length < 1) {
						showLoader(1);
					}
				}
			}
		});
	}


	$('body').on('touchstart click','.info-overlay[data-link]',function(e) {
		if(Modernizr.touch && !jQuery(this).data('visible')) {
			jQuery(this).parents('.post-list').find('.grid-item .info-overlay[data-link]').removeAttr('data-visible');
			jQuery(this).fadeIn();
			jQuery(this).attr('data-visible',1);
		}else{
			if(jQuery(this).hasClass('openwlightbox')) {
				jQuery(this).parents('article').find('a.img').click();
				return false;
			}else{
				if (!(e.which > 1 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)) {
					if($(this).data('target')=='_blank') {
						window.open($(this).data('link'),'_blank');
					}else{
						if(typeof ajaxNav == 'function') {
							ajaxNav($(this).data('link'),'','#loadintothis', 0)
						}else{
							showLoader(1);
							window.location = $(this).data('link');
						}
					}
				}else{
					window.open($(this).data('link'),'_blank');
				}
			}
		}
	});


	/// DETECT MOBILE
	var $doc = $(document),
	Modernizr = window.Modernizr;


	var bid = 1;

	function updatelinks(m,t) {
		if(history.pushState && history.replaceState) {
			bid++;
			history.pushState({"id":bid}, '', m);
			if(t) {
				document.title = t;
			}

			if(typeof _gaq !== 'undefined') {
				var d = document.location.pathname + document.location.search + document.location.hash;
 				_gaq.push(['_trackPageview', d]);
			}

		}
		activatelightbox();
	}


	/* REPLACE SELECT FIELDS */
	$( document ).ajaxComplete(function( event, xhr, settings ) {
		replaceSelect();
	});


	var get_ie = (function(){
		var undef,
			v = 3,
			div = document.createElement('div'),
			all = div.getElementsByTagName('i');
		while (
			div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
			all[0]
		);
		return v > 4 ? v : 'none';
	}());

	function replaceSelect() {

		if(get_ie > 9 || get_ie=='none') {

			var whichselect = 'select.woocommerce-widget-layered-nav-dropdown, \
												.woocommerce-ordering select.orderby, \
												.forminp select.select, \
												.woocommerce .summary select';

			$(whichselect).each(function() {
				if(!$(this).prev().hasClass('select2-container') && !$(this).parent().hasClass('select-wrap')) {
					if($(this).attr('class')) {
						$(this).wrap('<span class="select-wrap '+$(this).attr('class')+'"></span>');
					}else{
						$(this).wrap('<span class="select-wrap"></span>');
					}
				}
			});

		}

	}


	function activatecatnav() {
		if($('.post-list.mainpostcontainer.unlimited-posts:not(.lightbox-active)').length > 0) {

			//getProperImg(1);

			$('.navibg.withall .fullnav li a, nav.categories-list a, .left-main-nav a[data-nav]').on('click',function(e) {

				var cats = $(this).data('nav');
				var cols = $('.post-list.mainpostcontainer').data('column');

				$('article.grid-item').removeClass('transform-effect load-moveup');

				cols = cols+1;

				var flt = '';

				if(cats=='*') {
					flt = '*';
				}else{
					flt = '.pterm-'+cats;
				}

				// Display related posts
				if($('.post-list.mainpostcontainer').hasClass('nor-masonry')) {
					$('.post-list.mainpostcontainer.nor-masonry').isotope({ filter: flt, transitionDuration:'0.5s' });
				}else{
					$('.post-list.mainpostcontainer article').addClass('trns-anim');

					if(cats=='*') {
						$('.post-list.mainpostcontainer article').removeClass('hide-grid-item clear-left');
						$('.post-list.mainpostcontainer').addClass('category-filter-off');
					}else{
						$('.post-list.mainpostcontainer').removeClass('category-filter-off');
						$('.post-list.mainpostcontainer article').removeClass('clear-left');
						$('.post-list.mainpostcontainer article').addClass('hide-grid-item');
						$('.post-list.mainpostcontainer article'+flt).removeClass('hide-grid-item');
					}

				}

				if(jQuery('.overlay-menu-close').length > 0) {
					jQuery('.overlay-menu-close').click();
				}

				// Mark as selected
				if($(this).parents('.left-main-nav')) {
					$('.left-main-nav a[data-nav]').removeClass('selected');
				}

				$('.navibg.withall .fullnav li a').removeClass('selected');

				$(this).addClass('selected');

				updatelinks($(this).attr('href'));

				$('.lazy').each(function() {
					if($(this).data('original')) {
						$(this).attr('src',$(this).data('original'));
					}
					if($(this).attr('data-srcset')!='') {
						$(this).attr('srcset',$(this).data('srcset'));
						$(this).removeAttr('data-srcset');
					}
				});

				e.preventDefault();
			});

		}
	}


	$('body').on('change','select[name=select-category-nav]',function() {
		showLoader(1);
		window.location = $(this).val();
	});


	function lazyloadfunc() {
		/*
		$("img.lazy").each(function() {

			var datamob;

			if($(this).data('standard') && window.devicePixelRatio < 1.2) {
				datamob = 'standard';
			}else{
				datamob = 'original';
			}

			if($(window).width() < 769 && $(this).data('mobile')) {
				datamob = 'mobile';
			}

			$(this).lazyload({
				effect : "fadeIn",
				data_attribute : datamob,
				threshold : 350,
				load : function()
				{
					$(this).removeClass('lazy');

					if($(this).attr('data-srcset')!='') {
						$(this).attr('srcset',$(this).data('srcset'));
						$(this).removeAttr('data-srcset');
					}
				}
			});
		});
		*/
	}

	/* PROJECT LOAD CALLBACK */
	function loadProject(data,murl,escript,extend,nosticky) {

			if (typeof quantityButtons === 'function') {
				quantityButtons();
			}

			lazyloadfunc();

			jQuery('.video-js').each(function(e) {
				videojs($(this).attr('id'), { "example_option": true, "width": "auto", "height": "auto" }, function(){

				});
			});

			if(typeof opt !== 'undefined') {
				opt.infullscreenmode = false;
				opt.tonpause = false;
			}

			activatecatnav();
			norimgHover();
			getProperImg();
			replaceSelect();
			reviveSliders();
			socialRevive();
			activatelightbox();

			if(!nosticky) {
				stickyupdate(data);
			}

			// Full Page JS
			if(typeof nor_fullpagejs === 'function') {
				nor_fullpagejs();
			}

			do_masonry(data,extend);

			var loadnextpage = nextpage = '';

			infinitescroll();

			showLoader(0);

			if(murl!='') {
				updatelinks(murl);
			}

			$('<button type="submit"><i class="fa fa-search"></i></button>').insertAfter('.searchform input[type=submit], .woocommerce-product-search input[type=submit]');
			$('.searchform input[type=submit], .woocommerce-product-search input[type=submit]').remove();

			/// MOBILE MENU
			$(document).foundationTabs();

			$(".fitvids").fitVids();

			$('form.wpcf7-form p br').remove();

			if(typeof product_gallery === 'function') {
				product_gallery();
			}

			theme_ajax_funcs(data,murl);

			gridOverlayDetect();

			if(norvars.wooinstalled==1) {
				nor_rating();

				var curim = 0;


				$('.product-images a.first-prd-img img').on('load', function () {
					setTimeout('getwooimage()',250);
				});


				$('.woocommerce-review-link').on('click',function(e) {
					$('.woocommerce-tabs').show();
					$('#tab-reviews').slideDown('normal',function() {
						activateSticky();
					});
					$('html,body').animate({scrollTop: ($("#reviews").offset().top)-80},'slow');
					e.preventDefault();
				});

				// Product Review Button
				if(jQuery('#review_form_wrapper').length > 0) {
					if(jQuery('#reviews .commentlist li').length > 3) {
						jQuery("#reviews .commentlist li").hide();
						jQuery("#reviews .commentlist li:lt(3)").show();
						jQuery("#reviews #comments").append('<p class="review-showmore"><a href="#" class="nor-button">'+norvars.comments.showmore+'</a></p>');
					}
				}

				// External Product New Tab
				$('.product-type-external p.cart a.single_add_to_cart_button').attr('target','_blank');


				if($( '.variations_form' ).length > 0 && typeof wc_variation_form==='function') {
					$( '.variations_form' ).wc_variation_form();
					$( '.variations_form .variations select' ).change();
				}

				if($( '.price_slider' ).length > 0 && typeof slider==='function') {
					$.ajax({ url: norvars.woourl+'price-slider.min.js', dataType: 'script', cache:true});
				}

			}


			if(escript) {

				$.each(escript, function( index, value ) {
					jQuery.ajax({
							type: "GET",
							url: value,
							dataType: "script",
							cache: true
					})
				});
			}

			last_url = document.URL;

	}

	/// LOAD SOCIAL SHARING PLUGINS
	function socialRevive() {
		if(norvars.noprettysocial!=1) {
			$('.nor-social-sharing a').prettySocial();
		}
	}


	/// SLIDERS
	function reviveSliders() {
		 if ( $.browser.mozilla) {
			 var useCSSval = false;
		 }else{
			 var useCSSval = true;
		 }

		 if ( norvars.slider.hover=='true') {
			 var pauseOnHoverVal = true;
		 }else{
			 var pauseOnHoverVal = false;
		 }


	if(norvars.disableslider!=1) {

			$('.nor-flexslider').each(function() {

				if($(this).data('control')!='') {
					var scontrol = $(this).data('control');
				}else{
					var scontrol = true;
				}

				var atype = 'fade';

				if(Modernizr.touch) {
				 	atype = "slide";
				}else{
					atype = norvars.slider.animation;
				}

				if($(this).data('shortcode')=='gallery') {
					atype = 'fade';
				}

				if($(this).parent().hasClass('withgallery') && $('.slides',this).css('float')=='right') {
					atype = 'fade';
				}

				var slspeed = Number(norvars.slider.slider_speed);
				var slanimspeed = Number(norvars.slider.animation_speed);


				var tgallery = 0;
				if($(this).data('shortcode')=='gallery') {
					tgallery = 1;
				}

				var getthis = this;

				var slidershows;

				if($(this).closest('.woo-image-side').length > 0) {
					slidershows = false;
				}else{
					slidershows = norvars.slider.autoslideshow;
				}

				var arrow_b = '<';
				var arrow_f = '>';
				if(norvars.slider.arrowtype) {
					var arrow_b = '8';
					var arrow_f = '9';
				}


				/* Individual Slider Settings */
				if($(this).data('opts')) {

					var indopts = $(this).data('opts');

					if(indopts.animation) {
						atype = indopts.animation;
					}
					if(indopts.transition) {
						slanimspeed = Number(indopts.transition);
					}
					if(indopts.slideshow) {
						slspeed = Number(indopts.slideshow);
					}
					if(indopts.autoplay) {
						if(indopts.autoplay==1) {
							slidershows = true;
						}else if(indopts.autoplay==2) {
							slidershows = false;
						}
					}
				}

				$(this).fitVids().flexslider({
					animation: atype,
					slideshowSpeed: slspeed,
					pauseOnHover: pauseOnHoverVal,
					slideshow: slidershows,
					animationSpeed: slanimspeed,
					pausePlay:true,
					useCSS: useCSSval,
					pauseOnAction: true,
					touch: true,
					controlNav: scontrol,
					pauseText: '<i class="fa fa-pause"></i>',
					playText: '<i class="fa fa-play"></i>',
					prevText: '<i class="useicon">'+arrow_b+'</i>',
					nextText: '<i class="useicon">'+arrow_f+'</i>',
					start: function(slider){

						jQuery('.slides li img',getthis).on('click',function(e){
							if(!jQuery(this).parent().is('a')) {
								e.preventDefault();
								slider.flexAnimate(slider.getTarget("next"));
							}
						});

						if(tgallery) {

							if($('.main-flex-caption',getthis).length < 1) {
								if($('.flex-viewport',getthis).length > 0) {
									$( '<div class="main-flex-caption"></div>' ).insertAfter( $('.flex-viewport',getthis) );
								}else{
									$( '<div class="main-flex-caption"></div>' ).insertAfter( $('ul.slides',getthis) );
								}
							}

							$('.main-flex-caption',getthis).html('&nbsp;');
							$('.main-flex-caption',getthis).css('opacity',0);

							var caps = $('.flex-active-slide .flex-caption',getthis).html();

							if(caps) {
								$('.main-flex-caption',getthis).html(caps).fadeTo(500,1);
							}

							sliderAlign(slider);
						}

					},
					before: function() {
						if(tgallery) {
							$('.main-flex-caption',getthis).html('&nbsp;');
							$('.main-flex-caption',getthis).css('opacity',0);
						}
					},
					after: function() {
						if(tgallery) {
							$('.main-flex-caption',getthis).html('&nbsp;');
							$('.main-flex-caption',getthis).css('opacity',0);

							var caps = $('.flex-active-slide .flex-caption',getthis).html();

							if(caps) {
								$('.main-flex-caption',getthis).html(caps).fadeTo(500,1);
							}
						}
						if(jQuery('#fullpage-container').length > 0 && typeof nor_fullpage_callback=='function') {
							nor_fullpage_callback('off');
						}
					}
				});

			});


		}

	}


	//mobile
	var doit;
	var doitforrev;

	$(window).resize(function() {
		  clearTimeout(doit);
		  doit = setTimeout('sliderAlign()', 200);
	});


	/// SCROLL TO
	function goToByScroll(id){
     	$('html,body').animate({scrollTop: $("#"+id).offset().top},'slow');
	}


		/// THUMBNAIL REPLACER
		function getProperImg(w) {
			$('.post-list img[data-mobile]:not(.slider-img)').each(function() {
				var smalls = $(this).attr('data-full');
				var large = $(this).attr('data-mobile');

				if(smalls!=large) {
					if($(window).width() < 770) {
						$(this).attr('src',large);

						if(!$(this).data('data-srcset')) {
							$(this).data('data-srcset',$(this).data('srcset'));
						}

						$(this).attr('srcset',$(this).data('mobile')+' '+norvars.retinaratio+'x');

					}else{
						if(w==1) {

							$(this).attr('src',smalls);
							if($(this).data('data-srcset')) {
								$(this).data('srcset',$(this).data('data-srcset'));
							}
						}
					}
				}
			});
			/*
			if(norvars.disableslider!=1) {
				$('.nor-flexslider img').each(function() {
					if($(this).data('mobile')) {
						if($(window).width() < 769) {
							$(this).attr('src',$(this).data('mobile'));
						}else{
							$(this).attr('src',$(this).data('full'));
						}
					}
				});
			}
			*/
		}


		/// PROJECT LOAD CALLBACK
		function activatelightbox() {

			if(norvars.lightbox.disable!=1) {

				if($(window).width() < 768) {
					var lapplyto = ".gallery .gallery-item a";
				}else{
					var lapplyto = ".post-list[data-light=nor-lightbox], .gallery-item";
				}

				var wimgs = ".wpb_text_column a:not(.prettyphoto):has(img), \
				  .wpb_single_image a:not(.prettyphoto):has(img), \
					.the_content a:not(.prettyphoto):has(img), \
					.thecontent a:not(.prettyphoto):has(img)";

				var getthumbnails = jQuery(wimgs).not(".nolightbox").filter( function() { return /\.(jpe?g|png|gif|bmp)$/i.test(jQuery(this).attr('href')); });
				getthumbnails.each(function() {
					if($(this).parents('[data-light="nor-lightbox"]').length < 1) {
						jQuery(this).wrap('<div data-light="nor-lightbox"></div>');
					}
				});

				$('.single-cpt-content a[data-light=nor-lightbox]').each(function() {
					if($(this).parents('[data-light="nor-lightbox"]').length < 1 && $(this).parents('.gallery').length < 1) {
						jQuery(this).wrap('<div data-light="nor-lightbox"></div>');
					}
				});


				var selector ='a[href*=jpeg]:has(img), a[href*=jpg]:has(img), a[href*=gif]:has(img), a[href*=png]:has(img)';

				$('div[data-light=nor-lightbox]:not(.imagezoom)').each(function() {
					if($(this).parents('[data-light="nor-lightbox"]').length < 1 && $(this).parents('.gallery').length < 1) {
						if(norvars.lightbox.disable==2) {
							golightbox(this,selector,true);
						}else{
							golightbox(this,selector+ ', div[href]',true);
						}
					}
				});

				$('ul.slides[data-light=nor-lightbox]').each(function() {
					if($(this).parents('[data-light="nor-lightbox"]').length < 1 && $(this).parents('.gallery').length < 1) {
						if(norvars.lightbox.disable==2) {
							golightbox(this,'a.flex-slide',true);
						}else{
							golightbox(this,'a.flex-slide, div[href]',true);
						}
					}
				});

				$('div[id^=gallery-]').each(function() {
					golightbox(this,'a:has(img)',true);
				});

			}

		}


		function golightbox(at,targ,gal) {

			if(norvars.lightbox.disable==0) {

				 $cl = $(at)

				 $cl.lightGallery({
						download:false,
						autoplay:false,
						share:false,
						selector:targ,
        				currentPagerPosition: 'middle',
						thumbnail:(norvars.lightbox.thumbs ? true : false),
						actualSize:false,
						autoplayControls:false,
						toogleThumb:true,
						hash:false,
						hideBarsDelay:4000,
						zoom:(norvars.lightbox.zoom ? false : true),
						fullScreen:(norvars.lightbox.fullscreen ? false : true),
						getCaptionFromTitleOrAlt:(norvars.lightbox.disablecaptions ? false : true),
						counter:(norvars.lightbox.counter ? false : true),
						loop:(norvars.lightbox.loop ? false : true)
					});

				$cl.on('onBeforeOpen.lg',function(event, index, fromTouch, fromThumb){
					if(jQuery('#fullpage-container').length > 0 && typeof nor_fullpage_callback=='function') {
						nor_fullpage_callback('on');
					}
				});

				$cl.on('onCloseAfter.lg',function(event, index, fromTouch, fromThumb){
					if(jQuery('#fullpage-container').length > 0 && typeof nor_fullpage_callback=='function') {
						nor_fullpage_callback('off');
					}
				});


			}else if(norvars.lightbox.disable==2) {

				$(at).magnificPopup({
							type:'image',
							delegate:targ,
							closeOnBgClick: true,
							fixedContentPos: false,
							image: {
								verticalFit: norvars.lightbox.verticalfit ,
								titleSrc: function(item) {

								  if(norvars.lightbox.disablecaptions==1 || item.el.closest('.product-images').length > 0) {
									  return;
								  }

								  return item.el.find('img').attr('alt');

								}
							},
							closeBtnInside: false,
							mainClass: 'mfp-fade',
							gallery:{enabled:gal, tCounter:'<span>%curr% / %total%</span>', navigateByImgClick: true},
							callbacks: {
								 resize: function() {
									if(typeof theme_lightbox_callback=='function') {
										theme_lightbox_callback();
									}
								 },
								 open: function() {
									if(norvars.lightbox.verticalfit) {
										jQuery('body').addClass('noscroll');
									}

									if(typeof theme_lightbox_callback=='function') {
										theme_lightbox_callback();
									}
								 },
								 close: function() {
									if(norvars.lightbox.verticalfit) {
										 jQuery('body').removeClass('noscroll');
									}

									 if(jQuery('#fullpage-container').length > 0 && typeof nor_fullpage_callback=='function') {
										nor_fullpage_callback();
									 }
								 },
								 imageLoadComplete:function() {
									if(typeof theme_lightbox_callback=='function') {
										theme_lightbox_callback();
									}
								 },
								 elementParse: function(item) {

								  if(!item.src) {
									item.src = jQuery('[src]',item.el).attr('src');
								  }

								 }
							}
					});

				}

		}

		// Lightbox
		activatelightbox();

		// If grid overlay activated
		function gridOverlayDetect() {
			if(norvars.overlayswitch!=1) {
				if($(window).width() < 959) {
					$('article.grid-item .info.info-overlay').each(function() {
						$(this).removeClass('info-overlay').addClass('standard');
						$(this).attr('data-oclass','info-overlay');
					});
				}else{

					$('article.grid-item [data-oclass]').each(function() {
						$(this).removeClass('standard').addClass('info-overlay');
						$(this).removeAttr('data-oclass');
					});
				}
			}
		}

		/// RESIZE EVENTS
		var wwidth = $(window).width();
		$(window).resize(function() {

			$('.northeme-sticky').sticky('update');

			gridOverlayDetect();

			if(wwidth != $(window).width()) {
				getProperImg(1);
				wwidth = $(window).width();
			}

			stickyupdate();

		});


		/// CLOSE ALERT
		$('body').on('click','.closealert', function(e) {
			$(this).parent().slideUp();
			e.preventDefault();
		})

		///	BACK TO TOP
		if(norvars.disablebacktotop!=1) {
			$(window).scroll(function() {
				if($(this).scrollTop() > 400) {
					$('.backtotopcontainer').fadeIn();
				} else {
					$('.backtotopcontainer').fadeOut();
				}
			});

			$('body').on('click','a.backtotop',function(e) {
				$('html, body').animate({scrollTop:0}, 1000, "easeInOutExpo");
				e.preventDefault();
			});
		}




		/* AJAX COMMENTS */

		$('body').on('submit','#commentform',function(e) {

			var thisform=this; // find the comment form
			var commentform=$(this); // find the comment form
			commentform.prepend('<div id="comment-status" ></div>'); // add info panel before the form to provide feedback or errors
			var statusdiv=$('#comment-status',this); // define the infopanel

			//serialize and store form data in a variable
			var formdata=commentform.serialize();

			nope = 0;

			$('input, textarea',this).each(function() {
				if($(this).attr('aria-required') && $(this).val()=='') {
					nope = 1;
				}
			});


			if(nope==1) {
				alert(norvars.comments.required);
				return false;
			}

			//Add a status message
			statusdiv.html('<p>'+norvars.comments.process+'</p>');
			//Extract action URL from commentform
			var formurl=commentform.attr('action');
			//Post Form with data
			$.ajax({
				type: 'post',
				url: formurl,
				data: formdata,
				error: function(XMLHttpRequest, textStatus, errorThrown)
					{
						statusdiv.html('<p class="ajax-error ajax-message"><i class="fa fa-times"></i> '+norvars.comments.error+'</p>');
					},
				success: function(data, textStatus){

					if(data == "success" || textStatus == "success"){
						statusdiv.html('<p class="ajax-success ajax-message"><i class="fa fa-check"></i> '+norvars.comments.success+'</p>');
						$('[name=comment]',thisform).val('');
						if($('#reviews').length > 0) {
							var condiv = '#reviews';
						}else{
							var condiv = 'section.commentform';
						}

						$.post(document.URL,{ajax:1},function(data, status) {
							var div = $(condiv, data).html();
							$(condiv).html(div);
							nor_rating();
						})

					}else{
						statusdiv.html('<p class="ajax-error ajax-message"><i class="fa fa-spinner fa-spin"></i> '+norvars.comments.successerr+'</p>');
						commentform.find('textarea[name=comment]').val('');
					}
				}
			});
			return false;
		});


		$('body').on('click','p.review-showmore a',function(e) {
			$(this).parent().prev().find('li').fadeIn();
			$(this).parent().remove();
			e.preventDefault();
		})


		//$( "select[name=orderby]").unbind( "change" );
		/*
		$('body').on('change','select[name=select-category-nav]',function() {
			showLoader(1);
			if($(this).val()) {
				ajaxNav($(this).val());
			}else{
				window.location = $(this).val();
			}
		});
		*/
		/*
		$('body').on('change','select[name=orderby]',function() {
				showLoader(1);
				window.location = window.location.href.split('?')[0]+'?orderby='+$(this).val();
		});
		*/

		// Rollover Effect
		if($('html').hasClass('ie8')) {
			$('[data-overlay]').on({
				mouseenter: function () {
					$($(this).data('overlay'),this).fadeTo(500,1);
				},
				mouseleave: function () {
					$($(this).data('overlay'),this).fadeTo(500,0);
				}
			});
		}




		// Navigate
		$('nav.navigate .fullnav a').on('click',function(e) {
			$(this).parent().parent().find('a').removeClass('selected');
			$(this).addClass('selected');
			e.preventDefault();
		});


		/* THUMB HOVER */
		function norimgHover() {
			$(".post-list article").each(function() {

				if($('.img-hover',this).length > 0) {
					$(this).on({
						mouseenter: function () {
							if($('span.img-hover',this).length > 0 && $(window).width() > 767) {
								$('span.img-hover',this).fadeIn();
							}
						},
						mouseleave: function () {
							if($('span.img-hover',this).length > 0 && $(window).width() > 767) {
								$('span.img-hover',this).fadeOut();
							}
						}
					});
				}

			});

			// Hover image preloader
			if($('img[data-hover]').length > 0) {
				var images = [];
				var i = 0;
				$('img[data-hover]').each(function() {
					var hsrc = $(this).data('hover');
					images[i] = new Image();
					images[i].src = hsrc;
					i++;
				});
			}

		}


		function infinitescroll() {

			if(($('.post-list').length > 0) && $('div.pagination a.button').length > 0) {

				var thisismasonry = 0;

				if($('.post-list.mainpostcontainer, .post-list.categorypostscontainer').hasClass('nor-masonry')) {
					thisismasonry = 1;
				}

				var appendvar = $('div.pagination a.button').data('append');
				var loadcontainer = '.post-list.mainpostcontainer, .post-list.categorypostscontainer';

				/*
				if(appendvar) {
					 loadcontainer = '.post-list.'+appendvar;
				}
				*/

				if(norvars.pagination=='loadmore') {

					function loadmorebutton(w) {

						$(w).unbind("click");
						$(w).click(function() { return false; });
						$(w).html('<i class="fa fa-spin fa-spinner"><i>');

						showLoader(1);

						var getnextpage = $(w).attr('href');

						$.get(getnextpage,function(data) {

							var div = $(loadcontainer, $(data)).html();

							if(thisismasonry==1) {
								do_masonry('',div);
							}else{
								$(div).addClass('load-moveup trns-ready').appendTo(loadcontainer);
								$(loadcontainer).children().removeClass('load-moveup');
							}

							loadProject('','','','',1);
							showLoader(0);

							if($('div.pagination a.button', $(data)).length > 0) {
								$('div.pagination').html($('div.pagination', $(data)).html());
								$('div.pagination a').on('click',function(e) {
									loadmorebutton(this);
									e.preventDefault();
								});
							}else{
								$('div.pagination').remove();
							}


						});

					}


					$('[data-ajax=onlypagination] a').unbind("click");

					$('[data-ajax=onlypagination] a').on('click',function(e) {

						loadmorebutton(this);
						e.preventDefault();

					});

				}else if(norvars.pagination=='autoload') {

					nextpage = $('div.pagination a.button').attr('href');
					$('div.pagination').remove();

					$(window).scroll(function() {

						if(nextpage!='' && ($(window).scrollTop() >= ($(document).height() - ($('footer').height()+250)) - $(window).height())) {

							showLoader(1);
							loadnextpage = nextpage;

							nextpage='';
							$.get(loadnextpage,function(data) {

								var div = $(loadcontainer, $(data)).html();

								if(thisismasonry==1) {
									do_masonry('',div);
								}else{
									$(div).addClass('load-moveup trns-ready').appendTo(loadcontainer);
									$(loadcontainer).children().removeClass('load-moveup');
								}

								loadProject('','','','',1);

								showLoader(0);

								if($('div.pagination a.button', $(data)).length > 0) {
									nextpage = $('div.pagination a.button', $(data)).attr('href');
								}else{
									nextpage='';
								}


							});
						}
					});

				}
			}
		}


		function do_masonry(elem,extended) {

			if($('.nor-masonry').length > 0) {

				var $container = $('.nor-masonry');

					if(extended) {

						$('.post-list.nor-masonry').isotope( 'insert', $(extended) );

					}else{

						var $isoaction = $container.isotope({
											itemSelector:'.grid-item',
											transitionDuration: 0,
											hiddenStyle: { opacity: 0 },
											visibleStyle: { opacity: 1 },
											stagger:30
										});

						$container.imagesLoaded().progress( function(imgLoad, image) {

							$container.isotope( 'layout', {transitionDuration: '0.8s'} );

						});

						$('img.lazy',$container).each(function() {
							if($(this).data('original')!='') {
								$(this).attr('src',$(this).data('original'));
							}
							if($(this).attr('data-srcset')!='') {
								$(this).attr('srcset',$(this).data('srcset'));
								$(this).removeAttr('data-srcset');
							}
						});

					}

			}
		}


		/* MOBILE MENU */

		$('body').on('click','.mobile-menu-container-block',function() {
			$('.mobile-menu-container-block').hide();
			$('.mobile-menu-container').removeClass('open-up');
		});

		$('body').on('click','.buttonmobile',function(e) {
			if($('.mobile-menu-container').hasClass('open-up')) {
				$('.mobile-menu-container-block').hide();
				$('.mobile-menu-container').removeClass('open-up');
			}else{
				$('.mobile-menu-container').addClass('open-up');
				$('.mobile-menu-container-block').fadeTo(500,0.8);
			}
			e.preventDefault();
		});

		$('.mobile-menu-container .menu-item-has-children > a:first-of-type').on('click',function(e) {

			if($(this).next().is(':hidden')) {
				$(this).next().slideDown();
				$(this).parent().addClass('menu-clicked');
			}else{
				$(this).next().slideUp();
				$(this).parent().removeClass('menu-clicked');
			}

			e.preventDefault();
		});

		$('.mobile-menu-close').on('click',function(e) {
			$('.mobile-menu-container').removeClass('open-up');
			e.preventDefault();
		});




		/*
			FORM POST
		*/
		jQuery('body').on('click', 'form.northeme-contact a.closealert',function (e) {
			jQuery(this).parent().hide();
			jQuery(this).parent().next().slideDown();
			e.preventDefault();
		});


		jQuery('body').on('submit', 'form.northeme-contact', function(e) {
			var form = this;
			var mform = this;
			jQuery('button',mform).append('<i class="fa fa-spin fa-spinner"></i>');

			var success_message = jQuery(this).data('success');
			var fail_message = jQuery(this).data('fail');

			var secfield = jQuery('[name=secfield]',this).val();
			var name = jQuery('[name=name]',this).val();
			var email = jQuery('[name=email]',this).val();

			jQuery('[name=name]',this).css('border-color','');
			jQuery('[name=email]',this).css('border-color','');

			if(email=='') {
				jQuery('[name=email]',this).attr('style','border-color:#c00!important');
				jQuery('button .fa',mform).remove();
				return false;
			}
			if(name=='') {
				jQuery('[name=name]',this).attr('style','border-color:#c00!important');
				jQuery('button .fa',mform).remove();
				return false;
			}

			var formserialize = jQuery(mform).serialize();

			var data = {
				action: 'contact_form_post',
				data: formserialize
			};
			jQuery.post(norvars.ajaxurl,data, function (data2) {
				if(data2==1) {
					jQuery(form).find('div.forms').slideUp();
					jQuery(form).find('div.msg').removeClass('alert-failed').addClass('alert-success').html(success_message + ' &nbsp; <a href="#" class="closealert no-style"><i class="fa fa-remove"></i></a>').show();
					jQuery('input[type=text],textarea',mform).val('');
				}else{
					jQuery(form).find('div.msg').removeClass('alert-success').addClass('alert-failed').html(fail_message + ' <a href="#" class="closealert no-style"><i class="fa fa-remove"></i></a>').show();
				}
			});
			jQuery('html,body').animate({scrollTop: jQuery(mform).offset().top},'slow');
			jQuery('button .fa',mform).remove();

			return false;
		});



		// Main menu
		$('body').on({
			mouseleave: function () {
				$('.nor-cart-content',this).css('visibility','').css('display','').css('opacity','');
			}
		},'.nor-cart');


		loadProject('','','','',1);

		function stickyupdate(d) {

			setTimeout("activateSticky()",200);
			//$('.northeme-sticky').sticky('update');

		}


		$('#loadintothis').imagesLoaded( function() {
			stickyupdate();
		});

		if(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
			if(norvars.enableajaxnav!=1) {
				$('#loadintothis, body.theme-madrigal').css('-webkit-animation','none');
			}
			if(norvars.mainnavtype==1) {
				$('body.theme-madrigal .overlay-menu-wrapper, body.theme-madrigal .main-header, body.theme-madrigal .wrap-entire-content').css('-webkit-transition','none');
			}
		}

});
