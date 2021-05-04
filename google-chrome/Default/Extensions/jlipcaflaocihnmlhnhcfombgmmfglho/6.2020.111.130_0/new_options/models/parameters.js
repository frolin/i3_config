define(function () {
    return Backbone.Model.extend({
        idAttribute: 'name',

        toggle: function (a) {
            var extra;
            switch (a.extra) {
                //main attributes
                case null :
                    this.set({active: !this.get('active')});
                    break;

                case 'api_extra' :
                    extra = this.get('extra');
                    extra.api.extra[a.opt_name] = a.value;
                    this.set({extra: extra});
                    break;

                //other attributes in extra
                default :
                    extra = this.get('extra');
                    extra[a.extra].active = a.value;
                    this.set({extra: extra});
                    this.trigger("change:extra", this, a.value);
            }
        }
    });
});
