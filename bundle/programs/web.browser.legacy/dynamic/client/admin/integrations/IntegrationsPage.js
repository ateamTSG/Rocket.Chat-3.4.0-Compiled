function module(e,n,t){var o,c,i,u,l,a,r,s,f,m,k,p,g,E;function b(){var e=f(),n=m("admin-integrations"),t=r((function(){n.push({context:"new",type:"incoming"})}),[n]),b=k("context");a((function(){b||n.push({context:"webhook-incoming"})}),[b,n]);var d=!["zapier","bots"].includes(b),x=r((function(){return n.push({context:"webhook-incoming"})}),[n]),h=r((function(){return n.push({context:"webhook-outgoing"})}),[n]),w=r((function(){return n.push({context:"zapier"})}),[n]),C=r((function(){return n.push({context:"bots"})}),[n]);return l.createElement(s,{flexDirection:"column"},l.createElement(s.Header,{title:e("Integrations")},l.createElement(c,null,l.createElement(o,{onClick:t},l.createElement(i,{name:"plus"})," ",e("New")))),l.createElement(u,null,l.createElement(u.Item,{selected:"webhook-incoming"===b,onClick:x},e("Incoming")),l.createElement(u.Item,{selected:"webhook-outgoing"===b,onClick:h},e("Outgoing")),l.createElement(u.Item,{selected:"zapier"===b,onClick:w},e("Zapier")),l.createElement(u.Item,{selected:"bots"===b,onClick:C},e("Bots"))),l.createElement(s.Content,null,"zapier"===b&&l.createElement(g,null),"bots"===b&&l.createElement(E,null),d&&l.createElement(p,{type:b})))}t.link("@rocket.chat/fuselage",{Button:function(e){o=e},ButtonGroup:function(e){c=e},Icon:function(e){i=e},Tabs:function(e){u=e}},0),t.link("react",{default:function(e){l=e},useEffect:function(e){a=e},useCallback:function(e){r=e}},1),t.link("../../components/basic/Page",{default:function(e){s=e}},2),t.link("../../contexts/TranslationContext",{useTranslation:function(e){f=e}},3),t.link("../../contexts/RouterContext",{useRoute:function(e){m=e},useRouteParameter:function(e){k=e}},4),t.link("./IntegrationsTable",{default:function(e){p=e}},5),t.link("./new/NewZapier",{default:function(e){g=e}},6),t.link("./new/NewBot",{default:function(e){E=e}},7),t.exportDefault(b)}
