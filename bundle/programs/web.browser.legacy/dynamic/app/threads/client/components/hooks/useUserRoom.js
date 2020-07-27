function module(n,e,i){var o,u;i.export({useUserRoom:function(){return t}}),i.link("../../../../../client/hooks/useReactiveValue",{useReactiveValue:function(n){o=n}},0),i.link("../../../../models/client",{Rooms:function(n){u=n}},1);var t=function(n,e){return o((function(){return u.findOne({_id:n},{fields:e})}),[n,e])}}

