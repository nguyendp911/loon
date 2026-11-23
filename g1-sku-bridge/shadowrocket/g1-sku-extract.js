/** G1 SKU Bridge v2.1: read-only Google One response SKU extractor. */
'use strict';
(function () {
  try {
    var body = (typeof $response !== 'undefined' && $response) ? $response.body : '';
    if (typeof body !== 'string' || !body.length) {
      console.log('[G1SKU] Empty/non-text response'); $done({}); return;
    }
    var matches = body.match(/\bg1\.[a-z0-9_]+(?:\.[a-z0-9_]+){0,15}\b/gi) || [];
    var unique = {}, skus = [], max = 200;
    for (var i = 0; i < matches.length; i++) {
      var sku = matches[i].toLowerCase();
      if (sku.length > 150 || unique[sku]) continue;
      unique[sku] = true; skus.push(sku);
      if (skus.length >= max) break;
    }
    skus.sort();
    var acq = 0, wb = 0;
    for (var j = 0; j < skus.length; j++) {
      if (/\.acq$/.test(skus[j])) acq++;
      if (/\.wb$/.test(skus[j])) wb++;
    }
    console.log('[G1SKU] START count=' + skus.length + ' acq=' + acq + ' wb=' + wb);
    for (var k = 0; k < skus.length; k++) console.log('[G1SKU] ' + skus[k]);
    console.log('[G1SKU] END; copy G1SKU lines into G1 SKU Bridge extension');
  } catch (err) {
    console.log('[G1SKU] Extractor error: ' + String(err && err.message || err).slice(0, 100));
  }
  $done({});
})();