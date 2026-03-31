var ChatPanel=function(l){"use strict";const _="nc_chatpanel_root",b="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";let p=null;function d(){var n;const t=p;return!t||typeof window>"u"?null:((n=window.__ncMapRegistry__)==null?void 0:n[t])??null}function u(){return window.maplibregl}const x="http://localhost:3001/api/n8n";function w(t){var i,o;const n=(i=t.mapInstanceName)==null?void 0:i.trim();if(n)return n;if(typeof document>"u")return;const e=document.currentScript,a=(o=e==null?void 0:e.getAttribute("data-map-instance"))==null?void 0:o.trim();if(a)return a}function v(t){var e,a;const n=(e=t.n8nProxyUrl)==null?void 0:e.trim();if(n)return n;if(typeof document<"u"){const i=document.currentScript,o=(a=i==null?void 0:i.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(o)return o}return x}function f(t,n){if(Array.isArray(t)){if(t.length>=2&&typeof t[0]=="number"&&Number.isFinite(t[0])&&typeof t[1]=="number"&&Number.isFinite(t[1])){n.push([t[0],t[1]]);return}for(const e of t)f(e,n)}}function g(t,n){const e=u();if(!(e!=null&&e.LngLatBounds))return;const a=[];for(const o of n.features??[]){const r=o==null?void 0:o.geometry;if(r){if(r.type==="GeometryCollection"&&Array.isArray(r.geometries)){for(const c of r.geometries)f(c==null?void 0:c.coordinates,a);continue}f(r.coordinates,a)}}if(a.length===0)return;const i=a.reduce((o,r)=>o.extend(r),new e.LngLatBounds(a[0],a[0]));t.fitBounds(i,{padding:48,duration:700,maxZoom:18})}function S(t){var o;const n=d();if(!n||typeof n.addSource!="function")return;const e="nc_chatpanel_geojson",a="nc_chatpanel_geojson_",i=(o=n.getSource)==null?void 0:o.call(n,e);if(i&&typeof i.setData=="function"){i.setData(t),g(n,t);return}n.addSource(e,{type:"geojson",data:t}),n.addLayer({id:`${a}fill`,type:"fill",source:e,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),n.addLayer({id:`${a}line`,type:"line",source:e,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),n.addLayer({id:`${a}point`,type:"circle",source:e,filter:["==","$type","Point"],paint:{"circle-radius":6,"circle-color":"#22c55e","circle-stroke-width":2,"circle-stroke-color":"#ffffff"}}),g(n,t)}function C(t,n){return t&&typeof t.record_count=="number"&&Number.isFinite(t.record_count)?`Sorgulama sonucunda ${t.record_count} kayıt bulundu.`:t&&typeof t.message=="string"&&t.message.trim()?t.message.trim():n.trim()?n.trim():"Yanıt alındı."}async function k(t,n){var s;const e=new FormData;e.append("chatInput",n);const a=await fetch(t,{method:"POST",body:e}),i=await a.text(),o=a.headers.get("content-type")??"";let r=null;if(o.toLowerCase().includes("application/json"))try{r=JSON.parse(i)}catch{r=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:t,status:a.status,contentType:o,body:r??i});const c=r;return c!=null&&c.ok&&((s=c.geojson)==null?void 0:s.type)==="FeatureCollection"&&S(c.geojson),C(c,i)}function L(t){if(!t.getElementById("nc_chatpanel_bootstrap_css")){const e=document.createElement("link");e.id="nc_chatpanel_bootstrap_css",e.rel="stylesheet",e.href=b,t.appendChild(e)}if(t.getElementById("nc_chatpanel_styles"))return;const n=document.createElement("style");n.id="nc_chatpanel_styles",n.textContent=`
    :host {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 99999;
      width: min(380px, calc(100vw - 32px));
      max-height: min(680px, calc(100vh - 24px));
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
      background: #fff;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .nc_chatpanel_header {
      flex-shrink: 0;
      font-weight: 600;
    }
    .nc_chatpanel_messages {
      flex: 1;
      min-height: 300px;
      padding: 12px;
      overflow-y: auto;
      background: #f8f9fa;
      font-size: 0.875rem;
      line-height: 1.45;
      color: #212529;
    }
    .nc_chatpanel_hint {
      margin: 0;
      color: #6c757d;
    }
    .nc_chatpanel_form {
      flex-shrink: 0;
      border-top: 1px solid #dee2e6;
      background: #fff;
    }
    .nc_chatpanel_msg {
      max-width: 88%;
      margin-bottom: 8px;
      padding: 8px 10px;
      border-radius: 12px;
      font-size: 0.86rem;
      line-height: 1.4;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .nc_chatpanel_msg_user {
      margin-left: auto;
      background: #0d6efd;
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .nc_chatpanel_msg_ai {
      margin-right: auto;
      background: #ffffff;
      color: #212529;
      border: 1px solid #dee2e6;
      border-bottom-left-radius: 4px;
    }
    .nc_chatpanel_typing {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 16px;
    }
    .nc_chatpanel_typing_dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6c757d;
      animation: nc_chatpanel_dot_bounce 1.2s infinite ease-in-out;
    }
    .nc_chatpanel_typing_dot:nth-child(2) {
      animation-delay: 0.15s;
    }
    .nc_chatpanel_typing_dot:nth-child(3) {
      animation-delay: 0.3s;
    }
    @keyframes nc_chatpanel_dot_bounce {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.45; }
      40% { transform: scale(1); opacity: 1; }
    }
  `,t.appendChild(n)}function A(){return`
    <div class="nc_chatpanel_header bg-primary text-white px-3 py-2">Keos AI</div>
    <div class="nc_chatpanel_messages" id="nc_chatpanel_messages">
      
    </div>
    <form class="nc_chatpanel_form p-2" id="nc_chatpanel_form" autocomplete="off">
      <div class="input-group input-group-sm">
        <input class="form-control" id="nc_chatpanel_input" type="text" placeholder="Mesaj yazın…" />
        <button class="btn btn-primary" type="submit">Gönder</button>
      </div>
    </form>
  `}function M(t,n){const e=t.querySelector("#nc_chatpanel_form"),a=t.querySelector("#nc_chatpanel_input"),i=t.querySelector("#nc_chatpanel_messages");if(!e||!a||!i)return;const o=(r,c)=>{const s=document.createElement("div");return s.className=`nc_chatpanel_msg ${r==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof c=="string"?s.textContent=c:s.appendChild(c),i.appendChild(s),i.scrollTop=i.scrollHeight,s};e.addEventListener("submit",r=>{r.preventDefault();const c=a.value.trim();if(!c)return;o("user",c),a.value="",a.disabled=!0;const s=document.createElement("span");s.className="nc_chatpanel_typing",s.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const y=o("ai",s);k(n,c).then(h=>{y.textContent=h}).catch(h=>{console.error("[chatpanel] n8n istek hatası",h),y.textContent="Sorgu sırasında hata oluştu."}).finally(()=>{a.disabled=!1,a.focus()})})}function m(t={}){const{container:n=document.body}=t;let e=document.getElementById(_);const a=w(t),i=v(t);if(p=a??null,e)return a&&e.setAttribute("data-nc-map-instance",a),e;e=document.createElement("div"),e.id=_,e.className="nc_chatpanel_root",e.setAttribute("data-nc-chatpanel","true"),a&&e.setAttribute("data-nc-map-instance",a);const o=e.attachShadow({mode:"open"});L(o);const r=document.createElement("div");return r.innerHTML=A(),o.appendChild(r),n.appendChild(e),M(o,i),e}const P={init:t=>m(t??{}),getMapInstanceName:()=>p,getRegisteredMap:d,getMaplibre:u};window.ChatPanel=P;function N(){if(typeof document>"u")return!1;const t=document.currentScript;return(t==null?void 0:t.getAttribute("data-auto-init"))!=="false"}if(N()){const t=()=>m({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}return l.getMaplibre=u,l.getRegisteredMap=d,l.initChatPanel=m,Object.defineProperty(l,Symbol.toStringTag,{value:"Module"}),l}({});
