const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
var prefix = ayarlar.prefix;

module.exports = client => {
 setInterval(function() {
}, 5000);
client.user.setPresence({
        game: {
            name: `Salvo Code | Guard Botu`,
            type: 'WATCHING'   //WATCHING - İZLİYOR LISTINING - DİNLİYOR
        },
        status: 'idle'   //online - Çevrimiçi idle - Boşta dnd - Rahatsız Etmeyin
    })
    console.log(`[Salvo Code]: Bot Hazır, Komutlar Yüklendi`);
}