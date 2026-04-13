var ChatPanel=function(w){"use strict";const Q="nc_search_scan_styles",B="nc_search_scan_overlay";let L=0,v=null;function Ie(){if(typeof document>"u"||document.getElementById(Q))return;const e=document.createElement("style");e.id=Q,e.textContent=`
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
  `,document.head.appendChild(e)}function O(){if(typeof document>"u"||(Ie(),L+=1,L>1))return;const e=document.getElementById(B);if(e){v=e,e.classList.remove("nc_search_scan_overlay--exit"),e.style.opacity="1";return}const t=document.createElement("div");t.id=B,t.className="nc_search_scan_overlay",t.setAttribute("aria-hidden","true");const n=document.createElement("div");n.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",t.appendChild(n),t.appendChild(a),document.body.appendChild(t),v=t}function I(){if(typeof document>"u"||(L=Math.max(0,L-1),L>0))return;const e=v??document.getElementById(B);if(!e){v=null;return}e.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{e.remove(),v===e&&(v=null)},420)}function y(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}function m(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function N(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const ee="nc_chatpanel_root",He="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";let H=null;function g(){var t;const e=H;return!e||typeof window>"u"?null:((t=window.__ncMapRegistry__)==null?void 0:t[e])??null}function M(){return window.maplibregl}const De="http://localhost:3001/api/n8n",$e="http://localhost:3001/api",te="nc_chatpanel_n8n_news_v1",Re=60*60*1e3,qe="Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?",T="nc_map_magnify_lens_root",ne=252,D=2.5,ze=500;let E=null,C=null;function $(){try{C==null||C()}catch{}}function Ge(e){var r,i;const t=(r=e.mapInstanceName)==null?void 0:r.trim();if(t)return t;if(typeof document>"u")return;const n=document.currentScript,a=(i=n==null?void 0:n.getAttribute("data-map-instance"))==null?void 0:i.trim();if(a)return a}function Je(e){var n,a;const t=(n=e.n8nProxyUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,i=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(i)return i}return De}function je(e){return`${e.replace(/\/$/,"")}/news`}function Ue(e){var n,a;const t=(n=e.dbApiUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,i=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(i)return i}return $e}const S=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function ae(e){if(e==null)return null;const t=String(e).trim();return t.length>0?t:null}function R(e){const t=ae(e.faaliyet_adi);return t!==null?t:ae(e["faaliyet-adi"])}function re(e){const t=new Set;for(const n of e.features??[]){const a=R(n.properties??{});a!==null&&t.add(a)}return Array.from(t).sort((n,a)=>n.localeCompare(a,"tr"))}function oe(e){if(e.startsWith("#")&&e.length===7){const t=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(1,3),16)*.78))),n=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(5,7),16)*.78)));return`#${t.toString(16).padStart(2,"0")}${n.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return e}function ce(e,t,n){if(e.length===0)return n;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<e.length;r++)a.push(e[r],t(r));return a.push(n),a}function ie(e,t,n){var p,h,b;const a=re(n),r="#999999",i=oe(r),o=S.length,c=ce(a,f=>S[f%o],r),l=ce(a,f=>oe(S[f%o]),i),s=`${t}fill`,d=`${t}line`,u=`${t}point`;try{(p=e.getLayer)!=null&&p.call(e,s)&&(e.setPaintProperty(s,"fill-color",c),e.setPaintProperty(s,"fill-outline-color",l)),(h=e.getLayer)!=null&&h.call(e,d)&&e.setPaintProperty(d,"line-color",l),(b=e.getLayer)!=null&&b.call(e,u)&&(e.setPaintProperty(u,"circle-radius",pe),e.setPaintProperty(u,"circle-stroke-width",_e),e.setPaintProperty(u,"circle-color",c),e.setPaintProperty(u,"circle-stroke-color","#ffffff"))}catch{}}const We="#999999",le="Belirtilmemiş";function Ye(e){const t=re(e),n=S.length,a=new Map;t.forEach((c,l)=>{a.set(c,S[l%n])});const r=new Map;for(const c of t)r.set(c,0);let i=0;for(const c of e.features??[]){const l=R(c.properties??{});l===null?i+=1:r.set(l,(r.get(l)??0)+1)}const o=t.map(c=>({label:c,color:a.get(c),count:r.get(c)??0}));return i>0&&o.push({label:le,color:We,count:i}),o.sort((c,l)=>l.count!==c.count?l.count-c.count:c.label.localeCompare(l.label,"tr")),o}const q=5;function z(e,t){const n=document.createElement("ul");n.className="nc_chatpanel_legend_list";for(const{label:a,color:r,count:i}of e){const o=document.createElement("li");o.className="nc_chatpanel_legend_row nc_chatpanel_legend_row_hover";const c=document.createElement("span");c.className="nc_chatpanel_legend_swatch",c.style.backgroundColor=r,c.setAttribute("aria-hidden","true");const l=document.createElement("span");l.className="nc_chatpanel_legend_label",l.textContent=`${a} (${i})`,o.appendChild(c),o.appendChild(l),Qe(o,t,a),n.appendChild(o)}return n}function Ke(e,t){const n=document.createElement("div");n.className="nc_chatpanel_legend";const a=document.createElement("div");if(a.className="nc_chatpanel_legend_heading",a.textContent="Lejant",n.appendChild(a),e.length<=q)return n.appendChild(z(e,t)),n;const r=e.slice(0,q),i=e.slice(q);n.appendChild(z(r,t));const o=z(i,t),c=`nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;o.id=c,o.classList.add("nc_chatpanel_legend_list_extra"),o.hidden=!0,n.appendChild(o);const l=document.createElement("button");l.type="button",l.className="btn btn-link btn-sm nc_chatpanel_legend_expand_btn",l.setAttribute("aria-expanded","false"),l.setAttribute("aria-controls",c);const s=i.length;return l.textContent=`+ ${s} kategori daha`,l.addEventListener("click",()=>{o.hidden=!o.hidden;const d=!o.hidden;l.setAttribute("aria-expanded",String(d)),l.textContent=d?"Daha az göster":`+ ${s} kategori daha`;const u=n.closest("#nc_chatpanel_messages");u&&y(u)}),n.appendChild(l),n}function A(e,t){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){t.push([e[0],e[1]]);return}for(const n of e)A(n,t)}}function Ze(e,t){const n=R(e.properties??{});return t===le?n===null:n===t}function Ve(e){const t=[];if(A(e,t),t.length===0)return null;let n=0,a=0;for(const[r,i]of t)n+=r,a+=i;return[n/t.length,a/t.length]}function se(e){if(!e)return[];const t=e.type;if(t==="Point"){const n=e.coordinates;return Array.isArray(n)&&n.length>=2&&typeof n[0]=="number"&&Number.isFinite(n[0])&&typeof n[1]=="number"&&Number.isFinite(n[1])?[[n[0],n[1]]]:[]}if(t==="MultiPoint"){const n=[];return A(e.coordinates,n),n}if(t==="LineString"||t==="Polygon"||t==="MultiLineString"||t==="MultiPolygon"){const n=Ve(e.coordinates);return n?[n]:[]}if(t==="GeometryCollection"&&Array.isArray(e.geometries)){const n=[];for(const a of e.geometries)n.push(...se(a));return n}return[]}const G="__ncChatPanelLegendHoverMarkers";function F(e){var n;const t=e==null?void 0:e[G];if(Array.isArray(t))for(const a of t)try{(n=a.remove)==null||n.call(a)}catch{}e&&typeof e=="object"&&(e[G]=[])}function Xe(e,t,n){F(e);const a=M();if(!(a!=null&&a.Marker))return;const r=[];for(const i of t.features??[])if(Ze(i,n)){for(const o of se(i.geometry))if(o.every(c=>typeof c=="number"&&Number.isFinite(c)))try{const c=new a.Marker;c.setLngLat(o),c.addTo(e),r.push(c)}catch{}}e[G]=r}function Qe(e,t,n){e.addEventListener("mouseenter",()=>{const a=g();a&&Xe(a,t,n)}),e.addEventListener("mouseleave",()=>{const a=g();a&&F(a)})}function de(e,t){const n=M();if(!(n!=null&&n.LngLatBounds))return;const a=[];for(const i of t.features??[]){const o=i==null?void 0:i.geometry;if(o){if(o.type==="GeometryCollection"&&Array.isArray(o.geometries)){for(const c of o.geometries)A(c==null?void 0:c.coordinates,a);continue}A(o.coordinates,a)}}if(a.length===0)return;const r=a.reduce((i,o)=>i.extend(o),new n.LngLatBounds(a[0],a[0]));e.fitBounds(r,{padding:48,duration:700,maxZoom:18})}function ue(e,t){const n=e.__ncChatPanelAnim??{};typeof n.rafId=="number"&&cancelAnimationFrame(n.rafId);const a=`${t}fill`,r=`${t}line`,i=`${t}point`,o=performance.now(),c=()=>{var h,b,f;const l=(performance.now()-o)/1e3*Math.PI*2*.55,s=.5+.5*Math.sin(l),d=.15+s*.2,u=.45+s*.45,p=.5+s*.5;try{(h=e.getLayer)!=null&&h.call(e,a)&&e.setPaintProperty(a,"fill-opacity",d),(b=e.getLayer)!=null&&b.call(e,r)&&e.setPaintProperty(r,"line-opacity",u),(f=e.getLayer)!=null&&f.call(e,i)&&e.setPaintProperty(i,"circle-opacity",p),n.rafId=requestAnimationFrame(c),e.__ncChatPanelAnim=n}catch{}};n.rafId=requestAnimationFrame(c),e.__ncChatPanelAnim=n}const pe=9,_e=3,et=["Open Sans Semibold","Arial Unicode MS Regular"],he=["step",["zoom"],!1,17,!0],fe={"text-allow-overlap":he,"text-ignore-placement":he,"text-optional":!1};function tt(e,t){var n;try{if(!((n=e.getLayer)!=null&&n.call(e,t)))return;for(const[a,r]of Object.entries(fe))e.setLayoutProperty(t,a,r)}catch{}}const be=["==","$type","Point"],me="#ffffff",ye="#2d2d2d";function ge(e,t,n){var r;const a=`${n}label`;if((r=e.getLayer)!=null&&r.call(e,a)){tt(e,a);try{e.setFilter(a,be),e.setPaintProperty(a,"text-color",me),e.setPaintProperty(a,"text-halo-color",ye)}catch{}return}e.addLayer({id:a,type:"symbol",source:t,filter:be,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...et],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...fe},paint:{"text-color":me,"text-halo-color":ye,"text-halo-width":1.25,"text-halo-blur":.25}})}const J="nc_chatpanel_geojson",xe="nc_chatpanel_geojson_";function nt(){var r,i;const e=g();if(e&&F(e),!(e!=null&&e.getLayer)||!e.removeLayer)return;const t=e.__ncChatPanelAnim;t&&typeof t.rafId=="number"&&(cancelAnimationFrame(t.rafId),t.rafId=void 0);const n=xe,a=[`${n}label`,`${n}point`,`${n}line`,`${n}fill`];try{for(const o of a)(r=e.getLayer)!=null&&r.call(e,o)&&e.removeLayer(o);(i=e.getSource)!=null&&i.call(e,J)&&e.removeSource(J)}catch{}$()}function we(e){var i;const t=g();if(!t||typeof t.addSource!="function")return;F(t);const n=J,a=xe,r=(i=t.getSource)==null?void 0:i.call(t,n);if(r&&typeof r.setData=="function"){r.setData(e),ge(t,n,a),ie(t,a,e),ue(t,a),de(t,e),$();return}t.addSource(n,{type:"geojson",data:e}),t.addLayer({id:`${a}fill`,type:"fill",source:n,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),t.addLayer({id:`${a}line`,type:"line",source:n,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),t.addLayer({id:`${a}point`,type:"circle",source:n,filter:["==","$type","Point"],paint:{"circle-radius":pe,"circle-color":"#22c55e","circle-stroke-width":_e,"circle-stroke-color":"#ffffff"}}),ge(t,n,a),ie(t,a,e),ue(t,a),de(t,e),$()}function at(e,t){return e&&typeof e.record_count=="number"&&Number.isFinite(e.record_count)?`Sorgulama sonucunda ${e.record_count} kayıt bulundu.`:e&&typeof e.message=="string"&&e.message.trim()?e.message.trim():t.trim()?t.trim():"Yanıt alındı."}async function rt(e,t){var l;const n=new FormData;n.append("chatInput",t);const a=await fetch(e,{method:"POST",body:n}),r=await a.text(),i=a.headers.get("content-type")??"";let o=null;if(i.toLowerCase().includes("application/json"))try{o=JSON.parse(r)}catch{o=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:a.status,contentType:i,body:o??r});const c=o;return c!=null&&c.ok&&((l=c.geojson)==null?void 0:l.type)==="FeatureCollection"&&we(c.geojson),at(c,r)}function ot(e){try{const t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleString("tr-TR",{dateStyle:"medium",timeStyle:"short"})}catch{return e}}function ct(e){const t=e.querySelector("#nc_chatpanel_haberler_body"),n=e.querySelector("#nc_chatpanel_sosyal_body"),a='<p class="nc_chatpanel_hint mb-0">Yükleniyor…</p>';t&&(t.innerHTML=a),n&&(n.innerHTML=a)}function ve(e,t){const n=e.querySelector("#nc_chatpanel_haberler_body"),a=e.querySelector("#nc_chatpanel_sosyal_body");if(!n||!a)return;const r='<p class="nc_chatpanel_hint mb-0">Gösterilecek içerik yok.</p>';if(!N(t)){n.innerHTML=r,a.innerHTML=r;return}const i=t.twitter,o=t.news;if(Array.isArray(i)&&i.length>0){const l=['<div class="nc_chatpanel_tweet_list">'];for(const s of i){if(!N(s))continue;const d=typeof s.text=="string"?s.text:"",u=typeof s.created_at=="string"?s.created_at:"",p=u?ot(u):"",h=m(d).replace(/\n/g,"<br />");l.push(`<article class="nc_chatpanel_tweet_card">
        <div class="nc_chatpanel_tweet_meta">${m(p)}</div>
        <div class="nc_chatpanel_tweet_text">${h}</div>
      </article>`)}l.push("</div>"),a.innerHTML=l.join("")}else a.innerHTML=r;let c=[];if(N(o)&&Array.isArray(o.haberler)&&(c=o.haberler),c.length>0){const l=['<div class="nc_chatpanel_haber_list">'];for(const s of c){if(!N(s))continue;const d=typeof s.baslik=="string"?s.baslik:"",u=typeof s.tarih=="string"?s.tarih:"",p=typeof s.yer=="string"?s.yer:"",h=typeof s.kisa_aciklama=="string"?s.kisa_aciklama:"",b=[u,p].filter(Boolean),f=b.length>0?`<div class="nc_chatpanel_haber_meta">${m(b.join(" · "))}</div>`:"";l.push(`<article class="nc_chatpanel_haber_card">
        <h3 class="nc_chatpanel_haber_title">${m(d)}</h3>
        ${f}
        <p class="nc_chatpanel_haber_desc">${m(h)}</p>
      </article>`)}l.push("</div>"),n.innerHTML=l.join("")}else n.innerHTML=r}function Ce(e){const t=[],n=/\[([^\]]*)\]/g;let a=0,r;for(;(r=n.exec(e))!==null;){t.push(m(e.slice(a,r.index)));const o=(r[1]??"").trim();if(o.length===0)t.push(m(r[0]));else{const c=m(o);t.push(`<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${c}" title="${c}">${c}</a>`)}a=r.index+r[0].length}return t.push(m(e.slice(a))),t.join("")}function j(e,t){e.innerHTML=Ce(t)}function k(e){e.dataset.ncBracketCatDelegated!=="true"&&(e.dataset.ncBracketCatDelegated="true",e.addEventListener("click",t=>{var i;const n=t.target,a=(i=n==null?void 0:n.closest)==null?void 0:i.call(n,"a.nc_chatpanel_msg_catlink");if(!a)return;t.preventDefault();const r=a.getAttribute("data-cat")??"";console.log("[chatpanel] kategori linki",r)}))}function it(e){if(!e.getElementById("nc_chatpanel_bootstrap_css")){const n=document.createElement("link");n.id="nc_chatpanel_bootstrap_css",n.rel="stylesheet",n.href=He,e.appendChild(n)}if(e.getElementById("nc_chatpanel_styles"))return;const t=document.createElement("style");t.id="nc_chatpanel_styles",t.textContent=`
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
  `,e.appendChild(t)}function lt(){return`
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
  `}function st(e,t){const n=e.querySelector("#nc_chatpanel_form"),a=e.querySelector("#nc_chatpanel_input"),r=e.querySelector("#nc_chatpanel_messages");if(!n||!a||!r||n.dataset.ncBoundChat==="true")return;n.dataset.ncBoundChat="true",k(r);const i=(o,c)=>{const l=document.createElement("div");return l.className=`nc_chatpanel_msg ${o==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof c=="string"?l.textContent=c:l.appendChild(c),r.appendChild(l),y(r),l};n.addEventListener("submit",o=>{o.preventDefault();const c=a.value.trim();if(!c)return;i("user",c),a.value="",a.disabled=!0,O();const l=document.createElement("span");l.className="nc_chatpanel_typing",l.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const s=i("ai",l);rt(t,c).then(d=>{j(s,d),y(r)}).catch(d=>{console.error("[chatpanel] n8n istek hatası",d),s.textContent="Sorgu sırasında hata oluştu.",y(r)}).finally(()=>{I(),a.disabled=!1,a.focus()})})}function ke(){var l,s;const e=g();if(!(e!=null&&e.getBounds))return null;const t=e.getBounds(),n=(l=t.getSouthWest)==null?void 0:l.call(t),a=(s=t.getNorthEast)==null?void 0:s.call(t);if(!n||!a)return null;const r=typeof n.lng=="number"?n.lng:n.lon,i=typeof n.lat=="number"?n.lat:n.y,o=typeof a.lng=="number"?a.lng:a.lon,c=typeof a.lat=="number"?a.lat:a.y;return[r,i,o,c].every(d=>typeof d=="number"&&Number.isFinite(d))?[r,i,o,c]:null}function U(){var e;if(!(typeof document>"u")){try{E==null||E()}catch{}E=null,C=null,(e=document.getElementById(T))==null||e.remove()}}function dt(){if(typeof document>"u")return!1;const e=window.maplibregl,t=g();if(!(e!=null&&e.Map)||!(t!=null&&t.getContainer)||typeof t.unproject!="function")return!1;U();const n=t.getContainer(),a=window.getComputedStyle(n).position;(a==="static"||a==="")&&(n.style.position="relative");const r=document.createElement("div");r.id=T,r.setAttribute("aria-hidden","true"),r.style.cssText="position:absolute;inset:0;pointer-events:none;z-index:6;overflow:visible;";const i=document.createElement("div");i.className="nc_map_magnify_lens",i.style.cssText=["position:absolute","display:none",`width:${ne}px`,`height:${ne}px`,"border-radius:50%","overflow:hidden","box-sizing:border-box","border:3px solid rgba(13,110,253,0.95)","box-shadow:0 0 0 2px rgba(255,255,255,0.85),0 8px 28px rgba(0,0,0,0.22)","pointer-events:none","transform:translate(-50%,-50%)","left:0","top:0"].join(";");const o=document.createElement("div");o.className="nc_map_magnify_lens_map",o.style.cssText="width:100%;height:100%;position:relative;",i.appendChild(o),r.appendChild(i),n.appendChild(r);let c=null;const l=()=>{c!==null&&(clearTimeout(c),c=null)};let s;try{const _=t.getCenter();s=new e.Map({container:o,style:t.getStyle(),center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+D,22),bearing:t.getBearing(),pitch:t.getPitch(),interactive:!1,attributionControl:!1,maxZoom:24})}catch(_){return console.warn("[chatpanel] Büyüteç mini harita oluşturulamadı",_),r.remove(),!1}let d=null;const u=()=>{var x,Pe;if(i.style.display==="none")return;const _=s.queryRenderedFeatures;if(typeof _=="function")try{const P=_.call(s),gt=P.length,Z={},V={};for(const X of P){const Be=((x=X.layer)==null?void 0:x.id)??"?",Oe=((Pe=X.layer)==null?void 0:Pe.source)??X.source??"?";Z[Be]=(Z[Be]??0)+1,V[Oe]=(V[Oe]??0)+1}console.log("[chatpanel] mercek 500ms durgun — görünen feature:",gt,{katman:Z,kaynak:V})}catch(P){console.warn("[chatpanel] mercek queryRenderedFeatures",P)}},p=()=>{l(),c=window.setTimeout(()=>{c=null,window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{u()})})},ze)},h=()=>{if(!d)return;const _=t.unproject([d.x,d.y]);s.jumpTo({center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+D,22),bearing:t.getBearing(),pitch:t.getPitch()})},b=_=>{const x=_;x.point&&(d={x:x.point.x,y:x.point.y},i.style.left=`${x.point.x}px`,i.style.top=`${x.point.y}px`,i.style.display="block",h(),p())},f=()=>{h(),s.resize(),p()},Fe=()=>{l(),i.style.display="none",d=null};return C=()=>{try{const _=t.getStyle();if(!_)return;s.setStyle(_,{diff:!0})}catch{try{s.setStyle(t.getStyle())}catch(_){console.warn("[chatpanel] Büyüteç stil senkronu başarısız",_)}}if(d)h();else{const _=t.getCenter();s.jumpTo({center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+D,22),bearing:t.getBearing(),pitch:t.getPitch()})}try{s.resize()}catch{}p()},t.on("mousemove",b),t.on("move",f),t.on("zoom",f),t.on("rotate",f),t.on("pitch",f),n.addEventListener("mouseleave",Fe),window.requestAnimationFrame(()=>{try{s.resize()}catch{}p()}),E=()=>{l(),C=null,t.off("mousemove",b),t.off("move",f),t.off("zoom",f),t.off("rotate",f),t.off("pitch",f),n.removeEventListener("mouseleave",Fe);try{s.remove()}catch{}},!0}function W(e,t){const n=typeof document<"u"&&!!document.getElementById(T),a=!!t.querySelector('[data-nc-magnifier-panel="true"]'),r=n||a;e.classList.toggle("btn-primary",r),e.classList.toggle("btn-outline-primary",!r),e.setAttribute("aria-pressed",r?"true":"false")}function Le(e){var t;(t=e.querySelector('[data-nc-magnifier-panel="true"]'))==null||t.remove()}function ut(e,t){const n=e.querySelector("#nc_chatpanel_messages");if(!n)return;Le(e),k(n);const a=document.createElement("div");a.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend",a.setAttribute("data-nc-magnifier-panel","true");const r=document.createElement("div");r.className="nc_chatpanel_legend_intro",r.textContent="Büyüteç";const i=document.createElement("div");i.className="nc_chatpanel_legend";const o=document.createElement("div");o.className="nc_chatpanel_magnifier_scroll";const c=document.createElement("p");c.className="nc_chatpanel_hint mb-0",c.textContent=t?"Haritada fareyi hareket ettirdiğinizde merkezdeki yuvarlak lens, o noktayı yakınlaştırılmış gösterir; haritayı normal şekilde kaydırabilirsiniz. Büyüteci kapatmak için aynı düğmeye tekrar basın.":"Harita veya maplibregl bulunamadığı için lens gösterilemedi. Sayfayı yenileyip tekrar deneyin.",o.appendChild(c),i.appendChild(o),a.appendChild(r),a.appendChild(i),n.appendChild(a),y(n)}function Ee(e){const t=e.querySelector("#nc_chatpanel_map_circle_btn");t&&t.dataset.ncBoundMapCircle!=="true"&&(t.dataset.ncBoundMapCircle="true",W(t,e),t.addEventListener("click",()=>{const n=!!document.getElementById(T),a=!!e.querySelector('[data-nc-magnifier-panel="true"]');if(n||a)U(),Le(e);else{const i=dt();i||console.warn("[chatpanel] Harita veya maplibregl yok; büyüteç açılamadı."),ut(e,i)}W(t,e)}))}const pt=100;async function _t(e,t){var r;if(!t)return;const n=i=>{k(t);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",j(o,i),t.appendChild(o),y(t)},a=(i,o)=>{k(t);const c=document.createElement("div");c.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const l=document.createElement("div");l.className="nc_chatpanel_legend_intro",l.innerHTML=Ce(i),c.appendChild(l);const s=Ye(o);s.length>0&&c.appendChild(Ke(s,o)),t.appendChild(c),y(t)};try{const i=ke();if(!i){console.warn("[chatpanel] Harita bbox alınamadı."),n("Harita alanı okunamadı.");return}const o=`${e}/db/kentrehberi_poi/features-by-bbox`,c=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:i})});let l=null;try{l=await c.json()}catch{l=null}const s=l;if(!c.ok){const u=s&&typeof s.error=="string"?s.error:`HTTP ${c.status}`;n(`Kayıtlar yüklenemedi: ${u}`);return}const d=s==null?void 0:s.geojson;if(d&&d.type==="FeatureCollection"){we(d);const u=typeof s.record_count=="number"&&Number.isFinite(s.record_count)?s.record_count:((r=d.features)==null?void 0:r.length)??0;a(`Haritaya ${u} kayıt eklendi`,d),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:o,record_count:u})}else n("GeoJSON yanıtı alınamadı.")}catch(i){console.error("[chatpanel] features-by-bbox hata",i),n("Kayıtlar yüklenirken hata oluştu.")}}function ht(e){U();const t=e.querySelector("#nc_chatpanel_map_circle_btn");t&&W(t,e);const n=e.querySelector("#nc_chatpanel_messages"),a=e.querySelector("#nc_chatpanel_input");n&&n.replaceChildren(),a&&(a.value="",a.disabled=!1),nt(),Y(e),n&&(n.scrollTop=0)}function Se(e){const t=e.querySelector("#nc_chatpanel_clear_btn");t&&t.dataset.ncBoundClear!=="true"&&(t.dataset.ncBoundClear="true",t.addEventListener("click",()=>{ht(e),console.log("[chatpanel] panel temizlendi")}))}function ft(e){if(typeof localStorage>"u")return null;try{const t=localStorage.getItem(te);if(!t)return null;const n=JSON.parse(t);return typeof n.ts!="number"||typeof n.endpoint!="string"||n.endpoint!==e||Date.now()-n.ts>Re?null:n}catch{return null}}function bt(e){if(!(typeof localStorage>"u"))try{const t={ts:Date.now(),endpoint:e.endpoint,status:e.status,data:e.data};localStorage.setItem(te,JSON.stringify(t))}catch{}}async function Ae(e,t,n){const a=je(t),r=ft(a);if(r){console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:r.status,data:r.data,fromCache:!0,cachedAt:new Date(r.ts).toISOString()}),ve(e,r.data);return}ct(e);try{const i=new FormData;i.append("chatInput","haberler");const o=await fetch(a,{method:"POST",body:i}),c=await o.text();let l=c;try{l=JSON.parse(c)}catch{}console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:o.status,data:l}),o.ok&&bt({endpoint:a,status:o.status,data:l}),ve(e,l)}catch(i){console.error("[chatpanel] n8n news istek hatası",n,i);const o='<p class="nc_chatpanel_hint mb-0">Haberler yüklenirken hata oluştu.</p>',c=e.querySelector("#nc_chatpanel_haberler_body"),l=e.querySelector("#nc_chatpanel_sosyal_body");c&&(c.innerHTML=o),l&&(l.innerHTML=o)}}function Ne(e,t){const n=e.querySelector(".nc_chatpanel_tabbar");if(!n||n.dataset.ncBoundTabs==="true")return;n.dataset.ncBoundTabs="true";const a=e.querySelector("#nc_chatpanel_tab_btn_kentrehberi"),r=e.querySelector("#nc_chatpanel_tab_btn_haberler"),i=e.querySelector("#nc_chatpanel_tab_btn_sosyal"),o=e.querySelector("#nc_chatpanel_tab_panel_kentrehberi"),c=e.querySelector("#nc_chatpanel_tab_panel_haberler"),l=e.querySelector("#nc_chatpanel_tab_panel_sosyal");if(!a||!r||!i||!o||!c||!l)return;const s=[{id:"kentrehberi",btn:a,panel:o},{id:"haberler",btn:r,panel:c},{id:"sosyal",btn:i,panel:l}];let d="kentrehberi";const u=p=>{for(const h of s){const b=h.id===p;h.btn.classList.toggle("nc_chatpanel_tab_btn--active",b),h.btn.setAttribute("aria-selected",b?"true":"false"),h.panel.classList.toggle("nc_chatpanel_tab_pane--active",b)}};for(const p of s)p.btn.addEventListener("click",()=>{p.id!==d&&(d=p.id,u(p.id),(p.id==="haberler"||p.id==="sosyal")&&Ae(e,t,`sekme:${p.id}`))})}function Me(e,t){const n=e.querySelector("#nc_chatpanel_news_btn");n&&n.dataset.ncBoundNews!=="true"&&(n.dataset.ncBoundNews="true",n.addEventListener("click",async()=>{if(!n.disabled){n.disabled=!0;try{await Ae(e,t,"toolbar")}finally{n.disabled=!1}}}))}function Te(e,t){const n=e.querySelector("#nc_chatpanel_wisart_btn"),a=e.querySelector("#nc_chatpanel_messages");if(!n||n.dataset.ncBoundWisart==="true")return;n.dataset.ncBoundWisart="true";const r=i=>{if(!a)return;k(a);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",j(o,i),a.appendChild(o),y(a)};n.addEventListener("click",async()=>{if(n.disabled)return;n.disabled=!0;const i=n.innerHTML;n.innerHTML='<span aria-hidden="true">...</span>',O();let o=!1;try{const c=ke();if(!c){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}o=!0;const l=`${t}/n8n/kentrehberi`,s=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:c,faaliyet:"cami"})}),d=await s.text();let u=null;try{u=JSON.parse(d)}catch{u=d}if(console.log("[chatpanel] kentrehberi sonuç",{endpoint:l,status:s.status,data:u}),typeof u=="string")r(u);else if(u&&typeof u=="object"){const p=u.message;typeof p=="string"&&p.trim()?r(p.trim()):r(JSON.stringify(u))}else r(String(u))}catch(c){console.error("[chatpanel] WISART hata",c),r("WISART isteğinde hata oluştu.")}finally{I(),n.disabled=!1,n.innerHTML=i,o&&window.setTimeout(()=>{_t(t,a)},pt)}})}function Y(e){const t=e.querySelector("#nc_chatpanel_messages");if(!t||(k(t),t.querySelector('[data-nc-welcome-ai="true"]')))return;const n=document.createElement("div");n.className="nc_chatpanel_msg nc_chatpanel_msg_ai",n.setAttribute("data-nc-welcome-ai","true"),n.textContent=qe,t.prepend(n)}function K(e={}){const{container:t=document.body}=e;let n=document.getElementById(ee);const a=Ge(e),r=Je(e),i=Ue(e);if(H=a??null,n){a&&n.setAttribute("data-nc-map-instance",a);const l=n.shadowRoot;return l&&(Ne(l,r),Te(l,i),Me(l,r),Ee(l),Se(l),Y(l)),n}n=document.createElement("div"),n.id=ee,n.className="nc_chatpanel_root",n.setAttribute("data-nc-chatpanel","true"),a&&n.setAttribute("data-nc-map-instance",a);const o=n.attachShadow({mode:"open"});it(o);const c=document.createElement("div");return c.className="nc_chatpanel_shell",c.innerHTML=lt(),o.appendChild(c),t.appendChild(n),st(o,r),Ne(o,r),Te(o,i),Me(o,r),Ee(o),Se(o),Y(o),n}const mt={init:e=>K(e??{}),getMapInstanceName:()=>H,getRegisteredMap:g,getMaplibre:M};window.ChatPanel=mt;function yt(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if(yt()){const e=()=>K({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return w.getMaplibre=M,w.getRegisteredMap=g,w.hideSearchScanOverlay=I,w.initChatPanel=K,w.showSearchScanOverlay=O,Object.defineProperty(w,Symbol.toStringTag,{value:"Module"}),w}({});
