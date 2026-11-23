"""G1 MITM Windows: read-only SKU observer for user-controlled browsers."""
import json,re
from datetime import datetime,timezone
from pathlib import Path
PAT=re.compile(r"(?<![A-Za-z0-9_.-])g1\.[a-z0-9_]+(?:\.[a-z0-9_]+){0,15}(?![A-Za-z0-9_.-])",re.I)
BASE=Path(__file__).resolve().parent
REPORT=BASE/"reports"/"sku-report.json"
TEXT=("text/","application/json","application/javascript","application/x-javascript","application/graphql-response+json")
def route(path):
    p=path.split("?",1)[0]
    if re.fullmatch(r"/u/\d+/ai/?",p): return "/u/{n}/ai"
    if re.fullmatch(r"/u/\d+/plans/?",p): return "/u/{n}/plans"
    if p in ("/ai","/ai/"):return "/ai"
    if p in ("/plans","/plans/"):return "/plans"
    return "/other"
def classify(s):
    category="ACQ" if s.endswith(".acq") else "WB" if s.endswith(".wb") else "STANDARD/UNKNOWN"
    capacity=next((v for v in ("30TB","20TB","10TB","5TB","2TB","200GB","100GB","30GB") if v.lower() in s),"UNKNOWN")
    return {"sku":s,"category":category,"capacity":capacity,"eligibility":"NOT VERIFIED"}
class Observer:
    def __init__(self):
        self.checked=0
        self.readable=0
        self.items={}
    def response(self,flow):
        if not flow.response or (flow.request.pretty_host or "").lower()!="one.google.com":return
        self.checked+=1
        try:
            typ=flow.response.headers.get("content-type","").lower()
            if len(flow.response.raw_content or b"") > 10_000_000 or not any(x in typ for x in TEXT):return
            body=flow.response.get_text(strict=False)
            if not isinstance(body,str):return
            self.readable+=1
            found=sorted(set(s.lower() for s in PAT.findall(body[:10_000_000]) if len(s)<=150))
            for sku in found:
                if sku not in self.items:
                    self.items[sku]={**classify(sku),"routes":[route(flow.request.path)]}
                    print("[G1MITM]",self.items[sku]["category"],sku)
                elif route(flow.request.path) not in self.items[sku]["routes"]:
                    self.items[sku]["routes"].append(route(flow.request.path))
        except Exception as exc:
            print("[G1MITM] Inspector error:",type(exc).__name__)
        finally:
            REPORT.parent.mkdir(exist_ok=True)
            tmp=REPORT.with_suffix(".tmp")
            tmp.write_text(json.dumps({"tool":"G1 MITM Windows","version":"3.0","mode":"READ_ONLY","timestamp_utc":datetime.now(timezone.utc).isoformat(),"checked":self.checked,"readable":self.readable,"count":len(self.items),"pricing_eligibility":"NOT VERIFIED","skus":sorted(self.items.values(),key=lambda x:x["sku"])},ensure_ascii=False,indent=2),encoding="utf-8")
            tmp.replace(REPORT)
addons=[Observer()]
