var ChatPanel=function(N){"use strict";let V=null;function _t(e){V=e}function ht(){return V}function E(){var t;const e=V;return!e||typeof window>"u"?null:((t=window.__ncMapRegistry__)==null?void 0:t[e])??null}function F(){return window.maplibregl}function v(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}function C(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function L(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const U="nc_map_magnify_lens_root",ge=252,Z=2.5,ft=500;let O=null,T=null;function X(){try{T==null||T()}catch{}}function Q(){var e;if(!(typeof document>"u")){try{O==null||O()}catch{}O=null,T=null,(e=document.getElementById(U))==null||e.remove()}}function mt(){if(typeof document>"u")return!1;const e=window.maplibregl,t=E();if(!(e!=null&&e.Map)||!(t!=null&&t.getContainer)||typeof t.unproject!="function")return!1;Q();const n=t.getContainer(),a=window.getComputedStyle(n).position;(a==="static"||a==="")&&(n.style.position="relative");const r=document.createElement("div");r.id=U,r.setAttribute("aria-hidden","true"),r.style.cssText="position:absolute;inset:0;pointer-events:none;z-index:6;overflow:visible;";const o=document.createElement("div");o.className="nc_map_magnify_lens",o.style.cssText=["position:absolute","display:none",`width:${ge}px`,`height:${ge}px`,"border-radius:50%","overflow:hidden","box-sizing:border-box","border:3px solid rgba(13,110,253,0.95)","box-shadow:0 0 0 2px rgba(255,255,255,0.85),0 8px 28px rgba(0,0,0,0.22)","pointer-events:none","transform:translate(-50%,-50%)","left:0","top:0"].join(";");const i=document.createElement("div");i.className="nc_map_magnify_lens_map",i.style.cssText="width:100%;height:100%;position:relative;",o.appendChild(i),r.appendChild(o),n.appendChild(r);let c=null;const l=()=>{c!==null&&(clearTimeout(c),c=null)};let s;try{const m=t.getCenter();s=new e.Map({container:i,style:t.getStyle(),center:[m.lng,m.lat],zoom:Math.min(t.getZoom()+Z,22),bearing:t.getBearing(),pitch:t.getPitch(),interactive:!1,attributionControl:!1,maxZoom:24})}catch(m){return console.warn("[chatpanel] Büyüteç mini harita oluşturulamadı",m),r.remove(),!1}let d=null;const u=()=>{var w,j;if(o.style.display==="none")return;const m=s.queryRenderedFeatures;if(typeof m=="function")try{const g=m.call(s),A=g.length,k={},x={};for(const y of g){const ut=((w=y.layer)==null?void 0:w.id)??"?",pt=((j=y.layer)==null?void 0:j.source)??y.source??"?";k[ut]=(k[ut]??0)+1,x[pt]=(x[pt]??0)+1}console.log("[chatpanel] mercek 500ms durgun — görünen feature:",A,{katman:k,kaynak:x})}catch(g){console.warn("[chatpanel] mercek queryRenderedFeatures",g)}},h=()=>{l(),c=window.setTimeout(()=>{c=null,window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{u()})})},ft)},_=()=>{if(!d)return;const m=t.unproject([d.x,d.y]);s.jumpTo({center:[m.lng,m.lat],zoom:Math.min(t.getZoom()+Z,22),bearing:t.getBearing(),pitch:t.getPitch()})},p=m=>{const w=m;w.point&&(d={x:w.point.x,y:w.point.y},o.style.left=`${w.point.x}px`,o.style.top=`${w.point.y}px`,o.style.display="block",_(),h())},f=()=>{_(),s.resize(),h()},b=()=>{l(),o.style.display="none",d=null};return T=()=>{try{const m=t.getStyle();if(!m)return;s.setStyle(m,{diff:!0})}catch{try{s.setStyle(t.getStyle())}catch(m){console.warn("[chatpanel] Büyüteç stil senkronu başarısız",m)}}if(d)_();else{const m=t.getCenter();s.jumpTo({center:[m.lng,m.lat],zoom:Math.min(t.getZoom()+Z,22),bearing:t.getBearing(),pitch:t.getPitch()})}try{s.resize()}catch{}h()},t.on("mousemove",p),t.on("move",f),t.on("zoom",f),t.on("rotate",f),t.on("pitch",f),n.addEventListener("mouseleave",b),window.requestAnimationFrame(()=>{try{s.resize()}catch{}h()}),O=()=>{l(),T=null,t.off("mousemove",p),t.off("move",f),t.off("zoom",f),t.off("rotate",f),t.off("pitch",f),n.removeEventListener("mouseleave",b);try{s.remove()}catch{}},!0}function ee(e,t){const n=typeof document<"u"&&!!document.getElementById(U),a=!!t.querySelector('[data-nc-magnifier-panel="true"]'),r=n||a;e.classList.toggle("btn-primary",r),e.classList.toggle("btn-outline-primary",!r),e.setAttribute("aria-pressed",r?"true":"false")}function we(e){var t;(t=e.querySelector('[data-nc-magnifier-panel="true"]'))==null||t.remove()}function bt(e,t,n){const a=e.querySelector("#nc_chatpanel_messages");if(!a)return;we(e),n(a);const r=document.createElement("div");r.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend",r.setAttribute("data-nc-magnifier-panel","true");const o=document.createElement("div");o.className="nc_chatpanel_legend_intro",o.textContent="Büyüteç";const i=document.createElement("div");i.className="nc_chatpanel_legend";const c=document.createElement("div");c.className="nc_chatpanel_magnifier_scroll";const l=document.createElement("p");l.className="nc_chatpanel_hint mb-0",l.textContent=t?"Haritada fareyi hareket ettirdiğinizde merkezdeki yuvarlak lens, o noktayı yakınlaştırılmış gösterir; haritayı normal şekilde kaydırabilirsiniz. Büyüteci kapatmak için aynı düğmeye tekrar basın.":"Harita veya maplibregl bulunamadığı için lens gösterilemedi. Sayfayı yenileyip tekrar deneyin.",c.appendChild(l),i.appendChild(c),r.appendChild(o),r.appendChild(i),a.appendChild(r),v(a)}function ke(e,t){const n=e.querySelector("#nc_chatpanel_map_circle_btn");n&&n.dataset.ncBoundMapCircle!=="true"&&(n.dataset.ncBoundMapCircle="true",ee(n,e),n.addEventListener("click",()=>{const a=!!document.getElementById(U),r=!!e.querySelector('[data-nc-magnifier-panel="true"]');if(a||r)Q(),we(e);else{const i=mt();i||console.warn("[chatpanel] Harita veya maplibregl yok; büyüteç açılamadı."),bt(e,i,t.ensureBracketCategoryLinkDelegation)}ee(n,e)}))}const I=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function xe(e){if(e==null)return null;const t=String(e).trim();return t.length>0?t:null}function te(e){const t=xe(e.faaliyet_adi);return t!==null?t:xe(e["faaliyet-adi"])}function ve(e){const t=new Set;for(const n of e.features??[]){const a=te(n.properties??{});a!==null&&t.add(a)}return Array.from(t).sort((n,a)=>n.localeCompare(a,"tr"))}function Ee(e){if(e.startsWith("#")&&e.length===7){const t=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(1,3),16)*.78))),n=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(5,7),16)*.78)));return`#${t.toString(16).padStart(2,"0")}${n.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return e}function Ce(e,t,n){if(e.length===0)return n;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<e.length;r++)a.push(e[r],t(r));return a.push(n),a}function yt(e){var t;for(const n of e.features??[]){const a=(t=n==null?void 0:n.properties)==null?void 0:t.source;if(typeof a!="string")continue;const r=a.trim().toLowerCase();if(r==="news"||r==="twitter")return!0}return!1}function Se(e,t,n){var h,_,p,f,b,M,m,w,j;if(yt(n)){const g="#f97316",A="#9a3412",k=`${t}fill`,x=`${t}line`,y=`${t}point`;try{(h=e.getLayer)!=null&&h.call(e,k)&&(e.setPaintProperty(k,"fill-color",g),e.setPaintProperty(k,"fill-outline-color",A),e.setPaintProperty(k,"fill-opacity",.5)),(_=e.getLayer)!=null&&_.call(e,x)&&(e.setPaintProperty(x,"line-color",A),e.setPaintProperty(x,"line-width",4),e.setPaintProperty(x,"line-opacity",.95)),(p=e.getLayer)!=null&&p.call(e,y)&&(e.setPaintProperty(y,"circle-radius",K+1),e.setPaintProperty(y,"circle-stroke-width",J+1),e.setPaintProperty(y,"circle-color",g),e.setPaintProperty(y,"circle-stroke-color",A),e.setPaintProperty(y,"circle-opacity",.98))}catch{}return}const a=ve(n);if(a.length===0){const g="#2563eb",A="#1e3a8a",k=`${t}fill`,x=`${t}line`,y=`${t}point`;try{(f=e.getLayer)!=null&&f.call(e,k)&&(e.setPaintProperty(k,"fill-color",g),e.setPaintProperty(k,"fill-outline-color",A),e.setPaintProperty(k,"fill-opacity",.45)),(b=e.getLayer)!=null&&b.call(e,x)&&(e.setPaintProperty(x,"line-color",A),e.setPaintProperty(x,"line-width",4),e.setPaintProperty(x,"line-opacity",.95)),(M=e.getLayer)!=null&&M.call(e,y)&&(e.setPaintProperty(y,"circle-radius",K+1),e.setPaintProperty(y,"circle-stroke-width",J+1),e.setPaintProperty(y,"circle-color",g),e.setPaintProperty(y,"circle-stroke-color","#ffffff"),e.setPaintProperty(y,"circle-opacity",.98))}catch{}return}const r="#999999",o=Ee(r),i=I.length,c=Ce(a,g=>I[g%i],r),l=Ce(a,g=>Ee(I[g%i]),o),s=`${t}fill`,d=`${t}line`,u=`${t}point`;try{(m=e.getLayer)!=null&&m.call(e,s)&&(e.setPaintProperty(s,"fill-color",c),e.setPaintProperty(s,"fill-outline-color",l)),(w=e.getLayer)!=null&&w.call(e,d)&&e.setPaintProperty(d,"line-color",l),(j=e.getLayer)!=null&&j.call(e,u)&&(e.setPaintProperty(u,"circle-radius",K),e.setPaintProperty(u,"circle-stroke-width",J),e.setPaintProperty(u,"circle-color",c),e.setPaintProperty(u,"circle-stroke-color","#ffffff"))}catch{}}const gt="#999999",Le="Belirtilmemiş";function wt(e){const t=ve(e),n=I.length,a=new Map;t.forEach((c,l)=>{a.set(c,I[l%n])});const r=new Map;for(const c of t)r.set(c,0);let o=0;for(const c of e.features??[]){const l=te(c.properties??{});l===null?o+=1:r.set(l,(r.get(l)??0)+1)}const i=t.map(c=>({label:c,color:a.get(c),count:r.get(c)??0}));return o>0&&i.push({label:Le,color:gt,count:o}),i.sort((c,l)=>l.count!==c.count?l.count-c.count:c.label.localeCompare(l.label,"tr")),i}const ne=5;function ae(e,t){const n=document.createElement("ul");n.className="nc_chatpanel_legend_list";for(const{label:a,color:r,count:o}of e){const i=document.createElement("li");i.className="nc_chatpanel_legend_row nc_chatpanel_legend_row_hover";const c=document.createElement("span");c.className="nc_chatpanel_legend_swatch",c.style.backgroundColor=r,c.setAttribute("aria-hidden","true");const l=document.createElement("span");l.className="nc_chatpanel_legend_label",l.textContent=`${a} (${o})`,i.appendChild(c),i.appendChild(l),Et(i,t,a),n.appendChild(i)}return n}function kt(e,t){const n=document.createElement("div");n.className="nc_chatpanel_legend";const a=document.createElement("div");if(a.className="nc_chatpanel_legend_heading",a.textContent="Lejant",n.appendChild(a),e.length<=ne)return n.appendChild(ae(e,t)),n;const r=e.slice(0,ne),o=e.slice(ne);n.appendChild(ae(r,t));const i=ae(o,t),c=`nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;i.id=c,i.classList.add("nc_chatpanel_legend_list_extra"),i.hidden=!0,n.appendChild(i);const l=document.createElement("button");l.type="button",l.className="btn btn-link btn-sm nc_chatpanel_legend_expand_btn",l.setAttribute("aria-expanded","false"),l.setAttribute("aria-controls",c);const s=o.length;return l.textContent=`+ ${s} kategori daha`,l.addEventListener("click",()=>{i.hidden=!i.hidden;const d=!i.hidden;l.setAttribute("aria-expanded",String(d)),l.textContent=d?"Daha az göster":`+ ${s} kategori daha`;const u=n.closest("#nc_chatpanel_messages");u&&v(u)}),n.appendChild(l),n}function $(e,t){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){t.push([e[0],e[1]]);return}for(const n of e)$(n,t)}}function xt(e,t){const n=te(e.properties??{});return t===Le?n===null:n===t}function Ae(e){const t=[];if($(e,t),t.length===0)return null;let n=0,a=0;for(const[r,o]of t)n+=r,a+=o;return[n/t.length,a/t.length]}function Ne(e){if(!e)return[];const t=e.type;if(t==="Point"){const n=e.coordinates;return Array.isArray(n)&&n.length>=2&&typeof n[0]=="number"&&Number.isFinite(n[0])&&typeof n[1]=="number"&&Number.isFinite(n[1])?[[n[0],n[1]]]:[]}if(t==="MultiPoint"){const n=[];return $(e.coordinates,n),n}if(t==="LineString"||t==="Polygon"||t==="MultiLineString"||t==="MultiPolygon"){const n=Ae(e.coordinates);return n?[n]:[]}if(t==="GeometryCollection"&&Array.isArray(e.geometries)){const n=[];for(const a of e.geometries)n.push(...Ne(a));return n}return[]}const re="__ncChatPanelLegendHoverMarkers";function G(e){var n;const t=e==null?void 0:e[re];if(Array.isArray(t))for(const a of t)try{(n=a.remove)==null||n.call(a)}catch{}e&&typeof e=="object"&&(e[re]=[])}function vt(e,t,n){G(e);const a=F();if(!(a!=null&&a.Marker))return;const r=[];for(const o of t.features??[])if(xt(o,n)){for(const i of Ne(o.geometry))if(i.every(c=>typeof c=="number"&&Number.isFinite(c)))try{const c=new a.Marker;c.setLngLat(i),c.addTo(e),r.push(c)}catch{}}e[re]=r}function Et(e,t,n){e.addEventListener("mouseenter",()=>{const a=E();a&&vt(a,t,n)}),e.addEventListener("mouseleave",()=>{const a=E();a&&G(a)})}function Pe(e,t){const n=F();if(!(n!=null&&n.LngLatBounds))return;const a=[];for(const o of t.features??[]){const i=o==null?void 0:o.geometry;if(i){if(i.type==="GeometryCollection"&&Array.isArray(i.geometries)){for(const c of i.geometries)$(c==null?void 0:c.coordinates,a);continue}$(i.coordinates,a)}}if(a.length===0)return;const r=a.reduce((o,i)=>o.extend(i),new n.LngLatBounds(a[0],a[0]));e.fitBounds(r,{padding:48,duration:700,maxZoom:18})}const K=9,J=3,Ct=["Open Sans Semibold","Arial Unicode MS Regular"],Me=["step",["zoom"],!1,17,!0],Te={"text-allow-overlap":Me,"text-ignore-placement":Me,"text-optional":!1};function St(e,t){var n;try{if(!((n=e.getLayer)!=null&&n.call(e,t)))return;for(const[a,r]of Object.entries(Te))e.setLayoutProperty(t,a,r)}catch{}}const Be=["==","$type","Point"],Fe="#ffffff",Oe="#2d2d2d";function Ie(e,t,n){var r;const a=`${n}label`;if((r=e.getLayer)!=null&&r.call(e,a)){St(e,a);try{e.setFilter(a,Be),e.setPaintProperty(a,"text-color",Fe),e.setPaintProperty(a,"text-halo-color",Oe)}catch{}return}e.addLayer({id:a,type:"symbol",source:t,filter:Be,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...Ct],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...Te},paint:{"text-color":Fe,"text-halo-color":Oe,"text-halo-width":1.25,"text-halo-blur":.25}})}const oe="nc_chatpanel_geojson",$e="nc_chatpanel_geojson_",ie="__ncChatPanelNewsHoverMarker",De="nc_chatpanel_news_hover_styles";function Lt(){if(typeof document>"u"||document.getElementById(De))return;const e=document.createElement("style");e.id=De,e.textContent=`
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
  `,document.head.appendChild(e)}function ce(e){var n;const t=e==null?void 0:e[ie];try{(n=t==null?void 0:t.remove)==null||n.call(t)}catch{}e&&typeof e=="object"&&(e[ie]=null)}function He(e){if(!e)return null;if(e.type==="Point"){const t=e.coordinates;return Array.isArray(t)&&t.length>=2&&typeof t[0]=="number"&&Number.isFinite(t[0])&&typeof t[1]=="number"&&Number.isFinite(t[1])?[t[0],t[1]]:null}if(e.type==="GeometryCollection"&&Array.isArray(e.geometries)){const t=[];for(const a of e.geometries){const r=He(a);r&&t.push(r)}if(t.length===0)return null;const n=t.reduce((a,[r,o])=>[a[0]+r,a[1]+o],[0,0]);return[n[0]/t.length,n[1]/t.length]}return Ae(e.coordinates)}function At(e){const t=document.createElement("div");t.className="nc_news_hover_root";const n=document.createElement("div");n.className="nc_news_hover_balloon";const a=document.createElement("div");a.className="nc_news_hover_title",a.textContent=e.title.trim()||"(Başlık yok)";const r=document.createElement("div");r.className="nc_news_hover_meta";const o=[e.source,e.date,e.location].filter(l=>typeof l=="string"&&l.trim().length>0).map(l=>String(l).trim());r.textContent=o.join(" · ");const i=document.createElement("div");i.className="nc_news_hover_desc",i.textContent=e.description.trim()||"(Açıklama yok)",n.appendChild(a),r.textContent&&n.appendChild(r),n.appendChild(i),t.appendChild(n);const c=document.createElement("div");return c.className="nc_news_hover_pin",t.appendChild(c),t}function Nt(e,t){const n=E();if(!n)return;ce(n);const a=He(e.geometry);if(!a)return;const r=F();if(r!=null&&r.Marker){Lt();try{const o=At(t),i=new r.Marker({element:o,anchor:"bottom"});i.setLngLat(a),i.addTo(n),n[ie]=i}catch{}}}function ze(){const e=E();e&&ce(e)}function Pt(){var r,o;const e=E();if(e&&(G(e),ce(e)),!(e!=null&&e.getLayer)||!e.removeLayer)return;const t=e.__ncChatPanelAnim;t&&typeof t.rafId=="number"&&(cancelAnimationFrame(t.rafId),t.rafId=void 0);const n=$e,a=[`${n}label`,`${n}point`,`${n}line`,`${n}fill`];try{for(const i of a)(r=e.getLayer)!=null&&r.call(e,i)&&e.removeLayer(i);(o=e.getSource)!=null&&o.call(e,oe)&&e.removeSource(oe)}catch{}X()}function le(e){var o;const t=E();if(!t||typeof t.addSource!="function")return;G(t);const n=oe,a=$e,r=(o=t.getSource)==null?void 0:o.call(t,n);if(r&&typeof r.setData=="function"){r.setData(e),Ie(t,n,a),Se(t,a,e),Pe(t,e),X();return}t.addSource(n,{type:"geojson",data:e}),t.addLayer({id:`${a}fill`,type:"fill",source:n,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),t.addLayer({id:`${a}line`,type:"line",source:n,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),t.addLayer({id:`${a}point`,type:"circle",source:n,filter:["==","$type","Point"],paint:{"circle-radius":K,"circle-color":"#22c55e","circle-stroke-width":J,"circle-stroke-color":"#ffffff"}}),Ie(t,n,a),Se(t,a,e),Pe(t,e),X()}const Re=[];let W=!0,D=null,Y=null;function Mt(){if(D){try{D.pause()}catch{}D=null}Y&&(URL.revokeObjectURL(Y),Y=null)}function H(e){for(const t of Re){t.root.hidden=!W,t.stopBtn.disabled=!D;const n=Math.max(0,Math.min(100,Math.round(e*100)));t.fill.style.width=`${n}%`}}function z(){Mt(),H(0)}function qe(e){if(W=e,!W){z();return}H(0)}async function se(e){if(!W||!e.size)return;z();const t=URL.createObjectURL(e),n=new Audio(t);n.preload="auto",D=n,Y=t;const a=()=>{const c=n.duration,l=n.currentTime;if(!Number.isFinite(c)||c<=0){H(0);return}H(l/c)},r=()=>{z()};n.addEventListener("timeupdate",a),n.addEventListener("ended",r,{once:!0}),n.addEventListener("error",r,{once:!0});const o=async()=>{await n.play()};try{await o();return}catch(c){console.warn("[chatpanel] audio autoplay engellendi, sonraki etkileşimde tekrar denenecek",c)}const i=()=>{o().catch(c=>{console.error("[chatpanel] audio tekrar oynatma hatası",c),z()})};window.addEventListener("pointerdown",i,{once:!0,passive:!0})}function je(e){const t=e.querySelector("#nc_chatpanel_audio_trackbar"),n=e.querySelector("#nc_chatpanel_audio_trackbar_fill"),a=e.querySelector("#nc_chatpanel_audio_stop_btn");!t||!n||!a||t.dataset.ncBoundAudioTrackbar!=="true"&&(t.dataset.ncBoundAudioTrackbar="true",Re.push({root:t,fill:n,stopBtn:a}),a.addEventListener("click",()=>{z()}),H(0))}const Ue="nc_chatpanel_audio_enabled_v1";function Tt(){if(typeof localStorage>"u")return!0;try{const e=localStorage.getItem(Ue);return e===null?!0:e!=="0"}catch{return!0}}function Bt(e){if(!(typeof localStorage>"u"))try{localStorage.setItem(Ue,e?"1":"0")}catch{}}let S=Tt();function R(){return S}function Ge(e,t){e.classList.toggle("btn-success",t),e.classList.toggle("btn-outline-light",!t),e.setAttribute("aria-pressed",t?"true":"false"),e.title=t?"Sesli okuma açık":"Sesli okuma kapalı",e.textContent=t?"Seslendirme: Açık":"Seslendirme: Kapalı"}function Ke(e){window.dispatchEvent(new CustomEvent("nc-chatpanel-audio-toggle",{detail:{enabled:e}}))}function Je(e){const t=e.querySelector("#nc_chatpanel_audio_toggle_btn");t&&t.dataset.ncBoundAudioToggle!=="true"&&(t.dataset.ncBoundAudioToggle="true",Ge(t,S),qe(S),Ke(S),t.addEventListener("click",()=>{S=!S,Bt(S),Ge(t,S),qe(S),Ke(S)}))}const We="nc_search_scan_styles",de="nc_search_scan_overlay";let q=0,B=null;function Ft(){if(typeof document>"u"||document.getElementById(We))return;const e=document.createElement("style");e.id=We,e.textContent=`
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
  `,document.head.appendChild(e)}function ue(){if(typeof document>"u"||(Ft(),q+=1,q>1))return;const e=document.getElementById(de);if(e){B=e,e.classList.remove("nc_search_scan_overlay--exit"),e.style.opacity="1";return}const t=document.createElement("div");t.id=de,t.className="nc_search_scan_overlay",t.setAttribute("aria-hidden","true");const n=document.createElement("div");n.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",t.appendChild(n),t.appendChild(a),document.body.appendChild(t),B=t}function pe(){if(typeof document>"u"||(q=Math.max(0,q-1),q>0))return;const e=B??document.getElementById(de);if(!e){B=null;return}e.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{e.remove(),B===e&&(B=null)},420)}const Ot=["Oba mahallesindeki yol çalışmaları","Türkler mahallesindeki önemli yerler","Mahmutlar bölgesindeki sağlık tesisleri","Kestel ve Oba arasındaki ana yollar"],Ye="__NC_ANALYZE_LINK__",Ve=12e4,It=8e3,_e=new WeakMap;function Ze(e){const t=_e.get(e);t&&(t(),_e.delete(e))}function Xe(e){const t=$t(Ot);Ze(e);const n=Dt(e,t);_e.set(e,n)}function $t(e){if(!Array.isArray(e))return[];const t=[];for(const n of e){if(typeof n!="string")continue;const a=n.trim();a.length>0&&t.push(a)}return t}function Dt(e,t){const n=t.length>0?t:["Mesaj yazın…"];let a=0;const r=()=>{if(!e.disabled){if(e.value.trim().length>0){e.placeholder="";return}e.placeholder=n[a%n.length]??"Mesaj yazın…",a=(a+1)%n.length}};r();const o=window.setInterval(r,It);return e.addEventListener("input",r),()=>{window.clearInterval(o),e.removeEventListener("input",r)}}function Ht(e,t){if(e&&typeof e.record_count=="number"&&Number.isFinite(e.record_count)){const n=typeof e.sql_key=="string"&&e.sql_key.trim().length>0;return`Sorgulama sonucunda ${e.record_count} kayıt bulundu.${n?` ${Ye}`:""}`}return e&&typeof e.message=="string"&&e.message.trim()?e.message.trim():t.trim()?t.trim():"Yanıt alındı."}async function zt(e,t){var s;const n=new FormData;n.append("chatInput",t);const a=await fetch(e,{method:"POST",body:n,signal:AbortSignal.timeout(Ve)}),r=await a.text(),o=a.headers.get("content-type")??"";let i=null;if(o.toLowerCase().includes("application/json"))try{i=JSON.parse(r)}catch{i=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:a.status,contentType:o,body:i??r});const c=i;c!=null&&c.ok&&((s=c.geojson)==null?void 0:s.type)==="FeatureCollection"&&le(c.geojson);const l=c&&typeof c.sql_key=="string"&&c.sql_key.trim()?c.sql_key.trim():null;return{assistantText:Ht(c,r),sqlKey:l}}function Rt(e){return`${e.replace(/\/$/,"")}/audio`}function qt(e){return`${e.replace(/\/$/,"")}/text`}async function jt(e,t){if(!R())return;const n=Rt(e),a=new FormData;a.append("chatInput",t);const r=await fetch(n,{method:"POST",body:a});if(!r.ok)throw new Error(`n8n audio isteği başarısız: ${r.status}`);const o=await r.blob();await se(o)}async function Ut(e,t){const n=qt(e),a=new FormData;a.append("chatInput",t,"recording.webm");const r=await fetch(n,{method:"POST",body:a}),o=await r.text();if(!r.ok)throw new Error(`n8n text isteği başarısız: ${r.status} ${o}`);let i=null;try{i=JSON.parse(o)}catch{i=null}if(i&&typeof i=="object"){const c=i.text;if(typeof c=="string"&&c.trim())return c.trim()}return o.trim()}function Qe(e){const t=[],n=/\[([^\]]*)\]/g;let a=0,r;for(;(r=n.exec(e))!==null;){t.push(C(e.slice(a,r.index)));const i=(r[1]??"").trim();if(i.length===0)t.push(C(r[0]));else{const c=C(i);t.push(`<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${c}" title="${c}">${c}</a>`)}a=r.index+r[0].length}return t.push(C(e.slice(a))),t.join("")}function he(e,t){const n=e.dataset.ncSqlKey??"",a=n?`<a href="#" class="nc_chatpanel_msg_analysis_link" data-sql-key="${C(n)}" title="Analiz et">analiz et</a>`:"analiz et",r=Qe(t).replace(Ye,a);e.innerHTML=r}function Gt(e){const t=document.createElement("div");t.className="nc_chatpanel_task_list";const n=document.createElement("div");n.className="nc_chatpanel_task_list_title",n.textContent="Harita görevleri",t.appendChild(n);const a=e==null?void 0:e.tasks;if(!Array.isArray(a)||a.length===0){const o=document.createElement("div");return o.className="nc_chatpanel_task_item_meta",o.textContent="Task bulunamadı.",t.appendChild(o),t}const r=document.createElement("div");r.className="nc_chatpanel_task_items";for(const o of a){const i=document.createElement("label");i.className="nc_chatpanel_task_item";const c=document.createElement("input");c.type="checkbox",c.className="nc_chatpanel_task_item_checkbox";const l=document.createElement("span");l.className="nc_chatpanel_task_item_content";const s=document.createElement("span");s.className="nc_chatpanel_task_item_title";const d=o.id===void 0||o.id===null?"":`${String(o.id)}. `;s.textContent=`${d}${typeof o.title=="string"&&o.title.trim()?o.title.trim():"Başlıksız görev"}`;const u=document.createElement("span");u.className="nc_chatpanel_task_item_meta";const _=typeof o.user_message=="string"?o.user_message.trim():"";u.textContent=_||"Açıklama yok",l.appendChild(s),l.appendChild(u),i.appendChild(c),i.appendChild(l),r.appendChild(i)}return t.appendChild(r),t}async function Kt(e,t){const n=`${e.replace(/\/$/,"")}/taskbuilder/by-key`,a=new FormData;a.append("sqlKey",t);const r=await fetch(n,{method:"POST",body:a,signal:AbortSignal.timeout(Ve)}),o=await r.text();let i=null;try{i=JSON.parse(o)}catch{i=null}if(!r.ok){const c=typeof(i==null?void 0:i.error)=="string"?i.error:o;throw new Error(`Taskbuilder isteği başarısız: ${r.status} ${c}`)}return i??o}function P(e){e.dataset.ncBracketCatDelegated!=="true"&&(e.dataset.ncBracketCatDelegated="true",e.addEventListener("click",t=>{var i,c;const n=t.target,a=(i=n==null?void 0:n.closest)==null?void 0:i.call(n,"a.nc_chatpanel_msg_analysis_link");if(a){if(t.preventDefault(),a.dataset.ncBusy==="true")return;const l=a.getAttribute("data-sql-key")??"";if(!l.trim())return;const s=e.dataset.ncN8nProxyUrl??"";if(!s.trim())return;a.dataset.ncBusy="true",a.textContent="analiz ediliyor...";const d=document.createElement("div");d.className="nc_chatpanel_msg nc_chatpanel_msg_ai",d.textContent="Harita görevleri hazırlanıyor...",e.appendChild(d),v(e),Kt(s,l).then(u=>{d.replaceChildren(Gt(u)),v(e)}).catch(u=>{console.error("[chatpanel] taskbuilder key istek hatası",u),d.textContent="Harita görevleri alınırken hata oluştu.",v(e)}).finally(()=>{a.dataset.ncBusy="false",a.textContent="analiz et"});return}const r=(c=n==null?void 0:n.closest)==null?void 0:c.call(n,"a.nc_chatpanel_msg_catlink");if(!r)return;t.preventDefault();const o=r.getAttribute("data-cat")??"";console.log("[chatpanel] kategori linki",o)}))}function Jt(e,t){const n=e.querySelector("#nc_chatpanel_form"),a=e.querySelector("#nc_chatpanel_input"),r=e.querySelector("#nc_chatpanel_mic_btn"),o=e.querySelector("#nc_chatpanel_messages");if(!n||!a||!o||!r||n.dataset.ncBoundChat==="true")return;n.dataset.ncBoundChat="true",P(o),o.dataset.ncN8nProxyUrl=t,Xe(a);const i=(_,p)=>{const f=document.createElement("div");return f.className=`nc_chatpanel_msg ${_==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof p=="string"?f.textContent=p:f.appendChild(p),o.appendChild(f),v(o),f},c=()=>{const _=R();r.disabled=!_,r.title=_?"Sesli komut kaydı başlat":"Seslendirme kapalıyken sesli komut kullanılamaz"};c(),window.addEventListener("nc-chatpanel-audio-toggle",()=>{c()});let l=null,s=null,d=[];const u=()=>{r.classList.remove("nc_chatpanel_mic_btn_recording"),r.title="Sesli komut kaydı başlat"},h=()=>{r.classList.add("nc_chatpanel_mic_btn_recording"),r.title="Kaydı durdur"};r.addEventListener("click",async()=>{var _;if(R()){if(!("MediaRecorder"in window)||!((_=navigator.mediaDevices)!=null&&_.getUserMedia)){console.warn("[chatpanel] tarayıcı ses kaydını desteklemiyor");return}if(l&&l.state==="recording"){l.stop();return}try{s=await navigator.mediaDevices.getUserMedia({audio:!0}),d=[],l=new MediaRecorder(s),l.ondataavailable=p=>{p.data&&p.data.size>0&&d.push(p.data)},l.onstop=()=>{u();const p=s;s=null,p==null||p.getTracks().forEach(b=>b.stop());const f=new Blob(d,{type:(l==null?void 0:l.mimeType)||"audio/webm"});d=[],f.size&&Ut(t,f).then(b=>{b&&(a.value=b,a.focus())}).catch(b=>{console.error("[chatpanel] n8n text istek hatası",b)})},l.start(),h()}catch(p){console.error("[chatpanel] mikrofon başlatılamadı",p),u(),s&&(s.getTracks().forEach(f=>f.stop()),s=null)}}}),n.addEventListener("submit",_=>{_.preventDefault();const p=a.value.trim();if(!p)return;i("user",p),a.value="",a.disabled=!0,ue();const f=document.createElement("span");f.className="nc_chatpanel_typing",f.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const b=i("ai",f);zt(t,p).then(({assistantText:M,sqlKey:m})=>{m?b.dataset.ncSqlKey=m:delete b.dataset.ncSqlKey,he(b,M),v(o),jt(t,p).catch(w=>{console.error("[chatpanel] n8n audio oynatma hatası",w)})}).catch(M=>{console.error("[chatpanel] n8n istek hatası",M),b.textContent="Sorgu sırasında hata oluştu.",v(o)}).finally(()=>{pe(),a.disabled=!1,a.focus()})})}function et(){var l,s;const e=E();if(!(e!=null&&e.getBounds))return null;const t=e.getBounds(),n=(l=t.getSouthWest)==null?void 0:l.call(t),a=(s=t.getNorthEast)==null?void 0:s.call(t);if(!n||!a)return null;const r=typeof n.lng=="number"?n.lng:n.lon,o=typeof n.lat=="number"?n.lat:n.y,i=typeof a.lng=="number"?a.lng:a.lon,c=typeof a.lat=="number"?a.lat:a.y;return[r,o,i,c].every(d=>typeof d=="number"&&Number.isFinite(d))?[r,o,i,c]:null}const Wt=100;function Yt(e){return`${e.replace(/\/$/,"")}/n8n/audio`}async function Vt(e,t){if(!R())return;const n=t.trim();if(!n)return;const a=new FormData;a.append("chatInput",n);const r=Yt(e),o=await fetch(r,{method:"POST",body:a});if(!o.ok)throw new Error(`kentrehberi audio isteği başarısız: ${o.status}`);const i=await o.blob();await se(i)}function Zt(e){if(typeof e=="string")return e;if(e&&typeof e=="object"){const t=e.message;return typeof t=="string"&&t.trim()?t.trim():JSON.stringify(e)}return String(e)}async function Xt(e,t){var r;if(!t)return;const n=o=>{P(t);const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai",he(i,o),t.appendChild(i),v(t)},a=(o,i)=>{P(t);const c=document.createElement("div");c.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const l=document.createElement("div");l.className="nc_chatpanel_legend_intro",l.innerHTML=Qe(o),c.appendChild(l);const s=wt(i);s.length>0&&c.appendChild(kt(s,i)),t.appendChild(c),v(t)};try{const o=et();if(!o){console.warn("[chatpanel] Harita bbox alınamadı."),n("Harita alanı okunamadı.");return}const i=`${e}/db/kentrehberi_poi/features-by-bbox`,c=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:o})});let l=null;try{l=await c.json()}catch{l=null}const s=l;if(!c.ok){const u=s&&typeof s.error=="string"?s.error:`HTTP ${c.status}`;n(`Kayıtlar yüklenemedi: ${u}`);return}const d=s==null?void 0:s.geojson;if(d&&d.type==="FeatureCollection"){le(d);const u=typeof s.record_count=="number"&&Number.isFinite(s.record_count)?s.record_count:((r=d.features)==null?void 0:r.length)??0;a(`Haritaya ${u} kayıt eklendi`,d),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:i,record_count:u})}else n("GeoJSON yanıtı alınamadı.")}catch(o){console.error("[chatpanel] features-by-bbox hata",o),n("Kayıtlar yüklenirken hata oluştu.")}}function tt(e,t){const n=e.querySelector("#nc_chatpanel_wisart_btn"),a=e.querySelector("#nc_chatpanel_messages");if(!n||n.dataset.ncBoundWisart==="true")return;n.dataset.ncBoundWisart="true";const r=o=>{if(!a)return;P(a);const i=document.createElement("div");i.className="nc_chatpanel_msg nc_chatpanel_msg_ai",he(i,o),a.appendChild(i),v(a)};n.addEventListener("click",async()=>{if(n.disabled)return;n.disabled=!0;const o=n.innerHTML;n.innerHTML='<span aria-hidden="true">...</span>',ue();let i=!1;try{const c=et();if(!c){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}i=!0;const l=`${t}/n8n/kentrehberi`,s=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:c,faaliyet:"cami"})}),d=await s.text();let u=null;try{u=JSON.parse(d)}catch{u=d}console.log("[chatpanel] kentrehberi sonuç",{endpoint:l,status:s.status,data:u});const h=Zt(u);r(h),Vt(t,h).catch(_=>{console.error("[chatpanel] kentrehberi audio oynatma hatası",_)})}catch(c){console.error("[chatpanel] WISART hata",c),r("WISART isteğinde hata oluştu.")}finally{pe(),n.disabled=!1,n.innerHTML=o,i&&window.setTimeout(()=>{Xt(t,a)},Wt)}})}const nt="nc_chatpanel_n8n_news_v1",Qt=60*60*1e3;function en(e){return`${e.replace(/\/$/,"")}/news`}function tn(e){try{const t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleString("tr-TR",{dateStyle:"medium",timeStyle:"short"})}catch{return e}}function nn(e){ze();const t=e.querySelector("#nc_chatpanel_haberler_body"),n=e.querySelector("#nc_chatpanel_sosyal_body"),a='<p class="nc_chatpanel_hint mb-0">Yükleniyor…</p>';t&&(t.innerHTML=a),n&&(n.innerHTML=a)}const at=180;function fe(e,t=at){const n=e.replace(/\s+/g," ").trim();return n.length<=t?n:`${n.slice(0,Math.max(0,t-3)).trimEnd()}...`}function me(e,t=at){return e.replace(/\s+/g," ").trim().length>t}function an(e){if(typeof e!="string")return null;const t=e.trim().toLowerCase();return t==="news"||t==="twitter"?t:null}function rn(e){return L(e)?Array.isArray(e.features)?e.features:L(e.geojson)&&Array.isArray(e.geojson.features)?e.geojson.features:null:null}function on(e){const t=[],n=rn(e);if(Array.isArray(n)){for(const o of n){if(!L(o)||!L(o.properties))continue;const i=o.properties,c=an(i.source);if(!c)continue;const l=typeof i.title=="string"?i.title:"",s=typeof i.date=="string"?i.date:"",d=typeof i.location=="string"?i.location:"",u=typeof i.short_description=="string"?i.short_description:"",h=fe(u||l),_=me(u||l),p=o.geometry,f=L(p)&&typeof p.type=="string"?{type:"Feature",geometry:p,properties:i}:null;t.push({title:l,date:s,location:d,previewDescription:h,isPreviewTruncated:_,fullDescription:u,source:c,featureForMap:f})}return t}if(!L(e))return t;const a=e.twitter,r=e.news;if(Array.isArray(a))for(const o of a){if(!L(o))continue;const i=typeof o.text=="string"?o.text:"",c=typeof o.created_at=="string"?o.created_at:"",l=me(i);t.push({title:"",date:c,location:"",previewDescription:fe(i),isPreviewTruncated:l,fullDescription:i,source:"twitter",featureForMap:null})}if(L(r)&&Array.isArray(r.haberler))for(const o of r.haberler){if(!L(o))continue;const i=typeof o.baslik=="string"?o.baslik:"",c=typeof o.tarih=="string"?o.tarih:"",l=typeof o.yer=="string"?o.yer:"",s=typeof o.kisa_aciklama=="string"?o.kisa_aciklama:"",d=me(s||i);t.push({title:i,date:c,location:l,previewDescription:fe(s||i),isPreviewTruncated:d,fullDescription:s,source:"news",featureForMap:null})}return t}function rt(e,t,n){e.forEach((a,r)=>{const o=t[r];if(!(o!=null&&o.featureForMap))return;const i=()=>{const l=o.featureForMap;if(!l)return;le({type:"FeatureCollection",features:[l]}),Nt(l,{title:o.title,description:o.fullDescription||o.previewDescription,date:o.date,location:o.location,source:o.source});const s=(o.fullDescription||"").trim();!s||!R()||ln(n,s).catch(d=>{console.error("[chatpanel] news audio oynatma hatası",d)})};a.addEventListener("click",()=>{i()});const c=a.querySelector(".nc_chatpanel_news_more_link");c&&c.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),i()})})}function cn(e){return`${e.replace(/\/$/,"")}/audio`}async function ln(e,t){const n=cn(e),a=new FormData;a.append("chatInput",t);const r=await fetch(n,{method:"POST",body:a});if(!r.ok)throw new Error(`n8n news audio isteği başarısız: ${r.status}`);const o=await r.blob();await se(o)}function ot(e,t,n){ze();const a=e.querySelector("#nc_chatpanel_haberler_body"),r=e.querySelector("#nc_chatpanel_sosyal_body");if(!a||!r)return;const o='<p class="nc_chatpanel_hint mb-0">Gösterilecek içerik yok.</p>',i=on(t),c=i.filter(s=>s.source==="twitter"),l=i.filter(s=>s.source==="news");if(c.length>0){const s=['<div class="nc_chatpanel_tweet_list">'];for(const d of c){const u=d.previewDescription||d.title,h=d.date?tn(d.date):"",_=C(u).replace(/\n/g,"<br />");s.push(`<article class="nc_chatpanel_tweet_card">
        <div class="nc_chatpanel_tweet_meta">${C(h)}</div>
        <div class="nc_chatpanel_tweet_text">${_}</div>
      </article>`)}s.push("</div>"),r.innerHTML=s.join(""),rt(r.querySelectorAll(".nc_chatpanel_tweet_card"),c,n)}else r.innerHTML=o;if(l.length>0){const s=['<div class="nc_chatpanel_haber_list">'];for(const d of l){const u=[d.date,d.location].filter(Boolean),h=u.length>0?`<div class="nc_chatpanel_haber_meta">${C(u.join(" · "))}</div>`:"",_=d.isPreviewTruncated?' <a href="#" class="nc_chatpanel_news_more_link">daha fazla</a>':"";s.push(`<article class="nc_chatpanel_haber_card">
        <h3 class="nc_chatpanel_haber_title">${C(d.title)}</h3>
        ${h}
        <p class="nc_chatpanel_haber_desc">${C(d.previewDescription)}${_}</p>
      </article>`)}s.push("</div>"),a.innerHTML=s.join(""),rt(a.querySelectorAll(".nc_chatpanel_haber_card"),l,n)}else a.innerHTML=o}function sn(e){if(typeof localStorage>"u")return null;try{const t=localStorage.getItem(nt);if(!t)return null;const n=JSON.parse(t);return typeof n.ts!="number"||typeof n.endpoint!="string"||n.endpoint!==e||Date.now()-n.ts>Qt?null:n}catch{return null}}function dn(e){if(!(typeof localStorage>"u"))try{const t={ts:Date.now(),endpoint:e.endpoint,status:e.status,data:e.data};localStorage.setItem(nt,JSON.stringify(t))}catch{}}async function it(e,t,n){const a=en(t),r=sn(a);if(r){console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:r.status,data:r.data,fromCache:!0,cachedAt:new Date(r.ts).toISOString()}),ot(e,r.data,t);return}nn(e);try{const o=new FormData;o.append("chatInput","haberler");const i=await fetch(a,{method:"POST",body:o}),c=await i.text();let l=c;try{l=JSON.parse(c)}catch{}console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:i.status,data:l}),i.ok&&dn({endpoint:a,status:i.status,data:l}),ot(e,l,t)}catch(o){console.error("[chatpanel] n8n news istek hatası",n,o);const i='<p class="nc_chatpanel_hint mb-0">Haberler yüklenirken hata oluştu.</p>',c=e.querySelector("#nc_chatpanel_haberler_body"),l=e.querySelector("#nc_chatpanel_sosyal_body");c&&(c.innerHTML=i),l&&(l.innerHTML=i)}}function ct(e,t){const n=e.querySelector("#nc_chatpanel_news_btn");n&&n.dataset.ncBoundNews!=="true"&&(n.dataset.ncBoundNews="true",n.addEventListener("click",async()=>{if(!n.disabled){n.disabled=!0;try{await it(e,t,"toolbar")}finally{n.disabled=!1}}}))}const lt="nc_chatpanel_root",un="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";function pn(e){if(!e.getElementById("nc_chatpanel_bootstrap_css")){const n=document.createElement("link");n.id="nc_chatpanel_bootstrap_css",n.rel="stylesheet",n.href=un,e.appendChild(n)}if(e.getElementById("nc_chatpanel_styles"))return;const t=document.createElement("style");t.id="nc_chatpanel_styles",t.textContent=`
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
    .nc_chatpanel_input {
      min-height: 68px;
      max-height: 68px;
      height: 68px;
      resize: none;
      line-height: 1.35;
    }
    .nc_chatpanel_input::placeholder {
      color: #868e96;
      opacity: 1;
    }
    .nc_chatpanel_input::-webkit-input-placeholder {
      color: #868e96;
    }
    .nc_chatpanel_input_footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 8px;
    }
    .nc_chatpanel_input_hint {
      flex: 1 1 auto;
      min-width: 0;
      margin: 0;
      font-size: 0.72rem;
      line-height: 1.35;
      color: #6c757d;
    }
    .nc_chatpanel_input_actions {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 6px;
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
    .nc_chatpanel_msg_ai .nc_chatpanel_msg_analysis_link {
      color: #0d6efd;
      font-weight: 600;
      text-decoration: underline;
      cursor: pointer;
    }
    .nc_chatpanel_msg_ai .nc_chatpanel_msg_analysis_link:hover {
      color: #0a58ca;
    }
    .nc_chatpanel_task_list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .nc_chatpanel_task_list_title {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #495057;
    }
    .nc_chatpanel_task_items {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .nc_chatpanel_task_item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 6px 8px;
      background: #f8f9fa;
      cursor: pointer;
    }
    .nc_chatpanel_task_item_checkbox {
      margin-top: 2px;
      cursor: pointer;
    }
    .nc_chatpanel_task_item_content {
      display: flex;
      flex-direction: column;
      min-width: 0;
      gap: 2px;
    }
    .nc_chatpanel_task_item_title {
      font-size: 0.82rem;
      font-weight: 600;
      color: #212529;
      line-height: 1.35;
    }
    .nc_chatpanel_task_item_meta {
      font-size: 0.75rem;
      color: #6c757d;
      line-height: 1.35;
      white-space: pre-wrap;
      word-break: break-word;
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
    .nc_chatpanel_mic_btn_recording {
      background: #dc3545 !important;
      border-color: #dc3545 !important;
      color: #fff !important;
    }
    @keyframes nc_chatpanel_dot_bounce {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.45; }
      40% { transform: scale(1); opacity: 1; }
    }
  `,e.appendChild(t)}function _n(){return`
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
          <textarea class="form-control form-control-sm nc_chatpanel_input" id="nc_chatpanel_input"></textarea>
          <div class="nc_chatpanel_input_footer">
            <p class="nc_chatpanel_input_hint">Yalnızca mekansal sorgular...</p>
            <div class="nc_chatpanel_input_actions">
              <button
                class="btn btn-outline-secondary btn-sm"
                type="button"
                id="nc_chatpanel_mic_btn"
                title="Sesli komut kaydı başlat"
                aria-label="Sesli komut kaydı başlat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <path d="M12 19v4"/>
                </svg>
              </button>
              <button class="btn btn-primary btn-sm" type="submit">Gönder</button>
            </div>
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
  `}const hn="http://localhost:3001/api/n8n",fn="http://localhost:3001/api",mn="Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?";function bn(e){var r,o;const t=(r=e.mapInstanceName)==null?void 0:r.trim();if(t)return t;if(typeof document>"u")return;const n=document.currentScript,a=(o=n==null?void 0:n.getAttribute("data-map-instance"))==null?void 0:o.trim();if(a)return a}function yn(e){var n,a;const t=(n=e.n8nProxyUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,o=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(o)return o}return hn}function gn(e){var n,a;const t=(n=e.dbApiUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,o=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(o)return o}return fn}function wn(e){Q();const t=e.querySelector("#nc_chatpanel_map_circle_btn");t&&ee(t,e);const n=e.querySelector("#nc_chatpanel_messages"),a=e.querySelector("#nc_chatpanel_input");n&&n.replaceChildren(),a&&(Ze(a),a.value="",a.disabled=!1,Xe(a)),Pt(),be(e),n&&(n.scrollTop=0)}function st(e){const t=e.querySelector("#nc_chatpanel_clear_btn");t&&t.dataset.ncBoundClear!=="true"&&(t.dataset.ncBoundClear="true",t.addEventListener("click",()=>{wn(e),console.log("[chatpanel] panel temizlendi")}))}function dt(e,t){const n=e.querySelector(".nc_chatpanel_tabbar");if(!n||n.dataset.ncBoundTabs==="true")return;n.dataset.ncBoundTabs="true";const a=e.querySelector("#nc_chatpanel_tab_btn_kentrehberi"),r=e.querySelector("#nc_chatpanel_tab_btn_haberler"),o=e.querySelector("#nc_chatpanel_tab_btn_sosyal"),i=e.querySelector("#nc_chatpanel_tab_panel_kentrehberi"),c=e.querySelector("#nc_chatpanel_tab_panel_haberler"),l=e.querySelector("#nc_chatpanel_tab_panel_sosyal");if(!a||!r||!o||!i||!c||!l)return;const s=[{id:"kentrehberi",btn:a,panel:i},{id:"haberler",btn:r,panel:c},{id:"sosyal",btn:o,panel:l}];let d="kentrehberi";const u=h=>{for(const _ of s){const p=_.id===h;_.btn.classList.toggle("nc_chatpanel_tab_btn--active",p),_.btn.setAttribute("aria-selected",p?"true":"false"),_.panel.classList.toggle("nc_chatpanel_tab_pane--active",p)}};for(const h of s)h.btn.addEventListener("click",()=>{h.id!==d&&(d=h.id,u(h.id),(h.id==="haberler"||h.id==="sosyal")&&it(e,t,`sekme:${h.id}`))})}function be(e){const t=e.querySelector("#nc_chatpanel_messages");if(!t||(P(t),t.querySelector('[data-nc-welcome-ai="true"]')))return;const n=document.createElement("div");n.className="nc_chatpanel_msg nc_chatpanel_msg_ai",n.setAttribute("data-nc-welcome-ai","true"),n.textContent=mn,t.prepend(n)}function ye(e={}){const{container:t=document.body}=e;let n=document.getElementById(lt);const a=bn(e),r=yn(e),o=gn(e);if(_t(a??null),n){a&&n.setAttribute("data-nc-map-instance",a);const l=n.shadowRoot;return l&&(dt(l,r),je(l),Je(l),tt(l,o),ct(l,r),ke(l,{ensureBracketCategoryLinkDelegation:P}),st(l),be(l)),n}n=document.createElement("div"),n.id=lt,n.className="nc_chatpanel_root",n.setAttribute("data-nc-chatpanel","true"),a&&n.setAttribute("data-nc-map-instance",a);const i=n.attachShadow({mode:"open"});pn(i);const c=document.createElement("div");return c.className="nc_chatpanel_shell",c.innerHTML=_n(),i.appendChild(c),t.appendChild(n),Jt(i,r),dt(i,r),je(i),Je(i),tt(i,o),ct(i,r),ke(i,{ensureBracketCategoryLinkDelegation:P}),st(i),be(i),n}const kn={init:e=>ye(e??{}),getMapInstanceName:()=>ht(),getRegisteredMap:E,getMaplibre:F};window.ChatPanel=kn;function xn(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if(xn()){const e=()=>ye({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return N.getMaplibre=F,N.getRegisteredMap=E,N.hideSearchScanOverlay=pe,N.initChatPanel=ye,N.showSearchScanOverlay=ue,Object.defineProperty(N,Symbol.toStringTag,{value:"Module"}),N}({});
