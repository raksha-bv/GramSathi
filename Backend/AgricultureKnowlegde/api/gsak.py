from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
from typing import Dict, List, Tuple, Optional
import warnings
import os
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class GramSathiAgriKnowledge:
    """
    Agricultural Knowledge Integration System for GramSathi
    Simulates KVK and ICAR database integration with historical crop data
    """
    
    def __init__(self, dataset_path: str = None):
        """Initialize the agricultural knowledge system"""
        self.dataset = None
        self.crop_columns = []
        self.district_mapping = {}
        
        # KVK-style agricultural recommendations database
        self.crop_recommendations = {
            'RICE': {
                'best_practices': [
                    "Maintain water level 2-5 cm during vegetative stage",
                    "Apply nitrogen in 3 splits: 50% basal, 25% tillering, 25% panicle initiation",
                    "Use System of Rice Intensification (SRI) for better yields"
                ],
                'pest_control': [
                    "Brown planthopper: Use resistant varieties like Swarna-Sub1",
                    "Stem borer: Install pheromone traps @ 8-10/hectare",
                    "Leaf folder: Spray Chlorantraniliprole 18.5% SC @ 150ml/hectare"
                ],
                'rotation_crops': ['WHEAT', 'MUSTARD', 'GRAM', 'PEA'],
                'optimal_season': 'Kharif (June-November)',
                'soil_requirements': 'Clay loam with pH 6.0-7.0'
            },
            'WHEAT': {
                'best_practices': [
                    "Sow at proper time: Mid-November to early December",
                    "Use certified seed @ 100-125 kg/hectare",
                    "Apply balanced fertilization: 120:60:40 NPK kg/hectare"
                ],
                'pest_control': [
                    "Aphid: Spray Imidacloprid 17.8% SL @ 125ml/hectare",
                    "Termite: Treat seed with Chlorpyrifos 20% EC @ 2.5ml/kg seed",
                    "Rust: Use resistant varieties like HD-2967, WH-147"
                ],
                'rotation_crops': ['RICE', 'SUGARCANE', 'COTTON'],
                'optimal_season': 'Rabi (November-April)',
                'soil_requirements': 'Well-drained loam with pH 6.0-7.5'
            },
            'COTTON': {
                'best_practices': [
                    "Plant Bt cotton varieties for bollworm resistance",
                    "Maintain plant spacing: 90cm x 60cm for irrigated conditions",
                    "Apply balanced nutrition with micronutrients"
                ],
                'pest_control': [
                    "Pink bollworm: Use pheromone traps and mating disruption",
                    "Whitefly: Spray Spiromesifen 22.9% SC @ 1ml/liter",
                    "Thrips: Use blue sticky traps @ 12-15/hectare"
                ],
                'rotation_crops': ['WHEAT', 'MUSTARD', 'GRAM'],
                'optimal_season': 'Kharif (May-October)',
                'soil_requirements': 'Black cotton soil with pH 7.5-8.5'
            },
            'SUGARCANE': {
                'best_practices': [
                    "Use healthy, disease-free seed cane",
                    "Plant in furrows with proper spacing: 90-120cm",
                    "Apply organic matter @ 25 tonnes/hectare"
                ],
                'pest_control': [
                    "Early shoot borer: Apply Carbofuran 3G @ 33kg/hectare",
                    "Red rot: Use resistant varieties like Co-0238, Co-86032",
                    "Smut: Remove and burn affected plants immediately"
                ],
                'rotation_crops': ['WHEAT', 'POTATO', 'MUSTARD'],
                'optimal_season': 'February-March or October-November',
                'soil_requirements': 'Deep, well-drained soil with pH 6.5-7.5'
            },
            'GRAM': {
                'best_practices': [
                    "Sow during October-November for optimal yields",
                    "Use seed rate of 75-80 kg/hectare for normal varieties",
                    "Apply Rhizobium culture for nitrogen fixation"
                ],
                'pest_control': [
                    "Pod borer: Spray Indoxacarb 14.5% SC @ 1ml/liter",
                    "Aphid: Use yellow sticky traps and neem oil spray",
                    "Wilt: Use resistant varieties like JG-11, JG-16"
                ],
                'rotation_crops': ['WHEAT', 'MUSTARD', 'BARLEY'],
                'optimal_season': 'Rabi (October-March)',
                'soil_requirements': 'Well-drained soil with pH 6.0-7.5'
            },
            'MUSTARD': {
                'best_practices': [
                    "Sow in mid-October for timely sowing",
                    "Use seed rate of 4-5 kg/hectare",
                    "Apply sulfur fertilizer for better oil content"
                ],
                'pest_control': [
                    "Aphid: Spray Dimethoate 30% EC @ 1ml/liter",
                    "Painted bug: Monitor and spray insecticides if needed",
                    "White rust: Use resistant varieties and proper drainage"
                ],
                'rotation_crops': ['RICE', 'COTTON', 'SUGARCANE'],
                'optimal_season': 'Rabi (October-March)',
                'soil_requirements': 'Loamy soil with pH 6.0-8.0'
            }
        }
        
        dataset_path = "../data/ICRISAT-District Level Data.csv"
        if dataset_path and os.path.exists(dataset_path):
            self.load_dataset(dataset_path)
    
    def load_dataset(self, dataset_path: str):
        """Load and preprocess the agricultural dataset"""
        try:
            self.dataset = pd.read_csv(dataset_path)
            # Strip whitespace from all column names
            self.dataset.columns = self.dataset.columns.str.strip()
            print(f"Dataset loaded successfully with {len(self.dataset)} records")
            
            # Identify crop-related columns
            self.crop_columns = [col for col in self.dataset.columns 
                               if any(keyword in col.upper() for keyword in 
                                    ['RICE', 'WHEAT', 'COTTON', 'SUGARCANE', 'GRAM', 'MUSTARD', 'ONION'])]
            
            print(f"Identified {len(self.crop_columns)} crop-related columns")
            
            # Create district mapping if available
            if 'Dist Code' in self.dataset.columns:
                self.create_district_mapping()
                
        except Exception as e:
            print(f"Error loading dataset: {e}")
    
    def create_district_mapping(self):
        """Create mapping of district codes to names"""
        unique_districts = self.dataset['Dist Code'].unique()
        self.district_mapping = {code: f"District_{code}" for code in unique_districts}
        
        # If district names are available in dataset, use them
        if 'Dist Name' in self.dataset.columns:
            district_names = self.dataset[['Dist Code', 'Dist Name']].drop_duplicates()
            self.district_mapping = dict(zip(district_names['Dist Code'], district_names['Dist Name']))
    
    def get_crop_trends(self, district_code: int, crop_name: str, years: int = 5) -> Dict:
        """Analyze crop trends for a specific district and crop"""
        if self.dataset is None:
            return {"error": "Dataset not loaded"}
        
        # Find relevant columns for the crop
        crop_cols = [col for col in self.crop_columns if crop_name.upper() in col.upper()]
        
        if not crop_cols:
            return {"error": f"No data found for crop: {crop_name}"}
        
        # Filter data for district
        district_data = self.dataset[self.dataset['Dist Code'] == district_code]
        
        if district_data.empty:
            return {"error": f"No data found for district code: {district_code}"}
        
        # Get recent years data
        recent_data = district_data.tail(years)
        
        trends = {}
        for col in crop_cols:
            if col in recent_data.columns:
                values = recent_data[col].dropna()
                if len(values) > 1:
                    # Calculate trend
                    trend_slope = np.polyfit(range(len(values)), values, 1)[0]
                    trends[col] = {
                        'recent_values': values.tolist(),
                        'trend': 'increasing' if trend_slope > 0 else 'decreasing',
                        'average': float(values.mean()),
                        'latest': float(values.iloc[-1]) if len(values) > 0 else 0
                    }
        
        return trends
    
    def get_agricultural_advice(self, district_code: int, crop_name: str, 
                              season: str = 'current') -> Dict:
        """Get comprehensive agricultural advice"""
        advice = {
            'district': self.district_mapping.get(district_code, f"District_{district_code}"),
            'crop': crop_name.upper(),
            'season': season,
            'timestamp': datetime.now().isoformat()
        }
        
        # Get crop trends from dataset
        trends = {}
        if self.dataset is not None:
            trends = self.get_crop_trends(district_code, crop_name)
            advice['historical_trends'] = trends
        
        # Get KVK/ICAR recommendations
        crop_key = crop_name.upper()
        if crop_key in self.crop_recommendations:
            crop_info = self.crop_recommendations[crop_key]
            advice.update({
                'best_practices': crop_info['best_practices'],
                'pest_control': crop_info['pest_control'],
                'recommended_rotation': crop_info['rotation_crops'],
                'optimal_season': crop_info['optimal_season'],
                'soil_requirements': crop_info['soil_requirements']
            })
        
        # Generate specific recommendations
        recommendations = self.generate_recommendations(district_code, crop_name, trends)
        advice['specific_recommendations'] = recommendations
        
        return advice
    
    def generate_recommendations(self, district_code: int, crop_name: str, trends: Dict) -> List[str]:
        """Generate specific recommendations based on historical data analysis"""
        recommendations = []
        
        # Analyze trends and provide recommendations
        for metric, data in trends.items():
            if isinstance(data, dict) and 'trend' in data:
                if data['trend'] == 'decreasing':
                    if 'AREA' in metric:
                        recommendations.append(f"Consider diversifying crops as {crop_name} area is declining")
                    elif 'PRODUCTION' in metric:
                        recommendations.append(f"Focus on improving {crop_name} productivity through better practices")
                elif data['trend'] == 'increasing':
                    if 'AREA' in metric:
                        recommendations.append(f"{crop_name} cultivation is expanding - ensure sustainable practices")
        
        # Add general recommendations
        recommendations.extend([
            f"Monitor weather forecasts regularly for {crop_name} cultivation",
            "Connect with local KVK for soil testing and nutrient management",
            "Consider crop insurance to mitigate risks"
        ])
        
        return recommendations
    
    def get_crop_calendar(self, district_code: int, crop_name: str) -> Dict:
        """Generate crop calendar with key agricultural activities"""
        crop_key = crop_name.upper()
        base_calendar = {
            'RICE': {
                'nursery_preparation': 'May-June',
                'transplanting': 'June-July', 
                'fertilizer_application': 'July, August, September',
                'pest_monitoring': 'August-October',
                'harvesting': 'October-November'
            },
            'WHEAT': {
                'land_preparation': 'October-November',
                'sowing': 'November-December',
                'fertilizer_application': 'December, January, February',
                'irrigation': 'December-March',
                'harvesting': 'March-April'
            },
            'COTTON': {
                'land_preparation': 'April-May',
                'sowing': 'May-June',
                'fertilizer_application': 'June, July, August',
                'pest_monitoring': 'July-September',
                'harvesting': 'October-December'
            },
            'GRAM': {
                'land_preparation': 'September-October',
                'sowing': 'October-November',
                'fertilizer_application': 'November, December',
                'pest_monitoring': 'December-February',
                'harvesting': 'February-March'
            },
            'MUSTARD': {
                'land_preparation': 'September-October',
                'sowing': 'October-November',
                'fertilizer_application': 'November, December',
                'pest_monitoring': 'December-February',
                'harvesting': 'March-April'
            }
        }
        
        calendar = base_calendar.get(crop_key, {})
        calendar['district'] = self.district_mapping.get(district_code, f"District_{district_code}")
        calendar['crop'] = crop_name
        
        return calendar
    
    def search_similar_districts(self, district_code: int, crop_name: str, metric: str = 'area') -> List[Dict]:
        """Find districts with similar crop patterns"""
        if self.dataset is None:
            return []
        
        # Find relevant columns
        crop_cols = [col for col in self.crop_columns 
                    if crop_name.upper() in col.upper() and metric.upper() in col.upper()]
        
        if not crop_cols:
            return []
        
        target_col = crop_cols[0]
        
        # Get target district's recent average
        target_data = self.dataset[self.dataset['Dist Code'] == district_code]
        if target_data.empty:
            return []
        
        target_avg = target_data[target_col].tail(3).mean()
        
        # Find similar districts
        similar_districts = []
        for dist_code in self.dataset['Dist Code'].unique():
            if dist_code == district_code:
                continue
            
            dist_data = self.dataset[self.dataset['Dist Code'] == dist_code]
            if not dist_data.empty:
                dist_avg = dist_data[target_col].tail(3).mean()
                
                # Check similarity (within 20% range)
                if not pd.isna(dist_avg) and not pd.isna(target_avg) and target_avg != 0:
                    similarity = abs(dist_avg - target_avg) / target_avg
                    if similarity < 0.2:
                        similar_districts.append({
                            'district_code': int(dist_code),
                            'district_name': self.district_mapping.get(dist_code, f"District_{dist_code}"),
                            'average_value': float(dist_avg),
                            'similarity_score': 1 - similarity
                        })
        
        # Sort by similarity
        similar_districts.sort(key=lambda x: x['similarity_score'], reverse=True)
        return similar_districts[:5]

# Initialize the agricultural knowledge system
agri_system = GramSathiAgriKnowledge("./ICRISAT-District Level Data.csv")

# API Routes


@app.route('/',methods=['GET'])
def index():
    """Index route to check if the server is running"""
    return jsonify({
        'message': 'GramSathi Agricultural Knowledge API is running',
        'timestamp': datetime.now().isoformat(),
        'dataset_loaded': agri_system.dataset is not None,
        'total_records': len(agri_system.dataset) if agri_system.dataset is not None else 0
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'dataset_loaded': agri_system.dataset is not None,
        'total_records': len(agri_system.dataset) if agri_system.dataset is not None else 0
    })

@app.route('/api/crops', methods=['GET'])
def get_supported_crops():
    """Get list of supported crops"""
    crops = list(agri_system.crop_recommendations.keys())
    return jsonify({
        'supported_crops': crops,
        'total_count': len(crops)
    })

@app.route('/api/districts', methods=['GET'])
def get_districts():
    """Get list of available districts"""
    if agri_system.dataset is None:
        return jsonify({'error': 'Dataset not loaded'}), 400
    
    districts = [
        {'code': int(code), 'name': name} 
        for code, name in agri_system.district_mapping.items()
    ]
    return jsonify({
        'districts': districts,
        'total_count': int(len(districts))
    })

@app.route('/api/advice', methods=['POST'])
def get_agricultural_advice():
    """Get comprehensive agricultural advice"""
    try:
        data = request.get_json()
        
        # Validate required parameters
        required_params = ['district_code', 'crop_name']
        for param in required_params:
            if param not in data:
                return jsonify({'error': f'Missing required parameter: {param}'}), 400
        
        district_code = int(data['district_code'])
        crop_name = data['crop_name'].upper()
        season = data.get('season', 'current')
        
        # Get advice
        advice = agri_system.get_agricultural_advice(district_code, crop_name, season)
        
        return jsonify(advice)
        
    except ValueError as e:
        return jsonify({'error': f'Invalid parameter format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/trends', methods=['POST'])
def get_crop_trends():
    """Get crop trends for a specific district and crop"""
    try:
        data = request.get_json()
        
        required_params = ['district_code', 'crop_name']
        for param in required_params:
            if param not in data:
                return jsonify({'error': f'Missing required parameter: {param}'}), 400
        
        district_code = int(data['district_code'])
        crop_name = data['crop_name'].upper()
        years = int(data.get('years', 5))
        
        trends = agri_system.get_crop_trends(district_code, crop_name, years)
        
        return jsonify(trends)
        
    except ValueError as e:
        return jsonify({'error': f'Invalid parameter format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/calendar', methods=['POST'])
def get_crop_calendar():
    """Get crop calendar for farming activities"""
    try:
        data = request.get_json()
        
        required_params = ['district_code', 'crop_name']
        for param in required_params:
            if param not in data:
                return jsonify({'error': f'Missing required parameter: {param}'}), 400
        
        district_code = int(data['district_code'])
        crop_name = data['crop_name'].upper()
        
        calendar = agri_system.get_crop_calendar(district_code, crop_name)
        
        return jsonify(calendar)
        
    except ValueError as e:
        return jsonify({'error': f'Invalid parameter format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/similar-districts', methods=['POST'])
def get_similar_districts():
    """Find districts with similar crop patterns"""
    try:
        data = request.get_json()
        
        required_params = ['district_code', 'crop_name']
        for param in required_params:
            if param not in data:
                return jsonify({'error': f'Missing required parameter: {param}'}), 400
        
        district_code = int(data['district_code'])
        crop_name = data['crop_name'].upper()
        metric = data.get('metric', 'area')
        
        similar_districts = agri_system.search_similar_districts(district_code, crop_name, metric)
        
        return jsonify({
            'similar_districts': similar_districts,
            'total_count': len(similar_districts)
        })
        
    except ValueError as e:
        return jsonify({'error': f'Invalid parameter format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/best-practices/<crop_name>', methods=['GET'])
def get_best_practices(crop_name):
    """Get best practices for a specific crop"""
    crop_key = crop_name.upper()
    
    if crop_key not in agri_system.crop_recommendations:
        return jsonify({'error': f'Crop {crop_name} not found in database'}), 404
    
    crop_info = agri_system.crop_recommendations[crop_key]
    
    return jsonify({
        'crop': crop_name,
        'best_practices': crop_info['best_practices'],
        'optimal_season': crop_info['optimal_season'],
        'soil_requirements': crop_info['soil_requirements']
    })

@app.route('/api/pest-control/<crop_name>', methods=['GET'])
def get_pest_control(crop_name):
    """Get pest control recommendations for a specific crop"""
    crop_key = crop_name.upper()
    
    if crop_key not in agri_system.crop_recommendations:
        return jsonify({'error': f'Crop {crop_name} not found in database'}), 404
    
    crop_info = agri_system.crop_recommendations[crop_key]
    
    return jsonify({
        'crop': crop_name,
        'pest_control': crop_info['pest_control'],
        'recommended_rotation': crop_info['rotation_crops']
    })

@app.route('/api/dataset-info', methods=['GET'])
def get_dataset_info():
    """Get information about the loaded dataset"""
    if agri_system.dataset is None:
        return jsonify({'error': 'Dataset not loaded'}), 400
    
    return jsonify({
        'total_records': len(agri_system.dataset),
        'total_districts': len(agri_system.district_mapping),
        'crop_columns': agri_system.crop_columns,
        'dataset_columns': list(agri_system.dataset.columns),
        'year_range': {
            'min': int(agri_system.dataset['Year'].min()) if 'Year' in agri_system.dataset.columns else None,
            'max': int(agri_system.dataset['Year'].max()) if 'Year' in agri_system.dataset.columns else None
        }
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("=== GramSathi Agricultural Knowledge API Server ===")
    print("Server starting...")
    print(f"Dataset loaded: {agri_system.dataset is not None}")
    if agri_system.dataset is not None:
        print(f"Total records: {len(agri_system.dataset)}")
        print(f"Total districts: {len(agri_system.district_mapping)}")
    print("Available endpoints:")
    print("  GET  /api/health - Health check")
    print("  GET  /api/crops - List supported crops")
    print("  GET  /api/districts - List available districts")
    print("  POST /api/advice - Get agricultural advice")
    print("  POST /api/trends - Get crop trends")
    print("  POST /api/calendar - Get crop calendar")
    print("  POST /api/similar-districts - Find similar districts")
    print("  GET  /api/best-practices/<crop> - Get best practices")
    print("  GET  /api/pest-control/<crop> - Get pest control info")
    print("  GET  /api/dataset-info - Get dataset information")
    print("\nServer running on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)