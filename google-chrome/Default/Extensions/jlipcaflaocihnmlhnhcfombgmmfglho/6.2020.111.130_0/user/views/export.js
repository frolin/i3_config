//window.TableExportXML = Backbone.View.extend({
//
//    tagName: "XML",
//
//    initialize: function () {
//
//        // rendering xml
//        var self = this;
//
//            LibRouter.get().each(function(e,i) {
//                var c = (e).get('Uri');
//                if ((c).checked)
//                {
//                    //show
//                    self.renderXML(e, i);
//
//                }
//            });
//    },
//
//    renderXML: function(row, num) {
//
//        var view = new TableXMLRow({model: row, num:num});
//            $(this.el).append(view.render().el);
//    },
//
//    saveFile: function() {
//        // Note: The file system has been prefixed as of Google Chrome 12:
//        window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
//
//        //default file name
//        var t = new Date();
//        var name = (DataPaging.get('PerPage').get('path')).substr(0,5) + t.getDate() + '_' + (t.getMonth()+1) + '_' + t.getFullYear() + '.' + t.getHours() + '_' + (t.getMinutes()+1) + '_' + (t.getSeconds()+1);
//        var ext = '.xls';
//
//
//        function onInitFs(fs) {
//
//            fs.root.getFile(name+ext, {create: true}, function (fileEntry) {
//
//                // Create a FileWriter object for our FileEntry (log.txt).
//                fileEntry.createWriter(function (fileWriter) {
//
//                    fileWriter.onwriteend = function (e) {
//
//                        fileEntry.file(function (file) {
//                            var reader = new FileReader();
//
//                            reader.onloadend = function (e) {
//
//                                var a = document.createElement('a');
//                                    a.href = window.URL.createObjectURL(file);
//                                    a.download = file.name; // set the file name
//                                    a.style.display = 'none';
//                                    document.body.appendChild(a);
//                                    a.click(); //simulatating a click on a download link
//                                    delete a; // we don't need this anymore
//
//                                AppPopup.close();
//
//                            };
//
//                            reader.readAsText(file);
//
//                        }, errorHandler);
//                    };
//
//                    fileWriter.onerror = function (e) {
//                        console.log('Write failed: ' + e.toString());
//                    };
//                    
//                    var xmlText = AppTableExportXML.el.outerHTML;
//                    // replace each parameter name with string from locale 
//                    for (var name in AppLocale.export) {
//                        if (AppLocale.export[name] === "") {
//                            continue;
//                        }
//                        xmlText = xmlText.replace(new RegExp("<" + name + ">",'ig'), "<" + AppLocale.export[name] + ">");
//                        xmlText = xmlText.replace(new RegExp("</" + name + ">",'ig'), "</" + AppLocale.export[name] + ">");
//                    }
//
//                    // Create a new Blob and write it to log.txt.
//                    var blob = new Blob(['<?xml version="1.0" encoding="UTF-8" ?>'+ xmlText], {type: "application/octet-binary"});
//
//                    fileWriter.write(blob);
//
//                }, errorHandler);
//
//            }, errorHandler);
//
//        }
//
//        function errorHandler() { console.log(arguments) }
//
//        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
//
//    }
//
//});
//
//window.TableXMLRow = Backbone.View.extend({
//    tagName: 'row',
//
//
//    render: function() {
//
//        var cell_num = new window['TableXMLCellNum']({model: this.options.num});
//            $(this.el).append(cell_num.render());
//
//        var row = this.model.toJSON();
//
//            for (var i in row)
//            {
//                //filter out hidden fields
//                var shown = false;
//                LibRouter.get({ends:'TableFields'}).each(function(e,n) {
//                    e.get('name') === i ?
//                        e.get('export') !== false ? shown = true : shown = false : '';
//
//                });
//                if (!shown) continue;
//
//                var view = new window['TableXMLCell' + i]({model: row[i], params: row});
//                    $(this.el).append(view.render());
//                
//                // change in the future!    
//                if (i === "TYC") {
//                    view = new window['TableXMLCellTYCMirrors']({model: row[i], params: row});
//                    $(this.el).append(view.render());
//                } else if (i === 'UniqueContentPage') {
//                    view = new window['TableXMLCellUniqueContentPageDups']({model: row[i], params: row});
//                    $(this.el).append(view.render());
//                }  
//            }
//
//        return this;
//    }
//});
//
//TableXMLCell = Backbone.View.extend({
//    tagName: 'div',
//    template: _.template(templates.user_table.xml.cell),
//
//    render: function() {
//        var u = this.options.params.Uri;
//        $(this.el).html(this.template({url: u.value, m: this.model}));
//
//        return this.el.childNodes[0];
//    }
//});
//
//TableXMLCellNum = TableXMLCell.extend({
//
//    template: _.template(templates.user_table.xml.cellNum),
//
//    render: function() {
//        $(this.el).html(this.template({n: this.model ? this.model+1 : 1}));
//        return this.el.childNodes[0];
//    }
//
//});

// the old export is in the versions that are earlier than 15.09.2014 

window.TableExportXML = Backbone.View.extend({

    tagName: "div",

    initialize: function () {
        var tableXML = this.renderTable(),
            totalXML;
        
        totalXML = '<?xml version="1.0" encoding="UTF-8" ?>' +
                       '<?mso-application progid="Excel.Sheet"?>' +
                       
                       '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
                       'xmlns:x="urn:schemas-microsoft-com:office:excel"' + 
                       '>' +
 
                       '<Styles>' +
                           '<Style ss:ID="header" >' +
                               '<Alignment ss:Horizontal="Center" ss:Vertical="Bottom"/>' +
                               '<Font ss:FontName="Calibri" x:CharSet="204" x:Family="Swiss" ss:Size="11" ' +
                               'ss:Color="#000000" ss:Bold="1"/>' +
                            '</Style>' +
                            '<Style ss:ID="align-right">' +
                               '<Alignment ss:Horizontal="Right" ss:Vertical="Bottom"/>' +
                            '</Style>' +
                            '<Style ss:ID="align-left">' +
                               '<Alignment ss:Horizontal="Left" ss:Vertical="Bottom"/>' +
                            '</Style>' +
                            '<Style ss:ID="align-center">' +
                               '<Alignment ss:Horizontal="Center" ss:Vertical="Bottom"/>' +
                            '</Style>' +
                        '</Styles>' +
                        '<Worksheet ss:Name="Sheet1">' +                                  
                            tableXML +
                        '</Worksheet>' +
                        '</Workbook>';                  
                             
        $(this.el).text(totalXML);
    },

    renderTable: function() {
        var that = this,
            tableXML = '<Table>',
            c,
            at_least_one_row = false;
        
        tableXML += that.renderHeader();
        
        LibRouter.get().each(function(e,i) {
            c = (e).get('Uri');
            if ((c).checked) {
                at_least_one_row = true;
                tableXML += that.renderRow(e, i);
            }
        });
        
        // if nothing is selected, select all
        if (!at_least_one_row) {
            LibRouter.get().each(function(e,i) {
                c = (e).get('Uri');
                tableXML += that.renderRow(e, i);
            });
        }
        
        
        tableXML += '</Table>';
        
        return tableXML;
    },
    
    renderHeader: function() {
        var text = '<Row ss:StyleID="header">',
            firstRow = LibRouter.get().models[0],
            cell_num,
            row,
            i,
            shown,
            view,
            lib = LibRouter.get({str:true});
            

        //cell_num = '<Cell><Data ss:Type="String">' + '№' + '</Data></Cell>';       
        //text += cell_num;

        row = firstRow.toJSON();

        for (i in row) {
            //filter out hidden fields
            shown = false;
            LibRouter.get({ends:'TableFields'}).each(function(e,n) {
                e.get('name') === i ?
                    e.get('export') !== false ? shown = true : shown = false : '';

            });
            
            if (!shown) continue;
            
            // added later
            if (/*i !== 'Uri' &&*/ window.rdz.TableFields.hidden.indexOf(i) === -1 &&
                
                (window.rdz.TableFields.hidden_in_mass_checks.indexOf(i) == -1 || ["Recipients", "SitesLibrary", "PagesLibrary"].indexOf(lib) !== -1 ) &&

                (AppLocale.locale === 'ru' || AppLocale.ru_params.indexOf(i) === -1)
                )
            {                     
                text +=  '<Cell><Data ss:Type="String">' + AppLocale.export[i] + '</Data></Cell>';
                
                // change in the future!    
                if (i === "TYC") {
                text +=  '<Cell><Data ss:Type="String">' + AppLocale.export['TYCMirrors'] + '</Data></Cell>';
                } else if (i === 'UniqueContentPage') {
                    text +=  '<Cell><Data ss:Type="String">' + AppLocale.export['UniqueContentPageDups'] + '</Data></Cell>';
                }
            }
        }
            
        text += '</Row>';
        
        return text;
    },
    
    renderRow: function(row, num) {
        var view = new TableXMLRow({model: row, num:num});
        return '<Row>' + view.render() + '</Row>';
    },
    
    

    saveFile: function() {
        // Note: The file system has been prefixed as of Google Chrome 12:
        window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

        //default file name
        var t = new Date();
        var name = (DataPaging.get('PerPage').get('path')).substr(0,5) + t.getDate() + '_' + (t.getMonth()+1) + '_' + t.getFullYear() + '.' + t.getHours() + '_' + (t.getMinutes()+1) + '_' + (t.getSeconds()+1);
        var ext = '.xls';


        function onInitFs(fs) {

            fs.root.getFile(name+ext, {create: true}, function (fileEntry) {

                // Create a FileWriter object for our FileEntry (log.txt).
                fileEntry.createWriter(function (fileWriter) {

                    fileWriter.onwriteend = function (e) {

                        fileEntry.file(function (file) {
                            var reader = new FileReader();

                            reader.onloadend = function (e) {

                                var a = document.createElement('a');
                                    a.href = window.URL.createObjectURL(file);
                                    a.download = file.name; // set the file name
                                    a.style.display = 'none';
                                    document.body.appendChild(a);
                                    a.click(); //simulatating a click on a download link
                                    delete a; // we don't need this anymore

                                AppPopup.close();

                            };

                            reader.readAsText(file);

                        }, errorHandler);
                    };

                    fileWriter.onerror = function (e) {
                        console.log('Write failed: ' + e.toString());
                    };
                    
                    
                    var xmlText = AppTableExportXML.$el.text();
                    //// replace each parameter name with string from locale 
                    //for (var name in AppLocale.export) {
                    //    if (AppLocale.export[name] === "") {
                    //        continue;
                    //    }
                    //    xmlText = xmlText.replace(new RegExp("<" + name + ">",'ig'), "<" + AppLocale.export[name] + ">");
                    //    xmlText = xmlText.replace(new RegExp("</" + name + ">",'ig'), "</" + AppLocale.export[name] + ">");
                    //}

                    // Create a new Blob and write it to log.txt.
                    var blob = new Blob([xmlText], {type: "application/octet-binary"});
                    
                    // console.log(xmlText);
                    fileWriter.write(blob);                    

                }, errorHandler);

            }, errorHandler);

        }

        function errorHandler() { console.log(arguments) }

        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);

    }

});

window.TableXMLRow = Backbone.View.extend({
    tagName: 'div',


    render: function() {
        var text = '',
            cell_num,
            row,
            i,
            shown,
            view,
            lib = LibRouter.get({str:true});
            

        //cell_num = new window['TableXMLCellNum']({model: this.options.num});       
        //text += cell_num.render();

        row = this.model.toJSON();

        for (i in row) {
            //filter out hidden fields
            shown = false;
            LibRouter.get({ends:'TableFields'}).each(function(e,n) {
                e.get('name') === i ?
                    e.get('export') !== false ? shown = true : shown = false : '';

            });
            
            if (!shown) continue;
            
            // added later
            if (/*i !== 'Uri' &&*/ window.rdz.TableFields.hidden.indexOf(i) === -1 &&
                
                (window.rdz.TableFields.hidden_in_mass_checks.indexOf(i) == -1 || ["Recipients", "SitesLibrary", "PagesLibrary"].indexOf(lib) !== -1 ) &&

                (AppLocale.locale === 'ru' || AppLocale.ru_params.indexOf(i) === -1)
                )
            {
                view = new window['TableXMLCell' + i]({model: row[i], params: row});            
                text += view.render();
                
                // change in the future!    
                if (i === "TYC") {
                    view = new window['TableXMLCellTYCMirrors']({model: row[i], params: row});
                    text += view.render();
                } else if (i === 'UniqueContentPage') {
                    view = new window['TableXMLCellUniqueContentPageDups']({model: row[i], params: row});
                    text += view.render();
                }
            }
        }

        return text;
    }
});

TableXMLCell = Backbone.View.extend({
    tagName: 'div',
    template: _.template(templates.user_table.xml.cell),

    render: function() {
        var u = this.options.params.Uri;
        var text = this.template({url: u.value, m: this.model});

        return text;
    }
});

TableXMLCellNum = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellNum),

    render: function() {
        var text = this.template({n: this.model ? this.model+1 : 1});
        return text;
    }

});

//------------------------------------------------------------------------------------------> siteslibrary

TableXMLCellIP = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellIP)

});

TableXMLCellGeo = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellGeo)

});

TableXMLCellHost = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellHost)

});

TableXMLCellProvider = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellProvider)

});

//TableXMLCellUrl = TableXMLCell.extend({
//
//    template: _.template(templates.user_table.xml.cellUrl),
//    render: function() {
//
//        $(this.el).html(this.template({url: this.model.value, mrkt: this.options.params.Seo}));
//        return this.el.childNodes[0];
//    }
//});

TableXMLCellUrl = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellUrl),
    render: function() {
        var text = this.template({url: this.model.value, mrkt: this.options.params.Seo});
        return text;
    }
});

//TableXMLCellTYC = TableXMLCell.extend({
//    template: _.template(templates.user_table.xml.cellTYC),
//    render: function() {
//        $(this.el).html(this.template(
//            {
//                url: this.model.value.TYC !== -1 ?
//                    'http://yaca.yandex.ru/yca/cy/ch/'+ this.options.params.Uri.value + '/' :
//                    'http://bar-navig.yandex.ru/u?ver=2&url=http://' + this.options.params.Uri.value + '&show=1',
//                m: this.model
//            }));
//        return this.el.childNodes[0];
//    }
//});
//
//// TYC Mirrors
//TableXMLCellTYCMirrors = TableXMLCell.extend({
//    template: _.template(templates.user_table.xml.cellTYCMirrors),
//    render: function() {
//        $(this.el).html(this.template(
//            {
//                m: this.model
//            }));
//        return this.el.childNodes[0];
//    }
//});

TableXMLCellTYC = TableXMLCell.extend({
    template: _.template(templates.user_table.xml.cellTYC),
    render: function() {
        var text = this.template(
            {
                url: this.model.value.TYC !== -1 ?
                    'http://yaca.yandex.ru/yca/cy/ch/'+ this.options.params.Uri.value + '/' :
                    'http://bar-navig.yandex.ru/u?ver=2&url=http://' + this.options.params.Uri.value + '&show=1',
                m: this.model
            });
        return text;
    }
});

// TYC Mirrors
TableXMLCellTYCMirrors = TableXMLCell.extend({
    template: _.template(templates.user_table.xml.cellTYCMirrors),
    render: function() {
        var text = this.template(
            {
                m: this.model
            });
        return text;
    }
});

TableXMLCellTYCBar = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellTYCBar)

});

TableXMLCellTYCCategory = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellTYCCategory)

});

TableXMLCellTYCTopics = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellTYCTopics)

});

TableXMLCellTYCRegion = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellTYCRegion)

});

TableXMLCellPR = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellPR)

});

TableXMLCellIY = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellIY)

});

TableXMLCellIYD = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellIYD)

});

TableXMLCellIG = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellIG)

});

TableXMLCellSubdomains = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellSubdomains)

});

TableXMLCellWA = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellWA)

});

TableXMLCellseomoz = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellseomoz)

});

TableXMLCellLG = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellLG)

});


TableXMLCellBackBing = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellBackBing)

});


TableXMLCellibing = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellibing)

});


TableXMLCellBing = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellBing)

});

TableXMLCellIndexAol = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellIndexAol)

});

TableXMLCellAlexa = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellAlexa)

});

TableXMLCellBackAlexa = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellBackAlexa)

});

TableXMLCellDMOZ = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellDMOZ)

});

//TableXMLCellCMS = TableXMLCell.extend({
//
//    template: _.template(templates.user_table.xml.cellCMS),
//    
//    render: function() {
//        var u = this.options.params.Uri;
//        var export_data = null;
//        var m = this.model;
//        
//        if (m.value !== null) {
//        	export_data = '';
//        	for (var arr in m.value) {
//        		var arr_length = m.value[arr].length; 
//        		if (arr_length > 0) {
//        				export_data += AppLocale.table.params.CMS[arr] + ': ';
//        		}        	
//        		for (var i = 0; i < arr_length; i++) {
//        			var name = m.value[arr][i];
//        			export_data +=  name + ' ';
//        		}
//        	}
//        }   
//        
//        
//        $(this.el).html(this.template({url: u.value, m: m, export_data : export_data}));
//
//        return this.el.childNodes[0];
//    }
//
//});

TableXMLCellCMS = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellCMS),
    
    render: function() {
        var u = this.options.params.Uri;
        var export_data = null;
        var m = this.model;
        
        if (m.value !== null) {
        	export_data = '';
        	for (var arr in m.value) {
        		var arr_length = m.value[arr].length; 
        		if (arr_length > 0) {
        				export_data += AppLocale.table.params.CMS[arr] + ': ';
        		}        	
        		for (var i = 0; i < arr_length; i++) {
        			var name = m.value[arr][i];
        			export_data +=  name + ' ';
        		}
        	}
        }   
        
        
        var text = this.template({url: u.value, m: m, export_data : export_data});

        return text;
    }

});

TableXMLCellcommercialsDomains = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellcommercials),
    
    render: function() {
        var u = this.options.params.Uri,
            value = this.model.value,
            data = '',
            names = [],
            text;
        
        if (value && value.length) {
            value.forEach(function(e) {
                names.push(AppLocale.table.params.CommercialsSevices[e]);
            });
            data = names.join(', ');
        }
        
        text = this.template({url: u.value, m: this.model, data: data});      

        return text;
    }

});


TableXMLCellTechnorati = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellTechnorati)

});

/*TableXMLCellfb = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellfb)

});*/

TableXMLCellMJ = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellMJ)

});

TableXMLCellCF = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellCF)

});

TableXMLCellTF = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellTF)

});

TableXMLCellAhrefs = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellAhrefs)

});

TableXMLCellSemrush = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellSemrush)

});

TableXMLCellGoogleAdplanner = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellGoogleAdplanner)

});

TableXMLCellGoogleTrends = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellGoogleTrends)

});

TableXMLCellCompete = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellCompete)

});

TableXMLCellQuantcast = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellQuantcast)

});

// TableXMLCellNetchart = TableXMLCell.extend({
// 
    // template: _.template(templates.user_table.xml.cellNetchart)
// 
// });


TableXMLCellBY = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellBY)

});

TableXMLCellImgyan = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellImgyan)

});

TableXMLCellImgg = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellImgg)

});

TableXMLCellAOLimg = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellAOLimg)

});

TableXMLCellpositions = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellpositions)

});

TableXMLCellLinksInDomain = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellLinksIn)

});

TableXMLCellLinksOutDomain = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellLinksOut)

});

TableXMLCellpagetitleDomain = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellpagetitle),
    
    render: function() {
        var u = this.options.params.Uri,
	    isError = AppLocale.table.params.pageTitlesErrors[this.model.value] !== undefined,
	    value = this.model.value,
	    matches,
            text;
	        
	if (value) {
	    matches = value.match(/\REDIRECT]([^]+?)\[/);
	    if (matches) {
		value = AppLocale.table.params.redirectOn + matches[1];
		isError = true;
	    } else if (isError) {
		value = AppLocale.table.params.pageTitlesErrors[value];
	    }
	}
        
        text = this.template({url: u.value, m: this.model, data : value, isError: isError});

        return text;
    }

});

TableXMLCellpageweightDomain = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellpageweight)

});

TableXMLCellAggregators = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellAggregators)

});

TableXMLCellISolomono = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellISolomono)

});

TableXMLCellSolomono = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellSolomono)

});

TableXMLCellWebmoney = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellWebmoney)

});

TableXMLCellAge = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellAge)

});

//TableXMLCellDangerous = TableXMLCell.extend({
//
//    template: _.template(templates.user_table.xml.cellDangerous),
//    render: function() {
//        $(this.el).html(this.template({indexes: this.fetch_indexes(this.model), url: this.options.params.Uri.value, m: this.model}));
//        return this.el.childNodes[0];
//    },
//
//    fetch_indexes: function(model) {
//        if (!model.value) return [];
//        var indexes = (model.value).toString(2),
//            output = [];
//
//            for (var i = indexes.length - 1; i >= 0; i -= 1) {
//                    if (indexes[i] === '1') {
//                        output.push(Math.pow(2, indexes.length - 1 - i));
//                    }
//                }
//
//        return output;
//    }
//
//});

TableXMLCellDangerous = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellDangerous),
    render: function() {
        var text = this.template({threats: this.fetchThreats(this.model), url: this.options.params.Uri.value, m: this.model});
        return text;
    },

    fetchThreats: function(model) {
        if (!model.value) return '';
                
        var threats = window.rdz.utils.mapingObj(model.value, 'Dangerous'),
            output = '';
            
        threats.forEach(function(t) {
            output += (output ? ', ' : '') +  AppLocale.export.other['DangerousNames'][t[0]];
        });        
        
        return output;
    }

});

/*TableXMLCellGoogleOne = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellGoogleOne)

});

TableXMLCellFacebookLike = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellFacebookLike)

});

TableXMLCellTwitterLike = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellTwitterLike)

});

TableXMLCellVkLike = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellVkLike)

});*/

TableXMLCellSocialNetworks = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellSocialNetworks)

});

//TableXMLCellCounters = TableXMLCell.extend({
//
//    template: _.template(templates.user_table.xml.cellCounters),
//    render: function() {    
//        var u = this.options.params.Uri,
//            m = this.model,
//            value = m.value,
//            max = -3,
//            hasCounters = false,
//            c;
//		
//	for (c in value) {
//	    if (/^Id/.test(c) && value[c]) {
//		hasCounters = true;		
//	    } else if (typeof value[c] === 'number') {
//		hasCounters = true;
//		if (max < value[c]) {
//		    max = value[c];
//		}
//	    }
//	}
//        
//        $(this.el).html(this.template({url: u.value, m: m, max: max, hasCounters: hasCounters}));
//
//        return this.el.childNodes[0];
//    }
//
//});

TableXMLCellCounters = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellCounters),
    render: function() {    
        var u = this.options.params.Uri,
            m = this.model,
            value = m.value,
            max = -3,
            hasCounters = false,
            c;
		
	for (c in value) {
	    if (/^Id/.test(c) && value[c]) {
		hasCounters = true;		
	    } else if (typeof value[c] === 'number') {
		hasCounters = true;
		if (max < value[c]) {
		    max = value[c];
		}
	    }
	}
        
        var text = this.template({url: u.value, m: m, max: max, hasCounters: hasCounters});

        return text;
    }

});

//TableXMLCellSeo = TableXMLCell.extend({
//    template: _.template(templates.user_table.xml.cellSeo),
//    render: function() {
//        $(this.el).html(this.template({markets: this.fetch_markets().join(', '), m:this.model}));
//        return this.el.childNodes[0];
//    },
//    fetch_markets: function(){
//        var output = [],
//	    curMarket = null;
//	
//        _(this.model.value).each(function(e){
//		curMarket = rdz.utils.Seo_NameByNumber[e];
//                if (curMarket) {
//                    if (curMarket === 'SapePr') curMarket = 'Sape Pr';
//                    if (curMarket === 'SapeArticles') curMarket = 'Sape Articles';
//                    if (curMarket === 'Rds') curMarket = 'RDS';//'Recipient donor service';
//                    output.push(curMarket);
//                }
//        });
//	
//        return output;
//    }
//
//
//});

TableXMLCellSeo = TableXMLCell.extend({
    template: _.template(templates.user_table.xml.cellSeo),
    render: function() {
        var text = this.template({markets: this.fetch_markets().join(', '), m:this.model});
        return text;
    },
    fetch_markets: function(){
        var output = [],
	    curMarket = null;
	
        _(this.model.value).each(function(e){
		curMarket = rdz.utils.Seo_NameByNumber[e];
                if (curMarket) {
                    if (curMarket === 'SapePr') curMarket = 'Sape Pr';
                    if (curMarket === 'SapeArticles') curMarket = 'Sape Articles';
                    if (curMarket === 'Rds') curMarket = 'RDS';//'Recipient donor service';
                    output.push(curMarket);
                }
        });
	
        return output;
    }
});

TableXMLCelllinkspurch = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.celllinkspurch)

});

TableXMLCellRSS = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellRSS)

});

TableXMLCellRobots = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellRobots)

});

TableXMLCellSitemap = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellSitemap)

});


//------------------------------------------------------------------------------------------> pageslibrary

//TableXMLCellUri = TableXMLCell.extend({
//
//    template: _.template(templates.user_table.xml.cellUri),
//    render: function() {
//        $(this.el).html(this.template({url: this.model.value}));
//        return this.el.childNodes[0];
//    }
//});

TableXMLCellUri = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellUri),
    render: function() {
        var text = this.template({url: this.model.value});
        return text;
    }
});

TableXMLCellIYP = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellIYP)

});

TableXMLCellIYDP = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellIYDP)

});

TableXMLCellIGP = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellIGP)

});

TableXMLCellPRpage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellPR)

});

TableXMLCellPRpageMain = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellPR)

});

TableXMLCellAlexaPage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellAlexa)

});

TableXMLCellBackAlexaPage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellBackAlexa)

});

TableXMLCellMozRank = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellMozRank)

});

TableXMLCellseomozP = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellseomoz)

});

TableXMLCellRecipientPage = TableXMLCell.extend({
    
    template: _.template(templates.user_table.xml.cellRecipientPage)
    
});

TableXMLCellLinkPresence = TableXMLCell.extend({
    
    template: _.template(templates.user_table.xml.cellLinkPresence)
    
});

TableXMLCellAnchor = TableXMLCell.extend({
    
    template: _.template(templates.user_table.xml.cellAnchor)
    
});

//TableXMLCellCMSpage = TableXMLCell.extend({
//
//    template: _.template(templates.user_table.xml.cellCMSpage),
//    
//    render: function() {
//        var u = this.options.params.Uri;
//        var export_data = null;
//        var m = this.model;
//        
//        if (m.value !== null) {
//        	export_data = '';
//        	for (var arr in m.value) {
//        		var arr_length = m.value[arr].length; 
//        		if (arr_length > 0) {
//        				//export_data += nsRDS.utils.TakeFromBundle("fromcode", "table_cells.cms." + arr) + ': ';
//                                        export_data += 'CMS: ';
//        		}        	
//        		for (var i = 0; i < arr_length; i++) {
//        			var name = m.value[arr][i];
//        			export_data +=  name + ' ';
//        		}
//        	}
//        }   
//        
//        
//        $(this.el).html(this.template({url: u.value, m: m, export_data : export_data}));
//
//        return this.el.childNodes[0];
//    }
//
//});

TableXMLCellCMSpage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellCMSpage),
    
    render: function() {
        var u = this.options.params.Uri;
        var export_data = null;
        var m = this.model;
        
        if (m.value !== null) {
        	export_data = '';
        	for (var arr in m.value) {
        		var arr_length = m.value[arr].length; 
        		if (arr_length > 0) {
        				//export_data += nsRDS.utils.TakeFromBundle("fromcode", "table_cells.cms." + arr) + ': ';
                                        export_data += 'CMS: ';
        		}        	
        		for (var i = 0; i < arr_length; i++) {
        			var name = m.value[arr][i];
        			export_data +=  name + ' ';
        		}
        	}
        }   
        
        
        var text = this.template({url: u.value, m: m, export_data : export_data});

        return text;
    }

});

TableXMLCellpageweight = TableXMLCell.extend({
	
    template: _.template(templates.user_table.xml.cellpageweight)
    
});

TableXMLCellpositionspage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellpositionspage)

});

TableXMLCellLinksIn = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellLinksIn)

});

TableXMLCellLinksOut = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellLinksOut)

});

TableXMLCellpagetitle = TableXMLCellpagetitleDomain;

TableXMLCellpageweight = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellpageweight)

});

TableXMLCellcommercials = TableXMLCellcommercialsDomains;

TableXMLCellISolomonoPage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellISolomono)

});

TableXMLCellSolomonoPage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellSolomono)

});

TableXMLCellDangerousPage = TableXMLCellDangerous;

/*TableXMLCellGoogleOnepage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellGoogleOnepage)

});

TableXMLCellFacebookLikepage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellFacebookLikepage)

});

TableXMLCellTwitterLikepage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellTwitterLikepage)

});

TableXMLCellVkLikepage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellVkLikepage)

});*/

TableXMLCellSocialNetworkspage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellSocialNetworkspage)

});

TableXMLCellCountersPage = TableXMLCellCounters.extend();

TableXMLCellValid = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellValid)

});

TableXMLCellNesting = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellNesting)

});

//TableXMLCellUniqueContentPage = TableXMLCell.extend({
//
//    template: _.template(templates.user_table.xml.cellUniqueContentPage),
//    
//    render: function() {
//        var u = this.options.params.Uri,
//            percent = this.model.value && this.model.value.Percent ? Math.round(this.model.value.Percent) : null;
//        $(this.el).html(this.template({url: u.value, m: this.model, percent: percent}));
//
//        return this.el.childNodes[0];
//    }
//
//});

TableXMLCellUniqueContentPage = TableXMLCell.extend({

    template: _.template(templates.user_table.xml.cellUniqueContentPage),
    
    render: function() {
        var u = this.options.params.Uri,
            percent = this.model.value && this.model.value.Percent ? Math.round(this.model.value.Percent) : null;
            
        var text = this.template({url: u.value, m: this.model, percent: percent});

        return text;
    }

});


TableXMLCellUniqueContentPageDups = TableXMLCell.extend({ // place the list of duplicates in a separate cell

    template: _.template(templates.user_table.xml.cellUniqueContentPageDups)

}); 


