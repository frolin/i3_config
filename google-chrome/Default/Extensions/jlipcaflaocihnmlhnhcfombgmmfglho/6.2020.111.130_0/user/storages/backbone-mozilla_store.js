// Override `sync` to use delegate to the model or collection's
mozStore = function(method, model, options) {

  var resp;
  var store = model.mozStorage || model.collection.mozStorage;

  switch (method) {
    case "read":    resp = model.id ? store.find(method, model, options) : store.findAll(method, model, options); break;
    case "create":  resp = store.create(method, model, options);                            break;
    case "update":  resp = store.update(method, model, options);                            break;
    case "delete":  resp = store.destroy(method, model, options);                           break;
  }
};

mozStore.methods = {

  save: function(model) {
      //nsRDS.rdsPrefs.setInt('user.'+self.name, Number(model.get('value'),10))
      rdz.storage.version_update([{path:'User', key:this.name, value: Number(model.get('value'),10)}]);
  },

  create: function(method, model, options) {
    /*if (!model.id) model.id = model.attributes.id = guid();
    this.data[model.id] = model;
    this.save(method, model, options);*/
    //return model;
  },


  update: function(method, model, options) {
    this.data[model.id] = model;
    this.save(model);
    mozStore.success(options, model.attributes);
    //return model;
  },


  find: function(method, model, options) {
    return this.data[model.id];
  },


  findAll: function(method, model, options) {
    return _.values(this.data(method, model, options));
  },

  destroy: function(method, model, options) {
   /* delete this.data[model.id];
    this.save();
    return model;*/
  }
};

mozStore.success = function(options, resp){
    if (resp) {
        options.success(resp);
    } else {
        options.error("Record not found");
    }
};

var MozStorePaging = function(name) {
  var self = this;
  self.name = name;

  this.data =  function(method, model, options){//SELECT COUNT(*) FROM SitesLibrary


      var v = rdz.utils.getOptions({options: ['User']});

      var obj = {
          name: self.name,
          value: /*nsRDS.rdsPrefs.getInt('user.'+self.name)*/ v && v.PerPage || 50,
          page: 1,
          path: 'siteslibrary',
          recipientslength: null,
          siteslength: null,
          pageslength: null,
          checksiteslength: null,
          checkpageslength: null,
          id: 1,

          //uses for current library
          //default library is SitesLibrary
          length: null,
          
          //property defines showing dates during table is rendered
          width_date: rdz.cache.get("mass_checking").show_with_date || false 
      };

      rdz.db.execute([{
          sql:'SELECT COUNT(*) AS COUNT FROM SitesLibrary',
          success: function(tx, r) {
              obj.siteslength = rdz.db.return_selected(tx, r)[0]['COUNT'];
              obj.length = obj.siteslength;

              rdz.db.execute([{
                  sql:'SELECT COUNT(*) AS COUNT FROM SitesLibrary WHERE SlRecipient = 1',
                  success: function(tx, r) {
                      obj.recipientslength = rdz.db.return_selected(tx, r)[0]['COUNT'];

                      rdz.db.execute([{
                          sql:'SELECT COUNT(*) AS COUNT FROM PagesLibrary',
                          success: function(tx, r) {
                              obj.pageslength = rdz.db.return_selected(tx, r)[0]['COUNT'];

                              rdz.db.execute([{
                                  sql:'SELECT COUNT(*) AS COUNT FROM CheckSitesLibrary',
                                  success: function(tx, r) {
                                      obj.checksiteslength = rdz.db.return_selected(tx, r)[0]['COUNT'];

                                      rdz.db.execute([{
                                          sql:'SELECT COUNT(*) AS COUNT FROM CheckPagesLibrary',
                                          success: function(tx, r) {
                                              obj.checkpageslength = rdz.db.return_selected(tx, r)[0]['COUNT'];

                                              /*change object's properties that was changed during waiting async DB requests */
                                              model = model.get('PerPage');
                                              if(model && options.prev_model) {
                                                  rdz._.extend(obj, options.prev_model);
                                              }

                                              mozStore.success(options, obj);
                                          }}]);
                                  }}]);

                          }}]);
                  }}]);
      }}]);

  };
};
_.extend(MozStorePaging.prototype, mozStore.methods);

var MozStoreSorting = function(name) {
    var self = this;
    self.name = name;

  this.data =  function(method, model, options){//SELECT COUNT(*) FROM SitesLibrary
      mozStore.success(options, {
          'sortedparam': '',
          'sortedlib': ''

      });
  };
};
_.extend(MozStoreSorting.prototype, mozStore.methods);


var MozStoreTableFields = function(name) {
    var self = this;
    self.name = name;

    this.data =  function(method, model, options) {

        var models  = [], v,

            t = rdz.utils.getOptions({options: ['User']}),
            field = (self.name === "SitesLibraryTableFields" || self.name === "CheckSitesLibraryTableFields"  ? 'Sites' : 'Pages'),


            def_val = {
                SitesLibraryTableFields : '1763616685556099',
                PagesLibraryTableFields : '3',
                CheckSitesLibraryTableFields : '1763616685556099',
                CheckPagesLibraryTableFields : '397135480611'
            },

            m = rdz.utils.mapingObj((t && t[self.name] || def_val[self.name]), ['TableFields', field]),

            model;


        for (var i in rdz.TableFields[field]) {

            v = rdz.utils.find(m, i) ? rdz.TableFields[field][i] : 0;

            model = {
                name:   i,
                value:  v,
                export: Boolean(v),
                checked: false,  //this property uses only for field with checkbox
                sortorder: '',
                request: rdz.TableFieldsToRequest[i], //request name for api
                check_mode: false,          //check or update field in api, false - "check", true - "update"
                checking: [],                //checking sites or pages at current time in api
                sub_field: [],              //save here model for additional buttons in check mode
                is_domain: api_domains.indexOf(i) !== -1 // bool flag defines domain or page

            };
            if (MozStoreSubTableFields.sub_field[i])
            {
                model.sub_field = MozStoreSubTableFields.sub_field[i](i);
            }

            models.push(model)
        }

        mozStore.success(options,models);
    };
};
_.extend(MozStoreTableFields.prototype, mozStore.methods);

var MozStoreSubTableFields = {
    return_instance: function(name, parent_field_name, without_api){
        //While model here, "check" mode will be setting for this buttons, after every AppView render
        //it's our small secret
        return new LibraryFields({
            name:   name,
            request: rdz.TableFieldsToRequest[name], //request name for api
            check_mode: false,          //check or update field in api, false - "check", true - "update"
            checking: [],                //checking sites or pages at current time in api
            parent_field_name: parent_field_name,
            without_api: without_api,
            is_domain: api_domains.indexOf(name) !== -1
        })
    },
    sub_field: {
        TYC: function(parent_field_name) {
            var self = MozStoreSubTableFields;
            return [self.return_instance('UIMirrorsCount', parent_field_name, true)];
        },
        Counters: function(parent_field_name) {
            var self = MozStoreSubTableFields;
            return [self.return_instance('UICounters', parent_field_name, false)];
        },
        CountersPage: function(parent_field_name) {
            var self = MozStoreSubTableFields;
            return [self.return_instance('UICounters', parent_field_name, false)];
        }
    }
};

