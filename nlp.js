/* Discord */

const Discord = require("discord.js");
const client = new Discord.Client;
const config = {
  "token":"aqui va el token",
  "prefix":"&"
}

var prefix = config.prefix;
;

/* nlp */
const { NlpManager } = require('node-nlp');
const readline = require('readline');
const puerto = 4500;
const logfn = (status, time) => console.log(status, time);
const manager = new NlpManager({ languages: ['es'] ,nlu: { useNoneFeature: false ,log: logfn} });
manager.load("model.nlp");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/*iniciar bot en discord */
client.on("ready", () => {
  console.log(`${client.user.username} listo para conversar en discord `);
  client.user.setActivity("Are you a robot?");
});


/* le decimos al bot de discord que vea los mensajes */

client.on("message", async message =>{
  //const args = message.content.slice(prefix.lenght).trim().split(/ +/g);
  const comando = message.content.toLowerCase();//args.shift().toLowerCase();

  if(message.author.bot) return;
  console.log('texto en discord ', comando);
  if(comando.charAt(0)=='$'){
    let mensaje = comando.substring(1);
    console.log('esto es un comando',comando);
    iniciar(mensaje,message);
  }
});

async function iniciar(texto,message){
  console.log('este es el mensaje que entró',texto);

  if(texto == "procesa"){
    await manager.train();
    manager.save();
  }
  if(texto == "exit" || texto == "salir"){
      process.exit()
  }

  // esta esperando que procese el texto
  const response = await manager.process('es', texto);
  console.log(response);
  if(response.intent == "None"){
    message.reply('Lo siento no pude entender :( pregunta nuevamente...');
    console.log("BOT responde: ");
  }
  else{
    message.reply(response.answer);
  }

  console.log("BOT responde: "+response.answer);
  //conversar();
//pregunta con la consola
/*
  rl.question('Hola soy tu bot que quieres decirme? ', (texto) => {
    (async() => {

        if(texto == "procesa"){
          await manager.train();
          manager.save();
        }
        if(texto == "exit" || texto == "salir"){
            process.exit()
        }

        // esta esperando que procese el texto
        const response = await manager.process('es', texto);
        console.log(response);
        console.log("BOT responde: "+response.answer);
        //conversar();
    })();
  });
*/
}

function conversar(){
  rl.question('sigamos conversando, en que mas puedo ayudarte? ', (texto) => {
    (async() => {
      if(texto == "exit" || texto == "salir"){
          process.exit()
      }
      const response = await manager.process('es', texto);
      if(response.intent == "None"){
        console.log("BOT responde: Lo siento no pude entender :( pregunta nuevamente...");
      }else{
        console.log(response);
        console.log("BOT responde: "+response.answer);
        console.log("BOT intencion: "+response.intent);
        if(response.sourceEntities && response.sourceEntities[0]){
          console.log("BOT entity: "+response.sourceEntities[0].text);
        }
      }

      conversar();
    })();
  });
}

client.login(config.token);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/train', (req,res)=>{
  console.log("estoy tratando de entrenar datos");
  console.log(req.body);
  let text = req.body.text;
  let intention = req.body.intention;
  let answers = req.body.answers;
  manager.addDocument('es', text, intention);
  for(var answer of answers){
      manager.addAnswer('es', intention, answer);
  }
  res.json({"message": "agregado nuevo set de entrenamiento","data":req.body});
})
app.post('/startTrain', (req,res)=>{
  (async() => {
      await manager.train();
      manager.save();
      res.json({"message": "OKey ya ta entrenado"});
  })();
})


app.listen(puerto, function () {

});
