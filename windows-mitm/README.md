# G1 MITM Windows (Python + mitmproxy)

No extension required. Read-only observation of Google One SKUs through a local HTTP(S) proxy; does not rewrite checkout or product IDs.

## Setup
1. Install mitmproxy from https://mitmproxy.org/ for Windows.
2. Run `run_proxy.bat` (binds to `127.0.0.1:8080`).
3. Open an isolated browser using `open_edge.bat` or `open_chrome.bat`.
4. In this browser open `http://mitm.it`, install/trust mitmproxy CA on your own Windows device as explained at https://docs.mitmproxy.org/stable/concepts/certificates/ . Restart the isolated browser.
5. Open `https://one.google.com/ai` or `https://one.google.com/plans` and inspect `reports/sku-report.json`.

Only SKU strings and anonymized route groups are saved, not headers, cookies, URLs, bodies, or tokens. Detected SKU does not prove promotional eligibility. Stop the proxy, remove the CA trust when no longer needed, and do not publish `browser-profile-*` or `reports`.

The more complete Windows ZIP with a Tkinter dashboard, tests, and offline demo is available as a ChatGPT conversation attachment.
