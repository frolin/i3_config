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

                    if (NoIndex.get('clr_bg_txt_and_img').get('active')) {
                        html.find('.name').css({
                            'background-color': '#' + NoIndex.get('clr_bg_txt_and_img').get('value')[0],
                            'color': NoIndex.get('clr_bg_txt_and_img').get('value')[1]
                        });
                    }

                    if (NoIndex.get('cross_txt').get('active')) {
                        html.find('.name').css({
                            'text-decoration': NoIndex.get('cross_txt').get('value')
                        });
                    }

                    return html;
                },
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
                        $('.cm-noindex .example .name').css({
                            'background-color': '#' + this.model.get('value')[0],
                            'color': this.model.get('value')[1]
                        });
                    }
                    else {
                        $('.cm-noindex .example .name').css({'background-color': 'inherit', 'color': 'inherit'});
                    }
                }
            }),
            cross_txt: SuperView.extend({
                showActive: function () {
                    if (this.model.get('active')) {
                        $('.cm-noindex .example .name').css({'text-decoration': this.model.get('value')});
                    }
                    else {
                        $('.cm-noindex .example .name').css({'text-decoration': 'inherit'});
                    }
                }
            }),
            show_notification: SuperView.extend({
                showActive: function () {
                    return true;
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
            el: '.page-noindex',
            //events: {
            //    "change input"              : "change",
            //    "click  .extra"             : "showOptions"
            //},
            template: function () {
                var html = $('<div class="cnt">' +
                '<label title=""><input type="checkbox" /><span class="name">' + AppLocale.get('options.html.noindex') + '</span></label>' +
                '<div class=extra><img alt="" src="icons/new_options/img-12.png"/></div>' +
                '<div/>');

                if (NoIndex.get('example').get('active')) {
                    html.find('input').attr('checked', 'checked');
                }

                return html;
            },
            render: function () {
                //var elements = $(),
                //    view;
                //
                //if (Bar.get('locale') === 'ru')
                //{
                //    window.NoIndex.each(function (value, key, list) {
                //        view = new views[value.get('name')]({model:value, branch: 'noindex'});
                //        elements.push(view.render().el);
                //    });
                //    this.$el.html(elements);
                //    this.$el.show();
                //    $('.color-option').removeClass('en_locale');
                //} else {
                //    this.$el.hide();
                //    $('.color-option').addClass('en_locale');
                //}
                if (Bar.get('locale') === 'ru') {
                    this.$el.html(this.template());

                    var that = this;
                    this.off();
                    this.$el.find('input').on('change', function (e) {
                        that.change(e);
                    });
                    this.$el.find('.extra').on('click', function (e) {
                        that.showOptions(e);
                    });

                    this.$el.show();
                } else {
                    this.$el.hide();
                }
            },
            change: function (e) {
                NoIndex.get('example').set('active', !NoIndex.get('example').get('active'));

                $('#save').removeAttr('disabled');
            },
            showOptions: function (event) {
                Contextmenu.open({e: event, m: window.NoIndex, parent: this, name: 'NoIndex'});
                this.renderCM(event);
            },
            renderCM: function (e) {
                var elements = $(),
                    view;

                window.NoIndex.each(function (value, key, list) {
                    view = new views[value.get('name')]({model: value, branch: 'noindex'});
                    elements.push(view.render().el);
                });
                $('.cm-noindex').html(elements);
            }
        });
    });

