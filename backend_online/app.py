from flask import Flask, request, jsonify
from flask_cors import CORS
from llm_call import RAG

app = Flask(__name__)
CORS(app)
rag = RAG()

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')

        # trigger deepseek
        response_deepseek = rag.call_deepseek(message)
        
        return jsonify({'message': response_deepseek})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)