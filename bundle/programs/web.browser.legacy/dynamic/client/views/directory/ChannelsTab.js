function module(e,t,n){var a,r,o,l,i,c,u,s,f,m,d,k,h,p,x,E,y,C,v,g,w,b,T,S,M,A,P;n.link("@babel/runtime/helpers/extends",{default:function(e){a=e}},0),n.link("@babel/runtime/helpers/slicedToArray",{default:function(e){r=e}},1),n.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){o=e}},2),n.export({default:function(){return z}}),n.link("@rocket.chat/fuselage",{Box:function(e){l=e},Margins:function(e){i=e},Table:function(e){c=e},Avatar:function(e){u=e},Tag:function(e){s=e},Icon:function(e){f=e},TextInput:function(e){m=e}},0),n.link("@rocket.chat/fuselage-hooks",{useMediaQuery:function(e){d=e}},1),n.link("react",{default:function(e){k=e},useMemo:function(e){h=e},useState:function(e){p=e},useCallback:function(e){x=e},useEffect:function(e){E=e}},2),n.link("../../components/GenericTable",{GenericTable:function(e){y=e},Th:function(e){C=e}},3),n.link("../../components/basic/MarkdownText",{default:function(e){v=e}},4),n.link("../../admin/NotAuthorizedPage",{default:function(e){g=e}},5),n.link("../../contexts/TranslationContext",{useTranslation:function(e){w=e}},6),n.link("../../contexts/AuthorizationContext",{usePermission:function(e){b=e}},7),n.link("../../contexts/RouterContext",{useRoute:function(e){T=e}},8),n.link("../../hooks/useEndpointData",{useEndpointData:function(e){S=e}},9),n.link("../../hooks/useFormatDate",{useFormatDate:function(e){M=e}},10),n.link("../../../app/utils/client",{roomTypes:function(e){A=e}},11),n.link("./hooks",{useQuery:function(e){P=e}},12);var D={whiteSpace:"nowrap",textOverflow:"ellipsis",overflow:"hidden"};function I(e){var t=e.room,n=w();return k.createElement(l,{mi:"x4",alignItems:"center",display:"flex"},k.createElement(i,{inline:"x2"},t.default&&k.createElement(s,{variant:"primary"},n("default")),t.featured&&k.createElement(s,{variant:"primary"},n("featured"))))}var F=function(e){var t=e.setFilter,n=o(e,["setFilter"]),i=w(),c=p(""),u=r(c,2),s=u[0],d=u[1],h=x((function(e){return d(e.currentTarget.value)}),[]);return E((function(){t({text:s})}),[t,s]),k.createElement(l,a({flexShrink:0,mb:"x16",is:"form",display:"flex",flexDirection:"column"},n),k.createElement(m,{flexShrink:0,placeholder:i("Search_Channels"),addon:k.createElement(f,{name:"magnifier",size:"x20"}),onChange:h,value:s}))};function R(){var e=w(),t=p(["name","asc"]),n=r(t,2),a=n[0],o=n[1],i=p({current:0,itemsPerPage:25}),s=r(i,2),m=s[0],E=s[1],g=d("(min-width: 768px)"),b=P(m,a,"channels"),R=x((function(e){var t=r(a,2),n=t[0],l=t[1];o(n!==e?[e,"asc"]:[e,"asc"===l?"desc":"asc"])}),[a]),z=h((function(){return[k.createElement(C,{key:"name",direction:a[1],active:"name"===a[0],onClick:R,sort:"name"},e("Name")),k.createElement(C,{key:"usersCount",direction:a[1],active:"usersCount"===a[0],onClick:R,sort:"usersCount",style:{width:"100px"}},e("Users")),g&&k.createElement(C,{key:"createdAt",direction:a[1],active:"createdAt"===a[0],onClick:R,sort:"createdAt",style:{width:"150px"}},e("Created_at")),g&&k.createElement(C,{key:"lastMessage",direction:a[1],active:"lastMessage"===a[0],onClick:R,sort:"lastMessage",style:{width:"150px"}},e("Last_Message"))].filter(Boolean)}),[a,R,e,g]),_=T("channel"),G=S("directory",b)||{result:[]},B=h((function(){return function(e){return function(t){"click"!==t.type&&"Enter"!==t.key||_.push({name:e})}}}),[_]),N=M(),Q=x((function(e){var t=e._id,n=e.ts,a=e.t,r=e.name,o=e.fname,i=e.usersCount,s=e.lastMessage,m=e.topic,d=A.getConfig(a).getAvatarPath(e);return k.createElement(c.Row,{key:t,onKeyDown:B(r),onClick:B(r),tabIndex:0,role:"link",action:!0},k.createElement(c.Cell,null,k.createElement(l,{display:"flex"},k.createElement(u,{size:"x40",title:o||r,url:d,flexGrow:0}),k.createElement(l,{grow:1,mi:"x8",style:D},k.createElement(l,{display:"flex",alignItems:"center"},k.createElement(f,{name:A.getIcon(e),color:"hint"})," ",k.createElement(l,{fontScale:"p2",mi:"x4"},o||r),k.createElement(I,{room:e,style:D})),m&&k.createElement(v,{fontScale:"p1",color:"hint",style:D,withRichContent:!1,content:m})))),k.createElement(c.Cell,{fontScale:"p1",color:"hint",style:D},i),g&&k.createElement(c.Cell,{fontScale:"p1",color:"hint",style:D},N(n)),g&&k.createElement(c.Cell,{fontScale:"p1",color:"hint",style:D},s&&N(s.ts)))}),[N,g,B]);return k.createElement(y,{FilterComponent:F,header:z,renderRow:Q,results:G.result,total:G.total,setParams:E})}function z(e){var t;return b("view-c-room")?k.createElement(R,e):k.createElement(g,null)}}

