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

                    if (DisplayNone.get('clr_bg_txt_and_img').get('active')) {
                        html.find('.name').css({
                            'background-color': '#' + DisplayNone.get('clr_bg_txt_and_img').get('value')[0],
                            'color': DisplayNone.get('clr_bg_txt_and_img').get('value')[1]
                        });
                    }

                    return html;
                },
                showActive: function () {
                    return true;
                }
            }),
            show_notification: SuperView.extend({
                showActive: function () {
                    return true;
                }
            }),
            clr_bg_txt_and_img: SuperView.extend({
                template: function () {
                    return $('<label title=""><input type="checkbox" class="on"/><span class="name"></span></label><input class="color"/>');
                },
                showActive: function () {
                    if (this.model.get('active')) {
                        $('.cm-displaynone .example .name').css({
                            'background-color': '#' + this.model.get('value')[0],
                            'color': this.model.get('value')[1]
                        });
                    }
                    else {
                        $('.cm-displaynone .example .name').css({'background-color': 'inherit', 'color': 'inherit'});
                    }
                }
            }),
            exceptions: SuperView.extend({
                template: function () {
                    return $('<label title=""><span class="name"></span></label><textarea class="list" cols="6" rows="12"></textarea>');
                },
                showActive: function () {
                    return true;
                }
            })
        };


        return Backbone.View.extend({
            el: '.page-displaynone',
            //events: {
            //    "change input"              : "change",
            //    "click  .extra"             : "showOptions"
            //},
            template: function () {
                var html = $('<div class="cnt">' +
                '<label title=""><input type="checkbox" /><span class="name">' + AppLocale.get('options.html.displaynone') + '</span></label>' +
                '<div class=extra><img alt="" src="icons/new_options/img-12.png"/></div>' +
                '<div/>');

                if (DisplayNone.get('example').get('active')) {
                    html.find('input').attr('checked', 'checked');
                }

                return html;
            },
            render: function () {
                //var elements = $(),
                //    view;
                //
                //window.DisplayNone.each(function (value, key, list) {
                //    view = new views[value.get('name')]({model:value, branch: 'displaynone'});
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
                DisplayNone.get('example').set('active', !DisplayNone.get('example').get('active'));

                $('#save').removeAttr('disabled');
            },
            showOptions: function (event) {
                Contextmenu.open({e: event, m: window.DisplayNone, parent: this, name: 'DisplayNone'});
                this.renderCM(event);
            },
            renderCM: function (e) {
                var elements = $(),
                    view;

                window.DisplayNone.each(function (value, key, list) {
                    view = new views[value.get('name')]({model: value, branch: 'displaynone'});
                    elements.push(view.render().el);
                });

                $('.cm-displaynone').html(elements);
            }
        });
    });

