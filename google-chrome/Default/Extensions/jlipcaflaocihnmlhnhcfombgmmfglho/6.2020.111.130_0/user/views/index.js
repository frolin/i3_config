window.UserView = Backbone.View.extend({

    el: "body",
    events: {
        "click .hc-button"  :   "toggleHead"
    },

    render: function (pref) {
        // show the title of the page
        this.showTitle();

        // rendering header
        this.renderHeader();

        var content = $('.content');

        // rendering paging
        var paging_view = new PagingView();
            content.html(paging_view.render().el);

        // rendering paging2
        var paging_view2 = new PagingView({button:true});
            content.append(paging_view2.render().el);

        // rendering table
        var table = new UserTable();
            $($('.content .paging')[1]).before(table.render().el);

        // rendering controls (AddToCheck)
        var control = null;
        var path = DataPaging.get('PerPage').get('path');
        if (path === 'checksites' || path === 'checkpages') {
            var add_to_check_model = { path: path };
            if (pref) {_.extend(add_to_check_model, pref)}
            control = (new AddToCheck({model:add_to_check_model})).render().el;
        }
        $('.controls').html(control);
            
        // add list of urls taken from selected text to .list element
        var urls = rdz.cache.get(['ApplicationData', 'selectedUrls'])
        if (path === 'checkpages' && $('.list').length > 0
            && urls && urls.length > 0
        ) {
            $(".list").val(urls.join('\n'));                  
            rdz.cache.set(['ApplicationData', 'selectedUrls'], null);
        }
        
        this.resizeBody();

        // date picker
        var otherview = new OtherView();
        $('#user-table').before(otherview.render().el);

        AppBlockMassage.close();
        
        window.setTimeout(function() {$(".list").click()}, 200); // change!
        
        this.renderIndicators();
        
        // show opened indicators tooltip after the data receiving
        if (rdz.user.tooltipOpened) {
            $(".progressbar").mouseleave();
            $(".progressbar").mouseenter();
        }
    },
    
    showTitle: function (){
        $('title').text(AppLocale.menu[DataPaging.get('PerPage').get('path')]);
    },

    renderHeader: function(){
        var header = new AppHeader();
            $('.header .box').html(header.render().el);
    },

    toggleHead: function() {
        var button = $('.hc-button') ;
        button.toggleClass('close');
        
        if(button.hasClass('close')) {
            $('.header').animate({height: 0}, 1000)
        } else {
            $('.header').animate({height: 208}, 1000)
        }
    },

    resizeBody: function (){
        $(this.el).css('min-width',$('.table.user').outerWidth(true) + 28 || '100%')
    },
    
    renderIndicators: function(){
        this.renderTimer();
        this.renderProgress();
    },
    
    renderTimer: function(){
        var timer = new HeaderTimer();
        $('.header .indicators .timer').html(timer.render().el);
    },
    
    renderProgress: function() {
      var progress = new HeaderProgress();
      $('.header .indicators .progress').html(progress.render().el);  
    }    
});

RecipientsView = Backbone.View.extend({
    initialize: function() {

        //SitesLibrary.bind('add',   this.addOne, this);
        Recipients.on('reset', AppView.render, AppView);
        //SitesLibrary.bind('all',   this.render, this);

        Recipients.fetch({reset: true});
    }

});

SitesView = Backbone.View.extend({
    initialize: function() {

        //SitesLibrary.bind('add',   this.addOne, this);
        SitesLibrary.on('reset', AppView.render, AppView);
        //SitesLibrary.bind('all',   this.render, this);

        SitesLibrary.fetch({reset: true});
    }

});

PagesView = Backbone.View.extend({
    initialize: function() {
        PagesLibrary.on('reset', AppView.render, AppView);
        PagesLibrary.fetch({reset: true});
    }

});

CheckSiteView = Backbone.View.extend({
    initialize: function() {

        //SitesLibrary.bind('add',   this.addOne, this);
        CheckSitesLibrary.on('reset', AppView.render, AppView);
        //SitesLibrary.bind('all',   this.render, this);
        CheckSitesLibrary.fetch({reset: true});
    }

});

CheckPageView = Backbone.View.extend({
    initialize: function() {
        CheckPagesLibrary.on('reset', AppView.render, AppView);
        CheckPagesLibrary.fetch({reset: true});
    }

});

