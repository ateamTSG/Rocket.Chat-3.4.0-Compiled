function module(e,t,n){let l,a,r,o,s,i,c,m,u,d,E,g,h,p,b,S,_,f,y,k;n.link("@babel/runtime/helpers/objectSpread2",{default(e){l=e}},0),n.export({MessagesPerChannelSection:()=>C}),n.link("@nivo/pie",{ResponsivePie(e){a=e}},0),n.link("@rocket.chat/fuselage",{Box(e){r=e},Flex(e){o=e},Icon(e){s=e},Margins(e){i=e},Select(e){c=e},Skeleton(e){m=e},Table(e){u=e},Tile(e){d=e}},1),n.link("moment",{default(e){E=e}},2),n.link("react",{default(e){g=e},useMemo(e){h=e},useState(e){p=e}},3),n.link("../../../../../../client/contexts/TranslationContext",{useTranslation(e){b=e}},4),n.link("../../../../../../client/hooks/useEndpointData",{useEndpointData(e){S=e}},5),n.link("../data/LegendSymbol",{LegendSymbol(e){_=e}},6),n.link("../Section",{Section(e){f=e}},7),n.link("../../../../../../client/components/basic/Buttons/ActionButton",{ActionButton(e){y=e}},8),n.link("../../../../../../client/lib/saveFile",{saveFile(e){k=e}},9);const x=e=>"// type, messagesSent\n".concat(e.map(e=>{let{t:t,messages:n}=e;return"".concat(t,", ").concat(n)}).join("\n"));function C(){const e=b(),t=h(()=>[["last 7 days",e("Last_7_days")],["last 30 days",e("Last_30_days")],["last 90 days",e("Last_90_days")]],[e]),[n,C]=p("last 7 days"),v=h(()=>{switch(n){case"last 7 days":return{start:E().set({hour:0,minute:0,second:0,millisecond:0}).subtract(7,"days"),end:E().set({hour:0,minute:0,second:0,millisecond:0}).subtract(1)};case"last 30 days":return{start:E().set({hour:0,minute:0,second:0,millisecond:0}).subtract(30,"days"),end:E().set({hour:0,minute:0,second:0,millisecond:0}).subtract(1)};case"last 90 days":return{start:E().set({hour:0,minute:0,second:0,millisecond:0}).subtract(90,"days"),end:E().set({hour:0,minute:0,second:0,millisecond:0}).subtract(1)}}},[n]),w=e=>C(e),F=h(()=>({start:v.start.toISOString(),end:v.end.toISOString()}),[v]),I=S("engagement-dashboard/messages/origin",F),D=S("engagement-dashboard/messages/top-five-popular-channels",F),[A,P]=h(()=>{if(!I||!D)return[];const e=I.origins.reduce((e,t)=>{let{messages:n,t:a}=t;return l({},e,{[a]:n})},{}),t=D.channels.reduce((e,t,n)=>{let{t:l,messages:a,name:r,usernames:o}=t;return[...e,{i:n,t:l,name:r||o.join(" × "),messages:a}]},[]);return[e,t]},[v,I,D]),R=()=>{k(x(I.origins),"MessagesPerChannelSection_start_".concat(F.start,"_end_").concat(F.end,".csv"))};return g.createElement(f,{title:e("Where_are_the_messages_being_sent?"),filter:g.createElement(g.Fragment,null,g.createElement(c,{options:t,value:n,onChange:w}),g.createElement(y,{mis:"x16",disabled:!I,onClick:R,"aria-label":e("Download_Info"),icon:"download"}))},g.createElement(o.Container,null,g.createElement(i,{inline:"neg-x12"},g.createElement(r,null,g.createElement(i,{inline:"x12"},g.createElement(o.Item,{grow:1,shrink:0,basis:"0"},g.createElement(r,null,g.createElement(o.Container,{alignItems:"center",wrap:"no-wrap"},A?g.createElement(r,null,g.createElement(o.Item,{grow:1,shrink:1},g.createElement(i,{inline:"x24"},g.createElement(r,{style:{position:"relative",height:300}},g.createElement(r,{style:{position:"absolute",width:"100%",height:"100%"}},g.createElement(a,{data:[{id:"d",label:e("Private_Chats"),value:A.d,color:"#FFD031"},{id:"c",label:e("Private_Channels"),value:A.c,color:"#2DE0A5"},{id:"p",label:e("Public_Channels"),value:A.p,color:"#1D74F5"}],innerRadius:.6,colors:["#FFD031","#2DE0A5","#1D74F5"],enableRadialLabels:!1,enableSlicesLabels:!1,animate:!0,motionStiffness:90,motionDamping:15,theme:{axis:{ticks:{text:{fill:"#9EA2A8",fontFamily:'Inter, -apple-system, system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Meiryo UI", Arial, sans-serif',fontSize:10,fontStyle:"normal",fontWeight:"600",letterSpacing:"0.2px",lineHeight:"12px"}}},tooltip:{container:{backgroundColor:"#1F2329",boxShadow:"0px 0px 12px rgba(47, 52, 61, 0.12), 0px 0px 2px rgba(47, 52, 61, 0.08)",borderRadius:2}}},tooltip:t=>{let{value:n}=t;return(g.createElement(r,{fontScale:"p2",color:"alternative"},e("Value_messages",{value:n})))}}))))),g.createElement(o.Item,{basis:"auto"},g.createElement(i,{block:"neg-x4"},g.createElement(r,null,g.createElement(i,{block:"x4"},g.createElement(r,{color:"info",fontScale:"p1"},g.createElement(_,{color:"#FFD031"}),e("Private_Chats")),g.createElement(r,{color:"info",fontScale:"p1"},g.createElement(_,{color:"#2DE0A5"}),e("Private_Channels")),g.createElement(r,{color:"info",fontScale:"p1"},g.createElement(_,{color:"#1D74F5"}),e("Public_Channels"))))))):g.createElement(m,{variant:"rect",height:300})))),g.createElement(o.Item,{grow:1,shrink:0,basis:"0"},g.createElement(r,null,g.createElement(i,{blockEnd:"x16"},P?g.createElement(r,{fontScale:"p1"},e("Most_popular_channels_top_5")):g.createElement(m,{width:"50%"})),P&&!P.length&&g.createElement(d,{fontScale:"p1",color:"info",style:{textAlign:"center"}},e("Not_enough_data")),(!P||!!P.length)&&g.createElement(u,null,g.createElement(u.Head,null,g.createElement(u.Row,null,g.createElement(u.Cell,null,"#"),g.createElement(u.Cell,null,e("Channel")),g.createElement(u.Cell,{align:"end"},e("Number_of_messages")))),g.createElement(u.Body,null,P&&P.map(e=>{let{i:t,t:n,name:l,messages:a}=e;return(g.createElement(u.Row,{key:t},g.createElement(u.Cell,null,t+1,"."),g.createElement(u.Cell,null,g.createElement(i,{inlineEnd:"x4"},"d"===n&&g.createElement(s,{name:"at"})||"c"===n&&g.createElement(s,{name:"lock"})||"p"===n&&g.createElement(s,{name:"hashtag"})),l),g.createElement(u.Cell,{align:"end"},a)))}),!P&&Array.from({length:5},(e,t)=>g.createElement(u.Row,{key:t},g.createElement(u.Cell,null,g.createElement(m,{width:"100%"})),g.createElement(u.Cell,null,g.createElement(m,{width:"100%"})),g.createElement(u.Cell,{align:"end"},g.createElement(m,{width:"100%"})))))))))))))}}
