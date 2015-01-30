// ==UserScript==
// @name           asahi.com: Ajaxで「続きを読む」
// @description    朝日新聞の記事ページで「続きを読む」ボタンを押すとその場で全文を表示する
// @version        1.0
// @author         vzvu3k6k
// @match          http://www.asahi.com/articles/*
// @match          http://digital.asahi.com/articles/*
// @namespace      http://vzvu3k6k.tk/
// @license        CC0
// @grant          GM_xmlhttpRequest
// ==/UserScript==

var $moreButton = document.querySelector('.ReadMore a[href^="http://digital.asahi.com/articles/"]');
var disable = false;

$moreButton.addEventListener('click', function(event){
  if(disable) return;
  event.preventDefault();

  var fail = function(message){
    $moreButton.textContent = message;
    disable = true;
  };

  GM_xmlhttpRequest({
    method: 'GET',
    url: $moreButton.href,
    onload: function(response){
      try{
        if(response.status !== 200){
          fail('読み込みに失敗しました (HTTP status code: ' + response.status + ')');
          return;
        }

        if(response.finalUrl === 'http://digital.asahi.com/notice/notice_ltov.html'){
          fail('閲覧可能本数を超過しました');
          return;
        }

        var responseDocument = (new DOMParser).parseFromString(response.responseText, 'text/html');
        var originalArticleBody = document.querySelector('.ArticleBody');
        var fullArticleBody = responseDocument.querySelector('.ArticleBody');
        originalArticleBody.parentNode.replaceChild(fullArticleBody, originalArticleBody);
      }catch(e){
        fail('読み込みに失敗しました（' + e + '）');
      }
    },
    onerror: function(){
      fail('読み込みに失敗しました');
    },
    ontimeout: function(){
      fail('読み込みに失敗しました（タイムアウト）');
    },
  });
});
