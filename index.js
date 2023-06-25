const image = document.getElementById('image');
const searchBut = document.getElementById("searchBtn");
const query = document.getElementById("searchInput");
const img = document.getElementById("img");
const Img = document.getElementById('Img');
const temp = document.getElementById("temp");

const promptMess = document.getElementById("prompt-mess");
const close = document.getElementById('close');

let marker;

var map = L.map('map');
L.control.scale().addTo(map);
map.fitWorld();
map.locate({setView: true, maxZoom: 19});

var bingLayer = L.tileLayer.bing({
    bingMapsKey: 'ArD3p8BkSZAs3dCfSB8G90dTDUdihi-847M5aVWms2GJalpUbXmkEvt7AKUayD9i',
    imagerySet: 'AerialWithLabels',
}).addTo(map);

async function doReverse(e){
    return await fetch("https://api.tomtom.com/search/2/reverseGeocode/"+
        e.lat+","+e.lng+".json?key=sJFC4NyKFSA5bV5kYP9QzFsqlYGM9epq&radius=1000");
}

async function getWeather(name){
    return await fetch("https://api.weatherapi.com/v1/forecast.json?key=d2d81f70d14e4bc2965111708231405&q="
        +name+"&days=3&aqi=yes&alerts=yes");
}

function getIcon(data){
    if(data.current.is_day === 1) img.src = "./Icons/day/"+data.current.condition.code+".png";
    else img.src = "./Icons/night/"+data.current.condition.code+".png";
}

function getTemp(obj){
    temp.innerText = `${obj.current.temp_c}°C`;
}

function removeMarker(){
    if(marker){
        marker.remove();
        img.src = "";
        temp.innerText = "";
        image.style.display = "none";
        image.style.visibility = "hidden";
    }
}

function getMarker(e, obj){
    removeMarker();
    getIcon(obj);getTemp(obj);
    marker = L.marker(e.latlng).addTo(map);
    marker.bindPopup(image, {closeButton:false});
    marker.openPopup();
    marker.bindTooltip(obj.current.condition.text).openTooltip();
    map.setView(e.latlng, 16);
    if(obj.alerts.alert.length > 0){
        aicontoolTipText.innerText = obj.alerts.alert[0].headline;
    }else{
        aicontoolTipText.innerText = "No Alert";
    }
    /*marker.on('click', ()=>{
        alert("You clicked on marker");
    });*/
    fillContent(obj);
    image.style.display = "block";
    image.style.visibility = "visible";
}

async function onLocationFound(e){
    const obj = await doReverse(e.latlng).then(res=>res.json());
    const data = await getWeather(obj.addresses[0].address.freeformAddress).then(res=>res.json());
    if(data.error) alert(data.error.message);
    else getMarker(e, data);
}

map.on('locationfound', onLocationFound);
map.on('click', async (e)=>{
    const loc = await doReverse(e.latlng).then(res=>res.json());
    console.log(loc.addresses[0].address.freeformAddress);
    const obj = await getWeather(loc.addresses[0].address.freeformAddress).then(res=>res.json());
    console.log(obj);
    if(obj.error) alert(obj.error.message);
    else getMarker(e, obj);
});

searchBut.addEventListener("click",  ()=>{
    let x = query.value+".json";
    fetch("https://api.tomtom.com/search/2/search/"+x+"?key=sJFC4NyKFSA5bV5kYP9QzFsqlYGM9epq")
    .then(response=>response.json()).then(async data=>{
        let name;
        let a = data.results[0].address.municipalitySubdivision, b = data.results[0].address.municipality;
        if(a != undefined && b != undefined) name = a+", "+b;
        else if(a == undefined && b != undefined) name = b;
        else name = a;
        console.log(name);
        const obj = await getWeather(name).then(res=>res.json());
        if(obj.error) alert(obj.error.message);
        else getMarker({latlng: [data.results[0].position.lat, data.results[0].position.lon]}, obj);
    });
});

temp.addEventListener("click", ()=>{
    promptMess.classList.remove('hidden');
    promptMess.style.display = "flex";
});
 
close.addEventListener('click', ()=>{
    promptMess.classList.add('hidden');
    promptMess.style.display = "none";
});

function fillContent(data){
    ws.innerText = data.current.wind_kph+" km/hr";
    humid.innerText = data.current.humidity+"%";
    vis.innerText = data.current.vis_km+" km";
    cc.innerText = data.current.cloud+"%";
    pressure.innerText = data.current.pressure_mb+" mbar";
    precip.innerText = data.current.precip_mm+" mm";
    if(data.current.is_day === 1) Img.src = "./Icons/day/"+data.current.condition.code+".png";
    else Img.src = "./Icons/night/"+data.current.condition.code+".png";
    rf.innerText = data.current.feelslike_c+"°C";
    sunrise.innerText = data.forecast.forecastday[0].astro.sunrise;
    sunset.innerText = data.forecast.forecastday[0].astro.sunset;
    //place.innerText =  data.location.name;
    typetoolTipText.innerText = data.current.condition.text;

    let x1 = data.current.air_quality;
    let values = Object.values(x1);
    x1 = values[values.length - 1];
    if(x1 == "1") x1 = "Good";
    else if(x1 == "2") x1 = "Moderate";
    else if(x1 == "3") x1 = "Unhealthy for sensitive group";
    else if(x1 == "4") x1 = "Unhealthy";
    else if(x1 == "5") x1 = "Very Unhealthy"
    else if(x1 >= "6") x1 = "Hazardous";
    let z = data.current.air_quality;

    aqtoolTipText.innerText = "CO gas: "+z.co.toFixed(2)+" µg/m3"
    +"\nNO2 gas: "+z.no2.toFixed(2)+" µg/m3"
    +"\nO3 gas: "+z.o3.toFixed(2)+" µg/m3"
    +"\nSO2 gas: "+z.so2.toFixed(2)+" µg/m3";

    aq.innerText = "Air Quality: "+x1;

    wd.innerText = data.current.wind_dir;
    let x2 = data.current.wind_dir;;
    if(x2 == "N") x2 = "North";
    else if(x2 == "E") wdtoolTipText.innerText = "East";
    else if(x2 == "W") wdtoolTipText.innerText = "West";
    else if(x2 == "S") wdtoolTipText.innerText = "South";
    else if(x2 == "NE") wdtoolTipText.innerText = "North-East";
    else if(x2 == "NW") wdtoolTipText.innerText = "North-West";
    else if(x2 == "SE") wdtoolTipText.innerText = "South-East";
    else if(x2 == "SW") wdtoolTipText.innerText = "South-West";
    else if(x2 == "NNE") wdtoolTipText.innerText = "North-NorthEast";
    else if(x2 == "ENE") wdtoolTipText.innerText = "East-NorthEast";
    else if(x2 == "ESE") wdtoolTipText.innerText = "East-SouthEast";
    else if(x2 == "SSE") wdtoolTipText.innerText = "South-SouthEast";
    else if(x2 == "SSW") wdtoolTipText.innerText = "South-SouthWest";
    else if(x2 == "WSW") wdtoolTipText.innerText = "West-SouthWest";
    else if(x2 == "WNW") wdtoolTipText.innerText = "West-NorthWest";
    else if(x2 == "NNW") wdtoolTipText.innerText = "North-NorthWest";

    let y1 = data.current.uv, x3;
    if(y1 <= 2) x3 = "Low, "+y1;
    else if(y1 >= 3 && y1 <= 5) x3 = "Moderate, "+y1;
    else if(y1 >= 6 && y1 <= 7) x3 = "High, "+y1;
    else if(y1 >= 8 && y1 <= 10) x3 = "Very High, "+y1;
    else x3 = "Extreme, "+y1; 
    uv.innerText = x3;

    if(y1 <= 4) uvIcon.innerText = "brightness_4";
    else if(y1 === 5) uvIcon.innerText = "brightness_5";
    else if(y1 === 6) uvIcon.innerText = "brightness_6";
    else if(y1 === 7) uvIcon.innerText = "brightness_7";
    else uvIcon.innerText = "brightness_high";
}