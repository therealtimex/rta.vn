window.chatSettings = {
  locale: chat_object.chat_widget_locale,
  type: chat_object.chat_widget_type,
  position: chat_object.chat_widget_position,
  launcherTitle: chat_object.chat_launcher_text,
};

(function(d,t) {
    var BASE_URL="https://rtchat.rtworkspace.com";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/packs/js/sdk.js";
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.chatwootSDK.run({
        websiteToken: chat_object.chat_token,
        baseUrl: BASE_URL
      })
    }
})(document,"script");

const setCookie = (name, value, days) => {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const getCookie = (name) => {
  if (!name) {
	return null;
  }
  
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

const removeCookie = (name) => {
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;';
}


window.addEventListener("chatwoot:ready", function () {
  var BOT_CONTEXT_ID = 'ad64f6d4-f85e-4809-aeb6-009f577ee558';
  var refererURL     = new URL(window.location.href);
  if ( BOT_CONTEXT_ID !== null && BOT_CONTEXT_ID.trim() !== '' && !refererURL.searchParams.has('bot_context_id') ) {
    refererURL.searchParams.set('bot_context_id', BOT_CONTEXT_ID);
  }

  var iframeEle = document.querySelector('iframe[src*="https://rtchat.rtworkspace.com"]');
  if ( iframeEle ) {
    iframeEle.contentWindow.postMessage(
      `chatwoot-widget:${JSON.stringify({ event: 'change-url', ...{ referrerURL: refererURL.toString(), referrerHost: window.location.host } })}`,
      '*'
    );
  }

  
  // Setting the chatwoot conversation based on the conversation id which is mapped with bot context id  
  var contextId   = refererURL.searchParams.get('bot_context_id') || BOT_CONTEXT_ID;
  var oldCwCookie = getCookie(contextId);
  var newCwCookie = getCookie('cw_conversation');
  
  if ( contextId && iframeEle ) {
    if ( oldCwCookie && oldCwCookie !== newCwCookie ) {
      newCwCookie = oldCwCookie;

      var widgetURL = new URL (iframeEle.src);
      widgetURL.searchParams.set('cw_conversation', newCwCookie);
      iframeEle.src = widgetURL.toString();
    }

    setCookie(contextId, newCwCookie, 365);
    removeCookie('cw_conversation');
  }
});
