/* 
LGM 2011
Authors: 
Alexandre Leray (http://www.alexandreleray.com), Pierre Marchand (http://www.oep-h.com/) @ OSP (http://ospublish.constantvzw.org/) and Camille Bissuel (http://www.yagraph.org)
*/
function zoom_pan() {
    /*
    Change the viewbox attribute of the SVG background
    */
    var svg = jQuery('#svg')
    var vb = svg.attr('viewBox');
    vb = vb.split(" ");
    var nvb = new Array(4);
    nvb[2] = Math.random()*vb[2];
    nvb[3] = Math.random()*vb[3];
    nvb[0] = Math.random()*nvb[2];
    nvb[1] = Math.random()*nvb[3];
    nvb = nvb.join(" ");
    svg.attr('viewBox', nvb);
};


function init () {
    /*
    Detect browser SVG compatibility and load the appropriate background
    */
    
    if ((jQuery.browser.safari && jQuery.browser.version.split('.')[0] >= 522) ||
        (jQuery.browser.mozilla && jQuery.browser.version.substr(0,3) >= 1.8) ||
        (jQuery.browser.opera && jQuery.browser.version >= 8.0)) 
    {
        // Insert the iframe
        jQuery('body').append('<iframe src="'+TEMPLATE_PATH+'/img/background.svg" id="background"></iframe>');
    }
    
/* 
a dozen of PNG images for browsers not supporting SVG
*/
     else {
        // compute a random image filename
        var randomImage = Math.floor(Math.random()*10);
        jQuery('body').css('background-color', 'white');
        jQuery('body').css('background-image', 'url('+TEMPLATE_PATH+'/img/background-fallback/background_include_' + randomImage + '.png)');
        jQuery('body').css('background-repeat', 'no-repeat');
        jQuery('body').css('background-attachment', 'scroll');
        jQuery('body').css('background-position', 'left center');
    } 
}

jQuery(document).ready(init);
