function module(e,t,s){let n,o,r;s.export({useEndpointUpload:()=>c}),s.link("react",{useCallback(e){n=e}},0),s.link("../contexts/ServerContext",{useUpload(e){o=e}},1),s.link("../contexts/ToastMessagesContext",{useToastMessageDispatch(e){r=e}},2);const c=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},s=arguments.length>2?arguments[2]:void 0;const c=o(e),a=r();return n((async function(){try{for(var e=arguments.length,n=new Array(e),o=0;o<e;o++)n[o]=arguments[o];let r=c(t,...n);const i=r instanceof Promise?r:r.promise;if(!(r=await i).success)throw new Error(r.status);return s&&a({type:"success",message:s}),r}catch(r){return a({type:"error",message:r}),{success:!1}}}),[a,t,c,s])}}
