/**
 * This is the script where the magic happens.
 *
 * @author  Pattie Reaves <preaves@bangordailynews.com>
 */
/* jshint strict:false */
function sizeFunctions() {
    $('#intro').css({
        'width': $(window).width(),
        'height': $(window).height()
    });
}

function sendGoogleAnalyticsEvent( eventAction, eventLabel, eventValue ) {
    console.log( 'sendGoogleAnalyticsEvent : ' + eventAction + ',' + eventLabel+ ',' + eventValue ) ;
    eventValue = typeof eventValue !== 'undefined' ? eventValue : null;

    ga('send', {
        'hitType': 'event', // Required.
        'eventCategory': '<%= appname %>', // Required.
        'eventAction': eventAction, // Required.
        'eventLabel': eventLabel,
        'eventValue': eventValue
    });
}

function setUpVideos(videos) {

    // Videos is an empty object that we now fill.
    $('video').each(function(index, value) {
        videos[$(this).get(0).id] = videojs($(this).get(0).id);
    }); //video.each

    //Adds hover listener
    $('.video-media').bind('mouseenter', function() {

        if( videos[ $(this).find('.video-js').get(0).id ].currentTime() === 0) {
            videos[ $(this).find('.video-js').get(0).id ].play();
        } 

    });

    // Google Analytics event Listeners
    for (var key in videos) {
        // console.log( videos[key] );
        // We don't want the listener on the cinemagraph
        if (videos.hasOwnProperty(key) && key !== 'big-video-vid_html5_api') {

            videos[key].on('play', function() {
                if( videos[key].currentTime() > 0 ) {
                    sendGoogleAnalyticsEvent( 'Resumed Video',  videos[key].id() );
                } else {
                    sendGoogleAnalyticsEvent( 'Started Video',  videos[key].id() );
                }
            });

            videos[key].on('ended', function() {
                sendGoogleAnalyticsEvent( 'Completed Video',  videos[key].id() );
            });

            videos[key].on('pause', function() {
                sendGoogleAnalyticsEvent( 'Paused Video',  videos[key].id(), videos[key].currentTime() );
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

function setUpImages( displayChapter ) {
    var cardID = $(this).offsetParent().attr('id');

    if ( Modernizr.touch ) {
        $('img.lazy').lazyload({
            threshold: 1000,
            effect: 'fadeIn',
            failure_limit: 100,
            load: function() {
                if (!!cardID) {
                    sendGoogleAnalyticsEvent( 'Image Load',  displayChapter.name + '-' + cardID, 1 );
                }
            }
        });
    } else {
        $('img.lazy').lazyload({
            effect: 'fadeIn',
            load: function() {
                if (!!cardID) {
                    sendGoogleAnalyticsEvent( 'Image Load',  displayChapter.name + '-' + cardID, 1 );  
                }
            }
        });
    } //if Modernizr.touch 
} //setUpImages

function setUpChapters( chapter, displayChapter ) {
    var cards = Handlebars.compile($('#card-template').html());

    $.each(chapter.chapters, function(index, value) {

        value.index = parseInt(index) + 1;
        value.chapterName = displayChapter.machineName;
        console.log(chapter);
        $('#chapters').append(cards(value));

    }); //each chapter.chapters   
    
    // Links should open in a new window.d
    $.each( $('.cards a'), function() {
        $(this).attr('target', '_blank');
    });
}

function setUpAds( machineName ) {
    // Add the ad tags
    $('<div class="rich-media size-medium ad orientation-right"><div id="bdnads-top-300x600"></div></div>').insertAfter($('#card-'+ machineName +'-3 p.text:nth-last-of-type(6)').first());
    googletag.cmd.push(function() {
        googletag.display('bdnads-top-300x600');
    });

    for( var i = 1; i < 5; i++ ) {
        $('<div class="rich-media size-medium ad orientation-left"><div id="bdnads-bottom-300x250-'+i+'"></div></div>').insertAfter($('#card-'+ machineName +'-'+ eval(3 + i) +' p.text:nth-last-of-type(4)').first());
        googletag.cmd.push( function() {
          googletag.display('bdnads-bottom-300x250-'+ i);
        });
    }

    $('.ad').prepend('<h6><span>Story continues after </span>Paid Advertisement</h6>');
}

function appendNextLink( mainChapters, displayChapter ) {
    // Add link to next chapter
    if ( typeof mainChapters[ displayChapter.count + 1 ] != 'undefined') {
        var nextLink = '<p class="text"><span class="glyphicon glyphicon-chevron-right"></span> ' +
        '<em><a href="?'+ mainChapters[ displayChapter.count + 1 ].name +'">' +
            'Up next</a>: ' +
            mainChapters[ displayChapter.count + 1 ].extended_description +
            '<a href="?'+ mainChapters[ displayChapter.count + 1 ].name +'">' +
            ' Read on in #'+ mainChapters[displayChapter.count + 1].name +'.</a>' +
        '</em></p>';

        $(' .cards:last-of-type ').append( nextLink );
    }
}

function appendCommentsLinkToPullquotes() {
    var link = '<a href="#comments"><span class="glyphicon glyphicon-comments"></span> Share your thoughts.</a>';
    $( '.pullquote .caption').append( link );
    $( '.pullquote .caption').on( 'click', function() {
        window.location.hash = 'comments';
    } );
}

$( function() {

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

    var videos = {};

    sizeFunctions();

       $.getJSON(
        'data/chapters.json',
        function(mainChapters) {

            console.log(mainChapters);

            // Find the chapter we want to display based on the URL.
            var displayChapter = mainChapters[0]; //initialize at first chapter
            displayChapter.count = 0;

            $.each(mainChapters, function(index, value)
            {
                mainChapters[index].machineName = value.name.replace(/ /g, '-').toLowerCase();
                if( location.href.indexOf( value.name ) > 0 ) {
                    displayChapter = value;
                    displayChapter.count = index;

                    // Highlight the option in the nav
                    $( 'a[href="?Intro"]' ).parent().removeClass('active');
                    $( 'a[href="?' + value.name + '"]' ).parent().addClass('active');
                } 
            });//each mainChapters 

            console.log('Displaying ' + displayChapter.name);

            // displayChapter.machineName = displayChapter.name.replace(/ /g, '-').toLowerCase();

            // Get the datas from the display chapter only please.
            $.getJSON(
                'data/' + displayChapter.machineName + '.json',
                function ( data ) {
                    setUpChapters( data, displayChapter );
                    setUpImages( displayChapter );
                    setUpVideos( videos );
                    setUpAds( displayChapter.machineName );

                    $( '.hide-after-chapters').addClass('hidden');

                    // Appends the byline and share buttons.
                    $('#card-'+ displayChapter.machineName +'-2 h2:first-of-type').after('<div class="byline">By '+ displayChapter.byline +'</div>');
                    var shareButtons = '<div class="addthis_toolbox addthis_default_style addthis_32x32_style"><a class="addthis_button_email">E-mail</a><a class="addthis_button_facebook">Share</a><a class="addthis_button_twitter">Tweet</a></div>';
                    $('.byline').append(shareButtons);
                    $('.footer .row > div:first-of-type').prepend('<div class="byline">' + shareButtons + '</div>');

                    $('#card-'+ displayChapter.machineName +'-2 h2:first-of-type').before( '<h1 class="displayChapter">' + displayChapter.name + '</h1>' );

                    addthis.init();
                    appendCommentsLinkToPullquotes();
                    appendNextLink( mainChapters, displayChapter );


                    // show the credits box.
                    $( '.show-after-chapters.hidden').removeClass('hidden');
                   
                }
            );

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
            if( ( $(window).scrollTop() + $(window).height() ) < $( document ).height() && !$( '.video-js' ).hasClass( 'vjs-playing' ) ) {
                $( '.scroll-cue' ).fadeIn(600);
            }
        });
        
    }); //window scroll 

    $(window).resize(function() {
        sizeFunctions();
    });

}); //document ready