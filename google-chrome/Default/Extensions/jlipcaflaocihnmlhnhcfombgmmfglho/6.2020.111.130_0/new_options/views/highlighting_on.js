define(function () {
    return Backbone.View.extend({
        el: '.page-highlighting-cnt',
        events: {
            "change .highlighting-on input": "changeHighlighting"
        },
        render: function () {
            this.template();
            this.disableHighlightingOption();
        },
        html: function () {
            return '<div class="cnt highlighting-on"><label title=""><input type="checkbox" /><span class="ttl"></span></label></div>';
        },
        template: function () {
            var html = this.html();
            this.$el.html(html);
            $('.highlighting-on label', this.el).attr('title', AppLocale.get('options.html.highlighting_on.ttl'));
            $('.highlighting-on .ttl', this.el).html(AppLocale.get('options.html.highlighting_on.name'));
            // set the checkbox
            var b = Bar.toJSON();
            b.highlight_pages ?
                $('.highlighting-on input', this.el).attr('checked', 'checked') :
                $('.highlighting-on input', this.el).removeAttr('checked');
        },
        changeHighlighting: function (e) {
            Bar.changeHighlighting();
            this.disableHighlightingOption();
            $('#save').removeAttr('disabled');
        },
        disableHighlightingOption: function () {
            if (Bar.get('highlight_pages')) {
                $('.page-noindex, .page-nofollow, .page-sponsored, .page-ugc, .page-canonical, .page-robots, .page-outerlinks, .page-displaynone').removeClass('disabled');
                $('.page-noindex input, .page-nofollow input, .page-sponsored input, .page-ugc input, .page-canonical input, .page-robots input, .page-outerlinks input, .page-displaynone input').removeAttr('disabled');
            } else {
                $('.page-noindex, .page-nofollow, .page-sponsored, .page-ugc, .page-canonical, .page-robots, .page-outerlinks, .page-displaynone').addClass('disabled');
                $('.page-noindex input, .page-nofollow input, .page-sponsored input, .page-ugc input, .page-canonical input, .page-robots input, .page-outerlinks input, .page-displaynone input').attr('disabled', 'disabled');
            }
        }
    });
});

