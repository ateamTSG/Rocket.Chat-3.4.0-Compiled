function module(e,t,l){let n,a,o,r,u,i;function d(e){let{_id:t,label:l,value:d,placeholder:c,readonly:s,autocomplete:m,disabled:g,hasResetButton:h,onChangeValue:p,onResetButtonClick:E}=e;const f=e=>{p&&p(e.currentTarget.value)};return(u.createElement(u.Fragment,null,u.createElement(o.Container,null,u.createElement(n,null,u.createElement(a.Label,{htmlFor:t,title:t},l),h&&u.createElement(i,{"data-qa-reset-setting-id":t,onClick:E}))),u.createElement(a.Row,null,u.createElement(r,{"data-qa-setting-id":t,id:t,value:d,placeholder:c,disabled:g,readOnly:s,autoComplete:!1===m?"off":void 0,onChange:f}))))}l.export({PasswordSettingInput:()=>d}),l.link("@rocket.chat/fuselage",{Box(e){n=e},Field(e){a=e},Flex(e){o=e},PasswordInput(e){r=e}},0),l.link("react",{default(e){u=e}},1),l.link("../ResetSettingButton",{ResetSettingButton(e){i=e}},2)}

