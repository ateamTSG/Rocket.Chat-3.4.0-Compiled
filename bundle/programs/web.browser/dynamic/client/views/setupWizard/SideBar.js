function module(e,a,t){let l,n,r,i,o,c,s;function d(e){let{logoSrc:a="images/logo/logo.svg",currentStep:t=1,steps:d=[]}=e;const p=c(),x=i("(max-width: 760px)");return o.createElement(l,{is:"aside",className:"SetupWizard__SideBar",flexGrow:0,flexShrink:1,flexBasis:x?"auto":"350px",maxHeight:"sh",display:"flex",flexDirection:"column",flexWrap:"nowrap",style:{overflow:"hidden"}},o.createElement(l,{is:"header",marginBlockStart:x?"x16":"x32",marginBlockEnd:x?"none":"x32",marginInline:"x24",display:"flex",flexDirection:"row",flexWrap:"wrap",alignItems:"center"},o.createElement(s,{src:a,width:"auto",height:"x24",margin:"x4"}),o.createElement(l,{is:"span",margin:"x4",paddingBlock:"x4",paddingInline:"x8",color:"alternative",fontScale:"micro",style:{whiteSpace:"nowrap",textTransform:"uppercase",backgroundColor:"var(--color-dark, #2f343d)",borderRadius:"9999px"}},p("Setup_Wizard"))),!x&&o.createElement(r,null,o.createElement(l,{flexGrow:1,marginBlockEnd:"x16",paddingInline:"x32"},o.createElement(n,{blockEnd:"x16"},o.createElement(l,{is:"h2",fontScale:"h1",color:"default"},p("Setup_Wizard")),o.createElement(l,{is:"p",color:"hint",fontScale:"p1"},p("Setup_Wizard_Info"))),o.createElement(l,{is:"ol"},d.map(e=>{let{step:a,title:n}=e;return(o.createElement(l,{key:a,is:"li",className:["SetupWizard__SideBar-step",a<t&&"SetupWizard__SideBar-step--past"].filter(Boolean).join(" "),"data-number":a,marginBlock:"x32",marginInline:"neg-x8",display:"flex",alignItems:"center",fontScale:"p2",color:(a===t?"primary":a<t&&"default")||"disabled",style:{position:"relative"}},n))})))))}t.link("@rocket.chat/fuselage",{Box(e){l=e},Margins(e){n=e},Scrollable(e){r=e}},0),t.link("@rocket.chat/fuselage-hooks",{useMediaQuery(e){i=e}},1),t.link("react",{default(e){o=e}},2),t.link("../../contexts/TranslationContext",{useTranslation(e){c=e}},3),t.link("../../components/basic/Logo",{default(e){s=e}},4),t.link("./SideBar.css"),t.exportDefault(d)}
