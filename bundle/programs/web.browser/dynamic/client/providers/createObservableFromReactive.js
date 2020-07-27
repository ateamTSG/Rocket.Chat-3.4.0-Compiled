function module(e,r,t){let n;t.export({createObservableFromReactive:()=>o}),t.link("meteor/tracker",{Tracker(e){n=e}},0);const o=e=>(function(){for(var r=arguments.length,t=new Array(r),o=0;o<r;o++)t[o]=arguments[o];const c=t.slice(0,-1),a=t.pop();if(!a)return n.nonreactive(()=>e(...c));const i=n.autorun(()=>{const r=e(...c);a(r)});return()=>{i.stop()}})}

