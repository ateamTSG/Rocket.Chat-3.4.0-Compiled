function module(e,t,n){let i,a,r,c,o,l,d,s,p,u;function k(e){let{mid:t,rid:n,blocks:o,appId:p}=e;const k={action:e=>{let{actionId:a,value:r,blockId:c,mid:l=t}=e;u.triggerBlockAction({blockId:c,actionId:a,value:r,mid:l,rid:n,appId:o[0].appId,container:{type:i.MESSAGE,id:l}})},appId:p,rid:n},m=d();return s(()=>{m.current.dispatchEvent(new Event("rendered"))},[]),l.createElement(c.Provider,{value:k},l.createElement("div",{className:"js-block-wrapper",ref:m}),l.createElement(r,{render:a,blocks:o}))}n.export({MessageBlock:()=>k}),n.link("@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionContainer",{UIKitIncomingInteractionContainerType(e){i=e}},0),n.link("@rocket.chat/fuselage-ui-kit",{UiKitMessage(e){a=e},UiKitComponent(e){r=e},kitContext(e){c=e},messageParser(e){o=e}},1),n.link("react",{default(e){l=e},useRef(e){d=e},useEffect(e){s=e}},2),n.link("../../../app/ui-utils/client",{renderMessageBody(e){p=e}},3),n.link("../../../app/ui-message/client/ActionManager",{"*"(e){u=e}},4),o.text=function(){let{text:e,type:t}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return"mrkdwn"!==t?e:l.createElement("span",{dangerouslySetInnerHTML:{__html:p({msg:e})}})},n.exportDefault(k)}
