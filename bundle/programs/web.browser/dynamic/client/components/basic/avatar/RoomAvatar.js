function module(e,t,l){let r,a,n,o,i,u;function p(e){let{room:{type:t}}=e,l=n(e.room,["type"]),p=n(e,["room"]);const c=u.getConfig(t).getAvatarPath(a({type:t},l));return(o.createElement(i,r({url:c,title:c},p)))}l.link("@babel/runtime/helpers/extends",{default(e){r=e}},0),l.link("@babel/runtime/helpers/objectSpread2",{default(e){a=e}},1),l.link("@babel/runtime/helpers/objectWithoutProperties",{default(e){n=e}},2),l.link("react",{default(e){o=e}},0),l.link("@rocket.chat/fuselage",{Avatar(e){i=e}},1),l.link("../../../../app/utils/client",{roomTypes(e){u=e}},2),l.exportDefault(p)}

