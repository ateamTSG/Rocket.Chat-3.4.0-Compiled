function module(){Template.__checkName("livechatCustomFieldForm"),Template.livechatCustomFieldForm=new Template("Template.livechatCustomFieldForm",(function(){var t=this;return Blaze._TemplateWith((function(){return"view-livechat-customfields"}),(function(){return Spacebars.include(t.lookupTemplate("requiresPermission"),(function(){return["\n\t\t",HTML.FORM({id:"customField-form","data-id":function(){return Spacebars.mustache(Spacebars.dot(t.lookup("customField"),"_id"))}},"\n\t\t\t",HTML.DIV({class:"rocket-form"},"\n\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.templateInstance().subscriptionsReady())}),(function(){return["\n\t\t\t\t\t",HTML.FIELDSET("\n\t\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t\t",HTML.LABEL(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Field")}))),"\n\t\t\t\t\t\t\t",HTML.DIV("\n\t\t\t\t\t\t\t\t",HTML.INPUT({type:"text",class:"rc-input__element custom-field-input",name:"field",value:function(){return Spacebars.mustache(Spacebars.dot(t.lookup("customField"),"_id"))},readonly:function(){return Spacebars.mustache(t.lookup("$exists"),Spacebars.dot(t.lookup("customField"),"_id"))},placeholder:function(){return Spacebars.mustache(t.lookup("_"),"Field")}}),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t\t",HTML.LABEL(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Label")}))),"\n\t\t\t\t\t\t\t",HTML.DIV("\n\t\t\t\t\t\t\t\t",HTML.INPUT({type:"text",class:"rc-input__element custom-field-input",name:"label",value:function(){return Spacebars.mustache(Spacebars.dot(t.lookup("customField"),"label"))},placeholder:function(){return Spacebars.mustache(t.lookup("_"),"Label")}}),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t\t",HTML.LABEL(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Scope")}))),"\n\t\t\t\t\t\t\t",HTML.DIV("\n\t\t\t\t\t\t\t\t",HTML.SELECT({name:"scope",class:"rc-input__element custom-field-input"},"\n\t\t\t\t\t\t\t\t\t",HTML.OPTION({value:"visitor",selected:function(){return Spacebars.mustache(t.lookup("$eq"),Spacebars.dot(t.lookup("customField"),"scope"),"visitor")}},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Visitor")}))),"\n\t\t\t\t\t\t\t\t\t",HTML.OPTION({value:"room",selected:function(){return Spacebars.mustache(t.lookup("$eq"),Spacebars.dot(t.lookup("customField"),"scope"),"room")}},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Room")}))),"\n\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t\t",HTML.LABEL(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Visibility")}))),"\n\t\t\t\t\t\t\t",HTML.DIV("\n\t\t\t\t\t\t\t\t",HTML.SELECT({name:"visibility",class:"rc-input__element custom-field-input"},"\n\t\t\t\t\t\t\t\t\t",HTML.OPTION({value:"visible",selected:function(){return Spacebars.mustache(t.lookup("$eq"),Spacebars.dot(t.lookup("customField"),"visibility"),"visible")}},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Visible")}))),"\n\t\t\t\t\t\t\t\t\t",HTML.OPTION({value:"hidden",selected:function(){return Spacebars.mustache(t.lookup("$eq"),Spacebars.dot(t.lookup("customField"),"visibility"),"hidden")}},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Hidden")}))),"\n\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.DIV({class:"input-line"},"\n\t\t\t\t\t\t\t",HTML.LABEL(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Validation")}))),"\n\t\t\t\t\t\t\t",HTML.DIV("\n\t\t\t\t\t\t\t\t",HTML.INPUT({type:"text",class:"rc-input__element custom-field-input",name:"regexp",value:function(){return Spacebars.mustache(Spacebars.dot(t.lookup("customField"),"regexp"))},placeholder:function(){return Spacebars.mustache(t.lookup("_"),"Regexp_validation")}}),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("customFieldsTemplate"))}),(function(){return["\n\t\t\t\t\t\t\t",Blaze._TemplateWith((function(){return{template:Spacebars.call(t.lookup("customFieldsTemplate")),data:Spacebars.call(t.lookup("dataContext"))}}),(function(){return Spacebars.include((function(){return Spacebars.call(Template.__dynamic)}))})),"\n\t\t\t\t\t\t"]})),"\n\t\t\t\t\t"),"\n\t\t\t\t\t",HTML.DIV({class:"rc-button__group submit"},"\n\t\t\t\t\t\t",HTML.BUTTON({class:"rc-button back",type:"button"},HTML.I({class:"icon-left-big"}),HTML.SPAN(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Back")})))),"\n\t\t\t\t\t\t",HTML.BUTTON({class:"rc-button rc-button--primary save"},HTML.I({class:"icon-floppy"}),HTML.SPAN(Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Save")})))),"\n\t\t\t\t\t"),"\n\t\t\t\t"]}),(function(){return["\n\t\t\t\t\t",Spacebars.include(t.lookupTemplate("loading")),"\n\t\t\t\t"]})),"\n\t\t\t"),"\n\t\t"),"\n\t"]}))}))}))}

