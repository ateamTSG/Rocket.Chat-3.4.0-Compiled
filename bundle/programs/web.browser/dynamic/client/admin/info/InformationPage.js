function module(e,n,t){let i,o,a,l,r,c,s,m,u,d,E,_,f,k;t.export({InformationPage:()=>p}),t.link("@rocket.chat/fuselage",{Box(e){i=e},Button(e){o=e},ButtonGroup(e){a=e},Callout(e){l=e},Icon(e){r=e}},0),t.link("react",{default(e){c=e}},1),t.link("../../components/basic/Page",{default(e){s=e}},2),t.link("../../contexts/TranslationContext",{useTranslation(e){m=e}},3),t.link("./RocketChatSection",{RocketChatSection(e){u=e}},4),t.link("./CommitSection",{CommitSection(e){d=e}},5),t.link("./RuntimeEnvironmentSection",{RuntimeEnvironmentSection(e){E=e}},6),t.link("./BuildEnvironmentSection",{BuildEnvironmentSection(e){_=e}},7),t.link("./UsageSection",{UsageSection(e){f=e}},8),t.link("./InstancesSection",{InstancesSection(e){k=e}},9);const p=c.memo((function e(n){let{canViewStatistics:t,isLoading:p,info:g,statistics:h,instances:C,onClickRefreshButton:S,onClickDownloadInfo:w}=n;const R=m();if(!g)return null;const b=h&&h.instanceCount>1&&!h.oplogEnabled;return(c.createElement(s,{"data-qa":"admin-info"},c.createElement(s.Header,{title:R("Info")},t&&c.createElement(a,null,c.createElement(o,{disabled:p,external:!0,type:"button",onClick:w},c.createElement(r,{name:"download"})," ",R("Download_Info")),c.createElement(o,{disabled:p,primary:!0,type:"button",onClick:S},c.createElement(r,{name:"reload"})," ",R("Refresh")))),c.createElement(s.ScrollableContentWithShadow,null,c.createElement(i,{marginBlock:"none",marginInline:"auto",width:"full"},b&&c.createElement(l,{type:"danger",title:R("Error_RocketChat_requires_oplog_tailing_when_running_in_multiple_instances"),marginBlockEnd:"x16"},c.createElement(i,{withRichContent:!0},c.createElement("p",null,R("Error_RocketChat_requires_oplog_tailing_when_running_in_multiple_instances_details")),c.createElement("p",null,c.createElement("a",{rel:"noopener noreferrer",target:"_blank",href:"https://rocket.chat/docs/installation/manual-installation/multiple-instances-to-improve-performance/#running-multiple-instances-per-host-to-improve-performance"},R("Click_here_for_more_info"))))),t&&c.createElement(u,{info:g,statistics:h,isLoading:p}),c.createElement(d,{info:g}),t&&c.createElement(E,{statistics:h,isLoading:p}),c.createElement(_,{info:g}),t&&c.createElement(f,{statistics:h,isLoading:p}),c.createElement(k,{instances:C})))))}))}
