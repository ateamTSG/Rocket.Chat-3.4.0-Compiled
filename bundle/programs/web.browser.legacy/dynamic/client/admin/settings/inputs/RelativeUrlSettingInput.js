function module(e,t,n){var l,a,o,u,i,r,c;function d(e){var t=e._id,n=e.label,d=e.value,f=e.placeholder,s=e.readonly,m=e.autocomplete,g=e.disabled,v=e.hasResetButton,h=e.onChangeValue,k=e.onResetButtonClick,p=r(),C=function(e){h&&h(e.currentTarget.value)};return i.createElement(i.Fragment,null,i.createElement(o.Container,null,i.createElement(l,null,i.createElement(a.Label,{htmlFor:t,title:t},n),v&&i.createElement(c,{"data-qa-reset-setting-id":t,onClick:k}))),i.createElement(u,{"data-qa-setting-id":t,id:t,value:p(d),placeholder:f,disabled:g,readOnly:s,autoComplete:!1===m?"off":void 0,onChange:C}))}n.export({RelativeUrlSettingInput:function(){return d}}),n.link("@rocket.chat/fuselage",{Box:function(e){l=e},Field:function(e){a=e},Flex:function(e){o=e},UrlInput:function(e){u=e}},0),n.link("react",{default:function(e){i=e}},1),n.link("../../../contexts/ServerContext",{useAbsoluteUrl:function(e){r=e}},2),n.link("../ResetSettingButton",{ResetSettingButton:function(e){c=e}},3)}
