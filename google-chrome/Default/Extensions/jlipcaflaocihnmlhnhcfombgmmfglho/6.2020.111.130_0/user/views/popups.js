Popup = Backbone.View.extend({
    el: '.popup-bg',
    template: _.template(templates.popup_bg.container),

    events: {
      "click .close": "close",
      "click .bg": "close"
    },

    initialize: function() {
        this.render();
    },

    render: function(){
        $(this.el).html(this.template());
    },

    show: function(popup) {
        this.cur_popup = popup;
        $(this.el).find('.cnt').empty();

        var view = new window[popup]();
            $(this.el).find('.cnt').append(view.render().el);

        //set popup window on the center
        var box = $(this.el).find('.window');
            box.css({'left': 0 - (box.width()/2)});

        //show popup
        $(this.el).css({visibility: 'visible'}).find('.bg')/*.animate({opacity: 0.8},  2000)*/;

    },

    close: function() {
        if (['PopupAUTHOR', 'PopupBUNKRUPT', 'PopupAPIOFF', 'PopupHTTPERROR'].indexOf(this.cur_popup) !== -1) {
            AppView.render();
        }
        $(this.el).css({visibility: 'hidden'}).find('.bg').attr({style: ''});
    }
});

PopupDeteteFromTabels = Backbone.View.extend({

    tagName: 'div',
    className: 'delete-from-tables',
    template: _.template(templates.popup_bg.delete),

    events: {
      "click .accept": "accept",
      "click .cancel": "cancel"
    },

    initialize: function() {

        $(this.el).html(this.template({msg:AppLocale.popups.delete_from_tables}));

        return this;
    },

    accept: function() {

        /*nsRDS.barDB.execSync(['DELETE FROM SitesLibrary']);
        // reducing DB size
        nsRDS.barDB.execSync(['VACUUM']);
        // to get new DB size without FF restarting
        nsRDS.barDB.Load(nsRDS.dbversion)
        
        nsRDS.listener.GetRecipients();*/

        rdz.cache.clear();
        rdz.db.delete_tables(function(){
                rdz.db.create_tables(
                    function(){window.location.reload()}
                )
            }
        );
    },

    cancel: function() {
        AppPopup.close();
    }
});

PopupTableFields = Backbone.View.extend({
    tagName: 'div',
    className: 'table-fields',

    initialize: function() {

        for (var i in LibRouter.get({ends:'TableFields'}).models)
        {
            var m = LibRouter.get({ends:'TableFields'}).models[i],
                name = m.get('name'),
                lib = LibRouter.get({str:true});

            if (m.get('name') !== 'Uri' &&

                window.rdz.TableFields.hidden.indexOf(name) === -1 &&

                //проверка скрытого поля в массовых проверках
                (window.rdz.TableFields.hidden_in_mass_checks.indexOf(name) == -1 || ["Recipients", "SitesLibrary", "PagesLibrary"].indexOf(lib) !== -1 ) &&

                (AppLocale.locale === 'ru' || AppLocale.ru_params.indexOf(name) === -1)
                )
            {
                var view = new window['PopupTableField']({model: m});
                $(this.el).append(view.render().el);
            }


        }

        return this;
    }
});

PopupTableField = Backbone.View.extend({

    tagName: 'label',

    template: _.template(templates.popup_bg.table_fields),

    events: {
      "change .check": "toggleField"
    },

    initialize: function() {
        this.model.unbind('change');
        this.model.bind('change', this.render_user_table, this);
    },

    render: function() {
        $(this.el).html(this.template(this.model.get('value')));
        this.setText();
        return this;
    },

    setText: function() {
      this.$('span').html(AppLocale.popup_bg.table_fields[this.model.get('name')]);
    },

    toggleField: function(e) {
        this.model.toggle(e.currentTarget.checked);
    },

    render_user_table: function() {
        AppBlockMassage.show('BlockLoading');
        //it simple magic gives AppBlockMassage time to show message
        setTimeout(function(){ AppView.render(); }, 500)
    }
});


PopupExportTableFields = Backbone.View.extend({
    tagName: 'div',
    className: 'table-fields buttons',

    events: {
      "click .export": "export"
    },

    initialize: function() {
        //show export button in export popup
        $(this.el).append(_.template(templates.popup_bg.export_button));

        var model = LibRouter.get({ends:'TableFields'});

        for (var i in model.models)
        {
            var m = model.models[i],
                name = m.get('name'),
                lib = LibRouter.get({str:true});

            if (m.get('name') !== 'Uri' &&

                window.rdz.TableFields.hidden.indexOf(name) === -1 &&

                //проверка скрытого поля в массовых проверках
                (window.rdz.TableFields.hidden_in_mass_checks.indexOf(name) == -1 || ["Recipients", "SitesLibrary", "PagesLibrary"].indexOf(lib) !== -1 ) &&

                (AppLocale.locale === 'ru' || AppLocale.ru_params.indexOf(name) === -1)
                )
            {
                var view = new window['PopupExportTableField']({model: m});
                    $(this.el).append(view.render().el);

            }



        }
        return this;
    },

    export: function() {
        window.AppTableExportXML = new TableExportXML();
        AppTableExportXML.saveFile();
    }
});

PopupExportTableField = Backbone.View.extend({

    tagName: 'label',

    template: _.template(templates.popup_bg.table_fields),

    events: {
      "click .check": "toggleField"
    },

    render: function() {
        $(this.el).html(this.template(this.model.get('export')));
        this.setText();
        return this;
    },

    setText: function() {
      this.$('span').html(AppLocale.popup_bg.table_fields[this.model.get('name')]);
    },

    toggleField: function(e) {
        this.model.toggleExport(e.currentTarget.checked);
    }
});


PopupExportNoData = Backbone.View.extend({
    tagName: 'div',
    className: 'selectdata',

    initialize: function() {
        $(this.el).text(AppLocale.popups.selectdata);
        return this;
    }
});

PopupDeleteNoData = Backbone.View.extend({
    tagName: 'div',
    className: 'selectdata',

    initialize: function() {
        $(this.el).text(AppLocale.popups.deletedata);
        return this;
    }
});

PopupDeleteRows = Backbone.View.extend({

    tagName: 'div',
    className: 'delete-from-tables',
    template: _.template(templates.popup_bg.delete),

    events: {
        "click .accept": "accept",
        "click .cancel": "cancel"
    },

    initialize: function() {

        $(this.el).html(this.template({msg:AppLocale.popups.delete_row_from_tables}));

        return this;
    },

    accept: function() {

        var uris = [];

        LibRouter.get().filter(function(e,i) {
            var model = (e).get('Uri'),
                path = DataPaging.get('PerPage').get('path');

            if (['recipients', 'siteslibrary', 'checksites'].indexOf(path) !== -1 && model.checked) {
                uris.push(model.value)
            } else if (model.checked) {
                uris.push({domain:model.domain, path:model.path});
            }
        });


        switch (LibRouter.get({str:true})) {
            case "SitesLibrary":
                rdz.db.delete_sites_row(uris, function(){window.location.reload()});
                break;

            case "PagesLibrary":
                rdz.db.delete_pages_row(uris, function(){window.location.reload()});
                break;

            case "CheckSitesLibrary":
                rdz.db.delete_check_sites_row(uris, function(){window.location.reload()});
                break;

            case "CheckPagesLibrary":
                rdz.db.delete_check_pages_row(uris, function(){window.location.reload()});
                break;
        }
    },

    cancel: function() {
        AppPopup.close();
    }
});

PopupAUTHOR = Backbone.View.extend({

    tagName: 'div',
    className: 'msg_1_button',
    template: _.template(templates.popup_bg.msg_1_button),

    events: {
        "click .accept": "accept",
        "click .cancel": "cancel"
    },


    initialize: function() {

        $(this.el).html(this.template({
            msg: AppLocale.popups.login,
            uri: 'http://recipdonor.com/',
            button1: AppLocale.popups.enter
        }));

        return this;
    },

    accept: function() {
        AppView.render();
        AppPopup.close();
    },

    cancel: function() {
        AppView.render();
        AppPopup.close();
    }
});

PopupBUNKRUPT = PopupAUTHOR.extend({

    initialize: function() {

        $(this.el).html(this.template({
            msg: AppLocale.popups.no_money,
            uri: 'https://www.recipdonor.com/pay/index/1',
            button1: AppLocale.popups.replenish_balance
        }));

        return this;
    }
});

PopupAPIOFF = Backbone.View.extend({
    tagName: 'div',
    className: 'selectdata',

    initialize: function() {
        $(this.el).text(AppLocale.popups.api_error);
        return this;
    }
});

PopupHTTPERROR = Backbone.View.extend({
    tagName: 'div',
    className: 'selectdata',

    initialize: function() {
        $(this.el).text(AppLocale.popups.http_error);
        return this;
    }
});

BlockMassage = Backbone.View.extend({
    el: '.block-msg',
    template: _.template(templates.block_msg.container),


    initialize: function() {
        this.render();
    },

    render: function(){
        $(this.el).html(this.template());
    },

    show: function(popup) {
        this.cur_popup = popup;
        $(this.el).find('.cnt').empty();

        var view = new window[popup]();
        $(this.el).find('.cnt').append(view.render().el);

        //set popup window on the center
        var box = $(this.el).find('.window');
        box.css({'marginLeft': 0 - (box.outerWidth()/2), 'marginTop': 0 - (box.outerHeight()/2)});

        //show popup
        $(this.el).css({visibility: 'visible'}).find('.bg');

    },

    close: function() {
        $(this.el).css({visibility: 'hidden'}).find('.bg').attr({style: ''});
    }
});

BlockLoading = Backbone.View.extend({
    tagName: 'div',
    className: 'loading_with_text',

    initialize: function() {
        $(this.el).text(AppLocale.popups.loading);
        return this;
    }
});

PageValuesRecipient = Backbone.View.extend({
    
    tagName: 'div',
    template: _.template(templates.tooltip.recipient_panel),
    par_button: null,
    
    events: {
      "click .accept": "accept"
    },
    
    initialize: function(model) {
        this.par_button = model;
        $(this.el).html(this.template());
        return this;
    },
    
          
    accept: function() {
        var temp = $('.reciptextbox');
        
        $(this.el).css({visibility: 'hidden'})
        
        var rec_url = temp[0].value;
        var that = this.par_button.button;
        var data = that.get_row_and_names(),
            hash = DataPaging.get_hash('');
        
        if (that.model.get('checking').length === 0 && data.rows.length !== 0) {
            
            window.rdz.utils.RecipientUrl = rec_url;
            that.update_model({checking: data.rows, hash: hash + that.model.get('name'), recipient: rec_url});
            
            AppView.render();
            
            LibRouter.get().execute({ rows:data.rows, param:data.param, hash: hash, recipient: rec_url});
			
	    // if it's start then one model has been added already
            if (!rdz.user.isChecking) {
                checkIndicators.start();
            }
        }
    }
});