function calc() {
    let price = document.getElementById('inputPrice').value;
    let amount = document.getElementById('amountPrice').value;
    let result = price * amount + (0.1 * price * amount);
    document.getElementById("result").value = result;
}
