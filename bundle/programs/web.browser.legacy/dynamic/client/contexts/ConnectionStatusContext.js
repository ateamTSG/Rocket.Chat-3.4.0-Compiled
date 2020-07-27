function module(n,t,e){var o,c;e.export({ConnectionStatusContext:function(){return u},useConnectionStatus:function(){return r}}),e.link("react",{createContext:function(n){o=n},useContext:function(n){c=n}},0);var u=o({connected:!0,retryCount:0,retryTime:0,status:"connected",reconnect:function(){}}),r=function(){return c(u)}}

