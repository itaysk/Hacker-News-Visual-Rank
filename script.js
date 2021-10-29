/*
sample HN item:

item tr:
<tr class="athing" id="12748863">
    <td align="right" valign="top" class="title">
        <span class="rank">18.</span>
    </td>
    <td valign="top" class="votelinks">
        <center>
            <a id="up_12748863" onclick="return vote(this, &quot;up&quot;)" href="vote?id=12748863&amp;how=up&amp;auth=651eeca53c70cbbffd725c9c06cc150df7bf5571&amp;goto=news" class="nosee">
                <div class="votearrow" title="upvote"></div>
            </a>
        </center>
    </td>
    <td class="title" style="font-size: 29px;">
        <a href="https://www.tesla.com/blog/all-tesla-cars-being-produced-now-have-full-self-driving-hardware" class="storylink">
            All Tesla Cars Being Produced Now Have Full Self-Driving Hardware
        </a>
        <span class="sitebit comhead"> (
            <a href="from?site=tesla.com">
                <span class="sitestr">tesla.com</span>
            </a>
        )</span>
    </td>
</tr>

metadata tr:
<tr>
    <td colspan="2"></td>
    <td class="subtext">
        <span class="score" id="score_12748863">1412 points</span>
         by <a href="user?id=impish19" class="hnuser">impish19</a>
        <span class="age">
            <a href="item?id=12748863">2 days ago</a>
        </span>
        <span id="unv_12748863"></span> | 
        <a href="flag?id=12748863&amp;auth=651eeca53c70cbbffd725c9c06cc150df7bf5571&amp;goto=news">flag</a> | 
        <a href="hide?id=12748863&amp;goto=news&amp;auth=651eeca53c70cbbffd725c9c06cc150df7bf5571" onclick="return hidestory(this, 12748863)">hide</a> | 
        <a href="item?id=12748863">1069&nbsp;comments</a>              
    </td>
</tr>


Some items cant be voted or discussed (?), and metadata tr will look like this:
<tr>
    <td colspan="2"></td>
    <td class="subtext">
        <span class="age">
            <a href="item?id=12770150">41 minutes ago</a>
        </span> | 
        <a href="hide?id=12770150&amp;goto=news&amp;auth=719fc792107f5c47afce7958002eeae4e40b77c7" onclick="return hidestory(this, 12770150)">hide</a>
    </td>
</tr>
*/

var config = {
    minFont: 10, //in pixels
    maxFont: 30, //in pixels
    defaultFont:13.33, //in pixels    
    pointsWeight: 0.5, // 0-1, must complement commentsWeight
    commentsWeight: 0.5 // 0-1, must complement commentsWeight
}

/*
the "map" object is a global data structure in the format of:
[
    {
        id: "12748863",
        upvote: 1412,
        size: 30
    }
]
*/
var map = [];

buildIdPointsCommentsMap();
calculatePriority("points", "pointsRank");
calculatePriority("comments", "commentsRank");
calculateFinalSize();
applyStyle();



function buildIdPointsCommentsMap() {
    var subtextElementsTd = document.getElementsByClassName("subtext");
    Array.prototype.forEach.call(subtextElementsTd, function (subtextElementTd) {
        var scoreElementSpan = subtextElementTd.firstElementChild;
        //sample match: <span class="score" id="score_12748863">1412 points</span>
        if (scoreElementSpan.className !== "score") { return; } //some items cant be voted, exclude them
        var id = scoreElementSpan.id.replace("score_", "");
        var points = parseInt(scoreElementSpan.innerText.replace(" points", ""));
        var commentsElementA = subtextElementTd.lastElementChild;
        //sample match: <a href="item?id=12748863">1069&nbsp;comments</a>
        //or: <a href="item?id=12748863">discuss</a>
        if ((scoreElementSpan.innerText.indexOf("comments") != -1) || (scoreElementSpan.innerText.indexOf("discuss") != -1 )) { return; } //some items cant be discussed (?), exclude them
        var comments = parseInt(commentsElementA.innerText.replace(" comments", ""));
        map.push({ id: id, points: points, comments: comments, size: config.defaultFont });
    });
}

function calculatePriority(inputName, outputName) {
    var min = Number.MAX_VALUE;
    var max = 0;

    for (var i = 0; i < map.length; i++) {
        var val = map[i][inputName];
        if (val > max) {
            max = val;
        }
        if (val < min) {
            min = val;
        }
    }

    for (var i = 0; i < map.length; i++) {
        var val = map[i][inputName];
        var size = ((config.maxFont - config.minFont) * (val - min) / (max - min)) + config.minFont;
        size = Math.round(size);
        map[i][outputName] = size;
    }
}

function calculateFinalSize() {
    for (var i = 0; i < map.length; i++) { //TODO: too many loops over map. Combine into calculate?
        var item = map[i];
        item.size = ( item.pointsRank * config.pointsWeight) + (item.commentsRank * config.commentsWeight);
    }    
}

function applyStyle() {
    for (i = 0; i < map.length; i++) {
        var itemTrElement = document.getElementById(map[i].id); // TODO: optimize by doing one search instead of map.length searches
        var titleTdElement = itemTrElement.getElementsByClassName("titlelink")[0];
        if (titleTdElement) {
            titleTdElement.style.fontSize = map[i].size + "px";
        }
    }
}