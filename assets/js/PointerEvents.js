/*************************************************************************
 * jQuery down/hold/tap events, which should be standard on all browsers! -_-
 *************************************************************************/

var PointerEvents = (function($){

    var options = {};

    var $document;
    var timeout, $startTarget;
    var tap_cancelled = false;

    /**
     * On touchstart, we start detecting tap/hold on element.
     * @param touchstart_evt
     */
    function onTouchStart(touchstart_evt){

        //initialize things
        log('--------------------');
        log('touchstart caught: ' + touchstart_evt.originalEvent.touches[0].pageX + ',' + touchstart_evt.originalEvent.touches[0].pageY);
        tap_cancelled = false;
        var touchStart = touchstart_evt;
        $startTarget = $(touchstart_evt.target);
        var touches = touchstart_evt.originalEvent.touches;
        if(touches.length > 1){
            cleanUp();
            return;
        }
        var start = {
            x: touches[0].pageX,
            y: touches[0].pageY
        };
        var preventing_default_for_android_hack = null;

        //hold vs. tap timeout
        timeout = setTimeout(function(){
            var pointerhold = jQuery.Event("PointerHold");
            pointerhold.originalEvent = touchstart_evt;
            pointerhold.touchStart = touchStart;
            $startTarget.trigger(pointerhold);
            log('PointerHold triggered');
            cancelTap();
        }, options.tap_timeout);

        //PointerDown
        var pointerdown = jQuery.Event("PointerDown");
        pointerdown.originalEvent = touchstart_evt;
        pointerdown.touchStart = touchStart;
        $startTarget.trigger(pointerdown);
        log('PointerDown triggered');

        $startTarget.on('touchmove.pe', function(touchmove_evt){
            log('touchmove caught: ' + touchmove_evt.originalEvent.touches[0].pageX + ',' + touchmove_evt.originalEvent.touches[0].pageY);

            //preventDefault if Android and isn't a vertical movement
            if(navigator.userAgent.match(/Android/i)) {

                //if we're already preventDefault()ing, continue to do so
                if(preventing_default_for_android_hack === true){
                    preventDefaultForAndroidHack(touchstart_evt, touchmove_evt);
                    //if we're already not, then just ignore
                } else if(preventing_default_for_android_hack === false){
                    //if movement is largely vertical, ignore. otherwise, start preventing default.
                } else if(Math.abs(start.y - touchmove_evt.originalEvent.touches[0].pageY) > 3){
                    //log('start ignoring and let Android do its thing');
                    preventing_default_for_android_hack = false;
                    //otherwise, we should start teh hackz.
                } else {
                    log('starting to hackzzzors');
                    preventing_default_for_android_hack = true;
                    preventDefaultForAndroidHack(touchstart_evt,touchmove_evt);
                }
            }

            //cancel tap and hold if finger moved outside of tolerance
            if(!tap_cancelled){
                if(Math.abs(touchmove_evt.originalEvent.touches[0].pageX - start.x) > options.tolerance || Math.abs(touchmove_evt.originalEvent.touches[0].pageY - start.y) > options.tolerance){
                    log('cancelling tap/hold b/c Dx: ' + Math.abs(touchmove_evt.originalEvent.touches[0].pageX - start.x) + ', Dy: ' + Math.abs(touchmove_evt.originalEvent.touches[0].pageY - start.y));
                    cleanUp();
                    return;
                }
            }

            //cancel tap if more than one finger is detected
            if(touchmove_evt.originalEvent.touches.length > 1){
                log('cancelling because more than one touch detected');
                cleanUp();
            }
        });

        //PointerTap, clean up
        $startTarget.on('touchend.pe', function(touchend_evt){

            log('touchend caught');

            //prevent touchend default / click emulation
            if($(this).data('pointertap') || options.prevent_all_default_events){
                touchend_evt.preventDefault();
                touchend_evt.stopPropagation();
                touchend_evt.originalEvent.preventDefault();
                touchend_evt.originalEvent.stopPropagation();
            }

            if(!tap_cancelled){
                var pointertap = jQuery.Event("PointerTap");
                pointertap.originalEvent = touchend_evt;
                pointertap.touchStart = touchStart;
                $startTarget.trigger(pointertap); //It's a tap!!
                log('PointerTap triggered (via touch)');
            }

            cleanUp();

        });

    }

    /**
     * TODO: implement PointerCancel event if moved too far
     * On mousedown, we start detected tap and hold on element.
     * @param mousedown_evt
     */
    function onMouseDown(mousedown_evt){
        log('mousedown caught');
        var pointerdown = jQuery.Event("PointerDown");
        $startTarget = $(mousedown_evt.target);
        pointerdown.originalEvent = mousedown_evt;
        $startTarget.trigger(pointerdown);
        log('PointerDown triggered (via mousedown)');

        //hold timeout
        timeout = setTimeout(function(){
            var pointerhold = jQuery.Event("PointerHold");
            pointerhold.originalEvent = mousedown_evt;
            $startTarget.trigger(pointerhold);
            log('PointerHold triggered (via mousedown)');
        }, options.tap_timeout);

        $startTarget.on('mouseleave.pe mouseup.pe', function(){
            cleanUp();
        });
    }

    /**
     * Trigger a tap.
     * @param e
     */
    function onClick(e){
        var pointertap = jQuery.Event("PointerTap");
        $startTarget = $(e.target);
        pointertap.originalEvent = e;
        console.log($startTarget.prop('tagName'));
        if(($(this).data('pointertap') || options.prevent_all_default_events) && $startTarget.prop('tagName') != 'A'){
            e.preventDefault();
            e.stopPropagation();
        }
        $startTarget.trigger(pointertap); //It's a tap!!
        log('PointerTap triggered (via click)');
        cleanUp();
    }

    /**
     * Cancels the tap gesture and removes internal event listeners.
     */
    function cancelTap(){
        tap_cancelled = true;
        clearTimeout(timeout);
    }

    /**
     * Called on touchend, touchcancel, or mouseup.
     */
    function cleanUp(){
        $startTarget.off('touchend.pe');
        $startTarget.off('touchmove.pe');
        $startTarget.off('mousemove.pe');
        $startTarget.off('mouseleave.pe');
        $startTarget.off('mouseup.pe');
        clearTimeout(timeout);
        var PointerCancel = jQuery.Event("PointerCancel");
        $startTarget.trigger(PointerCancel);
        log('PointerCancel triggered');
    }

    /**
     * Prevent's default Android touch events and allows for collection of touch events (Android bug workaround).
     * @param touchstart_evt
     * @param touchmove_evt
     */
    function preventDefaultForAndroidHack(touchstart_evt,touchmove_evt){
        touchstart_evt.preventDefault();
        touchstart_evt.stopPropagation();
        touchmove_evt.stopPropagation();
        touchmove_evt.preventDefault();
    }

    function log(stuff){
        if(options.debug) console.log(stuff);
    }

    function init(opts){

        options = $.extend({
            debug: false,
            tap_timeout: 800,
            tolerance: 10,
            prevent_all_default_events: false
        }, opts);

        $document = $(document);
        $document.on('touchstart.pe', onTouchStart);
        $document.on('click.pe', onClick);
        $document.on('mousedown.pe', onMouseDown);
    }

    return {
        init: init
    }

})(jQuery);