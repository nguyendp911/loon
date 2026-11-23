# G1 SKU Bridge v2.1

Shadowrocket script extracts Google One SKU identifiers to local `[G1SKU]` logs without modifying responses. Copy SKU logs into the Chrome/Edge extension (available in downloadable ZIP).

## Shadowrocket module

https://cdn.jsdelivr.net/gh/nguyendp911/loon@main/g1-sku-bridge/shadowrocket/g1-sku-extract.sgmodule

Enable HTTPS MITM with hostname `one.google.com` and trust the certificate. Disable the original G1 ACQ rewriting module while testing. This module does not alter pricing or initiate payments.

A detected SKU does not imply eligibility for promotional pricing.
