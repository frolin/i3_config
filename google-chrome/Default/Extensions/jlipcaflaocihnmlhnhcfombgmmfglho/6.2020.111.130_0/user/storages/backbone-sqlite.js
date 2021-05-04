// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

var SQLiteMethods = {

  // Save the current state of the **Model** to *database*.
  save: function() {

  },

  // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
  // have an id of it's own.
  create: function(method, model, options) {
     /* if (!model.id) model.id = model.attributes.id = guid();
      this.data[model.id] = model;
      //this.save();
      return model;*/
  },

  // Update a model by replacing its copy in `this.data`.
  update: function(method, model, options) {
      /*this.data[model.id] = model;
      //this.save();
      return model;*/
  },

  // Retrieve a model from `this.data` by id.
  find: function(method, model, options) {
      //return this.data[model.id];
  },

  // Return the array of all models currently in database.
  findAll: function(method, model, options) {
        //define data's length which we will show on each page
        var from  = (DataPaging.get('PerPage').get('page') - 1) * DataPaging.get('PerPage').get('value'),
            limit = DataPaging.get('PerPage').get('value'),
            tab_id = DataPaging.get('PerPage').get('id');

        return _.values(this.data({from:from, limit: limit, until:limit + from, tab_id: tab_id}, method, model, options));
  },

  // Delete a model from `this.data`, returning it.
  destroy: function(method, model, options) {
      /*delete this.data[model.id];
      //this.save();
      return model;*/
  }

};

SQLiteMethods.success = function(options, resp){
    if (resp) {
        options.success(resp);
        if(options.callback) {
            options.callback(options.args);
        }
    } else {
        options.error("Record not found");
    }
};

var SQLiteMaping = {
    SitesLibrary: function (a) {      

        var sql_data = a.sql_data,
            sql_data_seo = a.sql_data_seo || [],
			sql_data_counters = a.sql_data_counters || [],
			sql_data_likes = a.sql_data_likes || [];

        var app_sql = [];
            for (var i = 0, l = sql_data.length; i < l; i++ ) {
                sql_data_seo[i] = sql_data_seo[i] || {};
                sql_data_counters[i] = sql_data_counters[i] || {};
                sql_data_likes[i] = sql_data_likes[i] || {};


                app_sql.push({
                    
                    IP: {
                        name: 'IP',
                        value: {
                	   IP: sql_data[i]['SlIP'],  
                	   SitesCount: sql_data[i]['SlIPSitesCount'],
                	   SitesCountSolomono: sql_data[i]['SlIPSitesCountSolomono'],
                	   SitesCountRDS: sql_data[i]['SlIPSitesCountRDS']
                	},
                        date: sql_data[i]['SlIPCheckDate']
                    },
                    
                    Host: {
                    	name: 'Host',
                	value: {
                			Host: sql_data[i]['SlHost']               			
                	},
                	date: sql_data[i]['SlGeoCheckDate']
            	    },
                    
                    Provider: {
                    	   name: 'Provider',
                		value: {
                			Provider: sql_data[i]['SlProvider']               			
                		},
                	   date: sql_data[i]['SlGeoCheckDate']
            	     },
                    
                    Geo: {
                    	name: 'Geo',
                		value: {
                			Flag: sql_data[i]['SlFlag'], 
                			Country: sql_data[i]['SlCountry'],
                			City: sql_data[i]['SlCity']                			
                		},
                		date: sql_data[i]['SlGeoCheckDate']
            	    },            		
                    
                    /*Url: {
                        name: 'Url',
                        value: sql_data[i]['SlUrl'],
                        recipient: sql_data[i]['SlRecipient'],
                        www: sql_data[i]['SlTYCMirror'] && sql_data[i]['SlTYCMirror'].indexOf('www.'),
                        checked: false
                    },*/

                    Uri: {
                        name: 'Uri',
                        value: sql_data[i]['SlUrl'] + (sql_data[i]['PlUri'] || ''),
                        domain: sql_data[i]['SlUrl'],
                        path: (sql_data[i]['PlUri'] || ''),
                        date: sql_data[i]['PlCreateDate'] || null,
                        www: sql_data[i]['PlWwwFlag'] || sql_data[i]['SlTYCMirror'] && sql_data[i]['SlTYCMirror'].indexOf('www.'),
                        checked: false
                    },

                    positions: {
                    	name: 'positions',
                		value: {
                            yandex: sql_data[i]['SlpositionsYandex'],
                            google: sql_data[i]['SlpositionsGoogle']
                        },
                		date: sql_data[i]['SlpositionsCheckDate']
            		},

                    positionspage: {
                        name: 'positionspage',
                        value: {
                            yandex: sql_data[i]['PlpositionspageYandex'],
                            google: sql_data[i]['PlpositionspageGoogle']
                        },
                        date: sql_data[i]['PlpositionspageCheckDate']
                    },
                    
                    RecipientPage: {
                        name: 'RecipientPage',
                        value: sql_data[i]['PlRecipientUrl'],
                        date: sql_data[i]['PlRecipientUrlCheckDate'],
                        date_is_valid: sql_data[i]['PlRecipientUrlCheckDate'] === rdz.db.validate({name: 'recipientPage', date:sql_data[i]['PlRecipientUrlCheckDate'],  action:'date'})
                    },
                    
                    Nesting: {
                        name: 'Nesting',
                        value: sql_data[i]['PlNesting'],
                        date: sql_data[i]['PlNestingCheckDate'],
                        date_is_valid: sql_data[i]['PlNestingCheckDate'] === rdz.db.validate({name: 'Nesting', date:sql_data[i]['PlNestingCheckDate'],  action:'date'})
                    },

                    Seo: {
                        name: 'Seo',
                        value: (function(){
                            var data = [], notindb = false;
                                _.each(
                                    _(sql_data_seo).filter(function(e) {
                                        if (e.SlUrl === sql_data[i]['SlUrl'] && e.SmInMarket === null) notindb = true;
                                        return e.SlUrl === sql_data[i]['SlUrl'] && e.SmInMarket === 1
                                    }),
                                    function(e) {data.push(e.SmMarketId)}
                                );

                            return notindb ? null :  data;
                        }()),
                        date:  (function(){
                            /*var d = _(sql_data_seo).find(function(e) { if (e.SlUrl === sql_data[i]['SlUrl']) { return e.SmCheckDate} });
                            return d ? d.SmCheckDate : null;*/
                            
                           var d, checkDates = [], minCheckDate = null, e;                                                        
                           
                           sql_data_seo.forEach(function(e){ if (e.SlUrl === sql_data[i]['SlUrl']) { checkDates.push(e.SmCheckDate); } });                                                                                          
                                                    
                           // min check date
                           minCheckDate = Math.min.apply(null, checkDates);
                           
                           // check if all seo markets was checked and min check date for current site is actual
                           d = (checkDates.length === _.keys(rdz.utils.Seo_NumberByName).length)
                              && (minCheckDate === rdz.db.validate({name: "Seo", date: minCheckDate,  action: 'date'})) 
                            
                           return d ? minCheckDate : null;
                        }()),
                        
                        date_is_valid: true
                    },
                    
                    commercialsDomains: {
                        name: 'commercialsDomains',
                        value: (function(){
                           var str = sql_data[i]['Slcommercials'];
                           if (str != null) {
                              var data = str.split('\272');
                              var result = [];
                              for (var j = 0; j < data.length; j++) {
                                 if (rdz.utils.CommercialsSevices[data[j]]) {
                                    result.push(rdz.utils.CommercialsSevices[data[j]]); 
                                 }                                 
                              }
                              
                              return result;
                           } else {
                              return null;
                           }
                        }()),
                        date: sql_data[i]['SlcommercialsCheckDate'],
                        date_is_valid: sql_data[i]['SlcommercialsCheckDate'] === rdz.db.validate({name: 'commercials', date:sql_data[i]['SlcommercialsCheckDate'],  action:'date'})
                    },
                     
                    commercials: {
                        name: 'commercials',
                        value: (function(){
                           var str = sql_data[i]['Plcommercials'];
                           if (str != null) {
                              var data = str.split('\272');
                              var result = [];
                              for (var j = 0; j < data.length; j++) {
                                 if (rdz.utils.CommercialsSevices[data[j]]) {
                                    result.push(rdz.utils.CommercialsSevices[data[j]]); 
                                 }  

                              }                             
                              return result;
                           } else {
                              return null;
                           }
                        }()),
                        date: sql_data[i]['PlcommercialsCheckDate'],
                        date_is_valid: sql_data[i]['PlcommercialsCheckDate'] === rdz.db.validate({name: 'commercials', date:sql_data[i]['PlcommercialsCheckDate'],  action:'date'})
                     },
                    
                    Counters: {
                        name: 'Counters',
                        value: {
                           IdLiveInternet: sql_data_counters[i]['CIdLiveInternet'] || null,
			   IdRambler: sql_data_counters[i]['CIdRambler'] || null,
			   IdMailRu: sql_data_counters[i]['CIdMailRu'] || null,
			   IdOpenStat: sql_data_counters[i]['CIdSpyLog'] || null,
			   IdHotLog: sql_data_counters[i]['CIdHotLog'] || null,
			   IdGA: sql_data_counters[i]['CIdGA'] || null,
			   IdYaMetrika: sql_data_counters[i]['CIdYaMetrika'] || null,
			   IdBigmir: sql_data_counters[i]['CIdBigmir'] || null,
			   IdTopStat: sql_data_counters[i]['CIdTopStat'] || null,
			   Idmycounter: sql_data_counters[i]['CIdmycounter'] || null,
			   IdLog24: sql_data_counters[i]['CIdLog24'] || null,
			   IdYandeg: sql_data_counters[i]['CIdYandeg'] || null,
			   IdMystat: sql_data_counters[i]['CIdMystat'] || null,
			   IdHIT_UA: sql_data_counters[i]['CIdHIT_UA'] || null,
			   IdI_UA: sql_data_counters[i]['CIdI_UA'] || null,
			   IdPROext: sql_data_counters[i]['CIdPROext'] || null,
                	   LiveInternet: sql_data_counters[i]['CLiveInternet'],
                	   Rambler: sql_data_counters[i]['CRambler'],
                	   MailRu: sql_data_counters[i]['CMailRu'],
                	   OpenStat: sql_data_counters[i]['CSpyLog'],
                	   HotLog: sql_data_counters[i]['CHotLog'],
                	   GA: sql_data_counters[i]['CGA'],
                	   YaMetrika: sql_data_counters[i]['CYaMetrika'],
                	   Bigmir: sql_data_counters[i]['CBigmir'],
                	   TopStat: sql_data_counters[i]['CTopStat'],
                	   mycounter: sql_data_counters[i]['Cmycounter'],
                	   Log24: sql_data_counters[i]['CLog24'],
                	   Yandeg: sql_data_counters[i]['CYandeg'],
                	   Mystat: sql_data_counters[i]['CMystat'],
                	   HIT_UA: sql_data_counters[i]['CHIT_UA'],
                	   I_UA: sql_data_counters[i]['CI_UA'],
                	   PROext: sql_data_counters[i]['CPROext'],
                	   Alexa: sql_data_counters[i]['CAlexa'],
                	   GoogleAdplanner: sql_data[i]['SlGoogleAdplanner'],
                	   Compete: sql_data[i]['SlCompete'],
                	   Quantcast: sql_data[i]['SlQuantcast'],
                	   GoogleTrends: sql_data[i]['SlGoogleTrends'],
			   WebmoneyAdvisor: sql_data[i]['SlWebmoneyTrafficIndex'] || sql_data[i]['SlWebmoneyTrafficIndex'] === 0 ? sql_data[i]['SlWebmoneyTrafficIndex'] * 30 : null
                	},
                        date: sql_data_counters[i]['CCheckDate'] || null,
                        date_is_valid: sql_data_counters[i]['CCheckDate'] === rdz.db.validate({name: 'Counters', date:sql_data_counters[i]['CCheckDate'] || null,  action:'date'})
                     },
                     
                     CountersPage: {
                        name: 'CountersPage',
                        value: {
                           IdLiveInternet: sql_data_counters[i]['CIdLiveInternet'] || null,
			   IdRambler: sql_data_counters[i]['CIdRambler'] || null,
			   IdMailRu: sql_data_counters[i]['CIdMailRu'] || null,
			   IdOpenStat: sql_data_counters[i]['CIdSpyLog'] || null,
			   IdHotLog: sql_data_counters[i]['CIdHotLog'] || null,
			   IdGA: sql_data_counters[i]['CIdGA'] || null,
			   IdYaMetrika: sql_data_counters[i]['CIdYaMetrika'] || null,
			   IdBigmir: sql_data_counters[i]['CIdBigmir'] || null,
			   IdTopStat: sql_data_counters[i]['CIdTopStat'] || null,
			   Idmycounter: sql_data_counters[i]['CIdmycounter'] || null,
			   IdLog24: sql_data_counters[i]['CIdLog24'] || null,
			   IdYandeg: sql_data_counters[i]['CIdYandeg'] || null,
			   IdMystat: sql_data_counters[i]['CIdMystat'] || null,
			   IdHIT_UA: sql_data_counters[i]['CIdHIT_UA'] || null,
			   IdI_UA: sql_data_counters[i]['CIdI_UA'] || null,
			   IdPROext: sql_data_counters[i]['CIdPROext'] || null,
                	   LiveInternet: sql_data_counters[i]['CLiveInternet'],
                	   Rambler: sql_data_counters[i]['CRambler'],
                	   MailRu: sql_data_counters[i]['CMailRu'],
                	   OpenStat: sql_data_counters[i]['CSpyLog'],
                	   HotLog: sql_data_counters[i]['CHotLog'],
                	   GA: sql_data_counters[i]['CGA'],
                	   YaMetrika: sql_data_counters[i]['CYaMetrika'],
                	   Bigmir: sql_data_counters[i]['CBigmir'],
                	   TopStat: sql_data_counters[i]['CTopStat'],
                	   mycounter: sql_data_counters[i]['Cmycounter'],
                	   Log24: sql_data_counters[i]['CLog24'],
                	   Yandeg: sql_data_counters[i]['CYandeg'],
                	   Mystat: sql_data_counters[i]['CMystat'],
                	   HIT_UA: sql_data_counters[i]['CHIT_UA'],
                	   I_UA: sql_data_counters[i]['CI_UA'],
                	   PROext: sql_data_counters[i]['CPROext'],
                	   Alexa: sql_data_counters[i]['CAlexa'],
                	   GoogleAdplanner: sql_data[i]['SlGoogleAdplanner'],
                	   Compete: sql_data[i]['SlCompete'],
                	   Quantcast: sql_data[i]['SlQuantcast'],
                	   GoogleTrends: sql_data[i]['SlGoogleTrends'],
			   WebmoneyAdvisor: sql_data[i]['SlWebmoneyTrafficIndex'] || sql_data[i]['SlWebmoneyTrafficIndex'] === 0 ? sql_data[i]['SlWebmoneyTrafficIndex'] * 30 : null
                	},
                        date: sql_data_counters[i]['CCheckDate'] || null,
                        date_is_valid: sql_data_counters[i]['CCheckDate'] === rdz.db.validate({name: 'Counters', date:sql_data_counters[i]['CCheckDate'] || null,  action:'date'})
                     },
                    
                    linkspurch: {
                        name: 'linkspurch',
                        value: sql_data[i]['Sllinkspurch'],
                        date: sql_data[i]['SllinkspurchCheckDate'],
                        date_is_valid: sql_data[i]['SllinkspurchCheckDate'] === rdz.db.validate({name: 'LinksBuy', date:sql_data[i]['SllinkspurchCheckDate'],  action:'date'})
                    },

                    TYC: {
                        name: 'TYC',
                        value: {
                            TYC: sql_data[i]['SlTYC'],
                            UIMirrorsCount: sql_data[i]['SlTYCMirrors'],
                            Catalog: sql_data[i]['SlTYCCatalog']
                        },
                        date: sql_data[i]['SlTYCCheckDate'],
                        date_is_valid: sql_data[i]['SlTYCCheckDate'] === rdz.db.validate({name: 'TYC', date:sql_data[i]['SlTYCCheckDate'],  action:'date'})
                    },

                    TYCBar: {
                        name: 'TYCBar',
                        value: {
                        	TYCBar: sql_data[i]['SlTYCBar'],
                        	Topics: sql_data[i]['SlTYCTopics'],
                        	Region: sql_data[i]['SlTYCRegion']
                        },
                        date: sql_data[i]['SlTYCBarCheckDate'],
                        date_is_valid: sql_data[i]['SlTYCBarCheckDate'] === rdz.db.validate({name: 'YaBar', date:sql_data[i]['SlTYCBarCheckDate'],  action:'date'})
                    },

                    TYCCategory: {
                        name: 'TYCCategory',
                        //полный путь категории Яндекс каталога
                        value: (sql_data[i]['SlTYCCategory'] && sql_data[i]['SlTYCSubcategory']) ? (sql_data[i]['SlTYCCategory'] + '/' + sql_data[i]['SlTYCSubcategory']) : sql_data[i]['SlTYCCategory'],
                        date: sql_data[i]['SlTYCCheckDate'],
                        date_is_valid: sql_data[i]['SlTYCCheckDate'] === rdz.db.validate({name: 'TYC', date:sql_data[i]['SlTYCCheckDate'],  action:'date'})
                    },                 
                    
                    TYCTopics: {
                        name: 'TYCTopics',
                        value: sql_data[i]['SlTYCTopics'],
                        date: sql_data[i]['SlTYCBarCheckDate'],
                        date_is_valid: sql_data[i]['SlTYCBarCheckDate'] === rdz.db.validate({name: 'YaBar', date:sql_data[i]['SlTYCBarCheckDate'],  action:'date'})
                    },

                    TYCRegion: {
                        name: 'TYCRegion',
                        value: sql_data[i]['SlTYCRegion'],
                        date: sql_data[i]['SlTYCBarCheckDate'],
                        date_is_valid: sql_data[i]['SlTYCBarCheckDate'] === rdz.db.validate({name: 'YaBar', date:sql_data[i]['SlTYCBarCheckDate'],  action:'date'})
                    },
                    
                    PR: {
                        name: 'PR',
                       	value: {
                        	Value: sql_data[i]['SlPR'],
                        	PRg: sql_data[i]['SlPRFake'],
                        	PRgTooltip: sql_data[i]['SlPRFakeTooltip'],
                            DMOZ: sql_data[i]['SlDMOZ']
                        },                        
                        date: sql_data[i]['SlPRCheckDate'],
                        date_is_valid: sql_data[i]['SlPRCheckDate'] === rdz.db.validate({name: 'PRMain', date:sql_data[i]['SlPRCheckDate'],  action:'date'})
                    },
                    
                    PRpageMain: {
                        name: 'PR',
                       	value: {
                        	Value: sql_data[i]['SlPR'],
                        	PRg: sql_data[i]['SlPRFake'],
                        	PRgTooltip: sql_data[i]['SlPRFakeTooltip'],
                            DMOZ: sql_data[i]['SlDMOZ']
                        },                        
                        date: sql_data[i]['SlPRCheckDate'],
                        date_is_valid: sql_data[i]['SlPRCheckDate'] === rdz.db.validate({name: 'PRMain', date:sql_data[i]['SlPRCheckDate'],  action:'date'})
                    },

                    PRpage: {
                        name: 'PRpage',
                        value: {
                            Value: sql_data[i]['PlPR'],
                            PRg: sql_data[i]['PlPRFake'],
                            PRgTooltip: sql_data[i]['PlPRFakeTooltip'],
                            DMOZ: sql_data[i]['SlDMOZ']
                        },
                        date: sql_data[i]['PlPRCheckDate'],
                        date_is_valid: sql_data[i]['PlPRCheckDate'] === rdz.db.validate({name: 'PR', date:sql_data[i]['PlPRCheckDate'],  action:'date'})
                    },
                    
                    IYP: {
                        name: 'IYP',
                        value: sql_data[i]['PlIYP'],
                        date: sql_data[i]['PlIYPCheckDate'],
                        date_is_valid: sql_data[i]['PlIYPCheckDate'] === rdz.db.validate({name: 'IYP', date:sql_data[i]['PlIYPCheckDate'],  action:'date'})
                    },

                    IGP: {
                        name: 'IGP',
                        value: sql_data[i]['PlIGP'],
                        date: sql_data[i]['PlIGPCheckDate'],
                        date_is_valid: sql_data[i]['PlIGPCheckDate'] === rdz.db.validate({name: 'IGP', date:sql_data[i]['PlIGPCheckDate'],  action:'date'})
                    },
                    
                    IY: {
                        name: 'IY',
                        value: sql_data[i]['SlIY'],
                        date: sql_data[i]['SlIYCheckDate'],
                        date_is_valid: sql_data[i]['SlIYCheckDate'] === rdz.db.validate({name: 'IY', date:sql_data[i]['SlIYCheckDate'],  action:'date'})
                    },

                    IYD: {
                        name: 'IYD',
                        value: +sql_data[i]['SlIYD'],
                        date: sql_data[i]['SlIYDCheckDate'],
                        date_is_valid: sql_data[i]['SlIYDCheckDate'] === rdz.db.validate({name: 'IYD', date:sql_data[i]['SlIYDCheckDate'],  action:'date'})
                    },
                    
                    IYDP: {
                        name: 'IYDP',
                        value: sql_data[i]['PlIYDP'],
                        date: sql_data[i]['PlIYDPCheckDate'],
                        date_is_valid: sql_data[i]['PlIYDPCheckDate'] === rdz.db.validate({name: 'IYDP', date:sql_data[i]['PlIYDPCheckDate'],  action:'date'})
                    },
                    
                    IG: {
                        name: 'IG',
                        value: sql_data[i]['SlIG'],
                        date: sql_data[i]['SlIGCheckDate'],
                        date_is_valid: sql_data[i]['SlIGCheckDate'] === rdz.db.validate({name: 'IG', date:sql_data[i]['SlIGCheckDate'],  action:'date'})
                    },
                    
                    ibing: {
                        name: 'ibing',
                        value: sql_data[i]['Slibing'],
                        date: sql_data[i]['SlibingCheckDate'],
                        date_is_valid: sql_data[i]['SlibingCheckDate'] === rdz.db.validate({name: 'IBing', date:sql_data[i]['SlibingCheckDate'],  action:'date'})
                    },

                    BY: {
                        name: 'BY',
                        value: sql_data[i]['SlBY'],
                        date: sql_data[i]['SlBYCheckDate'],
                        date_is_valid: sql_data[i]['SlBYCheckDate'] === rdz.db.validate({name: 'BY', date:sql_data[i]['SlBYCheckDate'],  action:'date'})
                    },
                    
                    WA: {
                        name: 'WA',
                        value: sql_data[i]['SlWA'],
                        date: sql_data[i]['SlWACheckDate'],
                        date_is_valid: sql_data[i]['SlWACheckDate'] === rdz.db.validate({name: 'WA', date:sql_data[i]['SlWACheckDate'],  action:'date'})
                    },
                    
                    Age: {
                        name: 'Age',
                        value: sql_data[i]['SlAge'],
                        date: sql_data[i]['SlAgeCheckDate']
                    },
                    
                    Valid: {
                        name: 'Valid',
                        value: {
                            Value: sql_data[i]['PlValid'],
                            Message: sql_data[i]['PlValidMessage']
                        },
                        date: sql_data[i]['PlValidCheckDate'],
                        date_is_valid: sql_data[i]['PlValidCheckDate'] === rdz.db.validate({name: 'Validation', date:sql_data[i]['PlValidCheckDate'],  action:'date'})
                    },
                    
                    LG: {
                        name: 'LG',
                        value: sql_data[i]['SlLG'],
                        date: sql_data[i]['SlLGCheckDate'],
                        date_is_valid: sql_data[i]['SlLGCheckDate'] === rdz.db.validate({name: 'LG', date:sql_data[i]['SlLGCheckDate'],  action:'date'})
                    },
                    
                    BackAlexa: {
                        name: 'BackAlexa',
                        value: sql_data[i]['SlBackAlexa'],
                        date: sql_data[i]['SlBackAlexaCheckDate'],
                        date_is_valid: sql_data[i]['SlBackAlexaCheckDate'] === rdz.db.validate({name: 'BackA', date:sql_data[i]['SlBackAlexaCheckDate'],  action:'date'})
                    },
                    
                    //BackAlexaPage: {
                    //    name: 'BackAlexaPage',
                    //    value: sql_data[i]['SlBackAlexa'],
                    //    date: sql_data[i]['SlBackAlexaCheckDate'],
                    //    date_is_valid: sql_data[i]['SlBackAlexaCheckDate'] === rdz.db.validate({name: 'BackA', date:sql_data[i]['SlBackAlexaCheckDate'],  action:'date'})
                    //},
                    
                    BackBing: {
                        name: 'BackBing',
                        value: sql_data[i]['SlBackBing'],
                        date: sql_data[i]['SlBackBingCheckDate'],
                        date_is_valid: sql_data[i]['SlBackBingCheckDate'] === rdz.db.validate({name: 'BackBing', date:sql_data[i]['SlBackBingCheckDate'],  action:'date'})
                    },
                    
                    Bing: {
                        name: 'Bing',
                        value: sql_data[i]['SlBing'],
                        date: sql_data[i]['SlBingCheckDate'],
                        date_is_valid: sql_data[i]['SlBackBingCheckDate'] === rdz.db.validate({name: 'Bing', date:sql_data[i]['SlBackBingCheckDate'],  action:'date'})
                    },
                    
                    SocialNetworks: {
                        name: 'SocialNetworks',
                        value: {
                        	GoogleOne : {
                        		value: sql_data[i]['SlGoogleOne'] || null
                        		},
                        	FacebookLike : {
                        		value: sql_data[i]['SlFacebookLike'] || null
                        		},
                        	TwitterLike : {
                        		value: sql_data[i]['SlTwitterLike'] || null
                        		},
                            VkLike : {
                        		value: {
                                    Value: sql_data[i]['SlVkLike'] || null,
                                    FromFrame: sql_data[i]['SlVkLikeFromFrame'] || null
                                }
                        	}
                        		
                        },
                        date: sql_data[i]['SlGoogleOneCheckDate'] ? sql_data[i]['SlGoogleOneCheckDate'] :
                              sql_data[i]['SlFacebookLikeCheckDate'] ? sql_data[i]['SlFacebookLikeCheckDate'] :
                              sql_data[i]['SlTwitterLikeCheckDate'] ? sql_data[i]['SlTwitterLikeCheckDate'] :
                              sql_data[i]['SlVkLikeCheckDate'] ? sql_data[i]['SlVkLikeCheckDate'] : null,
                              
                        date_is_valid: sql_data[i]['SlGoogleOneCheckDate'] === rdz.db.validate({name: 'SocialNetworks', date:sql_data[i]['SlGoogleOneCheckDate'],  action:'date'})
                        
                    },
                    
                    SocialNetworkspage: {
                        name: 'SocialNetworkspage',
                        value: {
                            GoogleOne : {
                                value: sql_data[i]['PlGoogleOnepage']
                            },
                            FacebookLike : {
                                value: sql_data[i]['PlFacebookLikepage']
                            },
                            TwitterLike : {
                                value: sql_data[i]['PlTwitterLikepage']
                            },
                            VkLike : {
                                value: {Value: sql_data[i]['PlVkLikepage'],  FromFrame: sql_data[i]['PlVkLikepageFromFrame']}
                            }

                        },
                        date: sql_data[i]['PlGoogleOnepageCheckDate'] ? sql_data[i]['PlGoogleOnepageCheckDate'] :
                              sql_data[i]['PlFacebookLikepageCheckDate'] ? sql_data[i]['PlFacebookLikepageCheckDate'] :
                              sql_data[i]['PlTwitterLikepageCheckDate'] ? sql_data[i]['PlTwitterLikepageCheckDate'] :
                              sql_data[i]['PlVkLikepageCheckDate'] ? sql_data[i]['PlVkLikepageCheckDate'] : null,
                        date_is_valid: sql_data[i]['PlGoogleOnepageCheckDate'] === rdz.db.validate({name: 'SocialNetwork', date:sql_data[i]['PlGoogleOnepageCheckDate'],  action:'date'})
                    },
                    
                    Semrush: {
                    	    name: 'Semrush',
                	    value: {Value: sql_data[i]['SlSemrush'], Traffic: sql_data[i]['SlSemrushTraffic'], Costs: sql_data[i]['SlSemrushCosts']} ,
                	    date: sql_data[i]['SlSemrushCheckDate'],
                            date_is_valid: sql_data[i]['SlSemrushCheckDate'] === rdz.db.validate({name: 'SemRush', date:sql_data[i]['SlSemrushCheckDate'],  action:'date'})
            	    },
                    
                    ISolomono: {
                    	    name: 'ISolomono',
                		value: { 
                			index: sql_data[i]['SlSolomono_index'],
                			index_date: sql_data[i]['SlSolomono_index_date']
                		 },
                		date: sql_data[i]['SlSolomonoCheckDate'],
                                date_is_valid: sql_data[i]['SlSolomonoCheckDate'] === rdz.db.validate({name: 'Solomono',
                                                               date:sql_data[i]['SlSolomonoCheckDate'],  action:'date'})
            	     },
            		            		
            	    Solomono: {
                    	    name: 'Solomono',
                		value: { 
                			din: sql_data[i]['SlSolomono_din'],
                			dout: sql_data[i]['SlSolomono_dout'],
                			hin: sql_data[i]['SlSolomono_hin'],
                			hout: sql_data[i]['SlSolomono_hout'],
                			hin_l1: sql_data[i]['SlSolomono_hin_l1'],
                			hin_l2: sql_data[i]['SlSolomono_hin_l2'],
                			hin_l3: sql_data[i]['SlSolomono_hin_l3'],
                			hin_l4: sql_data[i]['SlSolomono_hin_l4']
                			} ,
                		date: sql_data[i]['SlSolomonoCheckDate'],
                            date_is_valid: sql_data[i]['SlSolomonoCheckDate'] === rdz.db.validate({name: 'Solomono', date:sql_data[i]['SlSolomonoCheckDate'],  action:'date'})
            	    },
                    
            //        ISolomonoPage: {
            //            name: 'ISolomonoPage',
            //    	value: { 
            //    	   index: sql_data[i]['SlSolomono_index'],
            //    	   index_date: sql_data[i]['SlSolomono_index_date']
            //    	},
            //    	date: sql_data[i]['SlSolomonoCheckDate'],
            //            date_is_valid: sql_data[i]['SlSolomonoCheckDate'] === rdz.db.validate({name: 'Solomono', date:sql_data[i]['SlSolomonoCheckDate'],  action:'date'})
            //	     },
            //	     
            //	     SolomonoPage: {
            //            name: 'SolomonoPage',
            //    	   value: { 
            //                        din: sql_data[i]['SlSolomono_din'],
            //    		    dout: sql_data[i]['SlSolomono_dout'],
            //    		    hin: sql_data[i]['SlSolomono_hin'],
            //    		    hout: sql_data[i]['SlSolomono_hout'],
            //    		    hin_l1: sql_data[i]['SlSolomono_hin_l1'],
            //    		    hin_l2: sql_data[i]['SlSolomono_hin_l2'],
            //    		    hin_l3: sql_data[i]['SlSolomono_hin_l3'],
            //    		    hin_l4: sql_data[i]['SlSolomono_hin_l4']
            //    	   },
            //    	   date: sql_data[i]['SlSolomonoCheckDate'],
            //            date_is_valid: sql_data[i]['SlSolomonoCheckDate'] === rdz.db.validate({name: 'Solomono', date:sql_data[i]['SlSolomonoCheckDate'],  action:'date'})
            //	     },
                     
                    MJ: {
                        name: 'MJ',
                        value: sql_data[i]['SlMJ'],
                        date: sql_data[i]['SlMJCheckDate'],
                        date_is_valid: sql_data[i]['SlMJCheckDate'] === rdz.db.validate({name: 'Majestic', date:sql_data[i]['SlMJCheckDate'],  action:'date'})
                    },
                    
                    CF: {
                        name: 'CF',
                        value: sql_data[i]['SlCF'],
                        date: sql_data[i]['SlMJCheckDate'],
                        date_is_valid: sql_data[i]['SlMJCheckDate'] === rdz.db.validate({name: 'Majestic', date:sql_data[i]['SlMJCheckDate'],  action:'date'})
                    },
                    
                    TF: {
                        name: 'TF',
                        value: sql_data[i]['SlTF'],
                        date: sql_data[i]['SlMJCheckDate'],
                        date_is_valid: sql_data[i]['SlMJCheckDate'] === rdz.db.validate({name: 'Majestic', date:sql_data[i]['SlMJCheckDate'],  action:'date'})
                    },
                     
                    Imgyan: {
                        name: 'Imgyan',
                        value: sql_data[i]['SlImgyan'],
                        date: sql_data[i]['SlImgyanCheckDate'],
                        date_is_valid: sql_data[i]['SlImgyanCheckDate'] === rdz.db.validate({name: 'Pictures', date:sql_data[i]['SlImgyanCheckDate'],  action:'date'})
                    },

                    Imgg: {
                        name: 'Imgg',
                        value: sql_data[i]['SlImgg'],
                        date: sql_data[i]['SlImggCheckDate'],
                        date_is_valid: sql_data[i]['SlImggCheckDate'] === rdz.db.validate({name: 'Pictures', date:sql_data[i]['SlImggCheckDate'],  action:'date'})
                    },

                    AOLimg: {
                        name: 'AOLimg',
                        value: sql_data[i]['SlAOLimg'],
                        date: sql_data[i]['SlAOLimgCheckDate'],
                        date_is_valid: sql_data[i]['SlAOLimgCheckDate'] === rdz.db.validate({name: 'Pictures', date:sql_data[i]['SlAOLimgCheckDate'],  action:'date'})
                    },
                    
                    Alexa: {
                        name: 'Alexa',
                        value: {
                        	Value: sql_data[i]['SlAlexa'],
                        	Regional: sql_data[i]['SlAlexaRegionalRank'],
                        	Code: sql_data[i]['SlAlexaRegionalCode']
                        },
                        date: sql_data[i]['SlAlexaCheckDate'],
                        date_is_valid: sql_data[i]['SlAlexaCheckDate'] === rdz.db.validate({name: 'Alexa', date:sql_data[i]['SlAlexaCheckDate'],  action:'date'})
                    },
                    
                    DMOZ: {
                    	name: 'DMOZ',
                		value: {
                            Value: sql_data[i]['SlDMOZ'],
                            Catalog: sql_data[i]['SlDMOZCatalog']
                        } ,
                		date: sql_data[i]['SlDMOZCheckDate'],
                        date_is_valid: sql_data[i]['SlDMOZCheckDate'] === rdz.db.validate({name: 'Dmoz', date:sql_data[i]['SlDMOZCheckDate'],  action:'date'})
            	    },
                    
                    UniqueContentPage: {
                        name: 'UniqueContentPage',
                        value: sql_data[i]['PlUniqueContentPage'] ? JSON.parse(sql_data[i]['PlUniqueContentPage']) : null,
                        date: sql_data[i]['PlUniqueContentPageCheckDate'],
                        date_is_valid: sql_data[i]['PlUniqueContentPageCheckDate'] === rdz.db.validate({name: 'UniqueContentPage', date:sql_data[i]['PlUniqueContentPageCheckDate'],  action:'date'})
                    },
                    
                    Anchor:{
                        name: 'Anchor',
                        value: sql_data[i]['PlLinkText'],
                        date: sql_data[i]['PlRecipientUrlCheckDate'],
                        date_is_valid: sql_data[i]['PlRecipientUrlCheckDate'] === rdz.db.validate({name: 'recipientPage', date:sql_data[i]['PlRecipientUrlCheckDate'],  action:'date'})
                    },
                    
                    LinksInDomain: {
                        name: 'LinksInDomain',
                        value: sql_data[i]['SlLinksIn'],
                        date: sql_data[i]['SlLIOCheckDate'],
                        date_is_valid: sql_data[i]['SlLIOCheckDate'] === rdz.db.validate({name: 'LinksIn', date:sql_data[i]['SlLIOCheckDate'],  action:'date'})
                    },
                    
                    LinksIn: {
                        name: 'LinksIn',
                        value: sql_data[i]['PlLinksIn'],
                        date: sql_data[i]['PlLIOCheckDate'],
                        date_is_valid: sql_data[i]['PlLIOCheckDate'] === rdz.db.validate({name: 'LinksIn', date:sql_data[i]['PlLIOCheckDate'],  action:'date'})
                    },

                    LinksOutDomain: {
                        name: 'LinksOutDomain',
                        value: sql_data[i]['SlLinksOut'],
                        date: sql_data[i]['SlLIOCheckDate'],
                        date_is_valid: sql_data[i]['SlLIOCheckDate'] === rdz.db.validate({name: 'LinksOut', date:sql_data[i]['SlLIOCheckDate'],  action:'date'})
                    },              

                    LinksOut: {
                        name: 'LinksOut',
                        value: sql_data[i]['PlLinksOut'],
                        date: sql_data[i]['PlLIOCheckDate'],
                        date_is_valid: sql_data[i]['PlLIOCheckDate'] === rdz.db.validate({name: 'LinksOut', date:sql_data[i]['PlLIOCheckDate'],  action:'date'})
                    },
                    
                    pagetitleDomain: {
                        name: 'pagetitleDomain',
                        value: sql_data[i]['Slpagetitle'],
                        date: sql_data[i]['SlpagetitleCheckDate'],
                        date_is_valid: sql_data[i]['SlpagetitleCheckDate'] === rdz.db.validate({name: 'pagetitle', date:sql_data[i]['SlpagetitleCheckDate'],  action:'date'})
                    },
                    
                    pagetitle: {
                        name: 'pagetitle',
                        value: sql_data[i]['Plpagetitle'],
                        date: sql_data[i]['PlpagetitleCheckDate'],
                        date_is_valid: sql_data[i]['PlpagetitleCheckDate'] === rdz.db.validate({name: 'pagetitle', date:sql_data[i]['PlpagetitleCheckDate'],  action:'date'})
                     }, 
                     
                    pageweightDomain: {
                        name: 'pageweightDomain',
                        value: sql_data[i]['Slpageweight'],
                        date: sql_data[i]['SlpageweightCheckDate'],
                        date_is_valid: sql_data[i]['SlpageweightCheckDate'] === rdz.db.validate({name: 'pageweight', date:sql_data[i]['SlpageweightCheckDate'],  action:'date'})
                    },
                    
                    pageweight: {
                        name: 'pageweight',
                        value: sql_data[i]['Plpageweight'],
                        date: sql_data[i]['PlpageweightCheckDate'],
                        date_is_valid: sql_data[i]['PlpageweightCheckDate'] === rdz.db.validate({name: 'pageweight', date:sql_data[i]['PlpageweightCheckDate'],  action:'date'})
                    },
                    
                    LinkPresence: {
                        name: 'LinkPresence',
                        value: sql_data[i]['PlLinkPresence'],
                        date: sql_data[i]['PlRecipientUrlCheckDate'],
                        date_is_valid: sql_data[i]['PlRecipientUrlCheckDate'] === rdz.db.validate({name: 'recipientPage', date:sql_data[i]['PlRecipientUrlCheckDate'],  action:'date'})
                    }, 
                    
                    CMS: {
                        name: 'CMS',
                        value: (function(){
                           var str = sql_data[i]['SlCMS'];
                           if (str != null) {
                              var data = str.split('\272');
                              var result = {
                                 sites: [],
                                 blogs: [],
                                 forums: [],
                                 shops: [],
                                 galleries: []
                              };
                              var patterns = rdz.utils.CMS.getPatterns('');
                              var appName = '';                      
                              for (var j = 0; j < data.length; j++) {
                                 appName = data[j];
                                 if (appName in patterns['sites']) {
                                    result['sites'].push(appName);
                                 } else if (appName in patterns['forums']) {
                                    result['forums'].push(appName);
                                 } else if (appName in patterns['blogs']) {
                                    result['blogs'].push(appName);
                                 } else if (appName in patterns['shops']) {
                                    result['shops'].push(appName);
                                 } else if (appName in patterns['galleries']) {
                                    result['galleries'].push(appName);
                                 }
                              }
                              return result;
                           } else {
                              return null;
                           }                       
                        }()),
                        date: sql_data[i]['SlCMSCheckDate'],
                        date_is_valid: sql_data[i]['SlCMSCheckDate'] === rdz.db.validate({name: 'CMS', date:sql_data[i]['SlCMSCheckDate'],  action:'date'})
                    },
                    
                    CMSpage: {
                        name: 'CMSpage',
                        value: (function(){
                           var str = sql_data[i]['PlCMS'];
                           if (str != null) {
                              var data = str.split('\272');
                              var result = {
                                 sites: [],
                                 blogs: [],
                                 forums: [],
                                 shops: [],
                                 galleries: []
                              };
                              var patterns = rdz.utils.CMS.getPatterns('');
                              var appName = '';                      
                              for (var j = 0; j < data.length; j++) {
                                 appName = data[j];
                                 if (appName in patterns['sites']) {
                                    result['sites'].push(appName);
                                 } else if (appName in patterns['forums']) {
                                    result['forums'].push(appName);
                                 } else if (appName in patterns['blogs']) {
                                    result['blogs'].push(appName);
                                 } else if (appName in patterns['shops']) {
                                    result['shops'].push(appName);
                                 } else if (appName in patterns['galleries']) {
                                    result['galleries'].push(appName);
                                 }
                              }
                              return result;
                           } else {
                              return null;
                           }                       
                        }()),
                        date: sql_data[i]['PlCMSCheckDate'],
                        date_is_valid: sql_data[i]['PlCMSCheckDate'] === rdz.db.validate({name: 'CMS', date:sql_data[i]['PlCMSCheckDate'],  action:'date'})
                    }, 
                    
                    Dangerous: {
                        name: 'Dangerous',
                        value: sql_data[i]['SlDangerous'],
                        date: sql_data[i]['SlDangerousCheckDate'],
                        date_is_valid: sql_data[i]['SlDangerousCheckDate'] === rdz.db.validate({name: 'Dangerous', date:sql_data[i]['SlDangerousCheckDate'],  action:'date'})
                    },
                    
                    //DangerousPage: {
                    //    name: 'DangerousPage',
                    //    value: sql_data[i]['SlDangerous'],
                    //    date: sql_data[i]['SlDangerousCheckDate'],
                    //    date_is_valid: sql_data[i]['SlDangerousCheckDate'] === rdz.db.validate({name: 'Dangerous', date:sql_data[i]['SlDangerousCheckDate'],  action:'date'})
                    //},
                    
                    Subdomains: {
                        name: 'Subdomains',
                        value: sql_data[i]['SlSubdomains'],
                        date: sql_data[i]['SlSubdomainsCheckDate']
                    },
                    
                    seomoz: {
                        name: 'seomoz',
                        value: sql_data[i]['Slseomoz'],
                        date: sql_data[i]['SlseomozCheckDate'],
                        date_is_valid: sql_data[i]['SlseomozCheckDate'] === rdz.db.validate({name: 'SeoM', date:sql_data[i]['SlseomozCheckDate'],  action:'date'})
                    },
                    
                    IndexAol: {
                        name: 'IndexAol',
                        value: sql_data[i]['SlIndexAol'],
                        date: sql_data[i]['SlIndexAolCheckDate']
                    },

                    Technorati: {
                        name: 'Technorati',
                        value: sql_data[i]['SlTechnorati'],
                        date: sql_data[i]['SlTechnoratiCheckDate']
                    },
                    
                    Ahrefs: {
                    	name: 'Ahrefs',
                	value: {Value: sql_data[i]['SlAhrefs'], ImageUrl: sql_data[i]['SlAhrefsImage']} ,
                	date: sql_data[i]['SlAhrefsCheckDate']
            	    },
                    
                    GoogleAdplanner: {
                    	name: 'GoogleAdplanner',
                		value: {Value: sql_data[i]['SlGoogleAdplanner'], ImageUrl: sql_data[i]['SlGoogleAdplannerImage']} ,
                		date: sql_data[i]['SlGoogleAdplannerCheckDate']
            	    },
            		                    
                    GoogleTrends: {
                    	name: 'GoogleTrends',
                		value: {
                			Value: sql_data[i]['SlGoogleTrends'],  
                			SignIn: sql_data[i]['SlGoogleTrendsSignIn']
                			} ,
                		date: sql_data[i]['SlGoogleTrendsCheckDate']
            	    },
                    
                    Compete: {
                    	name: 'Compete',
                	value: {
                	    Value: sql_data[i]['SlCompete'],
                	    LastMonth: sql_data[i]['SlCompeteLastMonth'],
                	    UV: sql_data[i]['SlCompeteUV']
                	} ,
                	date: sql_data[i]['SlCompeteCheckDate']
            	    },
            		
            	    Quantcast: {
                    	name: 'Quantcast',
                	value: {
                	    Value: sql_data[i]['SlQuantcast'],
                	    Unique: sql_data[i]['SlQuantcastUnique']
                	} ,
                	date: sql_data[i]['SlQuantcastCheckDate']
            	    },
                    
                    Aggregators: {
                    	name: 'Aggregators',
                		value: [
                            sql_data[i]['SlAggregatorsYandex'],
                            sql_data[i]['SlAggregatorsGoogle'] ,
                            sql_data[i]['SlAggregatorsBing'] ,
                            sql_data[i]['SlAggregatorsNovoteka']
                        ],
                		date: sql_data[i]['SlAggregatorsCheckDate']
            	    },          		
            		
            	    Webmoney: {
                    	name: 'Webmoney',
                	value: {
                			IDsCount: sql_data[i]['SlWebmoneyIDsCount'],
							IconType: sql_data[i]['SlWebmoneyIconType'],
                			Danger: sql_data[i]['SlWebmoneyDanger'],
                			TrafficIndex: sql_data[i]['SlWebmoneyTrafficIndex'],
                			FeedbacksGT: sql_data[i]['SlWebmoneyFeedbacksGT'],
                			FeedbacksLT: sql_data[i]['SlWebmoneyFeedbacksLT'],
                			Feedbacks: sql_data[i]['SlWebmoneyFeedbacks'],
                			GraphURL: sql_data[i]['SlWebmoneyGraphURL']
                	},
                	date: sql_data[i]['SlWebmoneyCheckDate']
            	    },
                    
                    RSS: {
                        name: 'RSS',
                        value: sql_data[i]['SlRSS'],
                        date: sql_data[i]['SlRSSCheckDate']
                    },
                    
                    Robots: {
                    	name: 'Robots',
                		value: {Value: sql_data[i]['SlRobots'],  Tip: sql_data[i]['SlRobotsTip']} ,
                		date: sql_data[i]['SlRobotsCheckDate'],
                        date_is_valid: sql_data[i]['SlRobotsCheckDate'] === rdz.db.validate({name: 'Robots', date:sql_data[i]['SlRobotsCheckDate'],  action:'date'})
            	    },
            		
            	    Sitemap: {
                    	name: 'Sitemap',
                		value: {Value: sql_data[i]['SlSitemap'],  Tip: sql_data[i]['SlSitemapTip']} ,
                		date: sql_data[i]['SlSitemapCheckDate'],
                        date_is_valid: sql_data[i]['SlSitemapCheckDate'] === rdz.db.validate({name: 'Sitemap', date:sql_data[i]['SlSitemapCheckDate'],  action:'date'})
            	    },            
                     
                    MozRank: {
                        name: 'MozRank',
                        value: sql_data[i]['PlMozRank'],
                        date: sql_data[i]['PlMozRankCheckDate'],
                        date_is_valid: sql_data[i]['PlMozRankCheckDate'] === rdz.db.validate({name: 'MozRank', date:sql_data[i]['PlMozRankCheckDate'],  action:'date'})
                    },

                    seomozP: {
                        name: 'seomozP',
                        value: sql_data[i]['PlseomozP'],
                        date: sql_data[i]['PlseomozPCheckDate'],
                        date_is_valid: sql_data[i]['PlseomozPCheckDate'] === rdz.db.validate({name: 'SeoM', date:sql_data[i]['PlseomozPCheckDate'],  action:'date'})
                    }/*,               
                    
                    
                    AlexaPage: {
                        name: 'AlexaPage',
                        value: {
                        	Value: sql_data[i]['SlAlexa'],
                        	Regional: sql_data[i]['SlAlexaRegionalRank'],
                        	Code: sql_data[i]['SlAlexaRegionalCode']
                        },
                        date: sql_data[i]['SlAlexaCheckDate'],
                        date_is_valid: sql_data[i]['SlAlexaCheckDate'] === rdz.db.validate({name: 'Alexa', date:sql_data[i]['SlAlexaCheckDate'],  action:'date'})
                    } */
                  }
                )
            }
        return app_sql;
    }
};


var RecipientsSQLite = function() {

    //small cheating
    //make Model for View
    this.data = function(a, method, model, options) {

        rdz.db.execute([{
            sql:'SELECT * FROM SitesLibrary WHERE SlRecipient = 1 ORDER BY '+ AppTableSort.getSortedField()+' LIMIT ? OFFSET ?',
            params: [a.limit, a.from],
            success: function(tx, r) {

                var sql_data = rdz.db.return_selected(tx, r);

                rdz.db.execute([{
                    sql: 'SELECT SlUrl, SmMarketId, SmInMarket, SmCheckDate FROM (SELECT * FROM SitesLibrary WHERE SlRecipient = 1 ORDER BY '+AppTableSort.getSortedField()+' LIMIT ? OFFSET ?) LEFT JOIN SeoMarkets ON SlId = SmSlId',
                    params: [a.limit, a.from],
                    success: function(tx, r) {

                        var sql_data_seo = rdz.db.return_selected(tx, r);

                        SQLiteMethods.success(options, SQLiteMaping.SitesLibrary({sql_data:sql_data, sql_data_seo:sql_data_seo}));

                    }
                }]);


            }
        }]);

    };
};

var SitesLibrarySQLite = function() {

    //small cheating
    //make Model for View
    this.data = function(a, method, model, options) {


        rdz.db.execute([{
            sql:'SELECT * FROM SitesLibrary ORDER BY '+AppTableSort.getSortedField()+' LIMIT ? OFFSET ?',
            params: [a.limit, a.from],
            success: function(tx, r) {

                var sql_data = rdz.db.return_selected(tx, r);

                rdz.db.execute([{
                    sql:'SELECT SlUrl, SmMarketId, SmInMarket, SmCheckDate FROM (SELECT * FROM SitesLibrary ORDER BY '+AppTableSort.getSortedField()+' LIMIT ? OFFSET ?) LEFT JOIN SeoMarkets ON SlId = SmSlId',
                    params: [a.limit, a.from],
                    success: function(tx, r) {

                        var sql_data_seo = rdz.db.return_selected(tx, r);

                        rdz.db.execute([{
                            sql:'SELECT CIdLiveInternet, CIdRambler, CIdMailRu, CIdSpyLog, CIdHotLog, CIdGA, CIdYaMetrika, CIdBigmir, CIdTopStat, CIdmycounter, CIdYandeg, CIdMystat, CIdHIT_UA, CIdI_UA, CIdPROext,' +
                                'CCheckDate, CLiveInternet, CAccessLiveInternet, CRambler, CMailRu, CSpyLog, CHotLog, CGA, CYaMetrika, CBigmir, CTopStat, Cmycounter, CLog24, CYandeg, CMystat, CHIT_UA, CI_UA, CPROext' +
                                ' FROM (SELECT * FROM SitesLibrary ORDER BY '+AppTableSort.getSortedField()+' LIMIT ? OFFSET ?) LEFT JOIN Counters ON SlId = CSlId',
                            params: [a.limit, a.from],
                            success: function(tx, r) {

                                var sql_data_counters = rdz.db.return_selected(tx, r);

                                rdz.db.execute([{
                                    sql:"SELECT PlGoogleOnepageCheckDate, PlGoogleOnepage, PlFacebookLikepageCheckDate, PlFacebookLikepage, PlTwitterLikepageCheckDate, PlTwitterLikepage, " +
                                        "PlVkLikepageCheckDate, PlVkLikepage, PlVkLikepageFromFrame " +
                                        "FROM (SELECT * FROM SitesLibrary ORDER BY "+AppTableSort.getSortedField()+" LIMIT ? OFFSET ?) LEFT JOIN PagesLibrary ON SlId = PlSlId AND PlUri = '/' ",
                                    params: [a.limit, a.from],
                                    success: function(tx, r) {

                                        var sql_data_likes = rdz.db.return_selected(tx, r);

                                        SQLiteMethods.success(options, SQLiteMaping.SitesLibrary({sql_data:sql_data, sql_data_seo:sql_data_seo, sql_data_counters:sql_data_counters, sql_data_likes:sql_data_likes}));

                                    }
                                }]);

                            }
                        }]);

                    }
                }]);

            }
        }]);

    };
};
var CheckSiteSQLite = function() {

    this.data = function(a, method, model, options) {

        rdz.db.execute([{
            sql:'SELECT * FROM SitesLibrary JOIN CheckSitesLibrary WHERE SlId = SiteId AND TabId = ? ORDER BY '+AppTableSort.getSortedField()+' LIMIT ? OFFSET ?',
            params: [a.tab_id, a.limit, a.from],
            success: function(tx, r) {

                var sql_data = rdz.db.return_selected(tx, r);

                rdz.db.execute([{
                    sql:'SELECT SlUrl, SmMarketId, SmInMarket, SmCheckDate FROM (SELECT * FROM SitesLibrary JOIN CheckSitesLibrary WHERE SlId = SiteId AND TabId = ? ORDER BY '+AppTableSort.getSortedField()+' LIMIT ? OFFSET ?) LEFT JOIN SeoMarkets ON SlId = SmSlId',
                    params: [a.tab_id, a.limit, a.from],
                    success: function(tx, r) {

                        var sql_data_seo = rdz.db.return_selected(tx, r);

                        rdz.db.execute([{
                            sql:'SELECT CIdLiveInternet, CIdRambler, CIdMailRu, CIdSpyLog, CIdHotLog, CIdGA, CIdYaMetrika, CIdBigmir, CIdTopStat, CIdmycounter, CIdYandeg, CIdMystat, CIdHIT_UA, CIdI_UA, CIdPROext,' +
                                'CCheckDate, CLiveInternet, CAccessLiveInternet, CRambler, CMailRu, CSpyLog, CHotLog, CGA, CYaMetrika, CBigmir, CTopStat, Cmycounter, CLog24, CYandeg, CMystat, CHIT_UA, CI_UA, CPROext' +
                                ' FROM (SELECT * FROM SitesLibrary JOIN CheckSitesLibrary WHERE SlId = SiteId AND TabId = ? ORDER BY '+AppTableSort.getSortedField()+' LIMIT ? OFFSET ?) LEFT JOIN Counters ON SlId = CSlId',
                            params: [a.tab_id, a.limit, a.from],
                            success: function(tx, r) {

                                var sql_data_counters = rdz.db.return_selected(tx, r);

                                rdz.db.execute([{
                                    sql:"SELECT PlGoogleOnepageCheckDate, PlGoogleOnepage, PlFacebookLikepageCheckDate, PlFacebookLikepage, PlTwitterLikepageCheckDate, PlTwitterLikepage, " +
                                        "PlVkLikepageCheckDate, PlVkLikepage, PlVkLikepageFromFrame " +
                                        "FROM (SELECT * FROM SitesLibrary JOIN CheckSitesLibrary WHERE SlId = SiteId AND TabId = ? ORDER BY "+AppTableSort.getSortedField()+" LIMIT ? OFFSET ?) LEFT JOIN PagesLibrary ON SlId = PlSlId AND PlUri = '/' ",
                                    params: [a.tab_id, a.limit, a.from],
                                    success: function(tx, r) {

                                        var sql_data_likes = rdz.db.return_selected(tx, r);

                                        SQLiteMethods.success(options, SQLiteMaping.SitesLibrary({sql_data:sql_data, sql_data_seo:sql_data_seo, sql_data_counters:sql_data_counters, sql_data_likes:sql_data_likes}));

                                    }
                                }]);

                            }
                        }]);

                    }
                }]);

            }
        }]);


    };
};

var PagesLibrarySQLite = function() {
    //small cheating
    //make Model for View
    this.data = function(a, method, model, options) {
        rdz.db.execute([{
            sql:'SELECT * FROM SitesLibrary LEFT JOIN PagesLibrary ON SlId = PlSlId WHERE PlUri NOT NULL ORDER BY '+AppTableSort.getSortedField()+' LIMIT ? OFFSET ?',// AND PlUri != "/"
            params: [a.limit, a.from],
            success: function(tx, r) {
                var sql_data = rdz.db.return_selected(tx, r);
                
                rdz.db.execute([{
                    sql:'SELECT SlUrl, SmMarketId, SmInMarket, SmCheckDate FROM (SELECT * FROM SitesLibrary ORDER BY ' + "SlUrl" + ' ) LEFT JOIN SeoMarkets ON SlId = SmSlId', //LIMIT ? OFFSET ?
                    //params: [a.limit, a.from],
                    success: function(tx, r) {
                        var sql_data_seo = rdz.db.return_selected(tx, r);

                        SQLiteMethods.success(options, SQLiteMaping.SitesLibrary({sql_data:sql_data, sql_data_seo:sql_data_seo}));

                    }
                }]);
                
               
            }

        }]);
    };
};

/*
var CheckPageSQLite = function() {

    this.data = function(a, method, model, options) {

        rdz.db.execute([{
            sql:'SELECT * FROM SitesLibrary LEFT JOIN (SELECT * FROM PagesLibrary JOIN CheckPagesLibrary WHERE PlId = PageId AND TabId = ?) ON SlId = PlSlId WHERE PlUri NOT NULL ORDER BY '+AppTableSort.getSortedField()+' LIMIT ? OFFSET ?',// AND PlUri != "/"
            params: [1, a.limit, a.from],
            success: function(tx, r) {
                var sql_data = rdz.db.return_selected(tx, r);
                SQLiteMethods.success(options, _.extend(SQLiteMaping.PagesLibrary({sql_data:sql_data}), SQLiteMaping.SitesLibrary({sql_data:sql_data})) );
            }

        }]);

    };
};*/


var CheckPageSQLite = function() {

    //small cheating
    //make Model for View
    this.data = function(a, method, model, options) {


        rdz.db.execute([{
            sql:'SELECT * FROM SitesLibrary LEFT JOIN (SELECT * FROM PagesLibrary JOIN CheckPagesLibrary WHERE PlId = PageId AND TabId = ?) ON SlId = PlSlId WHERE PlUri NOT NULL ORDER BY '+AppTableSort.getSortedField()+' LIMIT ? OFFSET ?',// AND PlUri != "/"
            params: [a.tab_id, a.limit, a.from],
            success: function(tx, r) {

                var sql_data = rdz.db.return_selected(tx, r);



                rdz.db.execute([{
                    sql:'SELECT SlUrl, SmMarketId, SmInMarket, SmCheckDate FROM (SELECT * FROM SitesLibrary ORDER BY ' + "SlUrl" + ') LEFT JOIN SeoMarkets ON SlId = SmSlId', //  LIMIT ? OFFSET ?
                    //params: [a.limit, a.from],
                    success: function(tx, r) {

                        var sql_data_seo = rdz.db.return_selected(tx, r);

                        rdz.db.execute([{
                            sql:'SELECT CIdLiveInternet, CIdRambler, CIdMailRu, CIdSpyLog, CIdHotLog, CIdGA, CIdYaMetrika, CIdBigmir, CIdTopStat, CIdmycounter, CIdYandeg, CIdMystat, CIdHIT_UA, CIdI_UA, CIdPROext,' +
                                'CCheckDate, CLiveInternet, CAccessLiveInternet, CRambler, CMailRu, CSpyLog, CHotLog, CGA, CYaMetrika, CBigmir, CTopStat, Cmycounter, CLog24, CYandeg, CMystat, CHIT_UA, CI_UA, CPROext' +
                                ' FROM (SELECT * FROM SitesLibrary LEFT JOIN (SELECT * FROM PagesLibrary JOIN CheckPagesLibrary WHERE PlId = PageId AND TabId = ?) ON SlId = PlSlId WHERE PlUri NOT NULL ORDER BY '+AppTableSort.getSortedField()+' LIMIT ? OFFSET ?) LEFT JOIN Counters ON SlId = CSlId',
                            params: [a.tab_id, a.limit, a.from],
                            success: function(tx, r) {

                                var sql_data_counters = rdz.db.return_selected(tx, r);

                                //, SQLiteMaping.PagesLibrary({sql_data:sql_data}))

                                SQLiteMethods.success(options, SQLiteMaping.SitesLibrary( {sql_data:sql_data, sql_data_seo:sql_data_seo, sql_data_counters:sql_data_counters, sql_data_likes:sql_data}) );

                            }
                        }]);

                    }
                }]);

            }
        }]);

    };
};

_.extend(RecipientsSQLite.prototype, SQLiteMethods);
_.extend(SitesLibrarySQLite.prototype, SQLiteMethods);
_.extend(PagesLibrarySQLite.prototype, SQLiteMethods);

_.extend(CheckSiteSQLite.prototype, SQLiteMethods);
_.extend(CheckPageSQLite.prototype, SQLiteMethods);



var AppSync = function(method, model, options) {


  var resp;

  var store = model.sqlite || model.collection.sqlite;

  switch (method) {
    case "read":    resp = model.id ? store.find(method, model, options) : store.findAll(method, model, options); break;
    case "create":  resp = store.create(method, model, options);                            break;
    case "update":  resp = store.update(method, model, options);                            break;
    case "delete":  resp = store.destroy(method, model, options);                           break;
  }
};