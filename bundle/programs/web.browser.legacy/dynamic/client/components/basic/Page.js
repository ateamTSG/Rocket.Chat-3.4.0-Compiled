function module(e,n,t){var l,o,r,i,c,a,u,f,d,x,s,h,m,p;t.link("@babel/runtime/helpers/objectSpread2",{default:function(e){l=e}},0),t.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){o=e}},1),t.link("@babel/runtime/helpers/extends",{default:function(e){r=e}},2),t.link("@babel/runtime/helpers/slicedToArray",{default:function(e){i=e}},3),t.link("@rocket.chat/fuselage",{Box:function(e){c=e},Scrollable:function(e){a=e}},0),t.link("@rocket.chat/fuselage-hooks",{useMediaQuery:function(e){u=e}},1),t.link("react",{default:function(e){f=e},createContext:function(e){d=e},useContext:function(e){x=e},useState:function(e){s=e}},2),t.link("../../contexts/SidebarContext",{useSidebar:function(e){h=e}},3),t.link("./burger/BurgerMenuButton",{default:function(e){m=e}},4),t.link("../../contexts/SessionContext",{useSession:function(e){p=e}},5);var b=d();function k(e){var n=s(!1),t=i(n,2),l=t[0],o=t[1];return(f.createElement(b.Provider,{value:[l,o]},f.createElement(c,r({is:"section",display:"flex",flexDirection:"column",flexGrow:1,flexShrink:1,height:"full",overflow:"hidden"},e))))}function S(e){var n=e.children,t=e.title,l=o(e,["children","title"]),a=x(b),d,s=i(a,1)[0],k=u("(max-width: 780px)"),S=h(),C=i(S,2),g=C[0],E=C[1],v=p("unread"),w=function(){E((function(e){return!e}))};return f.createElement(c,{borderBlockEndWidth:"x2",borderBlockEndColor:s?"neutral-200":"transparent"},f.createElement(c,r({marginBlock:"x16",marginInline:"x24",minHeight:"x40",display:"flex",flexDirection:"row",flexWrap:"nowrap",alignItems:"center"},l),k&&f.createElement(m,{open:g,badge:v,marginInlineEnd:"x8",onClick:w}),f.createElement(c,{is:"h1",fontScale:"h1",flexGrow:1},t),n))}var C=f.forwardRef(function(){function e(e,n){return f.createElement(c,r({ref:n,paddingInline:"x24",display:"flex",flexDirection:"column",overflowY:"hidden",height:"full"},e))}return e}());function g(e){var n=e.onScrollContent,t=o(e,["onScrollContent"]);return(f.createElement(a,{onScrollContent:n},f.createElement(c,r({padding:"x16",display:"flex",flexDirection:"column",flexGrow:1},t))))}function E(e){var n=e.onScrollContent,t=o(e,["onScrollContent"]),c=x(b),a,u=i(c,2)[1];return f.createElement(g,r({onScrollContent:function(e){var t=e.top,r=o(e,["top"]);u(!t),n&&n(l({top:t},r))}},t))}k.Header=S,k.Content=C,k.ScrollableContent=g,k.ScrollableContentWithShadow=E,t.exportDefault(k)}
