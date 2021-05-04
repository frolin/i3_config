define([
        'new_options/views/page-views'
    ],
    function (SuperView) {
        var views = {
            example: SuperView.extend({
                template: function () {
                    return $('<label title=""><span class="name"></span></label>');
                },
                highlightExample: function (html) {

                    return html;
                },
                showActive: function () {
                    return true;
                }
            })
        };


        return Backbone.View.extend({
            el: '.page-robots',
            //events: {
            //    "change input"              : "change",
            //    "click  .extra"             : "showOptions"
            //},
            template: function () {
                var html = $('<div class="cnt">' +
                '<label title=""><input type="checkbox" /><span class="name">' + AppLocale.get('options.html.robots') + '</span></label>' +
                '<div/>');

                if (Robots.get('example').get('active')) {
                    html.find('input').attr('checked', 'checked');
                }

                return html;
            },
            render: function () {
                //var elements = $(),
                //    view;
                //
                //window.NoFollow.each(function (value, key, list) {
                //    view = new views[value.get('name')]({model:value, branch: 'nofollow'});
                //    elements.push(view.render().el);
                //});
                //this.$el.html(elements);

                this.$el.html(this.template());

                var that = this;
                this.off();
                this.$el.find('input').on('change', function (e) {
                    that.change(e);
                });
                this.$el.find('.extra').on('click', function (e) {
                    that.showOptions(e);
                });
            },
            change: function (e) {
                Robots.get('example').set('active', !Robots.get('example').get('active'));

                $('#save').removeAttr('disabled');
            },
            showOptions: function (event) {
                
            },
        });
    });

