function module(e,t,n){var i,r,a,o,l,s,u,c,m,f,d,g,h,p,x,y,E;function k(e){var t=e.displacement,n=e.onPreviousDateClick,i=e.onNextDateClick,u=x(),c=h((function(){return d().set({hour:0,minute:0,second:0,millisecond:0}).subtract(1).subtract(t,"days")}),[t]),m=h((function(){return{start:c.toISOString()}}),[c]),p=y("engagement-dashboard/users/chat-busier/hourly-data",m),E=h((function(){if(!p)return[];for(var e=2,t=Array.from({length:12},(function(e,t){return{hour:String(2*t),users:0}})),n=r(p.hours),i;!(i=n()).done;){var a=i.value,o=a.hour,l=a.users,s=Math.floor(o/2);t[s]=t[s]||{hour:String(2*s),users:0},t[s].users+=l}return t}),[p]);return g.createElement(g.Fragment,null,g.createElement(o,{display:"flex",alignItems:"center",justifyContent:"center"},g.createElement(l,{ghost:!0,square:!0,small:!0,onClick:n},g.createElement(s,{left:!0,size:"x20",style:{verticalAlign:"middle"}})),g.createElement(o,{mi:"x8",flexBasis:"25%",is:"span",style:{textAlign:"center"}},c.format(t<7?"dddd":"L")),g.createElement(l,{ghost:!0,square:!0,small:!0,disabled:0===t,onClick:i},g.createElement(s,{right:!0,size:"x20",style:{verticalAlign:"middle"}}))),p?g.createElement(o,{display:"flex",height:"196px"},g.createElement(o,{align:"stretch",flexGrow:1,flexShrink:0,position:"relative"},g.createElement(o,{position:"absolute",width:"100%",height:"100%"},g.createElement(a,{data:E,indexBy:"hour",keys:["users"],groupMode:"grouped",padding:.25,margin:{bottom:20},colors:["#1d74f5"],enableLabel:!1,enableGridY:!1,axisTop:null,axisRight:null,axisBottom:{tickSize:0,tickPadding:4,tickRotation:0,tickValues:"every 2 hours",format:function(e){return d().set({hour:e,minute:0,second:0}).format("LT")}},axisLeft:null,animate:!0,motionStiffness:90,motionDamping:15,theme:{axis:{ticks:{text:{fill:"#9EA2A8",fontFamily:'Inter, -apple-system, system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Meiryo UI", Arial, sans-serif',fontSize:"10px",fontStyle:"normal",fontWeight:"600",letterSpacing:"0.2px",lineHeight:"12px"}}},tooltip:{container:{backgroundColor:"#1F2329",boxShadow:"0px 0px 12px rgba(47, 52, 61, 0.12), 0px 0px 2px rgba(47, 52, 61, 0.08)",borderRadius:2}}},tooltip:function(e){var t=e.value;return(g.createElement(o,{fontScale:"p2",color:"alternative"},u("Value_users",{value:t})))}})))):g.createElement(f,{variant:"rect",height:196}))}function b(e){var t=e.displacement,n=e.onPreviousDateClick,i=e.onNextDateClick,r=h((function(){return d.utc().subtract(t,"weeks")}),[t]),m=h((function(){var e;return r.clone().subtract(6,"days").format("L")+" - "+r.format("L")}),[r]),p=h((function(){return{start:r.toISOString()}}),[r]),x=y("engagement-dashboard/users/chat-busier/weekly-data",p),E=h((function(){return x?x.month.map((function(e){var t=e.users,n=e.day,i=e.month,r=e.year;return{users:t,day:String(d.utc([r,i-1,n,0,0,0]).valueOf())}})).sort((function(e,t){var n,i;return e.day-t.day})):[]}),[x]);return g.createElement(g.Fragment,null,g.createElement(u.Container,{alignItems:"center",justifyContent:"center"},g.createElement(o,null,g.createElement(l,{ghost:!0,square:!0,small:!0,onClick:n},g.createElement(s,{left:!0,size:"x20",style:{verticalAlign:"middle"}})),g.createElement(u.Item,{basis:"50%"},g.createElement(c,{inline:"x8"},g.createElement(o,{is:"span",style:{textAlign:"center"}},m))),g.createElement(l,{ghost:!0,square:!0,small:!0,disabled:0===t,onClick:i},g.createElement(s,{right:!0,size:"x20",style:{verticalAlign:"middle"}})))),g.createElement(u.Container,null,x?g.createElement(o,{style:{height:196}},g.createElement(u.Item,{align:"stretch",grow:1,shrink:0},g.createElement(o,{style:{position:"relative"}},g.createElement(o,{style:{position:"absolute",width:"100%",height:"100%"}},g.createElement(a,{data:E,indexBy:"day",keys:["users"],groupMode:"grouped",padding:.25,margin:{bottom:20},colors:["#1d74f5"],enableLabel:!1,enableGridY:!1,axisTop:null,axisRight:null,axisBottom:{tickSize:0,tickPadding:4,tickRotation:0,tickValues:"every 3 days",format:function(e){return d(parseInt(e,10)).format("L")}},axisLeft:null,animate:!0,motionStiffness:90,motionDamping:15,theme:{axis:{ticks:{text:{fill:"#9EA2A8",fontFamily:'Inter, -apple-system, system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Meiryo UI", Arial, sans-serif',fontSize:"10px",fontStyle:"normal",fontWeight:"600",letterSpacing:"0.2px",lineHeight:"12px"}}}}}))))):g.createElement(f,{variant:"rect",height:196})))}function v(){var e=x(),t=p("hours"),n=i(t,2),r=n[0],a=n[1],o=h((function(){return[["hours",e("Hours")],["days",e("Days")]]}),[e]),l=p(0),s=i(l,2),u=s[0],c=s[1],f=function(e){a(e),c(0)},d=function(){return c((function(e){return e+1}))},y=function(){return c((function(e){return e-1}))},v="hours"===r&&k||"days"===r&&b;return g.createElement(E,{title:e("When_is_the_chat_busier?"),filter:g.createElement(m,{options:o,value:r,onChange:f})},g.createElement(v,{displacement:u,onPreviousDateClick:d,onNextDateClick:y}))}n.link("@babel/runtime/helpers/slicedToArray",{default:function(e){i=e}},0),n.link("@babel/runtime/helpers/createForOfIteratorHelperLoose",{default:function(e){r=e}},1),n.export({BusiestChatTimesSection:function(){return v}}),n.link("@nivo/bar",{ResponsiveBar:function(e){a=e}},0),n.link("@rocket.chat/fuselage",{Box:function(e){o=e},Button:function(e){l=e},Chevron:function(e){s=e},Flex:function(e){u=e},Margins:function(e){c=e},Select:function(e){m=e},Skeleton:function(e){f=e}},1),n.link("moment",{default:function(e){d=e}},2),n.link("react",{default:function(e){g=e},useMemo:function(e){h=e},useState:function(e){p=e}},3),n.link("../../../../../../client/contexts/TranslationContext",{useTranslation:function(e){x=e}},4),n.link("../../../../../../client/hooks/useEndpointData",{useEndpointData:function(e){y=e}},5),n.link("../Section",{Section:function(e){E=e}},6)}
