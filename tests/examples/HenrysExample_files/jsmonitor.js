window.UEInfo=(function(){var UEInfo=new Object();var UEUrl='/errors/log';var startTime,type_msg;var userAgent=window.navigator.userAgent;var UEHost="app.jsmonitor.io";function handleErr(errorMsg,errorUrl,errorLine){UEInfo.browser=getBrowser(userAgent).browser;if(/undefined|ReferenceError/i.test(errorMsg)){type_msg=getReference(errorMsg,UEInfo.browser);}else if(/expected|SyntaxError/i.test(errorMsg)){type_msg=getSyntax(errorMsg,UEInfo.browser)}else if(/RangeError|array\s+(?:length)?/i.test(errorMsg)){type_msg=getRangeError(errorMsg,UEInfo.browser)}else if(/TypeError|method|not a function/i.test(errorMsg)){type_msg=getTypeError(errorMsg,UEInfo.browser)}else if(/URIError|valid encoding|Malformed URI/i.test(errorMsg)){type_msg=getURIError(errorMsg,UEInfo.browser)}else{type_msg=['',errorMsg];}
UEInfo.browser_version=getBrowser(userAgent).version;UEInfo.message=type_msg[1];UEInfo.filename=getFileName(errorUrl);UEInfo.error_type=type_msg[0];UEInfo.url=window.location.href;UEInfo.line_number=errorLine;UEInfo.account=getIdentifier();UEInfo.retina=getRetina();UEInfo.raw_user_agent=userAgent;if(UEInfo.browser_version>8||UEInfo.domEvent!='click'){sendLog(UEUrl,UEInfo);}
getAnalyticsCode();return true;}
function getFileName(url){var fileName='';if(url&&url!=''){var begin=url.lastIndexOf("/")+1;fileName=url.substr(begin,url.length);}
return fileName;}
function getBrowser(ua){ua=ua.toLowerCase();var match=/(chrome)[ \/]([\w]+)/.exec(ua)||/(safari)[ \/]([\w]+)/.exec(ua)||/(firefox)[\/]([\w]+)/.exec(ua)||/(opera)(?:.*version)[ \/]([\w]+)/.exec(ua)||/(msie) ([\w]+)/.exec(ua)||ua.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w]+)|)/.exec(ua)||[];var browser=(match[1]||"");return{browser:browser.match(/msie/i)?'ie':browser,version:match[2]||"0"};}
function getRetina(){if(window.devicePixelRatio>1){return true;}else{return false;}}
function getIdentifier(){if(!(typeof ue_params==='undefined')&&(ue_params.length>0)){return ue_params[0];}
return'';}
function getAnalyticsCode(){var prefix=(("https:"==document.location.protocol)?"https://":"http://");var url=prefix+UEHost+'/analytics_code?account='+getIdentifier();var script=document.createElement('script');script.src=url;document.getElementsByTagName('head')[0].appendChild(script);}
function getReference(message,browser){var typemsg=[],refregexp={chrome:/(.*):\s+(.*?)\s+(?:is not defined)/,firefox:/(.*):\s+(.*?)\s+(?:is not defined)/,safari:/^(\w*):\s.*:\s+(\w*)$/,opera:/:\s+(\w*).*:\s+(\w*)$/,ie:/.*(\')(\w*)\'.*?undefined.*/};if(message&&message!==undefined){var match=refregexp[browser].exec(message);if(match&&match.length==3){typemsg[0]='ReferenceError';typemsg[1]=match[2]+' is not defined';}else{typemsg[0]='ReferenceError';typemsg[1]=message;}}
return typemsg}
function getSyntax(message,browser){var typemsg=[],refregexp={chrome:/(.*):.*\s+(.*?)$/,firefox:/(.*):\s+missing\s+(.*?)\s+.*/,safari:/(.*):.*\s+\'(.*?)\'$/,opera:/(.*)\s+at\s+.*?\'(.*?)\'.*/,ie:/.*?\s+(\')(.*?)\'/};if(message&&message!==undefined){var match=refregexp[browser].exec(message);if(match&&match.length==3){typemsg[0]="SyntaxError";typemsg[1]="expected token '"+match[2]+"'";}else{typemsg[0]='SyntaxError';typemsg[1]=message;}}
return typemsg}
function getRangeError(message,browser){var typemsg=[];typemsg[0]="RangeError";typemsg[1]="invalid array length";return typemsg}
function getTypeError(message,browser){var typemsg=[],refregexp={chrome:/(.*):.*\s+\'(.*?)\'$/,firefox:/(.*):\s+.*?\.(.*?)\s+.*/,safari:/(.*):.*\.(\w+).*$/,opera:/(.*):.*\.(\w+).*?is not.*$/,ie:/(Object doesn't).*\'(\w+).*/};if(message&&message!==undefined){var match=refregexp[browser].exec(message);if(match&&match.length==3){typemsg[0]="TypeError";typemsg[1]="has no method '"+match[2]+"'";}else{typemsg[0]='SyntaxError';typemsg[1]=message;}}
return typemsg}
function getURIError(message,browser){var typemsg=[];typemsg[0]="URIError";typemsg[1]="URI malformed";return typemsg}
function loadSource(url){try{var XMLHttpRequestWrapper;if(typeof(XMLHttpRequest)==='undefined'){XMLHttpRequestWrapper=function IEXMLHttpRequestSub(){try{return new ActiveXObject('Msxml2.XMLHTTP.6.0');}catch(e){}
try{return new ActiveXObject('Msxml2.XMLHTTP.3.0');}catch(e){}
try{return new ActiveXObject('Msxml2.XMLHTTP');}catch(e){}
try{return new ActiveXObject('Microsoft.XMLHTTP');}catch(e){}
throw new Error('No XHR.');};}else{XMLHttpRequestWrapper=XMLHttpRequest;}
var request=new XMLHttpRequestWrapper();request.open('GET',url,false);request.send('');return request.responseText;}catch(e){return'';}}
function getSource(url){var sourceCache={};var source;if(url.indexOf(document.domain)!==-1){source=loadSource(url);}else{source=[];}
sourceCache[url]=source.length?source.split('\n'):[];return sourceCache[url];}
function gatherContext(url,line){var source=getSource(url),context=[],hasContext=false;if(!source.length){return null;}
line-=1;for(var i=line,j=line+2;i<j;++i){context.push(source[i]);if(source[i]!==undefined){hasContext=true;}}
return hasContext?context:null;}
function guessFunctionName(url,lineNo){var reFunctionArgNames=/function ([^(]*)\(([^)]*)\)/,reGuessFunction=/['"]?([0-9A-Za-z$_]+)['"]?\s*[:=]\s*(function|eval|new Function)/,line='',maxLines=10,source=getSource(url),m;if(!source.length){return'?';}
for(var i=0;i<maxLines;++i){line=source[lineNo-i]+line;if(line!==undefined){if((m=reGuessFunction.exec(line))){return m[1];}else if((m=reFunctionArgNames.exec(line))){return m[1];}}}
return'?';}
function sendLog(url,info){var img=new Image();var prefix=(("https:"==document.location.protocol)?"https://":"http://");img.src=prefix+UEHost+url+"?"+serialize(info);}
function serialize(obj){var name,s=[];for(name in obj){s.push(name+"="+encodeURIComponent(obj[name]));}
return s.join("&");}
function getAllEvents(){var allElems=document.getElementsByTagName("*");var _return="";for(var i=0;i<allElems.length;i++){for(var name in allElems[i]){if(typeof allElems[i][name]==="function"&&/^on.+/.test(name)){_return+=allElems[i].nodeName+" -> "+allElems[i][name]+"\n";}}}
return _return;}
function getWhere(elem){if(elem.rangeParent){return elem.rangeParent.data;}else if(elem.target){return elem.target.innerText;}else{return elem.srcElement.innerContent;}}
function addHandler(target,eventType,handler){if(target.addEventListener){target.addEventListener(eventType,handler,true);}else{target.attachEvent("on"+eventType,handler);}}
this.run=function(){var error;while(errors.length>0){error=errors.shift();catchError(error);}}
this.catchError=function(args){if(args&&args!='undefined')handleErr(args[0],args[1],args[2]);}
return{run:run,catchError:catchError,handleErr:handleErr,sendLog:sendLog,addHandler:addHandler,getIdentifier:getIdentifier,_:{}};})();var loadTime=new Object();window.onload=function(){var loadTimeUrl="/loadtime";if(window.performance&&window.performance!=undefined){setTimeout(function(){var timeObj=window.performance.timing;loadTime.connect_time=timeObj.connectEnd-timeObj.connectStart;loadTime.request_time=timeObj.responseStart-timeObj.requestStart;loadTime.response_time=timeObj.responseEnd-timeObj.responseStart;loadTime.processing_time=timeObj.domComplete-timeObj.domLoading;loadTime.load_time=timeObj.loadEventEnd-timeObj.loadEventStart;loadTime.redirect_time=timeObj.redirectEnd-timeObj.redirectStart;loadTime.app_cache_time=timeObj.domainLookupStart-timeObj.fetchStart;loadTime.domain_lookup_time=timeObj.domainLookupEnd-timeObj.domainLookupStart;loadTime.total_time=timeObj.loadEventEnd-timeObj.navigationStart;loadTime.account_identifier=UEInfo.getIdentifier();var url=window.location.href;if((_index=url.indexOf('?'))>0){loadTime.url=url.substr(0,_index-1)}else{loadTime.url=url;}
loadTime.page_name=window.document.title;UEInfo.sendLog(loadTimeUrl,loadTime);},0);}}
UEInfo.run();