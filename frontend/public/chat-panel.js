var ChatPanel=function(l){"use strict";const h="nc_chatpanel_root";let d=null;function u(){var n;const e=d;return!e||typeof window>"u"?null:((n=window.__ncMapRegistry__)==null?void 0:n[e])??null}function p(){return window.maplibregl}const y="http://localhost:3001/api/n8n";function _(e){var a,r;const n=(a=e.mapInstanceName)==null?void 0:a.trim();if(n)return n;if(typeof document>"u")return;const t=document.currentScript,o=(r=t==null?void 0:t.getAttribute("data-map-instance"))==null?void 0:r.trim();if(o)return o}function x(e){var t,o;const n=(t=e.n8nProxyUrl)==null?void 0:t.trim();if(n)return n;if(typeof document<"u"){const a=document.currentScript,r=(o=a==null?void 0:a.getAttribute("data-n8n-proxy"))==null?void 0:o.trim();if(r)return r}return y}function f(e,n){if(Array.isArray(e)){if(e.length>=2&&typeof e[0]=="number"&&Number.isFinite(e[0])&&typeof e[1]=="number"&&Number.isFinite(e[1])){n.push([e[0],e[1]]);return}for(const t of e)f(t,n)}}function g(e,n){const t=p();if(!(t!=null&&t.LngLatBounds))return;const o=[];for(const r of n.features??[]){const i=r==null?void 0:r.geometry;if(i){if(i.type==="GeometryCollection"&&Array.isArray(i.geometries)){for(const c of i.geometries)f(c==null?void 0:c.coordinates,o);continue}f(i.coordinates,o)}}if(o.length===0)return;const a=o.reduce((r,i)=>r.extend(i),new t.LngLatBounds(o[0],o[0]));e.fitBounds(a,{padding:48,duration:700,maxZoom:18})}function b(e){var r;const n=u();if(!n||typeof n.addSource!="function")return;const t="nc_chatpanel_geojson",o="nc_chatpanel_geojson_",a=(r=n.getSource)==null?void 0:r.call(n,t);if(a&&typeof a.setData=="function"){a.setData(e),g(n,e);return}n.addSource(t,{type:"geojson",data:e}),n.addLayer({id:`${o}fill`,type:"fill",source:t,filter:["==","$type","Polygon"],paint:{"fill-color":"#22c55e","fill-opacity":.25,"fill-outline-color":"#16a34a"}}),n.addLayer({id:`${o}line`,type:"line",source:t,filter:["==","$type","LineString"],paint:{"line-color":"#16a34a","line-width":3}}),n.addLayer({id:`${o}point`,type:"circle",source:t,filter:["==","$type","Point"],paint:{"circle-radius":6,"circle-color":"#22c55e","circle-stroke-width":2,"circle-stroke-color":"#ffffff"}}),g(n,e)}async function v(e,n){var s;const t=new FormData;t.append("chatInput",n);const o=await fetch(e,{method:"POST",body:t}),a=await o.text(),r=o.headers.get("content-type")??"";let i=null;if(r.toLowerCase().includes("application/json"))try{i=JSON.parse(a)}catch{i=null}console.log("[chatpanel] n8n yanıtı",{proxyUrl:e,status:o.status,contentType:r,body:i??a});const c=i;c!=null&&c.ok&&((s=c.geojson)==null?void 0:s.type)==="FeatureCollection"&&b(c.geojson)}function w(){const e="nc_chatpanel_styles";if(document.getElementById(e))return;const n=document.createElement("style");n.id=e,n.textContent=`
    .nc_chatpanel_root {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 99999;
      width: min(380px, calc(100vw - 32px));
      max-height: min(520px, calc(100vh - 32px));
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
      background: #fff;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .nc_chatpanel_header {
      flex-shrink: 0;
      padding: 10px 12px;
      background: #0d6efd;
      color: #fff;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .nc_chatpanel_messages {
      flex: 1;
      min-height: 180px;
      padding: 12px;
      overflow-y: auto;
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
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid #dee2e6;
      background: #fff;
    }
    .nc_chatpanel_input {
      flex: 1;
      border: 1px solid #ced4da;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 0.875rem;
      outline: none;
    }
    .nc_chatpanel_input:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.2);
    }
    .nc_chatpanel_send {
      flex-shrink: 0;
      padding: 8px 14px;
      border: none;
      border-radius: 8px;
      background: #0d6efd;
      color: #fff;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .nc_chatpanel_send:hover {
      background: #0b5ed7;
    }
  `,document.head.appendChild(n)}function S(){return`
    <div class="nc_chatpanel_header">Keos AI</div>
    <div class="nc_chatpanel_messages" id="nc_chatpanel_messages">
      
    </div>
    <form class="nc_chatpanel_form" id="nc_chatpanel_form" autocomplete="off">
      <input class="nc_chatpanel_input" id="nc_chatpanel_input" type="text" placeholder="Mesaj yazın…" />
      <button class="nc_chatpanel_send" type="submit">Gönder</button>
    </form>
  `}function L(e,n){const t=e.querySelector("#nc_chatpanel_form"),o=e.querySelector("#nc_chatpanel_input"),a=e.querySelector("#nc_chatpanel_messages");!t||!o||!a||t.addEventListener("submit",r=>{r.preventDefault();const i=o.value.trim();if(!i)return;const c=document.createElement("div");c.className="nc_chatpanel_msg_line",c.style.marginBottom="8px",c.textContent=i,a.appendChild(c),a.scrollTop=a.scrollHeight,o.value="",v(n,i).catch(s=>{console.error("[chatpanel] n8n istek hatası",s)})})}function m(e={}){const{container:n=document.body}=e;let t=document.getElementById(h);const o=_(e),a=x(e);return d=o??null,t?(o&&t.setAttribute("data-nc-map-instance",o),t):(w(),t=document.createElement("div"),t.id=h,t.className="nc_chatpanel_root",t.setAttribute("data-nc-chatpanel","true"),o&&t.setAttribute("data-nc-map-instance",o),t.innerHTML=S(),n.appendChild(t),L(t,a),t)}const C={init:e=>m(e??{}),getMapInstanceName:()=>d,getRegisteredMap:u,getMaplibre:p};window.ChatPanel=C;function P(){if(typeof document>"u")return!1;const e=document.currentScript;return(e==null?void 0:e.getAttribute("data-auto-init"))!=="false"}if(P()){const e=()=>m({});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):e()}return l.getMaplibre=p,l.getRegisteredMap=u,l.initChatPanel=m,Object.defineProperty(l,Symbol.toStringTag,{value:"Module"}),l}({});
