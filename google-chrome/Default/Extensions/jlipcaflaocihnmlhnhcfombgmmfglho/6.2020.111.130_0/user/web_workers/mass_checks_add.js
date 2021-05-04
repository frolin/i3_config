window = {};
importScripts('/includes/lib.js', '/includes/punycode.js', '/lib/underscore.js');
rdz = window.rdz;
importScripts('/core/db.js');
rdz._ = _;
onmessage = function(e){
    switch (e.data.method) {
        case 'GET_LIST':
            get_list(e);
            break;

        case 'GET_SAVED_DOMAIN_LIST':
            get_saved_domain_list(e);
            break;

        case 'GET_SAVED_PAGES_LIST':
            get_saved_pages_list(e);
            break;
    }
};

function get_list(e){
    var valid = [],
        nonvalid = [],
        list = e.data.list;

    //remove white spaces and line breaks at the start, end (trim) and middle (regexp) of the string
    list = list.trim().replace(/^\s*[\r\n]/gm, '');

    if (list.length > 0) {
        list = list.split('\n');

        valid = list.filter(
            function (domain) {
                //return rdz.utils.validateDomain(punycode.ToASCII(domain)) || rdz.utils.validateDomain(punycode.ToASCII(rdz.utils.domainFromUri(domain).domain || ""))
                return domain && rdz.utils.domainFromUri(domain).domain && rdz.utils.validateDomain(punycode.ToASCII(rdz.utils.domainFromUri(domain).domain));
            }
        );
        nonvalid = rdz._.difference(list, valid).map(function (domain) {
            return punycode.ToUnicode(domain)
        });
    }

    postMessage({method: 'GET_LIST', valid: valid, nonvalid: nonvalid});
}

function get_saved_domain_list(e){
    var old_domains = e.data.old_domains;
        old_domains = old_domains.map(function(i){return i.SlUrl});

    var count = e.data.count;

    var new_domains = count.valid.map(function(new_domain) {
        // convert domain to ASCII
        //var ASCIIDomain = punycode.ToASCII(new_domain);
        //return rdz.utils.get_uri_obj(ASCIIDomain)['domain'].toLowerCase()
        
        var uriDomain = rdz.utils.get_uri_obj(new_domain)['domain'].toLowerCase()
        var ASCIIDomain = punycode.ToASCII(uriDomain);
        return ASCIIDomain;
    });
    var uniq = rdz._.uniq(new_domains); //filter duplicates in new uris
    var difference = rdz._.difference(uniq, old_domains); //filter duplicates in db uris

    //add new domains in SitesLibrary
    var new_uri_sql =  [];
    difference.forEach(function(e) {
        new_uri_sql.push(
            {
                sql: 'INSERT OR IGNORE INTO SitesLibrary (SlUrl, SlCreateDate) VALUES (?, ?)',
                params: [e, +new Date()]
            }
        );
        new_uri_sql.push(
            {
                sql: 'INSERT INTO CheckSitesLibrary (TabId, SiteId) VALUES (?, (SELECT SlId FROM SitesLibrary WHERE SlUrl = ?))',
                params: [1, e]
            }
        );
    });

    var arg = {status:'ADDED_IN_CHECKING', count:count, difference:difference};

    postMessage({method: 'GET_SAVED_LIST', new_uri_sql: new_uri_sql, arg: arg});
}

function get_saved_pages_list(e){
    var old_domains = e.data.old_domains;
    old_domains = old_domains.map(function (i) { return i.SlUrl + i.PlUri });

    var count = e.data.count;

    var new_domains = count.valid.map(function (new_domain) {
        var uri_obj = rdz.utils.get_uri_obj(new_domain);
        // return uri_obj.path === '' ? (uri_obj.domain.toLowerCase() + '/') : (uri_obj.domain.toLowerCase() + uri_obj.path);
        
        var ASCIIDomain = punycode.ToASCII(uri_obj.domain.toLowerCase());
        var path = "";
        if (uri_obj.path) {
            path = rdz.utils.encodePath(uri_obj.path);
        }
        
        return uri_obj.path === '' ? (ASCIIDomain + '/') : (ASCIIDomain + path);
    });

    var uniq = rdz._.uniq(new_domains); //filter duplicates in new uris
    var difference = rdz._.difference(uniq, old_domains); //filter duplicates in db uris

    //add new domains in SitesLibrary
    var new_uri_sql = [];
    difference.forEach(function (e) {
        var uri_obj = rdz.utils.get_uri_obj(e);
        new_uri_sql.push(
            {
                sql: 'INSERT OR IGNORE INTO SitesLibrary (SlUrl, SlCreateDate) VALUES (?, ?)',
                params: [uri_obj.domain, +new Date()]
            }
        );
        new_uri_sql.push(
            {
                sql: 'INSERT OR IGNORE INTO PagesLibrary (PlSlId, PlCreateDate, PlUri, PlWwwFlag) VALUES ( (SELECT SlId FROM SitesLibrary WHERE SlUrl = ?), ?, ?, ?)',
                params: [uri_obj.domain, +new Date(), uri_obj.path, uri_obj.www ? 1 : 0]
            }
        );
        new_uri_sql.push(
            {
                sql: 'INSERT INTO CheckPagesLibrary (TabId, PageId) VALUES (?, (SELECT PlId FROM PagesLibrary WHERE PlSlId = (SELECT SlId FROM SitesLibrary WHERE SlUrl = ?) and PlUri = ?))',
                params: [1, uri_obj.domain, uri_obj.path]
            }
        );
    });
    var arg = {status: 'ADDED_IN_CHECKING', count: count, difference: difference};


    postMessage({method: 'GET_SAVED_LIST', new_uri_sql: new_uri_sql, arg: arg});
}