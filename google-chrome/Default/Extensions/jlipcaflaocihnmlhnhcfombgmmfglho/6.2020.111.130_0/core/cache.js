/** @namespace */
window.rdz.cache = {
    /**
     * @param key (String | Array) throw Array to get value from the depths
     * @return {}
     */
    get: function (key) {
        var segments = key || [],
            cursor = rdz.cache,
            segment,
            i,
            s = Object.prototype.toString,
            is_string = s.call(key) === "[object String]";

        for (i = 0; !is_string && i < segments.length - 1; ++i) {
            segment = segments[i];
            if (!cursor[segment]) return null;
            cursor = cursor[segment];
        }

        return is_string ? rdz.cache[key] : cursor[segments[i]];
    },
    /**
     * @param key (String | Array) throw Array to rewrite value
     * @param value
     */
    set: function (key, value) {
        var s = Object.prototype.toString,
            o = s.call(key);

        switch (o) {
            case "[object Array]":
                var cursor = rdz.cache, i = 0;
                for (; i < key.length; ++i) {
                    cursor[key[i]] =
                        //if last element in Array rewrite value
                        (i != key.length - 1 ?
                            //property should be an object and exist
                        s.call(cursor[key[i]]) === "[object Object]" && cursor[key[i]] || {}
                            : value);
                    cursor = cursor[key[i]];
                }
                break;

            default :
                if (!rdz.cache[key]) rdz.cache[key] = value;
                break;
        }

    },

    clear: function (a) {
        a = a || {};
        if (a.url) {
            let ccleaner = /^https?:\/\/(www\.)?|^(www\.)|\/.*|\//g;
            domain = a.url.replace(ccleaner, '');

            // delete from cache
            for (let data in this) {
              if (domain === data.replace(ccleaner, '')) {
                delete this[data];
              }
            }
            //delete this[a.url];
            //delete this[rdz.utils.domainFromUri(a.url).domain];
            //delete this[rdz.utils.protolessUri(a.url)];
        } else {
            for (var i in this) {
                if (Object.prototype.toString.call(this[i]) !== '[object Function]' &&
                    i !== 'API' &&
                    i !== 'ApplicationData') {
                    delete this[i];
                }
            }
        }
    }
};