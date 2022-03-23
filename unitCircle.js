function setup() {
    let canvas = createCanvas(400, 400);
    canvas.parent("unitDiv");
  }
  

window.btn1 = document.getElementById("addPole");
btn1.addEventListener("click",addPole);

window.btn2 = document.getElementById("addZero");
btn2.addEventListener("click",addZero);

window.btn3 = document.getElementById("removePorZ");
btn3.addEventListener("click",removePorZ);

window.btn4 = document.getElementById("removeAllPole");
btn4.addEventListener("click",removeAllPoles);

window.btn5 = document.getElementById("removeAllZero");
btn5.addEventListener("click",removeAllZeros);

window.btn6 = document.getElementById("removeAll");
btn6.addEventListener("click",removeAll);

window.para = document.getElementById("unitAValue");

window.conjCheck = document.getElementById("conjCheckbox");



let btnFlag = "";
let list_of_zeros = [];
let list_of_poles = [];
let list_of_conj_zeros = [];
let list_of_conj_poles = [];
let list_of_allPandZ = [];
let w_x_axis = [];
let mag_y_axis = [];
let phase_y_axis = [];
let a_real_list = [];
let a_imaginary_list = [];
let selectedPorZ = [];


function mouseClicked(){
    if(Math.sqrt((mouseY-200)**2+(mouseX-200)**2) <= 200){
        xCoord = map(mouseX,0,400,-1,1);
        yCoord = map(mouseY,0,400,1,-1);

        if(mouseY < 200) 
        conjYCoord = (200 - mouseY)*2 + mouseY;
        else if(mouseY > 200)
        conjYCoord = mouseY - (2*(mouseY-200));

        let arr =  isPoleOrZeroFound(mouseX,mouseY);
        let found = arr[0];
        let indexOfShape = arr[1];
        let typeOfShape = arr[2];
        if(found){
            if(selectedPorZ.length != 0)
                selectedPorZ = [];
            
            selectedPorZ.push(typeOfShape);
            selectedPorZ.push(indexOfShape);

        } else if(btnFlag == "Zero"){
            Zero = [xCoord,yCoord,"zero", mouseX,mouseY];
            list_of_zeros.push(Zero);
            list_of_conj_zeros.push([xCoord,-yCoord,"zero", mouseX,conjYCoord]);
            list_of_allPandZ.push([mouseX,mouseY,"Zero"]);

        } else if(btnFlag == "Pole"){
            Pole = [xCoord,yCoord,"pole",mouseX,mouseY];
            list_of_poles.push(Pole);
            list_of_conj_poles.push([xCoord,-yCoord,"pole", mouseX,conjYCoord]);
            list_of_allPandZ.push([mouseX,mouseY,"Pole"]);
        }
        if(!found)
            getFreqResponse(); 
            getCoefficients();
    }
}

function getCoefficients(){  
    postData("http://127.0.0.1:5000/getFilterCoefficients", { 
        'zeros': list_of_zeros,
        'zeros_conj': list_of_conj_zeros,
        'poles': list_of_poles,
        'poles_conj': list_of_conj_poles,
        })
    .then(data => {
        console.log("coeff: ", data);
    });
}
    

let beginDragging = false;
let indexOfDraggedShape = -1;
let typeOfDraggedShape = "";
let currDraggedShape = [];
let currDraggedShapeConj = [];

function mousePressed(){
    let arr =  isPoleOrZeroFound(mouseX,mouseY);
    let found = arr[0];
    indexOfDraggedShape = arr[1];
    typeOfDraggedShape = arr[2];
    if(found){
        document.getElementById("unitDiv").style.cursor = "pointer";
        beginDragging = true;
    } else {
        beginDragging = false;
    }
}

function mouseDragged(){
    if(beginDragging){
        if(mouseY < 200) 
        conjYCoord = (200 - mouseY)*2 + mouseY;
        else if(mouseY > 200)
        conjYCoord = mouseY - (2*(mouseY-200));
        xCoord = map(mouseX,0,400,-1,1);
        yCoord = map(mouseY,0,400,1,-1);
        if(typeOfDraggedShape == "Zero"){
            currDraggedShape = [xCoord,yCoord,"Zero", mouseX, mouseY];
            currDraggedShapeConj = [xCoord, -yCoord,"Zero", mouseX, conjYCoord];
            list_of_zeros[indexOfDraggedShape] = currDraggedShape;
            list_of_conj_zeros[indexOfDraggedShape] = currDraggedShapeConj;

        } else if(typeOfDraggedShape == "Pole"){
            currDraggedShape = [xCoord,yCoord,"Pole", mouseX, mouseY];
            currDraggedShapeConj = [xCoord, -yCoord,"Zero", mouseX, conjYCoord];
            list_of_poles[indexOfDraggedShape] = currDraggedShape;
            list_of_conj_poles[indexOfDraggedShape] = currDraggedShapeConj;
        }
        getFreqResponse(); 
        getCoefficients();
    }
}

function mouseReleased() {
    document.getElementById("unitDiv").style.cursor = "default";
  }


function isPoleOrZeroFound(x,y){
    for(let i=0; i<list_of_zeros.length; i++){
        currList = list_of_zeros[i];
        currConjList = list_of_conj_zeros[i];
        if((x <= currList[3]+5 && x >= currList[3]-5) && ((y <= currList[4]+5 && y >= currList[4]-5))
        || (x <= currConjList[3]+5 && x >= currConjList[3]-5) && ((y <= currConjList[4]+5 && y >= currConjList[4]-5)) )
            return [true, i, "Zero"];
    }
    for(let i=0; i<list_of_poles.length; i++){
        currList = list_of_poles[i];
        currConjList = list_of_conj_poles[i];
        if((x <= currList[3]+5 && x >= currList[3]-5) && ((y <= currList[4]+5 && y >= currList[4]-5))
        || (x <= currConjList[3]+5 && x >= currConjList[3]-5) && ((y <= currConjList[4]+5 && y >= currConjList[4]-5)) )
            return [true, i, "Pole"];
    }
    return [false, -1, null];
}


function addZero(){
   btnFlag = "Zero";
   btn2.style.color = 'red';
   btn1.style.color = 'black';
   btn3.style.color = 'black';
}

function addPole(){
    btnFlag = "Pole";
    btn1.style.color = 'red';
    btn2.style.color = 'black';
    btn3.style.color = 'black'; 
}

function drawx(x,y){
    centerx = x;
    centery = y;
    strokeWeight(3);
    line(centerx+5, centery+5, centerx-5, centery-5);
    line(centerx-5, centery+5, centerx+5, centery-5);
}

function removePorZ(){
    // btnFlag = "remove";
    btn3.style.color = 'red';
    btn1.style.color = 'black';
    btn2.style.color = 'black';
    if(selectedPorZ.length != 0){
        if(selectedPorZ[0] == 'Zero'){
            list_of_zeros.splice(selectedPorZ[1],1);
            list_of_conj_zeros.splice(selectedPorZ[1],1);
        } else {
            list_of_poles.splice(selectedPorZ[1],1);
            list_of_conj_poles.splice(selectedPorZ[1],1);
        }
    }
    selectedPorZ = [];
    getFreqResponse(); 
    getCoefficients();
}

function removeAllPoles(){
    list_of_poles = [];
    list_of_conj_poles = [];
    btn2.style.color = 'black';
    btn1.style.color = 'black';
    btn3.style.color = 'black';
    getFreqResponse(); 
    getCoefficients();
}

function removeAllZeros(){
    list_of_zeros = [];
    list_of_conj_zeros = [];
    btn2.style.color = 'black';
    btn1.style.color = 'black';
    btn3.style.color = 'black';
    getFreqResponse();
    getCoefficients();
}

function removeAll(){
    list_of_zeros = [];
    list_of_poles = [];
    list_of_conj_poles = [];
    list_of_conj_zeros = [];
    list_of_allPandZ = [];
    btn2.style.color = 'black';
    btn1.style.color = 'black';
    btn3.style.color = 'black';
    getFreqResponse();  
    getCoefficients();
}

function draw(){
    clear();
    background(255);
    noFill();
    strokeWeight(2);
    stroke(0,0,0);
    circle(200,200,400);
    line(0, 200, 400, 200);
    line(200, 0, 200, 400);
    xCoord = map(mouseX,0,400,-1,1);
    yCoord = map(mouseY,0,400,1,-1);
    if(Math.sqrt((mouseY-200)**2+(mouseX-200)**2) <= 200)
        window.para.innerText = Math.round(xCoord*100)/100 + "+" + Math.round(100*yCoord)/100 + "j";
    else
        window.para.innerText = "The graph coordinates are shown here";

    for(let i=0; i<list_of_zeros.length; i++){
        currList = list_of_zeros[i];
        stroke(255,0,0);
        fill(255,0,0);
        circle(currList[3], currList[4], 10);
    }

    for(let i=0; i<list_of_poles.length; i++){
        currList = list_of_poles[i];
        stroke(255,0,0); 
        drawx(currList[3], currList[4]);
    }

    if(selectedPorZ.length != 0){
        if(selectedPorZ[0] == 'Zero'){
            stroke(255,255,0);
            fill(255,0,0);
            circle(list_of_zeros[selectedPorZ[1]][3], list_of_zeros[selectedPorZ[1]][4], 10);
        } else {
            stroke(255,255,0);
            drawx(list_of_poles[selectedPorZ[1]][3], list_of_poles[selectedPorZ[1]][4]);
        }
    }

    drawconj();
}

function drawconj(){
    if(window.conjCheck.checked){
        for(let i=0; i<list_of_conj_zeros.length; i++){
            currList = list_of_conj_zeros[i];
            stroke(0,255,0);
            fill(0,255,0);
            circle(currList[3], currList[4], 10);
            } 
        for(let i=0; i<list_of_conj_poles.length; i++){
            currList = list_of_conj_poles[i];
            stroke(0,255,0);
            drawx(currList[3], currList[4]);
            }    
    }
}

function getFreqResponse(){
    data = {
        'zeros': list_of_zeros,
        'poles': list_of_poles,
        'a_real_list':a_real_list,
       'a_imaginary_list':a_imaginary_list
    }
    if(!window.conjCheck.checked){
        data['zeros_conj'] = [];
        data['poles_conj'] = [];
    } else {
        data['zeros_conj'] = list_of_conj_zeros;
        data['poles_conj'] = list_of_conj_poles;
    }

    postData("http://127.0.0.1:5000/getfrequencyresponse", data)
    .then(data => {
     // JSON data parsed by `data.json()` call
    w_x_axis = data['w'];
    mag_y_axis = data['magnitude'];
    phase_y_axis = data['phase'];

    plotFreqResponse(w_x_axis, mag_y_axis, phase_y_axis);
    });

}

async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
  
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  function plotFreqResponse(w_x_axis, mag_y_axis, phase_y_axis) {
      x_axis = w_x_axis.slice(0,w_x_axis.length);
      x_axis = x_axis.map(function(each_element){
        return Number(each_element.toFixed(2));
    });
    //plotting magnitude chart
    if (magChart instanceof Chart) {
        magChart.destroy();
    }

    // setup block
    var data = {
        labels: x_axis,
        datasets: [{
            label: 'Magnitude Response',
            data: mag_y_axis,
            backgroundColor: [
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 159, 64, 1)'
            ],
        }]

    }
    // config block
    var config = {
        type: 'line',
        data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    // init block
    magChart = new Chart(
        document.getElementById('magChart'),
        config
    );

    //plotting phase chart
    if (phaseChart instanceof Chart) {
        phaseChart.destroy();
    }

    // setup block
    var data = {
        labels: x_axis,
        datasets: [{
            label: 'Phase Response',
            data: phase_y_axis,
            backgroundColor: [
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 159, 64, 1)'
            ],
        }]

    }
    // config block
    var config = {
        type: 'line',
        data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    // init block
    phaseChart = new Chart(
        document.getElementById('phaseChart'),
        config
    );

}



