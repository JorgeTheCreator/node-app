
//include te packages that will be used
var twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var fs = require('fs');
var keys = require('./keys.js');
var moment = require('moment');
var controlWord;

//global control for logging
var outConsole = true;
var outFile = true; //the file output function has problems with asyncronous output making the order wrong


//check to see it is loaded
logger("===========================================================================================================");
logger("liri.js was call on  "+moment().format("dddd, MMMM Do YYYY")+" at "+moment().format("h:mm:ss A")+" with arguments of " +process.argv[2] +" and " + process.argv[3]);
logger("===========================================================================================================",false,2);

if (process.argv.length === 2) {
    //no argv for control word. force switch to default
    controlWord = 'use_default';

}
else{
    controlWord = process.argv[2];
}


switch (controlWord){
    case "my-tweets":
        my_tweets();
    break;

    case "spotify-this-song":
        var songName="";
        songName = process.argv[3];
        spotify_this_song(songName);
    break;

    case "movie-this":
        var movieName="";
        movieName = process.argv[3];
        movie_this(movieName);
    break;

    case "do-what-it-says":
        do_what_it_says();
    break;

    default:
        //prompt for correct controlWord
        logger('Please enter a valid control work as the first argument\nmy-tweets\nspotify-this-song\nmovie-this\ndo-what-it-says');
}

function my_tweets(){
    // Twitter API Credentials
    var client = new twitter({
        consumer_key: keys.twitterKeys.consumer_key,
        consumer_secret: keys.twitterKeys.consumer_secret,
        access_token_key: keys.twitterKeys.access_token_key,
        access_token_secret: keys.twitterKeys.access_token_secret
    });

    // Make call to Twitter API to get user's timeline
    client.get('statuses/user_timeline', {screen_name: '@jorge_creator'}, function(error, tweets, response){
        if (!error) {
            for (var i = 0; i < JSON.stringify(tweets.length); i++) {
                logger('tweets: '+JSON.stringify(tweets[i].text, null, 2));
                logger('time: '+JSON.stringify(tweets[i].created_at, null, 2),false,true);
            }
        } else {
            console.error('An error occurred!'); //error handling
            logger('error statusCode = '+response.statusCode);
        }
    });
}


function spotify_this_song(songName){
    //check to see if was passed a valid songName
    if (songName === undefined) {
        //force song name if it is not passed
        songName = "The Sign Ace of Base";
    }
    spotify.search({ type: 'track', query: songName }, function(err, spotifyData) {
        if ( err ) {
            logger('Error occurred: ' + err);
        return;
        }
        if (spotifyData.tracks.items.length === 0) {
            logger('No data was returned by Spotify -- if the song name is more than one word enclose it in quotes and check the spelling...');
        }else{
            for (var i = 0; i < spotifyData.tracks.items.length; i++) {
                logger(i+1);
                logger('Artist: '+JSON.stringify(spotifyData.tracks.items[i].artists[0].name, null, 2));
                logger('Song Name: '+JSON.stringify(spotifyData.tracks.items[i].name, null, 2));
                logger('Preview Song: '+JSON.stringify(spotifyData.tracks.items[i].preview_url, null, 2));
                logger('Album: '+JSON.stringify(spotifyData.tracks.items[i].album.name, null, 2));
                logger("===============================================",false,true);
            }
        }

    });
}


function movie_this(theMovie){
    //check to see if was passed a valid songName
    if (theMovie === undefined) {
        //force song name if it is not passed
        theMovie = "Mr. Nobody";
    }
    request('http://www.omdbapi.com/?t='+theMovie+'&y=&tomatoes=true&plot=short&r=json', function (error, response, movieData) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(movieData);
            //console.log("movieData = "+movieData)
            logger("Title: "+data.Title);
            logger("Year: "+data.Year, true);
            logger("Rated: "+data.Rated, true);
            logger("IMDB Rating: "+data.imdbRating, true);
            logger("Country: "+data.Country, true);
            logger("Language: "+data.Language, true);
            logger("Plot: "+data.Plot, true);
            logger("Actors: "+data.Actors, true);
            logger("Rotten Tomatoes Rating: " +data.tomatoUserRating,true);
            logger("Rotten Tomatoes URL: " +data.tomatoURL,true);
        }
    })
}

function do_what_it_says(){
    fs.readFile("random.txt", "utf8", function(error, fileData) {
        // Then split it by commas (to make it more readable)
        var dataArr = fileData.split(',');
        var controlWord = dataArr[0];
        switch (controlWord){
            case "my-tweets":
                my_tweets();
            break;

            case "spotify-this-song":
                var songName="";
                songName = dataArr[1];
                spotify_this_song(songName);
            break;

            case "movie-this":
                var movieName="";
                movieName = dataArr[1];
                movie_this(movieName);
            break;

            default:
                //when in doubt halt and self destruct
                logger("the do-what-it-says function does not have adequate information to proceed");
                //format c:
        }
    });
}

//global variables outConsole and outFile control what is output
//txt must be passed or nothing will be processed
//addTab and addNewLine optional and can be passed as a boolean or a number
function logger(txt, addTab, addNewLine){
    var consoleLogMe;
    var fileAppendMe;
    if(txt != undefined){
        consoleLogMe = txt;
        fileAppendMe = txt;
        if (addTab > 0) {
            for (var i = 0; i < addTab; i++) {
                consoleLogMe = "\t"+consoleLogMe;
                fileAppendMe = "\t"+fileAppendMe;
            };
        };
        if (addNewLine > 0) {
            for (var i = 0; i < addNewLine; i++) {
                consoleLogMe = consoleLogMe + "\n";
            };
        };
        if (outConsole) {
            console.log(consoleLogMe);
            }
        if (outFile) {
            fs.appendFileSync("log.txt", fileAppendMe + "\n")
            //fs.appendFile("log.txt", fileAppendMe + "\n", function(err) {
                //if(err) {
                   // return console.log(err);
               // }
            //});
        };
    };
}//end function logger()


