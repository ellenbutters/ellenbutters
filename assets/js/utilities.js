/*************************************************************************
 * Utility functions
 *************************************************************************/

var Utilities = (function(my){

    var showLoadingTimeout = null;

    my.showLoading = function(message){
        showLoadingTimeout = setTimeout(function(){
            message = message ? '<p>' + message + '</p>' : '';
            var html = '<div id="loading-overlay"><i></i>' + message + '</div>';
            if(!$('#loading-overlay').length){
                $('body').append(html);
            } else {
                $('#loading-overlay p').remove();
                $('#loading-overlay').append(message);
            }
        }, Settings.Misc.loadingDisplayDelay);
    };

    my.hideLoading = function(){
        clearTimeout(showLoadingTimeout);
        $('#loading-overlay').remove();
    };

    my.goToTop = function(){ //doesn't remove nav bar anymore on iOS7 if in safari
        window.top.scrollTo(0, 1);
    };
    
    my.scrollTo = function($item){
        $('html,body').animate({scrollTop: $item.offset().top},{duration:300});
    };

    my.onButtonDown = function(e){
        var $this = $(this);
        var a = setTimeout(function(){
            $this.addClass('active');
        }, 50);
        $this.on('PointerCancel touchend PointerTap mouseup mouseleave', function(){
            clearTimeout(a);
            $this.removeClass('active');
        });
    };

    /**
     * Combines close together signals into one.
     * @param func
     * @param wait
     * @param runFirst
     * @return {Function}
     */
    my.debounce = function(func, wait, runFirst) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!runFirst) func.apply(context, args);
            };
            var callNow = runFirst && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    my.throttle = function (func, threshhold, scope) {
        threshhold || (threshhold = 250);
        var last,
            deferTimer;
        return function () {
            var context = scope || this;

            var now = +new Date,
                args = arguments;
            if (last && now < last + threshhold) {
                // hold on to it
                clearTimeout(deferTimer);
                deferTimer = setTimeout(function () {
                    last = now;
                    func.apply(context, args);
                }, threshhold);
            } else {
                last = now;
                func.apply(context, args);
            }
        };
    };

    my.isJSONString = function(str){
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    /**
     * Given a valid JSON string or object, it always returns an object. If it is not valid JSON or object, it returns
     * false.
     * @param json
     */
    my.normalizeJSONObject = function(json){
        if(my.isJSONString(json)){
            return JSON.parse(json);
        } else if(typeof json == 'object'){
            return json;
        } else {
            return false;
        }

    };

    my.getHash = function(){
        if(window.location.hash){
            return window.location.hash.substring(1);
        } else {
            return '';
        }
    };

    my.loadTemplates = function(callback){
        console.log('loading templates...');
        var templates_loaded = 0;
        var templates_to_load = Object.keys(Settings.Templates).length;
        //fetch all of the templates defined in Settings via ajax
        $.each(Settings.Templates, function (name, url) {
            $.ajax({
                url: Settings.Misc.templates_dir + url,
                success: function(html){
                    var template = {};
                    template[name] = html;
                    HM.add(template);
                    templates_loaded++;
                    if(templates_loaded == templates_to_load){
                        callback();
                    }
                },
                error: function(){console.log('there was an error loading template at: ' + url);}
            });
        });
    };

    /**
     * A rate limiting function that doesn't ignore calls, but executes them in FIFO order.
     * @type {*}
     */
    my.RateLimit = (function() {
        var RateLimit = function(maxOps, interval, allowBursts) {
            this._maxRate = allowBursts ? maxOps : maxOps / interval;
            this._interval = interval;
            this._allowBursts = allowBursts;

            this._numOps = 0;
            this._start = new Date().getTime();
            this._queue = [];
        };

        RateLimit.prototype.schedule = function(fn) {
            var that = this,
                rate = 0,
                now = new Date().getTime(),
                elapsed = now - this._start;

            if (elapsed > this._interval) {
                this._numOps = 0;
                this._start = now;
            }

            rate = this._numOps / (this._allowBursts ? 1 : elapsed);

            if (rate < this._maxRate) {
                if (this._queue.length === 0) {
                    this._numOps++;
                    fn();
                }
                else {
                    if (fn) this._queue.push(fn);

                    this._numOps++;
                    this._queue.shift()();
                }
            }
            else {
                if (fn) this._queue.push(fn);

                setTimeout(function() {
                    that.schedule();
                }, 1 / this._maxRate);
            }
        };

        return RateLimit;
    })();

    /**
     * Returns true if thing is an empty array, empty object, undefined or null.
     * @param thing
     */
    my.isEmpty = function(thing) {
        if (typeof thing === 'undefined' || thing === null) {
            return true;
        }
        if (typeof thing === 'array' && thing.length === 0) {
            return true;
        }
        return $.isEmptyObject(thing);
    };

    /*************************************************************************
     * Utility Client detection stuff
     *************************************************************************/

    my.client = (function(){

        var attrs = {};

        function has(attr){
            return attrs[attr] || false;
        }

        function add(attr){
            $('html').addClass(attr);
            attrs[attr] = true;
        }

        function remove(attr){
            $('html').removeClass(attr);
            attrs[attr] = null;
        }

        return {
            has: has,
            add: add,
            remove: remove
        }

    })();

    return my;
})(Utilities || {});

/**
 * Centers an element, with regards to its container.
 * It can center on horizontal, vertical, or both axis.
 * Container defaults to it's immediate parent if not provided.
 * Axis defaults to 'xy' if not provided.
 * @param map
 */
$.fn.centerPos = function(map){

    var settings = $.extend( {
        axis: 'xy', //can be x, y, or xy
        container: $(this).parent()
    }, map);

    $(this).css('position', 'absolute');

    var pos = 0;

    if(settings.axis === 'y' || settings.axis === 'xy'){
        var containerHeight = settings.container.outerHeight();
        pos = containerHeight/2 - $(this).outerHeight()/2;
        $(this).css('top', pos + 'px');
    }

    if(settings.axis === 'x' || settings.axis === 'xy'){
        var containerWidth = settings.container.outerWidth();
        pos = containerWidth/2 - $(this).outerWidth()/2;
        $(this).css('left', pos + 'px');
    }
};