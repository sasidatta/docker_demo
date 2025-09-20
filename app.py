from flask import Flask, render_template, request
import mysql.connector

app = Flask(__name__)

# Database connection function
def get_db_connection():
    return mysql.connector.connect(
        host="192.168.0.174",      # or your MySQL server IP
        user="dockeruser",           # change if you created a new user
        password="StrongPassword123",  # replace with your MySQL root/user password
        database="dockerdb"
    )

@app.route("/", methods=["GET", "POST"])
def bmi_calculator():
    bmi = None
    if request.method == "POST":
        height = request.form.get("height")
        unit = request.form.get("unit")
        weight = request.form.get("weight")

        try:
            weight = float(weight)
            height = float(height)

            # Convert to meters
            if unit == "cm":
                height_m = height / 100
            elif unit == "ft":
                height_m = height * 30.48 / 100
            else:
                height_m = None

            if height_m and weight:
                bmi = round(weight / (height_m ** 2), 2)

                # Save record to database
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO bmi_records (height, unit, weight, bmi) VALUES (%s, %s, %s, %s)",
                    (height, unit, weight, bmi)
                )
                conn.commit()
                cursor.close()
                conn.close()

        except ValueError:
            bmi = "Invalid input. Please enter numbers only."

    return render_template("index.html", bmi=bmi)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
