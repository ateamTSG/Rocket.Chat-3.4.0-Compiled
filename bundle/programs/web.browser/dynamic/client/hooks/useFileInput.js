function module(e,t,n){let l,o,i;n.export({useFileInput:()=>a}),n.link("@rocket.chat/fuselage-hooks",{useMutableCallback(e){l=e}},0),n.link("react",{useState(e){o=e},useEffect(e){i=e}},1);const a=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"image";const[n,a]=o(()=>()=>{}),c=l(e);return i(()=>{const e=document.createElement("input"),n=new FormData;e.setAttribute("type","file"),e.setAttribute("style","display: none"),document.body.appendChild(e);const l=()=>{n.append(t,e.files[0]),c(e.files[0],n)};return e.addEventListener("change",l,!1),a(()=>()=>e.click()),()=>{e.parentNode.removeChild(e)}},[t,c]),n}}
