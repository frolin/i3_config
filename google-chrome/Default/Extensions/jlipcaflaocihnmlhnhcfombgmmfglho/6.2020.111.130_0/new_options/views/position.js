define(function () {
    return Backbone.View.extend({
        el: '.bar-positions-cnt',
        events: {
            "change .bar-on input": "changeVisibility",
            "change .bar-position input": "changePosition",
            "click  .extra": "showOptions"
        },
        render: function () {
            this.template();
            this.disableBarOption();
        },
        html: function () {
            return '<div class="cnt bar-on"><label title=""><input type="checkbox" /><span class="ttl"></span></label></div>' +
                '<div class="bar-position">' +
                '<div class="cnt lt"><label title=""><input type="radio" name="posBar" data-left="0" data-top="0" /><span class="ttl"></span></label></div>' +
                '<div class="cnt rt"><label title=""><input type="radio" name="posBar" data-left="100" data-top="0"/><span class="ttl"></span></label></div>' +
                '<div class="cnt lb"><label title=""><input type="radio" name="posBar" data-left="0" data-top="100" /><span class="ttl"></span></label></div>' +
                '<div class="cnt rb"><label title=""><input type="radio" name="posBar" data-left="100" data-top="100" /><span class="ttl"></span></label></div>' +
                '<ins></ins>' +
                '</div>';
        },
        template: function () {
            var html = this.html(),
                extraElement = $('<div/>', {class: 'extra'}).html('<img alt="" src="icons/new_options/img-12.png"/>');

            this.$el.html(html);
            this.$el.find('.bar-on').append(extraElement[0]);

            $('.bar-on label', this.el).attr('title', AppLocale.get('options.position.on'));
            $('.bar-on .ttl', this.el).html(AppLocale.get('options.position.on'));

            $('.lt label', this.el).attr('title', AppLocale.get('options.position.lt'));
            $('.lt .ttl', this.el).html(AppLocale.get('options.position.lt'));

            $('.rt label', this.el).attr('title', AppLocale.get('options.position.rt'));
            $('.rt .ttl', this.el).html(AppLocale.get('options.position.rt'));

            $('.lb label', this.el).attr('title', AppLocale.get('options.position.lb'));
            $('.lb .ttl', this.el).html(AppLocale.get('options.position.lb'));

            $('.rb label', this.el).attr('title', AppLocale.get('options.position.rb'));
            $('.rb .ttl', this.el).html(AppLocale.get('options.position.rb'));

            var b = Bar.toJSON();
            //show bar state and disabling bar options if bar is switched off
            b.active ?
                $('.bar-on input', this.el).attr('checked', 'checked') :
                $('.bar-on input', this.el).removeAttr('checked');

            $('.bar-position input', this.el).each(function (i, e) {
                if ($(e).data('left') === b.left &&
                    $(e).data('top') === b.top) {
                    $(e).attr('checked', 'checked');
                }

            });

        },
        changePosition: function (e) {
            Bar.changePosition({left: $(e.currentTarget).data('left'), top: $(e.currentTarget).data('top')});

            $('#save').removeAttr('disabled');
        },
        changeVisibility: function (e) {
            Bar.changeVisibility();
            this.disableBarOption();

            $('#save').removeAttr('disabled');
        },
        disableBarOption: function () {
            if (Bar.get('active')) {
                $('.bar-parameters').removeClass('disabled');
                $('.bar-position').removeClass('disabled');
                $('.bar-check').removeClass('disabled');

                $('.bar-parameters input').removeAttr('disabled');
                $('.bar-position input').removeAttr('disabled');
                $('.bar-check input').removeAttr('disabled');
            } else {
                $('.bar-parameters').addClass('disabled');
                $('.bar-position').addClass('disabled');
                $('.bar-check').addClass('disabled');

                $('.bar-parameters input').attr('disabled', 'disabled');
                $('.bar-position input').attr('disabled', 'disabled');
                $('.bar-check input').attr('disabled', 'disabled');
                // $('.bar-filter-domain textarea').attr('disabled', 'disabled');

            }
        },
        showOptions: function (event) {
            Contextmenu.open({e: event, m: window.Bar, parent: this});
        }
    });
});

