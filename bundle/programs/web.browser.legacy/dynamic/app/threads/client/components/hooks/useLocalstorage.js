function module(e,n,t){var r,o,a;function u(e,n){var t=o((function(){try{var t=window.localStorage.getItem(e);return t?JSON.parse(t):n}catch(r){return console.log("useLocalStorage Error ->",r),n}})),u=r(t,2),c=u[0],i=u[1],l=function(n){try{var t=n instanceof Function?n(c):n;i(t),window.localStorage.setItem(e,JSON.stringify(t))}catch(r){console.log("useLocalStorage setValue Error ->",r)}};return a((function(){function n(n){n.key===e&&i(JSON.parse(n.newValue))}return window.addEventListener("storage",n),function(){return window.removeEventListener("storage",n)}}),[e]),[c,l]}t.link("@babel/runtime/helpers/slicedToArray",{default:function(e){r=e}},0),t.export({useLocalStorage:function(){return u}}),t.link("react",{useState:function(e){o=e},useEffect:function(e){a=e}},0)}
