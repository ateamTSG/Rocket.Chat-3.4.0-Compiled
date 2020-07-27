function module(r,n,t){var e;t.export({useFormatMemorySize:function(){return o}}),t.link("underscore.string",{default:function(r){e=r}},0);var u=function(r){if("number"!=typeof r)return null;var n=["bytes","kB","MB","GB"],t;for(t=0;t<n.length-1;++t){var u;if(r<Math.pow(1024,t+1))break}var o=Math.pow(1024,t),a=0===t?0:2;return e.numberFormat(r/o,a)+" "+n[t]},o=function(){return u}}

