function module(e,n,t){var u,i,r,o;t.link("@babel/runtime/helpers/slicedToArray",{default:function(e){u=e}},0),t.export({useFileInput:function(){return c}}),t.link("@rocket.chat/fuselage-hooks",{useMutableCallback:function(e){i=e}},0),t.link("react",{useState:function(e){r=e},useEffect:function(e){o=e}},1);var c=function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"image",t=r((function(){return function(){}})),c=u(t,2),a=c[0],l=c[1],f=i(e);return o((function(){var e=document.createElement("input"),t=new FormData;e.setAttribute("type","file"),e.setAttribute("style","display: none"),document.body.appendChild(e);var u=function(){t.append(n,e.files[0]),f(e.files[0],t)};return e.addEventListener("change",u,!1),l((function(){return function(){return e.click()}})),function(){e.parentNode.removeChild(e)}}),[n,f]),a}}
