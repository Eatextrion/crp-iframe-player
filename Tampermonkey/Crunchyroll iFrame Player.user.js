// ==UserScript==
// @name         Crunchyroll iFrame Player
// @namespace    http://tampermonkey.net/
// @version      2.0

// @description  Este script Permite ver todos os vídeos do site crunchyroll gratuitamente.	Nota(JarEd):	Apenas modifiquei um pouco do código para UserScript, o código original já não é mais disponibilizado pelos desenvolvedores, contudo, só está aqui nessa comunidade pois o código está disponível na web em vários sites e ele é de domínio público, colocando em ênfase que não me beneficio com o mesmo.

// @author       Eatextrion

// @match        http://www.crunchyroll.com/*
// @match        https://www.crunchyroll.com/*
// @grant        none
// @icon         https://www.crunchyroll.com/favicons/favicon-32x32.png
// ==/UserScript==

(function() {
    'use strict';

    var HTML = document.documentElement.innerHTML;
    var new_str;
    var ifrm;
    var width = 0;

    function pegaString(str, first_character, last_character) {
	if(str.match(first_character + "(.*)" + last_character) == null){
		return null;
	}else{
            new_str = str.match(first_character + "(.*)" + last_character)[1].trim();
	    return(new_str);
    }
}

    function optimize_for_mobile() {

		console.log("[CR Premium] Optimizando página para mobile...");
		width = document.body.offsetWidth;
		var carousel_move_times = 0;
		var carousel_videos_count = 0;
		var carousel_arrow_limit = 0;

		switch (true) {
			case (width < 622 && width > 506):
				carousel_move_times = 4;
				break;
			case (width < 506 && width > 390):
				carousel_move_times = 3;
				break;
			case (width < 390 && width > 274):
				carousel_move_times = 2;
				break;
			case (width < 274 && width > 0):
				carousel_move_times = 1;
				break;
			default:
				carousel_move_times = 5;
		}
		function getChildNodes(node) {
		    var children = new Array();
		    for(var child in node.childNodes) {
		        if(node.childNodes[child].nodeName == "DIV" && node.childNodes[child].attributes.media_id != null) {
		            children.push(child);
		        }
		    }
		    return children;
		}
		carousel_videos_count = getChildNodes(document.body.querySelector('div.collection-carousel-scrollable'));

		carousel_arrow_limit = Number(pegaString(
			document.body.querySelector('div.white-wrapper.container-shadow.large-margin-bottom').childNodes[3].innerHTML
			, "Math.min", ","
		).replace("(", ""));

		var carousel_script = document.body.querySelector('div.white-wrapper.container-shadow.large-margin-bottom').childNodes[3].innerText
		.replace(".data()['first_visible'] - 5", ".data()['first_visible'] - " + carousel_move_times)
		.replace(".data()['first_visible'] + 5", ".data()['first_visible'] + " + carousel_move_times)
		.replace("Math.min(" + carousel_arrow_limit + ",", "Math.min(" + (carousel_videos_count.length - carousel_move_times) + ",")
		.replace(".data()['first_visible'] < " + carousel_arrow_limit, ".data()['first_visible'] < " + (carousel_videos_count.length - carousel_move_times))
		.replace(".data()['first_visible'] >= " + carousel_arrow_limit, ".data()['first_visible'] >= " + (carousel_videos_count.length - carousel_move_times))
		.replace(".data()['first_visible'] >= " + carousel_arrow_limit, ".data()['first_visible'] >= " + (carousel_videos_count.length - carousel_move_times));

		var old_element = document.querySelector(".collection-carousel-leftarrow");
		var new_element = old_element.cloneNode(true);
		old_element.parentNode.replaceChild(new_element, old_element);

		old_element = document.querySelector(".collection-carousel-rightarrow");
		new_element = old_element.cloneNode(true);
		old_element.parentNode.replaceChild(new_element, old_element);

		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.onload = function() {
		    callFunctionFromScript();
		};
		script.text = carousel_script;
		head.appendChild(script);

		if(document.getElementById('showmedia_video_box_wide') != null) {
			document.getElementById('showmedia_video_box_wide').id = 'showmedia_video_box';
		}

		if(document.body.querySelector('div.collection-carousel-scrollable').lastElementChild.childNodes[1] != undefined) {
			if(document.body.querySelector('div.collection-carousel-scrollable').lastElementChild.childNodes[1].classList.value.indexOf('collection-carousel-media-link-current') == -1) {
				if(carousel_move_times == 4) {
					if(document.body.querySelector('div.collection-carousel-scrollable').lastElementChild.previousElementSibling.childNodes[1].classList.value.indexOf('collection-carousel-media-link-current') == -1) {
						document.body.querySelector('a.collection-carousel-rightarrow').classList = "collection-carousel-arrow collection-carousel-rightarrow";
					}
				}else{
					document.body.querySelector('a.collection-carousel-rightarrow').classList = "collection-carousel-arrow collection-carousel-rightarrow";
				}
			}else{
				if(carousel_move_times == 2){
					document.body.querySelector('a.collection-carousel-rightarrow').classList = "collection-carousel-arrow collection-carousel-rightarrow";
				}
			}
		}
}


    function importPlayer() {

	console.log("[CR Premium] Removendo player da Crunchyroll...");
	var elem = document.getElementById('showmedia_video_player');
    	elem.parentNode.removeChild(elem);

	console.log("[CR Premium] Pegando dados da stream...");
	var video_config_media = JSON.parse(pegaString(HTML, "vilos.config.media = ", ";"));

    	console.log("[CR Premium] Adicionando o jwplayer...");
    	var ifrm = document.createElement("iframe");
    	ifrm.setAttribute("id", "frame");
		ifrm.setAttribute("src", "https://eatextrion.github.io/crp-iframe-player/");
		ifrm.setAttribute("width","100%");
		ifrm.setAttribute("height","100%");
		ifrm.setAttribute("frameborder","0");
		ifrm.setAttribute("scrolling","no");
		ifrm.setAttribute("allowfullscreen","allowfullscreen");
		ifrm.setAttribute("allow","autoplay; encrypted-media *");


		if(document.body.querySelector("#showmedia_video_box") != null){
			document.body.querySelector("#showmedia_video_box").appendChild(ifrm);
		}else{
			document.body.querySelector("#showmedia_video_box_wide").appendChild(ifrm);
		}

		if (document.body.querySelector(".freetrial-note") != null) {
			console.log("[CR Premium] Removendo Free Trial Note...");
			document.body.querySelector(".freetrial-note").style.display = "none";
		}

		if(document.body.querySelector(".showmedia-trailer-notice") != null){
			console.log("[CR Premium] Removendo Trailer Notice...");
                        document.body.querySelector(".showmedia-trailer-notice").style.textDecoration = "line-through";
		}

		if(document.body.querySelector("#showmedia_free_trial_signup") != null){
			console.log("[CR Premium] Removendo Free Trial Signup...");
                        document.body.querySelector("#showmedia_free_trial_signup").style.display = "none";
		}

		var element = document.getElementById("template_scroller");
		if (element) element.click();

		const series = document.querySelector('meta[property="og:title"]');
		const up_next = document.querySelector('link[rel=next]');
                        ifrm.onload = function(){
                                ifrm.contentWindow.postMessage({
                                'video_config_media': [JSON.stringify(video_config_media)],
                                'lang': [pegaString(HTML, 'LOCALE = "', '",')],
                                        'series': series ? series.content : undefined,
				   	'up_next': up_next ? up_next.href : undefined,
				   	'version': "2"
                        },"*");
                        };

		console.log(video_config_media);

		if(width < 796) {
			optimize_for_mobile();
		}
}
function onloadfunction() {

    if(window.location.href == "https://www.crunchyroll.com/interstitial/android") {
       	window.location.href = "https://www.crunchyroll.com/interstitial/android?skip=1";
    }

	var metaTag = document.createElement('meta');
	metaTag.name = "viewport"
	metaTag.content = "width=device-width, initial-scale=1.0, shrink-to-fit=no, user-scalable=no"
	document.getElementsByTagName('head')[0].appendChild(metaTag);

	window.scrollTo(0, 0);

	if(pegaString(HTML, "vilos.config.media = ", ";") != null){
		importPlayer();
	}
}
document.addEventListener("DOMContentLoaded", onloadfunction());
})();

		console.log(video_config_media);

		if(width < 796) {
			optimize_for_mobile();
		}
}
function onloadfunction() {

    if(window.location.href == "https://www.crunchyroll.com/interstitial/android") {
       	window.location.href = "https://www.crunchyroll.com/interstitial/android?skip=1";
    }

	var metaTag = document.createElement('meta');
	metaTag.name = "viewport"
	metaTag.content = "width=device-width, initial-scale=1.0, shrink-to-fit=no, user-scalable=no"
	document.getElementsByTagName('head')[0].appendChild(metaTag);

	window.scrollTo(0, 0);

	if(pegaString(HTML, "vilos.config.media = ", ";") != null){
		importPlayer();
	}
}
document.addEventListener("DOMContentLoaded", onloadfunction());
})();
