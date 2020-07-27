function module(e,t,n){let l,o,a,r,c,i,u,m,s,d,g,k,E,C;n.link("@babel/runtime/helpers/extends",{default(e){l=e}},0),n.link("@babel/runtime/helpers/objectWithoutProperties",{default(e){o=e}},1),n.export({DeleteWarningModal:()=>b,SuccessModal:()=>p,default:()=>h}),n.link("@rocket.chat/fuselage",{Button(e){a=e},ButtonGroup(e){r=e},Icon(e){c=e}},0),n.link("react",{default(e){i=e},useCallback(e){u=e}},1),n.link("../../../components/basic/Page",{default(e){m=e}},2),n.link("./EditIncomingWebhook",{default(e){s=e}},3),n.link("./EditOutgoingWebhook",{default(e){d=e}},4),n.link("../../../components/basic/Modal",{Modal(e){g=e}},5),n.link("../../../contexts/TranslationContext",{useTranslation(e){k=e}},6),n.link("../../../contexts/RouterContext",{useRouteParameter(e){E=e},useRoute(e){C=e}},7);const b=e=>{let{onDelete:t,onCancel:n}=e,l=o(e,["onDelete","onCancel"]);const u=k();return(i.createElement(g,l,i.createElement(g.Header,null,i.createElement(c,{color:"danger",name:"modal-warning",size:20}),i.createElement(g.Title,null,u("Are_you_sure")),i.createElement(g.Close,{onClick:n})),i.createElement(g.Content,{fontScale:"p1"},u("Integration_Delete_Warning")),i.createElement(g.Footer,null,i.createElement(r,{align:"end"},i.createElement(a,{ghost:!0,onClick:n},u("Cancel")),i.createElement(a,{primary:!0,danger:!0,onClick:t},u("Delete"))))))},p=e=>{let{onClose:t}=e,n=o(e,["onClose"]);const l=k();return(i.createElement(g,n,i.createElement(g.Header,null,i.createElement(c,{color:"success",name:"checkmark-circled",size:20}),i.createElement(g.Title,null,l("Deleted")),i.createElement(g.Close,{onClick:t})),i.createElement(g.Content,{fontScale:"p1"},l("Your_entry_has_been_deleted")),i.createElement(g.Footer,null,i.createElement(r,{align:"end"},i.createElement(a,{primary:!0,onClick:t},l("Ok"))))))};function h(e){let t=l({},e);const n=k(),o=C("admin-integrations"),g=E("type"),b=E("id"),p=u(()=>{o.push({})},[o]),h=u(()=>{o.push({context:"history",type:"outgoing",id:b})},[b,o]);return i.createElement(m,l({flexDirection:"column"},t),i.createElement(m.Header,{title:n("incoming"===g?"Integration_Incoming_WebHook":"Integration_Outgoing_WebHook")},i.createElement(r,null,i.createElement(a,{onClick:p},i.createElement(c,{name:"back",size:"x16"})," ",n("Back")),"outgoing"===g&&i.createElement(a,{onClick:h},n("History")))),i.createElement(m.ScrollableContentWithShadow,null,"outgoing"===g&&i.createElement(d,{integrationId:b,key:"outgoing"})||"incoming"===g&&i.createElement(s,{integrationId:b,key:"incoming"})))}}
