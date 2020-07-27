function module(e,t,n){let o,a,l,i,s,m,c,r,u,d,E,k,x,C,h,p,f,j,g,b,w;n.link("@babel/runtime/helpers/extends",{default(e){o=e}},0),n.link("@babel/runtime/helpers/objectSpread2",{default(e){a=e}},1),n.export({useQuery:()=>y,default:()=>D}),n.link("react",{default(e){l=e},useMemo(e){i=e},useState(e){s=e},useCallback(e){m=e}},0),n.link("@rocket.chat/fuselage",{Button(e){c=e},Icon(e){r=e}},1),n.link("@rocket.chat/fuselage-hooks",{useDebouncedValue(e){u=e},useMediaQuery(e){d=e}},2),n.link("../../contexts/AuthorizationContext",{usePermission(e){E=e}},3),n.link("../../contexts/TranslationContext",{useTranslation(e){k=e}},4),n.link("../../components/basic/Page",{default(e){x=e}},5),n.link("../NotAuthorizedPage",{default(e){C=e}},6),n.link("./CustomEmoji",{CustomEmoji(e){h=e}},7),n.link("./EditCustomEmoji",{EditCustomEmojiWithData(e){p=e}},8),n.link("./AddCustomEmoji",{AddCustomEmoji(e){f=e}},9),n.link("../../contexts/RouterContext",{useRoute(e){j=e},useRouteParameter(e){g=e}},10),n.link("../../hooks/useEndpointData",{useEndpointData(e){b=e}},11),n.link("../../components/basic/VerticalBar",{default(e){w=e}},12);const P=e=>"asc"===e?1:-1,y=(e,t,n)=>{let{text:o,itemsPerPage:l,current:s}=e,[m,c]=t;return i(()=>a({query:JSON.stringify({name:{$regex:o||"",$options:"i"}}),sort:JSON.stringify({[m]:P(c)})},l&&{count:l},{},s&&{offset:s}),[o,l,s,m,c,n])};function D(e){let{props:t}=e;const n=k(),a=E("manage-emoji"),i="emoji-custom",[P,D]=s({text:"",current:0,itemsPerPage:25}),[_,A]=s(["name","asc"]),[S,N]=s(),H=u(P,500),R=u(_,500),q=y(H,R,S),z=b("emoji-custom.all",q)||{emojis:{}},B=j(i),I=d("(max-width: 420px)"),J=d("(max-width: 780px)"),M=g("context"),O=g("id"),Q=e=>()=>{B.push({context:"edit",id:e})},T=e=>{const[t,n]=_;A(t!==e?[e,"asc"]:[e,"asc"===n?"desc":"asc"])},V=m(e=>()=>{B.push({context:e})},[B]),$=()=>{B.push({})},W=m(()=>{N(new Date)},[]);return a?l.createElement(x,o({},t,{flexDirection:"row"}),l.createElement(x,{name:"admin-emoji-custom"},l.createElement(x.Header,{title:n("Custom_Emoji")},l.createElement(c,{small:!0,onClick:V("new"),"aria-label":n("New")},l.createElement(r,{name:"plus"}))),l.createElement(x.Content,null,l.createElement(h,{setParams:D,params:P,onHeaderClick:T,data:z,onClick:Q,sort:_}))),M&&l.createElement(w,{"mod-small":J,"mod-mobile":I,style:{width:"378px"},"qa-context-name":"admin-user-and-room-context-".concat(M),flexShrink:0},l.createElement(w.Header,null,"edit"===M&&n("Custom_Emoji_Info"),"new"===M&&n("Custom_Emoji_Add"),l.createElement(w.Close,{onClick:$})),l.createElement(w.Content,null,"edit"===M&&l.createElement(p,{_id:O,close:$,onChange:W,cache:S}),"new"===M&&l.createElement(f,{close:$,onChange:W})))):l.createElement(C,null)}}

