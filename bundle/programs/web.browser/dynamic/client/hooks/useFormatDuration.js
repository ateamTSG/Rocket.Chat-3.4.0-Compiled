function module(t,o,n){let c,a;n.export({useFormatDuration:()=>r}),n.link("react",{useCallback(t){c=t}},0),n.link("../contexts/TranslationContext",{useTranslation(t){a=t}},1);const r=()=>{const t=a();return c(o=>{const n=Math.floor(o/86400),c=Math.floor(o%86400/3600),a=Math.floor(o%86400%3600/60),r=Math.floor(o%86400%3600%60);let e="";return n>0&&(e+="".concat(n," ").concat(t("days"),", ")),c>0&&(e+="".concat(c," ").concat(t("hours"),", ")),a>0&&(e+="".concat(a," ").concat(t("minutes"),", ")),r>0&&(e+="".concat(r," ").concat(t("seconds"))),e},[t])}}
