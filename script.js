let transactions = []

function displayTransactions(){
    const transactionList = document.getElementById("transaction-list");
    transactionList.innerHTML = "";

    transactions.forEach((transaction, index) => {
        const {id, type, description, amount, date} = transaction;

        const listItem = document.createElement("li");
        listItem.classList.add("transaction-item");

        const transactionText = document.createElement("div");
        transactionText.innerHTML = `<span>${
            type.charAt(0).toUpperCase() + type.slice(1)
        }</span>-${description} - ${Value} - ${formDate(Date)}`;

        const editButton = document.createElement("button");
        editButton.innerHTML = "Edit";
        editButton.addEventListener("click", () =>{
            editTransaction(index);
        });

        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        deleteButton.addEventListener("click", () => {
        deleteTransaction(index);
        });

        listItem.appendChild(transactionText);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        transactionList.appendChild(listItem);
    });
}
const transactionsSection = document.getElementById("transactions");
transactionsSection.style.display = transactions.length ? "block" : "none";


    fetch("/monthly-summary", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(transactions),
    })
    .then(response => response.json())
    .then(data => {
        displayMonthlySummary(data);
    })

    .catch((error) => console.error(error));


function formatDate(date) {
    const [month, day, year] = new Date(date).toLocaleDateString().split("/");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

function editTransaction(index) {
    const transaction = transactions[index];
    const transactionItem =
      document.getElementsByClassName("transaction-item")[index];
  
    const editDiv = document.createElement("div");
    editDiv.classList.add("edit-transaction");
  
    const typeLabel = document.createElement("label");
    typeLabel.innerText = "Type:";
    const typeSelect = document.createElement("select");
    const options = ["income", "expense"];
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.text = option.charAt(0).toUpperCase() + option.slice(1);
      if (option === transaction.type) {
        optionElement.selected = true;
      }
      typeSelect.appendChild(optionElement);
    });

    const descriptionLabel = document.createElement("label");
  descriptionLabel.innerText = "Description:";
  const descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.value = transaction.description;

  const amountLabel = document.createElement("label");
  amountLabel.innerText = "Amount:";
  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.step = "0.01";
  amountInput.value = transaction.amount;

  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Date:";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = transaction.date;

  const saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.addEventListener("click", () => {
    const updatedTransaction = {
      id: transaction.id,
      type: typeSelect.value,
      description: descriptionInput.value,
      amount: parseFloat(amountInput.value),
      date: dateInput.value,
    };

    transactions[index] = updatedTransaction;
    transactionItem.parentNode.removeChild(transactionItem);
    editDiv.parentNode.removeChild(editDiv);
    updateBalance();
    displayTransactions();
  });

  const cancelButton = document.createElement("button");
  cancelButton.innerText = "Cancel";
  cancelButton.addEventListener("click", () => {
    editDiv.parentNode.removeChild(editDiv);
  });

  editDiv.appendChild(typeLabel);
  editDiv.appendChild(typeSelect);
  editDiv.appendChild(descriptionLabel);
  editDiv.appendChild(descriptionInput);
  editDiv.appendChild(amountLabel);
  editDiv.appendChild(amountInput);
  editDiv.appendChild(dateLabel);
  editDiv.appendChild(dateInput);
  editDiv.appendChild(saveButton);
  editDiv.appendChild(cancelButton);

  transactionItem.parentNode.insertBefore(editDiv, transactionItem.nextSibling);
}

function updateBalance() {
    const balanceAmount = document.getElementById("balance-amount");
    const balance = transactions.reduce((total, transaction) => {
      if (transaction.type === "income") {
        return total + parseFloat(transaction.amount);
      } else {
        return total - parseFloat(transaction.amount);
      }
    }, 0);
}

function addTransaction(e) {
    e.preventDefault();
  
    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;
  
    const newTransaction = {
      type: type,
      description: description,
      amount: amount,
      date: date,
    };
  
    transactions.push(newTransaction);
    updateBalance();
    displayTransactions();
    // Make API request to categorise the transactions
  
    // Clear input fields
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
  }
  
  function deleteTransaction(index) {
    transactions.splice(index, 1);
    displayTransactions();
    updateBalance();
  }

  function displayMonthlySummary(data) {
    // Display categorized transactions
    const categorizedTransactions = data.categorized_transactions;
    const categorizedTransactionsHtml = `<h2>Categorized Transactions</h2>
        <ul>
          ${categorizedTransactions
            .map(
              (item) => `<li>${item.Category}: $${item.amount}</li>`
            )
            .join("")}
        </ul>`;
  //   const categorizedTransactionsDiv = document.getElementById(
      //"categorized-transactions"
    //);
    console.log(categorizedTransactionsHtml)
  //   categorizedTransactionsDiv.innerHTML = categorizedTransactionsHtml;
  
    // Display monthly summary as a bar chart
    const monthlySummary = data.monthly_summary;
    const labels = monthlySummary.map((item) => `${item.Category}/${item.amount}`);
    const amounts = monthlySummary.map((item) => item.amount);
    const monthlySummarySection = document.getElementById("monthly-summary");
    monthlySummarySection.style.display = transactions.length ? "block" : "none";
    const chartContainer = document.getElementById("chart-container");
    chartContainer.style.display = transactions.length ? "block" : "none";
    createMonthlySummaryChart(labels, amounts);
  }
  
  function createMonthlySummaryChart(labels, amounts) {
    const canvas = document.createElement("canvas");
    canvas.id = "monthly-summary-chart";
    const chartContainer = document.getElementById("chart-container");
    chartContainer.innerHTML = "";
    chartContainer.appendChild(canvas);
    console.log("createMonthlySummaryChart called");
    const ctx = canvas.getContext("2d");
    console.log("hi1");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Transaction Amount",
            data: amounts,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
    console.log("hi2");
}
