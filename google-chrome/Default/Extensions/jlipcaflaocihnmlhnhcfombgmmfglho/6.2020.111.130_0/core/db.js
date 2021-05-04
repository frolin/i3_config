rdz.db = {
  storage: null,
  cache: {},
  version: '2019111400',

  init: function () {
    this.storage = new PouchDB('RDS', { revs_limit: 3 });
    this.check_consistency();
  },

  check_consistency: function () {
    chrome.storage.local.get('Info', settings => {
      let db_version = settings.Info.db_version;
      if (!db_version || db_version < this.version) {
          settings.Info.db_version = this.version;
          chrome.storage.local.set(settings);
      }

      this.get_seobudget();
      this.get_rds_notification();
    });
  },

  get: function (key, callback) {
    this.storage.get(key).then(doc => {
      this.cache[key] = doc;
      if (callback) callback(doc);
    }).catch(err => {
      if (err.status !== 404) {
        console.error(err.message);
      }
      if (callback) callback();
    });
  },

  put: function (key, callback) {
    let data = this.cache[key] || { _id: key };
    this.storage.put(data).then(response => {
      if (response.ok) data._rev = response.rev;
      if (callback) callback();
    }).catch(err => {
      console.error(err);
    });
  },

  remove: function (key, callback) {
    this.storage.get(key).then(doc => {
      delete this.cache[key];
      this.storage.remove(doc);
    }).catch(err => {
      console.error(err.message);
    });
  },

  get_seobudget: function () {
    function _seobudget() {
      rdz.model.parameters.Factory.requestOneParameter({
        model: {
          name: 'Seobudget',
          request: 'Seobudget'
        },
        ignore_cache: true,
        receiver: 'callback',
        callback: function (arg) {
          let value = arg.get('value');

          if (value && value !== rdz.errors.PARSE) {
            chrome.storage.local.get('OtherData', settings => {
              let otherData = settings.OtherData || {};
              otherData.Seobudget = value;
              chrome.storage.local.set({ OtherData: otherData });
            });
          }

          rdz.db.seobudget_timeout = setTimeout(function () {
            _seobudget();
          }, 4 * 60 * 60 * 1000);
        }
      });
    }

    _seobudget();
  },

  get_rds_notification: function () {
    function _rds_notification() {
      rdz.model.parameters.Factory.requestOneParameter({
        model: {
          name: 'RDSNotification',
          request: 'RDSNotification'
        },
        ignore_cache: true,
        receiver: 'callback',
        callback: function (arg) {
          var value = arg.get('value');

          if (value && value.Message) {
            chrome.storage.local.get('OtherData', settings => {
              let otherData = settings.otherData || {};

              let rds_notification = otherData.rds_notification;
              if (rds_notification) {
                rds_notification.curr = value;
              } else {
                rds_notification = { curr: value };
              }
              otherData.rds_notification = rds_notification;

              chrome.storage.local.set({ OtherData: otherData });
            });
          }
          delete rdz.db.rds_notification_timeout;
          rdz.db.rds_notification_timeout = setTimeout(function () {
            _rds_notification();
          }, 4 * 60 * 60 * 1000);
        }
      });
    }

    _rds_notification();
  },

  updateRecipients: function (data) {
      let recipients = data && data.map(e => e.Url);
      if (recipients.length) rdz.db.update('Recipients', recipients);
  },

  create_tables: function (callback) {
    rdz.db.storage = new PouchDB('RDS');
    if (callback) callback();
  },
  delete_tables: function (callback) {
    this.cache = {};
    this.storage.destroy().then(function () {
      if (callback) callback();
    }).catch(function (err) {
      console.error(err);
    });
  },

  delete_sites_row: function (domains, callback) {
    let ccleaner = /^https?:\/\/(www\.)?|^(www\.)|\/.*|\//g;
    domains = domains.map(d => d.replace(ccleaner, ''));

    // delete from cache
    let cache = rdz.db.cache;
    for (let data in cache) {
      if (domains.includes(data.replace(ccleaner, ''))) {
        delete cache[data];
      }
    }

    // delete from DB
    domains.forEach(function (domain) {
      rdz.db.storage.allDocs({
        include_docs: true,
        startkey: domain,
        endkey: domain + '\ufff0'
      }).then(function (result) {
        rdz.db.storage.bulkDocs(result.rows.map(row => {
          row.doc._deleted = true;
          return row.doc;
        })).catch(function (err) {
          console.error(err);
        });
      }).catch(function (err) {
        console.error(err);
      });
    });

    domains.forEach(function (domain) {
      rdz.db.storage.allDocs({
        include_docs: true,
        startkey: 'www.' + domain,
        endkey: 'www.' + domain + '\ufff0'
      }).then(function (result) {
        rdz.db.storage.bulkDocs(result.rows.map(row => {
          row.doc._deleted = true;
          return row.doc;
        })).catch(function (err) {
          console.error(err);
        });
      }).catch(function (err) {
        console.error(err);
      });
    });

    if (callback) callback();
  },
    delete_pages_row: function (uris, callback) {
        var sql = [];
        uris.forEach(function (uri) {
            sql.push(
                {
                    sql: 'DELETE FROM ExtLinks WHERE ElPlId = (SELECT PlId FROM PagesLibrary WHERE PlSlId = (SELECT SlId FROM SitesLibrary WHERE SlUrl = ?) AND PlUri = ?)',
                    params: [uri.domain, uri.path]
                },
                {
                    sql: 'DELETE FROM PagesLibrary WHERE PlSlId = (SELECT SlId FROM SitesLibrary WHERE SlUrl = ?) AND PlUri = ?',
                    params: [uri.domain, uri.path]
                });
        });

        rdz.db.execute(sql, callback);
    },

    fetch: function (uri, callback) {
        function chaining(path, resolve) {
            rdz.cache[path] = {};
            if (rdz.db.cache[path]) {
                rdz.db.set(uri, rdz.db.cache[path], path);
                if (resolve) resolve();
            } else {
                rdz.db.get(path, function (doc) {
                    rdz.db.set(uri, doc, path);
                    if (resolve) resolve();
                });
            }
        }

        chaining(uri.domain,
            chaining('www.' + uri.domain,
                chaining(uri.page, callback)
            )
        );
    },

    //putting values from db in parameter's cache
    set: function (uri, sql_response, cache_path) {
        for (var i in sql_response) {
            var parameter = sql_response[i];
            if (parameter.date === rdz.db.validate({name: i, date: parameter.date, action: 'date'}) &&
                parameter.value !== null &&
                parameter.value !== undefined &&
                parameter.date !== null) {

                //if (!rdz.cache[parameter.page ? uri.page : uri.domain]) {rdz.cache[parameter.page ? uri.page : uri.domain] = {}}
                //var path = rdz.cache[parameter.page ? uri.page : uri.domain];
                var path = rdz.cache[cache_path];

                path[i] = parameter.value;
            } else { // added later
                // //var path = rdz.cache[parameter.page ? uri.page : uri.domain];
                // var path = rdz.cache[cache_path];
                // if (i !== 'CountersID') {
                //     //path[i] = null;
                // }
            }
        }
    },


    timeout: 0,
    jobs: [],
    trigger: function () {
        if (this.timeout + 500 < Date.now()) {
            if (this.jobs.length) this.save();
        } else {
            setTimeout(() => { this.trigger(); }, 1000);
        }
    },

    update: function (id, result, uri, mass_id, source) {
        /*convert "result" in savable format, "obj.status" define should we save or not*/
        var obj = rdz.db.validate({name: id, value: result, action: 'value', mass_id: mass_id});

        rdz.db.timeout = +new Date();
        if (obj.status) {

                rdz.db.get(uri ? source : id, () => {
                    if (uri) {
                        if (!rdz.db.cache[source]) rdz.db.cache[source] = { _id: source };
                        if (!rdz.db.cache[source][id]) rdz.db.cache[source][id] = {};
                        rdz.db.cache[source][id].date = Date.now();
                        rdz.db.cache[source][id].value = obj.value;
                    } else {
                        if (!rdz.db.cache[id]) rdz.db.cache[id] = { _id: id };
                        rdz.db.cache[id].date = Date.now();
                        rdz.db.cache[id].value = obj.value;
                    }

                    if (!rdz.db.jobs.includes(source || id)) rdz.db.jobs.push(source || id);
                });

            rdz.db.trigger();

        }
    },

    save: function () {
        this.jobs.forEach(e => this.put(e));
        this.jobs = [];
    },

    validate: function (parameter) {
        return this.validator[parameter.action](parameter);
    },

    to_sql_obj: function (id, value) {
        return this.sql_objs[id] ? this.sql_objs[id](value) : value;
    },
    /**
     * @description execute sql commands
     * @param db_request {Array} [String, String, ..] or [{sql:'', params: [], success: callback, error: callback}, {}, ..]
     * @param callback {Function} Optional function called when all sql commands is executed
     */
    execute: function (db_request, callback) {
        if (rdz.db.storage && rdz._.isArray(db_request)) {
            rdz.db.storage.transaction(function (tx) {
                db_request.forEach(function (e, i) {

                    tx.executeSql(e.sql || e,
                        e.params || [],
                        e.success || i + 1 === db_request.length && callback || function () {
                        },
                        e.error || function (tx, e) {
                            console.log(tx, e, db_request);
                        });
                });
            });
        }
        else {
            console.log('rdz.db.execute throw an error', rdz.db.storage, db_request);
        }
    }
};

rdz.db.validator = {
    /*value: function(parameter) {
     //берем из кеша
     var p = parameter.result;
     //пытаемся понять число это или нет, параметры из парсеров иногда сохраняют числовое занечение строкой
     //некоторые параметры оперируют только строкой
     //if something changed below, also do it in valueTYC
     //undefined means "do not save in db"
     return typeof + p === "number" && +p > -2 ? +p : typeof p === "boolean" ? +p : typeof p === "string" ? p : Object.prototype.toString.call(p) === '[object Array]' ? p.join('\272A') : undefined;
     },*/
    date: function (parameter) {
        var d = parameter.date,
            p = rdz.db.period[parameter.name];

        if (!d || d < +new Date() - 1000 * 60 * 60 * 24 * p || rdz.db.validator.seobudget_date(parameter)) {
            d = +new Date();
        }
        return d;
    },
    seobudget_date: function (parameter) {
        var seobudget_date = rdz.cache.get(['ApplicationData', 'Seobudget']);
        return parameter.date < (seobudget_date && seobudget_date[parameter.name]);
    },
    value: function (parameter) {
        var o = {status: true, value: parameter.value},
            cache,
            value = [],
            not_included,
            cached = false;

        if (!parameter.mass_id &&
            (parameter.name === 'IYP' && !rdz._.isNumber(parameter.value)  /*if not Number, waiting for IYPCache*/ ||
            parameter.name === 'IYPCache' && parameter.value === 0 /*if IYPCache didn't found cache date*/)) {
            o.status = false;
        }
        //search for hasn't saved values
        else if (parameter.mass_id) {
            if (parameter.name === 'UIMirrorsCount') {

            } else if (parameter.name === 'APICounters' && parameter.value.SessionStatus === "Completed") {
                parameter.value.Domains.forEach(function (d) {
                    d.Values.forEach(function (v) {
                        value.push({
                            value: v.Value,
                            uri: d.DomainName
                        });
                    });
                });
                o.value = value;
            } else if (parameter.value && parameter.value.new_data) {
                o.value = parameter.value.new_data;
            } else {
                o.status = false;
            }
        }

        return o;
    }
};

rdz.db.sql_objs = {
    IYD: function (value) {
        return (+new Date(value.Date)) || null;
    },
    IYDP: function (value) {
        return (+new Date(value.Date)) || null;
    },
    TYC: function (value) {
        return {
            TYC: value.Cy === -666 ? -1 : value.Cy,
            YaCatalog: ['-3', '0', '-1'].indexOf(value.Yaca) === -1 ? value.Yaca : null
        };
    },
    YaBar: function (value) {
        return {
            TYC: value.YaBarCy === -666 ? -1 : value.YaBarCy,
            topic: ['-3', '0', '-1'].indexOf(value.YaBarYaca) === -1 ? value.YaBarYaca : null,
            region: value.YaBarRegion
        };
    },
    WA: function (value) {
        return rdz.utils.convert_WA_api_date(value.Wa || null);
    },
    Seo: function (value) {
        var resultObj = {};

        for (var name in rdz.utils.Seo_NumberByName) {
            resultObj[name] = value.indexOf(rdz.utils.Seo_NumberByName[name]) !== -1 ? "yes" : "no";
        }

        return resultObj;
    }
};

//how long parameter will keep value without update, in days
rdz.db.period = {
  'IY': 3,
  'IYP': 3,
  'IYPCache': 3,
  'IYD': 3,
  'IYDP': 3,

  'IG': 1,
  'MIG': 1,
  'IGP': 1,
  'IGPWWW': 1,
  'IGPCache': 1,

  'TYC': 3,
  'YaBar': 3,
  'MirrorsCount': 3,
  'UIMirrorsCount': 3,
  'Mirrors': 3,

  'PR': 7,
  'PRMain': 7,
  'PRg': 7,
  'PRgMain': 7,
  'PRpageMain': 7,

  'Dmoz': 30,
  'WA': 90,
  'MozRank': 7,
  'MozRankCache': 7,
  'SeoM': 7,
  'SeoMCache': 7,
  'BackG': 3, //?
  'BackBing': 3,
  'IBing': 3,
  'Bing': 3,
  'BI': 3,
  'Alexa': 1,
  'BackA': 7,
  'CMS': 3 / 24,
  'BY': 3,
  'YaBlog': 3,
  'YaBlogs': 3,
  'Majestic': 7,
  'TF': 7,
  'CF': 7,
  //'Ahrefs': 7,
  'AhrefsTB': 7,
  'AhrefsPage': 7,
  'AhrefsDomain': 7,
  'SemRush': 7,
  'Pictures': 7,//?
  'PicturesYa': 7,
  'PicturesAol': 7,
  'AggregatorsYandex': 30,
  'AggregatorsGoogle': 30,
  'AggregatorsBing': 30,
  'AggregatorsNovoteka': 30,
  'ISolomono': 7,
  'Solomono': 7,
  'IP': 3 / 24,
  'IPSitesCountBing': 3 / 24,
  'IPSitesCountSolomono': 3 / 24,
  'IPSitesCountRDS': 3 / 24,
  'Geo': 30,
  'LinksBuy': 30,
  'CheckDangerous': 3,

  'CountersID': 3 / 24,
  'liveinternet': 3 / 24,
  'liveinternet_xml': 3 / 24,
  'rambler': 3 / 24,
  'mail': 3 / 24,
  'openstat': 3 / 24,
  'hotlog': 3 / 24,
  'hotlog_attempt': 3 / 24,
  'Counters': 3 / 24,
  'GA': 3 / 24,
  'ya_metric': 3 / 24,
  'bigmir': 3 / 24,
  'topstat': 3 / 24,
  'mycounter': 3 / 24,
  'log24': 3 / 24,
  'yandeg': 3 / 24,
  'mystat': 3 / 24,
  'hit_ua': 3 / 24,
  'i_ua': 3 / 24,
  'uptolike': 3 / 24,
  'sape': 3 / 24,

  'SocialNetworks': 3 / 24,
  'Validation': 1,
  'RSS': 3 / 24,
  'Robots': 7,
  'Nesting': 7,
  'Sitemap': 7,
  'SitemapRobots': 7,
  'CurrSitemap': 7,

  'Seo': 30,
  'pageweight': 3,
  'LinksIn': 3,
  'LinksOut': 3,
  'pagetitle': 7,
  'commercials': 7,
  'recipientPage': 3,
  'UniqueContentPage': 1 / 24,
  'Prodvigator_y_traff': 1,
  'Prodvigator_y_count': 1,
  'Prodvigator_y_visible': 1,
  'Prodvigator_g_traff': 1,
  'Prodvigator_g_count': 1,
  'Prodvigator_g_visible': 1,
  'SpyWords': 1,
  'StatHistory': 7,
  'SimilarWeb': 7,
  'SQI': 3,

  'GooglePlus': 1,
  'GooglePlusMain': 1,
  'Facebook': 1,
  'FacebookMain': 1,
  'Twitter': 1,
  'TwitterMain': 1,
  'VK': 1,
  'VKMain': 1,
  'UniqueContent': 1,
  'Age': 90,
  'Whois': 90,
  'SubdomainsCount': 1,

  'Webmoney': 7,
  'WMAdvisor': 7,
  'WMAdvisorGraph': 7
};
