/*
* $Id: updateTimeStamps.js 144464 2014-07-10 19:14:19Z naveen.malla $
*/

(function (jQuery) {
    'use strict';
    var $ = jQuery;
    var refreshInterval = 30000; //milliseconds
    var timestamps;

    function init() {
        timestamps = $('span.timestamp, time.timestamp');
        updateTimestamps();
        window.setInterval(updateTimestamps, refreshInterval);
    }

    function updateTimestamps() {
    //  Limit updates to those that are visible
        timestamps.each(function () {
            var elem = $(this); 
            var etTimestampData = elem.data('easternTimestamp');  //11:25 PM
            var utcTimestampData = elem.data('utcTimestamp');  //milliseconds
            if (etTimestampData && utcTimestampData) {
                elem.html(getTimestampDisplayString(etTimestampData, utcTimestampData));
                elem.show();
            }
        });
    }

    function getTimestampDisplayString(etTimestampData, utcTimestampData) {
        var tsText;
        var diff                = ($.now() - utcTimestampData) / 1000; // ms to s
        var minutesAgo          = Math.ceil(diff / 60); 
        var greaterThanSixHours = (diff > 21600);

        if (minutesAgo === 1) {
            tsText = "1 minute ago";
        } else if (minutesAgo > 1 && minutesAgo < 60) {
            tsText = minutesAgo + " minutes ago";
        } else if (greaterThanSixHours) {
            tsText = '';
        } else {
        // 11:25 PM ET
            tsText = etTimestampData + " ET";
        }
        return tsText;
    }

    $(document).ready(init);
})(NYTD.jQuery);