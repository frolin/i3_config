/**
 * @class updates existing and sets new settings in localStorage
 * @property {Object} versions defines where and what updating in extention's options
 */
window.rdz.storage = {
    update: function (items) {
        let manVersion = chrome.runtime.getManifest().version;
        if (items.Info) {
            if (items.Info.version !== manVersion) {
                // tmp change opts
                items.Info.version = manVersion;
                this.selfCheck(items);
                chrome.storage.local.set(items);

                rdz.utils.openRecipdonorPage();
            }
        } else {
            // migration to chrome storage local
            let settings = {};
            Object.keys(localStorage).filter(x => !x.startsWith('_')).forEach(opt => {
                settings[opt] = JSON.parse(localStorage[opt]);
            });

            if (settings.Info) {
                settings.Info.version = manVersion;
            } else {
                settings.Info = { version: manVersion };
            }

            this.selfCheck(settings);

            chrome.storage.local.set(settings);
            localStorage.clear();
        }
    },

    selfCheck: function (settings) {
        ['Bar'].forEach(item => {
            if (!settings[item]) {
                settings[item] = rdz.setting.options[item];
            } else {
                let newItem = rdz.setting.options[item],
                    oldItem = settings[item];

                let keys = Object.keys(newItem);
                for (let i = 0; i < keys.length; i++) {
                    if (oldItem[keys[i]] !== undefined) {
                        newItem[keys[i]] = oldItem[keys[i]];
                    }
                }
                settings[item] = newItem;
            }
        });

        ["Canonical", "DisplayNone", "NoFollow", "Sponsored", "UGC", "NoIndex", "OuterLinks", "Robots"].forEach(item => {
            if (!settings[item]) {
                settings[item] = rdz.setting.options[item];
            } else {
                let newItem = rdz.setting.options[item],
                    oldItem = settings[item];

                // check Array
                for (let j = 0; j < newItem.length; j++) {
                    let currNewItem = newItem[j],
                        currOldItem = oldItem.find(obj => obj.name === currNewItem.name);

                    if(!currOldItem) continue;

                    // check Array object item
                    let keys = Object.keys(currNewItem);
                    for (let i = 0; i < keys.length; i++) {
                        if (currOldItem[keys[i]] !== undefined) {
                            currNewItem[keys[i]] = currOldItem[keys[i]];
                        }
                    }
                }
                settings[item] = newItem;
            }
        });

        ['Google', 'Yandex'].forEach(item => {
            if (!settings[item]) {
                settings[item] = rdz.setting.options[item];
            } else {
                // root
                let newI = rdz.setting.options[item],
                    oldI = settings[item],
                    keysI = Object.keys(newI);
                for (let i = 0; i < keysI.length; i++) {
                    if (oldI[keysI[i]] === undefined) continue;
                    if (typeof (oldI[keysI[i]]) === 'object') {
                        // functions
                        let newJ = newI[keysI[i]],
                            oldJ = oldI[keysI[i]],
                            keysJ = Object.keys(newJ);
                        for (let j = 0; j < keysJ.length; j++) {
                            if (oldJ[keysJ[j]] === undefined) continue;
                            // extra
                            let newK = newJ[keysJ[j]],
                                oldK = oldJ[keysJ[j]],
                                keysK = Object.keys(newK);
                            for (let k = 0; k < keysK.length; k++) {
                                if (oldK[keysK[k]] === undefined) continue;
                                newK[keysK[k]] = oldK[keysK[k]];
                            }
                        }
                    } else {
                        newI[keysI[i]] = oldI[keysI[i]];
                    }
                }
                settings[item] = newI;
            }
        });

        ['Parameters', 'GoParameters', 'YaParameters'].forEach(item => {
            if (!settings[item]) {
                settings[item] = rdz.setting.options[item]();
            } else {
                // root
                let newI = rdz.setting.options[item](),
                    oldI = settings[item];
                for (let i = 0; i < newI.length; i++) {
                    // objects
                    let newJ = newI[i],
                        oldJ = oldI.find(obj => obj.name === newJ.name),
                        keysJ = Object.keys(newJ);

                    if (!oldJ) continue;

                    for (let j = 0; j < keysJ.length; j++) {
                        if (oldJ[keysJ[j]] === undefined) continue;
                        if (typeof (oldJ[keysJ[i]]) === 'object') {
                            // extra
                            let newK = newJ[keysJ[j]],
                                oldK = oldJ[keysJ[j]],
                                keysK = Object.keys(newK);
                            for (let k = 0; k < keysK.length; k++) {
                                if (oldK[keysK[k]] === undefined) continue;
                                newK[keysK[k]] = oldK[keysK[k]];
                            }
                        } else {
                            newJ[keysJ[j]] = oldJ[keysJ[j]];
                        }
                    }
                }
                settings[item] = newI;
            }
        });
    }
};
