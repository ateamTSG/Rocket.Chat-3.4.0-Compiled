function module(e,s,t){let n,o,u,l;t.export({SessionContext:()=>a,useSession:()=>r,useSessionDispatch:()=>c}),t.link("react",{createContext(e){n=e},useCallback(e){o=e},useContext(e){u=e}},0),t.link("../hooks/useObservableValue",{useObservableValue(e){l=e}},1);const a=n({get:()=>{},set:()=>{}}),r=e=>{const{get:s}=u(a);return l(t=>s(e,t))},c=e=>{const{set:s}=u(a);return o(t=>s(e,t),[s,e])}}

