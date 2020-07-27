function module(e,t,n){var r,l,a,c,o,u,s,i,m,f,E,d,p,C,h,k,b,_,x,S,g,v,y,w,T,D;n.link("@babel/runtime/regenerator",{default:function(e){r=e}},0),n.link("@babel/runtime/helpers/slicedToArray",{default:function(e){l=e}},1),n.link("@babel/runtime/helpers/extends",{default:function(e){a=e}},2),n.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){c=e}},3),n.export({EditCustomUserStatusWithData:function(){return N},EditCustomUserStatus:function(){return O}}),n.link("react",{default:function(e){o=e},useCallback:function(e){u=e},useState:function(e){s=e},useMemo:function(e){i=e},useEffect:function(e){m=e}},0),n.link("@rocket.chat/fuselage",{Box:function(e){f=e},Button:function(e){E=e},ButtonGroup:function(e){d=e},TextInput:function(e){p=e},Field:function(e){C=e},Select:function(e){h=e},Icon:function(e){k=e},Skeleton:function(e){b=e},Throbber:function(e){_=e},InputBox:function(e){x=e}},1),n.link("../../contexts/TranslationContext",{useTranslation:function(e){S=e}},2),n.link("../../contexts/ServerContext",{useMethod:function(e){g=e}},3),n.link("../../contexts/ToastMessagesContext",{useToastMessageDispatch:function(e){v=e}},4),n.link("../../components/basic/Modal",{Modal:function(e){y=e}},5),n.link("../../hooks/useEndpointDataExperimental",{useEndpointDataExperimental:function(e){w=e},ENDPOINT_STATES:function(e){T=e}},6),n.link("../../components/basic/VerticalBar",{default:function(e){D=e}},7);var U=function(e){var t=e.onDelete,n=e.onCancel,r=c(e,["onDelete","onCancel"]),l=S();return o.createElement(y,r,o.createElement(y.Header,null,o.createElement(k,{color:"danger",name:"modal-warning",size:20}),o.createElement(y.Title,null,l("Are_you_sure")),o.createElement(y.Close,{onClick:n})),o.createElement(y.Content,{fontScale:"p1"},l("Custom_User_Status_Delete_Warning")),o.createElement(y.Footer,null,o.createElement(d,{align:"end"},o.createElement(E,{ghost:!0,onClick:n},l("Cancel")),o.createElement(E,{primary:!0,danger:!0,onClick:t},l("Delete")))))},B=function(e){var t=e.onClose,n=c(e,["onClose"]),r=S();return o.createElement(y,n,o.createElement(y.Header,null,o.createElement(k,{color:"success",name:"checkmark-circled",size:20}),o.createElement(y.Title,null,r("Deleted")),o.createElement(y.Close,{onClick:t})),o.createElement(y.Content,{fontScale:"p1"},r("Custom_User_Status_Has_Been_Deleted")),o.createElement(y.Footer,null,o.createElement(d,{align:"end"},o.createElement(E,{primary:!0,onClick:t},r("Ok")))))};function N(e){var t=e._id,n=e.cache,r=c(e,["_id","cache"]),l=S(),u=i((function(){return{query:JSON.stringify({_id:t})}}),[t,n]),s=w("custom-user-status.list",u),m=s.data,p=s.state,C=s.error;return p===T.LOADING?o.createElement(f,{pb:"x20"},o.createElement(b,{mbs:"x8"}),o.createElement(x.Skeleton,{w:"full"}),o.createElement(b,{mbs:"x8"}),o.createElement(x.Skeleton,{w:"full"}),o.createElement(d,{stretch:!0,w:"full",mbs:"x8"},o.createElement(E,{disabled:!0},o.createElement(_,{inheritColor:!0})),o.createElement(E,{primary:!0,disabled:!0},o.createElement(_,{inheritColor:!0}))),o.createElement(d,{stretch:!0,w:"full",mbs:"x8"},o.createElement(E,{primary:!0,danger:!0,disabled:!0},o.createElement(_,{inheritColor:!0})))):C||!m||m.statuses.length<1?o.createElement(f,{fontScale:"h1",pb:"x20"},l("Custom_User_Status_Error_Invalid_User_Status")):o.createElement(O,a({data:m.statuses[0]},r))}function O(e){var t=e.close,n=e.onChange,a=e.data,f=c(e,["close","onChange","data"]),b=S(),_=v(),x=a||{},y=x._id,w=x.name,T=x.statusType,N=s(""),O=l(N,2),I=O[0],M=O[1],P=s(""),A=l(P,2),F=A[0],R=A[1],H=s(),L=l(H,2),W=L[0],z=L[1];m((function(){M(w||""),R(T||"")}),[w,T,y]);var G=g("insertOrUpdateUserStatus"),j=g("deleteCustomUserStatus"),q=i((function(){return w!==I||T!==F}),[I,w,T,F]),J=u(function(){function e(){return r.async(function(){function e(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,r.awrap(G({_id:y,previousName:w,previousStatusType:T,name:I,statusType:F}));case 3:_({type:"success",message:b("Custom_User_Status_Updated_Successfully")}),n(),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),_({type:"error",message:e.t0});case 10:case"end":return e.stop()}}return e}(),null,null,[[0,7]],Promise)}return e}(),[G,y,w,T,I,F,_,b,n]),V=u(function(){function e(){return r.async(function(){function e(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,r.awrap(j(y));case 3:z((function(){return o.createElement(B,{onClose:function(){z(void 0),t(),n()}})})),e.next=10;break;case 6:e.prev=6,e.t0=e.catch(0),_({type:"error",message:e.t0}),n();case 10:case"end":return e.stop()}}return e}(),null,null,[[0,6]],Promise)}return e}(),[y,t,j,_,n]),K=function(){return z((function(){return o.createElement(U,{onDelete:V,onCancel:function(){return z(void 0)}})}))},Q=[["online",b("Online")],["busy",b("Busy")],["away",b("Away")],["offline",b("Offline")]];return o.createElement(o.Fragment,null,o.createElement(D.ScrollableContent,f,o.createElement(C,null,o.createElement(C.Label,null,b("Name")),o.createElement(C.Row,null,o.createElement(p,{value:I,onChange:function(e){return M(e.currentTarget.value)},placeholder:b("Name")}))),o.createElement(C,null,o.createElement(C.Label,null,b("Presence")),o.createElement(C.Row,null,o.createElement(h,{value:F,onChange:function(e){return R(e)},placeholder:b("Presence"),options:Q}))),o.createElement(C,null,o.createElement(C.Row,null,o.createElement(d,{stretch:!0,w:"full"},o.createElement(E,{onClick:t},b("Cancel")),o.createElement(E,{primary:!0,onClick:J,disabled:!q},b("Save"))))),o.createElement(C,null,o.createElement(C.Row,null,o.createElement(d,{stretch:!0,w:"full"},o.createElement(E,{primary:!0,danger:!0,onClick:K},o.createElement(k,{name:"trash",mie:"x4"}),b("Delete")))))),W)}}
