function module(e,t,n){let a,o,l,r,c,i,s;function u(){const e=s(),t=c("Site_Url"),n=i("Show_Setup_Wizard"),u=()=>{n("completed")};return r.createElement(a,{is:"section",width:"full",maxWidth:"x480",margin:"auto"},r.createElement(l,{is:"main",padding:"x40"},r.createElement(a,{margin:"x32"},r.createElement(a,{is:"span",color:"hint",fontScale:"c2"},e("Launched_successfully")),r.createElement(a,{is:"h1",fontScale:"h1",marginBlockEnd:"x32"},e("Your_workspace_is_ready")),r.createElement(a,{fontScale:"micro"},e("Your_server_link")),r.createElement(a,{color:"primary",fontScale:"s1",marginBlockEnd:"x24"},t),r.createElement(o,{primary:!0,"data-qa":"go-to-workspace",onClick:u},e("Go_to_your_workspace")))))}n.link("@rocket.chat/fuselage",{Box(e){a=e},Button(e){o=e},Tile(e){l=e}},0),n.link("react",{default(e){r=e}},1),n.link("../../../contexts/SettingsContext",{useSetting(e){c=e},useSettingSetValue(e){i=e}},2),n.link("../../../contexts/TranslationContext",{useTranslation(e){s=e}},3),n.exportDefault(u)}

