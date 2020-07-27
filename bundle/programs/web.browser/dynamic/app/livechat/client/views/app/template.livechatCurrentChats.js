function module(){Template.__checkName("livechatCurrentChats"),Template.livechatCurrentChats=new Template("Template.livechatCurrentChats",(function(){var t=this;return Blaze._TemplateWith((function(){return"view-livechat-current-chats"}),(function(){return Spacebars.include(t.lookupTemplate("requiresPermission"),(function(){return["\n\t\t",HTML.FIELDSET("\n\t\t\t",HTML.FORM({class:"form-inline",id:"form-filters",method:"post"},"\n\t\t\t\t",HTML.DIV({class:"livechat-group-filters-wrapper"},"\n\t\t\t\t\t",HTML.DIV({class:"livechat-group-filters-container"},"\n\t\t\t\t\t\t",HTML.DIV({class:"livechat-current-chats-standard-filters"},"\n\t\t\t\t\t\t\t",HTML.DIV({class:"form-group"},"\n\t\t\t\t\t\t\t\t",HTML.LABEL({class:"rc-input__label"},"\n\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-input__title"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Guest")}))),"\n\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-input__wrapper"},"\n\t\t\t\t\t\t\t\t\t\t",HTML.INPUT({type:"text",placeholder:function(){return Spacebars.mustache(t.lookup("_"),"Name")},class:"rc-input__element",id:"name",name:"name"}),"\n\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t",HTML.DIV({class:"form-group"},"\n\t\t\t\t\t\t\t\t",Blaze._TemplateWith((function(){return{onClickTag:Spacebars.call(t.lookup("onClickTagAgent")),list:Spacebars.call(t.lookup("selectedAgents")),onSelect:Spacebars.call(t.lookup("onSelectAgents")),collection:Spacebars.call("UserAndRoom"),endpoint:Spacebars.call("users.autocomplete"),field:Spacebars.call("username"),sort:Spacebars.call("username"),label:Spacebars.call("Served_By"),placeholder:Spacebars.call("Served_By"),name:Spacebars.call("agent"),icon:Spacebars.call("at"),noMatchTemplate:Spacebars.call("userSearchEmpty"),templateItem:Spacebars.call("popupList_item_default"),modifier:Spacebars.call(t.lookup("agentModifier")),showLabel:Spacebars.call(!0)}}),(function(){return Spacebars.include(t.lookupTemplate("livechatAutocompleteUser"))})),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t",HTML.DIV({class:"form-group"},"\n\t\t\t\t\t\t\t\t",HTML.LABEL({class:"rc-input__label"},"\n\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-input__title"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Status")}))),"\n\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-select"},"\n\t\t\t\t\t\t\t\t\t\t",HTML.SELECT({class:"rc-select__element",id:"status",name:"status"},"\n\t\t\t\t\t\t\t\t\t\t\t",HTML.OPTION({class:"rc-select__option",value:""},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"All")}))),"\n\t\t\t\t\t\t\t\t\t\t\t",HTML.OPTION({class:"rc-select__option",value:"opened"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Opened")}))),"\n\t\t\t\t\t\t\t\t\t\t\t",HTML.OPTION({class:"rc-select__option",value:"closed"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Closed")}))),"\n\t\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t\t\t",Blaze._TemplateWith((function(){return{block:Spacebars.call("rc-select__arrow"),icon:Spacebars.call("arrow-down")}}),(function(){return Spacebars.include(t.lookupTemplate("icon"))})),"\n\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t",HTML.DIV({class:"form-group"},"\n\t\t\t\t\t\t\t\t",Blaze._TemplateWith((function(){return{onClickTag:Spacebars.call(t.lookup("onClickTagDepartment")),list:Spacebars.call(t.lookup("selectedDepartments")),onSelect:Spacebars.call(t.lookup("onSelectDepartments")),collection:Spacebars.call("CachedDepartmentList"),endpoint:Spacebars.call("livechat/department.autocomplete"),field:Spacebars.call("name"),sort:Spacebars.call("name"),label:Spacebars.call("Department"),placeholder:Spacebars.call("Enter_a_department_name"),name:Spacebars.call("department"),icon:Spacebars.call("queue"),noMatchTemplate:Spacebars.call("roomSearchEmpty"),templateItem:Spacebars.call("popupList_item_channel"),template:Spacebars.call("roomSearch"),modifier:Spacebars.call(t.lookup("departmentModifier")),showLabel:Spacebars.call(!0)}}),(function(){return Spacebars.include(t.lookupTemplate("livechatAutocompleteUser"))})),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t",HTML.DIV({class:"form-group input-daterange"},"\n\t\t\t\t\t\t\t\t",HTML.LABEL({class:"rc-input__label"},"\n\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-input__title"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"From")}))),"\n\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-input__wrapper"},"\n\t\t\t\t\t\t\t\t\t\t",HTML.INPUT({autocomplete:"off",type:"text",placeholder:function(){return Spacebars.mustache(t.lookup("_"),"Date_From")},class:"rc-input__element",id:"from",name:"from"}),"\n\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t",HTML.LABEL({class:"rc-input__label"},"\n\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-input__title"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"To")}))),"\n\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-input__wrapper"},"\n\t\t\t\t\t\t\t\t\t\t",HTML.INPUT({autocomplete:"off",type:"text",placeholder:function(){return Spacebars.mustache(t.lookup("_"),"Date_to")},class:"rc-input__element",id:"to",name:"to"}),"\n\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t"),"\n\n\t\t\t\t\t\t\t",HTML.DIV({class:"form-group"},"\n\t\t\t\t\t\t\t\t",HTML.BUTTON({type:"button",class:"rc-button rc-button--secondary add-filter-button livechat-current-chats-add-filter-button"},Blaze._TemplateWith((function(){return{icon:Spacebars.call("plus")}}),(function(){return Spacebars.include(t.lookupTemplate("icon"))}))),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t"),"\n\n\t\t\t\t\t\t",HTML.DIV({class:"livechat-current-chats-custom-filters"},"\n\t\t\t\t\t\t\t",Blaze.Each((function(){return Spacebars.call(t.lookup("customFilters"))}),(function(){return["\n\t\t\t\t\t\t\t\t",HTML.DIV({class:"form-group"},"\n\t\t\t\t\t\t\t\t\t",HTML.LABEL({class:"rc-input__label"},"\n\t\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-input__title"},Blaze.View("lookup:label",(function(){return Spacebars.mustache(t.lookup("label"))}))),"\n\t\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-input__wrapper"},"\n\t\t\t\t\t\t\t\t\t\t\t",HTML.INPUT({autocomplete:"off",type:"text",placeholder:function(){return Spacebars.mustache(t.lookup("label"))},class:"rc-input__element",name:function(){return["custom-field-",Spacebars.mustache(t.lookup("name"))]}}),"\n\t\t\t\t\t\t\t\t\t\t\t",HTML.A({href:"#remove",class:"remove-livechat-custom-filter","data-name":function(){return Spacebars.mustache(t.lookup("name"))}},HTML.I({class:"icon-trash"})),"\n\t\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t"]})),"\n\t\t\t\t\t\t\t",Blaze.Each((function(){return Spacebars.call(t.lookup("tagFilters"))}),(function(){return["\n\t\t\t\t\t\t\t\t",HTML.DIV({class:"form-group"},"\n\t\t\t\t\t\t\t\t\t",HTML.LABEL({class:"rc-input__label"},"\n\t\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-input__title"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Tags")}))),"\n\t\t\t\t\t\t\t\t\t\t",HTML.SPAN({class:"livechat-current-chats-tag-filter-wrapper"},"\n\t\t\t\t\t\t\t\t\t\t\t",Spacebars.include(t.lookupTemplate("livechatRoomTagSelector")),"\n\t\t\t\t\t\t\t\t\t\t\t",HTML.A({href:"#remove",class:"remove-livechat-tags-filter","data-id":function(){return Spacebars.mustache(t.lookup("tagId"))}},HTML.I({class:"icon-trash"})),"\n\t\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t"]})),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"),"\n\n\t\t\t\t\t",HTML.DIV({class:"livechat-group-filters-buttons"},"\n\t\t\t\t\t\t",HTML.DIV({class:"rc-button__group"},"\n\t\t\t\t\t\t\t",HTML.BUTTON({class:"rc-button rc-button--primary"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Filter")}))),"\n\t\t\t\t\t\t\t",HTML.BUTTON({class:"livechat-current-chats-extra-actions"},"\n\t\t\t\t\t\t\t\t",Blaze._TemplateWith((function(){return{icon:Spacebars.call("menu"),block:Spacebars.call("rc-icon--default-size")}}),(function(){return Spacebars.include(t.lookupTemplate("icon"))})),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"),"\n\t\t\t\t"),"\n\t\t\t"),"\n\t\t"),"\n\t\t",HTML.DIV({class:"rc-table-content"},"\n\t\t\t",Blaze._TemplateWith((function(){return{fixed:Spacebars.call("true"),onScroll:Spacebars.call(t.lookup("onTableScroll")),onResize:Spacebars.call(t.lookup("onTableResize")),onSort:Spacebars.call(t.lookup("onTableSort"))}}),(function(){return Spacebars.include(t.lookupTemplate("table"),(function(){return["\n\t\t\t\t",HTML.THEAD("\n\t\t\t\t\t",HTML.TR("\n\t\t\t\t\t\t",HTML.TH({class:function(){return["js-sort ",Blaze.If((function(){return Spacebars.dataMustache(t.lookup("sortBy"),"fname")}),(function(){return"is-sorting"}))]},"data-sort":"fname",width:"25%"},"\n\t\t\t\t\t\t\t",HTML.DIV({class:"table-fake-th"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Name")})),Blaze._TemplateWith((function(){return{icon:Spacebars.call(Spacebars.dataMustache(t.lookup("sortIcon"),"fname"))}}),(function(){return Spacebars.include(t.lookupTemplate("icon"))}))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.TH({class:function(){return["js-sort ",Blaze.If((function(){return Spacebars.dataMustache(t.lookup("sortBy"),"departmentId")}),(function(){return"is-sorting"}))]},"data-sort":"departmentId",width:"15%"},"\n\t\t\t\t\t\t\t",HTML.DIV({class:"table-fake-th"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Department")})),Blaze._TemplateWith((function(){return{icon:Spacebars.call(Spacebars.dataMustache(t.lookup("sortIcon"),"departmentId"))}}),(function(){return Spacebars.include(t.lookupTemplate("icon"))}))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.TH({class:function(){return["js-sort ",Blaze.If((function(){return Spacebars.dataMustache(t.lookup("sortBy"),"servedBy.username")}),(function(){return"is-sorting"}))]},"data-sort":"servedBy.username",width:"15%"},"\n\t\t\t\t\t\t\t",HTML.DIV({class:"table-fake-th"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Served_By")})),Blaze._TemplateWith((function(){return{icon:Spacebars.call(Spacebars.dataMustache(t.lookup("sortIcon"),"servedBy.username"))}}),(function(){return Spacebars.include(t.lookupTemplate("icon"))}))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.TH({class:function(){return["js-sort ",Blaze.If((function(){return Spacebars.dataMustache(t.lookup("sortBy"),"ts")}),(function(){return"is-sorting"}))]},"data-sort":"ts",width:"15%"},"\n\t\t\t\t\t\t\t",HTML.DIV({class:"table-fake-th"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Started_At")})),Blaze._TemplateWith((function(){return{icon:Spacebars.call(Spacebars.dataMustache(t.lookup("sortIcon"),"ts"))}}),(function(){return Spacebars.include(t.lookupTemplate("icon"))}))),"\n\t\t\t\t\t\t"),"\n\n\t\t\t\t\t\t",HTML.TH({class:function(){return["js-sort ",Blaze.If((function(){return Spacebars.dataMustache(t.lookup("sortBy"),"lm")}),(function(){return"is-sorting"}))]},"data-sort":"lm",width:"15%"},"\n\t\t\t\t\t\t\t",HTML.DIV({class:"table-fake-th"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Last_Message_At")})),Blaze._TemplateWith((function(){return{icon:Spacebars.call(Spacebars.dataMustache(t.lookup("sortIcon"),"lm"))}}),(function(){return Spacebars.include(t.lookupTemplate("icon"))}))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t\t",HTML.TH({class:function(){return["js-sort ",Blaze.If((function(){return Spacebars.dataMustache(t.lookup("sortBy"),"open")}),(function(){return"is-sorting"}))]},"data-sort":"open",width:"10%"},"\n\t\t\t\t\t\t\t",HTML.DIV({class:"table-fake-th"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Status")})),Blaze._TemplateWith((function(){return{icon:Spacebars.call(Spacebars.dataMustache(t.lookup("sortIcon"),"open"))}}),(function(){return Spacebars.include(t.lookupTemplate("icon"))}))),"\n\t\t\t\t\t\t"),"\n\n\t\t\t\t\t\t",HTML.TH({width:"5%"},HTML.DIV({class:"table-fake-th"},HTML.CharRef({html:"&nbsp;",str:" "}))),"\n\t\t\t\t\t"),"\n\t\t\t\t"),"\n\t\t\t\t",HTML.TBODY("\n\t\t\t\t\t",Blaze.Each((function(){return Spacebars.call(t.lookup("livechatRoom"))}),(function(){return["\n\t\t\t\t\t\t",HTML.TR({class:"rc-table-tr manage row-link","data-name":function(){return Spacebars.mustache(Spacebars.dot(t.lookup("latest"),"name"))}},"\n\n\t\t\t\t\t\t\t",HTML.TD("\n\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-table-wrapper"},"\n\t\t\t\t\t\t\t\t\t",HTML.DIV({class:"rc-table-info"},"\n\t\t\t\t\t\t\t\t\t\t",HTML.SPAN({class:"rc-table-title"},"\n\t\t\t\t\t\t\t\t\t\t\t",Blaze.View("lookup:fname",(function(){return Spacebars.mustache(t.lookup("fname"))})),"\n\t\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t"),"\n\t\t\t\t\t\t\t",HTML.TD(Blaze.View("lookup:department.name",(function(){return Spacebars.mustache(Spacebars.dot(t.lookup("department"),"name"))}))),"\n\t\t\t\t\t\t\t",HTML.TD(Blaze.View("lookup:servedBy",(function(){return Spacebars.mustache(t.lookup("servedBy"))}))),"\n\t\t\t\t\t\t\t",HTML.TD(Blaze.View("lookup:startedAt",(function(){return Spacebars.mustache(t.lookup("startedAt"))}))),"\n\t\t\t\t\t\t\t",HTML.TD(Blaze.View("lookup:lastMessage",(function(){return Spacebars.mustache(t.lookup("lastMessage"))}))),"\n\t\t\t\t\t\t\t",HTML.TD(Blaze.View("lookup:status",(function(){return Spacebars.mustache(t.lookup("status"))}))),"\n\t\t\t\t\t\t\t",Blaze._TemplateWith((function(){return"remove-closed-livechat-rooms"}),(function(){return Spacebars.include(t.lookupTemplate("requiresPermission"),(function(){return["\n\t\t\t\t\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("isClosed"))}),(function(){return["\n\t\t\t\t\t\t\t\t\t",HTML.TD(HTML.A({href:"#remove",class:"remove-livechat-room"},HTML.I({class:"icon-trash"}))),"\n\t\t\t\t\t\t\t\t"]}),(function(){return["\n\t\t\t\t\t\t\t\t\t",HTML.TD(HTML.CharRef({html:"&nbsp;",str:" "})),"\n\t\t\t\t\t\t\t\t"]})),"\n\t\t\t\t\t\t\t"]}),(function(){return["\n\t\t\t\t\t\t\t\t",HTML.TD(HTML.CharRef({html:"&nbsp;",str:" "})),"\n\t\t\t\t\t\t\t"]}))})),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"]})),"\n\t\t\t\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("isLoading"))}),(function(){return["\n\t\t\t\t\t\t",HTML.TR({class:"table-no-click"},"\n\t\t\t\t\t\t\t",HTML.TD({colspan:"5",class:"table-loading-td"},Spacebars.include(t.lookupTemplate("loading"))),"\n\t\t\t\t\t\t"),"\n\t\t\t\t\t"]})),"\n\t\t\t\t"),"\n\t\t\t"]}))})),"\n\t\t"),"\n\t\t",Blaze.If((function(){return Spacebars.call(t.lookup("hasMore"))}),(function(){return["\n\t\t\t",HTML.DIV({class:"rc-button__group"},"\n\t\t\t\t",HTML.BUTTON({class:"rc-button rc-button--primary js-load-more"},Blaze.View("lookup:_",(function(){return Spacebars.mustache(t.lookup("_"),"Load_more")}))),"\n\t\t\t"),"\n\t\t"]})),"\n\t"]}))}))}))}

