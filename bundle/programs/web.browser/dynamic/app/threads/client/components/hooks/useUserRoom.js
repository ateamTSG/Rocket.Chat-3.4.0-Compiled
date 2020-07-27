function module(e,o,i){let l,n;i.export({useUserRoom:()=>s}),i.link("../../../../../client/hooks/useReactiveValue",{useReactiveValue(e){l=e}},0),i.link("../../../../models/client",{Rooms(e){n=e}},1);const s=(e,o)=>l(()=>n.findOne({_id:e},{fields:o}),[e,o])}

