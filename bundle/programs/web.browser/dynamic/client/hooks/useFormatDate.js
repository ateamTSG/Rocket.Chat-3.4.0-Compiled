function module(t,e,n){let o,a,s;n.export({useFormatDate:()=>l}),n.link("react",{useCallback(t){o=t}},0),n.link("moment",{default(t){a=t}},1),n.link("../contexts/SettingsContext",{useSetting(t){s=t}},2);const l=()=>{const t=s("Message_DateFormat");return o(e=>a(e).format(t),[t])}}

