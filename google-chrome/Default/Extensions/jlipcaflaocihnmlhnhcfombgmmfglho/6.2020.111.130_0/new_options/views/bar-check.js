define(
    function () {
        return Backbone.View.extend({
            el: '.bar-check .box',
            events: {
                "change .param": "change"
            },
            template: function () {
                var html = $('<div class="cnt normal"><label title=""><input type="radio" value="0" name="byButton" class="param"/><span class="name"></span></label></div>' +
                    '<div class="cnt by_button"><label title=""><input type="radio" value="1" name="byButton" class="param"/><span class="name"></span></label></div>'
                );
                this.$el.html(html);

                this.$el.find('.normal label').attr('title', AppLocale.get('options.extra.by_button.normal'));
                this.$el.find('.normal .name').html(AppLocale.get('options.extra.by_button.normal'));

                this.$el.find('.by_button label').attr('title', AppLocale.get('options.extra.by_button.by_button'));
                this.$el.find('.by_button .name').html(AppLocale.get('options.extra.by_button.by_button'));

                this.$el.prepend($('<div/>', {class: 'header', text: AppLocale.get('options.extra.by_button.ttl')}));

                !Bar.get('check_by_button') ? this.$el.find('.normal .param').attr('checked', 'checked') :
                    this.$el.find('.by_button .param').attr('checked', 'checked');

                if (!Bar.get('active')) html.find('.param').attr('disabled', 'disabled');

                return html;
            },
            render: function () {
                this.template();
            },
            change: function (e) {
                Bar.changeCheckByButton(e.currentTarget.value);

                $('#save').removeAttr('disabled');
            }
        });
    });

