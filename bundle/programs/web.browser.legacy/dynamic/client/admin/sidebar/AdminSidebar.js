function module(e,t,n){var i,r,o,a,c,l,u,f,s,m,d,p,h,x,g,v,b,k,E,y,S,P,C,L,T,D,G,_;function w(){var e=o(["\n\t\t\t\t&:hover,\n\t\t\t\t&:focus,\n\t\t\t\t&.active:focus,\n\t\t\t\t&.active:hover {\n\t\t\t\t\tbackground-color: var(--sidebar-background-light-hover);\n\t\t\t\t}\n\n\t\t\t\t&.active {\n\t\t\t\t\tbackground-color: var(--sidebar-background-light-active);\n\t\t\t\t}\n\t\t\t"]);return w=function(){return e},e}n.link("@babel/runtime/helpers/toConsumableArray",{default:function(e){i=e}},0),n.link("@babel/runtime/helpers/slicedToArray",{default:function(e){r=e}},1),n.link("@babel/runtime/helpers/taggedTemplateLiteralLoose",{default:function(e){o=e}},2),n.link("@rocket.chat/css-in-js",{css:function(e){a=e}},0),n.link("@rocket.chat/fuselage",{Box:function(e){c=e},Button:function(e){l=e},Icon:function(e){u=e},SearchInput:function(e){f=e},Scrollable:function(e){s=e},Skeleton:function(e){m=e}},1),n.link("@rocket.chat/fuselage-hooks",{useDebouncedValue:function(e){d=e}},2),n.link("react",{default:function(e){p=e},useCallback:function(e){h=e},useState:function(e){x=e},useMemo:function(e){g=e},useEffect:function(e){v=e}},3),n.link("../../../app/ui-utils/client",{menu:function(e){b=e},SideNav:function(e){k=e},Layout:function(e){E=e}},4),n.link("../../../definition/ISetting",{SettingType:function(e){y=e}},5),n.link("../../hooks/useReactiveValue",{useReactiveValue:function(e){S=e}},6),n.link("../../contexts/SettingsContext",{useSettings:function(e){P=e}},7),n.link("../../contexts/TranslationContext",{useTranslation:function(e){C=e}},8),n.link("../../contexts/RouterContext",{useRoutePath:function(e){L=e},useCurrentRoute:function(e){T=e}},9),n.link("../../contexts/AuthorizationContext",{useAtLeastOnePermission:function(e){D=e}},10),n.link("../../providers/SettingsProvider",{default:function(e){G=e}},11),n.link("../sidebarItems",{sidebarItems:function(e){_=e}},12);var R=p.memo((function(e){var t=e.permissionGranted,n=e.pathGroup,i=e.href,r=e.icon,o=e.label,l=e.currentPath,f=g((function(){return{group:n}}),[n]),s=L(i,f),m=s===l||!1;return t&&!t()?null:p.createElement(c,{is:"a",color:"default",pb:"x8",pi:"x24",key:s,href:s,className:[m&&"active",a(w())].filter(Boolean)},p.createElement(c,{mi:"neg-x4",display:"flex",flexDirection:"row",alignItems:"center"},r&&p.createElement(u,{name:r,size:"x20",mi:"x4"}),p.createElement(c,{withTruncatedText:!0,fontScale:"p1",mi:"x4",color:"info"},o)))})),I=p.memo((function(e){var t=e.items,n=e.currentPath,i=C();return t.map((function(e){var t=e.href,r=e.i18nLabel,o=e.name,a=e.icon,c=e.permissionGranted,l=e.pathGroup;return(p.createElement(R,{permissionGranted:c,pathGroup:l,href:t,icon:a,label:i(r||o),key:r||o,currentPath:n}))}))})),A=p.memo((function(e){var t=e.currentPath,n=S((function(){return _.get()}));return p.createElement(c,{display:"flex",flexDirection:"column",flexShrink:0,pb:"x8"},p.createElement(I,{items:n,currentPath:t}))})),z=function(e){var t=P(),n=C(),i=g((function(){if(!e)return function(){return!0};var t=function(e){return[e.i18nLabel&&n(e.i18nLabel),n(e._id),e._id].filter(Boolean)};try{var i=new RegExp(e,"i");return function(e){return t(e).some((function(e){return i.test(e)}))}}catch(r){return function(n){return t(n).some((function(t){return t.slice(0,e.length)===e}))}}}),[e,n]);return g((function(){var e=Array.from(new Set(t.filter(i).map((function(e){return e.type===y.GROUP?e._id:e.group}))));return t.filter((function(t){var n=t.type,i=t.group,r=t._id;return n===y.GROUP&&e.includes(i||r)})).sort((function(e,t){return n(e.i18nLabel||e._id).localeCompare(n(t.i18nLabel||t._id))}))}),[t,i,n])},B=function(e){var t=e.currentPath,n=C(),i=x(""),o=r(i,2),a=o[0],l=o[1],s=h((function(e){return l(e.currentTarget.value)}),[]),m=z(d(a,400)),g=!1;return p.createElement(c,{is:"section",display:"flex",flexDirection:"column",flexShrink:0,pb:"x24"},p.createElement(c,{pi:"x24",pb:"x8",fontScale:"p2",color:"info"},n("Settings")),p.createElement(c,{pi:"x24",pb:"x8",display:"flex"},p.createElement(f,{value:a,placeholder:n("Search"),onChange:s,addon:p.createElement(u,{name:"magnifier",size:"x20"}),className:["asdsads"]})),p.createElement(c,{pb:"x16",display:"flex",flexDirection:"column"},!1,!!m.length&&p.createElement(I,{items:m.map((function(e){return{name:n(e.i18nLabel||e._id),href:"admin",pathGroup:e._id}})),currentPath:t}),!m.length&&p.createElement(c,{pi:"x28",mb:"x4",color:"hint"},n("Nothing_found"))))};n.exportDefault(p.memo(function(){function e(){var e=C(),t=D(["view-privileged-setting","edit-privileged-setting","manage-selected-settings"]),n=h((function(){E.isEmbedded()?b.close():k.closeFlex()}),[]),r=T(),o=L.apply(void 0,i(r));return v((function(){o.startsWith("/admin/")||k.closeFlex()}),[r,o]),p.createElement(G,{privileged:!0},p.createElement(c,{display:"flex",flexDirection:"column",h:"100vh"},p.createElement(c,{is:"header",pb:"x16",pi:"x24",display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between"},p.createElement(c,{color:"neutral-800",fontSize:"p1",fontWeight:"p1",fontWeight:"p1",flexShrink:1,withTruncatedText:!0},e("Administration")),p.createElement(l,{square:!0,small:!0,ghost:!0,onClick:n},p.createElement(u,{name:"cross",size:"x20"}))),p.createElement(s,null,p.createElement(c,{display:"flex",flexDirection:"column",h:"full"},p.createElement(A,{currentPath:o}),t&&p.createElement(B,{currentPath:o})))))}return e}()))}
