!function(){var t=0;function e(e){new ParsedPItem(e,t++,_tabInfo,function(t){chrome.runtime.sendMessage({cmd:"ADD_IMG",tabId:_tabInfo.id,item:t})})}function r(t){t.querySelectorAll("#post-list-posts .directlink").forEach(function(t){var r=t.href.replace("/jpeg/","/image/").replace(/\.jpg$/,".png"),c=t.querySelector(".directlink-res").innerText.match(/(\d+) x (\d+)/);$.ajax({url:r,type:"HEAD",timeout:5e3,async:!1,error:function(){e({src:t.href,smallUrl:t.closest("li").querySelector(".thumb img").src,width:parseInt(c[1]),height:parseInt(c[2])})},success:function(){e({src:r,smallUrl:t.closest("li").querySelector(".thumb img").src,width:parseInt(c[1]),height:parseInt(c[2])})}})})}window.aiparser=function(){1==document.body.dataset.ctai?(document.body.dataset.ctai,$("#ftk-btn-start")[0].click()):location.href.match("/post\\?")?r(document):document.querySelectorAll("img").forEach(function(t){e({src:t.src})})}}();