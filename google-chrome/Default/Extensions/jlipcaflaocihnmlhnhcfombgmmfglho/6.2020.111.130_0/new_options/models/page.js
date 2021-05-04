define(function () {
    return Backbone.Model.extend({
        idAttribute: 'name',
        toggle: function () {
            this.set({active: !this.get('active')});
        },
        changeColor: function (p) {
            this.set({value: p.color});
        },
        changeList: function (p) {
            this.set({value: p});
        }
    });
});
