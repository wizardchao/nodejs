var http = require('http');			
var cheerio = require('cheerio');	
var fs = require("fs");				

var queryHref = "http://www.haha.mx/topic/1/new/"; 	
var querySearch = 1;								
var urls = [];

var sumConut = 0;
var reptCount = 0;		
var downCount = 0;		



function getHtml(href, serach) {
	console.log("getting "+serach + " page");
	var pageData = "";
	var req = http.get(href + serach, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			pageData += chunk;
		});

		res.on('end', function() {
			$ = cheerio.load(pageData);
			var html = $(".joke-list-item .joke-main-content a img");
			
			for(var i = 0; i < html.length; i++) {
				var src = html[i].attribs.src;
				if (src.indexOf("http://image.haha.mx") > -1) {
					urls.push(html[i].attribs.src)
				}
			}
			// 递归调用
			if (serach < pagemax) {
				getHtml(href, ++serach);
			} else {
				console.log("Success！");
				sumConut = urls.length;
				console.log("TOTAL：" + urls.length);
				console.log("Load......");
				downImg(urls.shift());
			}
		});
	});
}



function downImg(imgurl) {
	var narr = imgurl.replace("http://image.haha.mx/", "").split("/")

	var filename = "./upload/topic1/" + narr[0]  + narr[1] + narr[2] + "_" + narr[4];
	fs.exists(filename, function(b){
		if (!b) {

			http.get(imgurl.replace("/small/", "/big/"), function(res) {
				var imgData = "";
				
				res.setEncoding("binary"); 
		
				res.on("data", function(chunk) {
					imgData += chunk;
				});
				
				res.on("end", function() {
					var savePath = "./upload/topic1/" + narr[0]  + narr[1] + narr[2] + "_" + narr[4];
					fs.writeFile(savePath, imgData, "binary", function(err) {
						if(err) {
							console.log(err);
						}  else {
							console.log(narr[0]  + narr[1] + narr[2] + "_" + narr[4]);
							if (urls.length > 0) {
								downImg(urls.shift());
								downCount++;
								console.log("剩余图片数量....");
							}
						}
					});
				});
			});
		} else {

			console.log("Already exits.");
			reptCount++;
			if (urls.length > 0) {
				downImg(urls.shift());
			}
		}
	});
	
	if (urls.length <= 0) {
		console.log("Success!");
		console.log("replace：" + reptCount);
		console.log("Already load：" + downCount);
	}
}

var pagemax = 1;		
var startindex = 1;		

function start(){
	console.log("get the link");
	getHtml(queryHref, startindex);
}

start();