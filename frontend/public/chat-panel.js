var ChatPanel=function(_){"use strict";const M="nc_chatpanel_root",ce="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";let w=null;function g(){var t;const e=w;return!e||typeof window>"u"?null:((t=window.__ncMapRegistry__)==null?void 0:t[e])??null}function S(){return window.maplibregl}const ie="http://localhost:3001/api/n8n",le="http://localhost:3001/api",se="Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?",D="nc_search_scan_styles",A="nc_search_scan_overlay";let y=0,f=null;function de(){if(typeof document>"u"||document.getElementById(D))return;const e=document.createElement("style");e.id=D,e.textContent=`
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
  `,document.head.appendChild(e)}function v(){if(typeof document>"u"||(de(),y+=1,y>1))return;const e=document.getElementById(A);if(e){f=e,e.classList.remove("nc_search_scan_overlay--exit"),e.style.opacity="1";return}const t=document.createElement("div");t.id=A,t.className="nc_search_scan_overlay",t.setAttribute("aria-hidden","true");const n=document.createElement("div");n.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",t.appendChild(n),t.appendChild(a),document.body.appendChild(t),f=t}function k(){if(typeof document>"u"||(y=Math.max(0,y-1),y>0))return;const e=f??document.getElementById(A);if(!e){f=null;return}e.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{e.remove(),f===e&&(f=null)},420)}function ue(e){var r,c;const t=(r=e.mapInstanceName)==null?void 0:r.trim();if(t)return t;if(typeof document>"u")return;const n=document.currentScript,a=(c=n==null?void 0:n.getAttribute("data-map-instance"))==null?void 0:c.trim();if(a)return a}function pe(e){var n,a;const t=(n=e.n8nProxyUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,c=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(c)return c}return ie}function _e(e){var n,a;const t=(n=e.dbApiUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,c=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(c)return c}return le}const b=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function R(e){if(e==null)return null;const t=String(e).trim();return t.length>0?t:null}function $(e){const t=R(e.faaliyet_adi);return t!==null?t:R(e["faaliyet-adi"])}function H(e){const t=new Set;for(const n of e.features??[]){const a=$(n.properties??{});a!==null&&t.add(a)}return Array.from(t).sort((n,a)=>n.localeCompare(a,"tr"))}function G(e){if(e.startsWith("#")&&e.length===7){const t=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(1,3),16)*.78))),n=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(5,7),16)*.78)));return`#${t.toString(16).padStart(2,"0")}${n.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return e}function J(e,t,n){if(e.length===0)return n;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<e.length;r++)a.push(e[r],t(r));return a.push(n),a}function z(e,t,n){var p,C,E;const a=H(n),r="#999999",c=G(r),i=b.length,o=J(a,m=>b[m%i],r),l=J(a,m=>G(b[m%i]),c),s=`${t}fill`,d=`${t}line`,u=`${t}point`;try{(p=e.getLayer)!=null&&p.call(e,s)&&(e.setPaintProperty(s,"fill-color",o),e.setPaintProperty(s,"fill-outline-color",l)),(C=e.getLayer)!=null&&C.call(e,d)&&e.setPaintProperty(d,"line-color",l),(E=e.getLayer)!=null&&E.call(e,u)&&(e.setPaintProperty(u,"circle-radius",j),e.setPaintProperty(u,"circle-stroke-width",q),e.setPaintProperty(u,"circle-color",o),e.setPaintProperty(u,"circle-stroke-color","#ffffff"))}catch{}}const he="#999999";function fe(e){const t=H(e),n=b.length,a=new Map;t.forEach((o,l)=>{a.set(o,b[l%n])});const r=new Map;for(const o of t)r.set(o,0);let c=0;for(const o of e.features??[]){const l=$(o.properties??{});l===null?c+=1:r.set(l,(r.get(l)??0)+1)}const i=t.map(o=>({label:o,color:a.get(o),count:r.get(o)??0}));return c>0&&i.push({label:"Belirtilmemiş",color:he,count:c}),i.sort((o,l)=>l.count!==o.count?l.count-o.count:o.label.localeCompare(l.label,"tr")),i}const N=5;function O(e){const t=document.createElement("ul");t.className="nc_chatpanel_legend_list";for(const{label:n,color:a,count:r}of e){const c=document.createElement("li");c.className="nc_chatpanel_legend_row";const i=document.createElement("span");i.className="nc_chatpanel_legend_swatch",i.style.backgroundColor=a,i.setAttribute("aria-hidden","true");const o=document.createElement("span");o.className="nc_chatpanel_legend_label",o.textContent=`${n} (${r})`,c.appendChild(i),c.appendChild(o),t.appendChild(c)}return t}function me(e){const t=document.createElement("div");t.className="nc_chatpanel_legend";const n=document.createElement("div");if(n.className="nc_chatpanel_legend_heading",n.textContent="Lejant",t.appendChild(n),e.length<=N)return t.appendChild(O(e)),t;const a=e.slice(0,N),r=e.slice(N);t.appendChild(O(a));const c=O(r),i=`nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;c.id=i,c.classList.add("nc_chatpanel_legend_list_extra"),c.hidden=!0,t.appendChild(c);const o=document.createElement("button");o.type="button",o.className="btn btn-link btn-sm nc_chatpanel_legend_expand_btn",o.setAttribute("aria-expanded","false"),o.setAttribute("aria-controls",i);const l=r.length;return o.textContent=`+ ${l} kategori daha`,o.addEventListener("click",()=>{c.hidden=!c.hidden;const s=!c.hidden;o.setAttribute("aria-expanded",String(s)),o.textContent=s?"Daha az göster":`+ ${l} kategori daha`;const d=t.closest("#nc_chatpanel_messages");d&&h(d)}),t.appendChild(o),t}function F(e,t){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){t.push([e[0],e[1]]);return}for(const n of e)F(n,t)}}function U(e,t){const n=S();if(!(n!=null&&n.LngLatBounds))return;const a=[];for(const c of t.features??[]){const i=c==null?void 0:c.geometry;if(i){if(i.type==="GeometryCollection"&&Array.isArray(i.geometries)){for(const o of i.geometries)F(o==null?void 0:o.coordinates,a);continue}F(i.coordinates,a)}}if(a.length===0)return;const r=a.reduce((c,i)=>c.extend(i),new n.LngLatBounds(a[0],a[0]));e.fitBounds(r,{padding:48,duration:700,maxZoom:18})}function W(e,t){const n=e.__ncChatPanelAnim??{};typeof n.rafId=="number"&&cancelAnimationFrame(n.rafId);const a=`${t}fill`,r=`${t}line`,c=`${t}point`,i=performance.now(),o=()=>{var C,E,m;const l=(performance.now()-i)/1e3*Math.PI*2*.55,s=.5+.5*Math.sin(l),d=.15+s*.2,u=.45+s*.45,p=.5+s*.5;try{(C=e.getLayer)!=null&&C.call(e,a)&&e.setPaintProperty(a,"fill-opacity",d),(E=e.getLayer)!=null&&E.call(e,r)&&e.setPaintProperty(r,"line-opacity",u),(m=e.getLayer)!=null&&m.call(e,c)&&e.setPaintProperty(c,"circle-opacity",p),n.rafId=requestAnimationFrame(o),e.__ncChatPanelAnim=n}catch{}};n.rafId=requestAnimationFrame(o),e.__ncChatPanelAnim=n}const j=9,q=3,ge=["Open Sans Semibold","Arial Unicode MS Regular"],Y=["step",["zoom"],!1,17,!0],K={"text-allow-overlap":Y,"text-ignore-placement":Y,"text-optional":!1};function ye(e,t){var n;try{if(!((n=e.getLayer)!=null&&n.call(e,t)))return;for(const[a,r]of Object.entries(K))e.setLayoutProperty(t,a,r)}catch{}}const V=["==","$type","Point"],X="#ffffff",Z="#2d2d2d";function Q(e,t,n){var r;const a=`${n}label`;if((r=e.getLayer)!=null&&r.call(e,a)){ye(e,a);try{e.setFilter(a,V),e.setPaintProperty(a,"text-color",X),e.setPaintProperty(a,"text-halo-color",Z)}catch{}return}e.addLayer({id:a,type:"symbol",source:t,filter:V,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...ge],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...K},paint:{"text-color":X,"text-halo-color":Z,"text-halo-width":1.25,"text-halo-blur":.25}})}const P="nc_chatpanel_geojson",ee="nc_chatpanel_geojson_";function be(){var r,c;const e=g();if(!(e!=null&&e.getLayer)||!e.removeLayer)return;const t=e.__ncChatPanelAnim;t&&typeof t.rafId=="number"&&(cancelAnimationFrame(t.rafId),t.rafId=void 0);const n=ee,a=[`${n}label`,`${n}point`,`${n}line`,`${n}fill`];try{for(const i of a)(r=e.getLayer)!=null&&r.call(e,i)&&e.removeLayer(i);(c=e.getSource)!=null&&c.call(e,P)&&e.removeSource(P)}catch{}}function te(e){var c;const t=g();if(!t||typeof t.addSource!="function")return;const n=P,a=ee,r=(c=t.getSource)==null?void 0:c.call(t,n);if(r&&typeof r.setData=="function"){r.setData(e),Q(t,n,a),z(t,a,e),W(t,a),U(t,e);return}t.addSource(n,{type:"geojson",data:e}),t.addLayer({id:`${a}fill`,type:"fill",source:n,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),t.addLayer({id:`${a}line`,type:"line",source:n,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),t.addLayer({id:`${a}point`,type:"circle",source:n,filter:["==","$type","Point"],paint:{"circle-radius":j,"circle-color":"#22c55e","circle-stroke-width":q,"circle-stroke-color":"#ffffff"}}),Q(t,n,a),z(t,a,e),W(t,a),U(t,e)}function xe(e,t){return e&&typeof e.record_count=="number"&&Number.isFinite(e.record_count)?`Sorgulama sonucunda ${e.record_count} kayıt bulundu.`:e&&typeof e.message=="string"&&e.message.trim()?e.message.trim():t.trim()?t.trim():"Yanıt alındı."}async function Ce(e,t){var l;const n=new FormData;n.append("chatInput",t);const a=await fetch(e,{method:"POST",body:n}),r=await a.text(),c=a.headers.get("content-type")??"";let i=null;if(c.toLowerCase().includes("application/json"))try{i=JSON.parse(r)}catch{i=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:a.status,contentType:c,body:i??r});const o=i;return o!=null&&o.ok&&((l=o.geojson)==null?void 0:l.type)==="FeatureCollection"&&te(o.geojson),xe(o,r)}function h(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}function L(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ne(e){const t=[],n=/\[([^\]]*)\]/g;let a=0,r;for(;(r=n.exec(e))!==null;){t.push(L(e.slice(a,r.index)));const i=(r[1]??"").trim();if(i.length===0)t.push(L(r[0]));else{const o=L(i);t.push(`<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${o}" title="${o}">${o}</a>`)}a=r.index+r[0].length}return t.push(L(e.slice(a))),t.join("")}function B(e,t){e.innerHTML=ne(t)}function x(e){e.dataset.ncBracketCatDelegated!=="true"&&(e.dataset.ncBracketCatDelegated="true",e.addEventListener("click",t=>{var c;const n=t.target,a=(c=n==null?void 0:n.closest)==null?void 0:c.call(n,"a.nc_chatpanel_msg_catlink");if(!a)return;t.preventDefault();const r=a.getAttribute("data-cat")??"";console.log("[chatpanel] kategori linki",r)}))}function Ee(e){if(!e.getElementById("nc_chatpanel_bootstrap_css")){const n=document.createElement("link");n.id="nc_chatpanel_bootstrap_css",n.rel="stylesheet",n.href=ce,e.appendChild(n)}if(e.getElementById("nc_chatpanel_styles"))return;const t=document.createElement("style");t.id="nc_chatpanel_styles",t.textContent=`
    :host {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 99999;
      width: min(380px, calc(100vw - 32px));
      min-height: min(520px, calc(100vh - 28px));
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
    .nc_chatpanel_msg_ai .nc_chatpanel_msg_catlink {
      color: #0d6efd;
      font-weight: 600;
      text-decoration: underline;
      cursor: pointer;
    }
    .nc_chatpanel_msg_ai .nc_chatpanel_msg_catlink:hover {
      color: #0a58ca;
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
    .nc_chatpanel_legend_list_extra {
      margin-top: 4px;
    }
    .nc_chatpanel_legend_expand_btn {
      margin-top: 4px;
      padding-left: 0 !important;
      font-size: 0.78rem;
      text-decoration: none;
      vertical-align: baseline;
    }
    .nc_chatpanel_legend_expand_btn:hover {
      text-decoration: underline;
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
  `,e.appendChild(t)}function Le(){return`
    <div class="nc_chatpanel_header bg-primary text-white px-3 py-2">NEco Keos AI</div>
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
        class="btn btn-outline-secondary btn-sm nc_chatpanel_clear_btn"
        id="nc_chatpanel_clear_btn"
        title="Sohbeti temizle ve haritadaki panel katmanını kaldır"
        aria-label="Temizle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 6h18"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
  `}function we(e,t){const n=e.querySelector("#nc_chatpanel_form"),a=e.querySelector("#nc_chatpanel_input"),r=e.querySelector("#nc_chatpanel_messages");if(!n||!a||!r||n.dataset.ncBoundChat==="true")return;n.dataset.ncBoundChat="true",x(r);const c=(i,o)=>{const l=document.createElement("div");return l.className=`nc_chatpanel_msg ${i==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof o=="string"?l.textContent=o:l.appendChild(o),r.appendChild(l),h(r),l};n.addEventListener("submit",i=>{i.preventDefault();const o=a.value.trim();if(!o)return;c("user",o),a.value="",a.disabled=!0,v();const l=document.createElement("span");l.className="nc_chatpanel_typing",l.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const s=c("ai",l);Ce(t,o).then(d=>{B(s,d),h(r)}).catch(d=>{console.error("[chatpanel] n8n istek hatası",d),s.textContent="Sorgu sırasında hata oluştu.",h(r)}).finally(()=>{k(),a.disabled=!1,a.focus()})})}function ae(){var l,s;const e=g();if(!(e!=null&&e.getBounds))return null;const t=e.getBounds(),n=(l=t.getSouthWest)==null?void 0:l.call(t),a=(s=t.getNorthEast)==null?void 0:s.call(t);if(!n||!a)return null;const r=typeof n.lng=="number"?n.lng:n.lon,c=typeof n.lat=="number"?n.lat:n.y,i=typeof a.lng=="number"?a.lng:a.lon,o=typeof a.lat=="number"?a.lat:a.y;return[r,c,i,o].every(d=>typeof d=="number"&&Number.isFinite(d))?[r,c,i,o]:null}const Se=100;async function Ae(e,t){var r;if(!t)return;const n=c=>{x(t);const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai",B(i,c),t.appendChild(i),h(t)},a=(c,i)=>{x(t);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const l=document.createElement("div");l.className="nc_chatpanel_legend_intro",l.innerHTML=ne(c),o.appendChild(l);const s=fe(i);s.length>0&&o.appendChild(me(s)),t.appendChild(o),h(t)};try{const c=ae();if(!c){console.warn("[chatpanel] Harita bbox alınamadı."),n("Harita alanı okunamadı.");return}const i=`${e}/db/kentrehberi_poi/features-by-bbox`,o=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:c})});let l=null;try{l=await o.json()}catch{l=null}const s=l;if(!o.ok){const u=s&&typeof s.error=="string"?s.error:`HTTP ${o.status}`;n(`Kayıtlar yüklenemedi: ${u}`);return}const d=s==null?void 0:s.geojson;if(d&&d.type==="FeatureCollection"){te(d);const u=typeof s.record_count=="number"&&Number.isFinite(s.record_count)?s.record_count:((r=d.features)==null?void 0:r.length)??0;a(`Haritaya ${u} kayıt eklendi`,d),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:i,record_count:u})}else n("GeoJSON yanıtı alınamadı.")}catch(c){console.error("[chatpanel] features-by-bbox hata",c),n("Kayıtlar yüklenirken hata oluştu.")}}function ve(e){const t=e.querySelector("#nc_chatpanel_messages"),n=e.querySelector("#nc_chatpanel_input");t&&t.replaceChildren(),n&&(n.value="",n.disabled=!1),be(),T(e),t&&(t.scrollTop=0)}function re(e){const t=e.querySelector("#nc_chatpanel_clear_btn");t&&t.dataset.ncBoundClear!=="true"&&(t.dataset.ncBoundClear="true",t.addEventListener("click",()=>{ve(e),console.log("[chatpanel] panel temizlendi")}))}function oe(e,t){const n=e.querySelector("#nc_chatpanel_wisart_btn"),a=e.querySelector("#nc_chatpanel_messages");if(!n||n.dataset.ncBoundWisart==="true")return;n.dataset.ncBoundWisart="true";const r=c=>{if(!a)return;x(a);const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai",B(i,c),a.appendChild(i),h(a)};n.addEventListener("click",async()=>{if(n.disabled)return;n.disabled=!0;const c=n.innerHTML;n.innerHTML='<span aria-hidden="true">...</span>',v();let i=!1;try{const o=ae();if(!o){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}i=!0;const l=`${t}/n8n/kentrehberi`,s=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:o,faaliyet:"cami"})}),d=await s.text();let u=null;try{u=JSON.parse(d)}catch{u=d}if(console.log("[chatpanel] kentrehberi sonuç",{endpoint:l,status:s.status,data:u}),typeof u=="string")r(u);else if(u&&typeof u=="object"){const p=u.message;typeof p=="string"&&p.trim()?r(p.trim()):r(JSON.stringify(u))}else r(String(u))}catch(o){console.error("[chatpanel] WISART hata",o),r("WISART isteğinde hata oluştu.")}finally{k(),n.disabled=!1,n.innerHTML=c,i&&window.setTimeout(()=>{Ae(t,a)},Se)}})}function T(e){const t=e.querySelector("#nc_chatpanel_messages");if(!t||(x(t),t.querySelector('[data-nc-welcome-ai="true"]')))return;const n=document.createElement("div");n.className="nc_chatpanel_msg nc_chatpanel_msg_ai",n.setAttribute("data-nc-welcome-ai","true"),n.textContent=se,t.prepend(n)}function I(e={}){const{container:t=document.body}=e;let n=document.getElementById(M);const a=ue(e),r=pe(e),c=_e(e);if(w=a??null,n){a&&n.setAttribute("data-nc-map-instance",a);const l=n.shadowRoot;return l&&(oe(l,c),re(l),T(l)),n}n=document.createElement("div"),n.id=M,n.className="nc_chatpanel_root",n.setAttribute("data-nc-chatpanel","true"),a&&n.setAttribute("data-nc-map-instance",a);const i=n.attachShadow({mode:"open"});Ee(i);const o=document.createElement("div");return o.className="nc_chatpanel_shell",o.innerHTML=Le(),i.appendChild(o),t.appendChild(n),we(i,r),oe(i,c),re(i),T(i),n}const ke={init:e=>I(e??{}),getMapInstanceName:()=>w,getRegisteredMap:g,getMaplibre:S};window.ChatPanel=ke;function Ne(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if(Ne()){const e=()=>I({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return _.getMaplibre=S,_.getRegisteredMap=g,_.hideSearchScanOverlay=k,_.initChatPanel=I,_.showSearchScanOverlay=v,Object.defineProperty(_,Symbol.toStringTag,{value:"Module"}),_}({});
