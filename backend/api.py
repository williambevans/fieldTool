"""
Bosque County Clerk Records API
Flask backend for EAGLE app clerk records integration

Author: HH Holdings / Bevans Real Estate
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from clerk_scraper import BosqueClerkScraper
import json
from datetime import datetime
import os

app = Flask(__name__)

# Enable CORS for GitHub Pages origin
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://williambevans.github.io",
            "http://localhost:*",
            "http://127.0.0.1:*"
        ]
    }
})

# Initialize scraper
scraper = BosqueClerkScraper()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Bosque Clerk Records API',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/clerk/search/name', methods=['GET'])
def search_by_name():
    """
    Search clerk records by name

    Query params:
        name: Person or entity name (required)
        type: Record type (optional, default: all)
    """
    name = request.args.get('name')
    record_type = request.args.get('type', 'all')

    if not name:
        return jsonify({'error': 'Name parameter is required'}), 400

    try:
        results = scraper.search_by_name(name, record_type)

        return jsonify({
            'success': True,
            'count': len(results),
            'query': {
                'name': name,
                'type': record_type
            },
            'results': results,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/clerk/search/property', methods=['GET'])
def search_by_property():
    """
    Search clerk records by property

    Query params:
        property_id: Property/parcel ID (optional)
        address: Property address (optional)
    """
    property_id = request.args.get('property_id')
    address = request.args.get('address')

    if not property_id and not address:
        return jsonify({'error': 'Either property_id or address is required'}), 400

    try:
        results = scraper.search_by_property(property_id, address)

        return jsonify({
            'success': True,
            'count': len(results),
            'query': {
                'property_id': property_id,
                'address': address
            },
            'results': results,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/clerk/search/date', methods=['GET'])
def search_by_date():
    """
    Search clerk records by date range

    Query params:
        start_date: Start date YYYY-MM-DD (required)
        end_date: End date YYYY-MM-DD (required)
        type: Record type (optional, default: all)
    """
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    record_type = request.args.get('type', 'all')

    if not start_date or not end_date:
        return jsonify({'error': 'start_date and end_date are required'}), 400

    try:
        results = scraper.search_by_date_range(start_date, end_date, record_type)

        return jsonify({
            'success': True,
            'count': len(results),
            'query': {
                'start_date': start_date,
                'end_date': end_date,
                'type': record_type
            },
            'results': results,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/clerk/document/<document_id>', methods=['GET'])
def get_document(document_id):
    """
    Get full document details

    Query params:
        source: Source system (optional, default: texasfile)
    """
    source = request.args.get('source', 'texasfile')

    try:
        document = scraper.get_document_details(document_id, source)

        if not document:
            return jsonify({'error': 'Document not found'}), 404

        return jsonify({
            'success': True,
            'document': document,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/clerk/types', methods=['GET'])
def get_record_types():
    """Get list of available record types"""
    try:
        types = scraper.get_record_types()

        return jsonify({
            'success': True,
            'record_types': types
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/clerk/stats', methods=['GET'])
def get_statistics():
    """Get statistics about clerk records"""
    try:
        stats = scraper.get_statistics()

        return jsonify({
            'success': True,
            'statistics': stats
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Development server
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'

    print(f"🦅 EAGLE Clerk Records API starting on port {port}")
    print(f"🌐 CORS enabled for GitHub Pages deployment")
    print(f"📋 Endpoints available:")
    print(f"   GET  /api/health")
    print(f"   GET  /api/clerk/search/name?name=<name>&type=<type>")
    print(f"   GET  /api/clerk/search/property?property_id=<id>&address=<addr>")
    print(f"   GET  /api/clerk/search/date?start_date=<date>&end_date=<date>")
    print(f"   GET  /api/clerk/document/<id>?source=<source>")
    print(f"   GET  /api/clerk/types")
    print(f"   GET  /api/clerk/stats")

    app.run(host='0.0.0.0', port=port, debug=debug)
