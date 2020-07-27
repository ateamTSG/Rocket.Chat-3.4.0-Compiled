function module(e,n,t){var l,r,a,o,c,i,u,s,m,f,E,d,p,C,h,k,b,x,g,j,_,v,w,y,S,D,T;t.link("@babel/runtime/regenerator",{default:function(e){l=e}},0),t.link("@babel/runtime/helpers/slicedToArray",{default:function(e){r=e}},1),t.link("@babel/runtime/helpers/extends",{default:function(e){a=e}},2),t.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){o=e}},3),t.export({EditCustomEmojiWithData:function(){return F},EditCustomEmoji:function(){return U}}),t.link("react",{default:function(e){c=e},useCallback:function(e){i=e},useState:function(e){u=e},useMemo:function(e){s=e},useEffect:function(e){m=e}},0),t.link("@rocket.chat/fuselage",{Box:function(e){f=e},Button:function(e){E=e},ButtonGroup:function(e){d=e},Margins:function(e){p=e},TextInput:function(e){C=e},Field:function(e){h=e},Icon:function(e){k=e},Skeleton:function(e){b=e},Throbber:function(e){x=e},InputBox:function(e){g=e}},1),t.link("../../contexts/TranslationContext",{useTranslation:function(e){j=e}},2),t.link("../../components/basic/Modal",{Modal:function(e){_=e}},3),t.link("../../hooks/useFileInput",{useFileInput:function(e){v=e}},4),t.link("../../hooks/useEndpointDataExperimental",{useEndpointDataExperimental:function(e){w=e},ENDPOINT_STATES:function(e){y=e}},5),t.link("../../hooks/useEndpointUpload",{useEndpointUpload:function(e){S=e}},6),t.link("../../hooks/useEndpointAction",{useEndpointAction:function(e){D=e}},7),t.link("../../components/basic/VerticalBar",{default:function(e){T=e}},8);var I=function(e){var n=e.onDelete,t=e.onCancel,l=o(e,["onDelete","onCancel"]),r=j();return c.createElement(_,l,c.createElement(_.Header,null,c.createElement(k,{color:"danger",name:"modal-warning",size:20}),c.createElement(_.Title,null,r("Are_you_sure")),c.createElement(_.Close,{onClick:t})),c.createElement(_.Content,{fontScale:"p1"},r("Custom_Emoji_Delete_Warning")),c.createElement(_.Footer,null,c.createElement(d,{align:"end"},c.createElement(E,{ghost:!0,onClick:t},r("Cancel")),c.createElement(E,{primary:!0,danger:!0,onClick:n},r("Delete")))))},A=function(e){var n=e.onClose,t=o(e,["onClose"]),l=j();return c.createElement(_,t,c.createElement(_.Header,null,c.createElement(k,{color:"success",name:"checkmark-circled",size:20}),c.createElement(_.Title,null,l("Deleted")),c.createElement(_.Close,{onClick:n})),c.createElement(_.Content,{fontScale:"p1"},l("Custom_Emoji_Has_Been_Deleted")),c.createElement(_.Footer,null,c.createElement(d,{align:"end"},c.createElement(E,{primary:!0,onClick:n},l("Ok")))))};function F(e){var n=e._id,t=e.cache,l=e.onChange,r=o(e,["_id","cache","onChange"]),i=j(),u=s((function(){return{query:JSON.stringify({_id:n})}}),[n,t]),m=w("emoji-custom.list",u),p=m.data,C=void 0===p?{emojis:{}}:p,h=m.state,k=m.error;return h===y.LOADING?c.createElement(f,{pb:"x20"},c.createElement(b,{mbs:"x8"}),c.createElement(g.Skeleton,{w:"full"}),c.createElement(b,{mbs:"x8"}),c.createElement(g.Skeleton,{w:"full"}),c.createElement(d,{stretch:!0,w:"full",mbs:"x8"},c.createElement(E,{disabled:!0},c.createElement(x,{inheritColor:!0})),c.createElement(E,{primary:!0,disabled:!0},c.createElement(x,{inheritColor:!0}))),c.createElement(d,{stretch:!0,w:"full",mbs:"x8"},c.createElement(E,{primary:!0,danger:!0,disabled:!0},c.createElement(x,{inheritColor:!0})))):k||!C||!C.emojis||C.emojis.update.length<1?c.createElement(f,{fontScale:"h1",pb:"x20"},i("Custom_User_Status_Error_Invalid_User_Status")):c.createElement(U,a({data:C.emojis.update[0],onChange:l},r))}function U(e){var n=e.close,t=e.onChange,a=e.data,b=o(e,["close","onChange","data"]),x=j(),g=a||{},_=g._id,w=g.name,y=g.aliases,F=g.extension,U=a||{},R=u(w),B=r(R,2),L=B[0],N=B[1],O=u(y.join(", ")),P=r(O,2),M=P[0],z=P[1],H=u(),W=r(H,2),q=W[0],G=W[1],J=u(),V=r(J,2),K=V[0],Q=V[1],X=u("/emoji-custom/"+encodeURIComponent(w)+"."+F),Y=r(X,2),Z=Y[0],$=Y[1];m((function(){N(w||""),z(y&&y.join(", ")||"")}),[w,y,U,_]);var ee=i(function(){function e(e){return l.async(function(){function n(n){for(;;)switch(n.prev=n.next){case 0:G(e),$(URL.createObjectURL(e));case 2:case"end":return n.stop()}}return n}(),null,null,null,Promise)}return e}(),[G]),ne=s((function(){return w!==L||M!==y.join(", ")||!!q}),[w,L,M,y,q]),te=S("emoji-custom.update",{},x("Custom_Emoji_Updated_Successfully")),le=i(function(){function e(){var e,n;return l.async(function(){function r(r){for(;;)switch(r.prev=r.next){case 0:return(e=new FormData).append("emoji",q),e.append("_id",_),e.append("name",L),e.append("aliases",M),r.next=7,l.awrap(te(e));case 7:(n=r.sent).success&&t();case 9:case"end":return r.stop()}}return r}(),null,null,null,Promise)}return e}(),[q,_,L,M,te,t]),re=D("POST","emoji-custom.delete",s((function(){return{emojiId:_}}),[_])),ae=i(function(){function e(){var e;return l.async(function(){function r(r){for(;;)switch(r.prev=r.next){case 0:return r.next=2,l.awrap(re());case 2:(e=r.sent).success&&Q((function(){return c.createElement(A,{onClose:function(){Q(void 0),n(),t()}})}));case 4:case"end":return r.stop()}}return r}(),null,null,null,Promise)}return e}(),[n,re,t]),oe=i((function(){return Q((function(){return c.createElement(I,{onDelete:ae,onCancel:function(){return Q(void 0)}})}))}),[ae,Q]),ce=i((function(e){return z(e.currentTarget.value)}),[z]),ie=v(ee,"emoji");return c.createElement(c.Fragment,null,c.createElement(T.ScrollableContent,b,c.createElement(h,null,c.createElement(h.Label,null,x("Name")),c.createElement(h.Row,null,c.createElement(C,{value:L,onChange:function(e){return N(e.currentTarget.value)},placeholder:x("Name")}))),c.createElement(h,null,c.createElement(h.Label,null,x("Aliases")),c.createElement(h.Row,null,c.createElement(C,{value:M,onChange:ce,placeholder:x("Aliases")}))),c.createElement(h,null,c.createElement(h.Label,{alignSelf:"stretch",display:"flex",justifyContent:"space-between",alignItems:"center"},x("Custom_Emoji"),c.createElement(E,{square:!0,onClick:ie},c.createElement(k,{name:"upload",size:"x20"}))),Z&&c.createElement(f,{display:"flex",flexDirection:"row",mbs:"none",justifyContent:"center"},c.createElement(p,{inline:"x4"},c.createElement(f,{is:"img",style:{objectFit:"contain"},w:"x120",h:"x120",src:Z})))),c.createElement(h,null,c.createElement(h.Row,null,c.createElement(d,{stretch:!0,w:"full"},c.createElement(E,{onClick:n},x("Cancel")),c.createElement(E,{primary:!0,onClick:le,disabled:!ne},x("Save"))))),c.createElement(h,null,c.createElement(h.Row,null,c.createElement(d,{stretch:!0,w:"full"},c.createElement(E,{primary:!0,danger:!0,onClick:oe},c.createElement(k,{name:"trash",mie:"x4"}),x("Delete")))))),K)}}
