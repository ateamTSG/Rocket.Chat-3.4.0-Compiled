function module(e,n,t){var o,r,u,s,i,l,a,c,f,d,m,p,k,x,h;function b(e){var n=e.roles,t=u(e,["roles"]),b=d(),w=k("admin-users"),E=m("roles.list","")||{},v=x({roles:[],name:"",username:"",statusText:"",bio:"",email:"",password:"",verified:!1,requirePasswordChange:!1,setRandomPassword:!1,sendWelcomeEmail:!0,joinDefaultChannels:!0,customFields:{}}),C=v.values,g=v.handlers,y=v.reset,F=v.hasUnsavedChanges,P=l((function(e){return w.push({context:"info",id:e})}),[w]),R=i((function(){return C}),[JSON.stringify(C)]),D=p("POST","users.create",R,b("User_created_successfully")),T=l(function(){function e(){var e;return r.async(function(){function n(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,r.awrap(D());case 2:(e=n.sent).success&&P(e.user._id);case 4:case"end":return n.stop()}}return n}(),null,null,null,Promise)}return e}(),[P,D]),U=i((function(){return E&&E.roles?E.roles.map((function(e){var n=e._id,t;return[n,e.description||n]})):[]}),[E]),_=i((function(){return s.createElement(a,null,s.createElement(a.Row,null,s.createElement(c,{display:"flex",flexDirection:"row",justifyContent:"space-between",w:"full"},s.createElement(f,{flexGrow:1,disabled:!F,onClick:y,mie:"x4"},b("Cancel")),s.createElement(f,{flexGrow:1,disabled:!F,onClick:T},b("Save")))))}),[F,y,b,T]);return s.createElement(h,o({formValues:C,formHandlers:g,availableRoles:U,append:_},t))}t.link("@babel/runtime/helpers/extends",{default:function(e){o=e}},0),t.link("@babel/runtime/regenerator",{default:function(e){r=e}},1),t.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){u=e}},2),t.export({AddUser:function(){return b}}),t.link("react",{default:function(e){s=e},useMemo:function(e){i=e},useCallback:function(e){l=e}},0),t.link("@rocket.chat/fuselage",{Field:function(e){a=e},Box:function(e){c=e},Button:function(e){f=e}},1),t.link("../../contexts/TranslationContext",{useTranslation:function(e){d=e}},2),t.link("../../hooks/useEndpointData",{useEndpointData:function(e){m=e}},3),t.link("../../hooks/useEndpointAction",{useEndpointAction:function(e){p=e}},4),t.link("../../contexts/RouterContext",{useRoute:function(e){k=e}},5),t.link("../../hooks/useForm",{useForm:function(e){x=e}},6),t.link("./UserForm",{default:function(e){h=e}},7)}
