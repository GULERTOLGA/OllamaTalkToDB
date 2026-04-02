var ChatPanel=function(_){"use strict";const F="nc_chatpanel_root",X="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";let E=null;function C(){var n;const t=E;return!t||typeof window>"u"?null:((n=window.__ncMapRegistry__)==null?void 0:n[t])??null}function S(){return window.maplibregl}const Z="http://localhost:3001/api/n8n",Q="http://localhost:3001/api",O="nc_search_scan_styles",v="nc_search_scan_overlay";let b=0,m=null;function tt(){if(typeof document>"u"||document.getElementById(O))return;const t=document.createElement("style");t.id=O,t.textContent=`
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
  `,document.head.appendChild(t)}function w(){if(typeof document>"u"||(tt(),b+=1,b>1))return;const t=document.getElementById(v);if(t){m=t,t.classList.remove("nc_search_scan_overlay--exit"),t.style.opacity="1";return}const n=document.createElement("div");n.id=v,n.className="nc_search_scan_overlay",n.setAttribute("aria-hidden","true");const e=document.createElement("div");e.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",n.appendChild(e),n.appendChild(a),document.body.appendChild(n),m=n}function L(){if(typeof document>"u"||(b=Math.max(0,b-1),b>0))return;const t=m??document.getElementById(v);if(!t){m=null;return}t.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{t.remove(),m===t&&(m=null)},420)}function et(t){var r,s;const n=(r=t.mapInstanceName)==null?void 0:r.trim();if(n)return n;if(typeof document>"u")return;const e=document.currentScript,a=(s=e==null?void 0:e.getAttribute("data-map-instance"))==null?void 0:s.trim();if(a)return a}function nt(t){var e,a;const n=(e=t.n8nProxyUrl)==null?void 0:e.trim();if(n)return n;if(typeof document<"u"){const r=document.currentScript,s=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(s)return s}return Z}function at(t){var e,a;const n=(e=t.dbApiUrl)==null?void 0:e.trim();if(n)return n;if(typeof document<"u"){const r=document.currentScript,s=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(s)return s}return Q}const x=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function N(t){if(t==null)return null;const n=String(t).trim();return n.length>0?n:null}function P(t){const n=N(t.faaliyet_adi);return n!==null?n:N(t["faaliyet-adi"])}function B(t){const n=new Set;for(const e of t.features??[]){const a=P(e.properties??{});a!==null&&n.add(a)}return Array.from(n).sort((e,a)=>e.localeCompare(a,"tr"))}function M(t){if(t.startsWith("#")&&t.length===7){const n=Math.max(0,Math.min(255,Math.round(parseInt(t.slice(1,3),16)*.78))),e=Math.max(0,Math.min(255,Math.round(parseInt(t.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(t.slice(5,7),16)*.78)));return`#${n.toString(16).padStart(2,"0")}${e.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return t}function T(t,n,e){if(t.length===0)return e;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<t.length;r++)a.push(t[r],n(r));return a.push(e),a}function I(t,n,e){var p,f,h;const a=B(e),r="#999999",s=M(r),i=x.length,o=T(a,g=>x[g%i],r),c=T(a,g=>M(x[g%i]),s),d=`${n}fill`,l=`${n}line`,u=`${n}point`;try{(p=t.getLayer)!=null&&p.call(t,d)&&(t.setPaintProperty(d,"fill-color",o),t.setPaintProperty(d,"fill-outline-color",c)),(f=t.getLayer)!=null&&f.call(t,l)&&t.setPaintProperty(l,"line-color",c),(h=t.getLayer)!=null&&h.call(t,u)&&(t.setPaintProperty(u,"circle-radius",$),t.setPaintProperty(u,"circle-stroke-width",H),t.setPaintProperty(u,"circle-color",o),t.setPaintProperty(u,"circle-stroke-color","#ffffff"))}catch{}}const rt="#999999";function ot(t){const n=B(t),e=x.length,a=new Map;n.forEach((o,c)=>{a.set(o,x[c%e])});const r=new Map;for(const o of n)r.set(o,0);let s=0;for(const o of t.features??[]){const c=P(o.properties??{});c===null?s+=1:r.set(c,(r.get(c)??0)+1)}const i=n.map(o=>({label:o,color:a.get(o),count:r.get(o)??0}));return s>0&&i.push({label:"Belirtilmemiş",color:rt,count:s}),i.sort((o,c)=>c.count!==o.count?c.count-o.count:o.label.localeCompare(c.label,"tr")),i.map(({label:o,color:c})=>({label:o,color:c}))}function it(t){const n=document.createElement("div");n.className="nc_chatpanel_legend";const e=document.createElement("div");e.className="nc_chatpanel_legend_heading",e.textContent="Lejant",n.appendChild(e);const a=document.createElement("ul");a.className="nc_chatpanel_legend_list";for(const{label:r,color:s}of t){const i=document.createElement("li");i.className="nc_chatpanel_legend_row";const o=document.createElement("span");o.className="nc_chatpanel_legend_swatch",o.style.backgroundColor=s,o.setAttribute("aria-hidden","true");const c=document.createElement("span");c.className="nc_chatpanel_legend_label",c.textContent=r,i.appendChild(o),i.appendChild(c),a.appendChild(i)}return n.appendChild(a),n}function A(t,n){if(Array.isArray(t)){if(t.length>=2&&typeof t[0]=="number"&&Number.isFinite(t[0])&&typeof t[1]=="number"&&Number.isFinite(t[1])){n.push([t[0],t[1]]);return}for(const e of t)A(e,n)}}function D(t,n){const e=S();if(!(e!=null&&e.LngLatBounds))return;const a=[];for(const s of n.features??[]){const i=s==null?void 0:s.geometry;if(i){if(i.type==="GeometryCollection"&&Array.isArray(i.geometries)){for(const o of i.geometries)A(o==null?void 0:o.coordinates,a);continue}A(i.coordinates,a)}}if(a.length===0)return;const r=a.reduce((s,i)=>s.extend(i),new e.LngLatBounds(a[0],a[0]));t.fitBounds(r,{padding:48,duration:700,maxZoom:18})}function R(t,n){const e=t.__ncChatPanelAnim??{};typeof e.rafId=="number"&&cancelAnimationFrame(e.rafId);const a=`${n}fill`,r=`${n}line`,s=`${n}point`,i=performance.now(),o=()=>{var f,h,g;const c=(performance.now()-i)/1e3*Math.PI*2*.55,d=.5+.5*Math.sin(c),l=.15+d*.2,u=.45+d*.45,p=.5+d*.5;try{(f=t.getLayer)!=null&&f.call(t,a)&&t.setPaintProperty(a,"fill-opacity",l),(h=t.getLayer)!=null&&h.call(t,r)&&t.setPaintProperty(r,"line-opacity",u),(g=t.getLayer)!=null&&g.call(t,s)&&t.setPaintProperty(s,"circle-opacity",p),e.rafId=requestAnimationFrame(o),t.__ncChatPanelAnim=e}catch{}};e.rafId=requestAnimationFrame(o),t.__ncChatPanelAnim=e}const $=9,H=3,ct=["Open Sans Semibold","Arial Unicode MS Regular"],G=["step",["zoom"],!1,17,!0],J={"text-allow-overlap":G,"text-ignore-placement":G,"text-optional":!1};function st(t,n){var e;try{if(!((e=t.getLayer)!=null&&e.call(t,n)))return;for(const[a,r]of Object.entries(J))t.setLayoutProperty(n,a,r)}catch{}}const U=["==","$type","Point"],j="#ffffff",z="#2d2d2d";function W(t,n,e){var r;const a=`${e}label`;if((r=t.getLayer)!=null&&r.call(t,a)){st(t,a);try{t.setFilter(a,U),t.setPaintProperty(a,"text-color",j),t.setPaintProperty(a,"text-halo-color",z)}catch{}return}t.addLayer({id:a,type:"symbol",source:n,filter:U,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...ct],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...J},paint:{"text-color":j,"text-halo-color":z,"text-halo-width":1.25,"text-halo-blur":.25}})}function q(t){var s;const n=C();if(!n||typeof n.addSource!="function")return;const e="nc_chatpanel_geojson",a="nc_chatpanel_geojson_",r=(s=n.getSource)==null?void 0:s.call(n,e);if(r&&typeof r.setData=="function"){r.setData(t),W(n,e,a),I(n,a,t),R(n,a),D(n,t);return}n.addSource(e,{type:"geojson",data:t}),n.addLayer({id:`${a}fill`,type:"fill",source:e,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),n.addLayer({id:`${a}line`,type:"line",source:e,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),n.addLayer({id:`${a}point`,type:"circle",source:e,filter:["==","$type","Point"],paint:{"circle-radius":$,"circle-color":"#22c55e","circle-stroke-width":H,"circle-stroke-color":"#ffffff"}}),W(n,e,a),I(n,a,t),R(n,a),D(n,t)}function lt(t,n){return t&&typeof t.record_count=="number"&&Number.isFinite(t.record_count)?`Sorgulama sonucunda ${t.record_count} kayıt bulundu.`:t&&typeof t.message=="string"&&t.message.trim()?t.message.trim():n.trim()?n.trim():"Yanıt alındı."}async function dt(t,n){var c;const e=new FormData;e.append("chatInput",n);const a=await fetch(t,{method:"POST",body:e}),r=await a.text(),s=a.headers.get("content-type")??"";let i=null;if(s.toLowerCase().includes("application/json"))try{i=JSON.parse(r)}catch{i=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:t,status:a.status,contentType:s,body:i??r});const o=i;return o!=null&&o.ok&&((c=o.geojson)==null?void 0:c.type)==="FeatureCollection"&&q(o.geojson),lt(o,r)}function y(t){requestAnimationFrame(()=>{t.scrollTop=t.scrollHeight})}function ut(t){if(!t.getElementById("nc_chatpanel_bootstrap_css")){const e=document.createElement("link");e.id="nc_chatpanel_bootstrap_css",e.rel="stylesheet",e.href=X,t.appendChild(e)}if(t.getElementById("nc_chatpanel_styles"))return;const n=document.createElement("style");n.id="nc_chatpanel_styles",n.textContent=`
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
  `,t.appendChild(n)}function pt(){return`
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
  `}function ft(t,n){const e=t.querySelector("#nc_chatpanel_form"),a=t.querySelector("#nc_chatpanel_input"),r=t.querySelector("#nc_chatpanel_messages");if(!e||!a||!r||e.dataset.ncBoundChat==="true")return;e.dataset.ncBoundChat="true";const s=(i,o)=>{const c=document.createElement("div");return c.className=`nc_chatpanel_msg ${i==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof o=="string"?c.textContent=o:c.appendChild(o),r.appendChild(c),y(r),c};e.addEventListener("submit",i=>{i.preventDefault();const o=a.value.trim();if(!o)return;s("user",o),a.value="",a.disabled=!0,w();const c=document.createElement("span");c.className="nc_chatpanel_typing",c.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const d=s("ai",c);dt(n,o).then(l=>{d.textContent=l,y(r)}).catch(l=>{console.error("[chatpanel] n8n istek hatası",l),d.textContent="Sorgu sırasında hata oluştu.",y(r)}).finally(()=>{L(),a.disabled=!1,a.focus()})})}function Y(){var c,d;const t=C();if(!(t!=null&&t.getBounds))return null;const n=t.getBounds(),e=(c=n.getSouthWest)==null?void 0:c.call(n),a=(d=n.getNorthEast)==null?void 0:d.call(n);if(!e||!a)return null;const r=typeof e.lng=="number"?e.lng:e.lon,s=typeof e.lat=="number"?e.lat:e.y,i=typeof a.lng=="number"?a.lng:a.lon,o=typeof a.lat=="number"?a.lat:a.y;return[r,s,i,o].every(l=>typeof l=="number"&&Number.isFinite(l))?[r,s,i,o]:null}function K(t,n){const e=t.querySelector("#nc_chatpanel_all_poi_btn"),a=t.querySelector("#nc_chatpanel_messages");if(!e||e.dataset.ncBoundAllPoi==="true")return;e.dataset.ncBoundAllPoi="true";const r=i=>{if(!a)return;const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",o.textContent=i,a.appendChild(o),y(a)},s=(i,o)=>{if(!a)return;const c=document.createElement("div");c.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const d=document.createElement("div");d.className="nc_chatpanel_legend_intro",d.textContent=i,c.appendChild(d);const l=ot(o);l.length>0&&c.appendChild(it(l)),a.appendChild(c),y(a)};e.addEventListener("click",async()=>{var o;if(e.disabled)return;e.disabled=!0;const i=e.innerHTML;e.innerHTML='<span aria-hidden="true">...</span>',w();try{const c=Y();if(!c){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}const d=`${n}/db/kentrehberi_poi/features-by-bbox`,l=await fetch(d,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:c})});let u=null;try{u=await l.json()}catch{u=null}const p=u;if(!l.ok){const h=p&&typeof p.error=="string"?p.error:`HTTP ${l.status}`;r(`Kayıtlar yüklenemedi: ${h}`);return}const f=p==null?void 0:p.geojson;if(f&&f.type==="FeatureCollection"){q(f);const h=typeof p.record_count=="number"&&Number.isFinite(p.record_count)?p.record_count:((o=f.features)==null?void 0:o.length)??0;s(`Haritaya ${h} kayıt eklendi (görünür alan).`,f),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:d,record_count:h})}else r("GeoJSON yanıtı alınamadı.")}catch(c){console.error("[chatpanel] tüm kayıtlar hata",c),r("Kayıtlar yüklenirken hata oluştu.")}finally{L(),e.disabled=!1,e.innerHTML=i}})}function V(t,n){const e=t.querySelector("#nc_chatpanel_wisart_btn"),a=t.querySelector("#nc_chatpanel_messages");if(!e||e.dataset.ncBoundWisart==="true")return;e.dataset.ncBoundWisart="true";const r=s=>{if(!a)return;const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai",i.textContent=s,a.appendChild(i),y(a)};e.addEventListener("click",async()=>{if(e.disabled)return;e.disabled=!0;const s=e.innerHTML;e.innerHTML='<span aria-hidden="true">...</span>',w();try{const i=Y();if(!i){console.warn("[chatpanel] Harita bbox alınamadı.");return}const o=`${n}/n8n/kentrehberi`,c=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:i,faaliyet:"cami"})}),d=await c.text();let l=null;try{l=JSON.parse(d)}catch{l=d}if(console.log("[chatpanel] kentrehberi sonuç",{endpoint:o,status:c.status,data:l}),typeof l=="string")r(l);else if(l&&typeof l=="object"){const u=l.message;typeof u=="string"&&u.trim()?r(u.trim()):r(JSON.stringify(l))}else r(String(l))}catch(i){console.error("[chatpanel] WISART hata",i),r("WISART isteğinde hata oluştu.")}finally{L(),e.disabled=!1,e.innerHTML=s}})}function k(t={}){const{container:n=document.body}=t;let e=document.getElementById(F);const a=et(t),r=nt(t),s=at(t);if(E=a??null,e){a&&e.setAttribute("data-nc-map-instance",a);const c=e.shadowRoot;return c&&(V(c,s),K(c,s)),e}e=document.createElement("div"),e.id=F,e.className="nc_chatpanel_root",e.setAttribute("data-nc-chatpanel","true"),a&&e.setAttribute("data-nc-map-instance",a);const i=e.attachShadow({mode:"open"});ut(i);const o=document.createElement("div");return o.className="nc_chatpanel_shell",o.innerHTML=pt(),i.appendChild(o),n.appendChild(e),ft(i,r),V(i,s),K(i,s),e}const ht={init:t=>k(t??{}),getMapInstanceName:()=>E,getRegisteredMap:C,getMaplibre:S};window.ChatPanel=ht;function _t(){if(typeof document>"u")return!1;const t=document.currentScript;return(t==null?void 0:t.getAttribute("data-auto-init"))!=="false"}if(_t()){const t=()=>k({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}return _.getMaplibre=S,_.getRegisteredMap=C,_.hideSearchScanOverlay=L,_.initChatPanel=k,_.showSearchScanOverlay=w,Object.defineProperty(_,Symbol.toStringTag,{value:"Module"}),_}({});
