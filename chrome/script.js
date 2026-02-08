/*
sample HN item:

<tr class="athing" id="33054379">
    <td align="right" valign="top" class="title"><span class="rank">1.</span></td>
    <td valign="top" class="votelinks">
        <center>
            <a id="up_33054379" href="vote?id=33054379&amp;how=up&amp;goto=news">
                <div class="votearrow" title="upvote"></div>
            </a>
        </center>
    </td>
    <td class="title"><span class="titleline" style="font-size: 11px;"><a href="https://gist.github.com/susam/75c37fd0aff9c5e25112eac75b9ed055">From 7 Years of Apache HTTP Server Logs: 5528 Unique Recon and Attack Vectors</a><span class="sitebit comhead"> (<a href="from?site=gist.github.com"><span class="sitestr">gist.github.com</span></a>)</span></span></td>
</tr>
*/

const config = {
    minFont: 10, //in pixels
    maxFont: 30, //in pixels
    defaultFont: 13.33, //in pixels
    pointsWeight: 0.5, // 0-1, must complement commentsWeight
    commentsWeight: 0.5, // 0-1, must complement pointWeight
};

/*
the "newsItems" array is a global array containing news item objects in the format of:
{
    id: "12748863",
    upvote: 1412,
    size: 30
}
*/
const newsItems = [];

buildIdPointsCommentsMap();
calculatePriority("points", "pointsRank");
calculatePriority("comments", "commentsRank");
calculateFinalSize();
applyStyle();


function buildIdPointsCommentsMap() {
    const subtextElementsTd = document.getElementsByClassName("subtext");
    for (let subtextElementTd of subtextElementsTd) {
        const scoreElementSpan = subtextElementTd.firstElementChild?.firstElementChild;
        //sample match: <span class="score" id="score_12748863">1412 points</span>
        if (scoreElementSpan?.className !== "score") continue; //some newsItems cant be voted, exclude them

        //sample match: <a href="item?id=12748863">1069&nbsp;comments</a> or <a href="item?id=12748863">discuss</a>
        if (scoreElementSpan.innerText.includes("comments") || scoreElementSpan.innerText.includes("discuss")) continue; //some newsItems cant be discussed (?), exclude them

        const id = scoreElementSpan.id.replace("score_", "");
        const points = parseInt(scoreElementSpan.innerText); // no need to remove " points" as `parseInt` already handles that intelligently
        const comments = parseInt(subtextElementTd.lastElementChild.innerText); // no need to remove " comments" as `parseInt` already handles that intelligently

        newsItems.push({ id, points, comments, size: config.defaultFont });
    }
}

function calculatePriority(inputName, outputName) {
    let min = Number.MAX_VALUE;
    let max = 0;

    newsItems.forEach(item => {
        const val = item[inputName];
        if (val > max) max = val;
        if (val < min) min = val;
    });

    newsItems.forEach(item => {
        const val = item[inputName];
        const size = ((config.maxFont - config.minFont) * (val - min) / (max - min)) + config.minFont;
        item[outputName] = Math.round(size);
    });
}

function calculateFinalSize() {
    newsItems.forEach(item => { //TODO: too many loops over newsItems. Combine into calculate?
        item.size = (item.pointsRank * config.pointsWeight) + (item.commentsRank * config.commentsWeight);
    });
}

function applyStyle() {
    const selectors = newsItems.map(item => `[id="${item.id}"] .titleline`).join(",");
    const titleTdElements = document.querySelectorAll(selectors);

    for (let i = 0; i < titleTdElements.length; ++i) {
        const titleTdElement = titleTdElements.item(i);
        if (titleTdElement) titleTdElement.style.fontSize = newsItems[i].size + "px";
    }
}