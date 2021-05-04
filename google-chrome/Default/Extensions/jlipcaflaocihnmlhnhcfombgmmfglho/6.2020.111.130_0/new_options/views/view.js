define(
    [
        'new_options/views/bar',
        'new_options/views/page',
        'new_options/views/yandex',
        'new_options/views/google',
        'new_options/views/italic',
        'new_options/views/language',
        'new_options/views/support'
    ],
    function (Bar, Page, Yandex, Google, Italic, Locale, Support) {
        return Backbone.View.extend({
            el: 'body',
            events: {
                "click #save": "save",
                "click #cancel": "cancel",
                "click #default": "default",
                "click #disableAPI": "disableAPI",
                "click #feedback": "showSupport",
                "click #cleanCache": "cleanCache",
                "click .big-tab": "switchBigTab",
                "click .small-tab": "switchSmallTab"
            },
            template: function () {
                $('title').text(AppLocale.get('options.view.title'));
                this.$el.find('#parameters-tab span').text(AppLocale.get('options.view.big_tabs.parameters'));
                this.$el.find('#search-tab span').text(AppLocale.get('options.view.big_tabs.search'));
                this.$el.find('#html-tab span').text(AppLocale.get('options.view.big_tabs.html'));
                this.$el.find('#integrations-tab span').text(AppLocale.get('options.view.big_tabs.integrations'));
                this.$el.find('#extra-tab span').text(AppLocale.get('options.view.big_tabs.extra'));
                this.$el.find('#support-tab span').text(AppLocale.get('options.view.big_tabs.support'));
                this.$el.find('#default').text(AppLocale.get('options.view.button.default'));
                this.$el.find('#disableAPI').text(AppLocale.get('options.view.button.disable_api'));
                this.$el.find('#cleanCache').text(AppLocale.get('options.view.button.clean_cache'));
                this.$el.find('#save').text(AppLocale.get('options.view.button.save'));
                this.$el.find('#cancel').text(AppLocale.get('options.view.button.cancel'));
                this.$el.find('#bar-version').text(AppLocale.get('options.view.bar_version') + ' ' + chrome.runtime.getManifest().version);
                $('.in-progress').text(AppLocale.get('options.view.in_progress'));
            },
            renderViews: [],
            render: function () {
                if (this.renderViews.length) {
                    this.removeModelEvents();
                    this.renderViews = [];
                }

                this.template();

                var bar = new Bar();
                bar.render();
                this.renderViews.push(bar);

                var page = new Page();
                page.render();
                this.renderViews.push(page);

                var yandex = new Yandex();
                yandex.render();
                this.renderViews.push(yandex);

                var google = new Google();
                google.render();
                this.renderViews.push(google);

                var italic = new Italic();
                italic.render();
                this.renderViews.push(italic);

                var locale = new Locale();
                locale.render();
                this.renderViews.push(locale);

                var support = new Support();
                support.render();
                this.renderViews.push(support);

                this.doExtraActions();
            },
            save: function () {
                window.Bar.save();
                window.Yandex.save();
                window.Google.save();
                window.Parameters.save();
                window.YaParameters.save();
                window.GoParameters.save();
                window.NoIndex.save();
                window.NoFollow.save();
                window.Sponsored.save();
                window.UGC.save();
                window.Canonical.save();
                window.Robots.save();
                window.OuterLinks.save();
                window.DisplayNone.save();

                //save last version of locale in default object
                main.window.rdz.setting.options.Bar.locale = window.Bar.get('locale');

                window.rdz.utils.optionsChanged(main);

                window.Contextmenu.close();

                $('#save').attr({disabled: 'disabled'});
            },
            cancel: async function () {
                await AppLocale.init();

                window.Bar.fetch({a: 1});
                window.Yandex.fetch({a: 1});
                window.Google.fetch({a: 1});
                window.Parameters.fetch();
                window.YaParameters.fetch();
                window.GoParameters.fetch();
                window.NoIndex.fetch();
                window.NoFollow.fetch();
                window.Sponsored.fetch();
                window.UGC.fetch();
                window.Canonical.fetch();
                window.Robots.fetch();
                window.OuterLinks.fetch();
                window.DisplayNone.fetch();
                rdz.AppView.render();

                window.Contextmenu.close();

                $('#save').attr({disabled: 'disabled'});
            },
            default: async function () {
                await AppLocale.init();

                window.Bar.fetch({reset: true});
                window.Yandex.fetch({reset: true});
                window.Google.fetch({reset: true});
                window.Parameters.fetch({reset: true});
                window.YaParameters.fetch({reset: true});
                window.GoParameters.fetch({reset: true});
                window.NoIndex.fetch({reset: true});
                window.NoFollow.fetch({reset: true});
                window.Sponsored.fetch({reset: true});
                window.UGC.fetch({reset: true});
                window.Canonical.fetch({reset: true});
                window.Robots.fetch({reset: true});
                window.OuterLinks.fetch({reset: true});
                window.DisplayNone.fetch({reset: true});
                rdz.AppView.render();

                window.Contextmenu.close();

                $('#save').removeAttr('disabled');
            },
            disableAPI: function () {
                var pBranches = ['Parameters', 'YaParameters', 'GoParameters'],
                    fBranches = ['Yandex', 'Google'],
                    extra,
                    functions,
                    e;

                pBranches.forEach(function (branch) {
                    window[branch].each(function (m) {
                        extra = m.get('extra');
                        if (extra && extra.api) {
                            if (extra.hidden || extra.no_cogwheel ||
                                m.get('name') === 'UniqueContent' ||
                                m.get('name') === 'Seo' ||
                                m.get('name') === 'SiteAnalysis' ||
                                m.get('name') === 'StatHistory') {
                                m.set('active', false);
                            } else {
                                extra.api.active = false;
                                m.set('extra', extra);
                            }
                        }

                    });
                });

                // SA in the search integrations
                fBranches.forEach(function (branch) {
                    functions = window[branch].get('functions');
                    for (e in functions.SiteAnalysis.extra) {
                        if (e !== 'api' && e !== 'title') {
                            functions.SiteAnalysis.extra[e].active = false;
                        }
                    }
                    window[branch].set('functions', functions);
                });


                rdz.AppView.render();

                window.Contextmenu.close();

                $('#save').removeAttr('disabled');

            },
            showSupport: function () {
                $('#feedback').css('display', 'none');
                $('#support-formContainer').css('display', 'block');
            },
            cleanCache: function () {
                main.rdz.cache.clear();
                main.rdz.db.delete_tables(function () {
                        main.rdz.db.create_tables();
                    }
                );
            },
            switchBigTab: function (e) {
                var tabId,
                    name,
                    support;

                $('.big-tab').removeClass('active');
                $('.big-panel').css('display', 'none');

                tabId = $(e.currentTarget).attr('id');
                name = tabId.split('-')[0];
                $('#' + name + '-tab').addClass('active');
                $('#' + name + '-panel').css('display', 'block');

                // reset
                Contextmenu.close();
                // suppert rerenders and sends more than one request
                //if (name === 'support') {
                //    support = new Support();
                //    support.render();
                //}
            },

            switchSmallTab: function (e) {
                var tabId,
                    name;

                $('.small-tab>div.active').removeClass('active');
                $('.small-panel').css('display', 'none');

                tabId = $(e.currentTarget).attr('id');
                name = tabId.split('-')[0];
                $('#' + name + '-small-tab>div').addClass('active');
                $('#' + name + '-small-panel').css('display', 'block');

                // reset
                Contextmenu.close();
            },

            doExtraActions: function () {
                var that = this;

                // show the container
                this.$el.find('.container').css('display', 'block');

                // check the locale
                if (AppLocale.get('locale') !== 'ru') {
                    this.$el.find('#yandex-small-tab').css('display', 'none');
                    this.$el.find('#google-small-tab').click();
                } else {
                    this.$el.find('#yandex-small-tab').css('display', 'block');
                }

                // open the CM if we need
                this._openCM();
                window.onfocus = function () {
                    that._openCM();
                };
            },

            _openCM: function () {
                chrome.storage.local.get('other', settings => {
                    if (settings.other) {
                        var hash = settings.other.hash;
                        if (hash === 'noindex' || hash === 'displaynone') {
                            $('#html-tab').click();
                            $($('.page-' + hash).find('.extra')).click();
                        } else if (hash === 'yandex' || hash === 'google') {
                            $('#search-tab').click();
                            $("#" + hash + '-small-tab').click();
                        } else if (hash === 'seo_tags') {
                            $('#parameters-tab').click();
                            $($('.SEOTags').find('.extra')).click();
                        }

                        chrome.storage.local.remove('other');
                    }
                });
            },

            removeModelEvents: function () {
                this.renderViews.forEach(model => model.undelegateEvents());
            }
        });
    });
