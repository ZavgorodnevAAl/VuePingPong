<template>
  <div>
    <h1>Score: {{p1Win}} : {{p2Win}}</h1><br>
    <div v-bind:style="{ background: 'black', width: width + '%', marginLeft: marginLeft_1 + 'px',
  marginTop: '-24px', position: 'absolute'}">
      &#160;
    </div>
    <div v-bind:style="{ background: 'black', width: width + '%', marginLeft: marginLeft_2 + 'px',
  marginTop: area_height + 'px', position: 'absolute'}">
      &#160;
    </div>
    <div v-bind:style="{ background: 'black', position: 'absolute', width: width/4 + '%', fontSize: max_width/470 + 'em',
  marginLeft: marginLeft_ball + 'px', marginTop: marginTop_ball + 'px', borderRadius: max_width + 'px', }">
      &#160;
    </div>
    <div v-bind:style="{ background: 'none', marginTop: area_height + 20 + 'px' }">&#160;</div>
    <button v-on:click="UpdateSpeed(3)" class="btn btn-success">Start</button>
    <button v-on:click="UpdateSpeed(0)" class="btn btn-danger">Stop</button>
    <button v-on:click="Restart" class="btn btn-secondary">Restart</button>
  </div>
  <div id="output">
    <h1>Chat</h1>
    <p v-for="(text, index) in textOutput" :key="index">{{ text }}</p>
  </div>
  <div id="input">
    <form>
      <input type="text" v-model="textInput" :placeholder="textInput"/>
      <input type="submit" value="Send" v-on:click="submitText"/>
    </form>
  </div>
  <div>
    <small>Player1: {{ player1Id ? player1Id : "none" }}</small><br>
    <small>Player2: {{ player2Id ? player2Id : "none" }}</small>
  </div>
</template>

<script>
import io from "socket.io-client";

let socket = io("http://localhost:3000");
export default {
  name: 'PingPong',
  data() {
    return {
      context: {},
      textInput: null,
      textOutput: [],
      player1Id: null,
      player2Id: null,

      width: 20,
      marginLeft_1: 0,
      area_height: 500,
      marginLeft_2: 0,
      max_width: 300,
      marginLeft_ball: 0,
      marginTop_ball: 30,
      p1Win: 0,
      p2Win: 0,
    }
  },
  created() {
    socket.on('connect', () => {
      console.log('Connected!');
    });
    socket.on('receive', (text) => {
      this.textOutput.push(text);
      this.textInput = null;
    });
    document.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('resize', this.updateWidth);
    this.updateWidth();
  },
  mounted: function () {
    socket.on("position", data => {
      this.marginLeft_1 = data.player1pos * this.max_width / 30 * (100 - this.width) / 100;
      this.marginLeft_2 = data.player2pos * this.max_width / 30 * (100 - this.width) / 100;
    });
    socket.on("ballPosition", data => {
      //console.log(data);
      this.marginLeft_ball = data.x * this.max_width / 30 * (100 - (this.width / 4)) / 100;
      this.marginTop_ball = data.y * this.area_height / 8.8 * (100 - (this.width / 4)) / 100;
    });
    socket.on('updateId', (data) => {
      this.player1Id = data.p1;
      this.player2Id = data.p2;
    });
    socket.on('WinsUpdate', (data) => {
      this.p1Win = data.p1;
      this.p2Win = data.p2;
    });
  },
  methods: {
    submitText: function (event) {
      event.preventDefault();
      socket.emit('send', this.textInput);
    },
    onKeyDown(e) {
      if (e.keyCode === 65){
        socket.emit("move", {
          'direction': "left",
        });
      }
      if (e.keyCode === 68){
        socket.emit("move", {
          'direction': "right",
        });
      }
    },
    updateWidth() {
      this.max_width = window.innerWidth;
      this.area_height = this.max_width / 2;
    },
    UpdateSpeed(a) {
      socket.emit("UpdateSpeed", a);
    },
    Restart() {
      socket.emit("restart");
    }
  }
}
</script>
<style scoped>
.btn {
  margin: 0.2%;
  width: 32.5%;
}
</style>