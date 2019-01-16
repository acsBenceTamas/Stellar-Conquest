from flask import Flask, render_template, request, url_for

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/dragula')
def dragula():
    return render_template('dragula.html')


@app.route('/game')
def game():
    return render_template('game.html', emblems=url_for('static', filename='images/emblems/' ))


if __name__ == '__main__':
    app.run()
