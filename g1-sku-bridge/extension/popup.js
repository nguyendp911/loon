'use strict';
const $ = id => document.getElementById(id);
const VALID = /^g1\.[a-z0-9_]+(?:\.[a-z0-9_]+){0,15}$/i;
const RX = /\bg1\.[a-z0-9_]+(?:\.[a-z0-9_]+){0,15}\b/gi;
let saved = [];
function parseInput(value) {
  const text = String(value || '').trim();
  if (!text) return [];
  if (text.startsWith('{') || (text.startsWith('[') && !text.startsWith('[G1SKU]'))) {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : data.skus;
    if (!Array.isArray(arr)) throw Error('JSON thiếu mảng skus');
    return [...new Set(arr.map(v => typeof v === 'string' ? v : v && v.sku).filter(v => typeof v === 'string' && VALID.test(v)).map(v => v.toLowerCase()))].sort();
  }
  const lines = text.split(/\r?\n/);
  if (lines.length > 500) throw Error('Quá nhiều dòng');
  const marked = lines.filter(v => v.includes('[G1SKU]'));
  const candidates = marked.length ? marked.map(v => v.split('[G1SKU]').pop().trim()) : lines.map(v => v.trim());
  return [...new Set(candidates.filter(v => VALID.test(v)).map(v => v.toLowerCase()))].sort();
}
async function save() { await chrome.storage.local.set({skus:saved,updatedAt:new Date().toISOString()}); }
function render() {
  $('count').textContent = saved.length;
  $('saved').replaceChildren();
  for(const s of saved){
    const line = document.createElement('div'); line.className='item';
    line.textContent = s + (s.endsWith('.acq') ? ' [ACQ]' : s.endsWith('.wb') ? ' [WB]' : '');
    $('saved').append(line);
  }
}
$('import').onclick=async()=>{
  try {const list=parseInput($('input').value); if(!list.length)throw Error('Không có SKU hợp lệ'); saved=[...new Set([...saved,...list])].sort(); await save(); render(); $('status').textContent='Đã nhập '+list.length+' SKU';}
  catch(e){$('status').textContent='Lỗi: '+e.message;}
};
$('clear').onclick=async()=>{saved=[]; await chrome.storage.local.remove(['skus','updatedAt']); render(); $('status').textContent='Đã xóa';};
$('export').onclick=()=>{const blob=new Blob([JSON.stringify({tool:'G1 SKU Bridge',version:'2.1.0',skus:saved,eligibility:'NOT VERIFIED'},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='g1-sku-bridge.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
$('scan').onclick=async()=>{try{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab || !/^https:\/\/one\.google\.com\//.test(tab.url || '')) throw Error('Mở Google One trước');
  const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>{
    const parts=[document.body ? document.body.innerText : ''];
    for(const s of document.querySelectorAll('script:not([src])')) parts.push(s.textContent||'');
    for(const m of document.querySelectorAll('meta[content]')) parts.push(m.content||'');
    const rx=/\bg1\.[a-z0-9_]+(?:\.[a-z0-9_]+){0,15}\b/gi;
    return [...new Set(parts.flatMap(v=>v.match(rx)||[]).map(v=>v.toLowerCase()))].sort();
  }});
  const found=result[0].result||[];const site=new Set(found);
  $('scanstatus').textContent='Trang: '+found.length+' SKU; danh mục nhập: '+saved.length;
  $('comparison').textContent='Trùng: '+saved.filter(v=>site.has(v)).length+'; chỉ có từ Shadowrocket: '+saved.filter(v=>!site.has(v)).length;
}catch(e){$('scanstatus').textContent='Lỗi: '+e.message;}};
(async()=>{const x=await chrome.storage.local.get('skus');saved=Array.isArray(x.skus)?x.skus.filter(v=>typeof v==='string'&&VALID.test(v)):[];render();})();