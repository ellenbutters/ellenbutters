/**
 *  This file should be included immediately after jQuery.
 */


/*************************************************************************
 * Global application declaration
 *************************************************************************/

var Application = {
};

/*************************************************************************
 * This initializes the application, when ready. Requires both window load
 * and deviceready (Cordova) events to have already fired before this can be called.
 *************************************************************************/

Application.init = function(){

    function doAfterTemplatesLoad(){

        // PointerEvents
        PointerEvents.init({
            prevent_all_default_events: false,
            debug: false,
            prevent_all_mouseevents:  false
        });

        //load correct page
        if (!Utilities.Router.route()) {
            Utilities.Router.go2('home');
        }

        //hide spinner
        Utilities.hideLoading();

        var $body = $('body');

        $body.on('PointerTap.app', '*[data-action]', function (e) {
            e.preventDefault();
            var $this = $(this);
            if ($this.hasClass('locked')) return;
            if (Controller[$this.data('action')]) {
                Controller[$this.data('action')].call(undefined, $this.data('params') || {});
            }
        });

        $body.on('PointerTap.app', '*[data-route]', function (e) {
            e.preventDefault();
            var $this = $(this);
            if ($this.hasClass('locked')) return;
            var routeObj = Utilities.Router.getObjFromHash($this.data('route'));
            if(routeObj){
                Utilities.Router.go2(routeObj.id, routeObj.params);
            }
        });

        $body.on('PointerTap.app', '*[data-url]', function (e) {
            e.preventDefault();
            window.location = $(this).data('url');
        });
    }

    Utilities.loadTemplates(doAfterTemplatesLoad);

};

/*************************************************************************
 * Set up event listeners to initialize application when ready.
 *************************************************************************/

$(document).ready(function(){
    Utilities.showLoading();
});

$(window).load(function(){

    //user detection stuff
    if(navigator.userAgent.match(/Android/i)) {
        Utilities.client.add('android');
    } else if(window.navigator.userAgent.match(/iPhone/i)) {
        Utilities.client.add('iPhone');
    }

    Application.init();
});