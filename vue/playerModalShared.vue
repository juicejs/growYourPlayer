<template>
  <div class="modal fade container-fluid" id="playerDetailsShared" tabindex="-1" aria-labelledby="exampleModalLabel"
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
              <h5 class="card-title mb-3"><span><a style="text-decoration: underline;" target="_blank" v-bind:href="player.transfermarkt?.link">Transfermarket:</a></span>
                <span class="data">{{ player.transfermarkt?.price }} €</span></h5>
              <h5 class="card-title mb-3"><span>Position:</span> <span class="data">{{ player.position }}</span></h5>
              <h5 class="card-title mb-3"><span>Birth place:</span> <span class="data">{{ player.birth_place }}</span>
              </h5>
              <!--                                <h5 class="card-title mb-3"><span>Birth date:</span> <span class="data"></span></h5>-->
              <div class="right-content">
                <h5 class="card-title mb-3"><span>Number:</span> <span class="data">{{ player.number }}</span></h5>
                <h5 class="card-title mb-3"><span>Weight:</span> <span class="data">{{ player.weight }}</span></h5>
                <h5 class="card-title mb-3"><span>Height:</span> <span class="data">{{ player.height }}</span></h5>
                <h5 class="card-title mb-3"><span>Representing</span> <span class="data">{{ player.info }}</span></h5>
              </div>
            </div>
            <div class="investing-modal">
              <div class="invest-modal" style="margin-left: 0em;">
                <span>Balance</span>
                <span class="data">{{ balance }} $ORI</span>
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
              <div class="investing" style="height: 140px;">
                <div class="your-share" style="max-width: 50%;">
                  <h5>YOUR SHARE</h5>
                </div>
                <div class="amount" style="max-width: 47%;width: 47%;height:42px;">
                  <h5>{{ shares }}%</h5>
                </div>
                <br/>
                <br/>
                <button v-if="canBid()" v-promise-btn type="button" class="sellButton" @click="submitClaim()" value="BID">Claim ({{ myBalance }}) $ORI</button>
              </div>
              <div>
              </div>
              <div class="vl" style="height: 218px"></div>
              <div id="bid">
                <!--                            <p class="modal-price">Price: <#%= players[i].balance %#> <span>$ORI</span></p>-->
                <form>
                  <div class="modal-form form-group">

                    <div class="input-group">
                       <span class="input-group-text" style="height: 2.35rem;width: 9rem;">
                        <span class="bi-person">Amount</span>
                       </span>
                       <input type="number" style="text-align: right;" step="1" class="form-control"
                              v-bind:min="amount" min="100" name="price"
                             placeholder="Amount" v-model="amount" @keyup="calculatePercent()" @change="calculatePercent()">
                    </div>

                    <div class="input-group" style="margin-top: 5px;">
                       <span class="input-group-text" style="height: 2.35rem;width: 9rem;">
                        <span class="bi-person">Shares %</span>
                       </span>
                      <input type="number" style="text-align: right;" step="1" class="form-control" min="0.01"
                             name="percent"
                             placeholder="Shares" v-model="percent" @keyup="calculateAmount()" @change="calculateAmount()">
                    </div>

                    <div class="input-group" style="margin-top: 15px;">
                       <span class="input-group-text" style="background: #A82929;height: 2.35rem;">
                        <span class="bi-person" style="background: #A82929;color: white;">Total (+Tax) $ORI</span>
                       </span>
                        <input type="number" step="1"
                               style="background: #A82929;text-align: right;color: white;"
                               class="form-control" v-model="escrow" name="result" disabled>
                    </div>

                    <button v-if="canBid()" v-promise-btn type="button" class="buyButton" @click="submitBuy()" value="BID">Buy</button>
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
      initialValue: 0,
      myBalance: 0,
      percent: 0
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
      this.player = this.players.find(player => player.modalId == id);
      const myModal = new bootstrap.Modal(document.getElementById('playerDetailsShared'), {})
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
    calculatePercent: function () {
      const amount = parseInt(this.amount);
      this.percent = parseFloat((amount * 100 / this.balance).toFixed(3));
      this.escrow = (amount + ((0.1 * amount))).toFixed(1);
    },
    calculateAmount: function () {
      const amount = this.percent * this.balance / 100;
      this.amount = amount;
      this.escrow = (amount + ((0.1 * amount))).toFixed(1);
    },
    async initConnection() {
      const shareAbi = await (await fetch("/data/OriShare.json")).json();
      const tokenAbi = await (await fetch("/data/OriToken.json")).json();

      this.web3 = new Web3(window.provider);
      this.oriShare = await new this.web3.eth.Contract(shareAbi.abi, "0x30e3214b3Aa01eC09bd92b2bffC7E6AF09E862D0");
      this.oriToken = await new this.web3.eth.Contract(tokenAbi.abi, "0x54cC4dB6f878A1cDE6BdD0c8bEfCf70f5DABF206");

      this.accounts = await this.web3.eth.getAccounts();

      await this.loadTangible();
    },
    async loadTangible() {
      this.currentPrice = await this.oriShare.methods
          .getPrice()
          .call();
      this.currentPrice = Math.floor(this.currentPrice / 100000);
      this.price = this.currentPrice;

      this.balance = await this.oriShare.methods
          .getBalance()
          .call();
      this.balance = Math.floor(this.balance / 100000);
      debugger;
      this.shares = (await this.oriShare.methods
          .sharesOf(this.accounts[0])
          .call());
      if (this.shares > 0){
        this.shares = (this.shares / 1000).toFixed(3);
      }

      this.myBalance = await this.oriShare.methods
          .balanceOf(this.accounts[0])
          .call();
      if (this.myBalance > 0){
        this.myBalance = Math.floor(this.myBalance / 100000).toFixed(2);
      }
    },
    canBid(){
        return localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER") != null;
    },
    async submitBuy() {

      const paymentAmount = parseInt(this.amount) * 100000;

      let allowance = await this.oriToken.methods
          .allowance(this.accounts[0], "0x30e3214b3Aa01eC09bd92b2bffC7E6AF09E862D0")
          .call();
      allowance = parseInt(allowance);

      if (allowance < paymentAmount) {
        const approve = await this.oriToken.methods
            .approve("0x30e3214b3Aa01eC09bd92b2bffC7E6AF09E862D0", 7500000 * 100000)
            .send({from: this.accounts[0]});
      }

      const result = await this.oriShare.methods
          .purchase(paymentAmount)
          .send({from: this.accounts[0]})

      await this.loadTangible();
    },
    async submitClaim() {

      const result = await this.oriShare.methods
          .claim()
          .send({from: this.accounts[0]})

      await this.loadTangible();
    },
    async accept(offer) {
      let amount = prompt("How many shares to sell?", 0);
      amount = parseInt(amount);
      if (amount == 0 || amount > offer.amount || amount > this.shares)
        return alert("Invalid amount or insufficient shares");

      const result = await this.oriShare.methods.accept(offer.from, amount).send({
        from: this.accounts[0]
      });

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
