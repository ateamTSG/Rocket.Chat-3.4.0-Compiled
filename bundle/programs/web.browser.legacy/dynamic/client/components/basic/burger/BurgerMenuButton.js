function module(e,n,t){var o,u,i,l,a,r,c,s,f,d;function b(){var e=u(["cursor: pointer;"]);return b=function(){return e},e}function k(e){var n=e.open,t=e.badge,u=i(e,["open","badge"]),k=s(),m=c();return r.createElement(a,o({is:"button","aria-label":m(n?"Close menu":"Open menu"),type:"button",position:"relative",className:l(b())},u),r.createElement(f,{open:n}),!k&&t&&r.createElement(d,null,t))}t.link("@babel/runtime/helpers/extends",{default:function(e){o=e}},0),t.link("@babel/runtime/helpers/taggedTemplateLiteralLoose",{default:function(e){u=e}},1),t.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){i=e}},2),t.link("@rocket.chat/css-in-js",{css:function(e){l=e}},0),t.link("@rocket.chat/fuselage",{Box:function(e){a=e}},1),t.link("react",{default:function(e){r=e}},2),t.link("../../../contexts/TranslationContext",{useTranslation:function(e){c=e}},3),t.link("../../../hooks/useEmbeddedLayout",{useEmbeddedLayout:function(e){s=e}},4),t.link("./BurgerIcon",{default:function(e){f=e}},5),t.link("./BurgerBadge",{default:function(e){d=e}},6),t.exportDefault(k)}
