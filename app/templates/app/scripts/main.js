/**
 * Main styling and functionality
 *
 * @author  Pattie Reaves <preaves@bangordailynews.com>
 * @copyright 2014 Bangor Daily News
 */
/*jshint strict:false */
/*global $:false */
/*global Handlebars:false */
/*global BootstrapDialog:false */
/*global Modernizr:false */
/*global _V_:false */
/*global ga:false */
function sizeFunctions() {
    $('#intro').css({
        'width': $(window).width(),
        'height': $(window).height()
    });
}

// Must run after templates are registered
function setUpVideos(videos) {

    $('video').each(function(index, value) {
        videos[$(this).get(0).id] = _V_($(this).get(0).id);
    }); //video.each

    //Adds hover listener
    $('video').hover(function() {
        //Only play videos that haven't started yet.
        if (this.currentTime === 0) {
            this.play();
        }
    });

    // Google Analytics event Listeners
    for (var key in videos) {
        // We don't want the listener on the cinemagraph
        if (videos.hasOwnProperty(key) && key !== 'big-video-vid_html5_api') {
            videos[key].on('firstplay', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': '<%= appname %>', // Required.
                    'eventAction': 'Played Video', // Required.
                    'eventLabel': $(this).get(0).id()
                });
            });

            videos[key].on('play', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': '<%= appname %>', // Required.
                    'eventAction': 'Played Video', // Required.
                    'eventLabel': $(this).get(0).id()
                });
            });

            videos[key].on('ended', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': '<%= appname %>', // Required.
                    'eventAction': 'Completed Video', // Required.
                    'eventLabel': $(this).get(0).id()
                });
            });

            videos[key].on('pause', function() {
                ga('send', {
                    'hitType': 'event', // Required.
                    'eventCategory': '<%= appname %>', // Required.
                    'eventAction': 'Paused Video', // Required.
                    'eventLabel': $(this).get(0).id(),
                    'eventValue': videos[$(this).get(0).id()].currentTime()
                });
            });
        } //if video has key
    } //for key in videos
} // Set up Videos

function setUpAmbientVideos( ambientVideos ) {

    $( '.ambient_video' ).each( function( index, value ) {

        // Get data from div
        var ambientVideo = new Object;
        ambientVideo.ID = $(this).attr( 'id' );
        ambientVideo.video = $(this).attr( 'data-video' );
        ambientVideo.image = $(this).attr( 'data-static' );
        

        // Replace div with big videos.
        ambientVideos[ambientVideo.ID] = new $.BigVideo({
            container: $(this).parents('.cards'),
            shrinkable:true,
            useFlashForFirefox:false
        });

        ambientVideos[ambientVideo.ID].init();

        if(Modernizr.touch) {
            ambientVideos[ambientVideo.ID].show(ambientVideo.image);
        } else {
            ambientVideos[ambientVideo.ID].show(
                ambientVideo.video, {
                    ambient: true
                }
            );
        }

        $( this ).parents('.cards').addClass( 'ambient-video-background' );
        $( this ).remove();

    }); // each ambient_video

} // Set up AmbientVideos

$(function() {

    // Big Video intro
    // var BV = new $.BigVideo({
    //     container: $('#intro')
    // });
    // BV.init();
    // if (Modernizr.touch) {
    //     BV.show('images/kenduskeag_night.jpg');
    // } else {
    //     BV.show(
    //         'http://watchvideo.bangordailynews.com/bdn/2014/06/kenduskeag_night_1735266.m4v', {
    //             ambient: true
    //         }
    //     );
    // }

    var videos = new Object;

    // // Initialize Handlebars templates
    var cards = Handlebars.compile($('#card-template').html());

    // sizeFunctions();

    $.getJSON(
        'data/chapters.json',
        function(mainChapters) {

            $.getJSON(
                'data/chapters.json',
                function(mainChapters) {

                    console.log(mainChapters);

                    // Find the chapter we want to display based on the URL.
                    var displayChapter = mainChapters[0]; //initialize at first chapter
                    displayChapter.count = 0;

                    $.each(mainChapters, function(index, value){
                        if( location.href.indexOf( value.name ) > 0 ) {
                            displayChapter = value;
                            displayChapter.count = index;
                        }
                    });//each mainChapters 


            $.each(mainChapters, function(chapterNumber, chapterMeta) {

                 var chapterMachineName = chapterMeta.name.replace(/ /g, "-");

                //In the GoodLife, we only loaded the chapter we wanted to display based on the URL.
                $.getJSON(

                    'data/' + chapterMachineName + '.json',
                    function(chapter) {

                        console.log(chapter);

                        // Insert the chapter information
                        $.each(chapter.chapters, function(index, value) {
                            value.index = parseInt(index) + 1;
                            $('#chapters').append(cards(value));

                        }); //each chapter.chapters                    

                          if (Modernizr.touch) {
                            $("img.lazy").lazyload({
                                    threshold: 1000,
                                    effect: "fadeIn",
                                    failure_limit: 100,
                                    load: function() {
                                        if(!!(cardID = $(this).offsetParent().attr('id'))) {
                                            // Add Google Analytics listener
                                            ga('send', {
                                              'hitType': 'event',          // Required.
                                              'eventCategory': '<%= appname %>',   // Required.
                                              'eventAction': 'Image Load',      // Required.
                                              'eventLabel': displayChapter.name + '-' + cardID,
                                              'eventValue': 1
                                            });    
                                        }
                                    }
                            });
                         } else {
                            $('img.lazy').lazyload({
                                effect: 'fadeIn',
                                load: function() {
                                    if(!!(cardID = $(this).offsetParent().attr('id'))) {
                                        // Add Google Analytics listener
                                        ga('send', {
                                          'hitType': 'event',          // Required.
                                          'eventCategory': '<%= appname %>',   // Required.
                                          'eventAction': 'Image Load',      // Required.
                                          'eventLabel': displayChapter.name + '-' + cardID,
                                          'eventValue': 1
                                        });    
                                    }
                                }
                            });
                         }

                        setUpVideos(videos);
                        // setUpAmbientVideos(ambientVideos);
                        sizeFunctions();

                        $('#logo a').on('click', function() {
                            window.location('#card-Credits');
                        });

                    } //success chapter data
                ); //getJSON chapter
            }); //each mainChapters
        } //success chapters
    ); //getJSON mainChapters

    // Checks if element is on screen
    $.fn.isOnScreen = function() {
        var win = $(window);

        var viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        var bounds = this.offset();
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();

        return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
    }; //fn.isOnScreen

    $(window).scroll(function() {
        $('.rich-media .video-js').each(function(index, value) {
            if ($(this).isOnScreen() === false) {
                videos[$(this).attr('id')].pause();
            }
        });

        // Show and hide the scroll cue if you aren't scrolling.
        $( '.scroll-cue' ).fadeOut();
        $.doTimeout( 'scroll', 1000, function(){
            // Only bring back the scroll cue if we aren't at the bottom 
            // And the video is not playing. 
            if( ( $(window).scrollTop() + $(window).height() ) < $( document ).height() && !$( '.video-js' ).hasClass( 'vjs-playing' )) {
                $( '.scroll-cue' ).fadeIn(600);
            }
        });
        
    }); //window scroll 

    $(window).resize(function() {
        sizeFunctions();
    });

}); //document ready