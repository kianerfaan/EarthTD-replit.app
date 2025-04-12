
from flask import Flask, render_template
import os

app = Flask(__name__)
app.secret_key = os.environ["SESSION_SECRET"]

@app.route('/')
def game():
    return render_template('game.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
