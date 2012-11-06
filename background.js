

function goToUserPage(info, tab){
  //console.log(info.linkUrl);
  var pattern = info.linkUrl.match(/casuser\=\d+/);
  //console.log(pattern)
  if(pattern){
    //console.log(pattern[0].match(/\d+/))
    window.open('http://www.needclickers.com/user/'+pattern[0].match(/\d+/)[0])
  }
}
chrome.contextMenus.create({"title": "NeedClickers Page", "contexts": ["link"], "documentUrlPatterns":["*://web.castleagegame.com/castle/*"], "onclick": goToUserPage});


var LCSTable = function(X, Y){
    //Longest Common Subsequence 
    X.splice(0,0,0);
    Y.splice(0,0,0);
    var C = new Array(X.length);
    for(var i=0; i<X.length; i++){
        C[i]= new Array(Y.length)
        for(var j=0; j<Y.length; j++){
            if( i*j === 0){
                C[i][j] = 0
            }else if(X[i] === Y[j]){
                //element in common
                C[i][j] = C[i-1][j-1] +1;
            }else{
                C[i][j] = Math.max(C[i][j-1], C[i-1][j]);
            }
        }
        //console.log(C[i])
    }
    return C;
}

var LCSTraceback = function(C, X, Y, i, j){
    //return last index and lcs
    //console.log(i +','+ j)
    if(i === 0 || j === 0){
        var lastindex = this.lastindex
        this.lastindex = 0
        return [lastindex]
    }else if(X[i] === Y[j]){
        //console.log(X[i]);
        this.lastindex = this.lastindex > 0 ? this.lastindex : i;
        var LCS = LCSTraceback(C, X, Y, i-1, j-1);
        LCS.push(X[i]);
        return LCS
    }else if(C[i][j-1] >= C[i-1][j]){
        return LCSTraceback(C, X, Y, i, j-1)
    }else{
        return LCSTraceback(C, X, Y, i-1, j)
    }
}

/* Longest Common Subsequence(deprecated) */
var LCS = function(X, Y){
    var lcs = LCSTraceback(LCSTable(X, Y), X, Y, X.length-1, Y.length-1);
    return {lastindex: lcs[0],
            list:lcs.slice(1)
           }
}

var LCSLastXIndex = function(C, X, Y, i, j){
    //reduced function that only find last index
    if(i === 0 || j === 0){
        return 0
    }else if(X[i] === Y[j]){
        return i-1
    }else if(C[i][j-1] >= C[i-1][j]){
        return LCSLastXIndex(C, X, Y, i, j-1)
    }else{
        return LCSLastXIndex(C, X, Y, i-1, j)
    }
}

var findInvalidClickIDs_backup = function(clicker_ids, launcher_ids){
    if(launcher_ids.length>0){
        //find the last index of clicker_ids in LCS (Longest Common Subsequence)
	    //var xi = LCSLastXIndex(LCSTable(clicker_ids, launcher_ids), clicker_ids, launcher_ids, clicker_ids.length-1, launcher_ids.length-1);
	    //console.log(xi)
	    
	    //find Longest Common Subsequence of two lists
	    var lcs = LCS(clicker_ids, launcher_ids);
	    console.log(lcs.list)
	    console.log(lcs.lastindex)
	    if( lcs.list.length > 8 && lcs.lastindex > 0){
	        var invalid_ids = clicker_ids.slice(0,lcs.lastindex).filter(function(x){ 
	            return launcher_ids.indexOf(x) < 0;
	        });
	        //console.log(invalid_ids.length);
	        if(invalid_ids.length === 0){
	           return {invalid_ids:[], message:'No invalid clicks.'};
	        }else{
	           return {invalid_ids:invalid_ids, message:''};
	        }
	    }else{
	        return {invalid_ids:[], message:'Not enough information. Wait for next weapon launch.'};
	    }
    }else{
        return {invalid_ids:[], message:'No id found in game page.'};
    }
}

var findInvalidClickIDs = function(clicker_ids, launcher_ids){
    //an easy check
    var invalid_ids = clicker_ids.filter(function(x){ 
        return launcher_ids.indexOf(x) < 0;
    });
    if(invalid_ids.length === 0){
       return {invalid_ids:[], message:'No invalid clicks.'};
    }else{
       return {invalid_ids:invalid_ids, message:''};
    }
}
var url_tabid={}, url_clickers={};

/* event Listener */
function onMessage(request, sender, callback) {
    console.log(sender);
    console.log('Action:' + request.action);
    var sender_fullpath = sender.tab.url.replace(/.*:\/\//,'');
    if(request.action == 'checkRunning'){ 
		//send from game page to ensure game page loaded, and callback to get launcher ids
		console.log(sender_fullpath)
		console.log(url_tabid[sender_fullpath])
		callback(url_tabid[sender_fullpath]);
    }else if(request.action == 'fetchPage') {
        //send from needclickers page to open game page
		console.log('fetchPage request url: ' + request.url.replace(/.*:\/\//,''))
		console.log(sender.tab.id)
		url_tabid[request.url.replace(/.*:\/\//,'')] = sender.tab.id
		url_clickers[request.url.replace(/.*:\/\//,'')] = request.clicker_ids
		console.log(url_tabid);
		chrome.tabs.create({url:request.url, active:false}, function(tab){
			//console.log(tab.id)
		});
    }else if(request.action == 'respondLauncherID'){
        //get returned launcher ids, find invalid clicks and respond to needclickers website
		console.log('respond to tab url:')
		console.log(sender_fullpath)
		var respond_tabid = url_tabid[sender_fullpath],
		    clicker_ids = url_clickers[sender_fullpath],
		    report = findInvalidClickIDs(clicker_ids, request.launcher_ids);
		console.log(report)
		console.log(respond_tabid)
		delete url_tabid[sender_fullpath]
		delete url_clickers[sender_fullpath]
		callback(clicker_ids);
		chrome.tabs.sendMessage(respond_tabid, {action: 'respondLauncherID', report:report, sender_fullpath:sender_fullpath}, function(){});
        
    }
};

// Wire up the listener.
chrome.extension.onMessage.addListener(onMessage);
