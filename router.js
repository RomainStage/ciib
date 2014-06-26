var util = require("util"); 
var url = require("url"); 
var fs = require("fs");
//var db = require("./db.js");
/**
* This method is used to process the request * @param req (Object) the request object
* @param resp (Object) the response object */

exports.router = function (req, resp) {
	var inc_request = new srouter(req, resp);
	inc_request.run();
	inc_request = null;
};

/* --------*/

srouter = function (req, resp) {
	 if (req && resp) {
			this.req = req;
			this.resp = resp;
			this.pathname = "";
			this.filetype = "";
			this.path = "";
			this.image_file = "jpg png jpeg bmp gif"; 
	} else {
			util.log("ERROR - A srouter object need a request and a response object");
			return;
			}
};

srouter.prototype = {
run:
	function () { 
		this.rest_method	();
	},

rest_method:
	function () {
		if (this.req.method == "GET") { 
			this.get_method();
		} else if (this.req.method == "POST") {
			this.post_method();
		} else {
			this.resp.writeHead(501, {"Content -Type": "application/json"});
			this.resp.write(JSON.stringify({message: "Not Implemented"}));
			this.resp.end();
			return;
		}
},



get_method:
	function () {
		var u = url.parse(this.req.url, true, true);
		var regexp = new RegExp("[/]+", "g");
		this.pathname = u.pathname.split(regexp);
		this.pathname = this.pathname.splice(1, this.pathname.length - 1); this.filetype = this.pathname[this.pathname.length - 1].split(".");
		this.filetype = this.filetype[this.filetype.length - 1];
		this.path = "." + u.path; //the website is one directory upper than the node server
		if (u.path == "/html/admin.html")//pour voir dans quel page on va
			{
				//console.log("==============+++++++==========");
				db.valid_admin(this.req.headers.cookie, this, "check_user");//on verifie si c un user
			}
		else{
		this.read_file();
		}
		},

check_user:
	function (ret) {

		if (ret) {
			//console.log("ADDDDDDDDDMIIIIINNNNNNNN");
			this.read_file();
		}else{
			//console.log("PAS ADDDDDDDMIIIINNN");
			this.path = ".."+"/html/accueil.html";
			this.read_file();
			
		}
	},

post_method:
	function (){
		var _this = this;
        var buff = "";
        this.req.on("data", function (c) {
            buff += c;
        });
        this.req.on("end", function () {
            _this.go_post(buff);
        });
    },
    
go_post:
	function (b) {
		b = JSON.parse(b);
		this.b = b;
		if (b.action == "transmettre") {
			db.insert(b, this.resp);
		} 
		else if (b.action == "recevoir"){
		
			db.find(this.resp);
						
		}else if(b.action == "recevoir-archive"){
			db.findArchive(this.resp);
		}else if(b.action == "archiver"){
			db.archiver(b.id,this.resp);
		}
		
		else {
			//db.valid_cookie(this.req.headers.cookie, this, "cb_cookie");
			//console.log("======+++++++===="+ this);
			//exports.valid_cookie = function (cookie, obj, cb) {
			// /* stuff */
			// obj[cb](true/false);
		}
		
		
		
	},

cb_cookie:
	function (ret) {
	
		var b = this.b;
		if (ret) {

/*++++++++++++++++++++++++++++++GET ID JS++++++++++++++++++++++++++++*/			
			if (b.ac == 'get-id'){
				this.resp.writeHead(200, {"Content -Type": "application/json"});

				db.get_id(this.req.headers.cookie, this.resp);
				return;
			}

/*+++++++++++++++++++++++++++++++++++++++++ADMIN++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

			/*+++++++++++++++++++++++++++++++++++++++++on recup les id+++++++++++++++++++++++++*/
			else if(b.ac == "get-content2"){
				this.resp.writeHead(200, {"Content -Type": "application/json"});
				db.get_id_admin(this.resp);
				//console.log("router");
				return;
			}
			/*++++++++++++++++++++++++++++set un compte en admin ou en normal ou en suspend+++++++++++++++++++++++++*/
			else if (b.ac == "set-account-admin"){
				this.resp.writeHead(200, {"Content -Type": "application/json"});
				db.set_account_admin(b.id, b.statue, this.resp);
				return;
			}
/*================pour supprimer un cookie ++++++++++++++++++++++++++++++++++++++++*/
			else if (b.ac == "delete-cookie"){
			
				this.resp.writeHead(200, {"Content -Type": "application/json"});
				db.delete_cookie(this.req.headers.cookie, this.resp);
				return;
			}

		

/*+++++++++++++++++++++++++++POUR LA PAGE SETTINGS+++++++++++++++++++++++++++++*/
	
			// on envoie à la db via le cookie, le mdp récupérer dans settings.html via settings.js
			else if (b.ac == "change-mdp") {
			this.resp.writeHead(200, { "Content-Type": "application/json" });
				db.change_mdp(this.req.headers.cookie, b.password, b.npassword, this.resp);
				return;
			// DONE Récupérer dans la db, le mdp selon l'id présent ds le cookie
			
			}
			
			// on envoie à la db via le cookie, l'email récupérer dans settings.html via settings.js
			else if (b.ac == "change-email") {
			this.resp.writeHead(200, { "Content-Type": "application/json" });
				db.change_email(this.req.headers.cookie, b.email, b.pw, this.resp);
				return;
			}
			
			// on envoie à la db via le cookie, le mdp récupérer dans settings.html via settings.js
			else if (b.ac == "delete-account") {
			this.resp.writeHead(200, { "Content-Type": "application/json" });
				db.delete_account(this.req.headers.cookie, b.pwd, this.resp);
				return;
			}
			
			
		
		
		/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
		}
				
		util.log("INFO - Action not found : " + b.ac);
		//this.resp.writeHead(501, {"Content -Type": "application/json"});
		this.resp.end(JSON.stringify({message: "nocookie"}));
		
	},

		
read_file:
function () {
	console.log(util.inspect(this.pathname));
	if (!this.pathname[0] || this.pathname[0] == "nodejs") {
		//util.log("ALERT - Hack attempt, resquest on : " + util.inspect(this.pathname)
		this.pathname = "./index.html";
		this.path = "./index.html";
		this.filetype = "html";
	}
	
	
	this.load_file();	
},
	
load_file:
	function () {
		var _this = this;
		fs.exists(this.path, function (ex) {
			if (ex) {
				fs.readFile(_this.path, function (e, d) {
					if (e) {
						util.log("ERROR - Problem reading file : " + e);
					} else {
						_this.file = d;
						util.puts("GET on path : " + util.inspect(_this.path));
						_this.file_processing();
			} });
			} else {
				util.log("INFO - File requested not found : " + _this.path);
				_this.resp.writeHead(404, {"Content -Type":"text/html"});
				_this.resp.end(); 
			}
		});
	},
	
file_processing:
	function () {
		if (this.filetype == "htm") {
			this.resp.writeHead(200, {"Content -Type": "text/html"});
		} else if (this.image_file.indexOf(this.filetype) >= 0) {
			this.resp.writeHead(200, { "Content-Type" : "image/" + this.filetype });
		} else {
			this.resp.writeHead(200, { "Content-Type" : "text/" + this.filetype });
		}
		this.file_send();
	},
	
file_send:
function () {
	this.resp.write(this.file);
	this.resp.end();
	}
};




var a = {a: "arg1" , b: 3 };
