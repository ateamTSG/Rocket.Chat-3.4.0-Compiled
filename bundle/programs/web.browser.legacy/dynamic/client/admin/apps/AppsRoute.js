function module(e,n,t){var u,a,r,l,i,o,c,f,s,p,d,k,m,x,b,g,P,E;function v(){var e=l(!0),n=a(e,2),t=n[0],v=n[1],A=o("manage-apps"),h=p("apps/is-enabled"),C=f("admin-apps-disabled");i((function(){var e=!0,n;return function(){function n(){return u.async(function(){function n(n){for(;;)switch(n.prev=n.next){case 0:if(A){n.next=2;break}return n.abrupt("return");case 2:return n.next=4,u.awrap(h());case 4:if(n.sent){n.next=7;break}return C.push(),n.abrupt("return");case 7:if(e){n.next=9;break}return n.abrupt("return");case 9:v(!1);case 10:case"end":return n.stop()}}return n}(),null,null,null,Promise)}return n}()(),function(){e=!1}}),[A,h,C]);var R=s(),S,w,y="admin-marketplace"===a(R,1)[0],z=c("context"),D=c("id"),M=c("version");return A?t?r.createElement(k,null):r.createElement(P,null,!z&&y&&r.createElement(x,null)||!z&&!y&&r.createElement(b,null)||"details"===z&&r.createElement(m,{id:D,marketplaceVersion:M})||"logs"===z&&r.createElement(E,{id:D})||"install"===z&&r.createElement(g,null)):r.createElement(d,null)}t.link("@babel/runtime/regenerator",{default:function(e){u=e}},0),t.link("@babel/runtime/helpers/slicedToArray",{default:function(e){a=e}},1),t.link("react",{default:function(e){r=e},useState:function(e){l=e},useEffect:function(e){i=e}},0),t.link("../../contexts/AuthorizationContext",{usePermission:function(e){o=e}},1),t.link("../../contexts/RouterContext",{useRouteParameter:function(e){c=e},useRoute:function(e){f=e},useCurrentRoute:function(e){s=e}},2),t.link("../../contexts/ServerContext",{useMethod:function(e){p=e}},3),t.link("../NotAuthorizedPage",{default:function(e){d=e}},4),t.link("../PageSkeleton",{default:function(e){k=e}},5),t.link("./AppDetailsPage",{default:function(e){m=e}},6),t.link("./MarketplacePage",{default:function(e){x=e}},7),t.link("./AppsPage",{default:function(e){b=e}},8),t.link("./AppInstallPage",{default:function(e){g=e}},9),t.link("./AppProvider",{default:function(e){P=e}},10),t.link("./AppLogsPage",{default:function(e){E=e}},11),t.exportDefault(v)}

