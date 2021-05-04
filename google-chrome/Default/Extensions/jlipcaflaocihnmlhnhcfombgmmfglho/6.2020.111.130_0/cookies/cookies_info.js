// Compares cookies for "key" (name, domain, etc.) equality, but not "value"
// equality.
function cookieMatch(c1, c2) {
  return (c1.name == c2.name) && (c1.domain == c2.domain) &&
    (c1.hostOnly == c2.hostOnly) && (c1.path == c2.path) &&
    (c1.secure == c2.secure) && (c1.httpOnly == c2.httpOnly) &&
    (c1.session == c2.session) && (c1.storeId == c2.storeId);
}

// Returns an array of sorted keys from an associative array.
function sortedKeys(array) {
  return Object.keys(array).sort();
}

// Shorthand for document.querySelector.
function select(selector) {
  return document.querySelector(selector);
}

// An object used for caching data about the browser's cookies, which we update
// as notifications come in.
function CookieCache() {
  this.cookies_ = {};

  this.length = function () {
    return Object.keys(this.cookies_).length;
  };

  this.add = function (cookie) {
    var domain = cookie.domain;
    if (!this.cookies_[domain]) {
      this.cookies_[domain] = [];
    }
    this.cookies_[domain].push(cookie);
  };

  this.remove = function (cookie) {
    var domain = cookie.domain;
    if (this.cookies_[domain]) {
      var i = 0;
      while (i < this.cookies_[domain].length) {
        if (cookieMatch(this.cookies_[domain][i], cookie)) {
          this.cookies_[domain].splice(i, 1);
        } else {
          i++;
        }
      }
      if (this.cookies_[domain].length == 0) {
        delete this.cookies_[domain];
      }
    }
  };

  // Returns a sorted list of cookie domains that match |filter|. If |filter| is
  //  null, returns all domains.
  this.getDomains = function (filter) {
    var result = [];
    sortedKeys(this.cookies_).forEach(function (domain) {
      if (!filter || domain.indexOf(filter) != -1) {
        result.push(domain);
      }
    });
    return result;
  };

  this.getCookies = function (domain) {
    return this.cookies_[domain];
  };
}
var cache = new CookieCache();

function removeAllForFilter() {
  var filter = select("#filter").value;
  cache.getDomains(filter).forEach(domain => removeCookiesForDomain(domain));
}

function removeCookiesForDomain(domain) {
  cache.getCookies(domain).forEach(cookie => removeCookie(cookie));
}

function removeCookie(cookie) {
  var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
  chrome.cookies.remove({ "url": url, "name": cookie.name });
}

function addCookie(data) {

}

function resetTree() {
  let tree = select('ul[role="tree"]');
  if (tree) tree.remove();
}

function reloadCookieTable() {
  var filter = select("#filter").value;
  var domains = cache.getDomains(filter);

  // select("#filter_count").innerText = domains.length;
  // select("#total_count").innerText = cache.length;

  resetTree();
  var tree = document.createElement('ul');
  tree.setAttribute('role', 'tree');

  domains.forEach(domain => {
    var cookies = cache.getCookies(domain);

    let treeItem = document.createElement('li');
    treeItem.setAttribute('role', 'treeitem');
    treeItem.setAttribute('aria-expanded', 'false');
    treeItem.onfocus = () => {
      ['name', 'value', 'domain', 'path', 'secure', 'expirationDate']
        .forEach(x => { select('#ci_' + x).textContent = '<no cookie selected>'; });
    };
    treeItem.onkeydown = evt => {
      if (evt.key !== 'Delete') return;
      evt.stopPropagation();
      removeCookiesForDomain(domain);
      treeItem.remove();
    };

    let label = document.createElement('span');
    label.textContent = domain; // + ' (' + cookies.length + ')';
    treeItem.appendChild(label);

    let treeNode = document.createElement('ul');
    treeNode.setAttribute('role', 'group');
    cookies.forEach(cookie => {
      let leaf = document.createElement('li');
      leaf.setAttribute('role', 'none');

      let item = document.createElement('a');
      item.textContent = cookie.name || cookie.domain;
      item.setAttribute('role', 'treeitem');
      item.onfocus = () => {
        ['name', 'value', 'domain', 'path']
          .forEach(x => { select('#ci_' + x).textContent = cookie[x]; });
        select('#ci_secure').textContent = cookie.secure ? 'Secure connections only' : 'Any kind of connection';
        select('#ci_expirationDate').textContent = cookie.session ? 'When the browsing session ends'
          : new Date(cookie.expirationDate * 1000).toLocaleString();
      };
      item.onkeydown = evt => {
        if (evt.key !== 'Delete') return;
        evt.stopPropagation();
        removeCookie(cookie);
        item.parentElement.remove();
      };

      leaf.appendChild(item);
      treeNode.appendChild(leaf);
    });

    treeItem.appendChild(treeNode);
    tree.appendChild(treeItem);
  });

  select("#cookies").appendChild(tree);
  //document.querySelectorAll('[role="tree"]').forEach(t => new TreeLinks(t).init());
  currTree = new TreeLinks(document.querySelector('[role="tree"]'));
  currTree.init();
}

function window_close() {
  window.close();
}

var currTree = null;

function removeSelected () {
  if (!currTree || !currTree.selectedTreeItem) return;

  let selected = currTree.selectedTreeItem;
  if (selected.nodeName === 'SPAN') selected = selected.parentElement;

  selected.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Delete' }));
  currTree.selectedTreeItem = null;
}

document.addEventListener('DOMContentLoaded', function () {
  select("#filter").focus();
  chrome.cookies.getAll({}, cookies => {
    cookies.forEach(c => cache.add(c));
    reloadCookieTable();
  });

  document.querySelector('#filter_div input').addEventListener('input', reloadCookieTable);
  document.querySelector('.remove_selected').addEventListener('click', removeSelected);
  document.querySelector('.remove_all').addEventListener('click', removeAllForFilter);
  document.querySelector('.close_button').addEventListener('click', window_close);
});
