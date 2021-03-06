function VenuedetailAssistant(venue,u,p,i,fui) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.venue=venue;
	   this.username=_globals.username;
	   this.password=_globals.password;
	   this.uid=_globals.uid;
	   this.fromuserinfo=fui;
}

VenuedetailAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	$("snapMayor").hide();
	//$("snapTips").hide(); //keep it visible -- that way the Add Tip button can be there
	$("checkinVenueName").innerHTML=this.venue.name;
	$("checkinVenueAddress").innerHTML=this.venue.address;
	if (this.venue.crossstreet) {
	 $("checkinVenueAddress").innerHTML += "<br/>(at "+this.venue.crossstreet+")";
	}
	var query=encodeURIComponent(this.venue.address+' '+this.venue.city+', '+this.venue.state);
	$("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x175&sensor=false&markers=color:blue|"+this.venue.geolat+","+this.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA"
	
	
	
	
	
	
	
	
	
	this.getVenueInfo();
	
			/* setup widgets here */
	    this.controller.setupWidget("detailScroller",
         this.scrollAttributes = {
             mode: 'vertical-snap'
         },
         this.scrollModel = {
            /* snapElements: {'y': [$("snapMap"),$("snapMayor"),$("snapTips"),$("snapTags"),$("snapInfo")]}*/
         });

		this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);

    this.controller.setupWidget("venueSpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });

    this.controller.setupWidget("buttonAddTip",
        this.buttonAttributes = {
            },
        this.buttonModel = {
            label : "Add Tip",
            disabled: false
        });
    this.controller.setupWidget("buttonAddTodo",
        this.buttonAttributes = {
            },
        this.buttonModel = {
            label : "Add To-do",
            disabled: false
        });
    this.controller.setupWidget("buttonMarkClosed",
        this.buttonAttributesClosed = {
            },
        this.buttonModelClosed = {
            label : "Flag Closed",
            disabled: false
        });
    this.controller.setupWidget("buttonProposeEdit",
        this.buttonAttributesEdit = {
            },
        this.buttonModelEdit = {
            label : "Propose Edit",
            disabled: false
        });
	this.controller.setupWidget("mayorDrawer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: true
         });
	this.controller.setupWidget("venueTipsContainer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: false
         });

	this.controller.setupWidget("tagsDrawer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: false
         });
	this.controller.setupWidget("venueInfoContainer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: false
         });
	this.controller.setupWidget("mapDrawer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: true
         });

	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen($("docheckin"),Mojo.Event.tap,this.promptCheckin.bind(this));
	
	/*var userlinks=$$(".userLink");
	for(var e=0;e<userlinks.length;e++) {
		var eid=userlinks[e].id;
		Mojo.Event.listen($(eid),Mojo.Event.tap,this.showUserInfo.bind(this));
	}*/
	
	Mojo.Event.listen($("buttonAddTip"),Mojo.Event.tap, this.handleAddTip.bind(this));
	Mojo.Event.listen($("buttonAddTodo"),Mojo.Event.tap, this.handleAddTodo.bind(this));
	Mojo.Event.listen($("buttonMarkClosed"),Mojo.Event.tap, this.handleMarkClosed.bind(this));
	Mojo.Event.listen($("buttonProposeEdit"),Mojo.Event.tap, this.handleProposeEdit.bind(this));
    this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'blue-command-nope'
        },
        /*this.cmmodel = {
          visible: true,
          items: [{
          	items: [ 
                 { iconPath: "images/venue_button.png", command: "do-Venues"},
                 { iconPath: "images/friends_button.png", command: "do-Friends"},
                 { iconPath: "images/todo_button.png", command: "do-Tips"},
                 { iconPath: "images/shout_button.png", command: "do-Shout"},
                 { iconPath: "images/badges_button.png", command: "do-Nothing"},
                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'}
                 ],
            toggleCmd: "do-Nothing"
            }]
    }*/_globals.cmmodel);

	Mojo.Event.listen($("mayorDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	Mojo.Event.listen($("tipsDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	Mojo.Event.listen($("tagsDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	Mojo.Event.listen($("infoDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	Mojo.Event.listen($("mapDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));


}

var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  //$('message').innerHTML += '<br/>'+ hash;
  return "Basic " + hash;
}

VenuedetailAssistant.prototype.getVenueInfo = function() {
	var url = 'http://api.foursquare.com/v1/venue.json';
	auth = _globals.auth;
	Mojo.Log.error("un="+this.username);
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {vid:this.venue.id},
	   onSuccess: this.getVenueInfoSuccess.bind(this),
	   onFailure: this.getVenueInfoFailed.bind(this)
	 });
}
VenuedetailAssistant.prototype.getVenueInfoSuccess = function(response) {
	Mojo.Log.error(response.responseText);
	$("checkinVenueAddress").innerHTML=response.responseJSON.venue.address;
	if (response.responseJSON.venue.crossstreet) {
	 $("checkinVenueAddress").innerHTML += "<br/>(at "+response.responseJSON.venue.crossstreet+")";
	}
	if($("venueMap").src!="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x175&sensor=false&markers=color:blue|"+response.responseJSON.venue.geolat+","+response.responseJSON.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA") {
		$("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x175&sensor=false&markers=color:blue|"+response.responseJSON.venue.geolat+","+response.responseJSON.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA";
	}
	
	//mayorial stuff
	if(response.responseJSON.venue.stats.mayor != undefined) { //venue has a mayor
		$("snapMayor").show();
		$("mayorPic").src=response.responseJSON.venue.stats.mayor.user.photo;
		$("mayorPic").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		$("mayorPicBorder").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		
		var lname=(response.responseJSON.venue.stats.mayor.user.lastname != undefined)? response.responseJSON.venue.stats.mayor.user.lastname: '';
		$("mayorName").innerHTML=response.responseJSON.venue.stats.mayor.user.firstname+" "+lname;
		$("mayorName").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		var mInfo;
		switch(response.responseJSON.venue.stats.mayor.user.gender) {
			case "male":
				var s=(response.responseJSON.venue.stats.mayor.count!=1)? "s": ""; 
				mInfo="He's checked in here "+response.responseJSON.venue.stats.mayor.count+" time"+s+".";
				break;
				
			case "female":
				var s=(response.responseJSON.venue.stats.mayor.count!=1)? "s": ""; 
				mInfo="She's checked in here "+response.responseJSON.venue.stats.mayor.count+" time"+s+".";
				break;
				
			default:
				var s=(response.responseJSON.venue.stats.mayor.count!=1)? "s": ""; 
				mInfo="They've checked in here "+response.responseJSON.venue.stats.mayor.count+" time"+s+".";
				break;
				
		}
		$("mayorInfo").innerHTML=mInfo;
		
	}
	
	
	//tips stuff
	if(response.responseJSON.venue.tips != undefined) {
		$("snapTips").show();
		var tips='';
		for (var t=0;t<response.responseJSON.venue.tips.length;t++) {
			//<div class="palm-row single"><div class="checkin-score"><img src="'+imgpath+'" /> <span>'+msg+'</span></div></div>
			var tip=response.responseJSON.venue.tips[t].text;
			var tipid=response.responseJSON.venue.tips[t].id;
			var created=response.responseJSON.venue.tips[t].created;
			var tlname=(response.responseJSON.venue.tips[t].user.lastname != undefined)? response.responseJSON.venue.tips[t].user.lastname : '';
			var username=response.responseJSON.venue.tips[t].user.firstname+" "+tlname;
			var photo=response.responseJSON.venue.tips[t].user.photo;
			var uid=response.responseJSON.venue.tips[t].user.id;

			tips+='<div class="palm-row single aTip"><img src="'+photo+'" id="tip-pic-'+uid+'-'+t+'" width="24" class="userLink" data="'+uid+'"/> <span class="venueTipUser userLink" data="'+uid+'" id="tip-name-'+uid+'-'+t+'" >'+username+'</span><br/><span class="palm-info-text venueTip">'+tip+'</span><br class="breaker"/><div class="tip-buttons"><span class="vtip tipsave" id="tip-save-'+t+'" data="'+tipid+'">Save Tip</span> <span class="vtip-black tipdone" id="tip-done-'+t+'" data="'+tipid+'">I\'ve Done This</span></div></div>'+"\n";
		}
		$("venueTips").update(tips);
	}

	//who's here? stuff
	if(response.responseJSON.venue.checkins != undefined) {
		$("snapUsers").show();
		var users='';
		for (var t=0;t<response.responseJSON.venue.checkins.length;t++) {
			//<div class="palm-row single"><div class="checkin-score"><img src="'+imgpath+'" /> <span>'+msg+'</span></div></div>
			var shout=(response.responseJSON.venue.checkins[t].shout != undefined)? response.responseJSON.venue.checkins[t].shout: "";
			var created=response.responseJSON.venue.checkins[t].created;
			var tlname=(response.responseJSON.venue.checkins[t].user.lastname != undefined)? response.responseJSON.venue.checkins[t].user.lastname : '';
			var username=response.responseJSON.venue.checkins[t].user.firstname+" "+tlname;
			var photo=response.responseJSON.venue.checkins[t].user.photo;
			var uid=response.responseJSON.venue.checkins[t].user.id;

			users+='<div class="palm-row single aTip"><img src="'+photo+'" id="tip-pic-'+uid+'-'+t+'" width="24" class="userLink" data="'+uid+'"/>&nbsp; <span class="venueTipUser userLink" data="'+uid+'" id="tip-name-'+uid+'-'+t+'" >'+username+'</span><br/><span class="palm-info-text venueTip">'+shout+'</span></div>'+"\n";
		}
		$("venueUsers").update(users);
	}else{
		$("snapUsers").hide();
	}
	
	
	//venue info stuff
	var totalcheckins=response.responseJSON.venue.stats.checkins;
	var beenhere=response.responseJSON.venue.stats.beenhere.me;
	var twitter=response.responseJSON.venue.twitter;
	var phone=response.responseJSON.venue.phone;
	var tags=response.responseJSON.venue.tags;
		Mojo.Log.error("phone="+phone);

	var vinfo='';
	var s=(totalcheckins != 1)? "s" :"";
	if (totalcheckins>0) {
		vinfo='<span class="capitalize">'+response.responseJSON.venue.name+'</span> has been visited '+totalcheckins+' time'+s+' ';
		vinfo+=(beenhere)? 'and you\'ve been here before': 'but you\'ve never been here';
		vinfo+='.<br/>';
	}else{
		vinfo='<span class="capitalize">'+response.responseJSON.venue.name+'</span> has never been visited! Be the first to check-in!<br/>';	
	}
	vinfo+=(twitter != undefined)? '<img src="images/bird.png" width="20" height="20" /> <a href="http://twitter.com/'+twitter+'">@'+twitter+'</a><br/>': '';
	vinfo+=(phone != undefined)? '<img src="images/phone.png" width="20" height="20" /> <a href="tel://'+phone+'">'+phone+'</a><br/>': '';
	Mojo.Log.error("vnfo="+vinfo);
	$("venueInfo").innerHTML=vinfo;
	
	//tags
	if(tags != undefined) {
		var vtags='';
		for(var t=0;t<tags.length;t++) {
			vtags+='<span class="vtag">'+tags[t]+'</span> ';
		}
		$("venueTags").innerHTML=vtags;
	}else{
		$("snapTags").hide();
	}
	
	
	$("venueScrim").hide();
	$("venueSpinner").mojo.stop();
	$("venueSpinner").hide();
	
	
	
	//atatch events to any new user links
	var userlinks=$$(".userLink");
	for(var e=0;e<userlinks.length;e++) {
		var eid=userlinks[e].id;
		Mojo.Event.stopListening($(eid),Mojo.Event.tap,this.showUserInfo);
		Mojo.Event.listen($(eid),Mojo.Event.tap,this.showUserInfo.bind(this));
		Mojo.Log.error("#########added event to "+eid)
	}

	//atatch events to any new save tip links
	var savetips=$$(".tipsave");
	for(var e=0;e<savetips.length;e++) {
		var eid=savetips[e].id;
		Mojo.Event.stopListening($(eid),Mojo.Event.tap,this.tipTapped);
		Mojo.Event.listen($(eid),Mojo.Event.tap,this.tipTapped.bind(this));
		Mojo.Log.error("#########added event to "+eid)
	}

	var donetips=$$(".tipdone");
	for(var e=0;e<donetips.length;e++) {
		var eid=donetips[e].id;
		Mojo.Event.stopListening($(eid),Mojo.Event.tap,this.tipTapped);
		Mojo.Event.listen($(eid),Mojo.Event.tap,this.tipTapped.bind(this));
		Mojo.Log.error("#########added event to "+eid)
	}

}



VenuedetailAssistant.prototype.getVenueInfoFailed = function(response) {
	Mojo.Log.error("############error! "+response.status);
	Mojo.Log.error("############error! "+response.responseText);
	Mojo.Controller.getAppController().showBanner("Error getting the venue's info", {source: 'notification'});
}
var checkinDialog;


VenuedetailAssistant.prototype.promptCheckin = function(event) {
/*	this.controller.showAlertDialog({
		onChoose: function(value) {
			if (value) {
				Mojo.Log.error("#######click yeah");
				this.checkIn(this.venue.id, this.venue.name,'','','0');
			}
		},
		title:"Foursquare Check In",
		message:"Go ahead and check-in here?",
		cancelable:true,
		choices:[ {label:'Yeah!', value:true, type:'affirmative'}, {label:'Eh, nevermind.', value:false, type:'negative'} ]
	});*/
		checkinDialog = this.controller.showDialog({
		template: 'listtemplates/do-checkin',
		assistant: new DoCheckinDialogAssistant(this,this.venue.id,this.venue.name)
	});

}

VenuedetailAssistant.prototype.checkIn = function(id, n, s, sf, t, fb) {
	Mojo.Log.error("###check in please??");
	if (_globals.auth) {
		var url = 'http://api.foursquare.com/v1/checkin.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				vid: id,
				shout: s,
				private: sf,
				twitter: t,
				facebook: fb
			},
			onSuccess: this.checkInSuccess.bind(this),
			onFailure: this.checkInFailed.bind(this)
		});
	} else {
		//$('message').innerHTML = 'Not Logged In';
	}
}
VenuedetailAssistant.prototype.markClosed = function() {
	Mojo.Log.error("###mark closed");
	if (_globals.auth) {
		var url = 'http://api.foursquare.com/v1/venue/flagclosed.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				vid: this.venue.id,
			},
			onSuccess: this.markClosedSuccess.bind(this),
			onFailure: this.markClosedFailed.bind(this)
		});
	} else {
		//$('message').innerHTML = 'Not Logged In';
	}
}

VenuedetailAssistant.prototype.checkInSuccess = function(response) {
	Mojo.Log.error(response.responseText);
	
	var json=response.responseJSON;
		Mojo.Log.error("^^^^^^^^^^^^^^^^made it here...");
	//checkinDialog.mojo.close();
	//checkinDialog=null;
	//var dialog = this.controller.showDialog({
	//	template: 'listtemplates/checkin-info',
	//	assistant: new CheckInDialogAssistant(this, json,this.uid)
	//});
	this.controller.stageController.pushScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,this.uid);

}

VenuedetailAssistant.prototype.checkInFailed = function(response) {
	Mojo.Log.error('Check In Failed: ' + repsonse.responseText);
	Mojo.Controller.getAppController().showBanner("Error checking in!", {source: 'notification'});
}
VenuedetailAssistant.prototype.markClosedSuccess = function(response) {
	Mojo.Controller.getAppController().showBanner("Venue has been marked closed!", {source: 'notification'});
}
VenuedetailAssistant.prototype.markClosedFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error marking venue as closed!", {source: 'notification'});
}


VenuedetailAssistant.prototype.handleAddTip=function(event) {
	var thisauth=auth;
	var dialog = this.controller.showDialog({
		template: 'listtemplates/add-tip',
		assistant: new AddTipDialogAssistant(this,thisauth,this.venue.id,"tip")
	});

}
VenuedetailAssistant.prototype.handleAddTodo=function(event) {
	var thisauth=auth;
	var dialog = this.controller.showDialog({
		template: 'listtemplates/add-tip',
		assistant: new AddTipDialogAssistant(this,thisauth,this.venue.id,"todo")
	});

}
VenuedetailAssistant.prototype.handleMarkClosed=function(event) {
this.controller.showAlertDialog({
		onChoose: function(value) {
			if (value) {
				this.markClosed();
			}
		},
		title:this.venue.name,
		message:"Do you want to mark this venue as closed?",
		cancelable:true,
		choices:[ {label:'Yep!', value:true, type:'affirmative'}, {label:'Nevermind', value:false, type:'negative'} ]
	});
}
VenuedetailAssistant.prototype.handleProposeEdit=function(event) {
	var thisauth=auth;
	this.controller.stageController.pushScene({name: "add-venue", transition: Mojo.Transition.crossFade},thisauth,true,this.venue);
}

VenuedetailAssistant.prototype.showUserInfo = function(event) {
	Mojo.Log.error("############user info! the uid="+event.target.readAttribute("data")+",target="+event.target.id);
	var thisauth=auth;
	this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,event.target.readAttribute("data"));

}

VenuedetailAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   
	
}
VenuedetailAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,this.username,this.password,this.uid);
					//this.prevScene.cmmodel.items[0].toggleCmd="do-Nothing";
				    //this.prevScene.controller.modelChanged(this.prevScene.cmmodel);

					//this.controller.stageController.popScene("user-info");
					break;
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
				case "do-Friends":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);
					break;
                case "do-Shout":
                //	var checkinDialog = this.controller.showDialog({
				//		template: 'listtemplates/do-shout',
				//		assistant: new DoShoutDialogAssistant(this,auth)
				//	});
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);

                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Refresh":
					$("venueScrim").show();
					$("venueSpinner").mojo.start();
					$("venueSpinner").show();
                	//_globals.friendList=undefined;
					this.getVenueInfo();
                	break;
      			case "do-Nothing":
      				break;
            }
           // var scenes=this.controller.stageController.getScenes();
            //Mojo.Log.error("########this scene="+scenes[scenes.length-1].name+", below is "+scenes[scenes.length-2].name);
            //scenes[scenes.length-2].getSceneController().cmmodel.items[0].toggleCmd="do-Nothing";
            //scenes[scenes.length-2].getSceneController().modelChanged(scenes[scenes.length-2].getSceneController().cmmodel);
        }else if(event.type===Mojo.Event.back && this.fromuserinfo!=true) {
			event.preventDefault();
	        var thisauth=_globals.auth;
			this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,this.username,this.password,this.uid);
	    }

}

VenuedetailAssistant.prototype.tipTapped = function(event) {
	
    switch(event.target.hasClassName("tipsave")) {
                           		case true:
                           			this.markTip(event.target.readAttribute("data"),"todo");
                           			break;
                           		case false:
                           			this.markTip(event.target.readAttribute("data"),"done");
                           			break;
    }



}
VenuedetailAssistant.prototype.markTip = function(tip,how){
		var url = 'http://api.foursquare.com/v1/tip/mark'+how+'.json';
		var request = new Ajax.Request(url, {
		   method: 'post',
		   evalJSON: 'force',
		   requestHeaders: {Authorization: _globals.auth}, //Not doing a search with auth due to malformed JSON results from it
		   parameters: {tid: tip},
		   onSuccess: this.markTipSuccess.bind(this),
		   onFailure: this.markTipFailed.bind(this)
		 });
}
VenuedetailAssistant.prototype.markTipSuccess = function(response){
	Mojo.Log.error(response.responseText);
	if(response.responseJSON.tip!=undefined){
		Mojo.Controller.getAppController().showBanner("Tip was marked!", {source: 'notification'});
	}else{
		Mojo.Controller.getAppController().showBanner("Error marking tip!", {source: 'notification'});
	}
}
VenuedetailAssistant.prototype.markTipFailed = function(response){
		Mojo.Log.error(response.responseText);
		Mojo.Controller.getAppController().showBanner("Error marking tip!", {source: 'notification'});
}


VenuedetailAssistant.prototype.handleDividerTap = function(event) {
	Mojo.Log.error("divider tapped: "+event.target.id);
	switch(event.target.id) {
		case "mayorArrow":
		case "mayorLine":
			Mojo.Log.error("mayor divider");
			if($("mayorArrow").hasClassName("palm-arrow-closed")) {
				$("mayorArrow").removeClassName("palm-arrow-closed");
				$("mayorArrow").addClassName("palm-arrow-expanded");
				$("mayorDrawer").mojo.setOpenState(true);
			}else{
				$("mayorArrow").removeClassName("palm-arrow-expanded");
				$("mayorArrow").addClassName("palm-arrow-closed");
				$("mayorDrawer").mojo.setOpenState(false);
			
			}
			break;
		case "tipsArrow":
		case "tipsLine":
			if($("tipsArrow").hasClassName("palm-arrow-closed")) {
				$("tipsArrow").removeClassName("palm-arrow-closed");
				$("tipsArrow").addClassName("palm-arrow-expanded");
				$("venueTipsContainer").mojo.setOpenState(true);
			}else{
				$("tipsArrow").removeClassName("palm-arrow-expanded");
				$("tipsArrow").addClassName("palm-arrow-closed");
				$("venueTipsContainer").mojo.setOpenState(false);
			
			}
			break;
		case "tagsArrow":
		case "tagsLine":
			if($("tagsArrow").hasClassName("palm-arrow-closed")) {
				$("tagsArrow").removeClassName("palm-arrow-closed");
				$("tagsArrow").addClassName("palm-arrow-expanded");
				$("tagsDrawer").mojo.setOpenState(true);
			}else{
				$("tagsArrow").removeClassName("palm-arrow-expanded");
				$("tagsArrow").addClassName("palm-arrow-closed");
				$("tagsDrawer").mojo.setOpenState(false);
			
			}
			break;
		case "infoArrow":
		case "infoLine":
			if($("infoArrow").hasClassName("palm-arrow-closed")) {
				$("infoArrow").removeClassName("palm-arrow-closed");
				$("infoArrow").addClassName("palm-arrow-expanded");
				$("venueInfoContainer").mojo.setOpenState(true);
			}else{
				$("infoArrow").removeClassName("palm-arrow-expanded");
				$("infoArrow").addClassName("palm-arrow-closed");
				$("venueInfoContainer").mojo.setOpenState(false);
			
			}
			break;
		case "mapArrow":
		case "mapLine":
			if($("mapArrow").hasClassName("palm-arrow-closed")) {
				$("mapArrow").removeClassName("palm-arrow-closed");
				$("mapArrow").addClassName("palm-arrow-expanded");
				$("mapDrawer").mojo.setOpenState(true);
			}else{
				$("mapArrow").removeClassName("palm-arrow-expanded");
				$("mapArrow").addClassName("palm-arrow-closed");
				$("mapDrawer").mojo.setOpenState(false);
			
			}
			break;
	}
}


VenuedetailAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

VenuedetailAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
