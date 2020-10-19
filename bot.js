const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
var Jimp = require('jimp');
const { Client, Util } = require('discord.js');
const weather = require('weather-js')
const fs = require('fs');
const db = require('quick.db');
const http = require('http');
const express = require('express');
require('./util/eventLoader')(client);
const path = require('path');
const request = require('request');
const snekfetch = require('snekfetch');
const queue = new Map();
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');


const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping tamamdır.");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

var prefix = ayarlar.prefix;

const log = message => {
    console.log(`${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
    if (err) console.error(err);
    log(`${files.length} komut yüklenecek.`);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        log(`Yüklenen komut: ${props.help.name}.`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});




client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};




client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.elevation = message => {
    if (!message.guild) {
        return;
    }
    let permlvl = 0;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
    if (message.author.id === ayarlar.sahip) permlvl = 4;
    return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
    console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
    console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});



// BOT KORUMA - SALVO CODE
client.on("guildMemberAdd", member => {
  const guild = member.guild;
  let botkorumakanali = member.guild.channels.find(`id`, "767735549309091840");//LOG KANALI
  if (member.user.bot !== true) {
  } else {
   const botkoruma = new Discord.RichEmbed()
	.setColor('BLACK')
	.setTitle('Salvo Code Bot Koruma Sistemi')
  .setDescription("**Sunucuya Bir Bot Eklendi Ve Güvenlik Nedeniyle Atıldı**")
  .addField("**Banlanan Bot**",`${member.user.tag}`,true)
  .setTimestamp()
  .setFooter('Salvo Code Guard Botu');
  botkorumakanali.send(botkoruma);
    member.kick(member);
  }
  
});



// KANAL KORUMA - SALVO CODE
client.on("channelDelete", async channel => {
  let kanalkorumakanali = channel.guild.channels.find(`id`, "767735515033894922");//LOG KANALI İD
  const bilgilendir = await channel.guild.fetchAuditLogs({type: "deleteChannel"}).then(hatırla => hatırla.entries.first())
  let silenkişi = bilgilendir.executor;
  const entry = await channel.guild
  .fetchAuditLogs({ type: "CHANNEL_DELETE" })
  .then(audit => audit.entries.first());
  const yetkili = await channel.guild.members.get(entry.executor.id);
  const nice = channel.permissions;
  console.log(nice);
  if (yetkili.id === "463000494164672512") return; //ID'si Ekli Olan Kişinin Yetkisi Alınmaz Kanal Silebilir
      channel
      .clone(undefined, true, true, "Kanal Koruma Sistemi")
      .then(async klon => {
        await klon.setParent(channel.parent);
        await klon.setPosition(channel.position);
        await klon.setSize(channel.size);
      });

  let embed = new Discord.RichEmbed()
    .setColor('BLACK')
	  .setTitle('Salvo Code Kanal Koruma Sistemi')
    .setDescription("**Bir Kanal Silindi Silen Kişinin Yetkilerini Aldım ve Cezalı Rolünü Verdim**")
    .addField("**Kanalı Silen Kişi**",`${silenkişi}`,true)
    .addField("**Silinen Kanal**",`${channel.name}`,true)
    .setFooter('Salvo Code Guard Botu');
  let roles = channel.guild.members.get(yetkili.id).roles.array();
  try {
    channel.guild.members.get(yetkili.id).removeRoles(roles);
  } catch (err) {
    console.log(err);
  }
  setTimeout(function() {
    channel.guild.members.get(yetkili.id).addRole("755870365116268715"); //CEZALI ROL ID'si Eklenecek
    kanalkorumakanali.send(embed);
  }, 2000);
});





// ROL KORUMA - SALVO CODE
client.on("roleDelete", async role => {
  let rolkanal = role.guild.channels.find(`id`, "767735534264385536");//LOG KANALI
  const bilgilendir = await role.guild.fetchAuditLogs({type: "deleteRole"}).then(hatırla => hatırla.entries.first())
  let silenkişi = bilgilendir.executor;
  const entry = await role.guild
  .fetchAuditLogs({ type: "ROLE_DELETE" })
  .then(audit => audit.entries.first());
  const yetkili = await role.guild.members.get(entry.executor.id);
  const nice = role.permissions;
  console.log(nice);
  if (yetkili.id === "463000494164672512") return; //ID'si Ekli Olan Kişinin Yetkisi Alınmaz Rol Silebilir
  if (yetkili.id === "741289935092318399") return; //BOTUN KENDİ ID'si
  role
      .clone(undefined, true, true, "Rol Koruma Sistemi")
      .then(async klon => {
        await klon.setParent(role.parent);
        await klon.setPosition(role.position);
      });
  let embed = new Discord.RichEmbed()
    .setColor('BLACK')
	  .setTitle('Salvo Code Rol Koruma Sistemi')
    .setDescription("**Bir Rol Silindi Silen Kişinin Yetkilerini Aldım ve Cezalı Rolünü Verdim**")
    .addField("**Rolü Silen Kişi**",`${silenkişi}`,true)
    .addField("**Silinen Rol**",`${role.name}`,true)
    .setTimestamp()
    .setFooter('Salvo Code Guard Botu')
    .setTimestamp();
  let roles = role.guild.members.get(yetkili.id).roles.array();
  try {
    role.guild.members.get(yetkili.id).removeRoles(roles);
  } catch (err) {
    console.log(err);
  }
  setTimeout(function() {
    role.guild.members.get(yetkili.id).addRole("755870365116268715"); //CEZALI ROL ID'si Eklenecek
    rolkanal.send(embed);
  }, 2000);
});




// ROL AÇMA ENGEL - SALVO CODE
client.on('roleCreate', async (role, member) => {
  let sChannel = role.guild.channels.find(`id`, "767735534264385536");//LOG KANALI
  const bilgilendir = await role.guild.fetchAuditLogs({type: "createRole"}).then(hatırla => hatırla.entries.first())
  let açankişi = bilgilendir.executor;
  const entry = await role.guild
  .fetchAuditLogs({ type: "ROLE_CREATE" })
  .then(audit => audit.entries.first());
  const yetkili = await role.guild.members.get(entry.executor.id);
  const nice = role.permissions;
  console.log(nice);
  if (yetkili.id === "463000494164672512") return; //ID'si Ekli Olan Kişinin Yetkisi Alınmaz Kanal Silebilir

  let embed = new Discord.RichEmbed()
    .setColor('BLACK')
	  .setTitle('Salvo Code Rol Koruma Sistemi')
    .setDescription("**Bir Rol Eklendi, Açılan Rolü Sildim**")
    .addField("**Rolü Ekleyen Kişi**",`${açankişi}`,true)
    .addField("**Silinen Rol**",`${role.name}`,true)
    .setTimestamp()
    .setFooter('Salvo Code Guard Botu')
    .setTimestamp();
  let roles = role.guild.members.get(yetkili.id).roles.array();
  try {
   role.guild.members.get(yetkili.id).removeRoles(roles);
  } catch (err) {
    console.log(err);
  }
  setTimeout(function() {
    role.guild.members.get(yetkili.id).addRole("755870365116268715"); //CEZALI ROL ID'si Eklenecek
    sChannel.send(embed);
  }, 2000);
  role.delete()
});


// DDOS KORUMA - SALVO CODE
client.on('message', msg => {

if(client.ping > 2000) {

    let bölgeler = ['singapore', 'eu-central', 'india', 'us-central', 'london',
    'eu-west', 'amsterdam', 'brazil', 'us-west', 'hongkong', 
    'us-south', 'southafrica', 'us-east', 'sydney', 'frankfurt',
    'russia']
    let yenibölge = bölgeler[Math.floor(Math.random() * bölgeler.length)]
    let ddoskanal = msg.guild.channels.find(c => c.name === "ddos-koruma")
    const cıks = new Discord.RichEmbed()
    .setColor('BLACK')
    .setTitle("DDOS Koruması")
    .setDescription("**Sunucuya DDOS Saldırısı Yapılıyor Sunucu Bölgesini Değiştirdim**")
    .addField("**Sunucu Pingi**",`+ client.ping`,true)
    .addField("**Yeni Sunucu Bölgesi**",`${yenibölge}`,true)
    .setTimestamp()
    .setFooter('Salvo Code Guard Botu');
    ddoskanal.send(cıks);
}});



// LİNK ENGEL - SALVO CODE
client.on("message", async message => {
  let uyarisayisi = await db.fetch(`reklamuyari_${message.author.id}`);
  let reklamkick = await db.fetch(`reklamkick_${message.guild.id}`);
  let salvo = message.member;
  if (reklamkick == "kapali") return;
  if (reklamkick == "acik") {
    const reklam = [
      "discord.app",
      "discord.gg",
      "invite",
      "discordapp",
      "discordgg",
      ".com",
      ".net",
      ".xyz",
      ".tk",
      ".pw",
      ".io",
      ".me",
      ".gg",
      "www.",
      "https",
      "http",
      ".gl",
      ".org",
      ".com.tr",
      ".biz",
      ".party",
      ".rf.gd",
      ".az"
    ];
    if (reklam.some(word => message.content.toLowerCase().includes(word))) {
      if (!message.member.hasPermission("ADMINISTRATOR")) {
        message.delete();
        db.add(`reklamuyari_${message.author.id}`, 1); 
        if (uyarisayisi === null) {
          let uyari = new Discord.RichEmbed()
            .setColor("RANDOM")
            .setFooter("Reklam Koruma", client.user.avatarURL)
            .setDescription(
              `<@${message.author.id}> Reklam Koruma Sistemine Yaklandın Lütfen Reklam Yapma (1/3)`
            )
            .setTimestamp();
          message.channel.send(uyari);
        }
        if (uyarisayisi === 1) {
          let uyari = new Discord.RichEmbed()
            .setColor("RANDOM")
            .setFooter("Reklam Koruma", client.user.avatarURL)
            .setDescription(
              `<@${message.author.id}> Reklam Koruma Sistemine Yaklandın Lütfen Reklam Yapma (2/3)`
            )
            .setTimestamp();
          message.channel.send(uyari);
        }
        if (uyarisayisi === 2) {
          message.delete();
          await salvo.kick({
            reason: `Reklam kick sistemi`
          });
          let uyari = new Discord.RichEmbed()
            .setColor("RANDOM")
            .setFooter("Reklam Koruma", client.user.avatarURL)
            .setDescription(
              `<@${message.author.id}> 3 Kez Reklam Uyarısı Aldığı Tespit Edildi ve Sunucudan Atıldı (3/3)`
            )
            .setTimestamp();
          message.channel.send(uyari);
        }
        if (uyarisayisi === 3) {
          message.delete();
          await salvo.ban({
            reason: `Salvo Guard | Reklam Koruma Sistemi`
          });
          db.delete(`reklamuyari_${message.author.id}`);
          let uyari = new Discord.RichEmbed()
            .setColor("RANDOM")
            .setFooter("Reklam Koruma", client.user.avatarURL)
            .setDescription(
              `<@${message.author.id}> Atıldıktan Sonra Tekrar Reklam Yaptığı için Banlandı`
            )
            .setTimestamp();
          message.channel.send(uyari);
        }
      }
    }
  }
});


client.login(ayarlar.token);
