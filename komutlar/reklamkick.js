const db = require("quick.db");
const Discord = require("discord.js");
exports.run = async (bot, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR"))
    return message.channel.send(new Discord.RichEmbed().setColor('BLACK').setDescription("Bu Komutu Kullanamazsınız"));
  if (!args[0])
    return message.channel.send(new Discord.RichEmbed().setColor('BLACK').setDescription("Reklam Korumayı Kullanmak için `reklam-kick aç veya kapat` Yazınız"));
  if (args[0] == "aç") {
    db.set(`reklamkick_${message.guild.id}`, "acik");
    message.channel.send(new Discord.RichEmbed().setColor('BLACK').setDescription(
      `**Reklam kick sistemi açıldı. Reklam yapanlar 3 uyarıdan sonra atılacaktır.**`
    ));
  }
  if (args[0] == "kapat") {
    db.set(`reklamkick_${message.guild.id}`, "kapali");
    message.channel.send(new Discord.RichEmbed().setColor('BLACK').setDescription(`**Reklam kick sistemi kapatıldı!**`));
  }
};
exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["reklam-kick", "reklamkick", "kickreklam"],
  permLevel: 0
};
exports.help = {
  name: "reklamkick",
  description: "Reklam kick sistemini açıp kapatır",
  usage: "reklamkick aç/kapat"
};
