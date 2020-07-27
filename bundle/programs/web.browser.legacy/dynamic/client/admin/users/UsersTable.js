function module(e,t,n){var r,a,l,i,o,s,c,u,f,m,d,x,p,k,E,y,h,v,b,g,C,S;n.link("@babel/runtime/helpers/objectSpread2",{default:function(e){r=e}},0),n.link("@babel/runtime/helpers/extends",{default:function(e){a=e}},1),n.link("@babel/runtime/helpers/slicedToArray",{default:function(e){l=e}},2),n.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){i=e}},3),n.export({UsersTable:function(){return P}}),n.link("@rocket.chat/fuselage",{Box:function(e){o=e},Table:function(e){s=e},Avatar:function(e){c=e},TextInput:function(e){u=e},Icon:function(e){f=e}},0),n.link("@rocket.chat/fuselage-hooks",{useDebouncedValue:function(e){m=e},useMediaQuery:function(e){d=e}},1),n.link("react",{default:function(e){x=e},useMemo:function(e){p=e},useCallback:function(e){k=e},useState:function(e){E=e},useEffect:function(e){y=e}},2),n.link("../../components/GenericTable",{GenericTable:function(e){h=e},Th:function(e){v=e}},3),n.link("../../contexts/TranslationContext",{useTranslation:function(e){b=e}},4),n.link("../../../app/utils/client",{getUserAvatarURL:function(e){g=e}},5),n.link("../../contexts/RouterContext",{useRoute:function(e){C=e}},6),n.link("../../hooks/useEndpointData",{useEndpointData:function(e){S=e}},7);var w={whiteSpace:"nowrap",textOverflow:"ellipsis",overflow:"hidden"},T=function(e){var t=e.setFilter,n=i(e,["setFilter"]),r=b(),s=E(""),c=l(s,2),m=c[0],d=c[1],p=k((function(e){return d(e.currentTarget.value)}),[]);return y((function(){t({text:m})}),[t,m]),x.createElement(o,a({mb:"x16",is:"form",onSubmit:k((function(e){return e.preventDefault()}),[]),display:"flex",flexDirection:"column"},n),x.createElement(u,{flexShrink:0,placeholder:r("Search_Users"),addon:x.createElement(f,{name:"magnifier",size:"x20"}),onChange:p,value:m}))},D=function(e){return"asc"===e?1:-1},$=function(e,t){var n=e.text,a=e.itemsPerPage,i=e.current,o=l(t,2),s=o[0],c=o[1];return p((function(){var e;return r({fields:JSON.stringify({name:1,username:1,emails:1,roles:1,status:1,avatarETag:1}),query:JSON.stringify({$or:[{"emails.address":{$regex:n||"",$options:"i"}},{username:{$regex:n||"",$options:"i"}},{name:{$regex:n||"",$options:"i"}}]}),sort:JSON.stringify((e={},e[s]=D(c),e.usernames="name"===s?D(c):void 0,e))},a&&{count:a},{},i&&{offset:i})}),[n,a,i,s,c])};function P(){var e=b(),t=E({text:"",current:0,itemsPerPage:25}),n=l(t,2),r=n[0],a=n[1],i=E(["name","asc"]),u=l(i,2),f=u[0],y=u[1],D=m(r,500),P=m(f,500),R=$(D,P),U=S("users.list",R)||{},I=C("admin-users"),N=k((function(e){return function(){return I.push({context:"info",id:e})}}),[I]),O=k((function(e){var t=l(f,2),n=t[0],r=t[1];y(n!==e?[e,"asc"]:[e,"asc"===r?"desc":"asc"])}),[f]),j=d("(min-width: 1024px)"),A=p((function(){return[x.createElement(v,{key:"name",direction:f[1],active:"name"===f[0],onClick:O,sort:"name",w:"x200"},e("Name")),j&&x.createElement(v,{key:"username",direction:f[1],active:"username"===f[0],onClick:O,sort:"username",w:"x140"},e("Username")),x.createElement(v,{key:"email",direction:f[1],active:"emails.adress"===f[0],onClick:O,sort:"emails.address",w:"x120"},e("Email")),j&&x.createElement(v,{key:"roles",direction:f[1],active:"roles"===f[0],onClick:O,sort:"roles",w:"x120"},e("Roles")),x.createElement(v,{key:"status",direction:f[1],active:"status"===f[0],onClick:O,sort:"status",w:"x100"},e("Status"))].filter(Boolean)}),[f,O,e,j]),F=k((function(e){var t=e.emails,n=e._id,r=e.username,a=e.name,l=e.roles,i=e.status,u=e.avatarETag,f=g(r,u);return x.createElement(s.Row,{key:n,onKeyDown:N(n),onClick:N(n),tabIndex:0,role:"link",action:!0,"qa-user-id":n},x.createElement(s.Cell,{style:w},x.createElement(o,{display:"flex",alignItems:"center"},x.createElement(c,{size:j?"x28":"x40",title:r,url:f}),x.createElement(o,{display:"flex",style:w,mi:"x8"},x.createElement(o,{display:"flex",flexDirection:"column",alignSelf:"center",style:w},x.createElement(o,{fontScale:"p2",style:w,color:"default"},a||r),!j&&a&&x.createElement(o,{fontScale:"p1",color:"hint",style:w}," ","@"+r," "))))),j&&x.createElement(s.Cell,null,x.createElement(o,{fontScale:"p2",style:w,color:"hint"},r)," ",x.createElement(o,{mi:"x4"})),x.createElement(s.Cell,{style:w},t&&t.length&&t[0].address),j&&x.createElement(s.Cell,{style:w},l&&l.join(", ")),x.createElement(s.Cell,{fontScale:"p1",color:"hint",style:w},i))}),[j,N]);return x.createElement(h,{FilterComponent:T,header:A,renderRow:F,results:U.users,total:U.total,setParams:a,params:r})}n.exportDefault(P)}
