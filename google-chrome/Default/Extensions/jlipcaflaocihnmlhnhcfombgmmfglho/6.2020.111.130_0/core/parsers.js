/** @namespace global scope for parameters' parsers. Store parser in this scope if it is used by 2 or more parameters */
window.rdz.parsers = {
    /**
     * @param response
     * @return {Object}
     */
    parseBingResult: function (response) {
        var result = rdz.errors.PARSE;
        if (response) {
            if (/class=\"picture\"/.test(response)) {
                result = rdz.errors.CAPTCHA;
            } else if (/<div class=\"no-result-message\">|<li class=\"b_no\">/.test(response)) {
                result = 0;
            } else {
                let matches = response.match(/class=\"(?:ResultsCount|sb_count|rc)\"[^<]*[ >]([\d,\. &#160;]+)[\s<]/i);
                if (matches) {
                    result = parseInt(matches[1].replace(/&#160;| |,|\./g, ''));
                } else if (/>Some results have been removed<\/a/.test(response)) {
                    result = 0;
                }
            }
        }

        return {value: result};
    },
    /**
     *
     * @param response
     * @return {Object}
     */
    parsePRResult: function (response) {
        var result = {};
        if (response) {

            if (response.match(/getElementById\('captcha'\)|detected unusual traffic/))
                result = rdz.errors.CAPTCHA;
            else if (response == '<head><META HTTP-EQUIV="Refresh" CONTENT="0"></head>|<TITLE>302 Moved</TITLE>')
                result = rdz.errors.CAPTCHA;
            else {
                var ranksArray = response.match(/Rank_(.*?):(.*?):(\d+)/i);
                if (ranksArray) {
                    if (ranksArray[2] == 2)
                        result = 10;
                    else
                        result = +ranksArray[3];
                }
                else
                    result = rdz.errors.PARSE;
            }
        }
        else
            result = 0;
        return {value: result};
    },
    /**
     *
     * @param response
     * @return {Object}
     */
    parseIGResult: function (response) {
        let result = rdz.errors.PARSE;
        if (response) {
            if (/<title>Sorry\.\.\.<\/title>|<div[^>]+id="recaptcha"/.test(response)) {
                result = rdz.errors.CAPTCHA;
            } else if (/- did not match any (?:documents|news results)|Sorry, no information is available for the URL/.test(response)) {
                result = 0;
            } else {
                let matches = response.match(/<div[^>]*id="result-?[Ss]tats"[^>]*>([^<]+)</);
                if (matches && matches[1]) {
                    result = parseInt(matches[1].replace(/[^\d]+/g, ''));
                }
            }
        }
        return { value: result };
    },
    parseNewsXMLResult: function (response) {
        var result = {},
            xmlDoc,
            newsArray = [],
            newsItems,
            i,
            length;

        if (response) {
            xmlDoc = ( new window.DOMParser() ).parseFromString(response, "text/xml");
            newsItems = xmlDoc.getElementsByTagName('item');
            length = newsItems.length > 20 ? 20 : newsItems.length;

            for (i = 0; i < length; i += 1) {
                if (newsItems[i].getElementsByTagName('title')[0] &&
                    newsItems[i].getElementsByTagName('link')[0]) {
                    newsArray.push({
                        title: newsItems[i].getElementsByTagName('title')[0].textContent.
                            replace(/&#[\d\s]+;/g, '').
                            replace(/SEO Chat Forums  - /, ''),
                        link: newsItems[i].getElementsByTagName('link')[0].textContent
                    });
                }
            }
            result = newsArray;
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    },

    parseIYResult: function (response) {
        var result = rdz.errors.PARSE;

        if (response) {
            if (/form__captcha/.test(response) || /Доступ к нашему сервису временно запрещён/.test(response)) {
                result = rdz.errors.CAPTCHA;
            } else {
                var matches = response.match(/— Яндекс:([^]+?)\"/);
                if (matches) {
                    result = +window.rdz.utils.NumberParser(matches[1]);
                }
            }
        }

        return {value: result};
    },

    parseIYDResult: function (response) {
        // ru - русский     - мин назад - ч назад    - вчера   - позавчера
        // uk - украинский  - хв тому   - год тому   - вчора   - позавчора
        // kk - казахский   - мин бұрын - ч бұрын    - кеше    - алдыңғы күні
        // be - беларусский - хв. таму  - гадз. таму - учора   - пазаўчора
        // tt - татарский   - мин элек  - с элек     - кичә    - өченче көн
        var result = rdz.errors.PARSE;

        if (response) {
            if (/form__captcha/.test(response) || /Доступ к нашему сервису временно запрещён/.test(response)) {
                result = rdz.errors.CAPTCHA;
            } else if (/— Яндекс:[^\d]+?"/.test(response)) {
                result = 0;
            } else if (/<title>[<]*Яндекс[<]*<\/title>/.test(response)) {
                var dates = [], matches, strDate,
                searchRegEx = [
                  // fastest dates (more then day before yesterday)
                  /class="label label_color_blue label_font_own organic__label"[^>]*>([^<]+)<\//g,
                  // forum dates
                  /class="forum__info">(?:<b>)?([^>]+\d)<\//g,
                  /class="table__cell table__cell_overflow_nowrap"[^>]+>([^<]+)<\//g,
                  /class="[^"]+label_color_blue[^"]+"[^>]+><div[^>]+>([^<]+)<\//g
                ];

                //  class="label label_color_blue label_font_own organic__label">([^<]+)<\/

                for (var i = 0; i < searchRegEx.length; i++) {
                    matches = response.match(searchRegEx[i]);
                    if (matches) {
                        for (var j = 0; j < matches.length; j++) {
                            strDate = matches[j].match(/>([^>]+)</)[1].trim();
                            // if the date without the day
                            if (!/^\d/.test(strDate)) {
                                strDate = '1 ' + strDate;
                            }
                            dates.push(rdz.utils.stringToDate(strDate));
                        }
                    }
                }

                if (dates.length) {
                    result = dates.sort((a, b) => a < b ? 1 : (b < a ? -1 : 0))[0];
                } else {
                    result = [];
                }
            }
        }

        return {value: result};
    },

    parseImgYanResult: function(response) {
        var result = rdz.errors.PARSE;

        if (response) {
            if (/form__captcha/.test(response) || /Доступ к нашему сервису временно запрещён/.test(response)) {
                result = rdz.errors.CAPTCHA;
            } else {
                //var matches = response.match(/e.innerHTML="[^]+? ([^]+?)Яндекс\.Картин/);
                var matches = response.match(/:[\d\\uа-яА-Я]*\s([\dа-яА-Я\s—]+)Яндекс\./);
                if (matches) {
                    matches[1] = matches[1].replace(/\\u.{4}/g, '');
                    result = +window.rdz.utils.NumberParser(matches[1]);
                }
            }
        }

        return {value: result};
    },

    /**
     *
     * @param response
     * @return {Object}
     */
    parseProdvigatorResult: function (response) {
        var result,
            matches;

        if (response) {
            result = {};

//	    if (/class="plans"/.test(response)) {
//                result = rdz.errors.AUTHOR;
//            } else {
//	        matches = response.match(/fa-line-chart[^]+?size-h2">([^]+?)</i);
//	        if (matches) {
//		    result.visibility = +(matches[1].replace(/,/, '.').replace(/\s/g, ''));
//	        }
//	        matches = response.match(/fa-users[^]+?size-h2">([^]+?)</i);
//	        if (matches) {
//		    result.totalTraffic = +(matches[1].replace(/,/, '.').replace(/\s/g, ''));
//	        }
//	        matches = response.match(/fa-comments-o[^]+?size-h2">([^]+?)</i);
//	        if (matches) {
//		    result.searchPhrases = +(matches[1].replace(/,/, '.').replace(/\s/g, ''));
//	        }
//		
//	        if (!result.visibility ||
//		    !result.totalTraffic ||
//		    !result.searchPhrases) {
//		        result = rdz.errors.PARSE;
//	        }
//	    }

            if (/utilities\.png/.test(response)) {
                result = rdz.errors.AUTHOR;
            } else {
                result = +response;
            }

        } else {
            result = rdz.errors.PARSE;
        }

        return {value: result};
    }
};





