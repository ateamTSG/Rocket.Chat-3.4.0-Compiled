function module(t,e,s){let n,o,r;s.export({useEndpointAction:()=>c}),s.link("react",{useCallback(t){n=t}},0),s.link("../contexts/ServerContext",{useEndpoint(t){o=t}},1),s.link("../contexts/ToastMessagesContext",{useToastMessageDispatch(t){r=t}},2);const c=function(t,e){let s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},c=arguments.length>3?arguments[3]:void 0;const a=o(t,e),u=r();return n((async function(){try{for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];const o=await a(s,...e);if(!o.success)throw new Error(o.status);return c&&u({type:"success",message:c}),o}catch(o){return u({type:"error",message:o}),{success:!1}}}),[u,s,a,c])}}

