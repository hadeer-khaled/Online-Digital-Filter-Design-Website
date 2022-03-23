from flask import Flask, jsonify,request, json
from flask_cors import CORS, cross_origin
from scipy import signal
import numpy as np


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

a = []
b = []
original_signal = np.array([])
filtered_signal = np.zeros(10)

@app.route('/getfrequencyresponse', methods=['POST', 'GET'])
@cross_origin()
def getfrequencyresponse():                      # part1
   if request.method == 'POST':
        filterdata = json.loads(request.data)
        zeros = filterdata['zeros']
        zeros_conj = filterdata['zeros_conj']
        poles =  filterdata['poles']
        poles_conj = filterdata['poles_conj']
        a_real_list = filterdata['a_real_list']
        a_imaginary_list = filterdata['a_imaginary_list']

        zeros_list = []
        poles_list = []
        a_original = []
        a_conjugate = []

        for a_r, a_i in zip(a_real_list, a_imaginary_list): 
            a_original.append(a_r + a_i * 1j)
            a_conjugate.append(a_r - a_i * 1j)

        for x in zeros:                         
            zeros_list.append(x[0]+x[1]*1j)

        for x in zeros_conj:
            zeros_list.append(x[0]+x[1]*1j)

        for x in poles:
            poles_list.append(x[0] + x[1] * 1j)

        for x in poles_conj:
            poles_list.append(x[0] + x[1] * 1j)
        
        w, h = signal.freqz_zpk(zeros_list, poles_list, 1)
        mag = abs(h)
        phase = np.unwrap(np.angle(h))

        for x,y in zip(a_original,a_conjugate):
            _, h = signal.freqz([-1*y,1],[1,-x])
            phase_d = np.unwrap(np.angle(h))
            phase = np.add(phase, phase_d)
        
        response = {'w': w.tolist(),
                    'phase': phase.tolist(),
                    'magnitude': mag.tolist()
                    }
        return jsonify(response)
   else:
        return "there is no post rerquest"



@app.route('/getAllPass', methods=['POST', 'GET'])
@cross_origin()
def all_pass():                                           #part3
    if request.method == 'POST':
        allPassData = json.loads(request.data)
        a_real = allPassData['a_real']
        a_imaginary = allPassData['a_imaginary']

        a_original = a_real + a_imaginary * 1j
        a_conjugate = a_real - a_imaginary * 1j

        w, h = signal.freqz([-1 * a_conjugate, 1], [1, -a_original])
        phase = np.unwrap(np.angle(h))

        response = {'w': w.tolist(),
                    'phase': phase.tolist()
                   }

        return jsonify(response)
    else:
        return "there is no post rerquest"



@app.route('/updateSignal', methods=['POST', 'GET'])
@cross_origin()
def update_signal():
    global original_signal
    if request.method == 'POST':
        signal = json.loads(request.data)
        loaded_signal = signal['originalSignal']
        original_signal = np.concatenate((np.zeros(5), loaded_signal))

        return jsonify({})

    else:
        print("No Post Request")


@app.route('/getFilterCoefficients', methods=['POST', 'GET'])
@cross_origin()
def update_coefficients():
    if request.method == 'POST':
        filterdata = json.loads(request.data)
        zeros = filterdata['zeros']
        zeros_conj = filterdata['zeros_conj']
        poles =  filterdata['poles']
        poles_conj = filterdata['poles_conj']

        global a, b
        zeros_list = []
        poles_list = []

        for x in zeros:
            zeros_list.append(x[0] + x[1] * 1j)

        for x in zeros_conj:
            zeros_list.append(x[0] + x[1] * 1j)

        for x in poles:
            poles_list.append(x[0] + x[1] * 1j)

        for x in poles_conj:
            poles_list.append(x[0] + x[1] * 1j)

        sys = signal.ZerosPolesGain(zeros_list, poles_list, 1)

        a = sys.to_tf().num[::-1]
        b = sys.to_tf().den[::-1]

        
        
        return jsonify({
            'a': a.tolist(),
            'b': b.tolist()
        })

    else:
        print("No Post Request")



@app.route('/calculateNewPoint', methods=['POST', 'GET'])
@cross_origin()
def calculate_new_point():
    if request.method == 'POST':
        index = json.loads(request.data)
        k = index['index']

        global original_signal, filtered_signal, a, b

        x_partition = original_signal[k - len(a):k]
        y_partition = filtered_signal[-(len(b)):-1]

        new_point = (1 / b[0])*(np.sum(np.multiply(x_partition, a)) - np.sum(np.multiply(y_partition, b[1:len(b) - 1])))
        filtered_signal = np.append(filtered_signal,new_point)
        response = { 'point': new_point}

        return jsonify(response)
    else:
        return "there is no post rerquest"



if __name__ == '__main__':
    app.run()
