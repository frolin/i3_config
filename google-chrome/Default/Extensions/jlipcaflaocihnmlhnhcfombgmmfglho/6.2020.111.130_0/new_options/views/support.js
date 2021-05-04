define(
    function () {
        return Backbone.View.extend({
            el: '#support',
            events: {
                'change #support-problem-select': 'changeProblem',
                'keyup #support-email-input': 'checkEmail',
                'keyup #support-comment': 'checkComment',
                'click #support-send': 'send'
            },
            template: function () {

                var html = $('<div id="support-formContainer">' +
                    '<div id="support-title"></div>' +

                    '<div id="support-problem-select-cnt">' +
                    '<select id="support-problem-select">' +
                    '<option id="support-problem-option0" disabled selected></option>' +
                    '<option id="support-problem-option1"></option>' +
                    '<option id="support-problem-option2"></option>' +
                    '<option id="support-problem-option3"></option>' +
                    '<option id="support-problem-option4"></option>' +
                    '</select>' +
                    '</div>' +

                    '<div id="support-comment-cnt">' +
                    '<textarea id="support-comment" rows="5"></textarea>' +
                    '</div>' +

                    '<div id="support-page-url-cnt" class="col-2">' +
                    '<div id="support-page-url-label"></div>' +
                    '<div><input id="support-page-url-input"/></div>' +
                    '</div>' +

                    '<div id="support-screenshot-url-cnt" class="col-2">' +
                    '<div id="support-screenshot-url-label"></div>' +
                    '<div><input id="support-screenshot-url-input" /></div>' +
                    '</div>' +

                    '<div id="support-email-cnt" class="col-2">' +
                    '<div id="support-email-label"></div>' +
                    '<div><input id="support-email-input" value=""/></div>' +
                    '</div>' +

                    '<div id="support-bottom-cnt">' +
                    '<label id="support-addons-list-cnt" class="checkbox">' +
                    '<input id="support-addons-list-input" type="checkbox" checked="true" />' +
                    '<span id="support-addons-list-label"></span>' +
                    '</label>' +
                    '<button id="support-send"></button>' +
                    '</div>' +
                    '</div>' +
                    '<div id="support-OK">' +
                    '<span id="support-OK-label"></span>' +
                    '</div>' +
                    '<div id="support-errors">' +
                    '</div>'
                );

                $(html.find('#support-title')).html(AppLocale.get('options.support.support_ttl'));
                $(html.find('#support-problem-option0')).html(AppLocale.get('options.support.support_problem_option0'));
                $(html.find('#support-problem-option1')).html(AppLocale.get('options.support.support_problem_option1'));
                $(html.find('#support-problem-option2')).html(AppLocale.get('options.support.support_problem_option2'));
                $(html.find('#support-problem-option3')).html(AppLocale.get('options.support.support_problem_option3'));
                $(html.find('#support-problem-option4')).html(AppLocale.get('options.support.support_problem_option4'));
                $(html.find('#support-comment')).html(AppLocale.get('options.support.support_comment'));
                $(html.find('#support-page-url-label')).html(AppLocale.get('options.support.support_page_url'));
                $(html.find('#support-screenshot-url-label')).html(AppLocale.get('options.support.support_screenshot_url'));
                $(html.find('#support-email-label')).html(AppLocale.get('options.support.support_email'));
                $(html.find('#support-addons-list-label')).html(AppLocale.get('options.support.support_addons_list'));
                $(html.find('#support-send')).html(AppLocale.get('options.support.support_send'));
                $(html.find('#support-OK-label')).html(AppLocale.get('options.support.support_ok'));

                $(html.find('#support-comment')).bind('focus', function (event) {
                    $(this).val('').css('color: #000000');
                    $(this).unbind(event);
                });
                if (main.rdz.user.logged) {
                    $(html.find('#support-email-cnt')).css('display', 'none');
                }

                return html;
            },
            render: function () {
                this.$el.html(this.template());
            },


            send: function () {
                var that = this,
                    inputData = {
                        title: that.$el.find('#support-problem-select').prop('selectedIndex') > 0 ? that.$el.find('#support-problem-select').val() : '',
                        comment: that.$el.find('#support-comment').val() || '',
                        pageURL: that.$el.find('#support-page-url-input').val() || '',
                        scrShotURL: that.$el.find('#support-screenshot-url-input').val() || '',
                        email: that.$el.find('#support-email-input').val() || '',
                        addonsList: that.$el.find('#support-addons-list-input').prop('checked')
                    },
                    extList,
                    message;

                if (that.validate(inputData)) {
                    chrome.storage.local.get(null, settings => {
                        if (inputData.addonsList) {
                            chrome.management.getSelf(function (e) {
                                extList = '&extList=' + e.name + '|' + e.id + '|' + e.type + '|' + e.version + '|' + e.installType;
                                message = that.prepareMessage(settings, inputData, extList);
                                that.postMessage(message);
                            });
                        } else {
                            message = that.prepareMessage(settings, inputData);
                            that.postMessage(message);
                        }
                    });
                }
            },

            changeProblem: function (event) {
                var select = this.$el.find('#support-problem-select');
                if (select.prop('selectedIndex') > 2) {
                    this.$el.find('#support-page-url-cnt').css('display', 'none');
                    this.$el.find('#support-screenshot-url-cnt').css('display', 'none');
                    this.$el.find('#support-addons-list-input').css('display', 'none');
                    this.$el.find('#support-addons-list-label').css('display', 'none');
                    this.$el.find('#support-comment').val('').css('color: #000000');
                    //this.$el.find('#support-formContainer').css('min-height', '190px');
                } else {
                    this.$el.find('#support-page-url-cnt').css('display', 'block');
                    this.$el.find('#support-screenshot-url-cnt').css('display', 'block');
                    this.$el.find('#support-addons-list-input').css('display', 'inline-block');
                    this.$el.find('#support-addons-list-label').css('display', 'inline');
                    this.$el.find('#support-comment').val(AppLocale.get('options.support.support_comment')).css('color: #555661');
                    $('#support-comment').bind('focus', function (event) {
                        $(this).val('').css('color: #000000');
                        $(this).unbind(event);
                    });
                }
            },

            checkComment: function () {
                var MAX_LENGTH = 2048,
                    commentInput = this.$el.find('#support-comment'),
                    comment = $(commentInput).val();

                if (comment.length > MAX_LENGTH) {
                    $(commentInput).val(comment.substring(0, MAX_LENGTH));
                }
            },

            validate: function (inputData) {
                return this.checkEmail();
            },

            checkEmail: function () {
                var emailInput = this.$el.find('#support-email-input');

                if (main.rdz.user.logged) {
                    return true;
                }

                if (this.validateEmail(emailInput.val())) {
                    $(emailInput).css({'border': '1px solid green', 'outline': 'none'});
                    return true;
                } else {
                    $(emailInput).css({'border': '1px solid red', 'outline': 'none'});
                    return false;
                }
            },

            validateEmail: function (email) {
                return email &&
                    email.length &&
                    (/^[a-zA-Z0-9_'+*/^&=?~{}\-](\.?[a-zA-Z0-9_'+*/^&=?~{}\-])*\@((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\:\d{1,3})?)|(((([a-zA-Z0-9][a-zA-Z0-9\-]+[a-zA-Z0-9])|([a-zA-Z0-9]{1,2}))[\.]{1})+([a-zA-Z]{2,6})))$/i).test(email);
            },

            prepareMessage: function (settings, inputData, extList) {
                var message,
                    storage = settings,
                    info = rdz.utils.getOptions({options: ['Info']}, settings),
                    bar = rdz.utils.getOptions({options: ['Bar']}, settings);

                message = 'title=' + inputData.title;

                message += '&email=' + encodeURIComponent(main.rdz.user.logged ? main.rdz.user.get('email') : inputData.email);

                message += '&comment=' + encodeURIComponent(inputData.comment) +
                '&pageURL=' + encodeURIComponent(inputData.pageURL) +
                '&scrShotURL=' + encodeURIComponent(inputData.scrShotURL);

                message += '&auth=' + (main.rdz.user.logged ? 1 : 0) +
                '&balance=' + (main.rdz.user.get('balance') || 0);

                message += '&DBversion=' + info.db_version;

                message += '&addonVersion=' + info.version +
                '&addonLang=' + bar.locale +
                '&addonbyButton=' + (bar.check_by_button ? 1 : 0);

                let browserMatch = navigator.userAgent.match(/(OPR|Firefox|YaBrowser|Vivaldi)\/(\S+)/);
                message += '&OS=' + rdz.utils.getOS() +
                '&OSlang=' + navigator.language +
                '&mozillaVersion=' + (
                    browserMatch ? browserMatch[1] + ' ' + browserMatch[2] :
                    /Chrome/.test(navigator.userAgent) ? 'Chrome ' + navigator.userAgent.match(/Chrome\/(\S+)/)[1] :
                        'Unknown ' + navigator.userAgent
                ) +
                '&screen=' + (screen.width + 'x' + screen.height);

                message += '&prefList=' + JSON.stringify(storage).replace(/\\"/g, '\\\\\"').replace(/(\\\\"Message[^]+?Date[^}]+")/g, ''); // it's magic =)

                if (extList) {
                    message += extList;
                }

                return message;
            },

            postMessage: function (message) {
                var xhr = new XMLHttpRequest(),
                    response,
                    error,
                    errorElement;

                xhr.onreadystatechange = function () {
                    if (this.status === 200 && this.readyState === 4) {
                        response = JSON.parse(this.responseText);
                        if (response.IsValid) {
                            $('#support-formContainer').css('display', 'none');
                            $('#support-OK').css('display', 'block');
                        } else {
                            $('#support-formContainer').css('display', 'none');
                            $('#support-errors').css('display', 'block');
                            for (error in response.Errors) {
                                errorElement = $('<div/>', {class: 'support-error-label'}).text(response.Errors[error]);
                                $('#support-errors').append(errorElement);
                            }
                        }
                    }
                };
                xhr.open("POST", "http://www.recipdonor.com/rdsbarfeedback", true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
                xhr.send(message);
            }

        });
    });

