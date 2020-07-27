function module(e,t,n){let s,o,a,i,c,h,r,g,l,_;n.link("meteor/meteor",{Meteor(e){s=e}},0),n.link("meteor/reactive-var",{ReactiveVar(e){o=e}},1),n.link("meteor/templating",{Template(e){a=e}},2),n.link("underscore",{default(e){i=e}},3),n.link("underscore.string",{default(e){c=e}},4),n.link("toastr",{default(e){h=e}},5),n.link("../../../../../ui-utils",{modal(e){r=e}},6),n.link("../../../../../utils",{t(e){g=e},handleError(e){l=e}},7),n.link("./livechatIntegrationWebhook.html"),n.link("../../../../../utils/client",{APIClient(e){_=e}},8);const k=(e,t)=>e.find(e=>e._id===t);a.livechatIntegrationWebhook.helpers({webhookUrl(){const e=k(a.instance().settings.get(),"Livechat_webhookUrl");return e&&e.value},secretToken(){const e=k(a.instance().settings.get(),"Livechat_secret_token");return e&&e.value},disableTest:()=>a.instance().disableTest.get(),sendOnStartChecked(){const e=k(a.instance().settings.get(),"Livechat_webhook_on_start");return e&&e.value},sendOnCloseChecked(){const e=k(a.instance().settings.get(),"Livechat_webhook_on_close");return e&&e.value},sendOnChatTakenChecked(){const e=k(a.instance().settings.get(),"Livechat_webhook_on_chat_taken");return e&&e.value},sendOnChatQueuedChecked(){const e=k(a.instance().settings.get(),"Livechat_webhook_on_chat_queued");return e&&e.value},sendOnForwardChecked(){const e=k(a.instance().settings.get(),"Livechat_webhook_on_forward");return e&&e.value},sendOnOfflineChecked(){const e=k(a.instance().settings.get(),"Livechat_webhook_on_offline_msg");return e&&e.value},sendOnVisitorMessageChecked(){const e=k(a.instance().settings.get(),"Livechat_webhook_on_visitor_message");return e&&e.value},sendOnAgentMessageChecked(){const e=k(a.instance().settings.get(),"Livechat_webhook_on_agent_message");return e&&e.value}}),a.livechatIntegrationWebhook.onCreated((async function(){this.disableTest=new o(!0),this.settings=new o([]),this.autorun(()=>{const e=k(this.settings.get(),"Livechat_webhookUrl");this.disableTest.set(!e||i.isEmpty(e.value))});const{settings:e}=await _.v1.get("livechat/integrations.settings");this.settings.set(e)})),a.livechatIntegrationWebhook.events({"change #webhookUrl, blur #webhookUrl"(e,t){const n=k(t.settings.get(),"Livechat_webhookUrl");t.disableTest.set(!n||e.currentTarget.value!==n.value)},"click .test"(e,t){t.disableTest.get()||s.call("livechat:webhookTest",e=>{if(e)return l(e);r.open({title:g("It_works"),type:"success",timer:2e3})})},"click .reset-settings"(e,t){e.preventDefault();const n=k(t.settings.get(),"Livechat_webhookUrl"),s=k(t.settings.get(),"Livechat_secret_token"),o=k(t.settings.get(),"Livechat_webhook_on_start"),a=k(t.settings.get(),"Livechat_webhook_on_close"),c=k(t.settings.get(),"Livechat_webhook_on_chat_taken"),h=k(t.settings.get(),"Livechat_webhook_on_chat_queued"),r=k(t.settings.get(),"Livechat_webhook_on_forward"),g=k(t.settings.get(),"Livechat_webhook_on_offline_msg"),l=k(t.settings.get(),"Livechat_webhook_on_visitor_message"),_=k(t.settings.get(),"Livechat_webhook_on_agent_message");t.$("#webhookUrl").val(n&&n.value),t.$("#secretToken").val(s&&s.value),t.$("#sendOnStart").get(0).checked=o&&o.value,t.$("#sendOnClose").get(0).checked=a&&a.value,t.$("#sendOnChatTaken").get(0).checked=c&&c.value,t.$("#sendOnChatQueued").get(0).checked=h&&h.value,t.$("#sendOnForward").get(0).checked=r&&r.value,t.$("#sendOnOffline").get(0).checked=g&&g.value,t.$("#sendOnVisitorMessage").get(0).checked=l&&l.value,t.$("#sendOnAgentMessage").get(0).checked=_&&_.value,t.disableTest.set(!n||i.isEmpty(n.value))},"submit .rocket-form"(e,t){e.preventDefault();const n={Livechat_webhookUrl:c.trim(t.$("#webhookUrl").val()),Livechat_secret_token:c.trim(t.$("#secretToken").val()),Livechat_webhook_on_start:t.$("#sendOnStart").get(0).checked,Livechat_webhook_on_close:t.$("#sendOnClose").get(0).checked,Livechat_webhook_on_chat_taken:t.$("#sendOnChatTaken").get(0).checked,Livechat_webhook_on_chat_queued:t.$("#sendOnChatQueued").get(0).checked,Livechat_webhook_on_forward:t.$("#sendOnForward").get(0).checked,Livechat_webhook_on_offline_msg:t.$("#sendOnOffline").get(0).checked,Livechat_webhook_on_visitor_message:t.$("#sendOnVisitorMessage").get(0).checked,Livechat_webhook_on_agent_message:t.$("#sendOnAgentMessage").get(0).checked};s.call("livechat:saveIntegration",n,e=>{if(e)return l(e);const s=t.settings.get().map(e=>(e.value=n[e._id],e));t.settings.set(s),h.success(g("Saved"))})}})}
