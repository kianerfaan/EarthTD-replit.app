from flask import Flask, render_template
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

@app.route('/')
def game():
    return render_template('game.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
