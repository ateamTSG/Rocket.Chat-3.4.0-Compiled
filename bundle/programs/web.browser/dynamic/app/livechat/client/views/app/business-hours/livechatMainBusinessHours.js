function module(e,s,i){let l,n;i.link("meteor/templating",{Template(e){l=e}},0),i.link("./livechatMainBusinessHours.html"),i.link("./BusinessHours",{businessHourManager(e){n=e}},1),l.livechatMainBusinessHours.helpers({getTemplate:()=>n.getTemplate()})}

