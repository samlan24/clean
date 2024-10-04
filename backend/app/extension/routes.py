from . import extension
from flask import Flask, request, jsonify


# Store whitelist in memory for simplicity (could be replaced with a database)
whitelist = []
closed_tabs = []

# Add a tab to the whitelist
@extension.route('/add-to-whitelist', methods=['POST'])
def add_to_whitelist():
    tab_url = request.json.get('url')
    if tab_url and tab_url not in whitelist:
        whitelist.append(tab_url)
        return jsonify({"message": "Tab added to whitelist"}), 200
    return jsonify({"message": "Tab is already whitelisted or invalid URL"}), 400

# Remove a tab from the whitelist
@extension.route('/remove-from-whitelist', methods=['POST'])
def remove_from_whitelist():
    tab_url = request.json.get('url')
    if tab_url in whitelist:
        whitelist.remove(tab_url)
        return jsonify({"message": "Tab removed from whitelist"}), 200
    return jsonify({"message": "Tab not found in whitelist"}), 400

# Get the current whitelist
@extension.route('/whitelist', methods=['GET'])
def get_whitelist():
    return jsonify({"whitelist": whitelist}), 200

# Store closed tab
@extension.route('/store-closed-tab', methods=['POST'])
def store_closed_tab():
    tab_info = request.json
    closed_tabs.append(tab_info)
    return jsonify({"message": "Tab stored"}), 200

# Get closed tabs
@extension.route('/closed-tabs', methods=['GET'])
def get_closed_tabs():
    return jsonify({"closed_tabs": closed_tabs}), 200
