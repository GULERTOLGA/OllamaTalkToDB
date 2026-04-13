var ChatPanel=function(w){"use strict";let P=null;function Ie(e){P=e}function He(){return P}function y(){var t;const e=P;return!e||typeof window>"u"?null:((t=window.__ncMapRegistry__)==null?void 0:t[e])??null}function N(){return window.maplibregl}function g(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}function m(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function M(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const T="nc_map_magnify_lens_root",Q=252,O=2.5,De=500;let L=null,C=null;function I(){try{C==null||C()}catch{}}function H(){var e;if(!(typeof document>"u")){try{L==null||L()}catch{}L=null,C=null,(e=document.getElementById(T))==null||e.remove()}}function $e(){if(typeof document>"u")return!1;const e=window.maplibregl,t=y();if(!(e!=null&&e.Map)||!(t!=null&&t.getContainer)||typeof t.unproject!="function")return!1;H();const n=t.getContainer(),a=window.getComputedStyle(n).position;(a==="static"||a==="")&&(n.style.position="relative");const r=document.createElement("div");r.id=T,r.setAttribute("aria-hidden","true"),r.style.cssText="position:absolute;inset:0;pointer-events:none;z-index:6;overflow:visible;";const i=document.createElement("div");i.className="nc_map_magnify_lens",i.style.cssText=["position:absolute","display:none",`width:${Q}px`,`height:${Q}px`,"border-radius:50%","overflow:hidden","box-sizing:border-box","border:3px solid rgba(13,110,253,0.95)","box-shadow:0 0 0 2px rgba(255,255,255,0.85),0 8px 28px rgba(0,0,0,0.22)","pointer-events:none","transform:translate(-50%,-50%)","left:0","top:0"].join(";");const o=document.createElement("div");o.className="nc_map_magnify_lens_map",o.style.cssText="width:100%;height:100%;position:relative;",i.appendChild(o),r.appendChild(i),n.appendChild(r);let c=null;const l=()=>{c!==null&&(clearTimeout(c),c=null)};let s;try{const _=t.getCenter();s=new e.Map({container:o,style:t.getStyle(),center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+O,22),bearing:t.getBearing(),pitch:t.getPitch(),interactive:!1,attributionControl:!1,maxZoom:24})}catch(_){return console.warn("[chatpanel] Büyüteç mini harita oluşturulamadı",_),r.remove(),!1}let d=null;const u=()=>{var x,Fe;if(i.style.display==="none")return;const _=s.queryRenderedFeatures;if(typeof _=="function")try{const F=_.call(s),wt=F.length,Z={},V={};for(const X of F){const Pe=((x=X.layer)==null?void 0:x.id)??"?",Oe=((Fe=X.layer)==null?void 0:Fe.source)??X.source??"?";Z[Pe]=(Z[Pe]??0)+1,V[Oe]=(V[Oe]??0)+1}console.log("[chatpanel] mercek 500ms durgun — görünen feature:",wt,{katman:Z,kaynak:V})}catch(F){console.warn("[chatpanel] mercek queryRenderedFeatures",F)}},p=()=>{l(),c=window.setTimeout(()=>{c=null,window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{u()})})},De)},h=()=>{if(!d)return;const _=t.unproject([d.x,d.y]);s.jumpTo({center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+O,22),bearing:t.getBearing(),pitch:t.getPitch()})},b=_=>{const x=_;x.point&&(d={x:x.point.x,y:x.point.y},i.style.left=`${x.point.x}px`,i.style.top=`${x.point.y}px`,i.style.display="block",h(),p())},f=()=>{h(),s.resize(),p()},Be=()=>{l(),i.style.display="none",d=null};return C=()=>{try{const _=t.getStyle();if(!_)return;s.setStyle(_,{diff:!0})}catch{try{s.setStyle(t.getStyle())}catch(_){console.warn("[chatpanel] Büyüteç stil senkronu başarısız",_)}}if(d)h();else{const _=t.getCenter();s.jumpTo({center:[_.lng,_.lat],zoom:Math.min(t.getZoom()+O,22),bearing:t.getBearing(),pitch:t.getPitch()})}try{s.resize()}catch{}p()},t.on("mousemove",b),t.on("move",f),t.on("zoom",f),t.on("rotate",f),t.on("pitch",f),n.addEventListener("mouseleave",Be),window.requestAnimationFrame(()=>{try{s.resize()}catch{}p()}),L=()=>{l(),C=null,t.off("mousemove",b),t.off("move",f),t.off("zoom",f),t.off("rotate",f),t.off("pitch",f),n.removeEventListener("mouseleave",Be);try{s.remove()}catch{}},!0}function D(e,t){const n=typeof document<"u"&&!!document.getElementById(T),a=!!t.querySelector('[data-nc-magnifier-panel="true"]'),r=n||a;e.classList.toggle("btn-primary",r),e.classList.toggle("btn-outline-primary",!r),e.setAttribute("aria-pressed",r?"true":"false")}function ee(e){var t;(t=e.querySelector('[data-nc-magnifier-panel="true"]'))==null||t.remove()}function Re(e,t,n){const a=e.querySelector("#nc_chatpanel_messages");if(!a)return;ee(e),n(a);const r=document.createElement("div");r.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend",r.setAttribute("data-nc-magnifier-panel","true");const i=document.createElement("div");i.className="nc_chatpanel_legend_intro",i.textContent="Büyüteç";const o=document.createElement("div");o.className="nc_chatpanel_legend";const c=document.createElement("div");c.className="nc_chatpanel_magnifier_scroll";const l=document.createElement("p");l.className="nc_chatpanel_hint mb-0",l.textContent=t?"Haritada fareyi hareket ettirdiğinizde merkezdeki yuvarlak lens, o noktayı yakınlaştırılmış gösterir; haritayı normal şekilde kaydırabilirsiniz. Büyüteci kapatmak için aynı düğmeye tekrar basın.":"Harita veya maplibregl bulunamadığı için lens gösterilemedi. Sayfayı yenileyip tekrar deneyin.",c.appendChild(l),o.appendChild(c),r.appendChild(i),r.appendChild(o),a.appendChild(r),g(a)}function te(e,t){const n=e.querySelector("#nc_chatpanel_map_circle_btn");n&&n.dataset.ncBoundMapCircle!=="true"&&(n.dataset.ncBoundMapCircle="true",D(n,e),n.addEventListener("click",()=>{const a=!!document.getElementById(T),r=!!e.querySelector('[data-nc-magnifier-panel="true"]');if(a||r)H(),ee(e);else{const o=$e();o||console.warn("[chatpanel] Harita veya maplibregl yok; büyüteç açılamadı."),Re(e,o,t.ensureBracketCategoryLinkDelegation)}D(n,e)}))}const E=["#FF5733","#33FF57","#3357FF","#F1C40F","#8E44AD","#E74C3C","#2ECC71","#3498DB","#E67E22","#9B59B6","#1ABC9C","#F39C12","#D35400","#C0392B","#7F8C8D","#2C3E50","#16A085","#F1948A","#A569BD","#5DADE2","#EC7063","#48C9B0","#5499C7","#AF7AC5","#F5B041","#EB984E","#AAB7B8","#7D3C98","#27AE60","#C71585","#FF1493","#4B0082","#FFD700","#00CED1","#9400D3","#00FF7F","#DC143C","#40E0D0","#8A2BE2","#FF69B4","#FF4500","#00FFFF","#6B8E23","#4169E1","#FF8C00","#4682B4","#D2691E","#20B2AA","#708090","#9370DB"];function ne(e){if(e==null)return null;const t=String(e).trim();return t.length>0?t:null}function $(e){const t=ne(e.faaliyet_adi);return t!==null?t:ne(e["faaliyet-adi"])}function ae(e){const t=new Set;for(const n of e.features??[]){const a=$(n.properties??{});a!==null&&t.add(a)}return Array.from(t).sort((n,a)=>n.localeCompare(a,"tr"))}function re(e){if(e.startsWith("#")&&e.length===7){const t=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(1,3),16)*.78))),n=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(3,5),16)*.78))),a=Math.max(0,Math.min(255,Math.round(parseInt(e.slice(5,7),16)*.78)));return`#${t.toString(16).padStart(2,"0")}${n.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}`}return e}function oe(e,t,n){if(e.length===0)return n;const a=["match",["coalesce",["get","faaliyet_adi"],["get","faaliyet-adi"],""]];for(let r=0;r<e.length;r++)a.push(e[r],t(r));return a.push(n),a}function ce(e,t,n){var p,h,b;const a=ae(n),r="#999999",i=re(r),o=E.length,c=oe(a,f=>E[f%o],r),l=oe(a,f=>re(E[f%o]),i),s=`${t}fill`,d=`${t}line`,u=`${t}point`;try{(p=e.getLayer)!=null&&p.call(e,s)&&(e.setPaintProperty(s,"fill-color",c),e.setPaintProperty(s,"fill-outline-color",l)),(h=e.getLayer)!=null&&h.call(e,d)&&e.setPaintProperty(d,"line-color",l),(b=e.getLayer)!=null&&b.call(e,u)&&(e.setPaintProperty(u,"circle-radius",ue),e.setPaintProperty(u,"circle-stroke-width",pe),e.setPaintProperty(u,"circle-color",c),e.setPaintProperty(u,"circle-stroke-color","#ffffff"))}catch{}}const qe="#999999",ie="Belirtilmemiş";function ze(e){const t=ae(e),n=E.length,a=new Map;t.forEach((c,l)=>{a.set(c,E[l%n])});const r=new Map;for(const c of t)r.set(c,0);let i=0;for(const c of e.features??[]){const l=$(c.properties??{});l===null?i+=1:r.set(l,(r.get(l)??0)+1)}const o=t.map(c=>({label:c,color:a.get(c),count:r.get(c)??0}));return i>0&&o.push({label:ie,color:qe,count:i}),o.sort((c,l)=>l.count!==c.count?l.count-c.count:c.label.localeCompare(l.label,"tr")),o}const R=5;function q(e,t){const n=document.createElement("ul");n.className="nc_chatpanel_legend_list";for(const{label:a,color:r,count:i}of e){const o=document.createElement("li");o.className="nc_chatpanel_legend_row nc_chatpanel_legend_row_hover";const c=document.createElement("span");c.className="nc_chatpanel_legend_swatch",c.style.backgroundColor=r,c.setAttribute("aria-hidden","true");const l=document.createElement("span");l.className="nc_chatpanel_legend_label",l.textContent=`${a} (${i})`,o.appendChild(c),o.appendChild(l),We(o,t,a),n.appendChild(o)}return n}function Ge(e,t){const n=document.createElement("div");n.className="nc_chatpanel_legend";const a=document.createElement("div");if(a.className="nc_chatpanel_legend_heading",a.textContent="Lejant",n.appendChild(a),e.length<=R)return n.appendChild(q(e,t)),n;const r=e.slice(0,R),i=e.slice(R);n.appendChild(q(r,t));const o=q(i,t),c=`nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;o.id=c,o.classList.add("nc_chatpanel_legend_list_extra"),o.hidden=!0,n.appendChild(o);const l=document.createElement("button");l.type="button",l.className="btn btn-link btn-sm nc_chatpanel_legend_expand_btn",l.setAttribute("aria-expanded","false"),l.setAttribute("aria-controls",c);const s=i.length;return l.textContent=`+ ${s} kategori daha`,l.addEventListener("click",()=>{o.hidden=!o.hidden;const d=!o.hidden;l.setAttribute("aria-expanded",String(d)),l.textContent=d?"Daha az göster":`+ ${s} kategori daha`;const u=n.closest("#nc_chatpanel_messages");u&&g(u)}),n.appendChild(l),n}function S(e,t){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){t.push([e[0],e[1]]);return}for(const n of e)S(n,t)}}function Je(e,t){const n=$(e.properties??{});return t===ie?n===null:n===t}function je(e){const t=[];if(S(e,t),t.length===0)return null;let n=0,a=0;for(const[r,i]of t)n+=r,a+=i;return[n/t.length,a/t.length]}function le(e){if(!e)return[];const t=e.type;if(t==="Point"){const n=e.coordinates;return Array.isArray(n)&&n.length>=2&&typeof n[0]=="number"&&Number.isFinite(n[0])&&typeof n[1]=="number"&&Number.isFinite(n[1])?[[n[0],n[1]]]:[]}if(t==="MultiPoint"){const n=[];return S(e.coordinates,n),n}if(t==="LineString"||t==="Polygon"||t==="MultiLineString"||t==="MultiPolygon"){const n=je(e.coordinates);return n?[n]:[]}if(t==="GeometryCollection"&&Array.isArray(e.geometries)){const n=[];for(const a of e.geometries)n.push(...le(a));return n}return[]}const z="__ncChatPanelLegendHoverMarkers";function B(e){var n;const t=e==null?void 0:e[z];if(Array.isArray(t))for(const a of t)try{(n=a.remove)==null||n.call(a)}catch{}e&&typeof e=="object"&&(e[z]=[])}function Ue(e,t,n){B(e);const a=N();if(!(a!=null&&a.Marker))return;const r=[];for(const i of t.features??[])if(Je(i,n)){for(const o of le(i.geometry))if(o.every(c=>typeof c=="number"&&Number.isFinite(c)))try{const c=new a.Marker;c.setLngLat(o),c.addTo(e),r.push(c)}catch{}}e[z]=r}function We(e,t,n){e.addEventListener("mouseenter",()=>{const a=y();a&&Ue(a,t,n)}),e.addEventListener("mouseleave",()=>{const a=y();a&&B(a)})}function se(e,t){const n=N();if(!(n!=null&&n.LngLatBounds))return;const a=[];for(const i of t.features??[]){const o=i==null?void 0:i.geometry;if(o){if(o.type==="GeometryCollection"&&Array.isArray(o.geometries)){for(const c of o.geometries)S(c==null?void 0:c.coordinates,a);continue}S(o.coordinates,a)}}if(a.length===0)return;const r=a.reduce((i,o)=>i.extend(o),new n.LngLatBounds(a[0],a[0]));e.fitBounds(r,{padding:48,duration:700,maxZoom:18})}function de(e,t){const n=e.__ncChatPanelAnim??{};typeof n.rafId=="number"&&cancelAnimationFrame(n.rafId);const a=`${t}fill`,r=`${t}line`,i=`${t}point`,o=performance.now(),c=()=>{var h,b,f;const l=(performance.now()-o)/1e3*Math.PI*2*.55,s=.5+.5*Math.sin(l),d=.15+s*.2,u=.45+s*.45,p=.5+s*.5;try{(h=e.getLayer)!=null&&h.call(e,a)&&e.setPaintProperty(a,"fill-opacity",d),(b=e.getLayer)!=null&&b.call(e,r)&&e.setPaintProperty(r,"line-opacity",u),(f=e.getLayer)!=null&&f.call(e,i)&&e.setPaintProperty(i,"circle-opacity",p),n.rafId=requestAnimationFrame(c),e.__ncChatPanelAnim=n}catch{}};n.rafId=requestAnimationFrame(c),e.__ncChatPanelAnim=n}const ue=9,pe=3,Ye=["Open Sans Semibold","Arial Unicode MS Regular"],_e=["step",["zoom"],!1,17,!0],he={"text-allow-overlap":_e,"text-ignore-placement":_e,"text-optional":!1};function Ke(e,t){var n;try{if(!((n=e.getLayer)!=null&&n.call(e,t)))return;for(const[a,r]of Object.entries(he))e.setLayoutProperty(t,a,r)}catch{}}const fe=["==","$type","Point"],be="#ffffff",me="#2d2d2d";function ye(e,t,n){var r;const a=`${n}label`;if((r=e.getLayer)!=null&&r.call(e,a)){Ke(e,a);try{e.setFilter(a,fe),e.setPaintProperty(a,"text-color",be),e.setPaintProperty(a,"text-halo-color",me)}catch{}return}e.addLayer({id:a,type:"symbol",source:t,filter:fe,layout:{"text-field":["coalesce",["get","adi"],""],"text-font":[...Ye],"text-size":11,"text-anchor":"bottom","text-offset":[0,-.95],...he},paint:{"text-color":be,"text-halo-color":me,"text-halo-width":1.25,"text-halo-blur":.25}})}const G="nc_chatpanel_geojson",ge="nc_chatpanel_geojson_";function Ze(){var r,i;const e=y();if(e&&B(e),!(e!=null&&e.getLayer)||!e.removeLayer)return;const t=e.__ncChatPanelAnim;t&&typeof t.rafId=="number"&&(cancelAnimationFrame(t.rafId),t.rafId=void 0);const n=ge,a=[`${n}label`,`${n}point`,`${n}line`,`${n}fill`];try{for(const o of a)(r=e.getLayer)!=null&&r.call(e,o)&&e.removeLayer(o);(i=e.getSource)!=null&&i.call(e,G)&&e.removeSource(G)}catch{}I()}function xe(e){var i;const t=y();if(!t||typeof t.addSource!="function")return;B(t);const n=G,a=ge,r=(i=t.getSource)==null?void 0:i.call(t,n);if(r&&typeof r.setData=="function"){r.setData(e),ye(t,n,a),ce(t,a,e),de(t,a),se(t,e),I();return}t.addSource(n,{type:"geojson",data:e}),t.addLayer({id:`${a}fill`,type:"fill",source:n,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),t.addLayer({id:`${a}line`,type:"line",source:n,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),t.addLayer({id:`${a}point`,type:"circle",source:n,filter:["==","$type","Point"],paint:{"circle-radius":ue,"circle-color":"#22c55e","circle-stroke-width":pe,"circle-stroke-color":"#ffffff"}}),ye(t,n,a),ce(t,a,e),de(t,a),se(t,e),I()}const we="nc_chatpanel_n8n_news_v1",Ve=60*60*1e3;function Xe(e){return`${e.replace(/\/$/,"")}/news`}function Qe(e){try{const t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleString("tr-TR",{dateStyle:"medium",timeStyle:"short"})}catch{return e}}function et(e){const t=e.querySelector("#nc_chatpanel_haberler_body"),n=e.querySelector("#nc_chatpanel_sosyal_body"),a='<p class="nc_chatpanel_hint mb-0">Yükleniyor…</p>';t&&(t.innerHTML=a),n&&(n.innerHTML=a)}function ve(e,t){const n=e.querySelector("#nc_chatpanel_haberler_body"),a=e.querySelector("#nc_chatpanel_sosyal_body");if(!n||!a)return;const r='<p class="nc_chatpanel_hint mb-0">Gösterilecek içerik yok.</p>';if(!M(t)){n.innerHTML=r,a.innerHTML=r;return}const i=t.twitter,o=t.news;if(Array.isArray(i)&&i.length>0){const l=['<div class="nc_chatpanel_tweet_list">'];for(const s of i){if(!M(s))continue;const d=typeof s.text=="string"?s.text:"",u=typeof s.created_at=="string"?s.created_at:"",p=u?Qe(u):"",h=m(d).replace(/\n/g,"<br />");l.push(`<article class="nc_chatpanel_tweet_card">
        <div class="nc_chatpanel_tweet_meta">${m(p)}</div>
        <div class="nc_chatpanel_tweet_text">${h}</div>
      </article>`)}l.push("</div>"),a.innerHTML=l.join("")}else a.innerHTML=r;let c=[];if(M(o)&&Array.isArray(o.haberler)&&(c=o.haberler),c.length>0){const l=['<div class="nc_chatpanel_haber_list">'];for(const s of c){if(!M(s))continue;const d=typeof s.baslik=="string"?s.baslik:"",u=typeof s.tarih=="string"?s.tarih:"",p=typeof s.yer=="string"?s.yer:"",h=typeof s.kisa_aciklama=="string"?s.kisa_aciklama:"",b=[u,p].filter(Boolean),f=b.length>0?`<div class="nc_chatpanel_haber_meta">${m(b.join(" · "))}</div>`:"";l.push(`<article class="nc_chatpanel_haber_card">
        <h3 class="nc_chatpanel_haber_title">${m(d)}</h3>
        ${f}
        <p class="nc_chatpanel_haber_desc">${m(h)}</p>
      </article>`)}l.push("</div>"),n.innerHTML=l.join("")}else n.innerHTML=r}function tt(e){if(typeof localStorage>"u")return null;try{const t=localStorage.getItem(we);if(!t)return null;const n=JSON.parse(t);return typeof n.ts!="number"||typeof n.endpoint!="string"||n.endpoint!==e||Date.now()-n.ts>Ve?null:n}catch{return null}}function nt(e){if(!(typeof localStorage>"u"))try{const t={ts:Date.now(),endpoint:e.endpoint,status:e.status,data:e.data};localStorage.setItem(we,JSON.stringify(t))}catch{}}async function Ce(e,t,n){const a=Xe(t),r=tt(a);if(r){console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:r.status,data:r.data,fromCache:!0,cachedAt:new Date(r.ts).toISOString()}),ve(e,r.data);return}et(e);try{const i=new FormData;i.append("chatInput","haberler");const o=await fetch(a,{method:"POST",body:i}),c=await o.text();let l=c;try{l=JSON.parse(c)}catch{}console.log("[chatpanel] n8n news yanıtı",{context:n,endpoint:a,status:o.status,data:l}),o.ok&&nt({endpoint:a,status:o.status,data:l}),ve(e,l)}catch(i){console.error("[chatpanel] n8n news istek hatası",n,i);const o='<p class="nc_chatpanel_hint mb-0">Haberler yüklenirken hata oluştu.</p>',c=e.querySelector("#nc_chatpanel_haberler_body"),l=e.querySelector("#nc_chatpanel_sosyal_body");c&&(c.innerHTML=o),l&&(l.innerHTML=o)}}function ke(e,t){const n=e.querySelector("#nc_chatpanel_news_btn");n&&n.dataset.ncBoundNews!=="true"&&(n.dataset.ncBoundNews="true",n.addEventListener("click",async()=>{if(!n.disabled){n.disabled=!0;try{await Ce(e,t,"toolbar")}finally{n.disabled=!1}}}))}const Le="nc_search_scan_styles",J="nc_search_scan_overlay";let A=0,k=null;function at(){if(typeof document>"u"||document.getElementById(Le))return;const e=document.createElement("style");e.id=Le,e.textContent=`
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
  `,document.head.appendChild(e)}function j(){if(typeof document>"u"||(at(),A+=1,A>1))return;const e=document.getElementById(J);if(e){k=e,e.classList.remove("nc_search_scan_overlay--exit"),e.style.opacity="1";return}const t=document.createElement("div");t.id=J,t.className="nc_search_scan_overlay",t.setAttribute("aria-hidden","true");const n=document.createElement("div");n.className="nc_search_scan_layer";const a=document.createElement("div");a.className="nc_search_scan_beam",t.appendChild(n),t.appendChild(a),document.body.appendChild(t),k=t}function U(){if(typeof document>"u"||(A=Math.max(0,A-1),A>0))return;const e=k??document.getElementById(J);if(!e){k=null;return}e.classList.add("nc_search_scan_overlay--exit"),window.setTimeout(()=>{e.remove(),k===e&&(k=null)},420)}function rt(e,t){return e&&typeof e.record_count=="number"&&Number.isFinite(e.record_count)?`Sorgulama sonucunda ${e.record_count} kayıt bulundu.`:e&&typeof e.message=="string"&&e.message.trim()?e.message.trim():t.trim()?t.trim():"Yanıt alındı."}async function ot(e,t){var l;const n=new FormData;n.append("chatInput",t);const a=await fetch(e,{method:"POST",body:n}),r=await a.text(),i=a.headers.get("content-type")??"";let o=null;if(i.toLowerCase().includes("application/json"))try{o=JSON.parse(r)}catch{o=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:a.status,contentType:i,body:o??r});const c=o;return c!=null&&c.ok&&((l=c.geojson)==null?void 0:l.type)==="FeatureCollection"&&xe(c.geojson),rt(c,r)}function Ee(e){const t=[],n=/\[([^\]]*)\]/g;let a=0,r;for(;(r=n.exec(e))!==null;){t.push(m(e.slice(a,r.index)));const o=(r[1]??"").trim();if(o.length===0)t.push(m(r[0]));else{const c=m(o);t.push(`<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${c}" title="${c}">${c}</a>`)}a=r.index+r[0].length}return t.push(m(e.slice(a))),t.join("")}function W(e,t){e.innerHTML=Ee(t)}function v(e){e.dataset.ncBracketCatDelegated!=="true"&&(e.dataset.ncBracketCatDelegated="true",e.addEventListener("click",t=>{var i;const n=t.target,a=(i=n==null?void 0:n.closest)==null?void 0:i.call(n,"a.nc_chatpanel_msg_catlink");if(!a)return;t.preventDefault();const r=a.getAttribute("data-cat")??"";console.log("[chatpanel] kategori linki",r)}))}function ct(e,t){const n=e.querySelector("#nc_chatpanel_form"),a=e.querySelector("#nc_chatpanel_input"),r=e.querySelector("#nc_chatpanel_messages");if(!n||!a||!r||n.dataset.ncBoundChat==="true")return;n.dataset.ncBoundChat="true",v(r);const i=(o,c)=>{const l=document.createElement("div");return l.className=`nc_chatpanel_msg ${o==="user"?"nc_chatpanel_msg_user":"nc_chatpanel_msg_ai"}`,typeof c=="string"?l.textContent=c:l.appendChild(c),r.appendChild(l),g(r),l};n.addEventListener("submit",o=>{o.preventDefault();const c=a.value.trim();if(!c)return;i("user",c),a.value="",a.disabled=!0,j();const l=document.createElement("span");l.className="nc_chatpanel_typing",l.innerHTML=`
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;const s=i("ai",l);ot(t,c).then(d=>{W(s,d),g(r)}).catch(d=>{console.error("[chatpanel] n8n istek hatası",d),s.textContent="Sorgu sırasında hata oluştu.",g(r)}).finally(()=>{U(),a.disabled=!1,a.focus()})})}const Se="nc_chatpanel_root",it="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";function lt(e){if(!e.getElementById("nc_chatpanel_bootstrap_css")){const n=document.createElement("link");n.id="nc_chatpanel_bootstrap_css",n.rel="stylesheet",n.href=it,e.appendChild(n)}if(e.getElementById("nc_chatpanel_styles"))return;const t=document.createElement("style");t.id="nc_chatpanel_styles",t.textContent=`
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
  `,e.appendChild(t)}function st(){return`
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
  `}const dt="http://localhost:3001/api/n8n",ut="http://localhost:3001/api",pt="Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?";function _t(e){var r,i;const t=(r=e.mapInstanceName)==null?void 0:r.trim();if(t)return t;if(typeof document>"u")return;const n=document.currentScript,a=(i=n==null?void 0:n.getAttribute("data-map-instance"))==null?void 0:i.trim();if(a)return a}function ht(e){var n,a;const t=(n=e.n8nProxyUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,i=(a=r==null?void 0:r.getAttribute("data-n8n-proxy"))==null?void 0:a.trim();if(i)return i}return dt}function ft(e){var n,a;const t=(n=e.dbApiUrl)==null?void 0:n.trim();if(t)return t;if(typeof document<"u"){const r=document.currentScript,i=(a=r==null?void 0:r.getAttribute("data-db-api"))==null?void 0:a.trim();if(i)return i}return ut}function Ae(){var l,s;const e=y();if(!(e!=null&&e.getBounds))return null;const t=e.getBounds(),n=(l=t.getSouthWest)==null?void 0:l.call(t),a=(s=t.getNorthEast)==null?void 0:s.call(t);if(!n||!a)return null;const r=typeof n.lng=="number"?n.lng:n.lon,i=typeof n.lat=="number"?n.lat:n.y,o=typeof a.lng=="number"?a.lng:a.lon,c=typeof a.lat=="number"?a.lat:a.y;return[r,i,o,c].every(d=>typeof d=="number"&&Number.isFinite(d))?[r,i,o,c]:null}const bt=100;async function mt(e,t){var r;if(!t)return;const n=i=>{v(t);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",W(o,i),t.appendChild(o),g(t)},a=(i,o)=>{v(t);const c=document.createElement("div");c.className="nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend";const l=document.createElement("div");l.className="nc_chatpanel_legend_intro",l.innerHTML=Ee(i),c.appendChild(l);const s=ze(o);s.length>0&&c.appendChild(Ge(s,o)),t.appendChild(c),g(t)};try{const i=Ae();if(!i){console.warn("[chatpanel] Harita bbox alınamadı."),n("Harita alanı okunamadı.");return}const o=`${e}/db/kentrehberi_poi/features-by-bbox`,c=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:i})});let l=null;try{l=await c.json()}catch{l=null}const s=l;if(!c.ok){const u=s&&typeof s.error=="string"?s.error:`HTTP ${c.status}`;n(`Kayıtlar yüklenemedi: ${u}`);return}const d=s==null?void 0:s.geojson;if(d&&d.type==="FeatureCollection"){xe(d);const u=typeof s.record_count=="number"&&Number.isFinite(s.record_count)?s.record_count:((r=d.features)==null?void 0:r.length)??0;a(`Haritaya ${u} kayıt eklendi`,d),console.log("[chatpanel] kentrehberi tüm kayıtlar",{endpoint:o,record_count:u})}else n("GeoJSON yanıtı alınamadı.")}catch(i){console.error("[chatpanel] features-by-bbox hata",i),n("Kayıtlar yüklenirken hata oluştu.")}}function yt(e){H();const t=e.querySelector("#nc_chatpanel_map_circle_btn");t&&D(t,e);const n=e.querySelector("#nc_chatpanel_messages"),a=e.querySelector("#nc_chatpanel_input");n&&n.replaceChildren(),a&&(a.value="",a.disabled=!1),Ze(),Y(e),n&&(n.scrollTop=0)}function Ne(e){const t=e.querySelector("#nc_chatpanel_clear_btn");t&&t.dataset.ncBoundClear!=="true"&&(t.dataset.ncBoundClear="true",t.addEventListener("click",()=>{yt(e),console.log("[chatpanel] panel temizlendi")}))}function Me(e,t){const n=e.querySelector(".nc_chatpanel_tabbar");if(!n||n.dataset.ncBoundTabs==="true")return;n.dataset.ncBoundTabs="true";const a=e.querySelector("#nc_chatpanel_tab_btn_kentrehberi"),r=e.querySelector("#nc_chatpanel_tab_btn_haberler"),i=e.querySelector("#nc_chatpanel_tab_btn_sosyal"),o=e.querySelector("#nc_chatpanel_tab_panel_kentrehberi"),c=e.querySelector("#nc_chatpanel_tab_panel_haberler"),l=e.querySelector("#nc_chatpanel_tab_panel_sosyal");if(!a||!r||!i||!o||!c||!l)return;const s=[{id:"kentrehberi",btn:a,panel:o},{id:"haberler",btn:r,panel:c},{id:"sosyal",btn:i,panel:l}];let d="kentrehberi";const u=p=>{for(const h of s){const b=h.id===p;h.btn.classList.toggle("nc_chatpanel_tab_btn--active",b),h.btn.setAttribute("aria-selected",b?"true":"false"),h.panel.classList.toggle("nc_chatpanel_tab_pane--active",b)}};for(const p of s)p.btn.addEventListener("click",()=>{p.id!==d&&(d=p.id,u(p.id),(p.id==="haberler"||p.id==="sosyal")&&Ce(e,t,`sekme:${p.id}`))})}function Te(e,t){const n=e.querySelector("#nc_chatpanel_wisart_btn"),a=e.querySelector("#nc_chatpanel_messages");if(!n||n.dataset.ncBoundWisart==="true")return;n.dataset.ncBoundWisart="true";const r=i=>{if(!a)return;v(a);const o=document.createElement("div");o.className="nc_chatpanel_msg nc_chatpanel_msg_ai",W(o,i),a.appendChild(o),g(a)};n.addEventListener("click",async()=>{if(n.disabled)return;n.disabled=!0;const i=n.innerHTML;n.innerHTML='<span aria-hidden="true">...</span>',j();let o=!1;try{const c=Ae();if(!c){console.warn("[chatpanel] Harita bbox alınamadı."),r("Harita alanı okunamadı.");return}o=!0;const l=`${t}/n8n/kentrehberi`,s=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bbox:c,faaliyet:"cami"})}),d=await s.text();let u=null;try{u=JSON.parse(d)}catch{u=d}if(console.log("[chatpanel] kentrehberi sonuç",{endpoint:l,status:s.status,data:u}),typeof u=="string")r(u);else if(u&&typeof u=="object"){const p=u.message;typeof p=="string"&&p.trim()?r(p.trim()):r(JSON.stringify(u))}else r(String(u))}catch(c){console.error("[chatpanel] WISART hata",c),r("WISART isteğinde hata oluştu.")}finally{U(),n.disabled=!1,n.innerHTML=i,o&&window.setTimeout(()=>{mt(t,a)},bt)}})}function Y(e){const t=e.querySelector("#nc_chatpanel_messages");if(!t||(v(t),t.querySelector('[data-nc-welcome-ai="true"]')))return;const n=document.createElement("div");n.className="nc_chatpanel_msg nc_chatpanel_msg_ai",n.setAttribute("data-nc-welcome-ai","true"),n.textContent=pt,t.prepend(n)}function K(e={}){const{container:t=document.body}=e;let n=document.getElementById(Se);const a=_t(e),r=ht(e),i=ft(e);if(Ie(a??null),n){a&&n.setAttribute("data-nc-map-instance",a);const l=n.shadowRoot;return l&&(Me(l,r),Te(l,i),ke(l,r),te(l,{ensureBracketCategoryLinkDelegation:v}),Ne(l),Y(l)),n}n=document.createElement("div"),n.id=Se,n.className="nc_chatpanel_root",n.setAttribute("data-nc-chatpanel","true"),a&&n.setAttribute("data-nc-map-instance",a);const o=n.attachShadow({mode:"open"});lt(o);const c=document.createElement("div");return c.className="nc_chatpanel_shell",c.innerHTML=st(),o.appendChild(c),t.appendChild(n),ct(o,r),Me(o,r),Te(o,i),ke(o,r),te(o,{ensureBracketCategoryLinkDelegation:v}),Ne(o),Y(o),n}const gt={init:e=>K(e??{}),getMapInstanceName:()=>He(),getRegisteredMap:y,getMaplibre:N};window.ChatPanel=gt;function xt(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if(xt()){const e=()=>K({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return w.getMaplibre=N,w.getRegisteredMap=y,w.hideSearchScanOverlay=U,w.initChatPanel=K,w.showSearchScanOverlay=j,Object.defineProperty(w,Symbol.toStringTag,{value:"Module"}),w}({});
