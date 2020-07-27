function module(e,i,n){let s,l;n.export({useUserSubscription:()=>t}),n.link("../../../../../client/hooks/useReactiveValue",{useReactiveValue(e){s=e}},0),n.link("../../../../models/client",{Subscriptions(e){l=e}},1);const t=(e,i)=>s(()=>l.findOne({rid:e},{fields:i}),[e,i])}

