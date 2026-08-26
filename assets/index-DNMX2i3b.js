(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function a(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(r){if(r.ep)return;r.ep=!0;const n=a(r);fetch(r.href,n)}})();const p={135:["5294","cinestill800t","e100vs","ektar100","gold200","phoenix200ii","portra160","rdpiii","rvp100","rvp50","ultramax400"],645:["100tmx","e100","e100vs","rdpiii","rvp50","ultra100"],66:["100tmx","e100","e100vs","rdpiii","rvp50","ultra100"],67:["100tmx","e100","e100vs","rdpiii","rvp50","ultra100"]},B={"100tmx":"KODAK PROFESSIONAL T-MAX 100 Film",5294:"KODAK EKTACHROME 100D Color Reversal Film 5294",cinestill800t:"CineStill 800Tungsten Color Negative Film",e100:"KODAK PROFESSIONAL EKTACHROME E100 Color Reversal Film",e100vs:"KODAK PROFESSIONAL EKTACHROME E100VS Color Reversal Film",ektar100:"KODAK PROFESSIONAL EKTAR 100 Film",gold200:"KODAK GOLD 200 Film",phoenix200ii:"HARMAN Phoenix II 200 Color Film",portra160:"KODAK PROFESSIONAL PORTRA 160 Film",rdpiii:"FUJICHROME PROVIA 100F Professional",rvp100:"FUJICHROME Velvia 100 Professional",rvp50:"FUJICHROME Velvia 50 Professional",ultra100:"KODAK PROFESSIONAL Ultra Color 100UC Film",ultramax400:"KODAK ULTRAMAX 400 Film"},w={135:{width:6e3,height:4e3,x:120,y:820},645:{width:6e3,height:4500,x:240,y:240},66:{width:5500,height:5500,x:240,y:240},67:{width:7e3,height:5500,x:240,y:240}},x={standard:{label:"标准",value:.82},high:{label:"高",value:.94},lossless:{label:"无损",value:1}},i={format:"67",film:"rdpiii",quality:"high",exportType:"image/png",exportEngine:"canvas",orientation:"landscape",imageFile:null,sourceBitmap:null,frameBitmap:null},A=document.querySelector("#app");A.innerHTML=`
  <div class="app">
    <aside class="panel">
      <div class="brand">
        <h1>Film Border Studio</h1>
        <p>导入照片，套用已制作的胶片边框，并按所选画幅自动居中裁切。</p>
      </div>

      <div class="control">
        <label>照片</label>
        <div class="file-zone">
          <input id="fileInput" type="file" accept="image/*,.tif,.tiff,.heic,.heif,.avif" />
          <div>
            <strong>选择或拖入照片</strong>
            <span id="fileName">支持浏览器可解码的图片格式</span>
          </div>
        </div>
      </div>

      <div class="control">
        <div class="section-title">画幅</div>
        <div class="segmented" id="formatButtons"></div>
      </div>

      <div class="control">
        <div class="section-title">方向</div>
        <div class="segmented orientation" id="orientationButtons"></div>
      </div>

      <div class="control">
        <label for="filmSelect">胶片</label>
        <select id="filmSelect"></select>
      </div>

      <div class="control">
        <div class="section-title">画质</div>
        <div class="qualities" id="qualityButtons"></div>
      </div>

      <div class="control">
        <div class="section-title">导出格式</div>
        <div class="format-grid">
          <label><input type="radio" name="exportType" value="image/png" checked />PNG</label>
          <label><input type="radio" name="exportType" value="image/jpeg" />JPEG</label>
          <label><input type="radio" name="exportType" value="image/webp" />WebP</label>
          <label><input type="radio" name="exportType" value="image/png16" />16-bit PNG</label>
        </div>
      </div>

      <button class="primary" id="exportButton" disabled>导出照片</button>
      <div class="status" id="status"></div>
    </aside>

    <section class="workspace">
      <div class="topbar">
        <h2 id="previewTitle">预览</h2>
        <div class="meta" id="previewMeta"></div>
      </div>
      <div class="stage" id="stage">
        <div class="empty">
          <strong>尚未导入照片</strong>
          <div class="hint">选择照片后会自动裁切到当前画幅并叠加边框。</div>
        </div>
      </div>
    </section>
  </div>
`;const O=document.querySelector("#formatButtons"),F=document.querySelector("#orientationButtons"),g=document.querySelector("#filmSelect"),L=document.querySelector("#qualityButtons"),v=document.querySelector("#fileInput"),P=document.querySelector("#fileName"),b=document.querySelector("#stage"),C=document.querySelector("#status"),d=document.querySelector("#exportButton"),q=document.querySelector("#previewTitle"),y=document.querySelector("#previewMeta"),l=document.createElement("canvas"),u=l.getContext("2d",{colorSpace:"display-p3"})||l.getContext("2d");function s(e){C.textContent=e}function $(e,t){return`/film-border-studio/frames/${e}/${t}_${e}.png`}function h(e){return B[e]||e}function E(e){return h(e).replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase()}function T(){return i.format!=="66"&&i.orientation==="portrait"}function N(e,t,a){return{width:e.height,height:e.width,x:a-e.y-e.height,y:e.x}}function R(e){const t=w[i.format];return T()?{aperture:N(t,e.width,e.height),outputWidth:e.height,outputHeight:e.width,rotateFrame:!0}:{aperture:t,outputWidth:e.width,outputHeight:e.height,rotateFrame:!1}}function m(){O.innerHTML=Object.keys(p).map(t=>`<button type="button" class="${i.format===t?"active":""}" data-format="${t}">${t}</button>`).join(""),L.innerHTML=Object.entries(x).map(([t,a])=>`<button type="button" class="${i.quality===t?"active":""}" data-quality="${t}">${a.label}</button>`).join("");const e=i.format==="66"?"landscape":i.orientation;F.innerHTML=[["landscape","横向"],["portrait","竖向"]].map(([t,a])=>`<button type="button" class="${e===t?"active":""}" data-orientation="${t}" ${i.format==="66"&&t==="portrait"?"disabled":""}>${a}</button>`).join(""),g.innerHTML=p[i.format].map(t=>`<option value="${t}" ${i.film===t?"selected":""}>${h(t)}</option>`).join("")}async function I(e){const t=await fetch(e);if(!t.ok)throw new Error("边框素材加载失败");const a=await t.blob();return createImageBitmap(a)}async function K(e){try{return await createImageBitmap(e,{imageOrientation:"from-image"})}catch{const t=URL.createObjectURL(e);try{const a=new Image;return a.decoding="async",a.src=t,await a.decode(),a}finally{URL.revokeObjectURL(t)}}}function U(e,t){const a=e.width,o=e.height;if(a/o>t){const c=o*t;return{x:(a-c)/2,y:0,width:c,height:o}}const n=a/t;return{x:0,y:(o-n)/2,width:a,height:n}}async function f(){if(d.disabled=!0,!i.sourceBitmap)return;const e=w[i.format];q.textContent=`${i.format} · ${h(i.film)}`,y.textContent=`${e.width} x ${e.height}`,s("正在加载边框素材..."),i.frameBitmap=await I($(i.format,i.film));const t=R(i.frameBitmap),a=t.aperture;l.width=t.outputWidth,l.height=t.outputHeight,y.textContent=`${a.width} x ${a.height}${t.rotateFrame?" · 竖版边框":""}`,u.clearRect(0,0,l.width,l.height);const o=U(i.sourceBitmap,a.width/a.height);u.drawImage(i.sourceBitmap,o.x,o.y,o.width,o.height,a.x,a.y,a.width,a.height),t.rotateFrame?(u.save(),u.translate(l.width,0),u.rotate(Math.PI/2),u.drawImage(i.frameBitmap,0,0),u.restore()):u.drawImage(i.frameBitmap,0,0),l.parentNode||(b.innerHTML="",b.appendChild(l)),d.disabled=!1;const r=t.rotateFrame?"已使用竖向边框。":"当前使用横向边框。",n=M()?"当前浏览器支持宽色域显示。":"当前浏览器未报告宽色域支持；HDR 会按浏览器能力降级。";s(`${r} ${n}`)}function M(){return window.matchMedia?.("(color-gamut: p3)").matches}function H(e){return e==="image/png16"?"png":e==="image/jpeg"?"jpg":e==="image/webp"?"webp":"png"}function j(e,t,a){return new Promise(o=>{t==="image/png"?e.toBlob(o,"image/png"):e.toBlob(o,t,a)})}async function k(){if(!i.sourceBitmap||!i.frameBitmap)return;d.disabled=!0,s("正在导出...");const e=x[i.quality].value,t=i.exportType;if(t==="image/png16"){await G(),d.disabled=!1;return}const a=await j(l,t,e);if(!a){s("当前浏览器不支持所选导出格式。"),d.disabled=!1;return}const o=URL.createObjectURL(a),r=document.createElement("a"),n=i.imageFile?.name?.replace(/\.[^.]+$/,"")||"photo";r.href=o,r.download=`${n}_${i.format}_${E(i.film)}.${H(t)}`,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(o),s("已导出。"),d.disabled=!1}function D(e){return new Promise((t,a)=>{const o=new Worker(new URL("/film-border-studio/assets/worker-16bit-C2kbaovN.js",import.meta.url),{type:"module"});o.onmessage=r=>{const{type:n,message:c,blob:S}=r.data;n==="progress"&&s(c),n==="done"&&(o.terminate(),t(S)),n==="error"&&(o.terminate(),a(new Error(c)))},o.onerror=r=>{o.terminate(),a(new Error(r.message||"16-bit 导出失败"))},o.postMessage(e,[e.sourceBuffer])})}async function G(){try{const e=R(i.frameBitmap),t=await i.imageFile.arrayBuffer(),a=await D({sourceBuffer:t,sourceType:i.imageFile.type,frameUrl:$(i.format,i.film),aperture:e.aperture,rotateFrame:e.rotateFrame}),o=URL.createObjectURL(a),r=document.createElement("a"),n=i.imageFile?.name?.replace(/\.[^.]+$/,"")||"photo";r.href=o,r.download=`${n}_${i.format}_${E(i.film)}_16bit.png`,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(o),s("已导出 16-bit PNG。")}catch(e){s(`16-bit PNG 导出失败：${e.message}`)}}O.addEventListener("click",async e=>{const t=e.target.closest("button[data-format]");t&&(i.format=t.dataset.format,p[i.format].includes(i.film)||(i.film=p[i.format][0]),m(),await f())});L.addEventListener("click",e=>{const t=e.target.closest("button[data-quality]");t&&(i.quality=t.dataset.quality,m())});F.addEventListener("click",async e=>{const t=e.target.closest("button[data-orientation]");!t||t.disabled||(i.orientation=t.dataset.orientation,m(),await f())});g.addEventListener("change",async()=>{i.film=g.value,await f()});document.querySelectorAll('input[name="exportType"]').forEach(e=>{e.addEventListener("change",()=>{i.exportType=e.value,i.exportType==="image/png16"&&(i.quality="lossless",m())})});v.addEventListener("change",async()=>{const e=v.files?.[0];if(e){i.imageFile=e,P.textContent=e.name,s("正在读取照片...");try{i.sourceBitmap=await K(e),await f()}catch(t){s(`无法读取这张照片：${t.message}`)}}});d.addEventListener("click",k);m();s("普通导出走 Canvas；16-bit PNG 会在浏览器本地用独立像素管线合成，PNG16 输入可保留 16-bit 像素精度。");
