function module(e,t,n){let a,r,c,l,i,o,s,m;n.link("@babel/runtime/helpers/extends",{default(e){a=e}},0),n.export({default:()=>h}),n.link("react",{default(e){r=e},useEffect(e){c=e},useState(e){l=e}},0),n.link("@rocket.chat/fuselage",{Box(e){i=e},Skeleton(e){o=e},Margins(e){s=e}},1),n.link("../../../contexts/TranslationContext",{useTranslation(e){m=e}},2);const d=e=>new Promise(t=>{const n=document.createElement("script");n.type="text/javascript",document.body.appendChild(n);const a=e=>t(e.currentTarget);n.onreadystatechange=a,n.onload=a,n.src=e});function h(e){let t=a({},e);const n=m(),[h,u]=l();return c(()=>{const e=async()=>{const e=await d("https://zapier.com/apps/embed/widget.js?services=rocketchat&html_id=zapier-goes-here");u(e)};return h||e(),()=>h&&h.parentNode.removeChild(h)},[h]),r.createElement(r.Fragment,null,r.createElement(i,{pb:"x20",fontScale:"s1",dangerouslySetInnerHTML:{__html:n("additional_integrations_Zapier")}}),!h&&r.createElement(i,{display:"flex",flexDirection:"column",alignItems:"stretch",mbs:10},r.createElement(s,{blockEnd:14},r.createElement(o,{variant:"rect",height:71}),r.createElement(o,{variant:"rect",height:71}),r.createElement(o,{variant:"rect",height:71}),r.createElement(o,{variant:"rect",height:71}),r.createElement(o,{variant:"rect",height:71}))),r.createElement(i,a({id:"zapier-goes-here"},t)))}}
