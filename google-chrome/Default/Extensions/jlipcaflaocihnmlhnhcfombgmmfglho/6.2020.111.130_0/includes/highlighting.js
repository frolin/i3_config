function manageNodeStyle(elem, style, event) {
    var element_styles = elem.style.cssText || '';
    if (!event) {
        return element_styles + ';' + style;
    } else {
        return element_styles.replace(style, '');
    }
}

function getNode(elem, dir, until) {
    var matched = [],
        cur = elem[dir];

    while (cur && cur.nodeType !== 9) {
        if (until !== undefined && cur.nodeName.toLowerCase() === until) {
            matched.push(cur);
        }
        cur = cur[dir];
    }
    return matched;
}

function decorateChildTag(elem, tag, data, event) {
    var children = elem.getElementsByTagName(tag) || [],
        i = children.length,
        decorated = false;

    if (event === 'outlinks') {
        let origin = window.rdz.utils.domainFromUri(window.location.href).domain.toLowerCase();

        function _decorateAllOuter(links, start) {
            var children = elem.getElementsByTagName(tag),
                domain, child, child_domain, img, child_node,
                start_time = +new Date();


            setTimeout(function () {

                for (var i = children.length, n = start || 0; (+new Date() - start_time < 25) && n < i; n++) {
                    for (var l = links.length, j = 0; j < l; j++) {

                        domain = links[j];
                        child = children[n].getAttribute('href');
                        child_domain = window.rdz.utils.domainFromUri(child).domain;

                        if (typeof child_domain !== 'undefined') {
                            child = child.toLowerCase();
                            child_domain = child_domain.toLowerCase();

                            if (domain[1] === child) {

                                // poor way to fix image's and elements highlight
                                img = children[n].getElementsByTagName('img')[0];

                                if (typeof img !== 'undefined') {
                                    img.classList.add(data[0]);
                                } else {
                                    children[n].classList.add(data[0]);
                                }

                                child_node = children[n].childNodes[0];
                                if (child_node && child_node.nodeType === 1) {
                                    child_node.classList.add(data[0]);
                                }
                            }
                        }
                    }
                }

                if (n !== i) {
                    _decorateAllOuter(links, n);
                }

            }, 15);
        }

        //define which is outer
        function _returnOuterLinks(links) {
            var origin_name = window.rdz.utils.SubstractDomainName(origin),
                l = links.length, n = 0,
                outer_links = [],
                link, link_first_symb,
                domain_str, domain_arr, j, check;

            for (; n < l; n++) {
                check = false;
                link = links[n];
                link_first_symb = link.substring(0, link.indexOf('http')).length;
                domain_str = window.rdz.utils.domainFromUri(link).domain;

                if (typeof domain_str !== 'undefined' &&

                        // 0 - normal start string; 1 - \n start string
                    ((link_first_symb === 0) || (link_first_symb === 1)) &&

                        // an outer link must contain protocol?
                    (link.indexOf('http') !== -1)) {

                    domain_str = punycode.ToASCII(domain_str.toLowerCase());
                    domain_arr = domain_str.split('.');


                    for (j = domain_arr.length; j--;) {
                        if (origin === domain_str || (domain_arr[j] === origin_name[0] &&
                            domain_str.substring(domain_str.indexOf(origin_name[0]) + origin_name[0].length) === origin_name[1])) check = true;
                        if (j === 0 && !check) {
                            outer_links.push([domain_str, link.toLowerCase()]);

                        }
                    }
                }

            }
            _decorateAllOuter(outer_links);

        }

        //collecting href
        function _getTrueOuter(response) {
            var links = [],
                regExps = [new RegExp("<noindex([\\s\\S]*?)</noindex>", "gi"),
                    new RegExp("<script([\\s\\S]*?)</script>", "gi"),
                    new RegExp("<noscript([\\s\\S]*?)</noscript>", "gi"),
                    new RegExp("<textarea([\\s\\S]*?)</textarea>", "gi"),
                    new RegExp("<!--([\\s\\S]*?)-->", "gi"),
                    new RegExp("<!--noindex--([\\s\\S]*?)<!--/noindex-->", "gi")],

                r = regExps.length,
                aTagRegExp = new RegExp("<a[^]+?>", "gmi"),
                hrefRegExp = new RegExp(`href=["']([^]+?)["']`, 'i'),
                ampRegExp = new RegExp('&amp;', 'g'),
                href;

            for (; r--;) {
                response = response.replace(regExps[r], '');
            }
            response = response.match(aTagRegExp) || [];

            let l = response.length;

            for (let i = 0; i < l; i++) {
                href = response[i].match(hrefRegExp);
                if (!(response[i].indexOf('rel=') !== -1 && response[i].indexOf('nofollow') !== -1) && href) {
                    href = href[1];

                    if (href) links.push(href.replace(ampRegExp, '&'));
                }
            }
            _returnOuterLinks(links);
        }

        //send request to find links which aren't loading by scripts
        window.rdz.utils.xhr(window.location.href, _getTrueOuter);
    }

    if (['nofollow', 'sponsored', 'ugc'].includes(event)) {
        let node, parent;
        for (let re = new RegExp(event); i--;) {
            node = children[i];
            if (node.nodeName.toLowerCase() === 'a' && re.test(node.getAttribute('rel'))) {
                node.classList.add(data);
            }

            if (node.nodeName.toLowerCase() === 'img') {
                parent = getNode(node, 'parentNode', 'a')[0];
                if (parent && re.test(parent.getAttribute('rel'))) {
                    node.classList.add(data);
                }
            }
        }
    }

    if (event === 'canonical') {
        let node, parent;
        for (; i--;) {
            node = children[i];
            if (node.nodeName.toLowerCase() === 'a') {
                node.classList.add(data);
            }

            if (node.nodeName.toLowerCase() === 'img') {
                parent = getNode(node, 'parentNode', 'a')[0];
                if (parent) {
                    node.classList.add(data);
                }
            }
        }
    }

    if (event === 'displaynone') {
        let rds_bar = rdz.$('div.rds-bar')[0];
        for (; i--;) {
            if (children[i].getAttribute('style') &&
                (/display:\s*none/i).test(children[i].getAttribute('style')) &&
                (!rds_bar || !rdz.$.contains(rds_bar, children[i]))
            ) {
                decorated = true;
                children[i].classList.add(data[0]);
            }
        }

        if (decorated) {
            if (data[2].show_notification) { // show the notification
                rdz.utils.showNotification(rdz.locale.notification.displaynone, {
                    openerClass: 'displaynone',
                    css: data[2].css,
                    selector: '.rds-notification-displaynone',
                    doNotShowAgain: true
                });
            }
        }
    }
}
function decorateTag(event, data, tag) {
    var parents;

    if (event === 'noindex') {
        parents = document.getElementsByTagName(event);
        for (let i = 0, l = parents.length; i < l; i++) {
            parents[i].classList.add(data[0]);
        }

        if (data[2] && parents.length > 0) {
            rdz.utils.showNotification(rdz.locale.notification.noindex, {
                openerClass: 'noindex',
                css: {backgroundColor: '#DAA520'},
                selector: '.rds-notification-noindex',
                doNotShowAgain: true
            });
        }
    }

    if (event === 'robots') {
        parents = document.links;
        for (let i = 0, l = parents.length; i < l; i++) {
            parents[i].classList.add(data[0]);
        }
    }

    if (['nofollow', 'sponsored', 'ugc', 'canonical', 'outlinks', 'displaynone'].includes(event)) {
        decorateChildTag(document.body || document.firstElementChild, tag, data, event);
    }
}
function FixCommentsNoindexs() {
    var el = document.getElementsByTagName('*'),
        i = el.length,
        element, noindex, app_noindex, l, n;

    //appending noindex tags
    for (; i--;) {
        if (el[i].childNodes) {
            element = el[i].childNodes;
            n = element.length;
            for (; n--;) {
                if (element[n].nodeType === 8 && element[n].nodeValue === 'noindex') {
                    noindex = document.createElement('noindex');
                    element[n].parentNode.insertBefore(noindex, element[n + 1]);
                }
            }
        }
    }

    //filling empty noindex
    app_noindex = document.getElementsByTagName('noindex');
    l = app_noindex.length;
    for (; l--;) {

        if (app_noindex[l].previousSibling &&
            app_noindex[l].previousSibling.nodeType === 8 &&
            app_noindex[l].previousSibling.nodeValue === 'noindex') {
            while (app_noindex[l].nextSibling &&
                //app_noindex[l].nextSibling.nodeType !== 8 &&
            app_noindex[l].nextSibling.nodeValue !== '/noindex') {
                app_noindex[l].appendChild(app_noindex[l].nextSibling);
            }
        }
    }
}
function CreateCSS(data, name, styleNode) {
    let str = '';
    for (let i in data) {
        if (data[i].name === 'clr_bg_txt_and_img') {
            str += `.${name}_clr_bg_txt_and_img, .${name}_clr_bg_txt_and_img * { color: ${data[i].value[1]} !important; background-color: #${data[i].value[0]} !important;}`;
        }
        if (data[i].name === 'cross_txt') {
            str += `.${name}_cross_txt, .${name}_cross_txt * { text-decoration: line-through !important; }`;
        }
    }

    styleNode.textContent += str;
}

function StartHilighting(data) {
    let styleNode = document.createElement('style');
    styleNode.id = 'rds_highlighting';
    document.head.appendChild(styleNode);

    let origin = window.rdz.utils.domainFromUri(window.location.href).domain.toLowerCase();

    var v, options = data.options;

    // NoIndex
    if (rdz.locale.locale === 'ru' && rdz.utils.returnOption(options.NoIndex, 'example').active &&
        !window.rdz.utils.isDomainInList(origin, rdz.utils.returnOption(options.NoIndex, 'exceptions').value)) {
        var notifyNoIndex = false;
        if (rdz.utils.returnOption(options.NoIndex, 'clr_bg_txt_and_img').active ||
            rdz.utils.returnOption(options.NoIndex, 'cross_txt').active) {
            notifyNoIndex = true;
            FixCommentsNoindexs();
            CreateCSS(options.NoIndex, 'NoIndex', styleNode);
        }

        notifyNoIndex = notifyNoIndex && rdz.utils.returnOption(options.NoIndex, 'show_notification').active;

        if (rdz.utils.returnOption(options.NoIndex, 'clr_bg_txt_and_img').active) {
            decorateTag('noindex', ['NoIndex_clr_bg_txt_and_img', null, notifyNoIndex], null);
        }

        if (rdz.utils.returnOption(options.NoIndex, 'cross_txt').active) {
            decorateTag('noindex', ['NoIndex_cross_txt', null, notifyNoIndex], null);
        }
    }

    // NoFollow
    if (rdz.utils.returnOption(options.NoFollow, 'example').active) {
        let cssText = '';

        v = rdz.utils.returnOption(options.NoFollow, 'clr_bg_txt_and_img');
        if (v.active) cssText += `background-color: #${v.value[0]}; color: ${v.value[1]};`;

        v = rdz.utils.returnOption(options.NoFollow, 'clr_brdr_txt');
        if (v.active) cssText += `outline: 1px dashed #${v.value[0]};`;

        v = rdz.utils.returnOption(options.NoFollow, 'cross_txt');
        if (v.active) cssText += `text-decoration: line-through !important;`;

        if (cssText) {
            styleNode.textContent += `a.rds_hl_nofollow {${cssText}}`;
            decorateTag('nofollow', 'rds_hl_nofollow', 'a');
        }

        v = rdz.utils.returnOption(options.NoFollow, 'clr_brdr_img');
        if (v.active) {
            styleNode.textContent += `img.rds_hl_nofollow {outline: 1px dashed #${v.value[0]};}`;
            decorateTag('nofollow', 'rds_hl_nofollow', 'img');
        }
    }

    // Sponsored
    if (rdz.utils.returnOption(options.Sponsored, 'example').active) {
        let cssText = '';

        v = rdz.utils.returnOption(options.Sponsored, 'clr_bg_txt_and_img');
        if (v.active) cssText += `background-color: #${v.value[0]}; color: ${v.value[1]};`;

        v = rdz.utils.returnOption(options.Sponsored, 'clr_brdr_txt');
        if (v.active) cssText += `outline: 1px dashed #${v.value[0]};`;

        v = rdz.utils.returnOption(options.Sponsored, 'cross_txt');
        if (v.active) cssText += `text-decoration: line-through !important;`;

        if (cssText) {
            styleNode.textContent += `a.rds_hl_sponsored {${cssText}}`;
            decorateTag('sponsored', 'rds_hl_sponsored', 'a');
        }

        v = rdz.utils.returnOption(options.Sponsored, 'clr_brdr_img');
        if (v.active) {
            styleNode.textContent += `img.rds_hl_sponsored {outline: 1px dashed #${v.value[0]};}`;
            decorateTag('sponsored', 'rds_hl_sponsored', 'img');
        }
    }

    // UGC
    if (rdz.utils.returnOption(options.UGC, 'example').active) {
        let cssText = '';

        v = rdz.utils.returnOption(options.UGC, 'clr_bg_txt_and_img');
        if (v.active) cssText += `background-color: #${v.value[0]}; color: ${v.value[1]};`;

        v = rdz.utils.returnOption(options.UGC, 'clr_brdr_txt');
        if (v.active) cssText += `outline: 1px dashed #${v.value[0]};`;

        v = rdz.utils.returnOption(options.UGC, 'cross_txt');
        if (v.active) cssText += `text-decoration: line-through !important;`;

        if (cssText) {
            styleNode.textContent += `a.rds_hl_ugc {${cssText}}`;
            decorateTag('ugc', 'rds_hl_ugc', 'a');
        }

        v = rdz.utils.returnOption(options.UGC, 'clr_brdr_img');
        if (v.active) {
            styleNode.textContent += `img.rds_hl_ugc {outline: 1px dashed #${v.value[0]};}`;
            decorateTag('ugc', 'rds_hl_ugc', 'img');
        }
    }

    // Canonical
    let isCanonical = function () {
        let canonical = Array.prototype.filter.call(document.head.getElementsByTagName('link') || [], m => m.rel === 'canonical')[0];
        if (canonical) {
            let cHref = new URL(canonical.href),
                lHref = new URL(document.location.href);
            if (cHref.origin + cHref.pathname === lHref.origin + lHref.pathname) {
                let cParts = cHref.search.replace(/^\?|#.*/g, '').split('&'),
                    lParts = lHref.search.replace(/^\?|#.*/g, '').split('&');

                return !cParts[0] ? false : !cParts.every(part => lParts.find(x => x === part));
            } else {
                return true;
            }
        }
        return false;
    };

    if (rdz.utils.returnOption(options.Canonical, 'example').active && isCanonical()) {
        let cssText = '';

        v = rdz.utils.returnOption(options.NoFollow, 'clr_bg_txt_and_img');
        if (v.active) cssText += `background-color: #${v.value[0]}; color: ${v.value[1]};`;

        v = rdz.utils.returnOption(options.NoFollow, 'clr_brdr_txt');
        if (v.active) cssText += `outline: 1px dashed #${v.value[0]};`;

        v = rdz.utils.returnOption(options.NoFollow, 'cross_txt');
        if (v.active) cssText += `text-decoration: line-through !important;`;

        if (cssText) {
            styleNode.textContent += `a.rds_hl_canonical {${cssText}}`;
            decorateTag('canonical', 'rds_hl_canonical', 'a');
        }

        v = rdz.utils.returnOption(options.NoFollow, 'clr_brdr_img');
        if (v.active) {
            styleNode.textContent += `img.rds_hl_canonical {outline: 1px dashed #${v.value[0]};}`;
            decorateTag('canonical', 'rds_hl_canonical', 'img');
        }
    }

    // Robots
    let robots = Array.prototype.filter.call(document.head.getElementsByTagName('meta') || [], m => m.name === 'robots')[0];
    if (rdz.utils.returnOption(options.Robots, 'example').active && robots && /noindex|nofollow/.test(robots.content) &&
        !window.rdz.utils.isDomainInList(origin, rdz.utils.returnOption(options.NoIndex, 'exceptions').value)) {
        let notifyNoIndex = false;
        if (rdz.utils.returnOption(options.NoIndex, 'clr_bg_txt_and_img').active ||
            rdz.utils.returnOption(options.NoIndex, 'cross_txt').active) {
            CreateCSS(options.NoIndex, 'NoIndex', styleNode);
        }

        if (rdz.utils.returnOption(options.NoIndex, 'clr_bg_txt_and_img').active) {
            decorateTag('robots', ['NoIndex_clr_bg_txt_and_img', null, notifyNoIndex], null);
        }

        if (rdz.utils.returnOption(options.NoIndex, 'cross_txt').active) {
            decorateTag('robots', ['NoIndex_cross_txt', null, notifyNoIndex], null);
        }
    }

    // OuterLinks
    if (rdz.utils.returnOption(options.OuterLinks, 'example').active &&
        !window.rdz.utils.isDomainInList(origin, rdz.utils.returnOption(options.OuterLinks, 'exceptions').value)) {
        let cssText = '';

        v = rdz.utils.returnOption(options.OuterLinks, 'clr_bg_txt_and_img');
        if (v.active) cssText += `background-color: #${v.value[0]}; color: ${v.value[1]};`;

        v = rdz.utils.returnOption(options.OuterLinks, 'clr_brdr_txt_and_img');
        if (v.active) cssText += `outline: 1px dashed #${v.value[0]};`;

        v = rdz.utils.returnOption(options.OuterLinks, 'cross_txt');
        if (v.active) cssText += `text-decoration: line-through !important;`;

        if (cssText) {
            styleNode.textContent += `a.rds_hl_outlinks {${cssText}}`;
            decorateTag('outlinks', ['rds_hl_outlinks'], 'a');
        }
    }

    // DisplayNone
    if (rdz.utils.returnOption(options.DisplayNone, 'example').active &&
        !window.rdz.utils.isDomainInList(origin, rdz.utils.returnOption(options.DisplayNone, 'exceptions').value)) {
        v = rdz.utils.returnOption(options.DisplayNone, 'clr_bg_txt_and_img');
        if (v.active) {
            styleNode.textContent += `.rds_hl_displaynone {display: block !important; background-color: #${v.value[0]}; color: ${v.value[1]};}`;
            decorateTag('displaynone', ['rds_hl_displaynone',
                    null,
                    {
                        show_notification: rdz.utils.returnOption(options.DisplayNone, 'show_notification').active,
                        css: {backgroundColor: '#' + v.value[0]}
                    }
                ],
                '*');
        }
    }
}

function stopHighlighting() {
    let styleNode = document.getElementById('rds_highlighting');
    document.head.removeChild(styleNode);

    [
        'NoIndex_clr_bg_txt_and_img', 'NoIndex_cross_txt',
        'rds_hl_nofollow', 'rds_hl_sponsored', 'rds_hl_ugc',
        'rds_hl_canonical', 'rds_hl_outlinks', 'rds_hl_displaynone'
    ].forEach(cssClass => {
        let nodes = document.getElementsByClassName(cssClass);
        for (let node of nodes) node.classList.remove(cssClass);
    });

    // remove notifications also
    document.querySelectorAll('.rds-bar-notification.displaynone, .rds-bar-notification.noindex').forEach(x => x.remove())
}

function toggleHighlighting() {
    if (document.getElementById('rds_highlighting')) {
        stopHighlighting();
    } else {
        chrome.storage.local.get([
            'NoIndex', 'Robots',
            'NoFollow', 'Sponsored', 'UGC',
            'Canonical', 'OuterLinks', 'DisplayNone'
        ], settings => StartHilighting({ options: settings }));
    }
}
