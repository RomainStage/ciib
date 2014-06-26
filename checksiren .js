var fs = require ("fs");
var tableauglobal = new Array();

/*
fait de 501.000.000 à 501.028.427
*/

var i = 501013595;

for (i;i<501040000;i++){
	siren = i.toString();
	if (checksiren(siren)){
		tableauglobal.push(siren);
	}

}

fs.writeFileSync("./siren.json", JSON.stringify(tableauglobal));

function checksiren(siren){

var b = siren.split('');//on stock chacque chiffre dans une colonne de tableau
var somme = 0;
b.reverse();

for (var i = 0 ; i<9 ; i++){// pour la position 0 à la position 8 du tableau
//attention car la on commence à la position 0 et non à la position 1
	if(i%2==0){//il faut faire *1
		tmp = b[i];
		somme += parseInt(tmp);
	}
	else{//il faut faire *2
			tmp = b[i]*2;
			if (tmp > 9 ){
				tmp -= 9;
			}
		somme += parseInt(tmp);
	}
}

if ((somme%10) == 0){
return true;
}
else return false;

}


