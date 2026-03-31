var ChatPanel=function(d){"use strict";const g="nc_chatpanel_root",P="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";let p=null;function f(){var n;const t=p;return!t||typeof window>"u"?null:((n=window.__ncMapRegistry__)==null?void 0:n[t])??null}function m(){return window.maplibregl}const S="http://localhost:3001/api/n8n";function C(t){var o,i;const n=(o=t.mapInstanceName)==null?void 0:o.trim();if(n)return n;if(typeof document>"u")return;const e=document.currentScript,a=(i=e==null?void 0:e.getAttribute("data-map-instance"))==null?void 0:i.trim();if(a)return a}function A(t){var e,a;const n=(e=t.n8nProxyUrl)==null?void 0:e.trim();if(n)return n;if(typeof document<"u"){const o=document.currentScript,i=(a=o==null?void 0:o.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(i)return i}return S}function h(t,n){if(Array.isArray(t)){if(t.length>=2&&typeof t[0]=="number"&&Number.isFinite(t[0])&&typeof t[1]=="number"&&Number.isFinite(t[1])){n.push([t[0],t[1]]);return}for(const e of t)h(e,n)}}function y(t,n){const e=m();if(!(e!=null&&e.LngLatBounds))return;const a=[];for(const i of n.features??[]){const r=i==null?void 0:i.geometry;if(r){if(r.type==="GeometryCollection"&&Array.isArray(r.geometries)){for(const c of r.geometries)h(c==null?void 0:c.coordinates,a);continue}h(r.coordinates,a)}}if(a.length===0)return;const o=a.reduce((i,r)=>i.extend(r),new e.LngLatBounds(a[0],a[0]));t.fitBounds(o,{padding:48,duration:700,maxZoom:18})}function b(t,n){const e=t.__ncChatPanelAnim??{};typeof e.rafId=="number"&&cancelAnimationFrame(e.rafId);const a=`${n}fill`,o=`${n}line`,i=`${n}point`,r=performance.now(),c=()=>{var x,w,v;const s=(performance.now()-r)/1e3*Math.PI*2*.55,l=.5+.5*Math.sin(s),u=.15+l*.2,O=.45+l*.45,$=.5+l*.5;try{(x=t.getLayer)!=null&&x.call(t,a)&&t.setPaintProperty(a,"fill-opacity",u),(w=t.getLayer)!=null&&w.call(t,o)&&t.setPaintProperty(o,"line-opacity",O),(v=t.getLayer)!=null&&v.call(t,i)&&t.setPaintProperty(i,"circle-opacity",$),e.rafId=requestAnimationFrame(c),t.__ncChatPanelAnim=e}catch{}};e.rafId=requestAnimationFrame(c),t.__ncChatPanelAnim=e}function L(t){var i;const n=f();if(!n||typeof n.addSource!="function")return;const e="nc_chatpanel_geojson",a="nc_chatpanel_geojson_",o=(i=n.getSource)==null?void 0:i.call(n,e);if(o&&typeof o.setData=="function"){o.setData(t),b(n,a),y(n,t);return}n.addSource(e,{type:"geojson",data:t}),n.addLayer({id:`${a}fill`,type:"fill",source:e,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),n.addLayer({id:`${a}line`,type:"line",source:e,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),n.addLayer({id:`${a}point`,type:"circle",source:e,filter:["==","$type","Point"],paint:{"circle-radius":6,"circle-color":"#22c55e","circle-stroke-width":2,"circle-stroke-color":"#ffffff"}}),b(n,a),y(n,t)}function k(t,n){return t&&typeof t.record_count=="number"&&Number.isFinite(t.record_count)?`Sorgulama sonucunda ${t.record_count} kayıt bulundu.`:t&&typeof t.message=="string"&&t.message.trim()?t.message.trim():n.trim()?n.trim():"Yanıt alındı."}async function I(t,n){var s;const e=new FormData;e.append("chatInput",n);const a=await fetch(t,{method:"POST",body:e}),o=await a.text(),i=a.headers.get("content-type")??"";let r=null;if(i.toLowerCase().includes("application/json"))try{r=JSON.parse(o)}catch{r=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:t,status:a.status,contentType:i,body:r??o});const c=r;return c!=null&&c.ok&&((s=c.geojson)==null?void 0:s.type)==="FeatureCollection"&&L(c.geojson),k(c,o)}function M(t){if(!t.getElementById("nc_chatpanel_bootstrap_css")){const e=document.createElement("link");e.id="nc_chatpanel_bootstrap_css",e.rel="stylesheet",e.href=P,t.appendChild(e)}if(t.getElementById("nc_chatpanel_styles"))return;const n=document.createElement("style");n.id="nc_chatpanel_styles",n.textContent=`
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
  `,t.appendChild(n)}function N(){return`
    <div class="nc_chatpanel_header bg-primary text-white px-3 py-2">Keos AI</div>
    <div class="nc_chatpanel_messages" id="nc_chatpanel_messages">
      
    </div>
    <form class="nc_chatpanel_form p-2" id="nc_chatpanel_form" autocomplete="off">
      <div class="input-group input-group-sm">
        <input class="form-control" id="nc_chatpanel_input" type="text" placeholder="Mesaj yazın…" />
        <button class="btn btn-primary" type="submit">Gönder</button>
      </div>
    </form>
  `}function T(t,n){const e=t.querySelector("#nc_chatpanel_form"),a=t.querySelector("#nc_chatpanel_input"),o=t.querySelector("#nc_chatpanel_messages");if(!e||!a||!o)return;const i=(r,c)=>{const s=document.createElement("div");return s.className=`nc_chatpanel_msg ${r==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof c=="string"?s.textContent=c:s.appendChild(c),o.appendChild(s),o.scrollTop=o.scrollHeight,s};e.addEventListener("submit",r=>{r.preventDefault();const c=a.value.trim();if(!c)return;i("user",c),a.value="",a.disabled=!0;const s=document.createElement("span");s.className="nc_chatpanel_typing",s.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const l=i("ai",s);I(n,c).then(u=>{l.textContent=u}).catch(u=>{console.error("[chatpanel] n8n istek hatası",u),l.textContent="Sorgu sırasında hata oluştu."}).finally(()=>{a.disabled=!1,a.focus()})})}function _(t={}){const{container:n=document.body}=t;let e=document.getElementById(g);const a=C(t),o=A(t);if(p=a??null,e)return a&&e.setAttribute("data-nc-map-instance",a),e;e=document.createElement("div"),e.id=g,e.className="nc_chatpanel_root",e.setAttribute("data-nc-chatpanel","true"),a&&e.setAttribute("data-nc-map-instance",a);const i=e.attachShadow({mode:"open"});M(i);const r=document.createElement("div");return r.innerHTML=N(),i.appendChild(r),n.appendChild(e),T(i,o),e}const E={init:t=>_(t??{}),getMapInstanceName:()=>p,getRegisteredMap:f,getMaplibre:m};window.ChatPanel=E;function F(){if(typeof document>"u")return!1;const t=document.currentScript;return(t==null?void 0:t.getAttribute("data-auto-init"))!=="false"}if(F()){const t=()=>_({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}return d.getMaplibre=m,d.getRegisteredMap=f,d.initChatPanel=_,Object.defineProperty(d,Symbol.toStringTag,{value:"Module"}),d}({});
