define(["lib"], function () {
    var localStore = function (method, model, options) {
        chrome.storage.local.get(null, settings => {
            var resp;
            var store = model.localStorage || model.collection.localStorage;

            switch (method) {
                case "read":
                    resp = model.id ? store.find(model) : store.findAll(options, settings);
                    break;
                case "create":
                    resp = store.create(model);
                    break;
                case "update":
                    resp = store.update(model);
                    break;
                case "delete":
                    resp = store.destroy(model);
                    break;
            }

            if (resp) {
                options.success(resp);
            } else {
                options.error("Record not found");
            }
        });
    };

    localStore.methods = {

        save: function (model) {
            //localStorage.setItem(this.name, JSON.stringify(this.data));
        },

        create: function (model) {
            /*if (!model.id) model.id = model.attributes.id = guid();
             this.data[model.id] = model;
             this.save(model);
             return model;*/
        },


        update: function (model) {
            /*this.data[model.id] = model;
             this.save(model);
             return model;*/
        },


        find: function (model) {
            // return this.data(model);
        },


        findAll: function (options, settings) {
            return _.values(this.data(options, settings));
        },


        destroy: function (model) {
            //return model.set(this.reset())
        }

    };

    return localStore;
});

