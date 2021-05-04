window.TableSort = Backbone.Model.extend({
    idAttribute: 'name',
    mozStorage: new MozStoreSorting('TableSort'),

    setSortedField : function (a){
        //clear last sorted parameter
        var l = this.get('sortedlib'),
            p = this.get('sortedparam');

        if (p !== '' && l !== '') {
            LibRouter.get({lib:l, ends:'TableFields'}).get(p).set({sortorder: ''});
            this.set({sortedlib: ''});
            this.set({sortedparam: ''});
        }

        //if fields wasn't been sorted
        if (!a.name) return;
        LibRouter.get({ends:'TableFields'}).get(a.name).set({sortorder: a.order});

        //save new sorted parameter
        this.set({sortedlib: DataPaging.get('PerPage').get('path')});
        this.set({sortedparam: a.name});
    },
    getSortedField: function() {
        var l = this.get('sortedlib'),
            f = this.get('sortedparam'),
            sortedField = null, 
            pfx = '',
            sortorder,
            cur_path = DataPaging.get('PerPage').get('path');


        pfx = ((l === 'pageslibrary' || l === 'checkpages') && api_domains.indexOf(f) === -1) ? 'Pl' : 'Sl';

        if (f !== '' && l !== '') {
            sortorder = LibRouter.get({ends:'TableFields'}).get(f).get('sortorder');
        }
        
        // to change sorting by Url
        if (f === "Uri") {
             if (pfx === "Sl") { sortedField = "SlUrl " + sortorder; } // changed for SlUrl
             if (pfx === "Pl") { sortedField = "SlUrl " + sortorder + ", PlUri " + sortorder; }
        } else if (f === "UniqueContentPage") {
            sortedField = pfx + 'UniqueContentPagePercent' + ' ' + sortorder;
        }

        return f !== '' ?
            (sortedField ? sortedField : pfx + f + ' ' + sortorder + ' ' + this.sortMapping({name:f, pfx: pfx, sortorder: sortorder})) :
            (['recipients', 'siteslibrary', 'pageslibrary'].indexOf(cur_path) !== -1 ? pfx : '')  + 'Id asc';
    },
    sortMapping: function(p) {
        var s = '',
            //fields that doesn't have CheckDate
            //property name: field we want to replace
            //property value: field we will use
            f = {
                TYCBar: 'TYC',
                TYCCategory: 'TYC',
                TYCTopics: 'TYC',
                TYCRegion: 'TYC',
                //Url: '',
                Uri: ''
            };

        return f[p.name] === undefined || f[p.name] !== '' ?
            ', ' + p.pfx + (f[p.name] || p.name) + 'CheckDate ' + p.sortorder :
            '';
    }

});
TableSort.prototype.sync = mozStore;


