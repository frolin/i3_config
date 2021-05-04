define([
        'new_options/views/noindex',
        'new_options/views/nofollow',
        'new_options/views/sponsored',
        'new_options/views/ugc',
        'new_options/views/canonical',
        'new_options/views/robots',
        'new_options/views/outerlinks',
        'new_options/views/displaynone',
        'new_options/views/highlighting_on' // add to the end to be able disable the options
    ],
    function (NoIndex, NoFollow, Sponsored, UGC, Canonical, Robots, OuterLinks, DisplayNone, HighlightingOn) {

        return Backbone.View.extend({
            render: function () {
                var noindex = new NoIndex();
                noindex.render();

                var nofollow = new NoFollow();
                nofollow.render();

                var sponsored = new Sponsored();
                sponsored.render();

                var ugc = new UGC();
                ugc.render();

                var canonical = new Canonical();
                canonical.render();

                var robots = new Robots();
                robots.render();

                var outerlinks = new OuterLinks();
                outerlinks.render();

                var displaynone = new DisplayNone();
                displaynone.render();

                var highlighting_on = new HighlightingOn();
                highlighting_on.render();
            }
        });
    });


