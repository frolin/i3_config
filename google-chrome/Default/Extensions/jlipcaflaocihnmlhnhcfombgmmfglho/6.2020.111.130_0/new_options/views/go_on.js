define(
    function () {
        return Backbone.View.extend({
            el: '#google-small-tab',
            events: {
                "change  input": "change"
            },
            template: function () {
                var html = '<input type="checkbox" class="param"/>' +
                    '<div><img alt="" src="icons/new_options/img-10.png"/> ' + AppLocale.get('options.google.ttl') + '</div>'; //AppLocale.get('options.view.google_search_ttl');

                return html;
            },
            render: function () {
                this.$el.html(this.template());
                if (Google.get('active')) {
                    this.$el.find('.param').attr('checked', 'checked');
                }
                this.disableGoogleOptions();
            },
            change: function () {
                this.changeVisibility();
            },
            changeVisibility: function (e) {
                Google.changeVisibility();
                this.disableGoogleOptions();

                $('#save').removeAttr('disabled');
            },
            disableGoogleOptions: function () {
                if (Google.get('active')) {
                    $('#google-small-panel').removeClass('disabled');
                    $('.google-select').removeAttr('disabled');
                    $('#google-small-panel input').removeAttr('disabled');
                } else {
                    $('#google-small-panel').addClass('disabled');
                    $('.google-select').attr('disabled', 'disabled');
                    $('#google-small-panel input').attr('disabled', 'disabled');
                }
            }
        });
    });

