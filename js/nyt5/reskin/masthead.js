// var NYTD = NYTD || {};

// NYT5 reskin
NYTD.reskin = (function($) {
    'use strict';

    var navigationModalOptions = {
        uniqueId: "navigationModal",
        positionType: "Fixed",
        overlayBackground: 'None',
        modalTitle: "",
        width: 210
    };

    // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
    // we need this function. Return the position of the first occurrence of an
    // item in an array, or -1 if the item is not included in the array.
    var nytdIndexOf = function(array, item) {
        if (array == null) return -1;
        var i = 0, length = array.length;

        if (Array.prototype.indexOf) return array.indexOf(item);
        for (; i < length; i++) if (array[i] === item) return i;
        return -1;
    };

    var userSettingsModalOpenCallback = function() {
        $('#masthead-tools').find('.settings-modal span').addClass('activated');
    };

    var userSettingsModalCloseCallback = function() {
        $('#masthead-tools').find('.settings-modal span').removeClass('activated');
    };

    var getCookie = function (name) {
        return new RegExp(name + '=([^;]+)').test(window.unescape(document.cookie)) ? RegExp.$1 : null;
    };

    var getPageCategory = function() {
        return $("meta[name='CG']").attr('content');
    };

    var getPageSubCategory = function() {
        return $("meta[name='SCG']").attr('content');
    };

    var getPageType = function() {
        return $("meta[name='PT']").attr('content');
    };

    var getPageSubType = function() {
        return $("meta[name='PST']").attr('content');
    };

    var getEdition = function() {
        var edition;
        // var cookie = getCookie('NYT-Edition');
        // if (cookie && cookie === 'edition|GLOBAL') {
        //     edition = 'global';
        // } else {
        //     edition = 'domestic';
        // }
        edition = 'global';

        return edition;
    };

    var userSettingsModalOptions = {
        uniqueId: "user-settings-modal",
        bind: ".masthead-tools .settings-modal",
        positionType: "BelowLeft",
        overlayBackground: 'None',
        modalTitle: "",
        width: 210,
        openCallback: userSettingsModalOpenCallback,
        closeCallback: userSettingsModalCloseCallback
    };

    var internationalMap = ["sports", "business", "opinion", "style", "arts", "dining"];
    var taxonomyUrl = NYTD.baseURL + '/services/json/taxonomy/v2/hierarchical.json';
    var userInfoUrl = '/svc/web-products/userinfo-v2.json';
    var mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i;
    var isMobile = mobileRegex.test(navigator.userAgent);
    var searchUrl = 'http://query.nytimes.com/search/sitesearch/#/';
    // var trackingBaseData = {
    //     'action': 'click',
    //     'region': 'Masthead',
    //     'pgtype': getPageType().replace(' ', '')
    // };
    var mTimeout = true;
    var mouseLocs = [];
    var mouseLocsTracked = 2;
    var intentRangeLower = 10;
    var intentRangeUpper = 170;
    var timer = {};
    var isNavAnimating = false;
    var panelWidth = 210;
    var singlePanelWidth = panelWidth + 'px';
    var singlePanelPartlyShut = (panelWidth - 20) + 'px';
    var navTimeout = 500;
    var navAnimation = 150;
    var hoverTimeout = 500;
    var $el = $('#navigation-panel');
    var $shell = $('#shell');
    var $html = $('html');
    var $body = $('body');
    var $document = $(document);
    var subscription = new Array;
    var subscriptionDropdown = {};
    var $top1,
        $mid1,
        $sections,
        $navigationModal,
        $navigationPointer,
        navigationModal,
        userSettingsModal;

    var templates = {
        sectionsButton : [
            '<div id="masthead-buttons-container" class="masthead-buttons-container">',
                '<button id="masthead-sections-button" class="buttons masthead-button masthead-sections-button" onclick="NYTD.reskin.toggle();">Sections</button>',
                '<button id="masthead-search-button" class="buttons masthead-button masthead-search-button">Search</button>',
            '</div>'
        ].join(''),

        loginModal : function(data) {
            return [
                '<div class="modal-header">',
                '<h5 class="modal-heading">',
                '<span class="avatar">',
                '<a href="' + data.profileUrl + '"></a>',
                '</span>',
                '<span class="user-name-subscription">',
                '<span class="user-name">' + data.username,
                '</span>',
                '<span class="user-subscription">',
                '<a href="https://myaccount.nytimes.com/membercenter/myaccount.html"></a>',
                '</span>',
                '</span>',
                '</h5>',
                '</div>',
                '<div class="modal-content">',
                '<ul>',
                '<li><a class="login-modal-profile" href="' + data.profileUrl + '">My Profile</a></li>',
                '<li><a class="login-modal-account" href="' + data.myaccountUrl + '">My Account</a></li>',
                '<li><a class="login-modal-bill" href="' + data.billingInformationUrl + '">My Billing Information</a></li>',
                '<li><a class="login-modal-saved" href="' + data.savedUrl + '">My Saved Items</a></li>',
                '<li><a class="button log-out-button" href="' + data.logOutUrl + '">Log Out</a></li>',
                '</ul>',
                '</div>',
                '<button type="button" class="modal-close hidden"><i class="icon"></i><span class="visually-hidden">Close this modal window</span></button>',
                '<div class="modal-pointer modal-pointer-up-right"><div class="modal-pointer-conceal"></div></div>'
            ].join('')
        },

        settingsModal : function(data) {
            var location = window.location.pathname;
            return [
                '<div class="modal-header">',
                '<h5 class="modal-heading"></h5>',
                '</div>',
                '<div class="modal-content">',
                '<div class="menu edition-menu">',
                '<h5 class="modal-heading">Edition</h5>',
                '<ul>',
                '<li><a href="' + location + '" data-edition="us">English</a></li>',
                '<li><a href="http://cn.nytimes.com" data-edition="chinese">中文网 (Chinese)</a></li>',
                '<li><a href="http://www.nytimes.com/es/" data-edition="spanish">Español</a></li>',
                '</ul>',
                '</div>',
                '<div class="menu help-menu">',
                '<h5 class="modal-heading">Help</h5>',
                '<ul>',
                '<li><a class="settings-faq" href="http://www.nytimes.com/content/help/front.html">FAQ</a></li>',
                '<li><a class="settings-contact" href="http://www.nytimes.com/content/help/contact/directory.html">Contact Us</a></li>',
                '</ul>',
                '</div>',
                '</div>',
                '<button type="button" class="modal-close hidden"><i class="icon"></i><span class="visually-hidden">Close this modal window</span></button>',
                '<div class="modal-pointer modal-pointer-up-right"><div class="modal-pointer-conceal"></div></div>'
            ].join('')
        },

        nav : function (nData) {
            var nav = '';

            $.each(nData, function(k, n) {
                var href = n.path ? ' href="' + n.path + '"' : '';

                nav += (k === 11 || k === 21 || k === 23 || k === 25 || (k === (nData.length - 1)) ? '<li class="rule">' : '<li>')
                + '<a id="navId-'
                + n.id
                + '"'
                + href
                +' class="'
                + n.class_name
                + '">'
                + n.name
                + '<div class="arrow-right"><div class="arrow-conceal"></div></div></a></li>';
            });


            var html = [
                '<nav id="navigation-panel" class="navigation-panel" role="navigation"><div class="sections">',
                '<div class="section taxonomy">',
                '<div class="header">',
                '</div><!-- close header --><ul class="menu">',
                nav,
                '</ul><!-- close primary nav -->',
                '</div>',
                '</div></nav>'
            ].join('');

            return html;
        },

        modal : function (sData) {
            var output = {};
            output.secondary = '';
            output.tertiary = '';

            $.each(sData, function(k, d) {
                if (d.children) {
                    output[d.class_name] += '<ul class="' + d.class_name + '" data-parent="navId-' + d.parent_id + '">';
                    $.each(d.children, function(k, n) {
                        var classes = n.children_in_nav === true ? n.class_name + ' expandable' : n.class_name;
                        var href = n.path ? ' href="' + n.path + '"' : '';
                        var hasRule = k !== 0 && (n.class_name === 'subscribe' || n.class_name === 'multimedia' ||  n.class_name === 'nytstore');
                        output[d.class_name]
                        += (hasRule ? '<li class="rule '+k+'">' : '<li>')
                        + '<a id="navId-'
                        + n.id
                        + '" class="'
                        + classes
                        + '"'
                        + href
                        + '>'
                        + n.name
                        + '<div class="arrow-right"><div class="arrow-conceal"></div></div><div class="arrow arrow-left"><div class="arrow-conceal"></div></div></a></li>';
                    });

                    output[d.class_name] += '</ul>';
                }
            });

            return '<div class="secondary-container"><div class="header"><h5 class="section-heading"><a></a></h5></div>'
            + output.secondary + '</div>'
            + '<div class="tertiary-container"><div class="header"><h5 class="section-heading"><a></a></h5></div>'
            + output.tertiary + '</div>';
        },

        artSubNavigation : function() {
            return [
                '<ul class="subNavigation">',
                '<li id="subNav_design"><a href="http://www.nytimes.com/pages/arts/design/index.html">Art &amp; Design</a></li>',
                '<li id="subNav_books"><a href="http://www.nytimes.com/pages/books/index.html">Books</a></li>',
                '<li id="subNav_dance"><a href="http://www.nytimes.com/pages/arts/dance/index.html">Dance</a></li>',
                '<li id="subNav_movies"><a href="http://www.nytimes.com/pages/movies/index.html">Movies</a></li>',
                '<li id="subNav_music"><a href="http://www.nytimes.com/pages/arts/music/index.html">Music</a></li>',
                '<li id="subNav_television" class="selected nochildren"><a href="http://www.nytimes.com/pages/arts/television/index.html">Television</a></li>',
                '<li id="subNav_theater"><a href="http://www.nytimes.com/pages/theater/index.html">Theater</a></li>',
                '<li id="subNav_events"><a href="http://www.nytimes.com/events">Events</a></li>',
                '<li id="subNav_international"><a href="http://www.nytimes.com/pages/arts/international/index.html">International Arts</a></li>',
                '</ul>'
            ].join('');
        },

        theaterSubNavigation : function() {
            return [
                '<ul class="subNavigation">',
                '<li>',
                '<a href="http://www.nytimes.com/theater/venues/broadway.html">Broadway</a>',
                '</li>',
                '<li>',
                '<a href="http://www.nytimes.com/theater/venues/off-broadway.html">Off &amp; Off Off Broadway</a>',
                '</li>',
                '<li>',
                '<a href="http://www.nytimes.com/theater/shows/plays.html">Plays</a>',
                '</li>',
                '<li>',
                '<a href="http://www.nytimes.com/theater/shows/musicals.html">Musicals</a>',
                '</li>',
                '<li>',
                '<a href="http://www.nytimes.com/theater/shows/family-friendly.html">Family Friendly</a>',
                '</li>',
                '<li>',
                '<a href="http://www.nytimes.com/theater/shows/recently-opened.html">Recently Opened</a>',
                '</li>',
                '<li>',
                '<a href="http://www.nytimes.com/video/landing/theater/100000001064152/index.html">Theater Video</a>',
                '</li>',
                '<li class="subNavigation-tickets"><a href="http://www.nytimes.com/theater/show/buy-ticket.html">Tickets &amp; Offers</a></li>',
                '</ul>'
            ].join('');
        }
    };

    var open = function () {

        if (isNavAnimating === false && $el.hasClass('active') === false) {
            var openInit = {
                'width': singlePanelPartlyShut,
                'display': 'block',
                'opacity': '0'
            };

            var openMore = {
                'width': singlePanelWidth,
                'opacity': '1'
            };

            //first move it over most of the way, and make it transparent
            $el.css(openInit);
            $el.toggleClass('active');
            $html.toggleClass('navigation-active');
            isNavAnimating = true;
            //materialize partly open, and animate the rest of the way
            $el.animate(openMore, navAnimation, function () {
                isNavAnimating = false;

                //hack for ios
                if (isMobile) {
                    $('body').css('cursor', 'pointer');
                }

                $(document).on('click', handleClickClose);
            });

            // start tracking mouse movement for hover intent
            $document.on('mousemove', mousemoveDocument);
        }
    };

    var close = function () {

        if (isNavAnimating === false && $el.hasClass('active') === true) {

            var navMarginTop = $el.css('marginTop'); // for messaging

            var shutSome = {
                'width': singlePanelPartlyShut,
                'opacity': '0'
            };

            navigationModal.close();
            resetNav(2);

            isNavAnimating = true;
            $el.animate(shutSome, navAnimation, function () { //animate it partly closed, then disappear
                $el.toggleClass('active');
                $html.toggleClass('navigation-active');
                $(document).off('click', handleClickClose);

                //hack for ios
                if (isMobile) {
                    $('body').css('cursor', '');
                }

                $el.removeAttr('style');
                $el.css('marginTop', navMarginTop); // for messaging
                $el.find('a').removeClass('active'); // Resets active state
                isNavAnimating = false;
            });

            $document.off('mousemove', mousemoveDocument); // stop tracking mouse movements
        }
    };
    
    var toggle = function () {
        
        if (isNavAnimating === false && $el.hasClass('active') === false) {
            open();
        } else if (isNavAnimating === false && $el.hasClass('active') === true) {
            close();
        }
    };

    var activatePrimaryItem = function (e) {
        e.stopPropagation();
        var elementsCount, modalHeight, ulHeight, totalHeight, $heading;

        var navIds = {
            REAL_ESTATE: 'navId-92720057-BCB6-4BDB-9351-12F29393259F',
            OPINION_DOMESTIC: 'navId-09736473-CB3F-4B2F-9772-3AF128ABE12D',
            OPINION_INTERNATIONAL: 'navId-AD8090D7-4137-4D71-84C8-70DA3BD89778',
            MORE: 'navId-more-section',
        };

        var $target = $(e.target).closest('a');
        var targetId = $target.attr('id');

        navigationModal.open();
        repositionModal($target);

        if (!$target.hasClass('active') && isNavAnimating === false) {

            if ($target.hasClass('expandable')) {

                // Determine modal height by the number of elements
                elementsCount = $navigationModal
                    .find('[data-parent="' + targetId + '"]')
                    .find('li').length;

                modalHeight = 55;
                ulHeight = elementsCount * 29;
                totalHeight = ulHeight + modalHeight;

                // Manually adjust heights of Real Estate, Domestic Opinion, International Opinion
                if (targetId === navIds.REAL_ESTATE) {
                    totalHeight = 190;
                } else if (targetId === navIds.OPINION_DOMESTIC || targetId === navIds.OPINION_INTERNATIONAL) {
                    totalHeight = 390;
                } else if (targetId === navIds.MORE) {
                    totalHeight = 575;
                }

                $navigationModal.height(totalHeight);

                cancelDelayedModalClose();
                resetNav(2);  // Close the secondary modal, if open

                // Sets active state for the hovered on taxonomy item
                $el.find('.taxonomy a').removeClass('active');
                $target.addClass('active');

                // reset the content
                $navigationModal.find(".secondary").removeClass('active');

                // set the text of the heading
                $heading = $navigationModal.find(".secondary-container .section-heading");

                if ($target.attr('href') !== "" && typeof $target.attr('href') !== "undefined") {
                    $heading.html('<a href="'+ $target.attr('href') + '">' + $target.text() + '</a>');
                } else {
                    $heading.html($target.text());
                }
                // activate the content based on the parent id
                $navigationModal.find("[data-parent='" + targetId + "']").addClass('active');
            } else {
                modalClose();
            }
        }
    };

    var activateSecondaryItem = function (e) {
        var $modal, $heading;
        var $target = $(e.target).closest('a');

        if (!$target.hasClass('active') && isNavAnimating === false) {

            e.preventDefault();
            $modal = $('#navigationModalContainer');

            if ($target.hasClass('expandable')) {

                // resets the content
                resetNav(3);
                $modal.find(".nytModalContent").addClass('expanded');

                // set the text of the heading
                $heading = $modal.find(".tertiary-container .section-heading");

                if (typeof $target.attr('href') !== "undefined") {
                    $heading.html('<a href="'+ $target.attr('href') + '">' + $target.text() + '</a>');
                } else {
                    $heading.html($target.text());
                }

                // activate the content based on the parent id
                $modal.find("[data-parent='" + $target.attr('id') + "']:eq(0)").addClass('active');

                // set active class
                $target.addClass('active');
            } else {
                // resets the content
                resetNav(3);

                // set active class
                $target.addClass('active');
            }
        }
    };

    var tryPrimaryHover = function(e) {
        var $target = $(e.target).closest('a');
        var isExpandable = $target.hasClass('expandable');

        cancelDelayedClose();
        cancelDelayedPrimaryHover();

        if(isExpandable) {
            cancelDelayedModalClose();
        }

        if ($el.find(".taxonomy li a.active").length > 0) { // Only activate hover intent if the modal is active
            var angle = getAngle(mouseLocs[0], mouseLocs[1]);

            if (angle > intentRangeLower && angle < intentRangeUpper) {
                delayedPrimaryHover(e); // OUT OF RANGE, START TIMEOUT FOR HOVER
            } else {
                activatePrimaryItem(e); // IN RANGE, ACTIVATE RIGHT AWAY
            }
        } else {
            activatePrimaryItem(e); // IN RANGE, ACTIVATE RIGHT AWAY
        }
    };

    var trySecondaryHover = function(e) {
        cancelDelayedClose();
        cancelDelayedModalClose();
        cancelDelayedSecondaryHover();

        if ($navigationModal.find(".nytModalContent").hasClass('expanded')) { // Only activate hover intent if the tertiary panel is open
            var angle = getAngle(mouseLocs[0], mouseLocs[1]);

            if (angle > intentRangeLower && angle < intentRangeUpper) {
                delayedSecondaryHover(e); // Out of range, start timeout for hover
            } else {
                activateSecondaryItem(e); // In range, activate right away
            }
        } else {
            activateSecondaryItem(e);
        }
    };

    var repositionModal = function ($target) {
        var $listItem = $target.closest('li');
        var $listAnchor = $listItem.find('a');
        var $list = $target.closest('ul');
        var arrowPosition = $listItem.position().bottom;
        var modalTop = $listItem.position().top - 10;
        var modalPointerPosition = 'modal-pointer-left-top';

        var navIds = {
            VIDEO: 'navId-432A1823-3F24-43C0-8004-79088F94E754',
            MORE: 'navId-more-section',
            ARTS: 'navId-C5BFA7D5-359C-427B-90E6-6B7245A6CDD8'
        };

        if ($listAnchor.attr('id') === navIds.VIDEO) { // custom modal positioning for Video secondary nav modal
            modalPointerPosition = 'modal-pointer-left-bottom';
            modalTop = 55;
        }

        if ($listAnchor.attr('id') === navIds.MORE) { // custom modal positioning for More secondary nav modal
            modalPointerPosition = 'modal-pointer-left-bottom';
            if (!isPremierSubscriber()) {
                modalTop = 120;
            } else {
                modalTop = 130;
            }

        }

        if ($listAnchor.attr('id') === navIds.ARTS) { // custom modal positioning for Arts secondary nav modal
            modalTop = 312;
        }

        $navigationModal.css({
            'top': modalTop,
            'left': '200px',
            'margin-left': '0',
            'margin-top': '0',
            'width': 'auto'
        });

        $navigationPointer
            .removeClass('modal-pointer-left-bottom modal-pointer-left-top nytModalPointer nytModalPointerNone')
            .addClass('modal-pointer ' + modalPointerPosition)
            .html('<div class="modal-pointer-conceal"></div>')
            .css('bottom', arrowPosition + 'px');
    };

    var resetNav = function (level) {
        if (level === 2) {
            $navigationModal.find(".secondary").removeClass('active');
        }

        $navigationModal.find(".secondary a").removeClass('active');
        $navigationModal.find(".tertiary").removeClass('active');
        $navigationModal.find(".nytModalContent").removeClass('expanded');

    };

    // Get recommended sections from API, de-dupe, then create menus
    var getTaxonomy = function() {
        $.ajax({
            url: taxonomyUrl,
            dataType: 'json'
        }).done(function (data) {
            if (data.taxonomy) {
                processTaxonomy(data);
            }
        }).error(function(error) {
            console.log(error);
        });
    };

    var checkForTimesPremier = function () {
        var premierTaxonomy = '99C17804-A343-4A76-BF04-F5793ADA48D1';

        if (!isPremierSubscriber()) {
            $('.miniNav').find('#mininav-' + premierTaxonomy).parent().hide();
        }
    };

    var checkForCrosswords = function () {
        var xwdTaxonomy = '3300EB4C-284F-4484-AF31-0D7D1DBA4F4C';

        if (!isCrosswordsSubscriber() || (isPremierSubscriber() && isCrosswordsSubscriber())) {
            $('.miniNav').find('#mininav-' + xwdTaxonomy).parent().hide();
        }
    };

    // event listener for user info data readiness
    $(document).on('nyt:user-info-ready', function () {
        getTaxonomy();
    });

    var getUserInfo = function() {
        // $.ajax({
        //     url: userInfoUrl,
        //     dataType: 'json',
        //     cache: false
        // }).done(function (data) {
        //     subscription = data.data.subscription;
        //     subscriptionDropdown = getSubscriptionLabel();
        //     checkForCrosswords();
        //     checkForTimesPremier();
        // });
        $(document).trigger('nyt:user-info-ready');
    };

    // Subscription Entitlements

    /**
      * Determines if the user has a specific entitlement
      *
      * @public
      * @method hasEntitlement
      * @param entitlementName {String} The name of the entitlement
      * @return {Boolean}
      **/
    var hasEntitlement = function (name) {
        return nytdIndexOf(subscription, name)  > -1;
    };

    /**
     * Determines if the user has a subscription for the web
     *
     * @public
     * @method isWebSubscriber
     * @return {Boolean}
     **/
    var isWebSubscriber = function () {
        return hasEntitlement('MM');
    };

    /**
      * Determines if the user has a subscription for mobile devices
      *
      * @public
      * @method isMobileSubscriber
      * @return {Boolean}
      **/
    var isMobileSubscriber = function () {
        return hasEntitlement('MTD') && hasEntitlement('MSD');
    };

    /**
      * Determines if the user has a subscription for tablets
      *
      * @public
      * @method isTabletSubscriber
      * @return {Boolean}
      **/
    var isTabletSubscriber = function () {
        return hasEntitlement('MTD');
    };

    /**
      * Determines if the user has a subscription for smartphones
      *
      * @public
      * @method isSmartphoneSubscriber
      * @return {Boolean}
      **/
    var isSmartphoneSubscriber = function () {
        return hasEntitlement('MSD');
    };

    /**
      * Determines if the user has a subscription for Crosswords
      *
      * @public
      * @method isCrosswordsSubscriber
      * @return {Boolean}
      **/
    var isCrosswordsSubscriber = function () {
        return hasEntitlement('XWD');
    };

    /**
      * Determines if the user has a subscription to the print
      *
      * @public
      * @method isHomeDeliverySubscriber
      * @return {Boolean}
      **/
    var isHomeDeliverySubscriber = function () {
        return hasEntitlement('HD');
    };

    /**
      * Determines if the user has a subscription to cooking
      *
      * @public
      * @method isCookingSubscriber
      * @return {Boolean}
      **/
    var isCookingSubscriber = function () {
        return hasEntitlement('COO');
    };

    /**
      * Determines if the user has a subscription to opinion
      *
      * @public
      * @method isOpinionSubscriber
      * @return {Boolean}
      **/
    var isOpinionSubscriber = function () {
        return hasEntitlement('OPI');
    };

    /**
      * Determines if the user has a subscription to Times Premier
      *
      * @public
      * @method isPremierSubscriber
      * @return {Boolean}
      **/
    var isPremierSubscriber = function () {
        return hasEntitlement('TPR');
    };

    var getSubscriptionLabel = function() {
        var subscription = {
            label: '',
            className: '',
            link: ''
        };
        if (isPremierSubscriber()) {
            subscription.label = 'Times Insider Subscriber';
            subscription.className = 'premier-subscriber';
            subscription.link = 'http://www.nytimes.com/times-insider?module=ProfileDropdown&action=click&pgtype=Article&region=Masthead&content-collection=TimesPremier-InsideStory';
        } else if (isWebSubscriber() && isMobileSubscriber()) {
            subscription.label = 'All Digital Access Subscriber';
        } else if (isTabletSubscriber() && isWebSubscriber()) {
            subscription.label = 'Tablet and Web Subscriber';
        } else if (isSmartphoneSubscriber() && isWebSubscriber()) {
            subscription.label = 'Smartphone and Web Subscriber';
        } else if (isWebSubscriber()) {
            subscription.label = 'Web Subscriber';
        } else if (isOpinionSubscriber() && isCookingSubscriber()) {
            subscription.label = 'NYT Opinion & Cooking Subscriber';
        } else if (isCookingSubscriber()) {
            subscription.label = 'Cooking Subscriber';
        } else if (isOpinionSubscriber()) {
            subscription.label = 'NYT Opinion Subscriber';
            subscription.link  = 'http://www.nytimes.com/content/help/mobile/nyt-opinion/nyt-opinion.html';
        } else if (isCrosswordsSubscriber()) {
            subscription.label = 'Crosswords Subscriber';
        }
        return subscription;
    }

    var getClassName = function(name) {
        return name.replace(/\W/g, '').toLowerCase();
    };

    var getAlternateEdition = function(data, altId) {
        var result;

        $.each(data, function(key, item) {
            if (item.id === altId) {
                result = item;
                return false;
            }
        });

        return result;
    };

    // Process taxonomy data
    var processTaxonomy = function(data) {
        var altData;
        var navPrimary = [];
        var navSecondary = [];
        var navTertiary = [];
        var navPrimaryMore = [];
        var navPrimarySlice = [];
        var edition = getEdition();
        var panelElements = 22;

        var subscriptionIds = {
            PREMIER: 'navId-99C17804-A343-4A76-BF04-F5793ADA48D1',
            CROSSWORDS: 'navId-5C13EEDD-D905-4D8C-A284-6859EA434563',
            UPSHOT: 'navId-D64FAE4C-4425-4E5A-B898-6C8CB59F9957'
        };

        $.each(data.taxonomy, function(x, first) {
            first.class_name = getClassName(first.name);
            if (first.edition === edition || !first.edition) {

                if (first.children) {
                    first.class_name = first.class_name + ' expandable';
                }

                // Decide panels based on subscription status
                navPrimary.push(first);

                // parse secondary nav items
                if (first.children) {

                    navSecondary.push({
                        parent_id: first.id,
                        class_name: 'secondary',
                        children: []
                    });

                    $.each(first.children, function(key, second) {
                        second.class_name = getClassName(second.name);

                        if (getEdition() === 'global' && second.alternate_editions && second.alternate_editions.global) {
                            var altData = getAlternateEdition(first.children, second.alternate_editions.global);
                            second.id = altData.id;
                            second.path = altData.path;
                        }

                        navSecondary[navSecondary.length - 1].children.push(second);

                        if (second.children) {
                            second.class_name = second.class_name + ' expandable';
                        }

                        // parse tertiary nav items
                        if (second.children) {

                            navTertiary.push({
                                parent_id: second.id,
                                class_name: 'tertiary',
                                children: []
                            });

                            $.each(second.children, function(key, third) {
                                third.class_name = getClassName(third.name);
                                navTertiary[navTertiary.length - 1].children.push(third);
                            });

                        } // end parse tertiary nav items

                    }); // end first children loop

                } // end parse second level

            } // end edition choice

        });

        // split out more items from navPrimary so we can use them in navSecondary
        navPrimarySlice = navPrimary.splice(panelElements, navPrimary.length - 1);

        $.each(navPrimarySlice, function (x, item) {
            navPrimaryMore.push(item);
        });

        // add "fake" temporary id to all li items in more array so we can use it as an exandable childe of primaryNav
        navSecondary.push({
            parent_id: 'more-section',
            class_name: 'secondary',
            children: navPrimaryMore
        });

        // add "more" li item  and class_name to primary nav
        navPrimary.push({
            name: 'More',
            id: 'more-section',
            path: '',
            class_name: 'section-more expandable'
        });

        buildNav(navPrimary, navSecondary, navTertiary);
        setEventHandlers();
    };

    var buildNav = function (navPrimary, navSecondary, navTertiary) {
        $('body').prepend(templates.nav(navPrimary));
        $('#navigationModalContainer').find('.nytModalContent').removeClass('singleRule').html(templates.modal(navSecondary.concat(navTertiary)));
        $el = $('#navigation-panel');
        $shell = $('#shell');
        $sections = $('#navigation-panel').find('.sections');
        $navigationModal = $('#navigationModalContainer').find('.navigationModal');
        $navigationPointer = $('#navigationModalContainer').find('.nytModalPointer');
    };

    var setEventHandlers = function () {
        $el
        .on('mouseleave', delayedClose)
        .on('mouseenter', cancelDelayedClose)
        .on('mouseenter', '.taxonomy li a.expandable', tryPrimaryHover)
        .on('mouseleave', '.taxonomy li a.expandable', delayedModalClose)
        .on('click', '.taxonomy li a', activatePrimaryItem)
        .on('click', '.menu a[href]', handlePrimaryNavigationClick);

        $navigationModal
        .on('mouseover', '.secondary li a', trySecondaryHover)
        .on('click', '.secondary li a.expandable', activateSecondaryItem)
        .on('mouseenter', '.tertiary-container', cancelDelayedSecondaryHover)
        .on('mouseenter', function() {
            cancelDelayedClose();
            cancelDelayedModalClose();
            cancelDelayedPrimaryHover();
        })
        .on('mouseleave', function() {
            delayedClose();
            delayedModalClose();
        })
        .on('click', '.navigationModal a[href]', handleModalClick);

        $('body')
        .on('click', '.masthead-search-button', handleSearchClick)
        .on('submit', '#searchForm', handleSearchSubmit)
        .on('click', '.user-settings-modal .edition-menu a', handleSettingsModalEditionClick)
        .on('click', '.user-settings-modal .help-menu a', handleSettingsModalHelpClick)
        .on('click', '.masthead-login-button a', handleLoginButtonClick)
        .on('click', '#profileDropDownModal .modal-content a', handleLoginModalClick)
        .on('click', '.register-now a', handleRegisterNowClick);
        /* .on('click', '.commentsRefer a, .commentCountLink a', handleCommentsReferClick); */

        // ESC key
        $(document).keyup(function(e) {
            if (e.keyCode === 27) {
                    close();
            }
        });

        $(window)
        .resize(function() {
            close();
        });
    };

    var loginDropDown = function() {
        var $tools = $('#memberTools');
        $tools
            .removeAttr('id')
            .addClass('masthead-tools')
            .attr('id', 'masthead-tools');

        var $register = $tools.find('li:contains("Register")');
        $register.addClass('register-now');
        var regText = $register.text();
        $register.find('a').text(regText.replace(' Now', ''));

        if (getPageCategory() !== 'opinion') {
            $('#masthead').prepend($tools);
        } else {
            $('#page').prepend($tools);
        }

        var $modal = $('#profileDropDownModal');
        var $modalContent = $modal.find('.dropDownModalBox');

        var data = {};

        data.username = $modal
                            .find('.dropDownModalLink')
                            .text();

        data.profileUrl = $modalContent
                                .find('.profileDropDownMyProfile a')
                                .attr('href');

        data.myaccountUrl = $modalContent
                                .find('.profileDropDownMyAccount a')
                                .attr('href');

        data.savedUrl = $modalContent
                                .find('.profileDropDownMySavedArticles a')
                                .attr('href');

        data.logOutUrl = 'http://www.nytimes.com/logout';

        data.billingInformationUrl = $modalContent
                                .find('.profileDropDownMyBillingInfo a')
                                .attr('href');

        $modal.addClass('user-name-modal');
        $modalContent.append(templates.loginModal(data));

        setTimeout(function() {
            var img = $modalContent
                            .find('img')
                            .removeClass('runaroundLeft');
            var subscription =  subscriptionDropdown;
            var $subscription = $modal.find('.user-subscription');
            var $subscriptionLink = $subscription.find('a');
            if (subscription.label === '') {
                $subscription.remove();
            } else {
                $subscriptionLink.html(subscription.label);
            }
            if (subscription.className !== '') {
                 $subscription.addClass(subscription.className);
            }
            if (subscription.link !== '') {
                $subscriptionLink.attr("href", subscription.link);
            }
            if (img.length > 0) {
                $modal
                    .find('.modal-header h5 .avatar a')
                    .append(img);
            } else {
                $modal.find('.modal-header .avatar').remove();
            }

        }, 2000);
    };

    var settingsDropDown = function() {
        var $tools = $('#masthead-tools');
        var $modal = $('.user-settings-modal');

        $modal.empty().append(templates.settingsModal());
        var $list = $modal.find('.edition-menu ul');
        var $itemInternational = $list.find("li a[data-edition='international']");
        var $itemUs = $list.find("li a[data-edition='us']");

        if (getEdition() === 'global') {
            $itemInternational.addClass('selected');
            stripInternational($itemUs);
        } else {
            $itemUs.addClass('selected');
            checkInternationalMapping($itemInternational);
        }

        $list.find('li a').on('click', function(e) {
            var edition = $(this).attr('data-edition');
            editionToggleCallback(edition);
        });

        $('body').on('click', function(e) {
            var isSettingsModal = $(e.target).closest('.user-settings-modal').length;

            if ($(e.target).closest('.modal-pointer').length > 0) {
                isSettingsModal = 0;
            }

            if (isSettingsModal !== 1) {
                userSettingsModal.close();
            }
        });

        var $pointer = $('.user-settings-modal .modal-pointer, #profileDropDownModal .modal-pointer');
        $pointer.on('click', function() {
            $(document).trigger('click');
        });
    };

    var checkInternationalMapping = function(item) {
        $.each(internationalMap, function(i,sectionName) {
            if (window.location.pathname.match(sectionName)) {
                item.attr('href', '/pages/' + sectionName + '/international/index.html');
            }
        });
    };

    var stripInternational = function(item) {
            var href = item.attr('href');
            item.attr('href', href.replace('/international', ''));
    };

    var editionToggleCallback = function (edition) {

        switch (edition) {
        case 'international':
            NYTD.EditionPref.setGlobal();
            window.dcsMultiTrack && window.dcsMultiTrack('DCS.dcssip', 'www.nytimes.com', 'DCS.dcsuri', '/toggleNYTtoIHT.html', 'WT.ti', 'toggleNYTtoIHT', 'WT.z_dcsm', '1');
            break;
        case 'us':
            NYTD.EditionPref.setUS();
            window.dcsMultiTrack && window.dcsMultiTrack('DCS.dcssip', 'global.nytimes.com', 'DCS.dcsuri', '/toggleIHTtoNYT.html', 'WT.ti', 'toggleIHTtoNYT', 'WT.z_dcsm', '1');
            break;
        case 'chinese':
            if (getEdition() === 'global') {
                window.dcsMultiTrack && window.dcsMultiTrack('DCS.dcssip', 'global.nytimes.com', 'DCS.dcsuri', '/toggleIHTtoCHNS', 'WT.ti', 'toggleIHTtoCHNS', 'WT.z_dcsm', '1');
            } else {
                window.dcsMultiTrack && window.dcsMultiTrack('DCS.dcssip', 'www.nytimes.com', 'DCS.dcsuri', '/toggleNYTtoCHNS', 'WT.ti', 'toggleNYTtoCHNS', 'WT.z_dcsm', '1');
            }
            break;
        }
    };

    window.buildMastheadContent = function () {
        var pageCategory = getPageCategory();
        var $branding = $('#branding');
        var $memberTools = $('#masthead-tools');
        var $searchTool = $('#searchWidget');
        var $middle1c   = $("#Middle1C");
        var middle1cDiv = '';

        if (pageCategory !== 'opinion') {
            $('#masthead').prepend(templates.sectionsButton);
        } else {
            $('#masthead').before(templates.sectionsButton);
        }

        $memberTools
            .find('li:contains("Log In")')
            .addClass('masthead-login-button')
            .find('a')
            .text('Sign In');

        $memberTools
            .find('li:contains("Help")')
            .remove();

        $memberTools.append('<li class="settings-modal"><span><i class="icon"></i></span></li>');

        if (pageCategory === 'arts' && getPageSubCategory() === 'television') {
            $('.navigation .selected:eq(0)').append(templates.artSubNavigation());
        }

        // Removing padding from Middle1C div if ad is hidden
        if ((getPageType() === 'Section Front' && NYTD.jQuery("meta[name='asset_id']").length > 0 && pageCategory != 'opinion') ||
             (NYTD.jQuery("meta[name='PSSST']").length > 0 && NYTD.jQuery("meta[name='PSSST']").attr('content') === 'Section Front' && getPageType() === 'Topic')) {
            if ((pageCategory != 'business' || getPageSubCategory() != '')) {
                if ($middle1c.is(":hidden")) {
                    $("#masthead-tools").css("padding-right", "0px");
                }
            }
        }

        // SEARCH
        $searchTool
            .find('form')
            .prepend('<img class="close" src="' + NYTD.Hosts.imageHost + '/images/icons/x_icon_gray_10x10.png" onclick="NYTD.reskin.hideSearch()"/>');
        $searchTool
            .find('#searchSubmit')
            .replaceWith('<input class="searchSubmit" type="submit" value="GO">');

        $('#masthead-buttons-container').append($searchTool);

        if ((pageCategory === 'opinion' && getPageSubCategory() === '') || pageCategory === 'magazine') {
            $branding
                .find('img')
                .replaceWith('<svg aria-label="New York Times" role="img" height="23" width="152" class="nyt-logo"><image id="NYTLogo" itemprop="logo" border="0" alt="The New York Times" xlink:href="'+ NYTD.Hosts.imageHost +'/images/logos/nyt/nyt-logo-152x23.svg" src="' + NYTD.Hosts.imageHost + '/images/misc/nytlogo152x23.gif" height="23" width="152"/></svg>');
        }

        if (pageCategory === 'opinion' && getPageSubCategory() === 'international') {
            $branding
                .addClass('international-branding')
                .find('a').attr('href', 'http://international.nytimes.com/')
                .find('img')
                .replaceWith('<img src="' + NYTD.Hosts.imageHost + '/images/misc/international-logo-205x19.png" alt="New York Times" />');
        }


        $('#masthead-buttons-container').append($branding);

        if (pageCategory === 'business' && getPageSubCategory() === '') {
            $('#masthead')
                .before($('#masthead-buttons-container'))
                .before($('#masthead-tools'));
            if (getPageType() === 'Section Front') {
                $('#masthead-buttons-container').after(middle1cDiv);
            }
        }

        // Adding Middle1C DIV for Opinion SFs to have middle1c ad in masthead
        if (pageCategory === 'opinion' && getPageType() === 'Section Front') {
            $memberTools.before(middle1cDiv);
        }

        if (pageCategory === 'movies' && getPageSubCategory() === '') {
            $('.cColumn .columnGroup').eq(0).after($('.subNavigation .firstColumn .columnGroup'));
        }

        if (pageCategory === 'health' || pageCategory === 'theater') {
            $('.bColumn').eq(0).prepend($('.subNavigation .first .columnGroup'));
        }

        if (pageCategory === 'your-money') {
            $('.cColumn').eq(0).prepend($('.subNavigation .first .columnGroup'));
        }

        if (pageCategory === 'theater') {
            $('.navigation .selected').eq(0).append(templates.theaterSubNavigation());
        }

        var $parent = $('.navigation .selected:eq(0) a:eq(0)');
        if ( $parent.length > 0 ) {
            var hosts = /dev\.|stg\./;
            var href = $parent.attr('href').replace(hosts, '');
            var $current = $('#masthead h1 > a');
            var currentHref = $current.attr('href').replace(hosts, '');

            if (href !== currentHref) {
                createSubnavBack(href, $parent.text());
            }
        }

    };
    var createSubnavBack = function(href, text) {
        if ($('ul.subNavigation').length > 0) {
            $('.subNavigation').first().prepend('<li class="subnavBack"><a href="' + href + '"><div class="arrow arrow-left"><div class="arrow-conceal"></div></div>' + text + '</a></li>');
        } else if ($('div.subNavigation').length > 0) {
            $('.subNavigation').first().prepend('<div class="subnavBack"><a href="' + href + '"><div class="arrow arrow-left"><div class="arrow-conceal"></div></div>' + text + '</a></div>');
        }
    }

    var showSearch = function() {
        $('#shell').find('.masthead-button, #branding').fadeOut(function(){
            $('#searchWidget').fadeIn(function(){
                $('#searchQuery, #bsearchQuery').focus();
            });
        });
    };

    var hideSearch = function() {
        $('#searchWidget').fadeOut(function(){
            $('#searchQuery, #bsearchQuery').val('');
            $('#shell').find('.masthead-button, #branding').fadeIn();
        });
    };

    var mousemoveDocument = function(e) {
        if (mTimeout) {
            mouseLocs.push({x: e.pageX, y: e.pageY});

            if (mouseLocs.length > mouseLocsTracked) {
                mouseLocs.shift();
            }

            startMTimeout();
        }
    };

    var startMTimeout = function() {
        mTimeout = false;
        setTimeout(function() {
            mTimeout = true;
        }, 5);
    };

    var getAngle = function(a, b) {
        if (a && b) {
            var x1 = a.x;
            var y1 = a.y;

            var x2 = b.x;
            var y2 = b.y;

            var dx = x2 - x1;
            var dy = y2 - y1;
            var result = Math.round((Math.atan2(dx,  dy) * 180 / Math.PI) * 10) / 10;

            return result;
        } else {
            return null;
        }
    };

    var execReskin = function() {

        navigationModal = NYTD.UI.OverlayModal(navigationModalOptions).addToPage();
        userSettingsModal = NYTD.UI.OverlayModal(userSettingsModalOptions).addToPage();

        // $(document).ready(function() {
            getUserInfo();
            loginDropDown();
            settingsDropDown();
            buildMastheadContent();
        // });
    };

    var delayedClose = function () {
        timer.navClose = window.setTimeout(close, navTimeout);
    };

    var cancelDelayedClose = function () {
        window.clearTimeout(timer.navClose);
    };

    var delayedModalClose = function () {
        cancelDelayedPrimaryHover();
        cancelDelayedSecondaryHover();

        timer.modalClose = window.setTimeout(function() {
            modalClose();
        }, navTimeout);
    };

    var modalClose = function () {
        $el.find('a').removeClass('active'); // resets taxonomy active state
        navigationModal.close();
    };

    var cancelDelayedModalClose = function () {
        window.clearTimeout(timer.modalClose);
    };

    var delayedPrimaryHover = function (e) {
        timer.primaryHoverIntent = window.setTimeout(function(){
            activatePrimaryItem(e);
        }, hoverTimeout);
    };

    var cancelDelayedPrimaryHover = function () {
        window.clearTimeout(timer.primaryHoverIntent);
    };

    var delayedSecondaryHover = function (e) {
        timer.secondaryHoverIntent = window.setTimeout(function(){
            activateSecondaryItem(e);
        }, hoverTimeout);
    };

    var cancelDelayedSecondaryHover = function () {
        window.clearTimeout(timer.secondaryHoverIntent);
    };

    var handleClickClose = function (e) {
        if ($(e.target).closest('#navigation-panel, .navigationModal').length === 0) {
            close();
        }
    };

    // Tracking

    var handleRegisterNowClick = function (e) {
        var $el = $(e.currentTarget);
        $el.attr('href', 'https://myaccount.nytimes.com/register');
        var href = trackingAppendParams($el.attr('href'),
            trackingCombineData({
                'module': 'Registration',
                'contentCollection': getPageCategory()
            })
        );
        $el.attr('href', href);
    };

    var handleLoginModalClick = function (e) {
        var $el = $(e.currentTarget);

        var data = {
            'contentCollection': getPageCategory()
        };

        if ($el.hasClass('login-modal-profile')) {
            data.module = 'MyProfile';
        }

        if ($el.hasClass('login-modal-account')) {
            data.module = 'MyAccount';
        }

        if ($el.hasClass('login-modal-saved')) {
            data.module = 'MySavedItems';
        }

        if ($el.hasClass('log-out-button')) {
            data.module = 'LogOut';
        }

        if ($el.hasClass('login-modal-bill')) {
            data.module = 'MyBillingInformation';
        }

        var href = trackingAppendParams($el.attr('href'),
            trackingCombineData(data)
        );

        $el.attr('href', href);
    };

    var handleLoginButtonClick = function (e) {
        var $el = $(e.currentTarget);
        var href = trackingAppendParams($el.attr('href'),
            trackingCombineData({
                'module': 'Login',
                'contentCollection': getPageCategory()
            })
        );
        $el.attr('href', href);
    };

    var handleSearchClick = function (e) {
        showSearch();

        trackingTrigger('masthead-search-click',
            trackingCombineData({
                'module': 'SearchOpen',
                'eventName': 'OpenSearchBar'
            })
        );
    };

    var handleSettingsModalEditionClick = function(e) {
        var $el = $(e.currentTarget);
        var editionData = {
            'us': 'EditionToggleToUS',
            'international': 'EditionToggleToGlobal',
            'chinese': 'EditionToggleToCHNS',
            'spanish': 'EditionToggleToSpanish',
        };
        var href = trackingAppendParams($el.attr('href'),
            trackingCombineData({
                'module': editionData[$el.data('edition')],
                'contentCollection': getPageCategory()
            })
        );
        $el.attr('href', href);
    };

    var handleSettingsModalHelpClick = function (e) {
        var $el = $(e.currentTarget);

        var data = {
            'contentCollection': getPageCategory()
        };

        if ($el.hasClass('settings-faq')) {
            data.module = 'FAQ';
        }

        if ($el.hasClass('settings-contact')) {
            data.module = 'ContactUs';
        }

        var href = trackingAppendParams($el.attr('href'),
            trackingCombineData(data)
        );

        $el.attr('href', href);
    };

    var handleSearchSubmit = function (e) {
        var url = searchUrl;
        var queryValue = $('#query_all');
        e.preventDefault();
        if(getPageCategory() === 'health' && queryValue.length > 0 && queryValue.val() && (queryValue.val()).length > 0) {
            url += queryValue.val();
        } else {
            url += $('#searchQuery, #bsearchQuery').val();
        }
        var href = trackingAppendParams(url,
            trackingCombineData({
                'module': 'SearchSubmit',
                'contentCollection': getPageCategory()
            })
        );

        window.location = href;
    };

    var handlePrimaryNavigationClick = function (e) {
        var $el = $(e.currentTarget);
        var href = trackingAppendParams($el.attr('href'),
            trackingCombineData({
                'module': 'SectionsNav',
                'region': 'TopBar',
                'action': 'click',
                'version': 'BrowseTree',
                'contentCollection': $.trim($el.text())
            })
        );
        $el.attr('href', href);
    };

    var handleModalClick = function (e) {
        var $el = $(e.currentTarget);
        var header = $.trim($('#navigationModalContainer').find('.secondary-container .header').text());
        var href = trackingAppendParams($el.attr('href'),
            trackingCombineData({
                'module': 'SectionsNav',
                'region': 'TopBar',
                'action': 'click',
                'version': 'BrowseTree',
                'contentCollection': header + '/' + $.trim($el.text()),
                'contentPlacement': $el.closest('ul').hasClass('secondary') ? 2 : 3
            })
        );

        $el.attr('href', href);
    };

    /* var handleCommentsReferClick = function (e) {
        var $el = $(e.currentTarget);
        var region = $el.parents('div[id]:eq(0)').attr('id');
        var href = trackingAppendParams($el.attr('href'),
            {
                'action': 'click',
                'module': 'Comments',
                'contentCollection': getPageCategory(),
                'version': 'HPCommentsRefer',
                'region': region,
                'pgtype': getPageType()
            }
        );

        $el.attr('href', href);
    }; */

    /**
    * Utility method to send an object to the TAGX event proxy
    *
    * @method trackingTrigger
    * @param {String} identifying string for TAGX handling
    * @param {Object} data to send
    */
    var trackingTrigger = function (action, trackingData) {
        if (window.TAGX && window.TAGX.EventProxy && window.TAGX.EventProxy.trigger) {
            try {
                window.TAGX.EventProxy.trigger(action, trackingData);
            }
            catch(e) {
                //Tagx didn't work :-/
            }
        }
    };

    /**
     * Creates an anchor for a provided url
     *
     * @public
     * @method createAnchor
     * @param url {String} an object similar to window.location
    **/
    var createAnchor = function (url) {
        var anchor = document.createElement('a');
        anchor.href = url;
        return anchor;
    };

    /**
     * Utility method to combine base tracking data with the provided object
     *
     * @method trackingCombineData
     * @param {Object} data to combine or override with base data
     * @return {Object}
    */
    var trackingCombineData = function (obj) {
        try {
            // return $.extend({}, trackingBaseData, obj);
        }
        catch(e) {
            //just in case
        }
    };

    /**
     * Utility method to convert an object into a query string for appending to URLs
     *
     * @method trackingAppendParams
     * @param {String} href the href value from the link
     * @param {Object} paramsObj the object to serialize into a string for the URL
     * @return {String} the new url with the meta data appended to it
    */
    var trackingAppendParams = function (href, paramsObj) {
        var key;
        var aElem = createAnchor(href);
        var query = aElem.search;
        var separator = query.length > 0 && query.indexOf('?') === 0 ? '&' : '?';
        var cookieName = 'qry' + Math.ceil(Math.random() * 1000);
        var paramsList = [];

        //add the custom cookie to the tracking parameters
        paramsObj.t = cookieName;

        for (key in paramsObj) {
            var paramPart = encodeURIComponent(key) + '=';
            paramsList.push(paramPart + encodeURIComponent(paramsObj[key]));

            if (query.indexOf(paramPart) !== -1) {
                query = query.replace(new RegExp('&?' + paramPart + '[^&]*'), '');
            }
        }

        var trackingParamsStr = paramsList.join('&');
        var retUrl = [
            aElem.protocol !== ':' ? aElem.protocol + '//' : '',
            aElem.hostname !== '' ? aElem.hostname : '',
            '/', aElem.pathname.replace(/^\//, ''),
            aElem.search, separator, trackingParamsStr,
            aElem.hash
        ].join('');

        // cookie expires in 2 min
        var cookieExp = new Date();
        cookieExp.setMinutes(cookieExp.getMinutes() + 2);
        // try to set the cookie
        //cookies.writeCookie(cookieName, trackingParamsStr, { expires: cookieExp });
        // did it work?
        //var cookieFailed = cookies.readCookie(cookieName) === null;

        //failed cookies get an extra paramater for tracking purposes.
        //if (cookieFailed) {
        //    trackingParamsStr = 'alxcookie=0&' + trackingParamsStr;
        //}

        //return cookieFailed ? href + separator + trackingParamsStr : href + separator + 't=' + cookieName;
        return retUrl;
    };

    // Try reskin

    var tryReskin = function() {
        if ($('.NYT5Style').length) {
            if (getPageCategory() === 't-magazine') {
                $('html').removeClass('NYT5Style');
                return;
            } else {
                if ($('#masthead').length > 0) {
                    execReskin();
                } else {
                    setTimeout(function() {
                        tryReskin();
                    }, 100);
                }
            }
        }
    };

    tryReskin();

    return {
        open : open,
        close : close,
        toggle : toggle,
        showSearch : showSearch,
        hideSearch : hideSearch
    };

}(NYTD.jQuery));

