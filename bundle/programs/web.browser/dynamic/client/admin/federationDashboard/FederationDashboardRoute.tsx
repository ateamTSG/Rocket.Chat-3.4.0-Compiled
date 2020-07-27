function module(e,t,n){let l,a,o,u;n.link("react",{default(e){l=e}},0),n.link("../../contexts/AuthorizationContext",{useRole(e){a=e}},1),n.link("../NotAuthorizedPage",{default(e){o=e}},2),n.link("./FederationDashboardPage",{default(e){u=e}},3);const i=()=>{const e=a("admin");return e?l.createElement(u,null):l.createElement(o,null)};n.exportDefault(i)}

