function module(e,t,n){var r,l,a,i,c,o,u,s,m,f,g,d,h,p,E,k,x,v,b,P,S,C,w,y,I;n.link("@babel/runtime/regenerator",{default:function(e){r=e}},0),n.link("@babel/runtime/helpers/objectSpread2",{default:function(e){l=e}},1),n.link("@babel/runtime/helpers/slicedToArray",{default:function(e){a=e}},2),n.link("@babel/runtime/helpers/extends",{default:function(e){i=e}},3),n.link("@babel/runtime/helpers/objectWithoutProperties",{default:function(e){c=e}},4),n.link("@rocket.chat/fuselage",{Box:function(e){o=e},Button:function(e){u=e},ButtonGroup:function(e){s=e},Icon:function(e){m=e},Accordion:function(e){f=e},Skeleton:function(e){g=e},Margins:function(e){d=e},Pagination:function(e){h=e}},0),n.link("@rocket.chat/fuselage-hooks",{useSafely:function(e){p=e}},1),n.link("react",{default:function(e){E=e},useCallback:function(e){k=e},useState:function(e){x=e},useEffect:function(e){v=e}},2),n.link("../../components/basic/Page",{default:function(e){b=e}},3),n.link("../../contexts/RouterContext",{useCurrentRoute:function(e){P=e},useRoute:function(e){S=e}},4),n.link("../../contexts/ServerContext",{useEndpoint:function(e){C=e}},5),n.link("../../contexts/TranslationContext",{useTranslation:function(e){w=e}},6),n.link("../../hooks/useHighlightedCode",{useHighlightedCode:function(e){y=e}},7),n.link("../../hooks/useFormatDateAndTime",{useFormatDateAndTime:function(e){I=e}},8);var T=function(e){var t=e.severity,n=e.timestamp,r=e.caller,l=e.args,a=w();return E.createElement(o,null,E.createElement(o,null,t,": ",n," ",a("Caller"),": ",r),E.createElement(o,{withRichContent:!0,width:"full"},E.createElement("pre",null,E.createElement("code",{dangerouslySetInnerHTML:{__html:y("json",JSON.stringify(l,null,2))}}))))},_=function(e){var t=e.entries,n=e.instanceId,r=e.title,l=e.t,a=c(e,["entries","instanceId","title","t"]);return(E.createElement(f.Item,i({title:r},a),n&&E.createElement(o,null,l("Instance"),": ",n),t.map((function(e,t){var n=e.severity,r=e.timestamp,l=e.caller,a=e.args;return(E.createElement(T,{key:t,severity:n,timestamp:r,caller:l,args:a}))}))))},A=function(){return E.createElement(o,{maxWidth:"x600",w:"full",alignSelf:"center"},E.createElement(d,{block:"x2"},E.createElement(g,{variant:"rect",width:"100%",height:"x80"}),E.createElement(g,{variant:"rect",width:"100%",height:"x80"}),E.createElement(g,{variant:"rect",width:"100%",height:"x80"})))},R=function(e){var t=e.id,n=e.current,i=e.itemsPerPage,c=p(x({})),o=a(c,2),u=o[0],s=o[1],m=C("GET","/apps/"+t),f=C("GET","/apps/"+t+"/logs"),g=k(function(){function e(){var e,t,n,i;return r.async(function(){function c(c){for(;;)switch(c.prev=c.next){case 0:return c.prev=0,c.next=3,r.awrap(Promise.all([m(),f()]));case 3:e=c.sent,t=a(e,2),n=t[0].app,i=t[1].logs,s(l({},n,{logs:i})),c.next=13;break;case 10:c.prev=10,c.t0=c.catch(0),s({error:c.t0});case 13:case"end":return c.stop()}}return c}(),null,null,[[0,10]],Promise)}return e}(),[m,f,s]);v((function(){g()}),[g]);var d=u.logs&&n>u.logs.length?0:n,h=u.logs?u.logs.length:0,E;return[u.logs?l({},u,{logs:u.logs.slice(d,i+n)}):u,h,g]};function j(e){var t=e.id,n=c(e,["id"]),r=w(),l=I(),g=x(25),d=a(g,2),p=d[0],v=d[1],C=x(0),y=a(C,2),T=y[0],j=y[1],B=R({id:t,itemsPerPage:p,current:T}),D=a(B,3),H=D[0],L=D[1],W=D[2],F=P(),G,M=a(F,1)[0],O=S(M),J=function(){W()},N=function(){O.push()},V=!Object.values(H).length,q=!V&&!H.error,z=k((function(e){var t=e.count,n=e.current,l=e.itemsPerPage;return r("Showing results %s - %s of %s",n+1,Math.min(n+l,t),t)}),[r]),K=k((function(){return r("Items_per_page:")}),[r]);return E.createElement(b,i({flexDirection:"column"},n),E.createElement(b.Header,{title:r("View_the_Logs_for",{name:H.name||""})},E.createElement(s,null,E.createElement(u,{primary:!0,onClick:J},E.createElement(m,{name:"undo"})," ",r("Refresh")),E.createElement(u,{onClick:N},E.createElement(m,{name:"back"})," ",r("Back")))),E.createElement(b.ScrollableContent,null,V&&E.createElement(A,null),H.error&&E.createElement(o,{maxWidth:"x600",alignSelf:"center",fontScale:"h1"},H.error.message),q&&E.createElement(E.Fragment,null,E.createElement(f,{maxWidth:"x600",alignSelf:"center"},H.logs&&H.logs.map((function(e){return E.createElement(_,{key:e._createdAt,title:l(e._createdAt)+': "'+e.method+'" ('+e.totalTime+"ms)",instanceId:e.instanceId,entries:e.entries,t:r})}))))),E.createElement(h,{mi:"x24",divider:!0,current:T,itemsPerPage:p,itemsPerPageLabel:K,showingResultsLabel:z,count:L,onSetItemsPerPage:v,onSetCurrent:j}))}n.exportDefault(j)}
