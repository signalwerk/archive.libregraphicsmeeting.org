/** 
 *   LGM 2018 Theme Scripts
 */

/**
 *  fake $ function to save typing
 */
function $(selector){
  return document.querySelector(selector);
}
function _$(selector){
  return document.querySelectorAll(selector);
}

/**
 *  scrollTo
 *  Scrolls window to given Y-coord
 *  @see https://pawelgrzybek.com/page-scroll-in-vanilla-javascript/   
 *  Simplified and adapted to ECMA2015 to avoid some nasty crossbrowsing issues
 */

function scrollTo(destination, duration = 200, easing, callback)
{
    var start = window.pageYOffset;
    var startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
    var documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
    var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
    var destinationOffset = typeof destination === 'number' ? destination : destination.offsetTop;
    var destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);

    if ('requestAnimationFrame' in window === false) {
        window.scroll(0, destinationOffsetToScroll);
        if (callback) {
          callback();
        }
        return;
    }

    function scroll() {
        var now = 'now' in window.performance ? performance.now() : new Date().getTime();
        var time = Math.min(1, ((now - startTime) / duration));
        var timeFunction = easing(time);
        window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));

        if (window.pageYOffset === destinationOffsetToScroll) {
          if (callback) {
            callback();
          }
          return;
        }

        requestAnimationFrame(scroll);
    }
    scroll();
}



// Vanilla JS document.ready
document.addEventListener("DOMContentLoaded", function() {

    //Add scroll capabilities to recent news section title in frontpage
    var news_title = $('.see-news');
    if(news_title)
    news_title.addEventListener('click', function(){
        scrollTo(
            $('.recent-news'),
            1000,
            function(t){ return t < 0.5 ? 2*t*t : (4-2*t)*t - 1; },
        );
    });

    //Triggers menu navigation when clicking hamburguer on the top
    $('.hamburguer-icon').addEventListener('click', function(){
        document.body.classList.toggle('navigation-opened');
    });

    //Triggers scroll on content navigation menus
    _$('.content-navigation li').forEach( function(i){
        i.addEventListener('click', function(){
            var target = i.getAttribute('data-to');
            scrollTo(
                $('#' + target),
                1000,
                function(t){ return t < 0.5 ? 2*t*t : (4-2*t)*t - 1; },
            );
        });
    });

    //Hide comment form by default
    $('#commentform').classList.add('inactive');
    $('#reply-title').addEventListener('click', function(){
        $('#reply-title').classList.toggle('active');
        $('#commentform').classList.toggle('inactive');
    });

});
