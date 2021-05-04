TableCheck = Backbone.View.extend({

    events: {
        "click .mode" :       "select_mode",
        "mouseenter .select": "toggleTooltip",
        "mouseleave .select": "toggleTooltip",
        "click .type"       : "check_mode",
        "mouseenter .button": "hover",
        "mouseleave .button": "hover",
        "mouseenter .mode"  : "hover",
        "mouseleave .mode"  : "hover",
        "click .button"     : "start_check"
    },

    template: _.template(templates.check_panel.select),
    initialize: function () {
        return this.render();
    },

    render: function() {
        var model = this.model.toJSON();

        //hide buttons which doesn't have requests
        if (typeof window.rdz.TableFieldsToRequest[model.name].name !== "undefined") {
            var data = this.get_row_and_names();
             this.$el.html(this.template({
                name: AppLocale.start_check.buttons[model.name] || AppLocale.popup_bg.table_fields[model.name],
                cls:model.name + (this.model.get('checking').length === 0 && this.is_sub_button_active(model) ? '' : ' disable')
            }));
        }

        return this;
    },

    select_mode: function(){
        if (this.model.get('checking').length === 0) {
            $('.scp').find('.contextmenu').remove();
            this.$el.find('.cnt').append(_.template(templates.context_menu.check_buttons)());

            $(window).on('click.start_check', function(e){
                if (e.target.className !== 'mode') {
                    $('.scp').find('.contextmenu').remove();
                    $(window).off('click.start_check');
                }
            });
        }
    },
    check_mode: function(e){
        this.model.set({check_mode: Boolean($(e.target).data('mode'))})
    },
    toggleTooltip: function(e) {

            if (e.type === "mouseenter")
            {
                var model = this.model.toJSON();
                if (model.checking.length === 0 && this.is_sub_button_active(model)) {
                    this.$el.find('.cnt').append(_.template(templates.tooltip.check_buttons)(this.tooltip_data()));
                }
            }
            else if (e.type === "mouseleave")
            {
                this.$el.find('.tooltip').remove()
            }

    },
    tooltip_data: function(){
        var data = this.get_row_and_names(),
            name = data.sub_param || data.name,
            price = rdz.cache.get(['API', 'Prices', name]);
            
        if (name === "Seo") {
            // (price) * (active markets number)
            price = price * _.keys(rdz.utils.Seo_NumberByName).length;
        }    

        return {
            check_mode: this.model.get('check_mode'),
            list: this.tooltip_list(name),
            selected: data.rows.length,
            sum: (data.rows.length ?  rdz.utils.toFixed(price * data.rows.length, 5) : 0)
        }
    },
    tooltip_list: function(name){

        return [AppLocale.popup_bg.table_fields[name]];
    },
    get_selected_row: function(obj){
        return LibRouter.get().get_selected(obj);
    },
    hover: function(e){

        var el = this.$el.find('.button');
        if (e.type === "mouseenter")
        {
            var model = this.model.toJSON();
            if (model.checking.length === 0 && this.is_sub_button_active(model)) {
                el.width(el.width());
                el.html(AppLocale.start_check[this.model.get('check_mode')? 'update' : 'check']);
            }
        }
        else if (e.type === "mouseleave")
        {
            el.html(AppLocale.start_check.buttons[this.model.get('name')] ||AppLocale.popup_bg.table_fields[this.model.get('name')])
        }
    },
    start_check: function(){
        var data = this.get_row_and_names(),
            hash = DataPaging.get_hash('');

        if (typeof this.before_start_check === "function") this.before_start_check();

        if (this.model.get('checking').length === 0 && data.rows.length !== 0) {


            this.update_model({checking: data.rows, hash: hash + this.model.get('name')});

            AppView.render();

            LibRouter.get().execute({ rows:data.rows, param:data.param, hash: hash});
            
            // if it's start then one model has been added already
            if (!rdz.user.isChecking) {
                checkIndicators.start();
            }            
        }
    },

    update_model: function(o) {
        this.model.set(o);

        //save request
        AppRequest.add({ name: o.hash, model: this.model });
        
        // set the indicator
        checkIndicators.add({ name: o.hash, count: this.model.get('checking').length});
    },
    //helper function
    get_row_and_names: function() {
        var param = this.model.toJSON(),
            param_name = param.parent_field_name || param.name,
            rows = this.get_selected_row({
                field_name: param_name,
                check_mode: param.check_mode,
                is_domain: param.is_domain,
                sub_param: param.parent_field_name && param.name
            });

        return {rows: rows, name: param_name, param: param, sub_param: param.parent_field_name && param.name}
    },
    /*manage view for additional buttons */
    is_sub_button_active: function (obj) {
        return LibRouter.get().is_sub_button_active(obj);
    }
});

TableCheckTYC = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['TYCCategory']];
    },
    update_model: function(o) {
        this.model.set(o);
        //LibRouter.get({ends:'TableFields'}).get('TYCCategory').set(o);        
        var collection = LibRouter.get({ends:'TableFields'});
        var tycCategoryModel = collection.get('TYCCategory');
        tycCategoryModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('TYC'), model: this.model });
        AppRequest.add({ name: DataPaging.get_hash('TYCCategory'), model: tycCategoryModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('TYC'), count: this.model.get('checking').length});
        // checkIndicators.add({ name: DataPaging.get_hash('TYCCategory'), count: tycCategoryModel.get('checking').length});
    }
};

TableCheckTYCCategory = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['TYC']];
    },
    update_model: function(o) {
        this.model.set(o);
        //LibRouter.get({ends:'TableFields'}).get('TYC').set(o);
        var collection = LibRouter.get({ends:'TableFields'});
        var tycModel = collection.get('TYC');
        tycModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('TYC'), model: tycModel});
        AppRequest.add({ name: DataPaging.get_hash('TYCCategory'), model: this.model });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('TYC'), count: tycModel.get('checking').length});
        // checkIndicators.add({ name: DataPaging.get_hash('TYCCategory'), count: this.model.get('checking').length});
    }
};
TableCheckTYCBar = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['TYCTopics'], AppLocale.popup_bg.table_fields['TYCRegion']];
    },
    update_model: function(o) {
        this.model.set(o);
        /*LibRouter.get({ends:'TableFields'}).get('TYCTopics').set(o);*
        LibRouter.get({ends:'TableFields'}).get('TYCRegion').set(o);*/
        var collection = LibRouter.get({ends:'TableFields'});
        
        var tycBarModel = collection.get('TYCBar');
        tycBarModel.set(o);
        
        var tycTopicsModel = collection.get('TYCTopics');
        tycTopicsModel.set(o);
        
        var tycRegionModel = collection.get('TYCRegion');
        tycRegionModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('TYCBar'), model: this.model });
        AppRequest.add({ name: DataPaging.get_hash('TYCTopics'), model: tycTopicsModel });
        AppRequest.add({ name: DataPaging.get_hash('TYCRegion'), model: tycRegionModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('TYCBar'), count: this.model.get('checking').length});
        // checkIndicators.add({ name: DataPaging.get_hash('TYCTopics'), count: tycTopicsModel.get('checking').length});
        // checkIndicators.add({ name: DataPaging.get_hash('TYCRegion'), count: tycRegionModel.get('checking').length});
    }
};
TableCheckTYCTopics = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields['TYCBar'], AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['TYCRegion']];
    },
    update_model: function(o) {
        this.model.set(o);
        /*LibRouter.get({ends:'TableFields'}).get('TYCBar').set(o);
        LibRouter.get({ends:'TableFields'}).get('TYCRegion').set(o);*/
        var collection = LibRouter.get({ends:'TableFields'});
        
        var tycBarModel = collection.get('TYCBar');
        tycBarModel.set(o);
        
        var tycTopicsModel = collection.get('TYCTopics');
        tycTopicsModel.set(o);
        
        var tycRegionModel = collection.get('TYCRegion');
        tycRegionModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('TYCBar'), model: tycBarModel });
        AppRequest.add({ name: DataPaging.get_hash('TYCTopics'), model: this.model });
        AppRequest.add({ name: DataPaging.get_hash('TYCRegion'), model: tycRegionModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('TYCBar'), count: tycBarModel.get('checking').length});
        // checkIndicators.add({ name: DataPaging.get_hash('TYCTopics'), count: this.model.get('checking').length});
        // checkIndicators.add({ name: DataPaging.get_hash('TYCRegion'), count: tycRegionModel.get('checking').length});
    }
};
TableCheckTYCRegion = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields['TYCBar'], AppLocale.popup_bg.table_fields['TYCTopics'], AppLocale.popup_bg.table_fields[name],];
    },
    update_model: function(o) {
        this.model.set(o);
        /*LibRouter.get({ends:'TableFields'}).get('TYCBar').set(o);
        LibRouter.get({ends:'TableFields'}).get('TYCTopics').set(o);*/
        var collection = LibRouter.get({ends:'TableFields'});
        
        var tycBarModel = collection.get('TYCBar');
        tycBarModel.set(o);
        
        var tycTopicsModel = collection.get('TYCTopics');
        tycTopicsModel.set(o);
        
        var tycRegionModel = collection.get('TYCRegion');
        tycRegionModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('TYCBar'), model: tycBarModel });
        AppRequest.add({ name: DataPaging.get_hash('TYCTopics'), model: tycTopicsModel });
        AppRequest.add({ name: DataPaging.get_hash('TYCRegion'), model: this.model });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('TYCBar'), count: tycBarModel.get('checking').length});
        // checkIndicators.add({ name: DataPaging.get_hash('TYCTopics'), count: tycTopicsModel.get('checking').length});
        // checkIndicators.add({ name: DataPaging.get_hash('TYCRegion'), count: this.model.get('checking').length});
    }
};
TableCheckUIMirrorsCount = {
    before_start_check:function(){
        var data = this.get_row_and_names();

        LibRouter.get().each(function(row){
            var TYC = row.get('TYC');
            if (TYC.date !== null && data.rows.indexOf(row.get('Uri').domain) !== -1) {
                TYC.value.UIMirrorsCount = null;
            }
        })
    }
};

TableCheckLinksIn = {
    start_check: function(e) {
        
        var data = this.get_row_and_names();
        
        if (data.rows.length > 0) {
            
            if(!$(AppView.el).find('.recpanel')[0]){
            
                var view = new window['PageValuesRecipient']({button: this});
                    $(this.el).find('.cnt').append(view.render().el);
                
            }
        }
    },
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['RecipientPage'], AppLocale.popup_bg.table_fields['LinksOut'], AppLocale.popup_bg.table_fields['pageweight'], AppLocale.popup_bg.table_fields['commercials'], AppLocale.popup_bg.table_fields['CMSpage'], AppLocale.popup_bg.table_fields['pagetitle'], AppLocale.popup_bg.table_fields['LinkPresence'], AppLocale.popup_bg.table_fields['Anchor']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var linksInModel = collection.get('LinksIn');
        linksInModel.set(o);
        
        var linksOutModel = collection.get('LinksOut');
        linksOutModel.set(o);
        
        var pageweightModel = collection.get('pageweight');
        pageweightModel.set(o);
        
        var pagetitleModel = collection.get('pagetitle');
        pagetitleModel.set(o);
        
        var cmspageModel = collection.get('CMSpage');
        cmspageModel.set(o);
        
        var commercialsModel = collection.get('commercials');
        commercialsModel.set(o);
        
        var RecipientPageModel = collection.get('RecipientPage');
        RecipientPageModel.set(o);
        
        var LinkPresenceModel = collection.get('LinkPresence');
        LinkPresenceModel.set(o);
        
        var AnchorModel = collection.get('Anchor');
        AnchorModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('LinksIn'), model: linksInModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOut'), model: linksOutModel });
        AppRequest.add({ name: DataPaging.get_hash('CMSpage'), model: cmspageModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweight'), model: pageweightModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitle'), model: pagetitleModel });
        AppRequest.add({ name: DataPaging.get_hash('commercials'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('RecipientPage'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('LinkPresence'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('Anchor'), model: commercialsModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('LinksIn'), count: this.model.get('checking').length});
    }
};

TableCheckLinksOut = {
    start_check: function(e) {
        
        var data = this.get_row_and_names();
        
        if (data.rows.length > 0) {
            
            if(!$(AppView.el).find('.recpanel')[0]){
            
                var view = new window['PageValuesRecipient']({button: this});
                    $(this.el).find('.cnt').append(view.render().el);
                
            }
        }
    },
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['RecipientPage'], AppLocale.popup_bg.table_fields['LinksIn'], AppLocale.popup_bg.table_fields['pageweight'], AppLocale.popup_bg.table_fields['commercials'], AppLocale.popup_bg.table_fields['CMSpage'], AppLocale.popup_bg.table_fields['pagetitle'], AppLocale.popup_bg.table_fields['LinkPresence'], AppLocale.popup_bg.table_fields['Anchor']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var linksInModel = collection.get('LinksIn');
        linksInModel.set(o);
        
        var linksOutModel = collection.get('LinksOut');
        linksOutModel.set(o);
        
        var pageweightModel = collection.get('pageweight');
        pageweightModel.set(o);
        
        var pagetitleModel = collection.get('pagetitle');
        pagetitleModel.set(o);
        
        var cmspageModel = collection.get('CMSpage');
        cmspageModel.set(o);
        
        var commercialsModel = collection.get('commercials');
        commercialsModel.set(o);
        
        var RecipientPageModel = collection.get('RecipientPage');
        RecipientPageModel.set(o);
        
        var LinkPresenceModel = collection.get('LinkPresence');
        LinkPresenceModel.set(o);
        
        var AnchorModel = collection.get('Anchor');
        AnchorModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('LinksIn'), model: linksInModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOut'), model: linksOutModel });
        AppRequest.add({ name: DataPaging.get_hash('CMSpage'), model: cmspageModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweight'), model: pageweightModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitle'), model: pagetitleModel });
        AppRequest.add({ name: DataPaging.get_hash('commercials'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('RecipientPage'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('LinkPresence'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('Anchor'), model: commercialsModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('LinksOut'), count: this.model.get('checking').length});
    }
};
TableCheckpageweight = {
    start_check: function(e) {
        
        var data = this.get_row_and_names();
        
        if (data.rows.length > 0) {
            
            if(!$(AppView.el).find('.recpanel')[0]){
            
                var view = new window['PageValuesRecipient']({button: this});
                    $(this.el).find('.cnt').append(view.render().el);
                
            }
        }
    },
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['RecipientPage'], AppLocale.popup_bg.table_fields['LinksIn'], AppLocale.popup_bg.table_fields['LinksOut'], AppLocale.popup_bg.table_fields['commercials'], AppLocale.popup_bg.table_fields['CMSpage'], AppLocale.popup_bg.table_fields['pagetitle'], AppLocale.popup_bg.table_fields['LinkPresence'], AppLocale.popup_bg.table_fields['Anchor']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var linksInModel = collection.get('LinksIn');
        linksInModel.set(o);
        
        var linksOutModel = collection.get('LinksOut');
        linksOutModel.set(o);
        
        var pageweightModel = collection.get('pageweight');
        pageweightModel.set(o);
        
        var pagetitleModel = collection.get('pagetitle');
        pagetitleModel.set(o);
        
        var cmspageModel = collection.get('CMSpage');
        cmspageModel.set(o);
        
        var commercialsModel = collection.get('commercials');
        commercialsModel.set(o);
        
        var RecipientPageModel = collection.get('RecipientPage');
        RecipientPageModel.set(o);
        
        var LinkPresenceModel = collection.get('LinkPresence');
        LinkPresenceModel.set(o);
        
        var AnchorModel = collection.get('Anchor');
        AnchorModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('LinksIn'), model: linksInModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOut'), model: linksOutModel });
        AppRequest.add({ name: DataPaging.get_hash('CMSpage'), model: cmspageModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweight'), model: pageweightModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitle'), model: pagetitleModel });
        AppRequest.add({ name: DataPaging.get_hash('commercials'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('RecipientPage'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('LinkPresence'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('Anchor'), model: commercialsModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('CMSpage'), count: this.model.get('checking').length});
    }
    
};
TableCheckCMSpage = {
    start_check: function(e) {
        
        var data = this.get_row_and_names();
        
        if (data.rows.length > 0) {
            
            if(!$(AppView.el).find('.recpanel')[0]){
            
                var view = new window['PageValuesRecipient']({button: this});
                    $(this.el).find('.cnt').append(view.render().el);
                
            }
        }
    },
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['RecipientPage'], AppLocale.popup_bg.table_fields['LinksIn'], AppLocale.popup_bg.table_fields['LinksOut'], AppLocale.popup_bg.table_fields['commercials'], AppLocale.popup_bg.table_fields['pageweight'], AppLocale.popup_bg.table_fields['pagetitle'], AppLocale.popup_bg.table_fields['LinkPresence'], AppLocale.popup_bg.table_fields['Anchor']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var linksInModel = collection.get('LinksIn');
        linksInModel.set(o);
        
        var linksOutModel = collection.get('LinksOut');
        linksOutModel.set(o);
        
        var pageweightModel = collection.get('pageweight');
        pageweightModel.set(o);
        
        var pagetitleModel = collection.get('pagetitle');
        pagetitleModel.set(o);
        
        var cmspageModel = collection.get('CMSpage');
        cmspageModel.set(o);
        
        var commercialsModel = collection.get('commercials');
        commercialsModel.set(o);
        
        var RecipientPageModel = collection.get('RecipientPage');
        RecipientPageModel.set(o);
        
        var LinkPresenceModel = collection.get('LinkPresence');
        LinkPresenceModel.set(o);
        
        var AnchorModel = collection.get('Anchor');
        AnchorModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('LinksIn'), model: linksInModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOut'), model: linksOutModel });
        AppRequest.add({ name: DataPaging.get_hash('CMSpage'), model: cmspageModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweight'), model: pageweightModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitle'), model: pagetitleModel });
        AppRequest.add({ name: DataPaging.get_hash('commercials'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('RecipientPage'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('LinkPresence'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('Anchor'), model: commercialsModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('pageweight'), count: this.model.get('checking').length});
    }
};

TableCheckpagetitle = {
    start_check: function(e) {
        
        var data = this.get_row_and_names();
        
        if (data.rows.length > 0) {
            
            if(!$(AppView.el).find('.recpanel')[0]){
            
                var view = new window['PageValuesRecipient']({button: this});
                    $(this.el).find('.cnt').append(view.render().el);
                
            }
        }
    },
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['RecipientPage'], AppLocale.popup_bg.table_fields['LinksIn'], AppLocale.popup_bg.table_fields['LinksOut'], AppLocale.popup_bg.table_fields['commercials'], AppLocale.popup_bg.table_fields['pageweight'], AppLocale.popup_bg.table_fields['CMSpage'], AppLocale.popup_bg.table_fields['LinkPresence'], AppLocale.popup_bg.table_fields['Anchor']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var linksInModel = collection.get('LinksIn');
        linksInModel.set(o);
        
        var linksOutModel = collection.get('LinksOut');
        linksOutModel.set(o);
        
        var pageweightModel = collection.get('pageweight');
        pageweightModel.set(o);
        
        var pagetitleModel = collection.get('pagetitle');
        pagetitleModel.set(o);
        
        var cmspageModel = collection.get('CMSpage');
        cmspageModel.set(o);
        
        var commercialsModel = collection.get('commercials');
        commercialsModel.set(o);
        
        var RecipientPageModel = collection.get('RecipientPage');
        RecipientPageModel.set(o);
        
        var LinkPresenceModel = collection.get('LinkPresence');
        LinkPresenceModel.set(o);
        
        var AnchorModel = collection.get('Anchor');
        AnchorModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('LinksIn'), model: linksInModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOut'), model: linksOutModel });
        AppRequest.add({ name: DataPaging.get_hash('CMSpage'), model: cmspageModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweight'), model: pageweightModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitle'), model: pagetitleModel });
        AppRequest.add({ name: DataPaging.get_hash('commercials'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('RecipientPage'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('LinkPresence'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('Anchor'), model: commercialsModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('pagetitle'), count: this.model.get('checking').length});
    }
};

TableCheckcommercials = {
    start_check: function(e) {
        
        var data = this.get_row_and_names();
        
        if (data.rows.length > 0) {
            
            if(!$(AppView.el).find('.recpanel')[0]){
            
                var view = new window['PageValuesRecipient']({button: this});
                    $(this.el).find('.cnt').append(view.render().el);
                
            }
        }
    },
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['RecipientPage'], AppLocale.popup_bg.table_fields['LinksIn'], AppLocale.popup_bg.table_fields['LinksOut'], AppLocale.popup_bg.table_fields['pagetitle'], AppLocale.popup_bg.table_fields['pageweight'], AppLocale.popup_bg.table_fields['CMSpage'], AppLocale.popup_bg.table_fields['LinkPresence'], AppLocale.popup_bg.table_fields['Anchor']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var linksInModel = collection.get('LinksIn');
        linksInModel.set(o);
        
        var linksOutModel = collection.get('LinksOut');
        linksOutModel.set(o);
        
        var pageweightModel = collection.get('pageweight');
        pageweightModel.set(o);
        
        var pagetitleModel = collection.get('pagetitle');
        pagetitleModel.set(o);
        
        var cmspageModel = collection.get('CMSpage');
        cmspageModel.set(o);
        
        var commercialsModel = collection.get('commercials');
        commercialsModel.set(o);
        
        var RecipientPageModel = collection.get('RecipientPage');
        RecipientPageModel.set(o);
        
        var LinkPresenceModel = collection.get('LinkPresence');
        LinkPresenceModel.set(o);
        
        var AnchorModel = collection.get('Anchor');
        AnchorModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('LinksIn'), model: linksInModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOut'), model: linksOutModel });
        AppRequest.add({ name: DataPaging.get_hash('CMSpage'), model: cmspageModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweight'), model: pageweightModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitle'), model: pagetitleModel });
        AppRequest.add({ name: DataPaging.get_hash('commercials'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('RecipientPage'), model: RecipientPageModel });
        AppRequest.add({ name: DataPaging.get_hash('LinkPresence'), model: LinkPresenceModel });
        AppRequest.add({ name: DataPaging.get_hash('Anchor'), model: AnchorModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('commercials'), count: this.model.get('checking').length});
    }
    
};


TableCheckRecipientPage = {
    start_check: function(e) {
        
        var data = this.get_row_and_names();
        
        if (data.rows.length > 0) {
            
            if(!$(AppView.el).find('.recpanel')[0]){
            
                var view = new window['PageValuesRecipient']({button: this});
                    $(this.el).find('.cnt').append(view.render().el);
                
            }
        }
    },
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['commercials'], AppLocale.popup_bg.table_fields['LinksIn'], AppLocale.popup_bg.table_fields['LinksOut'], AppLocale.popup_bg.table_fields['pagetitle'], AppLocale.popup_bg.table_fields['pageweight'], AppLocale.popup_bg.table_fields['CMSpage'], AppLocale.popup_bg.table_fields['LinkPresence'], AppLocale.popup_bg.table_fields['Anchor']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var linksInModel = collection.get('LinksIn');
        linksInModel.set(o);
        
        var linksOutModel = collection.get('LinksOut');
        linksOutModel.set(o);
        
        var pageweightModel = collection.get('pageweight');
        pageweightModel.set(o);
        
        var pagetitleModel = collection.get('pagetitle');
        pagetitleModel.set(o);
        
        var cmspageModel = collection.get('CMSpage');
        cmspageModel.set(o);
        
        var commercialsModel = collection.get('commercials');
        commercialsModel.set(o);
        
        var RecipientPageModel = collection.get('RecipientPage');
        RecipientPageModel.set(o);
        
        var LinkPresenceModel = collection.get('LinkPresence');
        LinkPresenceModel.set(o);
        
        var AnchorModel = collection.get('Anchor');
        AnchorModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('LinksIn'), model: linksInModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOut'), model: linksOutModel });
        AppRequest.add({ name: DataPaging.get_hash('CMSpage'), model: cmspageModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweight'), model: pageweightModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitle'), model: pagetitleModel });
        AppRequest.add({ name: DataPaging.get_hash('commercials'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('RecipientPage'), model: RecipientPageModel });
        AppRequest.add({ name: DataPaging.get_hash('LinkPresence'), model: LinkPresenceModel });
        AppRequest.add({ name: DataPaging.get_hash('Anchor'), model: AnchorModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('RecipientPage'), count: this.model.get('checking').length});
    }
    
};


TableCheckLinkPresence = {
    start_check: function(e) {
        
        var data = this.get_row_and_names();
        
        if (data.rows.length > 0) {
            
            if(!$(AppView.el).find('.recpanel')[0]){
            
                var view = new window['PageValuesRecipient']({button: this});
                    $(this.el).find('.cnt').append(view.render().el);
                
            }
        }
    },
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['commercials'], AppLocale.popup_bg.table_fields['LinksIn'], AppLocale.popup_bg.table_fields['LinksOut'], AppLocale.popup_bg.table_fields['pagetitle'], AppLocale.popup_bg.table_fields['pageweight'], AppLocale.popup_bg.table_fields['CMSpage'], AppLocale.popup_bg.table_fields['RecipientPage'], AppLocale.popup_bg.table_fields['Anchor']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var linksInModel = collection.get('LinksIn');
        linksInModel.set(o);
        
        var linksOutModel = collection.get('LinksOut');
        linksOutModel.set(o);
        
        var pageweightModel = collection.get('pageweight');
        pageweightModel.set(o);
        
        var pagetitleModel = collection.get('pagetitle');
        pagetitleModel.set(o);
        
        var cmspageModel = collection.get('CMSpage');
        cmspageModel.set(o);
        
        var commercialsModel = collection.get('commercials');
        commercialsModel.set(o);
        
        var RecipientPageModel = collection.get('RecipientPage');
        RecipientPageModel.set(o);
        
        var LinkPresenceModel = collection.get('LinkPresence');
        LinkPresenceModel.set(o);
        
        var AnchorModel = collection.get('Anchor');
        AnchorModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('LinksIn'), model: linksInModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOut'), model: linksOutModel });
        AppRequest.add({ name: DataPaging.get_hash('CMSpage'), model: cmspageModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweight'), model: pageweightModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitle'), model: pagetitleModel });
        AppRequest.add({ name: DataPaging.get_hash('commercials'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('RecipientPage'), model: RecipientPageModel });
        AppRequest.add({ name: DataPaging.get_hash('LinkPresence'), model: LinkPresenceModel });
        AppRequest.add({ name: DataPaging.get_hash('Anchor'), model: AnchorModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('LinkPresence'), count: this.model.get('checking').length});
    }
    
};

TableCheckAnchor = {
    start_check: function(e) {
        
        var data = this.get_row_and_names();
        
        if (data.rows.length > 0) {
            
            if(!$(AppView.el).find('.recpanel')[0]){
            
                var view = new window['PageValuesRecipient']({button: this});
                    $(this.el).find('.cnt').append(view.render().el);
                
            }
        }
    },
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['commercials'], AppLocale.popup_bg.table_fields['LinksIn'], AppLocale.popup_bg.table_fields['LinksOut'], AppLocale.popup_bg.table_fields['pagetitle'], AppLocale.popup_bg.table_fields['pageweight'], AppLocale.popup_bg.table_fields['CMSpage'], AppLocale.popup_bg.table_fields['RecipientPage'], AppLocale.popup_bg.table_fields['LinkPresence']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var linksInModel = collection.get('LinksIn');
        linksInModel.set(o);
        
        var linksOutModel = collection.get('LinksOut');
        linksOutModel.set(o);
        
        var pageweightModel = collection.get('pageweight');
        pageweightModel.set(o);
        
        var pagetitleModel = collection.get('pagetitle');
        pagetitleModel.set(o);
        
        var cmspageModel = collection.get('CMSpage');
        cmspageModel.set(o);
        
        var commercialsModel = collection.get('commercials');
        commercialsModel.set(o);
        
        var RecipientPageModel = collection.get('RecipientPage');
        RecipientPageModel.set(o);
        
        var LinkPresenceModel = collection.get('LinkPresence');
        LinkPresenceModel.set(o);
        
        var AnchorModel = collection.get('Anchor');
        AnchorModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('LinksIn'), model: linksInModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOut'), model: linksOutModel });
        AppRequest.add({ name: DataPaging.get_hash('CMSpage'), model: cmspageModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweight'), model: pageweightModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitle'), model: pagetitleModel });
        AppRequest.add({ name: DataPaging.get_hash('commercials'), model: commercialsModel });
        AppRequest.add({ name: DataPaging.get_hash('RecipientPage'), model: RecipientPageModel });
        AppRequest.add({ name: DataPaging.get_hash('LinkPresence'), model: LinkPresenceModel });
        AppRequest.add({ name: DataPaging.get_hash('Anchor'), model: AnchorModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('Anchor'), count: this.model.get('checking').length});
    }
    
};



TableCheckCMS = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['commercialsDomains'], AppLocale.popup_bg.table_fields['LinksInDomain'], AppLocale.popup_bg.table_fields['LinksOutDomain'], AppLocale.popup_bg.table_fields['pagetitleDomain'], AppLocale.popup_bg.table_fields['pageweightDomain']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var cmspageModel = collection.get('CMS');
        cmspageModel.set(o);
        
        var commercialsDomainsModel = collection.get('commercialsDomains');
        commercialsDomainsModel.set(o);
        
        var LinksInDomainModel = collection.get('LinksInDomain');
        LinksInDomainModel.set(o);
        
        var LinksOutDomainModel = collection.get('LinksOutDomain');
        LinksOutDomainModel.set(o);
        
        var pagetitleDomainModel = collection.get('pagetitleDomain');
        pagetitleDomainModel.set(o);
        
        var pageweightDomainModel = collection.get('pageweightDomain');
        pageweightDomainModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('CMS'), model: cmspageModel });
        AppRequest.add({ name: DataPaging.get_hash('commercialsDomains'), model: commercialsDomainsModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksInDomain'), model: LinksInDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOutDomain'), model: LinksOutDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitleDomain'), model: pagetitleDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweightDomain'), model: pageweightDomainModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('CMS'), count: this.model.get('checking').length});
        
    }
};

TableCheckcommercialsDomains = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['CMS'], AppLocale.popup_bg.table_fields['LinksInDomain'], AppLocale.popup_bg.table_fields['LinksOutDomain'], AppLocale.popup_bg.table_fields['pagetitleDomain'], AppLocale.popup_bg.table_fields['pageweightDomain']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var cmspageModel = collection.get('CMS');
        cmspageModel.set(o);
        
        var commercialsDomainsModel = collection.get('commercialsDomains');
        commercialsDomainsModel.set(o);
        
        var LinksInDomainModel = collection.get('LinksInDomain');
        LinksInDomainModel.set(o);
        
        var LinksOutDomainModel = collection.get('LinksOutDomain');
        LinksOutDomainModel.set(o);
        
        var pagetitleDomainModel = collection.get('pagetitleDomain');
        pagetitleDomainModel.set(o);
        
        var pageweightDomainModel = collection.get('pageweightDomain');
        pageweightDomainModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('CMS'), model: cmspageModel });
        AppRequest.add({ name: DataPaging.get_hash('commercialsDomains'), model: commercialsDomainsModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksInDomain'), model: LinksInDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOutDomain'), model: LinksOutDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitleDomain'), model: pagetitleDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweightDomain'), model: pageweightDomainModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('commercialsDomains'), count: this.model.get('checking').length});
    }
};

TableCheckLinksInDomain = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['CMS'], AppLocale.popup_bg.table_fields['commercialsDomains'], AppLocale.popup_bg.table_fields['LinksOutDomain'], AppLocale.popup_bg.table_fields['pagetitleDomain'], AppLocale.popup_bg.table_fields['pageweightDomain']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var cmsModel = collection.get('CMS');
        cmsModel.set(o);
        
        var commercialsDomainsModel = collection.get('commercialsDomains');
        commercialsDomainsModel.set(o);
        
        var LinksInDomainModel = collection.get('LinksInDomain');
        LinksInDomainModel.set(o);
        
        var LinksOutDomainModel = collection.get('LinksOutDomain');
        LinksOutDomainModel.set(o);
        
        var pagetitleDomainModel = collection.get('pagetitleDomain');
        pagetitleDomainModel.set(o);
        
        var pageweightDomainModel = collection.get('pageweightDomain');
        pageweightDomainModel.set(o);
    
        AppRequest.add({ name: DataPaging.get_hash('CMS'), model: cmsModel });
        AppRequest.add({ name: DataPaging.get_hash('commercialsDomains'), model: commercialsDomainsModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksInDomain'), model: LinksInDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOutDomain'), model: LinksOutDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitleDomain'), model: pagetitleDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweightDomain'), model: pageweightDomainModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('LinksInDomain'), count: this.model.get('checking').length});
    }
};

TableCheckLinksOutDomain = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['CMS'], AppLocale.popup_bg.table_fields['commercialsDomains'], AppLocale.popup_bg.table_fields['LinksInDomain'], AppLocale.popup_bg.table_fields['pagetitleDomain'], AppLocale.popup_bg.table_fields['pageweightDomain']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var cmsModel = collection.get('CMS');
        cmsModel.set(o);
        
        var commercialsDomainsModel = collection.get('commercialsDomains');
        commercialsDomainsModel.set(o);
        
        var LinksInDomainModel = collection.get('LinksInDomain');
        LinksInDomainModel.set(o);
        
        var LinksOutDomainModel = collection.get('LinksOutDomain');
        LinksOutDomainModel.set(o);
        
        var pagetitleDomainModel = collection.get('pagetitleDomain');
        pagetitleDomainModel.set(o);
        
        var pageweightDomainModel = collection.get('pageweightDomain');
        pageweightDomainModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('CMS'), model: cmsModel });
        AppRequest.add({ name: DataPaging.get_hash('commercialsDomains'), model: commercialsDomainsModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksInDomain'), model: LinksInDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOutDomain'), model: LinksOutDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitleDomain'), model: pagetitleDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweightDomain'), model: pageweightDomainModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('LinksOutDomain'), count: this.model.get('checking').length});
    }
};

TableCheckpagetitleDomain = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['CMS'], AppLocale.popup_bg.table_fields['commercialsDomains'], AppLocale.popup_bg.table_fields['LinksInDomain'], AppLocale.popup_bg.table_fields['LinksOutDomain'], AppLocale.popup_bg.table_fields['pageweightDomain']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var cmsModel = collection.get('CMS');
        cmsModel.set(o);
        
        var commercialsDomainsModel = collection.get('commercialsDomains');
        commercialsDomainsModel.set(o);
        
        var LinksInDomainModel = collection.get('LinksInDomain');
        LinksInDomainModel.set(o);
        
        var LinksOutDomainModel = collection.get('LinksOutDomain');
        LinksOutDomainModel.set(o);
        
        var pagetitleDomainModel = collection.get('pagetitleDomain');
        pagetitleDomainModel.set(o);
        
        var pageweightDomainModel = collection.get('pageweightDomain');
        pageweightDomainModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('CMS'), model: cmsModel });
        AppRequest.add({ name: DataPaging.get_hash('commercialsDomains'), model: commercialsDomainsModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksInDomain'), model: LinksInDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOutDomain'), model: LinksOutDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitleDomain'), model: pagetitleDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweightDomain'), model: pageweightDomainModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('pagetitleDomain'), count: this.model.get('checking').length});
    }
};

TableCheckpageweightDomain = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['CMS'], AppLocale.popup_bg.table_fields['commercialsDomains'], AppLocale.popup_bg.table_fields['LinksInDomain'], AppLocale.popup_bg.table_fields['LinksOutDomain'], AppLocale.popup_bg.table_fields['pagetitleDomain']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var cmsModel = collection.get('CMS');
        cmsModel.set(o);
        
        var commercialsDomainsModel = collection.get('commercialsDomains');
        commercialsDomainsModel.set(o);
        
        var LinksInDomainModel = collection.get('LinksInDomain');
        LinksInDomainModel.set(o);
        
        var LinksOutDomainModel = collection.get('LinksOutDomain');
        LinksOutDomainModel.set(o);
        
        var pagetitleDomainModel = collection.get('pagetitleDomain');
        pagetitleDomainModel.set(o);
        
        var pageweightDomainModel = collection.get('pageweightDomain');
        pageweightDomainModel.set(o);
        
        AppRequest.add({ name: DataPaging.get_hash('CMS'), model: cmsModel });
        AppRequest.add({ name: DataPaging.get_hash('commercialsDomains'), model: commercialsDomainsModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksInDomain'), model: LinksInDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('LinksOutDomain'), model: LinksOutDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pagetitleDomain'), model: pagetitleDomainModel });
        AppRequest.add({ name: DataPaging.get_hash('pageweightDomain'), model: pageweightDomainModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('pageweightDomain'), count: this.model.get('checking').length});
    }
};


TableCheckSolomono = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['ISolomono']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var SolomonoModel = collection.get('Solomono');
        SolomonoModel.set(o);
        
        var ISolomonoModel = collection.get('ISolomono');
        ISolomonoModel.set(o);
    
        AppRequest.add({ name: DataPaging.get_hash('Solomono'), model: SolomonoModel });
        AppRequest.add({ name: DataPaging.get_hash('ISolomono'), model: ISolomonoModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('Solomono'), count: this.model.get('checking').length});
    }
};

TableCheckISolomono = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['Solomono']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var SolomonoModel = collection.get('Solomono');
        SolomonoModel.set(o);
        
        var ISolomonoModel = collection.get('ISolomono');
        ISolomonoModel.set(o);
    
        AppRequest.add({ name: DataPaging.get_hash('Solomono'), model: SolomonoModel });
        AppRequest.add({ name: DataPaging.get_hash('ISolomono'), model: ISolomonoModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('ISolomono'), count: this.model.get('checking').length});
    }
};

TableCheckSolomonoPage = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['ISolomonoPage']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var SolomonoModel = collection.get('SolomonoPage');
        SolomonoModel.set(o);
        
        var ISolomonoModel = collection.get('ISolomonoPage');
        ISolomonoModel.set(o);
    
        AppRequest.add({ name: DataPaging.get_hash('SolomonoPage'), model: SolomonoModel });
        AppRequest.add({ name: DataPaging.get_hash('ISolomonoPage'), model: ISolomonoModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('SolomonoPage'), count: this.model.get('checking').length});
    }
};

TableCheckISolomonoPage = {
    tooltip_list: function(name){
        return [AppLocale.popup_bg.table_fields[name], AppLocale.popup_bg.table_fields['SolomonoPage']];
    },
    update_model: function(o) {
        this.model.set(o);
        
        var collection = LibRouter.get({ends:'TableFields'});
        
        var SolomonoModel = collection.get('SolomonoPage');
        SolomonoModel.set(o);
        
        var ISolomonoModel = collection.get('ISolomonoPage');
        ISolomonoModel.set(o);
    
        AppRequest.add({ name: DataPaging.get_hash('SolomonoPage'), model: SolomonoModel });
        AppRequest.add({ name: DataPaging.get_hash('ISolomonoPage'), model: ISolomonoModel });
        
        // set the indicator
        checkIndicators.add({ name: DataPaging.get_hash('ISolomonoPage'), count: this.model.get('checking').length});
    }
};

TableCheckCounters = {
    tooltip_list: function(name){
        return [AppLocale.start_check.buttons[name]];
    }
};

TableCheckCountersPage = {
    tooltip_list: function(name){
        return [AppLocale.start_check.buttons[name]];
    }
};

TableCheckUICounters = {
    before_start_check: function(){
        var data = this.get_row_and_names(),
            counters,
            hasValue,
            c;

        LibRouter.get().each(function(row){
            counters = row.get('Counters');
            hasValue = false
            for (c in counters.value) {
                if (typeof counters.value[c] === 'number') {
                    hasValue = true;
                }
            }
            if (counters.date !== null /*&& data.rows.indexOf(row.get('Uri').domain) !== -1*/) {
                if (!hasValue) {
                    counters.value.UICounters = null;
                }
            }        
        });
    },
    start_check: function(){         
        var data,
            hash = DataPaging.get_hash(''),
            lib = window[LibRouter.get({str: true})],
            value,
            e,            
            bodyData = [],
            rows = []; // check only sites which have counters

        if (typeof this.before_start_check === "function") this.before_start_check();
        data = this.get_row_and_names();
        console.log(data)

        if (this.model.get('checking').length === 0 && data.rows.length !== 0) {
            
            // add every id to bodyData
            lib.each(function(m) {
                value = m.get('Counters').value;                
                for (e in value) {                    
                    if (/^Id/.test(e) && value[e]) {
                        bodyData.push({
                            SiteId: value[e],
                            CounterType: rdz.utils.CountersDBNames[e.substr(2)],
                            Url: m.get('Uri').domain
                        });
                        
                        rows.push(m.get('Uri').domain);
                    }                    
                }          
            });
            rows = _.uniq(rows);            
            
            if (rows.length > 0) {                
                this.update_model({checking: rows, hash: hash + this.model.get('name')});

                AppView.render();       

                LibRouter.get().execute({ rows:data.rows, param:data.param, hash: hash, bodyData: bodyData}); // add bodyData
            
                // if it's start then one model has been added already
                if (!rdz.user.isChecking) {
                    checkIndicators.start();
                } 
            }                      
        }
    }
};
