var map = L.map('mapid').setView([46.8, 2], 6);
console.log('map')
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWlja2FlbG1hcmNoZXNlIiwiYSI6ImNrMnl6ZWRtbDBhbzYzaXA4ZTk1YmI0Y3AifQ.qppfRuFTjKL-kUQdiwV9vA', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1
    }).addTo(map);

var airport = L.icon({
    iconUrl: 'img/airport.png',
    iconSize: [32, 32]
});
var airport_bounce = L.icon({
    iconUrl: 'img/airport_orange.png',
    iconSize: [32, 32]
});
var topvilles=['BORDEAUX','TOULOUSE','MONTPELLIER','MARSEILLE','PAU','BIARRITZ','TOULON','PARIS'];
var villesalter=[]
var CO2_avion=128,
 CO2_total=0,
 CO2_train=0,
 co2speed=5000,
 cmax=241000000000,
 ctotal=879653000000,
 pix=(1/cmax) * 40;
var gares = L.layerGroup(),
    aeroports=L.layerGroup(),
    aerotop5still=L.layerGroup(),
    aeroalter=L.layerGroup(),
    aerotop5bounce=L.layerGroup(),
	vols=L.layerGroup(),
    vols5h=L.layerGroup(),
    train=L.layerGroup(),
    volsco2=L.layerGroup();
    
d3.csv("liste-villes.csv", function(data){
   if(data.type=='G'){
	   L.circle([data.lat,data.long],{radius: 5,color:'#2A9D8F',opacity:0.9}).addTo(gares);
   }
   else {
       if(topvilles.includes(data.commune)){
           L.marker([data.lat,data.long],{icon:airport,bounceOnAdd: true,bounceOnAddOptions: {duration: 500,height:50, loop: 1}}).bindTooltip(data.commune).addTo(aerotop5still);
           L.marker([data.lat,data.long],{icon:airport_bounce,bounceOnAdd: true,bounceOnAddOptions: {duration: 500,height:5, loop: -1}}).bindTooltip(data.commune).addTo(aerotop5bounce);
        }
        else
        L.marker([data.lat,data.long],{icon:airport,bounceOnAdd: true,bounceOnAddOptions: {duration: 500,height:50, loop: 1}}).bindTooltip(data.commune).addTo(aeroports);
	
	}
});
var boptions = {
        color: 'rgb(145, 146, 150)',
        fillColor: 'rgb(145, 146, 150)',
        dashArray: 8,
        opacity: 0.8,
        weight: '1',
        iconTravelLength: 0.9, //How far icon should go. 0.5 = 50%
        iconMaxWidth: 50,
        iconMaxHeight: 50,
        fullAnimatedTime: 7000,// animation time in ms
        easeOutPiece: 4, // animation easy ou time in ms
        easeOutTime: 2500, // animation easy ou time in ms
    };
    L.bezier({
        path: [
            [
                {lat: 7.8731, lng: 80.7718},
                {lat: -18.7669, lng: 46.8691},
            ]
        ],

        icon: {
            path: "img/train.png"
        }
    }, boptions).addTo(map);
d3.csv("flux.csv", function(data){
    L.curve(['M',[data.lat1,data.long1],'L',[data.lat2,data.long2]],{color:'#3d5a80',fill:false,weight:data.nbvols/2300,animate:{duration:1500,easing:'ease-out'}}).bindTooltip(data.Origine+' - '+ data.Destination+' : '+(data.nbvols).toLocaleString()+' dessertes en 2019',{ permanent: (data.Origine=='PARIS' && data.Destination=="TOULOUSE") }).addTo(vols);    
    if(data.train){
        heures=Math.floor(data.train/3600,0)
        minutes=Math.floor((data.train-(heures*3600))/60,0)
        //villes pour lesquelles une alternative en train existe
        if(!villesalter.includes(data.Origine)){
            L.marker([data.lat1,data.long1],{icon:airport}).bindTooltip(data.Origine).addTo(aeroalter);
            villesalter.push(data.Origine)
        }
        if(!villesalter.includes(data.Destination)){
            L.marker([data.lat2,data.long2],{icon:airport}).bindTooltip(data.Destination).addTo(aeroalter);
            villesalter.push(data.Destination)
        }
        L.curve(['M',[data.lat2,data.long2],'L',[data.lat1,data.long1]],{color:'#E76F51',fill:false,weight:data.nbvols/2300,animate:{duration:1000}}).bindTooltip('<span class="orange">'+data.Origine+' - '+ data.Destination+' : '+heures+'h'+minutes+' en train</span>',{ permanent: (data.Origine=='PARIS' && data.Destination=="TOULOUSE") }).addTo(vols5h);
        c=data.passagers*data.distance*CO2_avion
        t=data.passagers*data.CO2
        //opacity:(c/cmax)+0.1,weight:c/(cmax/40),animate:{duration:co2speed}
        popupa = '<span class="gris">'+data.Origine+' - '+data.Destination+' en avion :<br> '+(Math.round(c/1000000)).toLocaleString()+' tonnes de CO2 en 2019</span>';
        popupt = '<span class="vert">'+data.Origine+' - '+data.Destination+' :<br> '+(Math.round((c/1000000) - (t/1000000) )).toLocaleString()+' tonnes de CO2 &eacute;conomis&eacute;es si fait en train</span>';
           // L.curve(['M',[data.lat2,data.long2],'L',[data.lat1,data.long1]],{color:'#2A9D8F',fill:false,weight:t*pix,opacity:1}).bindTooltip(popupt,{ permanent: (data.Origine=='PARIS' && data.Destination=="TOULOUSE"), offset: [0, 55] }).addTo(train);
            //L.bezier({path: [[{lat: 0, lng: 0},{lat: 10, lng: 10}]],icon: {path: "img/train.png"}}, boptions).addTo(train);
            //L.bezier({path: [[{lat: Math.round(data.lat2,4), lng: Math.round(data.long2,4)},{lat: Math.round(data.lat1,4), lng: Math.round(data.long1,4)}]],icon: {path: "img/train.png"}}, boptions).addTo(train);

            L.curve(['M',[data.lat2,data.long2],'L',[data.lat1,data.long1]],{color:'#5e6472',fill:false,weight:0.1,final:c*pix,opacity:1}).bindTooltip(popupa, { permanent: (data.Origine=='PARIS' && data.Destination=="TOULOUSE") }).addTo(volsco2);
        CO2_total+=c;
        CO2_train+=t;
    }
});

	
	
/* lignes à tester*/
//step1();
//step2();
//step3();
step4();
/*    */

function step1(){
    $('#debut').css("visibility","hidden");
    $('#debut').css("height",0);
    $('#a1').css('opacity',1);
	map.removeLayer(gares);
	map.removeLayer(aeroports);
	map.removeLayer(vols);
	gares.addTo(map);
	aeroports.addTo(map);
    aerotop5still.addTo(map);
    
    setTimeout(function(){ 
        $('#step1-1').css('opacity',1)
        map.removeLayer(gares);
        vols.addTo(map);
		 }, 3000);
}
function step2(){
    vols.eachLayer(function (layer) {
        layer.closeTooltip();
    });
    $('#a2').css('opacity',1);
    $('#step2').css("opacity",0);
    vols5h.addTo(map);
    setTimeout(function(){ 
        $('#step2-1').css('opacity',1)
        map.setView([45, 2], 7);
		 }, 6000);
    setTimeout(function(){ 
        map.removeLayer(aerotop5still);
        aerotop5bounce.addTo(map);
		 }, 6500);	
}
function step3(){
    map.setView([45, 2], 6);
    $('#a3').css('opacity',1);
    $('#step3').css("opacity",0);
    map.removeLayer(aerotop5bounce);
    map.removeLayer(aeroports);
    aeroalter.addTo(map);
    map.removeLayer(vols5h);
    map.removeLayer(vols);
    volsco2.addTo(map);
    progress(ctotal/1000000,co2speed,"co2")
    setTimeout(function(){ 
        $('#step3-1').css('opacity',1)
		 }, co2speed);
}
function step4  (){

    $('#step4').css("opacity",0);
    $('#a4').css('opacity',1);
    train.addTo(map);
    var pvert=[]
    var pgris=[]
    c = $("#bubbles circle").each(function(i,e) {
        if(e.style.fill=="rgb(42, 157, 143)")
            pvert.push(e)
        else 
            pgris.push(e)
    });
    
    var interval = window.setInterval(function () {
        if(pgris.length>0) {
            pgris[0].style.fillOpacity=1;
            pgris.shift();
        }
        else   
            window.clearInterval(interval);
        if(pvert.length>0) {
            pvert[0].style.fillOpacity=1;
            pvert.shift();
        }  
      }, 50);
    setTimeout(function(){ 
        $('#step4-1').css('opacity',1)
		 }, 4500);
}
function reset(){
    $('#step1').css("opacity",0);
    $('#step2').css("opacity",0);
    $('#step3').css("opacity",0);
    $('#step4').css("opacity",0);
    $('#debut').css("visibility","visible");
    map.removeLayer(train);
    map.removeLayer(aeroalter);
    map.removeLayer(volsco2);
}
function progress(valeur_finale,duree,baliseid){
var frequence=30,
iteration = duree / frequence,
pas = valeur_finale / iteration,
valeur_courante = 0;
var interval = window.setInterval(function () {
    valeur_courante = valeur_courante + pas;
    volsco2.eachLayer(function (layer) {
        layer.setStyle({weight:(layer.options.weight + (layer.options.final/iteration) )});
    });
    if(valeur_courante < valeur_finale) {
        document.getElementById(baliseid).innerHTML=Math.round(valeur_courante).toLocaleString();
    }
    else{
        window.clearInterval(interval);  
        document.getElementById(baliseid).innerHTML=Math.round(valeur_finale).toLocaleString();
    }
  }, 30);

}