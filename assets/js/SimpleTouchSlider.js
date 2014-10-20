
var SimpleTouchSlider = function($el, opts){
    var $container = $(">ul", $el);
    var $panes = $(">ul>li", $el);

    var pane_width = 0;
    var pane_count = $panes.length;

    var current_pane = 0;

    var play_interval_obj;
    var is_animating = false;


    /**
     * initial
     */
    function init() {

        //set width of container
        $container.css('width', (pane_count * 100) + '%');

        $panes.css('width', (100 / pane_count) + '%');

        setTimeout(function(){
            $el.hammer({
                drag_lock_to_axis: true
            }).on("release dragleft dragright swipeleft swiperight", handleHammer);

            if(opts.onPageChange){
                opts.onPageChange(0);
            }

            if(opts.auto_play){
                play();
            }
        }, 500);
    }

    /**
     * show pane by index
     */
    function showPane(index, animate) {
        // between the bounds
        index = Math.max(0, Math.min(index, pane_count-1));
        current_pane = index;

        var offset = -((100/pane_count)*current_pane);
        setContainerOffset(offset, animate);

        if(opts.onPageChange){
            opts.onPageChange(index);
        }
    }


    function setContainerOffset(percent, animate) {
        if(animate && is_animating) {
            $container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");
        } else if(animate){
            $container.addClass("animate");
            is_animating = true;
            setTimeout(function(){
                $container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");
            }, 0);
        } else {
            $container.removeClass("animate");
            is_animating = false;
            $container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");
        }
    }

    function next(infinite) {
        if(current_pane == pane_count - 1 && infinite) current_pane = -1;
        return showPane(current_pane+1, true);
    }

    function prev(infinite) {
        if(current_pane == 0 && infinite) current_pane = pane_count;
        return showPane(current_pane-1, true);
    }

    function play(){
        play_interval_obj = setInterval(next, opts.play_interval);
    }

    function stop(){
        clearTimeout(play_interval_obj);
    }

    function handleHammer(ev){

        if(!pane_width){
            pane_width = $panes.first().width();
        }

        ev.gesture.preventDefault();


        switch(ev.type) {
            case 'dragright':
            case 'dragleft':
                stop();
                // stick to the finger

                var pane_offset = -(100/pane_count)*current_pane;
                var drag_offset = ((100/pane_width)*ev.gesture.deltaX) / pane_count;

                // slow down at the first and last pane
                if((current_pane == 0 && ev.gesture.direction == "right") ||
                    (current_pane == pane_count-1 && ev.gesture.direction == "left")) {
                    drag_offset *= .4;
                }

                setContainerOffset(drag_offset + pane_offset);
                break;

            case 'swipeleft':
                stop();
                next();
                ev.gesture.stopDetect();
                break;

            case 'swiperight':
                stop();
                prev();
                ev.gesture.stopDetect();
                break;

            case 'release':
                console.log('release');
                // more then 50% moved, navigate
                if(Math.abs(ev.gesture.deltaX) > pane_width/2) {
                    if(ev.gesture.direction == 'right') {
                        prev();
                    } else {
                        next();
                    }
                }
                else {
                    showPane(current_pane, true);
                }
                break;
        }
    }

    function goToSlide(index){
        showPane(index, true);
    }

    /**
     * Tear down function to kill intervals and unbind listeners.
     */
    function destroy(){
        $el.hammer().off("release dragleft dragright swipeleft swiperight");
        clearInterval(play_interval_obj);
    }

    return {
        init: init,
        getCurrentSlide: function(){return current_pane;},
        destroy: destroy,
        getNumSlides: function(){return pane_count;},
        goToSlide: goToSlide,
        prev: prev,
        next: next
    };
};


/* JQUERY PLUGIN */

(function($){
    $.fn.SimpleTouchSlider = function(opts){
        opts = $.extend({
            el: $(this),
            animation_duration: 400,
            auto_play: true,
            play_interval: 5000,
            onPageChange: function(index){
                $('#slider-position li').removeClass('selected');
                $($('#slider-position li')[index]).addClass('selected');
            }
        }, opts);
        var s = new SimpleTouchSlider($(this), opts);
        s.init();
        $(this).data('sldr', s);
        $(this).addClass('sldr');
        return s;
    };
})(jQuery);