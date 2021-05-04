TableCell = Backbone.View.extend({

    tagName: 'td',

    template: _.template(templates.user_table.td),

    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    },

    date_expired: function(flag){
        if (flag) this.$el.addClass('expired');
    }
});


TableCellNum = TableCell.extend({

    template: _.template(templates.user_table.tdNum),

    render: function() {
        $(this.el).html(this.template({n: this.model ? this.model+1 : 1}));
        return this;
    }

});

TableCellCheck = TableCell.extend({

    template: _.template(templates.user_table.tdCheck),

    events: {
      "change input":  "change"
    },

    render: function() {
        var u = this.model.get('Uri');
        $(this.el).html(this.template({m: u}));
        return this;
    },

    change: function () {
        this.model.toggleCheck(Boolean($(this.el).find('input').prop('checked')));
        $(this.el).parents('tr').toggleClass('checked');
    }
});


//------------------------------------------------------------------------------------------> siteslibrary

TableCellIP = TableCell.extend({

    template: _.template(templates.user_table.tdIP)

});

TableCellGeo = TableCell.extend({

    template: _.template(templates.user_table.tdGeo)

});

TableCellHost = TableCell.extend({

    template: _.template(templates.user_table.tdHost)

});

TableCellProvider = TableCell.extend({

    template: _.template(templates.user_table.tdProvider)

});

TableCellUrl = TableCell.extend({
    className: 'uri_cnt',
    template: _.template(templates.user_table.tdUrl),
    render: function() {
        $(this.el).html(this.template({
            url: this.model.value,
            www: this.model.www,
            mrkt: this.options.params.Seo
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');

        return this;
    }
});

TableCellpositions = TableCell.extend({

    template: _.template(templates.user_table.tdpositions)

});

TableCellTYC = TableCell.extend({
    template: _.template(templates.user_table.tdTYC),
    render: function() {
        $(this.el).html(this.template(
            {
                //-1 = Glued
                url: 'http://yaca.yandex.ru/yca/cy/ch/'+ this.options.params.Uri.value + '/',
		    /*this.model.value.TYC !== -1 ?
                    'http://yaca.yandex.ru/yca/cy/ch/'+ this.options.params.Uri.value + '/' :
                    'http://bar-navig.yandex.ru/u?ver=2&url=http://' + this.options.params.Uri.value + '&show=1',*/
                d: this.options.params.Uri,
                m: this.model,
                date: DataPaging.get('PerPage').get('width_date') && this.model.date,
                checking: this.options.checking.indexOf(this.options.params.Uri.domain) !== -1
            }));
          //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }
});

TableCellTYCBar = TableCell.extend({

    template: _.template(templates.user_table.tdTYCBar),
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});

TableCellTYCCategory = TableCell.extend({

    template: _.template(templates.user_table.tdTYCCategory),
    render: function() {
        var params = this.options.params,
            u = params.Uri,

            TYC_Glued = params.TYC && params.TYC.value && params.TYC.value.TYC,
            TYCBar_Glued = params.TYCBar && params.TYCBar.value && params.TYCBar.value.TYCBar;

        $(this.el).html(this.template({
            url: u.value,
            d: u,
            m: (TYC_Glued === -1 || TYCBar_Glued === -1) ? {value:null} : this.model,
	    date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');

        return this;
    }

});

TableCellTYCTopics = TableCell.extend({

    template: _.template(templates.user_table.tdTYCTopics),
    render: function() {
        var params = this.options.params,
            u = params.Uri,

            TYC_Glued = params.TYC && params.TYC.value && params.TYC.value.TYC,
            TYCBar_Glued = params.TYCBar && params.TYCBar.value && params.TYCBar.value.TYCBar;

        $(this.el).html(this.template({
            url: u.value,
            d: u,
            m: (TYC_Glued === -1 || TYCBar_Glued === -1) ? {value:null} : this.model,
	    date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');

        return this;
    }

});

TableCellTYCRegion = TableCell.extend({

    template: _.template(templates.user_table.tdTYCRegion),
    render: function() {
        var params = this.options.params,
            u = params.Uri,

            TYC_Glued = params.TYC && params.TYC.value && params.TYC.value.TYC,
            TYCBar_Glued = params.TYCBar && params.TYCBar.value && params.TYCBar.value.TYCBar;

        $(this.el).html(this.template({
            url: u.value,
            d: u,
            m: (TYC_Glued === -1 || TYCBar_Glued === -1) ? {value:null} : this.model,
	    date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');

        return this;
    }

});

TableCellPR = TableCell.extend({
	
    template: _.template(templates.user_table.tdPR),
    
    render: function() {
        var u = this.options.params.Uri;
        var page = u.value;               
		var checksum = "8" + rdz.utils.getHash(page);
        $(this.el).html(this.template({
            url: u.value,
            m: this.model,
            checksum : checksum,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !== -1
        }));
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    } 

});

TableCellIY = TableCell.extend({

    template: _.template(templates.user_table.tdIY),
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});

TableCellIYD = TableCell.extend({

    template: _.template(templates.user_table.tdIYD),
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: rdz.utils.noWWWUri(u.value),
            m: this.model,
            d: u,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);

        return this;
    }

});

TableCellIG = TableCell.extend({

    template: _.template(templates.user_table.tdIG),
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});

TableCellibing = TableCell.extend({

    template: _.template(templates.user_table.tdibing)

});

TableCellBY = TableCell.extend({

    template: _.template(templates.user_table.tdBY)

});

TableCellImgyan = TableCell.extend({

    template: _.template(templates.user_table.tdImgyan)

});

TableCellImgg = TableCell.extend({

    template: _.template(templates.user_table.tdImgg)

});

TableCellAOLimg = TableCell.extend({

    template: _.template(templates.user_table.tdAOLimg)

});

TableCellSubdomains = TableCell.extend({

    template: _.template(templates.user_table.tdSubdomains)

});

TableCellWA = TableCell.extend({

    template: _.template(templates.user_table.tdWA),
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});

TableCellseomoz = TableCell.extend({

    template: _.template(templates.user_table.tdseomoz)

});


TableCellLG = TableCell.extend({

    template: _.template(templates.user_table.tdLG)

});


TableCellBackBing = TableCell.extend({

    template: _.template(templates.user_table.tdBackBing)

});


TableCellBing = TableCell.extend({

    template: _.template(templates.user_table.tdBing)

});


TableCellIndexAol = TableCell.extend({

    template: _.template(templates.user_table.tdIndexAol)

});


TableCellAlexa = TableCell.extend({

    template: _.template(templates.user_table.tdAlexa),
    
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !== -1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});

TableCellBackAlexa = TableCell.extend({

    template: _.template(templates.user_table.tdBackAlexa),
    
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !== -1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});

TableCellDMOZ = TableCell.extend({

    template: _.template(templates.user_table.tdDMOZ),
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});

TableCellCMS = TableCell.extend({

    template: _.template(templates.user_table.tdCMS),
    render: function() {	
	var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
	    path: 'chrome-extension://' +chrome.i18n.getMessage("@@extension_id") + '/icons/engines/',
	    data: this.model.value,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !==-1
        }));
        
        /*if (m.value !== null) {
        	data = '';
        	for (var arr in m.value) {
        		var arr_length = m.value[arr].length; 
        		if (arr_length > 0) {
        				data += nsRDS.utils.TakeFromBundle("fromcode", "table_cells.cms." + arr) + ': ';
        		}        	
        		for (var i = 0; i < arr_length; i++) {
        			var name = m.value[arr][i];
        			var url = "chrome://rdstb/skin/images/engines/" + name + ".png";
        			var href = 'https://www.google.com.ua/search?hl=ru&source=hp&q=' + name + '&btnI=%D0%9C%D0%BD%D0%B5+%D0%BF%D0%BE%D0%B2%D0%B5%D0%B7%D1%91%D1%82%21&aq=f&aqi=g8g-s1g1&aql=&oq=&gs_rfai=';
        			data +=  '<a href=\"'+ href + '\" target=\"blank\">' + '<img src=\"'+ url + '\" title=\"' + name + '\" >' + '</a> ';
        		}
        	}
        }*/
	
	//highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});

TableCellLinksInDomain = TableCell.extend({

    template: _.template(templates.user_table.tdLinksIn)

});

TableCellLinksOutDomain = TableCell.extend({

    template: _.template(templates.user_table.tdLinksOut)

});

TableCellpagetitleDomain = TableCell.extend({

    template: _.template(templates.user_table.tdpagetitle),
    
    render: function() {
	var u = this.options.params.Uri,
	    isError = AppLocale.table.params.pageTitlesErrors[this.model.value] !== undefined,
	    value = this.model.value,
	    matches;
	        
	if (value) {
	    matches = value.match(/\REDIRECT]([^]+?)\[/);
	    if (matches) {
		value = AppLocale.table.params.redirectOn + matches[1];
		isError = true;
	    } else if (isError) {
		value = AppLocale.table.params.pageTitlesErrors[value];
	    }
	}
	
	$(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
	    data : value,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
	    isError: isError,
            checking: this.options.checking.indexOf(u.value) !==-1
        }));
	
        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }
    
});

TableCellpageweightDomain = TableCell.extend({

    template: _.template(templates.user_table.tdpageweight)

});

TableCellcommercialsDomains = TableCell.extend({

    template: _.template(templates.user_table.tdcommercials),

    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
	    path: 'chrome-extension://' +chrome.i18n.getMessage("@@extension_id") + '/icons/icons_commercials/',
	    data : this.model.value,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});


TableCellTechnorati = TableCell.extend({

    template: _.template(templates.user_table.tdTechnorati)

});


/*TableCellfb = TableCell.extend({

    template: _.template(templates.user_table.tdfb),
    render: function() {
        var u = this.options.params.Url || this.options.params.Uri;
     	var d = new Date();
        	d.setDate(d.getDate() - 2);
        	
        	//nsRDS.utils.Go("https://feedburner.google.com/api/awareness/1.0/GetFeedData?uri=" + m.value.FeedName + "&dates=" + date);
        $(this.el).html(this.template({url: u.value, m: this.model, date:d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()}));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');

        return this;
    }    

});*/

TableCellMJ = TableCell.extend({

    template: _.template(templates.user_table.tdMJ)

});

TableCellCF = TableCell.extend({

    template: _.template(templates.user_table.tdCF)

});

TableCellTF = TableCell.extend({

    template: _.template(templates.user_table.tdTF)

});

TableCellAhrefs = TableCell.extend({

    template: _.template(templates.user_table.tdAhrefs)

});

TableCellSemrush = TableCell.extend({

    template: _.template(templates.user_table.tdSemrush)

});

TableCellGoogleAdplanner = TableCell.extend({

    template: _.template(templates.user_table.tdGoogleAdplanner)

});

TableCellGoogleTrends = TableCell.extend({

    template: _.template(templates.user_table.tdGoogleTrends)

});

TableCellCompete = TableCell.extend({

    template: _.template(templates.user_table.tdCompete)

});

TableCellQuantcast = TableCell.extend({

    template: _.template(templates.user_table.tdQuantcast)

});

// TableCellNetchart= TableCell.extend({
// 
    // template: _.template(templates.user_table.tdNetchart)
// 
// });


TableCellAggregators = TableCell.extend({

    template: _.template(templates.user_table.tdAggregators)

});

TableCellISolomono = TableCell.extend({

    template: _.template(templates.user_table.tdISolomono),
    
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !== -1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});

TableCellSolomono = TableCell.extend({

    template: _.template(templates.user_table.tdSolomono),
    
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !== -1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});

TableCellWebmoney = TableCell.extend({

    template: _.template(templates.user_table.tdWebmoney),
	render: function() {
        var u = this.options.params.Uri;
        var icon = '';
        var m = this.model;
		
		if (m.value.IDsCount || m.value.IconType) {				
				var iconType = "";
				switch (m.value.IconType) {
					case 1:
						iconType = "green";
						break;
					case 2:
						iconType = "yellow";
						break;
					case 3:
						iconType = "service";
						break;
					default:
						iconType = "grey";
						break;
				}
				if (iconType == "grey" && m.value.IDsCount) {
					iconType = "service";
				}
				icon = "chrome://rdstb/skin/images/ParamIcons/webmoney_" + iconType +".png";								
		}
            
        $(this.el).html(this.template({
            url: u.value,
            m: m,
            icon : icon
        }));
        if (this.options.sorted) $(this.el).addClass('sorted');
        return this;
    }
});

TableCellAge = TableCell.extend({

    template: _.template(templates.user_table.tdAge)

});

TableCellDangerous = TableCell.extend({

    template: _.template(templates.user_table.tdDangerous),
    render: function() {
	var u = this.options.params.Uri;
        $(this.el).html(this.template({
	    indexes: this.fetch_indexes(this.model),
	    url: u.value,
	    d: this.options.params.Uri,
	    m: this.model,
	    date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !== -1 })
	);

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    },

    fetch_indexes: function(model) {
        if (!model.value) return [];
        var indexes = (model.value).toString(2),
            output = [];

            for (var i = indexes.length - 1; i >= 0; i -= 1) {
                    if (indexes[i] === '1') {
                        output.push(Math.pow(2, indexes.length - 1 - i));
                    }
                }

        return output;
    }

});

TableCellCounters = TableCell.extend({

    template: _.template(templates.user_table.tdCounters),
    render: function() {    	
        var u = this.options.params.Uri,
            m = this.model,
	    value = m.value,
            max = -3,
            hasCounters = false,		
	    counters = {},
	    c, name;	    
		
        for (c in value) {
	    if (/^Id/.test(c) && value[c]) {
		hasCounters = true;
		name = c.substr(2); // name without 'Id'				    
	        counters[name] = counters[name] || {};
		counters[name].name = name;
		if (c === 'IdGA') {
		    counters[name].value = value[c];
		}
		
	    } else if (typeof value[c] === 'number') {
		hasCounters = true;
		name = c; 
		counters[name] = counters[name] || {};
		counters[name].name = name;
		if (value[c] > 0) {
		    counters[name].value = value[c];
		}
		if (max < value[c]) {
		    max = value[c];
		}
	    }
	}
	
	// sort counters array by values
	counters = _.values(counters).sort(function(a,b) {
	    var v1 = a.value > 0 ? a.value : 0,
	        v2 = b.value > 0 ? b.value : 0;
            return v2 - v1;
        });
        
        $(this.el).html(this.template({
            url: u.value,
            m: m,
            max: max,
            hasCounters: hasCounters,
            data: counters,
            path: 'chrome-extension://' +chrome.i18n.getMessage("@@extension_id") + '/icons/counters/',
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !== -1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);

        return this;
    }
});

TableCellCountersPage = TableCellCounters.extend();

TableCellSocialNetworks = TableCell.extend({

    template: _.template(templates.user_table.tdSocialNetworks),
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
	    d: this.options.params.Uri,
            m: this.model,
            path: 'chrome-extension://' +chrome.i18n.getMessage("@@extension_id") + '/icons/likes/',
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !== -1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }
    
});

TableCellSeo = TableCell.extend({
    template: _.template(templates.user_table.tdSeo),
    render: function() {
	var u = this.options.params.Uri;
        $(this.el).html(this.template({
	    url: u.value,
	    markets: this.fetch_markets(),
	    m: this.model,
	    date: DataPaging.get('PerPage').get('width_date') && this.model.date,
	    checking: this.options.checking.indexOf(u.domain) !== -1
	}));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        //this.date_expired(this.model.date !== null && !this.model.date_is_valid);

        return this;
    },
    fetch_markets: function(){
        var output = [],
	    curMarket = null;
	
        _(this.model.value).each(function(e){
		curMarket = rdz.utils.Seo_NameByNumber[e];
                if (curMarket) {
                    if (curMarket === 'SapePr') curMarket = 'Sape Pr';
                    if (curMarket === 'SapeArticles') curMarket = 'Sape Articles';
                    if (curMarket === 'Rds') curMarket = 'recipdonor';//'Recipient donor service';
                    output.push(curMarket);
                }
        });
	
        return output;
    }
});

TableCelllinkspurch = TableCell.extend({

    template: _.template(templates.user_table.tdlinkspurch),
    render: function() {
	var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            path: 'chrome-extension://' +chrome.i18n.getMessage("@@extension_id") + '/icons/parameters/',
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);

        return this;
    }

});

TableCellRSS = TableCell.extend({

    template: _.template(templates.user_table.tdRSS)

});

TableCellRobots = TableCell.extend({

    template: _.template(templates.user_table.tdRobots)

});

TableCellSitemap = TableCell.extend({

    template: _.template(templates.user_table.tdSitemap)

});


//------------------------------------------------------------------------------------------> pageslibrary

TableCellUri = TableCell.extend({
    className: 'uri_cnt',
    template: _.template(templates.user_table.tdUri),
    render: function() {
	var url = this.model.path ? main.punycode.ToUnicode(this.model.domain) + main.rdz.utils.decodePath(this.model.path) : main.punycode.ToUnicode(this.model.domain); 
	
        $(this.el).html(this.template({
            url: url, www: this.model.www, mrkt: this.options.params.Seo  }));
        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');

        return this;
    }
});
TableCellIYP = TableCell.extend({

    template: _.template(templates.user_table.tdIYP)

});

TableCellIYDP = TableCell.extend({

    template: _.template(templates.user_table.tdIYDP),
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: rdz.utils.noWWWUri(u.value),
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(this.options.params.Uri.value) !== -1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);

        return this;
    }

});

TableCellIGP = TableCell.extend({

    template: _.template(templates.user_table.tdIGP)

});

TableCellPRpage = TableCell.extend({

    template: _.template(templates.user_table.tdPRpage),
    render: function() {
        var u = this.options.params.Uri;
        var page = u.value;
		var checksum = "8" + rdz.utils.getHash(page);
        $(this.el).html(this.template({
            url: u.value,
            m: this.model,
            checksum : checksum,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !== -1
        }));
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }   

});

TableCellPRpageMain = TableCell.extend({
	
    template: _.template(templates.user_table.tdPR),
    
    render: function() {
        var u = this.options.params.Uri;
        var page = u.value;               
		var checksum = "8" + rdz.utils.getHash(page);
        $(this.el).html(this.template({
            url: u.value,
            m: this.model,
            checksum : checksum,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.domain) !== -1
        }));
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    } 

});

TableCellMozRank = TableCell.extend({

    template: _.template(templates.user_table.tdMozRank)

});

TableCellseomozP = TableCell.extend({

    template: _.template(templates.user_table.tdseomozP)

});

TableCellAlexaPage = TableCell.extend({

    template: _.template(templates.user_table.tdAlexa)

});

TableCellBackAlexaPage = TableCell.extend({

    template: _.template(templates.user_table.tdBackAlexa)

});

TableCellISolomonoPage = TableCell.extend({

    template: _.template(templates.user_table.tdISolomono)

});

TableCellSolomonoPage = TableCell.extend({

    template: _.template(templates.user_table.tdSolomono)

});

TableCellDangerousPage = TableCell.extend({

    template: _.template(templates.user_table.tdDangerous),
    
    render: function() {
	var u = this.options.params.Uri;
        $(this.el).html(this.template({
	    indexes: this.fetch_indexes(this.model),
	    url: u.value,
	    d: this.options.params.Uri,
	    m: this.model,
	    date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !== -1 })
	);

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    },

    fetch_indexes: function(model) {
        if (!model.value) return [];
        var indexes = (model.value).toString(2),
            output = [];

            for (var i = indexes.length - 1; i >= 0; i -= 1) {
                    if (indexes[i] === '1') {
                        output.push(Math.pow(2, indexes.length - 1 - i));
                    }
                }
	return output;
    }

});

TableCellRecipientPage = TableCell.extend({

    template: _.template(templates.user_table.tdRecipientPage)

});

TableCellLinkPresence = TableCell.extend({

    template: _.template(templates.user_table.tdLinkPresence)

});

TableCellAnchor = TableCell.extend({

    template: _.template(templates.user_table.tdAnchor)

});

TableCellCMSpage = TableCell.extend({

    template: _.template(templates.user_table.tdCMSpage),
    render: function() {
	var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
	    path: 'chrome-extension://' +chrome.i18n.getMessage("@@extension_id") + '/icons/engines/',
	    data: this.model.value,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !==-1
        }));
	
	//highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});

TableCellpageweight = TableCell.extend({

    template: _.template(templates.user_table.tdpageweight)

});


TableCellpositionspage = TableCell.extend({

    template: _.template(templates.user_table.tdpositionspage)

});

TableCellLinksIn = TableCell.extend({

    template: _.template(templates.user_table.tdLinksIn)

});

TableCellLinksOut = TableCell.extend({

    template: _.template(templates.user_table.tdLinksOut)

});

TableCellpagetitle = TableCellpagetitleDomain;

TableCellcommercials = TableCell.extend({

    template: _.template(templates.user_table.tdcommercials),
    
    render: function() {
	var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
	    path: 'chrome-extension://' +chrome.i18n.getMessage("@@extension_id") + '/icons/icons_commercials/',
	    data : this.model.value,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !==-1
        }));

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    }

});


TableCellSocialNetworkspage = TableCell.extend({

    template: _.template(templates.user_table.tdSocialNetworkspage),
    render: function() {
	var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: this.model.value,
            m: this.model,
            path: 'chrome-extension://' +chrome.i18n.getMessage("@@extension_id") + '/icons/likes/',
	    date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !==-1
        }));
	
        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);	
        return this;
    }

});


TableCellValid = TableCell.extend({

    template: _.template(templates.user_table.tdValid),
    render: function() {
	var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: this.model.value,
            m: this.model,
            path: 'chrome-extension://' +chrome.i18n.getMessage("@@extension_id") + '/icons/parameters/',
	    date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !==-1
        }));
	
        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);	
        return this;
    }

});

TableCellNesting = TableCell.extend({

    template: _.template(templates.user_table.tdNesting),
    render: function() {
        var u = this.options.params.Uri;
        $(this.el).html(this.template({
            url: this.model.value,
            m: this.model,
	    date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !==-1
        }));
	
        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);	
        return this;
    }

});

TableCellUniqueContentPage = TableCell.extend({

    template: _.template(templates.user_table.tdUniqueContentPage),
    
    render: function() {
        var u = this.options.params.Uri,
	    m = this.model;
	    
	if (m.value && m.value.Matches && m.value.Matches.length) {
	    m.value.Matches = this.sortMatches();
	}
	    
        $(this.el).html(this.template({
            url: u.value,
            d: this.options.params.Uri,
            m: this.model,
            date: DataPaging.get('PerPage').get('width_date') && this.model.date,
            checking: this.options.checking.indexOf(u.value) !==-1
        }));	

        //highlight sorted column
        if (this.options.sorted) $(this.el).addClass('sorted');
        this.date_expired(this.model.date !== null && !this.model.date_is_valid);
        return this;
    },
    
    sortMatches: function () {
	var sorted = this.model.value.Matches.sort(function(a, b) {
            return b.percent - a.percent;
        });
	
	return sorted;
    }

});