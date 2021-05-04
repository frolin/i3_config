window.CheckSiteModel = Backbone.Model.extend({
    idAttribute: 'name',
    toggleCheck: function(v) {
        this.get('Uri').checked = v;
    }
});

window.CheckPageModel = Backbone.Model.extend({
    idAttribute: 'name',
    toggleCheck: function(v) {
        this.get('Uri').checked = v;
    }
});

