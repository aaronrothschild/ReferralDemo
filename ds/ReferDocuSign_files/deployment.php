_alc.__setStartDeptStatus(12354, true);
_alc.monitoringOff = true;
var inviteBtn = _alc.createInvite({"id":"16796","type":"proactive","html":"<div  style=\" width:292px; height:159px;\"><img id=\"alc_invite_image_16796\" name=\"alc_invite_image_16796\" src=\"http:\/\/depot.liveagentforsalesforce.com\/app\/chat\/invites\/1\/invite_blue.png\"  width=\"292\" height=\"159\" border=\"0\" alt=\"\" usemap=\"#alc_invite_map_16796\" \/><map id=\"alc_invite_map_16796\" name=\"alc_invite_map_16796\"><area shape=\"circle\" coords=\"230, 8, 9\" href=\"\" onclick=\"_alc.rejectInvite(); return false;\" \/><area shape=\"rect\" coords=\"230, 0, 272, 17\" href=\"\" onclick=\"_alc.rejectInvite(); return false;\" \/><area shape=\"circle\" coords=\"270, 8, 9\" href=\"\" onclick=\"_alc.rejectInvite(); return false;\" \/><area shape=\"circle\" coords=\"79, 116, 13\" href=\"\" onclick=\"_alc.startChat(16796); return false;\" \/><area shape=\"rect\" coords=\"80, 103, 210, 129\" href=\"\" onclick=\"_alc.startChat(16796); return false;\" \/><area shape=\"circle\" coords=\"211, 117, 13\" href=\"\" onclick=\"_alc.startChat(16796); return false;\" \/><\/map><\/div>","position":"bottomright"});
if ( _alc.utils.getCookie('__ALC_SI_16796') ) {
	_alc.invite = _alc.invites.length - 1;
	inviteBtn.rollDown();
}
delete _alc.__setStartDeptStatus;
_alc.setup(16494, 10902);
_alc.handleInvite = _alc.rollDownInvite;
_alc.handleInviteRejection = _alc.rollBackInvite;
_alc.addChatRequestNotificationHandler(_alc.googleTrack);
_alc.getButton(15985).disable();