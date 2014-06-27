/*
Fonction addUSer qui ne sert à rien sachant qu'on peut le faire via l'api !
pour créer la collection, il faut ABSOLUTMENT lancer createCol qui créer une "clef primaire" ou "index" sur le mail/numero évitant ainsi les doublons

*/

var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
    
    
exports.addUser = function(str, str1){//fonction pour ajouter un USER
MongoClient.connect('mongodb://romain:romain@kahana.mongohq.com:10004/ciib_stage', function(err, db) {
    if(err) throw err;
		db.addUser(str, str1, function(err, result) {
		console.log(result);
		db.close();
    });
});
};

exports.createCol = function(){//creer une collection avec une clef sur le email
MongoClient.connect('mongodb://romain:romain@kahana.mongohq.com:10004/ciib_stage', function(err, db) {
    if(err) throw err;
    
    db.createCollection("test_insert",function (err, inserted) {
    // check err...
    }
    );
    var collection = db.collection('test_insert');
     collection.ensureIndex({email:1},{unique:true},function (err, inserted) {
    // check err...
    }
    );
   	
})};//créer collection avec index, clef sur mail

exports.insert = function(data){//inserer le formulaire  
MongoClient.connect('mongodb://heroku:heroku@kahana.mongohq.com:10004/ciib_stage', function(err, db) {
    if(err) throw err;
	
	
	
    var collection = db.collection('commentaires');

	
    collection.insert(data, function(err, docs) {
    if (err){//si il y a un doublon, on supprime le doc et on le crée
    	collection.remove({dax:data.fax},function(err){
    	if (err){//si erreur de suppression
    		console.log("erreur de suppression : "+err);
    		//res.end(JSON.stringify({message: "ko"}));
    	}
    	else{ 
			collection.insert(data,function(err){
			if (err){//si erreur d'insertion
				console.log('mis a jour erreur : '+err);
				//res.end(JSON.stringify({message: "ko"}));
			}
			else {
			//res.end(JSON.stringify({message: "ok"}));
			console.log("MaJ ok");
			}
    		});
    	}
    	});
    	
   		res.end(JSON.stringify({message: "ko"}));
    }else{
        collection.count(function(err, count) {
            console.log(format("count = %s", count));
            //res.end(JSON.stringify({message: "ok"}));
            db.close();
        });
    }
    });
});
};//pour insérer un élément pour le formulaire

exports.find = function(res){//fonction qui renvoi TOUS les formulaires NON archivé

MongoClient.connect('mongodb://romain:romain@kahana.mongohq.com:10004/ciib_stage', function(err, db) {
    if(err) throw err;

    var collection = db.collection('test_insert');
    // Locate all the entries using find

    
    collection.find({archive: false}).toArray(function(err, results) {
    	if(err) console.log(err);
    	console.log("demande d'affichage");
        res.end(JSON.stringify(results));
        // Let's close the db
       db.close();
    });
});
};//pour recevoir les entreprise non archivées

exports.findArchive = function(res){//fonction qui renvoi TOUS les formulaires qui SONT archivé

MongoClient.connect('mongodb://romain:romain@kahana.mongohq.com:10004/ciib_stage', function(err, db) {
    if(err) throw err;

    var collection = db.collection('test_insert');
    // Locate all the entries using find

    
    collection.find({archive: true}).toArray(function(err, results) {
    	console.log("affichage");
        res.end(JSON.stringify(results));
        // Let's close the db
       db.close();
    });
});
};//pour recevoir les entreprises archivées

exports.archiver = function(mail, res){//pour archiver une entreprise. 
MongoClient.connect('mongodb://romain:romain@kahana.mongohq.com:10004/ciib_stage', function(err, db) {
    if(err) throw err;
    
    var collection = db.collection('test_insert');
    
    collection.update({email:mail},{$set:{archive: true}},function(err){
    if(err) console.log(err);
    collection.find({archive: false}).toArray(function(err, results) {
    	if(err) console.log(err);
    	console.log("Deamnde d'affichage");
        res.end(JSON.stringify(results));
        // Let's close the db
       db.close();
    });
   

    });//remove
});//mongoclient
};

exports.signin = function(data, res){
/* tout d'abord on essaye de se connecter à la DB avec le MDP et PWD entré dans la page SINGIN
	si erreur on renvoi erreur
	sinon on continue
*/
MongoClient.connect('mongodb://'+data.login+':'+data.pwd+'@kahana.mongohq.com:10004/ciib_stage', function(err, db) {
    if(err){
//    	throw err;
    	console.log(err);
    	res.end(JSON.stringify({message: "signin-error"}));
    	return;
    }
/*on créer un cookie composé des 3 premiere lettre du login et dun nombre aléatoire de 10 ou 9 chieffre
	puis on insère dans la collection DB le login, le MDP associé, le cookie, et la date de création du cookie
	si existe deja on remplace
 */
    var collection = db.collection('cookie');    
	var cookieValue =  data.login.substring(0,3) + Math.floor(Math.random() * 100000000);//on nomme le cookie
	var cookieExpire;
	console.log("aaaaaaa"+data.rememberme);
	if (data.rememberme == true){
	cookieExpire = new Date(new Date().getTime()+604800000).toUTCString();//si on coche le bouton rememberme, expire au bout de un mois
	}else{
	cookieExpire = new Date(new Date().getTime()+900000).toUTCString();//sinon expire au bout de une heure
	}
	collection.update({log: data.login},{log: data.login, cookie: cookieValue, cookieDate: new Date()}, { upsert: true }, function(err, docs){
	if (err){
		console.log(err);
		res.end(JSON.stringify({message: "ko"}));
		db.close();
	}else{
		res.writeHead(200, {"Content -Type": "application/json", "Set-Cookie" : 'cookieName='+cookieValue+';expires='+cookieExpire});
		res.end(JSON.stringify({message: "ok"}));
		db.close();
	}
	});
});//fonction pour la page signin
};

exports.valid_cookie = function(c, obj, fct){
/*
Explication :

Si le cookie existe
	Si le cookie existe dans la collection cookie de la DB
		alor on renvoi true
		
*/
if (c){
MongoClient.connect('mongodb://romain:romain@kahana.mongohq.com:10004/ciib_stage', function(err, db) {
    if(err) throw err;
    
	var collection = db.collection('cookie');
	c = c.split("=");//car c ="cookieName=rom19282839" par excemple donc on eneleve le cookieName
	 collection.find({cookie: c[1]}).toArray(function(err, results) {
	
	 if (err){
	 	console.log(err);
	 	obj[fct](false);	 
	 }else if (results[0]){
	 	obj[fct](true);	 
	 }else if (!results[0]){
	 	obj[fct](false);	 
	 }
	 
	 });	
})
}else{
	obj[fct](false);	 
}
};//fonction qui verifie si le cookie existe


