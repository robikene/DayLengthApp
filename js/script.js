/*script.js

Kaardi kuvamiseks kasutan Leaflet.js libraryt, mille abil kuvan OpenStreetMapsi kaarti.
Päikesetõusude ning loojangute arvutamiseks kasutan sun.js libraryt, mis on tasuta tarkvara ning laiendab JavaScripti Date objekti. 
Graafiku kuvamiseks kasutan Chart.js libraryt.
Olen kommentaaridena lisanud ka lingid, kust olen koodijuppe võtnud või inspiratsiooni saanud.

*/

let mymap = L.map('map').setView([58.375, 26.724], 13); //Tartu koordinaadid algkohaks.
let marker = null;
let popup = L.popup();
var myChart = null;

let latitude = null;
let longitude = null;

//Allikas - https://leafletjs.com/examples/quick-start/
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicm9iaWtlbmUiLCJhIjoiY2tuenZoZ2w0MDlvajJ2bXRmNHZrNjZqaSJ9.QnCMf-SXjYgpZrCXX9HtYg', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoicm9iaWtlbmUiLCJhIjoiY2tuenZoZ2w0MDlvajJ2bXRmNHZrNjZqaSJ9.QnCMf-SXjYgpZrCXX9HtYg'
}).addTo(mymap);

//Kaardile klikkides saadud koordinaadid
function onMapClick(e) { 
	removeMarker();

	latitude = e.latlng.lat;
	longitude = e.latlng.lng;
	document.getElementById("latitude").value = latitude; //Määrab kaardile klikitud koordinaadid ka tekstiväljade väärtuseks.
	document.getElementById("longitude").value = longitude;
	let date = new Date(document.getElementById("date").value); 
	let õigeLatitude = correctLat(latitude); //korrektne laiuskraad
	let pos = new L.latLng(õigeLatitude, longitude);
	marker = L.marker(pos).addTo(mymap);

	let latlngString = "Laiuskraad: " + õigeLatitude.toString() + ", pikkuskraad: " + longitude.toString();

	//Paistab, et kasutatatud sun.js library lõpetab korrektse Date objekti loomise lõunapolaarjoonest lõuna poole ning põhjapolaarjoonest põhja poole aegadel, kus seal on polaaröö/päev.
	let sunrise = date.sunrise(õigeLatitude, longitude);
	let sunset = date.sunset(õigeLatitude, longitude);
	
	showMessage(õigeLatitude, pos, latlngString, sunrise, sunset, date);
	
}

mymap.on('click', onMapClick);

//Abifunktsioon korrektse kuupäeva kontrollimiseks. Allikas: https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
function isValidDate(d) {
	return d instanceof Date && !isNaN(d);
}

//Arvutab korrektse laiuskraadi, st võimaldab kasutajal sisestada mittesobiva laiuskraadi, kuid kohandab ta sobivaks. Nt 120 kraadi puhul parandab selle 30-ks kraadiks, kuna laiuskraadid on vahemikus [-90;90]
function correctLat(latitude) {
	if (latitude > 90) { //Üle 90 ei sobi
		while (latitude > 90) {
			latitude -= 90;
		}
	}
	if (latitude < -90) { //Alla -90 ei sobi
		while (latitude < -90) {
			latitude += 90;
		}
	}
	return latitude;
}

//vana marker kustutatakse - idee saadud https://gis.stackexchange.com/questions/238414/adding-a-new-and-removing-an-old-marker-every-time-the-user-click-on-the-map
function removeMarker() {
	if (marker !== null) { 
		mymap.removeLayer(marker);
	}
}

//Tekstiväljadesse sisestatud koordinaadid
function address() {
	removeMarker();

	latitude = document.getElementById("latitude").value;
	longitude = document.getElementById("longitude").value;

	let date = new Date(document.getElementById("date").value); 
	let õigeLatitude = correctLat(latitude); //korrektne laiuskraad
	
	let pos = new L.latLng(õigeLatitude, longitude);
	marker = L.marker(pos).addTo(mymap);
	mymap.setView(pos); //viib kasutaja vaatega sisestatud koordinaatidele.

	let latlngString = "Laiuskraad: " + õigeLatitude.toString() + ", pikkuskraad: " + longitude.toString();

	let sunrise = date.sunrise(õigeLatitude, longitude);
	let sunset = date.sunset(õigeLatitude, longitude);

	showMessage(õigeLatitude, pos, latlngString, sunrise, sunset, date);
}

function showMessage(õigeLatitude, pos, latlngString, sunrise, sunset, dateDate) {
	//Kuna kasutusel olev sun.js ei võimalda polaarjoontest rohkem pooluse pool olevatest aladest täpseid andmeid arvutada, asendasin vigased andmed teatega polaarpäevast/ööst.
	if (!(isValidDate(sunrise) || isValidDate(sunset)) && õigeLatitude < 0 && (dateDate.getMonth() > 5 && dateDate.getMonth() < 8)) {
		addtoHtml(latlngString, "Lõunapoolusel on polaaröö!", "Lõunapoolusel on polaaröö!", "ca 0 tundi");
	} else if (!(isValidDate(sunrise) || isValidDate(sunset)) && õigeLatitude < 0 && (dateDate.getMonth() < 2 || dateDate.getMonth() > 11)) {
		addtoHtml(latlngString, "Lõunapoolusel on polaarpäev!", "Lõunapoolusel on polaarpäev!", "ca 24 tundi");
	} else if (!(isValidDate(sunrise) || isValidDate(sunset)) && õigeLatitude > 0 && (dateDate.getMonth() < 2 || dateDate.getMonth() > 11)) {
		addtoHtml(latlngString, "Põhjapoolusel on polaaröö!", "Põhjapoolusel on polaaröö!", "ca 0 tundi");
	} else if (!(isValidDate(sunrise) || isValidDate(sunset)) && õigeLatitude > 0 && (dateDate.getMonth() > 5 && dateDate.getMonth() < 8)) {
		addtoHtml(latlngString, "Põhjapoolusel on polaarpäev!", "Põhjapoolusel on polaarpäev!", "ca 24 tundi");
	} else { //Normaaljuhu korral kuvab andmed kõik ilusti.
		let length = lengthOfDay(sunrise, sunset);

		addtoHtml(latlngString, (sunrise.toLocaleString('en-GB', { timeZone: 'UTC'}).substring(12, 20)), (sunset.toLocaleString('en-GB', { timeZone: 'UTC'}).substring(12, 20)), length.getHours().toString() + " tundi, " + length.getMinutes().toString() + " minutit.");

		let popupString = popUpString(pos, sunrise, sunset, length);

		popupMessage(pos, popupString, mymap);
	}
}

//popup sõnum koordinaatidest - idee saadud https://leafletjs.com/examples/quick-start/
function popupMessage(pos, string, map) {
	popup
		.setLatLng(pos)
		.setContent(string)
		.openOn(map);
}

//Koostab kenas formaadis pop-up sõnumi.
function popUpString(pos, sunrise, sunset, length) {
	return "Vajutasid kohale koordinaatidel: " + 
	pos.toString().substring(7).slice(0, -1) + //koordinaadid
	".<br> Päikesetõus: " + 
	(sunrise.toLocaleString('en-GB', { timeZone: 'UTC'}).substring(12, 20)) + //päikesetõusu kellaaeg UTC
	" UTC, <br> Päikeseloojang: " + 
	(sunset.toLocaleString('en-GB', { timeZone: 'UTC'}).substring(12, 20)) + //päikeseloojangu kellaaeg UTC
	" UTC, <br> Päeva pikkus: " + 
	length.getHours().toString() + " tundi, " + length.getMinutes().toString() + " minutit."; //päeva pikkus ilusas formaadis
}

//Arvutab päeva pikkuse - kohandatud versioon allikast https://stackoverflow.com/questions/13903897/javascript-return-number-of-days-hours-minutes-seconds-between-two-dates
function lengthOfDay(sunrise, sunset) {
	if (sunset.getHours() < 12) { //Algne versioon sattus segadusse juhtudel, kus päike loojus pärast 00:00.
		var delta = Math.abs(sunset.setHours(sunset.getHours()+24) - sunrise) / 1000;
	} else {
		var delta = Math.abs(sunset - sunrise) / 1000;
	}

	let days = Math.floor(delta / 86400);
	delta -= days * 86400;

	let hours = Math.floor(delta / 3600) % 24;
	delta -= hours * 3600;

	let minutes = Math.floor(delta / 60) % 60;
	delta -= minutes * 60;

	let length = new Date(0);
	length.setHours(hours);
	length.setMinutes(minutes);
	return length;
}

//kajastab muutusi index.html failis
function addtoHtml(latlng, sunrise, sunset, length) {
	document.getElementById("latlng").innerHTML = latlng;
	document.getElementById("sunrise").innerHTML = "Päikesetõus: " + sunrise;
	document.getElementById("sunset").innerHTML = "Päikeseloojang: " + sunset;
	document.getElementById("length").innerHTML = "Päeva pikkus: " + length;
}

//Graafiku loomine

//abifunktsioon getDaysArray funktsiooni jaoks
function addDays(day) {
    var date = new Date(day);
    date.setDate(date.getDate() + 1);
	//Vaja on kuupäev võrreldavale kujule saada. https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
	month = '' + (date.getMonth() + 1);
	day = '' + date.getDate();
	year = '' + date.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

//Tekitab sisendina valitud päevade vahemikust Date objektide listi. Kohandatud versioon allikast https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
function getDaysArray() {
	var startDate = document.getElementById("startDate").value;
	var stopDate = document.getElementById("stopDate").value;
	var currentDate = startDate;
	var dateArray = new Array();

	//Käib kõik päevad vahemikus läbi
	while (currentDate < stopDate) {
		dateArray.push(new Date(currentDate));
		currentDate = addDays(currentDate);
	}

	return dateArray;
}

//Leiab antud koordinaatidel kõik kuupäevade vahemikku kuuluvate päevade pikkused ja tagastab nad listina.
function findDayLengthAtPlace() {
	removeMarker();

	latitude = document.getElementById("latitude").value;
	longitude = document.getElementById("longitude").value;
	
	let õigeLatitude = correctLat(latitude); //korrektne laiuskraad
	
	let pos = new L.latLng(õigeLatitude, longitude);
	marker = L.marker(pos).addTo(mymap);
	mymap.setView(pos); //viib kasutaja sisestatud koordinaatidele vaatega mugavuse mõttes.

	let daysArray = getDaysArray();
	let lengthsArray = new Array();
	let index = 0;

	//Käib kõik päevad läbi, lisab nende pikkused listi.
	while (index < daysArray.length) {
		let sunrise = new Date(daysArray[index]).sunrise(õigeLatitude, longitude);
		let sunset = new Date(daysArray[index]).sunset(õigeLatitude, longitude);
		let length = lengthOfDay(sunrise, sunset);
	
		let hours = length.getHours().toString();

		let minutes = (length.getMinutes()/6)*10; //kümnendsüsteemi peale ümber
		if (minutes < 10) { // muidu nt 2 on suurem kui 16
			minutes = '0' + minutes.toString();
		} else {
			minutes = minutes.toString();
		}
		let sobivLength = parseFloat(hours + '.' + minutes);
		
		lengthsArray.push(sobivLength);
		index++;
	}

	return lengthsArray;
}

//Kuvab graafiku. Kasutan graafiku kuvamiseks Chart.js - https://www.chartjs.org/
function createChart() {
	var lengthsArray = findDayLengthAtPlace();
	var daysArray = getDaysArray();
	let formatDays = new Array();
	let index = 0;

	while (index < daysArray.length) {
		let date = daysArray[index].toString().substring(4, 15); //Ilusale kujule.
		formatDays.push(date);
		index++;
	}

	var chart = document.getElementById("myChart");

	const data = {
		labels: formatDays,
		datasets: [{
			label: 'Päeva pikkus tundides',
			backgroundColor: 'rgb(255, 99, 132)',
    		borderColor: 'rgb(255, 99, 132)',
			data: lengthsArray,
			fill: false,
		}]
	};
	const config = {
		type: 'line',
		data,
		options: {
			responsive: true,
			maintainAspectRatio: true,
			showScale: false,
		}
	};
	
	//Uue graafiku loomisel kustutab vana alt ära
	if (myChart != null) {
		myChart.destroy();
		myChart = new Chart(chart, config);
	} else {
		myChart = new Chart(chart, config);
	}
	
}