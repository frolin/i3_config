var bigImgParser=function(){var commonRules,userRules;return chrome.storage.onChanged.addListener(function(e){var u=e.commonRules,r=e.userRules;u&&(commonRules=u.newValue),r&&(userRules=r.newValue)}),{commonRuleUrl:gConfig.staticServer+"/aiscripts/rules.json?_="+Date.now(),getRules:function(){return userRules.map(function(e){return e.enabled=!0,e}).concat(commonRules)},getEnabledRules:function(){var e=[];return this.getRules().forEach(function(u){u.enabled&&e.push(u)}),e},getCommonRules:function(){return commonRules},getUserRules:function(){return userRules},saveUserRule:function(e){var u=JSON.stringify(e,null,null);localStorage.userRules=u,u2()},init_:function(e){var u=this;chrome.storage.local.get(["commonRules","userRules"],function(r){commonRules=r.commonRules||[],userRules=r.userRules||[];var n=0==commonRules.length?"./rules.json":u.commonRuleUrl;fetch(n).then(function(e){return e.json()}).then(function(r){r.forEach(function(e){var u=_.find(commonRules,{site:e.site});e.enabled=u?void 0===u.enabled?!!e.defaultEnabled:u.enabled:!!e.defaultEnabled}),commonRules=r;var n=JSON.parse(localStorage.userRules||"[]"),s=userRules.map(function(e){return e.site});n.forEach(function(e){-1==s.index(e.site)&&userRules.push(e)}),chrome.storage.local.set({commonRules:commonRules,userRules:userRules}),e(u.getRules())})})},init:function(e){var u=this;chrome.storage.local.get(["commonRules","userRules"],function(r){commonRules=r.commonRules||[],userRules=r.userRules||[],e(u.getRules())})},parse:function(src){if(src.match(/^data/))return src;for(var rules=this.getEnabledRules(),i=0;i<rules.length;i++){var rule=rules[i],srcPattern=new RegExp(rule.srcPattern),replaceRule=rule.replaceRule;if(srcPattern&&srcPattern.test(src)){var ret=src;try{return ret=eval(replaceRule.replace(/@/g,src)),ret}catch(e){}}}return src}}}();