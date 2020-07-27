function module(e,t,n){var r,o,a,i,u,s,c,l,p,f,m,d,g,x,k,v,h,E,b,C;function S(){var e=g(),t=v(),n=C(),S=s(p(null)),_=o(S,2),y=_[0],w=_[1],I=s(p("Loading...")),T=o(I,2),D=T[0],L=T[1],P=s(p(0)),M=o(P,2),R=M[0],F=M[1],H=s(p(0)),O=o(H,2),U=O[0],j=O[1],A=h("GET","getCurrentImportOperation"),B=h("GET","getImportProgress"),G=E("admin-import"),N=E("admin-import-prepare");l((function(){var t;(function(){function t(){var t,o;return r.async(function(){function a(a){for(;;)switch(a.prev=a.next){case 0:return a.prev=0,a.next=3,r.awrap(A());case 3:if(t=a.sent,(o=t.operation).valid){a.next=8;break}return G.push(),a.abrupt("return");case 8:if(k.includes(o.status)){a.next=11;break}return N.push(),a.abrupt("return");case 11:w(o.importerKey),F(o.count.completed),j(o.count.total),a.next=20;break;case 16:a.prev=16,a.t0=a.catch(0),n(a.t0,e("Failed_To_Load_Import_Data")),G.push();case 20:case"end":return a.stop()}}return a}(),null,null,[[0,16]],Promise)}return t})()()}),[A,n,G,N,F,w,j,e]),l((function(){if(y){var o=function(r){var o=r.key,a=r.step,i=r.count,u=(i=void 0===i?{}:i).completed,s=void 0===u?0:u,c=i.total,l=void 0===c?0:c;if(o.toLowerCase()===y)switch(a){case x.DONE:return t({type:"success",message:e(a[0].toUpperCase()+a.slice(1))}),void G.push();case x.ERROR:case x.CANCELLED:return n(e(a[0].toUpperCase()+a.slice(1))),void G.push();default:L(a),F(s),j(l)}},a=new d.Streamer("importers"),i;return function(){function i(){var i;return r.async(function(){function u(u){for(;;)switch(u.prev=u.next){case 0:return u.prev=0,u.next=3,r.awrap(B());case 3:if(i=u.sent){u.next=8;break}return t({type:"warning",message:e("Importer_not_in_progress")}),N.push(),u.abrupt("return");case 8:a.on("progress",o),o(i),u.next=16;break;case 12:u.prev=12,u.t0=u.catch(0),n(u.t0,e("Failed_To_Load_Import_Data")),G.push();case 16:case"end":return u.stop()}}return u}(),null,null,[[0,12]],Promise)}return i}()(),function(){a.removeListener("progress",o)}}}),[t,B,n,G,y,N,F,L,j,e]);var W=f((function(){return 0===U?null:R/U*100}),[R,U]);return(c.createElement(b,null,c.createElement(b.Header,{title:e("Importing_Data")}),c.createElement(b.ScrollableContentWithShadow,null,c.createElement(a,{marginInline:"auto",marginBlock:"neg-x24",width:"full",maxWidth:"x580"},c.createElement(i,{block:"x24"},c.createElement(a,{is:"p",fontScale:"p1"},e(D[0].toUpperCase()+D.slice(1))),W?c.createElement(a,{display:"flex",justifyContent:"center"},c.createElement(a,{is:"progress",value:R,max:U,marginInlineEnd:"x24"}),c.createElement(a,{is:"span",fontScale:"p1"},R,"/",U," (",m.numberFormat(W,0),"%)")):c.createElement(u,{justifyContent:"center"}))))))}n.link("@babel/runtime/regenerator",{default:function(e){r=e}},0),n.link("@babel/runtime/helpers/slicedToArray",{default:function(e){o=e}},1),n.link("@rocket.chat/fuselage",{Box:function(e){a=e},Margins:function(e){i=e},Throbber:function(e){u=e}},0),n.link("@rocket.chat/fuselage-hooks",{useSafely:function(e){s=e}},1),n.link("react",{default:function(e){c=e},useEffect:function(e){l=e},useState:function(e){p=e},useMemo:function(e){f=e}},2),n.link("underscore.string",{default:function(e){m=e}},3),n.link("meteor/meteor",{Meteor:function(e){d=e}},4),n.link("../../contexts/TranslationContext",{useTranslation:function(e){g=e}},5),n.link("../../../app/importer/lib/ImporterProgressStep",{ProgressStep:function(e){x=e},ImportingStartedStates:function(e){k=e}},6),n.link("../../contexts/ToastMessagesContext",{useToastMessageDispatch:function(e){v=e}},7),n.link("../../contexts/ServerContext",{useEndpoint:function(e){h=e}},8),n.link("../../contexts/RouterContext",{useRoute:function(e){E=e}},9),n.link("../../components/basic/Page",{default:function(e){b=e}},10),n.link("./useErrorHandler",{useErrorHandler:function(e){C=e}},11),n.exportDefault(S)}

