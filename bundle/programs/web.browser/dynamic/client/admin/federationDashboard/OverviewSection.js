function module(e,t,n){let r,o,a,l,d,i,u;function c(){var e,t,n;const c=l(),[v,s]=i("federation:getOverviewData",[],1e4),E=s===u.LOADING&&a.createElement(o,{variant:"text"})||s===u.ERROR&&a.createElement(r,{color:"danger"},"Error")||(null==v?void 0:null===(e=v.data[0])||void 0===e?void 0:e.value),f=s===u.LOADING&&a.createElement(o,{variant:"text"})||s===u.ERROR&&a.createElement(r,{color:"danger"},"Error")||(null==v?void 0:null===(t=v.data[1])||void 0===t?void 0:t.value),m=s===u.LOADING&&a.createElement(o,{variant:"text"})||s===u.ERROR&&a.createElement(r,{color:"danger"},"Error")||(null==v?void 0:null===(n=v.data[2])||void 0===n?void 0:n.value);return a.createElement(d,{counters:[{count:E,description:c("Number_of_events")},{count:f,description:c("Number_of_federated_users")},{count:m,description:c("Number_of_federated_servers")}]})}n.link("@rocket.chat/fuselage",{Box(e){r=e},Skeleton(e){o=e}},0),n.link("react",{default(e){a=e}},1),n.link("../../contexts/TranslationContext",{useTranslation(e){l=e}},2),n.link("../../components/data/CounterSet",{default(e){d=e}},3),n.link("../../contexts/ServerContext",{usePolledMethodData(e){i=e},AsyncState(e){u=e}},4),n.exportDefault(c)}
