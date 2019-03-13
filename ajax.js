function createXHR(){
    var xhr = null,
        ary = [
            function(){
                return new XMLHttpRequest;
            },
            function(){
                return new ActiveXObject('Microsoft.XMLHTTP');
            },
            function(){
                return new ActiveXObject('Msxml2.XMLHTTP');
            },
            function(){
                return new ActiveXObject('Msxml3.XMLHTTP');
            }
        ],
        flag = false;
    for(var i=0,len = ary.length;i<len;i++){
        var curFn = ary[i];
        try{
            xhr = curFn();
            //将createXMR重新赋值
            createXHR = curFn;
            flag = true;
            //当有一种情况符合时就不再向下执行
            break;
        }catch(e){

        }
    }
    if(!flag){
        throw new Error('你的浏览器不支持ajax，请换一个浏览器');
    }
    return xhr
}
function ajax(options){
    var _default = {
        url:'',
        type:'get',
        dataType:'json',
        async:true,
        data:null,
        getHead:null,
        success:null,
    };
    for(var key in options){
        if(options.hasOwnProperty(key)){
            _default[key] = options[key];
        }
    }
    if(_default.type === 'get'){
        _default.url.indexOf('?')>=0 ? _default.url+='&' : _default.url+='?';
        _default.url += '_='+Math.random();
    }
    var xhr = createXHR();
    xhr.open(_default.type,_default.url,true);
    xhr.onreadystatechange = function(){
        if(/^2\d{2}$/.test(xhr.status)){
            if(xhr.readyState === 2){
                if(typeof _default.getHead === 'function'){
                    _default.getHead.call(xhr);
                }
            }
            if(xhr.readyState === 4){
                var val = xhr.responseText;
                if(_default.dataType === 'json'){
                    val = "JSON" in window ? JSON.parse(val) : eval("("+val+")");
                    if(typeof _default.success === 'function'){
                        _default.success.call(xhr,val);
                    }
                }
            }
        }
    }
    xhr.send(_default.data);
}
