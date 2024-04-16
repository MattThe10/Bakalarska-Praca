
const main_title = document.getElementById('main-title')
const upper_wrapper_div = document.querySelector('.upper-wrapper')
const results_div = document.querySelector('.results-div')
const submit_btn = document.getElementById('submit-btn')
const err_mess = document.getElementById('err-mess')
const slovak = document.getElementById('sk-img')
const english = document.getElementById('eng-img')
let inp = document.getElementById('inp')
let global_val

//Reg. expressions
let lang = 1; //1 je slovenčina, 2 je angličtina
let events_reg = /TS|MI|BC|BL|RA|SN|IC|GR|UP|FG|BR|DU|SA|SQ|DS|FC|SH|PR|DR|FZ|DZ|SG|PL|GS|VA|HZ|FU|PY|PO|SS/

//Zoznam slovenských letísk
const slovak_icao = {
    LZKZ: 'Košice',
    LZLU: 'Lučenec',
    LZIB: 'Bratislava',
    LZPP: 'Piešťany',
    LZTT: 'Poprad',
    LZPW: 'Prešov',
    LZSL: 'Sliač',
    LZZI: 'Žilina',
    LZ10: 'Dobrá Niva',
    LZDB: 'Dubnica nad Váhom',
    LZDV: 'Dubová',
    LZHL: 'Holíč',
    LZJS: 'Jasná',
    LZKC: 'Kamenica nad Cirochou',
    LZKV: 'Kvetoslavov',
    LZMA: 'Martin',
    LZNI: 'Nitra',
    LZNZ: 'Nové Zámky',
    LZOC: 'Očová',
    LZPT: 'Partizánske',
    LZPE: 'Prievidza',
    LZRY: 'Ražňany',
    LZRU: 'Ružomberok',
    LZSE: 'Senica',
    LZSV: 'Spišská Nová Ves',
    LZSK: 'Svidník',
    LZSY: 'Šurany',
    LZTN: 'Trenčín',
    LZTR: 'Trnava'
}

//Zoznam javov počasia
const weather_events = {
  TS: ['Búrka', 'Storm'],
  MI: ['Prízemný', 'Shallow'],
  BC: ['Pásy', 'Patches'],
  BL: ['Zvírený', 'Blowing at or below eye level'],
  RA: ['Dážď', 'Rain'],
  SN: ['Sneh', 'Snow'],
  IC: ['Ľadové kryštáliky', 'Ice crystals'],
  GR: ['Krúpy', 'Hail'],
  UP: ['Neznáme zrážky', 'Unknown precipitation'],
  FG: ['Hmla', 'Fog'],
  BR: ['Dymno', 'Mist'],
  DU: ['Prach', 'Widespread dust'],
  SA: ['Piesok', 'Sand'],
  SQ: ['Húľava', 'Squall'],
  DS: ['Prachová víchrica', 'Duststorm'],
  FC: ['Lievikovitý oblak', 'Funnel Cloud'],
  SH: ['Prehánka', 'Showers'],
  PR: ['Čiastočne', 'Partial'],
  DR: ['Nízko zvírený', 'Low drifting below eye level'],
  FZ: ['Mrznúci', 'Freezing'],
  DZ: ['Mrhlolenie', 'Drizzle'],
  SG: ['Snehové krúpy', 'Snow grains'],
  PL: ['Ľadové jadrá', 'Ice pellets'],
  GS: ['Malé krúpy', 'Graupel'],
  VA: ['Vulkanický prach', 'Volcanic ash'],
  HZ: ['Zákal', 'Haze'],
  FU: ['Dym', 'Smoke'],
  PY: ['Vodná triešť', 'Spray'],
  PO: ['Prachovitý vír', 'Dust'],
  SS: ['Piesočná víchrica', 'Sandstorm']
}

//Po kliknutí sa vykoná validácia správy
submit_btn.addEventListener('click', () => {
  let val = (inp.value).split(' ')
  global_val = val

  //Zaistíme, že správy budú v UpperCase
  for(let i = 0; i < val.length; i++) {
    val[i] = val[i].toUpperCase()
  }

  if(val[0] == 'METAR' || val[0] == 'TAF'){
    updateDisplay(val)
  }  

  //Iné prípady sú error
  else {
    reset()
    (lang == 1) ? err_mess.textContent = 'Zadajte správny formát!'
    : err_mess.textContent = 'Wrong format!'   
  }

})

slovak.addEventListener('click', () => {
  lang = 1
  updateDisplay(global_val)
})

english.addEventListener('click', () => {
  lang = 2
  updateDisplay(global_val)
})

//Samotné vyobrazenie 
function updateDisplay(mess) {
  reset(); //reset pred výpočtom
  err_mess.textContent = '';

  for(let i = 0; i < mess.length; i++){
      //Odstránime = z konca správy, pre jednoduchšiu validáciu
      if(i == mess.length - 1) {      
        let ms = mess[mess.length - 1]
        //Iba pokiaľ je posledný znak =, inak pokračuj
        if(ms[ms.length - 1] == '='){
          let spt  = ms.split('')
          spt.pop()
          mess[mess.length - 1] = spt.join('')
        }        
      }

      lang == 1 ? main_title.textContent = 'Dekóder METAR a TAF správ'
      : main_title.textContent = 'METAR and TAF reports decoder'

      //Premenná, ktorá obsahuje výsledok funkcie
      let fun

      const title_div = document.createElement('div')
      title_div.classList.add('title-div')

      const title_par = document.createElement('p')
      title_par.classList.add('title-par')

      const data_div = document.createElement('div')
      data_div.classList.add('data-div')

      const data_par = document.createElement('p');
      data_par.classList.add('data-par')
      
      //Vytvorenie divu, do ktorého sa bude ukladať výsledok
      const wrapper = document.createElement('div')
      if(mess[0] == 'METAR') {
        wrapper.classList.add('wrapper-metar')
        upper_wrapper_div.style.flexDirection = 'row'
        upper_wrapper_div.style.flexWrap = 'wrap'
        upper_wrapper_div.style.gap = '2rem'

        if(mess[i].match(/METAR/) || mess[i].match(/AMD/)){
          continue
        }

        //Letisko
        else if(mess[i].match(/LZ\w{2}/)){        
          const span = document.createElement('span')
          const airport_img = document.createElement('img')
          const par = document.createElement('p')

          span.style.display = 'flex'
          span.style.flexDirection = 'row'
          span.style.justifyContent = 'center'
          span.style.alignItems = 'center'
          span.style.gap = '2px'
          airport_img.src = './icons/airport.png'
          airport_img.style.width = '5rem'
          par.style.fontSize = '3rem'

          span.appendChild(airport_img)
          par.textContent = getAirport(mess[i])
          span.appendChild(par)
          data_div.appendChild(span)
          data_par.style.width = 0                
        }

        //Teplota
        else if(mess[i].match(/^\d{2}\/\d{2}$/)){    
          const temp_icon = document.createElement('img')
          const dew_icon = document.createElement('img')
          const temp_par = document.createElement('p')
          const dew_par = document.createElement('p')
          const temp_div = document.createElement('div')
          const dew_div = document.createElement('div')

          temp_div.classList.add('temp-div')
          dew_div.classList.add('dew-div')

          temp_icon.classList.add('icon') 
          temp_icon.src = './icons/temp.svg' 
          temp_par.textContent = `${getTemperature(mess[i])[0]}°C`
          temp_div.appendChild(temp_icon)
          temp_div.appendChild(temp_par)
        
          dew_icon.style.width = '5rem'
          dew_icon.src = './icons/dew.png'
          dew_par.textContent = `${getTemperature(mess[i])[1]}°C`
          dew_div.appendChild(dew_icon)
          dew_div.appendChild(dew_par)
        
          data_div.appendChild(temp_div)
          data_div.appendChild(dew_div)
          data_div.style.flexDirection = 'row'
          data_div.style.justifyContent = 'center'
          data_div.style.alignItems = 'center'
          data_par.style.width = 0       
        }

        //Mínusová teplota
        else if(mess[i].match(/M\d\d\/M\d\d/)){
          fun = getMinusTemperature(mess[i])
        } 

        //Čas
        else if(mess[i].match(/\d{6}Z/)){
            const span = document.createElement('span')
            const clock_img = document.createElement('img')
            const par = document.createElement('p')

            span.style.display = 'flex'
            span.style.flexDirection = 'row'
            span.style.justifyContent = 'center'
            span.style.alignItems = 'center'
            span.style.gap = '2px'
            clock_img.src = './icons/clock.png'
            clock_img.style.width = '5rem'
            par.style.fontSize = '4rem'

            span.appendChild(clock_img)
            par.textContent = getTime(mess[i])
            span.appendChild(par)
            data_div.appendChild(span)
            data_par.style.width = 0
          }

        //Kompas
        else if(mess[i].match(/^\d{5}KT$/) || mess[i].match(/^\d{5}G\d{2}KT$/)){
            let rotate_value = getCompass(mess[i])
            const compass_wrapper = document.createElement('div')
            const north = document.createElement('div')
            const east = document.createElement('div')
            const south = document.createElement('div')
            const west  = document.createElement('div')
            let val = document.createElement('div')         

            compass_wrapper.classList.add('comp-div')
            north.classList.add('comp-north')
            east.classList.add('comp-east')
            south.classList.add('comp-south')
            west.classList.add('comp-west')
            val.classList.add('val')

            north.textContent = 'N'
            east.textContent = 'E'
            south.textContent = 'S'
            west.textContent = 'W'
            val.style.transform = `rotate(${rotate_value}deg)`
            data_par.textContent = getWind(mess[i])

            data_div.appendChild(compass_wrapper)
            data_div.style.flexDirection = 'row'
            data_div.style.fontSize = '1.5rem'
            data_par.style.width = '10rem'
            data_par.style.textAlign = 'left'
            data_par.style.marginLeft ='15px'
            compass_wrapper.appendChild(north)
            compass_wrapper.appendChild(east)
            compass_wrapper.appendChild(south)
            compass_wrapper.appendChild(west)
            compass_wrapper.appendChild(val)
            fun = getWind(mess[i])          
        }
        
        //Smer vetra
        else if(mess[i].match(/\d{3}V\d{3}/)){
          fun = getWindDirectionVariability(mess[i])
        }

        //Viditeľnosť
        else if(mess[i].match(/^\d{4}$/)){
          fun = getVis(mess[i])     
        }

        //Tlak
        else if(mess[i].match(/Q\d{4}/i)) {
          fun = getAltimeter(mess[i])
        } 
  
        //Pokrytie oblohy
        else if(mess[i].match(/\b\w{3}\b/) || mess[i].match(/\b\w\w\w\d\d\d\b/) || mess[i].match(/^[A-Z]{3}\d{3}CB$/)){
            const skies = document.createElement('img')
            skies.classList.add('skies')
            fun = getCloudiness(mess[i])[0]
            if(fun.match(/Žiadna oblačnosť/) || fun.match(/Sky clear/)) {
              skies.src = './icons/sun.png'
            
            }

            else if(fun.match(/Malá oblačnosť/) || fun.match(/Few clouds/)){
              skies.src = './icons/few_clouds.png'
            }

            else if(fun.match(/Polooblačno/) || fun.match(/Scattered skies/)) {
              skies.src = './icons/scattered_skies.png'
            }

            else if(fun.match(/Oblačno/) || fun.match(/Broken skies/)) {
              skies.src = './icons/broken_skies.png'
            }

            else if(fun.match(/Zamračené/) || fun.match(/Overcast/)) {
              skies.src = './icons/overcast.png'
            }

            data_div.appendChild(skies)
            data_div.style.flexDirection = 'column'        
        
        }

        //Ostatné
        else if(mess[i].match(/NOSIG/) || mess[i].match(/AUTO/) || mess[i].match(/CAVOK/)){
          fun = getOther(mess[i])
        }

        //Javy počasia
        else if(mess[i].match(events_reg)){
          if(mess[i] == 'TEMPO') {
            title_div.style.backgroundColor = getError()[1]
            fun = getError()[0]
          }
          else fun = getWeatherEvents(mess[i])     
        }

        else if(!mess[i].match(/NOSIG/) && !mess[i].match(/Q\d{4}/i) && !mess[i].match(events_reg) && !mess[i].match(/AUTO/) && !mess[i].match(/CAVOK/) &&
        !mess[i].match(events_reg) && !mess[i].match(/\b\w{3}\b/) && !mess[i].match(/\b\w\w\w\d\d\d\b/) && !mess[i].match(/^[A-Z]{3}\d{3}CB$/) && !mess[i].match(/^\d{4}$/)
        && !mess[i].match(/\d{3}V\d{3}/) && !mess[i].match(/^\d{5}KT$/) && !mess[i].match(/^\d{5}G\d{2}KT$/ && !mess[i].match(/\d{6}Z/) && !mess[i].match(/M\d\d\/M\d\d/)
        && !mess[i].match(/^\d{2}\/\d{2}$/) && !mess[i].match(/LZ\w{2}/) && !mess[i].match(/METAR/))
        ) {
          title_div.style.backgroundColor = getError()[1]
          fun = getError()[0]
        }


      }

      else if(mess[0] == 'TAF') {
        wrapper.classList.add('wrapper-taf')
        upper_wrapper_div.style.flexDirection = 'column'
        upper_wrapper_div.style.flexWrap = 'no-wrap'
        title_par.style.width = '6rem'
        title_par.style.fontSize = '1rem'
        title_par.style.padding = '4px'
        data_par.style.width = '35rem'
        data_par.style.fontSize = '1rem'
        data_par.style.padding = '4px'

        title_div.style.margin = 0
        title_div.style.border = '1px solid black'
        title_div.style.borderRadius = 0

        data_div.style.border = '1px solid black'
        data_div.style.borderRadius = 0
        upper_wrapper_div.style.gap = 0

        if(mess[i].match(/TAF/) || mess[i].match(/AMD/)){
          continue
        }

        //Letisko
        else if(mess[i].match(/LZ\w{2}/)) {
          fun = getAirport(mess[i])
        }

        //Čas
        else if(mess[i].match(/\d{6}Z/)) {
          (lang == 1) ? fun = `Čas: ${getTime(mess[i])}`
          : fun = `Time: ${getTime(mess[i])}`
        }

        //Viditeľnosť
        else if(mess[i].match(/^\d{4}$/)){
          fun = getVis(mess[i])     
        }

        //Pravdepodobnosť
        else if(mess[i].match(/PROB./)){
          data_par.classList.add('darker')
          title_par.classList.add('darker')
          fun = getProb(mess[i])
        }

        //Skupiny
        else if(mess[i].match(/BECMG/) || mess[i].match(/TEMPO/)){
          title_div.classList.add('darker')
          title_par.classList.add('darker')
          data_div.style.backgroundColor = '#dee2e6'
          fun = getGroup(mess[i])
        }      

        //Platnosť reportu
        else if(mess[i].match(/^\d{4}\/\d{4}$/)){
          fun = getReportDuration(mess[i])
        }

        //Ostatné
        else if(mess[i].match(/CAVOK/)){
          fun = getOther(mess[i])
        }

        //Javy počasia
        else if(mess[i].match(events_reg)){
          fun = getWeatherEvents(mess[i])
        }

        //Pokrytie oblohy 
        else if(mess[i].match(/\b\w{3}\b/) || mess[i].match(/\b\w\w\w\d\d\d\b/) || mess[i].match(/^[A-Z]{3}\d{3}CB$/)){
          (lang == 1) ? fun = `${getCloudiness(mess[i])[0]} vo výške ${getCloudiness(mess[i])[1]}ft` : fun = `${getCloudiness(mess[i])[0]} in ${getCloudiness(mess[i])[1]}ft`
        }

        else if(mess[i].match(/^\d{5}KT$/) || mess[i].match(/^\d{5}G\d{2}KT$/)){
          fun = getWind(mess[i])
        }

        else if(!mess[i].match(/TAF/) && !mess[i].match(/AMD/) && !mess[i].match(/^\d{5}KT$/) && !mess[i].match(/^\d{5}G\d{2}KT$/) &&
        !mess[i].match(/\b\w{3}\b/) && !mess[i].match(/\b\w\w\w\d\d\d\b/) && !mess[i].match(/^[A-Z]{3}\d{3}CB$/) && !mess[i].match(events_reg) &&
        !mess[i].match(/CAVOK/) && !mess[i].match(/^\d{4}\/\d{4}$/) && !mess[i].match(/BECMG/) && !mess[i].match(/TEMPO/) && !mess[i].match(/PROB./) &&
        !mess[i].match(/^\d{4}$/) && !mess[i].match(/\d{6}Z/) && !mess[i].match(/LZ\w{2}/)) {
          fun = getError()[0]
          title_div.style.backgroundColor = getError()[1]
        }

      }               

      //Vyobrazenie daného výsledku
      title_par.textContent = mess[i]
      data_par.textContent = fun

      upper_wrapper_div.appendChild(wrapper);

      wrapper.appendChild(title_div)
      wrapper.appendChild(data_div)

      title_div.appendChild(title_par)
      data_div.appendChild(data_par)
    
    } 

  }

//Vratenie stránky do pôvodného stavu
function reset(){
  inp.value = ''
  upper_wrapper_div.innerHTML = ''
}

//Viditeľnosť
function getVis(mess) {
  return (lang == 1) ?  `Dohľadnosť je ${Math.ceil(Number(mess)/1000)}km`
  : `The visibility is ${Math.ceil(Number(mess)/1000)}km`
}

//Letisko
function getAirport(air){
  for (let airport in slovak_icao){
    if(air == airport){
      return slovak_icao[airport]      
    }
  }
}

//Čas
function getTime(time) {
  let reg = /.{1,2}/g
  let arr = time.match(reg);
    return `${arr[1]}:${arr[2]}`
}

//Rýchlosť a smer vetra
function getWind(wind){
  let speed = wind.substring(3,5)
  let direction = wind.substring(0,3)

  if(wind.length == 7) { 
    return (lang == 1) ? `Rýchlosť vetra je ${Math.floor(speed)}kt a\n smer vetra je ${direction}°`
    : `The wind speed is ${Math.floor(speed)}kt and\n wind direction is ${direction}°`
    }

  else if(wind.length == 10){
    let gusts = parseInt(wind.substring(7,8))
    return (lang == 1) ? `Rýchlosť vetra je ${Math.floor(speed)}kt s\n nárazmi ${gusts}kt` 
    : `The wind speed is ${Math.floor(speed)}kt and\n with gusts over ${gusts}kt`
  }                               
}

//Smer vetra
function getWindDirectionVariability(direction) {
  let from = direction.substring(0,3)
  let to = direction.substring(4,8)
  return (lang == 1) ? `Smer vetra je v rozmedzí od ${from}° do ${to}°`
  : `The wind direction varies from ${from}° to ${to}°`
}

//Teplota ovzdušia a rosný bod
function getTemperature(temp){
  let temperature = temp.substring(0,2)
  let dewpoint = temp.substring(3,5)
  return [temperature, dewpoint]               
} 

//Mínusová teplota a rosný bod
function getMinusTemperature(temp){
  let temperature
  if(temp.split('')[1] == '0'){
    temperature = temp.substring(2,3)
  } else {
    temperature = temp.substring(1,3)
  }
  return (lang == 1) ? `Teplota je -${temperature}°C`
  : `The temperature is -${temperature}°C`  
}

//Tlak ovzdušia
function getAltimeter(alt) {
  let altimeter = alt.split('')
  altimeter.shift();
  return (lang == 1) ? `Tlak je ${altimeter.join('')}hPa`
  : `The pressure is ${altimeter.join('')}hPa`
}

//Pokrytie oblohy mrakmi
function getCloudiness(mess) {
  let x = ''
  let str = ''
  let n_ft;
  if(mess.length == 6 || mess.length == 8) {
    str = mess.substring(0,3)
    n_ft = parseInt(mess.substring(3,6)) * 100;
    console.log(n_ft)
  }
  else {str = mess}
    switch(str.toUpperCase()) {
      case 'SKC':  if(lang == 1) x = 'Žiadna oblačnosť'
                   else x = 'Sky clear'; break;
      case 'FEW':  if(lang == 1) x = 'Malá oblačnosť'
                   else x = 'Few clouds'; break; 
      case 'SCT':  if(lang == 1) x = 'Polooblačno'
                   else x = 'Scattered skies'; break;  
      case 'BKN':  if(lang == 1) x = 'Oblačno'
                   else x = 'Broken skies'; break;   
      case 'OVC':  if(lang == 1) x = 'Zamračené'
                   else x = 'Overcast'; break;  
    }   
  return (mess.length == 8 || mess.length == 6) ? [x, n_ft] : x  
} 

//Javy počasia
function getWeatherEvents(mess) {
    
  let intensity;

  //Pre napr. RA
  if(mess.length == 2) {
    //Hľadanie daného javu v zozname javov
    for(let e in weather_events) {
      if(mess == e) {
        return (lang == 1) ? weather_events[e][0] : weather_events[e][1]
      }
    }
  }
  //Pre napr. -TS
  else if(mess.length == 3) {
    //Rozlíšenie intenzity
    if(mess[0] == '+'){ 
      (lang == 1) ? intensity = 'Silná intenzita' : 'Heavy intensity'
    }
    else if(mess[0] == '-'){
      (lang == 1) ? intensity = 'Slabá intenzita' : intensity = 'Light intensity'
    }

    let fun = mess.substring(1,3)

    for(let e in weather_events) {
      if(fun == e) {
        return (lang == 1) ? `${weather_events[e][0]} - ${intensity}` : `${weather_events[e][1]} - ${intensity}`
      }
    }
  } 

  //Pre napr. TSRA
  else if(mess.length == 4) {
    let val
    let val1

    for(let e in weather_events) {
      if(mess.substring(0,2) == e) {
        (lang == 1) ? val = weather_events[e][0] : val = weather_events[e][1]
      }

      if(mess.substring(2,4) == e) {
        (lang == 1) ? val1 = weather_events[e][0] : val1 = weather_events[e][1]
      }
    }
    return (lang == 1) ? `${val} a ${val1}` : `${val} and ${val1}`
  }

  //Pre napr. -TSRA
  else if(mess.length == 5) {
    let val
    let val1

    if(mess[0] == '+'){ 
      (lang == 1) ? intensity = 'Silná intenzita' : 'Heavy intensity'
    }
    else if(mess[0] == '-'){
      (lang == 1) ? intensity = 'Slabá intenzita' : intensity = 'Light intensity'
    }

    for(let e in weather_events) {
      if(mess.substring(1,3) == e) {
        (lang == 1) ? val = weather_events[e][0] : val = weather_events[e][1]
      }

      else if(mess.substring(3,5) == e) {
        (lang == 1) ? val1 = weather_events[e][0] : val1 = weather_events[e][1]
      }

    }

    return (lang == 1) ? `${val} a ${val1} - ${intensity}` : `${val} and ${val1} - ${intensity}`
  }
}

//Indikátor pravdepodobnosti javov
function getProb(mess) {
  return (lang == 1) ? `Pravdepodobnosť javov je ${mess.substring(4,6)}%`
  : `The probability is ${mess.substring(4,6)}%`
}

//Ostatné nezaradené
function getOther(mess) {
  if(mess == 'NOSIG') {
    return (lang == 1) ? 'Neočakávajú sa žiadne signifikantné zmeny'
    : 'No significant change is expected'
  }
  
  else if(mess == 'AUTO') {
    return (lang == 1) ? 'Správa bola vydaná automatizovaným zariadením' 
    : 'The report was issued by automatic device'
  }

  else if(mess == 'CAVOK') { 
    return (lang == 1) ? 'Obloha jasná, viditeľnosť nad 10km' 
    : 'Ceiling and Visibility OK' 
  }
}

function getGroup(mess) {
  if(mess == 'TEMPO') {
    return (lang == 1) ? `Dočasné zmeny` : `Temporary group`
  }

  else if(mess == 'BECMG') {
    return (lang == 1) ? 'Indikátor očakávaných zmien' : 'Becoming group'
  }
}

function getReportDuration(mess) {
  return (lang == 1) ?  `Platnosť správy je od ${mess.substring(0,2)}.dňa v mesiaci od ${mess.substring(2,4)}hod. až do ${mess.substring(5,7)}.dňa ${mess.substring(7,9)}hod.`
  : `This report is valid from ${mess.substring(0,2)}. day of month from ${mess.substring(2,4)}hr up to ${mess.substring(5,7)}.day ${mess.substring(7,9)}hr`
}

function getError() {
  return (lang == 1) ? ['Nedekódované pre zlý formát', '#d90429'] : ['Not decoded for wrong format', '#d90429']
}

function getCompass(mess) {
  return  mess.substring(0,3)
}



  









 


