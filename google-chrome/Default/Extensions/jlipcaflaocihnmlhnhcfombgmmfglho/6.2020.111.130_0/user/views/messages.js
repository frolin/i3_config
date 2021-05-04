MessageErr = Backbone.View.extend({
    tagName: 'div',
    className: 'user-error',
    render: function() {
        $(this.el).html(this.model);
        return this;
    }
});