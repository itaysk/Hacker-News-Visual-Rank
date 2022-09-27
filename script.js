/*
sample HN item:

<tr class="athing" id="32987028">
	<td align="right" valign="top" class="title"><span class="rank">27.</span></td>
	<td valign="top" class="votelinks">
		<center>
			<a id="up_32987028" class="clicky" href="vote?id=32987028&amp;how=up&amp;auth=f127c4b9607ee6f58efc7de0790ff40256f36bc8&amp;goto=news">
				<div class="votearrow" title="upvote"></div>
			</a>
		</center>
	</td>
	<td class="title"><a href="https://vivqu.com/blog/2022/09/25/outdated-apps/" class="titlelink" style="font-size: 30px;">Outdated vs. Complete: In defense of apps that don’t need updates</a><span class="sitebit comhead"> (<a href="from?site=vivqu.com"><span class="sitestr">vivqu.com</span></a>)</span></td>
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
        var scoreElementSpan = subtextElementTd.firstElementChild.firstElementChild;
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