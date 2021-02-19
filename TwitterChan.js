require('dotenv').config()
const Twit = require('twit')
const { exec } = require('child_process');
const Discord = require('discord.js');
const client = new Discord.Client();
const cron = require('node-cron');


// CronJob every 24 Hours at 0:00
cron.schedule('0 0 * * *', function() {
  exec("pm2 restart TwitterChan")
});


var T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
})
client.login(process.env.DISCORD_TOKEN);
client.once('ready', () => {
  var stream = T.stream('statuses/filter', {
    follow: [process.env.TWITTER_USER_ID]
  })
  
  stream.on('tweet', function (tweet) {
    var url = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
      if (tweet.in_reply_to_status_id ||
        tweet.in_reply_to_status_id_str ||
        tweet.in_reply_to_user_id ||
        tweet.in_reply_to_user_id_str ||
        tweet.in_reply_to_screen_name) {
        return;
      } 
      else if (tweet.retweeted_status) {
        let channel = client.channels.fetch(process.env.DISCORD_CHANNEL_ID).then(channel => {
          channel.send("**Sii-chan retweeted: **" + url);
        }).catch(err => {
          console.log(err)
        })
      }
      
      else {
        let channel = client.channels.fetch(process.env.DISCORD_CHANNEL_ID).then(channel => {
          channel.send("**Sii-chan tweeted: **" + url);
        }).catch(err => {
          console.log(err)
        })
      }
    })})