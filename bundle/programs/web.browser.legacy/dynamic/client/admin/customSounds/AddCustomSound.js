function module(e,n,t){var r,a,o,u,c,l,i,s,f,d,m,p,h,g,x,k,b,E,y,v;function C(e){var n=e.goToNew,t=e.close,C=e.onChange,w=o(e,["goToNew","close","onChange"]),S=x(),T=g(),_=c(""),F=a(_,2),M=F[0],B=F[1],I=c(),N=a(I,2),A=N[0],D=N[1],P=k("uploadCustomSound"),R=k("insertOrUpdateSound"),U=l((function(e){D(e)}),[]),q=b(U,"audio/mp3"),L=l(function(){function e(e,n){var t,a,o,u;return r.async(function(){function c(c){for(;;)switch(c.prev=c.next){case 0:if(t=y(n,e),0!==(a=E(t,n)).length){c.next=16;break}return c.prev=3,c.next=6,r.awrap(R(t));case 6:o=c.sent,c.next=12;break;case 9:c.prev=9,c.t0=c.catch(3),T({type:"error",message:c.t0});case 12:return t._id=o,t.random=Math.round(1e3*Math.random()),o&&(T({type:"success",message:S("Uploading_file")}),(u=new FileReader).readAsBinaryString(n),u.onloadend=function(){try{P(u.result,n.type,t),T({type:"success",message:S("File_uploaded")})}catch(e){T({type:"error",message:e})}}),c.abrupt("return",o);case 16:a.forEach((function(e){throw new Error({type:"error",message:S("error-the-field-is-required",{field:S(e)})})}));case 17:case"end":return c.stop()}}return c}(),null,null,[[3,9]],Promise)}return e}(),[T,R,S,P]),j=l(function(){function e(){var e;return r.async(function(){function t(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,r.awrap(L(M,A));case 3:e=t.sent,T({type:"success",message:S("Custom_Sound_Updated_Successfully")}),n(e)(),C(),t.next=12;break;case 9:t.prev=9,t.t0=t.catch(0),T({type:"error",message:t.t0});case 12:case"end":return t.stop()}}return t}(),null,null,[[0,9]],Promise)}return e}(),[T,n,M,C,L,A,S]);return u.createElement(v.ScrollableContent,w,u.createElement(i,null,u.createElement(i.Label,null,S("Name")),u.createElement(i.Row,null,u.createElement(s,{value:M,onChange:function(e){return B(e.currentTarget.value)},placeholder:S("Name")}))),u.createElement(i,null,u.createElement(i.Label,{alignSelf:"stretch"},S("Sound_File_mp3")),u.createElement(f,{display:"flex",flexDirection:"row",mbs:"none"},u.createElement(m,{inline:"x4"},u.createElement(p,{square:!0,onClick:q},u.createElement(d,{name:"upload",size:"x20"})),A&&A.name||"none"))),u.createElement(i,null,u.createElement(i.Row,null,u.createElement(h,{stretch:!0,w:"full"},u.createElement(p,{mie:"x4",onClick:t},S("Cancel")),u.createElement(p,{primary:!0,onClick:j,disabled:""===M},S("Save"))))))}t.link("@babel/runtime/regenerator",{default:function(e){r=e}},0),t.link("@babel/runtime/helpers/slicedToArray",{default:function(e){a=e}},1),t.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){o=e}},2),t.export({AddCustomSound:function(){return C}}),t.link("react",{default:function(e){u=e},useState:function(e){c=e},useCallback:function(e){l=e}},0),t.link("@rocket.chat/fuselage",{Field:function(e){i=e},TextInput:function(e){s=e},Box:function(e){f=e},Icon:function(e){d=e},Margins:function(e){m=e},Button:function(e){p=e},ButtonGroup:function(e){h=e}},1),t.link("../../contexts/ToastMessagesContext",{useToastMessageDispatch:function(e){g=e}},2),t.link("../../contexts/TranslationContext",{useTranslation:function(e){x=e}},3),t.link("../../contexts/ServerContext",{useMethod:function(e){k=e}},4),t.link("../../hooks/useFileInput",{useFileInput:function(e){b=e}},5),t.link("./lib",{validate:function(e){E=e},createSoundData:function(e){y=e}},6),t.link("../../components/basic/VerticalBar",{default:function(e){v=e}},7)}

