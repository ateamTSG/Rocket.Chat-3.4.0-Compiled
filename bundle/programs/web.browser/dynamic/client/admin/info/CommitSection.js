function module(t,e,n){let a,l,c,i;n.export({CommitSection:()=>r}),n.link("react",{default(t){a=t}},0),n.link("../../components/basic/Subtitle",{default(t){l=t}},1),n.link("../../contexts/TranslationContext",{useTranslation(t){c=t}},2),n.link("./DescriptionList",{DescriptionList(t){i=t}},3);const r=a.memo((function t(e){let{info:n}=e;const r=c(),{commit:o={}}=n;return a.createElement(i,{"data-qa":"commit-list",title:a.createElement(l,{"data-qa":"commit-title"},r("Commit"))},a.createElement(i.Entry,{label:r("Hash")},o.hash),a.createElement(i.Entry,{label:r("Date")},o.date),a.createElement(i.Entry,{label:r("Branch")},o.branch),a.createElement(i.Entry,{label:r("Tag")},o.tag),a.createElement(i.Entry,{label:r("Author")},o.author),a.createElement(i.Entry,{label:r("Subject")},o.subject))}))}
