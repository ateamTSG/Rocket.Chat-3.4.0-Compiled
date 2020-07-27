function module(e,l,a){let n,t;a.export({useTimeAgo:()=>d}),a.link("react",{useCallback(e){n=e}},0),a.link("moment",{default(e){t=e}},1);const d=()=>n(e=>t(e).calendar(null,{sameDay:"LT",lastWeek:"dddd LT",sameElse:"LL"}),[])}

