templates = {
    header: {
        navigation :      '<div class="pages"><a class="mail" href="http://www.recipdonor.com/barfeedback"></a></div>'+
                          '<div class="db"><span class="rds-db"><ins>rds.sqlite</ins> </span><span class="empty"><%= AppLocale.navigation.empty %></span></div>',
        breadcrumbs:      '<a><%= page %></a><a class="act"><%= AppLocale.breadcrumbs.viewing %></a>',
        menu:             '<ul>' +
                            //'<li><a href="#recipients/1/1"><ins><%= AppLocale.menu.recipients %></ins></a></li>' +
                            '<li><a href="#siteslibrary/1/1"><ins><%= AppLocale.menu.siteslibrary %></ins> <%= sites > 0 ? "[" + rdz.utils.formatNumber.apply(sites, [0, "", "\u2009"]) + "]" : "" %></a></li>' +
                            '<li><a href="#pageslibrary/1/1"><ins><%= AppLocale.menu.pageslibrary %></ins> <%= pages > 0 ? "[" + rdz.utils.formatNumber.apply(pages, [0, "", "\u2009"]) + "]" : "" %></a></li>' +
                          '</ul>' +
                          '<ul>' +
                           '<li><a href="#checksites/1/1"><ins><%= AppLocale.menu.checksites %></ins></a></li>' +
                           '<li><a href="#checkpages/1/1"><ins><%= AppLocale.menu.checkpages %></ins></a></li>' +
                          '</ul>', /*+
                          '<ul>' +
                            '<li><a href="#execute"><ins><%= AppLocale.menu.execute %></ins></a></li>' +
                            '<li><a href="#datapage"><ins><%= AppLocale.menu.datapage %></ins></a></li>' +
                          '</ul>',*/
        auth:             '<% if (account) { %>' +
                                '<a href="http://www.recipdonor.com/account/settings" target="_blank" class="account"><%= account %></a>' +
                                '<div class="balance">' +
                                    '<span><%= AppLocale.auth.balance %></span>' +
                                    '<a href="http://www.recipdonor.com/userproperties/useroperations" class="<%= balance <= 0 ? \"nomoney\" : \"\" %>" ><%= balance > 0 ? ("$" + balance).replace(".", ",") : "$0,0000" %></a>' +
                                '</div>' +    
                          '<% } else { %>' +
                                '<div class="not-auth"><%= AppLocale.auth.not %></div>' +
                          '<% }  %>',
	indicators: {
	    progress: 	  '<% if (indicatorsState) { %>' +
				    '<% if (indicatorsState.isChecking) { %>' +
					'<% if (indicatorsState.checkingCount.progress !== null) { %>' +
					    '<span class="progress">' +
						'<span class="progressbar">' +
						    '<progress value="<%= indicatorsState.checkingCount.progress %>" max="100"></progress>' +
						    '<span><%= indicatorsState.checkingCount.checked %> (<%= indicatorsState.checkingCount.total %>)</span>' +
						'</span>' +
					    '</span>' +
					'<% }  %>' + 
				    '<% }  %>' + 
			  '<% }  %>',
	    timer:	  '<% if (indicatorsState) { %>' +
				    '<% if (indicatorsState.isChecking) { %>' +
					'<%= indicatorsState.newTime %>' +
				    '<% }  %>' + 
			  '<% }  %>'
	}

    },
    user_table: {

        th:             '<div class="th"><a href=""></a><sup><a href=""></a></sup></div>',
        thNum:          '<div class="th">№</div>',
        thCheck:        '<div class="th checkbox"><input type="checkbox" <%= m.checked ? checked="checked" : "" %> /></div>',
		
		thIP:           '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.IP %></a></span><div class="check"></div></div>',
		thGeo:  		'<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.Geo %></a></span><div class="check"></div></div>',
		thHost:  		'<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.Host %></a></span><div class="check"></div></div>',
		thProvider:  	'<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.Provider %></a></span><div class="check"></div></div>',
        thUrl:          '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Url %></a></span><div class="check"></div></div>',
        thTYC:          '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.TYC %></a></span><div class="check"></div></div>',
        thTYCBar:       '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.TYCBar %></a></span><div class="check"></div></div>',
        thTYCCategory:  '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.TYCCategory %></a></span><div class="check"></div></div>',
        thTYCTopics:    '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.TYCTopics %></a></span><div class="check"></div></div>',
        thTYCRegion:    '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.TYCRegion %></a></span><div class="check"></div></div>',
        thPR:    		'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.PR %></a></span><div class="check"></div></div>',
        thIY:           '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.IY %></a></span><div class="check"></div></div>',
        thIYD:          '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.IYD %></a></span><div class="check"></div></div>',
        thIG:           '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.IG %></a></span><div class="check"></div></div>',
        thSubdomains:   '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Subdomains %></a></span><div class="check"></div></div>',
        thWA:     	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.WA %></a></span><div class="check"></div></div>',
        thLG:           '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.LG %></a></span><div class="check"></div></div>',
        thBackBing:     '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.BackBing %></a></span><div class="check"></div></div>',
        thibing:        '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.ibing %></a></span><div class="check"></div></div>',
        thBing:        	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Bing %></a></span><div class="check"></div></div>',
        thIndexAol:    	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.IndexAol %></a></span><div class="check"></div></div>',
        thAlexa:        '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Alexa %></a></span><div class="check"></div></div>',
        thBackAlexa:    '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.BackAlexa %></a></span><div class="check"></div></div>',
        thDMOZ:    		'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.DMOZ %></a></span><div class="check"></div></div>',
        thCMS:    		'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.CMS %></a></span><div class="check"></div></div>',
        thTechnorati:   '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Technorati %></a></span><div class="check"></div></div>',
        /*thfb:       	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>">Feedburner</a></span><div class="check"></div></div>',*/
        thMJ:    	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.MJ %></a></span><div class="check"></div></div>',
	thCF:    	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.CF %></a></span><div class="check"></div></div>',
	thTF:    	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.TF %></a></span><div class="check"></div></div>',
        thAhrefs:    	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Ahrefs %></a></span><div class="check"></div></div>',
        thSemrush:    	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Semrush %></a></span><div class="check"></div></div>',
        thseomoz:       '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.seomoz %></a></span><div class="check"></div></div>',
        thGoogleAdplanner: '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.GoogleAdplanner %></a></span><div class="check"></div></div>',
        thGoogleTrends: '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.GoogleTrends %></a></span><div class="check"></div></div>',
        thCompete:    	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Compete %></a></span><div class="check"></div></div>',
        thQuantcast:    	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Quantcast %></a></span><div class="check"></div></div>',
        //thNetchart:    	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>">Netchart</a></span><div class="check"></div></div>',        
        thBY:           '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.BY %></a></span><div class="check"></div></div>',
        thImgyan:       '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Imgyan %></a></span><div class="check"></div></div>',
        thImgg:       	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Imgg %></a></span><div class="check"></div></div>',
        thAOLimg:       '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.AOLimg %></a></span><div class="check"></div></div>',
        thAggregators:  '<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.Aggregators %></a></span><div class="check"></div></div>',
        thISolomono:  	'<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.ISolomono %></a></span><div class="check"></div></div>',
        thSolomono:  	'<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.Solomono %></a></span><div class="check"></div></div>',
        
        thWebmoney:  	'<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.Webmoney %></a></span><div class="check"></div></div>',
        
        thAge:          '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Age %></a></span><div class="check"></div></div>',
        thpositions:  	'<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.positions %></a></span><div class="check"></div></div>',
        thDangerous:    '<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.Dangerous %></a></span><div class="check"></div></div>',
        thSocialNetworks:	'<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.SocialNetworks %></a></span><div class="check"></div></div>',
        thCounters:		'<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.Counters %></a></span><div class="check"></div></div>',
        thSeo:          '<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.Seo %></a></span><div class="check"></div></div>',
        thlinkspurch:   '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.linkspurch %></a></span><div class="check"></div></div>',
        thRSS:          '<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.RSS %></a></span><div class="check"></div></div>',
        thRobots:       '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Robots %></a></span><div class="check"></div></div>',
        thSitemap:      '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Sitemap %></a></span><div class="check"></div></div>',

        thUri:          '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Uri %></a></span><div class="check"></div></div>',
        thIYP:          '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.IYP %></a></span><div class="check"></div></div>',
        thIYDP:         '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.IYDP %></a></span><div class="check"></div></div>',
        thIGP:          '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.IGP %></a></span><div class="check"></div></div>',
        thPRpage:       '<div class="th"><span><a class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.PRpage %></a></span><div class="check"></div></div>',
        thPRpageMain:   '<div class="th"><span><a class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.PRpageMain %></a></span><div class="check"></div></div>',
	thMozRank:      '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.MozRank %></a></span><div class="check"></div></div>',
        thseomozP:      '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.seomozP %></a></span><div class="check"></div></div>',
	thRecipientPage: '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.RecipientPage %></a></span><div class="check"></div></div>',
	thLinkPresence: '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.LinkPresence %></a></span><div class="check"></div></div>',
	thAnchor: 	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Anchor %></a></span><div class="check"></div></div>',
	thCMSpage:   	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.CMSpage %></a></span><div class="check"></div></div>',
        thpageweight:   '<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.pageweight %></a></span><div class="check"></div></div>',
        thpositionspage: '<div class="th"><span><a class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.positionspage %></a></span><div class="check"></div></div>',
        thLinksIn: 		'<div class="th"><span><a class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.LinksIn %></a></span><div class="check"></div></div>',
        thLinksOut: 	'<div class="th"><span><a class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.LinksOut %></a></span><div class="check"></div></div>',
        thpagetitle:    '<div class="th"><span><a class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.pagetitle %></a></span><div class="check"></div></div>',
	thCountersPage:		'<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.CountersPage %></a></span><div class="check"></div></div>',
	thcommercials:  '<div class="th"><span><a class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.commercials %></a></span><div class="check"></div></div>',
	thSocialNetworkspage:	'<div class="th"><span><a class="param"><%= AppLocale.popup_bg.table_fields.SocialNetworkspage %></a></span><div class="check"></div></div>',
        thValid:      	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Valid %></a></span><div class="check"></div></div>',
        thNesting: 		'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.Nesting %></a></span><div class="check"></div></div>',
	thUniqueContentPage: 	'<div class="th"><span><a href="<%= uri %>" class="param <%= order %>"><%= AppLocale.popup_bg.table_fields.UniqueContentPage %></a></span><div class="check"></div></div>',

        td:             '<div class="td"></div>',
        tdNum:          '<div class="num"><%= n %></div>',
        tdCheck:        '<div class="chbox"><input type="checkbox" <% if (m.checked) {%> checked="checked" <% }%> /></div>',        
        tdIP:			'<div class="IP"><% if (m.date !==  null) {%>' + 
        					'<div class="IP-l"><a title="<%= AppLocale.table.title.ip %>" href="http://geoip.flagfox.net/?ip=<%= m.value.IP %>" target="_blank"><%= m.value.IP !== null  ? m.value.IP : AppLocale.table.params.no %></a></div>' +
        					'<div class="IP-r">' + 
        						'<div class="IP-r-sup">' + 
        						  '<% if ( m.value.SitesCount !== null) { %><a title="<%= m.value.SitesCount %> <%= rdz.utils.endings(m.value.SitesCount, {nom: AppLocale.table.params.site_nom, gen: AppLocale.table.params.site_gen, plu: AppLocale.table.params.site_plu}) + AppLocale.table.params.on_ip_by_Bing %>" href="http://www.bing.com/search?q=ip%3A<%= m.value.IP %>&setplang=ru-RU" target="_blank"><%= m.value.SitesCount !== null ? m.value.SitesCount : AppLocale.table.params.no %></a> <% } %>' +
        						  '<% if ( m.value.SitesCountSolomono !== null) { %><a title="<%= m.value.SitesCountSolomono %> <%= rdz.utils.endings(m.value.SitesCountSolomono, {nom: AppLocale.table.params.site_nom, gen: AppLocale.table.params.site_gen, plu: AppLocale.table.params.site_plu}) + AppLocale.table.params.on_ip_by_Solomono %>" href="http://linkpad.ru/?search=http%3A%2F%2F<%= url %>#/default.aspx?r=2&i=<%= url %>&ip=<%= url %>" target="_blank"><%= m.value.SitesCountSolomono !== null ? m.value.SitesCountSolomono : AppLocale.table.params.no %></a> <% } %>' +
        						  '<% if ( m.value.SitesCountRDS !== null) { %><a title="<%= m.value.SitesCountRDS %> <%= rdz.utils.endings(m.value.SitesCountRDS, {nom: AppLocale.table.params.site_nom, gen: AppLocale.table.params.site_gen, plu: AppLocale.table.params.site_plu}) + AppLocale.table.params.on_ip_by_RDS %>" href="http://www.recipdonor.com/infoip?ip=<%= m.value.IP %>" target="_blank"><%= m.value.SitesCountRDS !== null ? m.value.SitesCountRDS : AppLocale.table.params.no %></a><% } %>' +
        						'</div><div class="IP-r-sub"></div>' + 
        					'</div>' + 
        				 '<% } else {%><span class="gray">?</span><% }%></div>', 
        						 //'<div class="IP-r2"><div class="IP-r-sup"><% if ( m.value.SitesCountSolomono !== null) { %><a title="<%= m.value.SitesCountSolomono %> <%= rdz.utils.endings(m.value.SitesCountSolomono, {nom: \'сайт\', gen: \'сайта\', plu: \'сайтов\'}) %> на ip по Solomono" href="http://linkpad.ru/?search=http%3A%2F%2F<%= url %>#/default.aspx?r=2&i=<%= url %>&ip=<%= url %>" target="_blank"><%= m.value.SitesCountSolomono !== null ? m.value.SitesCountSolomono : AppLocale.table.params.no %></a><% } %></div><div class="IP-r-sub"></div></div>' +
        						 //'<div class="IP-r3"><div class="IP-r-sup"><% if ( m.value.SitesCountRDS !== null) { %><a title="<%= m.value.SitesCountRDS %> <%= rdz.utils.endings(m.value.SitesCountRDS, {nom: \'сайт\', gen: \'сайта\', plu: \'сайтов\'}) %> на ip по RDS" href="http://www.recipdonor.com/infoip?ip=<%= m.value.IP %>" target="_blank"><%= m.value.SitesCountRDS !== null ? m.value.SitesCountRDS : AppLocale.table.params.no %></a><% } %></div><div class="IP-r-sub"></div></div>' +
        				 
        tdGeo:     		'<div class="Geo"><% if (m.date !==  null) {%><span title="<%= AppLocale.table.title.geo %>"> <% if (m.value.Country !== null) { %> <img src="chrome://rdstb/skin/images/flags/<%= m.value.Flag %>.png"> <%= m.value.Country %><% } if (m.value.City !== null) { %>/<%= m.value.City %><% } %></span><% } else {%><span class="gray">?</span><% }%><ins></ins></div>', 
        tdHost:     	'<div class="Host"><% if (m.date !==  null) {%><span title="<%= m.value.Host %>"><%= m.value.Host !== null ? m.value.Host : AppLocale.table.params.no %></span><% } else {%><span class="gray">?</span><% }%><ins></ins></div>',
        tdProvider:     '<div class="Provider"><% if (m.date !==  null) {%><span title="<%= m.value.Provider %>"><%= m.value.Provider !== null  ? m.value.Provider : AppLocale.table.params.no %></span><% } else {%><span class="gray">?</span><% }%><ins></ins></div>',      
        tdUrl:          '<div class="www gray"><%= www ? \"www.\" : AppLocale.table.params.no %></div><div class="Url"><a href="http://<%= url %>" target="_blank" class="<%= mrkt.value && mrkt.value.length > 0 ? \"bg-blue\" : \"\" %>"><%= url %></a></div>',
        tdTYC:          '<div class="TYC">' +
                        '<% if (checking) {%> ' +
                            '<a class="dot" href="http://yaca.yandex.ru/yca/cy/ch/<%= d.domain %>/" target="_blank">...</a> ' +
                        '<%} else  if (m.value.TYC !==  null) { ' +
                            'if ((m.value.UIMirrorsCount !==  null) && (m.value.UIMirrorsCount >  0)) {%>' +
                                '(<a title="<%= rdz.utils.formatNumber.apply(m.value.UIMirrorsCount, [0, "", "\u2009"]) %> <%= rdz.utils.endings(m.value.UIMirrorsCount, {nom: AppLocale.table.params.mirror_nom, gen: AppLocale.table.params.mirror_gen, plu: AppLocale.table.params.mirror_plu}) + AppLocale.table.params.mirror_by_yandex %>" href="http://www.recipdonor.com/info?TaDomains=<%= d.value %>&CheckBonding=true" target="_blank"><%= rdz.utils.formatNumber.apply(m.value.UIMirrorsCount, [0, "", "\u2009"]) %></a>)' +
                            '<% }%> ' +
                            '<a title="<%= AppLocale.table.title.tyc %>" href="<%= url %>" target="_blank" class="<%= m.value.Catalog ? \'bold\' : null %>">  ' +
                                    '<%= m.value.TYC !== -1 ? m.value.TYC !== rdz.errors.AGS ? rdz.utils.formatNumber.apply(m.value.TYC, [0, "", "\u2009"]) : AppLocale.table.params.AGS : AppLocale.table.params.glued %> ' +
                                '</a>' +
                            '<sup> <%= date ? rdz.utils.prettyDate(date, {time_or_date:true}) : null %></sup>' +
                        '<% } else {%> ' +
                            '<a class="unknown" href="<%= d.domain %>" target="_blank">?</a>' +
                        '<% }%>' +
                        '</div>',
        tdTYCBar:       '<div class="TYCBar">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://bar-navig.yandex.ru/u?ver=2&url=http://<%= d.domain %>&show=1" target="_blank">...</a> ' +
                            '<%} else if (m.value.TYCBar !==  null) {%>' +
                                '<a href="http://bar-navig.yandex.ru/u?ver=2&url=http://<%= d.domain %>&show=1" target="_blank" class="<%= (m.date !==  null) && (m.value.TYCBar !== -1) && (m.value.Topics !==  null || m.value.Region !==  null) ? \'bold\' : null %>">' +
                                    '<%= m.value.TYCBar !== -1 ? rdz.utils.formatNumber.apply(m.value.TYCBar, [0, "", "\u2009"]) : AppLocale.table.params.glued %> ' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date, {time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://bar-navig.yandex.ru/u?ver=2&url=http://<%= d.domain %>&show=1" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdTYCCategory:  '<div class="TYCCategory"><% if (checking) {%> <a class="dot" href="http://yaca.yandex.ru/yca/cy/ch/<%= d.domain %>/" target="_blank">...</a> <%} else if (m.date !==  null) {%><% if (m.value !==  null) {%> <a href="http://yaca.yandex.ru/yca/cy/ch/<%= d.domain %>/" target="_blank"> <%= m.value %> </a> <% }%><% } else {%>  <a class="unknown" href="http://yaca.yandex.ru/yca/cy/ch/<%= d.domain %>/" target="_blank">?</a> <% }%><ins></ins></div>',
        tdTYCTopics:    '<div class="TYCTopics"><% if (checking) {%> <a class="dot" href="http://bar-navig.yandex.ru/u?ver=2&url=http://<%= d.domain %>&show=1" target="_blank">...</a> <%} else if (m.date !==  null) {%><% if (m.value !==  null) {%> <a href="http://bar-navig.yandex.ru/u?ver=2&url=http://<%= d.domain %>&show=1" target="_blank"> <%= m.value %> </a> <% }%><% } else {%>  <a class="unknown" href="http://bar-navig.yandex.ru/u?ver=2&url=http://<%= d.domain %>&show=1" target="_blank">?</a> <% }%><ins></ins></div>',
        tdTYCRegion:    '<div class="TYCRegion"><%  if (checking) {%><a class="dot" href="http://bar-navig.yandex.ru/u?ver=2&url=http://<%= d.domain %>&show=1" target="_blank">...</a> <%} else if (m.date !==  null) {%><% if (m.value !==  null) {%>  <%= m.value %>  <% }%><% } else {%> <span class="gray">?</span> <% }%><ins></ins></div>',
        tdPR: 			'<div class="PR">' +
                        '<% if (checking) {%> ' +
                            '<a class="dot" href="http://toolbarqueries.google.com/tbr?features=Rank&sourceid=navclient-ff&client=navclient-auto-ff&ch=<%= checksum %>&q=info:<%= url %>" target="_blank">...</a> ' +
                        '<%} else if (m.date !==  null) { ' +
                            'if (m.value.Value !== null) { ' +
                                'if (m.value.PRg !== 1) { %>' +
                                    '<a title="<%= AppLocale.table.title.pr %>" href="http://toolbarqueries.google.com/tbr?features=Rank&sourceid=navclient-ff&client=navclient-auto-ff&ch=<%= checksum %>&q=info:<%= url %>" target="_blank" class="<%= m.value.DMOZ ? \'bold\' : null %>" >' +
                                        '<%= m.value.Value %>' +
                                    '</a>' +
                                '<% } else { %>'+
                                    '<a title="<%= AppLocale.table.params.boundedWith %><%= m.value.PRgTooltip %>" href="https://www.google.com/search?hl=ru&q=info%3A<%= url %>" target="_blank" class="<%= m.value.DMOZ ? \'bold\' : null %>">' +
                                        '<%= AppLocale.table.params.glued %>' +
                                    '</a>' +
                                '<%} %>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date, {time_or_date:true}) : null %></sup>' +
                            '<%}%>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://toolbarqueries.google.com/tbr?features=Rank&sourceid=navclient-ff&client=navclient-auto-ff&ch=<%= checksum %>&q=info:<%= url %>" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdIY:           '<div class="IY">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://yandex.ru/yandsearch?text=url:www.<%= d.domain %>* | url:<%= d.domain %>*" target="_blank">...</a> ' +
                            '<%} else if (m.value !==  null) {%>' +
                                '<a href="http://yandex.ru/yandsearch?text=url:www.<%= d.domain %>* | url:<%= d.domain %>*" target="_blank"><%= rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) %></a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%>' +
                                '<a class="unknown" href="http://yandex.ru/yandsearch?text=url:www.<%= d.domain %>* | url:<%= d.domain %>*">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdIYD:          '<div class="IYD">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://yandex.ru/yandsearch?how=tm&numdoc=50&text=url:www.<%= d.domain %>* | url:<%= d.domain %>*" target="_blank">...</a> ' +
                            '<%} else if (m.date !==  null) {%>' +
                                '<a href="http://yandex.ru/yandsearch?how=tm&numdoc=50&text=url:www.<%= d.domain %>* | url:<%= d.domain %>*" target="_blank">' +
                                '<%= (m.value !==  null && m.value !==  0) ? rdz.utils.prettyDate(m.value) :  AppLocale.table.params.unknown %>  ' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                            '<a class="unknown" href="http://yandex.ru/yandsearch?how=tm&numdoc=50&text=url:www.<%= d.domain %>* | url:<%= d.domain %>*" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdIG:           '<div class="IG">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="https://www.google.com/search?hl=en&q=site:<%= d.domain %>&btnG=Search" target="_blank">...</a> ' +
                            '<%} else if (m.value !==  null) {%>' +
                                '<a href="https://www.google.com/search?hl=en&q=site:<%= d.domain %>&btnG=Search" target="_blank">' +
                                    '<%= rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) %>' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%>' +
                                    '<a class="unknown" href="https://www.google.com/search?hl=en&q=site:<%= d.domain %>&btnG=Search" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
	tdSubdomains:   '<div class="Subdomains"><% if (m.value !==  null) {%><a title="<%= AppLocale.table.title.subdomains %>" href="http://www.recipdonor.com/feedback?ln=ru" target="_blank"><%= rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) %></a><% } else {%> <a class="unknown" href="http://www.recipdonor.com/feedback?ln=ru" target="_blank">?</a><% }%></div>',
	tdWA: 		'<div class="WA">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://wayback.archive.org/*/http://<%= d.domain %>" target="_blank">...</a> ' +
                            '<%} else if (m.value !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.wa %>" href="http://wayback.archive.org/*/http://<%= d.domain %>" target="_blank">' +
                                    '<%= m.value === 0 ? AppLocale.table.params.no : rdz.utils.prettyDate(m.value, {withoutDays:true, year:true}) %>' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date, {time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://wayback.archive.org/*/http://<%= d.domain %>" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
       	tdseomoz: 		'<div class="seomoz">' +
                            '<% if (m.date !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.seomoz %>" href="http://www.opensiteexplorer.org/links?site=<%= url %>" target="_blank">' +
                                    '<%= (m.value !== 0 && m.value !== null ) ? m.value : AppLocale.table.params.no %>' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://www.opensiteexplorer.org/links?site=<%= url %>" target="_blank">?</a>' +
                            '<% } %>' +
                        '</div>',
       	tdLG: 			'<div class="LG">' +
                            '<% if (m.value !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.lg %>" href="https://google.com/search?hl=en&q=link:<%= url %>&btnG=Search" target="_blank"><%= rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) %></a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="https://google.com/search?hl=en&q=link:<%= url %>&btnG=Search" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdBackBing: 	'<div class="BackBing">' +
                            '<% if (m.value !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.backBing %>" href="http://www.bing.com/search?q=inbody:<%= url %>+-site:<%= url %>" target="_blank"><%= rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) %></a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://www.bing.com/search?q=inbody:<%= url %>+-site:<%= url %>" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdibing: 		'<div class="ibing">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://www.bing.com/search?q=site%3A<%= url %>&setplang=en-US" target="_blank">...</a> ' +
                            '<%} else if (m.value !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.ibing %>" href="http://www.bing.com/search?q=site%3A<%= url %>&setplang=en-US" target="_blank"><%= rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) %></a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://www.bing.com/search?q=site%3A<%= url %>&setplang=en-US" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdBing: 		'<div class="Bing">' +
                            '<% if (m.value !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.bing %>" href="http://www.bing.com/search?q=linkfromdomain%3A<%= url %>&go=&form=QBRE&filt=all&setplang=ru-RU" target="_blank"><%= rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) %></a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://www.bing.com/search?q=linkfromdomain%3A<%= url %>&go=&form=QBRE&filt=all&setplang=ru-RU" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdIndexAol: 	'<div class="IndexAol"><% if (m.date !==  null) {%><a title="<%= AppLocale.table.title.indexAol %>" href="http://aolsearcht4.search.aol.com/aol/search?q=site%3A<%= url %>" target="_blank"><%= m.value !== -1 ? (m.value !== 0 ? m.value : AppLocale.table.params.no) : AppLocale.table.params.glued %></a><% } else {%> <a class="unknown" href="http://aolsearcht4.search.aol.com/aol/search?q=site%3A<%= url %>" target="_blank">?</a><% }%></div>',
        tdAlexa: 	'<div class="Alexa">' +
	                    '<% if (checking) {%> ' +
                                '<a class="unknown" href="http://www.alexa.com/siteinfo/<%= url %>" target="_blank">...</a>' +
                            '<%} else if (m.date !==  null) {%>' +
                                '<a class="value" title="<%= AppLocale.table.title.alexa %>" href="http://www.alexa.com/siteinfo/<%= url %>" target="_blank"> ' +
                                    '<%= (m.value.Value !== -1 && m.value.Value !== -666) ? (m.value.Value !== null ? rdz.utils.formatNumber.apply(m.value.Value, [0, "", "\u2009"]) : AppLocale.table.params.no) : AppLocale.table.params.glued %>' +
                                '</a>' +
                                '<% if (m.value.Value > 0 && m.value.Regional !== null) {%>  ' +
                                    '<span><img src="../icons/flags/<%= m.value.Code %>.png" title="<%= m.value.Code %>"></span>  ' +
                                    '<a class="regional" title="<%= AppLocale.table.title.alexaRegional %>" href="http://www.alexa.com/siteinfo/<%= url %>" target="_blank"><%= m.value.Regional%></a>' +
                                '<%}%>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<%} else {%> ' +
                                '<a class="unknown" href="http://www.alexa.com/siteinfo/<%= url %>" target="_blank">?</a>' +
                            '<%}%>' +
                        '</div>',
        tdBackAlexa: 	'<div class="BackAlexa">' +
                            '<% if (checking) {%> ' +
                                '<a class="unknown" href="http://xml.alexa.com/data?cli=10&dat=nsa&url=<%= url %>" target="_blank">...</a>' +
                            '<%} else if (m.date !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.backAlexa %>" href="http://xml.alexa.com/data?cli=10&dat=nsa&url=<%= url %>" target="_blank">' +
                                    '<%= m.value !== -1 ? (m.value !== null ? rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) : AppLocale.table.params.no) : AppLocale.table.params.glued %>' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://xml.alexa.com/data?cli=10&dat=nsa&url=<%= url %>" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdDMOZ: 		'<div class="DMOZ">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://search.dmoz.org/search/?q=<%= d.domain %>" target="_blank">...</a> ' +
                            '<%} else if (m.date !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.dmoz %>" href="http://search.dmoz.org/search/?q=<%= d.domain %>" target="_blank">' +
                                    '<%= (m.value.Value !== 0 && m.value.Value !== null ) ? AppLocale.table.params.yes : AppLocale.table.params.no %>' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://search.dmoz.org/search/?q=<%= d.domain %>" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdCMS:     	'<div class="CMS">' +
	                    '<% if (checking) {%> ' +
                                '<a class="dot" href="" target="_blank">...</a> ' +
                            '<%} else if (m.date !== null) {%>' +
        			'<% if (data !==  null) { %>' +     								
        			    '<% _.each(data, function(engineType, key) { %>' +
        				'<% if (engineType.length > 0) { %>' +
					    '<%= AppLocale.table.params.CMS[key] %>' + ': ' +
        					'<% _.each(engineType, function(engine) { %>' +
                            			    '<a target="_blank" href="https://www.google.com.ua/search?hl=ru&source=hp&q=<%= engine %>&btnI=%D0%9C%D0%BD%D0%B5+%D0%BF%D0%BE%D0%B2%D0%B5%D0%B7%D1%91%D1%82%21&aq=f&aqi=g8g-s1g1&aql=&oq=&gs_rfai=">' +
                            				'<img src="<%=path + engine %>.png" title="<%= engine %>">' +	
                            			    '</a> ' +
                            			'<% }) %>' +        										
        				'<% } %>' +
                            	    '<% }) %>' +
				    '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
        		        '<% } else { %><%= AppLocale.table.params.no %><% } %>'+
        		'<% } else { %><span class="gray">?</span><% }%></div>', 
        tdTechnorati: 	'<div class="Technorati"><% if (m.date !==  null) {%><a title="<%= AppLocale.table.title.technorati %>" href="http://technorati.com/blogs/<%= url %>" target="_blank"><%= m.value !== 0 ? m.value : AppLocale.table.params.no %></a><% } else {%> <a class="unknown" href="http://technorati.com/blogs/<%= url %>" target="_blank">?</a><% }%></div>',
        /*tdfb:       	'<div class="fb"><% if (m.date !==  null) {%> <a title="<%= AppLocale.table.title.fb %>" href="https://feedburner.google.com/api/awareness/1.0/GetFeedData?uri=<%= m.value.FeedName %>&dates=<%= date %>" class="value" target="_blank"><%= m.value.Value !== null ? m.value.Value : AppLocale.table.params.no %></a> <% } else {%> <span class="gray">?</span> <% }%></div>',*/
        tdMJ: 			'<div class="MJ">' +
                            '<% if (m.date !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.mj %>" href="https://majestic.com/reports/site-explorer?folder=&IndexDataSource=F&q=http://<%= url %>/&scope=domain&oq=<%= url %>/" target="_blank">' +
                                    '<%= m.value !== -1 ? (m.value !== null ? rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) : AppLocale.table.params.no) : AppLocale.table.params.glued %>' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%>' +
                                '<a class="unknown" href="https://majestic.com/reports/site-explorer?folder=&IndexDataSource=F&q=http://<%= url %>/&scope=domain&oq=<%= url %>/" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
	tdCF: 		'<div class="CF">' +
                            '<% if (m.date !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.cf %>" href="https://majestic.com/reports/site-explorer?folder=&IndexDataSource=F&q=http://<%= url %>/&scope=domain&oq=<%= url %>/" target="_blank">' +
                                    '<%= m.value !== -1 ? (m.value !== null ? rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) : AppLocale.table.params.no) : AppLocale.table.params.glued %>' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%>' +
                                '<a class="unknown" href="https://majestic.com/reports/site-explorer?folder=&IndexDataSource=F&q=http://<%= url %>/&scope=domain&oq=<%= url %>/" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
	tdTF: 		'<div class="CF">' +
                            '<% if (m.date !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.tf %>" href="https://majestic.com/reports/site-explorer?folder=&IndexDataSource=F&q=http://<%= url %>/&scope=domain&oq=<%= url %>/" target="_blank">' +
                                    '<%= m.value !== -1 ? (m.value !== null ? rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) : AppLocale.table.params.no) : AppLocale.table.params.glued %>' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%>' +
                                '<a class="unknown" href="https://majestic.com/reports/site-explorer?folder=&IndexDataSource=F&q=http://<%= url %>/&scope=domain&oq=<%= url %>/" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdAhrefs: 		'<div class="Ahrefs"><% if (m.date !==  null) {%><a title="<%= AppLocale.table.title.ahrefs %>" href="https://ahrefs.com/site-explorer/overview/domain/<%= url %>" target="_blank"><%= m.value.Value !== null ? rdz.utils.formatNumber.apply(m.value.Value, [0, "", "\u2009"]) : AppLocale.table.params.no %></a><% } else {%> <a class="unknown" href="https://ahrefs.com/site-explorer/overview/domain/<%= url %>" target="_blank">?</a><% }%></div>',  
        tdSemrush:  '<div class="Semrush">' +
        				'<% if (m.date !==  null ) {%>' +
                            '<div><a title="<%= AppLocale.table.title.semrush %>" href="http://www.semrush.ru/info/<%= url %>?ref=911719281" target="_blank"> <%= (m.value.Value !== 0 && m.value.Value !== null ) ? m.value.Value : AppLocale.table.params.no %> </a></div>' + ' ' +
                            '<div><% if (m.value.Traffic !== 0 && m.value.Traffic !== null ) {%> / <a title="<%= AppLocale.table.title.semrushTraffic %>" href="http://www.semrush.ru/info/<%= url %>?ref=911719281" target="_blank"><%= m.value.Traffic %></a><% } %></div>' + ' ' +
                            '<div><% if (m.value.Costs !== 0 && m.value.Costs !== null ) {%>(<a title="<%= AppLocale.table.title.semrushCosts %>" href="http://www.semrush.ru/info/<%= url %>?ref=911719281" target="_blank">$<%= m.value.Costs %></a>)<% } %></div>' +
                            '<sup><%= date && m.value.Value !== 0 && m.value.Value !== null  ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                        '<% } else { %> <a class="unknown" href="http://www.semrush.ru/info/<%= url %>?ref=911719281" target="_blank">?</a><% }%>' +
                    '</div>',
        tdGoogleAdplanner: '<div class="GoogleAdplanner"><% if (m.date !==  null) {%><a title="<%= AppLocale.table.title.googleAdplanner %>" href="https://www.google.com/adplanner/planning/site_profile?hl=ru#siteDetails?identifier=<%= url %>&lp=true" target="_blank"><%= (m.value.Value !== 0 && m.value.Value !== null ) ? m.value.Value : AppLocale.table.params.no %></a><% } else {%> <a class="unknown" href="https://www.google.com/adplanner/planning/site_profile?hl=ru#siteDetails?identifier=<%= url %>&lp=true" target="_blank">?</a><% }%></div>',  
        tdGoogleTrends: '<div class="GoogleTrends"><% if (m.date !==  null) {%><a title="<%= AppLocale.table.title.googleTrends %>" href="http://trends.google.com/websites?q=<%= url %>&geo=all&date=all&sort=0" target="_blank"><%= m.value.Value !== null ? AppLocale.table.params.yes : AppLocale.table.params.no %></a><% } else {%> <a class="unknown" href="http://trends.google.com/websites?q=<%= url %>&geo=all&date=all&sort=0" target="_blank">?</a><% }%></div>',  
        tdCompete: 		'<div class="Compete"><% if (m.date !==  null) {%><a title="<%= AppLocale.table.title.compete %>" href="http://siteanalytics.compete.com/<%= url %>/" target="_blank"><% if (m.value.Value !== null || m.value.LastMonth !== null || m.value.UV !== null ) { %> <%= (m.value.Value || m.value.LastMonth || AppLocale.table.params.no) %> <% if (m.value.UV) { %>(<%= m.value.UV %>) <% } } else { %> <%= AppLocale.table.params.no %> <% } %></a><% } else { %> <a class="unknown" href="http://siteanalytics.compete.com/<%= url %>/" target="_blank">?</a><% }%></div>',
        tdQuantcast: 	'<div class="Quantcast"><% if (m.date !==  null) {%><a title="<%= AppLocale.table.title.quantcast %>" href="http://www.quantcast.com/<%= url %>" target="_blank"><% if (m.value.Value !== null || m.value.Unique !== null) { %> <%= ((m.value.Value !== null && m.value.Value !== 0) ? m.value.Value : AppLocale.table.params.no) %> <% if (m.value.Unique) { %>(<%= m.value.Unique %>) <% } } else { %> <%= AppLocale.table.params.no %> <% } %></a><% } else { %> <a class="unknown" href="http://www.quantcast.com/<%= url %>" target="_blank">?</a><% }%></div>',
        //tdNetchart:     '<div class="Netchart"><% if (m.date !==  null) {%><a title="<%= AppLocale.table.title.netchart %>" href="http://netchart.ru/siteInfo/<%= url %>#graphic:ESTIMATE_REACH:QUARTER" target="_blank"><%= (m.value.Value !== 0 && m.value.Value !== null ) ? m.value.Value : AppLocale.table.params.no %></a><% } else {%> <a class="unknown" href="http://netchart.ru/siteInfo/<%= url %>#graphic:ESTIMATE_REACH:QUARTER" target="_blank">?</a><% }%></div>',
        tdBY:           '<div class="BY">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://yandex.ru/yandsearch?text=%22*.<%= url %>%22" target="_blank">...</a> ' +
                            '<%} else if (m.value !==  null) {%> ' +
                                '<a href="http://yandex.ru/yandsearch?text=%22*.<%= url %>%22" target="_blank"><%= m.value %></a> ' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%>' +
                                '<a class="unknown" href="http://yandex.ru/yandsearch?text=%22*.<%= url %>%22">?</a> ' +
                            '<% }%>' +
                        '</div>',
        tdImgyan:       '<div class="Imgyan">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://images.yandex.ua/yandsearch?site=<%= url %>" target="_blank">...</a> ' +
                            '<%} else if (m.value !==  null) {%> ' +
                                '<a href="http://images.yandex.ua/yandsearch?site=<%= url %>" class="value" target="_blank"><%= rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) %></a> ' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://images.yandex.ua/yandsearch?site=<%= url %>">?</a> ' +
                            '<% }%>' +
                        '</div>',
        tdImgg:       	'<div class="Imgg">' +
                            '<% if (checking) {%> ' +
                                ' <a class="dot" href="http://images.google.com.ua/images?source=hp&safe=off&q=site%3A<%= url %>&biw=1440&bih=781&uss=1" target="_blank">...</a>' +
                            '<%} else if (m.value !==  null) {%> ' +
                                '<a title="<%= AppLocale.table.title.imgg %>" href="http://images.google.com.ua/images?source=hp&safe=off&q=site%3A<%= url %>&biw=1440&bih=781&uss=1" class="value" target="_blank"><%= rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) %></a> ' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://images.google.com.ua/images?source=hp&safe=off&q=site%3A<%= url %>&biw=1440&bih=781&uss=1">?</a> ' +
                            '<% }%>' +
                        '</div>',
        tdAOLimg:       '<div class="AOLimg"><% if (m.value !==  null) {%> <a title="<%= AppLocale.table.title.aolimg %>" href="http://aolsearcht2.search.aol.com/aol/image?&q=site%3A<%= url %>" class="value" target="_blank"><%= m.value %></a> <% } else {%> <a class="unknown" href="http://aolsearcht2.search.aol.com/aol/image?&q=site%3A<%= url %>">?</a> <% }%></div>',
        tdAggregators:  '<div class="Aggregators">' +
                            '<div><% if (m.value[0] == 1) { %><a class="yandex" title="<%= AppLocale.table.title.aggregatorsYandex %>" target="_blank" href="http://news.yandex.ru/yandsearch?rpt=smisearch&text=<%= url %>"></a><% } else if (m.value[0] !== 0) {%> <a class="gray unknown" target="_blank" href="http://news.yandex.ru/yandsearch?rpt=smisearch&text=<%= url %>">?</a> <% }%></div>' +
                            '<div><% if (m.value[1] == 1) { %><a class="google" title="<%= AppLocale.table.title.aggregatorsGoogle %>" target="_blank" href="https://www.google.ru/search?sclient=psy-ab&hl=ru&newwindow=1&gl=ru&tbm=nws&source=hp&q=site:<%= url %>&pbx=1&oq=site:<%= url %>&aq=f&aqi=g-t4&aql=&gs_sm=e&gs_upl=11136l13348l4l13479l6l6l0l0l0l0l1004l2252l3-2.0.1.0.1l4l0&bav=on.2,or.r_gc.r_pw.,cf.osb&biw=1574&bih=681&cad=h"></a>' +
                            	'<% } else if (m.value[1] !== 0) {%> <a class="gray unknown" target="_blank" href="https://www.google.ru/search?sclient=psy-ab&hl=ru&newwindow=1&gl=ru&tbm=nws&source=hp&q=site:<%= url %>&pbx=1&oq=site:<%= url %>&aq=f&aqi=g-t4&aql=&gs_sm=e&gs_upl=11136l13348l4l13479l6l6l0l0l0l0l1004l2252l3-2.0.1.0.1l4l0&bav=on.2,or.r_gc.r_pw.,cf.osb&biw=1574&bih=681&cad=h">?</a><% }%></div>' +
                            '<div><% if (m.value[2] == 1) { %><a class="novoteka" title="<%= AppLocale.table.title.aggregatorsNovoteka %>" target="_blank" href="http://www.novoteka.ru/source/"></a><% } else if (m.value[2] !== 0) {%> <a class="gray unknown" target="_blank" href="http://www.novoteka.ru/source/">?</a><% }%></div>' +
                        '</div>',
        
        tdISolomono: 	'<div class="ISolomono">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://linkpad.ru/default.aspx?r=13&amp;i=<%= url %>" target="_blank">...</a>' +
                            '<%} else if (m.date !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.iSolomono %>" href="http://linkpad.ru/default.aspx?r=13&amp;i=<%= url %>" target="_blank">' +
                                    '<%= m.value.index !== null ? rdz.utils.formatNumber.apply(m.value.index, [0, "", "\u2009"]) : AppLocale.table.params.no %>' +
                                '</a>' +
				'<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else { %>' +
                                '<a class="unknown" href="http://linkpad.ru/default.aspx?r=13&amp;i=<%= url %>" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdSolomono: 	'<div class="Solomono">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://linkpad.ru/default.aspx?r=13&amp;i=<%= url %>" target="_blank">...</a>' +
                            '<% } else if (m.date !==  null) {%>' +
                                '<a class="din" title="<%= AppLocale.table.title.solomonoIn %>" href="http://www.linkpad.ru/default.aspx?ref=rdsbar&to=<%= url %>" target="_blank">' +
                                    '<%= m.value.din !== null ? rdz.utils.formatNumber.apply(m.value.din, [0, "", "\u2009"]) : 0 %>' +
                                '</a> / <a class="dout" title="<%= AppLocale.table.title.solomonoOut %>" href="http://www.linkpad.ru/default.aspx?ref=rdsbar&from=<%= url %>" target="_blank">' +
                                    '<%= m.value.dout !== null ? rdz.utils.formatNumber.apply(m.value.dout, [0, "", "\u2009"]) : 0 %>' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else { %> ' +
                                '<span class="gray">?</span>' +
                            '<% }%>' +
                        '</div>',
        
        tdWebmoney: 	'<div class="Webmoney"><% if (m.date !==  null) {%> <% if (icon) { %><img src="<%= icon%>"> <%}%> <% if (m.value.Danger) { %> <img src="chrome://rdstb/skin/images/ParamIcons/webmoney_danger.png"> <%}%> <span> <a class="FeedbacksGT" title="<%= AppLocale.table.title.webmoneyGT %>" href="http://advisor.wmtransfer.com/sitedetails.aspx?url=<%= url %>&sort=dt" target="_blank"><%= m.value.FeedbacksGT !== null ? \'+\' + m.value.FeedbacksGT : 0 %></a> <a class="FeedbacksLT" title="<%= AppLocale.table.title.webmoneyLT %>" href="http://advisor.wmtransfer.com/sitedetails.aspx?url=<%= url %>&sort=dt" target="_blank"><%= m.value.FeedbacksLT !== null ? \'-\' + m.value.FeedbacksLT : 0 %></a> </span> <% } else { %> <span class="gray">?</span> <% }%></div>',
        
        tdAge:          '<div class="Age"><% if (m.date !==  null) {%><span><% if (m.value !==  null) {%>  <%= rdz.utils.prettyDate(m.value, {withoutDays:true}) %>  <% } else {%> <%= AppLocale.table.params.unknown %> <% } %></span><% } else {%> <span class="gray">?</span><% }%></div>',
        tdpositions:  	'<div class="positions">' +
        					'<% if (m.date !==  null ) {%>' +
        						'<div class="yandex"> <% if (m.value.yandex !== 0) {%> <b class="red">Я:</b><% if (m.value.yandex !==  null) { %><a title="<%= AppLocale.table.title.positionsYandex %>" target="_blank" href="http://www.recipdonor.com/positions?url=<%= url %>"><%= rdz.utils.formatNumber.apply(m.value.yandex, [0, "", "\u2009"]) %></a>' +
        							'<% } else {%> <a class="unknown" target="_blank" href="http://www.recipdonor.com/positions?url=<%= url %>">?</a><% } } else {%><%= AppLocale.table.params.no %> <% }%> </div>' + ' ' +				
        						'<div class="google"> <% if (m.value.google !== 0) {%> <b class="blue">G:</b><% if (m.value.google !==  null) { %><a title="<%= AppLocale.table.title.positionsGoogle %>" target="_blank" href="http://www.recipdonor.com/positions?url=<%= url %>"><%= rdz.utils.formatNumber.apply(m.value.google, [0, "", "\u2009"]) %></a>' +
        							'<% } else {%> <a class="unknown" target="_blank" href="http://www.recipdonor.com/positions?url=<%= url %>">?</a><% } } else {%><%= AppLocale.table.params.no %> <% }%> </div>' +  
        					'<% } else { %> <span class="gray">?</span><% }%>' + 
                        '</div>',       
        tdDangerous:    '<div class="dangerous">' +
	                    '<% if (checking) {%> ' +
                                '<a class="dot" href="" target="_blank">...</a>' +
                            '<% } else if (m.value !==  null) {%>' +
                                '<% if (indexes.indexOf(1) !== -1) { %><a class="yandex" title="<%= AppLocale.table.title.dangerousYandex %>" target="_blank" href="http://yandex.ru/infected?url=http://<%= url %>"></a><% } %>' +
                                '<% if (indexes.indexOf(2) !== -1) { %><a class="google" title="<%= AppLocale.table.title.dangerousGoogle %>" target="_blank" href="https://www.google.com/safebrowsing/diagnostic?site=<%= url %>"></a><% } %>' +
                                '<% if (indexes.indexOf(4) !== -1) { %><a class="webmoneyadvisor" title="<%= AppLocale.table.title.dangerousWebmoneyAdvisor %>" target="_blank" href="http://advisor.wmtransfer.com/SiteDetails.aspx?url=<%= url %>"></a><% } %>' +
                                '<% if (indexes.indexOf(8) !== -1) { %><a class="virustotal" title="<%= AppLocale.table.title.dangerousVirustotal %>" target="_blank" href="https://www.virustotal.com/ru/url/submission/?force=1&url=http://<%= url %>"></a><% } %>' +
			        '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
			    '<% } else {%><span class="gray">?</span><% }%></div>',
        tdSocialNetworks: 	'<div class="SocialNetworks">' +
	                            '<% if (checking) {%> ' +
                                        '<a class="dot" href="" target="_blank">...</a>' +
                                    '<%} else if (m.date !==  null) {%>' +
				        '<span class="GoogleOne"><img src="<%= path %>google_one.png"> <span><%= m.value.GoogleOne.value !== null ? rdz.utils.formatNumber.apply(m.value.GoogleOne.value, [0, "", "\u2009"]) : 0 %></span></span>' +
				        '<span class="FacebookLike"><img src="<%= path %>facebook_like.png"> <span><%= m.value.FacebookLike.value !== null ? rdz.utils.formatNumber.apply(m.value.FacebookLike.value, [0, "", "\u2009"]) : 0 %></span> </span>' +
				        '<span class="TwitterLike"><img src="<%= path %>twitter_like.png"> <span><%= m.value.TwitterLike.value !== null ? rdz.utils.formatNumber.apply(m.value.TwitterLike.value, [0, "", "\u2009"]) : 0 %></span> </span>' +
				        '<span class="VkLike"><img src="<%= path %>vk_like.png"> <span><% if (m.value.VkLike.value.FromFrame) {%><b><%}%> <%= m.value.VkLike.value.Value !== null ? rdz.utils.formatNumber.apply(m.value.VkLike.value.Value, [0, "", "\u2009"]) : 0 %><% if (m.value.FromFrame) {%></b><%}%> </span> </span>' +
        			        '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
				    '<% } else {%><span class="gray">?</span><% }%></div>',
        
        tdCounters: '<div class="Counters">' +
	                '<% if (checking) {%> ' +
                            '<a class="dot" href="" target="_blank">...</a> ' +
                        '<%} else if (m.date !==  null) {%>' +
        		    '<% if (hasCounters) {%>' +
        			'<div class="hasCounters"> <div><span ><%= max > 0 ? max === 1 ? " " : rdz.utils.formatNumber.apply(max, [0, "", "\u2009"]) : max === -1 ?  AppLocale.table.params.glued : AppLocale.table.params.no %></span> ' +
        			    '<% _.each(data, function(e) { %>' +
                            		'<a target="_blank" href="https://www.google.com.ua/search?hl=ru&source=hp&q=<%= e.name %>&btnI=%D0%9C%D0%BD%D0%B5+%D0%BF%D0%BE%D0%B2%D0%B5%D0%B7%D1%91%D1%82!&aq=f&aqi=g8g-s1g1&aql=&oq=&gs_rfai=">' +
					    '<img src="<%= path + e.name %>.png" title="<%= e.value ? (e.value + " " + e.name) : e.name %>">' +
					'</a> ' +
                            	    '<% }) %>' + 				
        			'</div> </div>' +                                
        		    '<%} else {%> <%= AppLocale.table.params.no %> <%}%>' +
			    '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
        		'<% } else {%> <span class="gray">?</span><% }%></div>',
        
        tdSeo:          '<div class="seo">' +
			    '<% if (checking) {%> ' +
                                '<a class="dot" href="http://<%= url %>" target="_blank">...</a> ' +
                            '<%} else if (m.date !==  null) {%>' +
				'<% _.each(markets, function(e) { %>' +
				    '<a class="<%= e %>" target="_blank" href="https://www.google.com.ua/search?hl=ru&source=hp&q=<%= e %>&btnI=Мне+повезет!&aq=f&aqi=g8g-s1g1&aql=&oq=&gs_rfai=" title="<%= e %>"></a>' +
				'<% }) %>' +
				'<sup style="position: relative; bottom: 0px;"><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
			    '<% } else {%> <span class="gray">?</span><% }%>' +
			'</div>',                      
        tdlinkspurch: 	'<div class="linkspurch">' +
                            '<% if (checking) {%> ' +
                                '<a class="unknown" href="http://www.linkpad.ru/default.aspx?ref=rdsbar&to=<%= url %>" target="_blank">...</a>' +
                            '<%} else if (m.date !==  null) {%>' +
                                '<% if (m.value !== null && m.value >= 3) { %>' +
                                    '<a title="<%= AppLocale.table.params.linkspurch %> <%= m.value %>  шт." href="http://www.linkpad.ru/default.aspx?ref=rdsbar&to=<%= url %>" target="_blank"> <%= AppLocale.table.params.yes %></a> ' +
                                '<%} %>' +
				'<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<%} else { %>' +
                                '<a class="unknown" href="http://www.linkpad.ru/default.aspx?ref=rdsbar&to=<%= url %>" target="_blank">?</a>' +
                            '<% } %>' +
                        '</div>',
        tdRSS: 			'<div class="RSS"><% if (m.date !==  null) {%><span title="<%= AppLocale.table.title.rss %>"><%= m.value !== null ? AppLocale.table.params.yes : AppLocale.table.params.no %></span><% } else {%> <span class="gray">?</span><% }%></div>',  
        tdRobots: 		'<div class="Robots"><% if (m.date !==  null) {%><a title="<%= m.value.Tip %>" href="http://<%= url %>/robots.txt" target="_blank"><%= (m.value.Value !== 0 && m.value.Value !== null )  ? AppLocale.table.params.yes : AppLocale.table.params.no %></a><% } else {%> <a class="unknown" href="http://<%= url %>/robots.txt" target="_blank">?</a><% }%></div>',  
        tdSitemap: 		'<div class="Sitemap"><% if (m.date !==  null) {%><a title="<%= m.value.Tip %>" href="http://<%= url %>/sitemap.xml" target="_blank"><%= (m.value.Value !== 0 && m.value.Value !== null )  ? AppLocale.table.params.yes : AppLocale.table.params.no %></a><% } else {%> <a class="unknown" href="http://<%= url %>/sitemap.xml" target="_blank">?</a><% }%></div>',  

        tdUri:          '<div class="www gray"><%= www ? \"www.\" : AppLocale.table.params.no %></div><div class="Uri"><a href="http://<%= www ? \"www.\" : AppLocale.table.params.no %><%= url %>" target="_blank" class="<%= mrkt.value && mrkt.value.length > 0 ? \"bg-blue\" : \"\" %>"><%= url %></a><ins></ins></div>',
        tdIYP:          '<div class="IYP">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://yandex.ru/yandsearch?&text=url%3Awww.<%= url %>%20|%20url%3A<%= url %>" target="_blank">...</a> ' +
                            '<%} else if (m.value !==  null) {%>' +
                                '<a href="http://yandex.ru/yandsearch?&text=url%3Awww.<%= url %>%20|%20url%3A<%= url %>" target="_blank">' +
                                    '<%= m.value === 0 ? AppLocale.table.params.no : AppLocale.table.params.yes%>' +
                                '</a>' +
				'<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<span class="gray">?</span>' +
                            '<% }%>' +
                        '</div>',
        tdIYDP:         '<div class="IYDP">' +
                        '<% if (checking) {%> ' +
                            '<a class="dot" href="http://yandex.ru//yandsearch?how=tm&text=url:www.<%= url %> | url:<%= url %>" target="_blank">...</a> ' +
                        '<%} else if (m.date !==  null) {%>' +
                            '<a href="http://yandex.ru//yandsearch?how=tm&text=url:www.<%= url %> | url:<%= url %>" target="_blank">' +
                            '<%= (m.value !==  null && m.value !==  0) ? rdz.utils.prettyDate(m.value) : AppLocale.table.params.unknown %>' +
                            '</a>' +
                            '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                        '<% } else {%> ' +
                            '<a class="unknown" href="http://yandex.ru//yandsearch?how=tm&text=url:www.<%= url %> | url:<%= url %>" target="_blank">?</a>' +
                        '<% }%>' +
                        '</div>',
        tdIGP: 		 	'<div class="IGP">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://webcache.googleusercontent.com/search?hl=en&q=cache:<%= url %>" target="_blank">...</a> ' +
                            '<%} else if (m.date !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.igp %>" href="http://webcache.googleusercontent.com/search?hl=en&q=cache:<%= url %>" target="_blank">' +
                                    '<%= (m.value !== 0 && m.value !== null ) ? (m.value !==1 ? rdz.utils.prettyDate(m.value) : AppLocale.table.params.yes) : AppLocale.table.params.no %>' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://webcache.googleusercontent.com/search?hl=en&q=cache:<%= url %>" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdPRpage: 	'<div class="PRpage">' +
                            '<% if (checking) {%> ' +
                                '<a class="dot" href="http://toolbarqueries.google.com/tbr?features=Rank&sourceid=navclient-ff&client=navclient-auto-ff&ch=<%= checksum %>&q=info:<%= url %>" target="_blank">...</a> ' +
                            '<%} else if (m.date !==  null && m.value.Value !== null) {%>' +
                                '<% if (m.value.PRg !== 1) { %>' +
                                    '<a title="<%= AppLocale.table.title.prpage %>" href="http://toolbarqueries.google.com/tbr?features=Rank&sourceid=navclient-ff&client=navclient-auto-ff&ch=<%= checksum %>&q=info:<%= url %>" target="_blank" class="<%= m.value.DMOZ ? \'bold\' : null %>" >' +
                                        '<%= m.value.Value %>' +
                                    '</a>' +
                                '<% } else { %>'+
                                    '<a title="<%= AppLocale.table.params.boundedWith %><%= m.value.PRgTooltip %>" href="https://www.google.com/search?hl=ru&q=info%3A<%= url %>" target="_blank" class="<%= m.value.DMOZ ? \'bold\' : null %>" >' +
                                        '<%= AppLocale.table.params.glued %>' +
                                    '</a>'+
                                '<%}%>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://toolbarqueries.google.com/tbr?features=Rank&sourceid=navclient-ff&client=navclient-auto-ff&ch=<%= checksum %>&q=info:<%= url %>" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdMozRank: 		'<div class="MozRank">' +
                            '<% if (m.date !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.MozRank %>" href="http://www.opensiteexplorer.org/links?site=<%= url %>" target="_blank">' +
                                    '<%= (m.value !== 0 && m.value !== null ) ? m.value : AppLocale.table.params.no %>' +
                                '</a>' +
                                '<sup><%= date && m.value !== 0 && m.value !== null ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://www.opensiteexplorer.org/links?site=<%= url %>" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
        tdseomozP: 		'<div class="seomozP">' +
                        '<% if (m.date !==  null) {%>' +
                                '<a title="<%= AppLocale.table.title.seomozP %>" href="http://www.opensiteexplorer.org/links?site=<%= url %>" target="_blank">' +
                                    '<%= (m.value !== 0 && m.value !== null ) ? m.value : AppLocale.table.params.no %>' +
                                '</a>' +
                                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
                            '<% } else {%> ' +
                                '<a class="unknown" href="http://www.opensiteexplorer.org/links?site=<%= url %>" target="_blank">?</a>' +
                            '<% }%>' +
                        '</div>',
	tdRecipientPage: '<div class="RecipientPage">' +
	                    '<% if (checking) {%> ' +
                                '<a class="dot" href="<%= url %>" target="_blank">...</a> ' +
                            '<%} else if (m.date !==  null) {%><span title="<%= AppLocale.table.title.RecipientPage %>"><% if (m.value !== null ) { %><%= m.value %> <% } %></span>' +
			    '<%} else {%> <span class="gray">?</span><% }%></div>', 
	tdLinkPresence: '<div class="LinkPresence">' +
	                    '<% if (checking) {%> ' +
                                '<a class="dot" href="<%= url %>" target="_blank">...</a> ' +
                            '<%} else if (m.date !==  null) {%><span title="<%= AppLocale.table.title.LinkPresence %>"><%= (m.value !== 0 && m.value !== null) ? AppLocale.table.params.yes : AppLocale.table.params.not %>' +
			        '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup></span>' +
			    '<% } else {%> <span class="gray">?</span><% }%></div>', 
	tdAnchor: 	'<div class="Anchor">' +
	                    '<% if (checking) {%> ' +
                                '<a class="dot" href="<%= url %>" target="_blank">...</a> ' +
                            '<%} else if (m.date !==  null) {%><span title="<%= AppLocale.table.title.Anchor %>"><% if (m.value !== null ) { %><%= m.value %> <% } %></span>' +
			    '<% } else {%> <span class="gray">?</span><% }%></div>', 
	tdCMSpage:      '<div class="CMS">' +
	                    '<% if (checking) {%> ' +
                                '<a class="dot" href="" target="_blank">...</a> ' +
                            '<%} else if (m.date !== null) {%>' +
        			'<% if (data !==  null) { %>' +     								
        			    '<% _.each(data, function(engineType, key) { %>' +
        				'<% if (engineType.length > 0) { %>' +
					    '<%= AppLocale.table.params.CMS[key] %>' + ': ' +
        					'<% _.each(engineType, function(engine) { %>' +
                            			    '<a target="_blank" href="https://www.google.com.ua/search?hl=ru&source=hp&q=<%= engine %>&btnI=%D0%9C%D0%BD%D0%B5+%D0%BF%D0%BE%D0%B2%D0%B5%D0%B7%D1%91%D1%82%21&aq=f&aqi=g8g-s1g1&aql=&oq=&gs_rfai=">' +
                            				'<img src="<%=path + engine %>.png" title="<%= engine %>">' +	
                            			    '</a> ' +
                            			'<% }) %>' +        										
        				'<% } %>' +
                            	    '<% }) %>' +    								
        		        '<% } else { %><%= AppLocale.table.params.no %><% } %>'+
				'<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
        		'<% } else { %><span class="gray">?</span><% }%></div>', 
	tdpageweight: 	'<div class="pageweight">' +
	                    '<% if (checking) {%> ' +
                                    '<a class="dot" href="<%= url %>" target="_blank">...</a> ' +
                            '<%} else if (m.date !==  null) {%>' +
			        '<span title="<%= AppLocale.table.title.pageweight %>"><% if (m.value !== null ) { %><%= m.value %> KB <% } %></span>' +
				'<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
			    '<% } else {%> <span class="gray">?</span><% }%></div>',
        tdpositionspage:  	'<div class="positions">' +
        					'<% if (m.date !==  null ) {%>' +
        						'<div class="yandex"> <% if (m.value.yandex !== 0) {%> <b class="red">Я:</b><% if (m.value.yandex !==  null) { %><a title="<%= AppLocale.table.title.positionspageYandex %>" target="_blank" href="http://www.recipdonor.com/positions?url=<%= url %>"><%= rdz.utils.formatNumber.apply(m.value.yandex, [0, "", "\u2009"]) %></a>' +
        							'<% } else {%> <a class="unknown" target="_blank" href="http://www.recipdonor.com/positions?url=<%= url %>">?</a><% } } else {%><%= AppLocale.table.params.no %> <% }%> </div>' + ' ' +				
        						'<div class="google"> <% if (m.value.google !== 0) {%> <b class="blue">G:</b><% if (m.value.google !==  null) { %><a title="<%= AppLocale.table.title.positionspageGoogle %>" target="_blank" href="http://www.recipdonor.com/positions?url=<%= url %>"><%= rdz.utils.formatNumber.apply(m.value.google, [0, "", "\u2009"]) %></a>' +
        							'<% } else {%> <a class="unknown" target="_blank" href="http://www.recipdonor.com/positions?url=<%= url %>">?</a><% } } else {%><%= AppLocale.table.params.no %> <% }%> </div>' +  
        					'<% } else { %> <span class="gray">?</span><% }%>' + 
                        '</div>',   
		tdLinksIn:  '<div class="LinksIn">' +
		                '<% if (checking) {%> ' +
                                    '<a class="dot" href="http://www.recipdonor.com/barcheckpage?url=<%= url %>" target="_blank">...</a> ' +
                                '<%} else if (m.date !== null) {%>' +
		                    '<a title="<%= AppLocale.table.title.linksIn %>" href="http://www.recipdonor.com/barcheckpage?url=<%= url %>" target="_blank"><%= m.value !== null ? rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) : AppLocale.table.params.no %></a>' +
		                    '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
				'<%} else {%> <a class="unknown" href="http://www.recipdonor.com/barcheckpage?url=<%= url %>" target="_blank">?</a><% }%></div>',
		tdLinksOut: '<div class="LinksOut">' +
		                '<% if (checking) {%> ' +
                                    '<a class="dot" href="http://www.recipdonor.com/barcheckpage?url=<%= url %>" target="_blank">...</a> ' +
                                '<%} else if (m.date !==  null) {%>' +
				    '<a title="<%= AppLocale.table.title.linksOut %>" href="http://www.recipdonor.com/barcheckpage?url=<%= url %>" target="_blank"><%= m.value !== null ? rdz.utils.formatNumber.apply(m.value, [0, "", "\u2009"]) : AppLocale.table.params.no %></a>' +
				    '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
				'<% } else {%> <a class="unknown" href="http://www.recipdonor.com/barcheckpage?url=<%= url %>" target="_blank">?</a><% }%></div>',
		tdpagetitle: '<div class="pagetitle">' +
		                '<% if (checking) {%> ' +
                                    '<a class="dot" href="<%= url %>" target="_blank">...</a> ' +
                                '<%} else if (m.date !==  null) {%>' +
				     '<span class="<%= isError ? \'red\' : \'\' %> " title="<%= data %>"><% if (data !== null ) { %><%= data.length > 80 ? (data.substr(0, 80) + "...") : data %> <% } %></span>' +				     
				'<%} else {%> <span class="gray">?</span><% }%></div>',
		tdcommercials: 	'<div class="commercials">' +
		                    '<% if (checking) {%> ' +
                                        '<a class="dot" href="" target="_blank">...</a> ' +
                                    '<%} else if (m.date !==  null) {%>' +
					'<% if (data !==  null) { %>' +
						'<% _.each(data, function(service) { %>' +
							'<a target="_blank" >' +
							    '<img src="<%= path + service %>.png" title="<%= AppLocale.table.params.CommercialsSevices[service] %>"/>' +	
							'</a> ' +
						'<% }) %>' +
						'<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
					'<% } %>' +				    
				    '<%} else {%> <span class="gray">?</span><% }%></div>',
		tdSocialNetworkspage: 	'<div class="SocialNetworks">' +
	                                    '<% if (checking) {%> ' +
                                                '<a class="dot" href="" target="_blank">...</a>' +
                                            '<%} else if (m.date !==  null) {%>' +
				                '<span class="GoogleOne"><img src="<%= path %>google_one.png"> <span><%= m.value.GoogleOne.value !== null ? rdz.utils.formatNumber.apply(m.value.GoogleOne.value, [0, "", "\u2009"]) : 0 %></span></span>' +
				                '<span class="FacebookLike"><img src="<%= path %>facebook_like.png"> <span><%= m.value.FacebookLike.value !== null ? rdz.utils.formatNumber.apply(m.value.FacebookLike.value, [0, "", "\u2009"]) : 0 %></span> </span>' +
				                '<span class="TwitterLike"><img src="<%= path %>twitter_like.png"> <span><%= m.value.TwitterLike.value !== null ? rdz.utils.formatNumber.apply(m.value.TwitterLike.value, [0, "", "\u2009"]) : 0 %></span> </span>' +
				                '<span class="VkLike"><img src="<%= path %>vk_like.png"> <span><% if (m.value.VkLike.value.FromFrame) {%><b><%}%> <%= m.value.VkLike.value.Value !== null ? rdz.utils.formatNumber.apply(m.value.VkLike.value.Value, [0, "", "\u2009"]) : 0 %><% if (m.value.FromFrame) {%></b><%}%> </span> </span>' +
        			                '<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
					    '<% } else {%><span class="gray">?</span><% }%></div>',
		
		//tdValid: 	 	'<div class="Valid"><% if (m.date !==  null) {%><% if (m.value.Value !== null && m.value.Value !== 0) {%><a title="<%= AppLocale.table.title.valid %>" href="http://validator.w3.org/check?uri=<%= url %>&charset=%28detect+automatically%29&doctype=Inline&group=0" target="_blank"><img src="<%= path %>W3on.png"></a><% } else { %> <a title="<%= AppLocale.table.title.valid %>" href="http://validator.w3.org/check?uri=<%= url %>&charset=%28detect+automatically%29&doctype=Inline&group=0" target="_blank"><img src="<%= path %>W3off.png"></a> <% } %><% } else {%> <a href="http://validator.w3.org/check?uri=<%= url %>&charset=%28detect+automatically%29&doctype=Inline&group=0" target="_blank"><img src="<%= path %>W3u.png"></a><% }%></div>',
        tdValid: 	 	'<div class="Valid"><% if (m.date !==  null) {%><% if (m.value.Value !== null && m.value.Value !== 0) {%><a title="<%= AppLocale.table.title.valid %>" href="https://validator.w3.org/nu/?doc=<%= url %>" target="_blank"><img src="<%= path %>W3on.png"></a><% } else { %> <a title="<%= AppLocale.table.title.valid %>" href="https://validator.w3.org/nu/?doc=<%= url %>" target="_blank"><img src="<%= path %>W3off.png"></a> <% } %><% } else {%> <a href="https://validator.w3.org/nu/?doc=<%= url %>" target="_blank"><img src="<%= path %>W3u.png"></a><% }%></div>',
		tdNesting: 	 	'<div class="Nesting"><% if (m.date !==  null) {%><% if (m.value !== null) {%><a title="<%= AppLocale.table.title.nesting %>" href="http://www.recipdonor.com/CheckPage?url=<%= url %>" target="_blank"><img src="chrome://rdstb/skin/images/NestingLevel/ru_nest<%= m.value %>.gif"></a><% } %><% } else {%> <a href="http://www.recipdonor.com/CheckPage?url=<%= url %>" target="_blank"><img src="chrome://rdstb/skin/images/NestingLevel/ru_unknest.gif"></a><% }%></div>',
		tdUniqueContentPage: 	'<div class="UniqueContentPage">' +
		                            '<% if (checking) {%> ' +
                                                '<a class="dot" href="<%= url %>" target="_blank">...</a> ' +
                                            '<%} else if (m.date !== null && m.value) {%>' +
		                                '<div class="htooltip"><%= Math.round(m.value.Percent) %>% ' +
						'<sup><%= date ? rdz.utils.prettyDate(date,{time_or_date:true}) : null %></sup>' +
						' <div class="htooltip-content">' +
					            '<% if (m.value.Matches.length > 0) { %>' +
						        '<% _.each(m.value.Matches, function(e) { %>' +
						            '<div class="htooltip-item">' +
							        '<div class="htooltip-percent"><%= Math.round(e.percent) %>%</div>' +
							         '<div class="htooltip-url"> <a href="<%= e.url %>" target="_blank" ><%= e.url %></a> </div>' +
							    '</div>' +
						        '<% }) %>' +
					            '<% } else { %> Страница уникальна <% } %>' +
					        '</div> </div>' +
					    '<% } else {%> <span class="gray">?</span><% }%></div>',

        paging: { stat:      '<div class="stats"><%= AppLocale.table.paging.result_counts %><strong><%= rdz.utils.formatNumber.apply(total, [0, "", "\u2009"]) %></strong></div>',
                  pages:     '<% var l = pages.length %>' +
                             '<a class="prev" href="#<%= path %>/<%= page - 1%><%= sortpath %>" <%= l-1 < 1 || page == 1 ? \'style="display:none;"\' : \'\' %> > <%= AppLocale.table.paging.prev %></a>' +
                             '<div class="cnt">' +
                                '<a href="#<%= path %>/<%= 1 %><%= sortpath %>" <%= page < 9 || l <= 15 ? \'style="display:none;"\' : \'style="display:inline-block;"\' %> >1</a>' +
                                '<a href="#<%= path %>/<%= Math.round((l - page >  7 ? page - 8 : l-16)/2) %><%= sortpath %>" <%= page < 9 || l <= 15 ? \'style="display:none;"\' : \'style="display:inline-block;"\' %> > ...</a>' +
                                '<% _.each(pages, function(p, i) { if (i > (page > 8 ? (l - page >  7 ? page - 9 : l-16) : -1) && i < (l - page >  7 ?  (page > 8 ? page + 7 : 15) : l)) { %><a href="#<%= path %>/<%= p %><%= sortpath %>" <%= p == page ? \'class="act"\' : \'\' %> ><%= p %></a><% }}); %>' +
                                '<a href="#<%= path %>/<%= Math.round((page > 8 ? page + 7 + (l - (page + 7))/2 : ((l-15)/2)+15)) %><%= sortpath %>" <%= l - page < 8 || l <= 15 ? \'style="display:none;"\' : \'style="display:inline-block;"\' %> > ...</a>' +
                                '<a href="#<%= path %>/<%= l %><%= sortpath %>" <%= l - page < 8 || l <= 15 ? \'style="display:none;"\' : \'style="display:inline-block;"\' %> ><%= l %></a>' +
                             '</div>' +
                             '<a class="next" href="#<%= path %>/<%= page + 1%><%= sortpath %>" <%= pages.length < 2 || page == pages.length ? \'style="display:none;"\' : \'\' %> ><%= AppLocale.table.paging.next %></a>',
                  per_page:  '<label class="count"><strong><%= AppLocale.table.paging.result_counts_short %></strong><select><option value="50">50</option><option value="100">100</option><option value="300">300</option><option value="500">500</option><option value="1000000"><%= AppLocale.paging.all %></option></select></label>', //<option value="2000">2000</option><option value="5000">5000</option>
                  export:    '<div class="export"><%=AppLocale.paging.export %></div>',
                  delete:    '<div class="delete"><%=AppLocale.paging.delete %></div>'
        },
//        xml: {
//
//                cell:             '<cell></cell>',
//                cellNum:          '<Num><%= n %></Num>',
//                cellIP:     	  '<IP><% if (m.date !==  null) {%><%= m.value.IP !== null  ? m.value.IP : AppLocale.table.params.no %>(<%= m.value.SitesCount !== null  ? m.value.SitesCount : AppLocale.table.params.no %>,<%= m.value.SitesCountSolomono !== null  ? m.value.SitesCountSolomono : AppLocale.table.params.no %>, <%= m.value.SitesCountRDS !== null  ? m.value.SitesCountRDS : AppLocale.table.params.no %>)<% } else {%> ? <% }%></IP>',
//                cellGeo:     	  '<Geo><% if (m.date !==  null) {%><%= m.value.Country !== null  ? m.value.Country : AppLocale.table.params.no %> <% if (m.value.City !== null) { %>/<%= m.value.City %><% } %> <% } else {%> ? <% }%></Geo>',
//                cellHost:     	  '<Host><% if (m.date !==  null) {%><%= m.value.Host !== null  ? m.value.Host : AppLocale.table.params.no %><% } else {%> ? <% }%></Host>',
//                cellProvider:     '<Provider><% if (m.date !==  null) {%><%= m.value.Provider !== null  ? m.value.Provider : AppLocale.table.params.no %><% } else {%> ? <% }%></Provider>',
//                cellUrl:          '<Url><%= url %></Url>',                
//                //cellTYC:          '<TYC><% if (m.value.TYC !==  null) {%><% if (m.value.UIMirrorsCount !==  null && m.value.UIMirrorsCount >  0) {%>(<%= m.value.UIMirrorsCount %>)<% }%> <%= m.value.TYC !== -1 ? m.value.TYC : AppLocale.table.params.glued %><% } else {%> ? <% }%></TYC>',
//                
//                cellTYC:          '<TYC><% if (m.value.TYC !==  null) {%> <%= m.value.TYC !== -1 ? m.value.TYC : AppLocale.table.params.glued %><% } else {%> ? <% }%></TYC>',
//
//		cellTYCMirrors:   '<TYC_Mirrors><% if (m.value.TYC !==  null && m.value.UIMirrorsCount !==  null) {%> <%= m.value.UIMirrorsCount > 0 ? m.value.UIMirrorsCount : \"\" %> <% } else {%> ? <% }%></TYC_Mirrors>',
//
//		cellTYCBar:       '<TYC_Bar><% if (m.value.TYCBar !==  null) {%> <%= m.value.TYCBar !== -1 ? m.value.TYCBar : AppLocale.table.params.glued %> <% } else {%> ? <% }%></TYC_Bar>',
//                cellTYCCategory:  '<TYC_Catalog><% if (m.date !==  null) {%><% if (m.value !==  null) {%> <%= m.value %> <% }%><% } else {%> ? <% }%></TYC_Catalog>',
//                cellTYCTopics:    '<TYC_Themes><% if (m.date !==  null) {%><% if (m.value !==  null) {%> <%= m.value %>  <% }%><% } else {%> ? <% }%></TYC_Themes>',
//                cellTYCRegion:    '<TYC_Region><% if (m.date !==  null) {%><% if (m.value !==  null) {%>  <%= m.value %>  <% }%><% } else {%> ? <% }%></TYC_Region>',                
//                cellPR:    		  '<PR><% if (m.date !==  null) {%><% if (m.value.Value !==  null) {%>  <%= m.value.Value %>  <% }%><% } else {%> ? <% }%></PR>',                
//                cellIY:           '<Index_Yandex><% if (m.value !==  null) {%><%= m.value %><% } else {%> ?<% }%></Index_Yandex>',
//                cellIYD:          '<Index_Yandex_Date><% if (m.date !==  null) {%><% if (m.value !==  null) {%>  <%= rdz.utils.prettyDate(m.value) %>  <% } else {%>  <%=AppLocale.table.params.unknown %> <% }%><% } else {%> ? <% }%></Index_Yandex_Date>',
//                cellIG:           '<Index_Google><% if (m.value !==  null) {%><%= m.value %><% } else {%> ? <% }%></Index_Google>',              
//                cellSubdomains:   '<Subdomains><% if (m.date !==  null) {%><% if (m.value !==  null) {%> <%= m.value %>  <% }%><% } else {%> ? <% }%></Subdomains>',
//                cellWA:           '<WA><% if (m.value !==  null) {%><%= m.value === 0 ? AppLocale.table.params.no : rdz.utils.prettyDate(m.value, {withoutDays:true, year:true})  %><% } else {%> ? <% }%></WA>',
//                cellseomoz:       '<seomoz><% if (m.date !==  null) {%><%= (m.value !== 0 && m.value !== null ) ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></seomoz>',                
//                cellLG:           '<LG><% if (m.value !==  null) {%><%= m.value %><% } else {%> ? <% }%></LG>',
//                cellBackBing:     '<BackBing><% if (m.value !==  null) {%><%= m.value %><% } else {%> ? <% }%></BackBing>',
//                cellibing:        '<ibing><% if (m.value !==  null) {%><%= m.value %><% } else {%> ? <% }%></ibing>',
//                cellBing:         '<Bing><% if (m.value !==  null) {%><%= m.value %><% } else {%> ? <% }%></Bing>',  
//                cellIndexAol:     '<IndexAol><% if (m.date !==  null) {%><%= m.value !== -1 ? (m.value !== null ? m.value : AppLocale.table.params.no) : AppLocale.table.params.glued %><% } else {%> ? <% }%></IndexAol>',
//                cellAlexa:        '<Alexa><% if (m.date !==  null) {%><%= m.value.Value !== -1 ? (m.value.Value !== null ? m.value.Value : AppLocale.table.params.no) : AppLocale.table.params.glued %> <% if (m.value.Regional !== null) {%>(<%= m.value.Code %> <%= m.value.Regional%>)<%} } else {%> ? <% }%></Alexa>', 
//                cellBackAlexa:    '<BackAlexa><% if (m.date !==  null) {%><%= m.value !== -1 ? (m.value !== null ? m.value : AppLocale.table.params.no) : AppLocale.table.params.glued %><% } else {%> ? <% }%></BackAlexa>',                 
//                cellDMOZ:     	  '<DMOZ><% if (m.date !==  null) {%><%= (m.value.Value !== 0 && m.value.Value !== null) ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></DMOZ>', 
//                cellCMS:     	  '<CMS><% if (m.date !==  null) {%><% if (export_data !==  null) { %> <%= export_data %> <% } else { %><%= AppLocale.table.params.no %><% } %><% } else {%>?<% }%></CMS>', 
//                cellTechnorati:   '<Technorati><% if (m.date !==  null) {%><%= m.value !== 0 ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></Technorati>',                
//                /*cellfb:       	  '<fb><% if (m.date !==  null) {%> <%= m.value.Value !== null ? m.value.Value : AppLocale.table.params.no %><% } else {%> ? <% }%></fb>',   */             
//                cellMJ:     	  '<MJ><% if (m.date !==  null) {%><%= m.value !== -1 ? (m.value !== null ? m.value : AppLocale.table.params.no) : AppLocale.table.params.glued %><% } else {%> ? <% }%></MJ>',                 
//                cellAhrefs:       '<Ahrefs><% if (m.date !==  null) {%><%=  m.value.Value !== null ? m.value.Value : AppLocale.table.params.no %><% } else {%> ? <% }%></Ahrefs>', 
//                cellSemrush:  	  '<Semrush>' +
//                					'<% if (m.date !==  null) {%>' +
//                                    	'<%= (m.value.Value !== 0 && m.value.Value !== null ) ? m.value.Value : AppLocale.table.params.no %>' + ' ' +
//                                    	'<% if (m.value.Traffic !== 0 && m.value.Traffic !== null ) {%> / <%= m.value.Traffic %><% } %>' + ' ' +
//                                    	'<% if (m.value.Costs !== 0 && m.value.Costs !== null ) {%>($<%= m.value.Costs %>)<% } %></div>' +
//                                    '<% } else {%> ? <% }%>' +
//                                  '</Semrush>',
//                cellGoogleAdplanner: '<GoogleAdplanner><% if (m.date !==  null) {%><%= (m.value.Value !== 0 && m.value.Value !== null ) ? m.value.Value : AppLocale.table.params.no %><% } else {%> ? <% }%></GoogleAdplanner>', 
//                cellGoogleTrends: '<GoogleTrends><% if (m.date !==  null) {%><%= m.value.Value !== null ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></GoogleTrends>', 
//                cellCompete:      '<Compete><% if (m.date !==  null) {%><% if (m.value.Value !== null || m.value.LastMonth !== null || m.value.UV !== null ) { %> <%= (m.value.Value || m.value.LastMonth || AppLocale.table.params.no) %> <% if (m.value.UV) { %>(<%= m.value.UV %>) <% } } else { %> <%= AppLocale.table.params.no %> <% } %><% } else {%> ? <% }%></Compete>', 
//                cellQuantcast:    '<Quantcast><% if (m.date !==  null) {%><% if (m.value.Value !== null || m.value.Unique !== null) { %> <%= ((m.value.Value !== null && m.value.Value !== 0) ? m.value.Value : AppLocale.table.params.no) %> <% if (m.value.Unique) { %>(<%= m.value.Unique %>) <% } } else { %> <%= AppLocale.table.params.no %> <% } %><% } else {%> ? <% }%></Quantcast>',                
//                //cellNetchart:     '<Netchart><% if (m.date !==  null) {%><%= (m.value.Value !== 0 && m.value.Value !== null) ? m.value.Value : AppLocale.table.params.no %><% } else {%> ? <% }%></Netchart>',                
//                cellBY:           '<mention_in_yandex><% if (m.value !==  null) {%> <%= m.value %> <% } else {%> ? <% }%></mention_in_yandex>',
//                cellImgyan:       '<Images_Yandex><% if (m.value !==  null) {%> <%= m.value %><% } else {%> ? <% }%></Images_Yandex>',                
//                cellImgg:         '<Imgg><% if (m.value !==  null) {%> <%= m.value %><% } else {%> ? <% }%></Imgg>',  
//                cellAOLimg:       '<AOLimg><% if (m.value !==  null) {%> <%= m.value %><% } else {%> ? <% }%></AOLimg>',
//                cellpositions:    '<positions>' +
//                					'<% if (m.date !==  null) {%>' +
//                						'<% if (m.value.yandex !== 0) {%> <% if (m.value.yandex !==  null) {%> <%= "Я: " + m.value.yandex %><% } else {%> Я: ? <% } } else {%><%= AppLocale.table.params.no %> <% } %>' +
//                						'<% if (m.value.google !== 0) {%> <% if (m.value.google !==  null) {%> <%= "G: " + m.value.google %><% } else {%> G: ? <% } } else {%><%= AppLocale.table.params.no %> <% } %>' +
//                                  	'<% } else {%> ? <% }%>' +
//                                  '</positions>',                
//                cellAggregators:  '<Aggregators>' +
//                                    '<% if (m.value[0] === 1) { %>Я <% } else if (m.value[0] === 0) {%> <%= AppLocale.table.params.no %><% } else {%> ? <% }%>' +
//                                    '<% if (m.value[1] === 1) { %>G <% } else if (m.value[1] === 0) {%> <%= AppLocale.table.params.no %><% } else {%> ? <% }%>' +
//                                    '<% if (m.value[2] === 1) { %>N <% } else if (m.value[2] === 0) {%> <%= AppLocale.table.params.no %><% } else {%> ? <% }%>' +
//                                  '</Aggregators>',                
//                cellISolomono:    '<ISolomono><% if (m.date !==  null) {%> <%= m.value.index !== null ? m.value.index : AppLocale.table.params.no %> <% } else {%> ? <% }%></ISolomono>', 
//                cellSolomono:     '<Solomono><% if (m.date !==  null) {%> <%= m.value.din !== null ? m.value.din : 0 %> / <%= m.value.dout !== null ? m.value.dout : 0 %> <% } else {%> ? <% }%></Solomono>',
//                
//                cellWebmoney:     '<Webmoney><% if (m.date !==  null) {%> <%= m.value.IDsCount !== null && m.value.IDsCount > 0 ? \'WMIDs:\' + m.value.IDsCount : AppLocale.table.params.no %>  <%= m.value.FeedbacksGT !== null ? \'+\' + m.value.FeedbacksGT : AppLocale.table.params.no %> <%= m.value.FeedbacksLT !== null ? \'-\' + m.value.FeedbacksLT : AppLocale.table.params.no %> <% } else {%> ? <% }%></Webmoney>',
//                                
//                cellAge:          '<Age><% if (m.date !==  null) {%><% if (m.value !==  null) {%>  <%= rdz.utils.prettyDate(m.value, {withoutDays:true}) %>  <% } else {%> <%= AppLocale.table.params.unknown %> <% } %><% } else {%> ? <% }%></Age>',
//                cellDangerous:    '<dangerous><% if (m.value !==  null) {%>' +
//                                    '<% if (indexes.indexOf(1) !== -1) { %>yandex<% } %>' +
//                                    '<% if (indexes.indexOf(2) !== -1) { %>, google<% } %>' +
//                                    '<% if (indexes.indexOf(4) !== -1) { %>, webmoneyadvisor<% } %>' +
//				    '<% if (indexes.indexOf(8) !== -1) { %>, virustotal<% } %>' +
//                                   '<% } else {%> ? <% }%></dangerous>',
//                cellSocialNetworks:   	  '<SocialNetworks><% if (m.date !==  null) {%>Google +1: <%= m.value.GoogleOne.value !== null ? m.value.GoogleOne.value : 0 %> Facebook Likes: <%= m.value.FacebookLike.value !== null ? m.value.FacebookLike.value : 0 %>  Twitter Likes: <%= m.value.TwitterLike.value !== null ? m.value.TwitterLike.value : 0 %> VK Likes: <%= m.value.VkLike.value.Value !== null ? m.value.VkLike.value.Value : 0 %>    <% } else {%> ? <% }%></SocialNetworks>',                  
//                cellCounters:     '<Counters><% if (m.date !==  null) {%><% if (hasCounters) {%> <%= max > 0 ? max : max === -1 ? AppLocale.table.params.glued : AppLocale.table.params.no %>  <% } %><% } else {%> ? <% }%></Counters>', 
//                cellSeo:           '<seo><% if (m.date !==  null) {%> <%= markets %> <% } else {%> ? <% }%></seo>',
//                celllinkspurch:   '<linkspurch><% if (m.date !==  null) {%><%= (m.value !== 0 && m.value !== null) ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></linkspurch>',
//                cellRSS:          '<RSS><% if (m.date !==  null) {%><%= m.value !== null ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></RSS>', 
//                cellRobots:       '<Robots><% if (m.date !==  null) {%><%= (m.value.Value !== 0 && m.value.Value !== null) ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></Robots>', 
//                cellSitemap:      '<Sitemap><% if (m.date !==  null) {%><%= (m.value.Value !== 0 && m.value.Value !== null) ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></Sitemap>', 
//                
//
//                cellUri:          '<Url><%= url %></Url>',
//                cellIYP:          '<Index_Yandex_page><% if (m.value !==  null) {%><%= m.value === 0 ? AppLocale.table.params.no : AppLocale.table.params.yes %> <% } else {%> ? <% }%></Index_Yandex_page>',
//                cellIYDP:         '<Index_Yandex_page_date><% if (m.date !==  null) {%><% if (m.value !==  null) {%>  <%= rdz.utils.prettyDate(m.value) %>  <% } else {%>  <%=AppLocale.table.params.unknown %> <% }%> <% } else {%> ? <% }%></Index_Yandex_page_date>',
//                cellIGP:       	  '<Index_Google_page><% if (m.date !==  null) {%><%= (m.value !== 0 && m.value !== null ) ? (m.value !==1 ? rdz.utils.prettyDate(m.value) : AppLocale.table.params.yes) : AppLocale.table.params.no %><% } else {%> ? <% }%></Index_Google_page>',
//                cellPRpage:       '<PRpage><% if (m.date !==  null) {%><%= m.value.Value !== null ? m.value.Value : AppLocale.table.params.no %><% } else {%> ? <% }%></PRpage>',
//                cellMozRank:      '<MozRank><% if (m.date !==  null) {%><%= (m.value !== 0 && m.value !== null ) ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></MozRank>',
//                cellseomozP:      '<seomoz_page><% if (m.date !==  null) {%><%= (m.value !== 0 && m.value !== null ) ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></seomoz_page>',				
//		cellRecipientPage: '<RecipientPage><% if (m.date !==  null) {%><%= m.value !== null ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></RecipientPage>',
//		cellLinkPresence: '<LinkPresence><% if (m.date !==  null) {%><%= m.value ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></LinkPresence>',
//		cellAnchor: 	  '<Anchor><% if (m.date !==  null) {%><%= m.value !== null ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></Anchor>',
//		cellCMSpage:      '<CMSpage><% if (m.date !==  null) {%><% if (export_data !==  null) { %> <%= export_data %> <% } else { %><%= AppLocale.table.params.no %><% } %><% } else {%>?<% }%></CMSpage>',
//                cellpageweight:   '<pageweight><% if (m.date !==  null) {%><% if (m.value !== null ) { %><%= m.value %> КБ<% } %><% } else {%> ? <% }%></pageweight>',
//                cellpositionspage:    '<positionspage>' +
//                					'<% if (m.date !==  null) {%>' +
//                						'<% if (m.value.yandex !== 0) {%> <% if (m.value.yandex !==  null) {%> <%= "Я: " + m.value.yandex %><% } else {%> Я: ? <% } } else {%><%= AppLocale.table.params.no %> <% } %>' +
//                						'<% if (m.value.google !== 0) {%> <% if (m.value.google !==  null) {%> <%= "G: " + m.value.google %><% } else {%> G: ? <% } } else {%><%= AppLocale.table.params.no %> <% } %>' +
//                                  	'<% } else {%> ? <% }%>' +
//                                  '</positionspage>',   
//                cellLinksIn:       '<LinksIn><% if (m.date !==  null) {%><%= m.value !== null ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></LinksIn>',
//                cellLinksOut:      '<LinksOut><% if (m.date !==  null) {%><%= m.value !== null ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></LinksOut>',
//                cellpagetitle:     '<pagetitle><% if (m.date !==  null) {%><%= m.value !== null ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></pagetitle>',
//		cellcommercials:   '<commercials><% if (m.date !==  null) {%><%= m.value !== null ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></commercials>',
//		cellSocialNetworkspage:   	  '<SocialNetworkspage><% if (m.date !==  null) {%>Google +1: <%= m.value.GoogleOne.value !== null ? m.value.GoogleOne.value : 0 %> Facebook Likes: <%= m.value.FacebookLike.value !== null ? m.value.FacebookLike.value : 0 %>  Twitter Likes: <%= m.value.TwitterLike.value !== null ? m.value.TwitterLike.value : 0 %> VK Likes: <%= m.value.VkLike.value.Value !== null ? m.value.VkLike.value.Value : 0 %>    <% } else {%> ? <% }%></SocialNetworkspage>',       
//                cellValid:        '<Valid><% if (m.date !==  null) {%><%= (m.value.Value !== null && m.value.Value !== 0) ? AppLocale.table.params.validOn : AppLocale.table.params.validOff %><% } else {%> ? <% }%></Valid>',
//                cellNesting:   	  '<Nesting><% if (m.date !==  null) {%><%= m.value !== null ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></Nesting>',
//		cellUniqueContentPage:  '<UniqueContentPage><% if (m.date !== null && m.value) {%><%= percent %><% } else {%> ? <% }%></UniqueContentPage>',
//		cellUniqueContentPageDups:  '<UniqueContentPageDups><% if (m.date !== null && m.value) {%>' +
//					        '<% if (m.value.Matches.length > 0) { %>' +
//						    '<% _.each(m.value.Matches, function(e) { %>' +
//							    '<%= Math.round(e.percent) %>% <%= e.url %>\n' +
//						    '<% }) %>' +
//					        '<% } %>' +
//					    '<% } else {%> ? <% }%></UniqueContentPageDups>',
//		
//            }
             xml: {

                cell:             '<Cell><Data ss:Type="String"></Data></Cell>',
                cellNum:          '<Cell ss:StyleID="align-center"><Data ss:Type="Number"><%= n %></Data></Cell>',		
                cellIP:     	  '<IP><% if (m.date !==  null) {%><%= m.value.IP !== null  ? m.value.IP : AppLocale.table.params.no %>(<%= m.value.SitesCount !== null  ? m.value.SitesCount : AppLocale.table.params.no %>,<%= m.value.SitesCountSolomono !== null  ? m.value.SitesCountSolomono : AppLocale.table.params.no %>, <%= m.value.SitesCountRDS !== null  ? m.value.SitesCountRDS : AppLocale.table.params.no %>)<% } else {%> ? <% }%></IP>',
                cellGeo:     	  '<Geo><% if (m.date !==  null) {%><%= m.value.Country !== null  ? m.value.Country : AppLocale.table.params.no %> <% if (m.value.City !== null) { %>/<%= m.value.City %><% } %> <% } else {%> ? <% }%></Geo>',
                cellHost:     	  '<Host><% if (m.date !==  null) {%><%= m.value.Host !== null  ? m.value.Host : AppLocale.table.params.no %><% } else {%> ? <% }%></Host>',
                cellProvider:     '<Provider><% if (m.date !==  null) {%><%= m.value.Provider !== null  ? m.value.Provider : AppLocale.table.params.no %><% } else {%> ? <% }%></Provider>',                
		cellUrl:          '<Cell ss:StyleID="align-left"><Data ss:Type="String"><%= url %></Data></Cell>',              
                cellTYC:          '<Cell ss:StyleID="align-right"><% if (m.value.TYC !==  null) {%> <% if (m.value.TYC !== -1) { %> <% if (m.value.TYC !== rdz.errors.AGS) { %> <Data ss:Type="Number"><%= m.value.TYC %></Data> <% } else { %> <Data ss:Type="String"> <%= AppLocale.table.params.AGS %> </Data> <%} } else { %> <Data ss:Type="String"> <%= AppLocale.table.params.glued %> </Data> <%} } else {%> <Data ss:Type="String">?</Data><% }%></Cell>',
		cellTYCMirrors:   '<Cell ss:StyleID="align-right"><% if (m.value.TYC !==  null && m.value.UIMirrorsCount !==  null) {%> <% if (m.value.UIMirrorsCount > 0) { %><Data ss:Type="Number"><%= m.value.UIMirrorsCount %></Data> <%} else { %> <Data ss:Type="String"><%=AppLocale.table.params.no %></Data> %> <%} } else {%> <Data ss:Type="String">?</Data> <% }%></Cell>',
		cellTYCBar:       '<Cell ss:StyleID="align-right"><% if (m.value.TYCBar !==  null) {%> <% if (m.value.TYCBar !== -1) { %> <Data ss:Type="Number"><%= m.value.TYCBar %></Data> <% } else { %> <Data ss:Type="String"> <%= AppLocale.table.params.glued %> </Data> <%} } else {%> <Data ss:Type="String">?</Data><% }%></Cell>',
                cellTYCCategory:  '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.date !==  null) {%><% if (m.value !==  null) {%> <%= m.value %> <% }%><% } else {%> ? <% }%></Data></Cell>',
                cellTYCTopics:    '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.date !==  null) {%><% if (m.value !==  null) {%> <%= m.value %>  <% }%><% } else {%> ? <% }%></Data></Cell>',
                cellTYCRegion:    '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.date !==  null) {%><% if (m.value !==  null) {%>  <%= m.value %>  <% }%><% } else {%> ? <% }%></Data></Cell>',                
                cellPR:           '<Cell ss:StyleID="align-right"><% if (m.date !==  null) {%><% if (m.value.Value !==  null) {%>  <Data ss:Type="Number"><%= m.value.Value %></Data>  <% }%><% } else {%> <Data ss:Type="String">?</Data> <% }%></Cell>',
                cellIY:           '<Cell ss:StyleID="align-right"><% if (m.value !==  null) {%><Data ss:Type="Number"><%= m.value %></Data><% } else {%><Data ss:Type="String">?</Data><% }%></Cell>',
                cellIYD:          '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%><% if (m.value !==  null) {%>  <%= rdz.utils.prettyDate(m.value) %>  <% } else {%>  <%=AppLocale.table.params.unknown %> <% }%><% } else {%> ? <% }%></Data></Cell>',
                cellIG:           '<Cell ss:StyleID="align-right"><% if (m.value !==  null) {%><Data ss:Type="Number"><%= m.value %></Data><% } else {%><Data ss:Type="String">?</Data><% }%></Cell>',              
                cellSubdomains:   '<Subdomains><% if (m.date !==  null) {%><% if (m.value !==  null) {%> <%= m.value %>  <% }%><% } else {%> ? <% }%></Subdomains>',
                cellWA:           '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.value !==  null) {%><%= m.value === 0 ? AppLocale.table.params.no : rdz.utils.prettyDate(m.value, {withoutDays:true, year:true})  %><% } else {%> ? <% }%></Data></Cell>',
                cellseomoz:       '<Cell ss:StyleID="align-right"><% if (m.date !==  null) {%><% if (m.value !== 0 && m.value !== null ) { %> <Data ss:Type="Number"><%= m.value %></Data> <% } else { %><Data ss:Type="String"><%= AppLocale.table.params.no %></Data><%} } else { %> <Data ss:Type="String">?</Data> <% }%></Cell>',                
                cellLG:           '<Cell ss:StyleID="align-right"><% if (m.value !==  null) {%><Data ss:Type="Number"><%= m.value %></Data><% } else { %><Data ss:Type="String">?</Data><% }%></Cell>',
                cellBackBing:     '<Cell ss:StyleID="align-right"><% if (m.value !==  null) {%><Data ss:Type="Number"><%= m.value %></Data><% } else { %><Data ss:Type="String">?</Data><% }%></Cell>',
                cellibing:        '<Cell ss:StyleID="align-right"><% if (m.value !==  null) {%><Data ss:Type="Number"><%= m.value %></Data><% } else {%> <Data ss:Type="String">?</Data> <% }%></Cell>',
                cellBing:         '<Cell ss:StyleID="align-right"><% if (m.value !==  null) {%><Data ss:Type="Number"><%= m.value %></Data><% } else { %><Data ss:Type="String">?</Data><% }%></Cell>',  
                cellIndexAol:     '<IndexAol><% if (m.date !==  null) {%><%= m.value !== -1 ? (m.value !== null ? m.value : AppLocale.table.params.no) : AppLocale.table.params.glued %><% } else {%> ? <% }%></IndexAol>',
                cellAlexa:        '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%><%= (m.value.Value !== -1 && m.value.Value !== -666) ? (m.value.Value !== null ? m.value.Value : AppLocale.table.params.no) : AppLocale.table.params.glued %> <% if (m.value.Regional !== null) {%>(<%= m.value.Code %> <%= m.value.Regional%>)<%} } else {%> ? <% }%></Data></Cell>',
		cellBackAlexa:    '<Cell ss:StyleID="align-right"> <% if (m.date !==  null) {%> <% if (m.value !== -1) { %> <% if (m.value !== null) { %><Data ss:Type="Number"><%= m.value %></Data><% } else { %> <Data ss:Type="String"> <%= AppLocale.table.params.no %></Data> <% } } else { %> <Data ss:Type="String"> <%= AppLocale.table.params.glued %></Data> <%} } else {%> <Data ss:Type="String">?</Data> <% }%></Cell>',
		cellDMOZ:     	  '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%><%= (m.value.Value !== 0 && m.value.Value !== null) ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></Data></Cell>', 
                cellCMS:     	  '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.date !==  null) {%><% if (export_data !==  null) { %><%= export_data %><% } else { %><%= AppLocale.table.params.no %><% } %><% } else {%>?<% }%></Data></Cell>', 
                cellTechnorati:   '<Technorati><% if (m.date !==  null) {%><%= m.value !== 0 ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></Technorati>',                          
                cellMJ:     	  '<Cell ss:StyleID="align-right"><% if (m.date !==  null) { %><% if (m.value !== -1) { %> <% if (m.value !== null) {%><Data ss:Type="Number"><%= m.value %></Data><%} else { %><Data ss:Type="String"><%= AppLocale.table.params.no %></Data> <% } } else { %><Data ss:Type="String"><%= AppLocale.table.params.glued %></Data><% } } else { %><Data ss:Type="String">?</Data><% } %></Cell>',                 
                cellCF:     	  '<Cell ss:StyleID="align-right"><% if (m.date !==  null) { %><% if (m.value !== -1) { %> <% if (m.value !== null) {%><Data ss:Type="Number"><%= m.value %></Data><%} else { %><Data ss:Type="String"><%= AppLocale.table.params.no %></Data> <% } } else { %><Data ss:Type="String"><%= AppLocale.table.params.glued %></Data><% } } else { %><Data ss:Type="String">?</Data><% } %></Cell>',
		cellTF:     	  '<Cell ss:StyleID="align-right"><% if (m.date !==  null) { %><% if (m.value !== -1) { %> <% if (m.value !== null) {%><Data ss:Type="Number"><%= m.value %></Data><%} else { %><Data ss:Type="String"><%= AppLocale.table.params.no %></Data> <% } } else { %><Data ss:Type="String"><%= AppLocale.table.params.glued %></Data><% } } else { %><Data ss:Type="String">?</Data><% } %></Cell>',
		cellAhrefs:       '<Ahrefs><% if (m.date !==  null) {%><%=  m.value.Value !== null ? m.value.Value : AppLocale.table.params.no %><% } else {%> ? <% }%></Ahrefs>', 
                cellSemrush:  	  '<Cell ss:StyleID="align-right"><Data ss:Type="String">' +
                					'<% if (m.date !==  null) {%>' +
                                    	'<%= (m.value.Value !== 0 && m.value.Value !== null ) ? m.value.Value : AppLocale.table.params.no %>' + ' ' +
                                    	'<% if (m.value.Traffic !== 0 && m.value.Traffic !== null ) {%> / <%= m.value.Traffic %><% } %>' + ' ' +
                                    	'<% if (m.value.Costs !== 0 && m.value.Costs !== null ) {%>($<%= m.value.Costs %>)<% } %>' +
                                    '<% } else {%> ? <% }%>' +
                                  '</Data></Cell>',
                cellGoogleAdplanner: '<GoogleAdplanner><% if (m.date !==  null) {%><%= (m.value.Value !== 0 && m.value.Value !== null ) ? m.value.Value : AppLocale.table.params.no %><% } else {%> ? <% }%></GoogleAdplanner>', 
                cellGoogleTrends: '<GoogleTrends><% if (m.date !==  null) {%><%= m.value.Value !== null ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></GoogleTrends>', 
                cellCompete:      '<Compete><% if (m.date !==  null) {%><% if (m.value.Value !== null || m.value.LastMonth !== null || m.value.UV !== null ) { %> <%= (m.value.Value || m.value.LastMonth || AppLocale.table.params.no) %> <% if (m.value.UV) { %>(<%= m.value.UV %>) <% } } else { %> <%= AppLocale.table.params.no %> <% } %><% } else {%> ? <% }%></Compete>', 
                cellQuantcast:    '<Quantcast><% if (m.date !==  null) {%><% if (m.value.Value !== null || m.value.Unique !== null) { %> <%= ((m.value.Value !== null && m.value.Value !== 0) ? m.value.Value : AppLocale.table.params.no) %> <% if (m.value.Unique) { %>(<%= m.value.Unique %>) <% } } else { %> <%= AppLocale.table.params.no %> <% } %><% } else {%> ? <% }%></Quantcast>',                                
                cellBY:           '<Cell ss:StyleID="align-right"><% if (m.value !==  null) {%><Data ss:Type="Number"><%= m.value %></Data><% } else { %><Data ss:Type="String">?</Data><% }%></Cell>',
                cellImgyan:       '<Cell ss:StyleID="align-right"><% if (m.value !==  null) {%><Data ss:Type="Number"><%= m.value %></Data><% } else {%><Data ss:Type="String">?</Data><% }%></Cell>',                
                cellImgg:         '<Cell ss:StyleID="align-right"><% if (m.value !==  null) {%><Data ss:Type="Number"><%= m.value %></Data><% } else {%><Data ss:Type="String">?</Data><% }%></Cell>',  
                cellAOLimg:       '<AOLimg><% if (m.value !==  null) {%> <%= m.value %><% } else {%> ? <% }%></AOLimg>',
                cellpositions:    '<positions>' +
                					'<% if (m.date !==  null) {%>' +
                						'<% if (m.value.yandex !== 0) {%> <% if (m.value.yandex !==  null) {%> <%= "Я: " + m.value.yandex %><% } else {%> Я: ? <% } } else {%><%= AppLocale.table.params.no %> <% } %>' +
                						'<% if (m.value.google !== 0) {%> <% if (m.value.google !==  null) {%> <%= "G: " + m.value.google %><% } else {%> G: ? <% } } else {%><%= AppLocale.table.params.no %> <% } %>' +
                                  	'<% } else {%> ? <% }%>' +
                                  '</positions>',                
                cellAggregators:  '<Aggregators>' +
                                    '<% if (m.value[0] === 1) { %>Я <% } else if (m.value[0] === 0) {%> <%= AppLocale.table.params.no %><% } else {%> ? <% }%>' +
                                    '<% if (m.value[1] === 1) { %>G <% } else if (m.value[1] === 0) {%> <%= AppLocale.table.params.no %><% } else {%> ? <% }%>' +
                                    '<% if (m.value[2] === 1) { %>N <% } else if (m.value[2] === 0) {%> <%= AppLocale.table.params.no %><% } else {%> ? <% }%>' +
                                  '</Aggregators>',                
                cellISolomono:    '<Cell ss:StyleID="align-right"><% if (m.date !==  null) {%> <% if (m.value.index !== null) { %> <Data ss:Type="Number"><%= m.value.index %></Data> <% } else {%> <Data ss:Type="Number"><%= AppLocale.table.params.no %></Data> %>  <% } } else {%> <Data ss:Type="String">?</Data> <% }%></Cell>', 
                cellSolomono:     '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%> <%= m.value.din !== null ? m.value.din : 0 %> / <%= m.value.dout !== null ? m.value.dout : 0 %> <% } else {%> ? <% }%></Data></Cell>',
                
                cellWebmoney:     '<Webmoney><% if (m.date !==  null) {%> <%= m.value.IDsCount !== null && m.value.IDsCount > 0 ? \'WMIDs:\' + m.value.IDsCount : AppLocale.table.params.no %>  <%= m.value.FeedbacksGT !== null ? \'+\' + m.value.FeedbacksGT : AppLocale.table.params.no %> <%= m.value.FeedbacksLT !== null ? \'-\' + m.value.FeedbacksLT : AppLocale.table.params.no %> <% } else {%> ? <% }%></Webmoney>',
                                
                cellAge:          '<Age><% if (m.date !==  null) {%><% if (m.value !==  null) {%>  <%= rdz.utils.prettyDate(m.value, {withoutDays:true}) %>  <% } else {%> <%= AppLocale.table.params.unknown %> <% } %><% } else {%> ? <% }%></Age>',
                cellDangerous:    '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.value !==  null) {%><%= threats %><% } else {%> ? <% }%></Data></Cell>',
                cellSocialNetworks:   	  '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%>Google +1: <%= m.value.GoogleOne.value !== null ? m.value.GoogleOne.value : 0 %> Facebook Likes: <%= m.value.FacebookLike.value !== null ? m.value.FacebookLike.value : 0 %>  Twitter Likes: <%= m.value.TwitterLike.value !== null ? m.value.TwitterLike.value : 0 %> VK Likes: <%= m.value.VkLike.value.Value !== null ? m.value.VkLike.value.Value : 0 %><% } else {%>?<% }%></Data></Cell>',                  
                cellCounters:     '<Cell ss:StyleID="align-right"><% if (m.date !==  null) {%><% if (hasCounters) {%> <% if(max > 0) { %> <Data ss:Type="Number"><%= max %></Data> <%} else {%> <Data ss:Type="String"><%= max === -1 ? AppLocale.table.params.glued : AppLocale.table.params.no %></Data><%} }%><% } else {%><Data ss:Type="String">?</Data><% }%></Cell>', 
                cellSeo:          '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.date !==  null) {%> <%= markets %> <% } else {%> ? <% }%></Data></Cell>',
                celllinkspurch:   '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%><%= (m.value !== 0 && m.value !== null) ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></Data></Cell>',
                cellRSS:          '<RSS><% if (m.date !==  null) {%><%= m.value !== null ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></RSS>', 
                cellRobots:       '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%><%= (m.value.Value !== 0 && m.value.Value !== null) ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></Data></Cell>', 
                cellSitemap:      '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%><%= (m.value.Value !== 0 && m.value.Value !== null) ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></Data></Cell>', 
                

                cellUri:          '<Cell><Data ss:Type="String"><%= url %></Data></Cell>',
                cellIYP:          '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.value !==  null) {%><%= m.value === 0 ? AppLocale.table.params.not : AppLocale.table.params.yes %> <% } else {%> ? <% }%></Data></Cell>',
                cellIYDP:         '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%><% if (m.value !==  null) {%>  <%= rdz.utils.prettyDate(m.value) %>  <% } else {%>  <%=AppLocale.table.params.unknown %> <% }%> <% } else {%> ? <% }%></Data></Cell>',
                cellIGP:       	  '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%><%= (m.value !== 0 && m.value !== null ) ? (m.value !==1 ? rdz.utils.prettyDate(m.value) : AppLocale.table.params.yes) : AppLocale.table.params.not %><% } else {%> ? <% }%></Data></Cell>',
                cellMozRank:      '<Cell ss:StyleID="align-right"><% if (m.date !==  null) {%><% if (m.value !== 0 && m.value !== null ) { %><Data ss:Type="Number"><%= m.value %></Data><% } else { %><Data ss:Type="String"><%= AppLocale.table.params.no %></Data><%} } else { %><Data ss:Type="String">?</Data><% } %></Cell>',				
		cellRecipientPage: '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.date !==  null) {%><%= m.value !== null ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></Data></Cell>',
		cellLinkPresence: '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%><%= m.value ? AppLocale.table.params.yes : AppLocale.table.params.no %><% } else {%> ? <% }%></Data></Cell>',
		cellAnchor: 	  '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.date !==  null) {%><%= m.value !== null ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></Data></Cell>',
		cellCMSpage:      '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.date !==  null) {%><% if (export_data !==  null) { %><%= export_data %><% } else { %><%= AppLocale.table.params.no %><% } %><% } else {%>?<% }%></Data></Cell>',
                cellpageweight:   '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%><% if (m.value !== null ) { %><%= m.value %> КБ<% } %><% } else {%> ? <% }%></Data></Cell>',
                cellpositionspage:    '<positionspage>' +
                					'<% if (m.date !==  null) {%>' +
                						'<% if (m.value.yandex !== 0) {%> <% if (m.value.yandex !==  null) {%> <%= "Я: " + m.value.yandex %><% } else {%> Я: ? <% } } else {%><%= AppLocale.table.params.no %> <% } %>' +
                						'<% if (m.value.google !== 0) {%> <% if (m.value.google !==  null) {%> <%= "G: " + m.value.google %><% } else {%> G: ? <% } } else {%><%= AppLocale.table.params.no %> <% } %>' +
                                  	'<% } else {%> ? <% }%>' +
                                  '</positionspage>',   
                cellLinksIn:       '<Cell ss:StyleID="align-right"><% if (m.date !==  null) {%><% if (m.value !== null) { %> <Data ss:Type="Number"><%= m.value %></Data><% } else {%> <Data ss:Type="String"> <%= AppLocale.table.params.no %></Data><% } } else { %> <Data ss:Type="String">?</Data> <% } %></Cell>',
                cellLinksOut:      '<Cell ss:StyleID="align-right"><% if (m.date !==  null) {%><% if (m.value !== null) { %> <Data ss:Type="Number"><%= m.value %></Data><% } else {%> <Data ss:Type="String"> <%= AppLocale.table.params.no %></Data><% } } else { %> <Data ss:Type="String">?</Data> <% } %></Cell>',
                cellpagetitle:     '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.date !==  null) {%><%= data !== null ? data : AppLocale.table.params.no %><% } else {%> ? <% }%></Data></Cell>',
		cellcommercials:   '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.date !==  null) {%><%= data ? data : AppLocale.table.params.no %><% } else {%> ? <% }%></Data></Cell>',
		cellSocialNetworkspage:   	  '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%>Google +1: <%= m.value.GoogleOne.value !== null ? m.value.GoogleOne.value : 0 %> Facebook Likes: <%= m.value.FacebookLike.value !== null ? m.value.FacebookLike.value : 0 %>  Twitter Likes: <%= m.value.TwitterLike.value !== null ? m.value.TwitterLike.value : 0 %> VK Likes: <%= m.value.VkLike.value.Value !== null ? m.value.VkLike.value.Value : 0 %><% } else {%> ? <% }%></Data></Cell>',       
                cellValid:        '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !==  null) {%><%= (m.value.Value !== null && m.value.Value !== 0) ? AppLocale.table.params.validOn : AppLocale.table.params.validOff %><% } else {%> ? <% }%></Data></Cell>',
                cellNesting:   	  '<Nesting><% if (m.date !==  null) {%><%= m.value !== null ? m.value : AppLocale.table.params.no %><% } else {%> ? <% }%></Nesting>',
		cellUniqueContentPage:  '<Cell ss:StyleID="align-right"><Data ss:Type="String"><% if (m.date !== null && m.value) {%><%= percent %><% } else {%> ? <% }%></Data></Cell>',
		cellUniqueContentPageDups:  '<Cell ss:StyleID="align-left"><Data ss:Type="String"><% if (m.date !== null && m.value) {%>' +
					        '<% if (m.value.Matches.length > 0) { %>' +
						    '<% _.each(m.value.Matches, function(e) { %>' +
							    '<%= Math.round(e.percent) %>% <%= e.url %> &#10;' +
						    '<% }) %>' +
					        '<% } %>' +
					    '<% } else {%> ? <% }%></Data></Cell>',
		
            }
    },
    controls: {
        add_to_check :      '<div class="add_uri"><textarea rows="" cols="" class="list"></textarea></div>' +
                            '<div class="buttons"><div class="box"></div><div class="button add"><%= text %></div></div>',
        add_stat_row:       '<div><%= name %><span class="value"><%= value %></span></div>',
        otherview:          '<div class="cnt"><div class="ttl"><%= AppLocale.controls.view %></div><div class="mrk <%= flag ? \'\' : \'active\' %>" data-flag="0"><%= AppLocale.controls.simple %></div><div class="mrk <%= !flag ? \'\' : \'active\' %>" data-flag="1"><%= AppLocale.controls.with_date %></div></div>'
    },
    popup_bg: {
        container:          '<div class="window"><div class="cnt"></div><div class="close"></div></div><div class="bg"></div>',
        table_fields:       '<input type="checkbox" class="check" <%= arguments[0] ? \'checked="checked"\' : \'\' %>/><span></span>',
        delete:             '<div class="msg"><%= msg %></div>' +
                            '<button class="accept"><span><%= AppLocale.popups.accept %></span></button><button class="cancel"><span><%= AppLocale.popups.cancel %></span></button>',
        export_button:      '<div class="buttons"><button class="export"><span><%=AppLocale.paging.export %></span></button></div>',
        msg_1_button:       '<div class="msg"><%= msg %></div>' +
                            '<a <%= uri ? \'href="\'+ uri +\'"\' : \'\' %> target="_blank" class="accept"><span><%= button1 %></span></a>'
    },
    block_msg: {
        container:          '<div class="window"><div class="cnt"></div></div><div class="bg"></div>'
    },

    tooltip : {
        container:          '<div class="tooltip"><div class="cnt"></div><ins></ins></div>',
        check_buttons:      '<div class="tooltip">' +
                                '<div class="ttl"><%= check_mode ? AppLocale.start_check.update : AppLocale.start_check.check  %></div>' +
                                '<div class="list"><% _.each(list, function(l) { %> <span><%= l %></span> <% }) %> </div>' +
                                '<div class="price">' +
                                    '<div><span class="label"><%= AppLocale.start_check.selected %></span><%= selected %></div>' +
                                    '<div><span class="label"><%= AppLocale.start_check.sum %></span><%= sum %></div>' +
                                '</div>' +
                            '</div>',
	indicators:	    '<div class="tooltip">' +
				'<div class="ttl">Текущие проверки:</div>' +
				'<div class="list"><% _.each(list, function(l) { %> <span class="<%= (l.checked === l.total) ? \'gray\' : \'\' %>"><%= AppLocale.popup_bg.table_fields[l.name] %>: <%= l.checked %>(<%= l.total %>) | <%= l.time %></span> <% }) %> </div>' +
				'<div class="ttl">Итого: <span><%= total.checked %> (<%= total.total %>)</span></div> ' +
			    '</div>',
	recipient_panel:    '<div class="recipient_panel">' +
	                        '<div class="recipient_label"><%= AppLocale.popups.recipient %></div>' +
				'<input type="text" class="reciptextbox" ></input>' +
	                        '<button class="accept"><span><%= AppLocale.popups.send %></span></button>' +
	                    '</div>'
    },
    context_menu: {
        check_buttons:      '<div class="contextmenu">' +
                            '<div class="box">' +
                                '<div data-mode="0" class="type"><%= AppLocale.start_check.check %></div>'+
                                '<div data-mode="1" class="type"><%= AppLocale.start_check.update %></div>' +
                            '</div>'+
                            '</div>'
    },
    check_panel: {
        select:             '<div class="cnt"><div class="select <%= cls %>"><div class="button"><%= name %></div><div class="mode"></div></div></div>'
    }
};






