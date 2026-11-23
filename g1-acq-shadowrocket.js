/**
 * G1 ACQ Shadowrocket - self-hosted SKU inspector v1.0
 *
 * Read-only: extracts Google One product IDs from the intercepted response.
 * Does not replace SKU, change any response body, or initiate a purchase.
 */
"use strict";

(function () {
  try {
    var body = (typeof $response !== "undefined" && $response &&
      typeof $response.body === "string") ? $response.body : "";

    if (!body) {
      console.log("[G1ACQ] No readable response body");
      return;
    }

    var rx = /\bg1(?:\.[a-z0-9_]+){1,16}\b/gi;
    var matches = body.match(rx) || [];
    var seen = Object.create(null);
    var skus = [];

    for (var i = 0; i < matches.length; i++) {
      var sku = matches[i].toLowerCase();
      if (sku.length > 160 || seen[sku]) continue;
      seen[sku] = true;
      skus.push(sku);
      if (skus.length >= 300) break;
    }

    skus.sort();
    var acqCount = 0, wbCount = 0;
    for (var j = 0; j < skus.length; j++) {
      if (/\.acq$/.test(skus[j])) acqCount++;
      else if (/\.wb$/.test(skus[j])) wbCount++;
    }

    console.log("[G1ACQ] v1.0 response scanned; SKU=" + skus.length +
      ", ACQ=" + acqCount + ", WB=" + wbCount);
    for (var k = 0; k < skus.length; k++) {
      console.log("[G1ACQ] SKU " + skus[k]);
    }
    console.log("[G1ACQ] FINISHED (read-only; no SKU replacement)");
  } catch (error) {
    console.log("[G1ACQ] ERROR " + String(error && error.message || error).slice(0, 120));
  } finally {
    $done({});
  }
})();
