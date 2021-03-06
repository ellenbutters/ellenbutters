// HairyMustache.js
// Useful templating utility and jQuery plugin for Mustache.js. Requires MustacheJS and jQuery >= 1.8
// Credit goes to @HenrikJoreteg, et. al. for ICanHaz.js (http://icanhazjs.com/), and anyone else who contributed to
// that project.

var HM = (function($, M){

    var templates = {};

    /**
     * Fetches JSON from a URL, and adds any templates returned.
     * @param url
     * @param callback
     */
    function fetch(url, callback){
        $.getJSON(url, function (templates) {
            add(templates);
            callback.call(this);
        });
    }

    /**
     * Adds one or more templates.
     */
    function add(input_templates){
        $.each(input_templates, function(name,mhtml){
            if(typeof templates[name] === 'object'){
                //already exists!
                throw('HM: Error: Template ' + name + ' already exists.');
            }
            M.parse(mhtml); //speeds things up
            templates[name] = mhtml;
        });
    }

    /**
     * Renders template and inserts into DOM. Listens for DOM event, and when handled, calls callback and
     * any available ViewHelper, within the lexical scope of the template and with data. Calls the ViewHelper first,
     * and then callback.
     * @param template_name
     * @param $destination
     * @param data
     * @param callback
     * @param target_element_id
     * @param insertion_method
     * @param target_element_class //you can specify class to listen for instead of target_element_id
     */
    function insert(template_name, $destination, data, callback, target_element_id, insertion_method, target_element_class){

        //make sure template is valid
        if(!template_name || !templates[template_name]){
            throw "HM: Error: Template '" + template_name + "' does not exist! You must HM.add() it first.";
        }

        callback = callback || function(){};
        data = data || {};
        target_element_id = target_element_id || template_name; //target defaults to template name

        //subscribe
        $(document).on('DOMNodeInserted.hm', function(e) {
            if (e.target.id == target_element_id || (target_element_class && $(e.target).hasClass(target_element_class))) {

                //set up the scope as the node inserted
                var $scope = $('#' + target_element_id);

                //see if there is a viewhelper defined
                if(HM.ViewHelper && typeof HM.ViewHelper[template_name] === 'function'){
                    HM.ViewHelper[template_name].call($scope, data);
                }

                //call callback
                callback.call($scope, data);

                //unsubscribe
                $(document).off('DOMNodeInserted.hm');
            }
        });

        //do insertion
        if(typeof insertion_method === 'function'){
            //do it their way
            insertion_method.call(undefined, M.render(templates[template_name], data, templates));
        } else {
            //default: just replace contents
            if(!($destination instanceof $) || !$destination.length){
                throw('HM: Error: $destination must be a jQuery object and must not be empty.');
            }
            $destination.html(M.render(templates[template_name], data, templates));
        }
    }

    /**
     * Returns the rendred template.
     * @param template_name
     * @param data
     * @return {*}
     */
    function render(template_name, data){
        return M.render(templates[template_name], data);
    }

    /**
     * Clears the templates, and adds to HM any templates stored in script tags with type of text/html or x-tmpl-mustache.
     */
    function grab(){
        clear();
        var i,
            l,
            scripts = document.getElementsByTagName('script'),
            script,
            trash = [];
        for (i = 0, l = scripts.length; i < l; i++) {
            script = scripts[i];
            if (script && script.innerHTML && script.id && (script.type === "text/html" || script.type === "x-tmpl-mustache")) {
                var obj = {};
                obj[script.id] = script.innerHTML.replace(/^\s+/, '').replace(/\s+$/, '');
                add(obj);
                trash.unshift(script);
            }
        }
        for (i = 0, l = trash.length; i < l; i++) {
            trash[i].parentNode.removeChild(trash[i]);
        }
    }

    /**
     * Clears the stored templates.
     */
    function clear(){
        templates = {};
        M.clearCache();
    }

    /**
     * Returns the templates loaded.
     * @return {Object}
     */
    function getTemplates(){
        return templates;
    }

    //---set up jQuery plugins---//

    $.fn.insertView = function(template_name, data, callback, target_element_id, target_element_class){
        insert(template_name, $(this), data, callback, target_element_id, null, target_element_class);
    };
    $.fn.appendView = function(template_name, data, callback, target_element_id, target_element_class){
        var $this = $(this);
        insert(template_name, null, data, callback, target_element_id, function(html){
            $this.append(html);
        }, target_element_class);
    };
    $.fn.prependView = function(template_name, data, callback, target_element_id, target_element_class){
        var $this = $(this);
        insert(template_name, null, data, callback, target_element_id, function(html){
            $this.prepend(html);
        }, target_element_class);
    };
    $.fn.afterView = function(template_name, data, callback, target_element_id, target_element_class){
        var $this = $(this);
        insert(template_name, null, data, callback, target_element_id, function(html){
            $this.after(html);
        }, target_element_class);
    };
    $.fn.beforeView = function(template_name, data, callback, target_element_id, target_element_class){
        var $this = $(this);
        insert(template_name, null, data, callback, target_element_id, function(html){
            $this.before(html);
        }, target_element_class);
    };

    return {
        fetch: fetch,
        add: add,
        insert: insert,
        render: render,
        grab: grab,
        clear: clear,
        getTemplates: getTemplates
    };

})(jQuery, Mustache);