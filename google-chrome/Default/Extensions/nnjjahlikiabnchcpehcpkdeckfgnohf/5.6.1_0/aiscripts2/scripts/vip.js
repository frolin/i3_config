function aiparser(){var e=0;function r(r){new ParsedPItem({src:r.src.replace(/^\/\//,"https://"),alt:r.alt,group:r.group,groupIndex:r.groupIndex},e++,_tabInfo,function(e){chrome.runtime.sendMessage({cmd:"ADD_IMG",tabId:_tabInfo.id,item:e})})}var t=[];if(location.href.match("detail.vip.com")){chrome.runtime.sendMessage({cmd:"SET_GROUPS",groups:["主图","视频","SKU图片","详情"]});var c=1;document.querySelectorAll(".pic-slider-items img").forEach(function(e){t.push({src:e.dataset.original||e.src,group:"主图",groupIndex:0,alt:"主图-"+c++})});var o=1;document.querySelectorAll(".color-list-item img").forEach(function(e){t.push({src:e.dataset.original||e.src,group:"SKU图片",groupIndex:2,alt:"SKU-"+o+++(e.alt||"")})});var a=1;document.querySelectorAll(".dc-img-detail img").forEach(function(e){t.push({src:e.dataset.original||e.src,group:"详情",groupIndex:3,alt:"详情-"+a++})});var n=document.getElementById("J_video_source");n&&new VItem({src:"https:"+n.getAttribute("src")},e++,_tabInfo,function(e){chrome.runtime.sendMessage({cmd:"ADD_VIDEO",tabId:_tabInfo.id,item:e})});for(var i=0;i<t.length;i++)t[i].src.match("blank.gif")||r(t[i])}else if(location.href.match("nov-admin.vip.com"))document.querySelectorAll(".prod-img").forEach(function(e){var t=$(e).closest("tr").find(".el-table_1_column_7 .cell").text();r({src:e.dataset.src||e.src,alt:t})});else{if(location.href.match("vis.vip.com"))return;document.querySelectorAll("img").forEach(function(e){r({src:e.src})})}}window.aiparser=aiparser;