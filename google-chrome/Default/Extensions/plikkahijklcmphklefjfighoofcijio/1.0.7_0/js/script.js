// Transport
var yandex_wordstat_helper_transport = function (data, callback) {
    chrome.extension.sendMessage(data, callback);
};

// Yandex Wordstat Helper
var yandexWordstatHelperInit = function ($, window, transport) {


    // Версия
    var version = '1.0.7';


    // Смещение блока
    var offsetBlock = {
        base: 206,
        scroll: 68
    };


    // Настройки
    var options = {

        // Сортировка
        order: 'abc', // abc, count, 123
        sort: 'asc' // asc, desc

    };


    // Основной блок
    var bodyTpl =
        '<div class="ywh-body">' +
            '<div class="ywh-wrapper">' +
                '<div class="ywh-notice"></div>' +
                '<div class="ywh-border">' +
                    '<div class="ywh-yandex"><span>Y</span>andex Wordstat Helper {version}</div>' +
                    '<div class="ywh-icon">' +
                        '<span class="ywh-plus" title="Добавить слово"></span>' +
                        '<span class="ywh-copy" title="Копировать список в буфер обмена"></span>' +
                        '<span class="ywh-copy_count" title="Копировать список с частотностью в буфер обмена"><i class="ywh-count"></i></span>' +
                        '<span class="ywh-delete" title="Очистить список"></span>' +
                    '</div>' +
                    '<div class="ywh-content">' +
                        '<div class="ywh-sort">' +
                            '<span class="ywh-sort-abc" title="Сортировка по алфавиту"><i class="ywh-sort-txt">А-Я</i><i class="ywh-arrow_asc"></i></span>' +
                            '<span class="ywh-sort-123" title="Сортировка по порядку"><i class="ywh-sort-txt">123</i><i class="ywh-arrow_asc"></i></span>' +
                            '<span class="ywh-sort-count" title="Сортировка по частотности"><i class="ywh-eyes-wrap"><i class="ywh-eyes"></i></i><i class="ywh-arrow_asc"></i></span>' +
                        '</div>' +
                        '<ul class="ywh-list"></ul>' +
                        '<div class="ywh-info">' +
                            '<span title="Количество фраз"><i class="ywh-ab"></i><i class="ywh-info-count-words">...</i></span>' +
                            '<span title="Суммарная частотность"><i class="ywh-eyes_active"></i><i class="ywh-info-count">...</i></span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ywh-footer">' +
                        '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAYCAIAAAEG26qKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpDN0FBMTBBREJERDZFNDExOTlFMERBRkM4Nzc1M0QyQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoyODZCQkVGQkQ5RjAxMUU0QTA1QUIwNDlCM0YwMjM5NyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyODZCQkVGQUQ5RjAxMUU0QTA1QUIwNDlCM0YwMjM5NyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRBNDhGM0M4NzdEOUU0MTE4MUFCOTc4RDBBRkY4QUQ5IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkM3QUExMEFEQkRENkU0MTE5OUUwREFGQzg3NzUzRDJDIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+6RLtXgAABE5JREFUeNpi/P//PwMYsABx9aRt2lryTEBW27oTb959BAggRhRZRqvqLF9j5lesuvVZPjsPXwEIIIb/YFA1cSuQFHBvdkidDhJisKlZtOlUYc/GracfALkg0/yMFHm4OaJC7L3zZgG5AAGEMBYCmCDUrLXHv//+t+HYXSa4zMVHHyYs2st04/6rf//+n7z8iImF5eClh8xTT7Ex/f7Tv/5UaoiNs7Eyw+t3Xxgsq569/x5QssgzezZAAKGbD3Q4nO2gI7t/VgbU6XAPzFxzDMh48O7HiQefdl98qh3aA1WxetcFoMmqQV3nrz82ipkIZEt5te44ch0oBbIFaPL/Y635XRvEBHi83Y1//mO0Tuo/ubB4wcqDP3/8gKo4NCUZaLFdzlywT/+dXFFe074iIdhm0fqjKO6IKF/M6ljPYFeb3bYWLggQQOh+wQQsyByvnDnbz92HsOVFeePcDJqyPVBsAXoBwjj18NOBay8gXCZMY8HW/mfj5MRiCxCs2nH+6eefumqyx8/cRlGhG9535fHbWGedH7/+zFh97NaTtyUhFv+OtkDjHRgeiyoDnr/+/OX7ryevPwZ6mIpIiFjF9ywrD4j0MmJYvu2sf8G8e0/eMtjX3nzy/uS99x2Lj5T2bT7+4CPUpav3Xva21Zi28ujVuVnqod3mCX0K0sLvv/1u7luLcMfR8w+WHb0pLy0IEvj9/9efv0HuRrIyItuC2iB++981b59x9ASLuEkv3n29/fLz7gtPgOYDUfeC/SihPm/DyeJpu77++ashxndwZqYgPzQ8AAKMQLxcu/vi+KUH95+8u/bg1ZbzD37/+uNpoDCh1F9NXhSRLHEZsfngVb/KZaYq4o5GSsoyQorSIgKS4v+ZGM0jOuFqaqNt0WMWLU0DPQNJ1hDw4uOvkw8+Ltlz9dj9j8AkDpQFpnKgOAsDIXDv6du1uy49fPE+wt+KmYsL6CQ0Bege+f7j98nLD2esOb7y8A0gd26ZHw8HW3jTGkyjzVTFD87K5GBnRRhR3LOxb90pICPASlVJSijawxDof2CwP33/7cmnP4wMDOcv3dlz7Maag1eBavICTCeWBSBc8ev3H9P4yZcevMn0NpIQ5nU0U9FTldx+5PrK3Rcfv/nMzMiopyyeFGylJCv27N2XZ68+3X74srB/E1DzhflZ+urSoGxQ3LsZqH9ZTfC06uDqNJf2efuu3HkhJSZw/9mHs3demmjL8wnwMrBzHbv8eMaSfUryYmKCvPtm5QI1hlYtg5Zls3dfBJL+Tjov3nw2jppYn+669dA1+9y5F5//Y2AVmrbhZN+qo/8Z/gsJ8fi4GGfVLjLWluHg4QJquf38AzQB31qab5k6g9upEeK35tl7VnbGMjIyzth67t3n70CRYBtNFlYWJlbW5Uv3H7j5zD5t6su3X4Di3emuWGLk8csPqU2rd55/gDWCFcX4tvUnCvJziQvxEE6dxAMAazl0248xiIYAAAAASUVORK5CYII=" alt="" class="ywh-logo"> ' +
                        '<span>Разработано в <a href="http://arcticlab.ru/?utm_source=wsc" target="_blank">Арктической</a></span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';


    // Элемент списка
    var itemTpl = '<li><span>{word}</span>({count})<i class="ywh-del" title="Удалить из списка"></i></li>';


    // Содержимое виджета
    var body;


    // Основной блок содержимого
    var contentBlock = $('.b-wordstat-content');

    // Nano Templates
    $.nano = function (template, data) {
        return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
            var keys = key.split("."), value = data[keys.shift()];
            $.each(keys, function () {
                value = value[this];
            });
            return (value === null || value === undefined) ? "" : value;
        });
    };


    // Множественная форма слова
    function humanPluralForm(n, titles) {
        var cases = [2, 0, 1, 1, 1, 2];
        return titles[(n % 100 > 4 && n % 100 < 20) ? 2 : cases[Math.min(n % 10, 5)]];
    }


    // Добавление пробелов в числе между разрядами
    function numberSpaces(number) {
        return number.toString().replace(/(?=\B(?:\d{3})+\b)/g, '&nbsp;');
    }


    // Добавим виджет YWH в начало BODY
    $('BODY').prepend($.nano(bodyTpl, {
        version: version
    }));
    body = $('.ywh-body');


    // Отображать виджет YWH при выбраном поиске "По словам" и "По регионам"
    var selectedSearchType = function () {
        var el = $('input[name=search_type]:checked');
        if (el.val() == 'history') {
            body.hide();
        } else {
            body.show();
        }
    };
    $('input[name=search_type]').change(function () {
        selectedSearchType();
    });
    selectedSearchType();


    // Удаление елемента из списка
    $('.ywh-list').on('click', '.ywh-del', function () {
        list.remove($(this).parent().find('SPAN').text());
    });


    // Хранилище
    var storage = {

        // Сохранить
        save: function () {
            storage.saveData();
            storage.saveOptions();
        },

        // Сохранить данные
        saveData: function (ywhData) {
            if (!ywhData) {
                ywhData = list.data;
            }
            try {
                localStorage['YandexWordstatHelper'] = JSON.stringify(ywhData);
            } catch (e) {
                log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
            }
        },

        // Сохранить настройки
        saveOptions: function (ywhOptions) {
            if (!ywhOptions) {
                ywhOptions = options;
            }
            try {
                localStorage['YandexWordstatHelperOptions'] = JSON.stringify(ywhOptions);
            } catch (e) {
                log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
            }
        },

        // Загрузить
        load: function (update) {
            storage.loadData();
            storage.loadOptions();
            if (update) {
                list.update();
            }
        },

        // Загрузить данные
        loadData: function () {
            var ywhData = localStorage['YandexWordstatHelper'];
            if (ywhData != '' && ywhData != undefined) {
                try {
                    ywhData = JSON.parse(ywhData);
                } catch (e) {
                    log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                }
            }
            if (!$.isArray(ywhData)) {
                ywhData = [];
                storage.saveData(ywhData);
            }
            list.data = list.prepareDatas(ywhData);
        },

        // Загрузить настройки
        loadOptions: function () {
            var ywhOptions = localStorage['YandexWordstatHelperOptions'];
            if (ywhOptions != '' && ywhOptions != undefined) {
                try {
                    ywhOptions = JSON.parse(ywhOptions);
                } catch (e) {
                    log.show('<b>Ошибка:</b><br/> ' + e.name, 'error');
                }
            }
            if (!(ywhOptions && ('order' in ywhOptions) && ('sort' in ywhOptions))) {
                ywhOptions = options;
                storage.saveOptions(ywhOptions);
            }
            options = ywhOptions;
        }

    };


    // Лог
    var log = {


        // Таймер
        timer: undefined,


        // Показать
        show: function (text, type) {
            var notice = '<div class="ywh-alert-' + type + '">' + text + '</div>';
            $('.ywh-notice').html(notice);
            $('.ywh-notice').stop(true, true).show();
            clearTimeout(log.timer);
            log.timer = setTimeout(function () {
                $('.ywh-notice').fadeOut(300);
            }, 2000);
        }

    };


    // Действия со списком
    var list = {


        // Данные
        data: [],


        // Обновить
        update: function () {
            var html = '';
            var count = 0;
            var listData = list.sortData();
            for (var i = 0; i < listData.length; ++i) {
                var w = listData[i].word;
                var c = listData[i].count > 0 ? numberSpaces(listData[i].count) : '?';
                html += $.nano(itemTpl, {word: w, count: c});
                count += listData[i].count;
            }
            $('.ywh-list').html(html);

            var lenght = $('.ywh-list LI').length;
            $('.ywh-info-count-words').html(lenght > 0 ? numberSpaces(lenght) : '...');
            $('.ywh-info-count').html(count > 0 ? numberSpaces(count) : '...');
        },


        // Добавить
        add: function (word, count) {

            // Подготовим данные
            var data = list.prepareData(word, count);
            if (!data) {
                return;
            }

            // Уже есть в списке?
            if (list.has(data.word)) {
                log.show('<b>' + data.word + '</b><br/> уже есть в списке', 'warning');
                return;
            }

            // Добавить фразу в список
            list.data.push(data);

            // Обновить и сохранить
            list.update();
            storage.save();

            // Сообщение
            log.show('<b>' + word + '</b><br/> добавлено в список', 'success');
        },


        // Удалить фразу
        remove: function (word) {

            // Подготовить фразу
            word = $.trim(word);
            if (word == '') {
                return;
            }

            // Удалить
            list.data = list.data.filter(function (item) {
                return item.word != word;
            });

            // Обновить и сохранить
            list.update();
            storage.save();

            // Сообщение
            log.show('<b>' + word + '</b><br/> удалено из списка', 'info');
        },


        // Очистить список
        clear: function () {
            if (confirm('Вы действительно хотите очистить список слов?')) {

                // Очистить
                list.data = [];

                // Сохранить и обновить
                list.update();
                storage.save();

                // Сообщение
                log.show('Список очищен', 'info');
            }
        },

        // Копировать
        copy: function (withCount) {

            // А есть что копировать?
            if (list.data.length == 0) {
                log.show('Нет слов для копирования', 'warning');
                return;
            }

            // Подготовим текст
            var text = '',
                listData = list.sortData();
            $.each(listData, function (i, item) {
                if (text != '')
                    text += '\n';
                text += item.word + (withCount ? '\t' + item.count : '');
            });

            // Копируем
            var config = {
                action: 'copy',
                text: text
            };
            transport(config, function (response) {
                if (response.result) {
                    log.show('<b>Список скопирован в буфер обмена', 'success');
                } else {
                    log.show('<b>Ошибка:</b><br/>Не удалось скопировать список в буфер обмена', 'error');
                }
            });

        },


        // Проверка на наличие фразы
        has: function (word) {

            // Подготовить фразу
            word = $.trim(word);
            if (word == '') {
                return false;
            }

            // Проверка на наличие
            return list.data.some(function (item) {
                return item.word == word;
            });
        },

        /**
         * Возвращает подготовленные данные
         * @returns array
         */
        prepareData: function (word, count) {

            // Подготовить фразу
            word = $.trim(word);
            if (typeof(word) != 'string' || word == '') {
                return false;
            }

            // Подготовить частотность
            count = parseInt((count + '').replace(/[^\d]/gi, ''));
            if (isNaN(count)) {
                count = 0;
            }

            // Вернуть результат
            return {
                word: word,
                count: count
            };

        },

        /**
         * Возвращает подготовленные данные массива
         * @returns array
         */
        prepareDatas: function (listWord) {

            var result = [];
            if ($.isArray(listWord)) {
                for (var i = 0; i < listWord.length; ++i) {
                    if (typeof(listWord[i]) == 'object') {
                        var data = list.prepareData(
                            listWord[i].word ? listWord[i].word : '',
                            listWord[i].count ? listWord[i].count : 0
                        );
                        if (data) {
                            result.push(data);
                        }
                    } else if (typeof(listWord[i]) == 'string') {
                        var data = list.prepareData(listWord[i], 0);
                        if (data) {
                            result.push(data);
                        }
                    }
                }
            }

            // Вернуть результат
            return result;
        },

        /**
         * Возвращает отсортированные данные
         * @returns array
         */
        sortData: function () {

            // Клонируем список
            var data = list.data.slice(0);

            // Сортировка
            switch (options.order) {

                // По алфавиту
                case 'abc':
                    data.sort(function (a, b) {
                        var compA = a.word.toUpperCase();
                        var compB = b.word.toUpperCase();
                        if (compA == compB) {
                            return 0;
                        }
                        return (compA > compB) ? 1 : -1;
                    });
                    break;

                // По частотности
                case 'count':
                    data.sort(function (a, b) {
                        var compA = a.count;
                        var compB = b.count;
                        if (compA == compB) {
                            return 0;
                        }
                        return (compA > compB) ? 1 : -1;
                    });
                    break;

            }

            // Порядок
            if (options.sort == 'desc') {
                data.reverse();
            }

            // Результат
            return data;
        }

    };


    // Добавление элементов управления
    var addElements = function () {
        observer.disconnect();

        // Кнопки добавления / удаления фраз
        var template = '<span class="ywh-action">' +
            '<b class="ywh-remove" style="display: none;" title="Удалить из списка">−</b>' +
            '<b class="ywh-add" style="display: none;" title="Добавить в список">+</b>' +
            '</span>';
        $('.b-phrase-link').before(template);
        $('.ywh-action').each(function () {
            var word = $(this).next().text();
            word = $.trim(word);
            if (list.has(word)) {
                $('.ywh-remove', this).data('word', word);
                $('.ywh-remove', this).show();
            } else {
                $('.ywh-add', this).data('word', word);
                $('.ywh-add', this).show();
            }
        });
        $('.ywh-add').click(function () {
            list.add(
                $(this).parent().next().text(),
                $(this).parent().parent().next().text()
            );
            $(this).parent().find('.ywh-add').hide();
            $(this).parent().find('.ywh-remove').show();
        });
        $('.ywh-remove').click(function () {
            list.remove($(this).parent().next().text());
            $(this).parent().find('.ywh-add').show();
            $(this).parent().find('.ywh-remove').hide();
        });

        // Добавить/удалить все фразы
        var addAllTpl = '<div class="ywh-allWrap"><b class="ywh-addAll">Добавить все слова</b>/<b class="ywh-removeAll">Удалить все слова</b></div>';
        $('.b-word-statistics__table').before(addAllTpl);
        $('.ywh-addAll').click(function () {
            if (confirm('Вы действительно хотите добавить в список все слова из этой таблицы?')) {
                var c = list.data.length;
                $(this).closest('.b-word-statistics__column').find('.ywh-add').click();
                c = list.data.length - c;
                if (c > 0) {
                    log.show('<b>' + c + ' ' + humanPluralForm(c, ['слово', 'слова', 'слов']) + '</b> добавлено в список', 'success');
                } else {
                    log.show('В список не было добавлено ни одного слова', 'warning');
                }
            }
        });
        $('.ywh-removeAll').click(function () {
            if (confirm('Вы действительно хотите удалить из списка все слова из этой таблицы?')) {
                var c = list.data.length;
                $(this).closest('.b-word-statistics__column').find('.ywh-remove').click();
                c = c - list.data.length;
                if (c > 0) {
                    log.show('<b>' + c + ' ' + humanPluralForm(c, ['слово', 'слова', 'слов']) + '</b> удалено из списока', 'success');
                } else {
                    log.show('Из списка не было удалено ни одного слова', 'warning');
                }
            }
        });

        doObserver();
    };


    // Отслеживание изменений
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = new MutationObserver(addElements);
    var doObserver = function () {
        observer.observe(contentBlock.get(0), {childList: true, subtree: true});
    };
    addElements();
    doObserver();


    $('.ywh-plus').click(function () {
        var word = prompt('Введите слово для добавления в список');
        list.add(word);
    });
    $('.ywh-copy').click(function () {
        list.copy(false);
    });
    $('.ywh-copy_count').click(function () {
        list.copy(true);
    });
    $('.ywh-delete').click(list.clear);
    $('.ywh-sort-abc').click(function () {
        updateSort('abc');
    });
    $('.ywh-sort-123').click(function () {
        updateSort('123');
    });
    $('.ywh-sort-count').click(function () {
        updateSort('count');
    });
    var updateSort = function (order, sort) {
        var orders = ['abc', '123', 'count'];
        for (var i = 0; i < orders.length; ++i) {
            var el = $('.ywh-sort-' + orders[i]);
            el.toggleClass('ywh-sort-active', order == orders[i]);
        }

        var ywhSortActive = $('.ywh-sort-active'),
            ywhArrowAsc = ywhSortActive.find('I.ywh-arrow_asc'),
            ywhArrowDesc = ywhSortActive.find('I.ywh-arrow_desc');
        if (sort == undefined) {
            if (ywhArrowAsc.length) {
                sort = 'asc';
            } else if (ywhArrowDesc.length) {
                sort = 'desc';
            }

            if (options.order == order) {
                sort = (sort == 'asc') ? 'desc' : 'asc';
            }
        }
        if (ywhArrowAsc.length && sort == 'desc') {
            ywhArrowAsc.addClass('ywh-arrow_desc').removeClass('ywh-arrow_asc');
        } else if (ywhArrowDesc.length && sort == 'asc') {
            ywhArrowDesc.addClass('ywh-arrow_asc').removeClass('ywh-arrow_desc');
        }

        options.order = order;
        options.sort = sort;
        list.update();
    };
    updateSort(options.order, options.sort);


    // Загрузка и синхронизация
    storage.load(true);
    setTimeout(function () {
        storage.load(true);
    }, 2000);


    // Плавучесть блока
    $(window).scroll(
        function () {
            if ($(window).scrollTop() > (offsetBlock.base - offsetBlock.scroll)) {
                body.css({
                    top: offsetBlock.scroll + 'px',
                    position: 'fixed'
                });
            } else {
                body.css({
                    top: offsetBlock.base + 'px',
                    position: 'absolute'
                });
            }
        }).scroll();


};
jQuery(function () {
    yandexWordstatHelperInit(jQuery, window, yandex_wordstat_helper_transport);
});


// no conflict
jQuery.noConflict();