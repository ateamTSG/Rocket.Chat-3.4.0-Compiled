function module(e,o,t){t.export({saveFile:()=>n});const n=function(e){let o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"download";const t=new Blob([e],{type:"text/plain"}),n=document.createElement("a");n.download=o,n.href=(window.webkitURL||window.URL).createObjectURL(t),n.dataset.downloadurl=["text/plain",n.download,n.href].join(":"),n.click()}}

