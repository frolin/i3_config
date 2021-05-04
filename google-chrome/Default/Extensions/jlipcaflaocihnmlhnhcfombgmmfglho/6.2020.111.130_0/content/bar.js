if (!window.rdz) window.rdz = {};

/** @description { Boolean } indicate was page loaded or not*/
window.rdz.selected = false;

window.rdz.model = {
    content: {

        /**@class Parameters*/
        Parameters: rdz.Backbone.Model.extend(
            /** @lends window.rdz.model.content.Parameters */
            {
                defaults: {
                    value: null
                },
                idAttribute: 'name',

                /** @description sendMessage send information to BG script
                 *  @param {Object} message
                 */
                sendMessage: function (message) {
                    message.method = 'message';
                    message.model = this.toJSON();
                    rdz.cmessenger.post(message);
                },

                /** @description valueChanged triggered when model's value is changed
                 *  @param {Object} view it's draw object with methods correspond to that model
                 */
                valueChanged: function (view) {
                    view.showResult();

                    try {

                    }
                    catch (e) {
                        window.console.log('Error by ' + this.get('name') + ' ' + e.toString());
                        throw Error(e);
                    }
                },
                resetView: function () {
                    this.set({value: null});
                },

                /** @description clearCache set value to null and trigger sendMessage */
                clearCache: function () {
                    this.resetView();

                    var bar = window.rdz.app.content.bar;
                    if (!bar.get('options').check_by_button) {
                        if (this.get('name') !== 'UniqueContent' &&
                            this.get('name') !== 'Prodvigator' &&
                            this.get('name') !== 'SpyWords' && !(this.get('name') === 'StatHistory' && this.get('extra').check_always.active === false)
                        ) { // CHANGE!!!!
                            if (this.get('name') === 'StatHistory') {
                                this.set('value', rdz.errors.RECEIVING);
                                this.trigger("change:value");
                            }
                            this.sendMessage({url: window.rdz.url, request: 'PARAMETER_ContentRequest'});
                        }
                    }

                }/*,
             parseContent: function(a){
             var self = this;
             rdz.$(function(){
             self.set({counters: rdz.utils.parseCounters(a)}, {silent: true});
             self.sendMessage({url: window.rdz.url, request: 'PARAMETER_ContentRequest'});
             }
             );
             }*/
            }),

        /**@class Bar control bar data (current position ond other possible data )*/
        Bar: rdz.Backbone.Model.extend({
            defaults: {
                bar_creation_time: 0,
                cache_cleared: false,
                button_pressed_recently: false
            },
            pressed_recently_timer: function () {
                var self = this;
                clearTimeout(self.timer);
                self.timer = setTimeout(function () {
                    self.set({'button_pressed_recently': false});
                }, 500);
            }
        })

    }
};

window.rdz.collection = {
    content: {

        /**@class Collection of parameters, in any time can get parameter's model by name (if param active and on page)*/
        Parameters: rdz.Backbone.Collection.extend(
            /** @lends window.rdz.collection.content.Parameters */
            {
                model: rdz.model.content.Parameters,

                /** @description updateModel set parameter's values and requests to model
                 *  @param { Object } o
                 */
                updateModel: function (o) {
                    var model = this.get(o.model.name);
                    if (rdz.utils.isModelURLValid({requests: o.model.requests, url: window.rdz.url})) {
                        //model.request = o.request;
                        model.set({
                            value: o.model.value, /*cached: o.model.cached,*/
                            requests: o.model.requests || model.get('requests')
                        }, {silent: true});
                        model.trigger("change:value");
                    }
                    else {
                        //model.sendMessage({url: window.rdz.url, request: 'PARAMETER_ContentRequest'});
                    }
                },

                /** @description sendALLRequest trigger sendMessage for each model */
                sendALLRequest: function () {
                    this.resetAllViews();

                    //send requests, parse pages, append parsed values
                    this.each(function (param) {
                        var message = {url: window.rdz.url, request: 'PARAMETER_ContentRequest'};

                        if (param.get('name') === 'UniqueContent' ||
                            param.get('name') === 'Prodvigator' ||
                            param.get('name') === 'SpyWords' ||
                            (param.get('name') === 'StatHistory' && param.get('extra').check_always.active === false)
                        ) {
                            param.trigger("change:value");
                            message.only_cache = true;
                        }

                        if (param.get('name') === 'StatHistory') {
                            param.set('value', rdz.errors.RECEIVING);
                            param.trigger("change:value");
                        }

                        param.sendMessage(message);

                        //if (skip) {
                        //    param.trigger("change:value");
                        //}  else {
                        //    param.sendMessage(message);
                        //}
                    });
                },
                resetAllViews: function () {
                    this.each(function (param) {
                        param.resetView();
                    });
                },
                /** @description clearAllCache trigger clearCache for each model */
                clearAllCaches: function () {
                    this.each(function (param) {
                        param.clearCache();
                    });
                },

                /** @function  call each parameter's method setHref in showResult method*/
                byButtonMode: function () {
                    this.each(function (param) {
                        param.trigger("change:value");
                    });
                }
            })
    }

};

window.rdz.view = {

    content: {

        /**@class Factory provide mechanism of inheritance for parameters in bar. */
        Factory: {
            createParameters: function () {
                var elements = rdz.$(),
                    parameter,
                    name;

                //append html
                rdz.app.content.parameters.each(function (value, index) {

                    name = value.get('name');
                    parameter = rdz.view.parameters.Parameter.extend(rdz.view.bar.Parameter);

                    if (rdz.view.parameters[name]) {
                        parameter = parameter.extend(rdz.view.parameters[name]);
                        if (rdz.view.bar[name]) {

                            parameter = parameter.extend(rdz.view.bar[name]);
                            parameter = new parameter({model: value});
                        }
                        else {
                            parameter = new parameter({model: value});
                        }
                    }
                    else {
                        if (rdz.view.bar[name]) {
                            parameter = parameter.extend(rdz.view.bar[name]);
                            parameter = new parameter({model: value});
                        }
                        else {
                            parameter = new parameter({model: value});
                        }

                    }

                    //here we check if view don't return null from method. Null is no html for parameter
                    var html = parameter.render();
                    if (html)
                        elements.push(html);

                });
                return elements;
            }
        },
        /** @class App start rendering views for parameters*/
        App: rdz.Backbone.View.extend({
            initialize: function () {
                rdz.$(window).bind("resize.barPosition", rdz._.bind(this.barPosition, this));
            },
            render: function () {
                rdz.app.content.appended = true;
                if (!document.body) {
                    setTimeout(function () {
                        rdz.app.content.view.render();
                    }, 10);
                }
                else {
                    this.el = document.body.tagName === 'BODY' && document.body || document.getElementsByTagName('html')[0];

                    var view = new rdz.view.content.Panel;
                    rdz.$(this.el).prepend(view.render().el);

                    //
                    window.rdz.app.content.bar.set({bar_creation_time: +new Date()}, {silent: true});

                    this.barPosition();
                    this.saveDefaultBodyCSS();
                    this.setBodyCCS();
                    this.spacesBetweenParameters();
                    this.getAd();
                }

            },
            barPosition: function () {
                var bar = window.rdz.app.content.bar;

                /**on page with SSL bar aren't shown and some of objects aren't initialized,
                 but this.barPosition is triggered by bind in initialization */
                //if (document.location.href.match(/https:\/\//i)) return;

                //if undefined -  domain in bar-exception list
                if (!bar.get('options')) return;

                /**avoid unsuitable positions for bar*/
                if (bar.get('bar_creation_time') >= +new Date() - 10000) {
                    setTimeout(function () {
                        rdz.app.content.view.barPosition();
                    }, 1000);
                }

                this.calculateBarPosition(bar);
                this.barPositionOnYandexCachePage(bar);

            },
            calculateBarPosition: function (bar, pos) {

                var barOptions = bar.get('options');

                //barOptions =
                if (!pos) pos = [barOptions.left, barOptions.top];

                var bar_size = this.getBarSize();
                var win_size = this.getWindowSize();

                var css = {};
                if (pos[0] !== 0)
                    css.borderLeft = '1px solid #D4D7D9';
                if (pos[0] !== 100)
                    css.borderRight = '1px solid #D4D7D9';
                if (pos[1] !== 0)
                    css.borderTop = '1px solid #D4D7D9';
                if (pos[1] !== 100)
                    css.borderBottom = '1px solid #D4D7D9';


                css.left = Math.floor((win_size[0] / 100 * pos[0]) + bar_size[0] < win_size[0] ? (win_size[0] / 100 * pos[0]) : win_size[0] - bar_size[0]);
                css.top = Math.floor((win_size[1] / 100 * pos[1]) + bar_size[1] < win_size[1] ? (win_size[1] / 100 * pos[1]) : win_size[1] - bar_size[1]);

                if (bar_size[0] < win_size[0]) {
                    window.rdz.app.content.scroll.hide();
                } else {
                    css.left = 0;
                    window.rdz.app.content.scroll.show(win_size, bar_size);
                }


                rdz.$('.rds-bar').css(css);

            },
            barPositionOnYandexCachePage: function (bar) {
                if (rdz.url.match('http://hghltd.yandex.net/yandbtm')) {
                    this.calculateBarPosition(bar, [bar.get('options').left,
                        bar.get('options').top === 0 ? 100 / (this.getWindowSize()[1] / 100) : bar.get('options').top]);
                }
            },
            getBarSize: function () {
                var bar = rdz.$('.rds-bar', rdz.app.content.view.el);

                var children = bar.children('.rds-bar-container').children(),
                    width = 0;

                //iterate children and summarize their with
                children.each(function (i, el) {

                    if (/rds-scroll/.test(el.className)) {
                        width += window.rdz.app.content.scroll.width();
                    }
                    else {
                        width += rdz.$(el).outerWidth();
                    }

                });

                return [width + 1, bar.height() + 1]; //+1 border
            },
            getWindowSize: function () {
                var width = rdz.$(window).width();
                return [
                    width,
                    width < rdz.$(document).width() ? window.innerHeight - 16 : window.innerHeight //rdz.$(window).height() is buggy, 16 scroll width
                ];
            },

            setBodyCCS: function (css) {
                var bar = window.rdz.app.content.bar;
                //if undefined -  domain in bar-exception list
                if (!bar.get('options')) return;

                //
                if (!css) {
                    var margin_name = bar.get('options').top === 0 ? 'marginTop' : 'marginBottom';
                    //var margin_name = bar.get('options').top === 0 ? 'top' : 'bottom';
                    css = {/*top: 0, position: 'relative'*/};
                    css[margin_name] = Number(this.$el.css(margin_name).replace('px', '')) + this.getBarSize()[1];
                }
                rdz.$(this.el).css(css);
            },

            saveDefaultBodyCSS: function () {
                var bar = window.rdz.app.content.bar;
                //if undefined -  domain in bar-exception list
                if (!bar.get('options')) return;

                var css_page = {
                    position: this.$el.css('position'),
                    top: this.$el.css('top')
                };

                var margin_name = bar.get('options').top === 0 ? 'marginTop' : 'marginBottom';
                css_page[margin_name] = Number(this.$el.css(margin_name).replace('px', ''));

                window.rdz.app.content.bar.set({css_page: css_page});

            },

            spacesBetweenParameters: function () {
                var icons = rdz.$('.rds-bar').find('.rds-cnt.rds-icons');
                icons.filter(':last').addClass('rds-last');
                icons.filter(':first').addClass('rds-first');
            },
            barDestroy: function () {
                rdz.$('.rds-bar', this.el).remove();
                //adds default page's CSS
                this.setBodyCCS(window.rdz.app.content.bar.get('css_page'));
            },
            barRestore: function (parameters) {
                var bar = window.rdz.app.content.bar;

                window.rdz.$('.rds-bar').remove();

                //reset default css or css which was before bar css
                window.rdz.app.content.view.setBodyCCS(bar.get('css_page'));
                window.rdz.app.content.appended = false;

                var collections = window.rdz.app.content.parameters;

                if (bar.get('options').active) {
                    collections.remove(collections.models, {silent: true});
                    window.rdz.app.content.parameters.add(parameters);
                    window.rdz.selected = true;
                }
            },

            // request ad data from background
            getAd: function () {
                rdz.cmessenger.post({method: 'message', request: 'GET_AD_ContentRequest', url: window.rdz.url});
            },
            renderAd: function () {
                var bar = window.rdz.app.content.bar;
                if (bar.get('ad') /*&& rdz.locale.locale === 'ru'*/) {
                    var bannerEl = new window.rdz.view.buttons.Banner({model: new (rdz.Backbone.Model.extend({defaults: {name: 'banner'}}))}).el;
                    rdz.$('.rds-close').before(bannerEl);
                    rdz.cmessenger.post({
                        method: 'message',
                        request: 'UPDATE_BANNERS_STATS_ContentRequest',
                        data: {locale: rdz.locale.locale},
                        url: window.rdz.url
                    });
                }
            }
        }),
        Panel: rdz.Backbone.View.extend({
            tagName: 'div',
            className: 'rds-bar',
            render: function () {
                var parameters = new rdz.view.content.Parameter;
                this.$el.append(parameters.render().el).append(this.template());

                return this;
            },
            template: function () {
                return rdz.$('<div class="rds-bar-control"></div>');
            }
        }),
        Parameter: rdz.Backbone.View.extend({
            tagName: 'div',
            className: 'rds-bar-container',

            render: function () {
                var bar = window.rdz.app.content.bar;

                this.addHTMLBefore(bar);
                //initialize Scroll class each time when create bar
                window.rdz.app.content.scroll = new window.rdz.view.Scroll;
                //wrap in scrollbar and append parameters
                this.$el.append(window.rdz.app.content.scroll.render(window.rdz.view.content.Factory.createParameters()).el);
                this.addHTMLAfter();


                if (!bar.get('options').check_by_button) {
                    rdz.app.content.parameters.sendALLRequest();
                }
                else {
                    window.rdz.app.content.parameters.byButtonMode();
                }

                return this;
            },
            addHTMLBefore: function (bar) {
                //add elements before parameters
                var html_before = rdz.$();
                html_before.push(new window.rdz.view.buttons.Mainmenu({model: new (rdz.Backbone.Model.extend({defaults: {name: 'Mainmenu'}}))}).el);

                if (bar.get('options').check_by_button) {
                    html_before.push(new window.rdz.view.buttons.CheckByButton({model: new (rdz.Backbone.Model.extend({defaults: {name: 'check_by_button'}}))}).el);
                }

                this.$el.html(html_before);
            },
            addHTMLAfter: function () {
                var bar = window.rdz.app.content.bar;
                //add elements after parameters
                var html_after = rdz.$();
                if (bar.get('functions').SEOTags) html_after.push(new window.rdz.view.buttons.SEOTags({model: new (rdz.Backbone.Model.extend({defaults: {name: 'seo_tags'}}))}).el);
                if (bar.get('functions').EditMode) html_after.push(new window.rdz.view.buttons.EditMode({model: new (rdz.Backbone.Model.extend({defaults: {name: 'edit_mode'}}))}).el);
                if (bar.get('functions').MainPage) html_after.push(new window.rdz.view.buttons.MainPage({model: new (rdz.Backbone.Model.extend({defaults: {name: 'main_page'}}))}).el);
                if (bar.get('functions').ViewSource) html_after.push(new window.rdz.view.buttons.ViewSource({model: new (rdz.Backbone.Model.extend({defaults: {name: 'view_source'}}))}).el);
                if (bar.get('functions').DB && rdz.locale.locale === 'ru') html_after.push(new window.rdz.view.buttons.DB({model: new (rdz.Backbone.Model.extend({defaults: {name: 'db'}}))}).el);
                if (bar.get('functions').MassChecking && rdz.locale.locale === 'ru') html_after.push(new window.rdz.view.buttons.MassChecking({model: new (rdz.Backbone.Model.extend({defaults: {name: 'mass_checking'}}))}).el);
                if (bar.get('functions').DisableHighlighting) html_after.push(new window.rdz.view.buttons.DisableHighlighting({model: new (rdz.Backbone.Model.extend({defaults: {name: 'disable_highlighting'}}))}).el);
                if (bar.get('functions').Options) html_after.push(new window.rdz.view.buttons.Options({model: new (rdz.Backbone.Model.extend({defaults: {name: 'options'}}))}).el);
                if (bar.get('functions').Trash) html_after.push(new window.rdz.view.buttons.Trash({model: new (rdz.Backbone.Model.extend({defaults: {name: 'trash'}}))}).el);
                if (bar.get('functions').Services && rdz.locale.locale === 'ru') html_after.push(new window.rdz.view.buttons.Services({model: new (rdz.Backbone.Model.extend({defaults: {name: 'Services'}}))}).el);
                html_after.push(new window.rdz.view.buttons.Close({model: new (rdz.Backbone.Model.extend({defaults: {name: 'close'}}))}).el);

                this.$el.append(html_after);

            }
        })
    }
};

/** @class Scroll show scrolling when window smaller then bar*/
window.rdz.view.Scroll = rdz.Backbone.View.extend({
    tagName: 'div',
    className: 'rds-scroll',
    events: {
        'mouseenter .rds-scroll-l': 'toggle_left',
        'mouseleave .rds-scroll-l': 'stop_toggle',
        'mouseenter .rds-scroll-r': 'toggle_right',
        'mouseleave .rds-scroll-r': 'stop_toggle'
    },
    template: function (parameters) {
        this.$el.html(rdz.$('<div/>', {class: 'rds-scroll-cnt'}).append(rdz.$('<div/>', {class: 'rds-scroll-params'}).append(parameters)));
        this.$el.append('<div class="rds-scroll-l"/><div class="rds-scroll-r"/>');
    },
    render: function (data) {
        this.template(data);
        this.$cnt = this.$el.children('.rds-scroll-cnt');
        this.$params = this.$el.find('.rds-scroll-params');
        return this;
    },
    show: function (win_size, bar_size) {
        this.$el.addClass('rds-scrolling');
        this.$cnt.css({width: this.width() - (bar_size[0] - win_size[0]) - 24}); //24 margin .rds-scroll-cnt

        this.$params.css({left: this.position()});

        this.update();
    },
    hide: function () {
        this.$el.removeClass('rds-scrolling');
        this.$cnt.css({width: 'auto'});
        this.$params.css({left: 0});
        this.reset();
    },
    width: function () {
        return this.$params.outerWidth() + parseInt(this.$cnt.css('marginLeft').replace('px', '')) * 2;
    },
    position: function () {
        return parseInt(this.$params.css('left').replace('px', ''));
    },
    update: function () {
        var pos = this.position();
        if (pos >= 0) {
            this.$el.addClass('rds-scroll-l-hide');
        }
        else if (pos <= 0 - (this.width() - this.$el.outerWidth())) {
            this.$el.addClass('rds-scroll-r-hide');
        }
        else {
            this.reset();
        }
    },
    reset: function () {
        this.$el.removeClass('rds-scroll-l-hide');
        this.$el.removeClass('rds-scroll-r-hide');
    },
    toggle_right: function () {
        rdz.app.content.contextmenu.close();

        var self = rdz.app.content.scroll,
            pos = self.position();

        if (pos > 0 - (self.width() - self.$el.outerWidth())) {
            self.$params.css({left: pos - 2});
            self.update();
            self.toggle = setTimeout(self.toggle_right, 15);
        }

    },
    toggle_left: function () {
        rdz.app.content.contextmenu.close();

        var self = rdz.app.content.scroll,
            pos = self.position();

        if (pos < 0) {
            self.$params.css({left: pos + 2});
            self.update();
            self.toggle = setTimeout(self.toggle_left, 15);
        }

    },
    stop_toggle: function () {
        clearTimeout(this.toggle);
    }
});

/** @namespace for buttons*/
window.rdz.view.buttons = {};

/**@class Superclass for all buttons*/
window.rdz.view.buttons.Button = rdz.Backbone.View.extend({
    tagName: 'div',
    className: 'rds-cnt',
    events: {
        "click .rds-prm": "before_clicked",
        'mouseleave': 'hover',
        'mouseenter': 'hover'
    },
    initialize: function () {
        this.render();
    },
    render: function () {
        var template = this.template(this.model);
        this.$el.append(template);
    },
    template: function (model) {
        var html = rdz.$('<div class="rds-prm"></div>');
        this.$el.addClass('rds-' + model.get('name'));
        return html;
    },
    before_clicked: function () {
        if (!rdz.app.content.bar.get('button_pressed_recently')) {
            this.clicked();
            rdz.app.content.bar.set({button_pressed_recently: true});
        }
        rdz.app.content.bar.pressed_recently_timer();
    },

    clicked: function () {
        console.log("logic for " + this.model.get('name') + " button wasn't defined");
    },
    /*hover methods*/
    hover: function (event) {
        switch (event.type) {
            case "mouseenter":
                window.rdz.app.content.tooltip.open(this.getTooltipData(), event);
                break;
            case "mouseleave":
                window.rdz.app.content.tooltip.close();
                break;
        }
    },
    getTooltipData: function () {
        return rdz.locale.bar.buttons[this.model.get('name')];
    }
});
window.rdz.view.buttons.Mainmenu = window.rdz.view.buttons.Button.extend({
    initialize: function () {
        var bar_options = rdz.app.content.bar;
        bar_options.off('change:logged', this.icon_status, this);
        bar_options.on('change:logged', this.icon_status, this);
        this.render();
        this.icon_status();
    },
    clicked: function () {
        rdz.app.content.contextmenu.open(this.model, this.$el);
    },
    icon_status: function () {
        // logged ? this.$el.addClass('rds-logged') : this.$el.removeClass('rds-logged');

        let iconsURL = chrome.extension.getURL('icons/logo/'),
            date = new Date(),
            now = {
                day: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear()
            };

        let holiday = "";
        // TODO: add pref for holiday view
        if ((now.month === 11 && now.day > 15) || (now.month === 0 && now.day < 15)) {
            holiday = "ny";
        } else if (now.month === 1 && now.day === 16) {
            holiday = "birthday_";
        } else if (now.month === 5 && now.day === 1) {
            holiday = "children_";
        } else if (rdz.locale.locale === "ru") {
            // if (now.month === 1 && now.day === 23) {
            //     holiday = "23feb_";
            // } else
            if (now.month === 2 && now.day === 8) {
                holiday = "8march_";
            }
            // else if (now.month === 4 && now.day > 6 && now.day < 10) {
            //     holiday = "9may_";
            // }
        }

        if (rdz.app.content.bar.get('logged')) {
            this.$el.children('.rds-prm').css('background', `url("${iconsURL + holiday}logo.png") no-repeat`);
            this.$el.addClass('rds-logged');
        } else {
            this.$el.children('.rds-prm').css('background', `url("${iconsURL + holiday}greylogo.png") no-repeat`);
            this.$el.removeClass('rds-logged');
        }
    }
});
window.rdz.view.buttons.CheckByButton = window.rdz.view.buttons.Button.extend({
    clicked: function () {
        rdz.app.content.bar.set({cache_cleared: false});
        rdz.app.content.parameters.sendALLRequest();
    }
});
window.rdz.view.buttons.SEOTags = window.rdz.view.buttons.Button.extend({
    clicked: function () {
        var bar = rdz.app.content.bar;
        rdz.utils.clickSEOTags(bar);
    }
});
window.rdz.view.buttons.EditMode = window.rdz.view.buttons.Button.extend({
    clicked: function () {
        rdz.utils.toggleEditMode();
    }
});
window.rdz.view.buttons.MainPage = window.rdz.view.buttons.Button.extend({
    initialize: function () {
        this.render();
        this.icon_status();
    },
    clicked: function () {
        rdz.cmessenger.post({method: 'message', request: 'MainPage_PAGE_ContentRequest', url: window.rdz.url});
    },
    icon_status: function () {
        var isMainPage = rdz.utils.isMainPage(window.rdz.url);
        isMainPage ?
            this.$el.addClass('rds-home_page') :
            this.$el.removeClass('rds-home_page');
    }
});
window.rdz.view.buttons.ViewSource = window.rdz.view.buttons.Button.extend({
    clicked: function () {
        rdz.cmessenger.post({method: 'message', request: 'ViewSource_PAGE_ContentRequest', url: window.rdz.url});
    }
});
window.rdz.view.buttons.DB = window.rdz.view.buttons.Button.extend({
    clicked: function () {
        rdz.cmessenger.post({method: 'message', request: 'DB_PAGE_ContentRequest'});
    }
});
window.rdz.view.buttons.MassChecking = window.rdz.view.buttons.Button.extend({
    template: function (model) {
        var html = rdz.$('<div class="rds-prm"></div>');
        html.append('<a/>').text(rdz.locale.bar.buttons[this.model.get('name')]);
        this.$el.addClass('rds-' + model.get('name'));
        return html;
    },
    clicked: function () {
        rdz.cmessenger.post({method: 'message', request: 'DB_PAGE_ContentRequest_MassChecking'});
    },
    getTooltipData: function () {
        return rdz.locale.options.parameters['MassChecking'].ttl;
    }
});
window.rdz.view.buttons.DisableHighlighting = window.rdz.view.buttons.Button.extend({
    initialize: function () {
        this.render();
        this.icon_status();
    },
    clicked: function () {
        //rdz.cmessenger.post({method: 'message', request: 'DISABLE_HIGHLIGHTING_ContentRequest'});
        //document.location.reload();
        this.$el.toggleClass('highlight');
        toggleHighlighting();
    },
    icon_status: function () {
        rdz.app.content.bar.get('options').highlight_pages ?
            this.$el.addClass('highlight') :
            this.$el.removeClass('highlight');
    }
});
window.rdz.view.buttons.Options = window.rdz.view.buttons.Button.extend({
    clicked: function () {
        rdz.cmessenger.post({method: 'message', request: 'OPTION_PAGE_ContentRequest'});
    }
});
window.rdz.view.buttons.Trash = window.rdz.view.buttons.Button.extend({
    clicked: function () {
        window.rdz.app.content.bar.set({cache_cleared: true});
        rdz.cmessenger.post({method: 'message', request: 'CLEAR_CACHE_ContentRequest', url: window.rdz.url});
    }
});
window.rdz.view.buttons.Services = window.rdz.view.buttons.Button.extend({
    clicked: function () {
        rdz.app.content.contextmenu.open(this.model, this.$el);
    }
});
window.rdz.view.buttons.Banner = window.rdz.view.buttons.Button.extend({
    template: function (model) {
        var html = rdz.$('<div class="rds-prm"></div>'),
            bar = rdz.app.content.bar,
            currBanner = bar.get('ad').currBanner,
            bannerURL = currBanner.data_url;

        html.append('<img width="300" height="20" src="' + bannerURL + '"></img>');
        this.$el.addClass('rds-' + model.get('name'));
        this.$el.data('banner_url', currBanner.url);
        return html;
    },
    clicked: function () {
        var bar = rdz.app.content.bar,
            currBanner = bar.get('ad').currBanner,
            domain = rdz.utils.domainFromUri(rdz.url).domain,
            bannerURL = this.$el.data('banner_url').replace(/curr_domain/, domain);

        rdz.cmessenger.post({method: 'message', request: 'OPEN_PAGE_ContentRequest', url: bannerURL});
        rdz.cmessenger.post({
            method: 'message',
            request: 'UPDATE_BANNERS_STATS_ContentRequest',
            data: {locale: rdz.locale.locale, banner: currBanner},
            url: window.rdz.url
        });
    },
    hover: function (event) {
    } // don't show tooltip
});
window.rdz.view.buttons.Close = window.rdz.view.buttons.Button.extend({
    clicked: function () {
        rdz.cmessenger.post({method: 'message', request: 'CLOSE_BAR_ContentRequest'});
    }
});

/** @class Notification represents a notification which is used by something like Metatags */
window.rdz.view.Notification = rdz.Backbone.View.extend({
    tagName: 'div1',

    className: 'rds-bar-notification',

    render: function () {
        this.$el.append(this.template());
        return this;
    },

    template: function () {
        var html = rdz.$('<div1 class="rds-bar-notification-container">' +
        '</div1>');
        html.append(new window.rdz.view.NotificationClose({
            model: new (rdz.Backbone.Model.extend({
                defaults: {name: 'notification-close'}
            }))
        }).el);
        html.append(new window.rdz.view.NotificationLogo({
            model: new (rdz.Backbone.Model.extend({
                defaults: {name: 'notification-logo'}
            }))
        }).el);
        html.append(new window.rdz.view.NotificationContent({
            model: new (rdz.Backbone.Model.extend({
                defaults: {name: 'notification-content', data: this.model.get('data')}
            }))
        }).el);
        //html.append(new window.rdz.view.NotificationClose({
        //  model: new (rdz.Backbone.Model.extend({
        //               defaults:{name:'notification-close'}
        //         }))
        //}).el);
        return html;
    }
});

window.rdz.view.NotificationLogo = window.rdz.view.buttons.Button.extend({
    tagName: 'div1',
    clicked: function () {
    }
});

window.rdz.view.NotificationContent = window.rdz.view.buttons.Button.extend({
    tagName: 'div1',
    events: {
        "click .rds-notification-options": "clicked",
    },
    template: function (model) {
        var html = rdz.$('<div1 class="rds-prm"></div1>');
        html.append(model.get('data'));
        this.$el.addClass('rds-' + model.get('name'));
        return html;
    },
    clicked: function (e) {
        var hash = e.currentTarget.classList[1];
        rdz.cmessenger.post({method: 'message', request: 'OPTION_PAGE_ContentRequest', hash: hash});
    }
});

window.rdz.view.NotificationClose = window.rdz.view.buttons.Button.extend({
    tagName: 'div1',
    clicked: function () {
        var notification = this.$el.parent().parent();
        if (notification.hasClass('seo_tags')) {
            rdz.$('.rds-seo_tags').removeClass('checked');
            rdz.cmessenger.post({
                method: 'message',
                request: 'SEOTAGS_CHECKED_ContentResponse',
                checked: false
            });
        } else if (notification.hasClass('updates')) {
            rdz.cmessenger.post({
                method: 'message',
                request: 'UPDATES_CLOSED_ContentResponse',
                updates: rdz.$('.rds-bar-notification.updates').data('updates')
            });
        } else if (notification.hasClass('rds_notification')) {
            rdz.cmessenger.post({
                method: 'message',
                request: 'RDS_NOTICATION_CLOSED_ContentResponse',
                data: rdz.$('.rds-bar-notification.rds_notification').data('data')
            });
        }
        notification.remove(); //rdz.$('.rds-bar-notification').remove();
    }
});

/** @namespace content script parameters*/
window.rdz.view.bar = {};
/**@class Parent class for all parameters on content script
 *
 * @property {Function} showRate shows gradation scale in html (line by left side from parameter)
 * @property {Function} returnValueForRate gets value from model and returns it in acceptable format to returnRateValue
 * @property {Function} returnRateValue defines scale for given value and returns appropriate number for CSS (0-none,100-100% visible)
 * @property {Function} returnRateColor sets color for gradation scale
 * @property {Function} hover shows and hides tooltip
 * @property {Function} getTooltipData collects data for tooltip (rewritable for each parameter)
 */
window.rdz.view.bar.Parameter = {
    events: {
        'mouseleave': 'hover',
        'mouseenter': 'hover',
        'click': 'click'
    },
    initialize: function () {
        this.model.on("change:value", this.valueChanged, this);
    },
    /*rate methods*/
    showRate: function () {
        var val = this.returnValueForRate();
        typeof val === "number" || val === null ?
            this.$el.find('.rds-rate ins').css({
                height: this.returnRateValue(val) + "%",
                backgroundColor: this.returnRateColor()
            }) :
            console.log("value from parameter " + this.model.get('name') + " is not number to be assigned to the rate scale");

    },
    returnValueForRate: function () {
        return this.model.get('value');
    },
    returnRateValue: function (value) {
        return value === null ? 0 :
            0 < value && value < 51 ? 25 :
                51 <= value && value < 501 ? 50 :
                    501 <= value && value < 5001 ? 75 :
                        5001 <= value ? 100 : 0;
    },
    returnRateColor: function () {
        return "#ffcc00";
    },

    /*tooltip methods*/
    hover: function (event) {
        switch (event.type) {
            case "mouseenter":
                this.hover_mouse_move(event);
                break;
            case "mouseleave":
                window.rdz.app.content.tooltip.close();
                break;
        }
    },
    hover_mouse_move: function (event) {
        window.rdz.app.content.tooltip.open(this.getTooltipData(), event);
    },
    getTooltipData: function () {
        var name = this.model.get('name'),
            value = this.validateTooltipData();

        return value === -7 ? rdz.locale.bar.tooltips.author : (rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl);
    },
    validateTooltipData: function () {
        return this.model.get('value');
    },
    /*contextmenu methods*/
    click: function (event) {
        if (this.setHref() === false) {
            if (!rdz.app.content.bar.get('button_pressed_recently')) {
                this.getContextmenuData(this.$el);
                rdz.app.content.bar.set({button_pressed_recently: true});
            }
            rdz.app.content.bar.pressed_recently_timer();

        }
    },
    getContextmenuData: function (el) {

        rdz.app.content.contextmenu.open(this.model, el);
    }
};


window.rdz.view.bar.IY = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    setHref: function () {
        return false;
    }
};


window.rdz.view.bar.IYD = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return ((value === null) || (value <= 0)) ? 0 : 100;
    },
    returnRateValue: function (value) {
        return value;
    }
};


window.rdz.view.bar.IYP = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');

        return value && (rdz._.isObject(value.IYP) || value.IYP === true || value.IYPCache > 0) ? 100 : 0;
    },
    returnRateValue: function (value) {
        return value;
    },
    setHref: function () {
        return false;
    },
    validateTooltipData: function () {
        var v = this.model.get('value');
        return v && v.IYP;
    }
};

window.rdz.view.bar.IYDP = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return ((value === null) || (value <= 0)) ? 0 : 100;
    },
    returnRateValue: function (value) {
        return value;
    }
};

window.rdz.view.bar.YaBar = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return !value || value.TYC <= 0 ? 0 : value.TYC;
    }
};

window.rdz.view.bar.YT = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return ((value === null) || (value == false)) ? 0 : 100 * 100;
    }
};

window.rdz.view.bar.YR = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return ((value === null) || (value == false)) ? 0 : 100 * 100;
    }
};

window.rdz.view.bar.Subdomains = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return !value ? 0 : 10000;
    },
    setHref: function () {
        return false;
    }
};

window.rdz.view.bar.IG = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    // returnValueForRate: function () {
    //     var value = this.model.get('value');
    //     return value ? value.IG : 0;
    // },
    returnRateColor: function () {
        return "#89e4c3";
    },
    validateTooltipData: function () {
        var v = this.model.get('value');
        return v && v.IG;
    },
    getTooltipData: function () {
        var name = this.model.get('name'),
            value = this.validateTooltipData(),
            dz = this.model.get('extra').domain_zone;

        return value === -7 ? rdz.locale.bar.tooltips.author : (
        (rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl) + "(" + dz.active + ")");
    },
};

window.rdz.view.bar.IGP = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        //Number(value.IGP) if value was returned from API or if value was boolean
        return value && (rdz._.isObject(value.IGP) || Number(value.IGP) > 0 || value.IGPCache > 0) ? 5002 : 0;
    },
    returnRateColor: function () {
        return "#89e4c3";
    },
    validateTooltipData: function () {
        var v = this.model.get('value');
        return v && v.IGP;
    }
};


window.rdz.view.bar.SQI = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value || 0;
    }
};


window.rdz.view.bar.TYC = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showYaCatalog();
        this.showRate();
    },
    showYaCatalog: function () {
        var value = this.model.get('value');
        if (value && value.TYC && value.TYC.YaCatalog) {
            this.$el.find('.rds-prm').addClass('rds-bold');
        }
        else {
            this.$el.find('.rds-prm').removeClass('rds-bold');
        }

    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value && value.TYC && typeof value.TYC.TYC === "number" ? value.TYC.TYC : 0;
    },

    getTooltipData: function () {
        var tooltip = rdz.$('<div></div>');
        tooltip.append(rdz.$('<div></div>').append(rdz.locale.bar.parameters.tooltips.TYC).addClass('rds-bold rdz-tooltip-TYC-ttl'));

        var value = this.model.get('value');
        if (value && value.YaBar && value.TYC) {
            tooltip = this.getTooltipTYCData(tooltip, value.TYC, value.MirrorsCount);
            tooltip = this.getTooltipYaBarData(tooltip, value.YaBar);
        }
        else if (value && value.TYC) {
            tooltip = this.getTooltipTYCData(tooltip, value.TYC, value.MirrorsCount);
        }

        return tooltip;
    },
    getTooltipTYCData: function (tooltip, value, mirrors_count) {
        if (value.TYC === rdz.errors.AGS) tooltip.append(rdz.$('<div class="rdz-tooltip-TYC-description"></div>').append('Сайт находится под фильтром поисковой системы «Яндекс» АГС-40'));
        if (value.title) tooltip.append(rdz.$('<div></div>').append(value.title).addClass('rds-bold'));
        if (value.description) tooltip.append(rdz.$('<div class="rdz-tooltip-TYC-description"></div>').append(value.description));
        if (value.YaCatalog) tooltip.append(this.returnTooltipCol('Категория:', value.YaCatalog));
        if (value.glued_with) tooltip.append(this.returnTooltipCol('Склеен с', value.glued_with));
        if (value.main_mirror) tooltip.append(this.returnTooltipCol('Главное зеркало:', value.main_mirror));
        if (mirrors_count > 0) tooltip.append(this.returnTooltipCol('Доп. зеркала:', 'Найдено ' + mirrors_count + ' ' + rdz.utils.endings(mirrors_count, rdz.locale.mirrors)));
        return tooltip;
    },
    getTooltipYaBarData: function (tooltip, value) {

        if (value.topic) tooltip.append(this.returnTooltipCol('Темы:', value.topic));
        if (value.region) tooltip.append(this.returnTooltipCol('Регион:', value.region));
        if (value.source) tooltip.append(this.returnTooltipCol('Источник:', value.source));
        if (value.sector) tooltip.append(this.returnTooltipCol('Сектор:', value.sector));
        return tooltip;
    },
    returnTooltipCol: function (title, value) {
        return rdz.$('<div class="rdz-tooltip-TYC-cnt"></div>').append(rdz.$('<div class="rdz-tooltip-TYC-col1"></div>').append(title)).append(rdz.$('<div class="rdz-tooltip-TYC-col2"></div>').append(value));
    },
    setHref: function () {
        return false;
    }
};

/*
 window.rdz.view.bar.YaBar = {
 template:function () {
 return null;
 }
 };*/

window.rdz.view.bar.PR = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});

        this.showDmoz();
        this.showRate();
    },
    showDmoz: function () {
        if (this.model.get('Dmoz')) {

            if (this.model.get('value') === null) {
                this.$el.find('.rds-prm').removeClass('rds-bold');
            }
            else {
                this.$el.find('.rds-prm').addClass('rds-bold');
            }

        }
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value === null ? 0 : this.model.get('value').PR;
    },
    returnRateValue: function (value) {
        return 0 < value ? Number(value + "0", 10) : 0;
    },
    returnRateColor: function () {
        return "#229ce1";
    },
    setHref: function () {
        return false;
    },
    getTooltipData: function () {
        var name = this.model.get('name'),
            value = this.validateTooltipData(),
            title = [rdz.locale.bar.parameters.PR.ttl, rdz.locale.bar.parameters.PR.ttl2];
        if (this.validateTooltipData('PRg') === -7 || this.validateTooltipData('PRgMain') === -7)  title.push(rdz.$('<div/>', {
            class: 'rds-red',
            text: rdz.locale.bar.tooltips.PR_author
        })[0]);
        if (this.validateTooltipData('PRg') === -3 || this.validateTooltipData('PRgMain') === -3)  title.push(rdz.$('<div/>', {
            class: 'rds-red',
            text: rdz.locale.bar.tooltips.PR_captcha
        })[0]);
        return title;
    },
    validateTooltipData: function (prop) {
        var v = this.model.get('value');
        return v && v[prop];
    }
};


window.rdz.view.bar.Dmoz = {
    /*template: function (model) {
        return null;
    },*/
    showResult: function () {
      this.setHref('.rds-value');
      var value = this.checkError(this.model.get('value'));
      this.$el.find('.rds-value').html(value === "?" || typeof this.model.get('value') === 'number' ? value : (value ? rdz.locale.yes : rdz.locale.no));
      this.showCached();
      
        /*this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
        var PR = window.rdz.app.content.parameters.get('PR');
        if (PR) {
            PR.set({Dmoz: this.model.get('value')}, {silent: true});

            //if PR displayed value before
            if (PR.get('value') !== null) {
                PR.trigger('change:value')
            }
        }*/
    }
};


window.rdz.view.bar.WA = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    }
};


window.rdz.view.bar.MozRank = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value === null ? 0 : (+value.MozRankCache.linkp) * 10;
    },
    returnRateColor: function () {
        return "#229ce1";
    }
};

window.rdz.view.bar.SeoM = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value === null ? 0 : +value.page;
    },
    returnRateColor: function () {
        return "#229ce1";
    }
};

window.rdz.view.bar.Age = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return !value ? 0 : 10000;
    },
    setHref: function () {
        return false;
    }
};

window.rdz.view.bar.Majestic = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {

        var value = this.model.get('value');
        return value === null ? 0 : value.urlrefd;
    },
    returnRateColor: function () {
        return "#229ce1";
    },
    hover_mouse_move: function () {
        window.rdz.app.content.tooltip.open(this.getTooltipData(), event, {'max-width': 600});
    },
    getTooltipData: function () {
        var value = this.model.get("value"),
            name = this.model.get("name"),
            data;

        if (value && value.urlrefd > 0) {
            data = rdz.$('<div/>').append(rdz.locale.bar.tooltips.Majestic).append(rdz.$('<img/>', {src: "http://www.majesticseo.com/charts/referring-domains-discovery-chart?w=600&h=100&IndexDataSource=F&d=" + rdz.url}));
        }
        else {
            data = rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl;
        }

        return data;
    }
};

window.rdz.view.bar.CF = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value === null ? 0 : value.Majestic.urlcf;
    },
    returnRateColor: function () {
        return "#229ce1";
    },

    getTooltipData: function () {
        var value = this.model.get("value"),
            name = this.model.get("name"),
            data;

        if (value && value.Majestic && value.Majestic.urlcf > 0) {
            data = rdz.$('<img/>', {src: "http://www.majesticseo.com/charts/linkprofile/2/?threshold=&target=" + rdz.utils.domainFromUri(rdz.url).domain + "&datatype=0&IndexDataSource=F"});
        }
        else {
            data = rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl;
        }

        return data;
    }
};


window.rdz.view.bar.TF = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value === null ? 0 : value.Majestic.urltf;
    },
    returnRateColor: function () {
        return "#229ce1";
    },
    getTooltipData: function () {
        var value = this.model.get("value"),
            name = this.model.get("name"),
            data;

        if (value && value.Majestic && value.Majestic.urltf > 0) {
            data = rdz.$('<img/>', {src: "http://www.majesticseo.com/charts/linkprofile/2/?threshold=&target=" + rdz.utils.domainFromUri(rdz.url).domain + "&datatype=0&IndexDataSource=F"});
        }
        else {
            data = rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl;
        }

        return data;
    }

};

//window.rdz.view.bar.Ahrefs = {
//    showResult: function() {
//        this.callParentMethod({method:'showResult', object: this});
//        this.showRate();
//    },
//    
//    returnValueForRate:function () {
//        var value = this.model.get('value');
//        return value === null ? 0 : value.Ahrefs.referring_domains;
//    },
//    
//    // override to change image max-width
//    hover_mouse_move: function() {
//        window.rdz.app.content.tooltip.open(this.getTooltipData(),event, {'max-width':600});
//    },
//    
//    getTooltipData: function() {
//        var value = this.model.get("value"),
//            name = this.model.get("name"),
//            data;
//        
//        if (value && value.AhrefsGraph && value.AhrefsGraph.img_url) {
//           data = rdz.$('<img/>', {src: value.AhrefsGraph.img_url});
//        } else {
//            data = rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl
//        }
//
//        return data;
//    }
//};

window.rdz.view.bar.AhrefsTB = {
    className: 'rds-cnt rds-icons',
    showResult: function () {
        var v = this.model.get('value'),
            extra = this.model.get('extra'),
            requests = this.model.get('requests');

        // for (let param in extra) {
        //     let elem = this.$el.find('.rds-sw-' + param + ' .rds-sw-value');
        //     if (values[param] === '?') elem.html(values[param]);
        // }

        this.$el.find('.rds-ahrefs-Page').css('display', extra.Page.active ? 'inline-block' : 'none');
        if (extra.Page.active) {
            let elem = this.$el.find('.rds-ahrefs-Page');
            ['ar', 'bl', 'rd'].forEach(prop => {
                this.setHref('.rds-value_' + prop, requests.displayUrl);
                let val = this.checkError(v && v.Page ? v.Page[prop] : v);
                elem.find('.rds-value_' + prop).html(this.formatValue(val));
            });
        }

        this.$el.find('.rds-ahrefs-Domain').css('display', extra.Domain.active ? 'inline-block' : 'none');
        if (extra.Domain.active) {
            let elem = this.$el.find('.rds-ahrefs-Domain');
            ['dr', 'bl', 'rd'].forEach(prop => {
                this.setHref('.rds-value_' + prop, requests.displayUrl);
                let val = this.checkError(v && v.Domain ? v.Domain[prop] : v);
                elem.find('.rds-value_' + prop).html(this.formatValue(val));
            });
        }

        this.showCached({ name: 'AhrefsTB', 'class': 'rds-italic_Ahrefs' });
    }
};

window.rdz.view.bar.AhrefsPage = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },

    returnValueForRate: function () {
        var value = this.model.get('value');
        return value && value.AhrefsPage ? 100 : 0;
    },

    returnRateValue: function (value) {
        return value;
    }
};

window.rdz.view.bar.AhrefsDomain = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },

    returnValueForRate: function () {
        var value = this.model.get('value');
        return value && value.AhrefsDomain ? 100 : 0;
    },

    returnRateValue: function (value) {
        return value;
    }
};

window.rdz.view.bar.SemRush = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value === null ? 0 : value.rank;
    }
};


window.rdz.view.bar.BackG = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnRateColor: function () {
        return "#89e4c3";
    }
};


window.rdz.view.bar.BackBing = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    }
};


window.rdz.view.bar.IBing = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnRateColor: function () {
        return "#229ce1";
    }
};

window.rdz.view.bar.BI = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value === null ? 0 : +value;
    }

};
window.rdz.view.bar.Alexa = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value === null ? 0 : +value.value;
    }
};
window.rdz.view.bar.BackA = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    }
};


window.rdz.view.bar.BY = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    }
};


window.rdz.view.bar.YaBlogs = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value === null ? 0 : value.authority;
    }
};

window.rdz.view.bar.Pictures = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value === null ? 0 : Math.round(value.PicturesYa ? (value.Pictures + value.PicturesYa/*+value.PicturesAol*/) / 2 : (value.Pictures/*+value.PicturesAol*/) / 1);
    },
    returnRateColor: function () {
        return "#229ce1";
    }
};

window.rdz.view.bar.Aggregators = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showRate();
    },
    returnValueForRate: function () {
        var value = this.model.get('value');
        return value === null ? 0 : 100 * Math.round(value.AggregatorsYandex.value +
        value.AggregatorsGoogle.value +
        value.AggregatorsBing.value /*+
        value.AggregatorsNovoteka.value*/) / 3;
    },
    returnRateValue: function (value) {
        return value === null ? 0 : value;
    },
    returnRateColor: function () {
        return "#229ce1";
    },
    hover_mouse_move: function () {
        window.rdz.app.content.tooltip.open(this.getTooltipData(event.target), event);
    },
    getTooltipData: function (target) {
        var value = this.model.get("value"),
            name = this.model.get("name"),
            data = rdz.$("<div class='rds-aggregators-ya_news'></div>"),
            yandexNews = value && value.AggregatorsYandexNews ? value.AggregatorsYandexNews : null;

        if (rdz.$(target).hasClass('rds-value_Ya')) {
            if (yandexNews) {

                data.append(rdz.$('<div/>', {
                    class: 'rds-bold',
                    html: yandexNews.domain + rdz.locale.bar.tooltips.Aggregators.yandex.tooltip_domain
                })[0]);
                data.append(rdz.$('<div/>', {text: yandexNews.text})[0]);
                data.append(rdz.$('<div/>', {class: 'rds-bold', text: yandexNews.manager})[0]);
                data.append(rdz.$('<div/>', {text: yandexNews.address})[0]);
                data.append(rdz.$('<div/>', {class: 'rds-aggregators-ya_news-tel', text: yandexNews.tel})[0]);
                data.append(yandexNews.email ? rdz.$('<div/>', {
                    class: 'rds-aggregators-ya_news-email',
                    text: yandexNews.email
                })[0] : '');

            } else if (value && value.AggregatorsYandex && value.AggregatorsYandex.yandexNewsLink) { // Y.News haven't been received but there is the link
                data.append(rdz.$('<div class="rds-aggregators-preload"><span class="rds-preload-16x16"></span></div>'));
                this.model.sendMessage({
                    url: window.rdz.url,
                    request: 'PARAMETER_ContentRequest',
                    yandexNewsLink: value.AggregatorsYandex.yandexNewsLink
                });
            } else {
                data = rdz.locale.bar.tooltips.Aggregators.yandex.ttl;
            }
        } else if (rdz.$(target).hasClass('rds-value_Go')) {
            data = rdz.locale.bar.tooltips.Aggregators.google;
        } else if (rdz.$(target).hasClass('rds-value_No')) {
            data = rdz.locale.bar.tooltips.Aggregators.novoteka;
        } else {
            data = rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl;
        }

        return data;
    }
};

window.rdz.view.bar.SimilarWeb = {
    className: 'rds-cnt rds-icons',
    showResult: function () {
        var v = this.model.get('value'),
            extra = this.model.get('extra'),
            values = {},
            requests = this.model.get('requests'),
            iconsURL = chrome.extension.getURL('icons/');

        ['MonthlyVisits', 'Visits', 'TimeOnSite', 'PagePerVisit',
            'BounceRate', 'CountryShares', 'Sources'
            //'Referrals', 'Referring', 'Destinations', 'OrganicKeywords'
        ].forEach(val => values[val] = this.checkError(v ? v[val] : v));

        let addTooltip = function (elem, ttp) {
            elem[0].addEventListener('mouseenter', (event) => window.rdz.app.content.tooltip.open(ttp, event));
            elem[0].addEventListener('mouseleave', () => window.rdz.app.content.tooltip.close());
        };

        for (let param in extra) {
            this.$el.find('.rds-sw-' + param).css('display', extra[param].active ? (param === 'Referrals' ? 'inline-block' : 'inline-block') : 'none');
            let elem = this.$el.find('.rds-sw-' + param + ' .rds-sw-value');

            elem.parent('a').prop('href', requests.displayUrl);

            if (values[param] === '?') {
                elem.html(values[param]);
            } else if (param === 'Visits') {
                elem.html(this.formatValue(values[param]));

                addTooltip(this.$el.find('.rds-sw-' + param), rdz.$(`<div>
                    <img src="${values.MonthlyVisits}" />
                </div>`));
            } else if (param === 'TimeOnSite') {
                let seconds = values[param] % 60,
                    minutes = (values[param] - seconds) / 60;

                elem.html((minutes > 9 ? '' : '0') + minutes + ':' + (seconds > 9 ? '' : '0') + seconds);
                if (!minutes && seconds < 40) elem.css('color', 'red');
            } else if (param === 'PagePerVisit') {
                elem.html(values[param]);
                if (values[param] < 1.2) elem.css('color', 'red');
            } else if (param === 'BounceRate') {
                elem.html(values[param] + '%');
                if (values[param] > 80) elem.css('color', 'red');
            } else if (param === 'CountryShares') {
                elem.html(rdz.$(
                    values.CountryShares.filter(x => x.Value > 9.99).slice(0, 2).map(country => `<div>
                        <img src="${iconsURL + 'sw_flags/' + window.rdz.utils.Countries[country.Country].iso2 + '.png'}" />
                        <span>${country.Value.toFixed(2) + '%'}</span>
                    </div>`).join('')
                ));

                addTooltip(this.$el.find('.rds-sw-' + param), rdz.$(`<div class="swt-box">
                    ${values.CountryShares.map(country => 
                        `<img class="swt-img" src="${iconsURL + 'sw_flags/' + window.rdz.utils.Countries[country.Country].iso2 + '.png'}" />
                        <span class="swt-val">${country.Value.toFixed(2) + '%'}</span>
                        <span>${window.rdz.utils.Countries[country.Country].name}</span>`
                    ).join('')}
                </div>`));
            } else if (param === 'Sources') {
                let getName = function (key) {
                    return key === 'Links' ? 'Links(Referrals)' :
                        key === 'Paid Referrals' ? 'Display Advertising' :
                        key;
                };
                let getSrc = function (key) {
                    return key === 'Links' ? 'referrals' :
                        key === 'Paid Referrals' ? 'display' :
                        key.toLowerCase();
                };

                elem.html(rdz.$(
                    Object.keys(values.Sources).filter(key => values.Sources[key] > 9.99).slice(0, 2).map(key => `<div>
                        <img src="${iconsURL + 'sw_sources/src-' + getSrc(key) + '.png'}" />
                        <span>${values.Sources[key].toFixed(2) + '%'}</span>
                    </div>`).join('')
                ));

                addTooltip(this.$el.find('.rds-sw-' + param), rdz.$(`<div class="swt-box">
                    ${Object.keys(values.Sources).map(key => 
                        `<img class="swt-img" src="${iconsURL + 'sw_sources/src-' + getSrc(key) + '.png'}" />
                        <span class="swt-val">${values.Sources[key].toFixed(2) + '%'}</span>
                        <span>${getName(key)}</span>`
                    ).join('')}
                </div>`));
            } else if (param === 'Referrals') {
                // TopReferring
                if (values.Referring) {
                    let elemR = this.$el.find('.rds-sw-Referring .rds-sw-value');
                    let text = values.Referring.split(', '),
                        res = text.slice(0, 3).join(', ');

                    elemR.text(res.length > 30 ? res.substr(0, 30) + '...' : res);

                    addTooltip(this.$el.find('.rds-sw-Referring'), rdz.$(`<div style="display: grid;">
                            ${text.map(t => `<a href="http://${t}/">${t}</a>`).join('')}
                    </div>`));
                }

                // TopDestinations
                if (values.Destinations) {
                    let elemD = this.$el.find('.rds-sw-Destinations .rds-sw-value');
                    let text = values.Destinations.split(', '),
                        res = text.slice(0, 3).join(', ');

                    elemD.text(res.length > 30 ? res.substr(0, 30) + '...' : res);

                    addTooltip(this.$el.find('.rds-sw-Destinations'), rdz.$(`<div style="display: grid;">
                            ${text.map(t => `<a href="http://${t}/">${t}</a>`).join('')}
                    </div>`));
                }
            } else if (param === 'OrganicKeywords') {
                let text = values.OrganicKeywords.split(', '),
                    res = text.slice(0, 3).join(', ');

                elem.html(res.length > 30 ? res.substr(0, 30) + '...' : res);

                addTooltip(elem, rdz.$(`<div>
                        ${text.map(t => `<div>${t}</div>`).join('')}
                </div>`));
            }
        }

        this.showCached({name: 'SimilarWeb', class: 'rds-italic_SimilarWeb'});
    },
    hover_mouse_move: function () {
        //window.rdz.app.content.tooltip.open(this.getTooltipData(event.target), event);
    },
};

window.rdz.view.bar.Webmoney = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
    },
    setHref: function () {
        return false;
    },
    getTooltipData: function (target) {
        var value = this.model.get("value"),
            name = this.model.get("name"),
            data = rdz.$("<div class='rds-webmoney'></div>"),
            domain = rdz.utils.domainFromUri(rdz.url).domain,
            traffic,
            MAX_FEEDBACKS_COUNT = 3,
            i,
            len,
            spanRE = /<span[\s]+class="spasibo">|<\/span>/g,
            feedback,
            feedbackMessage;

        if (value) {
            data.append('<div class="rds-webmoney-description">' +
            '<div class="rds-webmoney-site">' +
            '<img id="rds-webmoney-siteIcon" alt="" style="height:16px; width:16px;"></img>' +
            '<a id="rds-webmoney-domain" target="_blank"></a>' +
            '<span id="rds-webmoney-wmids-count" target="_blank"></span>' +
            '</div>' +
            '</div>' +
            '<div class="rds-webmoney-traffic">' +
            '<div class="rds-webmoney-traffic-title" style="font-weight:bold;">Посещаемость сайта на основе пользователей Webmoney.Advisor</div>' +
            '<div class="rds-webmoney-traffic-index">Индекс посещаемости:<span class="rds-bold"></span></div>' +
            '<div class="rds-webmoney-traffic-desc"></div>' +
            '<img class="rds-webmoney-traffic-graph"></img>' +
            '</div>' +
            '<div class="rds-webmoney-feedbacks-container">' +
            '<div class="rds-webmoney-feedbacks-title"></div>' +
            '<div class="rds-webmoney-feedbacks"></div>' +
            '</div>');

            rdz.$(data.find('#rds-webmoney-siteIcon')).attr('src', 'https://' + domain + '/favicon.ico');
            rdz.$(data.find('#rds-webmoney-domain')).attr('href', 'http://' + domain + '/')
                .text(domain.toUpperCase());

            if (value.Webmoney > 0) {
                rdz.$(data.find('#rds-webmoney-wmids-count')).text('связан с ' + value.Webmoney + ' WMID');
            }

            if (value.WMAdvisor) {
                if (value.WMAdvisor.trafficIndex) {
                    rdz.$(data.find('.rds-webmoney-traffic-index span')).text(rdz.utils.formatNumber.apply(value.WMAdvisor.trafficIndex, [0, "", "\u2009"]));
                    traffic = value.WMAdvisor.trafficIndex * 30;
                    rdz.$(data.find('.rds-webmoney-traffic-desc')).text('Примерная посещаемость ' +
                        rdz.utils.formatNumber.apply(Math.round(traffic * 0.9), [0, "", "\u2009"]) +
                        ' - ' +
                        rdz.utils.formatNumber.apply(Math.round(traffic * 1.1), [0, "", "\u2009"]) +
                        ' чел, зависит от тематики сайта и заинтересованности им пользователями Webmoney.'
                    );

                    /*if (value.WMAdvisorGraph) {
                        rdz.$(data.find('.rds-webmoney-traffic-graph')).attr('src', value.WMAdvisorGraph)
                    }*/
                }

                if (value.WMAdvisorGraph) {
                    rdz.$(data.find('.rds-webmoney-traffic-graph')).attr('src', value.WMAdvisorGraph);
                }

                if (value.WMAdvisor.feedbacksGT || value.WMAdvisor.feedbacksLT) {
                    rdz.$(data.find('.rds-webmoney-feedbacks-title'))
                        .html(
                        '<span class="rds-bold">Отзывы посетителей </span>' +
                        '<span class="rds-gt0 rds-bold rds-green">:)</span>' +
                        '<span class="rds-gt0-value rds-green">' + value.WMAdvisor.feedbacksGT + '</span>' +
                        '<span class="rds-lt0 rds-bold rds-red">:(</span>' +
                        '<span class="rds-lt0-value rds-red">' + value.WMAdvisor.feedbacksLT + '</span>'
                    );

                    if (value.WMAdvisor.feedbacks && value.WMAdvisor.feedbacks.length) {
                        rdz.$(data.find('.rds-webmoney-feedbacks')).html('');
                        len = value.WMAdvisor.feedbacks.length;
                        for (i = 0; i < len && i < MAX_FEEDBACKS_COUNT; i++) {
                            feedbackMessage = value.WMAdvisor.feedbacks[i].message;
                            feedbackMessage = feedbackMessage.replace(spanRE, '');
                            if (feedbackMessage.length >= 60) {
                                feedbackMessage = feedbackMessage.substring(0, 56) + "...";
                            }
                            feedback = '<div class="rds-webmoney-feedback">' +
                            '<span class="rds-bold rds-' + (value.WMAdvisor.feedbacks[i].type === 'gt0' ? 'gt0 rds-green' : 'lt0 rds-red') + '">' +
                            (value.WMAdvisor.feedbacks[i].type === 'gt0' ? ':)' : ':(') +
                            '</span>' +
                            '<span class="rds-webmoney-feedback-message">' +
                            feedbackMessage +
                            '</span>' +
                            '</div>';
                            rdz.$(data.find('.rds-webmoney-feedbacks')).append(feedback);
                        }
                    }
                }
            }
        } else {
            data = rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl;
        }


        //yandexNews = value && value.AggregatorsYandexNews ? value.AggregatorsYandexNews : null;

        //if (rdz.$(target).hasClass('rds-value_Ya')) {            
        //    if (yandexNews) {
        //        
        //        data.append(rdz.$('<div/>', { class:'rds-bold', html: yandexNews.domain + rdz.locale.bar.tooltips.Aggregators.yandex.tooltip_domain })[0]);
        //        data.append(rdz.$('<div/>', { text: yandexNews.text })[0]);
        //        data.append(rdz.$('<div/>', { class:'rds-bold', text: yandexNews.manager })[0]);
        //        data.append(rdz.$('<div/>', { text: yandexNews.address })[0]);
        //        data.append(rdz.$('<div/>', { class: 'rds-aggregators-ya_news-tel',text: yandexNews.tel })[0]);
        //        data.append(yandexNews.email ? rdz.$('<div/>', {class: 'rds-aggregators-ya_news-email', text: yandexNews.email })[0] : '');
        //        
        //    } else if (value && value.AggregatorsYandex && value.AggregatorsYandex.yandexNewsLink) { // Y.News haven't been received but there is the link
        //        data.append(rdz.$('<div class="rds-aggregators-preload"><span class="rds-preload-16x16"></span></div>'));
        //        this.model.sendMessage({url: window.rdz.url, request: 'PARAMETER_ContentRequest', yandexNewsLink: value.AggregatorsYandex.yandexNewsLink})
        //    } else {
        //        data = rdz.locale.bar.tooltips.Aggregators.yandex.ttl;
        //    }
        //} else if (rdz.$(target).hasClass('rds-value_Go')) {
        //    data = rdz.locale.bar.tooltips.Aggregators.google;
        //} else if (rdz.$(target).hasClass('rds-value_No')) {
        //    data = rdz.locale.bar.tooltips.Aggregators.novoteka;
        //} else {
        //    data = rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl;
        //}

        return data;
    }
};

window.rdz.view.bar.UniqueContent = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        return rdz.$('<div class="rds-prm"><div class="rds-icon-element">' +
        '<div class="rds-icon-element-item"><a target="_blank" class="rds-icon-element-icon"></a> <span class="rds-value"></span></div>' +
        '</div></div>');
    },
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});

        this.$el.addClass('rds-' + this.model.get('name'));
    },
    setHref: function () {
        return false;
    }
};

window.rdz.view.bar.Prodvigator = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});

        this.$el.removeClass('yandex_ru google_ru google_ua google_bg');

        var yandex = this.model.get('extra').prodvigator_yandex.active,
            google = this.model.get('extra').prodvigator_google.active,
            google_source = this.model.get('extra').prodvigator_google_source.active,
            parent_class = google && google_source || 'yandex_ru';

        rdz.$(this.$el.find('.rds-icon-element-icon')).addClass(parent_class);

        this.$el.addClass('rds-' + this.model.get('name'));
    },
    click: function (event) {
        var v = this.model.get('value'),
            domain = rdz.utils.domainFromUri(rdz.url).domain,
            google_active = this.model.get('extra').prodvigator_google.active,
            google_zone = this.model.get('extra').prodvigator_google_source.active,
            url = google_active ? 'https://serpstat.com/keywords/index?query=' + encodeURIComponent(domain) + '&se=' + rdz.utils.prodvigator_request_google[google_zone] + '&ref=11201' :
            'https://serpstat.com/keywords/index?query=' + encodeURIComponent(domain) + '&se=y_213&ref=11201';

        if (!rdz.app.content.bar.get('button_pressed_recently')) {
            if (v) {
                rdz.cmessenger.post({method: 'message', request: 'OPEN_PAGE_ContentRequest', url: url});
            } else {
                rdz.app.content.bar.set({cache_cleared: false});
                this.model.sendMessage({url: window.rdz.url, request: 'PARAMETER_ContentRequest'});
            }

            rdz.app.content.bar.set({button_pressed_recently: true});
        }
        rdz.app.content.bar.pressed_recently_timer();
    }
};

window.rdz.view.bar.SpyWords = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});

        this.$el.addClass('rds-' + this.model.get('name'));
    },
    click: function (event) {
        var v = this.model.get('value'),
            url = this.model.get('requests').serviceUrl;

        if (!rdz.app.content.bar.get('button_pressed_recently')) {
            if (rdz._.isObject(v) || (v === rdz.errors.AUTHOR)) {
                rdz.cmessenger.post({method: 'message', request: 'OPEN_PAGE_ContentRequest', url: url});
            } else {
                rdz.app.content.bar.set({cache_cleared: false});
                this.model.sendMessage({url: window.rdz.url, request: 'PARAMETER_ContentRequest'});
            }

            rdz.app.content.bar.set({button_pressed_recently: true});
        }
        rdz.app.content.bar.pressed_recently_timer();
    }
};

window.rdz.view.bar.LIO = {
    getTooltipData: function () {
        var value = this.model.get("value"),
            name = this.model.get("name"),
            data = [],
            links,
            n = 30,
            i;

        if (value && value.outerLinks) {
            links = value.outerLinks;
            data.push(rdz.$('<div/>', {class: 'rds-bold', text: rdz.locale.bar.tooltips.LIO.ttl})[0]);
            if (links.length > 0) {
                data.push(rdz.$('<div/>', {
                        class: 'lio-outer-ttl',
                        text: rdz.locale.bar.tooltips.LIO.outer_ttl + ': [' + value.outerLinks.length + ']'
                    })[0]
                );
                for (i = 0; i < n && i < links.length; i++) {
                    data.push(rdz.$('<div/>', {
                            class: 'rds-red',
                            text: links[i].length <= 50 ? links[i] : links[i].substring(0, 50) + '...'
                        })[0]
                    );
                }
                if (links.length > n) {
                    data.push(rdz.$('<div/>', {
                        class: 'rds-red',
                        text: rdz.locale.locale === 'ru' ? '... ' + rdz.locale.more + ' ' + (links.length - n) + ' url' :
                        '... ' + (links.length - n) + ' urls ' + rdz.locale.more
                    })[0]);
                }
            }
        } else {
            data = rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl;
        }

        return data;
    }
};

window.rdz.view.bar.SocialNetworks = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        return rdz.$('<div class="rds-prm"><div class="SocialNetworks">' +
        //'<div class="rds-network-GooglePlus"><a target="_blank" class="rds-network-icon"></a> <span class="rds-network-value"></span></div>' +
        '<div class="rds-network-Facebook"><a target="_blank" class="rds-network-icon"></a> <span class="rds-network-value"></span></div>' +
        //'<div class="rds-network-Twitter"><a target="_blank" class="rds-network-icon"></a> <span class="rds-network-value"></span></div>' +
        '<div class="rds-network-VK"><a target="_blank" class="rds-network-icon"></a> <span class="rds-network-value"></span></div>' +
        '</div></div>');
    },
    showResult: function () {
        var v = this.model.get('value'),
            extra = this.model.get('extra'),
            values = {
                value_GooglePlus: this.checkError(v ? v.GooglePlus : v),
                value_GooglePlusMain: this.checkError(v ? v.GooglePlusMain : v),
                value_Facebook: this.checkError(v ? v.Facebook : v),
                value_FacebookMain: this.checkError(v ? v.FacebookMain : v),
                value_Twitter: this.checkError(v ? v.Twitter : v),
                value_TwitterMain: this.checkError(v ? v.TwitterMain : v),
                value_VK: this.checkError(v ? v.VK : v),
                value_VKMain: this.checkError(v ? v.VKMain : v)
            },
            network,
            requests = this.model.get('requests'),
            request;

        if (v && typeof v.Twitter === 'number' && typeof v.Twitter2 === 'number') {
            values.value_Twitter = v.Twitter + v.Twitter2;
        }
        if (v && typeof v.TwitterMain === 'number' && typeof v.TwitterMain2 === 'number') {
            values.value_TwitterMain = v.TwitterMain + v.TwitterMain2;
        }

        if (v && typeof v.VK === 'number' && typeof v.VK2 === 'number' &&
            typeof v.VK3 === 'number' && typeof v.VK4 === 'number') {
            values.value_VK = v.VK + v.VK2 + v.VK3 + v.VK4;
        }

        if (v && typeof v.VKMain === 'number' && typeof v.VKMain2 === 'number' &&
            typeof v.VKMain3 === 'number' && typeof v.VKMain4 === 'number') {
            values.value_VKMain = v.VKMain + v.VKMain2 + v.VKMain3 + v.VKMain4;
        }

        // this.setHref('.rds-value');

        for (network in extra) {
            this.$el.find('.rds-network-' + network).css('display', extra[network].active ? 'inline' : 'none');

            this.$el.find('.rds-network-' + network + ' .rds-network-value').html(
                v && requests && requests[network] && requests[network + 'Main'] &&
                //(requests[network].serviceUrl !== requests[network + 'Main'].serviceUrl)
                location.pathname !== '/'
                && (typeof v[network + 'Main'] === 'number') ?
                this.formatValue(values['value_' + network]) + ' (' + this.formatValue(values['value_' + network + 'Main']) + ')' :
                    this.formatValue(values['value_' + network])
            );
        }

        for (request in requests) {
            this.showCached({name: request, class: 'rds-italic_' + request});
        }
    },
    hover_mouse_move: function () {
        window.rdz.app.content.tooltip.open(this.getTooltipData(event.target), event);
    },
    getTooltipData: function (target) {
        var value = this.model.get("value"),
            name = this.model.get("name"),
            data,
            className = rdz.$(target).attr('class') + ' ' + rdz.$(target).parent().attr('class');

        if (className.indexOf('GooglePlus') !== -1) {
            data = rdz.locale.bar.tooltips.SocialNetworks.GooglePlus;
        } else if (className.indexOf('Facebook') !== -1) {
            data = rdz.locale.bar.tooltips.SocialNetworks.Facebook;
        } else if (className.indexOf('Twitter') !== -1) {
            data = rdz.locale.bar.tooltips.SocialNetworks.Twitter;
        } else if (className.indexOf('VK') !== -1) {
            data = rdz.locale.bar.tooltips.SocialNetworks.VK;
        } else {
            data = rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl;
        }

        return data;
    }
};

window.rdz.view.bar.Validation = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        var html = rdz.$('<div class="rds-prm"><a target="_blank" class="rds-value"></a></div></div>'),
            name = model.get('name');

        rdz.$(html).find('.rds-value').addClass(name);
        //this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    },
    formatValue: function (value) {
        var p = this.model.get('value');
        return p === null ? 'none' : (p.value ? 'yes' : 'no');
    },
    showResult: function () {
        this.setHref('.rds-value');
        var value = this.model.get('value');
        if (value !== null) {
            this.$el.find('.rds-value').addClass(this.formatValue(this.checkError(value)));
        }
        else {
            this.$el.find('.rds-value').removeClass('yes no none');
        }

    }
};

window.rdz.view.bar.RSS = {
    setHref: function () {
        var value = this.model.get('value');
        var links = rdz._.values(value);
        return links && links.length > 0 ? false : null;
    }
};

window.rdz.view.bar.Robots = rdz.view.bar.Validation;

window.rdz.view.bar.StatHistory = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        return rdz.$('<div class="rds-prm"><div class="rds-icon-element">' +
        '<div class="rds-icon-element-item"><span class="rds-value rds-bold"></span> <a target="_blank" class="rds-icon-element-icon"></a></div>' +
        '</div></div>');
    },
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});

        this.$el.addClass('rds-' + this.model.get('name'));
    },
    click: function (event) {
        var v = this.model.get('value'), url;

        if (!rdz.app.content.bar.get('button_pressed_recently')) {
            if ((v === rdz.errors.AUTHOR) || (v === rdz.errors.BUNKRUPT)) {
                url = (v === rdz.errors.AUTHOR) ? 'http://www.recipdonor.com/' : 'http://www.recipdonor.com/pay/';
                rdz.cmessenger.post({method: 'message', request: 'OPEN_PAGE_ContentRequest', url: url});
            } else if (rdz._.isArray(v)) {
                this.getContextmenuData(this.$el);
            } else {
                rdz.app.content.bar.set({cache_cleared: false});
                this.$el.find('.rds-value').html('...');
                this.model.sendMessage({url: window.rdz.url, request: 'PARAMETER_ContentRequest'});
            }

            rdz.app.content.bar.set({button_pressed_recently: true});
        }
        rdz.app.content.bar.pressed_recently_timer();
    }
};

window.rdz.view.bar.Counters = {

    className: 'rds-cnt rds-icons rds-Counters',
    setHref: function () {
        var value = this.model.get('value');//check if the valus is an empty object
        var b = rdz._.values(value);
        return b.length > 0 ? false : null;
    },

    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
    }

};


window.rdz.view.bar.Sitemap = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        var html = rdz.$('<div class="rds-prm"><a target="_blank" class="rds-value"></a></div></div>'),
            name = model.get('name');
        rdz.$(html).find('.rds-value').addClass(name);
        return html;
    },
    formatValue: function (value) {
        var v = this.model.get('value');
        return v === null ? value : ( (v && v['Sitemap'] && v['Sitemap'].value ||
        v && !rdz._.isEmpty(v['CurrSitemap'])) ? 'yes' : 'no');
    },
    showResult: function () {
        this.setHref('.rds-value');
        var value = this.model.get('value');
        if (value !== null) {
            this.$el.find('.rds-value').addClass(this.formatValue(this.checkError(value)));
        }
        else {
            this.$el.find('.rds-value').removeClass('yes no none');
        }
    },
    setHref: function () {
        return false;
    }
};

window.rdz.view.bar.CheckDangerous = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        var value = this.model.get("value");
        if (value && value.Dangerous && value.Dangerous !== 'None') {
            var domain = rdz.utils.domainFromUri(rdz.url).domain;
            var hrefs = {
                yandex: 'http://yandex.ru/infected?url=http://' + encodeURIComponent(domain),
                google: 'https://www.google.com/safebrowsing/diagnostic?site=' + encodeURIComponent(domain),
                webmoneyadvisor: 'http://advisor.wmtransfer.com/SiteDetails.aspx?url=' + encodeURIComponent(domain),
                virustotal: 'https://www.virustotal.com/ru/url/submission/?force=1&url=http://' + encodeURIComponent(domain)
            };

            var data = rdz.$('<span />').html(rdz.locale.notification['checkdangerous']);

            for (var d in hrefs) {
                if (value.Dangerous.toLowerCase().indexOf(d) !== -1) {
                    data.find('.' + d).attr({href: hrefs[d], target: '_blank'});
                } else {
                    data.find('.' + d).css('display', 'none');
                }
            }

            rdz.utils.showNotification(data, {
                openerClass: 'checkdangerous'
            });
        }
    },

    getTooltipData: function () {
        var value = this.model.get("value"),
            name = this.model.get("name"),
            data;

        if (value && value.Dangerous === 'None') {
            data = rdz.locale.bar.tooltips[name].no;
        } else if (value && value.Dangerous) {
            data = rdz.locale.bar.tooltips[name].yes;
        } else if (value < 0) {
            data = (value === rdz.errors.BUNKRUPT) ? rdz.locale.bar.tooltips.bunkrupt : rdz.locale.bar.tooltips.author;
        } else {
            data = rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl;
        }

        return data;
    },

    setHref: function () {
        return false;
    }
};

window.rdz.view.bar.Seo = {
    formatValue: function (value) {
        var v = this.model.get('value');

        return v === null ? 'unchecked' :
            v < 0 ? (v === rdz.errors.BUNKRUPT ? 'bunkrupt' : 'auth') : v;
    },

    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        //this.showRate();
    },

    getTooltipData: function () {
        var //value = this.model.get("value"),
            name = this.model.get("name"),
            data,
            template;

        var value = this.checkError(this.model.get('value')),
            sortedSeosObj = null,
            sortedSeos = null,
            sortedSeosIn = null,
            firstWithoutValue = true, // taken from FF
            containerClass = "",
            formatedValue = this.formatValue(value);

        if (formatedValue === "unchecked") {
            template = "<div class='Seo'>" +
                '<div><a target="_blank" class="rds-value Sape unchecked"></a><span>Sape</span></div>' +
                '<div><a target="_blank" class="rds-value Setlinks unchecked"></a><span>Setlinks</span></div>' +
                '<div><a target="_blank" class="rds-value Linkfeed unchecked"></a><span>Linkfeed</span></div>' +
                '<div><a target="_blank" class="rds-value Trustlink unchecked"></a><span>Trustlink</span></div>' +
                '<div><a target="_blank" class="rds-value Mainlink unchecked"></a><span>Mainlink</span></div>' +
                '<div><a target="_blank" class="rds-value Xap unchecked"></a><span>Xap</span></div>' +
                '<div><a target="_blank" class="rds-value Propage unchecked"></a><span>Propage</span></div>' +
                '<div><a target="_blank" class="rds-value Gogetlinks unchecked"></a><span>Gogetlinks</span></div>' +
                '<div><a target="_blank" class="rds-value Liex unchecked"></a><span>Liex</span></div>' +
                '<div><a target="_blank" class="rds-value Miralinks unchecked"></a><span>Miralinks</span></div>' +
                '<div><a target="_blank" class="rds-value Seozavr unchecked"></a><span>Seozavr</span></div>' +
                '<div><a target="_blank" class="rds-value SapeArticles unchecked"></a><span>SapeArticles</span></div>' +
                '<div><a target="_blank" class="rds-value SapePr unchecked"></a><span>SapePr</span></div>' +
                '<div><a target="_blank" class="rds-value Rds unchecked"></a><span>Rds</span></div>' +
                '<div><a target="_blank" class="rds-value RotaPost unchecked"></a><span>RotaPost</span></div>' +
                '<div><a target="_blank" class="rds-value Blogun unchecked"></a><span>Blogun</span></div>' + "</div>";
        } else if (formatedValue === "bunkrupt") {
            message = rdz.locale.bar.contextmenu.no_money;
        } else if (formatedValue === "auth") {
            message = rdz.locale.bar.contextmenu.authorize;
        } else {
            // getting sum, that indicates active markets
            var extra = this.model.get("extra"),
                activeMarketsSum = 0;
            for (let name in extra) {
                if (name !== "api") {
                    if (extra[name].active === true) {
                        activeMarketsSum += rdz.utils.Seo_NumberByName[name];
                    }
                }
            }

            sortedSeosObj = rdz.utils.sortSeoMarkets(formatedValue, activeMarketsSum);
            sortedSeos = sortedSeosObj.sorted;
            sortedSeosIn = sortedSeosObj.sorted_in;

            template = "<div class='Seo'>";

            for (var i = 0; i < sortedSeos.length; i++) {
                // make hole between markets with value and without (taken from FF)
                if (sortedSeosIn.length > 0 && sortedSeos[i][1] !== "yes" && firstWithoutValue) {
                    firstWithoutValue = false;
                    containerClass = "first-without-value";
                } else {
                    containerClass = "";
                }

                var curElement = '<div class="' + containerClass + '"><a target="_blank" class="rds-value ' + sortedSeos[i][0] + ' ' + sortedSeos[i][1] + '"></a>' +
                    '<span class="' + sortedSeos[i][1] + '" >' + sortedSeos[i][0] + '</span></div>';
                template += curElement;
            }

            template += "</div>";
        }

        data = template ? rdz.$(template) : message;

        return data;
    }
};


window.rdz.view.bar.Seo = {
    formatValue: function(value) {
        var v = this.model.get('value');
        
        return v === null ? 'unchecked' :
            v < 0 ? (v === rdz.errors.BUNKRUPT ? 'bunkrupt' : 'auth') : v;
    },
    
    showResult: function() {
        this.callParentMethod({method:'showResult', object: this});
        //this.showRate();
    },

    getTooltipData: function() {
        var //value = this.model.get("value"),
            name = this.model.get("name"),
            data,
            template;
            
        var value = this.checkError(this.model.get('value')),
            sortedSeosObj = null,
            sortedSeos = null,
            sortedSeosIn = null,
            firstWithoutValue = true, // taken from FF
            containerClass = "",
            formatedValue = this.formatValue(value);
        
        if (formatedValue === "unchecked") {
            template = "<div class='Seo'>" +
                        '<div><a target="_blank" class="rds-value Sape unchecked"></a><span>Sape</span></div>' +
                        '<div><a target="_blank" class="rds-value Setlinks unchecked"></a><span>Setlinks</span></div>' +
                        '<div><a target="_blank" class="rds-value Linkfeed unchecked"></a><span>Linkfeed</span></div>' +
                        '<div><a target="_blank" class="rds-value Trustlink unchecked"></a><span>Trustlink</span></div>' +
                        '<div><a target="_blank" class="rds-value Mainlink unchecked"></a><span>Mainlink</span></div>' +
                        '<div><a target="_blank" class="rds-value Xap unchecked"></a><span>Xap</span></div>' +
                        '<div><a target="_blank" class="rds-value Propage unchecked"></a><span>Propage</span></div>' +
                        '<div><a target="_blank" class="rds-value Gogetlinks unchecked"></a><span>Gogetlinks</span></div>' +
                        '<div><a target="_blank" class="rds-value Liex unchecked"></a><span>Liex</span></div>' +
                        '<div><a target="_blank" class="rds-value Miralinks unchecked"></a><span>Miralinks</span></div>' +
                        '<div><a target="_blank" class="rds-value Seozavr unchecked"></a><span>Seozavr</span></div>' +
                        '<div><a target="_blank" class="rds-value SapeArticles unchecked"></a><span>SapeArticles</span></div>' +
                        '<div><a target="_blank" class="rds-value SapePr unchecked"></a><span>SapePr</span></div>' +
                        '<div><a target="_blank" class="rds-value Rds unchecked"></a><span>Rds</span></div>' +
                        '<div><a target="_blank" class="rds-value RotaPost unchecked"></a><span>RotaPost</span></div>' +
                        '<div><a target="_blank" class="rds-value Blogun unchecked"></a><span>Blogun</span></div>' +
                        "</div>";
        } else if (formatedValue === "bunkrupt") {
          message = rdz.locale.bar.contextmenu.no_money;
        } else if (formatedValue === "auth") {
          message = rdz.locale.bar.contextmenu.authorize;
        } else {
            // getting sum, that indicates active markets
            var extra = this.model.get("extra"),
                activeMarketsSum = 0;    
            for (let name in extra) {
                if (name !== "api") {
                    if (extra[name].active === true) {
                        activeMarketsSum += rdz.utils.Seo_NumberByName[name];
                    }
                }
            }
            
            sortedSeosObj = rdz.utils.sortSeoMarkets(formatedValue, activeMarketsSum);
            sortedSeos = sortedSeosObj.sorted;
            sortedSeosIn = sortedSeosObj.sorted_in;
            
            template = "<div class='Seo'>";
            
            for (var i = 0; i < sortedSeos.length; i++) {
                // make hole between markets with value and without (taken from FF)
		if (sortedSeosIn.length > 0 && sortedSeos[i][1] !== "yes" && firstWithoutValue) {
		  firstWithoutValue = false;
                  containerClass = "first-without-value";
                } else {
                   containerClass = "";
                }             
                
                var curElement = '<div class="' + containerClass + '"><a target="_blank" class="rds-value ' + sortedSeos[i][0] + ' ' + sortedSeos[i][1] + '"></a>' +
                '<span class="' + sortedSeos[i][1] + '" >' + sortedSeos[i][0] + '</span></div>';
                template += curElement;
	    }
            
            template += "</div>";
        }     
        
        data = template ? rdz.$(template) : message;

        return data;
    }
};

