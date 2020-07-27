function module(e,t,n){var a,r,i,l,o,c,u,f,m,s,d,E,x,h,p,T,k,b,g,S,v,D,w;n.link("@babel/runtime/helpers/extends",{default:function(e){a=e}},0),n.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){r=e}},1),n.link("@babel/runtime/helpers/slicedToArray",{default:function(e){i=e}},2),n.export({UserInfoWithData:function(){return I},UserInfo:function(){return _}}),n.link("react",{default:function(e){l=e},useMemo:function(e){o=e},useState:function(e){c=e},useEffect:function(e){u=e},useCallback:function(e){f=e}},0),n.link("@rocket.chat/fuselage",{Box:function(e){m=e},Avatar:function(e){s=e},Margins:function(e){d=e},Chip:function(e){E=e},Tag:function(e){x=e}},1),n.link("moment",{default:function(e){h=e}},2),n.link("../../hooks/useEndpointDataExperimental",{useEndpointDataExperimental:function(e){p=e},ENDPOINT_STATES:function(e){T=e}},3),n.link("../../contexts/TranslationContext",{useTranslation:function(e){k=e}},4),n.link("../../../app/utils/client",{roomTypes:function(e){b=e}},5),n.link("../../../app/lib",{DateFormat:function(e){g=e}},6),n.link("./UserInfoActions",{UserInfoActions:function(e){S=e}},7),n.link("../../components/basic/MarkdownText",{default:function(e){v=e}},8),n.link("../../components/basic/VerticalBar",{default:function(e){D=e}},9),n.link("./Skeleton",{FormSkeleton:function(e){w=e}},10);var A=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1?arguments[1]:void 0,n=c(),a=i(n,2),r=a[0],l=a[1];return u((function(){var n=function(){return l(g.formatTime(h().get().utcOffset(e)))},a=setInterval((function(){return n()}),t);return n(),function(){return clearInterval(a)}}),[e,t]),r},C=function(e){var t=e.utcOffset,n=r(e,["utcOffset"]),a=A(t,1e4);return l.createElement(m,n,a," UTC ",t)};function I(e){var t=e.uid,n=r(e,["uid"]),u=k(),f=c(),s=i(f,2),d=s[0],E=s[1],x=function(){return E(new Date)},h=p("users.info",o((function(){return{userId:t}}),[t,d])),b=h.data,g=h.state,S=h.error;return g===T.LOADING?l.createElement(w,null):S?l.createElement(m,{mbs:"x16"},u("User_not_found")):l.createElement(_,a({data:b.user,onChange:x},n))}function _(e){var t=e.data,n=e.onChange,i=r(e,["data","onChange"]),o=k(),c=g.formatDateAndTime(t.createdAt),u=t.lastLogin?g.formatDateAndTime(t.lastLogin):"",h=b.getConfig("d").getAvatarPath({name:t.username||t.name,type:"d",_id:t._id});return l.createElement(D.ScrollableContent,a({is:"form",onSubmit:f((function(e){return e.preventDefault()}),[])},i),l.createElement(m,{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0,withTruncatedText:!0},l.createElement(d,{block:"x2",inline:"auto"},l.createElement(s,{size:"x120",title:t.username,url:h}),l.createElement(m,{fontScale:"h1",withTruncatedText:!0},t.name||t.username),!!t.name&&l.createElement(m,{fontScale:"p1",color:"hint",withTruncatedText:!0},"@",t.username),l.createElement(m,{fontScale:"p1",color:"hint",withTruncatedText:!0},t.status))),l.createElement(S,{isActive:t.active,isAdmin:t.roles.includes("admin"),_id:t._id,username:t.username,onChange:n}),l.createElement(m,{display:"flex",flexDirection:"column",w:"full",backgroundColor:"neutral-200",p:"x16",withTruncatedText:!0,flexShrink:0},l.createElement(d,{blockEnd:"x4"},t.bio&&t.bio.trim().length>0&&l.createElement(v,{withTruncatedText:!0,fontScale:"s1",content:t.bio}),!!t.roles.length&&l.createElement(l.Fragment,null,l.createElement(m,{fontScale:"micro",color:"hint",mbs:"none"},o("Roles")),l.createElement(m,{display:"flex",flexDirection:"row",flexWrap:"wrap"},l.createElement(d,{inlineEnd:"x4",blockEnd:"x4"},t.roles.map((function(e){return l.createElement(E,{pi:"x4",key:e},e)}))))),t.emails&&l.createElement(l.Fragment,null," ",l.createElement(m,{fontScale:"micro",color:"hint"},o("Email")),l.createElement(m,{display:"flex",flexDirection:"row",alignItems:"center"},l.createElement(m,{fontScale:"s1",withTruncatedText:!0},t.emails[0].address),l.createElement(d,{inline:"x4"},t.emails[0].verified&&l.createElement(x,{variant:"primary"},o("Verified")),t.emails[0].verified||l.createElement(x,{disabled:!0},o("Not_verified"))))),l.createElement(m,{fontScale:"micro",color:"hint"},o("Created_at")),l.createElement(m,{fontScale:"s1"},c),l.createElement(m,{fontScale:"micro",color:"hint"},o("Last_login")),l.createElement(m,{fontScale:"s1"},u||o("Never")),!!t.utcOffset&&l.createElement(l.Fragment,null,l.createElement(m,{fontScale:"micro",color:"hint"},o("Timezone")),l.createElement(C,{utcOffset:t.utcOffset,mbe:"none",fontScale:"s1"})))))}}

