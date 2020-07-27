function module(e,t,n){let u,o;n.export({useObservableValue:()=>c}),n.link("react",{useEffect(e){u=e},useState(e){o=e}},0);const c=e=>{const[t,n]=o(()=>e());return u(()=>{let t=!0;const u=e(e=>{t&&n(e)});return()=>{t=!1,"function"==typeof u&&u()}},[e]),t}}

