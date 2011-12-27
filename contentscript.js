
//console.log(window.location.host)
var loadersrc='http://lh4.googleusercontent.com/-v2ubBH9aPXY/Ts9p2FYw5RI/AAAAAAAADrw/Ql27nJyjeps/s16/ajax-loader.gif';

/*  needclickers.com  */
var create_compare_base_area = function(){
    return $('<div id="showcompare" style="position:fixed;width:100%;bottom:0;z-index:2;background:#f2f2f2;border-top:3px solid #ccc;">')
            .append($('<div class="delete-button" style="float:right;" onclick="var showcompare=document.getElementById(\'showcompare\');document.body.removeChild(showcompare)">'))
            .append($('<h3 class="subpagetitle">Find Invalid Clicks (Beta):</h3>'));
}
var find_invalid_click = function(){

    var $a = $(this), id, clicker_ids=[],
    url = $a.parents('li.pinch-link:first').find('div.mylink-url').text();
    if(!url.match(/apps\.facebook\.com\/castle_age/)){
        return false;
    }
    //console.log(url);
    $.each($a.parents('div.clickers-array:first').find('a.user-name'), function(i,a){
        id = a.href.toString().split('http://www.needclickers.com/user/')[1];
        clicker_ids.push(id);
    })
    console.log(clicker_ids);
    if(clicker_ids.length >0){
	    chrome.extension.sendRequest({'action' : 'fetchPage', 'url':url, 'clicker_ids':clicker_ids}, function(){});
	    if(!document.getElementById('showcompare')){
	        $content = create_compare_base_area();
	        $content.appendTo('body');
	    }
	    $('#showcompare h3').append($("<span id='compare-loader' style='margin-right:-6px;'><img src='"+loadersrc+"'></span>"));
    }
    delete clicker_ids;
    return false;
}
if( window.location.host == 'www.needclickers.com' && window.location.pathname.match(/user.*/)){
    $find_invalid_button = $('<div>').append($('<a href="javascript:;">').addClass('find_invalid_button').text('Find Invalid Clicks(Beta)').bind('click', find_invalid_click));
    $('.clickers-array').prepend($find_invalid_button);
}

var showCompare = function(ids, message){
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


/*  castleagegame.com  */
if( window.location.host == 'web.castleagegame.com'){
    chrome.extension.sendRequest({'action' : 'checkRunning'}, function(is_running){
        if(is_running){
            //console.log('get launch weapon user ids')
            var $divs = $('#siege_log > div > div'), namelinks=[], id, launch_user_ids=[];
            if($divs.get().length === 0){
                $divs = $('#log_member_list_2 > div')
            }
            //order by time
            $.each( $divs.get().reverse(), function(i, div){
                namelinks.push.apply(namelinks, $(div).find('a').get())  //extend array
            })
            //extract ids
            if(namelinks){
			    $.each(namelinks, function(i, a){
			        id = a.href.split('http://apps.facebook.com/castle_age/keep.php?casuser=')[1]; 
			        if(id){
			           launch_user_ids.push(id);
			        }
			    });
		    }
            console.log(launch_user_ids);
		    chrome.extension.sendRequest({'action' : 'respondLauncherID', 'launcher_ids' : launch_user_ids}, function(){});
		    delete launch_user_ids;
        }
    
    });
    
}



function onRequest(request, sender, callback) {
    if (request.action == 'respondLauncherID') {
        //get response from background, castle age ids are collected in a list, ready for compare
        showCompare(request.report.invalid_ids, request.report.message)
    }else{
        //console.log(request)
    }
};
chrome.extension.onRequest.addListener(onRequest);



