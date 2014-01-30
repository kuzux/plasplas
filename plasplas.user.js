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
            return "<div class='spoilerOuter'> <button class='spoilerButton primary'>spoiler ac/kapa</button> <div class='spoilerText'>"+spoilerText+"</div></div>";
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

    // TODO: those replace functions repeat a lot of boilerplate code
    // DRY them up.
    var replaceImages = function(){
        var url = $(this).attr("href");
        var shown = false;
        var elem = null;
        var self = $(this);

        if(url.match(/\.(gif|jpg|png|jpeg|bmp)/)){
            self.click(function(e){
                if(e.which !== 1 || e.ctrlKey === true){
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
    
        // match youtube.com?v=videoId
        // and   youtu.be/videoId
        // possibly there are more url types?
        if(url.match(/youtu.be\/[a-zA-Z0-9\-]+/)){
            videoId = url.match(/youtu.be\/([a-zA-Z0-9\-]+)/)[1];
        } else if (url.match(/youtube.com/)){
            videoId = url.match(/v=([a-zA-Z0-9\-]+)/)[1];
        }

        if(videoId !== null){
            self.click(function(e){
                if(e.which !== 1 || e.ctrlKey === true){
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
        }

        if(tweetId!==null){
            $(this).click(function(e){
                if(e.which !== 1 || e.ctrlKey === true){
                    return true; // middle clickte linki ac
                }

                if(!shown){
                    shown = true;
                    if(elem !== null){
                        self.next().show();
                    } else {
                        // make a twitter api request to find out the embed code
                        // twitter embed thingy changes the element immediately
                        // so when we set elem = self.next(), that element is destroyed when the actual iframe is loaded 
                        // so we need to specify self.next() to hide/show the iframe loaded from twitter
                        $.ajax("https://api.twitter.com/1/statuses/oembed.json?id="+ tweetId).done(function(data){
                            $(data.html).insertAfter(self);
                            elem = self.next();
                        }).fail(function(data){
                            // todo: handle errors depending on error message we've got.
                            elem = $("<blockquote>Yokmus boyle bi tweet</blockquote>").insertAfter(self);
                        });
                    }
                } else {
                    shown = false;
                    self.next().hide();
                }
                return false;
            });
        }
    };

    var replaceEntry = function(){
        var url = $(this).attr("href");
        var shown = false;
        var elem = null;
        var self = $(this);

        if(url.match(/^\/entry\//)){
            $(this).click(function(e){
                if(e.which !== 1 || e.ctrlKey === true){
                    return true; // middle clickte linki ac
                }

                if(!shown){
                    shown = true;

                    if(elem !== null){
                        self.next().show();
                    } else {
                        // fetch the entry page and scrape the shit out of it.
                        $.get(url, function(data){
                            var doc = $("<div></div>").html(data);
                            var title = doc.find("#content-body #title");
                            var entries = doc.find("#content-body #entry-list");
                            elem = $("<div></div>").insertAfter(self);
                            elem.css({
                                "width": "600px",
                                "background-color": "rgba(0,0,0,0.1)",
                                "border": "2px solid rgba(0,0,0,0.3)",
                                "padding": "5px"
                            });
                            elem.append(title);
                            elem.append(entries);
                        });
                    }
                } else {
                    shown = false;
                    self.next().hide();
                }
                return false;
            });
        }
    };

    var replaceSwf = function(){
        var url = $(this).attr("href");
        var shown = false;
        var elem = null;
        var self = $(this);

        // can we do something to bypass swf s being blocked by chrome on https?
        // i doubt anything could be done, at least it's just a one-time inconvenience
        if(url.match(/\.swf$/)){
            $(this).click(function(e){
                if(e.which !== 1 || e.ctrlKey === true){
                    return true; // middle clickte linki ac
                }

                if(!shown){
                    shown = true;
                    if(elem!==null){
                        self.next().show();
                        self.next().css("display", "block");
                    } else {
                        elem = $("<object style='display:block' type='application/x-shockwave-flash' width='400' height='400'></object>").insertAfter(self);
                        elem.append("<param name='movie' value='"+url+"' />");
                        elem.append("<embed src='"+url+"' width='400' height='400'></embed>");
                    }
                } else {
                    shown = false;
                    self.next().hide();
                }
                return false;
            });
        }
    };

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
        var removeLinks = function(){
            // remove li elements that contain sponsored links
            $(".topic-list a.sponsored").parent().remove();
        };

        setTimeout(removeLinks, 1000); // load suresini bilemeyiz, baglanti yavassa sictik
                                           // belki baska, duzgun yolu da vardir?
        setTimeout(removeLinks, 3000);
        setTimeout(removeLinks, 9000);
        return true;
    };

    var removeBannedTitles = function(){
        var regex = new RegExp(localStorage["plasplas-yasakli-kelime"].split(",").join("|"));
        var removeLinks = function(){
            $(".topic-list a").each(function(){
                if($(this).text().match(regex)){
                    console.log($(this).text());
                    $(this).parent().remove();
                }
            });
        };

        setTimeout(removeLinks, 1000);
        setTimeout(removeLinks, 3000);
        setTimeout(removeLinks, 9000);
        return true;
    };

    var hijackSolFrame = function(){
        if(localStorage["plasplas-akilli-bkz"]){
            removeSponsored();                                 // sol frame reklami yoket
            $("#feed-refresh-link").click(removeSponsored);    // her yenilemede yoket
            $("#quick-index-nav a[href='/bugun']").click(removeSponsored);
            $("#quick-index-nav a[href='/gundem']").click(removeSponsored);
        }

        if(localStorage["plasplas-yasakli-kelime"]!==""){
            removeBannedTitles();
            $("#feed-refresh-link").click(removeBannedTitles);    // her yenilemede yoket
            $("#quick-index-nav a[href='/bugun']").click(removeBannedTitles);
            $("#quick-index-nav a[href='/gundem']").click(removeBannedTitles);
        }
    };

    var hijackMain = function(){
        if(localStorage["plasplas-konulu"]){
            $("#aside").remove();                                    // konulu videolari yoket
            $("#content-body").css("width", "990px");    
        }

        if(localStorage["plasplas-59saniye"]){
            $("#content-body #video").remove();
        }

        if(localStorage["plasplas-spoiler"]){
            $("article .content").each(replaceSpoiler);              // spoiler koruma sistemi
        }

        if(localStorage["plasplas-embed-stuff"]){
            // If this causes performance issues, group all replace functions in a single loop
            // instead of looping over all links for every function
            $("article .content a.url").each(replaceImages);         // resim gommece
            $("article .content a.url").each(replaceYoutube);        // youtube gommece
            $("article .content a.url").each(replaceTwitter);        // twitter gommece
            $("article .content a.url").each(replaceSwf);            // swf gom
            $("article .content a.b").each(replaceEntry);            // entry bkz i gommece
        }
        
        if(localStorage["plasplas-akilli-bkz"]){
            $("sup.ab a").each(akilliBkzClicker);                    // mobil icin akilli bakiniz tiklatgaci
        }
    };

    var hijackSettings = function(){
        // add button to tabs
        // todo: add button to alternative navigation as well
        var plasplasBtn = $("<li><a href='#'>plasplas</a></li>").appendTo($("#settings-tabs"));

        plasplasBtn.click(function(){
            $("#settings-tabs .active").removeClass("active");
            plasplasBtn.addClass("active");     // change active tab

            var altNav = $("#settings-alternate-nav");
            altNav.nextAll().remove();         // clear the settings page

            var pane = $("<div></div>").insertAfter(altNav);

            // assemble the settings pane
            pane.append("<p><input type='checkbox' id='plasplas-embed-stuff' /> Resim/Video/Twitter gom</p>");
            pane.append("<p><input type='checkbox' id='plasplas-akilli-bkz' /> Akilli Bkzlari Ac </p>");
            pane.append("<p><input type='checkbox' id='plasplas-spoiler' /> Spoilerlarin serrinden koru </p>");
            pane.append("<p><input type='checkbox' id='plasplas-reklam' /> Sol frame reklamlarini gizle </p>");
            pane.append("<p><input type='checkbox' id='plasplas-konulu' /> Konulu videolari gizle </p>");
            pane.append("<p><input type='checkbox' id='plasplas-59saniye' /> 59 saniye videolarini gizle </p>");
            pane.append("<p>Sol frame'den yasakli kelimeler <br /> <input type='text' id='plasplas-yasakli-kelime' /></p>");

            // load the current settings to pane from local storage
            var boolSettings = ["plasplas-embed-stuff", "plasplas-akilli-bkz", "plasplas-spoiler", "plasplas-reklam", "plasplas-konulu", "plasplas-59saniye"];
            boolSettings.forEach(function(e){
                if(localStorage[e]){
                    $("#" + e).prop('checked', true);
                }
            });

            $("#plasplas-yasakli-kelime").val(localStorage["plasplas-yasakli-kelime"]);

            $("<button class='primary'>kaydet</button>").appendTo(pane).click(function(){
                // store the settings to local storage
                boolSettings.forEach(function(e){
                    if($("#" + e).is(":checked")){
                        localStorage[e] = true;
                    } else {
                        localStorage[e] = false;
                    }
                });

                localStorage["plasplas-yasakli-kelime"] = $("#plasplas-yasakli-kelime").val().toLowerCase().split(/\s*,\s*/);

                pane.append("<p>Kaydedildi Efenim</p>");
                return false;
            });
        });
    };

    var loadDefaultSettings = function(){
        var settings = ["plasplas-embed-stuff", "plasplas-akilli-bkz", "plasplas-spoiler", "plasplas-reklam", "plasplas-konulu", "plasplas-59saniye","plasplas-yasakli-kelime"];
        var defaults = [true, true, true, true, true, false, ""];

        settings.forEach(function(e, idx){
            if(localStorage[e] === undefined){
                localStorage[e] = defaults[idx];
            }
        });
    };

    loadDefaultSettings();

    var path = window.location.pathname;

    if(path.match(/\/ayarlar\//)){
        hijackSettings();
    } else {
        hijackMain();
    }
    hijackSolFrame();
});
