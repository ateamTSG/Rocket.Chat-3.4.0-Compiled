function module(t,e,a){let n,l;function o(t){let{additionalFields:e,url:a}=t;return l(()=>{const t=n({},e,{text:"Example message",attachments:[{title:"Rocket.Chat",title_link:"https://rocket.chat",text:"Rocket.Chat, the best open source chat",image_url:"/images/integration-attachment-example.png",color:"#764FA5"}]});return[t,"curl -X POST -H 'Content-Type: application/json' --data '".concat(JSON.stringify(t),"' ").concat(a)]},[e,a])}a.link("@babel/runtime/helpers/objectSpread2",{default(t){n=t}},0),a.export({useExampleData:()=>o}),a.link("react",{useMemo(t){l=t}},0)}
