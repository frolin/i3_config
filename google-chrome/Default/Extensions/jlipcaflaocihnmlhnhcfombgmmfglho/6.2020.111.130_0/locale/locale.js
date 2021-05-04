/**
 * @class reruns language for app
 *
 * @propery {Object} ru.parameters - default locale for bar on content script and popup script
 * @propery {Object} ru.popup - locale only for popup script
 * @propery {Object} ru.bar - locale for bar on content script and option page
 * @propery {Object} ru.bar.parameters - replace default locale for ru.parameters
 * @propery {Object} ru.page - locale for option page (highlighted elements on content script)
 * @propery {Object} ru.options.parameters - replace default locale ru.parameters for option page
 */
window.AppLocale = {
     get: function(path){
         var segments = path && path.split('.') || [],
               cursor = this.locale,
               segment,
               i;

               for (i = 0; i < segments.length - 1; ++i) {
                  segment = segments[i];
                  cursor = cursor[segment];
               }

         return !path ? this.locale : cursor[segments[i]];
     },
     init : async function(locale) {
         this.locale = JSON.parse( await rdz.utils.loadInjected('/locale/' + (locale|| this.get_locale_str()) + '.json'));
     },
     get_locale_str: function(){
         return rdz.user.locale; //rdz.utils.getOptions({options: ['Bar']}).locale;
     }
};
