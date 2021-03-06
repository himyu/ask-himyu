firebase.initializeApp({
  apiKey: "AIzaSyBezSXPBJnfO3LteDK47G8AO1anNU6_EQk",
  authDomain: "hamerinask.firebaseapp.com",
  databaseURL: "https://hamerinask.firebaseio.com",
  projectId: "hamerinask",
  storageBucket: "hamerinask.appspot.com",
  messagingSenderId: "41818205126",
  appId: "1:41818205126:web:ec1d6fdfb44a158ef320c7",
  measurementId: "G-7JD8YMVR6R"
});

let db = firebase.firestore();

function randInt(from, to) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}

$(document).ready(function () {
  const colorText = $("#color-changer > span")
  const colors = ['#404759', '#467f8c', '#f2dd72', '#f2bbbb', '#382f4b', '#005daa', '#ab94fc', '#abcdef', '#c7e2cf', '#c4beef', '#ef4b3f', '#134515'];
  let currentSelected = 0;

  function setColor() {
    const bodyEl = $("body");
    for (let i = 1; i <= colors.length; i++) {
      let className = `c${i.toString()}`
      if (bodyEl.hasClass(className)) bodyEl.removeClass(className);
    }

    let selected = randInt(1, 12);
    while(selected == currentSelected) selected = randInt(1, 12);
    currentSelected = selected;

    bodyEl.addClass(`c${selected.toString()}`);
    colorText.text(`✦ ${colors[selected-1].toString().slice(1)}`);
  }

  setColor();
  $('#color-changer').click(setColor);

  particlesJS.load('particles-js', 'assets/particles.json', function () {
    let vue_ask = new Vue({
      el: '#question_form',
      data: {
        question: ""
      },
      methods: {
        update_question: function () {
          $('#question_form > button').html('<i class="paper plane icon"></i>질문 제출하기 (' + this.question.length.toString() + '/140자)');
          if (this.question.length > 140) {
            $('#question_form > .field').addClass("error");
            $('#question_form > button').addClass("disabled");
          } else {
            $('#question_form > .field').removeClass("error");
            $('#question_form > button').removeClass("disabled");
          }
        },
        submit_question: function () {
          $('#question_form').removeClass("success");
          $('#question_form').removeClass("error");

          let submit_data = this.question.replace(/^\s+/, '').replace(/\s+$/, '');

          if (submit_data === '' || this.question.length > 140) {
            $('#question_form').addClass("error");
            return;
          }

          $('#question_form > button').html('<div class="ui active centered inline small loader"></div>');

          let now = moment.now()
          db.collection("Ask").doc(now.toString()).set({
            content: submit_data,
            answer: "아직 답변되지 않았어요 ㅠㅠ...",
            isAnswered: false,
            timestamp: moment(now).locale("ko").format('lll')
          }).then(function () {
            vue_ask.question = "";
            $('#question_form textarea').val("");
            $('#question_form').addClass("success");
          }).catch(function (error) {
            console.error(error);
          });
        }
      },
      watch: {
        question: function () {
          this.update_question();
        }
      }
    });

    let vue_list = new Vue({
      el: '#answer_container',
      data: {
        question_list: [],
        flag: false
      }
    });

    db.collection("Ask").onSnapshot(function (querySnapshot) {
      vue_list.flag = false;

      let promises = [];
      querySnapshot.forEach(element => {
        promises.push(db.collection("Ask").doc(element.id).get());
      });
      vue_list.question_list = [];
      Promise.all(promises.reverse()).then(function (results) {
        results.forEach(element => {
          vue_list.question_list.push(element.data());
        });
        vue_list.flag = true;
      });
    });
  });
});