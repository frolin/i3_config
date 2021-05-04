if (!window.rdz)
    /** @namespace global scope for add-on's methods and properties */
    window.rdz = {};

window.rdz.Backbone = Backbone.noConflict();
window.rdz._ = _.noConflict();
window.rdz.$ = jQuery.noConflict(true);
