function module(e,t,n){var l,a,r,i,c,o,m,u,s,f,x,d,g;function b(){var e=i(["\n\t& > .rcx-message__container > .rcx-contextual-message__follow {\n\t\topacity: 0;\n\t}\n\t.rcx-contextual-message__follow:focus,\n\t&:hover > .rcx-message__container > .rcx-contextual-message__follow,\n\t&:focus > .rcx-message__container > .rcx-contextual-message__follow {\n\t\topacity: 1\n\t}\n"]);return b=function(){return e},e}function E(){var e=i(["\n\tborder-radius: 100%;\n"]);return E=function(){return e},e}n.link("@babel/runtime/helpers/toConsumableArray",{default:function(e){l=e}},0),n.link("@babel/runtime/helpers/extends",{default:function(e){a=e}},1),n.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){r=e}},2),n.link("@babel/runtime/helpers/taggedTemplateLiteralLoose",{default:function(e){i=e}},3),n.export({NotificationStatus:function(){return h},NotificationStatusAll:function(){return w},NotificationStatusMe:function(){return _},NotificationStatusUnread:function(){return k},default:function(){return y},MessageSkeleton:function(){return T}}),n.link("react",{default:function(e){c=e}},0),n.link("@rocket.chat/fuselage",{Box:function(e){o=e},Margins:function(e){m=e},Button:function(e){u=e},Icon:function(e){s=e},Skeleton:function(e){f=e}},1),n.link("@rocket.chat/css-in-js",{css:function(e){x=e}},2),n.link("../../../../client/components/basic/avatar/UserAvatar",{default:function(e){d=e}},3),n.link("../../../../client/components/basic/RawText",{default:function(e){g=e}},4);var p=x(E());function h(e){var t=e.t,n=void 0===t?function(e){return e}:t,l=e.label,i=r(e,["t","label"]);return(c.createElement(o,a({width:"x8","aria-label":n(l),className:[p],height:"x8"},i)))}function w(e){return c.createElement(h,a({label:"mention-all",bg:"#F38C39"},e))}function _(e){return c.createElement(h,a({label:"Me",bg:"danger-500"},e))}function k(e){return c.createElement(h,a({label:"Unread",bg:"primary-500"},e))}function v(e){return null!=e&&"function"==typeof e[Symbol.iterator]}var S=x(b());function y(e){var t=e._id,n=e.msg,i=e.following,f=e.username,x=e.name,b=e.ts,E=e.replies,p=e.participants,h=e.handleFollowButton,y=e.unread,T=e.mention,B=e.all,F=e.t,C=void 0===F?function(e){return e}:F,G=e.formatDate,M=void 0===G?function(e){return e}:G,A=e.tlm,L=e.className,U=void 0===L?[]:L,j=r(e,["_id","msg","following","username","name","ts","replies","participants","handleFollowButton","unread","mention","all","t","formatDate","tlm","className"]),H=i?"bell":"bell-off",q=C(i?"Following":"Not_Following");return c.createElement(o,a({"rcx-contextual-message":!0,pi:"x20",pb:"x16",pbs:"x16",display:"flex"},j,{className:[].concat(l(v(U)?U:[U]),[!i&&S]).filter(Boolean)}),c.createElement(z,{mb:"neg-x2"},c.createElement(d,{username:f,"rcx-message__avatar":!0,size:"x36"})),c.createElement(z,{width:"1px",mb:"neg-x4",flexGrow:1},c.createElement(N,null,c.createElement(D,{title:f},x),c.createElement(I,{ts:M(b)})),c.createElement(W,null,c.createElement(g,null,n)),c.createElement(o,{mi:"neg-x2",flexDirection:"row",display:"flex",alignItems:"baseline",mbs:"x8"},c.createElement(m,{inline:"x2"},c.createElement(o,{display:"flex",alignItems:"center",is:"span",fontSize:"x12",color:"neutral-700",fontWeight:"600"},c.createElement(s,{name:"thread",size:"x20",mi:"x2"})," ",E," "),c.createElement(o,{display:"flex",alignItems:"center",is:"span",fontSize:"x12",color:"neutral-700",fontWeight:"600"},c.createElement(s,{name:"user",size:"x20",mi:"x2"})," ",p," "),c.createElement(o,{display:"flex",alignItems:"center",is:"span",fontSize:"x12",color:"neutral-700",fontWeight:"600",withTruncatedText:!0,flexShrink:1},c.createElement(s,{name:"clock",size:"x20",mi:"x2"})," ",M(A)," ")))),c.createElement(z,{alignItems:"center"},c.createElement(u,{"rcx-contextual-message__follow":!0,small:!0,square:!0,flexShrink:0,ghost:!0,"data-following":i,"data-id":t,onClick:h,title:q,"aria-label":q},c.createElement(s,{name:H,size:"x20"})),T&&c.createElement(_,{t:C,mb:"x24"})||B&&c.createElement(w,{t:C,mb:"x24"})||y&&c.createElement(k,{t:C,mb:"x24"})))}function T(e){return c.createElement(o,a({"rcx-message":!0,pi:"x20",pb:"x16",pbs:"x16",display:"flex"},e),c.createElement(z,{mb:"neg-x2"},c.createElement(f,{variant:"rect",size:"x36"})),c.createElement(z,{width:"1px",mb:"neg-x4",flexGrow:1},c.createElement(N,null,c.createElement(f,{width:"100%"})),c.createElement(W,null,c.createElement(f,null),c.createElement(f,null)),c.createElement(o,{mi:"neg-x8",flexDirection:"row",display:"flex",alignItems:"baseline",mb:"x8"},c.createElement(m,{inline:"x4"},c.createElement(f,null),c.createElement(f,null),c.createElement(f,null)))))}function z(e){var t=e.children,n=r(e,["children"]);return(c.createElement(o,a({"rcx-message__container":!0,display:"flex",mi:"x4",flexDirection:"column"},n),c.createElement(m,{block:"x2"},t)))}function N(e){var t=e.children;return(c.createElement(o,{"rcx-message__header":!0,display:"flex",flexGrow:0,flexShrink:1,withTruncatedText:!0},c.createElement(o,{mi:"neg-x2",display:"flex",flexDirection:"row",alignItems:"baseline",withTruncatedText:!0,flexGrow:1,flexShrink:1},c.createElement(m,{inline:"x2"}," ",t," "))))}function D(e){return c.createElement(o,a({"rcx-message__username":!0,color:"neutral-800",fontSize:"x14",fontWeight:"600",flexShrink:1,withTruncatedText:!0},e))}function I(e){var t=e.ts;return(c.createElement(o,{"rcx-message__time":!0,fontSize:"c1",color:"neutral-600",flexShrink:0,withTruncatedText:!0},t.toDateString?t.toDateString():t))}var B={display:"-webkit-box",overflow:"hidden",WebkitLineClamp:2,WebkitBoxOrient:"vertical",wordBreak:"break-all"};function W(e){return c.createElement(o,a({"rcx-message__body":!0,flexShrink:1,style:B,lineHeight:"1.45",minHeight:"40px"},e))}}
