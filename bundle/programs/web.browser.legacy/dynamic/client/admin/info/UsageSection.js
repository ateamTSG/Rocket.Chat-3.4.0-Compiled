function module(t,e,n){var a,r,l,s,o,i;n.export({UsageSection:function(){return c}}),n.link("@rocket.chat/fuselage",{Skeleton:function(t){a=t}},0),n.link("react",{default:function(t){r=t}},1),n.link("../../components/basic/Subtitle",{default:function(t){l=t}},2),n.link("../../contexts/TranslationContext",{useTranslation:function(t){s=t}},3),n.link("../../hooks/useFormatMemorySize",{useFormatMemorySize:function(t){o=t}},4),n.link("./DescriptionList",{DescriptionList:function(t){i=t}},5);var c=r.memo(function(){function t(t){var e=t.statistics,n=t.isLoading,c=function(t){return n?r.createElement(a,{width:"50%"}):t()},u=o(),_=s();return r.createElement(i,{"data-qa":"usage-list",title:r.createElement(l,{"data-qa":"usage-title"},_("Usage"))},r.createElement(i.Entry,{label:_("Stats_Total_Users")},c((function(){return e.totalUsers}))),r.createElement(i.Entry,{label:_("Stats_Active_Users")},c((function(){return e.activeUsers}))),r.createElement(i.Entry,{label:_("Stats_Active_Guests")},c((function(){return e.activeGuests}))),r.createElement(i.Entry,{label:_("Stats_App_Users")},c((function(){return e.appUsers}))),r.createElement(i.Entry,{label:_("Stats_Non_Active_Users")},c((function(){return e.nonActiveUsers}))),r.createElement(i.Entry,{label:_("Stats_Total_Connected_Users")},c((function(){return e.totalConnectedUsers}))),r.createElement(i.Entry,{label:_("Stats_Online_Users")},c((function(){return e.onlineUsers}))),r.createElement(i.Entry,{label:_("Stats_Away_Users")},c((function(){return e.awayUsers}))),r.createElement(i.Entry,{label:_("Stats_Offline_Users")},c((function(){return e.offlineUsers}))),r.createElement(i.Entry,{label:_("Stats_Total_Rooms")},c((function(){return e.totalRooms}))),r.createElement(i.Entry,{label:_("Stats_Total_Channels")},c((function(){return e.totalChannels}))),r.createElement(i.Entry,{label:_("Stats_Total_Private_Groups")},c((function(){return e.totalPrivateGroups}))),r.createElement(i.Entry,{label:_("Stats_Total_Direct_Messages")},c((function(){return e.totalDirect}))),r.createElement(i.Entry,{label:_("Stats_Total_Livechat_Rooms")},c((function(){return e.totalLivechat}))),r.createElement(i.Entry,{label:_("Total_Discussions")},c((function(){return e.totalDiscussions}))),r.createElement(i.Entry,{label:_("Total_Threads")},c((function(){return e.totalThreads}))),r.createElement(i.Entry,{label:_("Stats_Total_Messages")},c((function(){return e.totalMessages}))),r.createElement(i.Entry,{label:_("Stats_Total_Messages_Channel")},c((function(){return e.totalChannelMessages}))),r.createElement(i.Entry,{label:_("Stats_Total_Messages_PrivateGroup")},c((function(){return e.totalPrivateGroupMessages}))),r.createElement(i.Entry,{label:_("Stats_Total_Messages_Direct")},c((function(){return e.totalDirectMessages}))),r.createElement(i.Entry,{label:_("Stats_Total_Messages_Livechat")},c((function(){return e.totalLivechatMessages}))),r.createElement(i.Entry,{label:_("Stats_Total_Uploads")},c((function(){return e.uploadsTotal}))),r.createElement(i.Entry,{label:_("Stats_Total_Uploads_Size")},c((function(){return u(e.uploadsTotalSize)}))),e&&e.apps&&r.createElement(r.Fragment,null,r.createElement(i.Entry,{label:_("Stats_Total_Installed_Apps")},e.apps.totalInstalled),r.createElement(i.Entry,{label:_("Stats_Total_Active_Apps")},e.apps.totalActive)),r.createElement(i.Entry,{label:_("Stats_Total_Integrations")},c((function(){return e.integrations.totalIntegrations}))),r.createElement(i.Entry,{label:_("Stats_Total_Incoming_Integrations")},c((function(){return e.integrations.totalIncoming}))),r.createElement(i.Entry,{label:_("Stats_Total_Active_Incoming_Integrations")},c((function(){return e.integrations.totalIncomingActive}))),r.createElement(i.Entry,{label:_("Stats_Total_Outgoing_Integrations")},c((function(){return e.integrations.totalOutgoing}))),r.createElement(i.Entry,{label:_("Stats_Total_Active_Outgoing_Integrations")},c((function(){return e.integrations.totalOutgoingActive}))),r.createElement(i.Entry,{label:_("Stats_Total_Integrations_With_Script_Enabled")},c((function(){return e.integrations.totalWithScriptEnabled}))))}return t}())}
