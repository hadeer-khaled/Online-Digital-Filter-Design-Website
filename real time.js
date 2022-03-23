const btn = document.getElementsByClassName("Import");
btn[0].addEventListener('click', loadsignal);

const slider = document.getElementById('slider');
slider.addEventListener('change', changeRealTimeSpeed);

let signalFile = document.getElementById('signalFile');
let loadedSignal = {};
let xAndYNames = [];
let filteredY = [];
let myX = [];
let speed = 200;
let k = -1;
let new_point = 0;
let signalMax = 0;
let signalMin = 0;

function changeRealTimeSpeed(){
    speed = Number(slider.value);
    Plotly.deleteTraces('originalSignal', 0);
    Plotly.deleteTraces('filteredSignal', 0);
    console.log("speed: ", speed);
    plotSignals();
}

function loadsignal(){
    x_axis = [];
    y_axis = [];
    Papa.parse(signalFile.files[0], {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function(signal){
            loadedSignal = signal;
            headersNames = signal.meta.fields;
            xAndYNames = headersNames;
            for(j=0; j < signal.data.length; j++){
                x_axis.push((signal.data[j])[headersNames[0]]);
                y_axis.push((signal.data[j])[headersNames[1]]);
            }
            signalMax = Math.max(y_axis);
            signalMin = Math.min(y_axis);
            get_x_axis(x_axis)
            updateSignal(y_axis);
        }
    });
}

function get_x_axis(x_axis){
    myX = x_axis.slice();
}

function gety(){
    k+=1;
    return (loadedSignal.data[k])[xAndYNames[1]];
}

function getx(){
    return (loadedSignal.data[k])[xAndYNames[0]];
}


function updateSignal(y_axis){  
    postData("http://127.0.0.1:5000/updateSignal", { 'originalSignal': y_axis })
    .then(data => {
    plotSignals();
    });
}
 
function getfilteredy(){
    postData("http://127.0.0.1:5000/calculateNewPoint", { 'index': k })
    .then(data => {
        new_point = data['point'];
    });
    return new_point;
}

let counter = 0;
function plotSignals(){
    let data =  [{
        y: [gety()],
        x: [getx()],
        type: 'line',
        line: {
            color: 'rgb(255, 159, 64, 1)',
            width: 3
        }
    }]
    let layout =
    {
        title: 'Original Signal',
        width: 800,
        height: 400,
        yaxis: {
            title: 'y-axis title',
        }
    };

    let fdata = [{
        y: [getfilteredy()],
        x: [getx()],
        type: 'line',
        line: {
            color: 'rgb(255, 159, 64, 1)',
            width: 3
        }
    }]
    let flayout =
    {
        title: 'Filtered Signal',
        width: 800,
        height: 400,
        yaxis: {
            title: 'y-axis title',
        }
    };

    Plotly.plot('originalSignal', data, layout);
    Plotly.plot('filteredSignal', fdata, flayout);

    setInterval(function() {
        console.log(2000-speed);
        Plotly.extendTraces('originalSignal', { y: [[gety()]] ,
                                                x: [[getx()]]}, [0])
        
        Plotly.extendTraces('filteredSignal', { y: [[getfilteredy()]] ,
                                                x: [[getx()]]}, [0])

            Plotly.relayout('originalSignal',{
                yaxis: {
                    range: [signalMin, signalMax]
                },

                    xaxis: {
                            range: [myX[counter]-0.002, myX[counter]+0.002]
                        }
            });

            Plotly.relayout('filteredSignal',{
                yaxis: {
                    range: [signalMin, signalMax]
                },
                xaxis: {
                        range: [myX[counter]-0.002,myX[counter]+0.002]
                    }
        });


            counter++;
                               
    }, 2000-speed);

}

