#!/home/vishal/anaconda2/bin/python
from flask import Flask, session, render_template, request, url_for, redirect
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

@app.route('/', methods=['GET','POST'])
def index():
    if request.method == 'POST':
        username = request.form.get('username')
        account = accounts.find_one({'username':username})
        if not account:
            return login_failed()

        session['user'] = request.form['username']
        return redirect(url_for('home'))

    return render_template('index.html')

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/getsession')
def getsession():
    if 'user' in session:
        return session['user']

    return 'Not logged in!'

@app.route('/dropsession')
def dropsession():
    session.pop('user',None)
    return 'Dropped!'

if __name__ == '__main__':
    app.run(debug=True)
