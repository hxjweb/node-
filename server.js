var http = require('http'),
    fs = require('fs'),
    url = require('url');
var server = http.createServer(function(req,res){
    var urlObj = url.parse(req.url,true);
    var pathname = urlObj.pathname;
    var query = urlObj.query;
    //处理静态文件
    var reg = /\.(HTML|JS|CSS|ICO)/i;
    if(reg.test(pathname)){
        var suffix = reg.exec(pathname)[1].toUpperCase();
        var suffixMIME = "text/html";
        switch(suffix){
            case "CSS":
                suffixMIME = "text/css";
                break;
            case "JS":
                suffixMIME = "text/javascript";
                break;
        }
        try{
            var conFile = fs.readFileSync('.'+pathname,'utf-8');
            //重写请求头
            res.writeHead(200,{'content-type':suffixMIME+';charset=utf-8;'});
            res.end(conFile);
        }catch(e){
            res.writeHead(404,{'content-type':'text/plain;charset=utf-8;'});
            res.end("file is not found");   
        }
    }
    //API接口 获取全部用户信息
    var con = null,
        result = {},
        customPath = './json/customer.json';
    con = fs.readFileSync(customPath,'utf-8');
    //如果是''是不能使用parse方法的
    con.length === 0 ? con = '[]':null;
    con = JSON.parse(con);
    if(pathname === '/getList'){
        result.code = con.length === 0 ? 1:0;
        result.msg = con.length ===0 ? '暂无客户信息':'';
        result.data = con;
        res.writeHead(200,{'content-type':'application/json;charset:utf-8'});
        res.end(JSON.stringify(result));
        return;
    }

    //根据id获取某用户的信息
    var result = {
        code:1,
        msg:'未找到客户信息',
        data:[]
    },
        customId = null,
        customPath = './json/customer.json';
    if(pathname === '/getInfo'){
        customId = query.id;
        for(var i=0,len=con.length;i<len;i++){
            if(con[i].id == customId){
                result = {
                    code:0,
                    msg:'找到该客户信息',
                    data:con[i]
                }
                break;
            }
        }
        res.writeHead(200,{'content-type':'application/json;charset:utf-8'});
        res.end(JSON.stringify(result));
        return;
    }
    
    //根据id删除客户信息
    var result = {
        code:1,
        msg:'删除失败',
    },
        flag = false,
        customId = null,
        customPath = './json/customer.json';
    if(pathname === '/removeInfo'){
        customId = query.id;
        for(var i=0,len=con.length;i<len;i++){
            if(con[i].id == customId){
                con.splice(i,1);
                flag = true;
                result = {
                    code:0,
                    msg:'删除成功'
                };
                break;
            }
        }
        if(flag){
            fs.writeFileSync(customPath,JSON.stringify(con),'utf-8');
            res.writeHead(200,{'content-type':'application/json;charset:utf-8'});
            res.end(JSON.stringify(result));
        }
        return;
    }

    //增加客户信息
    if(pathname === '/addInfo'){
        var str = '';
        //获取客户端通过主题传进来的内容
        req.on('data',function(content){
            //每次接收的内容是一部分，content就是接收的这一部分，我们需要把它拼接起来
            str += content;
        })
        req.on('end',function(){
            console.log(str);
            if(str.length === 0){
                res.writeHead(200,{'content-type':'application/json;charset:utf-8'});
                result = {
                    code:1,
                    msg:'增加失败'
                };
                res.end(JSON.stringify(result));
            }else{
                var data = JSON.parse(str),
                    lastId = con.length === 0 ? 0:con[con.length-1].id;
                data.id = lastId+1;
                con.push(data);
                fs.writeFileSync(customPath,JSON.stringify(con),'utf-8');
                res.writeHead(200,{'content-type':'application/json;charset:utf-8'});
                res.end(JSON.stringify({
                    code:0,
                    msg:'增加成功'
                }));
            }
        })
        return;
    }

    //修改客户信息
    if(pathname === '/editInfo'){
        var str = '',
            result = {
                code:1,
                msg:'修改失败'
            };
        req.on('data',function(content){
            str += content;
        })
        req.on('end',function(){
            if(str.length === 0){
                res.writeHead(200,{'content-type':'application/json;charset:utf-8'});
                res.end({
                    code:1,
                    msg:'修改失败'
                })
                return;
            }else{
                var info = JSON.parse(str),
                    flag = false;
                for(var i=0,len=con.length;i<len;i++){
                    if(info.id == con[i].id){
                        con[i] = info;
                        flag = true;
                        break;
                    }
                }
                if(flag){
                    result = {
                        code:0,
                        msg:'修改成功'
                    }
                }
                fs.writeFileSync(customPath,JSON.stringify(con),'utf-8');
                res.writeHead(200,{'content-type':'application/json;charset:utf-8'});
                res.end(JSON.stringify(result));
            }
        })
    }
})
server.listen(83,function(){
    console.log('已监听83端口');
})