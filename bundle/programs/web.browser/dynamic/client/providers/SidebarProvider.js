function module(e,t,n){let i,l,o,r;n.export({SidebarProvider:()=>a}),n.link("react",{default(e){i=e}},0),n.link("../../app/ui-utils/client",{menu(e){l=e}},1),n.link("../contexts/SidebarContext",{SidebarContext(e){o=e}},2),n.link("../hooks/useReactiveValue",{useReactiveValue(e){r=e}},3);const c=()=>l.isOpen(),u=e=>e?l.open():l.close();function a(e){let{children:t}=e;const n=[r(c,[]),u];return(i.createElement(o.Provider,{children:t,value:n}))}}

