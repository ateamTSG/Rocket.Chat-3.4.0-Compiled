function module(t,e,n){let o,c;n.export({ConnectionStatusContext:()=>r,useConnectionStatus:()=>u}),n.link("react",{createContext(t){o=t},useContext(t){c=t}},0);const r=o({connected:!0,retryCount:0,retryTime:0,status:"connected",reconnect:()=>{}}),u=()=>c(r)}

