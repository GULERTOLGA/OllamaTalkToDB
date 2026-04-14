var ChatPanel=function(A){"use strict";let Y=null;function ot(e){Y=e}function it(){return Y}function v(){var t;const e=Y;return!e||typeof window>"u"?null:((t=window.__ncMapRegistry__)==null?void 0:t[e])??null}function F(){return window.maplibregl}function E(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}function k(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function C(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const q="nc_map_magnify_lens_root",ye=252,V=2.5,ct=500;let T=null,P=null;function Z(){try{P==null||P()}catch{}}function X(){var e;if(!(typeof document>"u")){try{T==null||T()}catch{}T=null,P=null,(e=document.getElementById(q))==null||e.remove()}}function lt(){if(typeof document>"u")return!1;const e=window.maplibregl,t=v();if(!(e!=null&&e.Map)||!(t!=null&&t.getContainer)||typeof t.unproject!="function")return!1;X();const n=t.getContainer(),a=window.getComputedStyle(n).position;(a==="static"||a==="")&&(n.style.position="relative");const r=document.createElement("div");r.id=q,r.setAttribute("aria-hidden","true"),r.style.cssText="position:absolute;inset:0;pointer-events:none;z-index:6;overflow:visible;";const o=document.createElement("div");o.className="nc_map_magnify_lens",o.style.cssText=["position:absolute","display:none",`width:${ye}px`,`height:${ye}px`,"border-radius:50%","overflow:hidden","box-sizing:border-box","border:3px solid rgba(13,110,253,0.95)","box-shadow:0 0 0 2px rgba(255,255,255,0.85),0 8px 28px rgba(0,0,0,0.22)","pointer-events:none","transform:translate(-50%,-50%)","left:0","top:0"].join(";");const i=document.createElement("div");i.className="nc_map_magnify_lens_map",i.style.cssText="width:100%;height:100%;position:relative;",o.appendChild(i),r.appendChild(o),n.appendChild(r);let c=null;const l=()=>{c!==null&&(clearTimeout(c),c=null)};let s;try{const _=t.getCenter();s=new e.Map({container:i,style:t.getStyle(),center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+V,22),bearing:t.getBearing(),pitch:t.getPitch(),interactive:!1,attributionControl:!1,maxZoom:24})}catch(_){return console.warn("[chatpanel] Büyüteç mini harita oluşturulamadı",_),r.remove(),!1}let d=null;const u=()=>{var x,z;if(o.style.display==="none")return;const _=s.queryRenderedFeatures;if(typeof _=="function")try{const b=_.call(s),S=b.length,y={},g={};for(const f of b){const at=((x=f.layer)==null?void 0:x.id)??"?",rt=((z=f.layer)==null?void 0:z.source)??f.source??"?";y[at]=(y[at]??0)+1,g[rt]=(g[rt]??0)+1}console.log("[chatpanel] mercek 500ms durgun — görünen feature:",S,{katman:y,kaynak:g})}catch(b){console.warn("[chatpanel] mercek queryRenderedFeatures",b)}},p=()=>{l(),c=window.setTimeout(()=>{c=null,window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{u()})})},ct)},h=()=>{if(!d)return;const _=t.unproject([d.x,d.y]);s.jumpTo({center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+V,22),bearing:t.getBearing(),pitch:t.getPitch()})},m=_=>{const x=_;x.point&&(d={x:x.point.x,y:x.point.y},o.style.left=`${x.point.x}px`,o.style.top=`${x.point.y}px`,o.style.display="block",h(),p())},w=()=>{h(),s.resize(),p()},R=()=>{l(),o.style.display="none",d=null};return P=()=>{try{const _=t.getStyle();if(!_)return;s.setStyle(_,{diff:!0})}catch{try{s.setStyle(t.getStyle())}catch(_){console.warn("[chatpanel] Büyüteç stil senkronu başarısız",_)}}if(d)h();else{const _=t.getCenter();s.jumpTo({center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+V,22),bearing:t.getBearing(),pitch:t.getPitch()})}try{s.resize()}catch{}p()},t.on("mousemove",m),t.on("move",w),t.on("zoom",w),t.on("rotate",w),t.on("pitch",w),n.addEventListener("mouseleave",R),window.requestAnimationFrame(()=>{try{s.resize()}catch{}p()}),T=()=>{l(),P=null,t.off("mousemove",m),t.off("move",w),t.off("zoom",w),t.off("rotate",w),t.off("pitch",w),n.removeEventListener("mouseleave",R);try{s.remove()}catch{}},!0}function Q(e,t){const n=typeof document<"u"&&!!document.getElementById(q),a=!!t.querySelector('[data-nc-magnifier-panel="true"]'),r=n||a;e.classList.toggle("btn-primary",r),e.classList.toggle("btn-outline-primary",!r),e.setAttribute("aria-pressed",r?"true":"false")}function ge(e){var t;(t=e.querySelector('[data-nc-magnifier-panel="true"]'))==null||t.remove()}function st(e,t,n){const a=e.querySelector("#nc_chatpanel_messages");if(!a)return;ge(e),n(a);const r=document.createElement("div");r.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend",r.setAttribute("data-nc-magnifier-panel","true");const o=document.createElement("div");o.className="nc_chatpanel_legend_intro",o.textContent="Büyüteç";const i=document.createElement("div");i.className="nc_chatpanel_legend";const c=document.createElement("div");c.className="nc_chatpanel_magnifier_scroll";const l=document.createElement("p");l.className="nc_chatpanel_hint mb-0",l.textContent=t?"Haritada fareyi hareket ettirdiğinizde merkezdeki yuvarlak lens, o noktayı yakınlaştırılmış gösterir; haritayı normal şekilde kaydırabilirsiniz. Büyüteci kapatmak için aynı düğmeye tekrar basın.":"Harita veya maplibregl bulunamadığı için lens gösterilemedi. Sayfayı yenileyip tekrar deneyin.",c.appendChild(l),i.appendChild(c),r.appendChild(o),r.appendChild(i),a.appendChild(r),E(a)}function me(e,t){const n=e.querySelector("#nc_chatpanel_map_circle_btn");n&&n.dataset.ncBoundMapCircle!=="true"&&(n.dataset.ncBoundMapCircle="true",Q(n,e),n.addEventListener("click",()=>{const a=!!document.getElementById(q),r=!!e.querySelector('[data-nc-magnifier-panel="true"]');if(a||r)X(),ge(e);else{const i=lt();i||console.warn("[chatpanel] Harita veya maplibregl yok; büyüteç açılamadı."),st(e,i,t.ensureBracketCategoryLinkDelegation)}Q(n,e)}))}const B=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function we(e){if(e==null)return null;const t=String(e).trim();return t.length>0?t:null}function ee(e){const t=we(e.faaliyet_adi);return t!==null?t:we(e["faaliyet-adi"])}function xe(e){const t=new Set;for(const n of e.features??[]){const a=ee(n.properties??{});a!==null&&t.add(a)}return Array.from(t).sort((n,a)=>n.localeCompare(a,"tr"))}function ve(e){if(e.startsWith("#")&&e.length===7){const t=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(1,3),16)*.78))),n=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(5,7),16)*.78)));return`#${t.toString(16).padStart(2,"0")}${n.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return e}function ke(e,t,n){if(e.length===0)return n;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<e.length;r++)a.push(e[r],t(r));return a.push(n),a}function dt(e){var t;for(const n of e.features??[]){const a=(t=n==null?void 0:n.properties)==null?void 0:t.source;if(typeof a!="string")continue;const r=a.trim().toLowerCase();if(r==="news"||r==="twitter")return!0}return!1}function Ce(e,t,n){var p,h,m,w,R,be,_,x,z;if(dt(n)){const b="#f97316",S="#9a3412",y=`${t}fill`,g=`${t}line`,f=`${t}point`;try{(p=e.getLayer)!=null&&p.call(e,y)&&(e.setPaintProperty(y,"fill-color",b),e.setPaintProperty(y,"fill-outline-color",S),e.setPaintProperty(y,"fill-opacity",.5)),(h=e.getLayer)!=null&&h.call(e,g)&&(e.setPaintProperty(g,"line-color",S),e.setPaintProperty(g,"line-width",4),e.setPaintProperty(g,"line-opacity",.95)),(m=e.getLayer)!=null&&m.call(e,f)&&(e.setPaintProperty(f,"circle-radius",j+1),e.setPaintProperty(f,"circle-stroke-width",U+1),e.setPaintProperty(f,"circle-color",b),e.setPaintProperty(f,"circle-stroke-color",S),e.setPaintProperty(f,"circle-opacity",.98))}catch{}return}const a=xe(n);if(a.length===0){const b="#2563eb",S="#1e3a8a",y=`${t}fill`,g=`${t}line`,f=`${t}point`;try{(w=e.getLayer)!=null&&w.call(e,y)&&(e.setPaintProperty(y,"fill-color",b),e.setPaintProperty(y,"fill-outline-color",S),e.setPaintProperty(y,"fill-opacity",.45)),(R=e.getLayer)!=null&&R.call(e,g)&&(e.setPaintProperty(g,"line-color",S),e.setPaintProperty(g,"line-width",4),e.setPaintProperty(g,"line-opacity",.95)),(be=e.getLayer)!=null&&be.call(e,f)&&(e.setPaintProperty(f,"circle-radius",j+1),e.setPaintProperty(f,"circle-stroke-width",U+1),e.setPaintProperty(f,"circle-color",b),e.setPaintProperty(f,"circle-stroke-color","#ffffff"),e.setPaintProperty(f,"circle-opacity",.98))}catch{}return}const r="#999999",o=ve(r),i=B.length,c=ke(a,b=>B[b%i],r),l=ke(a,b=>ve(B[b%i]),o),s=`${t}fill`,d=`${t}line`,u=`${t}point`;try{(_=e.getLayer)!=null&&_.call(e,s)&&(e.setPaintProperty(s,"fill-color",c),e.setPaintProperty(s,"fill-outline-color",l)),(x=e.getLayer)!=null&&x.call(e,d)&&e.setPaintProperty(d,"line-color",l),(z=e.getLayer)!=null&&z.call(e,u)&&(e.setPaintProperty(u,"circle-radius",j),e.setPaintProperty(u,"circle-stroke-width",U),e.setPaintProperty(u,"circle-color",c),e.setPaintProperty(u,"circle-stroke-color","#ffffff"))}catch{}}const ut="#999999",Ee="Belirtilmemiş";function pt(e){const t=xe(e),n=B.length,a=new Map;t.forEach((c,l)=>{a.set(c,B[l%n])});const r=new Map;for(const c of t)r.set(c,0);let o=0;for(const c of e.features??[]){const l=ee(c.properties??{});l===null?o+=1:r.set(l,(r.get(l)??0)+1)}const i=t.map(c=>({label:c,color:a.get(c),count:r.get(c)??0}));return o>0&&i.push({label:Ee,color:ut,count:o}),i.sort((c,l)=>l.count!==c.count?l.count-c.count:c.label.localeCompare(l.label,"tr")),i}const te=5;function ne(e,t){const n=document.createElement("ul");n.className="nc_chatpanel_legend_list";for(const{label:a,color:r,count:o}of e){const i=document.createElement("li");i.className="nc_chatpanel_legend_row nc_chatpanel_legend_row_hover";const c=document.createElement("span");c.className="nc_chatpanel_legend_swatch",c.style.backgroundColor=r,c.setAttribute("aria-hidden","true");const l=document.createElement("span");l.className="nc_chatpanel_legend_label",l.textContent=`${a} (${o})`,i.appendChild(c),i.appendChild(l),bt(i,t,a),n.appendChild(i)}return n}function _t(e,t){const n=document.createElement("div");n.className="nc_chatpanel_legend";const a=document.createElement("div");if(a.className="nc_chatpanel_legend_heading",a.textContent="Lejant",n.appendChild(a),e.length<=te)return n.appendChild(ne(e,t)),n;const r=e.slice(0,te),o=e.slice(te);n.appendChild(ne(r,t));const i=ne(o,t),c=`nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;i.id=c,i.classList.add("nc_chatpanel_legend_list_extra"),i.hidden=!0,n.appendChild(i);const l=document.createElement("button");l.type="button",l.className="btn btn-link btn-sm nc_chatpanel_legend_expand_btn",l.setAttribute("aria-expanded","false"),l.setAttribute("aria-controls",c);const s=o.length;return l.textContent=`+ ${s} kategori daha`,l.addEventListener("click",()=>{i.hidden=!i.hidden;const d=!i.hidden;l.setAttribute("aria-expanded",String(d)),l.textContent=d?"Daha az göster":`+ ${s} kategori daha`;const u=n.closest("#nc_chatpanel_messages");u&&E(u)}),n.appendChild(l),n}function O(e,t){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){t.push([e[0],e[1]]);return}for(const n of e)O(n,t)}}function ht(e,t){const n=ee(e.properties??{});return t===Ee?n===null:n===t}function Le(e){const t=[];if(O(e,t),t.length===0)return null;let n=0,a=0;for(const[r,o]of t)n+=r,a+=o;return[n/t.length,a/t.length]}function Se(e){if(!e)return[];const t=e.type;if(t==="Point"){const n=e.coordinates;return Array.isArray(n)&&n.length>=2&&typeof n[0]=="number"&&Number.isFinite(n[0])&&typeof n[1]=="number"&&Number.isFinite(n[1])?[[n[0],n[1]]]:[]}if(t==="MultiPoint"){const n=[];return O(e.coordinates,n),n}if(t==="LineString"||t==="Polygon"||t==="MultiLineString"||t==="MultiPolygon"){const n=Le(e.coordinates);return n?[n]:[]}if(t==="GeometryCollection"&&Array.isArray(e.geometries)){const n=[];for(const a of e.geometries)n.push(...Se(a));return n}return[]}const ae="__ncChatPanelLegendHoverMarkers";function G(e){var n;const t=e==null?void 0:e[ae];if(Array.isArray(t))for(const a of t)try{(n=a.remove)==null||n.call(a)}catch{}e&&typeof e=="object"&&(e[ae]=[])}function ft(e,t,n){G(e);const a=F();if(!(a!=null&&a.Marker))return;const r=[];for(const o of t.features??[])if(ht(o,n)){for(const i of Se(o.geometry))if(i.every(c=>typeof c=="number"&&Number.isFinite(c)))try{const c=new a.Marker;c.setLngLat(i),c.addTo(e),r.push(c)}catch{}}e[ae]=r}function bt(e,t,n){e.addEventListener("mouseenter",()=>{const a=v();a&&ft(a,t,n)}),e.addEventListener("mouseleave",()=>{const a=v();a&&G(a)})}function Ae(e,t){const n=F();if(!(n!=null&&n.LngLatBounds))return;const a=[];for(const o of t.features??[]){const i=o==null?void 0:o.geometry;if(i){if(i.type==="GeometryCollection"&&Array.isArray(i.geometries)){for(const c of i.geometries)O(c==null?void 0:c.coordinates,a);continue}O(i.coordinates,a)}}if(a.length===0)return;const r=a.reduce((o,i)=>o.extend(i),new n.LngLatBounds(a[0],a[0]));e.fitBounds(r,{padding:48,duration:700,maxZoom:18})}const j=9,U=3,yt=["Open Sans Semibold","Arial Unicode MS Regular"],Ne=["step",["zoom"],!1,17,!0],Pe={"text-allow-overlap":Ne,"text-ignore-placement":Ne,"text-optional":!1};function gt(e,t){var n;try{if(!((n=e.getLayer)!=null&&n.call(e,t)))return;for(const[a,r]of Object.entries(Pe))e.setLayoutProperty(t,a,r)}catch{}}const Me=["==","$type","Point"],Fe="#ffffff",Te="#2d2d2d";function Be(e,t,n){var r;const a=`${n}label`;if((r=e.getLayer)!=null&&r.call(e,a)){gt(e,a);try{e.setFilter(a,Me),e.setPaintProperty(a,"text-color",Fe),e.setPaintProperty(a,"text-halo-color",Te)}catch{}return}e.addLayer({id:a,type:"symbol",source:t,filter:Me,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...yt],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...Pe},paint:{"text-color":Fe,"text-halo-color":Te,"text-halo-width":1.25,"text-halo-blur":.25}})}const re="nc_chatpanel_geojson",Oe="nc_chatpanel_geojson_",oe="__ncChatPanelNewsHoverMarker",Ie="nc_chatpanel_news_hover_styles";function mt(){if(typeof document>"u"||document.getElementById(Ie))return;const e=document.createElement("style");e.id=Ie,e.textContent=`
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
  `,document.head.appendChild(e)}function ie(e){var n;const t=e==null?void 0:e[oe];try{(n=t==null?void 0:t.remove)==null||n.call(t)}catch{}e&&typeof e=="object"&&(e[oe]=null)}function De(e){if(!e)return null;if(e.type==="Point"){const t=e.coordinates;return Array.isArray(t)&&t.length>=2&&typeof t[0]=="number"&&Number.isFinite(t[0])&&typeof t[1]=="number"&&Number.isFinite(t[1])?[t[0],t[1]]:null}if(e.type==="GeometryCollection"&&Array.isArray(e.geometries)){const t=[];for(const a of e.geometries){const r=De(a);r&&t.push(r)}if(t.length===0)return null;const n=t.reduce((a,[r,o])=>[a[0]+r,a[1]+o],[0,0]);return[n[0]/t.length,n[1]/t.length]}return Le(e.coordinates)}function wt(e){const t=document.createElement("div");t.className="nc_news_hover_root";const n=document.createElement("div");n.className="nc_news_hover_balloon";const a=document.createElement("div");a.className="nc_news_hover_title",a.textContent=e.title.trim()||"(Başlık yok)";const r=document.createElement("div");r.className="nc_news_hover_meta";const o=[e.source,e.date,e.location].filter(l=>typeof l=="string"&&l.trim().length>0).map(l=>String(l).trim());r.textContent=o.join(" · ");const i=document.createElement("div");i.className="nc_news_hover_desc",i.textContent=e.description.trim()||"(Açıklama yok)",n.appendChild(a),r.textContent&&n.appendChild(r),n.appendChild(i),t.appendChild(n);const c=document.createElement("div");return c.className="nc_news_hover_pin",t.appendChild(c),t}function xt(e,t){const n=v();if(!n)return;ie(n);const a=De(e.geometry);if(!a)return;const r=F();if(r!=null&&r.Marker){mt();try{const o=wt(t),i=new r.Marker({element:o,anchor:"bottom"});i.setLngLat(a),i.addTo(n),n[oe]=i}catch{}}}function He(){const e=v();e&&ie(e)}function vt(){var r,o;const e=v();if(e&&(G(e),ie(e)),!(e!=null&&e.getLayer)||!e.removeLayer)return;const t=e.__ncChatPanelAnim;t&&typeof t.rafId=="number"&&(cancelAnimationFrame(t.rafId),t.rafId=void 0);const n=Oe,a=[`${n}label`,`${n}point`,`${n}line`,`${n}fill`];try{for(const i of a)(r=e.getLayer)!=null&&r.call(e,i)&&e.removeLayer(i);(o=e.getSource)!=null&&o.call(e,re)&&e.removeSource(re)}catch{}Z()}function J(e){var o;const t=v();if(!t||typeof t.addSource!="function")return;G(t);const n=re,a=Oe,r=(o=t.getSource)==null?void 0:o.call(t,n);if(r&&typeof r.setData=="function"){r.setData(e),Be(t,n,a),Ce(t,a,e),Ae(t,e),Z();return}t.addSource(n,{type:"geojson",data:e}),t.addLayer({id:`${a}fill`,type:"fill",source:n,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),t.addLayer({id:`${a}line`,type:"line",source:n,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),t.addLayer({id:`${a}point`,type:"circle",source:n,filter:["==","$type","Point"],paint:{"circle-radius":j,"circle-color":"#22c55e","circle-stroke-width":U,"circle-stroke-color":"#ffffff"}}),Be(t,n,a),Ce(t,a,e),Ae(t,e),Z()}const $e=[];let W=!0,I=null,K=null;function kt(){if(I){try{I.pause()}catch{}I=null}K&&(URL.revokeObjectURL(K),K=null)}function D(e){for(const t of $e){t.root.hidden=!W,t.stopBtn.disabled=!I;const n=Math.max(0,Math.min(100,Math.round(e*100)));t.fill.style.width=`${n}%`}}function H(){kt(),D(0)}function Re(e){if(W=e,!W){H();return}D(0)}async function ce(e){if(!W||!e.size)return;H();const t=URL.createObjectURL(e),n=new Audio(t);n.preload="auto",I=n,K=t;const a=()=>{const c=n.duration,l=n.currentTime;if(!Number.isFinite(c)||c<=0){D(0);return}D(l/c)},r=()=>{H()};n.addEventListener("timeupdate",a),n.addEventListener("ended",r,{once:!0}),n.addEventListener("error",r,{once:!0});const o=async()=>{await n.play()};try{await o();return}catch(c){console.warn("[chatpanel] audio autoplay engellendi, sonraki etkileşimde tekrar denenecek",c)}const i=()=>{o().catch(c=>{console.error("[chatpanel] audio tekrar oynatma hatası",c),H()})};window.addEventListener("pointerdown",i,{once:!0,passive:!0})}function ze(e){const t=e.querySelector("#nc_chatpanel_audio_trackbar"),n=e.querySelector("#nc_chatpanel_audio_trackbar_fill"),a=e.querySelector("#nc_chatpanel_audio_stop_btn");!t||!n||!a||t.dataset.ncBoundAudioTrackbar!=="true"&&(t.dataset.ncBoundAudioTrackbar="true",$e.push({root:t,fill:n,stopBtn:a}),a.addEventListener("click",()=>{H()}),D(0))}const qe="nc_chatpanel_audio_enabled_v1";function Ct(){if(typeof localStorage>"u")return!0;try{const e=localStorage.getItem(qe);return e===null?!0:e!=="0"}catch{return!0}}function Et(e){if(!(typeof localStorage>"u"))try{localStorage.setItem(qe,e?"1":"0")}catch{}}let L=Ct();function le(){return L}function Ge(e,t){e.classList.toggle("btn-success",t),e.classList.toggle("btn-outline-light",!t),e.setAttribute("aria-pressed",t?"true":"false"),e.title=t?"Sesli okuma açık":"Sesli okuma kapalı",e.textContent=t?"Seslendirme: Açık":"Seslendirme: Kapalı"}function je(e){const t=e.querySelector("#nc_chatpanel_audio_toggle_btn");t&&t.dataset.ncBoundAudioToggle!=="true"&&(t.dataset.ncBoundAudioToggle="true",Ge(t,L),Re(L),t.addEventListener("click",()=>{L=!L,Et(L),Ge(t,L),Re(L)}))}const Ue="nc_search_scan_styles",se="nc_search_scan_overlay";let $=0,M=null;function Lt(){if(typeof document>"u"||document.getElementById(Ue))return;const e=document.createElement("style");e.id=Ue,e.textContent=`
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
  `,document.head.appendChild(e)}function de(){if(typeof document>"u"||(Lt(),$+=1,$>1))return;const e=document.getElementById(se);if(e){M=e,e.classList.remove("nc_search_scan_overlay--exit"),e.style.opacity="1";return}const t=document.createElement("div");t.id=se,t.className="nc_search_scan_overlay",t.setAttribute("aria-hidden","true");const n=document.createElement("div");n.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",t.appendChild(n),t.appendChild(a),document.body.appendChild(t),M=t}function ue(){if(typeof document>"u"||($=Math.max(0,$-1),$>0))return;const e=M??document.getElementById(se);if(!e){M=null;return}e.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{e.remove(),M===e&&(M=null)},420)}function St(e,t){return e&&typeof e.record_count=="number"&&Number.isFinite(e.record_count)?`Sorgulama sonucunda ${e.record_count} kayıt bulundu.`:e&&typeof e.message=="string"&&e.message.trim()?e.message.trim():t.trim()?t.trim():"Yanıt alındı."}async function At(e,t){var l;const n=new FormData;n.append("chatInput",t);const a=await fetch(e,{method:"POST",body:n}),r=await a.text(),o=a.headers.get("content-type")??"";let i=null;if(o.toLowerCase().includes("application/json"))try{i=JSON.parse(r)}catch{i=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:a.status,contentType:o,body:i??r});const c=i;return c!=null&&c.ok&&((l=c.geojson)==null?void 0:l.type)==="FeatureCollection"&&J(c.geojson),St(c,r)}function Nt(e){return`${e.replace(/\/$/,"")}/audio`}async function Pt(e,t){if(!le())return;const n=Nt(e),a=new FormData;a.append("chatInput",t);const r=await fetch(n,{method:"POST",body:a});if(!r.ok)throw new Error(`n8n audio isteği başarısız: ${r.status}`);const o=await r.blob();await ce(o)}function Je(e){const t=[],n=/\[([^\]]*)\]/g;let a=0,r;for(;(r=n.exec(e))!==null;){t.push(k(e.slice(a,r.index)));const i=(r[1]??"").trim();if(i.length===0)t.push(k(r[0]));else{const c=k(i);t.push(`<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${c}" title="${c}">${c}</a>`)}a=r.index+r[0].length}return t.push(k(e.slice(a))),t.join("")}function pe(e,t){e.innerHTML=Je(t)}function N(e){e.dataset.ncBracketCatDelegated!=="true"&&(e.dataset.ncBracketCatDelegated="true",e.addEventListener("click",t=>{var o;const n=t.target,a=(o=n==null?void 0:n.closest)==null?void 0:o.call(n,"a.nc_chatpanel_msg_catlink");if(!a)return;t.preventDefault();const r=a.getAttribute("data-cat")??"";console.log("[chatpanel] kategori linki",r)}))}function Mt(e,t){const n=e.querySelector("#nc_chatpanel_form"),a=e.querySelector("#nc_chatpanel_input"),r=e.querySelector("#nc_chatpanel_messages");if(!n||!a||!r||n.dataset.ncBoundChat==="true")return;n.dataset.ncBoundChat="true",N(r);const o=(i,c)=>{const l=document.createElement("div");return l.className=`nc_chatpanel_msg ${i==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof c=="string"?l.textContent=c:l.appendChild(c),r.appendChild(l),E(r),l};n.addEventListener("submit",i=>{i.preventDefault();const c=a.value.trim();if(!c)return;o("user",c),a.value="",a.disabled=!0,de();const l=document.createElement("span");l.className="nc_chatpanel_typing",l.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const s=o("ai",l);At(t,c).then(d=>{pe(s,d),E(r),Pt(t,c).catch(u=>{console.error("[chatpanel] n8n audio oynatma hatası",u)})}).catch(d=>{console.error("[chatpanel] n8n istek hatası",d),s.textContent="Sorgu sırasında hata oluştu.",E(r)}).finally(()=>{ue(),a.disabled=!1,a.focus()})})}function We(){var l,s;const e=v();if(!(e!=null&&e.getBounds))return null;const t=e.getBounds(),n=(l=t.getSouthWest)==null?void 0:l.call(t),a=(s=t.getNorthEast)==null?void 0:s.call(t);if(!n||!a)return null;const r=typeof n.lng=="number"?n.lng:n.lon,o=typeof n.lat=="number"?n.lat:n.y,i=typeof a.lng=="number"?a.lng:a.lon,c=typeof a.lat=="number"?a.lat:a.y;return[r,o,i,c].every(d=>typeof d=="number"&&Number.isFinite(d))?[r,o,i,c]:null}const Ft=100;function Tt(e){return`${e.replace(/\/$/,"")}/n8n/audio`}async function Bt(e,t){if(!le())return;const n=t.trim();if(!n)return;const a=new FormData;a.append("chatInput",n);const r=Tt(e),o=await fetch(r,{method:"POST",body:a});if(!o.ok)throw new Error(`kentrehberi audio isteği başarısız: ${o.status}`);const i=await o.blob();await ce(i)}function Ot(e){if(typeof e=="string")return e;if(e&&typeof e=="object"){const t=e.message;return typeof t=="string"&&t.trim()?t.trim():JSON.stringify(e)}return String(e)}async function It(e,t){var r;if(!t)return;const n=o=>{N(t);const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai",pe(i,o),t.appendChild(i),E(t)},a=(o,i)=>{N(t);const c=document.createElement("div");c.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const l=document.createElement("div");l.className="nc_chatpanel_legend_intro",l.innerHTML=Je(o),c.appendChild(l);const s=pt(i);s.length>0&&c.appendChild(_t(s,i)),t.appendChild(c),E(t)};try{const o=We();if(!o){console.warn("[chatpanel] Harita bbox alınamadı."),n("Harita alanı okunamadı.");return}const i=`${e}/db/kentrehberi_poi/features-by-bbox`,c=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:o})});let l=null;try{l=await c.json()}catch{l=null}const s=l;if(!c.ok){const u=s&&typeof s.error=="string"?s.error:`HTTP ${c.status}`;n(`Kayıtlar yüklenemedi: ${u}`);return}const d=s==null?void 0:s.geojson;if(d&&d.type==="FeatureCollection"){J(d);const u=typeof s.record_count=="number"&&Number.isFinite(s.record_count)?s.record_count:((r=d.features)==null?void 0:r.length)??0;a(`Haritaya ${u} kayıt eklendi`,d),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:i,record_count:u})}else n("GeoJSON yanıtı alınamadı.")}catch(o){console.error("[chatpanel] features-by-bbox hata",o),n("Kayıtlar yüklenirken hata oluştu.")}}function Ke(e,t){const n=e.querySelector("#nc_chatpanel_wisart_btn"),a=e.querySelector("#nc_chatpanel_messages");if(!n||n.dataset.ncBoundWisart==="true")return;n.dataset.ncBoundWisart="true";const r=o=>{if(!a)return;N(a);const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai",pe(i,o),a.appendChild(i),E(a)};n.addEventListener("click",async()=>{if(n.disabled)return;n.disabled=!0;const o=n.innerHTML;n.innerHTML='<span aria-hidden="true">...</span>',de();let i=!1;try{const c=We();if(!c){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}i=!0;const l=`${t}/n8n/kentrehberi`,s=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:c,faaliyet:"cami"})}),d=await s.text();let u=null;try{u=JSON.parse(d)}catch{u=d}console.log("[chatpanel] kentrehberi sonuç",{endpoint:l,status:s.status,data:u});const p=Ot(u);r(p),Bt(t,p).catch(h=>{console.error("[chatpanel] kentrehberi audio oynatma hatası",h)})}catch(c){console.error("[chatpanel] WISART hata",c),r("WISART isteğinde hata oluştu.")}finally{ue(),n.disabled=!1,n.innerHTML=o,i&&window.setTimeout(()=>{It(t,a)},Ft)}})}const Ye="nc_chatpanel_n8n_news_v1",Dt=60*60*1e3;function Ht(e){return`${e.replace(/\/$/,"")}/news`}function $t(e){try{const t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleString("tr-TR",{dateStyle:"medium",timeStyle:"short"})}catch{return e}}function Rt(e){He();const t=e.querySelector("#nc_chatpanel_haberler_body"),n=e.querySelector("#nc_chatpanel_sosyal_body"),a='<p class="nc_chatpanel_hint mb-0">Yükleniyor…</p>';t&&(t.innerHTML=a),n&&(n.innerHTML=a)}const zt=180;function _e(e,t=zt){const n=e.replace(/\s+/g," ").trim();return n.length<=t?n:`${n.slice(0,Math.max(0,t-3)).trimEnd()}...`}function qt(e){if(typeof e!="string")return null;const t=e.trim().toLowerCase();return t==="news"||t==="twitter"?t:null}function Gt(e){return C(e)?Array.isArray(e.features)?e.features:C(e.geojson)&&Array.isArray(e.geojson.features)?e.geojson.features:null:null}function jt(e){const t=[],n=Gt(e);if(Array.isArray(n)){for(const o of n){if(!C(o)||!C(o.properties))continue;const i=o.properties,c=qt(i.source);if(!c)continue;const l=typeof i.title=="string"?i.title:"",s=typeof i.date=="string"?i.date:"",d=typeof i.location=="string"?i.location:"",u=typeof i.short_description=="string"?i.short_description:"",p=_e(u||l),h=o.geometry,m=C(h)&&typeof h.type=="string"?{type:"Feature",geometry:h,properties:i}:null;t.push({title:l,date:s,location:d,previewDescription:p,fullDescription:u,source:c,featureForMap:m})}return t}if(!C(e))return t;const a=e.twitter,r=e.news;if(Array.isArray(a))for(const o of a){if(!C(o))continue;const i=typeof o.text=="string"?o.text:"",c=typeof o.created_at=="string"?o.created_at:"";t.push({title:"",date:c,location:"",previewDescription:_e(i),fullDescription:i,source:"twitter",featureForMap:null})}if(C(r)&&Array.isArray(r.haberler))for(const o of r.haberler){if(!C(o))continue;const i=typeof o.baslik=="string"?o.baslik:"",c=typeof o.tarih=="string"?o.tarih:"",l=typeof o.yer=="string"?o.yer:"",s=typeof o.kisa_aciklama=="string"?o.kisa_aciklama:"";t.push({title:i,date:c,location:l,previewDescription:_e(s||i),fullDescription:s,source:"news",featureForMap:null})}return t}function Ve(e,t,n){e.forEach((a,r)=>{const o=t[r];o!=null&&o.featureForMap&&(a.addEventListener("mouseenter",()=>{const i=o.featureForMap;i&&J({type:"FeatureCollection",features:[i]})}),a.addEventListener("click",()=>{const i=o.featureForMap;if(!i)return;J({type:"FeatureCollection",features:[i]}),xt(i,{title:o.title,description:o.fullDescription||o.previewDescription,date:o.date,location:o.location,source:o.source});const c=(o.fullDescription||"").trim();!c||!le()||Jt(n,c).catch(l=>{console.error("[chatpanel] news audio oynatma hatası",l)})}))})}function Ut(e){return`${e.replace(/\/$/,"")}/audio`}async function Jt(e,t){const n=Ut(e),a=new FormData;a.append("chatInput",t);const r=await fetch(n,{method:"POST",body:a});if(!r.ok)throw new Error(`n8n news audio isteği başarısız: ${r.status}`);const o=await r.blob();await ce(o)}function Ze(e,t,n){He();const a=e.querySelector("#nc_chatpanel_haberler_body"),r=e.querySelector("#nc_chatpanel_sosyal_body");if(!a||!r)return;const o='<p class="nc_chatpanel_hint mb-0">Gösterilecek içerik yok.</p>',i=jt(t),c=i.filter(s=>s.source==="twitter"),l=i.filter(s=>s.source==="news");if(c.length>0){const s=['<div class="nc_chatpanel_tweet_list">'];for(const d of c){const u=d.previewDescription||d.title,p=d.date?$t(d.date):"",h=k(u).replace(/\n/g,"<br />");s.push(`<article class="nc_chatpanel_tweet_card">
        <div class="nc_chatpanel_tweet_meta">${k(p)}</div>
        <div class="nc_chatpanel_tweet_text">${h}</div>
      </article>`)}s.push("</div>"),r.innerHTML=s.join(""),Ve(r.querySelectorAll(".nc_chatpanel_tweet_card"),c,n)}else r.innerHTML=o;if(l.length>0){const s=['<div class="nc_chatpanel_haber_list">'];for(const d of l){const u=[d.date,d.location].filter(Boolean),p=u.length>0?`<div class="nc_chatpanel_haber_meta">${k(u.join(" · "))}</div>`:"";s.push(`<article class="nc_chatpanel_haber_card">
        <h3 class="nc_chatpanel_haber_title">${k(d.title)}</h3>
        ${p}
        <p class="nc_chatpanel_haber_desc">${k(d.previewDescription)}</p>
      </article>`)}s.push("</div>"),a.innerHTML=s.join(""),Ve(a.querySelectorAll(".nc_chatpanel_haber_card"),l,n)}else a.innerHTML=o}function Wt(e){if(typeof localStorage>"u")return null;try{const t=localStorage.getItem(Ye);if(!t)return null;const n=JSON.parse(t);return typeof n.ts!="number"||typeof n.endpoint!="string"||n.endpoint!==e||Date.now()-n.ts>Dt?null:n}catch{return null}}function Kt(e){if(!(typeof localStorage>"u"))try{const t={ts:Date.now(),endpoint:e.endpoint,status:e.status,data:e.data};localStorage.setItem(Ye,JSON.stringify(t))}catch{}}async function Xe(e,t,n){const a=Ht(t),r=Wt(a);if(r){console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:r.status,data:r.data,fromCache:!0,cachedAt:new Date(r.ts).toISOString()}),Ze(e,r.data,t);return}Rt(e);try{const o=new FormData;o.append("chatInput","haberler");const i=await fetch(a,{method:"POST",body:o}),c=await i.text();let l=c;try{l=JSON.parse(c)}catch{}console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:i.status,data:l}),i.ok&&Kt({endpoint:a,status:i.status,data:l}),Ze(e,l,t)}catch(o){console.error("[chatpanel] n8n news istek hatası",n,o);const i='<p class="nc_chatpanel_hint mb-0">Haberler yüklenirken hata oluştu.</p>',c=e.querySelector("#nc_chatpanel_haberler_body"),l=e.querySelector("#nc_chatpanel_sosyal_body");c&&(c.innerHTML=i),l&&(l.innerHTML=i)}}function Qe(e,t){const n=e.querySelector("#nc_chatpanel_news_btn");n&&n.dataset.ncBoundNews!=="true"&&(n.dataset.ncBoundNews="true",n.addEventListener("click",async()=>{if(!n.disabled){n.disabled=!0;try{await Xe(e,t,"toolbar")}finally{n.disabled=!1}}}))}const et="nc_chatpanel_root",Yt="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";function Vt(e){if(!e.getElementById("nc_chatpanel_bootstrap_css")){const n=document.createElement("link");n.id="nc_chatpanel_bootstrap_css",n.rel="stylesheet",n.href=Yt,e.appendChild(n)}if(e.getElementById("nc_chatpanel_styles"))return;const t=document.createElement("style");t.id="nc_chatpanel_styles",t.textContent=`
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .nc_chatpanel_header_title {
      font-weight: 600;
      letter-spacing: 0.01em;
    }
    .nc_chatpanel_audio_trackbar {
      flex-shrink: 0;
      height: 18px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 8px;
      background: #e9ecef;
      border-bottom: 1px solid #ced4da;
    }
    .nc_chatpanel_audio_trackbar_line {
      flex: 1 1 auto;
      height: 6px;
      border-radius: 999px;
      background: #adb5bd;
      overflow: hidden;
    }
    .nc_chatpanel_audio_trackbar_fill {
      display: block;
      height: 100%;
      width: 0%;
      background: #0b5ed7;
      transition: width 0.1s linear;
    }
    .nc_chatpanel_audio_trackbar_stop {
      border: none;
      background: transparent;
      color: #495057;
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      padding: 0;
      cursor: pointer;
    }
    .nc_chatpanel_audio_trackbar_stop:disabled {
      opacity: 0.45;
      cursor: default;
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
  `,e.appendChild(t)}function Zt(){return`
    <div class="nc_chatpanel_header bg-primary text-white px-3 py-2">
      <span class="nc_chatpanel_header_title">neCO Keos AI</span>
      <button
        type="button"
        class="btn btn-success btn-sm nc_chatpanel_audio_toggle_btn"
        id="nc_chatpanel_audio_toggle_btn"
        title="Sesli okuma açık"
        aria-label="Sesli okuma aç kapa"
        aria-pressed="true"
      >
        Seslendirme: Açık
      </button>
    </div>
    <div class="nc_chatpanel_audio_trackbar" id="nc_chatpanel_audio_trackbar" hidden>
      <span class="nc_chatpanel_audio_trackbar_line" aria-hidden="true">
        <span class="nc_chatpanel_audio_trackbar_fill" id="nc_chatpanel_audio_trackbar_fill"></span>
      </span>
      <button
        type="button"
        class="nc_chatpanel_audio_trackbar_stop"
        id="nc_chatpanel_audio_stop_btn"
        title="Çalmayı durdur"
        aria-label="Çalmayı durdur"
      >
        ■
      </button>
    </div>
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
  `}const Xt="http://localhost:3001/api/n8n",Qt="http://localhost:3001/api",en="Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?";function tn(e){var r,o;const t=(r=e.mapInstanceName)==null?void 0:r.trim();if(t)return t;if(typeof document>"u")return;const n=document.currentScript,a=(o=n==null?void 0:n.getAttribute("data-map-instance"))==null?void 0:o.trim();if(a)return a}function nn(e){var n,a;const t=(n=e.n8nProxyUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,o=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(o)return o}return Xt}function an(e){var n,a;const t=(n=e.dbApiUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,o=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(o)return o}return Qt}function rn(e){X();const t=e.querySelector("#nc_chatpanel_map_circle_btn");t&&Q(t,e);const n=e.querySelector("#nc_chatpanel_messages"),a=e.querySelector("#nc_chatpanel_input");n&&n.replaceChildren(),a&&(a.value="",a.disabled=!1),vt(),he(e),n&&(n.scrollTop=0)}function tt(e){const t=e.querySelector("#nc_chatpanel_clear_btn");t&&t.dataset.ncBoundClear!=="true"&&(t.dataset.ncBoundClear="true",t.addEventListener("click",()=>{rn(e),console.log("[chatpanel] panel temizlendi")}))}function nt(e,t){const n=e.querySelector(".nc_chatpanel_tabbar");if(!n||n.dataset.ncBoundTabs==="true")return;n.dataset.ncBoundTabs="true";const a=e.querySelector("#nc_chatpanel_tab_btn_kentrehberi"),r=e.querySelector("#nc_chatpanel_tab_btn_haberler"),o=e.querySelector("#nc_chatpanel_tab_btn_sosyal"),i=e.querySelector("#nc_chatpanel_tab_panel_kentrehberi"),c=e.querySelector("#nc_chatpanel_tab_panel_haberler"),l=e.querySelector("#nc_chatpanel_tab_panel_sosyal");if(!a||!r||!o||!i||!c||!l)return;const s=[{id:"kentrehberi",btn:a,panel:i},{id:"haberler",btn:r,panel:c},{id:"sosyal",btn:o,panel:l}];let d="kentrehberi";const u=p=>{for(const h of s){const m=h.id===p;h.btn.classList.toggle("nc_chatpanel_tab_btn--active",m),h.btn.setAttribute("aria-selected",m?"true":"false"),h.panel.classList.toggle("nc_chatpanel_tab_pane--active",m)}};for(const p of s)p.btn.addEventListener("click",()=>{p.id!==d&&(d=p.id,u(p.id),(p.id==="haberler"||p.id==="sosyal")&&Xe(e,t,`sekme:${p.id}`))})}function he(e){const t=e.querySelector("#nc_chatpanel_messages");if(!t||(N(t),t.querySelector('[data-nc-welcome-ai="true"]')))return;const n=document.createElement("div");n.className="nc_chatpanel_msg nc_chatpanel_msg_ai",n.setAttribute("data-nc-welcome-ai","true"),n.textContent=en,t.prepend(n)}function fe(e={}){const{container:t=document.body}=e;let n=document.getElementById(et);const a=tn(e),r=nn(e),o=an(e);if(ot(a??null),n){a&&n.setAttribute("data-nc-map-instance",a);const l=n.shadowRoot;return l&&(nt(l,r),ze(l),je(l),Ke(l,o),Qe(l,r),me(l,{ensureBracketCategoryLinkDelegation:N}),tt(l),he(l)),n}n=document.createElement("div"),n.id=et,n.className="nc_chatpanel_root",n.setAttribute("data-nc-chatpanel","true"),a&&n.setAttribute("data-nc-map-instance",a);const i=n.attachShadow({mode:"open"});Vt(i);const c=document.createElement("div");return c.className="nc_chatpanel_shell",c.innerHTML=Zt(),i.appendChild(c),t.appendChild(n),Mt(i,r),nt(i,r),ze(i),je(i),Ke(i,o),Qe(i,r),me(i,{ensureBracketCategoryLinkDelegation:N}),tt(i),he(i),n}const on={init:e=>fe(e??{}),getMapInstanceName:()=>it(),getRegisteredMap:v,getMaplibre:F};window.ChatPanel=on;function cn(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if(cn()){const e=()=>fe({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return A.getMaplibre=F,A.getRegisteredMap=v,A.hideSearchScanOverlay=ue,A.initChatPanel=fe,A.showSearchScanOverlay=de,Object.defineProperty(A,Symbol.toStringTag,{value:"Module"}),A}({});
