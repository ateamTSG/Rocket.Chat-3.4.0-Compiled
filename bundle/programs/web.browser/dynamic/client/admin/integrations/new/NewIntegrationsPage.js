function module(e,t,n){let l,o,i,a,c,u,r,m,g,s,k,d,E;function f(e){let t=l({},e);const n=k(),f=E("admin-integrations"),b=r(e=>()=>{f.push({context:"new",type:e})},[f]),x=r(()=>{f.push({})},[f]),h=d("type");return u.createElement(m,l({flexDirection:"column"},t),u.createElement(m.Header,{title:n("Integrations")},u.createElement(a,null,u.createElement(i,{onClick:x},u.createElement(c,{name:"back",size:"x16"})," ",n("Back")))),u.createElement(o,null,u.createElement(o.Item,{selected:"incoming"===h,onClick:b("incoming")},n("Incoming")),u.createElement(o.Item,{selected:"outgoing"===h,onClick:b("outgoing")},n("Outgoing"))),u.createElement(m.ScrollableContentWithShadow,null,"incoming"===h&&u.createElement(g,{key:"incoming"})||"outgoing"===h&&u.createElement(s,{key:"outgoing"})))}n.link("@babel/runtime/helpers/extends",{default(e){l=e}},0),n.export({default:()=>f}),n.link("@rocket.chat/fuselage",{Tabs(e){o=e},Button(e){i=e},ButtonGroup(e){a=e},Icon(e){c=e}},0),n.link("react",{default(e){u=e},useCallback(e){r=e}},1),n.link("../../../components/basic/Page",{default(e){m=e}},2),n.link("./NewIncomingWebhook",{default(e){g=e}},3),n.link("./NewOutgoingWebhook",{default(e){s=e}},4),n.link("../../../contexts/TranslationContext",{useTranslation(e){k=e}},5),n.link("../../../contexts/RouterContext",{useRouteParameter(e){d=e},useRoute(e){E=e}},6)}
