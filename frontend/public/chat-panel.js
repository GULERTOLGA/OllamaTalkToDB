var ChatPanel=function(f){"use strict";const $="nc_chatpanel_root",ue="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";let A=null;function h(){var n;const e=A;return!e||typeof window>"u"?null:((n=window.__ncMapRegistry__)==null?void 0:n[e])??null}function E(){return window.maplibregl}const pe="http://localhost:3001/api/n8n",fe="http://localhost:3001/api",he="Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?",H="nc_search_scan_styles",k="nc_search_scan_overlay";let y=0,g=null;function _e(){if(typeof document>"u"||document.getElementById(H))return;const e=document.createElement("style");e.id=H,e.textContent=`
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
  `,document.head.appendChild(e)}function N(){if(typeof document>"u"||(_e(),y+=1,y>1))return;const e=document.getElementById(k);if(e){g=e,e.classList.remove("nc_search_scan_overlay--exit"),e.style.opacity="1";return}const n=document.createElement("div");n.id=k,n.className="nc_search_scan_overlay",n.setAttribute("aria-hidden","true");const t=document.createElement("div");t.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",n.appendChild(t),n.appendChild(a),document.body.appendChild(n),g=n}function P(){if(typeof document>"u"||(y=Math.max(0,y-1),y>0))return;const e=g??document.getElementById(k);if(!e){g=null;return}e.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{e.remove(),g===e&&(g=null)},420)}function ge(e){var r,i;const n=(r=e.mapInstanceName)==null?void 0:r.trim();if(n)return n;if(typeof document>"u")return;const t=document.currentScript,a=(i=t==null?void 0:t.getAttribute("data-map-instance"))==null?void 0:i.trim();if(a)return a}function me(e){var t,a;const n=(t=e.n8nProxyUrl)==null?void 0:t.trim();if(n)return n;if(typeof document<"u"){const r=document.currentScript,i=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(i)return i}return pe}function ye(e){return`${e.replace(/\/$/,"")}/news`}function be(e){var t,a;const n=(t=e.dbApiUrl)==null?void 0:t.trim();if(n)return n;if(typeof document<"u"){const r=document.currentScript,i=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(i)return i}return fe}const b=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function G(e){if(e==null)return null;const n=String(e).trim();return n.length>0?n:null}function F(e){const n=G(e.faaliyet_adi);return n!==null?n:G(e["faaliyet-adi"])}function J(e){const n=new Set;for(const t of e.features??[]){const a=F(t.properties??{});a!==null&&n.add(a)}return Array.from(n).sort((t,a)=>t.localeCompare(a,"tr"))}function U(e){if(e.startsWith("#")&&e.length===7){const n=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(1,3),16)*.78))),t=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(5,7),16)*.78)));return`#${n.toString(16).padStart(2,"0")}${t.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return e}function z(e,n,t){if(e.length===0)return t;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<e.length;r++)a.push(e[r],n(r));return a.push(t),a}function q(e,n,t){var p,C,L;const a=J(t),r="#999999",i=U(r),c=b.length,o=z(a,m=>b[m%c],r),s=z(a,m=>U(b[m%c]),i),l=`${n}fill`,u=`${n}line`,d=`${n}point`;try{(p=e.getLayer)!=null&&p.call(e,l)&&(e.setPaintProperty(l,"fill-color",o),e.setPaintProperty(l,"fill-outline-color",s)),(C=e.getLayer)!=null&&C.call(e,u)&&e.setPaintProperty(u,"line-color",s),(L=e.getLayer)!=null&&L.call(e,d)&&(e.setPaintProperty(d,"circle-radius",V),e.setPaintProperty(d,"circle-stroke-width",Z),e.setPaintProperty(d,"circle-color",o),e.setPaintProperty(d,"circle-stroke-color","#ffffff"))}catch{}}const xe="#999999",W="Belirtilmemiş";function we(e){const n=J(e),t=b.length,a=new Map;n.forEach((o,s)=>{a.set(o,b[s%t])});const r=new Map;for(const o of n)r.set(o,0);let i=0;for(const o of e.features??[]){const s=F(o.properties??{});s===null?i+=1:r.set(s,(r.get(s)??0)+1)}const c=n.map(o=>({label:o,color:a.get(o),count:r.get(o)??0}));return i>0&&c.push({label:W,color:xe,count:i}),c.sort((o,s)=>s.count!==o.count?s.count-o.count:o.label.localeCompare(s.label,"tr")),c}const O=5;function B(e,n){const t=document.createElement("ul");t.className="nc_chatpanel_legend_list";for(const{label:a,color:r,count:i}of e){const c=document.createElement("li");c.className="nc_chatpanel_legend_row nc_chatpanel_legend_row_hover";const o=document.createElement("span");o.className="nc_chatpanel_legend_swatch",o.style.backgroundColor=r,o.setAttribute("aria-hidden","true");const s=document.createElement("span");s.className="nc_chatpanel_legend_label",s.textContent=`${a} (${i})`,c.appendChild(o),c.appendChild(s),Se(c,n,a),t.appendChild(c)}return t}function Ce(e,n){const t=document.createElement("div");t.className="nc_chatpanel_legend";const a=document.createElement("div");if(a.className="nc_chatpanel_legend_heading",a.textContent="Lejant",t.appendChild(a),e.length<=O)return t.appendChild(B(e,n)),t;const r=e.slice(0,O),i=e.slice(O);t.appendChild(B(r,n));const c=B(i,n),o=`nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;c.id=o,c.classList.add("nc_chatpanel_legend_list_extra"),c.hidden=!0,t.appendChild(c);const s=document.createElement("button");s.type="button",s.className="btn btn-link btn-sm nc_chatpanel_legend_expand_btn",s.setAttribute("aria-expanded","false"),s.setAttribute("aria-controls",o);const l=i.length;return s.textContent=`+ ${l} kategori daha`,s.addEventListener("click",()=>{c.hidden=!c.hidden;const u=!c.hidden;s.setAttribute("aria-expanded",String(u)),s.textContent=u?"Daha az göster":`+ ${l} kategori daha`;const d=t.closest("#nc_chatpanel_messages");d&&_(d)}),t.appendChild(s),t}function x(e,n){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){n.push([e[0],e[1]]);return}for(const t of e)x(t,n)}}function Le(e,n){const t=F(e.properties??{});return n===W?t===null:t===n}function Ee(e){const n=[];if(x(e,n),n.length===0)return null;let t=0,a=0;for(const[r,i]of n)t+=r,a+=i;return[t/n.length,a/n.length]}function j(e){if(!e)return[];const n=e.type;if(n==="Point"){const t=e.coordinates;return Array.isArray(t)&&t.length>=2&&typeof t[0]=="number"&&Number.isFinite(t[0])&&typeof t[1]=="number"&&Number.isFinite(t[1])?[[t[0],t[1]]]:[]}if(n==="MultiPoint"){const t=[];return x(e.coordinates,t),t}if(n==="LineString"||n==="Polygon"||n==="MultiLineString"||n==="MultiPolygon"){const t=Ee(e.coordinates);return t?[t]:[]}if(n==="GeometryCollection"&&Array.isArray(e.geometries)){const t=[];for(const a of e.geometries)t.push(...j(a));return t}return[]}const M="__ncChatPanelLegendHoverMarkers";function v(e){var t;const n=e==null?void 0:e[M];if(Array.isArray(n))for(const a of n)try{(t=a.remove)==null||t.call(a)}catch{}e&&typeof e=="object"&&(e[M]=[])}function ve(e,n,t){v(e);const a=E();if(!(a!=null&&a.Marker))return;const r=[];for(const i of n.features??[])if(Le(i,t)){for(const c of j(i.geometry))if(c.every(o=>typeof o=="number"&&Number.isFinite(o)))try{const o=new a.Marker;o.setLngLat(c),o.addTo(e),r.push(o)}catch{}}e[M]=r}function Se(e,n,t){e.addEventListener("mouseenter",()=>{const a=h();a&&ve(a,n,t)}),e.addEventListener("mouseleave",()=>{const a=h();a&&v(a)})}function Y(e,n){const t=E();if(!(t!=null&&t.LngLatBounds))return;const a=[];for(const i of n.features??[]){const c=i==null?void 0:i.geometry;if(c){if(c.type==="GeometryCollection"&&Array.isArray(c.geometries)){for(const o of c.geometries)x(o==null?void 0:o.coordinates,a);continue}x(c.coordinates,a)}}if(a.length===0)return;const r=a.reduce((i,c)=>i.extend(c),new t.LngLatBounds(a[0],a[0]));e.fitBounds(r,{padding:48,duration:700,maxZoom:18})}function K(e,n){const t=e.__ncChatPanelAnim??{};typeof t.rafId=="number"&&cancelAnimationFrame(t.rafId);const a=`${n}fill`,r=`${n}line`,i=`${n}point`,c=performance.now(),o=()=>{var C,L,m;const s=(performance.now()-c)/1e3*Math.PI*2*.55,l=.5+.5*Math.sin(s),u=.15+l*.2,d=.45+l*.45,p=.5+l*.5;try{(C=e.getLayer)!=null&&C.call(e,a)&&e.setPaintProperty(a,"fill-opacity",u),(L=e.getLayer)!=null&&L.call(e,r)&&e.setPaintProperty(r,"line-opacity",d),(m=e.getLayer)!=null&&m.call(e,i)&&e.setPaintProperty(i,"circle-opacity",p),t.rafId=requestAnimationFrame(o),e.__ncChatPanelAnim=t}catch{}};t.rafId=requestAnimationFrame(o),e.__ncChatPanelAnim=t}const V=9,Z=3,Ae=["Open Sans Semibold","Arial Unicode MS Regular"],X=["step",["zoom"],!1,17,!0],Q={"text-allow-overlap":X,"text-ignore-placement":X,"text-optional":!1};function ke(e,n){var t;try{if(!((t=e.getLayer)!=null&&t.call(e,n)))return;for(const[a,r]of Object.entries(Q))e.setLayoutProperty(n,a,r)}catch{}}const ee=["==","$type","Point"],te="#ffffff",ne="#2d2d2d";function ae(e,n,t){var r;const a=`${t}label`;if((r=e.getLayer)!=null&&r.call(e,a)){ke(e,a);try{e.setFilter(a,ee),e.setPaintProperty(a,"text-color",te),e.setPaintProperty(a,"text-halo-color",ne)}catch{}return}e.addLayer({id:a,type:"symbol",source:n,filter:ee,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...Ae],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...Q},paint:{"text-color":te,"text-halo-color":ne,"text-halo-width":1.25,"text-halo-blur":.25}})}const T="nc_chatpanel_geojson",re="nc_chatpanel_geojson_";function Ne(){var r,i;const e=h();if(e&&v(e),!(e!=null&&e.getLayer)||!e.removeLayer)return;const n=e.__ncChatPanelAnim;n&&typeof n.rafId=="number"&&(cancelAnimationFrame(n.rafId),n.rafId=void 0);const t=re,a=[`${t}label`,`${t}point`,`${t}line`,`${t}fill`];try{for(const c of a)(r=e.getLayer)!=null&&r.call(e,c)&&e.removeLayer(c);(i=e.getSource)!=null&&i.call(e,T)&&e.removeSource(T)}catch{}}function oe(e){var i;const n=h();if(!n||typeof n.addSource!="function")return;v(n);const t=T,a=re,r=(i=n.getSource)==null?void 0:i.call(n,t);if(r&&typeof r.setData=="function"){r.setData(e),ae(n,t,a),q(n,a,e),K(n,a),Y(n,e);return}n.addSource(t,{type:"geojson",data:e}),n.addLayer({id:`${a}fill`,type:"fill",source:t,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),n.addLayer({id:`${a}line`,type:"line",source:t,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),n.addLayer({id:`${a}point`,type:"circle",source:t,filter:["==","$type","Point"],paint:{"circle-radius":V,"circle-color":"#22c55e","circle-stroke-width":Z,"circle-stroke-color":"#ffffff"}}),ae(n,t,a),q(n,a,e),K(n,a),Y(n,e)}function Pe(e,n){return e&&typeof e.record_count=="number"&&Number.isFinite(e.record_count)?`Sorgulama sonucunda ${e.record_count} kayıt bulundu.`:e&&typeof e.message=="string"&&e.message.trim()?e.message.trim():n.trim()?n.trim():"Yanıt alındı."}async function Fe(e,n){var s;const t=new FormData;t.append("chatInput",n);const a=await fetch(e,{method:"POST",body:t}),r=await a.text(),i=a.headers.get("content-type")??"";let c=null;if(i.toLowerCase().includes("application/json"))try{c=JSON.parse(r)}catch{c=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:a.status,contentType:i,body:c??r});const o=c;return o!=null&&o.ok&&((s=o.geojson)==null?void 0:s.type)==="FeatureCollection"&&oe(o.geojson),Pe(o,r)}function _(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}function S(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ce(e){const n=[],t=/\[([^\]]*)\]/g;let a=0,r;for(;(r=t.exec(e))!==null;){n.push(S(e.slice(a,r.index)));const c=(r[1]??"").trim();if(c.length===0)n.push(S(r[0]));else{const o=S(c);n.push(`<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${o}" title="${o}">${o}</a>`)}a=r.index+r[0].length}return n.push(S(e.slice(a))),n.join("")}function I(e,n){e.innerHTML=ce(n)}function w(e){e.dataset.ncBracketCatDelegated!=="true"&&(e.dataset.ncBracketCatDelegated="true",e.addEventListener("click",n=>{var i;const t=n.target,a=(i=t==null?void 0:t.closest)==null?void 0:i.call(t,"a.nc_chatpanel_msg_catlink");if(!a)return;n.preventDefault();const r=a.getAttribute("data-cat")??"";console.log("[chatpanel] kategori linki",r)}))}function Oe(e){if(!e.getElementById("nc_chatpanel_bootstrap_css")){const t=document.createElement("link");t.id="nc_chatpanel_bootstrap_css",t.rel="stylesheet",t.href=ue,e.appendChild(t)}if(e.getElementById("nc_chatpanel_styles"))return;const n=document.createElement("style");n.id="nc_chatpanel_styles",n.textContent=`
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
  `,e.appendChild(n)}function Be(){return`
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
        class="btn btn-outline-info btn-sm nc_chatpanel_news_btn"
        id="nc_chatpanel_news_btn"
        title="Haber (n8n)"
        aria-label="Haber"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
          <path d="M18 14h-8"/>
          <path d="M15 18h-5"/>
          <path d="M10 6h8v4h-8V6Z"/>
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
  `}function Me(e,n){const t=e.querySelector("#nc_chatpanel_form"),a=e.querySelector("#nc_chatpanel_input"),r=e.querySelector("#nc_chatpanel_messages");if(!t||!a||!r||t.dataset.ncBoundChat==="true")return;t.dataset.ncBoundChat="true",w(r);const i=(c,o)=>{const s=document.createElement("div");return s.className=`nc_chatpanel_msg ${c==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof o=="string"?s.textContent=o:s.appendChild(o),r.appendChild(s),_(r),s};t.addEventListener("submit",c=>{c.preventDefault();const o=a.value.trim();if(!o)return;i("user",o),a.value="",a.disabled=!0,N();const s=document.createElement("span");s.className="nc_chatpanel_typing",s.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const l=i("ai",s);Fe(n,o).then(u=>{I(l,u),_(r)}).catch(u=>{console.error("[chatpanel] n8n istek hatası",u),l.textContent="Sorgu sırasında hata oluştu.",_(r)}).finally(()=>{P(),a.disabled=!1,a.focus()})})}function ie(){var s,l;const e=h();if(!(e!=null&&e.getBounds))return null;const n=e.getBounds(),t=(s=n.getSouthWest)==null?void 0:s.call(n),a=(l=n.getNorthEast)==null?void 0:l.call(n);if(!t||!a)return null;const r=typeof t.lng=="number"?t.lng:t.lon,i=typeof t.lat=="number"?t.lat:t.y,c=typeof a.lng=="number"?a.lng:a.lon,o=typeof a.lat=="number"?a.lat:a.y;return[r,i,c,o].every(u=>typeof u=="number"&&Number.isFinite(u))?[r,i,c,o]:null}const Te=100;async function Ie(e,n){var r;if(!n)return;const t=i=>{w(n);const c=document.createElement("div");c.className="nc_chatpanel_msg nc_chatpanel_msg_ai",I(c,i),n.appendChild(c),_(n)},a=(i,c)=>{w(n);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const s=document.createElement("div");s.className="nc_chatpanel_legend_intro",s.innerHTML=ce(i),o.appendChild(s);const l=we(c);l.length>0&&o.appendChild(Ce(l,c)),n.appendChild(o),_(n)};try{const i=ie();if(!i){console.warn("[chatpanel] Harita bbox alınamadı."),t("Harita alanı okunamadı.");return}const c=`${e}/db/kentrehberi_poi/features-by-bbox`,o=await fetch(c,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:i})});let s=null;try{s=await o.json()}catch{s=null}const l=s;if(!o.ok){const d=l&&typeof l.error=="string"?l.error:`HTTP ${o.status}`;t(`Kayıtlar yüklenemedi: ${d}`);return}const u=l==null?void 0:l.geojson;if(u&&u.type==="FeatureCollection"){oe(u);const d=typeof l.record_count=="number"&&Number.isFinite(l.record_count)?l.record_count:((r=u.features)==null?void 0:r.length)??0;a(`Haritaya ${d} kayıt eklendi`,u),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:c,record_count:d})}else t("GeoJSON yanıtı alınamadı.")}catch(i){console.error("[chatpanel] features-by-bbox hata",i),t("Kayıtlar yüklenirken hata oluştu.")}}function De(e){const n=e.querySelector("#nc_chatpanel_messages"),t=e.querySelector("#nc_chatpanel_input");n&&n.replaceChildren(),t&&(t.value="",t.disabled=!1),Ne(),D(e),n&&(n.scrollTop=0)}function se(e){const n=e.querySelector("#nc_chatpanel_clear_btn");n&&n.dataset.ncBoundClear!=="true"&&(n.dataset.ncBoundClear="true",n.addEventListener("click",()=>{De(e),console.log("[chatpanel] panel temizlendi")}))}function le(e,n){const t=e.querySelector("#nc_chatpanel_news_btn");if(!t||t.dataset.ncBoundNews==="true")return;t.dataset.ncBoundNews="true";const a=ye(n);t.addEventListener("click",async()=>{if(!t.disabled){t.disabled=!0;try{const r=new FormData;r.append("chatInput","haberler");const i=await fetch(a,{method:"POST",body:r}),c=await i.text();let o=c;try{o=JSON.parse(c)}catch{}console.log("[chatpanel] n8n news yanıtı",{endpoint:a,status:i.status,data:o})}catch(r){console.error("[chatpanel] n8n news istek hatası",r)}finally{t.disabled=!1}}})}function de(e,n){const t=e.querySelector("#nc_chatpanel_wisart_btn"),a=e.querySelector("#nc_chatpanel_messages");if(!t||t.dataset.ncBoundWisart==="true")return;t.dataset.ncBoundWisart="true";const r=i=>{if(!a)return;w(a);const c=document.createElement("div");c.className="nc_chatpanel_msg nc_chatpanel_msg_ai",I(c,i),a.appendChild(c),_(a)};t.addEventListener("click",async()=>{if(t.disabled)return;t.disabled=!0;const i=t.innerHTML;t.innerHTML='<span aria-hidden="true">...</span>',N();let c=!1;try{const o=ie();if(!o){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}c=!0;const s=`${n}/n8n/kentrehberi`,l=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:o,faaliyet:"cami"})}),u=await l.text();let d=null;try{d=JSON.parse(u)}catch{d=u}if(console.log("[chatpanel] kentrehberi sonuç",{endpoint:s,status:l.status,data:d}),typeof d=="string")r(d);else if(d&&typeof d=="object"){const p=d.message;typeof p=="string"&&p.trim()?r(p.trim()):r(JSON.stringify(d))}else r(String(d))}catch(o){console.error("[chatpanel] WISART hata",o),r("WISART isteğinde hata oluştu.")}finally{P(),t.disabled=!1,t.innerHTML=i,c&&window.setTimeout(()=>{Ie(n,a)},Te)}})}function D(e){const n=e.querySelector("#nc_chatpanel_messages");if(!n||(w(n),n.querySelector('[data-nc-welcome-ai="true"]')))return;const t=document.createElement("div");t.className="nc_chatpanel_msg nc_chatpanel_msg_ai",t.setAttribute("data-nc-welcome-ai","true"),t.textContent=he,n.prepend(t)}function R(e={}){const{container:n=document.body}=e;let t=document.getElementById($);const a=ge(e),r=me(e),i=be(e);if(A=a??null,t){a&&t.setAttribute("data-nc-map-instance",a);const s=t.shadowRoot;return s&&(de(s,i),le(s,r),se(s),D(s)),t}t=document.createElement("div"),t.id=$,t.className="nc_chatpanel_root",t.setAttribute("data-nc-chatpanel","true"),a&&t.setAttribute("data-nc-map-instance",a);const c=t.attachShadow({mode:"open"});Oe(c);const o=document.createElement("div");return o.className="nc_chatpanel_shell",o.innerHTML=Be(),c.appendChild(o),n.appendChild(t),Me(c,r),de(c,i),le(c,r),se(c),D(c),t}const Re={init:e=>R(e??{}),getMapInstanceName:()=>A,getRegisteredMap:h,getMaplibre:E};window.ChatPanel=Re;function $e(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if($e()){const e=()=>R({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return f.getMaplibre=E,f.getRegisteredMap=h,f.hideSearchScanOverlay=P,f.initChatPanel=R,f.showSearchScanOverlay=N,Object.defineProperty(f,Symbol.toStringTag,{value:"Module"}),f}({});
