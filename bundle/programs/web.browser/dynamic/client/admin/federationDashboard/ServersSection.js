function module(e,t,l){let n,a,o,r,i;function u(){var e,t;const[l,u]=r("federation:getServers",[],1e4);return u===i.LOADING?o.createElement(a,{align:"center"}):0===(null==l?void 0:null===(e=l.data)||void 0===e?void 0:e.length)?null:o.createElement(n,{withRichContent:!0},o.createElement("ul",null,null==l?void 0:null===(t=l.data)||void 0===t?void 0:t.map(e=>{let{domain:t}=e;return(o.createElement("li",{key:t},t))})))}l.link("@rocket.chat/fuselage",{Box(e){n=e},Throbber(e){a=e}},0),l.link("react",{default(e){o=e}},1),l.link("../../contexts/ServerContext",{usePolledMethodData(e){r=e},AsyncState(e){i=e}},2),l.exportDefault(u)}
