function module(e,t,a){let n,l,r,i,p,c,o,s,m,h,u;a.link("@rocket.chat/fuselage",{Button(e){n=e},Box(e){l=e},Throbber(e){r=e}},0),a.link("react",{default(e){i=e},useState(e){p=e}},1),a.link("../../../app/apps/client",{Apps(e){c=e}},2),a.link("../../components/basic/ExternalLink",{default(e){o=e}},3),a.link("../../components/basic/Page",{default(e){s=e}},4),a.link("../../contexts/RouterContext",{useRoute(e){m=e}},5),a.link("../../contexts/TranslationContext",{useTranslation(e){h=e}},6),a.link("../../contexts/ServerContext",{useMethod(e){u=e}},7);const d="https://github.com/RocketChat/Rocket.Chat.Apps-dev-environment/blob/master/README.md";function E(){const e=h(),[t,a]=p(!1),[E,x]=p(!1),g=m("admin-marketplace"),k=u("apps/go-enable"),b=u("apps/is-enabled"),f=async()=>{a(!0);try{await k(),await b()&&(await c.getAppClientManager().initialize(),await c.load(!0)),g.push()}catch(E){x(E)}};return i.createElement(s,{flexDirection:"column"},i.createElement(s.Header,{title:e("Apps_WhatIsIt")}),i.createElement(s.ScrollableContent,null,E?i.createElement(l,{fontScale:"s1",maxWidth:"x600",alignSelf:"center"},E.message):i.createElement(l,{alignSelf:"center",maxWidth:"x600",width:"full",withRichContent:!0},i.createElement("p",null,e("Apps_WhatIsIt_paragraph1")),i.createElement("p",null,e("Apps_WhatIsIt_paragraph2")),i.createElement("p",null,e("Apps_WhatIsIt_paragraph3")," ",i.createElement(o,{to:d})),i.createElement("p",null,e("Apps_WhatIsIt_paragraph4")),i.createElement(n,{primary:!0,disabled:t,minHeight:"x40",onClick:f},t?i.createElement(r,{inheritColor:!0}):e("Enable")))))}a.exportDefault(E)}

