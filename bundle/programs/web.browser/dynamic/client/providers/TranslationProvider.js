function module(e,t,n){let r,a,l,o,s,u,i,c,g;n.link("@babel/runtime/helpers/objectWithoutProperties",{default(e){r=e}},0),n.link("@babel/runtime/helpers/objectSpread2",{default(e){a=e}},1),n.export({TranslationProvider:()=>p}),n.link("react",{default(e){l=e},useMemo(e){o=e},useCallback(e){s=e}},0),n.link("meteor/rocketchat:tap-i18n",{TAPi18n(e){u=e},TAPi18next(e){i=e}},1),n.link("../contexts/TranslationContext",{TranslationContext(e){c=e}},2),n.link("../hooks/useReactiveValue",{useReactiveValue(e){g=e}},3);const f=e=>{const t=function(t){for(var n=arguments.length,r=new Array(n>1?n-1:0),l=1;l<n;l++)r[l-1]=arguments[l];if("object"==typeof r[0]){const[n,l=e]=r;return i.t(t,a({ns:"project",lng:l},n))}return 0===r.length?i.t(t,{ns:"project",lng:e}):i.t(t,{postProcess:"sprintf",sprintf:r,ns:"project",lng:e})};return t.has=function(t){let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},{lng:l=e}=n,o=r(n,["lng"]);return!!t&&i.exists(t,a({ns:"project",lng:l},o))},t};function p(e){let{children:t}=e;const n=g(()=>{const e=Object.entries(u.getLanguages()).map(e=>{let[t,n]=e;return a({},n,{key:t.toLowerCase()})}).sort((e,t)=>e.key-t.key);return e.unshift({name:"Default",en:"Default",key:""}),e},[]),r=g(()=>u.getLanguage()),i=s(e=>u._loadLanguage(e),[]),p=o(()=>f(r),[r]);return l.createElement(c.Provider,{children:t,value:{languages:n,language:r,loadLanguage:i,translate:p}})}}
