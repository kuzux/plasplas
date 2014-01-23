// ==UserScript==
// @name Plasplas
// @namespace https://github.com/kuzux/
// @description Eksi Sozluk e bonus feature lar sakalar komiklikler
// @include http://eksisozluk.com/*
// @include https://eksisozluk.com/*
// ==/UserScript==
$(function(){
    var replaceSpoiler = function(){
        var orig = $(this).html();
        var pattern = /---\s*<a class=\"b\" href=\"\/\?q=spoiler\">spoiler<\/a>\s*---\s*<br>\s*(.*)\s*<br>\s*---\s*<a class=\"b\" href=\"\/\?q=spoiler\">spoiler<\/a>\s*---/g;
        var modif = orig.replace(pattern, function(match, spoilerText){
            return "<div class='spoilerOuter'> <button class='spoilerButton'>---spoiler---</button> <div class='spoilerText'>"+spoilerText+"</div></div>";
        });

        $(this).html(modif);
        $(this).find(".spoilerText").hide();
        $(this).find(".spoilerButton").each(function(){
            var spoilerText = $(this).siblings(".spoilerText");
            $(this).click(function(){
                spoilerText.toggle();
            });
        });
    };

    var replaceImages = function(){
        var url = $(this).attr("href");
        var shown = false;
        var elem = null;
        var self = $(this);

        if(url.match(/\.(gif|jpg|png|jpeg|bmp)/)){
            self.click(function(e){
                if(e.which !== 1){
                    return true; // middle clickte linki ac
                }

                if(!shown){
                    shown = true;
                    if(elem !== null){
                        elem.show();
                    } else {
                        elem = $("<img class='plasplas-img' src='"+url+"' style='display:block' />").insertAfter(self);
                    }
                } else {
                    shown = false;
                    elem.hide();
                }
                return false;
            });
        }
    };

    var replaceYoutube = function(){
        var url = $(this).attr("href");
        var shown = false;
        var elem = null;
        var videoId = null;
        var self = $(this);
    
        if(url.match(/youtu.be\/[a-zA-Z0-9\-]+/)){
            videoId = url.match(/youtu.be\/([a-zA-Z0-9\-]+)/)[1];
        } else if (url.match(/youtube.com/)){
            videoId = url.match(/v=([a-zA-Z0-9\-]+)/)[1];
        }

        if(videoId !== null){
            self.click(function(e){
                if(e.which !== 1){
                    return true; // middle clickte linki ac
                }

                if(!shown){
                    shown = true;
                    if(elem !== null){
                        elem.show();
                    } else {
                        elem = $("<iframe width='420' height='315' style='display:block' src='//www.youtube.com/embed/" + videoId + "' frameborder='0' allowfullscreen></iframe>").insertAfter(self);
                    }
                } else {
                    elem.hide();
                    shown = false;
                }
                return false;
            });
        }
    };

    var replaceTwitter = function(){
        var url = $(this).attr("href");
        var shown = false;
        var elem = null;
        var tweetId = null;
        var self = $(this);
        
        if(url.match(/twitter.com\/.*\/status\/(\d+)\/?/)){
            tweetId = url.match(/twitter.com\/.*\/status\/(\d+)\/?/)[1];
            console.log(tweetId);
        }

        if(tweetId!==null){
            $(this).click(function(e){
                if(e.which !== 1){
                    return true; // middle clickte linki ac
                }

                if(!shown){
                    shown = true;
                    if(elem !== null){
                        self.next().show();
                    } else {
                        $.ajax("https://api.twitter.com/1/statuses/oembed.json?id="+ tweetId).done(function(data){
                            console.log(data.html);
                            $(data.html).insertAfter(self);
                            elem = self.next();
                        });
                    }
                } else {
                    shown = false;
                    self.next().hide();
                }
                return false;
            });
        }

    }

    var akilliBkzClicker = function(){
        $(this).click(function(){
            if($(this).html()==="*"){
                var modif = "*(bkz: " + $(this).data("query") + ")";
                $(this).html(modif);
                return false;
            } else {
                return true;
            }
        });
    };

    var removeSponsored = function(){
        $(".topic-list a.sponsored").parent().remove();
    };

    var removeSponsoredRefresh = function(){
        setTimeout(removeSponsored, 1000); // load suresini bilemeyiz, baglanti yavassa sictik
                                           // belki baska, duzgun yolu da vardir?
        setTimeout(removeSponsored, 3000);
        setTimeout(removeSponsored, 9000);
        return true;
    };

    $("#aside").remove();                                    // konulu videolari yoket
    $("#content-body").css("width", "990px");    

    $("article .content").each(replaceSpoiler);              // spoiler koruma sistemi
    $("article .content a.url").each(replaceImages);         // resim gommece
    $("article .content a.url").each(replaceYoutube);        // youtube gommece
    $("article .content a.url").each(replaceTwitter);        // twitter gommece
    
    removeSponsored();                                       // sol frame reklami yoket
    $("#feed-refresh-link").click(removeSponsoredRefresh);   // her yenilemede yoket
    $("#quick-index-nav a[href='/bugun']").click(removeSponsoredRefresh);
    $("#quick-index-nav a[href='/gundem']").click(removeSponsoredRefresh);
    
    $("sup.ab a").each(akilliBkzClicker);                    // mobil icin akilli bakiniz tiklatgaci
});
