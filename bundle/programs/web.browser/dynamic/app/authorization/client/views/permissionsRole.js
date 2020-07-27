function module(e,t,s){let r,a,n,o,i,l,c,m,u,d,h,g,f,p,v,R;s.link("@babel/runtime/helpers/objectSpread2",{default(e){r=e}},0),s.link("meteor/meteor",{Meteor(e){a=e}},0),s.link("meteor/reactive-dict",{ReactiveDict(e){n=e}},1),s.link("meteor/reactive-var",{ReactiveVar(e){o=e}},2),s.link("meteor/kadira:flow-router",{FlowRouter(e){i=e}},3),s.link("meteor/templating",{Template(e){l=e}},4),s.link("meteor/tracker",{Tracker(e){c=e}},5),s.link("toastr",{default(e){m=e}},6),s.link("../../../utils/client/lib/handleError",{handleError(e){u=e}},7),s.link("../../../utils/lib/tapi18n",{t(e){d=e}},8),s.link("../../../models",{Roles(e){h=e}},9),s.link("../hasPermission",{hasAllPermission(e){g=e}},10),s.link("../../../ui-utils/client/lib/modal",{modal(e){f=e}},11),s.link("../../../ui-utils/client/lib/SideNav",{SideNav(e){p=e}},12),s.link("../../../utils/client",{APIClient(e){v=e}},13),s.link("../../../ui-utils/client",{call(e){R=e}},14);const k=50,_=async e=>{const t=e.state.get("offset"),s=e.searchRoom.get(),a=r({role:i.getParam("name"),offset:t,count:50},s&&{roomId:s});e.state.set("loading",!0);const{users:n}=await v.v1.get("roles.getUsersInRole",a);e.usersInRole.set(e.usersInRole.curValue.concat(n)),e.state.set({loading:!1,hasMore:50===n.length})};l.permissionsRole.helpers({role:()=>h.findOne({_id:i.getParam("name")})||{},userInRole:()=>l.instance().usersInRole.get(),editing:()=>null!=i.getParam("name"),emailAddress(){if(this.emails&&this.emails.length>0)return this.emails[0].address},hasPermission:()=>g("access-permissions"),protected(){return this.protected},editable(){return this._id&&!this.protected},hasUsers:()=>l.instance().usersInRole.get().length>0,hasMore:()=>l.instance().state.get("hasMore"),isLoading(){const e=l.instance();return(!e.subscription.ready()||e.state.get("loading"))&&"btn-loading"},searchRoom:()=>l.instance().searchRoom.get(),autocompleteChannelSettings:()=>({limit:10,rules:[{collection:"CachedChannelList",endpoint:"rooms.autocomplete.channelAndPrivate",field:"name",template:l.roomSearch,noMatchTemplate:l.roomSearchEmpty,matchAll:!0,sort:"name",selector:e=>({name:e})}]}),autocompleteUsernameSettings(){const e=l.instance();return{limit:10,rules:[{collection:"CachedUserList",endpoint:"users.autocomplete",field:"username",template:l.userSearch,noMatchTemplate:l.userSearchEmpty,matchAll:!0,filter:{exceptions:e.usersInRole.get()},selector:e=>({term:e}),sort:"username"}]}}}),l.permissionsRole.events({async"click .remove-user"(e,t){e.preventDefault(),f.open({title:d("Are_you_sure"),text:d("The_user_s_will_be_removed_from_role_s",this.username,i.getParam("name")),type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:d("Yes"),cancelButtonText:d("Cancel"),closeOnConfirm:!1,html:!1},async()=>{await R("authorization:removeUserFromRole",i.getParam("name"),this.username,t.searchRoom.get()),t.usersInRole.set(t.usersInRole.curValue.filter(e=>e.username!==this.username)),f.open({title:d("Removed"),text:d("User_removed"),type:"success",timer:1e3,showConfirmButton:!1})})},"submit #form-role"(e){e.preventDefault();const t=e.currentTarget.elements.save.value;e.currentTarget.elements.save.value=d("Saving");const s={description:e.currentTarget.elements.description.value,scope:e.currentTarget.elements.scope.value,mandatory2fa:e.currentTarget.elements.mandatory2fa.checked};this._id?s.name=this._id:s.name=e.currentTarget.elements.name.value,a.call("authorization:saveRole",s,r=>(e.currentTarget.elements.save.value=t,r?u(r):(m.success(d("Saved")),this._id?void 0:i.go("admin-permissions-edit",{name:s.name}))))},async"submit #form-users"(e,t){if(e.preventDefault(),""===e.currentTarget.elements.username.value.trim())return m.error(d("Please_fill_a_username"));const s=e.currentTarget.elements.add.value;e.currentTarget.elements.add.value=d("Saving");try{await R("authorization:addUserToRole",i.getParam("name"),e.currentTarget.elements.username.value,t.searchRoom.get()),t.usersInRole.set([]),t.state.set({offset:0,cache:Date.now()}),m.success(d("User_added")),e.currentTarget.reset()}finally{e.currentTarget.elements.add.value=s}},"submit #form-search-room":e=>e.preventDefault(),"click .delete-role"(e){if(e.preventDefault(),this.protected)return m.error(d("error-delete-protected-role"));a.call("authorization:deleteRole",this._id,(function(e){if(e)return u(e);m.success(d("Role_removed")),i.go("admin-permissions")}))},"click .load-more"(e,t){t.state.set("offset",t.state.get("offset")+50)},"autocompleteselect input[name=room]"(e,t,s){t.searchRoom.set(s._id)}}),l.permissionsRole.onCreated((async function(){this.state=new n({offset:0,loading:!1,hasMore:!0,cache:0}),this.searchRoom=new o,this.searchUsername=new o,this.usersInRole=new o([])})),l.permissionsRole.onRendered((function(){this.autorun(()=>{this.searchRoom.get(),this.usersInRole.set([]),this.state.set({offset:0})}),this.autorun(()=>{this.state.get("cache"),_(this)}),c.afterFlush(()=>{p.setFlex("adminFlex"),p.openFlex()})}))}
