var util = require('util');
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
var mongoose = require('mongoose');
var j = 0;

//--------------------------simulation de l'objet
// mongoose.connection.close();
// On se connecte à la base de données ne pas oubliez de lancer ~/mongo/bin/mongod dans un terminal !
 // mongoose.createConnection('mongodb://romain:romain@kahana.mongohq.com:10004/ciib_stage', function(err) {
 mongoose.connect('mongodb://heroku:heroku@kahana.mongohq.com:10004/ciib_stage', function(err) {
   if (err) { throw err; }
});
 
// Création du schéma pour les commentaires
var structure = new mongoose.Schema({
	siren : String,
	siret : String,
	name : String,
	dirigeant : String,
	type : String,
	Categorie : String,
	adresse : String,
	CapitalSocial : String, 
	chiffreAffaire : Object,
	resultatNet : Object,
	effectif :  Object,
	EBEN :  Object,
	RCAIN :  Object,
	ResulatExpoitation :  Object,
	ValeureAjoute :  Object,
	CapitauxPropres :  Object,
	Dettes :  Object,
	TotalPassif :  Object,
	ActifImmobilise : Object,
	ActifCirculant :  Object,
	TotalActif :  Object,
	tel : String,
	fax : String,
	prospection : String,
  
});
// On crée une instance du Model
exports.enregistrement = function(obj){
	// Création du Model pour les commentaires
	var text = mongoose.model('commentaires', structure);
	var monText = new text({ siren : obj.siren });
	monText.siret = obj.siret;
	monText.name = obj.name;
	monText.dirigeant = obj.dirigeant;
	monText.type = obj.type;
	monText.Categorie = obj.Categorie;
	monText.adresse = obj.adresse;
	monText.CapitalSocial = obj.CapitalSocial; 
	monText.chiffreAffaire = obj.chiffreAffaire;
	monText.resultatNet = obj.resultatNet;
	monText.effectif =  obj.effectif;
	monText.EBEN =  obj.EBEN;
	monText.RCAIN =  obj.RCAIN;
	monText.ResulatExpoitation =  obj.ResulatExpoitation;
	monText.ValeureAjoute =  obj.ValeureAjoute; 
	monText.CapitauxPropres =  obj.CapitauxPropres;
	monText.Dettes =  obj.Dettes;
	monText.TotalPassif =  obj.TotalPassif;
	monText.ActifImmobilise = obj.ActifImmobilise;
	monText.ActifCirculant =  obj.ActifCirculant;
	monText.TotalActif =  obj.TotalActif;
	monText.tel = obj.tel;
	monText.fax = obj.fax;
	monText.prospection = obj.prospection;
	console.log("une instance est creer");
	// on recupere la db 
	var query = text.find(null);
	query.where('siret', obj.siret).limit(1); // call back data ! a lire dans query.exec
	query.exec(function (err, data) {
	if (err) { throw err; }
	if(data.length == 0){
	//-----------------------------------------------------------
	monText.save(function (err) {
	  if (err) { throw err; }
	  console.log('Enregistrement dans la base de donnée !');
	  // On se déconnecte de MongoDB maintenant
	  // mongoose.connection.close();
	});
	//-----------------------------------------------------------
	}else{
		//-----------------------------------------------------------
		console.log("l'enregistrement existe deja !!");
		//------------------------------------------------------------
		// On va parcourir le résultat et on les afficher 
		var comm;
		for (var i = 0, l = data.length; i < l; i++) {
			comm = data[i];
			console.log('------------------------------');
			console.log('siren : ' + comm.siren);
			console.log('name : ' + comm.name);
		}
	}  
});
}

var selecAll = function(item){
	var text = mongoose.model('commentaires', structure);
	var query = text.find(null);
	query.select('*');
query.exec(function (err, data) {
  if (err) return handleError(err);
  console.log(data); // Space Ghost is a talk show host.
})
}
// selecAll("name");
// exports.enregistrement(obj);

//-------------------------------------------------------------supression All------------------------------------- 
var suppressionAll = function(){
var text = mongoose.model('commentaires', structure);
// text.remove({ siret : '1' }, function (err) {
text.remove('*', function (err) {
  if (err) { throw err; }
  console.log('enregistrement supprimé');
}); 
}
//-------------------------------------------------------------supression siren------------------------------------- 
var suppression = function(siren){
var text = mongoose.model('commentaires', structure);
text.remove({ siret : ''+siren }, function (err) {
  if (err) { throw err; }
  console.log('enregistrement supprimé');
}); 
}
// suppressionAll();
// suppression(2);
//-----------------------------------------------------------------------------------------------------------------------
exports.prospection = function(that, fonc, paquets){
// console.log("-------2-------"+that);
// console.log(fonc+"-----2---------");
// console.log("fonction2");
// console.log(paquets);
	var prospect = new Array();
	var tabSiren = new Array();
	var text = mongoose.model('commentaires', structure);
	var query = text.find(null);
	query.select("CapitalSocial siren type").where('CapitalSocial').gte(paquets.capitalSocial);;
	query.exec(function (err, data) {
	if (err) return Error(err);
	// console.log(data);
	console.log("fonction3");
	for(tmp=0; tmp<data.length; tmp++){
		 tabSiren.push(data[tmp].siren); 
	 }
	// console.log(tabSiren);
	filtre(that, fonc, prospect,tabSiren, paquets);
})
}
var filtre = function(that, fonc, prospect, tabSiren, paquets){
	var text = mongoose.model('commentaires', structure);
	var query = text.find(null);
		query.select("siren type effectif chiffreAffaire resultatNet prospection fax name").where('siren').equals(tabSiren[j]);
		query.exec(function (err, data) {
		if (err) return handleError(err);
			if((data[0]) &&(data[0].type.indexOf(paquets.formeJuridique) >= 0)){
				if((data[0].effectif)&&(data[0].effectif.n1 >= paquets.nombreEmployes)){ //&& ((data[0].chiffreAffaire.evolution[0]) == "+")){
						if((data[0].resultatNet)&&(data[0].resultatNet.n1)&&((data[0].resultatNet.n1) >= paquets.resultatNet)){
							if((data[0].chiffreAffaire)&&(data[0].chiffreAffaire.n1)&&((data[0].chiffreAffaire.n1) >= paquets.chiffreAffaire)){
								if((evolution_chiffre_Affaire = "+")&&(data[0].chiffreAffaire)&&(data[0].chiffreAffaire.evolution[0])&&((data[0].chiffreAffaire.evolution[0]) == "+")){
									if((evolution_resultat_Net = "+")&&(data[0].resultatNet)&&(data[0].resultatNet.evolution[0])&&((data[0].resultatNet.evolution[0]) == "+")){
										if(data[0].prospection = "false"){
											// console.log(data[0]);
											prospect.push(data[0]);
											// console.log("11111111111111111");
										}else{
											console.log("la societé a déja été prospecté");
										}
									
									}else if(((!data[0].chiffreAffaire)) ||((!data[0].chiffreAffaire.n1))){
										if(data[0].prospection = "false"){
											// console.log(data[0]);
											prospect.push(data[0]);
											// console.log("222222222222222222");
										}else{
											console.log("la societé a déja été prospecté");
										}
									}
								}else if(((!data[0].resultatNet)) ||((!data[0].resultatNet.n1))){
										if((evolution_resultat_Net = "+")&&(data[0].resultatNet)&&(data[0].resultatNet.evolution[0])&&((data[0].resultatNet.evolution[0]) == "+")){
										if(data[0].prospection = "false"){
											// console.log(data[0]);
											prospect.push(data[0]);
											// console.log("333333333333333333");
										}else{
											console.log("la societé a déja été prospecté");
										}
									
									}else if((!(data[0].chiffreAffaire)) ||(!(data[0].chiffreAffaire.n1))){
										if(data[0].prospection = "false"){
											// console.log(data[0]);
											prospect.push(data[0]);
											// console.log("444444444444444444");
										}else{
											console.log("la societé a déja été prospecté");
										}
									}
								}
							}
						}
					}
			}
			if(tabSiren[j++]){
				filtre(that, fonc, prospect, tabSiren, paquets);;
			}else{
			// console.log(prospect);
			console.log("c'est fini ");
			that[fonc](prospect);
			// mongoose.connection.close();
			}
		})	
}
// prospection();
