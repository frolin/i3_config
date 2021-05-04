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

                    if (UGC.get('clr_bg_txt_and_img').get('active')) {
                        html.find('.name').css({
                            'background-color': '#' + UGC.get('clr_bg_txt_and_img').get('value')[0],
                            'color': UGC.get('clr_bg_txt_and_img').get('value')[1]
                        });
                    }

                    if (UGC.get('clr_brdr_txt').get('active')) {
                        html.find('.name').css({
                            'outline': '#' + UGC.get('clr_brdr_txt').get('value')[0] + ' dashed 1px'
                        });
                    }

                    if (UGC.get('cross_txt').get('active')) {
                        html.find('.name').css({
                            'text-decoration': UGC.get('cross_txt').get('value')
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
                        $('.cm-ugc .example .name').css({
                            'background-color': '#' + this.model.get('value')[0],
                            'color': this.model.get('value')[1]
                        });
                    }
                    else {
                        $('.cm-ugc .example .name').css({'background-color': 'inherit', 'color': 'inherit'});
                    }
                }
            }),
            clr_brdr_txt: SuperView.extend({
                template: function () {
                    return $('<label title=""><input type="checkbox" class="on"/><span class="name"></span></label><input class="color"/>');
                },
                showActive: function () {
                    if (this.model.get('active')) {
                        $('.cm-ugc .example .name').css({'outline': '#' + this.model.get('value')[0] + ' dashed 1px'});
                    }
                    else {
                        $('.cm-ugc .example .name').css({'outline': 'inherit'});
                    }
                }
            }),
            cross_txt: SuperView.extend({
                showActive: function () {
                    if (this.model.get('active')) {
                        $('.cm-ugc .example .name').css({'text-decoration': this.model.get('value')});
                    }
                    else {
                        $('.cm-ugc .example .name').css({'text-decoration': 'inherit'});
                    }
                }
            }),
            clr_brdr_img: SuperView.extend({
                template: function () {
                    return $('<label title=""><input type="checkbox" class="on"/><span class="name"></span></label><input class="color"/>');
                },
                showActive: function () {
                    return true;
                }
            })
        };


        return Backbone.View.extend({
            el: '.page-ugc',
            //events: {
            //    "change input"              : "change",
            //    "click  .extra"             : "showOptions"
            //},
            template: function () {
                var html = $('<div class="cnt">' +
                '<label title=""><input type="checkbox" /><span class="name">' + AppLocale.get('options.html.ugc') + '</span></label>' +
                '<div class=extra><img alt="" src="icons/new_options/img-12.png"/></div>' +
                '<div/>');

                if (UGC.get('example').get('active')) {
                    html.find('input').attr('checked', 'checked');
                }

                return html;
            },
            render: function () {
                //var elements = $(),
                //    view;
                //
                //window.UGC.each(function (value, key, list) {
                //    view = new views[value.get('name')]({model:value, branch: 'ugc'});
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
                UGC.get('example').set('active', !UGC.get('example').get('active'));

                $('#save').removeAttr('disabled');
            },
            showOptions: function (event) {
                Contextmenu.open({e: event, m: window.UGC, parent: this, name: 'UGC'});
                this.renderCM(event);
            },
            renderCM: function (e) {
                var elements = $(),
                    view;

                window.UGC.each(function (value, key, list) {
                    view = new views[value.get('name')]({model: value, branch: 'ugc'});
                    elements.push(view.render().el);
                });

                $('.cm-ugc').html(elements);
            }
        });
    });

