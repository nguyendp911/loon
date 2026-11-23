/**
 * G1 ACQ Shadowrocket - Loon-parity response mapping v2.0
 * Self-hosted at nguyendp911/loon; no dependency on crhywun CDN.
 *
 * Operates only on Google One /ai responses (including /u/<n>/ai).
 * Replaces eligible-looking SKU identifiers in the response; it does not
 * change App Store pricing or verify account promotion eligibility.
 */
"use strict";

(function () {
  var VERSION = "G1ACQ-SR-2.0";
  var SKU_MAP = {
    "g1.ios.20tb.m.v2": "g1.20tb.3months_ip_90p.acq",
    "g1.ios.30tb.ai.pro.m": "g1.ai.ultra.3months_ip_90p.acq"
  };
  var FALLBACK = {
    "g1.20tb.3months_ip_90p.acq": "g1.20tb.3months_ip_75p.acq",
    "g1.ai.ultra.3months_ip_90p.acq": "g1.ai.ultra.3months_ip_75p.acq"
  };

  try {
    var url = (typeof $request !== "undefined" && $request &&
      typeof $request.url === "string") ? $request.url : "";

    if (!/^https:\/\/one\.google\.com\/(?:u\/[0-9]+\/)?ai(?:[\/?#]|$)/i.test(url)) {
      console.log("[G1ACQ] " + VERSION + " skipped (URL not matching /ai)");
      $done({});
      return;
    }

    var body = (typeof $response !== "undefined" && $response &&
      typeof $response.body === "string") ? $response.body : "";
    if (!body) {
      console.log("[G1ACQ] " + VERSION + " skipped (empty/non-text body)");
      $done({});
      return;
    }

    var found = body.match(/g1\.[a-z0-9._]{2,60}acq\b/gi) || [];
    var catalog = Object.create(null);
    for (var i = 0; i < found.length; i++) catalog[found[i]] = true;

    // Full SKU token boundaries avoid modifying unrelated longer product IDs.
    var token = /(^|[^A-Za-z0-9._-])(g1\.[A-Za-z0-9._-]+)(?=$|[^A-Za-z0-9._-])/g;
    var count = 0;
    var events = Object.create(null);
    var output = body.replace(token, function (whole, prefix, sku) {
      if (!Object.prototype.hasOwnProperty.call(SKU_MAP, sku)) return whole;
      var target = SKU_MAP[sku];
      var fallback = FALLBACK[target];
      if (!catalog[target] && fallback && catalog[fallback]) target = fallback;
      count += 1;
      if (!events[sku]) events[sku] = {target: target, hits: 0};
      events[sku].hits += 1;
      return prefix + target;
    });

    console.log("[G1ACQ] " + VERSION + " matches=" + count +
      " observedACQ=" + Object.keys(catalog).length);
    Object.keys(events).forEach(function (source) {
      console.log("[G1ACQ] " + source + " -> " + events[source].target +
        " x" + events[source].hits);
    });
    if (count && !Object.keys(catalog).length) {
      console.log("[G1ACQ] WARNING: target SKU not observed in response catalog; promotion NOT verified");
    }
    $done(count ? {body: output} : {});
  } catch (e) {
    console.log("[G1ACQ] " + VERSION + " error=" + String(e && e.message || e).slice(0, 120));
    $done({});
  }
})();
