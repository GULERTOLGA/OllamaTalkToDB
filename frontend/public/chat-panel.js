var ChatPanel=function(k){"use strict";let D=null;function He(e){D=e}function $e(){return D}function x(){var t;const e=D;return!e||typeof window>"u"?null:((t=window.__ncMapRegistry__)==null?void 0:t[e])??null}function T(){return window.maplibregl}function v(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}function y(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function m(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const O="nc_map_magnify_lens_root",ce=252,H=2.5,Re=500;let N=null,S=null;function $(){try{S==null||S()}catch{}}function R(){var e;if(!(typeof document>"u")){try{N==null||N()}catch{}N=null,S=null,(e=document.getElementById(O))==null||e.remove()}}function ze(){if(typeof document>"u")return!1;const e=window.maplibregl,t=x();if(!(e!=null&&e.Map)||!(t!=null&&t.getContainer)||typeof t.unproject!="function")return!1;R();const n=t.getContainer(),a=window.getComputedStyle(n).position;(a==="static"||a==="")&&(n.style.position="relative");const r=document.createElement("div");r.id=O,r.setAttribute("aria-hidden","true"),r.style.cssText="position:absolute;inset:0;pointer-events:none;z-index:6;overflow:visible;";const c=document.createElement("div");c.className="nc_map_magnify_lens",c.style.cssText=["position:absolute","display:none",`width:${ce}px`,`height:${ce}px`,"border-radius:50%","overflow:hidden","box-sizing:border-box","border:3px solid rgba(13,110,253,0.95)","box-shadow:0 0 0 2px rgba(255,255,255,0.85),0 8px 28px rgba(0,0,0,0.22)","pointer-events:none","transform:translate(-50%,-50%)","left:0","top:0"].join(";");const o=document.createElement("div");o.className="nc_map_magnify_lens_map",o.style.cssText="width:100%;height:100%;position:relative;",c.appendChild(o),r.appendChild(c),n.appendChild(r);let i=null;const l=()=>{i!==null&&(clearTimeout(i),i=null)};let s;try{const _=t.getCenter();s=new e.Map({container:o,style:t.getStyle(),center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+H,22),bearing:t.getBearing(),pitch:t.getPitch(),interactive:!1,attributionControl:!1,maxZoom:24})}catch(_){return console.warn("[chatpanel] Büyüteç mini harita oluşturulamadı",_),r.remove(),!1}let d=null;const u=()=>{var f,E;if(c.style.display==="none")return;const _=s.queryRenderedFeatures;if(typeof _=="function")try{const w=_.call(s),C=w.length,ae={},re={};for(const oe of w){const Ie=((f=oe.layer)==null?void 0:f.id)??"?",De=((E=oe.layer)==null?void 0:E.source)??oe.source??"?";ae[Ie]=(ae[Ie]??0)+1,re[De]=(re[De]??0)+1}console.log("[chatpanel] mercek 500ms durgun — görünen feature:",C,{katman:ae,kaynak:re})}catch(w){console.warn("[chatpanel] mercek queryRenderedFeatures",w)}},p=()=>{l(),i=window.setTimeout(()=>{i=null,window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{u()})})},Re)},h=()=>{if(!d)return;const _=t.unproject([d.x,d.y]);s.jumpTo({center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+H,22),bearing:t.getBearing(),pitch:t.getPitch()})},g=_=>{const f=_;f.point&&(d={x:f.point.x,y:f.point.y},c.style.left=`${f.point.x}px`,c.style.top=`${f.point.y}px`,c.style.display="block",h(),p())},b=()=>{h(),s.resize(),p()},B=()=>{l(),c.style.display="none",d=null};return S=()=>{try{const _=t.getStyle();if(!_)return;s.setStyle(_,{diff:!0})}catch{try{s.setStyle(t.getStyle())}catch(_){console.warn("[chatpanel] Büyüteç stil senkronu başarısız",_)}}if(d)h();else{const _=t.getCenter();s.jumpTo({center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+H,22),bearing:t.getBearing(),pitch:t.getPitch()})}try{s.resize()}catch{}p()},t.on("mousemove",g),t.on("move",b),t.on("zoom",b),t.on("rotate",b),t.on("pitch",b),n.addEventListener("mouseleave",B),window.requestAnimationFrame(()=>{try{s.resize()}catch{}p()}),N=()=>{l(),S=null,t.off("mousemove",g),t.off("move",b),t.off("zoom",b),t.off("rotate",b),t.off("pitch",b),n.removeEventListener("mouseleave",B);try{s.remove()}catch{}},!0}function z(e,t){const n=typeof document<"u"&&!!document.getElementById(O),a=!!t.querySelector('[data-nc-magnifier-panel="true"]'),r=n||a;e.classList.toggle("btn-primary",r),e.classList.toggle("btn-outline-primary",!r),e.setAttribute("aria-pressed",r?"true":"false")}function ie(e){var t;(t=e.querySelector('[data-nc-magnifier-panel="true"]'))==null||t.remove()}function qe(e,t,n){const a=e.querySelector("#nc_chatpanel_messages");if(!a)return;ie(e),n(a);const r=document.createElement("div");r.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend",r.setAttribute("data-nc-magnifier-panel","true");const c=document.createElement("div");c.className="nc_chatpanel_legend_intro",c.textContent="Büyüteç";const o=document.createElement("div");o.className="nc_chatpanel_legend";const i=document.createElement("div");i.className="nc_chatpanel_magnifier_scroll";const l=document.createElement("p");l.className="nc_chatpanel_hint mb-0",l.textContent=t?"Haritada fareyi hareket ettirdiğinizde merkezdeki yuvarlak lens, o noktayı yakınlaştırılmış gösterir; haritayı normal şekilde kaydırabilirsiniz. Büyüteci kapatmak için aynı düğmeye tekrar basın.":"Harita veya maplibregl bulunamadığı için lens gösterilemedi. Sayfayı yenileyip tekrar deneyin.",i.appendChild(l),o.appendChild(i),r.appendChild(c),r.appendChild(o),a.appendChild(r),v(a)}function le(e,t){const n=e.querySelector("#nc_chatpanel_map_circle_btn");n&&n.dataset.ncBoundMapCircle!=="true"&&(n.dataset.ncBoundMapCircle="true",z(n,e),n.addEventListener("click",()=>{const a=!!document.getElementById(O),r=!!e.querySelector('[data-nc-magnifier-panel="true"]');if(a||r)R(),ie(e);else{const o=ze();o||console.warn("[chatpanel] Harita veya maplibregl yok; büyüteç açılamadı."),qe(e,o,t.ensureBracketCategoryLinkDelegation)}z(n,e)}))}const M=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function se(e){if(e==null)return null;const t=String(e).trim();return t.length>0?t:null}function q(e){const t=se(e.faaliyet_adi);return t!==null?t:se(e["faaliyet-adi"])}function de(e){const t=new Set;for(const n of e.features??[]){const a=q(n.properties??{});a!==null&&t.add(a)}return Array.from(t).sort((n,a)=>n.localeCompare(a,"tr"))}function ue(e){if(e.startsWith("#")&&e.length===7){const t=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(1,3),16)*.78))),n=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(5,7),16)*.78)));return`#${t.toString(16).padStart(2,"0")}${n.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return e}function pe(e,t,n){if(e.length===0)return n;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<e.length;r++)a.push(e[r],t(r));return a.push(n),a}function Ge(e){var t;for(const n of e.features??[]){const a=(t=n==null?void 0:n.properties)==null?void 0:t.source;if(typeof a!="string")continue;const r=a.trim().toLowerCase();if(r==="news"||r==="twitter")return!0}return!1}function _e(e,t,n){var p,h,g,b,B,ne;if(Ge(n)){const _="#f97316",f="#9a3412",E=`${t}fill`,w=`${t}line`,C=`${t}point`;try{(p=e.getLayer)!=null&&p.call(e,E)&&(e.setPaintProperty(E,"fill-color",_),e.setPaintProperty(E,"fill-outline-color",f),e.setPaintProperty(E,"fill-opacity",.5)),(h=e.getLayer)!=null&&h.call(e,w)&&(e.setPaintProperty(w,"line-color",f),e.setPaintProperty(w,"line-width",4),e.setPaintProperty(w,"line-opacity",.95)),(g=e.getLayer)!=null&&g.call(e,C)&&(e.setPaintProperty(C,"circle-radius",U+1),e.setPaintProperty(C,"circle-stroke-width",W+1),e.setPaintProperty(C,"circle-color",_),e.setPaintProperty(C,"circle-stroke-color",f),e.setPaintProperty(C,"circle-opacity",.98))}catch{}return}const a=de(n),r="#999999",c=ue(r),o=M.length,i=pe(a,_=>M[_%o],r),l=pe(a,_=>ue(M[_%o]),c),s=`${t}fill`,d=`${t}line`,u=`${t}point`;try{(b=e.getLayer)!=null&&b.call(e,s)&&(e.setPaintProperty(s,"fill-color",i),e.setPaintProperty(s,"fill-outline-color",l)),(B=e.getLayer)!=null&&B.call(e,d)&&e.setPaintProperty(d,"line-color",l),(ne=e.getLayer)!=null&&ne.call(e,u)&&(e.setPaintProperty(u,"circle-radius",U),e.setPaintProperty(u,"circle-stroke-width",W),e.setPaintProperty(u,"circle-color",i),e.setPaintProperty(u,"circle-stroke-color","#ffffff"))}catch{}}const je="#999999",he="Belirtilmemiş";function Je(e){const t=de(e),n=M.length,a=new Map;t.forEach((i,l)=>{a.set(i,M[l%n])});const r=new Map;for(const i of t)r.set(i,0);let c=0;for(const i of e.features??[]){const l=q(i.properties??{});l===null?c+=1:r.set(l,(r.get(l)??0)+1)}const o=t.map(i=>({label:i,color:a.get(i),count:r.get(i)??0}));return c>0&&o.push({label:he,color:je,count:c}),o.sort((i,l)=>l.count!==i.count?l.count-i.count:i.label.localeCompare(l.label,"tr")),o}const G=5;function j(e,t){const n=document.createElement("ul");n.className="nc_chatpanel_legend_list";for(const{label:a,color:r,count:c}of e){const o=document.createElement("li");o.className="nc_chatpanel_legend_row nc_chatpanel_legend_row_hover";const i=document.createElement("span");i.className="nc_chatpanel_legend_swatch",i.style.backgroundColor=r,i.setAttribute("aria-hidden","true");const l=document.createElement("span");l.className="nc_chatpanel_legend_label",l.textContent=`${a} (${c})`,o.appendChild(i),o.appendChild(l),Ze(o,t,a),n.appendChild(o)}return n}function Ue(e,t){const n=document.createElement("div");n.className="nc_chatpanel_legend";const a=document.createElement("div");if(a.className="nc_chatpanel_legend_heading",a.textContent="Lejant",n.appendChild(a),e.length<=G)return n.appendChild(j(e,t)),n;const r=e.slice(0,G),c=e.slice(G);n.appendChild(j(r,t));const o=j(c,t),i=`nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;o.id=i,o.classList.add("nc_chatpanel_legend_list_extra"),o.hidden=!0,n.appendChild(o);const l=document.createElement("button");l.type="button",l.className="btn btn-link btn-sm nc_chatpanel_legend_expand_btn",l.setAttribute("aria-expanded","false"),l.setAttribute("aria-controls",i);const s=c.length;return l.textContent=`+ ${s} kategori daha`,l.addEventListener("click",()=>{o.hidden=!o.hidden;const d=!o.hidden;l.setAttribute("aria-expanded",String(d)),l.textContent=d?"Daha az göster":`+ ${s} kategori daha`;const u=n.closest("#nc_chatpanel_messages");u&&v(u)}),n.appendChild(l),n}function P(e,t){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){t.push([e[0],e[1]]);return}for(const n of e)P(n,t)}}function We(e,t){const n=q(e.properties??{});return t===he?n===null:n===t}function Ye(e){const t=[];if(P(e,t),t.length===0)return null;let n=0,a=0;for(const[r,c]of t)n+=r,a+=c;return[n/t.length,a/t.length]}function fe(e){if(!e)return[];const t=e.type;if(t==="Point"){const n=e.coordinates;return Array.isArray(n)&&n.length>=2&&typeof n[0]=="number"&&Number.isFinite(n[0])&&typeof n[1]=="number"&&Number.isFinite(n[1])?[[n[0],n[1]]]:[]}if(t==="MultiPoint"){const n=[];return P(e.coordinates,n),n}if(t==="LineString"||t==="Polygon"||t==="MultiLineString"||t==="MultiPolygon"){const n=Ye(e.coordinates);return n?[n]:[]}if(t==="GeometryCollection"&&Array.isArray(e.geometries)){const n=[];for(const a of e.geometries)n.push(...fe(a));return n}return[]}const J="__ncChatPanelLegendHoverMarkers";function I(e){var n;const t=e==null?void 0:e[J];if(Array.isArray(t))for(const a of t)try{(n=a.remove)==null||n.call(a)}catch{}e&&typeof e=="object"&&(e[J]=[])}function Ke(e,t,n){I(e);const a=T();if(!(a!=null&&a.Marker))return;const r=[];for(const c of t.features??[])if(We(c,n)){for(const o of fe(c.geometry))if(o.every(i=>typeof i=="number"&&Number.isFinite(i)))try{const i=new a.Marker;i.setLngLat(o),i.addTo(e),r.push(i)}catch{}}e[J]=r}function Ze(e,t,n){e.addEventListener("mouseenter",()=>{const a=x();a&&Ke(a,t,n)}),e.addEventListener("mouseleave",()=>{const a=x();a&&I(a)})}function be(e,t){const n=T();if(!(n!=null&&n.LngLatBounds))return;const a=[];for(const c of t.features??[]){const o=c==null?void 0:c.geometry;if(o){if(o.type==="GeometryCollection"&&Array.isArray(o.geometries)){for(const i of o.geometries)P(i==null?void 0:i.coordinates,a);continue}P(o.coordinates,a)}}if(a.length===0)return;const r=a.reduce((c,o)=>c.extend(o),new n.LngLatBounds(a[0],a[0]));e.fitBounds(r,{padding:48,duration:700,maxZoom:18})}const U=9,W=3,Ve=["Open Sans Semibold","Arial Unicode MS Regular"],ye=["step",["zoom"],!1,17,!0],me={"text-allow-overlap":ye,"text-ignore-placement":ye,"text-optional":!1};function Xe(e,t){var n;try{if(!((n=e.getLayer)!=null&&n.call(e,t)))return;for(const[a,r]of Object.entries(me))e.setLayoutProperty(t,a,r)}catch{}}const ge=["==","$type","Point"],we="#ffffff",xe="#2d2d2d";function ve(e,t,n){var r;const a=`${n}label`;if((r=e.getLayer)!=null&&r.call(e,a)){Xe(e,a);try{e.setFilter(a,ge),e.setPaintProperty(a,"text-color",we),e.setPaintProperty(a,"text-halo-color",xe)}catch{}return}e.addLayer({id:a,type:"symbol",source:t,filter:ge,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...Ve],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...me},paint:{"text-color":we,"text-halo-color":xe,"text-halo-width":1.25,"text-halo-blur":.25}})}const Y="nc_chatpanel_geojson",Ce="nc_chatpanel_geojson_";function Qe(){var r,c;const e=x();if(e&&I(e),!(e!=null&&e.getLayer)||!e.removeLayer)return;const t=e.__ncChatPanelAnim;t&&typeof t.rafId=="number"&&(cancelAnimationFrame(t.rafId),t.rafId=void 0);const n=Ce,a=[`${n}label`,`${n}point`,`${n}line`,`${n}fill`];try{for(const o of a)(r=e.getLayer)!=null&&r.call(e,o)&&e.removeLayer(o);(c=e.getSource)!=null&&c.call(e,Y)&&e.removeSource(Y)}catch{}$()}function K(e){var c;const t=x();if(!t||typeof t.addSource!="function")return;I(t);const n=Y,a=Ce,r=(c=t.getSource)==null?void 0:c.call(t,n);if(r&&typeof r.setData=="function"){r.setData(e),ve(t,n,a),_e(t,a,e),be(t,e),$();return}t.addSource(n,{type:"geojson",data:e}),t.addLayer({id:`${a}fill`,type:"fill",source:n,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),t.addLayer({id:`${a}line`,type:"line",source:n,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),t.addLayer({id:`${a}point`,type:"circle",source:n,filter:["==","$type","Point"],paint:{"circle-radius":U,"circle-color":"#22c55e","circle-stroke-width":W,"circle-stroke-color":"#ffffff"}}),ve(t,n,a),_e(t,a,e),be(t,e),$()}const ke="nc_search_scan_styles",Z="nc_search_scan_overlay";let F=0,A=null;function et(){if(typeof document>"u"||document.getElementById(ke))return;const e=document.createElement("style");e.id=ke,e.textContent=`
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
  `,document.head.appendChild(e)}function V(){if(typeof document>"u"||(et(),F+=1,F>1))return;const e=document.getElementById(Z);if(e){A=e,e.classList.remove("nc_search_scan_overlay--exit"),e.style.opacity="1";return}const t=document.createElement("div");t.id=Z,t.className="nc_search_scan_overlay",t.setAttribute("aria-hidden","true");const n=document.createElement("div");n.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",t.appendChild(n),t.appendChild(a),document.body.appendChild(t),A=t}function X(){if(typeof document>"u"||(F=Math.max(0,F-1),F>0))return;const e=A??document.getElementById(Z);if(!e){A=null;return}e.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{e.remove(),A===e&&(A=null)},420)}function tt(e,t){return e&&typeof e.record_count=="number"&&Number.isFinite(e.record_count)?`Sorgulama sonucunda ${e.record_count} kayıt bulundu.`:e&&typeof e.message=="string"&&e.message.trim()?e.message.trim():t.trim()?t.trim():"Yanıt alındı."}async function nt(e,t){var l;const n=new FormData;n.append("chatInput",t);const a=await fetch(e,{method:"POST",body:n}),r=await a.text(),c=a.headers.get("content-type")??"";let o=null;if(c.toLowerCase().includes("application/json"))try{o=JSON.parse(r)}catch{o=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:a.status,contentType:c,body:o??r});const i=o;return i!=null&&i.ok&&((l=i.geojson)==null?void 0:l.type)==="FeatureCollection"&&K(i.geojson),tt(i,r)}function Le(e){const t=[],n=/\[([^\]]*)\]/g;let a=0,r;for(;(r=n.exec(e))!==null;){t.push(y(e.slice(a,r.index)));const o=(r[1]??"").trim();if(o.length===0)t.push(y(r[0]));else{const i=y(o);t.push(`<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${i}" title="${i}">${i}</a>`)}a=r.index+r[0].length}return t.push(y(e.slice(a))),t.join("")}function Q(e,t){e.innerHTML=Le(t)}function L(e){e.dataset.ncBracketCatDelegated!=="true"&&(e.dataset.ncBracketCatDelegated="true",e.addEventListener("click",t=>{var c;const n=t.target,a=(c=n==null?void 0:n.closest)==null?void 0:c.call(n,"a.nc_chatpanel_msg_catlink");if(!a)return;t.preventDefault();const r=a.getAttribute("data-cat")??"";console.log("[chatpanel] kategori linki",r)}))}function at(e,t){const n=e.querySelector("#nc_chatpanel_form"),a=e.querySelector("#nc_chatpanel_input"),r=e.querySelector("#nc_chatpanel_messages");if(!n||!a||!r||n.dataset.ncBoundChat==="true")return;n.dataset.ncBoundChat="true",L(r);const c=(o,i)=>{const l=document.createElement("div");return l.className=`nc_chatpanel_msg ${o==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof i=="string"?l.textContent=i:l.appendChild(i),r.appendChild(l),v(r),l};n.addEventListener("submit",o=>{o.preventDefault();const i=a.value.trim();if(!i)return;c("user",i),a.value="",a.disabled=!0,V();const l=document.createElement("span");l.className="nc_chatpanel_typing",l.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const s=c("ai",l);nt(t,i).then(d=>{Q(s,d),v(r)}).catch(d=>{console.error("[chatpanel] n8n istek hatası",d),s.textContent="Sorgu sırasında hata oluştu.",v(r)}).finally(()=>{X(),a.disabled=!1,a.focus()})})}function Ee(){var l,s;const e=x();if(!(e!=null&&e.getBounds))return null;const t=e.getBounds(),n=(l=t.getSouthWest)==null?void 0:l.call(t),a=(s=t.getNorthEast)==null?void 0:s.call(t);if(!n||!a)return null;const r=typeof n.lng=="number"?n.lng:n.lon,c=typeof n.lat=="number"?n.lat:n.y,o=typeof a.lng=="number"?a.lng:a.lon,i=typeof a.lat=="number"?a.lat:a.y;return[r,c,o,i].every(d=>typeof d=="number"&&Number.isFinite(d))?[r,c,o,i]:null}const rt=100;async function ot(e,t){var r;if(!t)return;const n=c=>{L(t);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",Q(o,c),t.appendChild(o),v(t)},a=(c,o)=>{L(t);const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const l=document.createElement("div");l.className="nc_chatpanel_legend_intro",l.innerHTML=Le(c),i.appendChild(l);const s=Je(o);s.length>0&&i.appendChild(Ue(s,o)),t.appendChild(i),v(t)};try{const c=Ee();if(!c){console.warn("[chatpanel] Harita bbox alınamadı."),n("Harita alanı okunamadı.");return}const o=`${e}/db/kentrehberi_poi/features-by-bbox`,i=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:c})});let l=null;try{l=await i.json()}catch{l=null}const s=l;if(!i.ok){const u=s&&typeof s.error=="string"?s.error:`HTTP ${i.status}`;n(`Kayıtlar yüklenemedi: ${u}`);return}const d=s==null?void 0:s.geojson;if(d&&d.type==="FeatureCollection"){K(d);const u=typeof s.record_count=="number"&&Number.isFinite(s.record_count)?s.record_count:((r=d.features)==null?void 0:r.length)??0;a(`Haritaya ${u} kayıt eklendi`,d),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:o,record_count:u})}else n("GeoJSON yanıtı alınamadı.")}catch(c){console.error("[chatpanel] features-by-bbox hata",c),n("Kayıtlar yüklenirken hata oluştu.")}}function Se(e,t){const n=e.querySelector("#nc_chatpanel_wisart_btn"),a=e.querySelector("#nc_chatpanel_messages");if(!n||n.dataset.ncBoundWisart==="true")return;n.dataset.ncBoundWisart="true";const r=c=>{if(!a)return;L(a);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",Q(o,c),a.appendChild(o),v(a)};n.addEventListener("click",async()=>{if(n.disabled)return;n.disabled=!0;const c=n.innerHTML;n.innerHTML='<span aria-hidden="true">...</span>',V();let o=!1;try{const i=Ee();if(!i){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}o=!0;const l=`${t}/n8n/kentrehberi`,s=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:i,faaliyet:"cami"})}),d=await s.text();let u=null;try{u=JSON.parse(d)}catch{u=d}if(console.log("[chatpanel] kentrehberi sonuç",{endpoint:l,status:s.status,data:u}),typeof u=="string")r(u);else if(u&&typeof u=="object"){const p=u.message;typeof p=="string"&&p.trim()?r(p.trim()):r(JSON.stringify(u))}else r(String(u))}catch(i){console.error("[chatpanel] WISART hata",i),r("WISART isteğinde hata oluştu.")}finally{X(),n.disabled=!1,n.innerHTML=c,o&&window.setTimeout(()=>{ot(t,a)},rt)}})}const Ae="nc_chatpanel_n8n_news_v1",ct=60*60*1e3;function it(e){return`${e.replace(/\/$/,"")}/news`}function lt(e){try{const t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleString("tr-TR",{dateStyle:"medium",timeStyle:"short"})}catch{return e}}function st(e){const t=e.querySelector("#nc_chatpanel_haberler_body"),n=e.querySelector("#nc_chatpanel_sosyal_body"),a='<p class="nc_chatpanel_hint mb-0">Yükleniyor…</p>';t&&(t.innerHTML=a),n&&(n.innerHTML=a)}function dt(e){if(typeof e!="string")return null;const t=e.trim().toLowerCase();return t==="news"||t==="twitter"?t:null}function ut(e){return m(e)?Array.isArray(e.features)?e.features:m(e.geojson)&&Array.isArray(e.geojson.features)?e.geojson.features:null:null}function pt(e){const t=[],n=ut(e);if(Array.isArray(n)){for(const c of n){if(!m(c)||!m(c.properties))continue;const o=c.properties,i=dt(o.source);if(!i)continue;const l=typeof o.title=="string"?o.title:"",s=typeof o.date=="string"?o.date:"",d=typeof o.location=="string"?o.location:"",u=typeof o.short_description=="string"?o.short_description:"",p=c.geometry,h=m(p)&&typeof p.type=="string"?{type:"Feature",geometry:p,properties:o}:null;t.push({title:l,date:s,location:d,shortDescription:u,source:i,featureForMap:h})}return t}if(!m(e))return t;const a=e.twitter,r=e.news;if(Array.isArray(a))for(const c of a){if(!m(c))continue;const o=typeof c.text=="string"?c.text:"",i=typeof c.created_at=="string"?c.created_at:"";t.push({title:"",date:i,location:"",shortDescription:o,source:"twitter",featureForMap:null})}if(m(r)&&Array.isArray(r.haberler))for(const c of r.haberler){if(!m(c))continue;const o=typeof c.baslik=="string"?c.baslik:"",i=typeof c.tarih=="string"?c.tarih:"",l=typeof c.yer=="string"?c.yer:"",s=typeof c.kisa_aciklama=="string"?c.kisa_aciklama:"";t.push({title:o,date:i,location:l,shortDescription:s,source:"news",featureForMap:null})}return t}function Ne(e,t){e.forEach((n,a)=>{const r=t[a];r!=null&&r.featureForMap&&n.addEventListener("mouseenter",()=>{const c=r.featureForMap;c&&K({type:"FeatureCollection",features:[c]})})})}function Me(e,t){const n=e.querySelector("#nc_chatpanel_haberler_body"),a=e.querySelector("#nc_chatpanel_sosyal_body");if(!n||!a)return;const r='<p class="nc_chatpanel_hint mb-0">Gösterilecek içerik yok.</p>',c=pt(t),o=c.filter(l=>l.source==="twitter"),i=c.filter(l=>l.source==="news");if(o.length>0){const l=['<div class="nc_chatpanel_tweet_list">'];for(const s of o){const d=s.shortDescription||s.title,u=s.date?lt(s.date):"",p=y(d).replace(/\n/g,"<br />");l.push(`<article class="nc_chatpanel_tweet_card">
        <div class="nc_chatpanel_tweet_meta">${y(u)}</div>
        <div class="nc_chatpanel_tweet_text">${p}</div>
      </article>`)}l.push("</div>"),a.innerHTML=l.join(""),Ne(a.querySelectorAll(".nc_chatpanel_tweet_card"),o)}else a.innerHTML=r;if(i.length>0){const l=['<div class="nc_chatpanel_haber_list">'];for(const s of i){const d=[s.date,s.location].filter(Boolean),u=d.length>0?`<div class="nc_chatpanel_haber_meta">${y(d.join(" · "))}</div>`:"";l.push(`<article class="nc_chatpanel_haber_card">
        <h3 class="nc_chatpanel_haber_title">${y(s.title)}</h3>
        ${u}
        <p class="nc_chatpanel_haber_desc">${y(s.shortDescription)}</p>
      </article>`)}l.push("</div>"),n.innerHTML=l.join(""),Ne(n.querySelectorAll(".nc_chatpanel_haber_card"),i)}else n.innerHTML=r}function _t(e){if(typeof localStorage>"u")return null;try{const t=localStorage.getItem(Ae);if(!t)return null;const n=JSON.parse(t);return typeof n.ts!="number"||typeof n.endpoint!="string"||n.endpoint!==e||Date.now()-n.ts>ct?null:n}catch{return null}}function ht(e){if(!(typeof localStorage>"u"))try{const t={ts:Date.now(),endpoint:e.endpoint,status:e.status,data:e.data};localStorage.setItem(Ae,JSON.stringify(t))}catch{}}async function Pe(e,t,n){const a=it(t),r=_t(a);if(r){console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:r.status,data:r.data,fromCache:!0,cachedAt:new Date(r.ts).toISOString()}),Me(e,r.data);return}st(e);try{const c=new FormData;c.append("chatInput","haberler");const o=await fetch(a,{method:"POST",body:c}),i=await o.text();let l=i;try{l=JSON.parse(i)}catch{}console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:o.status,data:l}),o.ok&&ht({endpoint:a,status:o.status,data:l}),Me(e,l)}catch(c){console.error("[chatpanel] n8n news istek hatası",n,c);const o='<p class="nc_chatpanel_hint mb-0">Haberler yüklenirken hata oluştu.</p>',i=e.querySelector("#nc_chatpanel_haberler_body"),l=e.querySelector("#nc_chatpanel_sosyal_body");i&&(i.innerHTML=o),l&&(l.innerHTML=o)}}function Fe(e,t){const n=e.querySelector("#nc_chatpanel_news_btn");n&&n.dataset.ncBoundNews!=="true"&&(n.dataset.ncBoundNews="true",n.addEventListener("click",async()=>{if(!n.disabled){n.disabled=!0;try{await Pe(e,t,"toolbar")}finally{n.disabled=!1}}}))}const Be="nc_chatpanel_root",ft="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";function bt(e){if(!e.getElementById("nc_chatpanel_bootstrap_css")){const n=document.createElement("link");n.id="nc_chatpanel_bootstrap_css",n.rel="stylesheet",n.href=ft,e.appendChild(n)}if(e.getElementById("nc_chatpanel_styles"))return;const t=document.createElement("style");t.id="nc_chatpanel_styles",t.textContent=`
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
  `,e.appendChild(t)}function yt(){return`
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
  `}const mt="http://localhost:3001/api/n8n",gt="http://localhost:3001/api",wt="Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?";function xt(e){var r,c;const t=(r=e.mapInstanceName)==null?void 0:r.trim();if(t)return t;if(typeof document>"u")return;const n=document.currentScript,a=(c=n==null?void 0:n.getAttribute("data-map-instance"))==null?void 0:c.trim();if(a)return a}function vt(e){var n,a;const t=(n=e.n8nProxyUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,c=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(c)return c}return mt}function Ct(e){var n,a;const t=(n=e.dbApiUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,c=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(c)return c}return gt}function kt(e){R();const t=e.querySelector("#nc_chatpanel_map_circle_btn");t&&z(t,e);const n=e.querySelector("#nc_chatpanel_messages"),a=e.querySelector("#nc_chatpanel_input");n&&n.replaceChildren(),a&&(a.value="",a.disabled=!1),Qe(),ee(e),n&&(n.scrollTop=0)}function Te(e){const t=e.querySelector("#nc_chatpanel_clear_btn");t&&t.dataset.ncBoundClear!=="true"&&(t.dataset.ncBoundClear="true",t.addEventListener("click",()=>{kt(e),console.log("[chatpanel] panel temizlendi")}))}function Oe(e,t){const n=e.querySelector(".nc_chatpanel_tabbar");if(!n||n.dataset.ncBoundTabs==="true")return;n.dataset.ncBoundTabs="true";const a=e.querySelector("#nc_chatpanel_tab_btn_kentrehberi"),r=e.querySelector("#nc_chatpanel_tab_btn_haberler"),c=e.querySelector("#nc_chatpanel_tab_btn_sosyal"),o=e.querySelector("#nc_chatpanel_tab_panel_kentrehberi"),i=e.querySelector("#nc_chatpanel_tab_panel_haberler"),l=e.querySelector("#nc_chatpanel_tab_panel_sosyal");if(!a||!r||!c||!o||!i||!l)return;const s=[{id:"kentrehberi",btn:a,panel:o},{id:"haberler",btn:r,panel:i},{id:"sosyal",btn:c,panel:l}];let d="kentrehberi";const u=p=>{for(const h of s){const g=h.id===p;h.btn.classList.toggle("nc_chatpanel_tab_btn--active",g),h.btn.setAttribute("aria-selected",g?"true":"false"),h.panel.classList.toggle("nc_chatpanel_tab_pane--active",g)}};for(const p of s)p.btn.addEventListener("click",()=>{p.id!==d&&(d=p.id,u(p.id),(p.id==="haberler"||p.id==="sosyal")&&Pe(e,t,`sekme:${p.id}`))})}function ee(e){const t=e.querySelector("#nc_chatpanel_messages");if(!t||(L(t),t.querySelector('[data-nc-welcome-ai="true"]')))return;const n=document.createElement("div");n.className="nc_chatpanel_msg nc_chatpanel_msg_ai",n.setAttribute("data-nc-welcome-ai","true"),n.textContent=wt,t.prepend(n)}function te(e={}){const{container:t=document.body}=e;let n=document.getElementById(Be);const a=xt(e),r=vt(e),c=Ct(e);if(He(a??null),n){a&&n.setAttribute("data-nc-map-instance",a);const l=n.shadowRoot;return l&&(Oe(l,r),Se(l,c),Fe(l,r),le(l,{ensureBracketCategoryLinkDelegation:L}),Te(l),ee(l)),n}n=document.createElement("div"),n.id=Be,n.className="nc_chatpanel_root",n.setAttribute("data-nc-chatpanel","true"),a&&n.setAttribute("data-nc-map-instance",a);const o=n.attachShadow({mode:"open"});bt(o);const i=document.createElement("div");return i.className="nc_chatpanel_shell",i.innerHTML=yt(),o.appendChild(i),t.appendChild(n),at(o,r),Oe(o,r),Se(o,c),Fe(o,r),le(o,{ensureBracketCategoryLinkDelegation:L}),Te(o),ee(o),n}const Lt={init:e=>te(e??{}),getMapInstanceName:()=>$e(),getRegisteredMap:x,getMaplibre:T};window.ChatPanel=Lt;function Et(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if(Et()){const e=()=>te({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return k.getMaplibre=T,k.getRegisteredMap=x,k.hideSearchScanOverlay=X,k.initChatPanel=te,k.showSearchScanOverlay=V,Object.defineProperty(k,Symbol.toStringTag,{value:"Module"}),k}({});
