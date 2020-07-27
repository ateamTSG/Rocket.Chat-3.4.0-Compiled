function module(e,t,n){let o,r,c;n.export({useReactiveValue:()=>u}),n.link("react",{useState(e){o=e},useEffect(e){r=e}},0),n.link("meteor/tracker",{Tracker(e){c=e}},1);const u=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];const[n,u]=o(()=>c.nonreactive(e));return r(()=>{const t=c.autorun(()=>{const t=e();u(()=>t)});return()=>{t.stop()}},t),n}}

