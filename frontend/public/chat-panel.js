var ChatPanel=function(_){"use strict";const M="nc_chatpanel_root",J="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";let C=null;function w(){var n;const t=C;return!t||typeof window>"u"?null:((n=window.__ncMapRegistry__)==null?void 0:n[t])??null}function L(){return window.maplibregl}const q="http://localhost:3001/api/n8n",z="http://localhost:3001/api",P="nc_search_scan_styles",k="nc_search_scan_overlay";let b=0,m=null;function Y(){if(typeof document>"u"||document.getElementById(P))return;const t=document.createElement("style");t.id=P,t.textContent=`
    .nc_search_scan_overlay {
      position: fixed;
      inset: 0;
      z-index: 99950;
      pointer-events: auto;
      overflow: hidden;
      opacity: 1;
      transition: opacity 0.38s ease;
    }
    .nc_search_scan_overlay.nc_search_scan_overlay--exit {
      opacity: 0;
      pointer-events: none;
    }
    .nc_search_scan_layer {
      position: absolute;
      inset: 0;
      clip-path: inset(0 0 100% 0);
      background: rgba(15, 23, 42, 0.14);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      animation: nc_search_scan_reveal 0.88s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .nc_search_scan_beam {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: min(28vh, 220px);
      pointer-events: none;
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(255, 255, 255, 0.14) 45%,
        rgba(96, 165, 250, 0.12) 50%,
        rgba(255, 255, 255, 0.1) 55%,
        transparent 100%
      );
      opacity: 0;
      filter: blur(1px);
      animation: nc_search_scan_beam_move 2.4s ease-in-out infinite;
      animation-delay: 0.75s;
    }
    @keyframes nc_search_scan_reveal {
      to {
        clip-path: inset(0 0 0 0);
      }
    }
    @keyframes nc_search_scan_beam_move {
      0% {
        transform: translateY(-100%);
        opacity: 0;
      }
      8% {
        opacity: 0.85;
      }
      92% {
        opacity: 0.75;
      }
      100% {
        transform: translateY(calc(100vh + 100%));
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .nc_search_scan_layer {
        animation-duration: 0.01ms;
        clip-path: inset(0 0 0 0);
      }
      .nc_search_scan_beam {
        animation: none;
        opacity: 0;
      }
    }
  `,document.head.appendChild(t)}function S(){if(typeof document>"u"||(Y(),b+=1,b>1))return;const t=document.getElementById(k);if(t){m=t,t.classList.remove("nc_search_scan_overlay--exit"),t.style.opacity="1";return}const n=document.createElement("div");n.id=k,n.className="nc_search_scan_overlay",n.setAttribute("aria-hidden","true");const e=document.createElement("div");e.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",n.appendChild(e),n.appendChild(a),document.body.appendChild(n),m=n}function v(){if(typeof document>"u"||(b=Math.max(0,b-1),b>0))return;const t=m??document.getElementById(k);if(!t){m=null;return}t.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{t.remove(),m===t&&(m=null)},420)}function K(t){var r,s;const n=(r=t.mapInstanceName)==null?void 0:r.trim();if(n)return n;if(typeof document>"u")return;const e=document.currentScript,a=(s=e==null?void 0:e.getAttribute("data-map-instance"))==null?void 0:s.trim();if(a)return a}function Z(t){var e,a;const n=(e=t.n8nProxyUrl)==null?void 0:e.trim();if(n)return n;if(typeof document<"u"){const r=document.currentScript,s=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(s)return s}return q}function V(t){var e,a;const n=(e=t.dbApiUrl)==null?void 0:e.trim();if(n)return n;if(typeof document<"u"){const r=document.currentScript,s=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(s)return s}return z}function X(t,n,e){const a=n/100,r=e/100,s=a*Math.min(r,1-r),i=l=>{const u=(l+t/30)%12,p=r-s*Math.max(Math.min(u-3,9-u,1),-1);return Math.round(255*p)},o=i(0),c=i(8),d=i(4);return`#${o.toString(16).padStart(2,"0")}${c.toString(16).padStart(2,"0")}${d.toString(16).padStart(2,"0")}`}const x=Array.from({length:50},(t,n)=>{const e=Math.round(n*360/50+n%3*4)%360,a=68+n%4*4,r=44+n%5*2;return X(e,a,r)});function N(t){if(t==null)return null;const n=String(t).trim();return n.length>0?n:null}function T(t){const n=N(t.faaliyet_adi);return n!==null?n:N(t["faaliyet-adi"])}function I(t){const n=new Set;for(const e of t.features??[]){const a=T(e.properties??{});a!==null&&n.add(a)}return Array.from(n).sort((e,a)=>e.localeCompare(a,"tr"))}function O(t){if(t.startsWith("#")&&t.length===7){const n=Math.max(0,Math.min(255,Math.round(parseInt(t.slice(1,3),16)*.78))),e=Math.max(0,Math.min(255,Math.round(parseInt(t.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(t.slice(5,7),16)*.78)));return`#${n.toString(16).padStart(2,"0")}${e.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return t}function B(t,n,e){const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<t.length;r++)a.push(t[r],n(r));return a.push(e),a}function F(t,n,e){var p,h,f;const a=I(e),r="#999999",s=O(r),i=x.length,o=B(a,y=>x[y%i],r),c=B(a,y=>O(x[y%i]),s),d=`${n}fill`,l=`${n}line`,u=`${n}point`;try{(p=t.getLayer)!=null&&p.call(t,d)&&(t.setPaintProperty(d,"fill-color",o),t.setPaintProperty(d,"fill-outline-color",c)),(h=t.getLayer)!=null&&h.call(t,l)&&t.setPaintProperty(l,"line-color",c),(f=t.getLayer)!=null&&f.call(t,u)&&(t.setPaintProperty(u,"circle-radius",H),t.setPaintProperty(u,"circle-stroke-width",D),t.setPaintProperty(u,"circle-color",o),t.setPaintProperty(u,"circle-stroke-color","#ffffff"))}catch{}}const Q="#999999";function tt(t){const n=I(t),e=x.length,a=new Map;n.forEach((o,c)=>{a.set(o,x[c%e])});const r=new Map;for(const o of n)r.set(o,0);let s=0;for(const o of t.features??[]){const c=T(o.properties??{});c===null?s+=1:r.set(c,(r.get(c)??0)+1)}const i=n.map(o=>({label:o,color:a.get(o),count:r.get(o)??0}));return s>0&&i.push({label:"Belirtilmemiş",color:Q,count:s}),i.sort((o,c)=>c.count!==o.count?c.count-o.count:o.label.localeCompare(c.label,"tr")),i.map(({label:o,color:c})=>({label:o,color:c}))}function et(t){const n=document.createElement("div");n.className="nc_chatpanel_legend";const e=document.createElement("div");e.className="nc_chatpanel_legend_heading",e.textContent="Lejant",n.appendChild(e);const a=document.createElement("ul");a.className="nc_chatpanel_legend_list";for(const{label:r,color:s}of t){const i=document.createElement("li");i.className="nc_chatpanel_legend_row";const o=document.createElement("span");o.className="nc_chatpanel_legend_swatch",o.style.backgroundColor=s,o.setAttribute("aria-hidden","true");const c=document.createElement("span");c.className="nc_chatpanel_legend_label",c.textContent=r,i.appendChild(o),i.appendChild(c),a.appendChild(i)}return n.appendChild(a),n}function A(t,n){if(Array.isArray(t)){if(t.length>=2&&typeof t[0]=="number"&&Number.isFinite(t[0])&&typeof t[1]=="number"&&Number.isFinite(t[1])){n.push([t[0],t[1]]);return}for(const e of t)A(e,n)}}function $(t,n){const e=L();if(!(e!=null&&e.LngLatBounds))return;const a=[];for(const s of n.features??[]){const i=s==null?void 0:s.geometry;if(i){if(i.type==="GeometryCollection"&&Array.isArray(i.geometries)){for(const o of i.geometries)A(o==null?void 0:o.coordinates,a);continue}A(i.coordinates,a)}}if(a.length===0)return;const r=a.reduce((s,i)=>s.extend(i),new e.LngLatBounds(a[0],a[0]));t.fitBounds(r,{padding:48,duration:700,maxZoom:18})}function R(t,n){const e=t.__ncChatPanelAnim??{};typeof e.rafId=="number"&&cancelAnimationFrame(e.rafId);const a=`${n}fill`,r=`${n}line`,s=`${n}point`,i=performance.now(),o=()=>{var h,f,y;const c=(performance.now()-i)/1e3*Math.PI*2*.55,d=.5+.5*Math.sin(c),l=.15+d*.2,u=.45+d*.45,p=.5+d*.5;try{(h=t.getLayer)!=null&&h.call(t,a)&&t.setPaintProperty(a,"fill-opacity",l),(f=t.getLayer)!=null&&f.call(t,r)&&t.setPaintProperty(r,"line-opacity",u),(y=t.getLayer)!=null&&y.call(t,s)&&t.setPaintProperty(s,"circle-opacity",p),e.rafId=requestAnimationFrame(o),t.__ncChatPanelAnim=e}catch{}};e.rafId=requestAnimationFrame(o),t.__ncChatPanelAnim=e}const H=9,D=3;function U(t){var s;const n=w();if(!n||typeof n.addSource!="function")return;const e="nc_chatpanel_geojson",a="nc_chatpanel_geojson_",r=(s=n.getSource)==null?void 0:s.call(n,e);if(r&&typeof r.setData=="function"){r.setData(t),F(n,a,t),R(n,a),$(n,t);return}n.addSource(e,{type:"geojson",data:t}),n.addLayer({id:`${a}fill`,type:"fill",source:e,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),n.addLayer({id:`${a}line`,type:"line",source:e,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),n.addLayer({id:`${a}point`,type:"circle",source:e,filter:["==","$type","Point"],paint:{"circle-radius":H,"circle-color":"#22c55e","circle-stroke-width":D,"circle-stroke-color":"#ffffff"}}),F(n,a,t),R(n,a),$(n,t)}function nt(t,n){return t&&typeof t.record_count=="number"&&Number.isFinite(t.record_count)?`Sorgulama sonucunda ${t.record_count} kayıt bulundu.`:t&&typeof t.message=="string"&&t.message.trim()?t.message.trim():n.trim()?n.trim():"Yanıt alındı."}async function at(t,n){var c;const e=new FormData;e.append("chatInput",n);const a=await fetch(t,{method:"POST",body:e}),r=await a.text(),s=a.headers.get("content-type")??"";let i=null;if(s.toLowerCase().includes("application/json"))try{i=JSON.parse(r)}catch{i=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:t,status:a.status,contentType:s,body:i??r});const o=i;return o!=null&&o.ok&&((c=o.geojson)==null?void 0:c.type)==="FeatureCollection"&&U(o.geojson),nt(o,r)}function g(t){requestAnimationFrame(()=>{t.scrollTop=t.scrollHeight})}function rt(t){if(!t.getElementById("nc_chatpanel_bootstrap_css")){const e=document.createElement("link");e.id="nc_chatpanel_bootstrap_css",e.rel="stylesheet",e.href=J,t.appendChild(e)}if(t.getElementById("nc_chatpanel_styles"))return;const n=document.createElement("style");n.id="nc_chatpanel_styles",n.textContent=`
    :host {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 99999;
      width: min(380px, calc(100vw - 32px));
      max-height: min(650px, calc(100vh - 24px));
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
      background: #fff;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .nc_chatpanel_shell {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      height: 100%;
      max-height: 100%;
      overflow: hidden;
    }
    .nc_chatpanel_header {
      flex-shrink: 0;
      font-weight: 600;
    }
    .nc_chatpanel_messages {
      flex: 1 1 auto;
      min-height: 0;
      max-height: 100%;
      padding: 12px;
      overflow-y: auto;
      overflow-x: hidden;
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
    .nc_chatpanel_toolbox {
      flex-shrink: 0;
      border-bottom: 1px solid #dee2e6;
      background: #fff;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
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
    .nc_chatpanel_msg_with_legend {
      white-space: normal;
    }
    .nc_chatpanel_legend_intro {
      margin-bottom: 10px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .nc_chatpanel_legend {
      margin-top: 2px;
      padding-top: 8px;
      border-top: 1px solid #e9ecef;
    }
    .nc_chatpanel_legend_heading {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #6c757d;
      margin-bottom: 6px;
    }
    .nc_chatpanel_legend_list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .nc_chatpanel_legend_row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
      font-size: 0.8rem;
      line-height: 1.35;
    }
    .nc_chatpanel_legend_row:last-child {
      margin-bottom: 0;
    }
    .nc_chatpanel_legend_swatch {
      flex-shrink: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.18);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
    }
    .nc_chatpanel_legend_label {
      flex: 1;
      min-width: 0;
      word-break: break-word;
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
  `,t.appendChild(n)}function ot(){return`
    <div class="nc_chatpanel_header bg-primary text-white px-3 py-2">Keos AI</div>
    <div class="nc_chatpanel_toolbox px-2 py-2 border-bottom">
      <button
        type="button"
        class="btn btn-success btn-sm nc_chatpanel_wisart_btn"
        id="nc_chatpanel_wisart_btn"
        title="WISART"
        aria-label="WISART"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3L14.78 8.63L21 9.54L16.5 13.92L17.56 20.1L12 17.17L6.44 20.1L7.5 13.92L3 9.54L9.22 8.63L12 3Z" fill="currentColor"/>
        </svg>
      </button>
      <button
        type="button"
        class="btn btn-outline-primary btn-sm nc_chatpanel_all_poi_btn"
        id="nc_chatpanel_all_poi_btn"
        title="Görünür alandaki tüm kayıtları haritaya ekle"
        aria-label="Tüm kayıtlar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </button>
    </div>
    <div class="nc_chatpanel_messages" id="nc_chatpanel_messages">
      
    </div>
    <form class="nc_chatpanel_form p-2" id="nc_chatpanel_form" autocomplete="off">
      <div class="input-group input-group-sm">
        <input class="form-control" id="nc_chatpanel_input" type="text" placeholder="Mesaj yazın…" />
        <button class="btn btn-primary" type="submit">Gönder</button>
      </div>
    </form>
  `}function it(t,n){const e=t.querySelector("#nc_chatpanel_form"),a=t.querySelector("#nc_chatpanel_input"),r=t.querySelector("#nc_chatpanel_messages");if(!e||!a||!r||e.dataset.ncBoundChat==="true")return;e.dataset.ncBoundChat="true";const s=(i,o)=>{const c=document.createElement("div");return c.className=`nc_chatpanel_msg ${i==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof o=="string"?c.textContent=o:c.appendChild(o),r.appendChild(c),g(r),c};e.addEventListener("submit",i=>{i.preventDefault();const o=a.value.trim();if(!o)return;s("user",o),a.value="",a.disabled=!0,S();const c=document.createElement("span");c.className="nc_chatpanel_typing",c.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const d=s("ai",c);at(n,o).then(l=>{d.textContent=l,g(r)}).catch(l=>{console.error("[chatpanel] n8n istek hatası",l),d.textContent="Sorgu sırasında hata oluştu.",g(r)}).finally(()=>{v(),a.disabled=!1,a.focus()})})}function j(){var c,d;const t=w();if(!(t!=null&&t.getBounds))return null;const n=t.getBounds(),e=(c=n.getSouthWest)==null?void 0:c.call(n),a=(d=n.getNorthEast)==null?void 0:d.call(n);if(!e||!a)return null;const r=typeof e.lng=="number"?e.lng:e.lon,s=typeof e.lat=="number"?e.lat:e.y,i=typeof a.lng=="number"?a.lng:a.lon,o=typeof a.lat=="number"?a.lat:a.y;return[r,s,i,o].every(l=>typeof l=="number"&&Number.isFinite(l))?[r,s,i,o]:null}function W(t,n){const e=t.querySelector("#nc_chatpanel_all_poi_btn"),a=t.querySelector("#nc_chatpanel_messages");if(!e||e.dataset.ncBoundAllPoi==="true")return;e.dataset.ncBoundAllPoi="true";const r=i=>{if(!a)return;const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",o.textContent=i,a.appendChild(o),g(a)},s=(i,o)=>{if(!a)return;const c=document.createElement("div");c.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const d=document.createElement("div");d.className="nc_chatpanel_legend_intro",d.textContent=i,c.appendChild(d);const l=tt(o);l.length>0&&c.appendChild(et(l)),a.appendChild(c),g(a)};e.addEventListener("click",async()=>{var o;if(e.disabled)return;e.disabled=!0;const i=e.innerHTML;e.innerHTML='<span aria-hidden="true">...</span>',S();try{const c=j();if(!c){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}const d=`${n}/db/kentrehberi_poi/features-by-bbox`,l=await fetch(d,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:c})});let u=null;try{u=await l.json()}catch{u=null}const p=u;if(!l.ok){const f=p&&typeof p.error=="string"?p.error:`HTTP ${l.status}`;r(`Kayıtlar yüklenemedi: ${f}`);return}const h=p==null?void 0:p.geojson;if(h&&h.type==="FeatureCollection"){U(h);const f=typeof p.record_count=="number"&&Number.isFinite(p.record_count)?p.record_count:((o=h.features)==null?void 0:o.length)??0;s(`Haritaya ${f} kayıt eklendi (görünür alan).`,h),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:d,record_count:f})}else r("GeoJSON yanıtı alınamadı.")}catch(c){console.error("[chatpanel] tüm kayıtlar hata",c),r("Kayıtlar yüklenirken hata oluştu.")}finally{v(),e.disabled=!1,e.innerHTML=i}})}function G(t,n){const e=t.querySelector("#nc_chatpanel_wisart_btn"),a=t.querySelector("#nc_chatpanel_messages");if(!e||e.dataset.ncBoundWisart==="true")return;e.dataset.ncBoundWisart="true";const r=s=>{if(!a)return;const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai",i.textContent=s,a.appendChild(i),g(a)};e.addEventListener("click",async()=>{if(e.disabled)return;e.disabled=!0;const s=e.innerHTML;e.innerHTML='<span aria-hidden="true">...</span>',S();try{const i=j();if(!i){console.warn("[chatpanel] Harita bbox alınamadı.");return}const o=`${n}/n8n/kentrehberi`,c=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:i,faaliyet:"cami"})}),d=await c.text();let l=null;try{l=JSON.parse(d)}catch{l=d}if(console.log("[chatpanel] kentrehberi sonuç",{endpoint:o,status:c.status,data:l}),typeof l=="string")r(l);else if(l&&typeof l=="object"){const u=l.message;typeof u=="string"&&u.trim()?r(u.trim()):r(JSON.stringify(l))}else r(String(l))}catch(i){console.error("[chatpanel] WISART hata",i),r("WISART isteğinde hata oluştu.")}finally{v(),e.disabled=!1,e.innerHTML=s}})}function E(t={}){const{container:n=document.body}=t;let e=document.getElementById(M);const a=K(t),r=Z(t),s=V(t);if(C=a??null,e){a&&e.setAttribute("data-nc-map-instance",a);const c=e.shadowRoot;return c&&(G(c,s),W(c,s)),e}e=document.createElement("div"),e.id=M,e.className="nc_chatpanel_root",e.setAttribute("data-nc-chatpanel","true"),a&&e.setAttribute("data-nc-map-instance",a);const i=e.attachShadow({mode:"open"});rt(i);const o=document.createElement("div");return o.className="nc_chatpanel_shell",o.innerHTML=ot(),i.appendChild(o),n.appendChild(e),it(i,r),G(i,s),W(i,s),e}const ct={init:t=>E(t??{}),getMapInstanceName:()=>C,getRegisteredMap:w,getMaplibre:L};window.ChatPanel=ct;function st(){if(typeof document>"u")return!1;const t=document.currentScript;return(t==null?void 0:t.getAttribute("data-auto-init"))!=="false"}if(st()){const t=()=>E({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}return _.getMaplibre=L,_.getRegisteredMap=w,_.hideSearchScanOverlay=v,_.initChatPanel=E,_.showSearchScanOverlay=S,Object.defineProperty(_,Symbol.toStringTag,{value:"Module"}),_}({});
