function module(e,t,n){var r,l,o,a,c,i,u,s,f,m,d,p,C,E,k,h,g,x,v,b;function y(e){var t=e.onNextButtonClick,n=k(),s=x(),g=p(""),y=l(g,2),_=y[0],w=y[1],B=h("cloud:getWorkspaceRegisterData");d((function(){var e;(function(){function e(){var e;return r.async(function(){function t(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,r.awrap(B());case 2:e=t.sent,w(e);case 4:case"end":return t.stop()}}return t}(),null,null,null,Promise)}return e})()()}),[B]);var T=C();return d((function(){var e=new f(T.current);return e.on("success",(function(){s({type:"success",message:n("Copied")})})),function(){e.destroy()}}),[s,n]),m.createElement(m.Fragment,null,m.createElement(E.Content,null,m.createElement(o,{withRichContent:!0},m.createElement("p",null,n("Cloud_register_offline_helper"))),m.createElement(o,{display:"flex",flexDirection:"column",alignItems:"stretch",padding:"x16",flexGrow:1,backgroundColor:"neutral-800"},m.createElement(u,{vertical:!0},m.createElement(o,{height:"x108",fontFamily:"mono",fontScale:"p1",color:"alternative",style:{wordBreak:"break-all"}},_)),m.createElement(a,{ref:T,primary:!0,"data-clipboard-text":_},m.createElement(i,{name:"copy"})," ",n("Copy"))),m.createElement(v,{is:"p",withRichContent:!0,content:n("Cloud_click_here",{cloudConsoleUrl:b})})),m.createElement(E.Footer,null,m.createElement(c,null,m.createElement(a,{primary:!0,onClick:t},n("Next")))))}function _(e){var t=e.onBackButtonClick,n=e.onFinish,i=k(),f=x(),d=p(!1),C=l(d,2),h=C[0],v=C[1],b=p(""),y=l(b,2),_=y[0],w=y[1],B=function(e){w(e.currentTarget.value)},T=g("POST","cloud.manualRegister"),P=function(){function e(){return r.async(function(){function e(e){for(;;)switch(e.prev=e.next){case 0:return v(!0),e.prev=1,e.next=4,r.awrap(T({},{cloudBlob:_}));case 4:f({type:"success",message:i("Cloud_register_success")}),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(1),f({type:"error",message:i("Cloud_register_error")});case 10:return e.prev=10,v(!1),n&&n(),e.finish(10);case 14:case"end":return e.stop()}}return e}(),null,null,[[1,7,10,14]],Promise)}return e}();return m.createElement(m.Fragment,null,m.createElement(E.Content,null,m.createElement(o,{withRichContent:!0},m.createElement("p",null,i("Cloud_register_offline_finish_helper"))),m.createElement(o,{display:"flex",flexDirection:"column",alignItems:"stretch",padding:"x16",flexGrow:1,backgroundColor:"neutral-800"},m.createElement(u,{vertical:!0},m.createElement(o,{is:"textarea",height:"x108",fontFamily:"mono",fontScale:"p1",color:"alternative",style:{wordBreak:"break-all",resize:"none"},placeholder:i("Paste_here"),disabled:h,value:_,autoComplete:"off",autoCorrect:"off",autoCapitalize:"off",spellCheck:"false",onChange:B})))),m.createElement(E.Footer,null,m.createElement(c,null,m.createElement(a,{disabled:h,onClick:t},i("Back")),m.createElement(a,{primary:!0,disabled:h||!_.trim(),marginInlineStart:"auto",onClick:P},h?m.createElement(s,{inheritColor:!0}):i("Finish Registration")))))}n.link("@babel/runtime/regenerator",{default:function(e){r=e}},0),n.link("@babel/runtime/helpers/slicedToArray",{default:function(e){l=e}},1),n.link("@rocket.chat/fuselage",{Box:function(e){o=e},Button:function(e){a=e},ButtonGroup:function(e){c=e},Icon:function(e){i=e},Scrollable:function(e){u=e},Throbber:function(e){s=e}},0),n.link("clipboard",{default:function(e){f=e}},1),n.link("react",{default:function(e){m=e},useEffect:function(e){d=e},useState:function(e){p=e},useRef:function(e){C=e}},2),n.link("../../components/basic/Modal",{Modal:function(e){E=e}},3),n.link("../../contexts/TranslationContext",{useTranslation:function(e){k=e}},4),n.link("../../contexts/ServerContext",{useMethod:function(e){h=e},useEndpoint:function(e){g=e}},5),n.link("../../contexts/ToastMessagesContext",{useToastMessageDispatch:function(e){x=e}},6),n.link("../../components/basic/MarkdownText",{default:function(e){v=e}},7),n.link("./constants",{cloudConsoleUrl:function(e){b=e}},8);var w={COPY:"copy",PASTE:"paste"};function B(e){var t=e.onClose,n=e.props,r=k(),o=p(w.COPY),a=l(o,2),c=a[0],i=a[1],u=function(){i(w.PASTE)},s=function(){i(w.COPY)};return m.createElement(E,n,m.createElement(E.Header,null,m.createElement(E.Title,null,r("Cloud_Register_manually")),m.createElement(E.Close,{onClick:t})),c===w.COPY&&m.createElement(y,{onNextButtonClick:u})||c===w.PASTE&&m.createElement(_,{onBackButtonClick:s,onFinish:t}))}n.exportDefault(B)}

