function module(t,e,n){let o;n.export({useFormatMemorySize:()=>c}),n.link("underscore.string",{default(t){o=t}},0);const r=t=>{if("number"!=typeof t)return null;const e=["bytes","kB","MB","GB"];let n;for(n=0;n<e.length-1;++n){const e=Math.pow(1024,n+1);if(t<e)break}const r=Math.pow(1024,n),c=0===n?0:2;return"".concat(o.numberFormat(t/r,c)," ").concat(e[n])},c=()=>r}

