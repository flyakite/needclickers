
//console.log(window.location.host)
var loadersrc='http://lh4.googleusercontent.com/-v2ubBH9aPXY/Ts9p2FYw5RI/AAAAAAAADrw/Ql27nJyjeps/s16/ajax-loader.gif';

/*  needclickers.com  */
var create_compare_base_area = function(){
    return $('<div id="showcompare" style="position:fixed;width:100%;bottom:0;z-index:2;background:#f2f2f2;border-top:3px solid #ccc;">')
            .append($('<div class="delete-button" style="float:right;" onclick="var showcompare=document.getElementById(\'showcompare\');document.body.removeChild(showcompare)">'))
            .append($('<h3 class="subpagetitle">Users not in Seige Log(Beta):</h3>'));
}
var find_invalid_click = function(){

    var $a = $(this), id, clicker_ids=[],
    url = $a.parents('li.pinch-link:first').find('div.mylink-url').text();
    if(!url.match(/apps\.facebook\.com\/castle_age/)){
        return false;
    }
    console.log(url);
    this.id=url.replace(/.*:\/\//,'');
    $.each($a.parents('div.clickers-array:first').find('a.user-name'), function(i,a){
        id = a.href.toString().split('http://www.needclickers.com/user/')[1];
        clicker_ids.push(id);
    })
    console.log(clicker_ids);
    if(clicker_ids.length >0){
	
		chrome.extension.sendMessage(null, {'action' : 'fetchPage', 'url':url, 'clicker_ids':clicker_ids}, function(){});
		
	    if(!document.getElementById('showcompare')){
	        $content = create_compare_base_area();
	        $content.appendTo('body');
	    }
	    $('#showcompare h3').append($("<span id='compare-loader' style='margin-right:-6px;'><img src='"+loadersrc+"'></span>"));
    }
    delete clicker_ids;
    return false;
}

/* needclickers.com */
if( window.location.host == 'www.needclickers.com' && window.location.pathname.match(/user.*/)){
    $find_invalid_button = $('<div>').append($('<a href="javascript:;">').addClass('find_invalid_button').text('Show Users not in Seige Log(Beta)').bind('click', find_invalid_click));
    $('.clickers-array').prepend($find_invalid_button);
}

var showCompare_backup = function(ids, message){
    if(!document.getElementById('showcompare')){
        $content = create_compare_base_area();
        $content.appendTo('body');
    }
    $('#showcompare div.clicker-icon').remove();
    $('#compare-loader').remove();
    $('<span>'+message+'</span>').insertAfter('#showcompare h3')
    for(var i in ids){
        $content.append(
	        $('<div class="clicker-icon" style="margin-left:4px;">')
	        .append($('<a target="_blank" href="/user/' + ids[i] + '" class="user-name">')
	        .append($('<img class="user-icon">')
                    .attr('src','http://graph.facebook.com/' + ids[i] + '/picture')))
        )
    }
}

var showCompare = function(sender_fullpath, ids, message){
    if(!document.getElementById('showcompare')){
        $content = create_compare_base_area();
        $content.appendTo('body');
    }
    $('#showcompare div.clicker-icon').remove();
    $('#compare-loader').remove();
    $('<span>'+message+'</span>').insertAfter('#showcompare h3')
    for(var i in ids){
        $content.append(
            $('<div class="clicker-icon" style="margin-left:4px;">')
            .append($('<a target="_blank" href="/user/' + ids[i] + '" class="user-name">')
            .append($('<img class="user-icon">')
                    .attr('src','http://graph.facebook.com/' + ids[i] + '/picture')))
        )
    }
    
    //modify clicker list
    var a_clicked = document.getElementById(sender_fullpath), id;
    $.each($(a_clicked).parents('div.clickers-array:first').find('a.user-name'), function(i,a){
        id = a.href.toString().split('http://www.needclickers.com/user/')[1];
        if(ids.indexOf(id) === -1){
            $(a).addClass('in-seige-log');
        }
    })
}

/*  in castleagegame.com  */

var $siege_log,
    mark_user = function(clicker_ids){
	    $.each($siege_log.find('a').get(), function(i, a){
            id = a.href.split('casuser=')[1]; 
            //console.log(id)
            if(clicker_ids.indexOf(id) >= 0){
               a.style.backgroundColor = '#9BC9F9';
               a.style.color = 'black';
            }
        });
	};
if( window.location.host == 'web.castleagegame.com'){
	console.log('extension castleage launched')
	chrome.extension.sendMessage(null, {'action' : 'checkRunning'}, function(is_running){
	    console.log(is_running);
		if(is_running){
			console.log('get launch weapon user ids')
			
			var id, launch_user_ids=[];
			if($('#siege_log')){
			    $siege_log = $('#siege_log');
			}else{
			    $siege_log = $('#log_member_list_2');
			}
			//extract ids
			$.each($siege_log.find('a').get(), function(i, a){
				id = a.href.split('casuser=')[1]; 
				//console.log(id)
				if(id){
				   launch_user_ids.push(id);
				}
			});
			console.log(launch_user_ids);
			chrome.extension.sendMessage(null, {'action' : 'respondLauncherID', 'launcher_ids' : launch_user_ids}, mark_user);
			delete launch_user_ids;
		}
	
	});
}



function onRequest(request, sender, callback) {
    if (request.action == 'respondLauncherID') {
        //get response from background, castle age ids are collected in a list, ready for compare
        console.log('time to show invalid_ids')
        console.log(request)
        showCompare(request.sender_fullpath, request.report.invalid_ids, request.report.message)
    }else{
        //console.log(request)
    }
};
chrome.extension.onMessage.addListener(onRequest);



