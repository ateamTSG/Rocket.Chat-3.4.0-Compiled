function module(n,e,t){var r,o,i,l,a;t.export({ServerProvider:function(){return s}}),t.link("react",{default:function(n){r=n}},0),t.link("meteor/meteor",{Meteor:function(n){o=n}},1),t.link("../../app/utils",{Info:function(n){i=n}},2),t.link("../contexts/ServerContext",{ServerContext:function(n){l=n}},3),t.link("../../app/utils/client",{APIClient:function(n){a=n}},4);var u,c,d,p,f,v={info:i,absoluteUrl:function(n){return o.absoluteUrl(n)},callMethod:function(n){for(var e=arguments.length,t=new Array(e>1?e-1:0),r=1;r<e;r++)t[r-1]=arguments[r];return new Promise((function(e,r){var i;(i=o).call.apply(i,[n].concat(t,[function(n,t){n?r(n):e(t)}]))}))},callEndpoint:function(n,e){var t,r=["get","post","delete"],o;if(!n||!r.includes(n.toLowerCase()))throw new Error('Invalid http method provided to "useEndpoint"');if(!e)throw new Error('Invalid endpoint provided to "useEndpoint"');for(var i=arguments.length,l=new Array(i>2?i-2:0),u=2;u<i;u++)l[u-2]=arguments[u];return"/"===e[0]?(o=a)[n.toLowerCase()].apply(o,[e.slice(1)].concat(l)):(t=a.v1)[n.toLowerCase()].apply(t,[e].concat(l))},uploadToEndpoint:function(n,e,t){return"/"===n[0]?a.upload(n.slice(1),e,t).promise:a.v1.upload(n,e,t).promise},getStream:function(n){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return new o.Streamer(n,e)}};function s(n){var e=n.children;return(r.createElement(l.Provider,{children:e,value:v}))}}
