function module(e,t,o){let r,n;function a(e,t){const[o,a]=r(()=>{try{const o=window.localStorage.getItem(e);return o?JSON.parse(o):t}catch(o){return console.log("useLocalStorage Error ->",o),t}}),c=t=>{try{const r=t instanceof Function?t(o):t;a(r),window.localStorage.setItem(e,JSON.stringify(r))}catch(r){console.log("useLocalStorage setValue Error ->",r)}};return n(()=>{function t(t){t.key===e&&a(JSON.parse(t.newValue))}return window.addEventListener("storage",t),()=>window.removeEventListener("storage",t)},[e]),[o,c]}o.export({useLocalStorage:()=>a}),o.link("react",{useState(e){r=e},useEffect(e){n=e}},0)}
