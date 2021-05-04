window.CheckCollection = Backbone.Collection.extend({
    /**
     * Returns selected rows (domains or sites) or all rows(if no one row was selected),
     * depends on mode (check/update) and existing values (date !== null),
     * mode = update (obj.check_mode === true) - ignore existing values
     *
     * @param obj {Object}
     * @returns {Array}
     */
    get_selected: function(obj){
        var uris = [],
            self = this;
        obj = obj || {};

        this.each(function(e) {
            var o = e.get('Uri'),
                field = e.get(obj.field_name);

            if ( o.checked &&
                ( !obj.sub_param ? ( obj.check_mode || !obj.check_mode && field.date === null) :
                                     self.is_sub_param_was_checked(obj, field) )
            ) {
                uris.push(obj.is_domain ? o.domain : o.value)
            };
        });

        //if nothing was selected, check all
        if (uris.length === 0) {
            this.each(function(e) {
                var o = e.get('Uri'),
                    field = e.get(obj.field_name);

                if ( !obj.sub_param ? ( obj.check_mode || !obj.check_mode && field.date === null) :
                                        self.is_sub_param_was_checked(obj, field) )
                {
                    uris.push(obj.is_domain ? o.domain : o.value);
                }
            });
        }

        uris = _.uniq(uris);

        return uris;
    },
    is_sub_param_was_checked: function (obj, field){
        return (obj.check_mode || !obj.check_mode && _.isObject(field.value) && field.value[obj.sub_param] === null) && field.date !== null ;
    },
    /* defines work and states of sub button*/
    is_sub_button_active: function(obj){
        /*Hey boars, do not construct functions in this way*/
        var flag = true;
        if (obj.parent_field_name) {
            var parent_is_checking = LibRouter.get({ends:'TableFields'}).get(obj.parent_field_name).get('checking');
            if (parent_is_checking.length > 0) {
                return flag = false;
            }

            flag = false;
            this.each(function(e) {
                var field = e.get(obj.parent_field_name);

                //if (field.date === null) {
                //    return flag = false;
                //}
                
                if (field.date !== null) {
                    return flag = true;
                }
            });
        }
        return flag;
    },
    /**
     * Build request object
     * @param o {Object}
     */
    execute: function(o) {
        //{name:'', request: '', extra: {api:{active:true}}
        var data_page = DataPaging.get('PerPage');

        var r = {
            model: {
                name: o.param.request.name,
                request: o.param.request.request,
                extra: { api:{active: !o.param.without_api } },
                mass_id: null,
                DomainNames: []/*o.rows*/,
                checking_name: o.param.name, //name of field or subfield which checking
                table_field:  o.param.parent_field_name || o.param.name, //table column name, uses when values sets after request
                check_mode: o.param.check_mode,
                hash: o.hash
            },
            url:null,
            receiver: 'callback',

            callback: $.proxy(this.set_values, this)
        };

        //user <update> values (not <checking>, ignore locale cache)
        if(o.param.check_mode) r.ignore_cache = true;

        var rows = this.to_65k_arrays(o.rows);
        rows.forEach(function(i){
            r.model.DomainNames = i;
            r.model.mass_id = rdz.utils.guid();
            
            if (o.bodyData) { // added for Counters
                r.model.bodyData = o.bodyData;
            }

            rdz.model.parameters.Factory.requestOneParameter(r);
        });

    },
    to_65k_arrays: function(rows) {
        var rows_65k = [],
            str = '',
            index = 0,
            len = 0;

            rows.forEach(function(uri) {
                str += uri;
                len = str.length*2;
                index = Math.ceil(len/66560); //~40kb
                rows_65k[index] = rows_65k[index] || [];
                rows_65k[index].push(uri);
            });

        return rows_65k;
    },
    set_values: function(response) {

        var res = response.toJSON(),
            self = this,
            data = [];

        if (res.value && (_.isArray(res.value.new_data) || _.isArray(res.value)))
        {
            //new_data from API by SESSION only
            data = res.value.new_data || res.value;

            /* if hashes the same, we are on the same page */
            if (response.get('hash') === DataPaging.get_hash('')) {

                // AppBlockMassage.show('BlockLoading'); // TODO: change in the future!

                data.forEach(function(e){
                    self.each(function(o){
                        var u = o.get('Uri'),
                            param;

                        if (u.value === e.uri || u.domain === e.uri) {

                                /* CollectionValuesUpdates is used when we need manage behavior of more then one parameters.
                                 * Add <res.request> to CollectionValuesUpdates
                                 */
                                if (CollectionValuesUpdates[res.request]) {
                                    CollectionValuesUpdates[res.request](o, e, u, response.get('hash'));
                                
                                } else { //update String or Number
                                    
                                    if (!e.errors) { // no API errors                                
                                        param = o.get(res.table_field);
                                        param.date = +new Date();
                                        param.date_is_valid = true;
                                        param.value = e.value && e.value.Value !== undefined ? e.value.Value : e.value;
                                    }

                                    //remove checked rows from checking list
                                    CollectionValuesUpdates.update_table_field({name:res.table_field, uri:u, hash: response.get('hash') + response.get('checking_name')});
                                }                           
                        }

                    })
                });
                // AppView.render() // TODO: change in the future!
            } else {
                data.forEach(function(e) {
                    CollectionValuesUpdates.update_table_field({
                        name:response.get('checking_name'),
                        uri:{domain:e.uri, value:e.uri},
                        hash: response.get('hash') + response.get('checking_name')
                    });
                });
            }
        } else
        if (res.value === rdz.errors.AUTHOR)
        {
            CollectionValuesUpdates.update_table_field({name:res.table_field, uri:null});
            AppPopup.show('PopupAUTHOR');
        } else
        if (res.value === rdz.errors.BUNKRUPT)
        {
            CollectionValuesUpdates.update_table_field({name:res.table_field, uri:null});
            AppPopup.show('PopupBUNKRUPT');
        } else
        if (res.value === rdz.errors.APIOFF)
        {
            CollectionValuesUpdates.update_table_field({name:res.table_field, uri:null});
            AppPopup.show('PopupAPIOFF');
        }
        else
        {
            CollectionValuesUpdates.update_table_field({name:res.table_field, uri:null});
            AppPopup.show('PopupHTTPERROR');
            console.log('Something wrong with API response',response)
        }
    }
});

window.CheckSitesCollection = CheckCollection.extend({
    model: CheckSiteModel,
    sqlite: new CheckSiteSQLite
});
CheckSitesCollection.prototype.sync = AppSync;

window.CheckPagesCollection = CheckCollection.extend({
    model: CheckPageModel,
    sqlite: new CheckPageSQLite
});
CheckPagesCollection.prototype.sync = AppSync;

window.CollectionValuesUpdates = {
    //remove checked rows from checking list
    update_table_field: function(obj){
        var field_which_was_sent = AppRequest.get(obj.hash),
            field,
            field_checking_counts;

            if (obj.uri === null) {
                //clear all fields when ERROR
                AppRequest.each(function(f) {
                    field = f.toJSON().model;
                    if (rdz._.isArray(field.get('checking'))) {
                        field.set({checking: []});
                    }
                })
            } else {
                field = field_which_was_sent.toJSON().model;
                field.set({checking: _.without(field.get('checking'), field.get('is_domain') ? obj.uri.domain : obj.uri.value)});
                
                // for Counters
                field_checking_counts = field.get('checkingCounts');
                if (field_checking_counts) {
                    field_checking_counts[field.get('is_domain') ? obj.uri.domain : obj.uri.value] = 0;
                    field.set('checkingCounts', field_checking_counts);
                }
            }
            
            checkIndicators.update();
    },

    IYD: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('IYD');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value = +new Date(value.value.Date) || null;
        }

        this.update_table_field({name:'IYD', uri:uri, hash:hash + 'IYD'});
    },

    IYDP: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('IYDP');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value = +new Date(value.value.Date) || null;
        }

        this.update_table_field({name:'IYDP', uri:uri, hash:hash + 'IYDP'});
    },
    TYC: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('TYC');
            param.date = + new Date();
            param.date_is_valid = true;
            param.value.Catalog = ['-3','0','-1'].indexOf(value.value.Yaca) === -1 ? 1 : 0;
            param.value.TYC = value.value.Cy === -666 ? -1 : value.value.Cy;

            param = row.get('TYCCategory');
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = ['-3','0','-1'].indexOf(value.value.Yaca) === -1 ? value.value.Yaca : null;
        }

            this.update_table_field({name:'TYC', uri:uri, hash:hash + 'TYC'});
            this.update_table_field({name:'TYCCategory', uri:uri, hash:hash + 'TYCCategory'});

    },
    UIMirrorsCount: function(row, value, uri, hash){
        if (!value.errors) { // no API errors
           var param = row.get('TYC');
            param.value.UIMirrorsCount = value.value;
        }

        this.update_table_field({name:'TYC', uri:uri, sub_field:'UIMirrorsCount', hash:hash + 'UIMirrorsCount'});
    },
    YaBar: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('TYCBar');
            param.date = + new Date();
            param.date_is_valid = true;
            param.value.TYCBar = value.value.YaBarCy === -666 ? -1 : value.value.YaBarCy;
            param.value.Topics = ['-3','0','-1'].indexOf(value.value.YaBarYaca) === -1 ? value.value.YaBarYaca : null;
            param.value.Region = value.value.YaBarRegion  || null;

            param = row.get('TYCTopics');
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = ['-3','0','-1'].indexOf(value.value.YaBarYaca) === -1 ? value.value.YaBarYaca : null;

            param = row.get('TYCRegion');
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = value.value.YaBarRegion || null;
        }

        //remove checked rows from checking list
        this.update_table_field({name:'TYCBar', uri:uri, hash:hash + 'TYCBar'});
        this.update_table_field({name:'TYCTopics', uri:uri, hash:hash + 'TYCTopics'});
        this.update_table_field({name:'TYCRegion', uri:uri, hash:hash + 'TYCRegion'});

    },
    PageValues: function(row, value, uri, hash) {
        // if (!value.errors) { // no API errors
            var param = row.get('CountersPage');
            param.date = + new Date();
            param.date_is_valid = true;
        
            var counters_temp_obj = value.value.Counters;
            var counters = {
                IdLiveInternet: null,
                IdRambler: null,
                IdMailRu: null,
                IdOpenStat: null,
                IdHotLog: null,
                IdGA: null,
                IdYaMetrika: null,
                IdBigmir: null,
                IdTopStat: null,
                Idmycounter: null,
                IdLog24: null,
                IdYandeg: null,
                IdMystat: null,
                IdHIT_UA: null,
                IdI_UA: null,
                IdPROext: null,
                IdAlexa: null,
                IdGoogleAdplanner: null,
                IdCompete: null,
                IdQuantcast: null,
                IdGoogleTrends: null,
                IdWebmoneyAdvisor: null
            };
            var siteId;
            var codes;
        
            for (var i = 0; i < counters_temp_obj.length; i++) {
                if (rdz.utils.CountersServices[counters_temp_obj[i].Type]) {
                    if (counters_temp_obj[i].Type === 'GoogleAnalytics') {
                         codes = counters_temp_obj[i].Codes;
                        siteId = codes && codes.length ? codes[0].Code : counters_temp_obj[i].SiteId;
                    } else {
                        siteId = counters_temp_obj[i].SiteId;
                    }
                    counters['Id' + rdz.utils.CountersServices[counters_temp_obj[i].Type]] = siteId  + ''; 
                }      
            }
        
            param.value = counters;
        
            var param = row.get("pageweight");
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = value.value.PageSize;
        
            var param = row.get("LinksIn");
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = value.value.LinksIn > 0 ? value.value.LinksIn : 0;
        
            var param = row.get("LinksOut");
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = value.value.LinksOut > 0 ? value.value.LinksOut : 0;
            //Нужна валидация
        
            var param_page = row.get("CMSpage");
            param_page.date = + new Date();
            param_page.date_is_valid = true;
        
        
            param_page.value = {
                sites: [],
                blogs: [],
                forums: [],
                shops: [],
                galleries: []
            };
        
            var Cmses = value.value.Cmses
            for( var i = 0; i < Cmses.length; i++){
                var type = 'sites';
                if (Cmses[i].Type == "Блог") {
                    type = 'blogs';
                } else if (Cmses[i].Type == "Форум") {
                    type = 'forums';
                } else if (Cmses[i].Type == "Магазин") {
                    type = 'shops';
                } else if (Cmses[i].Type == "Галерея") {
                    type = 'galleries';
                } 
            
                param_page.value[type].push(Cmses[i].Name);
            }
        
            var param = row.get("pagetitle");
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = value.value.Title;
            /*var temp_value = value.value.Title;
            if (temp_value.indexOf("ERROR") === -1 && temp_value.indexOf("REDIRECT") === -1 && temp_value.indexOf("NOTITLE") === -1) {
                param.value = temp_value;
            }*/
        
            var commercials = [];
            var temp_com = value.value.Commercials;
        
            for( var i = 0; i < temp_com.length; i++){
                commercials.push(rdz.utils.CommercialsSevices[temp_com[i].Name]);
            }
        
            var param = row.get("commercials");
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = commercials;
        
            var donors = value.value.Donors,
                rec_url,
                linkPres,
                AnchorText;
        
            if (donors[0]) {
                var donor = donors[0]
            
                var param = row.get("RecipientPage");
                param.date = + new Date();
                param.date_is_valid = true;
                param.value = donor.Url.replace("http://","");
            
                var param = row.get("LinkPresence");
                param.date = + new Date();
                param.date_is_valid = true;
                param.value = 1;
            
                var param = row.get("Anchor");
                param.date = + new Date();
                param.date_is_valid = true;
                param.value = donor.Text[0];
            
            } else { //else if(window.rdz.utils.RecipientUrl !== "") {
                var param = row.get("RecipientPage");
                param.date = + new Date();
                param.date_is_valid = true;
                param.value = window.rdz.utils.RecipientUrl !== "" ? window.rdz.utils.RecipientUrl.replace("http://","") : null;
            
                var param = row.get("LinkPresence");
                param.date = + new Date();
                param.date_is_valid = true;
                param.value = 0;
                
                var param = row.get("Anchor");
                param.date = + new Date();
                param.date_is_valid = true;
                param.value = null;
            }
        // }
        
        checkIndicators.update();        
        
        this.update_table_field({name:'CountersPage', uri:uri, hash:hash + 'CountersPage'});
        this.update_table_field({name:'LinksIn', uri:uri, hash:hash + 'LinksIn'});
        this.update_table_field({name:'LinksOut', uri:uri, hash:hash + 'LinksOut'});
        this.update_table_field({name:'CMSpage', uri:uri, hash:hash + 'CMSpage'});
        this.update_table_field({name:'pageweight', uri:uri, hash:hash + 'pageweight'});
        this.update_table_field({name:'pagetitle', uri:uri, hash:hash + 'pagetitle'});
        this.update_table_field({name:'commercials', uri:uri, hash:hash + 'commercials'});
        this.update_table_field({name:'LinkPresence', uri:uri, hash:hash + 'LinkPresence'});
        this.update_table_field({name:'RecipientPage', uri:uri, hash:hash + 'RecipientPage'});
        this.update_table_field({name:'Anchor', uri:uri, hash:hash + 'Anchor'});
    },
    
    PageValuesDomains: function(row, value, uri, hash) {
        // if (!value.errors) { // no API errors
            var param = row.get('Counters');
            param.date = + new Date();
            param.date_is_valid = true;
        
            var counters_temp_obj = value.value.Counters;
            var counters = {
                IdLiveInternet: null,
                IdRambler: null,
                IdMailRu: null,
                IdOpenStat: null,
                IdHotLog: null,
                IdGA: null,
                IdYaMetrika: null,
                IdBigmir: null,
                IdTopStat: null,
                Idmycounter: null,
                IdLog24: null,
                IdYandeg: null,
                IdMystat: null,
                IdHIT_UA: null,
                IdI_UA: null,
                IdPROext: null,
                IdAlexa: null,
                IdGoogleAdplanner: null,
                IdCompete: null,
                IdQuantcast: null,
                IdGoogleTrends: null,
                IdWebmoneyAdvisor: null
            };
            var siteId;
            var codes;
        
            for (var i = 0; i < counters_temp_obj.length; i++) {
                if (rdz.utils.CountersServices[counters_temp_obj[i].Type]) {
                    if (counters_temp_obj[i].Type === 'GoogleAnalytics') {
                         codes = counters_temp_obj[i].Codes;
                        siteId = codes && codes.length ? codes[0].Code : counters_temp_obj[i].SiteId;
                    } else {
                        siteId = counters_temp_obj[i].SiteId;
                    }
                    counters['Id' + rdz.utils.CountersServices[counters_temp_obj[i].Type]] = siteId  + ''; 
                }         
            }   
        
            param.value = counters;
            
            var param = row.get("CMS");
            param.date = + new Date();
            param.date_is_valid = true;        
        
            param.value =   {
                            sites: [],
                            blogs: [],
                            forums: [],
                            shops: [],
                            galleries: []
            };
        
            var Cmses = value.value.Cmses
            for( var i = 0; i < Cmses.length; i++){
                var type = 'sites';
                if (Cmses[i].Type == "Блог") {
                    type = 'blogs';
                } else if (Cmses[i].Type == "Форум") {
                    type = 'forums';
                } else if (Cmses[i].Type == "Магазин") {
                    type = 'shops';
                } else if (Cmses[i].Type == "Галерея") {
                    type = 'galleries';
                } 
            
                param.value[type].push(Cmses[i].Name);
            }
        
            var commercials = [];
            var temp_com = value.value.Commercials;
            
            for( var i = 0; i < temp_com.length; i++){
                commercials.push(rdz.utils.CommercialsSevices[temp_com[i].Name]);
            }
        
            var param = row.get("commercialsDomains");
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = commercials;
        
            var param = row.get("LinksInDomain");
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = value.value.LinksIn > 0 ? value.value.LinksIn : 0;
        
            var param = row.get("LinksOutDomain");
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = value.value.LinksOut > 0 ? value.value.LinksOut : 0;
        
            var param = row.get("pageweightDomain");
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = value.value.PageSize;
        
            var param = row.get("pagetitleDomain");
            param.date = + new Date();
            param.date_is_valid = true;
            param.value = value.value.Title;
        
        // }
        
        checkIndicators.update();
        
        this.update_table_field({name:'Counters', uri:uri, hash:hash + 'Counters'});
        this.update_table_field({name:'CMS', uri:uri, hash:hash + 'CMS'});
        this.update_table_field({name:'commercialsDomains', uri:uri, hash:hash + 'commercialsDomains'});
        this.update_table_field({name:'LinksInDomain', uri:uri, hash:hash + 'LinksInDomain'});
        this.update_table_field({name:'LinksOutDomain', uri:uri, hash:hash + 'LinksOutDomain'});
        this.update_table_field({name:'pageweightDomain', uri:uri, hash:hash + 'pageweightDomain'});
        this.update_table_field({name:'pagetitleDomain', uri:uri, hash:hash + 'pagetitleDomain'});
        
    },
    
        
    CheckDangerous: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            if (value.value != undefined) {
                var param = row.get('Dangerous');
                var sum = 0;    
            
                param.date = +new Date();
                param.date_is_valid = true;
            
                for (var name in rdz.utils.Dangerous) {
                  if (value.value.Dangerous.indexOf(name) !== -1) {
                     sum += rdz.utils.Dangerous[name];  
                  }
                }
            
                param.value = sum;            
            }
        }
        
        this.update_table_field({name:'Dangerous', uri:uri, hash:hash + 'Dangerous'});
    },
    
    CheckDangerousPage: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            if (value.value != undefined) {
            
                var param = row.get('DangerousPage');
                var sum = 0;    
            
                param.date = +new Date();
                param.date_is_valid = true;
            
                for (var name in rdz.utils.Dangerous) {
                  if (value.value.Dangerous.indexOf(name) !== -1) {
                     sum += rdz.utils.Dangerous[name];  
                  }
                }
                
                param.value = sum;
                    
            }
        }
        
        this.update_table_field({name:'DangerousPage', uri:uri, hash:hash + 'DangerousPage'});
    },
    
    Alexa: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('Alexa');
            param.date = +new Date();
            param.date_is_valid = true;
            if (value.value > -2) {
                param.value.Value = value.value;
            } else {
                param.value.Value = 0;
            }
        }
        
        this.update_table_field({name:'Alexa', uri:uri, hash:hash + 'Alexa'});
    },
    
    BackA: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('BackAlexa');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value = value.value;
        }
        
        this.update_table_field({name:'BackAlexa', uri:uri, hash:hash + 'BackAlexa'});
    },
    
        AlexaPage: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('AlexaPage');
            param.date = +new Date();
            param.date_is_valid = true;
            if (value.value > -2) {
                 param.value.Value = value.value;
            } else {
                param.value.Value = 0;
            }
        }
        
        this.update_table_field({name:'AlexaPage', uri:uri, hash:hash + 'AlexaPage'});
    },
    
    BackAPage: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('BackAlexaPage');
        
            param.date = +new Date();
            param.date_is_valid = true;
            param.value = value.value;
        }
        
        this.update_table_field({name:'BackAlexaPage', uri:uri, hash:hash + 'BackAlexaPage'});
    },
    
    Solomono: function(row, value, uri, hash) {
       if (!value.errors) { // no API errors
            var param = row.get('Solomono');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value.din = value.value.LinksIn;
            param.value.dout = value.value.LinksOut;
        
        
            var param = row.get('ISolomono');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value.index = value.value.Value;
       }
      
        checkIndicators.update();
        
        this.update_table_field({name:'Solomono', uri:uri, hash:hash + 'Solomono'});
        this.update_table_field({name:'ISolomono', uri:uri, hash:hash + 'ISolomono'});
    },
    
    PRMain: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('PR');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value.Value = value.value;
        }
        
        this.update_table_field({name:'PR', uri:uri, hash:hash + 'PR'});
    },

    PR: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('PRpage');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value.Value = value.value;
        }

        this.update_table_field({name:'PRpage', uri:uri, hash:hash + 'PRpage'});
    },
    WA: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('WA');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value = rdz.utils.convert_WA_api_date(value.value.Wa || null);
        }

        this.update_table_field({name:'WA', uri:uri, hash:hash + 'WA'});
    },
    Dmoz: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('DMOZ');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value.Value = value.value;

            param = row.get('PR');
            param.value.DMOZ = value.value;

            param = row.get('PRpage');
            param.value.DMOZ = value.value;
        }

        this.update_table_field({name:'DMOZ', uri:uri, hash:hash + 'DMOZ'});
    },
    
    SolomonoPage: function(row, value, uri, hash) {
       if (!value.errors) { // no API errors
            var param = row.get('SolomonoPage');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value.din = value.value.LinksIn;
            param.value.dout = value.value.LinksOut;
        
        
            var param = row.get('ISolomonoPage');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value.index = value.value.Value;
       }
      
        checkIndicators.update();
        
        this.update_table_field({name:'SolomonoPage', uri:uri, hash:hash + 'SolomonoPage'});
        this.update_table_field({name:'ISolomonoPage', uri:uri, hash:hash + 'ISolomonoPage'});
    },
    
    SocialNetworksMass: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('SocialNetworks');
            param.date = +new Date();
            param.date_is_valid = true;
            
            var value_obj = {
                GoogleOne: {
                    value: 0
                },
                FacebookLike : {
                    value: 0
                },
                TwitterLike : {
                    value: 0
                },
                VkLike : {
                    value: {Value: 0,  FromFrame: 0}
                }
            }
            if (value.fullValue[0]) {
                value_obj.VkLike.value.Value = value.fullValue[0].Value.Value;
            }
            if (value.fullValue[1]) {
                value_obj.FacebookLike.value = value.fullValue[1].Value.Value;
            }
            if (value.fullValue[2]) {
                value_obj.TwitterLike.value = value.fullValue[2].Value.Value;
            }
            if (value.fullValue[3]) {
                value_obj.GoogleOne.value = value.fullValue[3].Value.Value;
            }
            
            param.value = value_obj;
        }
        
        this.update_table_field({name:'SocialNetworks', uri:uri, hash:hash + 'SocialNetworks'});
    },
    
    SocialNetworkspage: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('SocialNetworkspage');
            param.date = +new Date();
            param.date_is_valid = true;
        
            var value_obj = {
                GoogleOne: {
                    value: 0
                },
                FacebookLike : {
                    value: 0
                },
                TwitterLike : {
                    value: 0
                },
                VkLike : {
                    value: {Value: 0,  FromFrame: 0}
                }
            }
            if (value.fullValue[0]) {
                value_obj.VkLike.value.Value = value.fullValue[0].Value.Value;
            }
            if (value.fullValue[1]) {
                value_obj.FacebookLike.value = value.fullValue[1].Value.Value;
            }
            if (value.fullValue[2]) {
                value_obj.TwitterLike.value = value.fullValue[2].Value.Value;
            }
            if (value.fullValue[3]) {
                value_obj.GoogleOne.value = value.fullValue[3].Value.Value;
            }
	
            param.value = value_obj;
        }
        
        this.update_table_field({name:'SocialNetworkspage', uri:uri, hash:hash + 'SocialNetworkspage'});
    },
    
    APICounters: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('Counters');
            param.date = + new Date();
            param.date_is_valid = true;
            
            var paramPage = row.get('CountersPage');
            paramPage.date = + new Date();
            paramPage.date_is_valid = true;
        
            var counters_temp_obj = value.fullValue;
            var counters = {
                LiveInternet: null,
                Rambler: null,
                MailRu: null,
                OpenStat: null,
                HotLog: null,
                GA: null,
                YaMetrika: null,
                Bigmir: null,
                TopStat: null,
                mycounter: null,
                Log24: null,
                Yandeg: null,
                Mystat: null,
                HIT_UA: null,
                I_UA: null,
                PROext: null,
                Alexa: null,
                GoogleAdplanner: null,
                Compete: null,
                Quantcast: null,
                GoogleTrends: null,
                WebmoneyAdvisor: null
            };
            
            for(var i = 0; i < counters_temp_obj.length; i++){
                if (rdz.utils.CountersServices[counters_temp_obj[i].Value.CounterType]) {
                    counters[rdz.utils.CountersServices[counters_temp_obj[i].Value.CounterType]] = counters_temp_obj[i].Value.Value; 
                }      
            }

            param.value = _.extend(param.value, counters); // !!!
            paramPage.value = _.extend(paramPage.value, counters); // !!!
        
            //param.value.UICounters = true;
            //paramPage.value.UICounters = true;
        }
        
        this.update_table_field({name:'Counters', uri:uri, sub_field:'UICounters', hash:hash + 'UICounters'});
        this.update_table_field({name:'CountersPage', uri:uri, sub_field:'UICounters', hash:hash + 'UICounters'});
    },
    
    PRpageMain: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('PRpageMain');   
            param.date = +new Date();
            param.date_is_valid = true;
            param.value.Value = value.value;
        }

        this.update_table_field({name:'PRpageMain', uri:uri, hash:hash + 'PRpageMain'});
    },
    
    Majestic: function(row, value, uri, hash) {
        if (!value.errors) { // no API errors
            var param = row.get('MJ');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value = value.value.ReferringDomains;
            
            var param = row.get('CF');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value = value.value.CitationFlow;
            
            var param = row.get('TF');
            param.date = +new Date();
            param.date_is_valid = true;
            param.value = value.value.TrustFlow;
            
            //param = row.get('TYCCategory');
            //param.date = + new Date();
            //param.date_is_valid = true;
            //param.value = ['-3','0','-1'].indexOf(value.value.Yaca) === -1 ? value.value.Yaca : null;
        }

        this.update_table_field({name:'MJ', uri:uri, hash:hash + 'MJ'});
        this.update_table_field({name:'CF', uri:uri, hash:hash + 'CF'});
        this.update_table_field({name:'TF', uri:uri, hash:hash + 'TF'});

    },
};

window.CheckIndicators = Backbone.Collection.extend({
    
    model: Backbone.Model.extend({
        idAttribute: 'name',
        
        defaults: {
            time: 0,
            timeAtStop: 0, // time when checking is finished
            count: 0,
            name: ''
        },
        
        updateTime: function() {
            this.set('time', this.get('time') + 1);
            if (this.isChecking()) {
                this.set('timeAtStop', this.get('time'));
            }
        },        
        
        getTimeString: function() {
            var sec = this.isChecking() ? this.get('time') : this.get('timeAtStop');
            return ( Math.floor(sec/(60*60)) < 10 ? "0" + Math.floor(sec/(60*60)) : Math.floor(sec/(60*60)) ) +
                ":" +
                ( (Math.floor(sec/60) % 60) < 10 ? "0" + (Math.floor(sec/60) % 60) : (Math.floor(sec/60) % 60) ) +
                ":" +
                ( sec % 60 < 10 ? "0" + sec % 60 : sec % 60 );
        },
        
        getCheckedCount: function() {
            var domain,
                checking = 0,
                checkingCounts = AppRequest.get(this.id).toJSON().model.get('checkingCounts');
                
            if (checkingCounts) { // for Counters
                for (domain in checkingCounts) {
                    checking += checkingCounts[domain];
                }
            } else {
                checking = AppRequest.get(this.id).toJSON().model.get('checking').length;
            }
            
            return this.get('count') - checking;
        },
        
        isChecking: function() {
          return this.getCheckedCount() !== this.get('count');  
        }
    }),
    
    initialize : function() {
        rdz.user.isChecking = false;
        rdz.user.tooltipOpened = false;
        rdz.user.indicators_tooltip_timers = [];
    },
    
    getState: function(){
        return {isChecking: this.isChecking(), newTime: this.getNewTime(), checkingCount: this.getCheckingCount()};
    },
    
    isChecking: function() {
      var checkingCount = 0;
      this.each(function(m) {            
            checkingCount += AppRequest.get(m.id).toJSON().model.get('checking').length;
      });
      
      return checkingCount > 0 && this.length > 0;
    },
    
    getCheckingCount: function(){
        var checkingCount = {
            checked: 0,
            total: 0
        };    
        
        this.each(function(m) {            
            checkingCount.checked += m.getCheckedCount();
            checkingCount.total += m.get('count');
        });
        
        if (checkingCount.total > 0) {
            checkingCount.progress = Math.floor(100 * checkingCount.checked / checkingCount.total);
        } else {
            checkingCount.progress = null;
        }
       
        return checkingCount;
    },
    
    update: function() {
        
        if (!this.isChecking()) {
            this.stop();
        }
        
        // rendering indicators is in AppView
    },
    
    getNewTime: function(){
        var timeArray = [],
            sec;
            
        this.each(function(m) {            
            timeArray.push(m.get('time'));
        });
        
        sec = timeArray.length > 0 ? _.max(timeArray) : 0;
        
        return ( Math.floor(sec/(60*60)) < 10 ? "0" + Math.floor(sec/(60*60)) : Math.floor(sec/(60*60)) ) +
                ":" +
                ( (Math.floor(sec/60) % 60) < 10 ? "0" + (Math.floor(sec/60) % 60) : (Math.floor(sec/60) % 60) ) +
                ":" +
                ( sec % 60 < 10 ? "0" + sec % 60 : sec % 60 );
    },
    
    updateTime: function() {
        this.each(function(m) {
            m.updateTime();
        }); 
    },
    
    start: function() {
        rdz.user.isChecking = true;
        AppView.render();
        
        rdz.user.indicators_timer = setInterval(function() {            
            checkIndicators.updateTime();
            AppView.renderTimer();
        }, 1000);
        
        rdz.user.update_table_timer = setInterval(function() {   // TODO: change in the future!
            // console.log('!!!')
            AppView.render();
        }, 10 * 1000);
    },
    
    stop: function() {
        clearInterval(rdz.user.indicators_timer);
        $(".progressbar").mouseleave();
        rdz.user.indicators_tooltip_timers = [];
        rdz.user.isChecking = false;
        
        // remove all models
        while (checkIndicators.length > 0) {
            checkIndicators.shift();
        }
        
        
        clearInterval(rdz.user.update_table_timer); // TODO: change in the future!
        AppView.render();
    }
});

