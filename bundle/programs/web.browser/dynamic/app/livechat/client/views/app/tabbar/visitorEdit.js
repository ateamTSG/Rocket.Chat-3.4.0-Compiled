function module(t,e,a){let i,s,n,o,r,l,c,m,g,v,h,u;a.link("@babel/runtime/helpers/objectSpread2",{default(t){i=t}},0),a.link("@babel/runtime/helpers/objectWithoutProperties",{default(t){s=t}},1),a.link("meteor/meteor",{Meteor(t){n=t}},0),a.link("meteor/reactive-var",{ReactiveVar(t){o=t}},1),a.link("meteor/templating",{Template(t){r=t}},2),a.link("toastr",{default(t){l=t}},3),a.link("../../../../../utils",{t(t){c=t}},4),a.link("../../../../../authorization",{hasAtLeastOnePermission(t){m=t},hasPermission(t){g=t},hasRole(t){v=t}},5),a.link("./visitorEdit.html"),a.link("../../../../../utils/client",{APIClient(t){h=t}},6),a.link("../customTemplates/register",{getCustomFormTemplate(t){u=t}},7);const d=100,p=function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},a=arguments.length>2?arguments[2]:void 0,n=arguments.length>3?arguments[3]:void 0;return t.filter(t=>{let{visibility:e,scope:i}=t;return"hidden"!==e&&i===a}).map(t=>{let{_id:a,scope:o,label:r}=t,l=s(t,["_id","scope","label"]);const c=e[a]?e[a]:"";return i({name:a,label:r,scope:o,value:c,disabled:n},l)})},f=()=>!g("edit-livechat-room-customfields");r.visitorEdit.helpers({visitor:()=>r.instance().visitor.get(),canViewCustomFields:()=>m(["view-livechat-room-customfields","edit-livechat-room-customfields"]),visitorCustomFields(){const t=r.instance().customFields.get();if(!t||0===t.length)return[];const e=r.instance().visitor.get(),{livechatData:a={}}=e||{};return p(t,a,"visitor",f())},room:()=>r.instance().room.get(),roomCustomFields(){const t=r.instance().customFields.get();if(!t||0===t.length)return[];const e=r.instance().room.get(),{livechatData:a={}}=e||{};return p(t,a,"room",f())},email(){const t=r.instance().visitor.get();if(t.visitorEmails&&t.visitorEmails.length>0)return t.visitorEmails[0].address},phone(){const t=r.instance().visitor.get();if(t.phone&&t.phone.length>0)return t.phone[0].phoneNumber},tags:()=>r.instance().tags.get(),availableUserTags:()=>r.instance().availableUserTags.get(),hasAvailableTags(){const t=r.instance().availableTags.get();return t&&t.length>0},canRemoveTag:(t,e)=>v(n.userId(),["admin","livechat-manager"])||Array.isArray(t)&&(0===t.length||t.indexOf(e)>-1),isSmsIntegration(){const t=r.instance().room.get();return!(!t||!t.sms)},customFieldsTemplate:()=>u("livechatVisitorEditForm")}),r.visitorEdit.onCreated((async function(){this.visitor=new o,this.room=new o,this.tags=new o([]),this.availableTags=new o([]),this.agentDepartments=new o([]),this.availableUserTags=new o([]),this.customFields=new o([]),this.autorun(async()=>{const{visitorId:t}=r.currentData();if(t){const{visitor:e}=await h.v1.get("livechat/visitors.info?visitorId=".concat(t));this.visitor.set(e)}});const t=r.currentData().roomId;this.autorun(async()=>{const{room:e}=await h.v1.get("rooms.info?roomId=".concat(t)),{customFields:a}=await h.v1.get("livechat/custom-fields?count=".concat(100));this.room.set(e),this.tags.set(e&&e.tags||[]),this.customFields.set(a||[])});const e=n.userId(),{departments:a}=await h.v1.get("livechat/agents/".concat(e,"/departments")),i=a.map(t=>t.departmentId);this.agentDepartments.set(i),n.call("livechat:getTagsList",(t,a)=>{this.availableTags.set(a);const i=this.agentDepartments.get(),s=v(e,["admin","livechat-manager"]),n=this.availableTags.get()||[],o=n.filter(t=>{let{departments:e}=t;return s||0===e.length||e.some(t=>i.indexOf(t)>-1)}).map(t=>{let{name:e}=t;return e});this.availableUserTags.set(o)})})),r.visitorEdit.events({"submit form"(t,e){t.preventDefault();const a={_id:e.visitor.get()._id},i=e.room.get(),{_id:s,sms:o}=i,r={_id:s};a.name=t.currentTarget.elements.name.value,a.email=t.currentTarget.elements.email.value,a.phone=t.currentTarget.elements.phone.value,a.livechatData={},$("[data-visitorLivechatData=true]").each((function(){a.livechatData[this.name]=$(this).val()||""})),r.topic=t.currentTarget.elements.topic.value,r.tags=e.tags.get(),r.livechatData={},$("[data-roomLivechatData=true]").each((function(){r.livechatData[this.name]=$(this).val()||""})),o&&delete a.phone,e.$(".customFormField").each((t,a)=>{const i=e.$(a),s=i.attr("name");r[s]=i.val()}),n.call("livechat:saveInfo",a,r,t=>{t?l.error(c(t.error)):(l.success(c("Saved")),this.save())})},"click .remove-tag"(t,e){const a=this.valueOf(),i=e.availableTags.get(),s=i&&i.length>0,o=e.availableUserTags.get();if(!v(n.userId(),["admin","livechat-manager"])&&s&&(!o||-1===o.indexOf(a)))return;t.stopPropagation(),t.preventDefault();let r=e.tags.get();r=r.filter(t=>t!==a),e.tags.set(r)},"click #addTag"(t,e){if(t.stopPropagation(),t.preventDefault(),$("#tagSelect").find(":selected").is(":disabled"))return;const a=[...e.tags.get()],i=$("#tagSelect").val();""===i||a.indexOf(i)>-1||(a.push(i),e.tags.set(a),$("#tagSelect").val("placeholder"))},"keydown #tagInput"(t,e){if(13===t.which){t.stopPropagation(),t.preventDefault();const a=[...e.tags.get()],i=$("#tagInput").val();if(""===i||a.indexOf(i)>-1)return;a.push(i),e.tags.set(a),$("#tagInput").val("")}},"click .cancel"(){this.cancel()}})}
