function module(e,t,n){let o,a,l,r,c,s,i,u,d,g,k,m,h,f,C,p,y,E,S,x,R,_,v;function w(){const e=k(),t=h(),n=C("cloud"),w=p("page"),b=f("error_code"),I=f("code"),M=f("state"),T=f("token"),W=m("cloud:finishOAuthAuthorization"),B=m("cloud:checkRegisterStatus"),A=m("cloud:connectWorkspace");d(()=>{const o=async()=>{if("oauth-callback"===w){if(b)return t({type:"error",title:e("Cloud_error_in_authenticating"),message:e("Cloud_error_code",{errorCode:b})}),void n.push();try{await W(I,M)}catch(o){t({type:"error",message:o})}finally{n.push()}}};o()},[b,I,M,w,t,e,n,W]);const[P,q]=s(u()),[D,z]=u(null),F=c(async()=>{try{const e=await B();q(e)}catch(e){t({type:"error",message:e})}});d(()=>{const n=async()=>{try{if(T){const n=await A(T);if(!n)throw Error(e("An error occured connecting"));t({type:"success",message:e("Connected")})}}catch(n){t({type:"error",message:n})}finally{await F()}};n()},[A,t,F,e,T]);const G=()=>{const e=()=>{z(null),F()};z(i.createElement(_,{onClose:e}))},H=null==P?void 0:P.connectToCloud,L=null==P?void 0:P.workspaceRegistered;return i.createElement(g,null,i.createElement(g.Header,{title:e("Connectivity_Services")},i.createElement(l,null,!L&&i.createElement(a,{onClick:G},e("Cloud_Register_manually")),i.createElement(a,{is:"a",primary:!0,href:v,target:"_blank",rel:"noopener noreferrer"},e("Cloud_console")))),i.createElement(g.ScrollableContentWithShadow,null,D,i.createElement(o,{marginInline:"auto",marginBlock:"neg-x24",width:"full",maxWidth:"x580"},i.createElement(r,{block:"x24"},i.createElement(y,null),H&&i.createElement(i.Fragment,null,L?i.createElement(R,{onRegisterStatusChange:F}):i.createElement(x,{email:null==P?void 0:P.email,token:null==P?void 0:P.token,workspaceId:null==P?void 0:P.workspaceId,uniqueId:null==P?void 0:P.uniqueId,onRegisterStatusChange:F}),i.createElement(S,{onRegisterStatusChange:F})),!H&&i.createElement(E,{onRegisterStatusChange:F})))))}n.link("@rocket.chat/fuselage",{Box(e){o=e},Button(e){a=e},ButtonGroup(e){l=e},Margins(e){r=e}},0),n.link("@rocket.chat/fuselage-hooks",{useMutableCallback(e){c=e},useSafely(e){s=e}},1),n.link("react",{default(e){i=e},useState(e){u=e},useEffect(e){d=e}},2),n.link("../../components/basic/Page",{default(e){g=e}},3),n.link("../../contexts/TranslationContext",{useTranslation(e){k=e}},4),n.link("../../contexts/ServerContext",{useMethod(e){m=e}},5),n.link("../../contexts/ToastMessagesContext",{useToastMessageDispatch(e){h=e}},6),n.link("../../contexts/RouterContext",{useQueryStringParameter(e){f=e},useRoute(e){C=e},useRouteParameter(e){p=e}},7),n.link("./WhatIsItSection",{default(e){y=e}},8),n.link("./ConnectToCloudSection",{default(e){E=e}},9),n.link("./TroubleshootingSection",{default(e){S=e}},10),n.link("./WorkspaceRegistrationSection",{default(e){x=e}},11),n.link("./WorkspaceLoginSection",{default(e){R=e}},12),n.link("./ManualWorkspaceRegistrationModal",{default(e){_=e}},13),n.link("./constants",{cloudConsoleUrl(e){v=e}},14),n.exportDefault(w)}

