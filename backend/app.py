from flask import Flask, request, jsonify
from flask_cors import CORS
from image_processing import process_image
import os

app = Flask(__name__)
CORS(app)

well_data = {}

@app.route('/upload', methods=['POST'])
def upload_image():
    well = request.form.get('well')
    time = request.form.get('time')
    concentration = request.form.get('concentration')
    antibiotic_type = request.form.get('antibioticType')
    image = request.files['image']

    image_path = os.path.join('temp_images', image.filename)
    os.makedirs('temp_images', exist_ok=True)
    image.save(image_path)

    percentage = process_image(image_path)
    os.remove(image_path)

    if well not in well_data:
        well_data[well] = []

    existing_entry = next((entry for entry in well_data[well] if entry['time'] == time), None)
    
    if existing_entry:
        existing_entry['percentage'] = (existing_entry['percentage'] + percentage) / 2
    else:
        new_entry = {
            'time': time,
            'concentration': concentration,
            'percentage': percentage,
            'antibioticType': well_data[well][0]['antibioticType'] if well_data[well] else antibiotic_type
        }
        well_data[well].append(new_entry)

    return jsonify({'percentage': percentage})

@app.route('/results', methods=['POST'])
def calculate_results():
    global well_data
    well_data = request.json['wellData']
    results = {}

    for well, entries in well_data.items():
        percentages = [entry['percentage'] for entry in entries]

        if len(percentages) > 1:  
            if percentages[-1] > percentages[0]:  
                results[well] = 'green' 
            else:
                results[well] = 'red'  
        else:
            results[well] = 'red'  

    return jsonify(results)


if __name__ == '__main__':
    app.run(port=5000)
