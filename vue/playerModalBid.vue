<template>
  <div class="modal fade container-fluid" id="playerDetailsBid" tabindex="-1" aria-labelledby="exampleModalLabel"
       aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold" id="playerName">{{ player.name }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="upper-content">
            <img class="modal-image img-fluid img-thumbnail" v-bind:src="'/images/' + player.image"
                 alt="Player card image">
            <div class="modal-player-content container-fluid">
              <h5 class="card-title mb-3"><span>Age:</span> <span class="data">{{ player.age }}</span></h5>
              <h5 class="card-title mb-3"><span><a style="text-decoration: underline;" target="_blank"
                                                   v-bind:href="player.transfermarkt?.link">Transfermarket:</a></span>
                <span class="data">{{ player.transfermarkt?.price }} €</span></h5>
              <h5 class="card-title mb-3"><span>Position:</span> <span class="data">{{ player.position }}</span></h5>
              <h5 class="card-title mb-3"><span>Birth place:</span> <span class="data">{{ player.birth_place }}</span>
              </h5>
              <!--                                <h5 class="card-title mb-3"><span>Birth date:</span> <span class="data"></span></h5>-->
              <div class="right-content">
                <h5 class="card-title mb-3"><span>Number:</span> <span class="data">{{ player.number }}</span></h5>
                <h5 class="card-title mb-3"><span>Weight:</span> <span class="data">{{ player.weight }}</span></h5>
                <h5 class="card-title mb-3"><span>Height:</span> <span class="data">{{ player.height }}</span></h5>
              </div>
            </div>
            <div class="investing-modal">
              <div class="invest-modal">
                <span>Balance</span>
                <span class="data">{{ balance }} $ORI</span>
              </div>
              <!--                                <div class="p-share-modal">
                                                  <span>P/Share</span>
                                                  <span class="data">1556 $ORI</span>
                                              </div>-->
              <div class="profit-modal">
                <span>Profit</span>
                <span class="data">+{{ (balance * 100 / initialValue) - 100 | format(2) }}%</span>
              </div>
            </div>
          </div>
          <div class="bottom-content">
            <div class="buttons">
              <button class="btn orders-button" v-bind:class="{ 'active': ordersActive }" @click="showOrders()">Orders
              </button>
              <button class="btn rewards-button" v-bind:class="{ 'active': rewardsActive }" @click="showRewards()">
                Rewards
              </button>
            </div>
            <!--<div class="piechart" id="piechart<%#= players[i].modalId %>"></div>-->
            <div v-if="ordersActive" class="orders">
              <div class="investing">
                <div class="your-share">
                  <h5>YOUR SHARE</h5>
                </div>
                <div class="amount">
                  <h5>{{ shares }}%</h5>
                </div>
                <table class="table">
                  <thead class="thead">
                  <tr>
                    <th scope="col" style="font-size: 0.8em;">Price <br/>per Share</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="offer in offers">
                    <td>{{ offer.price / 100000 }} $ORI</td>
                    <td>{{ offer.amount }}%</td>
                    <td>
                      <button v-promise-btn v-if="shares > 0 && offer.from != accounts[0]" class="acceptButton"
                              @click="accept(offer)">Accept
                      </button>
                      <button v-promise-btn v-if="offer.from == accounts[0]" class="acceptButton"
                              @click="cancel(offer)">Cancel
                      </button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
              <div class="vl"></div>
              <div id="bid">
                <!--                            <p class="modal-price">Price: <#%= players[i].balance %#> <span>$ORI</span></p>-->
                <form>
                  <div class="modal-form form-group">

                    <div class="input-group">
                       <span class="input-group-text">
                        <span class="bi-person">Price per share</span>
                       </span>
                       <input type="number" style="text-align: right;" step="1" class="form-control" v-bind:min="price" name="price"
                             placeholder="Price" v-model="price" @keyup="calculate()" @change="calculate()">
                    </div>


                    <div class="input-group" style="margin-top: 5px;">
                       <span class="input-group-text">
                        <span class="bi-person">Amount</span>
                       </span>
                      <input type="number" style="text-align: right;" step="1" class="form-control" min="1"
                             name="amount" placeholder="Amount"
                             v-model="amount" @keyup="calculate()" @change="calculate()">
                    </div>

                      <div class="input-group" style="margin-top: 15px;">
                       <span class="input-group-text" style="background: #A82929">
                        <span class="bi-person" style="background: #A82929;color: white;">Total $ORI</span>
                       </span>
                        <input type="number" step="1"
                               style="background: #A82929;text-align: right;color: white;"
                               class="form-control" v-model="escrow" name="result" disabled>
                      </div>

                    <button v-if="canBid()" v-promise-btn type="button" id="bidButton" @click="submitBid()" value="BID">BID</button>
                    <div v-if="!canBid()" style="color:red;font-weight: bold;"><br>Please connect your wallet first</div>
                  </div>
                </form>
              </div>
            </div>
            <div v-if="rewardsActive" class="rewards">
              <div class="investing" style="width:100%">
                <table class="table">
                  <thead class="thead">
                  <tr>
                    <th scope="col">Reward</th>
                    <th scope="col">Count</th>
                    <th scope="col">Amount</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td>Goal</td>
                    <td>0</td>
                    <td>1000 $ORI</td>
                  </tr>
                  <tr>
                    <td>Win</td>
                    <td>0</td>
                    <td>1000 $ORI</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {
  components: {},
  data() {
    return {
      ordersActive: true,
      rewardsActive: false,
      players: [],
      player: {},
      price: 0,
      escrow: '',
      balance: 0,
      amount: 1,
      offers: [],
      shares: 0,
      currentPrice: 0,
      initialValue: 0
    }
  },
  beforeMount() {
    fetch("/data/players.json").then(async players => {
      this.players = await players.json();
    });
  },
  filters: {
    format: function (value, digits = 0) {
      if (typeof value != "number") value = parseFloat(value);
      if (isNaN(value)) value = 0;
      if (!value) value = 0;
      return parseFloat(value.toFixed(digits));
    }
  },
  methods: {
    show(id) {
      debugger;
      this.player = this.players.find(player => player.modalId == id);
      const myModal = new bootstrap.Modal(document.getElementById('playerDetailsBid'), {})
      myModal.show();
      this.initConnection();
    },
    showRewards: function () {
      this.ordersActive = false;
      this.rewardsActive = true;
    },
    showOrders: function () {
      this.ordersActive = true;
      this.rewardsActive = false;
    },
    calculate: function () {
      this.escrow = this.price * this.amount + (0.1 * this.price * this.amount);
    },
    async initConnection() {
      const shareAbi = await (await fetch("/data/OriBid.json")).json();
      const tokenAbi = await (await fetch("/data/OriToken.json")).json();

      this.web3 = new Web3(window.provider);
      this.oriShare = await new this.web3.eth.Contract(shareAbi.abi, "0x3C935E0aF2479Bb7C3A078f78f338CC3aD1B5a42");
      this.oriToken = await new this.web3.eth.Contract(tokenAbi.abi, "0x54cC4dB6f878A1cDE6BdD0c8bEfCf70f5DABF206");

      this.accounts = await this.web3.eth.getAccounts();

      await this.loadTangible();
    },
    async loadTangible() {
      debugger;
      this.currentPrice = await this.oriShare.methods
          .getPrice()
          .call();
      this.currentPrice = Math.floor(this.currentPrice / 100000);
      this.price = this.currentPrice;

      this.balance = await this.oriShare.methods
          .getBalance()
          .call();
      this.balance = Math.floor(this.balance / 100000);

      this.initialValue = await this.oriShare.methods
          .getInitialValue()
          .call();
      this.initialValue = Math.floor(this.initialValue / 100000);

      const offers = await this.oriShare.methods
          .getOffers()
          .call();
      this.offers = [];
      for (let offer of offers) {
        this.offers.push({
          price: offer.price,
          amount: offer.amount,
          from: offer.from
        });
      }

      this.shares = await this.oriShare.methods
          .getShare(this.accounts[0])
          .call()

      this.calculate();
    },
    canBid(){
        return localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER") != null;
    },
    async submitBid() {
      const escrow = this.escrow * 100000;
      const price = this.price * 100000;

      debugger;

      let allowance = await this.oriToken.methods
          .allowance(this.accounts[0], "0x3C935E0aF2479Bb7C3A078f78f338CC3aD1B5a42")
          .call();
      allowance = parseInt(allowance);

      if (allowance < escrow) {
        const approve = await this.oriToken.methods
            .approve("0x3C935E0aF2479Bb7C3A078f78f338CC3aD1B5a42", 7500000 * 100000)
            .send({from: this.accounts[0]});
      }

      const result = await this.oriShare.methods
          .bid(price, parseInt(this.amount))
          .send({from: this.accounts[0]})

      await this.loadTangible();
    },
    async accept(offer) {
      let amount = prompt("How many shares to sell?", 0);
      amount = parseInt(amount);
      if (amount == 0 || amount > offer.amount || amount > this.shares)
        return alert("Invalid amount or insufficient shares");

      const result = await this.oriShare.methods.accept(offer.from, amount).send({from: this.accounts[0]});

      await this.loadTangible();
    },
    async cancel() {
      let sure = confirm("Are you sure to cancel your offer?");
      if (sure) {
        await this.oriShare.methods.cancel().send({from: this.accounts[0]});
      }

      await this.loadTangible();
    }
  }
}
</script>
