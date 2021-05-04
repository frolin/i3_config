define(
    function () {
        return Backbone.View.extend({
            tagName: 'div',
            className: 'cnt',
            events: {
                "change .color": "changeColor",
                "change .on": "toggle",
                "focus  .list": "focusList",
                "blur   .list": "blurList"
            },
            initialize: function (options) {
                this.options = options || {};
                this.model.off();
                this.model.on('change:active', this.showActive, this);
                this.model.on('change:value', this.showActive, this);
            },
            render: function () {
                var html = this.template(),
                    colorPicker,
                    name = this.model.get('name'),

                // parameter "branch" define branch in locale
                    branch = this.options.branch;

                $(this.el).addClass(name);
                html.find('.name').html(AppLocale.get('page.' + branch + '.' + name + '.name'));
                html.attr('title', AppLocale.get('page.' + branch + '.' + name + '.ttl'));
                if (this.model.get('active')) html.find('.on').attr('checked', 'checked');

                // html[1] is input for colorPicker <input class="color"/>
                if (html[1] && html[1].tagName.toLowerCase() === 'input') {
                    colorPicker = new jscolor.color(html[1], {});
                    colorPicker.fromString(this.model.get('value')[0]);
                }

                // html[1] is textarea for list of exceptions in OuterLinks
                if (html[1] && html[1].tagName.toLowerCase() === 'textarea') {
                    $(html[1]).val(this.model.get('value'));
                }

                //highlight example at first load
                if (name === 'example') {
                    html = this.highlightExample(html);
                }

                this.$el.html(html);
                return this;

            },
            template: function () {
                return $('<label title=""><input type="checkbox" class="on"/><span class="name"></span></label>');
            },
            toggle: function () {
                this.model.toggle();

                $('#save').removeAttr('disabled');
            },
            changeColor: function (e) {
                this.model.changeColor({color: [$(e.currentTarget).val(), $(e.currentTarget).css('color')]});

                $('#save').removeAttr('disabled');
            },
            focusList: function (e) {
                var self = this;
                if (e) self.e = e;
                if ($(self.e.currentTarget).val() === self.model.get('value')) {
                    self.timer = setTimeout(function () {
                        self.focusList();
                    }, 500);
                }
                else {
                    $('#save').removeAttr('disabled');
                }

            },
            blurList: function () {
                var domains =
                    $(this.e.currentTarget).val().split('*')
                        .map(function (e) {
                            var domain = '';
                            if (e) {
                                domain = '*' + punycode.ToASCII(e.replace('\n', '')) + '\n';
                            }
                            return domain;
                        });


                this.model.changeList(domains.join(''));
                clearTimeout(this.timer);
            },
            showActive: function () {
                //always rewrite this function in instance
                console.log('forgot rewrite showActive');
            },
            highlightExample: function (html) {
                //always rewrite this function in instance
                return html;
            }
        });
    });


