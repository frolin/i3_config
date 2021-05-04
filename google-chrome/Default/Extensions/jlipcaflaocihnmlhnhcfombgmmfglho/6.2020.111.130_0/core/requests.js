/** @namespace global scope for parameters' request*/
window.rdz.request = {};

window.rdz.request.rambler = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').rambler;
    this.serviceUrl = 'http://top100.rambler.ru/resStats/' + counterid + '?_id=' + counterid + '&_page=2&_subpage=2&_site=1&_datarange=0';
    //this.serviceUrl = 'http://top100.rambler.ru/resStats/' + counterid;
    this.source = this.domain;
    this.id = "rambler";
    //var regex0 = /<td>Уникальных.*\W?.*\W?.*?<\/td>/gmi;
    var regex1 = /<td align="right">\d+\s?\d+?\s?\d+?<\/td>/gmi;
    var regex2 = /<div class="links"><a href="http:\/\/(.*?)"/gmi;
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var glue = response.match(regex2),
                dm;

            if (glue) dm = glue[0].replace(/<div class="links"><a href="http:\/\/|www\.|"|\//g, '');
            if (dm == undefined) {
                result.value = rdz.errors.ACCESS;
            }
            else if (dm == this.domain) {
                var matches = {};
                matches[0] = response.match(regex1);
                if (!matches[0]) {
                    result.value = rdz.errors.ACCESS;
                }
                else {
                    var index = matches[0].length;
                    result.value = +matches[0][index - 2].replace(/\D/gm, '');
                }
            }
            else {
                result.value = rdz.errors.GLUED;
            }

        }
        else {
            result = rdz.errors.PARSE;
        }

        return {value: result};
    };

};

window.rdz.request.mail = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').mail;
    //this.serviceUrl = 'http://top.mail.ru/rating?id=' + counterid;
    this.serviceUrl = 'http://top.mail.ru/dynamics?what=visitors&period=day&data=on&ids=' + counterid;
    //console.log(this.serviceUrl);
    this.displayUrl = 'http://top.mail.ru/dynamics?what=visitors&period=day&data=on&ids=' + counterid + '&output=gif';
    this.source = this.domain;
    this.id = "mail";
    var regex = /<td class="r_col w50">\d+,?\d+?<\/td>/gmi;
    var regex2 = /<a href="http:\/\/(www.)?(.*)\/?">/;
    var regex0 = /<span class="nowrap ml[21]{1}0"><a href="http:\/\/?[^<]*>/;
    var regex1 = new RegExp(counterid + '<\/a>.*\" href=\"http:\/\/(www\.)?(.*)\"', 'g');
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var glue = response.match(regex0);

            if (glue) {
                glue = glue[0].match(regex2);
                //console.log(glue);
                if ((glue[1] && glue[1].replace("\/", '') == this.domain) || ( glue[2] && glue[2].replace("\/", '') == this.domain)) {
                    var matches = response.match(regex);
                    //var matches = regex.exec(response);
                    if (matches !== null && matches[1]) {
                        if (matches[1].indexOf('--') !== -1) {
                            result.value = rdz.errors.ACCESS;
                        }
                        else {
                            result.value = +matches[1].replace(/w50|\D/g, '');
                            result.image = 'http://top.mail.ru/dynamics.gif?what=visitors&amp;period=day&amp;ids=' + counterid + '&amp;%22%20border=%220%22%20alt=%22%D0%93%D1%80%D0%B0%D1%84%D0%B8%D0%BA%22';
                        }
                    }
                    else {
                        result.value = rdz.errors.ACCESS;
                    }
                }
                else {
                    result.value = rdz.errors.GLUED;
                }
            }
            else {
                result.value = rdz.errors.ACCESS;
            }
        }
        else {
            result = rdz.errors.PARSE;
        }

        return {value: result};
    };

};

window.rdz.request.liveinternet = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    //this.serviceUrl = 'http://counter.yadro.ru/values?site='+this.domain;
    //this.displayUrl = 'http://www.liveinternet.ru/stat/'+this.domain +'/index.html?lang=ru';
    this.serviceUrl = 'http://www.liveinternet.ru/stat/' + this.domain + '/index.html?lang=ru';
    this.source = this.domain;
    this.id = 'liveinternet';
    //var regex = /LI_day_vis = \d+/gmi;
    var regex = /За последние 24 часа на сайте .* ([0-9|,]+) .*/gmi;
    //var gl = new RegExp('<a href=\"http://(www.)?('+this.domain+')/\"','g');
    //var gl = /'.*'/gi;
    this.parseResponse = function (response) {
        var result = {},
            needxml = false;
        if (response) {
            var matches = {};
            if (response.indexOf('Ошибка: сайт с таким адресом не зарегистрирован') !== -1) {
                result.value = null;
            }
            else {
                if (response.indexOf('Для доступа к этой странице необходимо ввести пароль') == -1) {
                    //var status = gl.exec(response);
                    //if(status !== null ){
                    //if((status[1] && status[1].replace(/'/g,'') == this.domain) || (status[2] && status[2].replace(/'/g,'') == this.domain)){
                    if (response.indexOf(punycode.ToUnicode(this.domain)) !== -1) {
                        matches = response.match(regex);
                        result.value = matches == null ?
                            rdz.errors.ACCESS :
                            +matches[0].replace(/24 часа|\D/g, '');

                        result.image = 'http://www.liveinternet.ru/stat/' + this.domain + '/index.gif?graph=yes';
                    }
                    else {
                        result.value = rdz.errors.GLUED;
                    }
                    //}
                }
                else {
                    needxml = true;
                }

            }
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: needxml ? rdz.errors.PARSE : result, needxml: needxml};
    };
};


window.rdz.request.liveinternet_xml = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://counter.yadro.ru/values?site=' + this.domain;
    this.displayUrl = 'http://www.liveinternet.ru/stat/' + this.domain + '/index.html?lang=ru';
    this.source = this.domain;
    this.id = 'liveinternet';
    var regex = /LI_day_vis = \d+/gmi;
    var gl = /'.*'/gi;
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = {};
            if (response.indexOf('LI_error') !== -1) {
                result.value = response.indexOf('access denied') !== -1 ? rdz.errors.ACCESS : null;
            }
            else {
                var glue = response.match(gl);
                if (glue[0].replace(/'/g, '') == this.domain) {
                    matches = response.match(regex);
                    result.value = matches == null ? rdz.errors.ACCESS : +matches[0].replace(/\D/g, '');
                    result.image = 'http://counter.yadro.ru/logo;http://' + this.domain + '?27.3';

                }
                else {
                    result.value = rdz.errors.GLUED;
                }
            }
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};


window.rdz.request.hotlog = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').hotlog;
    this.serviceUrl = 'http://hotlog.ru/viewstat?id=' + counterid + '&attempt=1';
    this.source = this.domain;
    this.id = 'hotlog';
    var regex = /"BPC=.*?"/gmi;
    var regex1 = /\d+?\s?\d+?\s<\/span>/gmi;
    var regex2 = /attempt=\d+/gmi;
    this.parseResponse = function (response) {
        var result = {},
            attempt = {},
            att;
        if (response) {
            att = response.indexOf('document.cookie') !== -1;
            if (att === true) {
                let matches = {};
                matches = response.match(regex);
                attempt.cookie = matches[0].replace(/BPC=|"/g, '');
                matches = response.match(regex2);
                attempt.num = matches[0].replace(/\D/g, '');
            }
            else {
                if (response.indexOf('Владелец сайта закрыл эту статистику для просмотра') !== -1) {
                    result.value = rdz.errors.ACCESS;
                }
                else if (response.indexOf('Превышено количество запросов с вашего IP адреса') !== -1) {
                    result.value = rdz.errors.CAPTCHA;
                }
                else {
                    let matches = {};
                    matches = response.match(regex1);
                    if (matches !== null) {
                        result.value = +matches[1].replace(/\D/g, '');
                    }
                    else {
                        result.value = rdz.errors.ACCESS;
                    }
                }
            }
        }
        else {
            result = rdz.errors.PARSE;
        }
        if (att === true) {
            return {attempt: attempt};
        }
        else {
            return {value: result};
        }
    };
};

window.rdz.request.hotlog_attempt = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counters = this.model.get('counters'),
        att = this.model.att,
        counterid;
    if (counters !== null) {
        counterid = this.model.get('counters').hotlog;
    }
    this.serviceUrl = 'http://hotlog.ru/viewstat?id=' + counterid + '&attempt=' + att;
    this.source = this.domain;
    this.id = 'hotlog';
    var regex = /\d+?\s?\d+?\s<\/span>/gmi;
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            if (response.indexOf('Владелец сайта закрыл эту статистику для просмотра') !== -1) {
                result.value = rdz.errors.ACCESS;
            }
            else if (response.indexOf('Превышено количество запросов с вашего IP адреса') !== -1) {
                result = rdz.errors.CAPTCHA;
            }
            else {
                var matches = {};
                matches = response.match(regex);
                if (matches !== null) {
                    result.value = +matches[1].replace(/\D/g, '');
                }
                else {
                    result.value = rdz.errors.ACCESS;
                }
            }
        }
        else {
            result.value = rdz.errors.ACCESS;
        }
        return {value: result};
    };
};


window.rdz.request.bigmir = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').bigmir;
    this.serviceUrl = 'http://top.bigmir.net/report/' + counterid + '/';
    this.source = this.domain;
    this.id = 'bigmir';
    var regex = /<td>\d+\s?\d+<\/td>/gmi;
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = response.match(regex);
            result.value = matches !== null ? +matches[1].replace(/\D/g, '') : rdz.errors.ACCESS;
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};


window.rdz.request.i_ua = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').i_ua;
    this.serviceUrl = 'http://catalog.i.ua/stat/' + counterid + '/';
    this.source = this.domain;
    this.id = 'i_ua';
    var regex = /<td>\d+’\d+?<br>/gmi;
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = {};
            matches = response.match(regex);
            if (matches !== null) {
                result.value = +matches[1].replace(/\D/g, '');
            }
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};


window.rdz.request.ya_metric = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').ya_metric;
    this.serviceUrl = 'https://passport.yandex.ru/passport?mode=auth&from=metrika&retpath=http%3A%2F%2Fmetrika.yandex.ru%2Fstat%2F%3Fauthredirlevel%3D1364465013.1%26counter_id%3D' + counterid + '%26id%3D' + counterid;
    this.source = this.domain;
    this.id = 'ya_metric';
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            result.value = true;
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

/*
 window.rdz.request.spylog = function (url, DataRequest){
 DataRequest.apply(this, arguments);
 var counterid =  this.model.get('counters').spylog;
 this.serviceUrl = 'http://rating.openstat.ru/site/'+counterid+'/';
 this.source = this.domain;
 this.id = 'spylog';
 var regex = /<td class="osb.*?day.*?<\/td>/gmi,
 regex1 = new RegExp('"http:\/\/(www.)?(.*?)"','gmi'),
 regex2 = /<h1.*?\/h1>/;
 this.parseResponse = function (response){
 var result = {};
 if(response){
 var h = response.match(regex2);
 var glue = regex1.exec(h[0]);
 if(glue){
 glue[2] = glue[2].replace(/\//,'');
 if(glue[1]== this.domain || glue[2] == this.domain){
 var matches = {};
 matches = response.match(regex);
 matches !== null ? result.value = +matches[0].replace(/\D/g,'') : result.value = rdz.errors.ACCESS;
 }
 else {
 result.value = rdz.errors.GLUED;
 }
 }
 }
 else {
 result = rdz.errors.PARSE;
 }
 return {value:result};
 }
 };*/
window.rdz.request.openstat = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').openstat;
    this.serviceUrl = 'http://rating.openstat.ru/site/' + counterid + '/';
    this.source = this.domain;
    this.id = 'openstat';

    var regex = /<td class="osb.*?day.*?<\/td>/gmi,
        regex1 = new RegExp('"http:\/\/(www.)?(.*?)"', 'gmi'),
        regex2 = /<h1.*?\/h1>/;

    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var h = response.match(regex2);
            if (!h) {
                result.value = rdz.errors.ACCESS;
            } else {
                var glue = regex1.exec(h && h[0]);
                if (glue) {
                    glue[2] = glue[2].replace(/\//, '');
                    if (glue[1] == this.domain || glue[2] == this.domain) {
                        var matches = {};
                        matches = response.match(regex);
                        result.value = matches !== null ? +matches[0].replace(/\D/g, '') : rdz.errors.ACCESS;
                    } else {
                        result.value = rdz.errors.GLUED;
                    }
                }
            }
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};


window.rdz.request.topstat = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').topstat;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    this.serviceUrl = 'http://topstat.ru/rating/stat' + counterid + '-' + year + '-' + (date.getDate() - 4 >= 0 ? month : month - 1 < 1 ? 12 : month - 1 ) + '.html';
    this.source = this.domain;
    this.id = 'topstat';

    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = {};
            matches = response.match(/<td align="center" valign="middle">\d+<\/td>/gmi);
            result.value = (matches !== null && matches.length) ? +matches[matches.length - 4].replace(/\D/g, '') : rdz.errors.ACCESS;
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.mycounter = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').mycounter;
    this.serviceUrl = 'http://mycounter.ua/stats/index.php?id=' + counterid + '&show=common&date=yesterday';
    this.source = this.domain;
    this.id = 'mycounter';
    var regex = /<td>Хостов<\/td><td>.*?<\/td>/i;
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = {};
            matches = response.match(regex);
            result.value = matches !== null ? +matches[0].replace(/\D/g, '') : rdz.errors.ACCESS;
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};


window.rdz.request.log24 = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').log24;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate() - 1;
    var valtomonth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    this.serviceUrl = 'http://www.24log.ru/stat/stat.php?project_id=' + counterid + '&date=' + year + valtomonth[month] + day;
    this.source = this.domain;
    this.id = 'log24';
    var regex = /<td .*?> Хосты <\/td>\s*<td>.*?<\/td>/i;
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = {};
            matches = response.match(regex);
            result.value = matches !== null ? +matches[0].replace(/\D/g, '') : rdz.errors.ACCESS;
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.yandeg = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').yandeg;
    this.serviceUrl = 'http://yandeg.ru/stat/' + (this.uri.www ? 'www.' : '') + this.domain + '/poseshaemost.html';
    this.source = this.domain;
    this.id = 'yandeg';
    var regex = /<table id="last_comments">[^]+?<tr[^]+?<tr[^]+?<tr[^]+?<td[^]+?<td[^]+?>(.+)</i;
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = {};
            matches = response.match(regex);
            result.value = matches && matches[1] ? +matches[1].replace(/\D/g, '') : rdz.errors.ACCESS;
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.mystat = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').mystat;
    this.serviceUrl = 'http://mystat-in.net/stat/' + counterid + '/?period=1';
    this.source = this.domain;
    this.id = 'mystat';
    var regex0 = /<td align=right class=tsb><font size=\d+>\d+<\/td>/gmi;
    var regex1 = /graphics\/.*?"/gmi;
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = {};
            matches = response.match(regex0);
            result.value = matches !== null ? Math.floor(matches[1].replace(/<font size=\d+>|\D/g, '') / 7) : rdz.errors.ACCESS;

        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.hit_ua = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').hit_ua;
    this.serviceUrl = 'http://hit.ua/site_view/' + counterid;
    this.source = this.domain;
    this.id = 'hit_ua';
    var regex = /<td align=right>\d+,?\d+?<\/td>/gmi;
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = {};
            matches = response.match(regex);
            result.value = matches !== null ? +matches[1].replace(/\D/g, '') : rdz.errors.ACCESS;
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.uptolike = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').uptolike;
    this.serviceUrl = 'http://www.trustlink.ru/welcome/content_page/uptolike/';
    this.source = this.domain;
    this.id = 'uptolike';
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            result.value = true;
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.sape = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').sape;
    this.serviceUrl = 'http://www.acint.net/';
    this.source = this.domain;
    this.id = 'sape';
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            result.value = true;
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.IY = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.yandex = rdz.utils.getRandomYandex();
    //this.serviceUrl = 'https://yandex.ru/search/?lr=213&text=url%3Awww.' + this.domain + '%2F*%20|%20url%3A' + this.domain + '%2F*%20|%20url%3A' + this.domain + '%20|%20url%3Awww.' + this.domain;
    this.serviceUrl = 'https://yandex.ru/search/?lr=213&text=host:www.' + this.domain + ' | host:' + this.domain;
    this.source = this.domain;
    this.id = 'IY';
    this.parseResponse = window.rdz.parsers.parseIYResult;
};

window.rdz.request.IYD = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.yandex = rdz.utils.getRandomYandex();
    //this.serviceUrl = 'https://yandex.ru/search/?lr=213&how=tm&text=url%3Awww.' + this.domain + '%2F*%20|%20url%3A' + this.domain + '%2F*%20|%20url%3A' + this.domain + '%20|%20url%3Awww.' + this.domain;
    this.serviceUrl = 'https://yandex.ru/search/?lr=213&how=tm&within=6&text=host:www.' + this.domain + ' | host:' + this.domain;
    this.source = this.domain;
    this.id = 'IYD';
    this.parseResponse = window.rdz.parsers.parseIYDResult;
};

window.rdz.request.IYDP = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.yandex = rdz.utils.getRandomYandex();
    var encodedPage = encodeURIComponent(this.page.replace(/^www\./, ''));
    this.serviceUrl = 'https://yandex.ru/search/?lr=213&how=tm&within=6&text=url%3Awww.' + encodedPage + '%20|%20url%3A' + encodedPage;
    this.source = this.page;
    this.id = 'IYDP';
    this.parseResponse = window.rdz.parsers.parseIYDResult;
};


window.rdz.request.YT = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://bar-navig.yandex.ru/u?ver=2&url=http://' + this.domain + '&show=1';
    this.execute = function () {
        return false;
    };
};


window.rdz.request.YR = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://bar-navig.yandex.ru/u?ver=2&url=http://' + this.domain + '&show=1';
    this.execute = function () {
        return false;
    };
};


window.rdz.request.IYP = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var encodedPage = encodeURIComponent(this.page.replace(/^www\./, ''));
    this.serviceUrl = 'https://yandex.ru/search/?lr=213&text=url%3Awww.' + encodedPage + '%20|%20url%3A' + encodedPage;
    this.source = this.page;
    this.id = 'IYP';

    this.parseResponse = function (response) {
        var result = rdz.errors.PARSE;

        if (response) {
            if (/form__captcha/.test(response) || /Доступ к нашему сервису временно запрещён/.test(response)) {
                result = rdz.errors.CAPTCHA;
            } else {
                //this.serviceUrl = this.serviceUrl.replace(/^http:\/\/[^\/]*/, 'http://yandex.ru');
                //var matches = response.match(/Искомая комбинация слов нигде не встречается\./);
                var matches = /class="b-error/.test(response) ||
                    /<title>404<\/title>/.test(response) ||
                    /<title>[^<>]*?ничего не найдено[^<>]*?<\/title>/i.test(response) ||
                    />По вашему запросу ничего не нашлось<\/div>/.test(response);
                if (matches) {
                    result = 0;
                } else if (/<title>[<]*Яндекс[<]*<\/title>/.test(response)) {
                    var matched = {};
                    matched.trueDomain = response.match(/<a class="link link_theme_normal organic__url[^"]+".+?href="https?:\/\/([^"]+)"/);
                    if (matched.trueDomain && matched.trueDomain[1]) matched.trueDomain = matched.trueDomain[1];

                    matches = response.match(/<a [^<>]*href="(https:\/\/hghltd\.yandex\.net\/yandbtm[^"<>]*)"[^<>]*>/);
                    if (matches && matches[1]) {
                        matched.cacheLink = matches[1];
                        matched.cacheLink = matched.cacheLink.replace(/&amp;/g, "&");
                        result = matched;
                    } else {
                        // matched.cacheLink = this.serviceUrl;
                        result = /— Яндекс:[^\d]+?"/.test(response) ? 0 : 1;
                    }
                }
            }
        }

        return {value: result};
    };
};


window.rdz.request.IYPCache = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    //this.serviceUrl = 'http://hghltd.yandex.net/yandbtm?&url=' + encodeURIComponent(url);
    var v = this.model.get('value');
    if (!(this.serviceUrl = v && v.IYP.cacheLink || null)) {
        var noWWW = rdz.utils.noWWWUri(this.page);
        this.serviceUrl = 'https://' + rdz.utils.getRandomYandex() + '/msearch?text=(url:www.' + noWWW.replace(/\/$/, '') + ' | url:' + noWWW.replace(/\/$/, '') + ")";
    }
    this.source = this.page;
    this.id = 'IYPCache';
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = response.match(/\.date = '(\d{2})\.(\d{2})\.(\d{4}) \[(\d{2}):(\d{2}):(\d{2})\]';/);

            if (matches !== null) {
                var moscowDate = +new Date(matches[3], matches[2] - 1, matches[1], matches[4], matches[5], matches[6]);
                var timezoneOffset = (new Date()).getTimezoneOffset();
                var localDate = moscowDate - 4 * 60 * 60 * 1000 - timezoneOffset * 60 * 1000;
                result = localDate;
            } else {
                result = 0;
            }

        }
        else
            result = rdz.errors.PARSE;
        return {value: result};
    };
};

window.rdz.request.IG = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.google' + this.model.get('extra').domain_zone.active + '/search?hl=en&q=site:' + (this.uri.www ? 'www.' : '') + this.domain + '&btnG=Google+Search';
    this.source = (this.uri.www ? 'www.' : '') + this.domain;
    this.id = 'IG';
    this.parseResponse = rdz.parsers.parseIGResult;
};

window.rdz.request.MIG = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.google' + this.model.get('extra').domain_zone.active + '/search?hl=en&q=site:' + (this.uri.www ? 'www.' : '') + this.domain + '%2F%26&btnG=Google+Search';
    this.source = (this.uri.www ? 'www.' : '') + this.domain;
    this.id = 'MIG';
    this.parseResponse = rdz.parsers.parseIGResult;
};

window.rdz.request.IGP = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.google.com/search?hl=en&q=site:' + encodeURIComponent(this.uri.protocol + this.page) + '&btnG=Google+Search';
    this.source = this.page;
    this.id = 'IGP';
    this.parseResponse = function (response) {
        var result = rdz.errors.PARSE;
        if (response) {
            if (/<title>Sorry\.\.\.<\/title>|<div[^>]+id="recaptcha"/.test(response)) {
                result = rdz.errors.CAPTCHA;
            } else if (/- did not match any (?:documents|news results)|Sorry, no information is available for the URL/.test(response)) {
                result = 0;
            } else {
                let matches = response.match(/<div[^>]*id="result-?[Ss]tats"[^>]*>([^<]+)</);
                if (matches && matches[1] && parseInt(matches[1].replace(/[^\d]+/g, '')) > 0) {
                    let urlClean = /(^<.*)?https?:\/\/|#.*$|\/$/g,
                        page = this.page.replace(urlClean, ''),
                        urls = response.match(/<div class="r"><a href="(https?:\/\/w*\.?[^\"]+)/g) ||
                            response.match(/<h3 class="r"><a[^>]*href="\/url\?q=(https?:\/\/w*\.?[^\"&]+)/g) ||
                            response.match(/<div class="rc"[^\/]*<a[^>]*href="(https?:\/\/w*\.?[^\"&]+)/g) || [];

                    result = urls.find(url => page === url.replace(urlClean, '')) ? 1 : 0;
                } else if (!response.includes('id="rso"')) {
                    result = 0;
                }
            }
        }
        return { value: result };
    };
};

window.rdz.request.IGPCache = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://webcache.googleusercontent.com/search?q=cache:' + encodeURIComponent(this.uri.protocol + this.page) + '&hl=en&strip=1&vwsrc=0';
    this.source = this.page;
    this.id = 'IGPCache';
    this.parseResponse = function (response) {
        let result = rdz.errors.PARSE;
        if (response) {
            let matches = response.match(/It is a snapshot of the page as it appeared on\s*([^\.]{1,})/);
            result = matches && matches[1] ? Date.parse(matches[1]) : 0;
        }
        return { value: result };
    };
};

window.rdz.request.SQI = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://webmaster.yandex.ru/siteinfo/?host=http%3A%2F%2F' + this.domain;
    this.source = this.domain;
    this.id = "SQI";
    this.parseResponse = function (response) {
        let result = rdz.errors.PARSE;
        if (response) {
            if (response.includes('<title>Ой!</title>') || response.includes('yandex.ru/captchaimg')) {
                result = rdz.errors.CAPTCHA;
                return { value: result };
            }

            let data = response.match(/\.data\s*=\s*(\{.+\})/);
            if (data) {
                data = JSON.parse(data[1]).quality;
                let sqi = data.achievements.find(x => x.type === 'SQI');
                if (data.hostName && sqi) {
                    let link = data.hostName.replace(/https?:\/\/|www\./g, '');
                    result = link === this.domain ? +sqi.sqi : rdz.errors.GLUED;
                }
            }
        }

        return { value: result };
    };
};

window.rdz.request.TYC = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://webmaster.yandex.ru/tic/' + encodeURIComponent(this.domain) + '/';
    this.source = this.domain;
    this.id = "TYC";
    this.parseResponse = function (response) {
        let result = { TYC: rdz.errors.PARSE };
        if (response) {
            if (response.includes('<title>Ой!</title>') || response.includes('yandex.ru/captchaimg')) {
                result.TYC = rdz.errors.CAPTCHA;
                return { value: result };
            }

            let matches = response.match(/<div\s+class="tic__text"[^]+?([\d\s]+)<\/div/);
            if (matches.length) result.TYC = +matches[1].replace(/\s+/g, '');
        }

        return { value: result };
    };
};
window.rdz.request.YaCatalog = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://webmaster.yandex.ru/tic/' + encodeURIComponent(this.domain) + '/';
    this.execute = function () {
        return false;
    };
};
window.rdz.request.YaBar = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://bar-navig.yandex.ru/u?ver=2&url=' + encodeURIComponent('http://' + this.domain) + '&show=1';
    this.source = this.domain;
    this.id = "YaBar";
    this.parseResponse = function (response, request) {
        var result = {};
        if (response) {
            var doc = request.responseXML,
                textinfo = '',
                tags = doc.getElementsByTagName('url'),
                trueUri = tags && tags[0].getAttribute('domain'),
                value, rang;

            if (rdz.utils.noWWWUri(trueUri).replace('https://', '') != rdz.utils.noWWWUri(this.domain))
                result.TYC = rdz.errors.GLUED;
            else {
                tags = doc.getElementsByTagName('tcy');
                value = Number(tags[0].getAttribute('value'), 10);
                rang = Number(tags[0].getAttribute('rang'), 10);

                result.TYC = (rang === 1 && value === 0) ? rdz.errors.AGS : value;
            }
            tags = doc.getElementsByTagName('textinfo');
            if (tags.length)
                textinfo = tags[0].textContent;
            tags = doc.getElementsByTagName('topic');
            if (tags.length && result.TYC !== rdz.errors.GLUED)
                result.topic = tags[0].getAttribute('title').match(/Тема:\s*(.+)/)[1];
            else
                result.topic = false;
            if (textinfo) {
                var match = textinfo.match(/Регион:\s*(.+)/);
                result.region = match && result.TYC !== rdz.errors.GLUED ? match[1] : false;
                match = textinfo.match(/Источник:\s*(.+)/);
                result.source = match ? match[1] : false;
                match = textinfo.match(/Сектор:\s*(.+)/);
                result.sector = match ? match[1] : false;
                match = textinfo.match(/Адресат:\s*(.+)/);
                result.address = match ? match[1] : false;
                match = textinfo.match(/Жанр:\s*(.+)/);
                result.genre = match ? match[1] : false;
            }

        }
        return {value: result};
    };
};


window.rdz.request.PR = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    if (url != null)
        this.serviceUrl = 'http://toolbarqueries.google.com/tbr?features=Rank&sourceid=navclient-ff&client=navclient-auto-ff&ch=8' + rdz.utils.getHash(url) + '&q=' + encodeURIComponent('info:' + url);
    this.source = this.page;
    this.id = "PR";
    this.parseResponse = rdz.parsers.parsePRResult;
};
window.rdz.request.PR.instance = new window.rdz.request.PR();


window.rdz.request.PRMain = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = "PRMain";

    //coping PR from domain to PRMain for page (to don't send request)
    var main_page = rdz.cache.get(this.domain + '/') || rdz.cache.get('www.' + this.domain + '/');
    if (main_page && typeof main_page.PR === 'number') {
        this.caching(main_page.PR);
    }

    if (url) {
        var main = url.match(/^[^:]+:\/\/[^\/]+/)[0];
        this.serviceUrl = 'http://toolbarqueries.google.com/tbr?features=Rank&sourceid=navclient-ff&client=navclient-auto-ff&ch=8' + rdz.utils.getHash(main) + '&q=' + encodeURIComponent('info:' + main);
    }

};
window.rdz.request.PRMain.prototype = window.rdz.request.PR.instance;


window.rdz.request.PRg = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.google.com/search?hl=en&q=' + encodeURIComponent('info:' + url);
    this.source = this.page;
    this.id = "PRg";
    this.parseResponse = function (response) {
        var result = {};
        if (response.match(/Sorry, no information is available for the URL/))
            result = false;
        else if (response.match(/getElementById\('captcha'\)|detected unusual traffic/) ||
            response.match(/<title>Sorry/))
            result = rdz.errors.CAPTCHA;
        else if (response.indexOf('id="search"') > -1) {
            var matches = response.match('<cite[^]*?>([^]+?)</cite');
            if (matches !== null && matches[1]) {
                if (matches[1].indexOf(this.domain) === -1)
                    result = matches[1];
                else
                    result = false;
            } else
                result = rdz.errors.PARSE;
        }
        else
            result = rdz.errors.PARSE;
        return {value: result};
    };
};
window.rdz.request.PRg.instance = new window.rdz.request.PRg();


window.rdz.request.PRgMain = function (url, DataRequest) {
    DataRequest.apply(this, arguments);

    if (url)
        url = url.replace(/([^:]+:\/\/[^\/]+\/?).*/, '$1');
    /* http://www.okmpoligraf.ru/print/  -> http://www.okmpoligraf.ru/  */
    this.serviceUrl = 'https://www.google.com/search?hl=en&q=' + encodeURIComponent('info:' + url);
    this.id = "PRgMain";
    this.source = this.page;
};
window.rdz.request.PRgMain.prototype = window.rdz.request.PRg.instance;


window.rdz.request.Dmoz = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://curlie.org/search?q=' + encodeURIComponent(this.domain);
    this.source = this.domain;
    this.id = "Dmoz";
    this.parseResponse = function (response) {
      var result = rdz.errors.PARSE;

    if (response) {
      if (/<section class="cat-list-section results">\s+<\/div>/.test(response)) {
        result = false;
      } else {
        let matches = response.match(/class="site-url">[^>]+href=['"]([^'"]+)[^]+?class="site-ref">[^>]+href=['"]([^'"]+)[^]+?/g);
        if (matches.length) {
          let domainRE = new RegExp('https?://(www\\.)?' + this.domain + '/$'),
              hrefRE = /href=['"]([^'"]+)/g;

          for (let i = 0, hrefs; i < matches.length; i++) {
            hrefs = matches[i].match(hrefRE);
            if (domainRE.test(hrefs[0])) {
              result = decodeURIComponent(hrefs[1].replace(/href=['"]/, ''));
              break;
            }
          }

          if (result === rdz.errors.PARSE) result = false;
        }
      }
    }

    return {value: result};
    };
};


window.rdz.request.WA = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://web.archive.org/cdx/search/cdx?url=' + encodeURIComponent(this.domain) + '&matchType=host&output=json&limit=1';
    this.displayUrl = 'http://wayback.archive.org/web/*/http://' + encodeURIComponent(this.domain);
    this.source = this.domain;
    this.id = "WA";
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            if (response.indexOf('<form action="Captcha" method="get">') !== -1)
                result = rdz.errors.CAPTCHA;
            else if (response.indexOf('<title>Sorry') !== -1)
                result = rdz.errors.CAPTCHA;
            else if (response.indexOf('<title>Приносим свои извинения') !== -1)
                result = rdz.errors.CAPTCHA;
            else if (response.match(/Sorry, no matches\.|Robots.txt Query Exclusion./i))
                result = 0;
            else {
                var matches = response.match(/"(\d+)"/);
                if (matches) {
                    var date = matches[1];
                    result = +new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2));
                } else {
                    result = 0;
                }
            }
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};


window.rdz.request.SeoM = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://mozbar.moz.com/bartender/url-metrics';
    this.displayUrl = 'https://analytics.moz.com/pro/link-explorer/overview?site=' + encodeURIComponent(this.page) + '&target=page&src=mb';
    this.source = this.page;
    this.id = "SeoM";

    this.xhr_type = 'POST';
    this.header = [
        //['Accept', 'application/json'],
        ['Content-type', 'application/json; charset=utf-8']
    ];
    this.xhr_body = JSON.stringify([this.page]);
    this.parseResponse = function (response, request) {
        let result = rdz.errors.PARSE;
        if (request.status !== 200) {
            result = rdz.errors.AUTHOR;
        } else if (response) {
            let values = JSON.parse(response || [])[0];
            result = {
                page: +values.upa,
                domain: +values.pda
            };
        }
        return {value: result};
    };
};

window.rdz.request.MozRank = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = "MozRank";
    this.displayUrl = 'http://www.opensiteexplorer.org/links?site=' + encodeURIComponent(this.page);
};
window.rdz.request.MozRank.prototype = window.rdz.request.SeoM.instance;


window.rdz.request.MozRankCache = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var v = this.model.get('value');

    if (v !== null) {
        this.serviceUrl = v.MozRank.cacheLink;

    }
    this.source = this.page;
    this.id = "MozRankCache";
    this.parseResponse = function (response) {
        var result = {};
        var values = JSON.parse(response || null);
        if (response && values && values.status !== "429") {
            result.linkp = values.umrp === 0 ? 0 : (values.umrp).toFixed(2);
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };

};

window.rdz.request.BI = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.bing.com/search?q=linkfromdomain:' + this.domain;
    this.source = this.domain;
    this.id = "BI";
    this.parseResponse = rdz.parsers.parseBingResult;
};

//window.rdz.request.Ahrefs = function (url, DataRequest) {
//    DataRequest.apply(this, arguments);
//    
//    var hash = this.model.get('value') ? this.model.get('value')["AhrefsAJAXKey"]["ajax_key"] : null;
//    this.serviceUrl = 'https://ahrefs.com/site-explorer/get_overview_text_data.php?data_type=refdomains_stats&hash=' + hash;
//    this.displayUrl = 'https://ahrefs.com/site-explorer/overview/domain/' + (/^https?:\/\/www/.test(this.url) ? 'www.' : '') + encodeURIComponent(this.domain);
//    this.source = this.domain;
//    this.id = "Ahrefs";
//
//    this.parseResponse = function (response) {
// 
//        var result = {};
//        if (response) {
//          var data = JSON.parse(response);
//          result.referring_domains = data.RefDomainsStats.DomainsStatsDomains; 
//        }
//        else {
//            result = rdz.errors.PARSE;
//        }
//
//        return {value: result};
//    }
//};
//
//window.rdz.request.AhrefsGraph = function (url, DataRequest) {
//    DataRequest.apply(this, arguments);
//    
//    var hash = this.model.get('value') ? this.model.get('value')["AhrefsAJAXKey"]["ajax_key"] : null;
//    this.serviceUrl = 'https://ahrefs.com/site-explorer/get_overview_charts_data.php?chart_type=referring_domains_chart&hash=' + hash;
//    this.source = this.domain;
//    this.id = "AhrefsGraph";
//
//    this.parseResponse = function (response) {
// 
//        var result = {};
//        if (response) {
//            var data = JSON.parse(response);
//            var dataChart = {
//                data: [],
//                minValue: '9e20',
//                maxValue: 0,
//                chtt: encodeURIComponent(AppLocale.get("bar.tooltips.Ahrefs")) // graph title
//	    };
//            for (var l = data.Series[0].data.length, t = data.pointStart, i = 0; i < l; i++) {
//		dataChart.data.push([t + (i * 86400000), data.Series[0].data[i]]);
//		if (data.Series[0].data[i] > dataChart.maxValue) {
//                    dataChart.maxValue = data.Series[0].data[i];
//		};
//		if (data.Series[0].data[i] < dataChart.minValue) {
//                    dataChart.minValue = data.Series[0].data[i];
//		};
//            };          
//          
//            result.img_url = rdz.utils.createChartURL(dataChart);
//        } else {
//            result = rdz.errors.PARSE;
//        }
//
//        return {value: result};
//    }
//};
//
//window.rdz.request.AhrefsAJAXKey = function (url, DataRequest) {
//    DataRequest.apply(this, arguments);
//    
//    this.serviceUrl = 'https://ahrefs.com/site-explorer/overview/domain/' + (/^https?:\/\/www/.test(this.url) ? 'www.' : '') + encodeURIComponent(this.domain);
//    this.source = this.domain;
//    this.id = "AhrefsAJAXKey";
//
//    this.parseResponse = function (response) {
//        var result = {},
//            matches;
//            
//        if (response) {
//            matches = response.match(/hash: '([\d\S]*)'\},/);
//            if (matches !== null) {
//		result.ajax_key = matches[1];
//            }
//        } else {
//            result = rdz.errors.PARSE;
//        }
//        
//        return {value:result};
//    }
//};

window.rdz.request.AhrefsTB = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://ahrefs.com/api/v3/toolbar/header?target=' + encodeURIComponent(url);
    this.displayUrl = 'https://ahrefs.com/site-explorer/overview/v2/subdomains/fresh?target=' + url;

    this.source = this.page;
    this.id = "AhrefsPage";
    this.parseResponse = function (response) {
        var result = rdz.errors.PARSE;
        if (response.includes('Sign in to Ahrefs') || response === '["Error","Unauthorized"]') {
            result = rdz.errors.AUTHOR;
        } else if (response.includes('We are currently updating our service')) {
            result = -2;//result = -6;
        } else {
            let data = JSON.parse(response);
            if (data.page) {
                let page = data.page.stats,
                    domain = data.root_domain.stats;
                result = {
                    Page: {
                        ar: page.url_rating,    // UR
                        bl: page.backlinks,     // BL
                        rd: page.refdomains     // RD
                    },
                    Domain: {
                        dr: domain.domain_rating,   // DR
                        bl: domain.backlinks,       // BL
                        rd: domain.refdomains       // RD
                    }
                };
            }
        }
        return { value: result };
    };
};

window.rdz.request.AhrefsCookies = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://ahrefs.com/toolbar/script.js?source=example.com&v=0.2.17&_=' + (+new Date());
    this.source = this.page;
    this.id = "AhrefsCookies";
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            result.status = 'ok';
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.AhrefsPage = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://ahrefs.com/toolbar/header/?target=' + url + "&Version=" + (new Date()).getTime() + Math.floor(Math.random() * 1000000);
    this.displayUrl = 'https://ahrefs.com/site-explorer/overview/v2/subdomains/fresh?target=' + url;

    this.source = this.page;
    this.id = "AhrefsPage";
    this.parseResponse = function (response) {
      var result = rdz.errors.PARSE;
      if (response) {
        if (response.includes('Please login')) {
          result = rdz.errors.AUTHOR;
        } else if (response.includes('We are currently updating our service')) {
          result = -2;//result = -6;
        } else {
          var overview = response.match(/overview">[^]+?<\/div/);

          if (overview) {
            overview = overview[0];

            result = {
              ar: overview.match(/UR[^]*?<cite>([^<]+)/) [1],
              bl: overview.match(/BL[^]*?<cite>([^<]+)/) [1],
              rd: overview.match(/RD[^]*?<cite>([^<]+)/) [1]
            };

            for (var p in result) {
              result[p] = +result[p].replace(/,/, '.').replace(/&nbsp;/, '').replace(/K/, 'e3').replace(/M/, 'e6').replace(/B/, 'e9');
            }
          }
        }
      }
      return {value: result};
    };
};

window.rdz.request.AhrefsDomain = function (url, DataRequest) {
    rdz.request.AhrefsPage.apply(this, arguments);
    this.source = this.domain;
    this.id = "AhrefsDomain";
    this.parseResponse = function (response) {
      var result = rdz.errors.PARSE;
      if (response) {
        if (response.includes('Please login')) {
          result = rdz.errors.AUTHOR;
        } else if (response.includes('We are currently updating our service')) {
          result = -6;
        } else {
          var overview = response.match(/overview--domain">[^]+?<\/div/);

          if (overview) {
            overview = overview[0];

            result = {
              dr: overview.match(/DR[^]*?<cite>([^<]+)/) [1],
              bl: overview.match(/BL[^]*?<cite>([^<]+)/) [1],
              rd: overview.match(/RD[^]*?<cite>([^<]+)/) [1]
            };

            for (var p in result) {
              result[p] = +result[p].replace(/,/, '.').replace(/&nbsp;/, '').replace(/K/, 'e3').replace(/M/, 'e6').replace(/B/, 'e9');
            }
          }
        }
      }
      return {value: result};
    };
};

window.rdz.request.SemRush = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var sz = this.model.get('extra').semrush_zone;
    //this.serviceUrl = 'https://www.google' + (sz && sz.active) + '/search?hl=en&q=site:' + encodeURIComponent(this.domain) + '&btnG=Search';
    
    //this.serviceUrl = 'http://publicapi.semrush.com/recipdonor/' + (AppLocale.get_locale_str() === 'ru' ? 'ru' : 'com') + '/info.php?url=http://' + this.domain;
    //this.displayUrl = AppLocale.get_locale_str() === 'ru' ? 'http://ru.semrush.com/ru/info/' + this.domain +
    //    '+%28by+organic%29?db=ru&ref=911719281' : 'http://www.semrush.com/info/'+ this.domain + '?ref=911719281';
    var zone = sz.active === 'com' ? 'us' : sz.active;
    this.serviceUrl = 'https://seoquake.publicapi.semrush.com/' + zone + '/info.php?url=http://' + encodeURIComponent(this.domain);
    this.displayUrl = 'https://www.semrush.com/' + zone + '/info/' + encodeURIComponent(this.domain) + '?ref=911719281';
        
    this.source = this.domain;
    this.id = "SemRush";

    var rank = /<rank>\d+<\/rank>/g;
    var traffic = /<traffic>\d+<\/traffic>/g;
    var costs = /<costs>\d+<\/costs>/g;

    this.parseResponse = function (response) {
        var result = {};
        if (response) {

            if (response.indexOf('notfound') !== -1) {
                result = 0;
            }
            else {
                result.rank = +(response.match(rank) || ['0'])[0].replace(/<.*?>/g, '');
                result.traffic = +(response.match(traffic) || ['0'])[0].replace(/<.*?>/g, '');
                result.costs = +(response.match(costs) || ['0'])[0].replace(/<.*?>/g, '');
            }
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.BackG = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.google.com/search?hl=en&q=link:' + (this.uri.www ? 'www.' : '') + this.domain + '&btnG=Google+Search';
    this.source = (this.uri.www ? 'www.' : '') + this.domain;
    this.id = 'BackG';
    this.parseResponse = rdz.parsers.parseIGResult;
};

window.rdz.request.BackBing = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.bing.com/search?q=inbody:' + this.domain + '+-site:' + this.domain;
    this.source = this.domain;
    this.id = "BackBing";
    this.parseResponse = rdz.parsers.parseBingResult;
};


window.rdz.request.IBing = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.bing.com/search?q=site:' + this.domain;
    this.source = this.domain;
    this.id = "IBing";
    this.parseResponse = rdz.parsers.parseBingResult;
};

window.rdz.request.Alexa = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.alexa.com/minisiteinfo/' + this.domain + '?offset=5&version=alxf_20150317';
    this.displayUrl = 'https://www.alexa.com/siteinfo/' + this.domain;
    this.source = this.domain;
    this.id = "Alexa";
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = response.match(/alexa.com\/siteinfo\/(.+?)#/),
                digitRE = /\D+/g;

            if (matches && (matches[1] !== this.domain)) {
                result.popularity = rdz.errors.GLUED;
            } else {
                matches = response.match(/<img[^>]+?alt="Global"[^]+?>([^]+?)<\/a>/);
                if (matches && matches[1]) {
                    result.popularity = /No Data/.test(matches[1]) ? 0 : parseInt(matches[1].replace(digitRE, ''));

                    // Regional Alexa rank
                    matches = response.match(/<img[^>]+alt="[^"]+Flag"\/>([^]+?)<\/a>[^]+?>(\w+)<\/a>/);
                    if (matches && matches[1] && matches[2]) {
                        result.rank = parseInt(matches[1].replace(digitRE, ''));
                        result.code = matches[2];
                    }
                } else {
                    result.popularity = rdz.errors.PARSE;
                }
            }
            result.value = result.popularity;
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.BackA = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.alexa.com/minisiteinfo/' + this.domain + '?offset=5&version=alxf_20150317';
    this.displayUrl = 'https://www.alexa.com/linksin/' + this.domain;
    this.source = this.domain;
    this.id = "BackA";
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var matches = response.match(/alexa.com\/siteinfo\/(.+?)#/),
                digitRE = /\D+/g;

            if (matches && (matches[1] !== this.domain)) {
                result = rdz.errors.GLUED;
            } else {
                matches = response.match(/">([^>]+)(<\/a>\s)?<\/div>\s<div class="label">Sites Linking In/);
                if (matches && matches[1]) {
                    result = /No Data/.test(matches[1]) ? 0 : parseInt(matches[1].replace(digitRE, ''));
                } else {
                    result = rdz.errors.PARSE;
                }
            }
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.BY = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.yandex = rdz.utils.getRandomYandex();
    this.serviceUrl = 'https://yandex.ru/search/?lr=213&text=%28%22*.' + this.domain + '%22%29%20~~%20site%3A' + this.domain;
    this.source = this.domain;
    this.id = 'BY';
    this.parseResponse = window.rdz.parsers.parseIYResult;
};


window.rdz.request.YaBlogs = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://blogs.' + rdz.utils.getRandomYandex() + '/top?username=' + encodeURI(rdz.utils.domainFromUri(url).domain);
    this.source = this.domain;
    this.id = "YaBlogs";
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            this.serviceUrl = this.serviceUrl.replace(/^http:\/\/[^\/]*/, 'http://blogs.yandex.ru');
            if (response.match(/>Извините, по Вашему запросу ничего не найдено<\/div>/)) {
                result = {authority: null, readers: null};
            } else {
                var matches = response.match(/<tr class="found"[\s\S]+?<a[\s\S]+?href="([\s\S]+?)"[\s\S]+?class="container"[\s\S]+?<div class="int">(\d+?)<\/div>[\s\S]+?<div class="int">(\d+?)<\/div>[\s\S]+?<\/tr>/);
                if (matches && rdz.utils.domainFromUri(matches[1]).domain != rdz.utils.domainFromUri(url).domain) {
                    result = {
                        authority: rdz.errors.GLUED,
                        readers: rdz.errors.GLUED,
                        glued_with: rdz.utils.domainFromUri(matches[1]).domain
                    };
                }
                else if (matches && matches[1] && matches[2] && matches[3]) {
                    result = {authority: Number(matches[2], 10), readers: Number(matches[3], 10)};
                }
                else
                    result = {authority: rdz.errors.PARSE, readers: rdz.errors.PARSE};
            }
        } else
            result = {authority: rdz.errors.PARSE, readers: rdz.errors.PARSE};
        return {value: result};
    };
};

/*
 window.rdz.request.Majestic = function (url, DataRequest) {
 DataRequest.apply(this, arguments);
 this.serviceUrl = 'http://api.majesticseo.com/getdomainstats.php?apikey=2F85C7EF65&url=' + encodeURIComponent('http://' + this.domain + '/');
 this.displayUrl = 'http://www.majesticseo.com/reports/site-explorer/summary/' + this.domain + '?oq=' + encodeURIComponent(this.domain + '/') + '&IndexDataSource=H';
 this.source = this.domain;

 this.id = "Majestic";
 this.parseResponse = function (response) {
 var result = {};
 if (response === '')
 result = 0;
 else if (response) {
 var matches = response.match(new RegExp('StatsRefDomains="([\\S]+?)"'));
 if (matches[1])
 result = Number(matches[1], 10);
 if (response.match(new RegExp('StatsForDomain="([\\S]+?)"'))[1] != this.domain)
 result = rdz.errors.GLUED;
 } else
 result = rdz.errors.PARSE;
 return {value:result};
 };
 };

 window.rdz.request.MajesticData = function (url, DataRequest){
 */

window.rdz.request.Majestic = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    if (this.domain) {
        var flg; // 0 if domain 1 if subdomain
        var subdomen;
        var domorsub = window.rdz.utils.SubstractDomainName(this.domain);
        flg = this.domain !== domorsub[0] + domorsub[1] ? 1 : 0;

        subdomen = flg == 1 ? this.domain : 'www.' + this.domain;
        if ((this.page.indexOf('www.') !== -1)) {
            flg = 1;
            subdomen = 'www.' + this.domain;
        }
        this.serviceUrl = 'http://simpleapi.majesticseo.com/sapi/GetBacklinkStats?sak=SL3CKCME3Y&datasource=Fresh&items=3&item0=' +
        encodeURIComponent(this.url) + '&item1=' + subdomen + '&item2=' + this.domain;
    }
    this.displayUrl = 'http://www.majesticseo.com/reports/site-explorer?q=' + this.domain + '/';
    this.source = this.page;
    this.id = "Majestic";
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var value = JSON.parse(response || null);
            if (value) {
                var urlData = value.Data[0];
                var subDomainData = value.Data[1];
                var rootDomainData = value.Data[2];


                result.urlcf = +urlData.CitationFlow;
                result.urltf = +urlData.TrustFlow;
                result.urlrefd = +urlData.RefDomains;

                result.cf = flg == 1 ? +subDomainData.CitationFlow : +rootDomainData.CitationFlow;
                result.tf = flg == 1 ? +subDomainData.TrustFlow : +rootDomainData.TrustFlow;
                result.refd = flg == 1 ? +subDomainData.RefDomains : +rootDomainData.RefDomains;

                // set zeros if the data status is not "Found"
                if (urlData.Status !== "Found") {
                    result.urlcf = 0;
                    result.urltf = 0;
                    result.urlrefd = 0;
                }

                if (subDomainData.Status !== "Found" && rootDomainData.Status !== "Found") {
                    result.cf = 0;
                    result.tf = 0;
                    result.refd = 0;
                }

                /*
                 result.subcf   = +subDomainData.CitationFlow;
                 result.subtf   = +subDomainData.TrustFlow;
                 result.subrefd = +subDomainData.RefDomains;

                 result.rootcf   = +rootDomainData.CitationFlow;
                 result.roottf   = +rootDomainData.TrustFlow;
                 result.rootrefd = +rootDomainData.RefDomains;
                 */

            }
            else {
                result = null;
            }
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};
window.rdz.request.Majestic.instance = new window.rdz.request.Majestic();

window.rdz.request.TF = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "TF";
};
window.rdz.request.TF.prototype = window.rdz.request.Majestic.instance;

window.rdz.request.CF = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "CF";
};
window.rdz.request.CF.prototype = window.rdz.request.Majestic.instance;

/*
 window.rdz.request.MajesticGlue = function (url, DataRequest) {
 DataRequest.apply(this, arguments);
 this.serviceUrl = 'http://www.majesticseo.com/reports/site-explorer?q=' + encodeURIComponent(this.domain + '/');
 this.parseResponse = function (response) {
 var result = {};
 if (response.match(new RegExp('<b>' + this.domain + '/')) == null) {
 //what a fuck??
 //nsRDS.items.mj.cache[nsRDS.utils.domain] = -1;
 }
 else {
 var numbers = response.match(/<b>[0-9,]+<\/b>/g);
 if (numbers != null)
 result = numbers[0].replace(/<b>|<\/b>|,/g, '');
 else
 result = rdz.errors.PARSE;
 }
 return result;
 };
 };*/

window.rdz.request.AggregatorsYandex = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    //this.serviceUrl = 'http://news.yandex.ru/yandsearch?rpt=smisearch&text=' + punycode.ToUnicode(this.domain);
    this.serviceUrl = 'https://news.yandex.ru/yandsearch?rpt=nnews2&text=site%3A' + punycode.ToUnicode(this.domain);
    this.source = this.domain;
    this.id = "AggregatorsYandex";
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            if (response.includes("form__captcha")) {
                result = rdz.errors.CAPTCHA;
            } else {
                if (response.search("class=\"warn__title\"") !== -1) {
                    result = {value: 0};
                } else if (response.search("class=\"search-item\"") !== -1) {
                  //есть ли в списке
                  let re = new RegExp('(www.)?' + this.domain + '/?', 'i'),
                      pattern = new RegExp("class=\"document__title\"[^]+?href=\"([^\"]+)\"", 'g'),
                      match;
                      
                  while ((match = pattern.exec(response)) !== null) {
                    if (re.test(match[1])) {
                      result = {value: 1};
                      break;
                    }
                  }
                }

                if (result.value === undefined) {
                  result = rdz.errors.PARSE;
                }



                /*var matches = response.match(/class=['"]total['"][^]+?(\d+)[^]+?<\/dd>/),
                    count = matches && matches[1] && parseInt(matches[1]) > 0 ? 1 : 0,  // the number of the results
                    pattern = /<a[\s]+class=['"]url['"][\s]+href=['"]http:\/\/([^'"]+)['"]/g,
                    tmp,
                    domainInList = false,
                    v;

                // check the list
                while ((tmp = pattern.exec(response)) != null) {
                    if (tmp && tmp[1] && (rdz.utils.domainFromUri(tmp[1]).domain === punycode.ToUnicode(this.domain))) {
                        domainInList = true;
                        break;
                    }
                }
                result = {value: count > 0 && domainInList ? 1 : 0};

                // parse the link for Y.News
                if (result.value === 1) {
                    pattern = new RegExp('<dl>[\\s]*<dt[\\s]*class=\\"head\\">[\\s]*<a[\\s]*href=\\"([^\\"]+)\\"[\\s]*class=\\"title\\">[^<]+<\\/a><\\/dt>[\\s]*<dd[\\s]*class=\\"info\\">[\\s]*<a[\\s]*class=\\"url\\"[\\s]*href=\\"' +
                    'http:\\/\\/www\\.' + punycode.ToUnicode(this.domain) + '\\/');
                    matches = response.match(pattern);
                    if (matches === null) {
                        pattern = new RegExp('<dl>[\\s]*<dt[\\s]*class=\\"head\\">[\\s]*<a[\\s]*href=\\"([^\\"]+)\\"[\\s]*class=\\"title\\">[^<]+<\\/a><\\/dt>[\\s]*<dd[\\s]*class=\\"info\\">[\\s]*<a[\\s]*class=\\"url\\"[\\s]*href=\\"' +
                        'http:\\/\\/' + punycode.ToUnicode(this.domain) + '\\/'),
                            matches = response.match(pattern);
                    }
                    if (matches && matches[1]) {
                        result.yandexNewsLink = 'http://news.yandex.ru' + matches[1];
                    }
                }*/
            }
        }
        return {value: result};
    };
};

window.rdz.request.AggregatorsGoogle = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.google.com/search?hl=en&tbm=nws&q=site:' + (this.uri.www ? 'www.' : '') + this.domain;
    this.source = (this.uri.www ? 'www.' : '') + this.domain;
    this.id = 'AggregatorsGoogle';
    this.parseResponse = function (response) {
        var result = rdz.parsers.parseIGResult(response);
        if (result.value > 0) result.value = 1;
        return {value: result};
    };
};

window.rdz.request.AggregatorsBing = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.bing.com/news/search?form=NWRFSH&q=site%3A' + this.domain;
    this.source = this.domain;
    this.id = "AggregatorsBing";
    this.parseResponse = function (response) {
        var result = rdz.parsers.parseBingResult(response);
        if (result.value > 0) result.value = 1;
        return {value: result};
    };
};

window.rdz.request.AggregatorsNovoteka = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://www.novoteka.ru/source/';
    this.source = this.domain;
    this.id = "AggregatorsNovoteka";
    this.parseResponse = function (response) {
        var result = {},
            re = /<a[^]+?class=source[^]+?href=['"]([^]+?)['"]/g,
            matches,
            domainObject;
        if (response) {
            result.value = 0;
            result.domains = [];
            while ((matches = re.exec(response)) != null) {
                domainObject = rdz.utils.domainFromUri(matches[1]);
                if (domainObject && domainObject.domain) {
                    result.domains.push(domainObject.domain);
                }
                if (this.domain === domainObject.domain) {
                    result.value = 1;
                }
            }
        }
        return {value: result};
    };
    this.caching = function (result) {
        if (typeof result.value === "number" && (result.value > -2 || result.value === rdz.errors.VIRUS) ||
            typeof result.value === "object" ||
            typeof result.value === "string" ||
            typeof result.value === "boolean") {
                let domains = result.value.domains;
                delete result.value.domains;

            var path = [this.getKey(result), this.id];

            if (rdz.db.period[this.id] && typeof result.action === 'undefined' ||
                rdz.db.period[this.id] && this.mass_id) {
                rdz.db.update(this.id, result.value, this.uri, this.mass_id, this.source);
            }

            rdz.cache.set(path, result.value);

            // save the domains from novoteka.ru
            //rdz.utils.saveDomains(result.value.domains);

            // set the value to 1 for the domains
            domains.forEach(domain => rdz.db.update(this.id, result.value, this.uri, this.mass_id, domain));
        }
    };
};

window.rdz.request.AggregatorsYandexNews = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = this.model.get('yandexNewsLink');
    this.source = this.domain;
    this.id = "AggregatorsYandexNews";
    this.parseResponse = function (response) {
        var result = {},
            matches;

        if (response) {
            if ((response.indexOf('<title>Защита от автоматического поиска</title>') !== -1) && (response.indexOf('captcha.yandex.net/') !== -1) ||
                (response.match(/src[\S]*?=[\s\S]+?captcha.yandex.net/) !== null) ||
                (response.indexOf("b-captcha__text") !== -1)) {
                result = rdz.errors.CAPTCHA;
            } else {
                result['domain'] = punycode.ToUnicode(this.domain);

                matches = response.match(/<dd class="smi__description"[^]+?>([^]+?)<\/dd>/);
                result['text'] = matches ? matches[1] : null;

                matches = response.match(/<dd class="smi__chief-value">([^]+?)<\/dd>/);
                result['manager'] = matches ? 'Генеральный директор: ' + matches[1] : null;

                matches = response.match(/<dd class="smi__address-value"[^]+?>([^]+?)<\/dd>/);
                result['address'] = matches ? 'Адрес:' + matches[1] : null;

                matches = response.match(/<dd class="smi__phone-value"[^]+?>([^]+?)<\/dd>/);
                result['tel'] = matches ? 'Телефон:' + matches[1] : null;

                // e-mail
                matches = response.match(/<a class="link smi__mailto"[^]+?href="mailto:([^]+?)"/);
                result['email'] = matches ? 'E-mail: ' + matches[1] : null;
            }
        }
        return {value: result};
    };
};

window.rdz.request.Solomono = function (url, DataRequest) {
    DataRequest.apply(this, arguments);

    this.serviceUrl = 'http://xml.linkpad.ru/?url=' + encodeURIComponent(this.domain);
    this.displayUrl = {
        index: 'https://www.linkpad.ru/default.aspx?r=13&i=' + encodeURIComponent(this.domain),
        in: 'https://www.linkpad.ru/default.aspx?r=3&i=' + encodeURIComponent(this.domain),
        out: 'https://www.linkpad.ru/default.aspx?r=16&i=' + encodeURIComponent(this.domain)
    };
    this.source = this.domain;
    this.id = "Solomono";

    this.parseResponse = function (response) {
        let result = {},
            dummy = { textContent: null };

        let domParser = new DOMParser(),
            xmlDoc = domParser.parseFromString(response, 'application/xml');

        result.in = +((xmlDoc.getElementsByTagName('din')[0] || dummy).textContent);
        result.out = +((xmlDoc.getElementsByTagName('dout')[0] || dummy).textContent);
        result.hin = +((xmlDoc.getElementsByTagName('hin')[0] || dummy).textContent);
        result.hout = +((xmlDoc.getElementsByTagName('hout')[0] || dummy).textContent);
        result.index = +((xmlDoc.getElementsByTagName('index')[0] || dummy).textContent);

        return {value: result};
    };
};

window.rdz.request.SimilarWeb = function (url, DataRequest) {
    DataRequest.apply(this, arguments);

    this.serviceUrl = 'https://data.similarweb.com/api/v1/data?domain=' + encodeURIComponent(this.domain);
    this.displayUrl = 'https://www.similarweb.com/website/' + encodeURIComponent(this.domain);
    this.source = this.domain;
    this.id = "SimilarWeb";

    // this.header = [
    //     ['Accept', 'application/json, text/javascript, */*; q=0.01']
    // ];

    this.parseResponse = function (response) {
        let result = {};

        let results = JSON.parse(response);

        if (Object.keys(results).length > 0) {
            let visits = results.EstimatedMonthlyVisits,
                dataChart = Object.keys(visits).map(date => ({ Date: date, Value: visits[date] }));
            result.MonthlyVisits = rdz.utils.createSimilarWebChartURL(dataChart);

            result.Visits = Math.round(results.Engagments.Visits / (rdz.setting.options.Bar.locale === 'ru' ? 30 : 1));
            result.TimeOnSite = Math.round(results.Engagments.TimeOnSite);
            result.PagePerVisit = +(+results.Engagments.PagePerVisit).toFixed(2);
            result.BounceRate = +(results.Engagments.BounceRate * (results.Engagments.BounceRate >= 10 ? 1 : 100)).toFixed(2);

            // TopCountryShares
            result.CountryShares = results.TopCountryShares.map(function (share) { share.Value = +(share.Value * 100).toFixed(2); return share; });

            // Sources
            result.Sources = rdz.$.map(results.TrafficSources, (value, key) => ({ value: value, key: key })) // convert object to array
                .sort((a, b) => b.value - a.value) // sort array
                .reduce(function (res, currObj) { res[currObj.key] = +(currObj.value * 100).toFixed(2); return res; }, {}); // convert array to object

            // // TopReferring
            // result.Referring = (results.TopReferring || []).map(x => x.Site).join(', ');

            // // TopDestinations
            // result.Destinations = (results.TopDestinations || []).map(x => x.Site).join(', ');

            // // TopOrganicKeywords
            // result.OrganicKeywords = (results.TopOrganicKeywords || []).map(x => x.Keyword).join(', ');
        } else {
            result = {
                MonthlyVisits: '',
                Visits: 0,
                TimeOnSite: 0,
                PagePerVisit: 0,
                BounceRate: 0,
                CountryShares: [],
                Sources: {}
            };
        }

        return {value: result};
    };
};



window.rdz.request.WMAdvisor = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://advisor.wmtransfer.com/sitedetails.aspx?url=' + encodeURIComponent(this.domain) + '&sort=dt';
    this.source = this.domain;
    this.id = "WMAdvisor";
    this.parseResponse = function (response) {
        var result = {},
            matches,
            feedbacks = [],
            domParser,
            htmlDoc,
            rows;

        if (response) {
            // danger
            result.danger = /Вредоносный[\s]+сайт/i.test(response);
            matches = response.match(/Индекс посещаемости:[^]+?>([^]+?)</i);
            if (matches !== null) {
                result.trafficIndex = +matches[1];
            } else result.trafficIndex = 0;
            // feedbacks +
            //matches = response.match(/>положительные[^]+?>([^]+?)</i);
            matches = response.match(/class="gt0"/g);
            if (matches !== null) {
                //result.feedbacksGT = +matches[1];
                result.feedbacksGT = matches.length;
            } else result.feedbacksGT = 0;

            // feedbacks - 
            //matches = response.match(/>отрицательные[^]+?>([^]+?)</i);
            matches = response.match(/class="lt0"/g);
            if (matches !== null) {
                //result.feedbacksLT = +matches[1];
                result.feedbacksLT = matches.length;
            } else result.feedbacksLT = 0;

            // feedback messages
            if (result.feedbacksGT || result.feedbacksLT) {
                let pattern = /<div class="feedbackSender">[^\/]+?class="([^"]+)/g,
                    pattern2 = /<div[\s]+class="feedbackText">[^]+?<\/a>([^<]+)/g,
                    tmp = [];

                while ((tmp[0] = pattern.exec(response)) !== null) {
                    tmp[1] = pattern2.exec(response);
                    if (tmp[0] !== null && tmp[1] !== null) {
                        tmp[1][1] = tmp[1][1].substring(30, tmp[1][1].length);

                        feedbacks.push({
                            type: tmp[0][1],
                            message: tmp[1][1]
                        });
                    }
                }
                result.feedbacks = feedbacks;
                /*domParser = new DOMParser();
                htmlDoc = domParser.parseFromString(response, 'text/html');
                rows = rdz.$(htmlDoc).find('#ctl00_ContentPlaceHolder1_oFeedBackGrid tr');
                rows = Array.prototype.slice.call(rows);
                rows.forEach(function (e) {
                    feedbacks.push({
                        type: rdz.$(e).find('.gt0').length > 0 ? 'gt0' : 'lt0',
                        message: rdz.$(rdz.$(e).find('.feedbackText'))[0].childNodes[2].textContent.substring(29)
                    });
                });
                result.feedbacks = feedbacks;*/
            }

            // icon type
            //matches = response.match(/<h5[^]+?class=message2><img[^]+?src=([^]+?)['"]/i);
            matches = response.match(/<img[^>]+src='([^']+)'/i);
            if (matches !== null) {
                if (/green/.test(matches[1])) {
                    result.iconType = 1;
                } else if (/yellow/.test(matches[1])) {
                    result.iconType = 2;
                } else if (/service/.test(matches[1])) {
                    result.iconType = 3;
                } else if (/grey/.test(matches[1])) {
                    result.iconType = 0;
                }
            }
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.WMAdvisorGraph = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://advisor.wmtransfer.com/SiteDetails.aspx?url=' + encodeURIComponent(this.domain) + '&tab=rating';
    this.source = this.domain;
    this.id = "WMAdvisorGraph";
    this.parseResponse = function (response) {
        var result = {},
            matches,
            reg = /({.*})/i,
            dataChart,
            len,
            i,
            dateStr;
        if (response) {
            matches = response.match(/<input id=\"hidltrG3\"[^]+?value=\"([^\"]+)\"/);
            if (matches !== null) {
                try {
                    matches[1] = matches[1].replace(/name/, "'name'")
                        .replace(/data/, "'data'")
                        .replace(/\'/g, '"');
                    dataChart = JSON.parse(matches[1]);

                    if (dataChart && dataChart.data) {
                        dataChart.minValue = '9e20';
                        dataChart.maxValue = 0;
                        dataChart.chtt = 'Динамика изменения индекса посещаемости';
                        len = dataChart.data.length;
                        for (i = 0; i < len; i++) {
                            if (+dataChart.data[i][1] < dataChart.minValue) {
                                dataChart.minValue = dataChart.data[i][1];
                            }
                            if (+dataChart.data[i][1] > dataChart.maxValue) {
                                dataChart.maxValue = dataChart.data[i][1];
                            }
                            dateStr = new Date(dataChart.data[i][0]);
                            dataChart.data[i][0] = rdz.utils.getMonthName(dateStr.getMonth()) + ' (' + (dateStr.getFullYear() + '').substring(2) + ')';
                        }

                        result = rdz.utils.CreateWebmoneyChartURL(dataChart);
                    } else {
                        result = null;
                    }
                } catch (e) {
                    result = null;
                }
            } else {
                result = null;
            }
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.IP = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://' + encodeURIComponent(this.domain) + '/';
    this.displayUrl = 'https://www.maxmind.com/en/geoip-demo';
    this.source = this.domain;
    this.xhr_type = 'HEAD';
    this.id = 'IP';
    //    this.execute = function () {
    //	var cache = this.cache();	
    //        if (cache !== null && cache !== undefined && typeof this.model.ignore_cache === 'undefined') {
    //            if (this.model.get('fromCache')) {
    //                this.cached = true;
    //            }
    //            this.return(cache);
    //        }
    //    }
    this.parseResponse = function (response) {
        // temporary disabled
        return { value: rdz.IPs[this.source] };
    };
};

window.rdz.request.IPSitesCountBing = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var ip = this.model.get('ip');
    if (ip) {
        this.serviceUrl = 'http://www.bing.com/search?q=ip%3A' + ip + '&setplang=en-US';
    }
    this.source = this.domain;
    this.id = "IPSitesCountBing";
    this.parseResponse = rdz.parsers.parseBingResult;
};

window.rdz.request.IPSitesCountSolomono = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var ip = this.model.get('ip');
    if (ip) {
        this.serviceUrl = 'http://xml.linkpad.ru/?url=' + encodeURIComponent(this.domain);
        this.displayUrl = 'http://www.linkpad.ru/?search=http%3A%2F%2F' + encodeURIComponent(this.domain) +
        '#/default.aspx?r=2&i=' + encodeURIComponent(this.domain) + '&ip=' + encodeURIComponent(this.domain);
    }
    this.source = this.domain;
    this.id = "IPSitesCountSolomono";
    this.parseResponse = function (response) {
        var result = {};
        var domParser = new DOMParser();
        var xmlDoc = domParser.parseFromString(response, "application/xml");
        result = xmlDoc.getElementsByTagName('ip').length ?
            +(xmlDoc.getElementsByTagName('ip')[0].textContent) : null;
        return {value: result};
    };
};

window.rdz.request.Prodvigator = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.source = this.domain;
    this.parseResponse = rdz.parsers.parseProdvigatorResult;
    this.execute = function () {
        var cache = this.cache();

        if (cache !== null && cache !== undefined && typeof this.model.ignore_cache === 'undefined') {
            this.cached = true;
            this.return(cache);
        } else {
            if (!this.model.get('only_cache')) {
                var self = this;
                self.xhr({
                    type: self.xhr_type || 'GET',
                    body: self.xhr_body || null,
                    url: this.serviceUrl,
                    header: self.header || null
                });
            }
        }
    };
};

window.rdz.request.Prodvigator_y_traff = function (url, DataRequest) {
    rdz.request.Prodvigator.apply(this, arguments);
    this.source = this.domain;
    this.id = "Prodvigator_y_traff";
    this.serviceUrl = 'https://serpstat.com/keywords/traff?query=' + encodeURIComponent(this.domain) + '&set_se=y_213';
};

window.rdz.request.Prodvigator_y_count = function (url, DataRequest) {
    rdz.request.Prodvigator.apply(this, arguments);
    this.source = this.domain;
    this.id = "Prodvigator_y_count";
    this.serviceUrl = 'https://serpstat.com/keywords/count?query=' + encodeURIComponent(this.domain) + '&set_se=y_213';
};

window.rdz.request.Prodvigator_y_visible = function (url, DataRequest) {
    rdz.request.Prodvigator.apply(this, arguments);
    this.source = this.domain;
    this.id = "Prodvigator_y_visible";
    this.serviceUrl = 'https://serpstat.com/keywords/visible?query=' + encodeURIComponent(this.domain) + '&set_se=y_213';
};

window.rdz.request.Prodvigator_g_traff = function (url, DataRequest) {
    rdz.request.Prodvigator.apply(this, arguments);
    var google_zone = this.model.get('extra').prodvigator_google_source.active;
    this.source = this.domain;
    this.id = "Prodvigator_g_traff";
    this.serviceUrl = 'https://serpstat.com/keywords/traff?query=' + encodeURIComponent(this.domain) + '&set_se=' + rdz.utils.prodvigator_request_google[google_zone];
};

window.rdz.request.Prodvigator_g_count = function (url, DataRequest) {
    rdz.request.Prodvigator.apply(this, arguments);
    var google_zone = this.model.get('extra').prodvigator_google_source.active;
    this.source = this.domain;
    this.id = "Prodvigator_g_count";
    this.serviceUrl = 'https://serpstat.com/keywords/count?query=' + encodeURIComponent(this.domain) + '&set_se=' + rdz.utils.prodvigator_request_google[google_zone];
};

window.rdz.request.Prodvigator_g_visible = function (url, DataRequest) {
    rdz.request.Prodvigator.apply(this, arguments);
    var google_zone = this.model.get('extra').prodvigator_google_source.active;
    this.source = this.domain;
    this.id = "Prodvigator_g_visible";
    this.serviceUrl = 'https://serpstat.com/keywords/visible?query=' + encodeURIComponent(this.domain) + '&set_se=' + rdz.utils.prodvigator_request_google[google_zone];
};

window.rdz.request.SpyWords = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://spywords.ru/sword.php?sword=' + encodeURIComponent(this.domain) + '&partner=501';
    this.source = this.domain;
    this.id = "SpyWords";
    this.parseResponse = function (response) {
        var result = rdz.errors.PARSE,
            matches, tmp_matches;

        if (response) {
            if (/id="create_account1"/.test(response)) {
                result = rdz.errors.AUTHOR;
            } else {
                matches = response.match(/<div\s+id="svodka"[^]+?<\/table/);
                if (matches) {
                    matches = matches[0].match(/<td[^>]*>.+?<\/td/g);
                    if (matches) {
                        result = {};

                        tmp_matches = matches[8].match(/<td[^>]*>([^]+?)<\/td/);
                        result.yandexQueries = +(tmp_matches[1].replace(/\s/g, ''));

                        tmp_matches = matches[12].match(/<td[^>]*>([^]+?)<\/td/);
                        result.yandexTopQueries = +(tmp_matches[1].replace(/\s/g, ''));

                        tmp_matches = matches[13].match(/<td[^>]*>([^]+?)<\/td/);
                        result.yandexTraffic = +(tmp_matches[1].replace(/\s/g, ''));

                        tmp_matches = matches[15].match(/<td[^>]*>([^]+?)<\/td/);
                        result.googleQueries = +(tmp_matches[1].replace(/\s/g, ''));

                        tmp_matches = matches[19].match(/<td[^>]*>([^]+?)<\/td/);
                        result.googleTopQueries = +(tmp_matches[1].replace(/\s/g, ''));

                        tmp_matches = matches[20].match(/<td[^>]*>([^]+?)<\/td/);
                        result.googleTraffic = +(tmp_matches[1].replace(/\s/g, ''));
                    }
                } else {
                    result = rdz.errors.PARSE;
                }
            }

        }

        return {value: result};
    };

    this.execute = function () {
        var cache = this.cache();

        if (cache !== null && cache !== undefined && typeof this.model.ignore_cache === 'undefined') {
            this.cached = true;
            this.return(cache);
        } else {
            if (!this.model.get('only_cache')) {
                var self = this;
                self.xhr({
                    type: self.xhr_type || 'GET',
                    body: self.xhr_body || null,
                    url: this.serviceUrl,
                    header: self.header || null
                });
            }
        }
    };
};

window.rdz.request.LIO = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = url;
    this.displayUrl = 'http://www.recipdonor.com/barcheckpage?url=' + encodeURIComponent(url);
    this.source = this.page;
    this.id = "LIO";
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var filters = [];
            for (var filter in this.model.get('extra')) {
                if (this.model.get('extra')[filter].active) {
                    filters.push(filter);
                }
            }

            var links = rdz.utils.getAllLinks(response, filters);
            result = {
                innerLinks: rdz.utils.getInnerLinks(links, url),
                outerLinks: rdz.utils.getOuterLinks(links, url, !this.model.get('extra')['subdomains'].active)
            };
        }
        else
            result = null;
        return {value: result};
    };
};

/* Social Networks */

window.rdz.request.GooglePlus = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'GooglePlus';
    this.xhr_type = 'POST';
    this.serviceUrl = 'https://clients6.google.com/rpc';

    this.header = [
        ['Accept', 'application/json'],
        ['Content-type', 'application/json;charset=UTF-8']
    ];
    this.xhr_body = JSON.stringify({
        method: 'pos.plusones.get',
        id: 'p',
        params: {
            nolog: true,
            id: url,
            source: 'widget',
            userId: '@viewer',
            groupId: '@self',
        },
        jsonrpc: '2.0',
        key: 'p',
        apiVersion: 'v1',
    });
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            let data = JSON.parse(response);
            result = data ? data.result.metadata.globalCounts.count : 0;
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};
window.rdz.request.GooglePlus.instance = new window.rdz.request.GooglePlus();

window.rdz.request.GooglePlusMain = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'GooglePlusMain';
    this.xhr_type = 'POST';
    this.serviceUrl = 'https://clients6.google.com/rpc';

    this.header = [
        ['Accept', 'application/json'],
        ['Content-type', 'application/json;charset=UTF-8']
    ];
    this.xhr_body = JSON.stringify({
        method: 'pos.plusones.get',
        id: 'p',
        params: {
            nolog: true,
            id: url.match(/^[^:]+:\/\/[^\/]+/)[0] + '/',
            source: 'widget',
            userId: '@viewer',
            groupId: '@self',
        },
        jsonrpc: '2.0',
        key: 'p',
        apiVersion: 'v1',
    });
};
window.rdz.request.GooglePlusMain.prototype = window.rdz.request.GooglePlus.instance;

window.rdz.request.Facebook = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    if (url) {
        this.serviceUrl = 'http://graph.facebook.com/?ids=' + encodeURIComponent(url);
        //this.serviceUrl = 'https://www.facebook.com/plugins/like.php?href=' + encodeURIComponent(url) +
        //                '&width=450&layout=standard&action=like&show_faces=true&share=true&height=80&appId';
    }
    this.source = this.page;
    this.id = 'Facebook';
    this.parseResponse = function (response) {
        /*let result = 0;

        let match = response.match(/id="u_0_2"[^\d\/]+([^<]+)/);
        if (match) {
            let number = match[1].match(/^([\d\,\.]+)/);
            number = number ? +number[1].replace(/,/, '.') : 0;
console.log(number);
            let exp = match[1].match(/\d([a-zA-Z]| [а-я\w]+)/);
            exp = exp ? +exp[1].replace(/тыс\.*|тис\.*|K/, '1000')
                        .replace(/млн\.*|M/, '1000000')
                        .replace(/[^\d]/g, '') : 1;

            result = number * (exp || 1);
        }
        return {value: result};*/

        var result = 0,
            matches;
        if (response) {
            if (!/OAuthException/.test(response)) {
                let shares = response.match(/"share[^"]*":\s*(\d+)/);
                shares = shares ? +shares[1] : 0;

                let likes = response.match(/"likes[^"]*":\s*(\d+)/);
                likes = likes ? +likes[1] : 0;

                let comments = response.match(/"comment[^"]*":\s*(\d+)/);
                comments = comments ? +comments[1] : 0;

                result = shares + likes + comments;
            }
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};
window.rdz.request.Facebook.instance = new window.rdz.request.Facebook();

window.rdz.request.FacebookMain = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'FacebookMain';

    if (url) {
        var _url = url.match(/^[^:]+:\/\/[^\/]+/)[0] + '/';
        this.serviceUrl = 'http://graph.facebook.com/?ids=' + encodeURIComponent(_url);
        //this.serviceUrl = 'https://www.facebook.com/plugins/like.php?href=' + encodeURIComponent(_url) +
        //                '&width=450&layout=standard&action=like&show_faces=true&share=true&height=80&appId';
    }
};
window.rdz.request.FacebookMain.prototype = window.rdz.request.Facebook.instance;

window.rdz.request.Twitter = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    if (url) {
        var _url = rdz.utils.noWWWUri(url);
        this.serviceUrl = 'http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(_url);
    }
    this.source = this.page;
    this.id = 'Twitter';
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            try {
                if (!/"error":/.test(response)) {
                    var json = JSON.parse(response);
                    result = json.count;
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
    this.caching = function (result) {
        if (typeof result.value === "number" && (result.value > -2 || result.value === rdz.errors.VIRUS) ||
            typeof result.value === "object" ||
            typeof result.value === "string" ||
            typeof result.value === "boolean") {
            var v = this.model.get('value'),
                value = result.value;

            if (v && typeof v.Twitter2 === 'number') {
                value += v.Twitter2;
            }

            var path = [this.getKey(result), this.id];

            if (rdz.db.period.Twitter && typeof result.action === 'undefined' ||
                rdz.db.period.Twitter && this.mass_id) {
                rdz.db.update('Twitter', value, this.uri, this.mass_id, this.source);
            }

            rdz.cache.set(path, result.value);
        }
    };
};
window.rdz.request.Twitter.instance = new window.rdz.request.Twitter();

window.rdz.request.TwitterMain = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'TwitterMain';

    if (url) {
        var _url = rdz.utils.noWWWUri(url.match(/^[^:]+:\/\/[^\/]+/)[0] + '/');
        this.serviceUrl = 'http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(_url);
    }

    this.caching = function (result) {
        if (typeof result.value === "number" && (result.value > -2 || result.value === rdz.errors.VIRUS) ||
            typeof result.value === "object" ||
            typeof result.value === "string" ||
            typeof result.value === "boolean") {
            var v = this.model.get('value'),
                value = result.value;

            if (v && typeof v.TwitterMain2 === 'number') {
                value += v.TwitterMain2;
            }

            var path = [this.getKey(result), this.id];

            if (rdz.db.period.TwitterMain && typeof result.action === 'undefined' ||
                rdz.db.period.TwitterMain && this.mass_id) {
                rdz.db.update('TwitterMain', value, this.uri, this.mass_id, this.source);
            }

            rdz.cache.set(path, result.value);
        }
    };
};
window.rdz.request.TwitterMain.prototype = window.rdz.request.Twitter.instance;

window.rdz.request.Twitter2 = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    if (url) {
        var _url = 'http://www.' + rdz.utils.noWWWUri(rdz.utils.protolessUri(url));
        this.serviceUrl = 'http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(_url);
    }
    this.source = this.page;
    this.id = 'Twitter2';
    this.caching = function (result) {
        if (typeof result.value === "number" && (result.value > -2 || result.value === rdz.errors.VIRUS) ||
            typeof result.value === "object" ||
            typeof result.value === "string" ||
            typeof result.value === "boolean") {
            var v = this.model.get('value'),
                value = result.value;

            if (v && typeof v.Twitter === 'number') {
                value += v.Twitter;
            }

            var path = [this.getKey(result), this.id];

            if (rdz.db.period.Twitter && typeof result.action === 'undefined' ||
                rdz.db.period.Twitter && this.mass_id) {
                rdz.db.update('Twitter', value, this.uri, this.mass_id, this.source);
            }

            rdz.cache.set(path, result.value);
        }
    };
};
window.rdz.request.Twitter2.prototype = window.rdz.request.Twitter.instance;

window.rdz.request.TwitterMain2 = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'TwitterMain2';

    if (url) {
        var _url = 'http://www.' + rdz.utils.noWWWUri(rdz.utils.protolessUri(url.match(/^[^:]+:\/\/[^\/]+/)[0] + '/'));
        this.serviceUrl = 'http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(_url);
    }

    this.caching = function (result) {
        if (typeof result.value === "number" && (result.value > -2 || result.value === rdz.errors.VIRUS) ||
            typeof result.value === "object" ||
            typeof result.value === "string" ||
            typeof result.value === "boolean") {
            var v = this.model.get('value'),
                value = result.value;

            if (v && typeof v.TwitterMain === 'number') {
                value += v.TwitterMain;
            }

            var path = [this.getKey(result), this.id];

            if (rdz.db.period.TwitterMain && typeof result.action === 'undefined' ||
                rdz.db.period.TwitterMain && this.mass_id) {
                rdz.db.update('TwitterMain', value, this.uri, this.mass_id, this.source);
            }

            rdz.cache.set(path, result.value);
        }
    };
};
window.rdz.request.TwitterMain2.prototype = window.rdz.request.Twitter.instance;

window.rdz.request.VK = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'VK';

    if (url) {
        var _url = 'http://' + rdz.utils.protolessUri(rdz.utils.noWWWUri(url.replace(/\/$/, '')));
        this.serviceUrl = 'https://vk.com/share.php?act=count&index=1&url=' + _url; //encodeURIComponent(_url);
    }

    this.parseResponse = function (response) {
        let result = {};
        if (response) {
            let matches = response.match(/\(1, (\d+)\);/);
            result = matches ? +matches[1] : 0;
        } else {
            result = rdz.errors.PARSE;
        }
        return { value: result };
    };
    this.caching = function (result) {
        if (typeof result.value === "number" && result.value > -2) {
            var v = Object.assign({}, this.model.get('value')),
                value = result.value;

            v[this.id] = value;
            if (typeof v.VK === 'number' && typeof v.VK2 === 'number' &&
                typeof v.VK3 === 'number' && typeof v.VK4 === 'number') {
                value = v.VK + v.VK2 + v.VK3 + v.VK4;
            }

            var path = [this.getKey(result), this.id];

            if (rdz.db.period.VK && typeof result.action === 'undefined' ||
                rdz.db.period.VK && this.mass_id) {
                rdz.db.update('VK', value, this.uri, this.mass_id, this.source);
            }

            rdz.cache.set(path, result.value);
        }
    };
};
window.rdz.request.VK.instance = new window.rdz.request.VK();

window.rdz.request.VKMain = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'VKMain';

    if (url) {
        var _url = 'http://' + rdz.utils.protolessUri(rdz.utils.noWWWUri(url.match(/^[^:]+:\/\/[^\/]+/)[0]));
        this.serviceUrl = 'https://vk.com/share.php?act=count&index=1&url=' + _url;
    }

    this.caching = function (result) {
        if (typeof result.value === "number" && result.value > -2) {
            var v = Object.assign({}, this.model.get('value')),
                value = result.value;

            v[this.id] = value;
            if (typeof v.VKMain === 'number' && typeof v.VKMain2 === 'number' &&
                typeof v.VKMain3 === 'number' && typeof v.VKMain4 === 'number') {
                value = v.VKMain + v.VKMain2 + v.VKMain3 + v.VKMain4;
            }

            var path = [this.getKey(result), this.id];

            if (rdz.db.period.VKMain && typeof result.action === 'undefined' ||
                rdz.db.period.VKMain && this.mass_id) {
                rdz.db.update('VKMain', value, this.uri, this.mass_id, this.source);
            }

            rdz.cache.set(path, result.value);
        }
    };
};
window.rdz.request.VKMain.prototype = window.rdz.request.VK.instance;

window.rdz.request.VK2 = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'VK2';

    if (url) {
        var _url = 'http://' + rdz.utils.protolessUri(rdz.utils.noWWWUri(url)) + (!/\/$/.test(url) ? '/' : '');
        this.serviceUrl = 'https://vk.com/share.php?act=count&index=1&url=' + _url;
    }
};
window.rdz.request.VK2.prototype = window.rdz.request.VK.instance;

window.rdz.request.VKMain2 = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'VKMain2';

    if (url) {
        var _url = 'http://' + rdz.utils.protolessUri(rdz.utils.noWWWUri(url.match(/^[^:]+:\/\/[^\/]+/)[0] + '/'));
        this.serviceUrl = 'https://vk.com/share.php?act=count&index=1&url=' + _url;
    }
};
window.rdz.request.VKMain2.prototype = window.rdz.request.VK.instance;

window.rdz.request.VK3 = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'VK3';

    if (url) {
        var _url = 'http://www.' + rdz.utils.protolessUri(rdz.utils.noWWWUri(url.replace(/\/$/, '')));
        this.serviceUrl = 'https://vk.com/share.php?act=count&index=1&url=' + _url;
    }
};
window.rdz.request.VK3.prototype = window.rdz.request.VK.instance;

window.rdz.request.VKMain3 = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'VKMain3';

    if (url) {
        var _url = 'http://www.' + rdz.utils.protolessUri(rdz.utils.noWWWUri(url.match(/^[^:]+:\/\/[^\/]+/)[0]));
        this.serviceUrl = 'https://vk.com/share.php?act=count&index=1&url=' + _url;
    }
};
window.rdz.request.VKMain3.prototype = window.rdz.request.VK.instance;

window.rdz.request.VK4 = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'VK4';

    if (url) {
        var _url = 'http://www.' + rdz.utils.protolessUri(rdz.utils.noWWWUri(url)) + (!/\/$/.test(url) ? '/' : '');
        this.serviceUrl = 'https://vk.com/share.php?act=count&index=1&url=' + _url;
    }
};
window.rdz.request.VK4.prototype = window.rdz.request.VK.instance;

window.rdz.request.VKMain4 = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.source = this.page;
    this.id = 'VKMain4';

    if (url) {
        var _url = 'http://www.' + rdz.utils.protolessUri(rdz.utils.noWWWUri(url.match(/^[^:]+:\/\/[^\/]+/)[0] + '/'));
        this.serviceUrl = 'https://vk.com/share.php?act=count&index=1&url=' + _url;
    }
};
window.rdz.request.VKMain4.prototype = window.rdz.request.VK.instance;


window.rdz.request.Validation = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    //this.serviceUrl = 'http://validator.w3.org/check?uri=' + encodeURIComponent(url) + '&charset=%28detect+automatically%29&doctype=Inline&group=0';
    this.serviceUrl = 'https://validator.w3.org/nu/?doc=' + encodeURIComponent(url);
    this.source = this.page;
    this.id = "Validation";
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            if (/class="non-document-error io"/.test(response)) {
                result = /class="failure"/.test(response) ? {value: 0, message: 'Failure'} : null;
            } else {
                var warnings = response.match(/class="error"/g),
                    errors = response.match(/class="[info ]*warning"/g);
                
                result = errors ? { value: 0, message: (warnings ? 'Warnings: ' + warnings.length + '  ': '') + 'Errors: ' + errors.length} :
                    {value: 1, message: 'Validation Success'};
            }
        }
        //if (response) {
        //    result.value = Number(response.match(new RegExp('Result:<\/th>[\\s\\S]+?class="valid"')) != null, 10);
        //    result.message = result.value ? null : response.match(/Result:[^]+?">([^]+?)<\//)[1].trim();
        //}
        //else
        //    result = null;
        return {value: result};
    };
};

window.rdz.request.RSS = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.serviceUrl = url;
    this.source = this.domain;
    this.id = "RSS";
    this.execute = function () {
        var cache = this.cache();

        if (cache !== null && cache !== undefined && typeof this.model.ignore_cache === 'undefined') {
            this.cached = true;
            this.return(cache);
        }
    };
};
window.rdz.request.RSS.instance = new window.rdz.request.RSS();

window.rdz.request.CMS = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.serviceUrl = url;
    this.source = this.page;
    this.id = "CMS";
    this.execute = function () {
        var cache = this.cache();

        if (cache !== null && cache !== undefined && typeof this.model.ignore_cache === 'undefined') {
            this.cached = true;
            this.return(cache);
        }
    };
};

window.rdz.request.Robots = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://' + this.domain + '/robots.txt';
    this.source = this.domain;
    this.id = "Robots";
    this.parseResponse = function (response, request) {
        var result = {};
        result.value = request.status === 200 && request.getResponseHeader('content-type').indexOf('text/plain') >= 0 ? 1 : 0;
        result.date = request.getResponseHeader('Last-Modified') || null;
        if (result.date) result.date = +new Date(result.date);
        return {value: result};
    };
};
window.rdz.request.Robots.instance = new window.rdz.request.Robots();

window.rdz.request.Nesting = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var re = new RegExp("^(([^:/\\?#]+):)?(//(([^:/\\?#]*)(?::([^/\\?#]*))?))");
    var host = url.match(re)[4];
    this.displayUrl = 'http://www.recipdonor.com/CheckPage?url=' + encodeURIComponent(url);
    this.serviceUrl = 'http://' + host + '/';
    this.source = this.page;
    this.id = "Nesting";
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var uriObj = rdz.utils.get_uri_obj(url);
            var links = rdz.utils.getAllLinks(response);
            result.value = 3;
            for (var i = 0, len = links.length; i < len; i = i + 1) {
                links[i] = links[i].toLowerCase().replace(/&amp;/g, '&');
                if (links[i] === uriObj.path ||
                    '/' + links[i] === uriObj.path ||
                    links[i] === uriObj.domain + uriObj.path ||
                    links[i] === url ||
                    links[i] === uriObj.path.replace(/\/$/g, '')) {
                    result.value = 2;
                    break;
                }
            }
        } else {
            result = null;
        }
        return {value: result};
    };
};

window.rdz.request.Sitemap = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://www.' + this.domain + '/sitemap.xml';
    this.source = this.domain;
    this.id = "Sitemap";
    this.parseResponse = function (response, request) {
        var result = {};
        result.value = Number(request.status >= 200 && request.status < 300 &&
        (request.responseURL && /\.xml/.test(request.responseURL)), 10);
        result.date = request.getResponseHeader('Last-Modified') || null;
        if (result.date) result.date = +new Date(result.date);
        return {value: result};
    };
};
// window.rdz.request.Sitemap.prototype = window.rdz.request.Robots.instance;

window.rdz.request.SitemapRobots = function (url, DataRequest) {
    if (DataRequest) DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://www.' + this.domain + '/robots.txt';
    this.source = this.domain;
    this.id = "SitemapRobots";
    this.parseResponse = function (response, request) {
        var result = {},
            sitemap_urls = [],
            re = /sitemap:\s*([^\n]+\.xml)\n/gi, m,
            url;

        if (request.status >= 200 && request.status < 300) {
            while ( (m = re.exec(response)) ) {
                url = m[1].replace(/^https?:\/\/(www\.)?/, 'http://www.');
                if (url !== 'http://www.' + this.domain + '/sitemap.xml') {
                    sitemap_urls.push(url);
                }
            }
        }
        result.sitemap_urls = sitemap_urls;
        return {value: result};
    };
};

window.rdz.request.CurrSitemap = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = url;
    this.source = this.domain;
    this.id = "CurrSitemap";
    this.parseResponse = function (response, request) {
        var result = {},
            value = Number(request.status >= 200 && request.status < 300, 10),
            date = request.getResponseHeader('Last-Modified') || null;
        if (date) date = +new Date(date);
        if (value && date) {
            result[url] = date;
        }
        return {value: result};
    };
    this.caching = function (result) { return false; };
};

window.rdz.request.Pictures = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.google.com/search?gbv=1&hl=en&tbm=isch&q=site:' + (this.uri.www ? 'www.' : '') + this.domain;
    this.source = (this.uri.www ? 'www.' : '') + this.domain;
    this.id = 'Pictures';
    this.parseResponse = rdz.parsers.parseIGResult;
};
window.rdz.request.PicturesYa = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://yandex.ru/images/search?lr=213&text=site%3A' + this.domain;
    this.source = this.domain;
    this.id = "PicturesYa";
    this.parseResponse = window.rdz.parsers.parseImgYanResult;
};
window.rdz.request.PicturesAol = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://search.aol.com/aol/image?&q=site%3A' + this.domain;
    this.source = this.domain;
    this.id = "PicturesAol";
    this.parseResponse = function (response) {
        var result = {};
        var matches = {};
        if (response) {
            if (response.indexOf('returned no results') !== -1) {
                result = 0;
            }
            else {
                matches = response.match(/<div class="GHIRR">[\s\S].*?</g);
                result = matches && matches[0] && +(matches[0].replace(/[^\d+]/gi, "")) || null;
            }
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.Seobudget = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://seobudget.ru/downloads/updates.xml';
    this.source = 'ApplicationData';
    this.id = "Seobudget";
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            var xml_doc = (new window.DOMParser()).parseFromString(response, "text/xml");

            result.IY = rdz.$('#serp > *', xml_doc).attr('timestamp') * 1000;
            result.IYD = result.IYP = result.IYDP = result.BY = result.CheckDangerous = result.IY;

            result.TYC = result.YaBar = rdz.$('#cy > *', xml_doc).attr('timestamp') * 1000;

            result.PR = rdz.$('#pr > *', xml_doc).attr('timestamp') * 1000 || 1386313200000;
            result.PRMain = result.PRg = result.PRgMain = result.PR;

            result.YACA = rdz.$('#yaca > *', xml_doc).attr('timestamp') * 1000;

            result.USER = rdz.$('#user > *', xml_doc).attr('timestamp') * 1000;
        }
        else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.RDSNotification = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://www.recipdonor.com/rdsbarnotification.txt';
    this.source = 'ApplicationData';
    this.id = "RDSNotification";
    this.header = [
        ['Cache-Control', 'no-cache']
    ];
    this.parseResponse = function (response) {
        var result = {};
        if (response) {
            result = JSON.parse(response);
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.NewsYandex = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://webmaster.yandex.ru/blog/rss';
    this.source = 'ApplicationData';
    this.id = "NewsYandex";
    this.parseResponse = rdz.parsers.parseNewsXMLResult;
};

window.rdz.request.NewsWebmasters = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://webmasters.ru/news/';
    this.source = 'ApplicationData';
    this.id = "NewsWebmasters";
    this.parseResponse = function (response) {
        var result = {},
            newsArray = [],
            newsItems,
            i,
            length;

        if (response) {
            newsItems = response.match(/div\sclass\=.title[^]{0,10}h3[^]+?a\shref=[^]+?h3/g);
            length = newsItems.length > 20 ? 20 : newsItems.length;

            for (i = 0; i < length; i += 1) {
                newsArray.push({
                    title: newsItems[i].match(/span>([^]+?)<[^]span/)[1],
                    link: newsItems[i].match(/href\=[\'\"]([^]+?)[\'\"]/)[1]
                });
            }
            result = newsArray;
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.NewsSE = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://feeds.feedburner.com/searchengines/news';
    this.source = 'ApplicationData';
    this.id = "NewsSE";
    this.parseResponse = rdz.parsers.parseNewsXMLResult;
};

window.rdz.request.NewsWebmoney = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'https://news.wmtransfer.com/';
    this.source = 'ApplicationData';
    this.id = "NewsWebmoney";
    this.parseResponse = function (response) {
        var result = {},
            newsArray = [],
            newsItems,
            i,
            length;

        if (response) {
            newsItems = response.match(/div\sclass\=[\'\"]post__title[^]+?<[^]a/g); // response.match(/div\sid\=[\'\"]post\-[^]+?h2\sclass\=[\'\"]entry\-title[^]+?\<[^]a/g);
            length = newsItems.length > 20 ? 20 : newsItems.length;

            for (i = 0; i < length; i += 1) {
                newsArray.push({
                    title: newsItems[i].match(/href\=[\'\"]([^]+?)[\'\"][^]+?>([^]+?)</)[2],
                    link: 'https://news.wmtransfer.com' + newsItems[i].match(/href\=[\'\"]([^]+?)[\'\"][^]+?\>([^]+?)</)[1]
                });
            }
            result = newsArray;
        } else {
            result = rdz.errors.PARSE;
        }
        return {value: result};
    };
};

window.rdz.request.NewsRDS = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://www.recipdonor.com/rss/';
    this.source = 'ApplicationData';
    this.id = "NewsRDS";
    this.parseResponse = rdz.parsers.parseNewsXMLResult;
};

window.rdz.request.NewsSEWatch = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://searchenginewatch.com/rss';
    this.source = 'ApplicationData';
    this.id = "NewsSEWatch";
    this.parseResponse = rdz.parsers.parseNewsXMLResult;
};

window.rdz.request.NewsTrafficplanet = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://trafficplanet.com/rss/forums/1-trafficplanet/';
    this.source = 'ApplicationData';
    this.id = "NewsTrafficplanet";
    this.parseResponse = rdz.parsers.parseNewsXMLResult;
};

window.rdz.request.NewsWebmasterworld = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://www.webmasterworld.com/index.rss';
    this.source = 'ApplicationData';
    this.id = "NewsWebmasterworld";
    this.parseResponse = rdz.parsers.parseNewsXMLResult;
};

window.rdz.request.NewsSEJournal = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://feeds.feedburner.com/SearchEngineJournal';
    this.source = 'ApplicationData';
    this.id = "NewsSEJournal";
    this.parseResponse = rdz.parsers.parseNewsXMLResult;
};

window.rdz.request.NewsSELand = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://feeds.searchengineland.com/searchengineland';
    this.source = 'ApplicationData';
    this.id = "NewsSELand";
    this.parseResponse = rdz.parsers.parseNewsXMLResult;
};

window.rdz.request.NewsSeochat = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.serviceUrl = 'http://forums.seochat.com/rss/feed-all.xml';
    this.source = 'ApplicationData';
    this.id = "NewsSeochat";
    this.parseResponse = rdz.parsers.parseNewsXMLResult;
};

/**
 * @class DataRequest is inherited by each request for parameter (adding the same methods and attributes)
 * @param { String } url
 * @param { Function } constructor parameter's request is being executed
 * @param { Object } model is needed to save request in associated model
 *
 * @property {String} serviceUrl URL for request
 * @property {String} displayUrl default URL which is appended in html for redirect by click on parameter
 * @property {String} source is key which defines domain or domain+path for storing in rdz.cache
 * @property {String} id the same is parameter name in window.rdz.setting.params, rdz.cache[domain || domain+path][id]
 * @property {Function} parseResponse parses and returns result for serviceUrl (parseResponse which can be used more than twice should be in core/parsers)
 *
 */
window.rdz.request.DataRequest = function (url, constructor, model) {
    /** @lends model */
    if (url != null) {
        this.url = url;
        this.uri = rdz.utils.get_uri_obj(url);
        //url = url.replace(/#.*$/, '');
        this.domain = rdz.utils.domainFromUri(url).domain;
        this.page = rdz.utils.protolessUri(url);
    }

    //self is this.request in model
    var self = this;

    //model that sent XMLHttpRequest
    this.model = model;

    /*if mass_id is not undefined it's mass checks
     * mass_id uses as a hash in rds.cache*/
    this.mass_id = model.get('mass_id');

    this.cached = false;

    this.errorHandler = function (message) {
        var error = ['IG', 'MIG', 'IGP', 'BackG', 'PRgMain', 'TYC'].indexOf(self.id) > -1 ? rdz.errors.CAPTCHA : rdz.errors.HTTP;
        self.model.returnValue({
            value: error,
            id: self.id, /*cached:false,*/
            url: {url: self.url, domain: self.domain, page: self.page}
        });
    };

    function xhrWrapper() {
        self.xhrHandler.call(self, this);
    }

    this.caching = function (result) {
        if (typeof result.value === "number" && (result.value > -2 || result.value === rdz.errors.VIRUS) ||
            typeof result.value === "object" && (this.id !== 'TYC' || result.value.TYC > -2) ||
            typeof result.value === "string" ||
            typeof result.value === "boolean") {

            var path = [this.getKey(result), this.id];

            //if one of SESSION_<*> response, path should be "SESSION/<parameter name>/<page>"
            if (typeof result.action !== 'undefined') {
                switch (result.action) {
                    case 'API_HISTORY_COUNT':
                        path = [this.domain, this.id, result.param];
                        break;

                    case 'API_HISTORY':
                        path = [this.domain, this.id, result.param];
                        break;

                    default:
                        path.push(this.mass_id ? this.mass_id : this.page);
                }
            }

            if (rdz.db.period[this.id] && (typeof result.action === 'undefined' || this.mass_id)) {
                rdz.db.update(this.id, result.value, this.uri, this.mass_id, this.source);
            }

            rdz.cache.set(path, result.value);
        }
    };

    this.xhr = function (a) {

        var xhr = new XMLHttpRequest();
        xhr.onload = xhrWrapper;
        xhr.onerror = this.errorHandler;
        xhr.open(a.type, a.url);
        xhr.self = this;

        //setting headers
        if (a.header) {
            a.header.forEach(function (e, i) {
                xhr.setRequestHeader(e[0], e[1]);
            });
        }

        xhr.send(a.body);
    };

    this.xhrHandler = function (request) {

        var result = this.parseResponse(request.responseText, request, this);

        switch (result.action) {
            case 'SESSION_START':
                self.caching(result);
                self.execute();
                break;

            case 'SESSION_TIMER':
                /*show in tables (mass checks) any got values*/
                if (self.mass_id && result.value.Progress !== 0 && result.value.update_ready) {
                    self.return(result.value);

                    //remove data that was shown in UI
                    delete result.value['view_new_data'];
                }

                self.caching(result);
                self.timeout(rdz.timer['2000'] * result.value.RequestsCount);
                break;

            case 'SESSION_ENDED':
                //save last session object in session cache
                self.caching(result);

                //if not mass checks
                if (typeof result.value.value !== "undefined") {
                    //save value in parameter cache
                    delete result.action;

                    result.value = result.value.value;
                    self.caching(result);
                }

                self.return(result.value);
                break;

            case 'RESTART':
                self.caching(result);
                self.execute();
                break;

            case 'ERROR':
                // store session error to start new session next try
                let path = [this.getKey(result), this.id];
                rdz.cache.set(path, result.value);
                //console.log('ERROR', this, request);
                break;

            default :
                self.caching(result);
                self.return(result.value, result);
        }
    };

    this.return = function (value, parameters) {
        this.model.returnValue({
            value: value,
            parameters: parameters || null,
            id: self.id, /*cached:false,*/
            url: {url: self.url, domain: this.domain, page: self.page}
        });
    };

    this.timeout = function (timeout) {
        var self = this;
        setTimeout(function () {
            self.execute();
        }, timeout);
    };

    this.getKey = function (result) {
        /**@property source {string} defining path for cache.*/

        var k = self.source;
        //if one of SESSION_<*> response, path should be "SESSION/<parameter name>/<page>"
        if (result && typeof result.action !== 'undefined') {
            k = self.api.source;
        }

        return k;
    };

    this.getAPISession = function (id) {
        var date = new Date(),
            session = rdz.cache.get(['SESSION', id, this.mass_id ? this.mass_id : this.page]),
            exp = new Date(session && session["ExpireAt"] || session),
            error = session && session.Domains && session.Domains[0] && session.Domains[0].Values && session.Domains[0].Values[0].Errors;
        //return Id:null for api url
        return date < exp && !error ? session : { Id: null };
    };

    this.cache = function () {
        var cache;
        if (this.mass_id) {
            //cache = rdz.cache.get([this.mass_id]);
        } else {
            switch (this.id) {
                case 'HistoryCount':
                    cache = rdz.cache.get([this.domain, this.id, this.model.get('parameter')]);
                    break;

                case 'History':
                    cache = rdz.cache.get([this.domain, this.id, this.model.get('parameter')]);
                    break;

                default :
                    cache = rdz.cache.get([this.getKey(), this.id]);
            }
        }

        return cache;
    };

    this.execute = function () {
        var cache = this.cache();

        if (cache !== null && cache !== undefined && typeof this.model.ignore_cache === 'undefined') {
            this.cached = true;
            this.return(cache);
            //this.model.returnValue({value: cache, id: this.id, /*cached:true ,*/ url: {url: this.url, domain: this.domain, page: this.page}});
        } else {
            var extra = this.model.get('extra');
            //api was turned on
            if (extra && extra.api && extra.api.active &&
                    //and api for request should replace current request
                (typeof extra.api.request === 'undefined' || extra.api.request.indexOf(self.id) >= 0 )
            ) {
                if (rdz.user.get('balance') && rdz.user.get('balance') >= 0.005 ||
                        //requests which doesn't need money
                    ['AccountData', 'Prices', 'Recipients', 'HistoryCount', 'history_counters'].indexOf(this.model.get('name')) > -1
                ) {
                    var session = self.getAPISession(self.id);

                    self.api = window.rdz.api.APIClass({model: this.model, self: self, session: session});

                    //if request gets value from api
                    if (self.api.session &&
                            //if value doesn't exists or date are expired
                        session.Id === null) {
                        self.api = window.rdz.api.APINewSessionClass({model: this.model, self: self});
                    }

                    self.parseResponse = self.api.callback;

                    self.xhr({
                        type: self.api.type,
                        body: self.api.xhr_body || null,
                        url: self.api.url,
                        header: self.api.header || null
                    });

                } else {
                    //need money or is not authorized
                    self.return(rdz.user.logged ? rdz.errors.BUNKRUPT : rdz.errors.AUTHOR);
                }
            } else {
                self.xhr({
                    type: self.xhr_type || 'GET',
                    body: self.xhr_body || null,
                    url: this.serviceUrl,
                    header: self.header || null
                });
            }
        }
    };
};

