function module(e,t,n){let r,i,l,o,a,s,u,c,d,m,p,f,g,h,k,x,E,b,T,_,w,S,C,I,D,M,y,v,U,L,z,R,B,F,G,N,A,O,P,j,H,$,V,W;function q(){const e=o(["\n\t\tcursor: pointer;\n\t\tborder-bottom: 2px solid #F2F3F5 !important;\n\n\t\t&:hover,\n\t\t&:focus {\n\t\t\tbackground: #F7F8FA;\n\t\t}\n\t"]);return q=function(){return e},e}function J(e){const t=D(q());return n=>c.createElement(e,l({className:t,tabIndex:0},n))}function K(e){return t=>{let{msg:n,username:r,replies:o,tcount:a,ts:s}=t,u=i(t,["msg","username","replies","tcount","ts"]);return(c.createElement(e,l({replies:a,participants:o.length,username:r,msg:n,ts:s},u)))}}n.link("@babel/runtime/helpers/objectSpread2",{default(e){r=e}},0),n.link("@babel/runtime/helpers/objectWithoutProperties",{default(e){i=e}},1),n.link("@babel/runtime/helpers/extends",{default(e){l=e}},2),n.link("@babel/runtime/helpers/taggedTemplateLiteral",{default(e){o=e}},3),n.export({withData:()=>ne,normalizeThreadMessage:()=>ie,ThreadList:()=>le}),n.link("meteor/mongo",{Mongo(e){a=e}},0),n.link("meteor/tracker",{Tracker(e){s=e}},1),n.link("underscore.string",{default(e){u=e}},2),n.link("react",{default(e){c=e},useCallback(e){d=e},useMemo(e){m=e},useState(e){p=e},useEffect(e){f=e},useRef(e){g=e}},3),n.link("@rocket.chat/fuselage",{Box(e){h=e},Icon(e){k=e},TextInput(e){x=e},Select(e){E=e},Margins(e){b=e},Callout(e){T=e}},4),n.link("react-window",{FixedSizeList(e){_=e}},5),n.link("react-window-infinite-loader",{default(e){w=e}},6),n.link("@rocket.chat/fuselage-hooks",{useDebouncedValue(e){S=e},useDebouncedState(e){C=e},useResizeObserver(e){I=e}},7),n.link("@rocket.chat/css-in-js",{css(e){D=e}},8),n.link("../../../../client/components/basic/VerticalBar",{default(e){M=e}},9),n.link("../../../../client/contexts/TranslationContext",{useTranslation(e){y=e}},10),n.link("../../../../client/components/basic/RawText",{default(e){v=e}},11),n.link("../../../../client/contexts/RouterContext",{useRoute(e){U=e}},12),n.link("../../../utils/client",{roomTypes(e){L=e}},13),n.link("../../../ui-utils/client",{call(e){z=e},renderMessageBody(e){R=e}},14),n.link("../../../../client/contexts/UserContext",{useUserId(e){B=e}},15),n.link("../../../models/client",{Messages(e){F=e}},16),n.link("../../../../client/hooks/useEndpointDataExperimental",{useEndpointDataExperimental(e){G=e},ENDPOINT_STATES(e){N=e}},17),n.link("../../../ui-utils/client/config",{getConfig(e){A=e}},18),n.link("../../../../client/hooks/useTimeAgo",{useTimeAgo(e){O=e}},19),n.link("./ThreadListMessage",{default(e){P=e},MessageSkeleton(e){j=e}},20),n.link("./hooks/useUserSubscription",{useUserSubscription(e){H=e}},21),n.link("./hooks/useUserRoom",{useUserRoom(e){$=e}},22),n.link("./hooks/useLocalstorage",{useLocalStorage(e){V=e}},23),n.link("../../../../client/contexts/SettingsContext",{useSetting(e){W=e}},24);const Q=c.memo(K(J(P))),X=c.memo(J(j)),Y=parseInt(A("threadsListSize"))||25,Z=e=>{let{msg:t,u:n,replies:i,mentions:l,tcount:o,ts:a,_id:s,tlm:u,attachments:c}=e;return r({},s&&{_id:s},{attachments:c,mentions:l,msg:t,u:n,replies:i,tcount:o,ts:new Date(a),tlm:new Date(u)})},ee={tunread:1,tunreadUser:1,tunreadGroup:1},te={t:1,name:1};function ne(e){return t=>{let{rid:n}=t,o=i(t,["rid"]);const u=$(n,te),h=H(n,ee),k=B(),[x,E]=V("thread-list-type","all"),[b,T]=p(""),[_,w]=p(Y),[I,D]=C([],100),M=g(new a.Collection(null)),y=g(),[v,U]=p({skip:0,count:Y}),L=m(()=>({rid:u._id,count:v.count,offset:v.skip,type:x,text:b}),[u._id,v.skip,v.count,x,b]),{data:z,state:R,error:A}=G("chat.getThreadsList",S(L,400)),O=d((e,t)=>(U({skip:e,count:t-e}),new Promise(e=>{y.current=e})),[]);f(()=>()=>M.current.remove({},()=>{}),[b,x]),f(()=>{R===N.DONE&&z&&z.threads&&(z.threads.forEach(e=>{let{_id:t}=e,n=i(e,["_id"]);M.current.upsert({_id:t},Z(n))}),y.current&&y.current(),w(z.total))},[z,R]),f(()=>{const e=F.find({rid:u._id,tcount:{$exists:!0},_hidden:{$ne:!0}}).observe({added:e=>{let{_id:t}=e,n=i(e,["_id"]);M.current.upsert({_id:t},n)},changed:e=>{let{_id:t}=e,n=i(e,["_id"]);M.current.update({_id:t},n)},removed:e=>{let{_id:t}=e;M.current.remove(t)}});return()=>e.stop()},[u._id]),f(()=>{const e=s.autorun(()=>{const e=r({},"subscribed"===x&&{replies:{$in:[k]}});D(M.current.find(e,{sort:{tlm:-1}}).fetch().map(Z))});return()=>e.stop()},[u._id,x,D,k]);const P=d(e=>{U({skip:0,count:Y}),T(e.currentTarget.value)},[]);return(c.createElement(e,l({},o,{unread:null==h?void 0:h.tunread,unreadUser:null==h?void 0:h.tunreadUser,unreadGroup:null==h?void 0:h.tunreadGroup,userId:k,error:A,threads:I,total:_,loading:R===N.LOADING,loadMoreItems:O,room:u,text:b,setText:P,type:x,setType:E})))}}const re=e=>{e.preventDefault(),e.stopPropagation(),z([!0,"true"].includes(e.currentTarget.dataset.following)?"unfollowMessage":"followMessage",{mid:e.currentTarget.dataset.id})},ie=e=>{let t=l({},e);if(t.msg)return R(t).replace(/<br\s?\\?>/g," ");if(t.attachments){const e=t.attachments.find(e=>e.title||e.description);if(e&&e.description)return u.escapeHTML(e.description);if(e&&e.title)return u.escapeHTML(e.title)}};function le(e){let{total:t=10,threads:n=[],room:r,unread:i=[],unreadUser:o=[],unreadGroup:a=[],type:s,setType:u,loadMoreItems:p,loading:f,onClose:S,error:C,userId:D,text:z,setText:R}=e;const B=W("UI_Use_Real_Name"),F=g(),G=y(),N=U(L.getConfig(r.t).route.name),A=d(e=>{const{id:t}=e.currentTarget.dataset;N.push({tab:"thread",context:t,rid:r._id,name:r.name})},[r._id,r.name]),P=O(),j=m(()=>[["all",G("All")],["following",G("Following")],["unread",G("Unread")]],[]);F.current=n;const H=d(c.memo((function e(t){let{data:n,index:r,style:s}=t;if(!n[r])return c.createElement(X,{style:s});const u=n[r],d=ie(u),{name:m=u.u.username}=u.u;return c.createElement(Q,l({},u,{name:B?m:u.u.username,username:u.u.username,style:s,unread:i.includes(u._id),mention:o.includes(u._id),all:a.includes(u._id),following:u.replies&&u.replies.includes(D),"data-id":u._id,msg:d,t:G,formatDate:P,handleFollowButton:re,onClick:A}))})),[i,o,a,B]),$=d(e=>e<F.current.length,[]),{ref:V,contentBoxSize:{inlineSize:q=378,blockSize:J=750}={}}=I();return c.createElement(M,null,c.createElement(M.Header,null,c.createElement(k,{name:"thread",size:"x20"}),c.createElement(h,{flexShrink:1,flexGrow:1,withTruncatedText:!0,mi:"x8"},c.createElement(v,null,G("Threads"))),c.createElement(M.Close,{onClick:S})),c.createElement(M.Content,{paddingInline:0},c.createElement(h,{display:"flex",flexDirection:"row",p:"x24",borderBlockEndWidth:"x2",borderBlockEndStyle:"solid",borderBlockEndColor:"neutral-200"},c.createElement(h,{display:"flex",flexDirection:"row",flexGrow:1,mi:"neg-x8"},c.createElement(b,{inline:"x8"},c.createElement(x,{placeholder:G("Search_Messages"),value:z,onChange:R,addon:c.createElement(k,{name:"magnifier",size:"x20"})}),c.createElement(E,{flexGrow:0,width:"110px",onChange:u,value:s,options:j})))),c.createElement(h,{flexGrow:1,flexShrink:1,ref:V},C&&c.createElement(T,{mi:"x24",type:"danger"},C.toString()),0===t&&c.createElement(h,{p:"x24"},G("No_Threads")),c.createElement(w,{isItemLoaded:$,itemCount:t,loadMoreItems:f?()=>{}:p},e=>{let{onItemsRendered:r,ref:i}=e;return(c.createElement(_,{height:J,width:q,itemCount:t,itemData:n,itemSize:124,ref:i,minimumBatchSize:Y,onItemsRendered:r},H))}))))}n.exportDefault(ne(le))}
