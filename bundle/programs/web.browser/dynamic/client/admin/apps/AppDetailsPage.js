function module(e,t,n){let l,a,r,c,i,o,s,m,p,u,f,x,E,d,h,g,y,k,w,b,S,D,C,v,A,F,I,j,G,T,B;function O(e){let{data:t}=e;const n=v(),{iconFileData:l="",name:r,author:{name:c,homepage:i,support:o}={},description:s,categories:m=[],version:p,price:u,purchaseType:h,pricingPlans:g,iconFileContent:y,installed:C,bundledIn:A}=t;return a.createElement(a.Fragment,null,a.createElement(f,{display:"flex",flexDirection:"row",mbe:"x20",w:"full"},a.createElement(k,{size:"x120",mie:"x20",iconFileContent:y,iconFileData:l}),a.createElement(f,{display:"flex",flexDirection:"column",justifyContent:"space-between",flexGrow:1},a.createElement(f,{fontScale:"h1"},r),a.createElement(f,{display:"flex",flexDirection:"row",color:"hint",alignItems:"center"},a.createElement(f,{fontScale:"p2",mie:"x4"},n("By_author",{author:c})),"|",a.createElement(f,{mis:"x4"},n("Version_version",{version:p}))),a.createElement(f,{display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between"},a.createElement(f,{flexGrow:1,display:"flex",flexDirection:"row",alignItems:"center",marginInline:"neg-x8"},a.createElement(S,{app:t,marginInline:"x8"}),!C&&a.createElement(b,{purchaseType:h,pricingPlans:g,price:u,showType:!1,marginInline:"x8"})),C&&a.createElement(D,{app:t})))),a.createElement(x,null),a.createElement(f,{display:"flex",flexDirection:"column"},a.createElement(d,{block:"x12"},a.createElement(f,{fontScale:"s2"},n("Categories")),a.createElement(f,{display:"flex",flexDirection:"row"},m&&m.map(e=>a.createElement(E,{key:e,textTransform:"uppercase",mie:"x8"},a.createElement(f,{color:"hint"},e)))),a.createElement(f,{fontScale:"s2"},n("Contact")),a.createElement(f,{display:"flex",flexDirection:"row",flexGrow:1,justifyContent:"space-around",flexWrap:"wrap"},a.createElement(f,{display:"flex",flexDirection:"column",mie:"x12",flexGrow:1},a.createElement(f,{fontScale:"s1",color:"hint"},n("Author_Site")),a.createElement(w,{to:i})),a.createElement(f,{display:"flex",flexDirection:"column",flexGrow:1},a.createElement(f,{fontScale:"s1",color:"hint"},n("Support")),a.createElement(w,{to:o}))),a.createElement(f,{fontScale:"s2"},n("Details")),a.createElement(f,{display:"flex",flexDirection:"row"},s))),A&&a.createElement(a.Fragment,null,a.createElement(x,null),a.createElement(f,{display:"flex",flexDirection:"column"},a.createElement(d,{block:"x12"},a.createElement(f,{fontScale:"s2"},n("Bundles")),A.map(e=>a.createElement(f,{key:e.bundleId,display:"flex",flexDirection:"row",alignItems:"center"},a.createElement(f,{width:"x80",height:"x80",display:"flex",flexDirection:"row",justifyContent:"space-around",flexWrap:"wrap",flexShrink:0},e.apps.map(e=>a.createElement(k,{size:"x36",key:e.latest.name,iconFileContent:e.latest.iconFileContent,iconFileData:e.latest.iconFileData}))),a.createElement(f,{display:"flex",flexDirection:"column",mis:"x12"},a.createElement(f,{fontScale:"p2"},e.bundleName),e.apps.map(e=>a.createElement(f,{key:e.latest.name},e.latest.name,",")))))))))}n.link("@babel/runtime/helpers/objectSpread2",{default(e){l=e}},0),n.export({default:()=>_}),n.link("react",{default(e){a=e},useState(e){r=e},useCallback(e){c=e},useMemo(e){i=e},useEffect(e){o=e},useRef(e){s=e}},0),n.link("@rocket.chat/fuselage",{Button(e){m=e},ButtonGroup(e){p=e},Icon(e){u=e},Box(e){f=e},Divider(e){x=e},Chip(e){E=e},Margins(e){d=e},Skeleton(e){h=e},Throbber(e){g=e}},1),n.link("../../components/basic/Page",{default(e){y=e}},2),n.link("../../components/basic/avatar/AppAvatar",{default(e){k=e}},3),n.link("../../components/basic/ExternalLink",{default(e){w=e}},4),n.link("./PriceDisplay",{default(e){b=e}},5),n.link("./AppStatus",{default(e){S=e}},6),n.link("./AppMenu",{default(e){D=e}},7),n.link("../../contexts/RouterContext",{useRoute(e){C=e}},8),n.link("../../contexts/TranslationContext",{useTranslation(e){v=e}},9),n.link("./hooks/useAppInfo",{useAppInfo(e){A=e}},10),n.link("../../contexts/ServerContext",{useAbsoluteUrl(e){F=e}},11),n.link("../../../app/apps/client/orchestrator",{Apps(e){I=e}},12),n.link("../../hooks/useForm",{useForm(e){j=e}},13),n.link("./helpers",{handleAPIError(e){G=e},apiCurlGetter(e){T=e}},14),n.link("./AppSettings",{AppSettingsAssembler(e){B=e}},15);const P=e=>{let{settings:t,setHasUnsavedChanges:n,settingsRef:r}=e;const c=v(),s=i(()=>Object.values(t).reduce((e,t)=>{let{id:n,value:a,packageValue:r}=t;return e=l({},e,{[n]:null!=a?a:r})},{}),[JSON.stringify(t)]),{values:m,handlers:p,hasUnsavedChanges:u}=j(s);return o(()=>{n(u),r.current=m},[u,JSON.stringify(m),n]),a.createElement(a.Fragment,null,a.createElement(x,null),a.createElement(f,{display:"flex",flexDirection:"column"},a.createElement(f,{fontScale:"s2",mb:"x12"},c("Settings")),a.createElement(B,{settings:t,values:m,handlers:p})))},R=e=>{let{apis:t}=e;const n=v(),l=F(),r=T(l);return a.createElement(a.Fragment,null,a.createElement(x,null),a.createElement(f,{display:"flex",flexDirection:"column"},a.createElement(f,{fontScale:"s2",mb:"x12"},n("APIs")),t.map(e=>a.createElement(f,{mb:"x8"},a.createElement(f,{fontScale:"p2"},e.methods.join(" | ").toUpperCase()," ",e.path),e.methods.map(t=>a.createElement(f,null,a.createElement(f,{withRichContent:!0},a.createElement("pre",null,a.createElement("code",null,r(t,e).map(e=>a.createElement(a.Fragment,null,e,a.createElement("br",null))))))))))))},U=()=>a.createElement(f,{display:"flex",flexDirection:"row",mbe:"x20",w:"full"},a.createElement(h,{variant:"rect",w:"x120",h:"x120",mie:"x20"}),a.createElement(f,{display:"flex",flexDirection:"column",justifyContent:"space-between",flexGrow:1},a.createElement(h,{variant:"rect",w:"full",h:"x32"}),a.createElement(h,{variant:"rect",w:"full",h:"x32"}),a.createElement(h,{variant:"rect",w:"full",h:"x32"})));function _(e){let{id:t}=e;const n=v(),[i,o]=r(!1),[x,E]=r(!1),d=s({}),h=A(t),k=C("admin-apps"),w=()=>k.push({}),b=0===Object.values(h).length,{settings:S={},apis:D={}}=h,F=Object.values(S).length,j=D.length,T=c(async()=>{const{current:e}=d;E(!0);try{await I.setAppSettings(t,Object.values(S).map(t=>l({},t,{value:e[t.id]})))}catch(n){G(n)}E(!1)},[t,S]);return a.createElement(y,{flexDirection:"column"},a.createElement(y.Header,{title:n("App_Details")},a.createElement(p,null,a.createElement(m,{primary:!0,disabled:!i||x,onClick:T},!x&&n("Save_changes"),x&&a.createElement(g,{inheritColor:!0})),a.createElement(m,{onClick:w},a.createElement(u,{name:"back"}),n("Back")))),a.createElement(y.ScrollableContentWithShadow,null,a.createElement(f,{maxWidth:"x600",w:"full",alignSelf:"center"},b&&a.createElement(U,null),!b&&a.createElement(a.Fragment,null,a.createElement(O,{data:h}),!!j&&a.createElement(R,{apis:D}),!!F&&a.createElement(P,{settings:S,setHasUnsavedChanges:o,settingsRef:d})))))}}

