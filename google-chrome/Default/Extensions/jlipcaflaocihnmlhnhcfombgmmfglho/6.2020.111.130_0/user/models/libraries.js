window.Recip = Backbone.Model.extend({
    idAttribute: 'name',
    toggleCheck: function(v) {
        this.get('Uri').checked = v;
    }
});

window.Site = Backbone.Model.extend({
    idAttribute: 'name',
    toggleCheck: function(v) {
        this.get('Uri').checked = v;
    }
});

window.Page = Backbone.Model.extend({
    idAttribute: 'name',
    toggleCheck: function(v) {
        this.get('Uri').checked = v;
    }
});

