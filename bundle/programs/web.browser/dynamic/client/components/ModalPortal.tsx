function module(e,t,o){let n,r,d;o.link("react",{memo(e){n=e},useState(e){r=e}},0),o.link("react-dom",{createPortal(e){d=e}},1);const c=()=>{const e=document.getElementById("modal-root");if(e)return e;const t=document.createElement("div");return t.id="modal-root",document.body.appendChild(t),t},l=e=>{let{children:t}=e;const[o]=r(c);return d(t,o)};o.exportDefault(n(l))}

