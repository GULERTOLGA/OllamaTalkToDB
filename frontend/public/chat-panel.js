var ChatPanel=function(C){"use strict";let $=null;function We(e){$=e}function Ke(){return $}function m(){var t;const e=$;return!e||typeof window>"u"?null:((t=window.__ncMapRegistry__)==null?void 0:t[e])??null}function A(){return window.maplibregl}function x(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}function g(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function w(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const D="nc_map_magnify_lens_root",ue=252,z=2.5,Ye=500;let M=null,S=null;function q(){try{S==null||S()}catch{}}function G(){var e;if(!(typeof document>"u")){try{M==null||M()}catch{}M=null,S=null,(e=document.getElementById(D))==null||e.remove()}}function Ve(){if(typeof document>"u")return!1;const e=window.maplibregl,t=m();if(!(e!=null&&e.Map)||!(t!=null&&t.getContainer)||typeof t.unproject!="function")return!1;G();const n=t.getContainer(),a=window.getComputedStyle(n).position;(a==="static"||a==="")&&(n.style.position="relative");const r=document.createElement("div");r.id=D,r.setAttribute("aria-hidden","true"),r.style.cssText="position:absolute;inset:0;pointer-events:none;z-index:6;overflow:visible;";const c=document.createElement("div");c.className="nc_map_magnify_lens",c.style.cssText=["position:absolute","display:none",`width:${ue}px`,`height:${ue}px`,"border-radius:50%","overflow:hidden","box-sizing:border-box","border:3px solid rgba(13,110,253,0.95)","box-shadow:0 0 0 2px rgba(255,255,255,0.85),0 8px 28px rgba(0,0,0,0.22)","pointer-events:none","transform:translate(-50%,-50%)","left:0","top:0"].join(";");const o=document.createElement("div");o.className="nc_map_magnify_lens_map",o.style.cssText="width:100%;height:100%;position:relative;",c.appendChild(o),r.appendChild(c),n.appendChild(r);let i=null;const l=()=>{i!==null&&(clearTimeout(i),i=null)};let s;try{const _=t.getCenter();s=new e.Map({container:o,style:t.getStyle(),center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+z,22),bearing:t.getBearing(),pitch:t.getPitch(),interactive:!1,attributionControl:!1,maxZoom:24})}catch(_){return console.warn("[chatpanel] Büyüteç mini harita oluşturulamadı",_),r.remove(),!1}let d=null;const u=()=>{var f,L;if(c.style.display==="none")return;const _=s.queryRenderedFeatures;if(typeof _=="function")try{const v=_.call(s),k=v.length,le={},se={};for(const de of v){const Ue=((f=de.layer)==null?void 0:f.id)??"?",Je=((L=de.layer)==null?void 0:L.source)??de.source??"?";le[Ue]=(le[Ue]??0)+1,se[Je]=(se[Je]??0)+1}console.log("[chatpanel] mercek 500ms durgun — görünen feature:",k,{katman:le,kaynak:se})}catch(v){console.warn("[chatpanel] mercek queryRenderedFeatures",v)}},p=()=>{l(),i=window.setTimeout(()=>{i=null,window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{u()})})},Ye)},h=()=>{if(!d)return;const _=t.unproject([d.x,d.y]);s.jumpTo({center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+z,22),bearing:t.getBearing(),pitch:t.getPitch()})},b=_=>{const f=_;f.point&&(d={x:f.point.x,y:f.point.y},c.style.left=`${f.point.x}px`,c.style.top=`${f.point.y}px`,c.style.display="block",h(),p())},y=()=>{h(),s.resize(),p()},I=()=>{l(),c.style.display="none",d=null};return S=()=>{try{const _=t.getStyle();if(!_)return;s.setStyle(_,{diff:!0})}catch{try{s.setStyle(t.getStyle())}catch(_){console.warn("[chatpanel] Büyüteç stil senkronu başarısız",_)}}if(d)h();else{const _=t.getCenter();s.jumpTo({center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+z,22),bearing:t.getBearing(),pitch:t.getPitch()})}try{s.resize()}catch{}p()},t.on("mousemove",b),t.on("move",y),t.on("zoom",y),t.on("rotate",y),t.on("pitch",y),n.addEventListener("mouseleave",I),window.requestAnimationFrame(()=>{try{s.resize()}catch{}p()}),M=()=>{l(),S=null,t.off("mousemove",b),t.off("move",y),t.off("zoom",y),t.off("rotate",y),t.off("pitch",y),n.removeEventListener("mouseleave",I);try{s.remove()}catch{}},!0}function j(e,t){const n=typeof document<"u"&&!!document.getElementById(D),a=!!t.querySelector('[data-nc-magnifier-panel="true"]'),r=n||a;e.classList.toggle("btn-primary",r),e.classList.toggle("btn-outline-primary",!r),e.setAttribute("aria-pressed",r?"true":"false")}function pe(e){var t;(t=e.querySelector('[data-nc-magnifier-panel="true"]'))==null||t.remove()}function Ze(e,t,n){const a=e.querySelector("#nc_chatpanel_messages");if(!a)return;pe(e),n(a);const r=document.createElement("div");r.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend",r.setAttribute("data-nc-magnifier-panel","true");const c=document.createElement("div");c.className="nc_chatpanel_legend_intro",c.textContent="Büyüteç";const o=document.createElement("div");o.className="nc_chatpanel_legend";const i=document.createElement("div");i.className="nc_chatpanel_magnifier_scroll";const l=document.createElement("p");l.className="nc_chatpanel_hint mb-0",l.textContent=t?"Haritada fareyi hareket ettirdiğinizde merkezdeki yuvarlak lens, o noktayı yakınlaştırılmış gösterir; haritayı normal şekilde kaydırabilirsiniz. Büyüteci kapatmak için aynı düğmeye tekrar basın.":"Harita veya maplibregl bulunamadığı için lens gösterilemedi. Sayfayı yenileyip tekrar deneyin.",i.appendChild(l),o.appendChild(i),r.appendChild(c),r.appendChild(o),a.appendChild(r),x(a)}function _e(e,t){const n=e.querySelector("#nc_chatpanel_map_circle_btn");n&&n.dataset.ncBoundMapCircle!=="true"&&(n.dataset.ncBoundMapCircle="true",j(n,e),n.addEventListener("click",()=>{const a=!!document.getElementById(D),r=!!e.querySelector('[data-nc-magnifier-panel="true"]');if(a||r)G(),pe(e);else{const o=Ve();o||console.warn("[chatpanel] Harita veya maplibregl yok; büyüteç açılamadı."),Ze(e,o,t.ensureBracketCategoryLinkDelegation)}j(n,e)}))}const P=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function he(e){if(e==null)return null;const t=String(e).trim();return t.length>0?t:null}function U(e){const t=he(e.faaliyet_adi);return t!==null?t:he(e["faaliyet-adi"])}function fe(e){const t=new Set;for(const n of e.features??[]){const a=U(n.properties??{});a!==null&&t.add(a)}return Array.from(t).sort((n,a)=>n.localeCompare(a,"tr"))}function be(e){if(e.startsWith("#")&&e.length===7){const t=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(1,3),16)*.78))),n=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(5,7),16)*.78)));return`#${t.toString(16).padStart(2,"0")}${n.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return e}function ye(e,t,n){if(e.length===0)return n;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<e.length;r++)a.push(e[r],t(r));return a.push(n),a}function Xe(e){var t;for(const n of e.features??[]){const a=(t=n==null?void 0:n.properties)==null?void 0:t.source;if(typeof a!="string")continue;const r=a.trim().toLowerCase();if(r==="news"||r==="twitter")return!0}return!1}function me(e,t,n){var p,h,b,y,I,ie;if(Xe(n)){const _="#f97316",f="#9a3412",L=`${t}fill`,v=`${t}line`,k=`${t}point`;try{(p=e.getLayer)!=null&&p.call(e,L)&&(e.setPaintProperty(L,"fill-color",_),e.setPaintProperty(L,"fill-outline-color",f),e.setPaintProperty(L,"fill-opacity",.5)),(h=e.getLayer)!=null&&h.call(e,v)&&(e.setPaintProperty(v,"line-color",f),e.setPaintProperty(v,"line-width",4),e.setPaintProperty(v,"line-opacity",.95)),(b=e.getLayer)!=null&&b.call(e,k)&&(e.setPaintProperty(k,"circle-radius",Y+1),e.setPaintProperty(k,"circle-stroke-width",V+1),e.setPaintProperty(k,"circle-color",_),e.setPaintProperty(k,"circle-stroke-color",f),e.setPaintProperty(k,"circle-opacity",.98))}catch{}return}const a=fe(n),r="#999999",c=be(r),o=P.length,i=ye(a,_=>P[_%o],r),l=ye(a,_=>be(P[_%o]),c),s=`${t}fill`,d=`${t}line`,u=`${t}point`;try{(y=e.getLayer)!=null&&y.call(e,s)&&(e.setPaintProperty(s,"fill-color",i),e.setPaintProperty(s,"fill-outline-color",l)),(I=e.getLayer)!=null&&I.call(e,d)&&e.setPaintProperty(d,"line-color",l),(ie=e.getLayer)!=null&&ie.call(e,u)&&(e.setPaintProperty(u,"circle-radius",Y),e.setPaintProperty(u,"circle-stroke-width",V),e.setPaintProperty(u,"circle-color",i),e.setPaintProperty(u,"circle-stroke-color","#ffffff"))}catch{}}const Qe="#999999",ge="Belirtilmemiş";function et(e){const t=fe(e),n=P.length,a=new Map;t.forEach((i,l)=>{a.set(i,P[l%n])});const r=new Map;for(const i of t)r.set(i,0);let c=0;for(const i of e.features??[]){const l=U(i.properties??{});l===null?c+=1:r.set(l,(r.get(l)??0)+1)}const o=t.map(i=>({label:i,color:a.get(i),count:r.get(i)??0}));return c>0&&o.push({label:ge,color:Qe,count:c}),o.sort((i,l)=>l.count!==i.count?l.count-i.count:i.label.localeCompare(l.label,"tr")),o}const J=5;function W(e,t){const n=document.createElement("ul");n.className="nc_chatpanel_legend_list";for(const{label:a,color:r,count:c}of e){const o=document.createElement("li");o.className="nc_chatpanel_legend_row nc_chatpanel_legend_row_hover";const i=document.createElement("span");i.className="nc_chatpanel_legend_swatch",i.style.backgroundColor=r,i.setAttribute("aria-hidden","true");const l=document.createElement("span");l.className="nc_chatpanel_legend_label",l.textContent=`${a} (${c})`,o.appendChild(i),o.appendChild(l),rt(o,t,a),n.appendChild(o)}return n}function tt(e,t){const n=document.createElement("div");n.className="nc_chatpanel_legend";const a=document.createElement("div");if(a.className="nc_chatpanel_legend_heading",a.textContent="Lejant",n.appendChild(a),e.length<=J)return n.appendChild(W(e,t)),n;const r=e.slice(0,J),c=e.slice(J);n.appendChild(W(r,t));const o=W(c,t),i=`nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;o.id=i,o.classList.add("nc_chatpanel_legend_list_extra"),o.hidden=!0,n.appendChild(o);const l=document.createElement("button");l.type="button",l.className="btn btn-link btn-sm nc_chatpanel_legend_expand_btn",l.setAttribute("aria-expanded","false"),l.setAttribute("aria-controls",i);const s=c.length;return l.textContent=`+ ${s} kategori daha`,l.addEventListener("click",()=>{o.hidden=!o.hidden;const d=!o.hidden;l.setAttribute("aria-expanded",String(d)),l.textContent=d?"Daha az göster":`+ ${s} kategori daha`;const u=n.closest("#nc_chatpanel_messages");u&&x(u)}),n.appendChild(l),n}function F(e,t){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){t.push([e[0],e[1]]);return}for(const n of e)F(n,t)}}function nt(e,t){const n=U(e.properties??{});return t===ge?n===null:n===t}function we(e){const t=[];if(F(e,t),t.length===0)return null;let n=0,a=0;for(const[r,c]of t)n+=r,a+=c;return[n/t.length,a/t.length]}function ve(e){if(!e)return[];const t=e.type;if(t==="Point"){const n=e.coordinates;return Array.isArray(n)&&n.length>=2&&typeof n[0]=="number"&&Number.isFinite(n[0])&&typeof n[1]=="number"&&Number.isFinite(n[1])?[[n[0],n[1]]]:[]}if(t==="MultiPoint"){const n=[];return F(e.coordinates,n),n}if(t==="LineString"||t==="Polygon"||t==="MultiLineString"||t==="MultiPolygon"){const n=we(e.coordinates);return n?[n]:[]}if(t==="GeometryCollection"&&Array.isArray(e.geometries)){const n=[];for(const a of e.geometries)n.push(...ve(a));return n}return[]}const K="__ncChatPanelLegendHoverMarkers";function H(e){var n;const t=e==null?void 0:e[K];if(Array.isArray(t))for(const a of t)try{(n=a.remove)==null||n.call(a)}catch{}e&&typeof e=="object"&&(e[K]=[])}function at(e,t,n){H(e);const a=A();if(!(a!=null&&a.Marker))return;const r=[];for(const c of t.features??[])if(nt(c,n)){for(const o of ve(c.geometry))if(o.every(i=>typeof i=="number"&&Number.isFinite(i)))try{const i=new a.Marker;i.setLngLat(o),i.addTo(e),r.push(i)}catch{}}e[K]=r}function rt(e,t,n){e.addEventListener("mouseenter",()=>{const a=m();a&&at(a,t,n)}),e.addEventListener("mouseleave",()=>{const a=m();a&&H(a)})}function xe(e,t){const n=A();if(!(n!=null&&n.LngLatBounds))return;const a=[];for(const c of t.features??[]){const o=c==null?void 0:c.geometry;if(o){if(o.type==="GeometryCollection"&&Array.isArray(o.geometries)){for(const i of o.geometries)F(i==null?void 0:i.coordinates,a);continue}F(o.coordinates,a)}}if(a.length===0)return;const r=a.reduce((c,o)=>c.extend(o),new n.LngLatBounds(a[0],a[0]));e.fitBounds(r,{padding:48,duration:700,maxZoom:18})}const Y=9,V=3,ot=["Open Sans Semibold","Arial Unicode MS Regular"],ke=["step",["zoom"],!1,17,!0],Ce={"text-allow-overlap":ke,"text-ignore-placement":ke,"text-optional":!1};function ct(e,t){var n;try{if(!((n=e.getLayer)!=null&&n.call(e,t)))return;for(const[a,r]of Object.entries(Ce))e.setLayoutProperty(t,a,r)}catch{}}const Ee=["==","$type","Point"],Le="#ffffff",Se="#2d2d2d";function Ne(e,t,n){var r;const a=`${n}label`;if((r=e.getLayer)!=null&&r.call(e,a)){ct(e,a);try{e.setFilter(a,Ee),e.setPaintProperty(a,"text-color",Le),e.setPaintProperty(a,"text-halo-color",Se)}catch{}return}e.addLayer({id:a,type:"symbol",source:t,filter:Ee,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...ot],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...Ce},paint:{"text-color":Le,"text-halo-color":Se,"text-halo-width":1.25,"text-halo-blur":.25}})}const Z="nc_chatpanel_geojson",Ae="nc_chatpanel_geojson_",X="__ncChatPanelNewsHoverMarker",Me="nc_chatpanel_news_hover_styles";function it(){if(typeof document>"u"||document.getElementById(Me))return;const e=document.createElement("style");e.id=Me,e.textContent=`
    .nc_news_hover_root {
      pointer-events: none;
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
    }
    .nc_news_hover_pin {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #f97316;
      border: 2px solid #9a3412;
      margin: 0 auto;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
    }
    .nc_news_hover_balloon {
      width: 280px;
      margin-bottom: 8px;
      background: #fff7ed;
      border: 1px solid #fdba74;
      border-radius: 10px;
      padding: 9px 10px;
      color: #7c2d12;
      font-size: 12px;
      line-height: 1.35;
    }
    .nc_news_hover_title {
      font-weight: 700;
      margin-bottom: 6px;
    }
    .nc_news_hover_meta {
      font-size: 11px;
      color: #9a3412;
      margin-bottom: 6px;
    }
    .nc_news_hover_desc {
      color: #431407;
      white-space: pre-wrap;
      word-break: break-word;
    }
  `,document.head.appendChild(e)}function Q(e){var n;const t=e==null?void 0:e[X];try{(n=t==null?void 0:t.remove)==null||n.call(t)}catch{}e&&typeof e=="object"&&(e[X]=null)}function Pe(e){if(!e)return null;if(e.type==="Point"){const t=e.coordinates;return Array.isArray(t)&&t.length>=2&&typeof t[0]=="number"&&Number.isFinite(t[0])&&typeof t[1]=="number"&&Number.isFinite(t[1])?[t[0],t[1]]:null}if(e.type==="GeometryCollection"&&Array.isArray(e.geometries)){const t=[];for(const a of e.geometries){const r=Pe(a);r&&t.push(r)}if(t.length===0)return null;const n=t.reduce((a,[r,c])=>[a[0]+r,a[1]+c],[0,0]);return[n[0]/t.length,n[1]/t.length]}return we(e.coordinates)}function lt(e){const t=document.createElement("div");t.className="nc_news_hover_root";const n=document.createElement("div");n.className="nc_news_hover_balloon";const a=document.createElement("div");a.className="nc_news_hover_title",a.textContent=e.title.trim()||"(Başlık yok)";const r=document.createElement("div");r.className="nc_news_hover_meta";const c=[e.source,e.date,e.location].filter(l=>typeof l=="string"&&l.trim().length>0).map(l=>String(l).trim());r.textContent=c.join(" · ");const o=document.createElement("div");o.className="nc_news_hover_desc",o.textContent=e.description.trim()||"(Açıklama yok)",n.appendChild(a),r.textContent&&n.appendChild(r),n.appendChild(o),t.appendChild(n);const i=document.createElement("div");return i.className="nc_news_hover_pin",t.appendChild(i),t}function st(e,t){const n=m();if(!n)return;Q(n);const a=Pe(e.geometry);if(!a)return;const r=A();if(r!=null&&r.Marker){it();try{const c=lt(t),o=new r.Marker({element:c,anchor:"bottom"});o.setLngLat(a),o.addTo(n),n[X]=o}catch{}}}function Fe(){const e=m();e&&Q(e)}function dt(){var r,c;const e=m();if(e&&(H(e),Q(e)),!(e!=null&&e.getLayer)||!e.removeLayer)return;const t=e.__ncChatPanelAnim;t&&typeof t.rafId=="number"&&(cancelAnimationFrame(t.rafId),t.rafId=void 0);const n=Ae,a=[`${n}label`,`${n}point`,`${n}line`,`${n}fill`];try{for(const o of a)(r=e.getLayer)!=null&&r.call(e,o)&&e.removeLayer(o);(c=e.getSource)!=null&&c.call(e,Z)&&e.removeSource(Z)}catch{}q()}function R(e){var c;const t=m();if(!t||typeof t.addSource!="function")return;H(t);const n=Z,a=Ae,r=(c=t.getSource)==null?void 0:c.call(t,n);if(r&&typeof r.setData=="function"){r.setData(e),Ne(t,n,a),me(t,a,e),xe(t,e),q();return}t.addSource(n,{type:"geojson",data:e}),t.addLayer({id:`${a}fill`,type:"fill",source:n,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),t.addLayer({id:`${a}line`,type:"line",source:n,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),t.addLayer({id:`${a}point`,type:"circle",source:n,filter:["==","$type","Point"],paint:{"circle-radius":Y,"circle-color":"#22c55e","circle-stroke-width":V,"circle-stroke-color":"#ffffff"}}),Ne(t,n,a),me(t,a,e),xe(t,e),q()}const Te="nc_search_scan_styles",ee="nc_search_scan_overlay";let T=0,N=null;function ut(){if(typeof document>"u"||document.getElementById(Te))return;const e=document.createElement("style");e.id=Te,e.textContent=`
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
  `,document.head.appendChild(e)}function te(){if(typeof document>"u"||(ut(),T+=1,T>1))return;const e=document.getElementById(ee);if(e){N=e,e.classList.remove("nc_search_scan_overlay--exit"),e.style.opacity="1";return}const t=document.createElement("div");t.id=ee,t.className="nc_search_scan_overlay",t.setAttribute("aria-hidden","true");const n=document.createElement("div");n.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",t.appendChild(n),t.appendChild(a),document.body.appendChild(t),N=t}function ne(){if(typeof document>"u"||(T=Math.max(0,T-1),T>0))return;const e=N??document.getElementById(ee);if(!e){N=null;return}e.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{e.remove(),N===e&&(N=null)},420)}function pt(e,t){return e&&typeof e.record_count=="number"&&Number.isFinite(e.record_count)?`Sorgulama sonucunda ${e.record_count} kayıt bulundu.`:e&&typeof e.message=="string"&&e.message.trim()?e.message.trim():t.trim()?t.trim():"Yanıt alındı."}async function _t(e,t){var l;const n=new FormData;n.append("chatInput",t);const a=await fetch(e,{method:"POST",body:n}),r=await a.text(),c=a.headers.get("content-type")??"";let o=null;if(c.toLowerCase().includes("application/json"))try{o=JSON.parse(r)}catch{o=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:a.status,contentType:c,body:o??r});const i=o;return i!=null&&i.ok&&((l=i.geojson)==null?void 0:l.type)==="FeatureCollection"&&R(i.geojson),pt(i,r)}function ht(e){return`${e.replace(/\/$/,"")}/audio`}let B=null;async function ft(e,t){const n=ht(e),a=new FormData;a.append("chatInput",t);const r=await fetch(n,{method:"POST",body:a});if(!r.ok)throw new Error(`n8n audio isteği başarısız: ${r.status}`);const c=await r.blob();if(!c.size)return;const o=URL.createObjectURL(c),i=new Audio(o);i.preload="auto";const l=()=>{URL.revokeObjectURL(o),B===i&&(B=null)};B&&B.pause(),B=i,i.addEventListener("ended",l,{once:!0}),i.addEventListener("error",l,{once:!0});const s=async()=>{await i.play()};try{await s();return}catch(u){console.warn("[chatpanel] audio autoplay engellendi, sonraki etkileşimde tekrar denenecek",u)}const d=()=>{s().catch(u=>{console.error("[chatpanel] audio tekrar oynatma hatası",u),l()})};window.addEventListener("pointerdown",d,{once:!0,passive:!0})}function Be(e){const t=[],n=/\[([^\]]*)\]/g;let a=0,r;for(;(r=n.exec(e))!==null;){t.push(g(e.slice(a,r.index)));const o=(r[1]??"").trim();if(o.length===0)t.push(g(r[0]));else{const i=g(o);t.push(`<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${i}" title="${i}">${i}</a>`)}a=r.index+r[0].length}return t.push(g(e.slice(a))),t.join("")}function ae(e,t){e.innerHTML=Be(t)}function E(e){e.dataset.ncBracketCatDelegated!=="true"&&(e.dataset.ncBracketCatDelegated="true",e.addEventListener("click",t=>{var c;const n=t.target,a=(c=n==null?void 0:n.closest)==null?void 0:c.call(n,"a.nc_chatpanel_msg_catlink");if(!a)return;t.preventDefault();const r=a.getAttribute("data-cat")??"";console.log("[chatpanel] kategori linki",r)}))}function bt(e,t){const n=e.querySelector("#nc_chatpanel_form"),a=e.querySelector("#nc_chatpanel_input"),r=e.querySelector("#nc_chatpanel_messages");if(!n||!a||!r||n.dataset.ncBoundChat==="true")return;n.dataset.ncBoundChat="true",E(r);const c=(o,i)=>{const l=document.createElement("div");return l.className=`nc_chatpanel_msg ${o==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof i=="string"?l.textContent=i:l.appendChild(i),r.appendChild(l),x(r),l};n.addEventListener("submit",o=>{o.preventDefault();const i=a.value.trim();if(!i)return;c("user",i),a.value="",a.disabled=!0,te();const l=document.createElement("span");l.className="nc_chatpanel_typing",l.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const s=c("ai",l);_t(t,i).then(d=>{ae(s,d),x(r),ft(t,i).catch(u=>{console.error("[chatpanel] n8n audio oynatma hatası",u)})}).catch(d=>{console.error("[chatpanel] n8n istek hatası",d),s.textContent="Sorgu sırasında hata oluştu.",x(r)}).finally(()=>{ne(),a.disabled=!1,a.focus()})})}function Oe(){var l,s;const e=m();if(!(e!=null&&e.getBounds))return null;const t=e.getBounds(),n=(l=t.getSouthWest)==null?void 0:l.call(t),a=(s=t.getNorthEast)==null?void 0:s.call(t);if(!n||!a)return null;const r=typeof n.lng=="number"?n.lng:n.lon,c=typeof n.lat=="number"?n.lat:n.y,o=typeof a.lng=="number"?a.lng:a.lon,i=typeof a.lat=="number"?a.lat:a.y;return[r,c,o,i].every(d=>typeof d=="number"&&Number.isFinite(d))?[r,c,o,i]:null}const yt=100;let O=null;function mt(e){return`${e.replace(/\/$/,"")}/n8n/audio`}async function gt(e,t){const n=t.trim();if(!n)return;const a=new FormData;a.append("chatInput",n);const r=mt(e),c=await fetch(r,{method:"POST",body:a});if(!c.ok)throw new Error(`kentrehberi audio isteği başarısız: ${c.status}`);const o=await c.blob();if(!o.size)return;const i=URL.createObjectURL(o),l=new Audio(i);l.preload="auto";const s=()=>{URL.revokeObjectURL(i),O===l&&(O=null)};O&&O.pause(),O=l,l.addEventListener("ended",s,{once:!0}),l.addEventListener("error",s,{once:!0});const d=async()=>{await l.play()};try{await d();return}catch(p){console.warn("[chatpanel] kentrehberi audio autoplay engellendi, sonraki etkileşimde tekrar denenecek",p)}const u=()=>{d().catch(p=>{console.error("[chatpanel] kentrehberi audio tekrar oynatma hatası",p),s()})};window.addEventListener("pointerdown",u,{once:!0,passive:!0})}function wt(e){if(typeof e=="string")return e;if(e&&typeof e=="object"){const t=e.message;return typeof t=="string"&&t.trim()?t.trim():JSON.stringify(e)}return String(e)}async function vt(e,t){var r;if(!t)return;const n=c=>{E(t);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",ae(o,c),t.appendChild(o),x(t)},a=(c,o)=>{E(t);const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const l=document.createElement("div");l.className="nc_chatpanel_legend_intro",l.innerHTML=Be(c),i.appendChild(l);const s=et(o);s.length>0&&i.appendChild(tt(s,o)),t.appendChild(i),x(t)};try{const c=Oe();if(!c){console.warn("[chatpanel] Harita bbox alınamadı."),n("Harita alanı okunamadı.");return}const o=`${e}/db/kentrehberi_poi/features-by-bbox`,i=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:c})});let l=null;try{l=await i.json()}catch{l=null}const s=l;if(!i.ok){const u=s&&typeof s.error=="string"?s.error:`HTTP ${i.status}`;n(`Kayıtlar yüklenemedi: ${u}`);return}const d=s==null?void 0:s.geojson;if(d&&d.type==="FeatureCollection"){R(d);const u=typeof s.record_count=="number"&&Number.isFinite(s.record_count)?s.record_count:((r=d.features)==null?void 0:r.length)??0;a(`Haritaya ${u} kayıt eklendi`,d),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:o,record_count:u})}else n("GeoJSON yanıtı alınamadı.")}catch(c){console.error("[chatpanel] features-by-bbox hata",c),n("Kayıtlar yüklenirken hata oluştu.")}}function Ie(e,t){const n=e.querySelector("#nc_chatpanel_wisart_btn"),a=e.querySelector("#nc_chatpanel_messages");if(!n||n.dataset.ncBoundWisart==="true")return;n.dataset.ncBoundWisart="true";const r=c=>{if(!a)return;E(a);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",ae(o,c),a.appendChild(o),x(a)};n.addEventListener("click",async()=>{if(n.disabled)return;n.disabled=!0;const c=n.innerHTML;n.innerHTML='<span aria-hidden="true">...</span>',te();let o=!1;try{const i=Oe();if(!i){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}o=!0;const l=`${t}/n8n/kentrehberi`,s=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:i,faaliyet:"cami"})}),d=await s.text();let u=null;try{u=JSON.parse(d)}catch{u=d}console.log("[chatpanel] kentrehberi sonuç",{endpoint:l,status:s.status,data:u});const p=wt(u);r(p),gt(t,p).catch(h=>{console.error("[chatpanel] kentrehberi audio oynatma hatası",h)})}catch(i){console.error("[chatpanel] WISART hata",i),r("WISART isteğinde hata oluştu.")}finally{ne(),n.disabled=!1,n.innerHTML=c,o&&window.setTimeout(()=>{vt(t,a)},yt)}})}const De="nc_chatpanel_n8n_news_v1",xt=60*60*1e3;function kt(e){return`${e.replace(/\/$/,"")}/news`}function Ct(e){try{const t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleString("tr-TR",{dateStyle:"medium",timeStyle:"short"})}catch{return e}}function Et(e){Fe();const t=e.querySelector("#nc_chatpanel_haberler_body"),n=e.querySelector("#nc_chatpanel_sosyal_body"),a='<p class="nc_chatpanel_hint mb-0">Yükleniyor…</p>';t&&(t.innerHTML=a),n&&(n.innerHTML=a)}const Lt=180;function re(e,t=Lt){const n=e.replace(/\s+/g," ").trim();return n.length<=t?n:`${n.slice(0,Math.max(0,t-3)).trimEnd()}...`}function St(e){if(typeof e!="string")return null;const t=e.trim().toLowerCase();return t==="news"||t==="twitter"?t:null}function Nt(e){return w(e)?Array.isArray(e.features)?e.features:w(e.geojson)&&Array.isArray(e.geojson.features)?e.geojson.features:null:null}function At(e){const t=[],n=Nt(e);if(Array.isArray(n)){for(const c of n){if(!w(c)||!w(c.properties))continue;const o=c.properties,i=St(o.source);if(!i)continue;const l=typeof o.title=="string"?o.title:"",s=typeof o.date=="string"?o.date:"",d=typeof o.location=="string"?o.location:"",u=typeof o.short_description=="string"?o.short_description:"",p=re(u||l),h=c.geometry,b=w(h)&&typeof h.type=="string"?{type:"Feature",geometry:h,properties:o}:null;t.push({title:l,date:s,location:d,previewDescription:p,fullDescription:u,source:i,featureForMap:b})}return t}if(!w(e))return t;const a=e.twitter,r=e.news;if(Array.isArray(a))for(const c of a){if(!w(c))continue;const o=typeof c.text=="string"?c.text:"",i=typeof c.created_at=="string"?c.created_at:"";t.push({title:"",date:i,location:"",previewDescription:re(o),fullDescription:o,source:"twitter",featureForMap:null})}if(w(r)&&Array.isArray(r.haberler))for(const c of r.haberler){if(!w(c))continue;const o=typeof c.baslik=="string"?c.baslik:"",i=typeof c.tarih=="string"?c.tarih:"",l=typeof c.yer=="string"?c.yer:"",s=typeof c.kisa_aciklama=="string"?c.kisa_aciklama:"";t.push({title:o,date:i,location:l,previewDescription:re(s||o),fullDescription:s,source:"news",featureForMap:null})}return t}function He(e,t){e.forEach((n,a)=>{const r=t[a];r!=null&&r.featureForMap&&(n.addEventListener("mouseenter",()=>{const c=r.featureForMap;c&&R({type:"FeatureCollection",features:[c]})}),n.addEventListener("click",()=>{const c=r.featureForMap;c&&(R({type:"FeatureCollection",features:[c]}),st(c,{title:r.title,description:r.fullDescription||r.previewDescription,date:r.date,location:r.location,source:r.source}))}))})}function Re(e,t){Fe();const n=e.querySelector("#nc_chatpanel_haberler_body"),a=e.querySelector("#nc_chatpanel_sosyal_body");if(!n||!a)return;const r='<p class="nc_chatpanel_hint mb-0">Gösterilecek içerik yok.</p>',c=At(t),o=c.filter(l=>l.source==="twitter"),i=c.filter(l=>l.source==="news");if(o.length>0){const l=['<div class="nc_chatpanel_tweet_list">'];for(const s of o){const d=s.previewDescription||s.title,u=s.date?Ct(s.date):"",p=g(d).replace(/\n/g,"<br />");l.push(`<article class="nc_chatpanel_tweet_card">
        <div class="nc_chatpanel_tweet_meta">${g(u)}</div>
        <div class="nc_chatpanel_tweet_text">${p}</div>
      </article>`)}l.push("</div>"),a.innerHTML=l.join(""),He(a.querySelectorAll(".nc_chatpanel_tweet_card"),o)}else a.innerHTML=r;if(i.length>0){const l=['<div class="nc_chatpanel_haber_list">'];for(const s of i){const d=[s.date,s.location].filter(Boolean),u=d.length>0?`<div class="nc_chatpanel_haber_meta">${g(d.join(" · "))}</div>`:"";l.push(`<article class="nc_chatpanel_haber_card">
        <h3 class="nc_chatpanel_haber_title">${g(s.title)}</h3>
        ${u}
        <p class="nc_chatpanel_haber_desc">${g(s.previewDescription)}</p>
      </article>`)}l.push("</div>"),n.innerHTML=l.join(""),He(n.querySelectorAll(".nc_chatpanel_haber_card"),i)}else n.innerHTML=r}function Mt(e){if(typeof localStorage>"u")return null;try{const t=localStorage.getItem(De);if(!t)return null;const n=JSON.parse(t);return typeof n.ts!="number"||typeof n.endpoint!="string"||n.endpoint!==e||Date.now()-n.ts>xt?null:n}catch{return null}}function Pt(e){if(!(typeof localStorage>"u"))try{const t={ts:Date.now(),endpoint:e.endpoint,status:e.status,data:e.data};localStorage.setItem(De,JSON.stringify(t))}catch{}}async function $e(e,t,n){const a=kt(t),r=Mt(a);if(r){console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:r.status,data:r.data,fromCache:!0,cachedAt:new Date(r.ts).toISOString()}),Re(e,r.data);return}Et(e);try{const c=new FormData;c.append("chatInput","haberler");const o=await fetch(a,{method:"POST",body:c}),i=await o.text();let l=i;try{l=JSON.parse(i)}catch{}console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:o.status,data:l}),o.ok&&Pt({endpoint:a,status:o.status,data:l}),Re(e,l)}catch(c){console.error("[chatpanel] n8n news istek hatası",n,c);const o='<p class="nc_chatpanel_hint mb-0">Haberler yüklenirken hata oluştu.</p>',i=e.querySelector("#nc_chatpanel_haberler_body"),l=e.querySelector("#nc_chatpanel_sosyal_body");i&&(i.innerHTML=o),l&&(l.innerHTML=o)}}function ze(e,t){const n=e.querySelector("#nc_chatpanel_news_btn");n&&n.dataset.ncBoundNews!=="true"&&(n.dataset.ncBoundNews="true",n.addEventListener("click",async()=>{if(!n.disabled){n.disabled=!0;try{await $e(e,t,"toolbar")}finally{n.disabled=!1}}}))}const qe="nc_chatpanel_root",Ft="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";function Tt(e){if(!e.getElementById("nc_chatpanel_bootstrap_css")){const n=document.createElement("link");n.id="nc_chatpanel_bootstrap_css",n.rel="stylesheet",n.href=Ft,e.appendChild(n)}if(e.getElementById("nc_chatpanel_styles"))return;const t=document.createElement("style");t.id="nc_chatpanel_styles",t.textContent=`
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
      cursor: pointer;
      transition: background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
    }
    .nc_chatpanel_haber_card:hover {
      background: #fff4e6;
      border-color: #fdba74;
      box-shadow: 0 2px 8px rgba(249, 115, 22, 0.22);
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
      cursor: pointer;
      transition: background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
    }
    .nc_chatpanel_tweet_card:hover {
      background: #fff4e6;
      border-color: #fdba74;
      box-shadow: 0 2px 8px rgba(249, 115, 22, 0.22);
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
  `,e.appendChild(t)}function Bt(){return`
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
  `}const Ot="http://localhost:3001/api/n8n",It="http://localhost:3001/api",Dt="Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?";function Ht(e){var r,c;const t=(r=e.mapInstanceName)==null?void 0:r.trim();if(t)return t;if(typeof document>"u")return;const n=document.currentScript,a=(c=n==null?void 0:n.getAttribute("data-map-instance"))==null?void 0:c.trim();if(a)return a}function Rt(e){var n,a;const t=(n=e.n8nProxyUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,c=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(c)return c}return Ot}function $t(e){var n,a;const t=(n=e.dbApiUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,c=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(c)return c}return It}function zt(e){G();const t=e.querySelector("#nc_chatpanel_map_circle_btn");t&&j(t,e);const n=e.querySelector("#nc_chatpanel_messages"),a=e.querySelector("#nc_chatpanel_input");n&&n.replaceChildren(),a&&(a.value="",a.disabled=!1),dt(),oe(e),n&&(n.scrollTop=0)}function Ge(e){const t=e.querySelector("#nc_chatpanel_clear_btn");t&&t.dataset.ncBoundClear!=="true"&&(t.dataset.ncBoundClear="true",t.addEventListener("click",()=>{zt(e),console.log("[chatpanel] panel temizlendi")}))}function je(e,t){const n=e.querySelector(".nc_chatpanel_tabbar");if(!n||n.dataset.ncBoundTabs==="true")return;n.dataset.ncBoundTabs="true";const a=e.querySelector("#nc_chatpanel_tab_btn_kentrehberi"),r=e.querySelector("#nc_chatpanel_tab_btn_haberler"),c=e.querySelector("#nc_chatpanel_tab_btn_sosyal"),o=e.querySelector("#nc_chatpanel_tab_panel_kentrehberi"),i=e.querySelector("#nc_chatpanel_tab_panel_haberler"),l=e.querySelector("#nc_chatpanel_tab_panel_sosyal");if(!a||!r||!c||!o||!i||!l)return;const s=[{id:"kentrehberi",btn:a,panel:o},{id:"haberler",btn:r,panel:i},{id:"sosyal",btn:c,panel:l}];let d="kentrehberi";const u=p=>{for(const h of s){const b=h.id===p;h.btn.classList.toggle("nc_chatpanel_tab_btn--active",b),h.btn.setAttribute("aria-selected",b?"true":"false"),h.panel.classList.toggle("nc_chatpanel_tab_pane--active",b)}};for(const p of s)p.btn.addEventListener("click",()=>{p.id!==d&&(d=p.id,u(p.id),(p.id==="haberler"||p.id==="sosyal")&&$e(e,t,`sekme:${p.id}`))})}function oe(e){const t=e.querySelector("#nc_chatpanel_messages");if(!t||(E(t),t.querySelector('[data-nc-welcome-ai="true"]')))return;const n=document.createElement("div");n.className="nc_chatpanel_msg nc_chatpanel_msg_ai",n.setAttribute("data-nc-welcome-ai","true"),n.textContent=Dt,t.prepend(n)}function ce(e={}){const{container:t=document.body}=e;let n=document.getElementById(qe);const a=Ht(e),r=Rt(e),c=$t(e);if(We(a??null),n){a&&n.setAttribute("data-nc-map-instance",a);const l=n.shadowRoot;return l&&(je(l,r),Ie(l,c),ze(l,r),_e(l,{ensureBracketCategoryLinkDelegation:E}),Ge(l),oe(l)),n}n=document.createElement("div"),n.id=qe,n.className="nc_chatpanel_root",n.setAttribute("data-nc-chatpanel","true"),a&&n.setAttribute("data-nc-map-instance",a);const o=n.attachShadow({mode:"open"});Tt(o);const i=document.createElement("div");return i.className="nc_chatpanel_shell",i.innerHTML=Bt(),o.appendChild(i),t.appendChild(n),bt(o,r),je(o,r),Ie(o,c),ze(o,r),_e(o,{ensureBracketCategoryLinkDelegation:E}),Ge(o),oe(o),n}const qt={init:e=>ce(e??{}),getMapInstanceName:()=>Ke(),getRegisteredMap:m,getMaplibre:A};window.ChatPanel=qt;function Gt(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if(Gt()){const e=()=>ce({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return C.getMaplibre=A,C.getRegisteredMap=m,C.hideSearchScanOverlay=ne,C.initChatPanel=ce,C.showSearchScanOverlay=te,Object.defineProperty(C,Symbol.toStringTag,{value:"Module"}),C}({});
