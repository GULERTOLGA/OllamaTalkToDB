var ChatPanel=function(g){"use strict";const W="nc_chatpanel_root",Ee="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";let B=null;function b(){var t;const e=B;return!e||typeof window>"u"?null:((t=window.__ncMapRegistry__)==null?void 0:t[e])??null}function A(){return window.maplibregl}const Se="http://localhost:3001/api/n8n",Ae="http://localhost:3001/api",Y="nc_chatpanel_n8n_news_v1",Ne=60*60*1e3,Me="Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?",K="nc_search_scan_styles",F="nc_search_scan_overlay",N="nc_map_magnify_lens_root",Z=252,T=2.5;let C=null,x=null;function O(){try{x==null||x()}catch{}}let L=0,v=null;function Pe(){if(typeof document>"u"||document.getElementById(K))return;const e=document.createElement("style");e.id=K,e.textContent=`
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
  `,document.head.appendChild(e)}function I(){if(typeof document>"u"||(Pe(),L+=1,L>1))return;const e=document.getElementById(F);if(e){v=e,e.classList.remove("nc_search_scan_overlay--exit"),e.style.opacity="1";return}const t=document.createElement("div");t.id=F,t.className="nc_search_scan_overlay",t.setAttribute("aria-hidden","true");const n=document.createElement("div");n.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",t.appendChild(n),t.appendChild(a),document.body.appendChild(t),v=t}function H(){if(typeof document>"u"||(L=Math.max(0,L-1),L>0))return;const e=v??document.getElementById(F);if(!e){v=null;return}e.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{e.remove(),v===e&&(v=null)},420)}function Be(e){var r,i;const t=(r=e.mapInstanceName)==null?void 0:r.trim();if(t)return t;if(typeof document>"u")return;const n=document.currentScript,a=(i=n==null?void 0:n.getAttribute("data-map-instance"))==null?void 0:i.trim();if(a)return a}function Fe(e){var n,a;const t=(n=e.n8nProxyUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,i=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(i)return i}return Se}function Te(e){return`${e.replace(/\/$/,"")}/news`}function Oe(e){var n,a;const t=(n=e.dbApiUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,i=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(i)return i}return Ae}const k=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function V(e){if(e==null)return null;const t=String(e).trim();return t.length>0?t:null}function D(e){const t=V(e.faaliyet_adi);return t!==null?t:V(e["faaliyet-adi"])}function X(e){const t=new Set;for(const n of e.features??[]){const a=D(n.properties??{});a!==null&&t.add(a)}return Array.from(t).sort((n,a)=>n.localeCompare(a,"tr"))}function Q(e){if(e.startsWith("#")&&e.length===7){const t=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(1,3),16)*.78))),n=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(5,7),16)*.78)));return`#${t.toString(16).padStart(2,"0")}${n.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return e}function ee(e,t,n){if(e.length===0)return n;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<e.length;r++)a.push(e[r],t(r));return a.push(n),a}function te(e,t,n){var _,h,p;const a=X(n),r="#999999",i=Q(r),c=k.length,o=ee(a,f=>k[f%c],r),l=ee(a,f=>Q(k[f%c]),i),s=`${t}fill`,u=`${t}line`,d=`${t}point`;try{(_=e.getLayer)!=null&&_.call(e,s)&&(e.setPaintProperty(s,"fill-color",o),e.setPaintProperty(s,"fill-outline-color",l)),(h=e.getLayer)!=null&&h.call(e,u)&&e.setPaintProperty(u,"line-color",l),(p=e.getLayer)!=null&&p.call(e,d)&&(e.setPaintProperty(d,"circle-radius",ce),e.setPaintProperty(d,"circle-stroke-width",ie),e.setPaintProperty(d,"circle-color",o),e.setPaintProperty(d,"circle-stroke-color","#ffffff"))}catch{}}const Ie="#999999",ne="Belirtilmemiş";function He(e){const t=X(e),n=k.length,a=new Map;t.forEach((o,l)=>{a.set(o,k[l%n])});const r=new Map;for(const o of t)r.set(o,0);let i=0;for(const o of e.features??[]){const l=D(o.properties??{});l===null?i+=1:r.set(l,(r.get(l)??0)+1)}const c=t.map(o=>({label:o,color:a.get(o),count:r.get(o)??0}));return i>0&&c.push({label:ne,color:Ie,count:i}),c.sort((o,l)=>l.count!==o.count?l.count-o.count:o.label.localeCompare(l.label,"tr")),c}const $=5;function R(e,t){const n=document.createElement("ul");n.className="nc_chatpanel_legend_list";for(const{label:a,color:r,count:i}of e){const c=document.createElement("li");c.className="nc_chatpanel_legend_row nc_chatpanel_legend_row_hover";const o=document.createElement("span");o.className="nc_chatpanel_legend_swatch",o.style.backgroundColor=r,o.setAttribute("aria-hidden","true");const l=document.createElement("span");l.className="nc_chatpanel_legend_label",l.textContent=`${a} (${i})`,c.appendChild(o),c.appendChild(l),qe(c,t,a),n.appendChild(c)}return n}function De(e,t){const n=document.createElement("div");n.className="nc_chatpanel_legend";const a=document.createElement("div");if(a.className="nc_chatpanel_legend_heading",a.textContent="Lejant",n.appendChild(a),e.length<=$)return n.appendChild(R(e,t)),n;const r=e.slice(0,$),i=e.slice($);n.appendChild(R(r,t));const c=R(i,t),o=`nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;c.id=o,c.classList.add("nc_chatpanel_legend_list_extra"),c.hidden=!0,n.appendChild(c);const l=document.createElement("button");l.type="button",l.className="btn btn-link btn-sm nc_chatpanel_legend_expand_btn",l.setAttribute("aria-expanded","false"),l.setAttribute("aria-controls",o);const s=i.length;return l.textContent=`+ ${s} kategori daha`,l.addEventListener("click",()=>{c.hidden=!c.hidden;const u=!c.hidden;l.setAttribute("aria-expanded",String(u)),l.textContent=u?"Daha az göster":`+ ${s} kategori daha`;const d=n.closest("#nc_chatpanel_messages");d&&y(d)}),n.appendChild(l),n}function E(e,t){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){t.push([e[0],e[1]]);return}for(const n of e)E(n,t)}}function $e(e,t){const n=D(e.properties??{});return t===ne?n===null:n===t}function Re(e){const t=[];if(E(e,t),t.length===0)return null;let n=0,a=0;for(const[r,i]of t)n+=r,a+=i;return[n/t.length,a/t.length]}function ae(e){if(!e)return[];const t=e.type;if(t==="Point"){const n=e.coordinates;return Array.isArray(n)&&n.length>=2&&typeof n[0]=="number"&&Number.isFinite(n[0])&&typeof n[1]=="number"&&Number.isFinite(n[1])?[[n[0],n[1]]]:[]}if(t==="MultiPoint"){const n=[];return E(e.coordinates,n),n}if(t==="LineString"||t==="Polygon"||t==="MultiLineString"||t==="MultiPolygon"){const n=Re(e.coordinates);return n?[n]:[]}if(t==="GeometryCollection"&&Array.isArray(e.geometries)){const n=[];for(const a of e.geometries)n.push(...ae(a));return n}return[]}const z="__ncChatPanelLegendHoverMarkers";function M(e){var n;const t=e==null?void 0:e[z];if(Array.isArray(t))for(const a of t)try{(n=a.remove)==null||n.call(a)}catch{}e&&typeof e=="object"&&(e[z]=[])}function ze(e,t,n){M(e);const a=A();if(!(a!=null&&a.Marker))return;const r=[];for(const i of t.features??[])if($e(i,n)){for(const c of ae(i.geometry))if(c.every(o=>typeof o=="number"&&Number.isFinite(o)))try{const o=new a.Marker;o.setLngLat(c),o.addTo(e),r.push(o)}catch{}}e[z]=r}function qe(e,t,n){e.addEventListener("mouseenter",()=>{const a=b();a&&ze(a,t,n)}),e.addEventListener("mouseleave",()=>{const a=b();a&&M(a)})}function re(e,t){const n=A();if(!(n!=null&&n.LngLatBounds))return;const a=[];for(const i of t.features??[]){const c=i==null?void 0:i.geometry;if(c){if(c.type==="GeometryCollection"&&Array.isArray(c.geometries)){for(const o of c.geometries)E(o==null?void 0:o.coordinates,a);continue}E(c.coordinates,a)}}if(a.length===0)return;const r=a.reduce((i,c)=>i.extend(c),new n.LngLatBounds(a[0],a[0]));e.fitBounds(r,{padding:48,duration:700,maxZoom:18})}function oe(e,t){const n=e.__ncChatPanelAnim??{};typeof n.rafId=="number"&&cancelAnimationFrame(n.rafId);const a=`${t}fill`,r=`${t}line`,i=`${t}point`,c=performance.now(),o=()=>{var h,p,f;const l=(performance.now()-c)/1e3*Math.PI*2*.55,s=.5+.5*Math.sin(l),u=.15+s*.2,d=.45+s*.45,_=.5+s*.5;try{(h=e.getLayer)!=null&&h.call(e,a)&&e.setPaintProperty(a,"fill-opacity",u),(p=e.getLayer)!=null&&p.call(e,r)&&e.setPaintProperty(r,"line-opacity",d),(f=e.getLayer)!=null&&f.call(e,i)&&e.setPaintProperty(i,"circle-opacity",_),n.rafId=requestAnimationFrame(o),e.__ncChatPanelAnim=n}catch{}};n.rafId=requestAnimationFrame(o),e.__ncChatPanelAnim=n}const ce=9,ie=3,Ge=["Open Sans Semibold","Arial Unicode MS Regular"],le=["step",["zoom"],!1,17,!0],se={"text-allow-overlap":le,"text-ignore-placement":le,"text-optional":!1};function Je(e,t){var n;try{if(!((n=e.getLayer)!=null&&n.call(e,t)))return;for(const[a,r]of Object.entries(se))e.setLayoutProperty(t,a,r)}catch{}}const de=["==","$type","Point"],ue="#ffffff",pe="#2d2d2d";function _e(e,t,n){var r;const a=`${n}label`;if((r=e.getLayer)!=null&&r.call(e,a)){Je(e,a);try{e.setFilter(a,de),e.setPaintProperty(a,"text-color",ue),e.setPaintProperty(a,"text-halo-color",pe)}catch{}return}e.addLayer({id:a,type:"symbol",source:t,filter:de,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...Ge],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...se},paint:{"text-color":ue,"text-halo-color":pe,"text-halo-width":1.25,"text-halo-blur":.25}})}const S="nc_chatpanel_geojson",he="nc_chatpanel_geojson_";function je(){var n;const e=b();if(!((n=e==null?void 0:e.getSource)!=null&&n.call(e,S)))return 0;const t=e.getSource(S);try{const a=typeof t.serialize=="function"?t.serialize():null,r=a==null?void 0:a.data;if((r==null?void 0:r.type)==="FeatureCollection"&&Array.isArray(r.features))return r.features.length}catch{}try{const a=t._data;if((a==null?void 0:a.type)==="FeatureCollection"&&Array.isArray(a.features))return a.features.length}catch{}return 0}function Ue(){var r,i;const e=b();if(e&&M(e),!(e!=null&&e.getLayer)||!e.removeLayer)return;const t=e.__ncChatPanelAnim;t&&typeof t.rafId=="number"&&(cancelAnimationFrame(t.rafId),t.rafId=void 0);const n=he,a=[`${n}label`,`${n}point`,`${n}line`,`${n}fill`];try{for(const c of a)(r=e.getLayer)!=null&&r.call(e,c)&&e.removeLayer(c);(i=e.getSource)!=null&&i.call(e,S)&&e.removeSource(S)}catch{}O()}function fe(e){var i;const t=b();if(!t||typeof t.addSource!="function")return;M(t);const n=S,a=he,r=(i=t.getSource)==null?void 0:i.call(t,n);if(r&&typeof r.setData=="function"){r.setData(e),_e(t,n,a),te(t,a,e),oe(t,a),re(t,e),O();return}t.addSource(n,{type:"geojson",data:e}),t.addLayer({id:`${a}fill`,type:"fill",source:n,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),t.addLayer({id:`${a}line`,type:"line",source:n,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),t.addLayer({id:`${a}point`,type:"circle",source:n,filter:["==","$type","Point"],paint:{"circle-radius":ce,"circle-color":"#22c55e","circle-stroke-width":ie,"circle-stroke-color":"#ffffff"}}),_e(t,n,a),te(t,a,e),oe(t,a),re(t,e),O()}function We(e,t){return e&&typeof e.record_count=="number"&&Number.isFinite(e.record_count)?`Sorgulama sonucunda ${e.record_count} kayıt bulundu.`:e&&typeof e.message=="string"&&e.message.trim()?e.message.trim():t.trim()?t.trim():"Yanıt alındı."}async function Ye(e,t){var l;const n=new FormData;n.append("chatInput",t);const a=await fetch(e,{method:"POST",body:n}),r=await a.text(),i=a.headers.get("content-type")??"";let c=null;if(i.toLowerCase().includes("application/json"))try{c=JSON.parse(r)}catch{c=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:a.status,contentType:i,body:c??r});const o=c;return o!=null&&o.ok&&((l=o.geojson)==null?void 0:l.type)==="FeatureCollection"&&fe(o.geojson),We(o,r)}function y(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}function m(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function P(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ke(e){try{const t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleString("tr-TR",{dateStyle:"medium",timeStyle:"short"})}catch{return e}}function Ze(e){const t=e.querySelector("#nc_chatpanel_haberler_body"),n=e.querySelector("#nc_chatpanel_sosyal_body"),a='<p class="nc_chatpanel_hint mb-0">Yükleniyor…</p>';t&&(t.innerHTML=a),n&&(n.innerHTML=a)}function be(e,t){const n=e.querySelector("#nc_chatpanel_haberler_body"),a=e.querySelector("#nc_chatpanel_sosyal_body");if(!n||!a)return;const r='<p class="nc_chatpanel_hint mb-0">Gösterilecek içerik yok.</p>';if(!P(t)){n.innerHTML=r,a.innerHTML=r;return}const i=t.twitter,c=t.news;if(Array.isArray(i)&&i.length>0){const l=['<div class="nc_chatpanel_tweet_list">'];for(const s of i){if(!P(s))continue;const u=typeof s.text=="string"?s.text:"",d=typeof s.created_at=="string"?s.created_at:"",_=d?Ke(d):"",h=m(u).replace(/\n/g,"<br />");l.push(`<article class="nc_chatpanel_tweet_card">
        <div class="nc_chatpanel_tweet_meta">${m(_)}</div>
        <div class="nc_chatpanel_tweet_text">${h}</div>
      </article>`)}l.push("</div>"),a.innerHTML=l.join("")}else a.innerHTML=r;let o=[];if(P(c)&&Array.isArray(c.haberler)&&(o=c.haberler),o.length>0){const l=['<div class="nc_chatpanel_haber_list">'];for(const s of o){if(!P(s))continue;const u=typeof s.baslik=="string"?s.baslik:"",d=typeof s.tarih=="string"?s.tarih:"",_=typeof s.yer=="string"?s.yer:"",h=typeof s.kisa_aciklama=="string"?s.kisa_aciklama:"",p=[d,_].filter(Boolean),f=p.length>0?`<div class="nc_chatpanel_haber_meta">${m(p.join(" · "))}</div>`:"";l.push(`<article class="nc_chatpanel_haber_card">
        <h3 class="nc_chatpanel_haber_title">${m(u)}</h3>
        ${f}
        <p class="nc_chatpanel_haber_desc">${m(h)}</p>
      </article>`)}l.push("</div>"),n.innerHTML=l.join("")}else n.innerHTML=r}function me(e){const t=[],n=/\[([^\]]*)\]/g;let a=0,r;for(;(r=n.exec(e))!==null;){t.push(m(e.slice(a,r.index)));const c=(r[1]??"").trim();if(c.length===0)t.push(m(r[0]));else{const o=m(c);t.push(`<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${o}" title="${o}">${o}</a>`)}a=r.index+r[0].length}return t.push(m(e.slice(a))),t.join("")}function q(e,t){e.innerHTML=me(t)}function w(e){e.dataset.ncBracketCatDelegated!=="true"&&(e.dataset.ncBracketCatDelegated="true",e.addEventListener("click",t=>{var i;const n=t.target,a=(i=n==null?void 0:n.closest)==null?void 0:i.call(n,"a.nc_chatpanel_msg_catlink");if(!a)return;t.preventDefault();const r=a.getAttribute("data-cat")??"";console.log("[chatpanel] kategori linki",r)}))}function Ve(e){if(!e.getElementById("nc_chatpanel_bootstrap_css")){const n=document.createElement("link");n.id="nc_chatpanel_bootstrap_css",n.rel="stylesheet",n.href=Ee,e.appendChild(n)}if(e.getElementById("nc_chatpanel_styles"))return;const t=document.createElement("style");t.id="nc_chatpanel_styles",t.textContent=`
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
    .nc_chatpanel_tabbar {
      flex-shrink: 0;
      display: flex;
      background: #fff;
      border-bottom: 1px solid #dee2e6;
    }
    .nc_chatpanel_tab_btn {
      flex: 1;
      margin: 0;
      border: none;
      border-bottom: 2px solid transparent;
      background: #e9ecef;
      padding: 8px 10px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #495057;
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease;
    }
    .nc_chatpanel_tab_btn:hover {
      background: #f1f3f5;
    }
    .nc_chatpanel_tab_btn.nc_chatpanel_tab_btn--active {
      background: #fff;
      color: #0d6efd;
      border-bottom-color: #0d6efd;
    }
    .nc_chatpanel_tab_panes {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .nc_chatpanel_tab_pane {
      display: none;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }
    .nc_chatpanel_tab_pane.nc_chatpanel_tab_pane--active {
      display: flex;
    }
    .nc_chatpanel_tab_secondary_scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px;
      background: #f8f9fa;
      font-size: 0.875rem;
      line-height: 1.45;
      color: #212529;
    }
    .nc_chatpanel_haber_list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .nc_chatpanel_haber_card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 10px 12px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .nc_chatpanel_haber_title {
      font-weight: 600;
      font-size: 0.9rem;
      margin: 0 0 6px 0;
      color: #0d6efd;
      line-height: 1.35;
    }
    .nc_chatpanel_haber_meta {
      font-size: 0.75rem;
      color: #6c757d;
      margin-bottom: 8px;
      line-height: 1.35;
    }
    .nc_chatpanel_haber_desc {
      font-size: 0.82rem;
      margin: 0;
      color: #212529;
      line-height: 1.45;
    }
    .nc_chatpanel_tweet_list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .nc_chatpanel_tweet_card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 10px 12px;
    }
    .nc_chatpanel_tweet_meta {
      font-size: 0.72rem;
      color: #6c757d;
      margin-bottom: 8px;
    }
    .nc_chatpanel_tweet_text {
      font-size: 0.82rem;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      line-height: 1.45;
      color: #212529;
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
    .nc_chatpanel_magnifier_scroll {
      max-height: 200px;
      overflow-y: auto;
      overflow-x: hidden;
      font-size: 0.8rem;
      line-height: 1.4;
      color: #212529;
      padding-right: 6px;
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
  `,e.appendChild(t)}function Xe(){return`
    <div class="nc_chatpanel_header bg-primary text-white px-3 py-2">NEco Keos AI</div>
    <div class="nc_chatpanel_tabbar" role="tablist" aria-label="Panel sekmeleri">
      <button
        type="button"
        class="nc_chatpanel_tab_btn nc_chatpanel_tab_btn--active"
        id="nc_chatpanel_tab_btn_kentrehberi"
        role="tab"
        aria-selected="true"
        aria-controls="nc_chatpanel_tab_panel_kentrehberi"
        data-nc-tab="kentrehberi"
      >
        Kent rehberi
      </button>
      <button
        type="button"
        class="nc_chatpanel_tab_btn"
        id="nc_chatpanel_tab_btn_haberler"
        role="tab"
        aria-selected="false"
        aria-controls="nc_chatpanel_tab_panel_haberler"
        data-nc-tab="haberler"
      >
        Haberler
      </button>
      <button
        type="button"
        class="nc_chatpanel_tab_btn"
        id="nc_chatpanel_tab_btn_sosyal"
        role="tab"
        aria-selected="false"
        aria-controls="nc_chatpanel_tab_panel_sosyal"
        data-nc-tab="sosyal"
      >
        Sosyal medya
      </button>
    </div>
    <div class="nc_chatpanel_tab_panes">
      <div
        class="nc_chatpanel_tab_pane nc_chatpanel_tab_pane--active"
        id="nc_chatpanel_tab_panel_kentrehberi"
        role="tabpanel"
        aria-labelledby="nc_chatpanel_tab_btn_kentrehberi"
      >
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
            class="btn btn-outline-primary btn-sm nc_chatpanel_map_circle_btn"
            id="nc_chatpanel_map_circle_btn"
            title="Harita büyüteci: fareyle yakınlaştırılmış görünüm"
            aria-label="Harita büyüteci"
            aria-pressed="false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
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
        <div class="nc_chatpanel_messages" id="nc_chatpanel_messages"></div>
        <form class="nc_chatpanel_form p-2" id="nc_chatpanel_form" autocomplete="off">
          <div class="input-group input-group-sm">
            <input class="form-control" id="nc_chatpanel_input" type="text" placeholder="Mesaj yazın…" />
            <button class="btn btn-primary" type="submit">Gönder</button>
          </div>
        </form>
      </div>
      <div
        class="nc_chatpanel_tab_pane"
        id="nc_chatpanel_tab_panel_haberler"
        role="tabpanel"
        aria-labelledby="nc_chatpanel_tab_btn_haberler"
      >
        <div class="nc_chatpanel_tab_secondary_scroll" id="nc_chatpanel_haberler_body"></div>
      </div>
      <div
        class="nc_chatpanel_tab_pane"
        id="nc_chatpanel_tab_panel_sosyal"
        role="tabpanel"
        aria-labelledby="nc_chatpanel_tab_btn_sosyal"
      >
        <div class="nc_chatpanel_tab_secondary_scroll" id="nc_chatpanel_sosyal_body"></div>
      </div>
    </div>
  `}function Qe(e,t){const n=e.querySelector("#nc_chatpanel_form"),a=e.querySelector("#nc_chatpanel_input"),r=e.querySelector("#nc_chatpanel_messages");if(!n||!a||!r||n.dataset.ncBoundChat==="true")return;n.dataset.ncBoundChat="true",w(r);const i=(c,o)=>{const l=document.createElement("div");return l.className=`nc_chatpanel_msg ${c==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof o=="string"?l.textContent=o:l.appendChild(o),r.appendChild(l),y(r),l};n.addEventListener("submit",c=>{c.preventDefault();const o=a.value.trim();if(!o)return;i("user",o),a.value="",a.disabled=!0,I();const l=document.createElement("span");l.className="nc_chatpanel_typing",l.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const s=i("ai",l);Ye(t,o).then(u=>{q(s,u),y(r)}).catch(u=>{console.error("[chatpanel] n8n istek hatası",u),s.textContent="Sorgu sırasında hata oluştu.",y(r)}).finally(()=>{H(),a.disabled=!1,a.focus()})})}function ye(){var l,s;const e=b();if(!(e!=null&&e.getBounds))return null;const t=e.getBounds(),n=(l=t.getSouthWest)==null?void 0:l.call(t),a=(s=t.getNorthEast)==null?void 0:s.call(t);if(!n||!a)return null;const r=typeof n.lng=="number"?n.lng:n.lon,i=typeof n.lat=="number"?n.lat:n.y,c=typeof a.lng=="number"?a.lng:a.lon,o=typeof a.lat=="number"?a.lat:a.y;return[r,i,c,o].every(u=>typeof u=="number"&&Number.isFinite(u))?[r,i,c,o]:null}function G(){var e;if(!(typeof document>"u")){try{C==null||C()}catch{}C=null,x=null,(e=document.getElementById(N))==null||e.remove()}}function et(){if(typeof document>"u")return!1;const e=window.maplibregl,t=b();if(!(e!=null&&e.Map)||!(t!=null&&t.getContainer)||typeof t.unproject!="function")return!1;G();const n=t.getContainer(),a=window.getComputedStyle(n).position;(a==="static"||a==="")&&(n.style.position="relative");const r=document.createElement("div");r.id=N,r.setAttribute("aria-hidden","true"),r.style.cssText="position:absolute;inset:0;pointer-events:none;z-index:6;overflow:visible;";const i=document.createElement("div");i.className="nc_map_magnify_lens",i.style.cssText=["position:absolute","display:none",`width:${Z}px`,`height:${Z}px`,"border-radius:50%","overflow:hidden","box-sizing:border-box","border:3px solid rgba(13,110,253,0.95)","box-shadow:0 0 0 2px rgba(255,255,255,0.85),0 8px 28px rgba(0,0,0,0.22)","pointer-events:none","transform:translate(-50%,-50%)","left:0","top:0"].join(";");const c=document.createElement("div");c.className="nc_map_magnify_lens_map",c.style.cssText="width:100%;height:100%;position:relative;",i.appendChild(c),r.appendChild(i),n.appendChild(r);let o;try{const p=t.getCenter();o=new e.Map({container:c,style:t.getStyle(),center:[p.lng,p.lat],zoom:Math.min(t.getZoom()+T,22),bearing:t.getBearing(),pitch:t.getPitch(),interactive:!1,attributionControl:!1,maxZoom:24})}catch(p){return console.warn("[chatpanel] Büyüteç mini harita oluşturulamadı",p),r.remove(),!1}let l=null;const s=()=>{if(!l)return;const p=t.unproject([l.x,l.y]);o.jumpTo({center:[p.lng,p.lat],zoom:Math.min(t.getZoom()+T,22),bearing:t.getBearing(),pitch:t.getPitch()})},u=p=>{const f=p;f.point&&(l={x:f.point.x,y:f.point.y},i.style.left=`${f.point.x}px`,i.style.top=`${f.point.y}px`,i.style.display="block",s())},d=()=>{s(),o.resize()},_=()=>{i.style.display="none",l=null};return x=()=>{try{const p=t.getStyle();if(!p)return;o.setStyle(p,{diff:!0})}catch{try{o.setStyle(t.getStyle())}catch(p){console.warn("[chatpanel] Büyüteç stil senkronu başarısız",p)}}if(l)s();else{const p=t.getCenter();o.jumpTo({center:[p.lng,p.lat],zoom:Math.min(t.getZoom()+T,22),bearing:t.getBearing(),pitch:t.getPitch()})}try{o.resize()}catch{}},t.on("mousemove",u),t.on("move",d),t.on("zoom",d),t.on("rotate",d),t.on("pitch",d),n.addEventListener("mouseleave",_),window.requestAnimationFrame(()=>{try{o.resize()}catch{}}),C=()=>{x=null,t.off("mousemove",u),t.off("move",d),t.off("zoom",d),t.off("rotate",d),t.off("pitch",d),n.removeEventListener("mouseleave",_);try{o.remove()}catch{}},!0}function J(e,t){const n=typeof document<"u"&&!!document.getElementById(N),a=!!t.querySelector('[data-nc-magnifier-panel="true"]'),r=n||a;e.classList.toggle("btn-primary",r),e.classList.toggle("btn-outline-primary",!r),e.setAttribute("aria-pressed",r?"true":"false")}function ge(e){var t;(t=e.querySelector('[data-nc-magnifier-panel="true"]'))==null||t.remove()}function tt(e,t){const n=e.querySelector("#nc_chatpanel_messages");if(!n)return;ge(e),w(n),je();const a=document.createElement("div");a.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend",a.setAttribute("data-nc-magnifier-panel","true");const r=document.createElement("div");r.className="nc_chatpanel_legend_intro",r.textContent="Büyüteç";const i=document.createElement("div");i.className="nc_chatpanel_legend";const c=document.createElement("div");c.className="nc_chatpanel_legend_heading",c.textContent="";const o=document.createElement("div");o.className="nc_chatpanel_magnifier_scroll";const l=document.createElement("p");l.className="nc_chatpanel_hint mb-0",l.textContent=t?"Haritada fareyi hareket ettirdiğinizde merkezdeki yuvarlak lens, o noktayı yakınlaştırılmış gösterir; haritayı normal şekilde kaydırabilirsiniz. Büyüteci kapatmak için aynı düğmeye tekrar basın.":"Harita veya maplibregl bulunamadığı için lens gösterilemedi. Sayfayı yenileyip tekrar deneyin.",o.appendChild(l),i.appendChild(c),i.appendChild(o),a.appendChild(r),a.appendChild(i),n.appendChild(a),y(n)}function xe(e){const t=e.querySelector("#nc_chatpanel_map_circle_btn");t&&t.dataset.ncBoundMapCircle!=="true"&&(t.dataset.ncBoundMapCircle="true",J(t,e),t.addEventListener("click",()=>{const n=!!document.getElementById(N),a=!!e.querySelector('[data-nc-magnifier-panel="true"]');if(n||a)G(),ge(e);else{const i=et();i||console.warn("[chatpanel] Harita veya maplibregl yok; büyüteç açılamadı."),tt(e,i)}J(t,e)}))}const nt=100;async function at(e,t){var r;if(!t)return;const n=i=>{w(t);const c=document.createElement("div");c.className="nc_chatpanel_msg nc_chatpanel_msg_ai",q(c,i),t.appendChild(c),y(t)},a=(i,c)=>{w(t);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const l=document.createElement("div");l.className="nc_chatpanel_legend_intro",l.innerHTML=me(i),o.appendChild(l);const s=He(c);s.length>0&&o.appendChild(De(s,c)),t.appendChild(o),y(t)};try{const i=ye();if(!i){console.warn("[chatpanel] Harita bbox alınamadı."),n("Harita alanı okunamadı.");return}const c=`${e}/db/kentrehberi_poi/features-by-bbox`,o=await fetch(c,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:i})});let l=null;try{l=await o.json()}catch{l=null}const s=l;if(!o.ok){const d=s&&typeof s.error=="string"?s.error:`HTTP ${o.status}`;n(`Kayıtlar yüklenemedi: ${d}`);return}const u=s==null?void 0:s.geojson;if(u&&u.type==="FeatureCollection"){fe(u);const d=typeof s.record_count=="number"&&Number.isFinite(s.record_count)?s.record_count:((r=u.features)==null?void 0:r.length)??0;a(`Haritaya ${d} kayıt eklendi`,u),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:c,record_count:d})}else n("GeoJSON yanıtı alınamadı.")}catch(i){console.error("[chatpanel] features-by-bbox hata",i),n("Kayıtlar yüklenirken hata oluştu.")}}function rt(e){G();const t=e.querySelector("#nc_chatpanel_map_circle_btn");t&&J(t,e);const n=e.querySelector("#nc_chatpanel_messages"),a=e.querySelector("#nc_chatpanel_input");n&&n.replaceChildren(),a&&(a.value="",a.disabled=!1),Ue(),j(e),n&&(n.scrollTop=0)}function ve(e){const t=e.querySelector("#nc_chatpanel_clear_btn");t&&t.dataset.ncBoundClear!=="true"&&(t.dataset.ncBoundClear="true",t.addEventListener("click",()=>{rt(e),console.log("[chatpanel] panel temizlendi")}))}function ot(e){if(typeof localStorage>"u")return null;try{const t=localStorage.getItem(Y);if(!t)return null;const n=JSON.parse(t);return typeof n.ts!="number"||typeof n.endpoint!="string"||n.endpoint!==e||Date.now()-n.ts>Ne?null:n}catch{return null}}function ct(e){if(!(typeof localStorage>"u"))try{const t={ts:Date.now(),endpoint:e.endpoint,status:e.status,data:e.data};localStorage.setItem(Y,JSON.stringify(t))}catch{}}async function we(e,t,n){const a=Te(t),r=ot(a);if(r){console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:r.status,data:r.data,fromCache:!0,cachedAt:new Date(r.ts).toISOString()}),be(e,r.data);return}Ze(e);try{const i=new FormData;i.append("chatInput","haberler");const c=await fetch(a,{method:"POST",body:i}),o=await c.text();let l=o;try{l=JSON.parse(o)}catch{}console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:c.status,data:l}),c.ok&&ct({endpoint:a,status:c.status,data:l}),be(e,l)}catch(i){console.error("[chatpanel] n8n news istek hatası",n,i);const c='<p class="nc_chatpanel_hint mb-0">Haberler yüklenirken hata oluştu.</p>',o=e.querySelector("#nc_chatpanel_haberler_body"),l=e.querySelector("#nc_chatpanel_sosyal_body");o&&(o.innerHTML=c),l&&(l.innerHTML=c)}}function Ce(e,t){const n=e.querySelector(".nc_chatpanel_tabbar");if(!n||n.dataset.ncBoundTabs==="true")return;n.dataset.ncBoundTabs="true";const a=e.querySelector("#nc_chatpanel_tab_btn_kentrehberi"),r=e.querySelector("#nc_chatpanel_tab_btn_haberler"),i=e.querySelector("#nc_chatpanel_tab_btn_sosyal"),c=e.querySelector("#nc_chatpanel_tab_panel_kentrehberi"),o=e.querySelector("#nc_chatpanel_tab_panel_haberler"),l=e.querySelector("#nc_chatpanel_tab_panel_sosyal");if(!a||!r||!i||!c||!o||!l)return;const s=[{id:"kentrehberi",btn:a,panel:c},{id:"haberler",btn:r,panel:o},{id:"sosyal",btn:i,panel:l}];let u="kentrehberi";const d=_=>{for(const h of s){const p=h.id===_;h.btn.classList.toggle("nc_chatpanel_tab_btn--active",p),h.btn.setAttribute("aria-selected",p?"true":"false"),h.panel.classList.toggle("nc_chatpanel_tab_pane--active",p)}};for(const _ of s)_.btn.addEventListener("click",()=>{_.id!==u&&(u=_.id,d(_.id),(_.id==="haberler"||_.id==="sosyal")&&we(e,t,`sekme:${_.id}`))})}function Le(e,t){const n=e.querySelector("#nc_chatpanel_news_btn");n&&n.dataset.ncBoundNews!=="true"&&(n.dataset.ncBoundNews="true",n.addEventListener("click",async()=>{if(!n.disabled){n.disabled=!0;try{await we(e,t,"toolbar")}finally{n.disabled=!1}}}))}function ke(e,t){const n=e.querySelector("#nc_chatpanel_wisart_btn"),a=e.querySelector("#nc_chatpanel_messages");if(!n||n.dataset.ncBoundWisart==="true")return;n.dataset.ncBoundWisart="true";const r=i=>{if(!a)return;w(a);const c=document.createElement("div");c.className="nc_chatpanel_msg nc_chatpanel_msg_ai",q(c,i),a.appendChild(c),y(a)};n.addEventListener("click",async()=>{if(n.disabled)return;n.disabled=!0;const i=n.innerHTML;n.innerHTML='<span aria-hidden="true">...</span>',I();let c=!1;try{const o=ye();if(!o){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}c=!0;const l=`${t}/n8n/kentrehberi`,s=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:o,faaliyet:"cami"})}),u=await s.text();let d=null;try{d=JSON.parse(u)}catch{d=u}if(console.log("[chatpanel] kentrehberi sonuç",{endpoint:l,status:s.status,data:d}),typeof d=="string")r(d);else if(d&&typeof d=="object"){const _=d.message;typeof _=="string"&&_.trim()?r(_.trim()):r(JSON.stringify(d))}else r(String(d))}catch(o){console.error("[chatpanel] WISART hata",o),r("WISART isteğinde hata oluştu.")}finally{H(),n.disabled=!1,n.innerHTML=i,c&&window.setTimeout(()=>{at(t,a)},nt)}})}function j(e){const t=e.querySelector("#nc_chatpanel_messages");if(!t||(w(t),t.querySelector('[data-nc-welcome-ai="true"]')))return;const n=document.createElement("div");n.className="nc_chatpanel_msg nc_chatpanel_msg_ai",n.setAttribute("data-nc-welcome-ai","true"),n.textContent=Me,t.prepend(n)}function U(e={}){const{container:t=document.body}=e;let n=document.getElementById(W);const a=Be(e),r=Fe(e),i=Oe(e);if(B=a??null,n){a&&n.setAttribute("data-nc-map-instance",a);const l=n.shadowRoot;return l&&(Ce(l,r),ke(l,i),Le(l,r),xe(l),ve(l),j(l)),n}n=document.createElement("div"),n.id=W,n.className="nc_chatpanel_root",n.setAttribute("data-nc-chatpanel","true"),a&&n.setAttribute("data-nc-map-instance",a);const c=n.attachShadow({mode:"open"});Ve(c);const o=document.createElement("div");return o.className="nc_chatpanel_shell",o.innerHTML=Xe(),c.appendChild(o),t.appendChild(n),Qe(c,r),Ce(c,r),ke(c,i),Le(c,r),xe(c),ve(c),j(c),n}const it={init:e=>U(e??{}),getMapInstanceName:()=>B,getRegisteredMap:b,getMaplibre:A};window.ChatPanel=it;function lt(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if(lt()){const e=()=>U({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return g.getMaplibre=A,g.getRegisteredMap=b,g.hideSearchScanOverlay=H,g.initChatPanel=U,g.showSearchScanOverlay=I,Object.defineProperty(g,Symbol.toStringTag,{value:"Module"}),g}({});
