Utilities.Router = (function () {

    var _my = {
        navigateAwayCallback: null
    };

    function _callControllerFromObj(id, params) {
        if (Controller[id]) {
            Controller[id].call(undefined, params);
        } else {
            throw("Controller[" + id + '] does not exist.');
        }
    }

    /**
     * Returns a hash string from a route ID and parameter map. If id does not exist, throws an Exception.
     * @param id
     * @param params
     * @returns {*|String}
     * @private
     */
    function _getHashFromObj(id, params) {
        var hash = Settings.Routes[id];
        if (!hash) {
            throw("Undefined route '" + id + "'");
        }
        var rm = routeMatcher(hash);
        return rm.stringify(params || {});
    }

    /**
     * Returns an object with the id and params object {id:[String],params:{}} from a hash string. Returns false if no
     * match was found.
     * @param hash
     * @returns {*}
     * @private
     */
    function _getObjFromHash(hash) {
        if (!hash) {
            return false;
        }

        for (var k in Settings.Routes) {
            if (Settings.Routes.hasOwnProperty(k)) {
                var rm = routeMatcher(Settings.Routes[k]);
                var p = rm.parse(hash);
                if (p !== null) {
                    return {id:k, params:p};
                }
            }
        }

        return false;
    }

    /**
     * onHashChange event handler.
     */
    function onHashChange() {
        var o = _getObjFromHash(Utilities.getHash());
        if (o) {
            _callControllerFromObj(o.id, o.params);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns an object which represents the current hash.
     * @return {*}
     */
    function status() {
        return _getObjFromHash(Utilities.getHash());
    }

    /**
     * Changes the hash, which then is handled by onHashChange, which calls the controller.
     * @param id
     * @param params
     */
    function go2(id, params) {
        if(_my.navigateAwayCallback){
            if(!_my.navigateAwayCallback()){
                return;
            }
        }
        window.location.hash = _getHashFromObj(id, params || {});
    }

    /**
     * Calls the controller, based on the current status (hash). Returns true if a match was found, false otherwise.
     * @return bool
     */
    function route() {
        var o = status();
        if (o) {
            _callControllerFromObj(o.id, o.params);
            return true;
        } else {
            return false;
        }
    }

    function init() {
        window.onhashchange = onHashChange;
    }

    /**
     * Registers a callback to be called when navigating to a different route. If the callback returns false,
     * the route change is cancelled. This callback must be unregistered with unregisterNavigateAwayCallback() when
     * no longer needed.
     * @param callback
     */
    function registerNavigateAwayCallback(callback){
        _my.navigateAwayCallback = callback;
    }

    /**
     * Unregisters the callback.
     */
    function unregisterNavigateAwayCallback(){
        _my.navigateAwayCallback = null;
    }

    init();

    return {
        route:route,
        status:status,
        go2:go2,
        registerNavigateAwayCallback: registerNavigateAwayCallback,
        unregisterNavigateAwayCallback: unregisterNavigateAwayCallback,
        getObjFromHash: _getObjFromHash
    };
})();