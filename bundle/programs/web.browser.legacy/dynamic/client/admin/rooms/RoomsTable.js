function module(e,t,n){var r,o,l,a,i,c,u,s,m,f,d,p,x,E,h,k,y,v,C,g,b,w,T,D,R,F;n.link("@babel/runtime/helpers/extends",{default:function(e){r=e}},0),n.link("@babel/runtime/helpers/objectSpread2",{default:function(e){o=e}},1),n.link("@babel/runtime/helpers/slicedToArray",{default:function(e){l=e}},2),n.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){a=e}},3),n.export({DEFAULT_TYPES:function(){return P},roomTypeI18nMap:function(){return j}}),n.link("@rocket.chat/fuselage",{Box:function(e){i=e},Table:function(e){c=e},Icon:function(e){u=e},TextInput:function(e){s=e},Field:function(e){m=e},CheckBox:function(e){f=e},Margins:function(e){d=e}},0),n.link("@rocket.chat/fuselage-hooks",{useMediaQuery:function(e){p=e},useUniqueId:function(e){x=e},useDebouncedValue:function(e){E=e}},1),n.link("react",{default:function(e){h=e},useMemo:function(e){k=e},useCallback:function(e){y=e},useState:function(e){v=e},useEffect:function(e){C=e}},2),n.link("../../components/GenericTable",{GenericTable:function(e){g=e},Th:function(e){b=e}},3),n.link("../../contexts/TranslationContext",{useTranslation:function(e){w=e}},4),n.link("../../components/basic/avatar/RoomAvatar",{default:function(e){T=e}},5),n.link("../../../app/utils/client",{roomTypes:function(e){D=e}},6),n.link("../../hooks/useEndpointData",{useEndpointData:function(e){R=e}},7),n.link("../../contexts/RouterContext",{useRoute:function(e){F=e}},8);var S={whiteSpace:"nowrap",textOverflow:"ellipsis",overflow:"hidden"},P=["d","p","c"],j={l:"Omnichannel",c:"Channel",d:"Direct",p:"Group",discussion:"Discussion"},I=function(e){var t=e.setFilter,n=a(e,["setFilter"]),c=v(""),p=l(c,2),E=p[0],k=p[1],g=v({d:!1,c:!1,p:!1,l:!1,discussions:!1}),b=l(g,2),T=b[0],D=b[1],R=w(),F=y((function(e){return k(e.currentTarget.value)}),[]),S=y((function(e){var t;return D(o({},T,((t={})[e]=!T[e],t)))}),[T]);C((function(){if(0===Object.values(T).filter(Boolean).length)return t({text:E,types:P});var e=Object.entries(T).filter((function(e){var t,n=l(e,2)[1];return Boolean(n)})).map((function(e){var t,n;return l(e,1)[0]}));t({text:E,types:e})}),[t,E,T]);var j=x(),I=x(),L=x(),O=x(),_=x();return h.createElement(i,r({mb:"x16",is:"form",onSubmit:y((function(e){return e.preventDefault()}),[]),display:"flex",flexDirection:"column"},n),h.createElement(s,{flexShrink:0,placeholder:R("Search_Rooms"),addon:h.createElement(u,{name:"magnifier",size:"x20"}),onChange:F,value:E}),h.createElement(m,null,h.createElement(i,{display:"flex",flexDirection:"row",flexWrap:"wrap",justifyContent:"flex-start",mbs:"x8",mi:"neg-x8"},h.createElement(d,{inline:"x8"},h.createElement(m.Row,null,h.createElement(f,{checked:T.d,id:j,onChange:function(){return S("d")}}),h.createElement(m.Label,{htmlFor:j},R("Direct"))),h.createElement(m.Row,null,h.createElement(f,{checked:T.c,id:I,onChange:function(){return S("c")}}),h.createElement(m.Label,{htmlFor:I},R("Public"))),h.createElement(m.Row,null,h.createElement(f,{checked:T.p,id:L,onChange:function(){return S("p")}}),h.createElement(m.Label,{htmlFor:L},R("Private"))),h.createElement(m.Row,null,h.createElement(f,{checked:T.l,id:O,onChange:function(){return S("l")}}),h.createElement(m.Label,{htmlFor:O},R("Omnichannel"))),h.createElement(m.Row,null,h.createElement(f,{checked:T.discussions,id:_,onChange:function(){return S("discussions")}}),h.createElement(m.Label,{htmlFor:_},R("Discussions")))))))},L=function(e,t){var n=e.text,r=e.types,a=e.itemsPerPage,i=e.current,c=l(t,2),u=c[0],s=c[1];return k((function(){var e;return o({filter:n||"",types:r,sort:JSON.stringify((e={},e[u]="asc"===s?1:-1,e))},a&&{count:a},{},i&&{offset:i})}),[n,r,a,i,u,s])};function O(){var e=w(),t=p("(min-width: 1024px)"),n=v({text:"",types:P,current:0,itemsPerPage:25}),r=l(n,2),s=r[0],m=r[1],f=v(["name","asc"]),d=l(f,2),x=d[0],C=d[1],O="admin-rooms",_=E(s,500),B=E(x,500),M=L(_,B),N=R("rooms.adminRooms",M)||{},A=F(O),G=y((function(e){return function(){return A.push({context:"edit",id:e})}}),[A]),U=y((function(e){var t=l(x,2),n=t[0],r=t[1];C(n!==e?[e,"asc"]:[e,"asc"===r?"desc":"asc"])}),[x]);"name"===x[0]&&N.rooms&&(N.rooms=N.rooms.sort((function(e,t){var n="d"===e.type?e.usernames.join(" x "):D.getRoomName(e.t,e),r="d"===t.type?t.usernames.join(" x "):D.getRoomName(t.t,t);if(n===r)return 0;var o=n<r?-1:1;return"asc"===x[1]?o:-1*o})));var q=k((function(){return[h.createElement(b,{key:"name",direction:x[1],active:"name"===x[0],onClick:U,sort:"name",w:"x200"},e("Name")),h.createElement(b,{key:"type",direction:x[1],active:"t"===x[0],onClick:U,sort:"t",w:"x100"},e("Type")),h.createElement(b,{key:"users",direction:x[1],active:"usersCount"===x[0],onClick:U,sort:"usersCount",w:"x80"},e("Users")),t&&h.createElement(b,{key:"messages",direction:x[1],active:"msgs"===x[0],onClick:U,sort:"msgs",w:"x80"},e("Msgs")),t&&h.createElement(b,{key:"default",direction:x[1],active:"default"===x[0],onClick:U,sort:"default",w:"x80"},e("Default")),t&&h.createElement(b,{key:"featured",direction:x[1],active:"featured"===x[0],onClick:U,sort:"featured",w:"x80"},e("Featured"))].filter(Boolean)}),[x,U,e,t]),z=y((function(n){var r=n._id,l=n.name,s=n.t,m=n.usersCount,f=n.msgs,d=n.default,p=n.featured,x=n.usernames,E=a(n,["_id","name","t","usersCount","msgs","default","featured","usernames"]),k=D.getIcon(o({t:s,usernames:x},E)),y="d"===s?x.join(" x "):D.getRoomName(s,o({name:l,type:s,_id:r},E));return h.createElement(c.Row,{action:!0,key:r,onKeyDown:G(r),onClick:G(r),tabIndex:0,role:"link","qa-room-id":r},h.createElement(c.Cell,{style:S},h.createElement(i,{display:"flex",alignContent:"center"},h.createElement(T,{size:t?"x28":"x40",room:o({type:s,name:y,_id:r},E)}),h.createElement(i,{display:"flex",style:S,mi:"x8"},h.createElement(i,{display:"flex",flexDirection:"row",alignSelf:"center",alignItems:"center",style:S},h.createElement(u,{mi:"x2",name:"omnichannel"===k?"livechat":k,fontScale:"p2",color:"hint"}),h.createElement(i,{fontScale:"p2",style:S,color:"default"},y))))),h.createElement(c.Cell,null,h.createElement(i,{color:"hint",fontScale:"p2",style:S},e(j[s])),h.createElement(i,{mi:"x4"})),h.createElement(c.Cell,{style:S},m),t&&h.createElement(c.Cell,{style:S},f),t&&h.createElement(c.Cell,{style:S},e(d?"True":"False")),t&&h.createElement(c.Cell,{style:S},e(p?"True":"False")))}),[t,G,e]);return h.createElement(g,{FilterComponent:I,header:q,renderRow:z,results:N.rooms,total:N.total,setParams:m,params:s})}n.exportDefault(O)}
