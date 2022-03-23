let allPassLibrary = {
    '1': [-0.9, 0],
    '2': [-0.5, 0],
    '3': [-0.1, 0],
    '4': [0.1, 0],
    '5': [0.5, 0],
    '6': [0.9, 0]
};

let selected = -1;
let list_all_pass = [];
let filterCoeff = {};
let filterData = {};

let selectionlib = document.getElementById('selectedFilterslib');
selectionlib.addEventListener('change', () => {
    let allPass = allPassLibrary[selectionlib.value];
    aRealEntry.value = allPass[0];
    aImgEntry.value = allPass[1];
    calcAllPass(allPass[0], allPass[1]);
  });

let selectedFromFiltersList = document.getElementById('selectedFilters');
selectedFromFiltersList.addEventListener('change', selectOneAllPass);

const addBtn = document.getElementById('addAllPass');
addBtn.addEventListener('click', addAllPassFilter);

const removeBtn = document.getElementById('removeAllPass');
removeBtn.addEventListener('click', removeAllPassFilter);

const aRealEntry = document.getElementById('RealPart');
aRealEntry.addEventListener('change', realpartInput);

const aImgEntry = document.getElementById('ImagPart');
aImgEntry.addEventListener('change', ImagpartInput);

function realpartInput() {
    selectionlib.value = 0;
    calcAllPass(Number(aRealEntry.value), Number(aImgEntry.value));
} 

function ImagpartInput() {
    calcAllPass(Number(aRealEntry.value), Number(aImgEntry.value));
}

function addAllPassFilter(){
    list_all_pass.push(filterData);
    a_real_list.push(filterCoeff.a_real);
    a_imaginary_list.push(filterCoeff.a_imaginary);
    console.log("inside add: ",list_all_pass);
    let opt = document.createElement('option');
    opt.value = list_all_pass.length - 1;
    opt.innerHTML = 'F' + list_all_pass.length +": a= " + filterCoeff.a_real + '+ ' + filterCoeff.a_imaginary + 'j';
    selectedFromFiltersList.appendChild(opt);
    getFreqResponse();
}

function selectOneAllPass(){
    selected = selectedFromFiltersList.value;
    if(selected == -1){

    } else {
    plotAllPass(list_all_pass[selected].w, list_all_pass[selected].phase);
    }
}

function removeAllPassFilter(){
    console.log(selected);
    if(selected == -1){

    } else {
        list_all_pass.splice(selected,1);
        a_real_list.splice(selected,1);
        a_imaginary_list.splice(selected,1);
        selectedFromFiltersList.remove(selectedFromFiltersList.selectedIndex);
        plotAllPass([0],[0]);
        getFreqResponse();
    }
    console.log("inside remove: ",list_all_pass);
}


function calcAllPass(real, img){
    filterCoeff = {
        'a_real': real,
        'a_imaginary': img
    };
    postData("http://127.0.0.1:5000/getAllPass", filterCoeff)
    .then(data => {
    filterData = data; // JSON data parsed by `data.json()` call
    plotAllPass(data.w, data.phase);
    });
}

function plotAllPass(x_axis, y_axis){
    x = x_axis.slice(0,x_axis.length);
    x = x.map(function(each_element){
        return Number(each_element.toFixed(2));
    });
    //plotting magnitude chart
    if (allpassgraph instanceof Chart) {
        allpassgraph.destroy();
    }

    // setup block
    var data = {
        labels: x,  // x axis
        datasets: [{
            label: 'Phase Response',
            data: y_axis,  // y axis
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
    allpassgraph = new Chart(
        document.getElementById('allpassgraph'),
        config
    );

}
