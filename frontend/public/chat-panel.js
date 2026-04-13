var ChatPanel=function(y){"use strict";const J="nc_chatpanel_root",Le="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";let M=null;function b(){var t;const e=M;return!e||typeof window>"u"?null:((t=window.__ncMapRegistry__)==null?void 0:t[e])??null}function k(){return window.maplibregl}const Ce="http://localhost:3001/api/n8n",Ee="http://localhost:3001/api",j="nc_chatpanel_n8n_news_v1",ke=60*60*1e3,Se="Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?",U="nc_search_scan_styles",B="nc_search_scan_overlay",S="nc_map_magnify_lens_root",W=168,Y=2.5;let w=null,v=0,x=null;function Ae(){if(typeof document>"u"||document.getElementById(U))return;const e=document.createElement("style");e.id=U,e.textContent=`
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
  `,document.head.appendChild(e)}function P(){if(typeof document>"u"||(Ae(),v+=1,v>1))return;const e=document.getElementById(B);if(e){x=e,e.classList.remove("nc_search_scan_overlay--exit"),e.style.opacity="1";return}const t=document.createElement("div");t.id=B,t.className="nc_search_scan_overlay",t.setAttribute("aria-hidden","true");const n=document.createElement("div");n.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",t.appendChild(n),t.appendChild(a),document.body.appendChild(t),x=t}function T(){if(typeof document>"u"||(v=Math.max(0,v-1),v>0))return;const e=x??document.getElementById(B);if(!e){x=null;return}e.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{e.remove(),x===e&&(x=null)},420)}function Ne(e){var r,i;const t=(r=e.mapInstanceName)==null?void 0:r.trim();if(t)return t;if(typeof document>"u")return;const n=document.currentScript,a=(i=n==null?void 0:n.getAttribute("data-map-instance"))==null?void 0:i.trim();if(a)return a}function Me(e){var n,a;const t=(n=e.n8nProxyUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,i=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(i)return i}return Ce}function Be(e){return`${e.replace(/\/$/,"")}/news`}function Pe(e){var n,a;const t=(n=e.dbApiUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,i=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(i)return i}return Ee}const L=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function K(e){if(e==null)return null;const t=String(e).trim();return t.length>0?t:null}function F(e){const t=K(e.faaliyet_adi);return t!==null?t:K(e["faaliyet-adi"])}function V(e){const t=new Set;for(const n of e.features??[]){const a=F(n.properties??{});a!==null&&t.add(a)}return Array.from(t).sort((n,a)=>n.localeCompare(a,"tr"))}function Z(e){if(e.startsWith("#")&&e.length===7){const t=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(1,3),16)*.78))),n=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(5,7),16)*.78)));return`#${t.toString(16).padStart(2,"0")}${n.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return e}function X(e,t,n){if(e.length===0)return n;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<e.length;r++)a.push(e[r],t(r));return a.push(n),a}function Q(e,t,n){var u,_,h;const a=V(n),r="#999999",i=Z(r),o=L.length,c=X(a,m=>L[m%o],r),l=X(a,m=>Z(L[m%o]),i),s=`${t}fill`,p=`${t}line`,d=`${t}point`;try{(u=e.getLayer)!=null&&u.call(e,s)&&(e.setPaintProperty(s,"fill-color",c),e.setPaintProperty(s,"fill-outline-color",l)),(_=e.getLayer)!=null&&_.call(e,p)&&e.setPaintProperty(p,"line-color",l),(h=e.getLayer)!=null&&h.call(e,d)&&(e.setPaintProperty(d,"circle-radius",re),e.setPaintProperty(d,"circle-stroke-width",oe),e.setPaintProperty(d,"circle-color",c),e.setPaintProperty(d,"circle-stroke-color","#ffffff"))}catch{}}const Te="#999999",ee="Belirtilmemiş";function Fe(e){const t=V(e),n=L.length,a=new Map;t.forEach((c,l)=>{a.set(c,L[l%n])});const r=new Map;for(const c of t)r.set(c,0);let i=0;for(const c of e.features??[]){const l=F(c.properties??{});l===null?i+=1:r.set(l,(r.get(l)??0)+1)}const o=t.map(c=>({label:c,color:a.get(c),count:r.get(c)??0}));return i>0&&o.push({label:ee,color:Te,count:i}),o.sort((c,l)=>l.count!==c.count?l.count-c.count:c.label.localeCompare(l.label,"tr")),o}const O=5;function I(e,t){const n=document.createElement("ul");n.className="nc_chatpanel_legend_list";for(const{label:a,color:r,count:i}of e){const o=document.createElement("li");o.className="nc_chatpanel_legend_row nc_chatpanel_legend_row_hover";const c=document.createElement("span");c.className="nc_chatpanel_legend_swatch",c.style.backgroundColor=r,c.setAttribute("aria-hidden","true");const l=document.createElement("span");l.className="nc_chatpanel_legend_label",l.textContent=`${a} (${i})`,o.appendChild(c),o.appendChild(l),$e(o,t,a),n.appendChild(o)}return n}function Oe(e,t){const n=document.createElement("div");n.className="nc_chatpanel_legend";const a=document.createElement("div");if(a.className="nc_chatpanel_legend_heading",a.textContent="Lejant",n.appendChild(a),e.length<=O)return n.appendChild(I(e,t)),n;const r=e.slice(0,O),i=e.slice(O);n.appendChild(I(r,t));const o=I(i,t),c=`nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;o.id=c,o.classList.add("nc_chatpanel_legend_list_extra"),o.hidden=!0,n.appendChild(o);const l=document.createElement("button");l.type="button",l.className="btn btn-link btn-sm nc_chatpanel_legend_expand_btn",l.setAttribute("aria-expanded","false"),l.setAttribute("aria-controls",c);const s=i.length;return l.textContent=`+ ${s} kategori daha`,l.addEventListener("click",()=>{o.hidden=!o.hidden;const p=!o.hidden;l.setAttribute("aria-expanded",String(p)),l.textContent=p?"Daha az göster":`+ ${s} kategori daha`;const d=n.closest("#nc_chatpanel_messages");d&&g(d)}),n.appendChild(l),n}function C(e,t){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){t.push([e[0],e[1]]);return}for(const n of e)C(n,t)}}function Ie(e,t){const n=F(e.properties??{});return t===ee?n===null:n===t}function He(e){const t=[];if(C(e,t),t.length===0)return null;let n=0,a=0;for(const[r,i]of t)n+=r,a+=i;return[n/t.length,a/t.length]}function te(e){if(!e)return[];const t=e.type;if(t==="Point"){const n=e.coordinates;return Array.isArray(n)&&n.length>=2&&typeof n[0]=="number"&&Number.isFinite(n[0])&&typeof n[1]=="number"&&Number.isFinite(n[1])?[[n[0],n[1]]]:[]}if(t==="MultiPoint"){const n=[];return C(e.coordinates,n),n}if(t==="LineString"||t==="Polygon"||t==="MultiLineString"||t==="MultiPolygon"){const n=He(e.coordinates);return n?[n]:[]}if(t==="GeometryCollection"&&Array.isArray(e.geometries)){const n=[];for(const a of e.geometries)n.push(...te(a));return n}return[]}const H="__ncChatPanelLegendHoverMarkers";function A(e){var n;const t=e==null?void 0:e[H];if(Array.isArray(t))for(const a of t)try{(n=a.remove)==null||n.call(a)}catch{}e&&typeof e=="object"&&(e[H]=[])}function De(e,t,n){A(e);const a=k();if(!(a!=null&&a.Marker))return;const r=[];for(const i of t.features??[])if(Ie(i,n)){for(const o of te(i.geometry))if(o.every(c=>typeof c=="number"&&Number.isFinite(c)))try{const c=new a.Marker;c.setLngLat(o),c.addTo(e),r.push(c)}catch{}}e[H]=r}function $e(e,t,n){e.addEventListener("mouseenter",()=>{const a=b();a&&De(a,t,n)}),e.addEventListener("mouseleave",()=>{const a=b();a&&A(a)})}function ne(e,t){const n=k();if(!(n!=null&&n.LngLatBounds))return;const a=[];for(const i of t.features??[]){const o=i==null?void 0:i.geometry;if(o){if(o.type==="GeometryCollection"&&Array.isArray(o.geometries)){for(const c of o.geometries)C(c==null?void 0:c.coordinates,a);continue}C(o.coordinates,a)}}if(a.length===0)return;const r=a.reduce((i,o)=>i.extend(o),new n.LngLatBounds(a[0],a[0]));e.fitBounds(r,{padding:48,duration:700,maxZoom:18})}function ae(e,t){const n=e.__ncChatPanelAnim??{};typeof n.rafId=="number"&&cancelAnimationFrame(n.rafId);const a=`${t}fill`,r=`${t}line`,i=`${t}point`,o=performance.now(),c=()=>{var _,h,m;const l=(performance.now()-o)/1e3*Math.PI*2*.55,s=.5+.5*Math.sin(l),p=.15+s*.2,d=.45+s*.45,u=.5+s*.5;try{(_=e.getLayer)!=null&&_.call(e,a)&&e.setPaintProperty(a,"fill-opacity",p),(h=e.getLayer)!=null&&h.call(e,r)&&e.setPaintProperty(r,"line-opacity",d),(m=e.getLayer)!=null&&m.call(e,i)&&e.setPaintProperty(i,"circle-opacity",u),n.rafId=requestAnimationFrame(c),e.__ncChatPanelAnim=n}catch{}};n.rafId=requestAnimationFrame(c),e.__ncChatPanelAnim=n}const re=9,oe=3,Re=["Open Sans Semibold","Arial Unicode MS Regular"],ce=["step",["zoom"],!1,17,!0],ie={"text-allow-overlap":ce,"text-ignore-placement":ce,"text-optional":!1};function ze(e,t){var n;try{if(!((n=e.getLayer)!=null&&n.call(e,t)))return;for(const[a,r]of Object.entries(ie))e.setLayoutProperty(t,a,r)}catch{}}const le=["==","$type","Point"],se="#ffffff",de="#2d2d2d";function pe(e,t,n){var r;const a=`${n}label`;if((r=e.getLayer)!=null&&r.call(e,a)){ze(e,a);try{e.setFilter(a,le),e.setPaintProperty(a,"text-color",se),e.setPaintProperty(a,"text-halo-color",de)}catch{}return}e.addLayer({id:a,type:"symbol",source:t,filter:le,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...Re],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...ie},paint:{"text-color":se,"text-halo-color":de,"text-halo-width":1.25,"text-halo-blur":.25}})}const D="nc_chatpanel_geojson",ue="nc_chatpanel_geojson_";function qe(){var r,i;const e=b();if(e&&A(e),!(e!=null&&e.getLayer)||!e.removeLayer)return;const t=e.__ncChatPanelAnim;t&&typeof t.rafId=="number"&&(cancelAnimationFrame(t.rafId),t.rafId=void 0);const n=ue,a=[`${n}label`,`${n}point`,`${n}line`,`${n}fill`];try{for(const o of a)(r=e.getLayer)!=null&&r.call(e,o)&&e.removeLayer(o);(i=e.getSource)!=null&&i.call(e,D)&&e.removeSource(D)}catch{}}function _e(e){var i;const t=b();if(!t||typeof t.addSource!="function")return;A(t);const n=D,a=ue,r=(i=t.getSource)==null?void 0:i.call(t,n);if(r&&typeof r.setData=="function"){r.setData(e),pe(t,n,a),Q(t,a,e),ae(t,a),ne(t,e);return}t.addSource(n,{type:"geojson",data:e}),t.addLayer({id:`${a}fill`,type:"fill",source:n,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),t.addLayer({id:`${a}line`,type:"line",source:n,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),t.addLayer({id:`${a}point`,type:"circle",source:n,filter:["==","$type","Point"],paint:{"circle-radius":re,"circle-color":"#22c55e","circle-stroke-width":oe,"circle-stroke-color":"#ffffff"}}),pe(t,n,a),Q(t,a,e),ae(t,a),ne(t,e)}function Ge(e,t){return e&&typeof e.record_count=="number"&&Number.isFinite(e.record_count)?`Sorgulama sonucunda ${e.record_count} kayıt bulundu.`:e&&typeof e.message=="string"&&e.message.trim()?e.message.trim():t.trim()?t.trim():"Yanıt alındı."}async function Je(e,t){var l;const n=new FormData;n.append("chatInput",t);const a=await fetch(e,{method:"POST",body:n}),r=await a.text(),i=a.headers.get("content-type")??"";let o=null;if(i.toLowerCase().includes("application/json"))try{o=JSON.parse(r)}catch{o=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:a.status,contentType:i,body:o??r});const c=o;return c!=null&&c.ok&&((l=c.geojson)==null?void 0:l.type)==="FeatureCollection"&&_e(c.geojson),Ge(c,r)}function g(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}function f(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function N(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function je(e){try{const t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleString("tr-TR",{dateStyle:"medium",timeStyle:"short"})}catch{return e}}function Ue(e){const t=e.querySelector("#nc_chatpanel_haberler_body"),n=e.querySelector("#nc_chatpanel_sosyal_body"),a='<p class="nc_chatpanel_hint mb-0">Yükleniyor…</p>';t&&(t.innerHTML=a),n&&(n.innerHTML=a)}function he(e,t){const n=e.querySelector("#nc_chatpanel_haberler_body"),a=e.querySelector("#nc_chatpanel_sosyal_body");if(!n||!a)return;const r='<p class="nc_chatpanel_hint mb-0">Gösterilecek içerik yok.</p>';if(!N(t)){n.innerHTML=r,a.innerHTML=r;return}const i=t.twitter,o=t.news;if(Array.isArray(i)&&i.length>0){const l=['<div class="nc_chatpanel_tweet_list">'];for(const s of i){if(!N(s))continue;const p=typeof s.text=="string"?s.text:"",d=typeof s.created_at=="string"?s.created_at:"",u=d?je(d):"",_=f(p).replace(/\n/g,"<br />");l.push(`<article class="nc_chatpanel_tweet_card">
        <div class="nc_chatpanel_tweet_meta">${f(u)}</div>
        <div class="nc_chatpanel_tweet_text">${_}</div>
      </article>`)}l.push("</div>"),a.innerHTML=l.join("")}else a.innerHTML=r;let c=[];if(N(o)&&Array.isArray(o.haberler)&&(c=o.haberler),c.length>0){const l=['<div class="nc_chatpanel_haber_list">'];for(const s of c){if(!N(s))continue;const p=typeof s.baslik=="string"?s.baslik:"",d=typeof s.tarih=="string"?s.tarih:"",u=typeof s.yer=="string"?s.yer:"",_=typeof s.kisa_aciklama=="string"?s.kisa_aciklama:"",h=[d,u].filter(Boolean),m=h.length>0?`<div class="nc_chatpanel_haber_meta">${f(h.join(" · "))}</div>`:"";l.push(`<article class="nc_chatpanel_haber_card">
        <h3 class="nc_chatpanel_haber_title">${f(p)}</h3>
        ${m}
        <p class="nc_chatpanel_haber_desc">${f(_)}</p>
      </article>`)}l.push("</div>"),n.innerHTML=l.join("")}else n.innerHTML=r}function fe(e){const t=[],n=/\[([^\]]*)\]/g;let a=0,r;for(;(r=n.exec(e))!==null;){t.push(f(e.slice(a,r.index)));const o=(r[1]??"").trim();if(o.length===0)t.push(f(r[0]));else{const c=f(o);t.push(`<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${c}" title="${c}">${c}</a>`)}a=r.index+r[0].length}return t.push(f(e.slice(a))),t.join("")}function $(e,t){e.innerHTML=fe(t)}function E(e){e.dataset.ncBracketCatDelegated!=="true"&&(e.dataset.ncBracketCatDelegated="true",e.addEventListener("click",t=>{var i;const n=t.target,a=(i=n==null?void 0:n.closest)==null?void 0:i.call(n,"a.nc_chatpanel_msg_catlink");if(!a)return;t.preventDefault();const r=a.getAttribute("data-cat")??"";console.log("[chatpanel] kategori linki",r)}))}function We(e){if(!e.getElementById("nc_chatpanel_bootstrap_css")){const n=document.createElement("link");n.id="nc_chatpanel_bootstrap_css",n.rel="stylesheet",n.href=Le,e.appendChild(n)}if(e.getElementById("nc_chatpanel_styles"))return;const t=document.createElement("style");t.id="nc_chatpanel_styles",t.textContent=`
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
  `,e.appendChild(t)}function Ye(){return`
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
  `}function Ke(e,t){const n=e.querySelector("#nc_chatpanel_form"),a=e.querySelector("#nc_chatpanel_input"),r=e.querySelector("#nc_chatpanel_messages");if(!n||!a||!r||n.dataset.ncBoundChat==="true")return;n.dataset.ncBoundChat="true",E(r);const i=(o,c)=>{const l=document.createElement("div");return l.className=`nc_chatpanel_msg ${o==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof c=="string"?l.textContent=c:l.appendChild(c),r.appendChild(l),g(r),l};n.addEventListener("submit",o=>{o.preventDefault();const c=a.value.trim();if(!c)return;i("user",c),a.value="",a.disabled=!0,P();const l=document.createElement("span");l.className="nc_chatpanel_typing",l.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const s=i("ai",l);Je(t,c).then(p=>{$(s,p),g(r)}).catch(p=>{console.error("[chatpanel] n8n istek hatası",p),s.textContent="Sorgu sırasında hata oluştu.",g(r)}).finally(()=>{T(),a.disabled=!1,a.focus()})})}function be(){var l,s;const e=b();if(!(e!=null&&e.getBounds))return null;const t=e.getBounds(),n=(l=t.getSouthWest)==null?void 0:l.call(t),a=(s=t.getNorthEast)==null?void 0:s.call(t);if(!n||!a)return null;const r=typeof n.lng=="number"?n.lng:n.lon,i=typeof n.lat=="number"?n.lat:n.y,o=typeof a.lng=="number"?a.lng:a.lon,c=typeof a.lat=="number"?a.lat:a.y;return[r,i,o,c].every(p=>typeof p=="number"&&Number.isFinite(p))?[r,i,o,c]:null}function R(){var e;if(!(typeof document>"u")){try{w==null||w()}catch{}w=null,(e=document.getElementById(S))==null||e.remove()}}function Ve(){if(typeof document>"u")return!1;const e=window.maplibregl,t=b();if(!(e!=null&&e.Map)||!(t!=null&&t.getContainer)||typeof t.unproject!="function")return!1;R();const n=t.getContainer(),a=window.getComputedStyle(n).position;(a==="static"||a==="")&&(n.style.position="relative");const r=document.createElement("div");r.id=S,r.setAttribute("aria-hidden","true"),r.style.cssText="position:absolute;inset:0;pointer-events:none;z-index:6;overflow:visible;";const i=document.createElement("div");i.className="nc_map_magnify_lens",i.style.cssText=["position:absolute","display:none",`width:${W}px`,`height:${W}px`,"border-radius:50%","overflow:hidden","box-sizing:border-box","border:3px solid rgba(13,110,253,0.95)","box-shadow:0 0 0 2px rgba(255,255,255,0.85),0 8px 28px rgba(0,0,0,0.22)","pointer-events:none","transform:translate(-50%,-50%)","left:0","top:0"].join(";");const o=document.createElement("div");o.className="nc_map_magnify_lens_map",o.style.cssText="width:100%;height:100%;position:relative;",i.appendChild(o),r.appendChild(i),n.appendChild(r);let c;try{const _=t.getCenter();c=new e.Map({container:o,style:t.getStyle(),center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+Y,22),bearing:t.getBearing(),pitch:t.getPitch(),interactive:!1,attributionControl:!1,maxZoom:24})}catch(_){return console.warn("[chatpanel] Büyüteç mini harita oluşturulamadı",_),r.remove(),!1}let l=null;const s=()=>{if(!l)return;const _=t.unproject([l.x,l.y]);c.jumpTo({center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+Y,22),bearing:t.getBearing(),pitch:t.getPitch()})},p=_=>{const h=_;h.point&&(l={x:h.point.x,y:h.point.y},i.style.left=`${h.point.x}px`,i.style.top=`${h.point.y}px`,i.style.display="block",s())},d=()=>{s(),c.resize()},u=()=>{i.style.display="none",l=null};return t.on("mousemove",p),t.on("move",d),t.on("zoom",d),t.on("rotate",d),t.on("pitch",d),n.addEventListener("mouseleave",u),window.requestAnimationFrame(()=>{try{c.resize()}catch{}}),w=()=>{t.off("mousemove",p),t.off("move",d),t.off("zoom",d),t.off("rotate",d),t.off("pitch",d),n.removeEventListener("mouseleave",u);try{c.remove()}catch{}},!0}function z(e){const t=typeof document<"u"&&!!document.getElementById(S);e.classList.toggle("btn-primary",t),e.classList.toggle("btn-outline-primary",!t),e.setAttribute("aria-pressed",t?"true":"false")}function me(e){const t=e.querySelector("#nc_chatpanel_map_circle_btn");t&&t.dataset.ncBoundMapCircle!=="true"&&(t.dataset.ncBoundMapCircle="true",z(t),t.addEventListener("click",()=>{!!document.getElementById(S)?R():Ve()||console.warn("[chatpanel] Harita veya maplibregl yok; büyüteç açılamadı."),z(t)}))}const Ze=100;async function Xe(e,t){var r;if(!t)return;const n=i=>{E(t);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",$(o,i),t.appendChild(o),g(t)},a=(i,o)=>{E(t);const c=document.createElement("div");c.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const l=document.createElement("div");l.className="nc_chatpanel_legend_intro",l.innerHTML=fe(i),c.appendChild(l);const s=Fe(o);s.length>0&&c.appendChild(Oe(s,o)),t.appendChild(c),g(t)};try{const i=be();if(!i){console.warn("[chatpanel] Harita bbox alınamadı."),n("Harita alanı okunamadı.");return}const o=`${e}/db/kentrehberi_poi/features-by-bbox`,c=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:i})});let l=null;try{l=await c.json()}catch{l=null}const s=l;if(!c.ok){const d=s&&typeof s.error=="string"?s.error:`HTTP ${c.status}`;n(`Kayıtlar yüklenemedi: ${d}`);return}const p=s==null?void 0:s.geojson;if(p&&p.type==="FeatureCollection"){_e(p);const d=typeof s.record_count=="number"&&Number.isFinite(s.record_count)?s.record_count:((r=p.features)==null?void 0:r.length)??0;a(`Haritaya ${d} kayıt eklendi`,p),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:o,record_count:d})}else n("GeoJSON yanıtı alınamadı.")}catch(i){console.error("[chatpanel] features-by-bbox hata",i),n("Kayıtlar yüklenirken hata oluştu.")}}function Qe(e){R();const t=e.querySelector("#nc_chatpanel_map_circle_btn");t&&z(t);const n=e.querySelector("#nc_chatpanel_messages"),a=e.querySelector("#nc_chatpanel_input");n&&n.replaceChildren(),a&&(a.value="",a.disabled=!1),qe(),q(e),n&&(n.scrollTop=0)}function ye(e){const t=e.querySelector("#nc_chatpanel_clear_btn");t&&t.dataset.ncBoundClear!=="true"&&(t.dataset.ncBoundClear="true",t.addEventListener("click",()=>{Qe(e),console.log("[chatpanel] panel temizlendi")}))}function et(e){if(typeof localStorage>"u")return null;try{const t=localStorage.getItem(j);if(!t)return null;const n=JSON.parse(t);return typeof n.ts!="number"||typeof n.endpoint!="string"||n.endpoint!==e||Date.now()-n.ts>ke?null:n}catch{return null}}function tt(e){if(!(typeof localStorage>"u"))try{const t={ts:Date.now(),endpoint:e.endpoint,status:e.status,data:e.data};localStorage.setItem(j,JSON.stringify(t))}catch{}}async function ge(e,t,n){const a=Be(t),r=et(a);if(r){console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:r.status,data:r.data,fromCache:!0,cachedAt:new Date(r.ts).toISOString()}),he(e,r.data);return}Ue(e);try{const i=new FormData;i.append("chatInput","haberler");const o=await fetch(a,{method:"POST",body:i}),c=await o.text();let l=c;try{l=JSON.parse(c)}catch{}console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:o.status,data:l}),o.ok&&tt({endpoint:a,status:o.status,data:l}),he(e,l)}catch(i){console.error("[chatpanel] n8n news istek hatası",n,i);const o='<p class="nc_chatpanel_hint mb-0">Haberler yüklenirken hata oluştu.</p>',c=e.querySelector("#nc_chatpanel_haberler_body"),l=e.querySelector("#nc_chatpanel_sosyal_body");c&&(c.innerHTML=o),l&&(l.innerHTML=o)}}function xe(e,t){const n=e.querySelector(".nc_chatpanel_tabbar");if(!n||n.dataset.ncBoundTabs==="true")return;n.dataset.ncBoundTabs="true";const a=e.querySelector("#nc_chatpanel_tab_btn_kentrehberi"),r=e.querySelector("#nc_chatpanel_tab_btn_haberler"),i=e.querySelector("#nc_chatpanel_tab_btn_sosyal"),o=e.querySelector("#nc_chatpanel_tab_panel_kentrehberi"),c=e.querySelector("#nc_chatpanel_tab_panel_haberler"),l=e.querySelector("#nc_chatpanel_tab_panel_sosyal");if(!a||!r||!i||!o||!c||!l)return;const s=[{id:"kentrehberi",btn:a,panel:o},{id:"haberler",btn:r,panel:c},{id:"sosyal",btn:i,panel:l}];let p="kentrehberi";const d=u=>{for(const _ of s){const h=_.id===u;_.btn.classList.toggle("nc_chatpanel_tab_btn--active",h),_.btn.setAttribute("aria-selected",h?"true":"false"),_.panel.classList.toggle("nc_chatpanel_tab_pane--active",h)}};for(const u of s)u.btn.addEventListener("click",()=>{u.id!==p&&(p=u.id,d(u.id),(u.id==="haberler"||u.id==="sosyal")&&ge(e,t,`sekme:${u.id}`))})}function we(e,t){const n=e.querySelector("#nc_chatpanel_news_btn");n&&n.dataset.ncBoundNews!=="true"&&(n.dataset.ncBoundNews="true",n.addEventListener("click",async()=>{if(!n.disabled){n.disabled=!0;try{await ge(e,t,"toolbar")}finally{n.disabled=!1}}}))}function ve(e,t){const n=e.querySelector("#nc_chatpanel_wisart_btn"),a=e.querySelector("#nc_chatpanel_messages");if(!n||n.dataset.ncBoundWisart==="true")return;n.dataset.ncBoundWisart="true";const r=i=>{if(!a)return;E(a);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",$(o,i),a.appendChild(o),g(a)};n.addEventListener("click",async()=>{if(n.disabled)return;n.disabled=!0;const i=n.innerHTML;n.innerHTML='<span aria-hidden="true">...</span>',P();let o=!1;try{const c=be();if(!c){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}o=!0;const l=`${t}/n8n/kentrehberi`,s=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:c,faaliyet:"cami"})}),p=await s.text();let d=null;try{d=JSON.parse(p)}catch{d=p}if(console.log("[chatpanel] kentrehberi sonuç",{endpoint:l,status:s.status,data:d}),typeof d=="string")r(d);else if(d&&typeof d=="object"){const u=d.message;typeof u=="string"&&u.trim()?r(u.trim()):r(JSON.stringify(d))}else r(String(d))}catch(c){console.error("[chatpanel] WISART hata",c),r("WISART isteğinde hata oluştu.")}finally{T(),n.disabled=!1,n.innerHTML=i,o&&window.setTimeout(()=>{Xe(t,a)},Ze)}})}function q(e){const t=e.querySelector("#nc_chatpanel_messages");if(!t||(E(t),t.querySelector('[data-nc-welcome-ai="true"]')))return;const n=document.createElement("div");n.className="nc_chatpanel_msg nc_chatpanel_msg_ai",n.setAttribute("data-nc-welcome-ai","true"),n.textContent=Se,t.prepend(n)}function G(e={}){const{container:t=document.body}=e;let n=document.getElementById(J);const a=Ne(e),r=Me(e),i=Pe(e);if(M=a??null,n){a&&n.setAttribute("data-nc-map-instance",a);const l=n.shadowRoot;return l&&(xe(l,r),ve(l,i),we(l,r),me(l),ye(l),q(l)),n}n=document.createElement("div"),n.id=J,n.className="nc_chatpanel_root",n.setAttribute("data-nc-chatpanel","true"),a&&n.setAttribute("data-nc-map-instance",a);const o=n.attachShadow({mode:"open"});We(o);const c=document.createElement("div");return c.className="nc_chatpanel_shell",c.innerHTML=Ye(),o.appendChild(c),t.appendChild(n),Ke(o,r),xe(o,r),ve(o,i),we(o,r),me(o),ye(o),q(o),n}const nt={init:e=>G(e??{}),getMapInstanceName:()=>M,getRegisteredMap:b,getMaplibre:k};window.ChatPanel=nt;function at(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if(at()){const e=()=>G({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return y.getMaplibre=k,y.getRegisteredMap=b,y.hideSearchScanOverlay=T,y.initChatPanel=G,y.showSearchScanOverlay=P,Object.defineProperty(y,Symbol.toStringTag,{value:"Module"}),y}({});
