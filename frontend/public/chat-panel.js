var ChatPanel=function(f){"use strict";const $="nc_chatpanel_root",de="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";let S=null;function _(){var n;const e=S;return!e||typeof window>"u"?null:((n=window.__ncMapRegistry__)==null?void 0:n[e])??null}function w(){return window.maplibregl}const ue="http://localhost:3001/api/n8n",pe="http://localhost:3001/api",fe="Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?",H="nc_search_scan_styles",k="nc_search_scan_overlay";let y=0,g=null;function _e(){if(typeof document>"u"||document.getElementById(H))return;const e=document.createElement("style");e.id=H,e.textContent=`
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
  `,document.head.appendChild(e)}function N(){if(typeof document>"u"||(_e(),y+=1,y>1))return;const e=document.getElementById(k);if(e){g=e,e.classList.remove("nc_search_scan_overlay--exit"),e.style.opacity="1";return}const n=document.createElement("div");n.id=k,n.className="nc_search_scan_overlay",n.setAttribute("aria-hidden","true");const t=document.createElement("div");t.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",n.appendChild(t),n.appendChild(a),document.body.appendChild(n),g=n}function F(){if(typeof document>"u"||(y=Math.max(0,y-1),y>0))return;const e=g??document.getElementById(k);if(!e){g=null;return}e.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{e.remove(),g===e&&(g=null)},420)}function he(e){var r,c;const n=(r=e.mapInstanceName)==null?void 0:r.trim();if(n)return n;if(typeof document>"u")return;const t=document.currentScript,a=(c=t==null?void 0:t.getAttribute("data-map-instance"))==null?void 0:c.trim();if(a)return a}function ge(e){var t,a;const n=(t=e.n8nProxyUrl)==null?void 0:t.trim();if(n)return n;if(typeof document<"u"){const r=document.currentScript,c=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(c)return c}return ue}function me(e){var t,a;const n=(t=e.dbApiUrl)==null?void 0:t.trim();if(n)return n;if(typeof document<"u"){const r=document.currentScript,c=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(c)return c}return pe}const b=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function G(e){if(e==null)return null;const n=String(e).trim();return n.length>0?n:null}function P(e){const n=G(e.faaliyet_adi);return n!==null?n:G(e["faaliyet-adi"])}function J(e){const n=new Set;for(const t of e.features??[]){const a=P(t.properties??{});a!==null&&n.add(a)}return Array.from(n).sort((t,a)=>t.localeCompare(a,"tr"))}function z(e){if(e.startsWith("#")&&e.length===7){const n=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(1,3),16)*.78))),t=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(5,7),16)*.78)));return`#${n.toString(16).padStart(2,"0")}${t.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return e}function U(e,n,t){if(e.length===0)return t;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<e.length;r++)a.push(e[r],n(r));return a.push(t),a}function W(e,n,t){var p,L,E;const a=J(t),r="#999999",c=z(r),i=b.length,o=U(a,m=>b[m%i],r),l=U(a,m=>z(b[m%i]),c),s=`${n}fill`,u=`${n}line`,d=`${n}point`;try{(p=e.getLayer)!=null&&p.call(e,s)&&(e.setPaintProperty(s,"fill-color",o),e.setPaintProperty(s,"fill-outline-color",l)),(L=e.getLayer)!=null&&L.call(e,u)&&e.setPaintProperty(u,"line-color",l),(E=e.getLayer)!=null&&E.call(e,d)&&(e.setPaintProperty(d,"circle-radius",V),e.setPaintProperty(d,"circle-stroke-width",X),e.setPaintProperty(d,"circle-color",o),e.setPaintProperty(d,"circle-stroke-color","#ffffff"))}catch{}}const ye="#999999",q="Belirtilmemiş";function be(e){const n=J(e),t=b.length,a=new Map;n.forEach((o,l)=>{a.set(o,b[l%t])});const r=new Map;for(const o of n)r.set(o,0);let c=0;for(const o of e.features??[]){const l=P(o.properties??{});l===null?c+=1:r.set(l,(r.get(l)??0)+1)}const i=n.map(o=>({label:o,color:a.get(o),count:r.get(o)??0}));return c>0&&i.push({label:q,color:ye,count:c}),i.sort((o,l)=>l.count!==o.count?l.count-o.count:o.label.localeCompare(l.label,"tr")),i}const O=5;function B(e,n){const t=document.createElement("ul");t.className="nc_chatpanel_legend_list";for(const{label:a,color:r,count:c}of e){const i=document.createElement("li");i.className="nc_chatpanel_legend_row nc_chatpanel_legend_row_hover";const o=document.createElement("span");o.className="nc_chatpanel_legend_swatch",o.style.backgroundColor=r,o.setAttribute("aria-hidden","true");const l=document.createElement("span");l.className="nc_chatpanel_legend_label",l.textContent=`${a} (${c})`,i.appendChild(o),i.appendChild(l),we(i,n,a),t.appendChild(i)}return t}function xe(e,n){const t=document.createElement("div");t.className="nc_chatpanel_legend";const a=document.createElement("div");if(a.className="nc_chatpanel_legend_heading",a.textContent="Lejant",t.appendChild(a),e.length<=O)return t.appendChild(B(e,n)),t;const r=e.slice(0,O),c=e.slice(O);t.appendChild(B(r,n));const i=B(c,n),o=`nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;i.id=o,i.classList.add("nc_chatpanel_legend_list_extra"),i.hidden=!0,t.appendChild(i);const l=document.createElement("button");l.type="button",l.className="btn btn-link btn-sm nc_chatpanel_legend_expand_btn",l.setAttribute("aria-expanded","false"),l.setAttribute("aria-controls",o);const s=c.length;return l.textContent=`+ ${s} kategori daha`,l.addEventListener("click",()=>{i.hidden=!i.hidden;const u=!i.hidden;l.setAttribute("aria-expanded",String(u)),l.textContent=u?"Daha az göster":`+ ${s} kategori daha`;const d=t.closest("#nc_chatpanel_messages");d&&h(d)}),t.appendChild(l),t}function x(e,n){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){n.push([e[0],e[1]]);return}for(const t of e)x(t,n)}}function Ce(e,n){const t=P(e.properties??{});return n===q?t===null:t===n}function Le(e){const n=[];if(x(e,n),n.length===0)return null;let t=0,a=0;for(const[r,c]of n)t+=r,a+=c;return[t/n.length,a/n.length]}function j(e){if(!e)return[];const n=e.type;if(n==="Point"){const t=e.coordinates;return Array.isArray(t)&&t.length>=2&&typeof t[0]=="number"&&Number.isFinite(t[0])&&typeof t[1]=="number"&&Number.isFinite(t[1])?[[t[0],t[1]]]:[]}if(n==="MultiPoint"){const t=[];return x(e.coordinates,t),t}if(n==="LineString"||n==="Polygon"||n==="MultiLineString"||n==="MultiPolygon"){const t=Le(e.coordinates);return t?[t]:[]}if(n==="GeometryCollection"&&Array.isArray(e.geometries)){const t=[];for(const a of e.geometries)t.push(...j(a));return t}return[]}const M="__ncChatPanelLegendHoverMarkers";function v(e){var t;const n=e==null?void 0:e[M];if(Array.isArray(n))for(const a of n)try{(t=a.remove)==null||t.call(a)}catch{}e&&typeof e=="object"&&(e[M]=[])}function Ee(e,n,t){v(e);const a=w();if(!(a!=null&&a.Marker))return;const r=[];for(const c of n.features??[])if(Ce(c,t)){for(const i of j(c.geometry))if(i.every(o=>typeof o=="number"&&Number.isFinite(o)))try{const o=new a.Marker;o.setLngLat(i),o.addTo(e),r.push(o)}catch{}}e[M]=r}function we(e,n,t){e.addEventListener("mouseenter",()=>{const a=_();a&&Ee(a,n,t)}),e.addEventListener("mouseleave",()=>{const a=_();a&&v(a)})}function Y(e,n){const t=w();if(!(t!=null&&t.LngLatBounds))return;const a=[];for(const c of n.features??[]){const i=c==null?void 0:c.geometry;if(i){if(i.type==="GeometryCollection"&&Array.isArray(i.geometries)){for(const o of i.geometries)x(o==null?void 0:o.coordinates,a);continue}x(i.coordinates,a)}}if(a.length===0)return;const r=a.reduce((c,i)=>c.extend(i),new t.LngLatBounds(a[0],a[0]));e.fitBounds(r,{padding:48,duration:700,maxZoom:18})}function K(e,n){const t=e.__ncChatPanelAnim??{};typeof t.rafId=="number"&&cancelAnimationFrame(t.rafId);const a=`${n}fill`,r=`${n}line`,c=`${n}point`,i=performance.now(),o=()=>{var L,E,m;const l=(performance.now()-i)/1e3*Math.PI*2*.55,s=.5+.5*Math.sin(l),u=.15+s*.2,d=.45+s*.45,p=.5+s*.5;try{(L=e.getLayer)!=null&&L.call(e,a)&&e.setPaintProperty(a,"fill-opacity",u),(E=e.getLayer)!=null&&E.call(e,r)&&e.setPaintProperty(r,"line-opacity",d),(m=e.getLayer)!=null&&m.call(e,c)&&e.setPaintProperty(c,"circle-opacity",p),t.rafId=requestAnimationFrame(o),e.__ncChatPanelAnim=t}catch{}};t.rafId=requestAnimationFrame(o),e.__ncChatPanelAnim=t}const V=9,X=3,ve=["Open Sans Semibold","Arial Unicode MS Regular"],Z=["step",["zoom"],!1,17,!0],Q={"text-allow-overlap":Z,"text-ignore-placement":Z,"text-optional":!1};function Ae(e,n){var t;try{if(!((t=e.getLayer)!=null&&t.call(e,n)))return;for(const[a,r]of Object.entries(Q))e.setLayoutProperty(n,a,r)}catch{}}const ee=["==","$type","Point"],te="#ffffff",ne="#2d2d2d";function ae(e,n,t){var r;const a=`${t}label`;if((r=e.getLayer)!=null&&r.call(e,a)){Ae(e,a);try{e.setFilter(a,ee),e.setPaintProperty(a,"text-color",te),e.setPaintProperty(a,"text-halo-color",ne)}catch{}return}e.addLayer({id:a,type:"symbol",source:n,filter:ee,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...ve],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...Q},paint:{"text-color":te,"text-halo-color":ne,"text-halo-width":1.25,"text-halo-blur":.25}})}const T="nc_chatpanel_geojson",re="nc_chatpanel_geojson_";function Se(){var r,c;const e=_();if(e&&v(e),!(e!=null&&e.getLayer)||!e.removeLayer)return;const n=e.__ncChatPanelAnim;n&&typeof n.rafId=="number"&&(cancelAnimationFrame(n.rafId),n.rafId=void 0);const t=re,a=[`${t}label`,`${t}point`,`${t}line`,`${t}fill`];try{for(const i of a)(r=e.getLayer)!=null&&r.call(e,i)&&e.removeLayer(i);(c=e.getSource)!=null&&c.call(e,T)&&e.removeSource(T)}catch{}}function oe(e){var c;const n=_();if(!n||typeof n.addSource!="function")return;v(n);const t=T,a=re,r=(c=n.getSource)==null?void 0:c.call(n,t);if(r&&typeof r.setData=="function"){r.setData(e),ae(n,t,a),W(n,a,e),K(n,a),Y(n,e);return}n.addSource(t,{type:"geojson",data:e}),n.addLayer({id:`${a}fill`,type:"fill",source:t,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),n.addLayer({id:`${a}line`,type:"line",source:t,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),n.addLayer({id:`${a}point`,type:"circle",source:t,filter:["==","$type","Point"],paint:{"circle-radius":V,"circle-color":"#22c55e","circle-stroke-width":X,"circle-stroke-color":"#ffffff"}}),ae(n,t,a),W(n,a,e),K(n,a),Y(n,e)}function ke(e,n){return e&&typeof e.record_count=="number"&&Number.isFinite(e.record_count)?`Sorgulama sonucunda ${e.record_count} kayıt bulundu.`:e&&typeof e.message=="string"&&e.message.trim()?e.message.trim():n.trim()?n.trim():"Yanıt alındı."}async function Ne(e,n){var l;const t=new FormData;t.append("chatInput",n);const a=await fetch(e,{method:"POST",body:t}),r=await a.text(),c=a.headers.get("content-type")??"";let i=null;if(c.toLowerCase().includes("application/json"))try{i=JSON.parse(r)}catch{i=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:a.status,contentType:c,body:i??r});const o=i;return o!=null&&o.ok&&((l=o.geojson)==null?void 0:l.type)==="FeatureCollection"&&oe(o.geojson),ke(o,r)}function h(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}function A(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ie(e){const n=[],t=/\[([^\]]*)\]/g;let a=0,r;for(;(r=t.exec(e))!==null;){n.push(A(e.slice(a,r.index)));const i=(r[1]??"").trim();if(i.length===0)n.push(A(r[0]));else{const o=A(i);n.push(`<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${o}" title="${o}">${o}</a>`)}a=r.index+r[0].length}return n.push(A(e.slice(a))),n.join("")}function I(e,n){e.innerHTML=ie(n)}function C(e){e.dataset.ncBracketCatDelegated!=="true"&&(e.dataset.ncBracketCatDelegated="true",e.addEventListener("click",n=>{var c;const t=n.target,a=(c=t==null?void 0:t.closest)==null?void 0:c.call(t,"a.nc_chatpanel_msg_catlink");if(!a)return;n.preventDefault();const r=a.getAttribute("data-cat")??"";console.log("[chatpanel] kategori linki",r)}))}function Fe(e){if(!e.getElementById("nc_chatpanel_bootstrap_css")){const t=document.createElement("link");t.id="nc_chatpanel_bootstrap_css",t.rel="stylesheet",t.href=de,e.appendChild(t)}if(e.getElementById("nc_chatpanel_styles"))return;const n=document.createElement("style");n.id="nc_chatpanel_styles",n.textContent=`
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
    .nc_chatpanel_legend_row.nc_chatpanel_legend_row_hover {
      margin-left: -4px;
      margin-right: -4px;
      padding: 2px 4px;
      border-radius: 4px;
      cursor: default;
      transition: background 0.12s ease;
    }
    .nc_chatpanel_legend_row.nc_chatpanel_legend_row_hover:hover {
      background: rgba(13, 110, 253, 0.09);
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
  `,e.appendChild(n)}function Pe(){return`
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
  `}function Oe(e,n){const t=e.querySelector("#nc_chatpanel_form"),a=e.querySelector("#nc_chatpanel_input"),r=e.querySelector("#nc_chatpanel_messages");if(!t||!a||!r||t.dataset.ncBoundChat==="true")return;t.dataset.ncBoundChat="true",C(r);const c=(i,o)=>{const l=document.createElement("div");return l.className=`nc_chatpanel_msg ${i==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof o=="string"?l.textContent=o:l.appendChild(o),r.appendChild(l),h(r),l};t.addEventListener("submit",i=>{i.preventDefault();const o=a.value.trim();if(!o)return;c("user",o),a.value="",a.disabled=!0,N();const l=document.createElement("span");l.className="nc_chatpanel_typing",l.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const s=c("ai",l);Ne(n,o).then(u=>{I(s,u),h(r)}).catch(u=>{console.error("[chatpanel] n8n istek hatası",u),s.textContent="Sorgu sırasında hata oluştu.",h(r)}).finally(()=>{F(),a.disabled=!1,a.focus()})})}function ce(){var l,s;const e=_();if(!(e!=null&&e.getBounds))return null;const n=e.getBounds(),t=(l=n.getSouthWest)==null?void 0:l.call(n),a=(s=n.getNorthEast)==null?void 0:s.call(n);if(!t||!a)return null;const r=typeof t.lng=="number"?t.lng:t.lon,c=typeof t.lat=="number"?t.lat:t.y,i=typeof a.lng=="number"?a.lng:a.lon,o=typeof a.lat=="number"?a.lat:a.y;return[r,c,i,o].every(u=>typeof u=="number"&&Number.isFinite(u))?[r,c,i,o]:null}const Be=100;async function Me(e,n){var r;if(!n)return;const t=c=>{C(n);const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai",I(i,c),n.appendChild(i),h(n)},a=(c,i)=>{C(n);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const l=document.createElement("div");l.className="nc_chatpanel_legend_intro",l.innerHTML=ie(c),o.appendChild(l);const s=be(i);s.length>0&&o.appendChild(xe(s,i)),n.appendChild(o),h(n)};try{const c=ce();if(!c){console.warn("[chatpanel] Harita bbox alınamadı."),t("Harita alanı okunamadı.");return}const i=`${e}/db/kentrehberi_poi/features-by-bbox`,o=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:c})});let l=null;try{l=await o.json()}catch{l=null}const s=l;if(!o.ok){const d=s&&typeof s.error=="string"?s.error:`HTTP ${o.status}`;t(`Kayıtlar yüklenemedi: ${d}`);return}const u=s==null?void 0:s.geojson;if(u&&u.type==="FeatureCollection"){oe(u);const d=typeof s.record_count=="number"&&Number.isFinite(s.record_count)?s.record_count:((r=u.features)==null?void 0:r.length)??0;a(`Haritaya ${d} kayıt eklendi`,u),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:i,record_count:d})}else t("GeoJSON yanıtı alınamadı.")}catch(c){console.error("[chatpanel] features-by-bbox hata",c),t("Kayıtlar yüklenirken hata oluştu.")}}function Te(e){const n=e.querySelector("#nc_chatpanel_messages"),t=e.querySelector("#nc_chatpanel_input");n&&n.replaceChildren(),t&&(t.value="",t.disabled=!1),Se(),D(e),n&&(n.scrollTop=0)}function le(e){const n=e.querySelector("#nc_chatpanel_clear_btn");n&&n.dataset.ncBoundClear!=="true"&&(n.dataset.ncBoundClear="true",n.addEventListener("click",()=>{Te(e),console.log("[chatpanel] panel temizlendi")}))}function se(e,n){const t=e.querySelector("#nc_chatpanel_wisart_btn"),a=e.querySelector("#nc_chatpanel_messages");if(!t||t.dataset.ncBoundWisart==="true")return;t.dataset.ncBoundWisart="true";const r=c=>{if(!a)return;C(a);const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai",I(i,c),a.appendChild(i),h(a)};t.addEventListener("click",async()=>{if(t.disabled)return;t.disabled=!0;const c=t.innerHTML;t.innerHTML='<span aria-hidden="true">...</span>',N();let i=!1;try{const o=ce();if(!o){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}i=!0;const l=`${n}/n8n/kentrehberi`,s=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:o,faaliyet:"cami"})}),u=await s.text();let d=null;try{d=JSON.parse(u)}catch{d=u}if(console.log("[chatpanel] kentrehberi sonuç",{endpoint:l,status:s.status,data:d}),typeof d=="string")r(d);else if(d&&typeof d=="object"){const p=d.message;typeof p=="string"&&p.trim()?r(p.trim()):r(JSON.stringify(d))}else r(String(d))}catch(o){console.error("[chatpanel] WISART hata",o),r("WISART isteğinde hata oluştu.")}finally{F(),t.disabled=!1,t.innerHTML=c,i&&window.setTimeout(()=>{Me(n,a)},Be)}})}function D(e){const n=e.querySelector("#nc_chatpanel_messages");if(!n||(C(n),n.querySelector('[data-nc-welcome-ai="true"]')))return;const t=document.createElement("div");t.className="nc_chatpanel_msg nc_chatpanel_msg_ai",t.setAttribute("data-nc-welcome-ai","true"),t.textContent=fe,n.prepend(t)}function R(e={}){const{container:n=document.body}=e;let t=document.getElementById($);const a=he(e),r=ge(e),c=me(e);if(S=a??null,t){a&&t.setAttribute("data-nc-map-instance",a);const l=t.shadowRoot;return l&&(se(l,c),le(l),D(l)),t}t=document.createElement("div"),t.id=$,t.className="nc_chatpanel_root",t.setAttribute("data-nc-chatpanel","true"),a&&t.setAttribute("data-nc-map-instance",a);const i=t.attachShadow({mode:"open"});Fe(i);const o=document.createElement("div");return o.className="nc_chatpanel_shell",o.innerHTML=Pe(),i.appendChild(o),n.appendChild(t),Oe(i,r),se(i,c),le(i),D(i),t}const Ie={init:e=>R(e??{}),getMapInstanceName:()=>S,getRegisteredMap:_,getMaplibre:w};window.ChatPanel=Ie;function De(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if(De()){const e=()=>R({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return f.getMaplibre=w,f.getRegisteredMap=_,f.hideSearchScanOverlay=F,f.initChatPanel=R,f.showSearchScanOverlay=N,Object.defineProperty(f,Symbol.toStringTag,{value:"Module"}),f}({});
