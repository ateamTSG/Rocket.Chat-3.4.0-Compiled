function module(e,n,o){o.export({saveFile:function(){return t}});var t=function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"download",o=new Blob([e],{type:"text/plain"}),t=document.createElement("a");t.download=n,t.href=(window.webkitURL||window.URL).createObjectURL(o),t.dataset.downloadurl=["text/plain",t.download,t.href].join(":"),t.click()}}

