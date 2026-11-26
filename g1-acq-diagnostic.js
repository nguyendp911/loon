/**
 * G1 ACQ Diagnostics - Shadowrocket v1.0
 * Read-only response observer. Never replaces SKU, amount, or any HTTP body.
 * Don't share full response, token, cookie or HAR files.
 */
"use strict";
(function () {
  try {
    var url = typeof $request !== "undefined" && $request && typeof $request.url === "string" ? $request.url : "";
    if (!/^https:\/\/one\.google\.com\//i.test(url)) {
      console.log("[G1-DIAG] skipped unrelated host");
      $done({});
      return;
    }
    var urlObj = url.match(/^https:\/\/one\.google\.com(\/[^?#]*)/i);
    var path = urlObj ? urlObj[1] : "/";
    var isAi = /^\/(?:u\/\d+\/)?ai(?:\/|$)/i.test(path);
    var body = typeof $response !== "undefined" && $response && typeof $response.body === "string" ? $response.body : "";
    var matches = body.match(/(?:g1|com\.google\.(?:one|gemini))\.[a-z0-9._-]{2,160}/gi) || [];
    var seen=Object.create(null), skus=[];
    for (var i=0; i<matches.length && skus.length < 200; i++) {
      var id=matches[i];
      if(!seen[id]) { seen[id]=true; skus.push(id); }
    }
    var reportedPath = isAi ? "/ai" : "/other";
    console.log("[G1-DIAG] version=1.0 route="+reportedPath+" body="+(body ? "text":"empty")+
      " skuCount="+skus.length+" modified=no");
    if(isAi) {
      var sources=["g1.ios.2tb.","g1.ios.20tb.m.v2","g1.ios.30tb.ai.pro.m"];
      for(var j=0;j<sources.length;j++) {
        var found=false;
        for(var k=0;k<skus.length;k++) {
          if(sources[j].slice(-1)==="." ? skus[k].indexOf(sources[j])===0 : skus[k]===sources[j]) {found=true;break;}
        }
        console.log("[G1-DIAG] source="+sources[j]+" found="+(found?"yes":"no"));
      }
    }
  } catch (e) {
    console.log("[G1-DIAG] error="+String(e && e.message || e).slice(0,100));
  }
  $done({});
})();