function module(e,t,n){let a,l,i,r,o,s,c,m,u,d,g,h,p,f,x;function y(e){let{displacement:t,onPreviousDateClick:n,onNextDateClick:o}=e;const s=p(),c=g(()=>u().set({hour:0,minute:0,second:0,millisecond:0}).subtract(1).subtract(t,"days"),[t]),h=g(()=>({start:c.toISOString()}),[c]),x=f("engagement-dashboard/users/chat-busier/hourly-data",h),y=g(()=>{if(!x)return[];const e=2,t=Array.from({length:12},(e,t)=>({hour:String(2*t),users:0}));for(const{hour:n,users:a}of x.hours){const e=Math.floor(n/2);t[e]=t[e]||{hour:String(2*e),users:0},t[e].users+=a}return t},[x]);return d.createElement(d.Fragment,null,d.createElement(l,{display:"flex",alignItems:"center",justifyContent:"center"},d.createElement(i,{ghost:!0,square:!0,small:!0,onClick:n},d.createElement(r,{left:!0,size:"x20",style:{verticalAlign:"middle"}})),d.createElement(l,{mi:"x8",flexBasis:"25%",is:"span",style:{textAlign:"center"}},c.format(t<7?"dddd":"L")),d.createElement(i,{ghost:!0,square:!0,small:!0,disabled:0===t,onClick:o},d.createElement(r,{right:!0,size:"x20",style:{verticalAlign:"middle"}}))),x?d.createElement(l,{display:"flex",height:"196px"},d.createElement(l,{align:"stretch",flexGrow:1,flexShrink:0,position:"relative"},d.createElement(l,{position:"absolute",width:"100%",height:"100%"},d.createElement(a,{data:y,indexBy:"hour",keys:["users"],groupMode:"grouped",padding:.25,margin:{bottom:20},colors:["#1d74f5"],enableLabel:!1,enableGridY:!1,axisTop:null,axisRight:null,axisBottom:{tickSize:0,tickPadding:4,tickRotation:0,tickValues:"every 2 hours",format:e=>u().set({hour:e,minute:0,second:0}).format("LT")},axisLeft:null,animate:!0,motionStiffness:90,motionDamping:15,theme:{axis:{ticks:{text:{fill:"#9EA2A8",fontFamily:'Inter, -apple-system, system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Meiryo UI", Arial, sans-serif',fontSize:"10px",fontStyle:"normal",fontWeight:"600",letterSpacing:"0.2px",lineHeight:"12px"}}},tooltip:{container:{backgroundColor:"#1F2329",boxShadow:"0px 0px 12px rgba(47, 52, 61, 0.12), 0px 0px 2px rgba(47, 52, 61, 0.08)",borderRadius:2}}},tooltip:e=>{let{value:t}=e;return(d.createElement(l,{fontScale:"p2",color:"alternative"},s("Value_users",{value:t})))}})))):d.createElement(m,{variant:"rect",height:196}))}function E(e){let{displacement:t,onPreviousDateClick:n,onNextDateClick:c}=e;const h=g(()=>u.utc().subtract(t,"weeks"),[t]),p=g(()=>{const e=h.clone().subtract(6,"days");return"".concat(e.format("L")," - ").concat(h.format("L"))},[h]),x=g(()=>({start:h.toISOString()}),[h]),y=f("engagement-dashboard/users/chat-busier/weekly-data",x),E=g(()=>y?y.month.map(e=>{let{users:t,day:n,month:a,year:l}=e;return{users:t,day:String(u.utc([l,a-1,n,0,0,0]).valueOf())}}).sort((e,t)=>{let{day:n}=e,{day:a}=t;return n-a}):[],[y]);return d.createElement(d.Fragment,null,d.createElement(o.Container,{alignItems:"center",justifyContent:"center"},d.createElement(l,null,d.createElement(i,{ghost:!0,square:!0,small:!0,onClick:n},d.createElement(r,{left:!0,size:"x20",style:{verticalAlign:"middle"}})),d.createElement(o.Item,{basis:"50%"},d.createElement(s,{inline:"x8"},d.createElement(l,{is:"span",style:{textAlign:"center"}},p))),d.createElement(i,{ghost:!0,square:!0,small:!0,disabled:0===t,onClick:c},d.createElement(r,{right:!0,size:"x20",style:{verticalAlign:"middle"}})))),d.createElement(o.Container,null,y?d.createElement(l,{style:{height:196}},d.createElement(o.Item,{align:"stretch",grow:1,shrink:0},d.createElement(l,{style:{position:"relative"}},d.createElement(l,{style:{position:"absolute",width:"100%",height:"100%"}},d.createElement(a,{data:E,indexBy:"day",keys:["users"],groupMode:"grouped",padding:.25,margin:{bottom:20},colors:["#1d74f5"],enableLabel:!1,enableGridY:!1,axisTop:null,axisRight:null,axisBottom:{tickSize:0,tickPadding:4,tickRotation:0,tickValues:"every 3 days",format:e=>u(parseInt(e,10)).format("L")},axisLeft:null,animate:!0,motionStiffness:90,motionDamping:15,theme:{axis:{ticks:{text:{fill:"#9EA2A8",fontFamily:'Inter, -apple-system, system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Meiryo UI", Arial, sans-serif',fontSize:"10px",fontStyle:"normal",fontWeight:"600",letterSpacing:"0.2px",lineHeight:"12px"}}}}}))))):d.createElement(m,{variant:"rect",height:196})))}function k(){const e=p(),[t,n]=h("hours"),a=g(()=>[["hours",e("Hours")],["days",e("Days")]],[e]),[l,i]=h(0),r=e=>{n(e),i(0)},o=()=>i(e=>e+1),s=()=>i(e=>e-1),m="hours"===t&&y||"days"===t&&E;return d.createElement(x,{title:e("When_is_the_chat_busier?"),filter:d.createElement(c,{options:a,value:t,onChange:r})},d.createElement(m,{displacement:l,onPreviousDateClick:o,onNextDateClick:s}))}n.export({BusiestChatTimesSection:()=>k}),n.link("@nivo/bar",{ResponsiveBar(e){a=e}},0),n.link("@rocket.chat/fuselage",{Box(e){l=e},Button(e){i=e},Chevron(e){r=e},Flex(e){o=e},Margins(e){s=e},Select(e){c=e},Skeleton(e){m=e}},1),n.link("moment",{default(e){u=e}},2),n.link("react",{default(e){d=e},useMemo(e){g=e},useState(e){h=e}},3),n.link("../../../../../../client/contexts/TranslationContext",{useTranslation(e){p=e}},4),n.link("../../../../../../client/hooks/useEndpointData",{useEndpointData(e){f=e}},5),n.link("../Section",{Section(e){x=e}},6)}
