from flask import Flask, render_template, request

app = Flask(__name__)

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

        except ValueError:
            bmi = "Invalid input. Please enter numbers only."

    return render_template("index.html", bmi=bmi)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
