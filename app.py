from flask import Flask
from routes.recommend import recommend_bp

app = Flask(__name__)
app.register_blueprint(recommend_bp)

if __name__ == '__main__':
    app.run(debug=True)
