/**@namespace */
window.rdz.tooltips = {};

window.rdz.tooltips.Tooltip = window.rdz.Backbone.View.extend({
    className: 'rds-bar-tooltip',
    template: (function () {
        return rdz.$('<div class="rds-tooltip-cnt"></div>');
    })(),

    render: function (data, event, opener) {
        this.$el.html(this.template.html(data));
        if (opener) {
            rdz.$(event.currentTarget).parent().append(this.el);
        } else {
            rdz.$('.rds-bar', rdz.app.content.view.el).append(this.el);
        }
    },

    open: function (data, event, css, opener) { // opener arg is for a search integration
        this.close();
        var self = this;
        window.rdz.app.content.bar.set({'tooltip_timeout': +new Date()}, {silent: true});

        this.timer = setTimeout(function () {
            if (window.rdz.app.content.bar.get('tooltip_timeout') < +new Date() - 500) {
                self.render(data, event, opener);
                self.show(event, css);
            }
        }, 700);

    },
    show: function (event, css) {
        var pos_mouse = [event.clientX, event.clientY + 22], //22 mouse height
            size_tooltip = [this.$el.outerWidth(), this.$el.outerHeight()],
            size_window = [rdz.$(window).width(), rdz.$(window).height()];

        var _css = {
            left: pos_mouse[0] + size_tooltip[0] <= size_window[0] ? pos_mouse[0] : pos_mouse[0] - size_tooltip[0] + 13, //13 mouse width
            top: pos_mouse[1] + size_tooltip[1] <= size_window[1] ? pos_mouse[1] : pos_mouse[1] - size_tooltip[1] - 22,
            visibility: 'visible'
        };

        rdz._.extend(_css, css);
        this.$el.css(_css);

    },
    close: function () {
        clearTimeout(this.timer);
        this.$el.css({visibility: 'hidden', 'max-width': 650/*420*/});
    }
});

