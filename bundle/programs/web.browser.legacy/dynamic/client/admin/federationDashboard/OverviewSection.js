function module(e,t,n){var o,r,a,l,i,u,c,d;function v(){var e,t,n,v=i(),f=c("federation:getOverviewData",[],1e4),s=o(f,2),m=s[0],E=s[1],x=E===d.LOADING&&l.createElement(a,{variant:"text"})||E===d.ERROR&&l.createElement(r,{color:"danger"},"Error")||(null==m?void 0:null===(e=m.data[0])||void 0===e?void 0:e.value),R=E===d.LOADING&&l.createElement(a,{variant:"text"})||E===d.ERROR&&l.createElement(r,{color:"danger"},"Error")||(null==m?void 0:null===(t=m.data[1])||void 0===t?void 0:t.value),k=E===d.LOADING&&l.createElement(a,{variant:"text"})||E===d.ERROR&&l.createElement(r,{color:"danger"},"Error")||(null==m?void 0:null===(n=m.data[2])||void 0===n?void 0:n.value);return l.createElement(u,{counters:[{count:x,description:v("Number_of_events")},{count:R,description:v("Number_of_federated_users")},{count:k,description:v("Number_of_federated_servers")}]})}n.link("@babel/runtime/helpers/slicedToArray",{default:function(e){o=e}},0),n.link("@rocket.chat/fuselage",{Box:function(e){r=e},Skeleton:function(e){a=e}},0),n.link("react",{default:function(e){l=e}},1),n.link("../../contexts/TranslationContext",{useTranslation:function(e){i=e}},2),n.link("../../components/data/CounterSet",{default:function(e){u=e}},3),n.link("../../contexts/ServerContext",{usePolledMethodData:function(e){c=e},AsyncState:function(e){d=e}},4),n.exportDefault(v)}
