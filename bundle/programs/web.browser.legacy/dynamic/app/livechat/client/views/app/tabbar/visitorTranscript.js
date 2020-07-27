function module(e,t,n){var r,i,s,a,o,c,u,l,v,f;n.link("@babel/runtime/regenerator",{default:function(e){r=e}},0),n.link("meteor/meteor",{Meteor:function(e){i=e}},0),n.link("meteor/reactive-var",{ReactiveVar:function(e){s=e}},1),n.link("meteor/templating",{Template:function(e){a=e}},2),n.link("toastr",{default:function(e){o=e}},3),n.link("../../../../../utils",{t:function(e){c=e},isEmail:function(e){u=e},handleError:function(e){l=e},roomTypes:function(e){v=e}},4),n.link("../../../../../utils/client",{APIClient:function(e){f=e}},5),n.link("./visitorTranscript.html");var m=function(e){var t=e.$('[name="subject"]').val(),n=e.$('[name="email"]').val(),r,i;return""===n?(e.errorMessage.set(c("Mail_Message_Missing_to")),!1):u(n)?""===t?(e.errorMessage.set(c("Mail_Message_Missing_subject")),!1):n===e.visitor.get().visitorEmails[0].address||(e.errorMessage.set(c("Livechat_visitor_email_and_transcript_email_do_not_match")),!1):(e.errorMessage.set(c("Mail_Message_Invalid_emails",n)),!1)};a.visitorTranscript.helpers({roomOpen:function(){var e=a.instance().room.get();return e&&!0===e.open},email:function(){var e=a.instance().room.get();if(null==e?void 0:e.transcriptRequest)return e.transcriptRequest.email;var t=a.instance().visitor.get();return(null==t?void 0:t.visitorEmails)&&t.visitorEmails.length>0?t.visitorEmails[0].address:void 0},subject:function(){var e=a.instance().room.get();return(null==e?void 0:e.transcriptRequest)?e.transcriptRequest.subject:c("Transcript_of_your_livechat_conversation")||e&&v.getRoomName(e.t,e)},errorEmail:function(){var e=a.instance();return e&&e.erroredEmails.get().join(", ")},errorMessage:function(){return a.instance().errorMessage.get()},infoMessage:function(){return a.instance().infoMessage.get()},transcriptRequested:function(){var e=a.instance().room.get();return null==e?void 0:e.hasOwnProperty("transcriptRequest")}}),a.visitorTranscript.events({"click .send":function(e,t){var n=this;if(event.preventDefault(),m(t)){var r=t.$('[name="subject"]').val(),s=t.$('[name="email"]').val(),a,u=t.room.get()._id,v,f=t.visitor.get().token;i.call("livechat:sendTranscript",f,u,s,r,(function(e){if(null!=e)return l(e);o.success(c("Your_email_has_been_queued_for_sending")),n.save()}))}},"click .request":function(e,t){var n=this;if(event.preventDefault(),m(t)){var r=t.$('[name="subject"]').val(),s=t.$('[name="email"]').val(),a,u=t.room.get()._id;i.call("livechat:requestTranscript",u,s,r,(function(e){if(null!=e)return l(e);o.success(c("Livechat_transcript_has_been_requested")),n.save()}))}},"click .discard":function(e,t){var n=this;event.preventDefault();var r,s=t.room.get()._id;i.call("livechat:discardTranscript",s,(function(e){if(null!=e)return l(e);o.success(c("Livechat_transcript_request_has_been_canceled")),n.save()}))},"click .cancel":function(){this.cancel()}}),a.visitorTranscript.onCreated(function(){function e(){var e=this;return r.async(function(){function t(t){for(;;)switch(t.prev=t.next){case 0:this.room=new s,this.visitor=new s,this.errorMessage=new s(""),this.infoMessage=new s(""),this.autorun(function(){function t(){var t,n;return r.async(function(){function i(i){for(;;)switch(i.prev=i.next){case 0:return i.next=2,r.awrap(f.v1.get("livechat/visitors.info?visitorId="+a.currentData().visitorId));case 2:t=i.sent,n=t.visitor,e.visitor.set(n);case 5:case"end":return i.stop()}}return i}(),null,null,null,Promise)}return t}()),this.autorun(function(){function t(){var t,n;return r.async(function(){function i(i){for(;;)switch(i.prev=i.next){case 0:return i.next=2,r.awrap(f.v1.get("rooms.info?roomId="+a.currentData().roomId));case 2:t=i.sent,n=t.room,e.room.set(n),(null==n?void 0:n.transcriptRequest)&&e.infoMessage.set(c("Livechat_transcript_already_requested_warning"));case 6:case"end":return i.stop()}}return i}(),null,null,null,Promise)}return t}());case 6:case"end":return t.stop()}}return t}(),null,this,null,Promise)}return e}())}
