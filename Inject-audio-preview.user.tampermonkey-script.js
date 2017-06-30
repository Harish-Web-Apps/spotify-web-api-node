// ==UserScript==
// @name         Inject audio preview
// @namespace    http://www.ebay.com/
// @version      0.1
// @description  Add spotify audio prev for album
// @author       You
// @match        http://www.ebay.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // var placeHolder = $('#RightSummaryPanel');
    var itemTitle = $('.it-ttl')[0].innerText;
    console.log(itemTitle);
    console.log('===========================');
    $.getJSON("http://hakumar-mac.dev.ebay.com:8888/getAlbum?name="+itemTitle+"&callback=?",function(json){
        console.log(json);
        var placeHolder = $('#scandal100562');
        if(json && json.spotifyUri) {
            var spotifyUri = json.spotifyUri;
            placeHolder.replaceWith('<iframe src="https://open.spotify.com/embed?uri='+spotifyUri+'&theme=white" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>');
        }
    });
})();