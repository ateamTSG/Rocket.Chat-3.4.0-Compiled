function module(t,e,s){let n,o,r,c;s.export({useEndpointData:()=>u}),s.link("react",{useEffect(t){n=t},useState(t){o=t}},0),s.link("../contexts/ServerContext",{useEndpoint(t){r=t}},1),s.link("../contexts/ToastMessagesContext",{useToastMessageDispatch(t){c=t}},2);const u=function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const[s,u]=o(null),a=r("GET",t),i=c();return n(()=>{let t=!0;const s=async()=>{try{const s=setTimeout(()=>{t&&u(null)},3e3),n=await a(e);if(clearTimeout(s),!n.success)throw new Error(n.status);if(!t)return;u(n)}catch(s){console.error(s),i({type:"error",message:s})}};return s(),()=>{t=!1}},[i,a,e]),s}}

